// Player — stats, movement, talents, class system
const Player = (() => {

  // ── XP curve ─────────────────────────────────────────────────
  function xpToNextLevel(level) {
    return Math.floor(100 * Math.pow(1.4, level - 1));
  }

  // ── Talent tree definitions ───────────────────────────────────
  // Each tree has tiers. Talents in tier N require tier N-1 point spent.
  const TALENT_TREES = {
    ironclad: {
      name: 'Ironclad', color: PAL.ironclad,
      tiers: [
        [
          { id: 'heavy_strike', name: 'Heavy Strike', max: 3, type: 'active',
            desc: 'A powerful melee blow. +15% dmg per rank. Costs 5 stamina.',
            icon: 'sword', req: {} },
          { id: 'iron_skin', name: 'Iron Skin', max: 5, type: 'passive',
            desc: '+4 DEF per rank.',
            icon: 'shield', req: {} },
          { id: 'taunt', name: 'Taunt', max: 1, type: 'active',
            desc: 'Forces nearby enemies to target you for 5s.',
            icon: 'shout', req: {} },
        ],
        [
          { id: 'whirlwind', name: 'Whirlwind', max: 3, type: 'active',
            desc: 'Spin attack hitting all adjacent enemies. +10% dmg per rank.',
            icon: 'spin', req: { heavy_strike: 1, iron_skin: 2 } },
          { id: 'endurance', name: 'Endurance', max: 5, type: 'passive',
            desc: '+10 max stamina per rank.',
            icon: 'heart', req: { iron_skin: 1 } },
          { id: 'shield_bash', name: 'Shield Bash', max: 2, type: 'active',
            desc: 'Stuns an enemy for 1.5s. Req: shield equipped.',
            icon: 'bash', req: { taunt: 1 } },
        ],
        [
          { id: 'warlord', name: 'Warlord', max: 1, type: 'passive',
            desc: 'STR passively scales with END. You become harder to kill the longer a fight goes.',
            icon: 'crown', req: { whirlwind: 2, endurance: 3 },
            educationGate: { subject: 'math', label: 'Understand force calculations to master the Warlord stance.' } },
          { id: 'berserker', name: 'Berserker', max: 3, type: 'passive',
            desc: 'Below 30% HP: +20% ATK, +10% speed per rank.',
            icon: 'rage', req: { whirlwind: 1, shield_bash: 1 } },
        ],
      ],
    },
    ashwalker: {
      name: 'Ashwalker', color: PAL.ashwalker,
      tiers: [
        [
          { id: 'quick_shot', name: 'Quick Shot', max: 3, type: 'active',
            desc: 'Rapid shot with reduced charge time. +10% speed per rank.',
            icon: 'bow', req: {} },
          { id: 'silent_step', name: 'Silent Step', max: 3, type: 'passive',
            desc: 'Reduce enemy detection range by 15% per rank.',
            icon: 'boot', req: {} },
          { id: 'tracking', name: 'Tracking', max: 1, type: 'active',
            desc: 'Reveal enemy positions in the current zone for 30s.',
            icon: 'eye', req: {} },
        ],
        [
          { id: 'multishot', name: 'Multi-Shot', max: 3, type: 'active',
            desc: 'Fire 2+rank arrows in a spread. Costs extra ammo.',
            icon: 'arrows', req: { quick_shot: 2 } },
          { id: 'shadow_step', name: 'Shadow Step', max: 1, type: 'active',
            desc: 'Dash 3 tiles instantly. Short cooldown.',
            icon: 'dash', req: { silent_step: 2 } },
          { id: 'poison_arrow', name: 'Venom Arrow', max: 3, type: 'passive',
            desc: 'Shots have 15+10%/rank chance to poison. Poisons stack.',
            icon: 'venom', req: { tracking: 1 } },
        ],
        [
          { id: 'phantom_hunter', name: 'Phantom Hunter', max: 1, type: 'passive',
            desc: 'First shot from stealth deals 3x damage and doesn\'t break stealth.',
            icon: 'phantom', req: { shadow_step: 1, multishot: 2 },
            educationGate: { subject: 'science', label: 'Study velocity and trajectory to master the Phantom Hunter.' } },
          { id: 'eagle_eye', name: 'Eagle Eye', max: 3, type: 'passive',
            desc: '+1 tile range, +8% crit chance per rank.',
            icon: 'eagle', req: { multishot: 1, poison_arrow: 1 } },
        ],
      ],
    },
    veilcaster: {
      name: 'Veilcaster', color: PAL.veilcaster,
      tiers: [
        [
          { id: 'veil_bolt', name: 'Veil Bolt', max: 3, type: 'active',
            desc: 'Magic projectile. +15% spell power per rank. Costs 8 MP.',
            icon: 'bolt', req: {} },
          { id: 'arcane_reserve', name: 'Arcane Reserve', max: 5, type: 'passive',
            desc: '+15 max MP per rank.',
            icon: 'crystal', req: {} },
          { id: 'hex', name: 'Hex', max: 1, type: 'active',
            desc: 'Curses an enemy: they deal 20% less dmg for 8s. Costs 15 MP.',
            icon: 'hex', req: {} },
        ],
        [
          { id: 'frost_bind', name: 'Frost Bind', max: 3, type: 'active',
            desc: 'Slows enemy 40%+10%/rank for 4s. Costs 18 MP.',
            icon: 'frost', req: { veil_bolt: 1, arcane_reserve: 2 } },
          { id: 'veil_shield', name: 'Veil Shield', max: 3, type: 'active',
            desc: 'Absorbs up to 20+15/rank dmg. Costs 20 MP.',
            icon: 'bubble', req: { arcane_reserve: 2 } },
          { id: 'memory_drain', name: 'Memory Drain', max: 2, type: 'active',
            desc: 'Siphons 10+5/rank MP from enemy on hit.',
            icon: 'drain', req: { hex: 1 } },
        ],
        [
          { id: 'unraveling', name: 'Unraveling Blast', max: 1, type: 'active',
            desc: 'Massive AoE. Deals 3x spell power. Costs 60 MP. 45s cooldown.',
            icon: 'explosion', req: { frost_bind: 2, veil_shield: 2 },
            educationGate: { subject: 'history', label: 'You must understand the Architects\' fall before channeling their greatest spell.' } },
          { id: 'echo_cast', name: 'Echo Cast', max: 3, type: 'passive',
            desc: '15%+5%/rank chance any spell casts twice for free.',
            icon: 'echo', req: { memory_drain: 1, frost_bind: 1 } },
        ],
      ],
    },
  };

  // ── Computed stats from base + gear + talents ─────────────────
  function computeStats(p) {
    const base = p.stats;
    const inv = p.inventory;
    const equip = p.equipped;
    const talents = p.talents;

    let weapon = ITEMS[equip.weapon] || ITEMS.fists;
    let armor  = ITEMS[equip.armor]  || ITEMS.peasant_shirt;
    let acc    = equip.accessory ? ITEMS[equip.accessory] : null;

    let maxHP = 50 + base.end * 8 + (p.level - 1) * 5;
    let maxMP = 20 + base.wil * 6 + (p.level - 1) * 3;
    let maxStamina = 100 + (base.end * 2);
    let atk = (weapon.stats?.atk || 3) + Math.floor(base.str * 0.6);
    let def = (armor.stats?.def || 0) + Math.floor(base.end * 0.4);
    let spellPower = (weapon.stats?.spellPower || 0) + base.wil * 2 + base.int;
    let speed = 1.0 + (base.agi - 5) * 0.02;
    let critChance = 0.05 + (base.agi - 5) * 0.005;
    let range = weapon.stats?.range || 1;

    // Accessory bonuses
    if (acc?.stats) {
      maxHP += acc.stats.maxHP || 0;
      maxMP += acc.stats.maxMP || 0;
      def   += acc.stats.def || 0;
    }

    // Talent: iron_skin
    const ironSkin = talents.iron_skin || 0;
    def += ironSkin * 4;

    // Talent: endurance
    const enduranceTalent = talents.endurance || 0;
    maxStamina += enduranceTalent * 10;

    // Talent: arcane_reserve
    const arcaneReserve = talents.arcane_reserve || 0;
    maxMP += arcaneReserve * 15;

    // Talent: eagle_eye
    const eagleEye = talents.eagle_eye || 0;
    range += eagleEye;
    critChance += eagleEye * 0.08;

    // Clamp speed
    speed = Math.max(0.4, Math.min(2.5, speed));

    return { maxHP, maxMP, maxStamina, atk, def, spellPower, speed, critChance, range,
      lifesteal: weapon.stats?.lifesteal || 0,
      mpCostMult: 1.0 + (acc?.stats?.mpCostMult || 0) + (weapon.stats?.mpCostMult || 0),
    };
  }

  // ── Player state ──────────────────────────────────────────────
  const state = {
    // Position in world (pixel coords, centered on tile)
    x: 0, y: 0,
    tx: 0, ty: 0,          // tile coords
    facing: 'down',        // 'up','down','left','right'
    moving: false,
    moveProgress: 0,       // 0..1 between tiles while moving
    fromX: 0, fromY: 0,    // previous tile
    toX: 0, toY: 0,        // target tile

    // Vitals
    hp: 100, mp: 20, stamina: 100,
    staminaRegen: 0,

    // Combat
    attackCooldown: 0,
    dodgeCooldown: 0,
    dodging: false,
    dodgeDir: null,
    statusEffects: [],     // [{ type, duration, stacks }]
    iframes: 0,            // invincibility frames after dodge/hit

    // Animation
    animFrame: 0,
    animTimer: 0,

    // Save data
    level: 1, xp: 0,
    stats: { str: 5, agi: 5, int: 5, end: 5, wil: 5 },
    statPoints: 0,
    talentPoints: 0,
    talents: {},
    inventory: [],
    equipped: { weapon: 'fists', armor: 'peasant_shirt', accessory: null },
    gold: 0,
    ammo: { arrow: 20, bolt: 0 },
    classChoice: null,
    profile: '',
    flags: {},
  };

  function loadFromSave(saveData) {
    const p = saveData.player;
    Object.assign(state, {
      level: p.level, xp: p.xp,
      stats: { ...p.stats },
      statPoints: p.statPoints,
      talentPoints: p.talentPoints,
      talents: { ...(p.talents || {}) },
      inventory: [...p.inventory],
      equipped: { ...p.equipped },
      gold: p.gold,
      ammo: { ...p.ammo },
      classChoice: saveData.classChoice,
      profile: saveData.profile,
      flags: { ...(saveData.flags || {}) },
    });
    const cs = computeStats(state);
    state.hp = p.hp ?? cs.maxHP;
    state.mp = p.mp ?? cs.maxMP;
    state.stamina = cs.maxStamina;
    state.tx = saveData.spawnPoint.tx;
    state.ty = saveData.spawnPoint.ty;
    state.x = state.tx;
    state.y = state.ty;
    state.toX = state.tx;
    state.toY = state.ty;
  }

  function toSaveData() {
    const cs = computeStats(state);
    return {
      level: state.level, xp: state.xp,
      hp: state.hp, mp: state.mp,
      stats: { ...state.stats },
      statPoints: state.statPoints,
      talentPoints: state.talentPoints,
      talents: { ...state.talents },
      inventory: [...state.inventory],
      equipped: { ...state.equipped },
      gold: state.gold,
      ammo: { ...state.ammo },
    };
  }

  // ── Inventory helpers ─────────────────────────────────────────
  function addItem(id, qty = 1) {
    const item = ITEMS[id];
    if (!item) return false;
    if (item.type === 'ammo' || item.stackable) {
      const slot = state.inventory.find(s => s.id === id);
      if (slot) slot.qty += qty;
      else state.inventory.push({ id, qty });
    } else {
      state.inventory.push({ id, qty: 1 });
    }
    return true;
  }

  function removeItem(id, qty = 1) {
    const slot = state.inventory.find(s => s.id === id);
    if (!slot || slot.qty < qty) return false;
    slot.qty -= qty;
    if (slot.qty <= 0) state.inventory = state.inventory.filter(s => s.id !== id);
    return true;
  }

  function hasItem(id) {
    return state.inventory.some(s => s.id === id && s.qty > 0);
  }

  // ── Combat helpers ────────────────────────────────────────────
  function heal(amount) {
    const cs = computeStats(state);
    state.hp = Math.min(cs.maxHP, state.hp + amount);
  }

  function restoreMP(amount) {
    const cs = computeStats(state);
    state.mp = Math.min(cs.maxMP, state.mp + amount);
  }

  function takeDamage(raw) {
    if (state.iframes > 0) return 0;
    const cs = computeStats(state);
    // Berserker passive
    const berserk = state.talents.berserker || 0;
    const hpPct = state.hp / cs.maxHP;
    const defMult = hpPct < 0.3 ? 1 : 1; // berserker is offense, not defense
    const dmg = Math.max(1, raw - cs.def);
    state.hp -= dmg;
    state.iframes = 40;
    return dmg;
  }

  function removeStatus(type) {
    state.statusEffects = state.statusEffects.filter(s => s.type !== type);
  }

  function addStatus(type, duration, stacks = 1) {
    const existing = state.statusEffects.find(s => s.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.stacks = Math.min((existing.stacks || 1) + stacks, 5);
    } else {
      state.statusEffects.push({ type, duration, stacks });
    }
  }

  // ── Level up ──────────────────────────────────────────────────
  function gainXP(amount) {
    state.xp += amount;
    let leveled = false;
    while (state.xp >= xpToNextLevel(state.level)) {
      state.xp -= xpToNextLevel(state.level);
      state.level++;
      state.statPoints += 3;
      state.talentPoints += 1;
      leveled = true;
      // Full heal on level up
      const cs = computeStats(state);
      state.hp = cs.maxHP;
      state.mp = cs.maxMP;
    }
    return leveled;
  }

  function spendStatPoint(stat) {
    if (state.statPoints <= 0) return false;
    if (!state.stats[stat]) return false;
    state.stats[stat]++;
    state.statPoints--;
    return true;
  }

  function spendTalentPoint(talentId) {
    if (state.talentPoints <= 0) return false;
    // Find the talent definition
    let talentDef = null;
    for (const tree of Object.values(TALENT_TREES)) {
      for (const tier of tree.tiers) {
        const t = tier.find(t => t.id === talentId);
        if (t) { talentDef = t; break; }
      }
      if (talentDef) break;
    }
    if (!talentDef) return false;
    const current = state.talents[talentId] || 0;
    if (current >= talentDef.max) return false;
    // Check reqs
    for (const [reqId, reqVal] of Object.entries(talentDef.req || {})) {
      if ((state.talents[reqId] || 0) < reqVal) return false;
    }
    // Check education gate
    if (talentDef.educationGate && !state.flags['edu_gate_' + talentId]) return false;
    state.talents[talentId] = current + 1;
    state.talentPoints--;
    return true;
  }

  // ── Movement ──────────────────────────────────────────────────
  const MOVE_TIME = 0.18; // seconds to cross one tile
  let moveTimer = 0;

  function update(dt) {
    const cs = computeStats(state);

    // Cooldowns
    if (state.attackCooldown > 0) state.attackCooldown -= dt;
    if (state.dodgeCooldown > 0) state.dodgeCooldown -= dt;
    if (state.iframes > 0) state.iframes -= 1;

    // Stamina regen
    state.staminaRegen += dt;
    if (state.staminaRegen >= 0.3) {
      state.staminaRegen = 0;
      if (!state.dodging) state.stamina = Math.min(cs.maxStamina, state.stamina + 3);
    }

    // Status effect ticks
    state.statusEffects = state.statusEffects.filter(s => {
      s.duration -= dt;
      if (s.type === 'poison' && s.duration % 1 < dt) {
        state.hp = Math.max(1, state.hp - (s.stacks || 1));
      }
      return s.duration > 0;
    });

    // Movement interpolation
    if (state.moving) {
      moveTimer += dt;
      state.moveProgress = Math.min(1, moveTimer / (MOVE_TIME / cs.speed));
      state.x = state.fromX + (state.toX - state.fromX) * state.moveProgress;
      state.y = state.fromY + (state.toY - state.fromY) * state.moveProgress;
      if (state.moveProgress >= 1) {
        state.tx = state.toX;
        state.ty = state.toY;
        state.x = state.toX;
        state.y = state.toY;
        state.moving = false;
        state.moveProgress = 0;
      }
    }

    // Animation
    state.animTimer += dt;
    if (state.animTimer > 0.18) {
      state.animTimer = 0;
      state.animFrame = (state.animFrame + 1) % 2;
    }
  }

  function tryMove(dx, dy) {
    if (state.moving) return false;
    const ntx = state.tx + dx;
    const nty = state.ty + dy;
    if (!World.isWalkable(ntx, nty)) return false;
    state.fromX = state.tx; state.fromY = state.ty;
    state.toX = ntx; state.toY = nty;
    state.moving = true;
    state.moveProgress = 0;
    moveTimer = 0;
    if (dx > 0) state.facing = 'right';
    else if (dx < 0) state.facing = 'left';
    else if (dy > 0) state.facing = 'down';
    else if (dy < 0) state.facing = 'up';
    return true;
  }

  function getFacingTile() {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[state.facing];
    return { tx: state.tx + dx, ty: state.ty + dy };
  }

  // ── Drawing ───────────────────────────────────────────────────
  function draw(ctx, camX, camY, tileSize) {
    const px = state.x * tileSize - camX + tileSize * 0.5;
    const py = state.y * tileSize - camY + tileSize * 0.5;
    const s = tileSize;
    const frame = state.animFrame;
    const classColors = {
      ironclad: PAL.ironclad,
      ashwalker: PAL.ashwalker,
      veilcaster: PAL.veilcaster,
    };
    const classColor = classColors[state.classChoice] || '#888';

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + s*0.38, s*0.28, s*0.1, 0, 0, Math.PI*2);
    ctx.fill();

    // Body lean by facing
    let bx = px, by = py;
    if (state.moving) {
      if (state.facing === 'left' || state.facing === 'right') {
        by += frame === 0 ? -2 : 2;
      } else {
        bx += frame === 0 ? -1 : 1;
      }
    }

    // Legs
    ctx.fillStyle = '#2c2c3a';
    if (state.facing === 'down' || state.facing === 'up') {
      const legOff = state.moving ? (frame === 0 ? -s*0.08 : s*0.08) : 0;
      ctx.fillRect(bx - s*0.13 + legOff, by + s*0.18, s*0.12, s*0.22);
      ctx.fillRect(bx + s*0.01 - legOff, by + s*0.18, s*0.12, s*0.22);
    } else {
      ctx.fillRect(bx - s*0.12, by + s*0.18, s*0.12, s*0.22);
      ctx.fillRect(bx + s*0.0, by + s*0.18, s*0.12, s*0.22);
    }

    // Cloak/body
    ctx.fillStyle = classColor;
    ctx.fillRect(bx - s*0.2, by - s*0.12, s*0.4, s*0.35);

    // Dodge flash
    if (state.iframes > 0 && state.iframes % 6 < 3) {
      ctx.globalAlpha = 0.4;
    }

    // Arms
    ctx.fillStyle = classColor;
    const armSwing = state.moving ? (frame === 0 ? -s*0.06 : s*0.06) : 0;
    if (state.facing !== 'right') ctx.fillRect(bx - s*0.32, by - s*0.08 + armSwing, s*0.13, s*0.26);
    if (state.facing !== 'left')  ctx.fillRect(bx + s*0.19, by - s*0.08 - armSwing, s*0.13, s*0.26);

    // Head
    ctx.fillStyle = PAL.skinLight;
    ctx.beginPath();
    ctx.arc(bx, by - s*0.2, s*0.18, 0, Math.PI*2);
    ctx.fill();

    // Hair
    ctx.fillStyle = PAL.hair;
    ctx.fillRect(bx - s*0.18, by - s*0.38, s*0.36, s*0.14);

    // Eyes (facing dependent)
    ctx.fillStyle = '#222';
    if (state.facing === 'down') {
      ctx.fillRect(bx - s*0.08, by - s*0.22, s*0.05, s*0.05);
      ctx.fillRect(bx + s*0.03, by - s*0.22, s*0.05, s*0.05);
    } else if (state.facing === 'up') {
      // show back of head
    } else if (state.facing === 'right') {
      ctx.fillRect(bx + s*0.06, by - s*0.22, s*0.06, s*0.05);
    } else {
      ctx.fillRect(bx - s*0.12, by - s*0.22, s*0.06, s*0.05);
    }

    // Status effect indicators
    if (state.statusEffects.length > 0) {
      state.statusEffects.forEach((s_eff, i) => {
        const colors = { poison: '#27ae60', burn: '#e74c3c', venom: '#8e44ad', slow: '#2980b9' };
        ctx.fillStyle = colors[s_eff.type] || '#888';
        ctx.beginPath();
        ctx.arc(bx - s*0.25 + i*8, by - s*0.5, 3, 0, Math.PI*2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  return {
    state,
    computeStats,
    loadFromSave,
    toSaveData,
    update,
    tryMove,
    getFacingTile,
    gainXP,
    spendStatPoint,
    spendTalentPoint,
    addItem,
    removeItem,
    hasItem,
    heal,
    restoreMP,
    takeDamage,
    removeStatus,
    addStatus,
    draw,
    xpToNextLevel,
    TALENT_TREES,
  };
})();
