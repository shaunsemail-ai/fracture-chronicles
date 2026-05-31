// Quest system
const Quests = (() => {

  // Status constants
  const S = { INACTIVE: 0, ACTIVE: 1, COMPLETE: 2, FAILED: 3 };

  // ── Quest definitions ─────────────────────────────────────────
  // Each quest: { id, name, desc, stages[], rewards }
  // stage: { id, desc, check(flags, questVars) -> bool, onComplete(flags) }

  const QUEST_DEFS = {
    // ── Prologue ─────────────────────────────────────────────
    survive_ashfen: {
      id: 'survive_ashfen', name: 'The Night Ashfen Burned',
      category: 'main',
      desc: 'Your village is gone. Get out alive.',
      stages: [
        { id: 'escape', desc: 'Reach the southern gate', check: f => f.entered_thornwood_path },
      ],
      rewards: { xp: 50 },
    },

    find_survivors: {
      id: 'find_survivors', name: 'Find the Survivors',
      category: 'main',
      desc: 'Find any survivors of Ashfen still in the ruins.',
      stages: [
        { id: 'find_maren', desc: 'Find Maren in the ruins', check: f => f.talked_maren },
        { id: 'find_pell',  desc: 'Find Pell', check: f => f.talked_pell },
      ],
      rewards: { xp: 80, items: [{ id: 'herb_major', qty: 1 }] },
    },

    reach_camp: {
      id: 'reach_camp', name: 'Reach the Thornkin Camp',
      category: 'main',
      desc: 'Find the resistance camp in the Thornwood.',
      stages: [
        { id: 'enter_thornwood', desc: 'Enter the Thornwood', check: f => f.zone_thornwood_edge },
        { id: 'find_sera', desc: 'Find Sera or other Thornkin', check: f => f.met_sera },
        { id: 'find_camp', desc: 'Reach the camp', check: f => f.met_cole },
      ],
      rewards: { xp: 150, items: [{ id: 'herb_major', qty: 2 }], unlocks: ['fast_travel_thornkin_camp'] },
    },

    clear_junction: {
      id: 'clear_junction', name: 'Clear the Junction Tower',
      category: 'main',
      desc: 'The Hollow are staging from a tower east of the camp. Eliminate them.',
      stages: [
        { id: 'reach_tower', desc: 'Reach the Junction Tower', check: f => f.zone_junction_tower },
        { id: 'kill_sentinels', desc: 'Defeat the Hollow Sentinels (0/3)', check: (f, v) => (v.sentinels_killed || 0) >= 3 },
        { id: 'destroy_anchor', desc: 'Destroy the Hollow Anchor', check: f => f.anchor_destroyed },
      ],
      rewards: { xp: 250, items: [{ id: 'iron_sword', qty: 1 }, { id: 'herb_major', qty: 3 }] },
    },

    // ── Side quests ───────────────────────────────────────────
    aldric_journal: {
      id: 'aldric_journal', name: 'What He Knew',
      category: 'side',
      desc: 'Aldric\'s journal is in your bag. You haven\'t read it yet. Maybe you should.',
      stages: [
        { id: 'read_journal', desc: 'Read Aldric\'s journal', check: f => f.read_aldric_journal },
        { id: 'find_reference', desc: 'Find what "Vael" means (0/1 lore found)', check: f => f.found_vael_lore },
      ],
      rewards: { xp: 60, lore: 'Aldric\'s Last Word' },
    },

    pell_boot: {
      id: 'pell_boot', name: 'The Other Shoe',
      category: 'side',
      desc: 'Pell carries a boot that isn\'t his. He won\'t let it go. There must be a reason.',
      stages: [
        { id: 'notice_boot', desc: 'Ask Maren about the boot', check: f => f.maren_knows_boot },
        { id: 'find_answer', desc: 'Understand why', check: f => f.pell_boot_resolved },
      ],
      rewards: { xp: 40 },
      lore_reward: 'The boot belonged to Pell\'s older sister. She was the one who carried him out of a burning building two years ago, before the Hollow ever appeared. He wore mismatched shoes for weeks after. No one made him stop.',
    },

    maren_medicine: {
      id: 'maren_medicine', name: 'What Healers Carry',
      category: 'side',
      desc: 'Maren needs specific herbs to treat the badly injured at the camp. Find them.',
      stages: [
        { id: 'get_ashroot', desc: 'Gather Ashroot (0/3)', check: (f, v) => (v.ashroot_gathered || 0) >= 3 },
        { id: 'return_maren', desc: 'Return to Maren', check: f => f.returned_herbs_maren },
      ],
      rewards: { xp: 70, items: [{ id: 'antidote', qty: 2 }, { id: 'veil_shard', qty: 1 }] },
    },

    // ── Phase 2 quests ────────────────────────────────────────
    reach_thornkin_camp: {
      id: 'reach_thornkin_camp', name: 'Follow the Path',
      category: 'main',
      desc: 'Cole mentioned a camp in the Thornwood. Find it.',
      stages: [
        { id: 'find_camp', desc: 'Reach the Thornkin Camp', check: f => f.entered_thornkin_camp },
      ],
      rewards: { xp: 120, flags: ['ft_thornkin_camp'] },
    },

    find_the_spy: {
      id: 'find_the_spy', name: "Something's Wrong",
      category: 'side',
      desc: "Something about Rael doesn't sit right. Watch him.",
      stages: [
        { id: 'observe_rael',  desc: 'Observe Rael near Cole\'s tent (0/3)',
          check: (f, v) => (v.rael_sightings || 0) >= 3 },
        { id: 'report_cole',   desc: 'Report to Cole',
          check: f => f.spy_reported },
      ],
      rewards: { xp: 200, items: [{ id: 'hollow_fang', qty: 1 }],
        flags: ['cole_trust_unlocked'] },
    },

    quill_mystery: {
      id: 'quill_mystery', name: 'The Marked Hand',
      category: 'side',
      desc: "The glyph on Quill's wrist is the same as the one in the Archive. Ask him about it.",
      stages: [
        { id: 'notice_glyph',  desc: "Notice Quill's brand",
          check: f => f.noticed_quill_glyph },
        { id: 'find_archive',  desc: 'Find matching glyph in Archive lore (check ruins shrine)',
          check: f => f.found_archive_glyph },
        { id: 'confront_quill', desc: 'Return to Quill',
          check: f => f.quill_truth_given },
      ],
      rewards: { xp: 250, items: [{ id: 'architects_resin', qty: 1 }], lore: "Quill's Mark" },
    },

    craft_first_item: {
      id: 'craft_first_item', name: 'Learning the Fire',
      category: 'side',
      desc: 'Use the campfire to craft something. Anyone can gather. Not everyone can make.',
      stages: [
        { id: 'craft_anything', desc: 'Craft any item at a campfire',
          check: f => f.crafted_first_item },
      ],
      rewards: { xp: 80, flags: ['recipe_book_unlocked'] },
    },

    // ── Education gates (placeholders — populated when curriculum is set) ───
    edu_gate_math_1: {
      id: 'edu_gate_math_1', name: 'The Architect\'s Calculation',
      category: 'education',
      subject: 'math',
      desc: 'An ancient mechanism blocks your path. The inscription reads: "Only those who understand balance may pass."',
      stages: [
        { id: 'solve', desc: 'Solve the Architect\'s puzzle', check: f => f.edu_gate_math_1_solved },
      ],
      rewards: { xp: 100, flags: ['edu_gate_warlord'] },
      quizConfig: { subject: 'math', questionCount: 5, timeLimit: 120 },
    },

    edu_gate_science_1: {
      id: 'edu_gate_science_1', name: 'The Ashwalker\'s Eye',
      category: 'education',
      subject: 'science',
      desc: 'To learn the Phantom Hunter technique, you must understand how things move through space.',
      stages: [
        { id: 'solve', desc: 'Complete the velocity trial', check: f => f.edu_gate_science_1_solved },
      ],
      rewards: { xp: 100, flags: ['edu_gate_phantom_hunter'] },
      quizConfig: { subject: 'science', questionCount: 5, timeLimit: 120 },
    },
  };

  // ── Quest runtime state ───────────────────────────────────────
  let questStates = {}; // questId -> { status, stageIndex, vars }

  function init(savedQuests) {
    questStates = {};
    for (const [id, def] of Object.entries(QUEST_DEFS)) {
      const saved = savedQuests?.[id];
      questStates[id] = saved || { status: S.INACTIVE, stageIndex: 0, vars: {} };
    }
    // Auto-start prologue
    startQuest('survive_ashfen');
    startQuest('find_survivors');
    startQuest('aldric_journal');
    startQuest('reach_thornkin_camp');
    startQuest('craft_first_item');
  }

  function startQuest(id) {
    if (!QUEST_DEFS[id]) return false;
    if (!questStates[id]) questStates[id] = { status: S.INACTIVE, stageIndex: 0, vars: {} };
    if (questStates[id].status === S.INACTIVE) {
      questStates[id].status = S.ACTIVE;
      return true;
    }
    return false;
  }

  // Call every frame in playing state
  function checkAll(flags) {
    const completed = [];
    for (const [id, qs] of Object.entries(questStates)) {
      if (qs.status !== S.ACTIVE) continue;
      const def = QUEST_DEFS[id];
      if (!def) continue;
      const stage = def.stages[qs.stageIndex];
      if (!stage) { qs.status = S.COMPLETE; continue; }
      if (stage.check(flags, qs.vars)) {
        qs.stageIndex++;
        if (qs.stageIndex >= def.stages.length) {
          qs.status = S.COMPLETE;
          grantRewards(def);
          completed.push({ id, name: def.name });
        }
      }
    }
    return completed;
  }

  function grantRewards(def) {
    const r = def.rewards;
    if (!r) return;
    if (r.xp) Player.gainXP(r.xp);
    if (r.items) r.items.forEach(i => Player.addItem(i.id, i.qty));
    if (r.flags) r.flags.forEach(f => Player.state.flags[f] = true);
    if (r.unlocks) r.unlocks.forEach(u => {
      if (u.startsWith('fast_travel_')) Player.state.flags['ft_' + u.replace('fast_travel_', '')] = true;
    });
  }

  function getQuestStatus(id) { return questStates[id]?.status ?? S.INACTIVE; }
  function isComplete(id) { return questStates[id]?.status === S.COMPLETE; }
  function isActive(id) { return questStates[id]?.status === S.ACTIVE; }
  function getStageIndex(id) { return questStates[id]?.stageIndex ?? 0; }
  function setVar(id, key, val) { if (questStates[id]) questStates[id].vars[key] = val; }
  function getVar(id, key) { return questStates[id]?.vars[key]; }

  function getJournalEntries() {
    const entries = [];
    for (const [id, qs] of Object.entries(questStates)) {
      if (qs.status === S.INACTIVE) continue;
      const def = QUEST_DEFS[id];
      if (!def) continue;
      const stages = def.stages.map((s, i) => ({
        desc: s.desc,
        done: i < qs.stageIndex || qs.status === S.COMPLETE,
      }));
      entries.push({
        id, name: def.name, category: def.category, desc: def.desc,
        status: qs.status, stages,
        statusLabel: [,'Active','Complete','Failed'][qs.status] || 'Unknown',
      });
    }
    // Sort: main active, side active, complete
    return entries.sort((a, b) => {
      const order = cat => cat === 'main' ? 0 : cat === 'education' ? 1 : 2;
      if (a.status !== b.status) return a.status === S.COMPLETE ? 1 : b.status === S.COMPLETE ? -1 : 0;
      return order(a.category) - order(b.category);
    });
  }

  function toSaveData() {
    const out = {};
    for (const [id, qs] of Object.entries(questStates)) out[id] = { ...qs, vars: { ...qs.vars } };
    return out;
  }

  return {
    S, QUEST_DEFS,
    init, startQuest, checkAll,
    getQuestStatus, isComplete, isActive, getStageIndex,
    setVar, getVar,
    getJournalEntries, toSaveData,
    grantRewards,
  };
})();
