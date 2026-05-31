// Combat system — melee, ranged, magic, active talents
const Combat = (() => {

  // ── Active talent effects ─────────────────────────────────────
  const TALENT_ACTIONS = {
    heavy_strike: {
      cost: { stamina: 5 },
      cooldown: 0.8,
      execute(cs, talents) {
        const rank = talents.heavy_strike || 0;
        const dmg = Math.floor(cs.atk * (1 + rank * 0.15));
        const facing = Player.state.facing;
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx, dy] = dirs[facing];
        const tx = Player.state.tx + dx, ty = Player.state.ty + dy;
        const enemy = Entities.getEnemyAt(tx, ty, 2.0);
        if (enemy) {
          const dealt = Entities.damageEnemy(enemy, dmg, 'physical');
          // Stun chance at rank 3
          if (rank >= 3 && Math.random() < 0.35) {
            enemy.stunTimer = 1.0;
          }
          return `Heavy Strike! ${dealt} damage.`;
        }
        return null;
      }
    },
    whirlwind: {
      cost: { stamina: 20 },
      cooldown: 5.0,
      execute(cs, talents) {
        const rank = talents.whirlwind || 0;
        const dmg = Math.floor(cs.atk * (0.8 + rank * 0.1));
        let hits = 0;
        const px = Player.state.tx, py = Player.state.ty;
        for (const enemy of Entities.enemies) {
          if (enemy.state === 'dead') continue;
          const dx = enemy.tx - px, dy = enemy.ty - py;
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            Entities.damageEnemy(enemy, dmg, 'physical');
            hits++;
          }
        }
        return hits > 0 ? `Whirlwind hit ${hits} enemies!` : null;
      }
    },
    taunt: {
      cost: { stamina: 8 },
      cooldown: 12,
      execute(cs, talents) {
        const px = Player.state.tx, py = Player.state.ty;
        let count = 0;
        for (const enemy of Entities.enemies) {
          if (enemy.state === 'dead') continue;
          const d = Math.sqrt((enemy.tx-px)**2 + (enemy.ty-py)**2);
          if (d <= 6) { enemy.state = 'chase'; enemy.aggroTimer = 8; count++; }
        }
        return count > 0 ? `Taunted ${count} enemies.` : null;
      }
    },
    shadow_step: {
      cost: { stamina: 15 },
      cooldown: 8,
      execute(cs, talents) {
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx, dy] = dirs[Player.state.facing];
        let nx = Player.state.tx, ny = Player.state.ty;
        for (let i = 0; i < 3; i++) {
          const ntx = nx + dx, nty = ny + dy;
          if (World.isWalkable(ntx, nty)) { nx = ntx; ny = nty; }
          else break;
        }
        if (nx !== Player.state.tx || ny !== Player.state.ty) {
          Player.state.tx = nx; Player.state.ty = ny;
          Player.state.x = nx; Player.state.y = ny;
          Player.state.toX = nx; Player.state.toY = ny;
          Player.state.iframes = 20;
          Entities.spawnParticle(nx + 0.5, ny + 0.5, PAL.ashwalker, 'dash');
          return 'Shadow Step!';
        }
        return null;
      }
    },
    veil_bolt: {
      cost: { mp: 8 },
      cooldown: 0.4,
      execute(cs, talents) {
        const rank = talents.veil_bolt || 0;
        const dmg = Math.floor(cs.spellPower * (1 + rank * 0.15));
        const facing = Player.state.facing;
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx, dy] = dirs[facing];
        const tx = Player.state.tx + dx * 5;
        const ty = Player.state.ty + dy * 5;
        Entities.spawnProjectile(Player.state.tx, Player.state.ty, tx, ty, dmg, 'veil', 10, cs.range + 2);
        return null; // bolt is visual feedback
      }
    },
    frost_bind: {
      cost: { mp: 18 },
      cooldown: 6,
      execute(cs, talents) {
        const rank = talents.frost_bind || 0;
        const slowPct = 0.4 + rank * 0.1;
        const duration = 4;
        const facing = Player.state.facing;
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [fdx, fdy] = dirs[facing];
        const tx = Player.state.tx + fdx, ty = Player.state.ty + fdy;
        const enemy = Entities.getEnemyAt(tx, ty, 2.5);
        if (enemy) {
          Entities.applyStatusToEnemy(enemy, 'slow', duration, Math.ceil(slowPct * 5));
          Entities.spawnParticle(enemy.x + 0.5, enemy.y + 0.5, '#5dade2', 'frost');
          return 'Frost Bind!';
        }
        return null;
      }
    },
    veil_shield: {
      cost: { mp: 20 },
      cooldown: 15,
      execute(cs, talents) {
        const rank = talents.veil_shield || 0;
        const absorb = 20 + rank * 15;
        Player.addStatus('veil_shield', 15, absorb);
        Entities.spawnParticle(Player.state.x + 0.5, Player.state.y + 0.5, PAL.veilcaster, 'shield');
        return `Veil Shield: absorbs ${absorb} damage.`;
      }
    },
    hex: {
      cost: { mp: 15 },
      cooldown: 18,
      execute(cs, talents) {
        const facing = Player.state.facing;
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx, dy] = dirs[facing];
        const tx = Player.state.tx + dx, ty = Player.state.ty + dy;
        const enemy = Entities.getEnemyAt(tx, ty, 2.0);
        if (enemy) {
          Entities.applyStatusToEnemy(enemy, 'hex', 8, 1);
          return 'Hexed!';
        }
        return null;
      }
    },
    unraveling: {
      cost: { mp: 60 },
      cooldown: 45,
      execute(cs, talents) {
        const dmg = Math.floor(cs.spellPower * 3);
        const px = Player.state.tx, py = Player.state.ty;
        let hits = 0;
        for (const enemy of Entities.enemies) {
          if (enemy.state === 'dead') continue;
          const d = Math.sqrt((enemy.tx-px)**2 + (enemy.ty-py)**2);
          if (d <= 4) {
            Entities.damageEnemy(enemy, dmg, 'magic');
            hits++;
            Entities.spawnParticle(enemy.x + 0.5, enemy.y + 0.5, PAL.veilcaster, 'blast');
          }
        }
        return hits > 0 ? `Unraveling Blast! ${hits} enemies struck.` : 'No targets in range.';
      }
    },
  };

  const cooldowns = {};
  let lastMessage = '';
  let messageTimer = 0;

  function showMessage(msg) {
    if (msg) { lastMessage = msg; messageTimer = 2; }
  }

  // ── Basic melee attack ────────────────────────────────────────
  function basicAttack() {
    const p = Player.state;
    const cs = Player.computeStats(p);
    const weapon = ITEMS[p.equipped.weapon] || ITEMS.fists;

    if (p.attackCooldown > 0) return;

    // Cooldown based on weapon speed
    p.attackCooldown = 1.0 / (cs.speed * (weapon.stats?.speed || 1.0));

    if (weapon.subtype === 'magic') {
      // Use veil_bolt if learned, else basic magic tap
      if (p.talents.veil_bolt) {
        executeTalent('veil_bolt');
      } else {
        const dmg = Math.floor(cs.spellPower * 0.6);
        const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx, dy] = dirs[p.facing];
        const tx = p.tx + dx * 4, ty = p.ty + dy * 4;
        Entities.spawnProjectile(p.tx, p.ty, tx, ty, dmg, 'veil', 8, 4);
      }
      return;
    }

    if (weapon.subtype === 'ranged') {
      const ammoType = weapon.ammoType || 'arrow';
      if ((p.ammo[ammoType] || 0) <= 0) {
        showMessage('No ammo!');
        return;
      }
      p.ammo[ammoType]--;
      const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
      const [dx, dy] = dirs[p.facing];
      const tx = p.tx + dx * (cs.range + 2), ty = p.ty + dy * (cs.range + 2);
      let dmg = cs.atk + (ITEMS[ammoType]?.stats?.dmg || 0);

      // Crit
      if (Math.random() < cs.critChance) {
        dmg = Math.floor(dmg * 1.8);
        Entities.spawnFloatingText(tx + 0.5, ty - 0.5, 'CRIT!', '#f1c40f');
      }

      // Phantom hunter
      if (p.talents.phantom_hunter) dmg *= 3;

      // Venom arrow
      const venom = p.talents.poison_arrow || 0;
      const venomChance = 0.15 + venom * 0.1;

      Entities.spawnProjectile(p.tx, p.ty, tx, ty, dmg, ammoType === 'bolt' ? 'bolt' : 'arrow',
        8 + cs.speed * 2, cs.range + 2);

      // Apply poison to projectile targets handled in entities update
      // (simplified: check on land)
      if (venom > 0 && Math.random() < venomChance) {
        const dirs2 = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
        const [dx2, dy2] = dirs2[p.facing];
        const ptx = p.tx + dx2, pty = p.ty + dy2;
        const hit = Entities.getEnemyAt(ptx, pty, cs.range + 1);
        if (hit) Entities.applyStatusToEnemy(hit, 'poison', 6, venom);
      }
      return;
    }

    // Melee
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[p.facing];
    const tx = p.tx + dx, ty = p.ty + dy;
    const enemy = Entities.getEnemyAt(tx, ty, cs.range + 0.5);
    if (!enemy) return;

    let dmg = cs.atk;

    // Crit
    if (Math.random() < cs.critChance) {
      dmg = Math.floor(dmg * 1.8);
      Entities.spawnFloatingText(tx + 0.5, ty - 0.5, 'CRIT!', '#f1c40f');
    }

    // Berserker
    const berserker = p.talents.berserker || 0;
    const cs2 = Player.computeStats(p);
    if (berserker > 0 && p.hp / cs2.maxHP < 0.3) dmg = Math.floor(dmg * (1 + berserker * 0.2));

    Entities.damageEnemy(enemy, dmg, 'physical');

    // Lifesteal
    if (cs.lifesteal > 0) Player.heal(Math.ceil(dmg * cs.lifesteal));

    // Memory drain
    const memDrain = p.talents.memory_drain || 0;
    if (memDrain > 0) Player.restoreMP(10 + (memDrain - 1) * 5);
  }

  // ── Execute a talent by id ────────────────────────────────────
  function executeTalent(talentId) {
    const p = Player.state;
    const cs = Player.computeStats(p);
    const action = TALENT_ACTIONS[talentId];
    if (!action) return false;

    // Check cooldown
    if ((cooldowns[talentId] || 0) > 0) {
      showMessage(`${talentId.replace(/_/g,' ')} not ready.`);
      return false;
    }

    // Check cost
    if (action.cost.stamina && p.stamina < action.cost.stamina) {
      showMessage('Not enough stamina.');
      return false;
    }
    if (action.cost.mp && p.mp < action.cost.mp) {
      showMessage('Not enough MP.');
      return false;
    }

    // Spend cost
    if (action.cost.stamina) p.stamina = Math.max(0, p.stamina - action.cost.stamina);
    if (action.cost.mp) {
      let cost = action.cost.mp * cs.mpCostMult;
      // Echo cast
      const echo = p.talents.echo_cast || 0;
      if (echo > 0 && Math.random() < 0.15 + echo * 0.05) cost = 0; // free cast
      p.mp = Math.max(0, p.mp - Math.floor(cost));
    }

    cooldowns[talentId] = action.cooldown;
    const msg = action.execute(cs, p.talents);
    showMessage(msg);
    return true;
  }

  // ── Dodge / roll ──────────────────────────────────────────────
  function dodge() {
    const p = Player.state;
    const cs = Player.computeStats(p);
    if (p.dodgeCooldown > 0 || p.stamina < 12) return;

    p.stamina -= 12;
    p.dodgeCooldown = 1.2;
    p.iframes = 30;

    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[p.facing];
    let nx = p.tx, ny = p.ty;
    for (let i = 0; i < 2; i++) {
      const cx = nx + dx, cy = ny + dy;
      if (World.isWalkable(cx, cy)) { nx = cx; ny = cy; }
    }
    if (nx !== p.tx || ny !== p.ty) {
      p.tx = nx; p.ty = ny;
      p.x = nx; p.y = ny;
      p.toX = nx; p.toY = ny;
    }
    Entities.spawnParticle(p.x + 0.5, p.y + 0.5, '#aaa', 'dash');
  }

  // ── Update ────────────────────────────────────────────────────
  function update(dt) {
    for (const [id, cd] of Object.entries(cooldowns)) {
      cooldowns[id] = Math.max(0, cd - dt);
    }
    if (messageTimer > 0) messageTimer -= dt;
  }

  return {
    basicAttack,
    executeTalent,
    dodge,
    update,
    getCooldown: (id) => cooldowns[id] || 0,
    get message() { return messageTimer > 0 ? lastMessage : ''; },
    TALENT_ACTIONS,
  };
})();
