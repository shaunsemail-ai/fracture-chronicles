// Global color palette and constants
const PAL = {
  // Tile colors
  grassA:     '#2a4a1e',
  grassB:     '#2d5220',
  grassC:     '#1e3615',
  stone:      '#38332e',
  stoneLight: '#4a4540',
  wall:       '#18160f',
  wallTop:    '#2a2620',
  water:      '#0f2235',
  waterShine: '#1a3550',
  tree:       '#162910',
  treeTrunk:  '#3d2b1a',
  path:       '#4a3a28',
  pathLight:  '#5a4a35',
  ash:        '#2e2a26',
  ember:      '#8b3a10',
  ruin:       '#302c28',
  ruinLight:  '#3d3830',
  chest:      '#6b4a1a',
  chestLid:   '#8b6020',
  door:       '#4a2a0a',
  doorFrame:  '#2a1a05',
  shrine:     '#2a1f3d',
  shrineGlow: '#6a4aad',

  // UI
  uiBg:       '#070910',
  uiBorder:   '#1e2235',
  uiBorderHi: '#3a3d5a',
  text:       '#d4c89a',
  textDim:    '#7a6e52',
  textHi:     '#f0e0b0',
  textRed:    '#c0392b',
  textGold:   '#d4ac0d',
  textBlue:   '#5dade2',
  textGreen:  '#27ae60',
  hpFill:     '#c0392b',
  hpBg:       '#2a0a08',
  mpFill:     '#2471a3',
  mpBg:       '#081525',
  xpFill:     '#d4ac0d',
  xpBg:       '#1a1500',
  staminaFill:'#27ae60',
  staminaBg:  '#051505',

  // Archetypes
  ironclad:   '#c0392b',
  ashwalker:  '#27ae60',
  veilcaster: '#8e44ad',

  // Player
  skinLight:  '#c8a882',
  skinMid:    '#a07850',
  hair:       '#2c1a0a',

  // Enemies
  hollowSkin: '#6a7a5a',
  hollowEye:  '#00ff88',
  hollowBrute:'#4a5a3a',
  shade:      '#1a1a2a',
  shadeGlow:  '#4455aa',
};

const TILE = {
  GRASS:      0,
  WALL:       1,
  WATER:      2,
  TREE:       3,
  EXIT:       4,
  PATH:       5,
  CHEST:      6,
  SIGN:       7,
  ASH:        8,
  RUIN_FLOOR: 9,
  RUIN_WALL:  10,
  SHRINE:     11,
  DEEP_WATER: 12,
  DOOR_OPEN:  13,
  DOOR_CLOSED:14,
  EMBER:      15,
};

const TILE_WALK = new Set([
  TILE.GRASS, TILE.PATH, TILE.ASH, TILE.RUIN_FLOOR,
  TILE.SHRINE, TILE.DOOR_OPEN, TILE.EXIT, TILE.EMBER,
]);

// Seeded pseudo-random for tile variation
function seededRand(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
