// Items, gear, and drop tables
const ITEMS = {
  // ── Consumables ──────────────────────────────────────────────
  herb_minor: {
    id: 'herb_minor', name: 'Thornwood Herb', type: 'consumable',
    desc: 'A bitter herb. Restores 20 HP.',
    icon: 'herb', value: 5,
    use(player) { player.heal(20); return 'Restored 20 HP.'; }
  },
  herb_major: {
    id: 'herb_major', name: 'Ashroot', type: 'consumable',
    desc: 'A dense root that pulses with warmth. Restores 60 HP.',
    icon: 'herb', value: 18,
    use(player) { player.heal(60); return 'Restored 60 HP.'; }
  },
  veil_shard: {
    id: 'veil_shard', name: 'Veil Shard', type: 'consumable',
    desc: 'A fragment of crystallized memory. Restores 30 MP.',
    icon: 'crystal', value: 12,
    use(player) { player.restoreMP(30); return 'Restored 30 MP.'; }
  },
  antidote: {
    id: 'antidote', name: 'Charcoal Tincture', type: 'consumable',
    desc: 'Clears poison and venom.',
    icon: 'vial', value: 8,
    use(player) { player.removeStatus('poison'); player.removeStatus('venom'); return 'Poison cleared.'; }
  },
  revive_token: {
    id: 'revive_token', name: 'Echo Ember', type: 'consumable',
    desc: 'A last resort. Restores 1 HP on death instead of falling. Consumed automatically.',
    icon: 'ember', value: 50, auto: true,
    use(player) { player.hp = 1; return 'The ember held the darkness back.'; }
  },

  // ── Weapons — Melee ──────────────────────────────────────────
  fists: {
    id: 'fists', name: 'Bare Hands', type: 'weapon', subtype: 'melee',
    desc: 'Better than nothing.', icon: 'fist', value: 0,
    stats: { atk: 3, speed: 1.2, range: 1 },
  },
  iron_sword: {
    id: 'iron_sword', name: 'Chipped Iron Sword', type: 'weapon', subtype: 'melee',
    desc: 'A soldier\'s blade, worn from use. Still deadly.',
    icon: 'sword', value: 30,
    stats: { atk: 12, speed: 1.0, range: 1.2 },
    req: { str: 8 },
  },
  ashfen_blade: {
    id: 'ashfen_blade', name: 'Ashfen Blade', type: 'weapon', subtype: 'melee',
    desc: 'Forged in Ashfen before the fall. The smith\'s mark is still visible.',
    icon: 'sword', value: 65,
    stats: { atk: 20, speed: 1.0, range: 1.3 },
    req: { str: 12 },
    lore: 'Someone cared enough to make this well.',
  },
  thornwood_spear: {
    id: 'thornwood_spear', name: 'Thornwood Spear', type: 'weapon', subtype: 'melee',
    desc: 'Long reach. The Thornkin use these to keep the Hollow at a safe distance.',
    icon: 'spear', value: 45,
    stats: { atk: 15, speed: 0.85, range: 1.8 },
    req: { str: 10, agi: 6 },
  },
  hollow_fang: {
    id: 'hollow_fang', name: 'Hollow Fang', type: 'weapon', subtype: 'melee',
    desc: 'Carved from a Hollow\'s bone. It hums faintly. Do not think about why.',
    icon: 'dagger', value: 80,
    stats: { atk: 18, speed: 1.5, range: 1.0, lifesteal: 0.08 },
    req: { agi: 14 },
    cursed: true,
  },

  // ── Weapons — Ranged ─────────────────────────────────────────
  shortbow: {
    id: 'shortbow', name: 'Shortbow', type: 'weapon', subtype: 'ranged',
    desc: 'Quick draw. Not much stopping power, but reliable.',
    icon: 'bow', value: 35, ammoType: 'arrow',
    stats: { atk: 10, speed: 1.1, range: 5, chargeTime: 0.4 },
    req: { agi: 8 },
  },
  hunter_bow: {
    id: 'hunter_bow', name: 'Hunter\'s Longbow', type: 'weapon', subtype: 'ranged',
    desc: 'A proper hunting bow. The Thornkin use these against anything they don\'t want close.',
    icon: 'bow', value: 70, ammoType: 'arrow',
    stats: { atk: 18, speed: 0.9, range: 7, chargeTime: 0.7 },
    req: { agi: 12 },
  },
  crossbow: {
    id: 'crossbow', name: 'Imperial Crossbow', type: 'weapon', subtype: 'ranged',
    desc: 'Heavy but punishing. Slower draw, much harder impact.',
    icon: 'crossbow', value: 90, ammoType: 'bolt',
    stats: { atk: 28, speed: 0.6, range: 6, chargeTime: 1.2, piercing: true },
    req: { str: 10, agi: 8 },
  },

  // ── Weapons — Magic ──────────────────────────────────────────
  veil_focus: {
    id: 'veil_focus', name: 'Veil Focus', type: 'weapon', subtype: 'magic',
    desc: 'A polished stone that resonates with the Veil. Allows basic spellcasting.',
    icon: 'orb', value: 55,
    stats: { atk: 8, spellPower: 15, range: 4, mpCostMult: 1.0 },
    req: { wil: 10 },
  },
  archive_staff: {
    id: 'archive_staff', name: 'Archive Staff', type: 'weapon', subtype: 'magic',
    desc: 'Once used by the Architects. The inscriptions still hold power, though no one alive can read them all.',
    icon: 'staff', value: 140,
    stats: { atk: 6, spellPower: 32, range: 5, mpCostMult: 0.8 },
    req: { wil: 18, int: 14 },
    lore: 'The glyphs shift when you\'re not looking directly at them.',
  },

  // ── Armor ────────────────────────────────────────────────────
  peasant_shirt: {
    id: 'peasant_shirt', name: 'Rough Clothes', type: 'armor', subtype: 'chest',
    desc: 'What you woke up in.', icon: 'shirt', value: 0,
    stats: { def: 1 },
  },
  leather_vest: {
    id: 'leather_vest', name: 'Scavenged Leather Vest', type: 'armor', subtype: 'chest',
    desc: 'Stitched from scraps. Better than cloth.',
    icon: 'vest', value: 25,
    stats: { def: 5 },
  },
  thornkin_coat: {
    id: 'thornkin_coat', name: 'Thornkin Scout Coat', type: 'armor', subtype: 'chest',
    desc: 'Light and padded. The Thornkin favor mobility over protection.',
    icon: 'coat', value: 60,
    stats: { def: 9, agi: 2 },
  },
  iron_plate: {
    id: 'iron_plate', name: 'Iron Plate Chest', type: 'armor', subtype: 'chest',
    desc: 'Heavy. Slows you. Keeps you alive long enough for that to matter.',
    icon: 'plate', value: 100,
    stats: { def: 18, str: 1, agi: -1 },
    req: { str: 12, end: 10 },
  },

  // ── Accessories ──────────────────────────────────────────────
  ashfen_ring: {
    id: 'ashfen_ring', name: 'Ashfen Signet Ring', type: 'accessory',
    desc: 'Your family\'s ring. You found it in the ashes. It means something.',
    icon: 'ring', value: 0, unique: true,
    stats: { maxHP: 10 },
    lore: 'Still warm, somehow.',
  },
  focus_band: {
    id: 'focus_band', name: 'Focus Band', type: 'accessory',
    desc: 'A cloth band inscribed with steadying runes. Reduces MP costs slightly.',
    icon: 'band', value: 45,
    stats: { maxMP: 15, mpCostMult: -0.05 },
    req: { wil: 6 },
  },

  // ── Quest Items ──────────────────────────────────────────────
  aldric_journal: {
    id: 'aldric_journal', name: 'Aldric\'s Journal', type: 'quest',
    desc: 'Your mentor\'s journal. You haven\'t read past the first page yet.',
    icon: 'book',
    lore: 'The handwriting becomes less steady toward the end.',
  },
  imperial_seal: {
    id: 'imperial_seal', name: 'Imperial Writ of Pacification', type: 'quest',
    desc: 'A military order bearing the Sixth Legion\'s seal. The words "necessary losses" appear multiple times.',
    icon: 'scroll',
    lore: 'Someone signed this knowing exactly what it meant.',
  },

  // ── Ammo ─────────────────────────────────────────────────────
  arrow: {
    id: 'arrow', name: 'Arrow', type: 'ammo', stackable: true, value: 1,
    stats: { dmg: 0 },
  },
  bolt: {
    id: 'bolt', name: 'Crossbow Bolt', type: 'ammo', stackable: true, value: 2,
    stats: { dmg: 5 },
  },
  fire_arrow: {
    id: 'fire_arrow', name: 'Fire Arrow', type: 'ammo', stackable: true, value: 8,
    stats: { dmg: 8, burnChance: 0.5 },
  },

  // ── Crafted consumables ──────────────────────────────────────
  heal_potion_minor: {
    id: 'heal_potion_minor', name: 'Healing Potion', type: 'consumable',
    desc: 'Campfire-brewed. Restores 40 HP.',
    icon: 'vial', value: 14,
    use(player) {
      const bonus = player.state.flags['__craft_bonus_heal_potion_minor'];
      const amt = bonus ? 60 : 40;
      player.heal(amt);
      if (bonus) delete player.state.flags['__craft_bonus_heal_potion_minor'];
      return `Restored ${amt} HP.`;
    }
  },
  heal_potion_major: {
    id: 'heal_potion_major', name: 'Strong Healing Potion', type: 'consumable',
    desc: 'Restores 90 HP. Bonus craft: 135 HP.',
    icon: 'vial', value: 35,
    use(player) {
      const bonus = player.state.flags['__craft_bonus_heal_potion_major'];
      const amt = bonus ? 135 : 90;
      player.heal(amt);
      if (bonus) delete player.state.flags['__craft_bonus_heal_potion_major'];
      return `Restored ${amt} HP.`;
    }
  },
  mp_potion: {
    id: 'mp_potion', name: 'Mana Tincture', type: 'consumable',
    desc: 'Restores 50 MP. Bonus craft: 75 MP.',
    icon: 'crystal', value: 20,
    use(player) {
      const bonus = player.state.flags['__craft_bonus_mp_potion'];
      const amt = bonus ? 75 : 50;
      player.restoreMP(amt);
      if (bonus) delete player.state.flags['__craft_bonus_mp_potion'];
      return `Restored ${amt} MP.`;
    }
  },
  hunters_brew: {
    id: 'hunters_brew', name: "Hunter's Brew", type: 'consumable',
    desc: 'ATK +20% for 60s. Perfect craft: 120s.',
    icon: 'vial', value: 28,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_hunters_brew'];
      const dur = bonus ? 120 : 60;
      Crafting.addBuff('atk_boost', dur, 0.20);
      if (bonus) delete player.state.flags['__craft_bonus_hunters_brew'];
      return `ATK boosted for ${dur}s.`;
    }
  },
  focus_tea: {
    id: 'focus_tea', name: 'Focus Tea', type: 'consumable',
    desc: 'Spell Power +25% for 60s. Perfect craft: 120s.',
    icon: 'vial', value: 25,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_focus_tea'];
      const dur = bonus ? 120 : 60;
      Crafting.addBuff('spell_boost', dur, 0.25);
      if (bonus) delete player.state.flags['__craft_bonus_focus_tea'];
      return `Spell Power boosted for ${dur}s.`;
    }
  },
  iron_draught: {
    id: 'iron_draught', name: 'Iron Draught', type: 'consumable',
    desc: 'DEF +15 for 90s. Perfect craft: 180s.',
    icon: 'vial', value: 22,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_iron_draught'];
      const dur = bonus ? 180 : 90;
      Crafting.addBuff('def_boost', dur, 15);
      if (bonus) delete player.state.flags['__craft_bonus_iron_draught'];
      return `DEF boosted for ${dur}s.`;
    }
  },
  swift_step: {
    id: 'swift_step', name: 'Swift Step', type: 'consumable',
    desc: 'Speed +30% for 45s. Perfect craft: 90s.',
    icon: 'vial', value: 18,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_swift_step'];
      const dur = bonus ? 90 : 45;
      Crafting.addBuff('speed_boost', dur, 0.30);
      if (bonus) delete player.state.flags['__craft_bonus_swift_step'];
      return `Speed boosted for ${dur}s.`;
    }
  },
  restored_tincture: {
    id: 'restored_tincture', name: 'Restored Tincture', type: 'consumable',
    desc: 'Restores 80 HP over 30s. Perfect craft: 60s.',
    icon: 'vial', value: 30,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_restored_tincture'];
      const dur = bonus ? 60 : 30;
      Crafting.addBuff('hp_regen', dur, 80);
      if (bonus) delete player.state.flags['__craft_bonus_restored_tincture'];
      return `HP regenerating for ${dur}s.`;
    }
  },
  purified_veil: {
    id: 'purified_veil', name: 'Purified Veil', type: 'consumable',
    desc: 'Restores 50 MP over 20s. Perfect craft: 40s.',
    icon: 'crystal', value: 24,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_purified_veil'];
      const dur = bonus ? 40 : 20;
      Crafting.addBuff('mp_regen', dur, 50);
      if (bonus) delete player.state.flags['__craft_bonus_purified_veil'];
      return `MP regenerating for ${dur}s.`;
    }
  },
  battle_ration: {
    id: 'battle_ration', name: 'Battle Ration', type: 'consumable',
    desc: 'Restores 25 HP and 15 Stamina. Quick to make, cheap.',
    icon: 'herb', value: 6,
    use(player) {
      player.heal(25);
      player.state.stamina = Math.min(player.computeStats(player.state).maxStamina, player.state.stamina + 15);
      return 'Restored 25 HP and 15 Stamina.';
    }
  },
  warden_compound: {
    id: 'warden_compound', name: 'Warden Compound', type: 'consumable',
    desc: 'ATK and DEF +15% for 120s. Perfect craft: 240s.',
    icon: 'vial', value: 60,
    use(player) {
      if (!player.state.activeBuffs) player.state.activeBuffs = [];
      const bonus = player.state.flags['__craft_bonus_warden_compound'];
      const dur = bonus ? 240 : 120;
      Crafting.addBuff('atk_def_boost', dur, 0.15);
      if (bonus) delete player.state.flags['__craft_bonus_warden_compound'];
      return `Warden stance active for ${dur}s.`;
    }
  },

  // ── Boss drops ───────────────────────────────────────────────
  architects_resin: {
    id: 'architects_resin', name: "Architect's Resin", type: 'consumable',
    desc: 'Fully restores HP and MP instantly. Max 1 in inventory. Cannot be purchased.',
    icon: 'crystal', value: 0, unique: true, maxStack: 1,
    lore: "It shouldn't exist. Most things that work this well stopped being made six hundred years ago.",
    use(player) {
      const cs = player.computeStats(player.state);
      player.state.hp = cs.maxHP;
      player.state.mp = cs.maxMP;
      return 'HP and MP fully restored.';
    }
  },
  hollow_core: {
    id: 'hollow_core', name: 'Hollow Core', type: 'quest',
    desc: 'A dense fragment from a Hollow. Warm to the touch, which makes no sense.',
    icon: 'crystal', value: 0,
    lore: "Something was extracted from this creature. What\'s left is confused about whether it\'s alive.",
  },
  sentinel_shard: {
    id: 'sentinel_shard', name: 'Sentinel Shard', type: 'quest',
    desc: 'Broken from a Hollow Sentinel. The metal is not from any mine you know.',
    icon: 'crystal', value: 0,
    lore: "The inscriptions are similar to what you saw in Ashfen. Before it burned.",
  },

  // ── Shop items ───────────────────────────────────────────────
  iron_bolts: {
    id: 'iron_bolts', name: 'Iron Bolts', type: 'ammo', stackable: true, value: 4,
    desc: 'Heavier than standard bolts. More punch.',
    stats: { dmg: 10, pierceChance: 0.15 },
  },
  reinforced_vest: {
    id: 'reinforced_vest', name: 'Reinforced Leather Vest', type: 'armor', subtype: 'chest',
    desc: 'Thick-cut leather with metal staples at the joints. Better than scavenged scraps.',
    icon: 'vest', value: 85,
    stats: { def: 8, end: 1 },
    req: { end: 7 },
  },
  trail_rations: {
    id: 'trail_rations', name: 'Trail Rations', type: 'consumable',
    desc: 'Hard bread and dried meat. Restores 15 HP. Not good. But reliable.',
    icon: 'herb', value: 12,
    use(player) { player.heal(15); return 'Restored 15 HP.'; }
  },
  camp_remedy: {
    id: 'camp_remedy', name: 'Camp Remedy', type: 'consumable',
    desc: "Clears all active status effects. Maren's recipe.",
    icon: 'vial', value: 35,
    use(player) {
      player.state.statusEffects = [];
      return 'All status effects cleared.';
    }
  },
};

// Drop rarity constants
const DROP_RARITY = {
  COMMON:   'common',
  UNCOMMON: 'uncommon',
  RARE:     'rare',
  UNIQUE:   'unique',
};

function rarityColor(rarity) {
  switch (rarity) {
    case DROP_RARITY.UNCOMMON: return '#27ae60';
    case DROP_RARITY.RARE:     return '#5dade2';
    case DROP_RARITY.UNIQUE:   return '#d4ac0d';
    default:                   return '#d4c89a';
  }
}

// Drop tables: enemy type -> array of { id, chance, qty, rarity? }
// Special entry: { id: '__gold__', chance, qty, rarity } adds gold directly
const DROP_TABLES = {
  hollow_walker: [
    { id: '__gold__',  chance: 0.90, qty: [1,4],  rarity: DROP_RARITY.COMMON },
    { id: 'herb_minor',chance: 0.25, qty: [1,1],  rarity: DROP_RARITY.COMMON },
    { id: 'arrow',     chance: 0.30, qty: [2,5],  rarity: DROP_RARITY.COMMON },
  ],
  hollow_brute: [
    { id: '__gold__',  chance: 0.95, qty: [3,7],  rarity: DROP_RARITY.COMMON },
    { id: 'herb_minor',chance: 0.40, qty: [1,2],  rarity: DROP_RARITY.COMMON },
    { id: 'herb_major',chance: 0.10, qty: [1,1],  rarity: DROP_RARITY.UNCOMMON },
    { id: 'arrow',     chance: 0.20, qty: [3,6],  rarity: DROP_RARITY.COMMON },
    { id: 'hollow_core',chance:0.08, qty: [1,1],  rarity: DROP_RARITY.RARE },
  ],
  shade: [
    { id: '__gold__',  chance: 0.85, qty: [2,5],  rarity: DROP_RARITY.COMMON },
    { id: 'veil_shard',chance: 0.30, qty: [1,1],  rarity: DROP_RARITY.UNCOMMON },
    { id: 'herb_minor',chance: 0.20, qty: [1,1],  rarity: DROP_RARITY.COMMON },
  ],
  ember_crawler: [
    { id: '__gold__',  chance: 0.80, qty: [1,3],  rarity: DROP_RARITY.COMMON },
    { id: 'herb_minor',chance: 0.20, qty: [1,1],  rarity: DROP_RARITY.COMMON },
    { id: 'antidote',  chance: 0.15, qty: [1,1],  rarity: DROP_RARITY.COMMON },
  ],
  hollow_sentinel: [
    { id: '__gold__',       chance: 1.00, qty: [6,8],  rarity: DROP_RARITY.RARE },
    { id: 'architects_resin',chance:1.00, qty: [1,1],  rarity: DROP_RARITY.UNIQUE },
    { id: 'sentinel_shard', chance: 1.00, qty: [1,1],  rarity: DROP_RARITY.UNIQUE },
    { id: 'herb_major',     chance: 1.00, qty: [2,2],  rarity: DROP_RARITY.UNCOMMON },
    { id: 'hollow_core',    chance: 0.50, qty: [1,1],  rarity: DROP_RARITY.RARE },
  ],
};

// Returns array of { id, qty, rarity, isGold }
function rollDrops(enemyType) {
  const table = DROP_TABLES[enemyType] || [];
  const drops = [];
  for (const entry of table) {
    if (Math.random() < entry.chance) {
      const qty = entry.qty[0] + Math.floor(Math.random() * (entry.qty[1] - entry.qty[0] + 1));
      if (entry.id === '__gold__') {
        drops.push({ id: '__gold__', qty, rarity: entry.rarity || DROP_RARITY.COMMON, isGold: true });
      } else {
        drops.push({ id: entry.id, qty, rarity: entry.rarity || DROP_RARITY.COMMON, isGold: false });
      }
    }
  }
  return drops;
}
