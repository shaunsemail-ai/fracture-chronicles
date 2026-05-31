// Crafting system — campfire recipes, timing mechanic, active buffs
const Crafting = (() => {

  // ── Recipe definitions ────────────────────────────────────────
  // ingredients: [{ id, qty }]
  // output: { id, qty }
  // bonusOutput: applied on perfect timing — { type: 'double_qty' | 'bonus_duration' | 'bonus_restore', value }
  const RECIPES = [
    {
      id: 'recipe_heal_minor',
      name: 'Healing Potion',
      desc: 'Restores 40 HP.',
      ingredients: [{ id: 'herb_minor', qty: 2 }],
      output: { id: 'heal_potion_minor', qty: 1 },
      bonus: { type: 'double_qty', label: '+1 extra' },
      category: 'potion',
    },
    {
      id: 'recipe_heal_major',
      name: 'Strong Healing Potion',
      desc: 'Restores 90 HP.',
      ingredients: [{ id: 'herb_major', qty: 2 }, { id: 'herb_minor', qty: 1 }],
      output: { id: 'heal_potion_major', qty: 1 },
      bonus: { type: 'bonus_restore', label: '+50% more HP' },
      category: 'potion',
    },
    {
      id: 'recipe_mp_restore',
      name: 'Mana Tincture',
      desc: 'Restores 50 MP.',
      ingredients: [{ id: 'veil_shard', qty: 2 } ],
      output: { id: 'mp_potion', qty: 1 },
      bonus: { type: 'bonus_restore', label: '+50% more MP' },
      category: 'potion',
    },
    {
      id: 'recipe_antidote',
      name: 'Antidote',
      desc: 'Clears poison and venom.',
      ingredients: [{ id: 'herb_minor', qty: 1 }, { id: 'antidote', qty: 1 }],
      output: { id: 'antidote', qty: 2 },
      bonus: { type: 'double_qty', label: '+2 extra' },
      category: 'potion',
    },
    {
      id: 'recipe_hunters_brew',
      name: "Hunter's Brew",
      desc: 'ATK +20% for 60s.',
      ingredients: [{ id: 'herb_minor', qty: 2 }, { id: 'herb_major', qty: 1 }],
      output: { id: 'hunters_brew', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_focus_tea',
      name: 'Focus Tea',
      desc: 'Spell Power +25% for 60s.',
      ingredients: [{ id: 'veil_shard', qty: 1 }, { id: 'herb_minor', qty: 2 }],
      output: { id: 'focus_tea', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_iron_draught',
      name: 'Iron Draught',
      desc: 'DEF +15 for 90s.',
      ingredients: [{ id: 'herb_major', qty: 1 }, { id: 'herb_minor', qty: 1 }],
      output: { id: 'iron_draught', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_swift_step',
      name: 'Swift Step',
      desc: 'Speed +30% for 45s.',
      ingredients: [{ id: 'herb_minor', qty: 3 }],
      output: { id: 'swift_step', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_regen_tincture',
      name: 'Restored Tincture',
      desc: 'Restores 80 HP over 30s.',
      ingredients: [{ id: 'herb_major', qty: 2 }],
      output: { id: 'restored_tincture', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_mp_regen',
      name: 'Purified Veil',
      desc: 'Restores 50 MP over 20s.',
      ingredients: [{ id: 'veil_shard', qty: 2 }, { id: 'herb_minor', qty: 1 }],
      output: { id: 'purified_veil', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_battle_ration',
      name: 'Battle Ration',
      desc: 'Restores 25 HP and 15 Stamina.',
      ingredients: [{ id: 'herb_minor', qty: 1 }],
      output: { id: 'battle_ration', qty: 2 },
      bonus: { type: 'double_qty', label: '+2 extra' },
      category: 'potion',
    },
    {
      id: 'recipe_fire_arrow',
      name: 'Fire Arrows',
      desc: 'Arrows that burn on impact.',
      ingredients: [{ id: 'arrow', qty: 5 }, { id: 'herb_minor', qty: 1 }],
      output: { id: 'fire_arrow', qty: 5 },
      bonus: { type: 'double_qty', label: '+5 extra' },
      category: 'ammo',
    },
    {
      id: 'recipe_camp_remedy',
      name: 'Camp Remedy',
      desc: 'Clears all status effects.',
      ingredients: [{ id: 'antidote', qty: 1 }, { id: 'herb_minor', qty: 1 }],
      output: { id: 'camp_remedy', qty: 1 },
      bonus: { type: 'double_qty', label: '+1 extra' },
      category: 'potion',
    },
    {
      id: 'recipe_boss_prep',
      name: 'Warden Compound',
      desc: 'ATK and DEF +15% for 120s. Boss prep.',
      ingredients: [{ id: 'herb_major', qty: 2 }, { id: 'veil_shard', qty: 1 }, { id: 'herb_minor', qty: 2 }],
      output: { id: 'warden_compound', qty: 1 },
      bonus: { type: 'bonus_duration', label: 'Double duration' },
      category: 'buff',
    },
    {
      id: 'recipe_sentinel_brew',
      name: 'Sentinel Elixir',
      desc: 'Full HP and MP restore. Uses sentinel materials.',
      ingredients: [{ id: 'sentinel_shard', qty: 1 }, { id: 'herb_major', qty: 2 }],
      output: { id: 'architects_resin', qty: 1 },
      bonus: { type: 'double_qty', label: '+1 extra' },
      category: 'special',
      requireFlag: 'sentinel_killed',
    },
  ];

  // ── Buff definitions ──────────────────────────────────────────
  // Applied effects on use, stored in Player.state.activeBuffs
  const BUFF_DEFS = {
    atk_boost: { name: 'ATK Up', abbr: 'ATK+', color: PAL.ironclad, icon: 'sword' },
    def_boost: { name: 'DEF Up', abbr: 'DEF+', color: '#5dade2', icon: 'shield' },
    speed_boost: { name: 'Swift', abbr: 'SPD+', color: PAL.ashwalker, icon: 'boot' },
    spell_boost: { name: 'Focus', abbr: 'FOC+', color: PAL.veilcaster, icon: 'orb' },
    hp_regen: { name: 'Regen', abbr: 'REGEN', color: PAL.hpFill, icon: 'heart' },
    mp_regen: { name: 'Clarity', abbr: 'MP+', color: PAL.mpFill, icon: 'crystal' },
    atk_def_boost: { name: 'Warden', abbr: 'WARD', color: PAL.xpFill, icon: 'crown' },
  };

  // ── Craft state ───────────────────────────────────────────────
  let craftState = null;
  // craftState = {
  //   phase: 'select' | 'timing' | 'done',
  //   selectedRecipe: 0,
  //   sweepPos: 0,       // 0..1 position of timing bar sweep
  //   sweepDir: 1,       // 1 = right, never reverses (linear sweep left→right)
  //   sweepTime: 0,      // accumulated time
  //   sweepDuration: 2.0, // full sweep takes 2s
  //   result: null,      // 'perfect' | 'good' | 'miss'
  //   resultTimer: 0,
  //   particleBurst: [],
  // }

  function canCraft(recipe) {
    if (!recipe) return false;
    if (recipe.requireFlag && !Player.state.flags[recipe.requireFlag]) return false;
    for (const ing of recipe.ingredients) {
      const slot = Player.state.inventory.find(s => s.id === ing.id);
      const ammoSlot = Player.state.ammo?.[ing.id];
      const have = (slot?.qty || 0) + (ammoSlot || 0);
      if (have < ing.qty) return false;
    }
    return true;
  }

  function getVisibleRecipes() {
    return RECIPES.filter(r => {
      if (r.requireFlag && !Player.state.flags[r.requireFlag]) return false;
      return true;
    });
  }

  function startCraft() {
    craftState = {
      phase: 'select',
      selectedRecipe: 0,
      sweepPos: 0,
      sweepDir: 1,
      sweepTime: 0,
      sweepDuration: 2.0,
      result: null,
      resultTimer: 0,
      particleBurst: [],
    };
    return craftState;
  }

  function closeCraft() {
    craftState = null;
  }

  function selectRecipe(dir) {
    if (!craftState || craftState.phase !== 'select') return;
    const recipes = getVisibleRecipes();
    craftState.selectedRecipe = (craftState.selectedRecipe + dir + recipes.length) % recipes.length;
  }

  function beginTiming() {
    if (!craftState || craftState.phase !== 'select') return false;
    const recipes = getVisibleRecipes();
    const recipe = recipes[craftState.selectedRecipe];
    if (!canCraft(recipe)) return false;
    craftState.phase = 'timing';
    craftState.sweepPos = 0;
    craftState.sweepTime = 0;
    return true;
  }

  // Called when player hits action during timing phase
  function strike() {
    if (!craftState || craftState.phase !== 'timing') return;
    const pos = craftState.sweepPos;

    // Zones: 0..0.2 = miss, 0.2..0.35 = good (left wing), 0.35..0.65 = perfect (gold),
    //        0.65..0.8 = good (right wing), 0.8..1.0 = miss
    let result = 'miss';
    if (pos >= 0.35 && pos <= 0.65) result = 'perfect';
    else if ((pos >= 0.2 && pos < 0.35) || (pos > 0.65 && pos <= 0.8)) result = 'good';

    craftState.result = result;
    craftState.phase = 'done';
    craftState.resultTimer = 1.5;

    const recipes = getVisibleRecipes();
    const recipe = recipes[craftState.selectedRecipe];

    if (result === 'miss') {
      // Lose one ingredient (first one in list)
      const ing = recipe.ingredients[0];
      const slot = Player.state.inventory.find(s => s.id === ing.id);
      if (slot) {
        slot.qty--;
        if (slot.qty <= 0) Player.state.inventory = Player.state.inventory.filter(s => s.id !== ing.id);
      }
      // Particle burst: red
      spawnCraftParticles('#c0392b');
    } else {
      // Consume all ingredients
      for (const ing of recipe.ingredients) {
        consumeIngredient(ing.id, ing.qty);
      }

      let outQty = recipe.output.qty;
      let bonusApplied = false;

      if (result === 'perfect' && recipe.bonus) {
        if (recipe.bonus.type === 'double_qty') {
          outQty *= 2;
          bonusApplied = true;
        } else if (recipe.bonus.type === 'bonus_duration') {
          bonusApplied = true; // handled in item use
          Player.state.flags['__craft_bonus_' + recipe.output.id] = true;
        } else if (recipe.bonus.type === 'bonus_restore') {
          bonusApplied = true;
          Player.state.flags['__craft_bonus_' + recipe.output.id] = true;
        }
      }

      // Add items
      if (recipe.output.id === 'fire_arrow') {
        Player.state.ammo = Player.state.ammo || {};
        Player.state.ammo.fire_arrow = (Player.state.ammo.fire_arrow || 0) + outQty;
      } else {
        Player.addItem(recipe.output.id, outQty);
      }

      // Grant quest flag
      if (!Player.state.flags.crafted_first_item) {
        Player.state.flags.crafted_first_item = true;
      }

      // Particle burst: gold for perfect, green for good
      spawnCraftParticles(result === 'perfect' ? '#d4ac0d' : '#27ae60');
    }
  }

  function consumeIngredient(id, qty) {
    // Check inventory first
    const slot = Player.state.inventory.find(s => s.id === id);
    if (slot) {
      const take = Math.min(slot.qty, qty);
      slot.qty -= take;
      qty -= take;
      if (slot.qty <= 0) Player.state.inventory = Player.state.inventory.filter(s => s.id !== id);
    }
    // Check ammo
    if (qty > 0 && Player.state.ammo?.[id]) {
      Player.state.ammo[id] = Math.max(0, (Player.state.ammo[id] || 0) - qty);
    }
  }

  function spawnCraftParticles(color) {
    if (!craftState) return;
    craftState.particleBurst = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      craftState.particleBurst.push({
        x: 0.5, y: 0.5,
        vx: Math.cos(angle) * (0.5 + Math.random() * 0.5),
        vy: Math.sin(angle) * (0.5 + Math.random() * 0.5),
        color,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
        size: 3 + Math.random() * 4,
      });
    }
  }

  // ── Active buff management ─────────────────────────────────────
  function getActiveBuffs() {
    return Player.state.activeBuffs || [];
  }

  function addBuff(type, duration, magnitude) {
    if (!Player.state.activeBuffs) Player.state.activeBuffs = [];
    const existing = Player.state.activeBuffs.find(b => b.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.magnitude = Math.max(existing.magnitude, magnitude);
    } else {
      Player.state.activeBuffs.push({ type, duration, maxDuration: duration, magnitude });
    }
  }

  function tickBuffs(dt) {
    if (!Player.state.activeBuffs) return;
    const cs = Player.computeStats(Player.state);
    Player.state.activeBuffs = Player.state.activeBuffs.filter(b => {
      b.duration -= dt;
      // HP regen tick
      if (b.type === 'hp_regen') {
        b.regenAccum = (b.regenAccum || 0) + dt;
        const tickRate = b.magnitude / 30; // hp per second
        const healed = tickRate * dt;
        b.regenAccum -= healed;
        Player.state.hp = Math.min(cs.maxHP, Player.state.hp + healed);
      }
      // MP regen tick
      if (b.type === 'mp_regen') {
        const mpRate = b.magnitude / 20;
        Player.state.mp = Math.min(cs.maxMP, Player.state.mp + mpRate * dt);
      }
      return b.duration > 0;
    });
  }

  // Returns flat modifier object: { atkMult, defFlat, speedMult, spellMult }
  function applyBuffs(baseStats) {
    if (!Player.state.activeBuffs) return baseStats;
    let atkMult = 1.0, defFlat = 0, speedMult = 1.0, spellMult = 1.0;
    for (const b of Player.state.activeBuffs) {
      switch (b.type) {
        case 'atk_boost':     atkMult   += b.magnitude; break;
        case 'def_boost':     defFlat   += b.magnitude; break;
        case 'speed_boost':   speedMult += b.magnitude; break;
        case 'spell_boost':   spellMult += b.magnitude; break;
        case 'atk_def_boost': atkMult += b.magnitude; defFlat += b.magnitude * 50; break;
      }
    }
    return {
      ...baseStats,
      atk:        Math.floor(baseStats.atk * atkMult),
      def:        baseStats.def + defFlat,
      speed:      Math.min(2.5, baseStats.speed * speedMult),
      spellPower: Math.floor(baseStats.spellPower * spellMult),
    };
  }

  // ── Campfire draw (animated) ──────────────────────────────────
  function drawCampfire(ctx, px, py, size) {
    const t = Date.now() * 0.001;
    const flicker = Math.sin(t * 7.3) * 0.15 + Math.sin(t * 11.1) * 0.1;

    // Stone ring
    ctx.fillStyle = '#3a3530';
    ctx.beginPath();
    ctx.arc(px + size * 0.5, py + size * 0.65, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Embers / coals
    ctx.fillStyle = '#5a2a0a';
    ctx.beginPath();
    ctx.ellipse(px + size * 0.5, py + size * 0.68, size * 0.22, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flame outer (orange)
    ctx.save();
    ctx.globalAlpha = 0.85 + flicker;
    ctx.fillStyle = '#d45010';
    ctx.beginPath();
    ctx.moveTo(px + size * 0.5, py + size * 0.2);
    ctx.bezierCurveTo(
      px + size * 0.3, py + size * 0.45,
      px + size * 0.25, py + size * 0.6,
      px + size * 0.5, py + size * 0.65
    );
    ctx.bezierCurveTo(
      px + size * 0.75, py + size * 0.6,
      px + size * 0.7, py + size * 0.45,
      px + size * 0.5, py + size * 0.2
    );
    ctx.fill();

    // Flame inner (yellow)
    ctx.fillStyle = '#e8a010';
    ctx.globalAlpha = 0.9 + flicker * 0.5;
    ctx.beginPath();
    ctx.moveTo(px + size * 0.5, py + size * 0.3 + flicker * size * 0.1);
    ctx.bezierCurveTo(
      px + size * 0.38, py + size * 0.5,
      px + size * 0.36, py + size * 0.6,
      px + size * 0.5, py + size * 0.63
    );
    ctx.bezierCurveTo(
      px + size * 0.64, py + size * 0.6,
      px + size * 0.62, py + size * 0.5,
      px + size * 0.5, py + size * 0.3 + flicker * size * 0.1
    );
    ctx.fill();

    // Flame core (white/pale yellow)
    ctx.fillStyle = '#f0d060';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(px + size * 0.5, py + size * 0.55, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Glow
    const grad = ctx.createRadialGradient(
      px + size * 0.5, py + size * 0.5, 0,
      px + size * 0.5, py + size * 0.5, size * 0.8
    );
    grad.addColorStop(0, 'rgba(210,100,20,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha = 0.6 + flicker * 0.4;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px + size * 0.5, py + size * 0.5, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Update ────────────────────────────────────────────────────
  function update(dt) {
    tickBuffs(dt);

    if (!craftState) return;

    if (craftState.phase === 'timing') {
      craftState.sweepTime += dt;
      craftState.sweepPos = (craftState.sweepTime / craftState.sweepDuration) % 1.0;
      // Auto-miss if sweep completes without strike
      if (craftState.sweepTime >= craftState.sweepDuration) {
        craftState.result = 'miss';
        craftState.phase = 'done';
        craftState.resultTimer = 1.5;
      }
    }

    if (craftState.phase === 'done') {
      craftState.resultTimer -= dt;

      // Update particles
      if (craftState.particleBurst) {
        craftState.particleBurst = craftState.particleBurst.filter(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 1 * dt;
          p.life -= dt;
          return p.life > 0;
        });
      }

      if (craftState.resultTimer <= 0) {
        // Return to select
        craftState.phase = 'select';
        craftState.result = null;
        craftState.particleBurst = [];
      }
    }
  }

  // ── Draw crafting UI ─────────────────────────────────────────
  function draw(ctx, W, H) {
    if (!craftState) return;

    const panelW = Math.min(520, W - 40);
    const panelH = Math.min(400, H - 80);
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    // Background panel
    ctx.save();
    ctx.globalAlpha = 0.97;
    ctx.fillStyle = PAL.uiBg;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.strokeStyle = PAL.uiBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = PAL.xpFill;
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CAMPFIRE CRAFTING', W / 2, panelY + 20);
    ctx.restore();

    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(panelX + 10, panelY + 32, panelW - 20, 1);

    const recipes = getVisibleRecipes();
    const listX = panelX + 10;
    const listW = panelW * 0.45;
    const detailX = panelX + listW + 20;
    const detailW = panelW - listW - 30;
    const startY = panelY + 42;
    const itemH = 28;
    const maxVisible = Math.floor((panelH - 120) / itemH);
    const visStart = Math.max(0, craftState.selectedRecipe - Math.floor(maxVisible / 2));

    // Recipe list (left)
    recipes.slice(visStart, visStart + maxVisible).forEach((r, i) => {
      const idx = i + visStart;
      const iy = startY + i * itemH;
      const sel = idx === craftState.selectedRecipe;
      const craftable = canCraft(r);

      if (sel) {
        ctx.fillStyle = 'rgba(60,80,40,0.4)';
        ctx.beginPath();
        ctx.roundRect(listX - 2, iy - 2, listW + 4, itemH - 2, 4);
        ctx.fill();
        ctx.strokeStyle = craftable ? '#27ae60' : '#c0392b';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.save();
      ctx.fillStyle = craftable ? (sel ? PAL.textHi : PAL.text) : PAL.textDim;
      ctx.font = (sel ? 'bold ' : '') + '11px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.name, listX + 6, iy + itemH / 2 - 2);
      ctx.restore();
    });

    // Divider
    ctx.fillStyle = PAL.uiBorder;
    ctx.fillRect(panelX + listW + 10, panelY + 36, 1, panelH - 50);

    // Recipe detail (right)
    const selRecipe = recipes[craftState.selectedRecipe];
    if (selRecipe) {
      ctx.save();
      ctx.fillStyle = PAL.textHi;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(selRecipe.name, detailX, startY);

      ctx.fillStyle = PAL.text;
      ctx.font = '10px "Courier New", monospace';
      ctx.fillText(selRecipe.desc, detailX, startY + 18);

      // Ingredients
      ctx.fillStyle = PAL.textDim;
      ctx.fillText('Ingredients:', detailX, startY + 38);

      selRecipe.ingredients.forEach((ing, i) => {
        const item = ITEMS[ing.id];
        const have = (Player.state.inventory.find(s => s.id === ing.id)?.qty || 0) +
                     (Player.state.ammo?.[ing.id] || 0);
        const ok = have >= ing.qty;
        ctx.fillStyle = ok ? PAL.textGreen : PAL.textRed;
        ctx.fillText(
          `${item?.name || ing.id} x${ing.qty} (have ${have})`,
          detailX + 8, startY + 56 + i * 16
        );
      });

      // Output
      const outItem = ITEMS[selRecipe.output.id];
      ctx.fillStyle = PAL.textGold;
      ctx.fillText(
        `Makes: ${outItem?.name || selRecipe.output.id} x${selRecipe.output.qty}`,
        detailX, startY + 56 + selRecipe.ingredients.length * 16 + 8
      );

      // Bonus hint
      if (selRecipe.bonus) {
        ctx.fillStyle = '#d4ac0d';
        ctx.fillText(`Perfect: ${selRecipe.bonus.label}`, detailX, startY + 56 + selRecipe.ingredients.length * 16 + 26);
      }

      ctx.restore();

      // Action prompt
      const craftable = canCraft(selRecipe);
      ctx.save();
      ctx.fillStyle = craftable ? PAL.textGreen : PAL.textDim;
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (craftState.phase === 'select') {
        ctx.fillText(craftable ? '[A] Craft  [B] Close  [Up/Down] Select' : '[No materials]  [B] Close', W / 2, panelY + panelH - 30);
      }
    }

    // ── Timing bar ─────────────────────────────────────────────
    if (craftState.phase === 'timing' || craftState.phase === 'done') {
      const barX = panelX + 20;
      const barY = panelY + panelH - 80;
      const barW = panelW - 40;
      const barH = 22;

      // Label
      ctx.save();
      ctx.fillStyle = PAL.textHi;
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (craftState.phase === 'timing') ctx.fillText('STRIKE! (Press A)', W / 2, barY - 12);
      ctx.restore();

      // Bar background
      ctx.fillStyle = '#1a1a14';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();
      ctx.strokeStyle = PAL.uiBorder;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Miss zones (red)
      ctx.fillStyle = 'rgba(192,57,43,0.5)';
      ctx.fillRect(barX + 1, barY + 1, barW * 0.2 - 1, barH - 2);
      ctx.fillRect(barX + barW * 0.8, barY + 1, barW * 0.2 - 1, barH - 2);

      // Good zones (green)
      ctx.fillStyle = 'rgba(39,174,96,0.5)';
      ctx.fillRect(barX + barW * 0.2, barY + 1, barW * 0.15 - 1, barH - 2);
      ctx.fillRect(barX + barW * 0.65, barY + 1, barW * 0.15 - 1, barH - 2);

      // Perfect zone (gold)
      ctx.fillStyle = 'rgba(212,172,13,0.6)';
      ctx.fillRect(barX + barW * 0.35, barY + 1, barW * 0.3 - 1, barH - 2);

      // Zone labels
      ctx.save();
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c0392b';
      ctx.fillText('MISS', barX + barW * 0.1, barY + barH / 2);
      ctx.fillText('MISS', barX + barW * 0.9, barY + barH / 2);
      ctx.fillStyle = PAL.textGreen;
      ctx.fillText('OK', barX + barW * 0.275, barY + barH / 2);
      ctx.fillText('OK', barX + barW * 0.725, barY + barH / 2);
      ctx.fillStyle = PAL.xpFill;
      ctx.fillText('PERFECT', barX + barW * 0.5, barY + barH / 2);
      ctx.restore();

      // Sweep indicator
      if (craftState.phase === 'timing') {
        const sx = barX + craftState.sweepPos * barW;
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx - 2, barY - 3, 4, barH + 6);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(sx - 6, barY, 12, barH);
      }

      // Result overlay
      if (craftState.result) {
        const resultColors = { perfect: PAL.xpFill, good: PAL.textGreen, miss: PAL.textRed };
        const resultLabels = { perfect: 'PERFECT!', good: 'CRAFTED!', miss: 'FAILED' };
        ctx.save();
        ctx.globalAlpha = Math.min(1, craftState.resultTimer);
        ctx.fillStyle = resultColors[craftState.result];
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(resultLabels[craftState.result], W / 2, barY - 28);
        ctx.restore();
      }

      // Particle burst (in bar area)
      for (const p of (craftState.particleBurst || [])) {
        const px = barX + barW * 0.5 + (p.x - 0.5) * barW;
        const py = barY + barH * 0.5 + (p.y - 0.5) * 60;
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // ── Buff bar draw (called from HUD) ──────────────────────────
  function drawBuffBar(ctx, W, H, buffs) {
    if (!buffs || buffs.length === 0) return;

    const iconSize = 32;
    const gap = 4;
    const totalW = buffs.length * (iconSize + gap);
    const startX = (W - totalW) / 2;
    const by = 80; // below HP/MP bars

    buffs.forEach((buff, i) => {
      const def = BUFF_DEFS[buff.type];
      if (!def) return;
      const bx = startX + i * (iconSize + gap);
      const progress = buff.duration / buff.maxDuration;

      // Circle background
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = PAL.uiBg;
      ctx.beginPath();
      ctx.arc(bx + iconSize / 2, by + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Countdown arc (like a clock winding down)
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(bx + iconSize / 2, by + iconSize / 2, iconSize / 2 - 2,
        -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();

      // Buff abbreviation
      ctx.globalAlpha = 1;
      ctx.fillStyle = def.color;
      ctx.font = `bold 8px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.abbr, bx + iconSize / 2, by + iconSize / 2);

      // Countdown timer (small text below)
      ctx.fillStyle = PAL.textDim;
      ctx.font = '7px "Courier New", monospace';
      ctx.fillText(Math.ceil(buff.duration) + 's', bx + iconSize / 2, by + iconSize + 6);

      ctx.restore();
    });
  }

  return {
    RECIPES,
    BUFF_DEFS,
    startCraft,
    closeCraft,
    selectRecipe,
    beginTiming,
    strike,
    canCraft,
    getVisibleRecipes,
    addBuff,
    tickBuffs,
    applyBuffs,
    getActiveBuffs,
    drawCampfire,
    drawBuffBar,
    update,
    draw,
    get craftState() { return craftState; },
  };
})();
