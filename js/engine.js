// Core game engine — main loop, state machine, zone transitions
const Engine = (() => {

  // ── State machine ─────────────────────────────────────────────
  const STATE = {
    MAIN_MENU: 'main_menu',
    PLAYER_PICKER: 'player_picker',
    CHAR_CREATE: 'char_create',
    PLAYING: 'playing',
    DIALOGUE: 'dialogue',
    INVENTORY: 'inventory',
    TALENTS: 'talents',
    JOURNAL: 'journal',
    PAUSE: 'pause',
    MEMORY_PRISON: 'memory_prison',
    GAME_OVER: 'game_over',
    TRANSITION: 'transition',
    CRAFTING: 'crafting',
    SHOPPING: 'shopping',
    STATS: 'stats',
  };

  let state = STATE.MAIN_MENU;
  let canvas, ctx;
  let W, H;
  let tileSize;
  let camX = 0, camY = 0;
  let activeSlot = 0;
  let lastTime = 0;
  let _lastDt = 0;
  let transitionTimer = 0;
  let transitionTarget = null;
  let questCompletedMessage = '';
  let questMessageTimer = 0;
  let chestOpenedIds = new Set();
  let memoryPrisonCharacter = '';
  let memoryPrisonAttempt = 0;
  let _playtimeTicker = 0;
  let _pendingProfileName = null;

  // ── Tap-to-move ───────────────────────────────────────────────
  let tapTarget    = null;  // { tx, ty } — tile the player is walking toward
  let tapIndicator = null;  // { tx, ty, timer } — blink animation at tapped tile

  // ── Knowledge Trial state ─────────────────────────────────────
  let lastGameEvent = null;         // { type, timestamp, data }
  let knowledgeTrialCooldown = 0;   // seconds remaining before next trial allowed
  let knowledgeTrialPending = false; // confirmation prompt visible?
  let knowledgeTrialActive = false;  // true while in MEMORY_PRISON for a Knowledge Trial

  // ── Canvas init ───────────────────────────────────────────────
  function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    document.getElementById('loading').style.display = 'none';
    requestAnimationFrame(loop);
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    tileSize = Math.floor(Math.min(W, H) / 14);
    Input.layoutControls(W, H);
  }

  // ── Camera ────────────────────────────────────────────────────
  function updateCamera() {
    const px = Player.state.x * tileSize;
    const py = Player.state.y * tileSize;
    const targetX = px - W / 2 + tileSize / 2;
    const targetY = py - H / 2 + tileSize / 2;
    // Smooth follow
    camX += (targetX - camX) * 0.12;
    camY += (targetY - camY) * 0.12;
    // Clamp to zone
    if (World.current) {
      const maxX = World.current.width * tileSize - W;
      const maxY = World.current.height * tileSize - H;
      camX = Math.max(0, Math.min(maxX, camX));
      camY = Math.max(0, Math.min(maxY, camY));
    }
  }

  // ── Zone load ─────────────────────────────────────────────────
  function loadZone(zoneId, spawnTX, spawnTY) {
    const zone = World.loadZone(zoneId);
    if (!zone) return;
    const tx = spawnTX ?? zone.playerStart.tx;
    const ty = spawnTY ?? zone.playerStart.ty;
    Player.state.tx = tx; Player.state.ty = ty;
    Player.state.x = tx;  Player.state.y = ty;
    Player.state.toX = tx; Player.state.toY = ty;
    Player.state.fromX = tx; Player.state.fromY = ty;
    Player.state.moving = false;
    Player.state.flags['zone_' + zoneId] = true;
    Entities.spawnFromZone(zone);

    // Spy sabotage: if Rael not reported and entering junction_approach, add 2 extra walkers
    if (zoneId === 'junction_approach' && !Player.state.flags.spy_reported) {
      Entities.enemies.push(Entities.createEnemy('hollow_walker', 6, 10, [[6,10],[9,10]]));
      Entities.enemies.push(Entities.createEnemy('hollow_walker', 19, 14, [[19,14],[22,14]]));
    }

    Pets.onZoneEnter(zoneId);
    camX = tx * tileSize - W / 2;
    camY = ty * tileSize - H / 2;
    if (World.current) {
      const maxX = World.current.width * tileSize - W;
      const maxY = World.current.height * tileSize - H;
      camX = Math.max(0, Math.min(maxX, camX));
      camY = Math.max(0, Math.min(maxY, camY));
    }
  }

  // ── Zone transition ───────────────────────────────────────────
  function beginTransition(exit) {
    state = STATE.TRANSITION;
    transitionTimer = 0.5;
    transitionTarget = exit;
  }

  // ── Input handling per state ──────────────────────────────────
  function handleInput(dt) {
    const inp = Input.state;

    // ── MAIN MENU ─────────────────────────────────────────────
    if (state === STATE.MAIN_MENU) {
      const slots = Save.listSlots();
      const items = [
        ...slots.map((s, i) => ({ slot: i, ...s })),
        { action: 'stats' },
        { action: 'settings' },
      ];

      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const item = items[UI.mainMenuSel];
        if (!item) return;
        if (item.action === 'stats') {
          // Open stats screen — default to first known player
          const profiles = (typeof Analytics !== 'undefined') ? Analytics.getAllProfiles() : [];
          if (typeof UI.statsProfile !== 'undefined') {
            UI.statsProfile = profiles[0] || null;
            UI.statsScroll = 0;
            UI.statsTab = 'overview';
          }
          state = STATE.STATS;
          return;
        }
        if (item.profile || item.zone) { // load existing save
          const saveData = Save.load(item.slot);
          if (saveData) {
            activeSlot = item.slot;
            Player.loadFromSave(saveData);
            Quests.init(saveData.quests);
            Pets.init(saveData.pets || {});
            chestOpenedIds = new Set(saveData.flags.__openedChests || []);
            loadZone(saveData.zone, saveData.spawnPoint.tx, saveData.spawnPoint.ty);
            if (typeof Analytics !== 'undefined') Analytics.startSession(saveData.profile || 'Player');
            state = STATE.PLAYING;
          }
        } else {
          activeSlot = item.slot || 0;
          // Go to player picker first, then class select
          if (typeof UI.playerNameSel !== 'undefined') UI.playerNameSel = 0;
          state = STATE.PLAYER_PICKER;
        }
      }
      if (Input.consume('cancelPress')) { /* nothing on main menu */ }
      const total = items.length;
      if (Input.consume('up')) UI.mainMenuSel = (UI.mainMenuSel - 1 + total) % total;
      if (Input.consume('down')) UI.mainMenuSel = (UI.mainMenuSel + 1) % total;
      return;
    }

    // ── PLAYER PICKER ─────────────────────────────────────────
    if (state === STATE.PLAYER_PICKER) {
      const names = (typeof PLAYER_NAMES !== 'undefined') ? PLAYER_NAMES : ['Player 1'];
      const total = names.length;
      if (Input.consume('up')) {
        if (typeof UI.playerNameSel !== 'undefined') UI.playerNameSel = (UI.playerNameSel - 1 + total) % total;
      }
      if (Input.consume('down')) {
        if (typeof UI.playerNameSel !== 'undefined') UI.playerNameSel = (UI.playerNameSel + 1) % total;
      }
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const sel = (typeof UI.playerNameSel !== 'undefined') ? UI.playerNameSel : 0;
        _pendingProfileName = names[sel] || 'Player 1';
        state = STATE.CHAR_CREATE;
      }
      if (Input.consume('cancelPress')) state = STATE.MAIN_MENU;
      return;
    }

    // ── CHAR CREATE ───────────────────────────────────────────
    if (state === STATE.CHAR_CREATE) {
      if (Input.consume('up')) UI.charCreateClass = (UI.charCreateClass - 1 + UI.classOpts.length) % UI.classOpts.length;
      if (Input.consume('down')) UI.charCreateClass = (UI.charCreateClass + 1) % UI.classOpts.length;
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const classChoice = UI.classOpts[UI.charCreateClass];
        const profileName = _pendingProfileName || `Player ${activeSlot + 1}`;
        const saveData = Save.newGame(activeSlot, profileName, classChoice);
        Player.loadFromSave(saveData);
        Quests.init({});
        Pets.init({});
        loadZone('ashfen_ruins');
        if (typeof Analytics !== 'undefined') Analytics.startSession(profileName);
        _pendingProfileName = null;
        Story.startDialogue('story_ashfen_exit', () => { state = STATE.PLAYING; });
        state = STATE.DIALOGUE;
      }
      if (Input.consume('cancelPress')) state = STATE.PLAYER_PICKER;
      return;
    }

    // ── DIALOGUE ──────────────────────────────────────────────
    if (state === STATE.DIALOGUE) {
      const node = Story.getCurrentNode();
      if (!node) { state = STATE.PLAYING; return; }
      if (node.choices) {
        const nc = node.choices.length;
        if (Input.consume('up')) UI.dialogueChoice = (UI.dialogueChoice - 1 + nc) % nc;
        if (Input.consume('down')) UI.dialogueChoice = (UI.dialogueChoice + 1) % nc;
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          const advanced = Story.advance(UI.dialogueChoice);
          UI.dialogueChoice = 0;
          if (!advanced && !Story.isActive()) state = STATE.PLAYING;
        }
      } else {
        if (Input.consume('actionPress') || Input.consume('confirmPress') || Input.consume('attackPress')) {
          const advanced = Story.advance();
          if (!advanced && !Story.isActive()) state = STATE.PLAYING;
        }
      }
      return;
    }

    // ── PAUSE ─────────────────────────────────────────────────
    if (state === STATE.PAUSE) {
      const opts = ['Resume', 'Journal', 'Inventory', 'Talents', 'Save', 'Main Menu'];
      if (Input.consume('up')) UI.pauseSel = (UI.pauseSel - 1 + opts.length) % opts.length;
      if (Input.consume('down')) UI.pauseSel = (UI.pauseSel + 1) % opts.length;
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        switch (opts[UI.pauseSel]) {
          case 'Resume': state = STATE.PLAYING; break;
          case 'Journal': state = STATE.JOURNAL; break;
          case 'Inventory': state = STATE.INVENTORY; break;
          case 'Talents': state = STATE.TALENTS; break;
          case 'Save':
            doSave();
            UI.pauseSel = 0;
            state = STATE.PLAYING;
            break;
          case 'Main Menu': state = STATE.MAIN_MENU; break;
        }
      }
      if (Input.consume('cancelPress') || Input.consume('menuPress')) state = STATE.PLAYING;
      return;
    }

    // ── INVENTORY ─────────────────────────────────────────────
    if (state === STATE.INVENTORY) {
      const items = Player.state.inventory;
      if (Input.consume('up')) UI.invSel = Math.max(0, UI.invSel - 1);
      if (Input.consume('down')) UI.invSel = Math.min(items.length - 1, UI.invSel + 1);
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const slot = items[UI.invSel];
        if (slot) {
          const item = ITEMS[slot.id];
          if (item?.type === 'consumable') {
            const result = item.use(Player);
            if (result) Player.removeItem(slot.id, 1);
          } else if (item?.type === 'weapon' || item?.type === 'armor' || item?.type === 'accessory') {
            const subSlot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory';
            Player.state.equipped[subSlot] = slot.id;
          }
        }
      }
      if (Input.consume('cancelPress')) state = STATE.PAUSE;
      return;
    }

    // ── TALENTS ───────────────────────────────────────────────
    if (state === STATE.TALENTS) {
      const trees = Player.TALENT_TREES;
      const keys = Object.keys(trees);
      const tree = trees[UI.talentTab];
      const allNodes = tree ? tree.tiers.flat() : [];

      if (Input.consume('left')) {
        const idx = keys.indexOf(UI.talentTab);
        UI.talentTab = keys[(idx - 1 + keys.length) % keys.length];
        UI.talentSel = 0;
      }
      if (Input.consume('right')) {
        const idx = keys.indexOf(UI.talentTab);
        UI.talentTab = keys[(idx + 1) % keys.length];
        UI.talentSel = 0;
      }
      if (Input.consume('up')) UI.talentSel = Math.max(0, UI.talentSel - 1);
      if (Input.consume('down')) UI.talentSel = Math.min(allNodes.length - 1, UI.talentSel + 1);
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const talent = allNodes[UI.talentSel];
        if (talent) Player.spendTalentPoint(talent.id);
      }
      if (Input.consume('cancelPress')) state = STATE.PAUSE;
      return;
    }

    // ── JOURNAL ───────────────────────────────────────────────
    if (state === STATE.JOURNAL) {
      const entries = Quests.getJournalEntries();
      if (Input.consume('up')) UI.journalSel = Math.max(0, UI.journalSel - 1);
      if (Input.consume('down')) UI.journalSel = Math.min(entries.length - 1, UI.journalSel + 1);
      if (Input.consume('cancelPress') || Input.consume('actionPress')) state = STATE.PAUSE;
      return;
    }

    // ── MEMORY PRISON ─────────────────────────────────────────
    if (state === STATE.MEMORY_PRISON) {
      const qs = UI.quizState;
      if (!qs) { state = STATE.PLAYING; return; }
      if (qs.done) {
        if (Input.consume('actionPress') || Input.consume('confirmPress') || Input.consume('attackPress')) {
          if (knowledgeTrialActive) {
            // Knowledge Trial result
            knowledgeTrialActive = false;
            knowledgeTrialCooldown = 90;
            lastGameEvent = null;
            Player.state.flags.knowledge_trial_pet = null;
            if (qs.passed) {
              // Undo the death — revive with 1 HP and return to playing
              Player.heal(1);
              state = STATE.PLAYING;
            } else {
              // Trial failed — return to main menu
              state = STATE.MAIN_MENU;
            }
          } else {
            // Normal Memory Prison
            if (qs.passed) {
              Player.state.flags['mem_prison_' + memoryPrisonCharacter] = true;
            } else {
              memoryPrisonAttempt++;
            }
            state = STATE.PLAYING;
          }
        }
        return;
      }
      if (Input.consume('up')) {
        const nc = qs.quiz.questions[qs.currentQ]?.choices.length || 4;
        UI.quizState.selected = (qs.selected - 1 + nc) % nc;
      }
      if (Input.consume('down')) {
        const nc = qs.quiz.questions[qs.currentQ]?.choices.length || 4;
        UI.quizState.selected = (qs.selected + 1) % nc;
      }
      // Number keys / tap for choice
      for (let i = 1; i <= 4; i++) {
        // handled via touch on the answer areas
      }
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        UI.confirmMemoryAnswer();
      }
      return;
    }

    // ── GAME OVER ─────────────────────────────────────────────
    if (state === STATE.GAME_OVER) {
      if (knowledgeTrialPending) {
        // Confirmation prompt is showing — A=begin trial, B=accept fate
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          // Start the Knowledge Trial quiz
          knowledgeTrialPending = false;
          const quiz = (typeof Curriculum !== 'undefined')
            ? Curriculum.getKnowledgeTrialQuiz()
            : null;
          if (quiz && UI.startKnowledgeTrial(quiz)) {
            knowledgeTrialActive = true;
            state = STATE.MEMORY_PRISON;
          } else {
            state = STATE.MAIN_MENU;
          }
        } else if (Input.consume('cancelPress')) {
          // Accept fate — go straight to menu
          knowledgeTrialPending = false;
          state = STATE.MAIN_MENU;
        }
      } else {
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          state = STATE.MAIN_MENU;
        }
      }
      return;
    }

    // ── CRAFTING ─────────────────────────────────────────────
    if (state === STATE.CRAFTING) {
      const cs = Crafting.craftState;
      if (!cs) { state = STATE.PLAYING; return; }

      if (cs.phase === 'select') {
        if (Input.consume('up')) Crafting.selectRecipe(-1);
        if (Input.consume('down')) Crafting.selectRecipe(1);
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          Crafting.beginTiming();
        }
        if (Input.consume('cancelPress')) {
          Crafting.closeCraft();
          state = STATE.PLAYING;
        }
      } else if (cs.phase === 'timing') {
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          Crafting.strike();
        }
        if (Input.consume('cancelPress')) {
          // Cancel mid-timing — counts as miss
          Crafting.closeCraft();
          state = STATE.PLAYING;
        }
      } else if (cs.phase === 'done') {
        // Wait for result timer to finish (handled in Crafting.update)
        if (Input.consume('actionPress') || Input.consume('confirmPress')) {
          // Return to select
          if (cs.resultTimer > 0) {
            // Skip result, back to select
            cs.phase = 'select';
            cs.result = null;
            cs.particleBurst = [];
          }
        }
        if (Input.consume('cancelPress') && cs.result) {
          Crafting.closeCraft();
          state = STATE.PLAYING;
        }
      }
      return;
    }

    // ── SHOPPING ─────────────────────────────────────────────
    if (state === STATE.SHOPPING) {
      if (!Merchant.shopState) { state = STATE.PLAYING; return; }
      const inp2 = Input.state;

      if (Input.consume('up')) {
        Merchant.handleInput('up');
      } else if (Input.consume('down')) {
        Merchant.handleInput('down');
      } else if (Input.consume('left') || Input.consume('right')) {
        Merchant.handleInput('tab');
      } else if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const result = Merchant.handleInput('confirm');
        if (result?.closed) { state = STATE.PLAYING; return; }
        if (result?.isDiscountPurchase) {
          const d = [{ speaker: 'quill', text: 'Ha! See, I told you I liked you. Twenty percent off. Consider it a relationship tax.' }];
          Story.DIALOGUES.__quill_discount = d;
          // Don't interrupt flow — just show as floating text
          Entities.spawnFloatingText(Player.state.x + 0.5, Player.state.y - 1, 'DISCOUNT!', PAL.xpFill);
        }
        if (result?.error) {
          Entities.spawnFloatingText(Player.state.x + 0.5, Player.state.y - 1, result.error, PAL.textRed);
        }
      } else if (Input.consume('cancelPress')) {
        Merchant.handleInput('cancel');
        state = STATE.PLAYING;
        return;
      } else if (Input.consume('menuPress')) {
        Merchant.handleInput('tab');
      }
      return;
    }

    // ── STATS ────────────────────────────────────────────────
    if (state === STATE.STATS) {
      const profiles = (typeof Analytics !== 'undefined') ? Analytics.getAllProfiles() : [];
      // Left/right to cycle through profiles
      if (Input.consume('left')) {
        const cur = profiles.indexOf(UI.statsProfile);
        if (profiles.length > 0) UI.statsProfile = profiles[(cur - 1 + profiles.length) % profiles.length];
      }
      if (Input.consume('right')) {
        const cur = profiles.indexOf(UI.statsProfile);
        if (profiles.length > 0) UI.statsProfile = profiles[(cur + 1) % profiles.length];
      }
      // Up/down to scroll or switch tab
      if (Input.consume('up')) {
        if (typeof UI.statsScroll !== 'undefined') UI.statsScroll = Math.max(0, UI.statsScroll - 1);
      }
      if (Input.consume('down')) {
        if (typeof UI.statsScroll !== 'undefined') UI.statsScroll = UI.statsScroll + 1;
      }
      // Action = cycle tabs
      if (Input.consume('actionPress') || Input.consume('confirmPress')) {
        const tabs = ['overview', 'topics', 'wrong'];
        const cur = tabs.indexOf(UI.statsTab || 'overview');
        UI.statsTab = tabs[(cur + 1) % tabs.length];
        UI.statsScroll = 0;
      }
      // Attack = export report to clipboard
      if (Input.consume('attackPress')) {
        if (typeof Analytics !== 'undefined' && UI.statsProfile) {
          Analytics.copyReportToClipboard(UI.statsProfile);
          Entities.spawnFloatingText && Entities.spawnFloatingText(0, 0, 'Report copied!', PAL.xpFill);
        }
      }
      // Cancel = back to main menu
      if (Input.consume('cancelPress') || Input.consume('menuPress')) {
        state = STATE.MAIN_MENU;
      }
      return;
    }

    // ── PLAYING ───────────────────────────────────────────────
    if (state === STATE.PLAYING) {
      // Menu
      if (Input.consume('menuPress')) {
        state = STATE.PAUSE;
        UI.pauseSel = 0;
        return;
      }

      // Attack
      if (Input.consume('attackPress')) Combat.basicAttack();

      // Dodge
      if (Input.consume('dodgePress')) Combat.dodge();

      // Interact / action
      if (Input.consume('actionPress')) {
        // Check facing tile for campfire
        const facingTile = Player.getFacingTile();
        const ft = World.getTile(facingTile.tx, facingTile.ty);
        if (ft === TILE.EMBER) {
          // Open crafting
          Crafting.startCraft();
          state = STATE.CRAFTING;
          return;
        }

        // Check if facing Quill NPC directly (shop override)
        const facingNPC = Entities.getNPCAt(facingTile.tx, facingTile.ty);
        if (facingNPC?.isShopkeeper) {
          // First time: show dialogue. Subsequent: open shop
          if (!Player.state.flags['quill_first_met']) {
            Player.state.flags['quill_first_met'] = true;
            Story.startDialogue('quill_first_meet', () => {
              Merchant.openShop();
              state = STATE.SHOPPING;
            });
            state = STATE.DIALOGUE;
          } else {
            // Ambient line then shop
            const ambientId = Merchant.getNextAmbientId();
            if (ambientId && Story.DIALOGUES[ambientId] && Math.random() < 0.4) {
              Story.startDialogue(ambientId, () => {
                Merchant.openShop();
                state = STATE.SHOPPING;
              });
              state = STATE.DIALOGUE;
            } else {
              Merchant.openShop();
              state = STATE.SHOPPING;
            }
          }
          return;
        }

        handleInteraction();
        return;
      }

      // ── Movement — keyboard OR tap-to-move ───────────────────
      // Keyboard takes priority; cancels tap target
      const kbDx = inp.left ? -1 : inp.right ? 1 : 0;
      const kbDy = !kbDx && inp.up ? -1 : !kbDx && inp.down ? 1 : 0;
      if (kbDx !== 0 || kbDy !== 0) {
        tapTarget = null; // keyboard cancels tap navigation
      }

      if (!Player.state.moving) {
        let dx = kbDx, dy = kbDy;

        if (dx === 0 && dy === 0 && tapTarget) {
          // Auto-walk one step toward tap target
          const dtx = tapTarget.tx - Player.state.tx;
          const dty = tapTarget.ty - Player.state.ty;
          if (dtx === 0 && dty === 0) {
            tapTarget = null; // arrived
          } else {
            // Move along whichever axis is larger (reduces diagonal stutter)
            if (Math.abs(dtx) >= Math.abs(dty)) {
              dx = Math.sign(dtx);
            } else {
              dy = Math.sign(dty);
            }
          }
        }

        if (dx !== 0 || dy !== 0) {
          if (dx > 0) Player.state.facing = 'right';
          else if (dx < 0) Player.state.facing = 'left';
          else if (dy > 0) Player.state.facing = 'down';
          else if (dy < 0) Player.state.facing = 'up';

          const moved = Player.tryMove(dx, dy);
          // If tap-navigating and blocked, try the other axis once
          if (!moved && tapTarget) {
            const dtx = tapTarget.tx - Player.state.tx;
            const dty = tapTarget.ty - Player.state.ty;
            const alt = dx !== 0
              ? Player.tryMove(0, Math.sign(dty) || 0)
              : Player.tryMove(Math.sign(dtx) || 0, 0);
            if (!alt) tapTarget = null; // truly stuck — give up
          }
        }
      }

      // Track pet_hurt for Knowledge Trial
      const ktPet = Player.state.flags.knowledge_trial_pet;
      if (ktPet && (!lastGameEvent || lastGameEvent.type !== 'pet_hurt' || lastGameEvent.data.petId !== ktPet)) {
        lastGameEvent = { type: 'pet_hurt', timestamp: Date.now(), data: { petId: ktPet } };
      }

      // Check player death
      if (Player.state.hp <= 0) {
        // Check for Echo Ember
        const ember = Player.state.inventory.find(s => s.id === 'revive_token' && s.qty > 0);
        if (ember) {
          Player.removeItem('revive_token');
          Player.heal(1);
          UI.flashScreen(255, 100, 0, 0.8);
        } else {
          lastGameEvent = { type: 'death', timestamp: Date.now(), data: {} };
          knowledgeTrialPending = (knowledgeTrialCooldown <= 0);
          state = STATE.GAME_OVER;
        }
        return;
      }

      // Check zone exit
      if (!Player.state.moving) {
        const exit = World.getExit(Player.state.tx, Player.state.ty);
        if (exit) {
          // Check for locked exits
          if (exit.requireFlag && !Player.state.flags[exit.requireFlag]) {
            Story.DIALOGUES.__locked_exit = [{
              speaker: 'narrator',
              text: 'The way is blocked. Something needs to be dealt with first.',
            }];
            Story.startDialogue('__locked_exit', () => { state = STATE.PLAYING; });
            state = STATE.DIALOGUE;
            return;
          }
          doSave();
          beginTransition(exit);
          return;
        }

        // Story triggers
        const trigger = World.getStoryTrigger(Player.state.tx, Player.state.ty, Player.state.flags);
        if (trigger) {
          Player.state.flags[trigger.flag] = true;
          if (trigger.dialogue) {
            Story.startDialogue(trigger.dialogue, () => { state = STATE.PLAYING; });
            state = STATE.DIALOGUE;
            return;
          }
        }

        // Rael proximity check (Cole's tent is approx tx 8-12, ty 3-9 in camp)
        if (World.current?.id === 'thornkin_camp') {
          const px = Player.state.tx, py = Player.state.ty;
          const raelNPC = Entities.npcs.find(n => n.id === 'npc_rael');
          if (raelNPC) {
            const raelNearTent = raelNPC.tx >= 8 && raelNPC.tx <= 12 && raelNPC.ty >= 3 && raelNPC.ty <= 9;
            const playerNearRael = Math.abs(px - raelNPC.tx) <= 3 && Math.abs(py - raelNPC.ty) <= 3;
            if (raelNearTent && playerNearRael && !Player.state.flags['rael_sighting_' + Math.floor(Date.now() / 30000)]) {
              Player.state.flags['rael_sighting_' + Math.floor(Date.now() / 30000)] = true;
              const sightings = (Player.state.flags.rael_total_sightings || 0) + 1;
              Player.state.flags.rael_total_sightings = sightings;
              // Update quest var
              if (typeof Quests !== 'undefined') {
                Quests.setVar('find_the_spy', 'rael_sightings', sightings);
              }
              if (sightings < 3) {
                Entities.spawnFloatingText(px + 0.5, py - 0.8, `Rael... (${sightings}/3)`, PAL.textDim);
              }
              if (sightings >= 3 && !Player.state.flags['find_spy_quest_started'] && typeof Quests !== 'undefined') {
                Player.state.flags.find_spy_quest_started = true;
                Quests.startQuest('find_the_spy');
              }
            }
          }
        }

        // Boss death dialogue pending
        if (Player.state.flags.boss_defeated_dialogue_pending) {
          Player.state.flags.boss_defeated_dialogue_pending = false;
          Story.startDialogue('story_boss_defeated', () => { state = STATE.PLAYING; });
          state = STATE.DIALOGUE;
          return;
        }
      }

      // Campfire proximity prompt (show [A: Craft] when adjacent)
      _campfireAdjacent = false;
      const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
      for (const [ddx, ddy] of dirs2) {
        const ntx = Player.state.tx + ddx, nty = Player.state.ty + ddy;
        if (World.getTile(ntx, nty) === TILE.EMBER) {
          _campfireAdjacent = true;
          break;
        }
      }
    }
  }

  // Track campfire adjacency for HUD prompt
  let _campfireAdjacent = false;

  function handleInteraction() {
    const facing = Player.getFacingTile();
    const tx = facing.tx, ty = facing.ty;

    // Chest
    const chest = World.getChest(tx, ty);
    if (chest && !chestOpenedIds.has(chest.id)) {
      if (!chest.requireFlag || Player.state.flags[chest.requireFlag]) {
        chestOpenedIds.add(chest.id);
        chest.items.forEach(i => Player.addItem(i.id, i.qty));
        const names = chest.items.map(i => ITEMS[i.id]?.name || i.id).join(', ');
        Story.DIALOGUES.__chest_temp = [{ speaker: 'narrator', text: `Chest opened. Found: ${names}.` }];
        Story.startDialogue('__chest_temp', () => { state = STATE.PLAYING; });
        state = STATE.DIALOGUE;
        return;
      }
    }

    // NPC (check facing tile AND same tile)
    const npc = Entities.getNPCAt(tx, ty) || Entities.getNPCAt(Player.state.tx, Player.state.ty);
    if (npc) {
      // Set flags for quest tracking
      Player.state.flags['talked_' + npc.id.replace('npc_', '')] = true;
      const dlgId = npc.dialogue;
      if (dlgId && Story.DIALOGUES[dlgId]) {
        Story.startDialogue(dlgId, () => { state = STATE.PLAYING; });
        state = STATE.DIALOGUE;
      }
      return;
    }

    // Pet discovery (check facing tile AND adjacent)
    const petSpawn = World.getPetSpawn(tx, ty) || World.getPetSpawn(Player.state.tx, Player.state.ty);
    if (petSpawn) {
      const petDef = Pets.getPetAtTile(petSpawn.tx, petSpawn.ty);
      if (petDef) {
        Pets.startAdoptDialogue(petDef, () => { state = STATE.PLAYING; });
        state = STATE.DIALOGUE;
        return;
      }
    }

    // Shrine (save + fast travel)
    const tileType = World.getTile(tx, ty);
    if (tileType === TILE.SHRINE) {
      doSave();
      Pets.onShrineRest();
      Player.heal(Player.computeStats(Player.state).maxHP);
      Player.restoreMP(Player.computeStats(Player.state).maxMP);
      const d = [{ speaker: 'narrator', text: 'You rest at the shrine. HP and MP restored. Progress saved.' }];
      Story.DIALOGUES.__shrine_temp = d;
      Story.startDialogue('__shrine_temp', () => { state = STATE.PLAYING; });
      state = STATE.DIALOGUE;
    }
  }

  // ── Save helper ───────────────────────────────────────────────
  function doSave() {
    if (typeof Analytics !== 'undefined' && Player.state.profile) {
      Analytics.endSession(Player.state.profile);
      Analytics.startSession(Player.state.profile);  // restart session after save
    }
    const flags = { ...Player.state.flags, __openedChests: [...chestOpenedIds] };
    Save.save(activeSlot, {
      version: 1,
      profile: Player.state.profile,
      classChoice: Player.state.classChoice,
      playtime: 0,
      zone: World.current?.id || 'ashfen_ruins',
      spawnPoint: { tx: Player.state.tx, ty: Player.state.ty },
      player: Player.toSaveData(),
      flags,
      quests: Quests.toSaveData(),
      pets: Pets.toSaveData(),
      fastTravel: [],
      discovered: [],
      memoryPrisonAttempts: {},
      killedInAction: [],
      timestamp: Date.now(),
    });
  }

  // ── Main update ───────────────────────────────────────────────
  function update(dt) {
    handleInput(dt);

    if (state === STATE.PLAYING || state === STATE.CRAFTING || state === STATE.SHOPPING) {
      Player.update(dt);
      Entities.update(dt);
      Combat.update(dt);
      Pets.update(dt);
      updateCamera();

      // Tick active buffs
      if (typeof Crafting !== 'undefined') Crafting.update(dt);

      // Analytics playtime tick (every 60s)
      if (typeof Analytics !== 'undefined' && Player.state.profile) {
        _playtimeTicker += dt;
        if (_playtimeTicker >= 60) {
          Analytics.tickPlaytime(Player.state.profile, 60);
          _playtimeTicker -= 60;
        }
      }

      // Quest checks
      const completed = Quests.checkAll(Player.state.flags);
      if (completed.length > 0) {
        questCompletedMessage = `Quest complete: ${completed[0].name}`;
        questMessageTimer = 3;
        UI.flashScreen(100, 200, 100, 0.3);
      }
      if (questMessageTimer > 0) questMessageTimer -= dt;
    }

    if (state === STATE.MEMORY_PRISON) {
      UI.tickMemoryPrison(dt);
    }

    // Tick Knowledge Trial cooldown
    if (knowledgeTrialCooldown > 0) {
      knowledgeTrialCooldown = Math.max(0, knowledgeTrialCooldown - dt);
    }

    if (state === STATE.TRANSITION) {
      transitionTimer -= dt;
      if (transitionTimer <= 0 && transitionTarget) {
        loadZone(transitionTarget.toZone, transitionTarget.toTx, transitionTarget.toTy);
        // Reset Merchant stock on zone entry
        if (typeof Merchant !== 'undefined') Merchant.init();
        state = STATE.PLAYING;
        transitionTarget = null;
      }
    }
  }

  // ── Render ────────────────────────────────────────────────────
  function render() {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    if (state === STATE.MAIN_MENU) {
      const slots = Save.listSlots();
      UI.drawMainMenu(ctx, W, H, slots, true /* showStats */);
      return;
    }

    if (state === STATE.PLAYER_PICKER) {
      if (typeof UI.drawPlayerPicker === 'function') UI.drawPlayerPicker(ctx, W, H);
      return;
    }

    if (state === STATE.CHAR_CREATE) {
      UI.drawCharCreate(ctx, W, H);
      return;
    }

    if (state === STATE.STATS) {
      if (typeof UI.drawStatsScreen === 'function') UI.drawStatsScreen(ctx, W, H);
      return;
    }

    if (state === STATE.GAME_OVER) {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(180,0,0,0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.fillStyle = PAL.textRed;
      ctx.font = 'bold 28px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOU FELL', W / 2, H * 0.35);
      ctx.fillStyle = PAL.textDim;
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText('The memory of you lingers.', W / 2, H * 0.35 + 40);
      ctx.restore();

      if (knowledgeTrialPending) {
        // Draw the Knowledge Trial confirmation prompt
        const evt = lastGameEvent || { type: 'death', data: {} };
        const petFlag = Player.state?.flags?.knowledge_trial_pet;
        const petName = petFlag && typeof Pets !== 'undefined'
          ? (Pets.petStates?.[petFlag]?.name || null)
          : null;
        UI.drawKnowledgeTrialPrompt(ctx, W, H, evt.type, petName);
      } else {
        ctx.save();
        ctx.fillStyle = PAL.textDim;
        ctx.font = '13px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('[Tap to return to menu]', W / 2, H * 0.6);
        if (knowledgeTrialCooldown > 0) {
          ctx.font = '11px "Courier New", monospace';
          ctx.fillStyle = '#555';
          ctx.fillText(
            `Knowledge Trial on cooldown (${Math.ceil(knowledgeTrialCooldown)}s)`,
            W / 2, H * 0.6 + 24
          );
        }
        ctx.restore();
      }
      return;
    }

    if (state === STATE.MEMORY_PRISON) {
      UI.drawMemoryPrison(ctx, W, H);
      return;
    }

    // World render (playing, dialogue, pause, etc.)
    if (state !== STATE.MAIN_MENU && state !== STATE.CHAR_CREATE) {
      World.renderZone(ctx, camX, camY, tileSize, W, H);

      // Draw animated campfires over EMBER tiles
      if (typeof Crafting !== 'undefined' && World.current) {
        const zone = World.current;
        const startTX = Math.max(0, Math.floor(camX / tileSize));
        const startTY = Math.max(0, Math.floor(camY / tileSize));
        const endTX = Math.min(zone.width, startTX + Math.ceil(W / tileSize) + 2);
        const endTY = Math.min(zone.height, startTY + Math.ceil(H / tileSize) + 2);
        for (let ty = startTY; ty < endTY; ty++) {
          for (let tx = startTX; tx < endTX; tx++) {
            if (zone.map[ty][tx] === TILE.EMBER) {
              const px = tx * tileSize - camX;
              const py = ty * tileSize - camY;
              Crafting.drawCampfire(ctx, px, py, tileSize);
            }
          }
        }
      }

      Entities.draw(ctx, camX, camY, tileSize);
      Pets.draw(ctx, camX, camY, tileSize);
      Player.draw(ctx, camX, camY, tileSize);

      // Tap-to-move blink indicator
      if (tapIndicator) {
        const icx = tapIndicator.tx * tileSize - camX + tileSize * 0.5;
        const icy = tapIndicator.ty * tileSize - camY + tileSize * 0.5;
        const progress = 1 - tapIndicator.timer; // 0=just tapped, 1=gone
        const r1 = tileSize * (0.15 + 0.25 * progress);
        const r2 = tileSize * (0.05 + 0.12 * progress);
        ctx.save();
        ctx.globalAlpha = tapIndicator.timer * 0.75;
        ctx.strokeStyle = '#d4c040';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(icx, icy, r1, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = tapIndicator.timer * 0.55;
        ctx.beginPath(); ctx.arc(icx, icy, r2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        tapIndicator.timer -= _lastDt * 2.2; // fades in ~0.45s
        if (tapIndicator.timer <= 0) tapIndicator = null;
      }

      const p = Player.state;
      const cs = Player.computeStats(p);
      UI.drawHUD(ctx, W, H, p, cs);

      // Knowledge Trial button (top-right "?" — shows when a recent event is available)
      if (lastGameEvent !== null && knowledgeTrialCooldown <= 0) {
        UI.drawKnowledgeTrialButton(ctx, W, H, true);
      }

      // Quest complete message
      if (questMessageTimer > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, questMessageTimer);
        ctx.fillStyle = PAL.textGreen;
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(questCompletedMessage, W / 2, H * 0.15);
        ctx.restore();
      }

      UI.drawScreenFlash(ctx, W, H);
      UI.drawLevelUp(ctx, W, H);
    }

    if (state === STATE.DIALOGUE) {
      UI.drawDialogue(ctx, W, H);
    }

    if (state === STATE.PAUSE) {
      UI.drawPauseMenu(ctx, W, H);
    }

    if (state === STATE.INVENTORY) {
      UI.drawInventory(ctx, W, H, Player.state);
    }

    if (state === STATE.TALENTS) {
      UI.drawTalentTree(ctx, W, H, Player.state);
    }

    if (state === STATE.JOURNAL) {
      UI.drawJournal(ctx, W, H);
    }

    if (state === STATE.CRAFTING) {
      // Dim background slightly
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      Crafting.draw(ctx, W, H);
    }

    if (state === STATE.SHOPPING) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      Merchant.draw(ctx, W, H);
    }

    // Campfire prompt
    if (state === STATE.PLAYING && _campfireAdjacent) {
      ctx.save();
      ctx.fillStyle = 'rgba(180,130,20,0.9)';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[A] Craft', W / 2, H - 50);
      ctx.restore();
    }

    // Buff bar (draw on HUD in playing states)
    if ([STATE.PLAYING, STATE.CRAFTING, STATE.SHOPPING].includes(state)) {
      const buffs = typeof Crafting !== 'undefined' ? Crafting.getActiveBuffs() : [];
      if (buffs.length > 0) Crafting.drawBuffBar(ctx, W, H, buffs);
    }

    if (state === STATE.TRANSITION) {
      const progress = 1 - transitionTimer / 0.5;
      ctx.fillStyle = `rgba(0,0,0,${progress})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Touch controls (always visible during gameplay states)
    if ([STATE.PLAYING, STATE.DIALOGUE, STATE.CRAFTING, STATE.SHOPPING].includes(state)) {
      Input.drawControls(ctx);
    }
  }

  // ── Game loop ─────────────────────────────────────────────────
  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    _lastDt = dt;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // Start
  window.addEventListener('DOMContentLoaded', init);

  // ── Tap-to-move / tap-to-interact ────────────────────────────
  function handleWorldTap(screenX, screenY) {
    const wtx = Math.floor((screenX + camX) / tileSize);
    const wty = Math.floor((screenY + camY) / tileSize);
    const px  = Player.state.tx;
    const py  = Player.state.ty;

    // Check if the tapped tile contains an interactable
    const isAdjacent = Math.abs(wtx - px) <= 1 && Math.abs(wty - py) <= 1;

    // NPC
    const npc = Entities.getNPCAt(wtx, wty);
    if (npc) {
      if (isAdjacent) {
        Input.state.actionPress = true;
      } else {
        tapTarget    = { tx: wtx, ty: wty };
        tapIndicator = { tx: wtx, ty: wty, timer: 1.0 };
      }
      return;
    }

    // Chest
    const chest = World.getChest(wtx, wty);
    if (chest && !chestOpenedIds.has(chest.id)) {
      if (isAdjacent) {
        Input.state.actionPress = true;
      } else {
        tapTarget    = { tx: wtx, ty: wty };
        tapIndicator = { tx: wtx, ty: wty, timer: 1.0 };
      }
      return;
    }

    // Shrine or campfire tile
    const tileType = World.getTile(wtx, wty);
    if (tileType === TILE.SHRINE || tileType === TILE.EMBER) {
      if (isAdjacent) {
        Input.state.actionPress = true;
      } else {
        tapTarget    = { tx: wtx, ty: wty };
        tapIndicator = { tx: wtx, ty: wty, timer: 1.0 };
      }
      return;
    }

    // Pet spawn
    const petSpawn = World.getPetSpawn(wtx, wty);
    if (petSpawn) {
      if (isAdjacent) {
        Input.state.actionPress = true;
      } else {
        tapTarget    = { tx: wtx, ty: wty };
        tapIndicator = { tx: wtx, ty: wty, timer: 1.0 };
      }
      return;
    }

    // Plain walkable tile — just walk there
    tapTarget    = { tx: wtx, ty: wty };
    tapIndicator = { tx: wtx, ty: wty, timer: 1.0 };
  }

  return { STATE, get currentState() { return state; }, handleWorldTap };
})();

// ── Touch dispatch — UI screens and world taps ────────────────
// Input.js handles button taps (Attack/Dodge/Menu) and exposes
// consumeWorldTap() for engine to read. This handler deals with
// every UI overlay state and converts world taps to game actions.
document.addEventListener('touchstart', e => {
  // Input.js already ran its touchstart (called first via addEventListener order).
  // Consume the world tap if the engine state needs it.
  const rawTap = Input.consumeWorldTap();
  const H = window.innerHeight, W = window.innerWidth;
  const eState = Engine.currentState;

  // ── Main menu ──────────────────────────────────────────────
  if (eState === 'main_menu') {
    if (!rawTap) return;
    const { x: sx, y: sy } = rawTap;
    const slots = Save.listSlots();
    const itemCount = slots.length + 2; // slots + Stats + Settings
    const bH = 54, gap = 8, startY = H * 0.5;
    for (let i = 0; i < itemCount; i++) {
      const iy = startY + i * (bH + gap);
      if (sy >= iy && sy <= iy + bH) {
        UI.mainMenuSel = i;
        Input.state.confirmPress = true;
        break;
      }
    }
    return;
  }

  // ── Player picker ──────────────────────────────────────────
  if (eState === 'player_picker') {
    if (!rawTap) return;
    const { x: sx, y: sy } = rawTap;
    const names = typeof PLAYER_NAMES !== 'undefined' ? PLAYER_NAMES : [];
    const bH = 56, gap = 10, startY = H * 0.35;
    for (let i = 0; i < names.length; i++) {
      const iy = startY + i * (bH + gap);
      if (sy >= iy && sy <= iy + bH) {
        if (typeof UI.playerNameSel !== 'undefined') UI.playerNameSel = i;
        Input.state.confirmPress = true;
        break;
      }
    }
    return;
  }

  // ── Character creation ─────────────────────────────────────
  if (eState === 'char_create') {
    if (!rawTap) return;
    const { x: sx, y: sy } = rawTap;
    const classOpts = UI.classOpts || ['ironclad', 'ashwalker', 'veilcaster'];
    const bH = 80, gap = 12, startY = H * 0.22;
    for (let i = 0; i < classOpts.length; i++) {
      const iy = startY + i * (bH + gap);
      if (sy >= iy && sy <= iy + bH) {
        UI.charCreateClass = i;
        break;
      }
    }
    const beginY = startY + classOpts.length * (bH + gap) + 16;
    if (sy >= beginY && sy <= beginY + 40) Input.state.confirmPress = true;
    return;
  }

  // ── Pause menu ─────────────────────────────────────────────
  if (eState === 'pause') {
    if (!rawTap) return;
    const { x: sx, y: sy } = rawTap;
    const opts = ['Resume', 'Journal', 'Inventory', 'Talents', 'Save', 'Main Menu'];
    const bH = 40, gap = 6, startY = H * 0.3;
    for (let i = 0; i < opts.length; i++) {
      const iy = startY + i * (bH + gap);
      if (sy >= iy && sy <= iy + bH) {
        UI.pauseSel = i;
        Input.state.confirmPress = true;
        break;
      }
    }
    return;
  }

  // ── Dialogue ───────────────────────────────────────────────
  if (eState === 'dialogue') {
    const sy = rawTap ? rawTap.y : e.changedTouches[0].clientY;
    const boxH = H * 0.3;
    const boxY = H - boxH - 10;
    const node = Story.getCurrentNode();
    if (node?.choices) {
      const nc = node.choices.length;
      const choiceY = boxY + boxH - (nc * 26) - 8;
      for (let i = 0; i < nc; i++) {
        const cy = choiceY + i * 26;
        if (sy >= cy - 4 && sy <= cy + 22) {
          UI.dialogueChoice = i;
          Input.state.confirmPress = true;
          break;
        }
      }
    } else {
      if (sy > boxY) Input.state.confirmPress = true;
    }
    return;
  }

  // ── Memory prison / Knowledge trial quiz ──────────────────
  if (eState === 'memory_prison') {
    const sy = rawTap ? rawTap.y : e.changedTouches[0].clientY;
    const qs = UI.quizState;
    if (qs && !qs.done && qs.quiz.questions[qs.currentQ]) {
      const cq = qs.quiz.questions[qs.currentQ];
      for (let i = 0; i < cq.choices.length; i++) {
        const cy = 164 + i * 50;
        if (sy >= cy && sy <= cy + 42) {
          qs.selected = i;
          Input.state.confirmPress = true;
          break;
        }
      }
    }
    if (qs?.done) Input.state.confirmPress = true;
    return;
  }

  // ── Game over ──────────────────────────────────────────────
  if (eState === 'game_over') {
    Input.state.confirmPress = true;
    return;
  }

  // ── PLAYING — tap-to-move / tap-to-interact ────────────────
  if (eState === 'playing' && rawTap) {
    // Convert screen coordinates → world tile
    // camX/camY and tileSize are inside engine scope; expose via a helper
    Engine.handleWorldTap(rawTap.x, rawTap.y);
  }
}, { passive: true });
