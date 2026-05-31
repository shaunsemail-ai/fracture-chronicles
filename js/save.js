// Save/load system — localStorage, 2 slots, 2 player profiles
const Save = (() => {
  const KEY = 'fracture_chronicles';
  const VERSION = 1;

  function blankSave(profileName, classChoice) {
    return {
      version: VERSION,
      profile: profileName,
      classChoice,           // 'ironclad' | 'ashwalker' | 'veilcaster'
      playtime: 0,
      zone: 'ashfen_ruins',
      spawnPoint: { tx: 5, ty: 5 },
      player: {
        level: 1, xp: 0,
        hp: null, mp: null,   // null = full (set on load)
        stats: { str: 5, agi: 5, int: 5, end: 5, wil: 5 },
        statPoints: 0,
        talentPoints: 0,
        talents: {},
        inventory: [
          { id: 'peasant_shirt', qty: 1 },
          { id: 'fists', qty: 1 },
          { id: 'ashfen_ring', qty: 1 },
          { id: 'herb_minor', qty: 3 },
          { id: 'arrow', qty: 20 },
          { id: 'aldric_journal', qty: 1 },
        ],
        equipped: {
          weapon: 'fists',
          armor:  'peasant_shirt',
          accessory: 'ashfen_ring',
        },
        gold: 0,
        ammo: { arrow: 20, bolt: 0 },
      },
      flags: {},              // story/quest flags: { [flagName]: true/false/number }
      quests: {},             // questId -> { status, stage, vars }
      fastTravel: [],         // unlocked zone ids
      discovered: [],         // discovered zone ids
      memoryPrisonAttempts: {}, // characterId -> number of attempts made
      killedInAction: [],     // list of characterIds who have died
    };
  }

  function getRoot() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : { slots: [null, null], profiles: {} };
    } catch { return { slots: [null, null], profiles: {} }; }
  }

  function setRoot(root) {
    try { localStorage.setItem(KEY, JSON.stringify(root)); } catch(e) {
      console.warn('Save failed:', e);
    }
  }

  return {
    // List both slots for the profile picker
    listSlots() {
      const root = getRoot();
      return root.slots.map((s, i) => s
        ? { slot: i, profile: s.profile, classChoice: s.classChoice,
            level: s.player.level, playtime: s.playtime,
            zone: s.zone, timestamp: s.timestamp }
        : null
      );
    },

    newGame(slot, profileName, classChoice) {
      const root = getRoot();
      const save = blankSave(profileName, classChoice);
      save.timestamp = Date.now();
      // Class starting bonuses
      if (classChoice === 'ironclad') {
        save.player.stats.str += 3; save.player.stats.end += 2;
        save.player.inventory.push({ id: 'iron_sword', qty: 1 });
        save.player.equipped.weapon = 'iron_sword';
      } else if (classChoice === 'ashwalker') {
        save.player.stats.agi += 3; save.player.stats.int += 2;
        save.player.inventory.push({ id: 'shortbow', qty: 1 });
        save.player.equipped.weapon = 'shortbow';
        save.player.ammo.arrow = 40;
      } else if (classChoice === 'veilcaster') {
        save.player.stats.wil += 3; save.player.stats.int += 2;
        save.player.inventory.push({ id: 'veil_focus', qty: 1 });
        save.player.equipped.weapon = 'veil_focus';
      }
      root.slots[slot] = save;
      setRoot(root);
      return save;
    },

    save(slot, gameState) {
      const root = getRoot();
      if (!root.slots[slot]) return;
      root.slots[slot] = { ...gameState, timestamp: Date.now() };
      setRoot(root);
    },

    load(slot) {
      const root = getRoot();
      return root.slots[slot] || null;
    },

    delete(slot) {
      const root = getRoot();
      root.slots[slot] = null;
      setRoot(root);
    },

    // Export as JSON string (for sharing/backup)
    export(slot) {
      const root = getRoot();
      return root.slots[slot] ? JSON.stringify(root.slots[slot]) : null;
    },

    import(slot, jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (data.version !== VERSION) return false;
        const root = getRoot();
        root.slots[slot] = data;
        setRoot(root);
        return true;
      } catch { return false; }
    },
  };
})();
