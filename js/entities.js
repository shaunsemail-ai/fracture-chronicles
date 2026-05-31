// Enemies and NPCs
const Entities = (() => {

  // ── Enemy type definitions ────────────────────────────────────
  const ENEMY_TYPES = {
    hollow_walker: {
      name: 'Hollow Walker',
      maxHP: 30, atk: 6, def: 1, spd: 0.7,
      xp: 15, detectRange: 5, chaseRange: 8,
      attackRange: 1.2, attackCooldown: 1.2,
      dropTable: 'hollow_walker',
      drawColor: PAL.hollowSkin,
      eyeColor: PAL.hollowEye,
      size: 0.85,
      lore: 'They move wrong. Too deliberate. Like they\'re remembering how.',
    },
    hollow_brute: {
      name: 'Hollow Brute',
      maxHP: 80, atk: 14, def: 4, spd: 0.5,
      xp: 45, detectRange: 4, chaseRange: 7,
      attackRange: 1.4, attackCooldown: 2.0,
      dropTable: 'hollow_brute',
      drawColor: PAL.hollowBrute,
      eyeColor: PAL.hollowEye,
      size: 1.3,
      lore: 'Something changed this one. It used to be larger, maybe. Or smaller.',
    },
    shade: {
      name: 'Shade',
      maxHP: 20, atk: 10, def: 0, spd: 1.0,
      xp: 25, detectRange: 6, chaseRange: 10,
      attackRange: 1.0, attackCooldown: 0.9,
      dropTable: 'shade',
      drawColor: PAL.shade,
      eyeColor: PAL.shadeGlow,
      size: 0.75,
      phaseThrough: false, // they do NOT phase through walls — that would be too annoying
      lore: 'Not Hollow. Something else. Colder.',
    },
    ember_crawler: {
      name: 'Ember Crawler',
      maxHP: 15, atk: 5, def: 0, spd: 0.9,
      xp: 10, detectRange: 3, chaseRange: 5,
      attackRange: 1.0, attackCooldown: 0.8,
      dropTable: 'ember_crawler',
      drawColor: PAL.ember,
      eyeColor: '#ffaa00',
      size: 0.6,
      onContact: { type: 'burn', chance: 0.3, duration: 4 },
      lore: 'They nest in the ash. They might have been insects once.',
    },
    hollow_sentinel: {
      name: 'Hollow Sentinel',
      maxHP: 120, atk: 18, def: 8, spd: 0.45,
      xp: 90, detectRange: 6, chaseRange: 8,
      attackRange: 1.5, attackCooldown: 2.5,
      dropTable: 'hollow_brute',
      drawColor: '#3a4a35',
      eyeColor: '#00ffcc',
      size: 1.5,
      boss: true,
      lore: 'It wears a guard\'s armor. The crest is Ashfen\'s.',
    },
  };

  // ── Active entity lists ───────────────────────────────────────
  let enemies = [];
  let npcs = [];
  let projectiles = [];
  let particles = [];
  let floatingTexts = [];

  // ── Enemy spawn ───────────────────────────────────────────────
  function spawnFromZone(zone, savedKills = {}) {
    enemies = [];
    npcs = [];
    if (!zone) return;

    for (const spawn of (zone.enemySpawns || [])) {
      if (savedKills[spawn.type + '_' + spawn.tx + '_' + spawn.ty]) continue;
      const def = ENEMY_TYPES[spawn.type];
      if (!def) continue;
      enemies.push(createEnemy(spawn.type, spawn.tx, spawn.ty, spawn.patrol || null));
    }

    for (const npcDef of (zone.npcs || [])) {
      npcs.push({ ...npcDef, x: npcDef.tx, y: npcDef.ty });
    }
  }

  function createEnemy(type, tx, ty, patrol = null) {
    const def = ENEMY_TYPES[type];
    return {
      id: type + '_' + tx + '_' + ty,
      type, name: def.name,
      tx, ty, x: tx, y: ty,
      fromX: tx, fromY: ty, toX: tx, toY: ty,
      moving: false, moveProgress: 0, moveTimer: 0,
      hp: def.maxHP, maxHP: def.maxHP,
      atk: def.atk, def: def.def, spd: def.spd,
      xp: def.xp,
      facing: 'down',
      state: 'patrol',      // patrol | chase | attack | dead | stun | flee
      stunTimer: 0,
      attackCooldown: 0,
      patrol: patrol ? [...patrol] : [[tx, ty]],
      patrolIndex: 0,
      patrolTimer: 0,
      aggroTimer: 0,        // how long they chase after losing sight
      def_ref: def,
      animFrame: 0, animTimer: 0,
      statusEffects: [],
    };
  }

  // ── AI ────────────────────────────────────────────────────────
  const ENEMY_MOVE_TIME = 0.22;

  function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function stepToward(enemy, tx, ty) {
    if (enemy.moving) return;
    const dx = tx - enemy.tx;
    const dy = ty - enemy.ty;
    let mx = 0, my = 0;
    if (Math.abs(dx) >= Math.abs(dy)) mx = dx > 0 ? 1 : -1;
    else my = dy > 0 ? 1 : -1;

    const ntx = enemy.tx + mx;
    const nty = enemy.ty + my;

    // Check walkable AND no other enemy occupying
    const blocked = enemies.some(e => e !== enemy && !e.moving && e.tx === ntx && e.ty === nty);
    if (World.isWalkable(ntx, nty) && !blocked) {
      enemy.fromX = enemy.tx; enemy.fromY = enemy.ty;
      enemy.toX = ntx; enemy.toY = nty;
      enemy.moving = true;
      enemy.moveProgress = 0;
      enemy.moveTimer = 0;
      if (mx > 0) enemy.facing = 'right';
      else if (mx < 0) enemy.facing = 'left';
      else if (my > 0) enemy.facing = 'down';
      else enemy.facing = 'up';
    } else if (!blocked) {
      // Try perpendicular
      const altMx = mx === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const altMy = my === 0 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const atx = enemy.tx + altMx;
      const aty = enemy.ty + altMy;
      if (World.isWalkable(atx, aty)) {
        enemy.fromX = enemy.tx; enemy.fromY = enemy.ty;
        enemy.toX = atx; enemy.toY = aty;
        enemy.moving = true; enemy.moveProgress = 0; enemy.moveTimer = 0;
      }
    }
  }

  function updateEnemy(enemy, dt, playerTX, playerTY) {
    if (enemy.state === 'dead') return;

    const def = enemy.def_ref;
    const d = dist(enemy.tx, enemy.ty, playerTX, playerTY);

    // Stun
    if (enemy.stunTimer > 0) {
      enemy.stunTimer -= dt;
      enemy.state = 'stun';
      if (enemy.stunTimer <= 0) enemy.state = d <= def.chaseRange ? 'chase' : 'patrol';
    }

    // Movement interpolation
    if (enemy.moving) {
      enemy.moveTimer += dt;
      enemy.moveProgress = Math.min(1, enemy.moveTimer / (ENEMY_MOVE_TIME / enemy.spd));
      enemy.x = enemy.fromX + (enemy.toX - enemy.fromX) * enemy.moveProgress;
      enemy.y = enemy.fromY + (enemy.toY - enemy.fromY) * enemy.moveProgress;
      if (enemy.moveProgress >= 1) {
        enemy.tx = enemy.toX; enemy.ty = enemy.toY;
        enemy.x = enemy.toX; enemy.y = enemy.toY;
        enemy.moving = false;
      }
    }

    // Anim
    enemy.animTimer += dt;
    if (enemy.animTimer > 0.22) { enemy.animTimer = 0; enemy.animFrame ^= 1; }

    // Attack cooldown
    if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

    // Status effects
    enemy.statusEffects = enemy.statusEffects.filter(s => {
      s.duration -= dt;
      if (s.type === 'burn' && s.duration % 1 < dt) {
        enemy.hp -= 3;
        spawnParticle(enemy.x + 0.5, enemy.y + 0.5, '#e74c3c', 'fire');
      }
      if (s.type === 'poison' && s.duration % 1 < dt) {
        enemy.hp -= 2;
      }
      return s.duration > 0;
    });
    if (enemy.hp <= 0 && enemy.state !== 'dead') {
      enemy.state = 'dead';
      return;
    }

    const slow = enemy.statusEffects.find(s => s.type === 'slow');
    const speedMult = slow ? (1 - 0.4 - (slow.stacks - 1) * 0.1) : 1;

    if (enemy.stunTimer > 0) return;

    // State machine
    switch (enemy.state) {
      case 'patrol': {
        if (d <= def.detectRange) { enemy.state = 'chase'; enemy.aggroTimer = 5; break; }
        if (enemy.moving) break;
        enemy.patrolTimer -= dt;
        if (enemy.patrolTimer <= 0) {
          const target = enemy.patrol[enemy.patrolIndex];
          if (enemy.tx === target[0] && enemy.ty === target[1]) {
            enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrol.length;
            enemy.patrolTimer = 1.5;
          } else {
            stepToward(enemy, target[0], target[1]);
            enemy.patrolTimer = 0.1;
          }
        }
        break;
      }
      case 'chase': {
        if (d <= def.attackRange) { enemy.state = 'attack'; break; }
        if (d > def.chaseRange) {
          enemy.aggroTimer -= dt;
          if (enemy.aggroTimer <= 0) { enemy.state = 'patrol'; break; }
        } else {
          enemy.aggroTimer = 5;
        }
        if (!enemy.moving) stepToward(enemy, playerTX, playerTY);
        break;
      }
      case 'attack': {
        if (d > def.attackRange * 1.5) { enemy.state = 'chase'; break; }
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = def.attackCooldown;
          // Damage player
          const dmg = Player.takeDamage(def.atk);
          if (dmg > 0) {
            spawnFloatingText(playerTX + 0.5, playerTY - 0.5, `-${dmg}`, '#e74c3c');
            // On-contact effects
            if (def.onContact && Math.random() < def.onContact.chance) {
              Player.addStatus(def.onContact.type, def.onContact.duration);
            }
          }
        }
        break;
      }
    }
  }

  function damageEnemy(enemy, amount, type = 'physical') {
    if (enemy.state === 'dead') return 0;
    const reduced = Math.max(1, amount - enemy.def_ref.def);
    enemy.hp -= reduced;
    spawnFloatingText(enemy.x + 0.5, enemy.y - 0.3, `-${reduced}`,
      type === 'magic' ? PAL.veilcaster : (type === 'ranged' ? PAL.ashwalker : '#fff'));
    if (enemy.hp <= 0) {
      enemy.state = 'dead';
      // Drop items with rarity loot pop
      const drops = rollDrops(enemy.type);
      let dropYOffset = 0.8;
      drops.forEach(d => {
        if (d.isGold) {
          // Gold drop — add directly to player and show yellow text
          Player.state.gold = (Player.state.gold || 0) + d.qty;
          spawnFloatingText(enemy.x + 0.5, enemy.y - dropYOffset, `+${d.qty}g`, PAL.xpFill);
          dropYOffset += 0.5;
        } else {
          Player.addItem(d.id, d.qty);
          const item = ITEMS[d.id];
          const rColor = rarityColor(d.rarity);
          // Loot pop: larger text than damage numbers
          spawnLootPop(enemy.x + 0.5, enemy.y - dropYOffset, item?.name || d.id, rColor, d.rarity);
          // Particle burst in rarity color
          spawnRarityBurst(enemy.x + 0.5, enemy.y + 0.5, rColor, d.rarity);
          dropYOffset += 0.55;
        }
      });
      Player.gainXP(enemy.xp);
      spawnFloatingText(enemy.x + 0.5, enemy.y - dropYOffset, `+${enemy.xp} XP`, PAL.xpFill);
      spawnParticles_death(enemy.x + 0.5, enemy.y + 0.5, enemy.def_ref.drawColor);
      // Track sentinel kills for quests
      if (enemy.type === 'hollow_sentinel') {
        Player.state.flags.approach_sentinel_killed = true;
        Player.state.flags.sentinel_killed = true;
        const zone = World.current;
        if (zone?.id === 'junction_tower_interior') {
          Player.state.flags.tower_sentinel_killed = true;
          // Trigger boss death story
          if (typeof Story !== 'undefined' && Story.DIALOGUES.story_boss_defeated) {
            // Will be picked up by engine on next frame check
            Player.state.flags.boss_defeated_dialogue_pending = true;
          }
        }
        // Update quest var for clear_junction
        if (typeof Quests !== 'undefined') {
          const count = (Quests.getVar('clear_junction', 'sentinels_killed') || 0) + 1;
          Quests.setVar('clear_junction', 'sentinels_killed', count);
        }
      }
    } else {
      // Aggro
      if (enemy.state !== 'attack' && enemy.state !== 'chase') {
        enemy.state = 'chase';
        enemy.aggroTimer = 8;
      }
      // Stun on heavy hits
      if (amount >= enemy.def_ref.atk * 1.5) {
        enemy.stunTimer = 0.3;
      }
    }
    return reduced;
  }

  function spawnLootPop(wx, wy, name, color, rarity) {
    // Larger than damage numbers: size * 0.5 vs damage * 0.4
    floatingTexts.push({
      x: wx, y: wy,
      text: name,
      color,
      life: 1.8,
      vy: -0.6,
      sizeMult: rarity === DROP_RARITY.UNIQUE ? 0.6 : 0.5,
      isLoot: true,
    });
  }

  function spawnRarityBurst(wx, wy, color, rarity) {
    const count = rarity === DROP_RARITY.UNIQUE ? 10 : (rarity === DROP_RARITY.RARE ? 8 : 6);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 2.0;
      particles.push({
        x: wx, y: wy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        color, size: 3 + Math.random() * 4,
      });
    }
  }

  function applyStatusToEnemy(enemy, type, duration, stacks = 1) {
    const existing = enemy.statusEffects.find(s => s.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.stacks = Math.min((existing.stacks || 1) + stacks, 5);
    } else {
      enemy.statusEffects.push({ type, duration, stacks });
    }
  }

  // ── Projectiles ───────────────────────────────────────────────
  function spawnProjectile(fromX, fromY, toTX, toTY, dmg, type, speed = 8, range = 7) {
    const dx = toTX - fromX, dy = toTY - fromY;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    projectiles.push({
      x: fromX + 0.5, y: fromY + 0.5,
      vx: (dx / len) * speed, vy: (dy / len) * speed,
      dmg, type, range,
      distTraveled: 0,
      alive: true,
      color: type === 'arrow' ? '#c8a060' : (type === 'bolt' ? '#888' : PAL.veilcaster),
    });
  }

  function updateProjectiles(dt) {
    for (const p of projectiles) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.distTraveled += Math.sqrt(p.vx*p.vx + p.vy*p.vy) * dt;

      const ptx = Math.floor(p.x);
      const pty = Math.floor(p.y);

      if (!World.isWalkable(ptx, pty)) { p.alive = false; continue; }
      if (p.distTraveled > p.range) { p.alive = false; continue; }

      // Hit enemies
      for (const enemy of enemies) {
        if (enemy.state === 'dead') continue;
        const dx = p.x - (enemy.x + 0.5), dy = p.y - (enemy.y + 0.5);
        if (dx*dx + dy*dy < 0.5) {
          damageEnemy(enemy, p.dmg, p.type === 'veil' ? 'magic' : 'ranged');
          p.alive = false;
          break;
        }
      }
    }
    projectiles = projectiles.filter(p => p.alive);
  }

  // ── Particles ─────────────────────────────────────────────────
  function spawnParticle(wx, wy, color, type = 'spark') {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      particles.push({
        x: wx, y: wy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color, type, size: 2 + Math.random() * 3,
      });
    }
  }

  function spawnParticles_death(wx, wy, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: wx, y: wy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1,
        color, size: 3 + Math.random() * 5,
      });
    }
  }

  function spawnFloatingText(wx, wy, text, color) {
    floatingTexts.push({ x: wx, y: wy, text, color, life: 1.2, vy: -0.8 });
  }

  function updateParticles(dt) {
    particles = particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 2 * dt; // gravity
      p.life -= dt;
      return p.life > 0;
    });
    floatingTexts = floatingTexts.filter(t => {
      t.y += t.vy * dt; t.life -= dt;
      return t.life > 0;
    });
  }

  // ── Main update ───────────────────────────────────────────────
  function update(dt) {
    const px = Player.state.tx, py = Player.state.ty;
    for (const enemy of enemies) updateEnemy(enemy, dt, px, py);
    updateProjectiles(dt);
    updateParticles(dt);
  }

  // ── Drawing ───────────────────────────────────────────────────
  function drawEnemy(ctx, enemy, camX, camY, tileSize) {
    if (enemy.state === 'dead') return;
    const def = enemy.def_ref;
    const cx = enemy.x * tileSize - camX + tileSize * 0.5;
    const cy = enemy.y * tileSize - camY + tileSize * 0.5;
    const s = tileSize * def.size;

    ctx.save();

    // Stun flash
    if (enemy.stunTimer > 0) ctx.globalAlpha = 0.6;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s*0.38, s*0.28, s*0.1, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body
    ctx.fillStyle = def.drawColor;
    ctx.fillRect(cx - s*0.22, cy - s*0.18, s*0.44, s*0.45);

    // Head
    ctx.fillStyle = def.drawColor;
    ctx.beginPath();
    ctx.arc(cx, cy - s*0.22, s*0.2, 0, Math.PI*2);
    ctx.fill();

    // Eyes — the hollow glow
    ctx.fillStyle = def.eyeColor;
    ctx.shadowColor = def.eyeColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(cx - s*0.1, cy - s*0.26, s*0.07, s*0.07);
    ctx.fillRect(cx + s*0.03, cy - s*0.26, s*0.07, s*0.07);
    ctx.shadowBlur = 0;

    // Legs with walk cycle
    ctx.fillStyle = def.drawColor;
    const legSwing = enemy.moving ? (enemy.animFrame === 0 ? -s*0.06 : s*0.06) : 0;
    ctx.fillRect(cx - s*0.14 + legSwing, cy + s*0.26, s*0.12, s*0.2);
    ctx.fillRect(cx + s*0.02 - legSwing, cy + s*0.26, s*0.12, s*0.2);

    // HP bar (only show if damaged)
    if (enemy.hp < enemy.maxHP) {
      const bw = s * 0.8, bh = 4;
      const bx = cx - bw*0.5, by = cy - s*0.55;
      ctx.fillStyle = PAL.hpBg;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = PAL.hpFill;
      ctx.fillRect(bx, by, bw * (enemy.hp / enemy.maxHP), bh);
    }

    // Boss indicator
    if (def.boss) {
      ctx.strokeStyle = '#d4ac0d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - s*0.22, s*0.24, 0, Math.PI*2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawNPC(ctx, npc, camX, camY, tileSize) {
    const cx = npc.tx * tileSize - camX + tileSize * 0.5;
    const cy = npc.ty * tileSize - camY + tileSize * 0.5;
    const s = tileSize;

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s*0.36, s*0.25, s*0.09, 0, 0, Math.PI*2);
    ctx.fill();

    // Body
    const factionColors = {
      survivor: '#5a4535', thornkin: '#2d5a3a', imperial: '#3a3560', neutral: '#4a4040'
    };
    ctx.fillStyle = factionColors[npc.faction] || '#4a4040';
    ctx.fillRect(cx - s*0.18, cy - s*0.1, s*0.36, s*0.32);

    // Head
    ctx.fillStyle = PAL.skinLight;
    ctx.beginPath();
    ctx.arc(cx, cy - s*0.18, s*0.17, 0, Math.PI*2);
    ctx.fill();

    // Dialogue indicator
    ctx.fillStyle = '#d4c89a';
    ctx.font = `bold ${Math.round(s * 0.35)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', cx, cy - s * 0.58);

    ctx.restore();
  }

  function draw(ctx, camX, camY, tileSize) {
    for (const e of enemies) drawEnemy(ctx, e, camX, camY, tileSize);
    for (const n of npcs) drawNPC(ctx, n, camX, camY, tileSize);

    // Projectiles
    for (const p of projectiles) {
      const px = p.x * tileSize - camX;
      const py = p.y * tileSize - camY;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Particles
    for (const p of particles) {
      const px = p.x * tileSize - camX;
      const py = p.y * tileSize - camY;
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    // Floating texts
    for (const t of floatingTexts) {
      const px = t.x * tileSize - camX;
      const py = t.y * tileSize - camY;
      ctx.save();
      ctx.globalAlpha = Math.min(1, t.life * 1.5);
      ctx.fillStyle = t.color;
      const sizeMult = t.sizeMult || 0.4;
      ctx.font = `bold ${Math.round(tileSize * sizeMult)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Loot text gets a subtle dark outline for readability
      if (t.isLoot) {
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 2;
        ctx.strokeText(t.text, px, py);
      }
      ctx.fillText(t.text, px, py);
      ctx.restore();
    }
  }

  function getEnemyAt(tx, ty, range = 1.5) {
    return enemies.find(e => {
      if (e.state === 'dead') return false;
      const d = dist(e.tx + 0.5, e.ty + 0.5, tx + 0.5, ty + 0.5);
      return d < range;
    }) || null;
  }

  function getNPCAt(tx, ty) {
    return npcs.find(n => n.tx === tx && n.ty === ty) || null;
  }

  function getLivingEnemyCount() {
    return enemies.filter(e => e.state !== 'dead').length;
  }

  return {
    ENEMY_TYPES,
    enemies, npcs,
    spawnFromZone,
    createEnemy,
    update,
    draw,
    damageEnemy,
    applyStatusToEnemy,
    spawnProjectile,
    spawnParticle,
    spawnFloatingText,
    getEnemyAt,
    getNPCAt,
    getLivingEnemyCount,
  };
})();
