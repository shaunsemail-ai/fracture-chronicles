// Player curriculum configurations
// To add Pryce's subjects: fill in PLAYER_CONFIGS.Pryce.subjects with subject keys
// that exist in Curriculum.TOPICS, then add the topic objects to curriculum.js.
// The game automatically uses only the configured subjects for each player's quizzes.

const PLAYER_CONFIGS = {
  Merrick: {
    displayName: 'Merrick',
    subjects: ['biology', 'geometry'],
    grade: 9,
    school: 'Ironwood Ridge High School',
    notes: 'Honors Biology + Honors Geometry, Q1 loaded',
  },
  Pryce: {
    displayName: 'Pryce',
    subjects: [],        // Fill in when Shaun provides subject info
    grade: null,         // Fill in
    school: 'Ironwood Ridge High School',
    notes: 'Subjects TBD — add subject keys here and topic objects to curriculum.js',
  },
};

// Utility: get config for a profile name (falls back to generic if not found)
function getPlayerConfig(profileName) {
  return PLAYER_CONFIGS[profileName] || {
    displayName: profileName,
    subjects: ['biology', 'geometry'],
    grade: 9,
    school: '',
    notes: '',
  };
}

// All known player names (for character creation picker)
const PLAYER_NAMES = Object.keys(PLAYER_CONFIGS);
