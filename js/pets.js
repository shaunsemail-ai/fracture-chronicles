// Pet system — companions that follow, help, and cannot permanently die
const Pets = (() => {

  // ── Pet definitions ───────────────────────────────────────────
  const PET_DEFS = {
    puppy: {
      id: 'puppy',
      species: 'Dog',
      foundZone: 'ashfen_ruins',
      foundTX: 9, foundTY: 20,
      defaultNames: ['Ash', 'Ember', 'Scout', 'Bramble'],
      desc: 'A scraggly mutt who survived the fire alone. Follows you now.',
      passive: 'Growls before enemies aggro — gives early warning.',
      passiveId: 'early_warning',
      recoveryMsg: 'limped back to camp',
      bodyColor: '#8b6530',
      earColor:  '#6b4520',
      bellyColor:'#c8a870',
      eyeColor:  '#3a2010',
      noseColor: '#2a1005',
      size: 0.55,
      animSpeed: 0.14,
      pellBond: true, // Pell bonds with this one
    },
    cat: {
      id: 'cat',
      species: 'Cat',
      foundZone: 'thornwood_edge',
      foundTX: 5, foundTY: 14,
      defaultNames: ['Soot', 'Mira', 'Thistle', 'Vex'],
      desc: 'Appeared from nowhere. Has strong opinions about everything.',
      passive: 'Occasionally brings back items after combat.',
      passiveId: 'scavenger',
      recoveryMsg: 'vanished and reappeared at camp, uninjured, somehow',
      bodyColor: '#2a2a2a',
      earColor:  '#1a1a1a',
      bellyColor:'#4a4040',
      eyeColor:  '#00c880',
      noseColor: '#c06070',
      size: 0.5,
      animSpeed: 0.12,
    },
    veilmoth: {
      id: 'veilmoth',
      species: 'Veil-Moth',
      foundZone: 'ashfen_ruins',
      foundTX: 13, foundTY: 14, // near the shrine
      defaultNames: ['Lumen', 'Faye', 'Wisp', 'Vael'],
      desc: 'A moth that glows with a light that shouldn\'t exist. It chose you.',
      passive: 'Faintly highlights hidden chests and lore nearby.',
      passiveId: 'reveal',
      recoveryMsg: 'dissolved into light and reformed at the nearest shrine',
      bodyColor: '#6a4aad',
      earColor:  '#8a6acd',
      bellyColor:'#c0a0f0',
      eyeColor:  '#ffffff',
      noseColor: '#8a6acd',
      size: 0.42,
      animSpeed: 0.08,
      isMoth: true,
    },
    fox: {
      id: 'fox',
      species: 'Fox',
      foundZone: 'thornwood_edge',
      foundTX: 22, foundTY: 8,
      defaultNames: ['Fern', 'Cinder', 'Rook', 'Sable'],
      desc: 'Fast and clever. Disappears into gaps you can\'t fit through.',
      passive: 'Small movement speed boost (+8%) while active.',
      passiveId: 'swift',
      recoveryMsg: 'outran whatever caught it and found camp on its own',
      bodyColor: '#c05820',
      earColor:  '#a04010',
      bellyColor:'#e0c090',
      eyeColor:  '#2a1a05',
      noseColor: '#1a0a05',
      size: 0.52,
      animSpeed: 0.11,
    },
  };

  // ── Pet runtime state ─────────────────────────────────────────
  // petStates: { [petId]: { status, name, hp, pellBonded, recoveryZone } }
  // status: 'wild' | 'active' | 'at_camp' | 'recovering'
  let petStates = {};
  let activePetId = null;

  // Follow position (smooth, slightly behind player)
  let followX = 0, followY = 0;
  let followLag = 0.35;       // seconds behind
  let petAnimFrame = 0;
  let petAnimTimer = 0;
  let petWagTimer = 0;        // for tail wag / happy animation
  let scavengerTimer = 0;     // cat passive cooldown

  // Early warning state
  let warningActive = false;
  let warningTimer = 0;
  let warningFlash = 0;

  function init(savedPets) {
    petStates = {};
    activePetId = null;
    for (const id of Object.keys(PET_DEFS)) {
      petStates[id] = savedPets?.[id] || { status: 'wild', name: null, pellBonded: false };
    }
    activePetId = savedPets?.__active || null;
    if (activePetId) {
      followX = Player.state.x;
      followY = Player.state.y;
    }
  }

  function toSaveData() {
    const out = {};
    for (const [id, ps] of Object.entries(petStates)) out[id] = { ...ps };
    out.__active = activePetId;
    return out;
  }

  // ── Discovery ─────────────────────────────────────────────────
  // Returns pet def if there's a discoverable pet at this tile in the current zone
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
  // Spawns an HTML input element over the canvas. onName(name) called when confirmed.
  function showNameInput(species, defaultName, onName) {
    // Overlay container
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
      e.stopPropagation(); // don't leak keypresses to game
    });

    overlay.appendChild(label);
    overlay.appendChild(input);
    overlay.appendChild(hint);
    overlay.appendChild(confirmBtn);
    document.body.appendChild(overlay);

    // Auto-select text so player can type immediately
    setTimeout(() => { input.focus(); input.select(); }, 80);
  }

  // Build the name-choice dialogue and start it
  function startAdoptDialogue(petDef, onComplete) {
    const dlgId = '__pet_adopt_' + petDef.id;
    const customFlag = '__pet_name_custom_' + petDef.id;

    const flavorText = {
      puppy:    'A small dog trembles in the ash. One ear is folded funny. It\'s watching you very carefully.',
      cat:      'A cat sits on a charred beam above you, staring. It jumps down and rubs against your leg without asking permission.',
      veilmoth: 'The moth hovers at eye level, wings throwing purple light. It doesn\'t flee when you reach out. It lands on your hand.',
      fox:      'The fox is sitting in the middle of the path, blocking it. When you slow down, it tilts its head and doesn\'t move.',
    };
    const joinText = {
      puppy:    'The dog follows. It has already decided.',
      cat:      'The cat walks ahead of you. This is its decision, not yours.',
      veilmoth: 'The moth circles your shoulder once and then rests there. It is very light.',
      fox:      'The fox trots off, glances back. Waiting.',
    };

    // Choices: 4 preset names + "Name them yourself..."
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
      {
        speaker: 'narrator',
        text: 'What will you call them?',
        choices: presetChoices,
      },
    ];
    Story.DIALOGUES[dlgId + '_named'] = [
      { speaker: 'narrator', text: joinText[petDef.id] || 'They follow.' },
      { speaker: 'narrator', text: `[${petDef.species} companion joined.]` },
    ];

    Story.startDialogue(dlgId, () => {
      // Check if player picked "Name them yourself..."
      if (Player.state.flags[customFlag]) {
        // Show text input overlay; pause before adopting
        showNameInput(petDef.species, petDef.defaultNames[0], name => {
          adoptPet(petDef.id, name);
          if (onComplete) onComplete();
        });
        return;
      }
      // Find which preset was chosen
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
    petStates[petId].status = 'active';
    petStates[petId].name = name;
    // If previously active pet, send to camp
    if (activePetId && activePetId !== petId) {
      petStates[activePetId].status = 'at_camp';
    }
    activePetId = petId;
    followX = Player.state.x;
    followY = Player.state.y;
    petWagTimer = 2; // happy animation on join
    Player.state.flags['has_pet_' + petId] = true;
    // Pell bond trigger
    if (PET_DEFS[petId]?.pellBond && !petStates[petId].pellBonded) {
      petStates[petId].pellBonded = false; // will be set by story trigger
      Player.state.flags['pell_can_bond'] = true;
    }
  }

  function switchActivePet(petId) {
    if (!petStates[petId] || petStates[petId].status === 'wild') return false;
    if (activePetId) petStates[activePetId].status = 'at_camp';
    activePetId = petId;
    petStates[petId].status = 'active';
    followX = Player.state.x;
    followY = Player.state.y;
    return true;
  }

  // ── Pet gets hurt (not dead — NEVER dead) ────────────────────
  function petHurt() {
    if (!activePetId) return;
    const def = PET_DEFS[activePetId];
    const ps = petStates[activePetId];
    if (!def || !ps) return;
    ps.status = 'recovering';
    const oldActive = activePetId;
    activePetId = null;
    warningActive = false;

    // Recovery message
    const msg = `${ps.name} ${def.recoveryMsg}. They\'ll be at camp.`;
    Story.DIALOGUES.__pet_hurt = [{ speaker: 'narrator', text: msg }];
    // Don't start dialogue mid-combat — just show as HUD message
    Entities.spawnFloatingText(
      Player.state.x + 0.5, Player.state.y - 1,
      `${ps.name} got away safely!`, '#d4ac0d'
    );

    // Auto-recover after resting at shrine or entering camp zone
    // (handled in onZoneEnter)
    Player.state.flags['pet_recovering_' + oldActive] = true;
    // Mark for Knowledge Trial — "?" button will appear if player dies soon after
    Player.state.flags.knowledge_trial_pet = oldActive;
  }

  // Call when player enters a new zone
  function onZoneEnter(zoneId) {
    // Recover any recovering pets
    for (const [id, ps] of Object.entries(petStates)) {
      if (ps.status === 'recovering') {
        ps.status = 'at_camp';
        Player.state.flags['pet_recovering_' + id] = false;
      }
    }
    // Re-activate current pet if at_camp and no active
    if (!activePetId) {
      const prev = Object.entries(petStates).find(([id, ps]) => ps.status === 'at_camp');
      if (prev) {
        activePetId = prev[0];
        prev[1].status = 'active';
        followX = Player.state.x;
        followY = Player.state.y;
      }
    }
  }

  function onShrineRest() {
    for (const [id, ps] of Object.entries(petStates)) {
      if (ps.status === 'recovering') {
        ps.status = 'at_camp';
        Player.state.flags['pet_recovering_' + id] = false;
      }
    }
    if (!activePetId) {
      const prev = Object.entries(petStates).find(([id, ps]) => ps.status === 'at_camp');
      if (prev) {
        activePetId = prev[0];
        prev[1].status = 'active';
        followX = Player.state.x;
        followY = Player.state.y;
        const def = PET_DEFS[prev[0]];
        const ps = prev[1];
        Entities.spawnFloatingText(Player.state.x + 0.5, Player.state.y - 1,
          `${ps.name} found you!`, '#d4ac0d');
      }
    }
  }

  // ── Passives ──────────────────────────────────────────────────
  function checkEarlyWarning() {
    if (!activePetId) return false;
    if (PET_DEFS[activePetId]?.passiveId !== 'early_warning') return false;
    const px = Player.state.tx, py = Player.state.ty;
    for (const enemy of Entities.enemies) {
      if (enemy.state === 'dead') continue;
      const d = Math.sqrt((enemy.tx - px) ** 2 + (enemy.ty - py) ** 2);
      const detectRange = enemy.def_ref.detectRange;
      // Warn when enemy is within 1.5x detect range (before they would see player)
      if (d < detectRange * 1.5 && d > detectRange) {
        return true;
      }
    }
    return false;
  }

  function getSpeedBonus() {
    if (!activePetId) return 1.0;
    return PET_DEFS[activePetId]?.passiveId === 'swift' ? 1.08 : 1.0;
  }

  function checkReveal(tx, ty) {
    // Veil-moth: returns true if there's something hidden nearby
    if (!activePetId) return false;
    if (PET_DEFS[activePetId]?.passiveId !== 'reveal') return false;
    // Check chests nearby
    const zone = World.current;
    if (!zone) return false;
    for (const chest of (zone.chests || [])) {
      const d = Math.abs(chest.tx - tx) + Math.abs(chest.ty - ty);
      if (d <= 3) return true;
    }
    return false;
  }

  function tickScavenger(dt) {
    if (!activePetId) return;
    if (PET_DEFS[activePetId]?.passiveId !== 'scavenger') return;
    if (Entities.getLivingEnemyCount() > 0) { scavengerTimer = 30; return; }
    scavengerTimer -= dt;
    if (scavengerTimer <= 0) {
      scavengerTimer = 45 + Math.random() * 30;
      // Drop a random small item
      const pool = ['herb_minor', 'arrow', 'veil_shard', 'antidote'];
      const item = pool[Math.floor(Math.random() * pool.length)];
      Player.addItem(item, 1);
      const ps = petStates[activePetId];
      Entities.spawnFloatingText(
        Player.state.x + 0.5, Player.state.y - 0.8,
        `${ps?.name || 'Cat'} found ${ITEMS[item]?.name}!`, '#d4ac0d'
      );
    }
  }

  // ── Update ────────────────────────────────────────────────────
  function update(dt) {
    if (!activePetId) return;
    const ps = petStates[activePetId];
    if (!ps || ps.status !== 'active') return;

    const def = PET_DEFS[activePetId];

    // Smooth follow — lag behind player
    const px = Player.state.x, py = Player.state.y;
    const dx = px - followX, dy = py - followY;
    const speed = (def.animSpeed > 0.1 ? 6 : 5) * (1 + Math.abs(dx) + Math.abs(dy));
    followX += dx * Math.min(1, dt * speed);
    followY += dy * Math.min(1, dt * speed);

    // Animation
    petAnimTimer += dt;
    if (petAnimTimer > def.animSpeed) {
      petAnimTimer = 0;
      petAnimFrame = (petAnimFrame + 1) % 2;
    }

    if (petWagTimer > 0) petWagTimer -= dt;

    // Early warning
    const warn = checkEarlyWarning();
    if (warn && !warningActive) {
      warningActive = true;
      warningTimer = 2;
      warningFlash = 1;
      Entities.spawnFloatingText(
        followX + 0.5, followY - 0.6,
        `${ps.name}!`, '#d4ac0d'
      );
    }
    if (!warn) warningActive = false;
    if (warningTimer > 0) warningTimer -= dt;
    if (warningFlash > 0) warningFlash = Math.max(0, warningFlash - dt * 2);

    // Scavenger passive
    tickScavenger(dt);

    // Check if enemy attacks hit the pet (proximity)
    for (const enemy of Entities.enemies) {
      if (enemy.state !== 'attack') continue;
      const ex = enemy.tx, ey = enemy.ty;
      const pd = Math.sqrt((followX - ex) ** 2 + (followY - ey) ** 2);
      if (pd < 1.2 && Math.random() < 0.03) { // low chance, pets are quick
        petHurt();
        break;
      }
    }
  }

  // ── Drawing ───────────────────────────────────────────────────
  function drawPuppy(ctx, cx, cy, s, def, frame, wag) {
    const wagAngle = wag > 0 ? Math.sin(Date.now() * 0.015) * 0.5 : Math.sin(Date.now() * 0.004) * 0.15;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.42, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail (wags)
    ctx.save();
    ctx.translate(cx - s * 0.18, cy + s * 0.12);
    ctx.rotate(wagAngle);
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.18, s * 0.07, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1, s * 0.22, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.04, cy + s * 0.14, s * 0.13, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (walk cycle)
    ctx.fillStyle = def.bodyColor;
    const legSwing = frame === 0 ? s * 0.04 : -s * 0.04;
    [-s * 0.12, s * 0.08].forEach((ox, i) => {
      ctx.fillRect(cx + ox + (i === 0 ? legSwing : -legSwing), cy + s * 0.2, s * 0.07, s * 0.16);
    });

    // Head
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.14, cy - s * 0.06, s * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = def.earColor;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.06, cy - s * 0.06, s * 0.07, s * 0.14, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.24, cy - s * 0.1, s * 0.06, s * 0.12, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = def.eyeColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.17, cy - s * 0.1, s * 0.04, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + s * 0.185, cy - s * 0.115, s * 0.015, 0, Math.PI * 2);
    ctx.fill();

    // Nose
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

    // Tail (curves)
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

    // Legs
    ctx.fillStyle = def.bodyColor;
    const legSwing = frame === 0 ? s * 0.03 : -s * 0.03;
    [-s * 0.1, s * 0.06].forEach((ox, i) => {
      ctx.fillRect(cx + ox + (i === 0 ? legSwing : -legSwing), cy + s * 0.18, s * 0.06, s * 0.14);
    });

    // Head (more angular than dog)
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.1, cy - s * 0.08, s * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
    ctx.fillStyle = def.earColor;
    [[cx + s * 0.02, cy - s * 0.2], [cx + s * 0.18, cy - s * 0.2]].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.moveTo(ex, ey + s * 0.05);
      ctx.lineTo(ex - s * 0.05, ey - s * 0.08);
      ctx.lineTo(ex + s * 0.05, ey - s * 0.08);
      ctx.closePath();
      ctx.fill();
    });

    // Eyes (cat — slightly glowing)
    ctx.fillStyle = def.eyeColor;
    ctx.shadowColor = def.eyeColor;
    ctx.shadowBlur = 4;
    [-s * 0.04, s * 0.06].forEach(ox => {
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.1 + ox, cy - s * 0.1, s * 0.04, s * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Nose
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

    // Wings (flutter)
    ctx.fillStyle = def.bodyColor + 'aa';
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(cx + sx * s * 0.18, cy + sy * s * 0.1 + flutter * sy,
        s * 0.16, s * 0.1, sx > 0 ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Body
    ctx.fillStyle = def.bellyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s * 0.06, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (tiny glowing dots)
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

    // Bushy tail
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

    // Head with pointed snout
    ctx.fillStyle = def.bodyColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.12, cy - s * 0.08, s * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
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

    // Eyes
    ctx.fillStyle = def.eyeColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.16, cy - s * 0.1, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx + s * 0.172, cy - s * 0.112, s * 0.012, 0, Math.PI * 2);
    ctx.fill();

    // Snout / nose
    ctx.fillStyle = def.noseColor;
    ctx.beginPath();
    ctx.arc(cx + s * 0.27, cy - s * 0.05, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(ctx, camX, camY, tileSize) {
    if (!activePetId) return;
    const ps = petStates[activePetId];
    if (!ps || ps.status !== 'active') return;
    const def = PET_DEFS[activePetId];
    if (!def) return;

    const cx = followX * tileSize - camX + tileSize * 0.5;
    const cy = followY * tileSize - camY + tileSize * 0.5;
    const s = tileSize * def.size;
    const wag = petWagTimer > 0;

    ctx.save();
    switch (activePetId) {
      case 'puppy':    drawPuppy(ctx, cx, cy, s, def, petAnimFrame, wag); break;
      case 'cat':      drawCat(ctx, cx, cy, s, def, petAnimFrame); break;
      case 'veilmoth': drawMoth(ctx, cx, cy, s, def, petAnimFrame); break;
      case 'fox':      drawFox(ctx, cx, cy, s, def, petAnimFrame); break;
    }

    // Early warning glow around pet
    if (warningFlash > 0) {
      ctx.globalAlpha = warningFlash * 0.6;
      ctx.strokeStyle = '#d4ac0d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + s * 0.1, cy, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── HUD pet indicator ─────────────────────────────────────────
  function drawHUDIndicator(ctx, x, y) {
    if (!activePetId) return;
    const ps = petStates[activePetId];
    if (!ps || ps.status !== 'active') return;
    const def = PET_DEFS[activePetId];
    ctx.save();
    ctx.fillStyle = PAL.uiBg;
    ctx.globalAlpha = 0.8;
    // Small icon area
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = def.bodyColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pet initial
    ctx.fillStyle = def.bodyColor;
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.species[0], x, y);
    // Name
    ctx.fillStyle = PAL.textDim;
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText(ps.name || '?', x, y + 18);
    ctx.restore();
  }

  return {
    PET_DEFS,
    init, toSaveData,
    getPetAtTile, startAdoptDialogue, adoptPet, switchActivePet,
    petHurt, onZoneEnter, onShrineRest,
    checkEarlyWarning, getSpeedBonus, checkReveal,
    update, draw, drawHUDIndicator,
    get activePetId() { return activePetId; },
    get petStates() { return petStates; },
    get warningActive() { return warningActive; },
  };
})();
