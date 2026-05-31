// World: tile maps, zone definitions, entity spawn data
const World = (() => {

  // ── Tile rendering ───────────────────────────────────────────
  function drawTile(ctx, type, px, py, size, seed) {
    const r = seededRand(seed);
    switch (type) {
      case TILE.GRASS: {
        const g = r() > 0.7 ? PAL.grassB : (r() > 0.4 ? PAL.grassA : PAL.grassC);
        ctx.fillStyle = g;
        ctx.fillRect(px, py, size, size);
        // Subtle grass detail
        if (r() > 0.75) {
          ctx.fillStyle = PAL.grassC;
          ctx.fillRect(px + r()*size*0.6, py + r()*size*0.6, 2, 3);
        }
        break;
      }
      case TILE.ASH: {
        ctx.fillStyle = PAL.ash;
        ctx.fillRect(px, py, size, size);
        if (r() > 0.6) {
          ctx.fillStyle = '#3a3530';
          ctx.fillRect(px + r()*size*0.7, py + r()*size*0.7, 3, 2);
        }
        break;
      }
      case TILE.EMBER: {
        ctx.fillStyle = PAL.ash;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = PAL.ember;
        ctx.fillRect(px + size*0.3, py + size*0.3, size*0.4, size*0.4);
        break;
      }
      case TILE.RUIN_FLOOR: {
        ctx.fillStyle = PAL.ruin;
        ctx.fillRect(px, py, size, size);
        ctx.strokeStyle = PAL.ruinLight;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px+1, py+1, size-2, size-2);
        break;
      }
      case TILE.WALL:
      case TILE.RUIN_WALL: {
        const base = type === TILE.RUIN_WALL ? PAL.ruin : PAL.wall;
        ctx.fillStyle = base;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = PAL.wallTop;
        ctx.fillRect(px, py, size, size * 0.25);
        // Stone block lines
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py + size*0.5); ctx.lineTo(px+size, py+size*0.5);
        ctx.moveTo(px+size*0.5, py+size*0.5); ctx.lineTo(px+size*0.5, py+size);
        ctx.stroke();
        break;
      }
      case TILE.WATER: {
        const t = Date.now() * 0.001;
        ctx.fillStyle = PAL.water;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = PAL.waterShine;
        const wx = px + (Math.sin(t * 1.5 + seed * 0.01) * 0.5 + 0.5) * size * 0.6;
        ctx.fillRect(wx, py + size * 0.3, size * 0.25, 2);
        break;
      }
      case TILE.DEEP_WATER: {
        ctx.fillStyle = '#081520';
        ctx.fillRect(px, py, size, size);
        break;
      }
      case TILE.TREE: {
        ctx.fillStyle = PAL.grassA;
        ctx.fillRect(px, py, size, size);
        // Trunk
        ctx.fillStyle = PAL.treeTrunk;
        ctx.fillRect(px + size*0.38, py + size*0.55, size*0.24, size*0.45);
        // Canopy
        ctx.fillStyle = PAL.tree;
        ctx.beginPath();
        ctx.arc(px + size*0.5, py + size*0.38, size*0.42, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#1f3515';
        ctx.beginPath();
        ctx.arc(px + size*0.42, py + size*0.3, size*0.22, 0, Math.PI*2);
        ctx.fill();
        break;
      }
      case TILE.PATH: {
        ctx.fillStyle = PAL.path;
        ctx.fillRect(px, py, size, size);
        if (r() > 0.6) {
          ctx.fillStyle = PAL.pathLight;
          ctx.fillRect(px + r()*size*0.5 + size*0.1, py + r()*size*0.5 + size*0.1, 3, 2);
        }
        break;
      }
      case TILE.CHEST: {
        ctx.fillStyle = PAL.grassA;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = PAL.chest;
        ctx.fillRect(px+size*0.15, py+size*0.3, size*0.7, size*0.55);
        ctx.fillStyle = PAL.chestLid;
        ctx.fillRect(px+size*0.15, py+size*0.25, size*0.7, size*0.2);
        ctx.fillStyle = '#d4ac0d';
        ctx.fillRect(px+size*0.43, py+size*0.45, size*0.14, size*0.14);
        break;
      }
      case TILE.SHRINE: {
        ctx.fillStyle = PAL.ruin;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = PAL.shrine;
        ctx.fillRect(px+size*0.2, py+size*0.1, size*0.6, size*0.8);
        ctx.fillStyle = PAL.shrineGlow;
        ctx.beginPath();
        ctx.arc(px+size*0.5, py+size*0.35, size*0.12, 0, Math.PI*2);
        ctx.fill();
        break;
      }
      case TILE.EXIT: {
        ctx.fillStyle = '#1a2a3a';
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = '#2a4a6a';
        ctx.fillRect(px+size*0.2, py+size*0.1, size*0.6, size*0.85);
        ctx.fillStyle = '#4a8aaa';
        ctx.fillRect(px+size*0.35, py+size*0.2, size*0.3, size*0.65);
        break;
      }
      default: {
        ctx.fillStyle = '#111';
        ctx.fillRect(px, py, size, size);
      }
    }
  }

  // ── Zone definitions ─────────────────────────────────────────
  const ZONES = {};

  // Zone: ashfen_ruins — the player's burned village
  ZONES.ashfen_ruins = {
    id: 'ashfen_ruins',
    name: 'Ashfen — The Ruins',
    music: 'somber',
    ambient: 'wind_ash',
    playerStart: { tx: 14, ty: 24 },
    width: 30, height: 30,
    // 0=grass,1=wall,2=water,3=tree,4=exit,5=path,6=chest,7=sign,8=ash,9=ruin_floor
    // 10=ruin_wall,11=shrine,12=deep_water,13=door_open,14=door_closed,15=ember
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,3,3,0,0,0,3,3,3,3,3,0,0,0,0,3,3,3,3,0,0,0,3,3,3,3,3,3,1],
      [1,3,8,3,0,0,0,3,8,8,3,3,0,0,0,0,3,8,3,3,0,0,0,3,8,3,3,3,3,1],
      [1,3,3,3,0,9,9,3,3,3,3,3,9,9,9,9,3,3,3,3,9,9,9,3,3,3,3,3,3,1],
      [1,0,0,0,0,9,10,10,10,10,10,10,9,9,9,9,10,10,10,10,9,9,0,0,0,0,0,3,3,1],
      [1,0,0,5,5,9,9,15,15,9,9,9,9,9,15,9,9,15,9,9,9,9,5,5,0,0,0,3,3,1],
      [1,0,0,5,5,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,5,0,0,0,3,3,1],
      [1,0,0,5,5,9,10,10,10,9,9,9,10,10,10,10,9,9,10,10,9,9,5,5,0,0,0,3,3,1],
      [1,0,3,5,5,9,10,8,10,9,9,9,10,8,8,10,9,9,10,8,9,9,5,5,3,0,0,3,3,1],
      [1,0,3,5,5,9,10,10,10,9,9,9,10,10,10,10,9,9,10,10,9,9,5,5,3,0,0,3,3,1],
      [1,0,0,5,5,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,5,0,0,0,3,3,1],
      [1,0,0,5,5,9,9,9,9,9,9,9,9,15,9,9,9,9,9,9,9,9,5,5,0,0,0,3,3,1],
      [1,3,3,5,5,10,10,10,10,10,9,9,10,10,10,9,9,9,10,10,10,10,5,5,3,3,0,3,3,1],
      [1,3,3,5,5,9,9,9,9,10,9,9,10,9,9,10,9,9,10,9,9,9,5,5,3,3,0,3,3,1],
      [1,3,3,5,5,9,9,9,9,10,9,9,10,11,9,10,9,9,10,9,9,9,5,5,3,3,0,3,3,1],
      [1,3,3,5,5,9,9,9,9,10,9,9,10,9,9,10,9,9,10,9,9,9,5,5,3,3,0,3,3,1],
      [1,3,3,5,5,10,10,10,10,10,9,9,10,10,10,10,9,9,10,10,10,10,5,5,3,3,0,3,3,1],
      [1,0,0,5,5,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,5,5,0,0,0,3,3,1],
      [1,0,0,5,5,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,8,5,5,0,0,0,3,3,1],
      [1,0,0,0,0,8,9,9,6,9,9,9,9,9,9,9,9,9,9,6,9,8,0,0,0,0,0,3,3,1],
      [1,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,0,0,0,0,0,0,0,3,3,3,3,1],
      [1,0,0,0,8,8,8,8,8,0,5,8,8,8,8,8,8,5,0,8,8,8,8,8,0,3,3,3,3,1],
      [1,3,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,3,3,3,1],
      [1,3,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,3,3,3,1],
      [1,3,0,0,0,0,0,8,0,0,5,5,5,4,5,5,5,5,0,0,8,0,0,0,0,0,3,3,3,1],  // row 24: exit south at col 13
      [1,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    exits: [
      { tx: 13, ty: 24, toZone: 'thornwood_edge', toTx: 14, toTy: 2, label: 'Thornwood' },
    ],
    chests: [
      { tx: 8, ty: 19, items: [{ id: 'leather_vest', qty: 1 }, { id: 'herb_minor', qty: 2 }], opened: false, id: 'chest_ruins_1' },
      { tx: 19, ty: 19, items: [{ id: 'arrow', qty: 15 }, { id: 'herb_minor', qty: 1 }], opened: false, id: 'chest_ruins_2' },
    ],
    npcs: [
      { id: 'npc_maren', tx: 11, ty: 17, name: 'Maren', portrait: 'maren',
        dialogue: 'maren_ruins', faction: 'survivor' },
      { id: 'npc_boy_pell', tx: 7, ty: 22, name: 'Pell', portrait: 'child',
        dialogue: 'pell_ruins', faction: 'survivor' },
    ],
    enemySpawns: [
      { type: 'hollow_walker', tx: 7,  ty: 10, patrol: [[7,10],[10,10],[10,7],[7,7]], count: 1 },
      { type: 'hollow_walker', tx: 18, ty: 8,  patrol: [[18,8],[22,8],[22,12],[18,12]], count: 1 },
      { type: 'hollow_walker', tx: 14, ty: 14, patrol: [[14,14],[16,14]], count: 1 },
      { type: 'ember_crawler', tx: 7,  ty: 5,  patrol: [[7,5],[9,5]], count: 1 },
      { type: 'ember_crawler', tx: 20, ty: 5,  patrol: [[20,5],[22,5]], count: 1 },
    ],
    petSpawns: [
      { petId: 'puppy',    tx: 9,  ty: 20 },   // hiding near chest
      { petId: 'veilmoth', tx: 13, ty: 14 },   // near the shrine
    ],
    storyTriggers: [
      { tx: 14, ty: 24, flag: 'entered_thornwood_path', once: true,
        dialogue: 'story_ashfen_exit' },
      { tx: 13, ty: 14, flag: 'found_shrine', once: true,
        dialogue: 'story_found_shrine' },
    ],
  };

  // Zone: thornwood_edge — first zone of the forest, the resistance approaches
  ZONES.thornwood_edge = {
    id: 'thornwood_edge',
    name: 'The Thornwood — Edge',
    music: 'tense',
    ambient: 'forest_wind',
    playerStart: { tx: 14, ty: 27 },
    width: 30, height: 30,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,0,0,0,3,3,3,0,0,0,3,3,3,3,3,0,0,0,3,3,3,0,0,0,3,3,3,1],
      [1,3,0,0,0,0,0,3,3,0,0,0,3,3,3,3,0,0,0,0,0,3,3,0,0,0,0,3,3,1],
      [1,3,0,0,6,0,0,0,0,0,0,0,3,3,3,3,0,0,6,0,0,0,0,0,0,0,0,3,3,1],
      [1,3,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,1],
      [1,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,3,3,3,3,1],
      [1,3,3,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,3,3,3,3,1],
      [1,3,3,0,0,0,3,3,3,3,0,0,0,2,2,2,0,0,3,3,3,0,0,0,0,3,3,3,3,1],
      [1,3,3,0,0,0,0,3,3,3,0,0,2,2,2,2,2,0,3,3,3,0,0,0,0,0,3,3,3,1],
      [1,3,3,3,0,0,0,0,3,3,0,0,2,2,12,2,2,0,3,3,0,0,0,0,3,3,3,3,3,1],
      [1,3,3,3,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,3,3,3,3,3,1],
      [1,3,3,3,0,0,0,3,3,0,0,0,0,2,2,2,0,0,0,3,3,0,0,0,3,3,3,3,3,1],
      [1,3,3,0,0,5,5,5,5,5,5,0,0,0,0,0,0,0,5,5,5,5,5,5,0,3,3,3,3,1],
      [1,3,0,0,5,5,3,3,3,3,5,5,0,0,0,0,0,5,5,3,3,3,3,5,5,0,3,3,3,1],
      [1,3,0,0,5,3,3,3,3,3,3,5,5,5,5,5,5,5,3,3,3,3,3,3,5,0,3,3,3,1],
      [1,3,0,0,5,3,3,0,0,3,3,3,3,5,5,3,3,3,3,0,0,3,3,3,5,0,3,3,3,1],
      [1,3,0,0,5,3,0,0,0,0,0,3,3,5,5,3,3,0,0,0,0,0,3,3,5,0,3,3,3,1],
      [1,3,0,0,5,0,0,0,0,0,0,0,3,5,5,3,0,0,0,0,0,0,0,3,5,0,3,3,3,1],
      [1,3,0,0,5,0,0,0,11,0,0,0,0,5,5,0,0,0,0,11,0,0,0,0,5,0,3,3,3,1],
      [1,3,0,0,5,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,5,0,3,3,3,1],
      [1,3,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,3,3,3,1],
      [1,3,3,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0,3,3,3,1],
      [1,3,3,3,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,3,3,3,3,1],
      [1,3,3,3,3,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,3,3,3,3,3,1],
      [1,3,3,3,3,3,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,3,3,3,3,3,3,3,1],  // row 27: exits south
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    exits: [
      { tx: 13, ty: 27, toZone: 'ashfen_ruins', toTx: 13, toTy: 23, label: 'Ashfen Ruins' },
      { tx: 14, ty: 27, toZone: 'ashfen_ruins', toTx: 14, toTy: 23, label: 'Ashfen Ruins' },
      { tx: 14, ty: 1,  toZone: 'thornkin_camp', toTx: 14, toTy: 27, label: 'Thornkin Camp' },
      { tx: 15, ty: 1,  toZone: 'thornkin_camp', toTx: 15, toTy: 27, label: 'Thornkin Camp' },
    ],
    chests: [
      { tx: 4, ty: 5, items: [{ id: 'herb_minor', qty: 2 }, { id: 'arrow', qty: 10 }], opened: false, id: 'chest_thorn_1' },
      { tx: 18, ty: 5, items: [{ id: 'shortbow', qty: 1 }], opened: false, id: 'chest_thorn_2',
        requireFlag: 'ashwalker_path' },
    ],
    npcs: [
      { id: 'npc_sera', tx: 14, ty: 21, name: 'Sera', portrait: 'sera',
        dialogue: 'sera_first_meet', faction: 'thornkin' },
      { id: 'npc_warden_cole', tx: 8, ty: 20, name: 'Cole', portrait: 'cole',
        dialogue: 'cole_first_meet', faction: 'thornkin' },
    ],
    enemySpawns: [
      { type: 'hollow_walker', tx: 6,  ty: 8,  patrol: [[6,8],[10,8],[10,12],[6,12]], count: 1 },
      { type: 'hollow_walker', tx: 20, ty: 8,  patrol: [[20,8],[24,8],[24,12],[20,12]], count: 1 },
      { type: 'shade',         tx: 14, ty: 11, patrol: [[12,11],[16,11]], count: 1 },
    ],
    storyTriggers: [
      { tx: 14, ty: 21, flag: 'met_sera', once: true, dialogue: 'story_meet_sera' },
    ],
    petSpawns: [
      { petId: 'cat', tx: 5, ty: 14 },
      { petId: 'fox', tx: 22, ty: 8 },
    ],
  };

  // ── Zone 3: thornkin_camp — 30x30 ────────────────────────────
  ZONES.thornkin_camp = {
    id: 'thornkin_camp',
    name: 'Thornkin Camp',
    music: 'camp',
    ambient: 'camp_fire',
    playerStart: { tx: 14, ty: 26 },
    width: 30, height: 30,
    // Palisade walls around perimeter, central fire pit, Cole's tent north,
    // Maren east, Quill west, training grounds south
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3], // north exits
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,1],
      [1,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,1],
      [1,3,3,3,1,0,0,9,9,9,14,9,9,9,9,9,9,9,9,9,9,9,9,0,0,1,3,3,3,1],  // cole tent row top
      [1,3,3,1,0,0,9,9,0,0,9,0,0,0,0,0,0,0,0,0,9,0,0,9,9,0,0,1,3,1],
      [1,3,1,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,1,1],
      [1,1,0,0,0,0,9,0,0,6,9,0,0,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,0,1], // cole tent: locked chest at 9,8
      [1,0,0,0,0,0,9,9,13,9,9,0,0,0,0,0,0,0,0,0,9,9,9,9,9,0,0,0,0,1], // cole tent door at 8,9
      [1,0,0,0,0,0,0,0,0,0,0,5,5,5,15,15,5,5,5,0,0,0,0,0,0,0,0,0,0,1], // central fire at 14-15,10
      [1,0,0,5,0,0,0,0,0,0,5,9,9,9,15,15,9,9,9,5,0,0,0,0,0,5,0,0,0,1], // fire surround
      [1,0,0,5,5,0,0,0,0,0,5,9,9,9,9,9,9,9,9,5,0,0,0,0,0,5,5,0,0,1],
      [1,0,0,5,5,5,0,0,0,0,5,9,9,9,9,9,9,9,9,5,0,0,0,0,5,5,5,0,0,1],
      [1,0,0,0,0,5,0,9,9,9,9,5,5,5,5,5,5,5,5,9,9,9,9,0,5,0,0,0,0,1], // quill stall left, maren right
      [1,0,0,0,0,5,0,9,0,0,9,0,0,0,0,0,0,0,0,9,0,0,9,0,5,0,0,0,0,1],
      [1,0,0,0,0,5,0,9,0,0,9,0,0,0,0,0,0,0,0,9,0,0,9,0,5,0,0,0,0,1],
      [1,0,0,0,0,5,0,9,9,13,9,0,0,0,0,0,0,0,0,9,13,9,9,0,5,0,0,0,0,1], // quill/maren doors
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1], // training path
      [1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1],
      [1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1],
      [1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1], // training grounds
      [1,0,0,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,1], // south exit to thornwood
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    exits: [
      { tx: 13, ty: 1, toZone: 'junction_approach', toTx: 13, toTy: 22, label: 'Junction Approach' },
      { tx: 14, ty: 1, toZone: 'junction_approach', toTx: 14, toTy: 22, label: 'Junction Approach' },
      { tx: 12, ty: 27, toZone: 'thornwood_edge', toTx: 14, toTy: 2,  label: 'Thornwood Edge' },
      { tx: 13, ty: 27, toZone: 'thornwood_edge', toTx: 14, toTy: 2,  label: 'Thornwood Edge' },
      { tx: 14, ty: 27, toZone: 'thornwood_edge', toTx: 15, toTy: 2,  label: 'Thornwood Edge' },
      { tx: 15, ty: 27, toZone: 'thornwood_edge', toTx: 15, toTy: 2,  label: 'Thornwood Edge' },
      { tx: 16, ty: 27, toZone: 'thornwood_edge', toTx: 15, toTy: 2,  label: 'Thornwood Edge' },
    ],
    chests: [
      { tx: 9, ty: 8, items: [{ id: 'ashfen_blade', qty: 1 }, { id: 'herb_major', qty: 2 }],
        opened: false, id: 'chest_camp_cole', requireFlag: 'cole_trust_unlocked' },
    ],
    npcs: [
      { id: 'npc_cole_camp',   tx: 12, ty: 7,  name: 'Cole',  portrait: 'cole',  dialogue: 'story_enter_camp', faction: 'thornkin' },
      { id: 'npc_maren_camp',  tx: 21, ty: 15, name: 'Maren', portrait: 'maren', dialogue: 'maren_ruins',      faction: 'thornkin' },
      { id: 'npc_quill',       tx: 8,  ty: 15, name: 'Quill', portrait: 'quill', dialogue: 'quill_first_meet', faction: 'neutral', isShopkeeper: true },
      { id: 'npc_davan',       tx: 14, ty: 21, name: 'Davan', portrait: 'davan', dialogue: 'davan_trainer',    faction: 'thornkin' },
      { id: 'npc_rael',        tx: 18, ty: 20, name: 'Rael',  portrait: 'rael',  dialogue: 'rael_first',       faction: 'survivor' },
    ],
    enemySpawns: [], // safe zone
    storyTriggers: [
      { tx: 14, ty: 26, flag: 'entered_thornkin_camp', once: true, dialogue: 'story_enter_camp' },
    ],
    petSpawns: [],
  };

  // ── Zone 4: junction_approach — 25x25 ────────────────────────
  ZONES.junction_approach = {
    id: 'junction_approach',
    name: 'Junction Approach',
    music: 'tense',
    ambient: 'forest_wind',
    playerStart: { tx: 12, ty: 22 },
    width: 25, height: 25,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,1],
      [1,3,3,3,3,3,0,0,5,5,5,5,5,5,5,5,5,0,0,3,3,3,3,3,1], // path begins
      [1,3,3,3,3,0,0,5,5,3,3,3,3,3,3,3,5,5,0,0,3,3,3,3,1],
      [1,3,3,3,0,0,5,5,3,3,3,3,3,3,3,3,3,5,5,0,0,3,3,3,1],
      [1,3,3,0,0,5,5,3,3,3,3,3,3,3,3,3,3,3,5,5,0,0,3,3,1],
      [1,3,0,0,5,5,3,3,3,3,0,0,0,0,0,3,3,3,3,5,5,0,0,3,1],
      [1,3,0,5,5,3,3,3,3,0,0,0,0,0,0,0,3,3,3,3,5,5,0,3,1],
      [1,3,5,5,3,3,3,3,0,0,15,15,9,9,0,0,0,3,3,3,3,5,5,1],  // campfire at 10-11,11
      [1,3,5,5,3,3,3,0,0,15,9,9,9,9,9,0,0,0,3,3,3,3,5,1],  // campfire surround
      [1,3,5,5,3,3,0,0,9,9,9,9,9,9,9,9,0,0,0,3,3,3,5,1],
      [1,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1],  // main path
      [1,3,5,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,5,1],
      [1,3,3,5,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,5,5,1],
      [1,3,3,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,1],  // clearing approach
      [1,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
      [1,3,3,3,0,0,9,9,9,9,9,9,9,9,9,9,9,9,9,0,0,0,3,1],  // tower base
      [1,3,3,0,0,9,10,10,10,10,10,10,10,10,10,10,9,0,0,3,1],
      [1,3,0,0,9,10,11,10,10,10,4,10,10,10,11,10,9,0,0,1],  // tower entrance exit at 10,21
      [1,3,0,9,9,10,10,10,10,10,9,10,10,10,10,10,9,9,0,1],
      [1,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,1], // south exits
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    exits: [
      { tx:  7, ty: 23, toZone: 'thornkin_camp', toTx: 13, toTy: 2,  label: 'Thornkin Camp' },
      { tx:  8, ty: 23, toZone: 'thornkin_camp', toTx: 14, toTy: 2,  label: 'Thornkin Camp' },
      { tx:  9, ty: 23, toZone: 'thornkin_camp', toTx: 14, toTy: 2,  label: 'Thornkin Camp' },
      { tx: 10, ty: 23, toZone: 'thornkin_camp', toTx: 14, toTy: 2,  label: 'Thornkin Camp' },
      { tx: 11, ty: 23, toZone: 'thornkin_camp', toTx: 15, toTy: 2,  label: 'Thornkin Camp' },
      { tx: 12, ty: 23, toZone: 'thornkin_camp', toTx: 15, toTy: 2,  label: 'Thornkin Camp' },
      // Tower interior — locked until sentinel killed
      { tx: 10, ty: 21, toZone: 'junction_tower_interior', toTx: 7,  toTy: 13, label: 'Junction Tower', requireFlag: 'approach_sentinel_killed' },
    ],
    chests: [
      { tx: 13, ty: 13, items: [{ id: 'herb_major', qty: 2 }, { id: 'veil_shard', qty: 1 }, { id: 'iron_draught', qty: 1 }],
        opened: false, id: 'chest_approach_1' },
    ],
    npcs: [],
    enemySpawns: [
      { type: 'hollow_walker', tx: 8,  ty: 8,  patrol: [[8,8],[11,8],[11,12],[8,12]], count: 1 },
      { type: 'hollow_walker', tx: 17, ty: 7,  patrol: [[17,7],[20,7],[20,11],[17,11]], count: 1 },
      { type: 'shade',         tx: 14, ty: 10, patrol: [[12,10],[17,10]], count: 1 },
      { type: 'hollow_brute',  tx: 7,  ty: 14, patrol: [[7,14],[10,14]], count: 1 },
      { type: 'hollow_walker', tx: 18, ty: 15, patrol: [[18,15],[21,15],[21,18],[18,18]], count: 1 },
      { type: 'hollow_brute',  tx: 12, ty: 18, patrol: [[12,18],[16,18]], count: 1 },
      // Mini-boss near tower
      { type: 'hollow_sentinel', tx: 10, ty: 19, patrol: [[9,19],[12,19]], count: 1 },
    ],
    storyTriggers: [
      { tx: 10, ty: 17, flag: 'story_boss_approach_seen', once: true, dialogue: 'story_boss_approach' },
    ],
    petSpawns: [],
  };

  // ── Zone 5: junction_tower_interior — 15x15 ──────────────────
  ZONES.junction_tower_interior = {
    id: 'junction_tower_interior',
    name: 'Junction Tower — Interior',
    music: 'boss',
    ambient: 'hollow_hum',
    playerStart: { tx: 7, ty: 13 },
    width: 15, height: 15,
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,10,10,10,10,10,10,10,10,10,10,10,10,10,1],
      [1,10,9,9,9,9,9,9,9,9,9,9,9,10,1],
      [1,10,9,9,9,9,9,9,9,9,9,9,9,10,1],
      [1,10,9,9,10,10,10,9,10,10,10,9,9,10,1],
      [1,10,9,9,10,9,9,9,9,9,10,9,9,10,1],
      [1,10,9,9,10,9,9,9,9,9,10,9,9,10,1],
      [1,10,9,9,9,9,9,9,9,9,9,9,9,10,1],  // boss center area
      [1,10,9,9,10,9,9,9,9,9,10,9,9,10,1],
      [1,10,9,9,10,9,9,9,9,9,10,9,9,10,1],
      [1,10,9,9,10,10,10,9,10,10,10,9,9,10,1],
      [1,10,9,9,9,9,9,11,9,9,9,9,9,10,1],  // shrine at 7,11
      [1,10,9,9,9,9,9,9,9,9,9,9,9,10,1],
      [1,10,9,9,9,9,9,4,9,9,9,9,9,10,1],   // exit south at 7,13
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    exits: [
      { tx: 7, ty: 13, toZone: 'junction_approach', toTx: 10, toTy: 20, label: 'Exit Tower' },
    ],
    chests: [
      { tx: 11, ty: 3, items: [
          { id: 'architects_resin', qty: 1 },
          { id: 'sentinel_shard', qty: 1 },
          { id: 'herb_major', qty: 2 },
        ], opened: false, id: 'chest_tower_boss', requireFlag: 'tower_sentinel_killed' },
    ],
    npcs: [],
    enemySpawns: [
      { type: 'hollow_sentinel', tx: 7, ty: 7, patrol: [[7,7],[7,4],[10,4],[10,7]], count: 1 },
    ],
    storyTriggers: [
      { tx: 7, ty: 13, flag: 'entered_tower_interior', once: true, dialogue: 'story_boss_face' },
    ],
    petSpawns: [],
  };

  // ── Zone manager ─────────────────────────────────────────────
  let currentZone = null;
  let tileCache = null;

  function loadZone(zoneId) {
    currentZone = ZONES[zoneId];
    tileCache = null; // clear cached draw
    return currentZone;
  }

  function getTile(tx, ty) {
    if (!currentZone) return TILE.WALL;
    if (tx < 0 || ty < 0 || tx >= currentZone.width || ty >= currentZone.height) return TILE.WALL;
    return currentZone.map[ty][tx];
  }

  function isWalkable(tx, ty) {
    return TILE_WALK.has(getTile(tx, ty));
  }

  function getExit(tx, ty) {
    if (!currentZone) return null;
    return currentZone.exits.find(e => e.tx === tx && e.ty === ty) || null;
  }

  function getChest(tx, ty) {
    if (!currentZone) return null;
    return currentZone.chests.find(c => c.tx === tx && c.ty === ty) || null;
  }

  function getNPC(tx, ty) {
    if (!currentZone) return null;
    return currentZone.npcs.find(n => n.tx === tx && n.ty === ty) || null;
  }

  function getStoryTrigger(tx, ty, flags) {
    if (!currentZone) return null;
    return currentZone.storyTriggers.find(t =>
      t.tx === tx && t.ty === ty && (!t.once || !flags[t.flag])
    ) || null;
  }

  function renderZone(ctx, camX, camY, tileSize, W, H) {
    if (!currentZone) return;
    const startTX = Math.max(0, Math.floor(camX / tileSize));
    const startTY = Math.max(0, Math.floor(camY / tileSize));
    const endTX = Math.min(currentZone.width, startTX + Math.ceil(W / tileSize) + 2);
    const endTY = Math.min(currentZone.height, startTY + Math.ceil(H / tileSize) + 2);

    for (let ty = startTY; ty < endTY; ty++) {
      for (let tx = startTX; tx < endTX; tx++) {
        const tile = currentZone.map[ty][tx];
        const px = tx * tileSize - camX;
        const py = ty * tileSize - camY;
        drawTile(ctx, tile, px, py, tileSize, ty * 100 + tx);
      }
    }
  }

  function getPetSpawn(tx, ty) {
    if (!currentZone?.petSpawns) return null;
    return currentZone.petSpawns.find(p => p.tx === tx && p.ty === ty) || null;
  }

  return {
    ZONES, loadZone, getTile, isWalkable, getExit, getChest, getNPC,
    getStoryTrigger, getPetSpawn, renderZone,
    get current() { return currentZone; }
  };
})();
