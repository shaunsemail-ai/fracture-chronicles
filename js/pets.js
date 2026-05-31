// Pet system — companions that follow, help, and cannot permanently die
// Up to 50 collectible pets; up to 3 active at once following the player.
const Pets = (() => {

  // ── Pet definitions ───────────────────────────────────────────
  // drawType: which draw function to use (allows visual reuse across similar species)
  const PET_DEFS = {
    // ── Original four ──────────────────────────────────────────
    puppy: {
      id: 'puppy', species: 'Dog', drawType: 'puppy',
      foundZone: 'ashfen_ruins', foundTX: 9, foundTY: 20,
      defaultNames: ['Ash', 'Ember', 'Scout', 'Bramble'],
      desc: 'A scraggly mutt who survived the fire alone. Follows you now.',
      passive: 'Growls before enemies aggro — gives early warning.',
      passiveId: 'early_warning',
      recoveryMsg: 'limped back to camp',
      bodyColor: '#8b6530', earColor: '#6b4520', bellyColor: '#c8a870',
      eyeColor: '#3a2010', noseColor: '#2a1005',
      size: 0.55, animSpeed: 0.14, pellBond: true,
    },
    cat: {
      id: 'cat', species: 'Cat', drawType: 'cat',
      foundZone: 'thornwood_edge', foundTX: 5, foundTY: 14,
      defaultNames: ['Soot', 'Mira', 'Thistle', 'Vex'],
      desc: 'Appeared from nowhere. Has strong opinions about everything.',
      passive: 'Occasionally brings back items after combat.',
      passiveId: 'scavenger',
      recoveryMsg: 'vanished and reappeared at camp, uninjured, somehow',
      bodyColor: '#2a2a2a', earColor: '#1a1a1a', bellyColor: '#4a4040',
      eyeColor: '#00c880', noseColor: '#c06070',
      size: 0.5, animSpeed: 0.12,
    },
    veilmoth: {
      id: 'veilmoth', species: 'Veil-Moth', drawType: 'moth',
      foundZone: 'ashfen_ruins', foundTX: 13, foundTY: 14,
      defaultNames: ['Lumen', 'Faye', 'Wisp', 'Vael'],
      desc: 'A moth that glows with a light that shouldn\'t exist. It chose you.',
      passive: 'Faintly highlights hidden chests and lore nearby.',
      passiveId: 'reveal',
      recoveryMsg: 'dissolved into light and reformed at the nearest shrine',
      bodyColor: '#6a4aad', earColor: '#8a6acd', bellyColor: '#c0a0f0',
      eyeColor: '#ffffff', noseColor: '#8a6acd',
      size: 0.42, animSpeed: 0.08, isMoth: true,
    },
    fox: {
      id: 'fox', species: 'Fox', drawType: 'fox',
      foundZone: 'thornwood_edge', foundTX: 22, foundTY: 8,
      defaultNames: ['Fern', 'Cinder', 'Rook', 'Sable'],
      desc: 'Fast and clever. Disappears into gaps you can\'t fit through.',
      passive: 'Small movement speed boost (+8%) while active.',
      passiveId: 'swift',
      recoveryMsg: 'outran whatever caught it and found camp on its own',
      bodyColor: '#c05820', earColor: '#a04010', bellyColor: '#e0c090',
      eyeColor: '#2a1a05', noseColor: '#1a0a05',
      size: 0.52, animSpeed: 0.11,
    },

    // ── New species (zones 3+) ──────────────────────────────────
    wolf_cub: {
      id: 'wolf_cub', species: 'Wolf Cub', drawType: 'puppy',
      foundZone: 'junction_approach', foundTX: 12, foundTY: 18,
      defaultNames: ['Grey', 'Dusk', 'Flint', 'Warden'],
      desc: 'Too young to be dangerous. Old enough to know it will be.',
      passive: 'Enemies are slower to detect you (intimidate aura).',
      passiveId: 'intimidate',
      recoveryMsg: 'retreated into the brush and circled back to camp',
      bodyColor: '#6a6a72', earColor: '#4a4a52', bellyColor: '#aaa8b0',
      eyeColor: '#d0c040', noseColor: '#1a1a20',
      size: 0.62, animSpeed: 0.13,
    },
    rabbit: {
      id: 'rabbit', species: 'Rabbit', drawType: 'rabbit',
      foundZone: 'thornwood_edge', foundTX: 14, foundTY: 20,
      defaultNames: ['Pip', 'Clover', 'Dust', 'Haze'],
      desc: 'Ears like antennae. It hears things before you do.',
      passive: 'Early warning — same as the dog, but quieter.',
      passiveId: 'early_warning',
      recoveryMsg: 'bolted so fast nobody saw where it went, then appeared at camp',
      bodyColor: '#c8b898', earColor: '#b8a888', bellyColor: '#e8dcc8',
      eyeColor: '#602020', noseColor: '#c06060',
      size: 0.48, animSpeed: 0.16,
    },
    crow: {
      id: 'crow', species: 'Crow', drawType: 'crow',
      foundZone: 'thornkin_camp', foundTX: 24, foundTY: 6,
      defaultNames: ['Caw', 'Ink', 'Rune', 'Grit'],
      desc: 'Sits on your shoulder sometimes. Judges you constantly.',
      passive: 'Highlights nearby interactables (extended reveal range).',
      passiveId: 'reveal',
      recoveryMsg: 'flew off and waited for you at the camp fire',
      bodyColor: '#1a1a1e', earColor: '#111114', bellyColor: '#2a2a30',
      eyeColor: '#3060c0', noseColor: '#1a1a1e',
      size: 0.44, animSpeed: 0.10,
    },
    stoat: {
      id: 'stoat', species: 'Stoat', drawType: 'cat',
      foundZone: 'junction_approach', foundTX: 8, foundTY: 5,
      defaultNames: ['Wren', 'Flicker', 'Bolt', 'Snap'],
      desc: 'White fur, red eyes, too fast to track. Bring it something shiny.',
      passive: 'Speed boost (+6%) while active.',
      passiveId: 'swift',
      recoveryMsg: 'slipped away between the trees and materialized at camp',
      bodyColor: '#e8e4d8', earColor: '#d8d0c0', bellyColor: '#f4f0e8',
      eyeColor: '#c03030', noseColor: '#c06060',
      size: 0.44, animSpeed: 0.09,
    },
    toad: {
      id: 'toad', species: 'Toad', drawType: 'toad',
      foundZone: 'thornkin_camp', foundTX: 7, foundTY: 22,
      defaultNames: ['Bog', 'Murk', 'Lump', 'Glum'],
      desc: 'Sits there. Stares. Somehow useful.',
      passive: 'Occasionally brings back items from puddles and dark corners.',
      passiveId: 'scavenger',
      recoveryMsg: 'burrowed into mud somewhere and re-emerged at camp, unchanged',
      bodyColor: '#4a6832', earColor: '#3a5825', bellyColor: '#8aaa60',
      eyeColor: '#d0b020', noseColor: '#3a5825',
      size: 0.46, animSpeed: 0.22,
    },
    glowbug: {
      id: 'glowbug', species: 'Glow-Bug', drawType: 'moth',
      foundZone: 'ashfen_ruins', foundTX: 20, foundTY: 8,
      defaultNames: ['Spark', 'Dot', 'Mote', 'Blink'],
      desc: 'A tiny pulsing light that follows you like a question mark.',
      passive: 'Reveals hidden interactables in a smaller radius than the Veil-Moth.',
      passiveId: 'reveal',
      recoveryMsg: 'winked out and relit itself at camp',
      bodyColor: '#30c060', earColor: '#20a040', bellyColor: '#80f0a0',
      eyeColor: '#ffffff', noseColor: '#20a040',
      size: 0.28, animSpeed: 0.06, isMoth: true,
    },
  };

  // Max pets active at once
  const MAX_ACTIVE = 3;

  // ── Pet runtime state ─────────────────────────────────────────
  let petStates = {};
  // Array of up to MAX_ACTIVE active pet IDs (in formation order)
  let activePetIds = [];

  // Per-slot follow state (index matches activePetIds slot)
  // Each: { x, y, animFrame, animTimer, wagTimer, warningFlash, warningTimer, scavengerTimer }
  let followStates = [];

  // Formation lags (each active pet trails the player with increasing lag)
  const FORMATION_LAGS = [0.16, 0.28, 0.40];

  // Early warning state (any slot can trigger)
  let warningActive = false;

  function _makeFollowState(x, y) {
    return { x, y, animFrame: 0, animTimer: 0, wagTimer: 0,
             warningFlash: 0, warningTimer: 0, scavengerTimer: 30 + Math.random() * 30 };
  }

  function init(savedPets) {
    petStates = {};
    activePetIds = [];
    followStates = [];
    for (const id of Object.keys(PET_DEFS)) {
      petStates[id] = savedPets?.[id] || { status: 'wild', name: null, pellBonded: false };
    }
    // Restore any saved active slots
    const savedActive = savedPets?.__activeIds || (savedPets?.__active ? [savedPets.__active] : []);
    for (const id of savedActive.slice(0, MAX_ACTIVE)) {
      if (petStates[id] && petStates[id].status !== 'wild') {
        petStates[id].status = 'active';
        activePetIds.push(id);
        followStates.push(_makeFollowState(Player.state.x, Player.state.y));
      }
    }
    warningActive = false;
  }

  function toSaveData() {
    const out = {};
    for (const [id, ps] of Object.entries(petStates)) out[id] = { ...ps };
    out.__activeIds = [...activePetIds];
    out.__active = activePetIds[0] || null; // backwards compat
    return out;
  }

  // ── Discovery ─────────────────────────────────────────────────
  function getPetAtTile(tx, ty) {
    const zoneId = World.current?.id;
    if (!zoneId) return null;
    for (const def of Object.values(PET_DEFS)) {
      if (def.foundZone === zoneId && def.foundTX === tx && def.foundTY === ty) {
        const ps = petStates[def.id];
        if (ps && ps.status === 'wild') return def;
      }
    }
    return null;
  }

  // ── Custom name input overlay ─────────────────────────────────
  function showNameInput(species, defaultName, onName) {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:100%', 'height:100%',
      'display:flex', 'flex-direction:column', 'align-items:center',
      'justify-content:center', 'background:rgba(5,5,8,0.82)',
      'z-index:9999', 'font-family:"Courier New",monospace',
    ].join(';');

    const label = document.createElement('div');
    label.textContent = 'Name your ' + species + ':';
    label.style.cssText = 'color:#d4c89a;font-size:16px;letter-spacing:2px;margin-bottom:14px;text-transform:uppercase;';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultName;
    input.maxLength = 14;
    input.style.cssText = [
      'background:#111318', 'color:#d4c89a', 'border:2px solid #6a4aad',
      'font-family:"Courier New",monospace', 'font-size:20px',
      'text-align:center', 'padding:10px 18px', 'border-radius:6px',
      'outline:none', 'width:220px', 'letter-spacing:3px',
    ].join(';');

    const hint = document.createElement('div');
    hint.textContent = 'Up to 14 characters';
    hint.style.cssText = 'color:#556;font-size:11px;margin-top:8px;letter-spacing:1px;';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'CONFIRM';
    confirmBtn.style.cssText = [
      'margin-top:20px', 'background:#2a5', 'color:#fff',
      'border:none', 'font-family:"Courier New",monospace',
      'font-size:14px', 'letter-spacing:3px', 'padding:10px 32px',
      'border-radius:6px', 'cursor:pointer', 'text-transform:uppercase',
    ].join(';');

    function confirm() {
      const name = input.value.trim().slice(0, 14) || defaultName;
      document.body.removeChild(overlay);
      onName(name);
    }

    confirmBtn.addEventListener('click', confirm);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirm();
      e.stopPropagation();
    });

    overlay.appendChild(label);
    overlay.appendChild(input);
    overlay.appendChild(hint);
    overlay.appendChild(confirmBtn);
    document.body.appendChild(overlay);
    setTimeout(() => { input.focus(); input.select(); }, 80);
  }

  // Build the name-choice dialogue and start it
  function startAdoptDialogue(petDef, onComplete) {
    const dlgId = '__pet_adopt_' + petDef.id;
    const customFlag = '__pet_name_custom_' + petDef.id;

    const flavorText = {
      puppy:     'A small dog trembles in the ash. One ear is folded funny. It\'s watching you very carefully.',
      cat:       'A cat sits on a charred beam above you, staring. It jumps down and rubs against your leg without asking permission.',
      veilmoth:  'The moth hovers at eye level, wings throwing purple light. It doesn\'t flee when you reach out. It lands on your hand.',
      fox:       'The fox is sitting in the middle of the path, blocking it. When you slow down, it tilts its head and doesn\'t move.',
      wolf_cub:  'A wolf cub sits alone in a trampled clearing. It doesn\'t look afraid. It looks like it\'s been waiting.',
      rabbit:    'A rabbit freezes in the undergrowth, watching you. After a long moment, it hops forward once.',
      crow:      'A crow lands directly in front of you, drops something shiny at your feet, and stares. Then it does it again.',
      stoat:     'The white stoat appears from nowhere, runs a circle around your feet, and sits down like it\'s made a decision.',
      toad:      'A toad sits in the middle of the path, motionless. You step around it. It hops after you.',
      glowbug:   'A small light blinks into view near your shoulder and stays there, pulsing softly.',
    };
    const joinText = {
      puppy:    'The dog follows. It has already decided.',
      cat:      'The cat walks ahead of you. This is its decision, not yours.',
      veilmoth: 'The moth circles your shoulder once and then rests there. It is very light.',
      fox:      'The fox trots off, glances back. Waiting.',
      wolf_cub: 'The cub falls into step beside you. Exact pace. No hesitation.',
      rabbit:   'The rabbit bounds after you, ears flat, keeping close.',
      crow:     'The crow flies to your shoulder. Its grip is surprisingly firm.',
      stoat:    'The stoat disappears into your pack and reappears on your arm. It is extremely pleased with itself.',
      toad:     'The toad rides the top of your pack for a while. Then it walks.',
      glowbug:  'The light blinks once and settles. It is warm in a way that doesn\'t make physical sense.',
    };

    const presetChoices = petDef.defaultNames.map(name => ({
      label: name,
      next: dlgId + '_named',
      setFlag: '__pet_name_' + petDef.id + '_' + name,
    }));
    presetChoices.push({
      label: 'Name them yourself...',
      next: dlgId + '_named',
      setFlag: customFlag,
    });

    Story.DIALOGUES[dlgId] = [
      { speaker: 'narrator', text: flavorText[petDef.id] || 'A creature watches you from the shadows.' },
      { speaker: 'narrator', text: 'What will you call them?', choices: presetChoices },
    ];

    // If player already has 3 active, warn them a pet will go to camp
    const fullSquad = activePetIds.length >= MAX_ACTIVE;
    Story.DIALOGUES[dlgId + '_named'] = [
      fullSquad
        ? { speaker: 'narrator', text: 'Your squad is full. They\'ll wait at camp until you make room.' }
        : { speaker: 'narrator', text: joinText[petDef.id] || 'They follow.' },
      { speaker: 'narrator', text: `[${petDef.species} companion joined.]` },
    ];

    Story.startDialogue(dlgId, () => {
      if (Player.state.flags[customFlag]) {
        showNameInput(petDef.species, petDef.defaultNames[0], name => {
          adoptPet(petDef.id, name);
          if (onComplete) onComplete();
        });
        return;
      }
      let chosenName = petDef.defaultNames[0];
      for (const n of petDef.defaultNames) {
        if (Player.state.flags['__pet_name_' + petDef.id + '_' + n]) {
          chosenName = n;
          break;
        }
      }
      adoptPet(petDef.id, chosenName);
      if (onComplete) onComplete();
    });
  }

  function adoptPet(petId, name) {
    if (!petStates[petId]) return;
    petStates[petId].name = name;
    Player.state.flags['has_pet_' + petId] = true;

    if (activePetIds.length < MAX_ACTIVE) {
      // Add to active squad
      petStates[petId].status = 'active';
      activePetIds.push(petId);
      const slot = activePetIds.length - 1;
      // Stagger starting positions slightly so they don't stack
      const offsets = [[-0.35, 0.4], [0, 0.55], [0.35, 0.4]];
      const [ox, oy] = offsets[slot] || [0, 0.5];
      followStates.push(_makeFollowState(Player.state.x + ox, Player.state.y + oy));
      followStates[slot].wagTimer = 2;
    } else {
      // Squad full — go to camp
      petStates[petId].status = 'at_camp';
    }

    // Pell bond trigger
    if (PET_DEFS[petId]?.pellBond && !petStates[petId].pellBonded) {
      petStates[petId].pellBonded = false;
      Player.state.flags['pell_can_bond'] = true;
    }
  }

  // Toggle a pet into/out of the active squad (for camp pet management)
  // If adding and squad is full, replaces the last slot
  function switchActivePet(petId) {
    const ps = petStates[petId];
    if (!ps || ps.status === 'wild') return false;

    const slotIdx = activePetIds.indexOf(petId);
    if (slotIdx !== -1) {
      // Remove from squad
      activePetIds.splice(slotIdx, 1);
      followStates.splice(slotIdx, 1);
      ps.status = 'at_camp';
    } else {
      if (activePetIds.length >= MAX_ACTIVE) {
        // Bump last slot to camp
        const bumped = activePetIds[MAX_ACTIVE - 1];
        petStates[bumped].status = 'at_camp';
        activePetIds.splice(MAX_ACTIVE - 1, 1);
        followStates.splice(MAX_ACTIVE - 1, 1);
      }
      ps.status = 'active';
      activePetIds.push(petId);
      followStates.push(_makeFollowState(Player.state.x, Player.state.y));
    }
    return true;
  }

  // ── Pet gets hurt (NEVER permanently — just retreats) ─────────
  function petHurt(specificPetId) {
    // Pick which active pet gets hurt
    let targetId = specificPetId;
    if (!targetId || !activePetIds.includes(targetId)) {
      if (activePetIds.length === 0) return;
      targetId = activePetIds[Math.floor(Math.random() * activePetIds.length)];
    }

    const def = PET_DEFS[targetId];
    const ps = petStates[targetId];
    if (!def || !ps) return;

    ps.status = 'recovering';
    const slot = activePetIds.indexOf(targetId);
    if (slot !== -1) {
      activePetIds.splice(slot, 1);
      followStates.splice(slot, 1);
    }

    Entities.spawnFloatingText(
      Player.state.x + 0.5, Player.state.y - 1,
      `${ps.name} got away safely!`, '#d4ac0d'
    );

    Player.state.flags['pet_recovering_' + targetId] = true;
    // Only set knowledge trial flag if squad is now empty
    if (activePetIds.length === 0) {
      Player.state.flags.knowledge_trial_pet = targetId;
    }
    warningActive = false;
  }

  function onZoneEnter(zoneId) {
    // Recover all recovering pets to at_camp
    for (const [id, ps] of Object.entries(petStates)) {
      if (ps.status === 'recovering') {
        ps.status = 'at_camp';
        Player.state.flags['pet_recovering_' + id] = false;
      }
    }
    // If squad not full, pull in at_camp pets until full
    _fillSquadFromCamp();
  }

  function onShrineRest() {
    for (const [id, ps] of Object.entries(petStates)) {
      if (ps.status === 'recovering') {
        ps.status = 'at_camp';
        Player.state.flags['pet_recovering_' + id] = false;
      }
    }
    _fillSquadFromCamp();
  }

  function _fillSquadFromCamp() {
    const atCamp = Object.entries(petStates)
      .filter(([id, ps]) => ps.status === 'at_camp' && !activePetIds.includes(id))
      .map(([id]) => id);
    for (const id of atCamp) {
      if (activePetIds.length >= MAX_ACTIVE) break;
      petStates[id].status = 'active';
      activePetIds.push(id);
      followStates.push(_makeFollowState(Player.state.x, Player.state.y));
      const ps = petStates[id];
      Entities.spawnFloatingText(Player.state.x + 0.5, Player.state.y - 1,
        `${ps.name} rejoined!`, '#d4ac0d');
    }
  }

  // ── Passives — checked across all active pets ─────────────────
  function checkEarlyWarning() {
    for (const id of activePetIds) {
      if (!PET_DEFS[id]) continue;
      const pid = PET_DEFS[id].passiveId;
      if (pid !== 'early_warning' && pid !== 'intimidate') continue;
      const px = Player.state.tx, py = Player.state.ty;
      for (const enemy of Entities.enemies) {
        if (enemy.state === 'dead') continue;
        const d = Math.sqrt((enemy.tx - px) ** 2 + (enemy.ty - py) ** 2);
        const detectRange = enemy.def_ref.detectRange;
        if (d < detectRange * 1.5 && d > detectRange) return true;
      }
    }
    return false;
  }

  function getSpeedBonus() {
    let best = 1.0;
    for (const id of activePetIds) {
      if (PET_DEFS[id]?.passiveId === 'swift') best = Math.max(best, 1.08);
    }
    return best;
  }

  function getIntimidateBonus() {
    return activePetIds.some(id => PET_DEFS[id]?.passiveId === 'intimidate');
  }

  function checkReveal(tx, ty) {
    const hasReveal = activePetIds.some(id => PET_DEFS[id]?.passiveId === 'reveal');
    if (!hasReveal) return false;
    const zone = World.current;
    if (!zone) return false;
    for (const chest of (zone.chests || [])) {
      const d = Math.abs(chest.tx - tx) + Math.abs(chest.ty - ty);
      if (d <= 3) return true;
    }
    return false;
  }

  function _tickScavenger(slotIdx, dt) {
    const id = activePetIds[slotIdx];
    if (!id || PET_DEFS[id]?.passiveId !== 'scavenger') return;
    const fs = followStates[slotIdx];
    if (!fs) return;
    if (Entities.getLivingEnemyCount() > 0) { fs.scavengerTimer = 30; return; }
    fs.scavengerTimer -= dt;
    if (fs.scavengerTimer <= 0) {
      fs.scavengerTimer = 45 + Math.random() * 30;
      const pool = ['herb_minor', 'arrow', 'veil_shard', 'antidote'];
      const item = pool[Math.floor(Math.random() * pool.length)];
      Player.addItem(item, 1);
      const ps = petStates[id];
      Entities.spawnFloatingText(
        Player.state.x + 0.5, Player.state.y - 0.8,
        `${ps?.name || '?'} found ${ITEMS[item]?.name}!`, '#d4ac0d'
      );
    }
  }

  // ── Update ────────────────────────────────────────────────────
  function update(dt) {
    if (activePetIds.length === 0) return;

    const px = Player.state.x, py = Player.state.y;
    let anyWarning = false;

    // Formation target offsets when pets are bunched (standing still the gap is small)
    const formOffsets = [
      { dx: -0.32, dy: 0.40 },
      { dx:  0.0,  dy: 0.58 },
      { dx:  0.32, dy: 0.40 },
    ];

    for (let i = 0; i < activePetIds.length; i++) {
      const id = activePetIds[i];
      const ps = petStates[id];
      if (!ps || ps.status !== 'active') continue;
      const def = PET_DEFS[id];
      const fs = followStates[i];
      if (!fs) continue;

      // Target: player pos + formation offset (only when close, fades as player moves)
      const off = formOffsets[i] || { dx: 0, dy: 0.5 };
      const targetX = px + off.dx;
      const targetY = py + off.dy;
      const dx = targetX - fs.x, dy = targetY - fs.y;

      // Speed scales with distance so they catch up when left behind
      const dist = Math.sqrt(dx * dx + dy * dy);
      const lag = FORMATION_LAGS[i] || 0.3;
      const speed = Math.max(4, dist / lag);
      fs.x += dx * Math.min(1, dt * speed);
      fs.y += dy * Math.min(1, dt * speed);

      // Animation
      fs.animTimer += dt;
      const animSpeed = def.animSpeed || 0.12;
      if (fs.animTimer > animSpeed) {
        fs.animTimer = 0;
        fs.animFrame = (fs.animFrame + 1) % 2;
      }
      if (fs.wagTimer > 0) fs.wagTimer -= dt;

      // Warning check
      if (PET_DEFS[id]?.passiveId === 'early_warning' || PET_DEFS[id]?.passiveId === 'intimidate') {
        const warn = checkEarlyWarning();
        if (warn && !warningActive) {
          fs.warningFlash = 1;
          fs.warningTimer = 2;
          Entities.spawnFloatingText(fs.x + 0.5, fs.y - 0.6, `${ps.name}!`, '#d4ac0d');
        }
        if (warn) anyWarning = true;
        if (fs.warningTimer > 0) fs.warningTimer -= dt;
        if (fs.warningFlash > 0) fs.warningFlash = Math.max(0, fs.warningFlash - dt * 2);
      }

      // Scavenger passive
      _tickScavenger(i, dt);

      // Hit check
      for (const enemy of Entities.enemies) {
        if (enemy.state !== 'attack') continue;
        const ed = Math.sqrt((fs.x - enemy.tx) ** 2 + (fs.y - enemy.ty) ** 2);
        if (ed < 1.2 && Math.random() < 0.025) {
          petHurt(id);
          break;
        }
      }
    }

    warningActive = anyWarning;
  }

  // ── Drawing functions ─────────────────────────────────────────
  function drawPuppy(ctx, cx, cy, s, def, frame, wag) {
    const wagAngle = wag > 0 ? Math.sin(Date.now() * 0.015) * 0.5 : Math.sin(Date.now() * 0.004) * 0.15;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.42, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(cx - s * 0.18, cy + s * 0.12);
    ctx.rotate(wagAngle);
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.18, s * 0.07, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1, s * 0.22, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.04, cy + s * 0.14, s * 0.13, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bodyColor;
    const legSwing = frame === 0 ? s * 0.04 : -s * 0.04;
    [-s * 0.12, s * 0.08].forEach((ox, i) => {
      ctx.fillRect(cx + ox + (i === 0 ? legSwing : -legSwing), cy + s * 0.2, s * 0.07, s * 0.16);
    });
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.14, cy - s * 0.06, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.earColor;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.06, cy - s * 0.06, s * 0.07, s * 0.14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.24, cy - s * 0.1, s * 0.06, s * 0.12, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.eyeColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.17, cy - s * 0.1, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + s * 0.185, cy - s * 0.115, s * 0.015, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.noseColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.3, cy - s * 0.07, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCat(ctx, cx, cy, s, def, frame) {
    const tailAngle = Math.sin(Date.now() * 0.003) * 0.6;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.4, s * 0.22, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(cx - s * 0.15, cy + s * 0.1);
    ctx.rotate(tailAngle);
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.2, s * 0.05, s * 0.22, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.08, s * 0.18, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.12, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bodyColor;
    const legSwing = frame === 0 ? s * 0.03 : -s * 0.03;
    [-s * 0.1, s * 0.06].forEach((ox, i) => {
      ctx.fillRect(cx + ox + (i === 0 ? legSwing : -legSwing), cy + s * 0.18, s * 0.06, s * 0.14);
    });
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.1, cy - s * 0.08, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.earColor;
    [[cx + s * 0.02, cy - s * 0.2], [cx + s * 0.18, cy - s * 0.2]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(ex, ey + s * 0.05);
      ctx.lineTo(ex - s * 0.05, ey - s * 0.08);
      ctx.lineTo(ex + s * 0.05, ey - s * 0.08);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = def.eyeColor;
    ctx.shadowColor = def.eyeColor;
    ctx.shadowBlur = 4;
    [-s * 0.04, s * 0.06].forEach(ox => {
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.1 + ox, cy - s * 0.1, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.fillStyle = def.noseColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.17, cy - s * 0.06, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMoth(ctx, cx, cy, s, def, frame) {
    const t = Date.now() * 0.003;
    const flutter = Math.sin(t * 8) * s * 0.06;
    const glow = 0.5 + 0.5 * Math.sin(t * 2);
    ctx.save();
    ctx.shadowColor = def.bodyColor;
    ctx.shadowBlur = 12 * glow;
    ctx.fillStyle = def.bodyColor + 'aa';
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + sx * s * 0.18, cy + sy * s * 0.1 + flutter * sy,
        s * 0.16, s * 0.1, sx > 0 ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.06, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx - s * 0.03, cy - s * 0.1, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + s * 0.03, cy - s * 0.1, s * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawFox(ctx, cx, cy, s, def, frame) {
    const wagAngle = Math.sin(Date.now() * 0.004) * 0.4;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.4, s * 0.22, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(cx - s * 0.14, cy + s * 0.1);
    ctx.rotate(wagAngle);
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.14, s * 0.1, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.24, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.06, s * 0.2, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.04, cy + s * 0.1, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    const legSwing = frame === 0 ? s * 0.04 : -s * 0.04;
    ctx.fillStyle = def.bodyColor;
    [-s * 0.1, s * 0.08].forEach((ox, i) => {
      ctx.fillRect(cx + ox + (i === 0 ? legSwing : -legSwing), cy + s * 0.18, s * 0.07, s * 0.15);
    });
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.12, cy - s * 0.08, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.bodyColor;
    [[cx + s * 0.04, cy - s * 0.22], [cx + s * 0.22, cy - s * 0.24]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(ex, ey + s * 0.06);
      ctx.lineTo(ex - s * 0.04, ey - s * 0.1);
      ctx.lineTo(ex + s * 0.04, ey - s * 0.1);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = '#c84040';
    [[cx + s * 0.04, cy - s * 0.2], [cx + s * 0.22, cy - s * 0.22]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(ex, ey + s * 0.04);
      ctx.lineTo(ex - s * 0.02, ey - s * 0.06);
      ctx.lineTo(ex + s * 0.02, ey - s * 0.06);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = def.eyeColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.16, cy - s * 0.1, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + s * 0.172, cy - s * 0.112, s * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = def.noseColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.27, cy - s * 0.05, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRabbit(ctx, cx, cy, s, def, frame) {
    const hopOff = frame === 0 ? 0 : -s * 0.08;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.38 - hopOff * 0.3, s * 0.2, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1 + hopOff, s * 0.2, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.14 + hopOff, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.08, cy - s * 0.06 + hopOff, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
    // Big upright ears
    ctx.fillStyle = def.earColor;
    [[-s * 0.06, -s * 0.28], [s * 0.1, -s * 0.3]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.08 + ox, cy + oy + hopOff, s * 0.05, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Inner ear
    ctx.fillStyle = def.noseColor + '88';
    [[-s * 0.06, -s * 0.28], [s * 0.1, -s * 0.3]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.08 + ox, cy + oy + hopOff, s * 0.025, s * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Eyes
    ctx.fillStyle = def.eyeColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.15, cy - s * 0.1 + hopOff, s * 0.038, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + s * 0.163, cy - s * 0.114 + hopOff, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.fillStyle = def.noseColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.2, cy - s * 0.05 + hopOff, s * 0.022, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCrow(ctx, cx, cy, s, def, frame) {
    const flapOff = frame === 0 ? s * 0.04 : -s * 0.04;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.35, s * 0.18, s * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings (flapping)
    ctx.fillStyle = def.bodyColor;
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(side * (0.3 + flapOff / s));
      ctx.beginPath();
      ctx.ellipse(side * s * 0.2, 0, s * 0.18, s * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // Body
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.06, s * 0.12, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(cx + s * 0.04, cy - s * 0.12, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#888860';
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.14, cy - s * 0.14);
    ctx.lineTo(cx + s * 0.26, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.14, cy - s * 0.08);
    ctx.closePath();
    ctx.fill();
    // Eye (bright blue)
    ctx.fillStyle = def.eyeColor;
    ctx.shadowColor = def.eyeColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(cx + s * 0.1, cy - s * 0.15, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Feet
    ctx.fillStyle = def.bodyColor;
    [-s * 0.06, s * 0.04].forEach(ox => {
      ctx.fillRect(cx + ox, cy + s * 0.2, s * 0.05, s * 0.12);
    });
  }

  function drawToad(ctx, cx, cy, s, def, frame) {
    const hopOff = frame === 0 ? 0 : -s * 0.05;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.3 - hopOff * 0.2, s * 0.24, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body (squat)
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.06 + hopOff, s * 0.24, s * 0.17, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly (lighter)
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1 + hopOff, s * 0.18, s * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head (merged with body, just bumps)
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.04 + hopOff, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // Big eyes on top of head
    ctx.fillStyle = def.eyeColor;
    [-s * 0.1, s * 0.1].forEach(ox => {
      ctx.beginPath();
      ctx.arc(cx + ox, cy - s * 0.13 + hopOff, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
      // Pupil
      ctx.fillStyle = '#1a1a05';
      ctx.beginPath();
      ctx.arc(cx + ox + s * 0.01, cy - s * 0.13 + hopOff, s * 0.038, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.eyeColor;
    });
    // Legs (splayed out)
    ctx.fillStyle = def.bodyColor;
    [[-s * 0.28, s * 0.12], [s * 0.28, s * 0.12]].forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy + hopOff, s * 0.1, s * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Mouth line
    ctx.strokeStyle = def.earColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.04 + hopOff, s * 0.12, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Dispatch draw by drawType
  function drawPet(ctx, id, fs) {
    const def = PET_DEFS[id];
    if (!def) return;
    const px = fs.x, py = fs.y;
    // cx/cy are computed by caller — passed here as part of fs
    const cx = fs._cx, cy = fs._cy;
    const s = fs._s;
    const wag = fs.wagTimer > 0;
    switch (def.drawType) {
      case 'puppy':  drawPuppy(ctx, cx, cy, s, def, fs.animFrame, wag); break;
      case 'cat':    drawCat(ctx, cx, cy, s, def, fs.animFrame); break;
      case 'moth':   drawMoth(ctx, cx, cy, s, def, fs.animFrame); break;
      case 'fox':    drawFox(ctx, cx, cy, s, def, fs.animFrame); break;
      case 'rabbit': drawRabbit(ctx, cx, cy, s, def, fs.animFrame); break;
      case 'crow':   drawCrow(ctx, cx, cy, s, def, fs.animFrame); break;
      case 'toad':   drawToad(ctx, cx, cy, s, def, fs.animFrame); break;
      default:       drawPuppy(ctx, cx, cy, s, def, fs.animFrame, wag); break;
    }
  }

  function draw(ctx, camX, camY, tileSize) {
    if (activePetIds.length === 0) return;

    // Draw furthest-back pets first (slot 1, then 0 and 2, then 0)
    // Simpler: draw in reverse slot order so slot 0 appears on top
    for (let i = activePetIds.length - 1; i >= 0; i--) {
      const id = activePetIds[i];
      const ps = petStates[id];
      if (!ps || ps.status !== 'active') continue;
      const def = PET_DEFS[id];
      if (!def) continue;
      const fs = followStates[i];
      if (!fs) continue;

      const cx = fs.x * tileSize - camX + tileSize * 0.5;
      const cy = fs.y * tileSize - camY + tileSize * 0.5;
      const s = tileSize * def.size;

      // Stash screen coords for drawPet dispatch
      fs._cx = cx; fs._cy = cy; fs._s = s;

      ctx.save();
      drawPet(ctx, id, fs);

      // Warning glow
      if (fs.warningFlash > 0) {
        ctx.globalAlpha = fs.warningFlash * 0.6;
        ctx.strokeStyle = '#d4ac0d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ── HUD pet indicator (shows all active slots) ────────────────
  function drawHUDIndicator(ctx, startX, y) {
    const slotW = 34;
    for (let i = 0; i < MAX_ACTIVE; i++) {
      const x = startX + i * (slotW + 4);
      ctx.save();
      // Slot background
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = PAL.uiBg;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      const id = activePetIds[i];
      if (id) {
        const ps = petStates[id];
        const def = PET_DEFS[id];
        ctx.strokeStyle = def.bodyColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.stroke();
        // Species initial
        ctx.fillStyle = def.bodyColor;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.species[0], x, y);
        // Name below
        ctx.fillStyle = PAL.textDim;
        ctx.font = '8px "Courier New", monospace';
        ctx.fillText((ps.name || '?').slice(0, 5), x, y + 18);
      } else {
        // Empty slot
        ctx.strokeStyle = '#334';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#334';
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', x, y);
      }
      ctx.restore();
    }
  }

  return {
    PET_DEFS,
    MAX_ACTIVE,
    init, toSaveData,
    getPetAtTile, startAdoptDialogue, adoptPet, switchActivePet,
    petHurt, onZoneEnter, onShrineRest,
    checkEarlyWarning, getSpeedBonus, getIntimidateBonus, checkReveal,
    update, draw, drawHUDIndicator,
    get activePetIds() { return activePetIds; },
    get activePetId()  { return activePetIds[0] || null; }, // backwards compat
    get petStates() { return petStates; },
    get warningActive() { return warningActive; },
  };
})();
