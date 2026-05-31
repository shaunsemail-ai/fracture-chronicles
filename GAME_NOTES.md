# Fracture Chronicles — Living Design Document

**For future Claude sessions:** This document contains the complete context for the Fracture Chronicles project. Read this before touching any code.

---

## 1. Project Overview

**Fracture Chronicles** is a mobile-first HTML5 top-down RPG built entirely in vanilla JavaScript and HTML5 Canvas. No dependencies, no build tools, no npm. Open `index.html` in a browser.

**Platform:** Mobile browser (iPhone/iPad primary). Edge-of-screen touch zones for movement (no D-pad overlay), small action buttons in lower-center. Also works on desktop (arrow keys / WASD).

**Players:** Shaun's two kids — ages 12 and 14, both freshmen at Ironwood Ridge High School in Tucson, AZ. Each gets their own save slot. The game is a standalone educational + entertainment tool — not connected to the Science Game Hub project.

**Design inspiration:** Zelda (tile maps, top-down combat), AoT (tone — dark, earned, character deaths matter), Skyrim (freeform leveling — stat points + talent trees), Fable (companion bond system).

**Core promise:** A real RPG that doesn't condescend to kids. Real story, real difficulty, real consequences. The educational content is woven in — it's not labeled "learning moment," it's just the way things work in the world.

---

## 2. File Structure

All JS is in `~/Documents/Fracture/js/`. Load order matters (see Section 3).

| File | Role |
|------|------|
| `palette.js` | Global color constants (`PAL`), tile type enum (`TILE`), walkable set (`TILE_WALK`), `seededRand()` helper |
| `config.js` | Per-player curriculum config (`PLAYER_CONFIGS`). Fill `Pryce.subjects` here when his courses are known. |
| `analytics.js` | Per-player quiz performance tracking. Separate localStorage key `fracture_analytics_v1`. Stats dashboard backend. |
| `input.js` | Edge-of-screen touch zones (left/right/top/bottom 18-22% = movement), small action buttons in center-right. `Input.consume()` for one-shot events. |
| `save.js` | localStorage save/load, 3 slot system (`Save.save()`, `Save.load()`, `Save.listSlots()`) |
| `items.js` | All item definitions: consumables, weapons (melee/ranged/magic), armor, accessories, ammo, quest items. `ITEMS` global dict. |
| `world.js` | Tile map definitions for all 5 zones, zone manager, `World.loadZone()`, exit/chest/NPC/trigger lookup, tile renderer |
| `story.js` | All dialogue trees (`Story.DIALOGUES`), character definitions, lore fragments, Memory Prison quiz data, dialogue state machine |
| `quests.js` | Quest definitions and runtime state. `Quests.checkAll()` called every frame. Journal entries. |
| `player.js` | Player state, movement interpolation, stats computation, talent trees (all 3), combat helpers, drawing |
| `entities.js` | Enemies (AI, patrol/chase/attack states), NPCs, projectiles, floating text, particles |
| `combat.js` | Basic attack (melee/ranged/magic), talent active abilities, dodge/roll, cooldowns |
| `pets.js` | All 4 pet types, adoption dialogues, pet AI follow, passives (early warning, scavenger, reveal, swift), hurt/recovery system, drawing |
| `crafting.js` | Campfire recipe system, timing mechanic (sweep bar), active buff management and rendering |
| `merchant.js` | Quill's shop, permanent stock + daily rotating specials, buy/sell, every-5th-buy discount system |
| `ui.js` | HUD, dialogue box, main menu, character creation, pause menu, inventory, talent tree, journal, Memory Prison quiz UI, screen flash, level-up overlay |
| `engine.js` | Main game loop, state machine, input dispatch, zone transitions, save on transition, campfire proximity, death handling |
| `curriculum.js` | Q1 curriculum for Honors Biology + Honors Geometry. Question banks, teaching NPC dialogues, `startTeachingQuiz()`, Knowledge Trial pool. **(Written in this session)** |

---

## 3. Load Order

Exact `<script>` tag order from `index.html`:

```
palette.js
input.js
save.js
config.js
analytics.js
items.js
world.js
story.js
quests.js
player.js
entities.js
combat.js
pets.js
crafting.js
merchant.js
ui.js
curriculum.js   ← add this tag after merchant.js
engine.js       ← always last
```

`engine.js` must be last because it calls `window.addEventListener('DOMContentLoaded', init)` and references all other modules. `curriculum.js` must come before `engine.js` but after `ui.js` (it references `UI.startMemoryPrison` infrastructure).

**Note:** `curriculum.js` is not yet in `index.html`. Add the script tag between `merchant.js` and `engine.js`.

---

## 4. Architecture

**Global namespace pattern.** Every module is an IIFE returning a frozen object:

```javascript
const ModuleName = (() => {
  // private state
  return { publicMethods, publicGetters };
})();
```

No import/export. Modules communicate by direct global reference. Load order = dependency order.

**Key globals:**
- `PAL` — color palette object
- `TILE` — tile type constants
- `TILE_WALK` — Set of walkable tile types
- `ITEMS` — all item definitions
- `Player` — player module (state, movement, stats, drawing)
- `World` — zone data and active zone manager
- `Story` — dialogue system (DIALOGUES dict is mutable — runtime dialogues get injected)
- `Quests` — quest runtime
- `Entities` — enemies, NPCs, projectiles, floating text
- `Combat` — attack/ability/dodge execution
- `Pets` — pet system
- `Crafting` — crafting state and buff management
- `Merchant` — shop state
- `UI` — all rendering helpers and menu state
- `Engine` — main loop and state machine (only module that depends on all others)
- `Curriculum` — education content and quiz utilities **(new)**

**State machine (Engine.STATE):**
`MAIN_MENU → CHAR_CREATE → PLAYING ↔ DIALOGUE ↔ PAUSE ↔ INVENTORY ↔ TALENTS ↔ JOURNAL ↔ CRAFTING ↔ SHOPPING ↔ MEMORY_PRISON`
Plus: `GAME_OVER`, `TRANSITION`

**Player.state.flags** is the single source of truth for all story/quest/game state. Flags are persisted in every save. This is how quest checks, dialogue branches, locked exits, and unlock conditions all work.

---

## 5. Story — Full Outline

### World Premise

**The First Fracture:** Six centuries ago, a council of scholars called the Architects attempted to rewrite a fundamental law — the permanence of death. They partially succeeded. The result was a wound in the mechanism that separates the living from the dead. The Hollow are the consequence: bodies without the inner thing that made them a person, filled instead with something organized and purposeful. The Architects all died. Except one.

**The Hollow:** Not the random undead of other fantasy games. They are organized. They patrol. They stage from fixed points. They respond to something. What that something wants is Act 2's question.

**The Empire:** A human government that burned Ashfen (the player's village) not because of the Hollow but under a military doctrine called the Writ of Pacification. The order was given at a command level below the top, meaning someone in the middle made a call. Who and why is a long-running thread.

**The Architects:** The group that caused the Fracture. Six centuries dead — mostly. Quill is one. He has been trying to fix his mistake for six hundred years. He's not doing great at it.

### Act 1 — Implemented Story Beats

1. **Prologue (pre-game, referenced in dialogue):** Aldric (the player's mentor, a former imperial scholar) is killed. The player watched it happen. Aldric's last word was "Vael" — a name/word the player has never heard.

2. **Ashfen Ruins (Zone 1):** Player starts in the ruins of their burned village. Find Maren (healer, pragmatic, exhausted). Find Pell (a 10-year-old boy who hasn't spoken since the fire, carrying a boot that doesn't fit). The ruins have the first shrine, first campfire, first enemies.

3. **First Choice:** At the zone exit, the player chooses: try to remember Aldric's last word (plants a memory seed) or keep moving (flags `chose_grieve_later`).

4. **Thornwood Edge (Zone 2):** Forest zone. Meet Sera — an imperial deserter who read her orders and rode in the wrong direction. She tells the player about the Writ of Pacification. She knows the way to the camp.

5. **Thornkin Camp (Zone 3):** The resistance. Cole leads it — he has 83 people, food for 2 weeks, and no good options. Meet Quill the merchant, Davan the fighter trainer, and Rael the new arrival.

6. **The Spy Thread:** Rael arrived from Millhaven (4 days east on a horse) "three days ago." He asks too many right questions too fast. The player observes him near Cole's tent 3 times, which starts the `find_the_spy` quest. When reported, Rael reveals he's being coerced — they have his brother Torren. Cole knew for two days and was waiting to see what Rael would do. Cole trusts the player now. Chest unlocked.

7. **Quill's Glyph:** First meeting with Quill shows a mark on his wrist. The player can ask or let it go. The glyph is an Architect's binding mark. Quill deflects ("fell asleep in a library"). Starts `quill_mystery` quest.

8. **Junction Approach (Zone 4) and Tower Interior (Zone 5):** Cole sends the player to clear a Hollow staging point. At the tower, the boss is a hollow sentinel wearing Ashfen guard armor — specifically the Sixth Ward standard. The player can name the person inside (Wren, Cole's second-in-command who went scouting three weeks ago). After the fight, Cole learns Wren was hollowed. He doesn't ask what it looked like.

9. **Quill's Truth (late Act 1 / Act 2 gate):** If the player finds a matching glyph inscription in the Archive lore, Quill keeps his promise: "one true thing." He confirms he was one of the Architects. He caused the Fracture. He has been alive for six hundred years. He sells camping supplies because people need things and he has to be somewhere.

### Characters

| Character | Role | Key Notes |
|-----------|------|-----------|
| **Player** | Protagonist, survivor of Ashfen | Class choice (Ironclad/Ashwalker/Veilcaster), no fixed name |
| **Aldric** | Mentor, killed in prologue | Former imperial scholar, last word "Vael," recoverable via Memory Prison |
| **Maren** | Healer, Ashfen survivor | Pragmatic, running on empty, stays in ruins to help stragglers |
| **Pell** | 10-year-old boy, non-verbal | Carries a boot that belonged to his older sister (died 2 years ago in a fire, unrelated to the Hollow). Bonds with the puppy. |
| **Sera** | Imperial deserter, Thornkin scout | Read her orders, rode away. Grandmother lived in Ashfen. Shortbow fighter, knows the forest. |
| **Cole** | Thornkin resistance leader | Tired, methodical, deeply competent. Was waiting to see what Rael would do before acting. His grief for Wren is quiet. |
| **Quill** | Merchant, surviving Architect | Too cheerful, too informed, sells camping supplies for 600 years. Has an Architect glyph on his wrist. Is NOT a villain — he is trying to fix his mistake. |
| **Davan** | Camp fighter, trainer | Gruff but practical. Teaches dodge mechanics, enemy types, weapon theory. |
| **Rael** | Spy (coerced, not malicious) | Sent by unknown faction holding his brother Torren. Arrived "from Millhaven" too fast. Kept coming back to Cole's tent but never opened anything. |
| **Kira** | *Not yet implemented* | Playful, brilliant, dangerous. Nobody knows where she came from. Planned for Zone 6+. |
| **Wren** | Hollow boss (was Cole's second) | Already dead when the player arrives. The hollow sentinel in the Junction Tower is her body. She has her name scratched on the inside of her gauntlet. |

### Twists and Seeds Planted

1. **Vael** — Aldric's last word. Not in any known language or text. It is a name. *Whose* name is the central mystery of Acts 1-2.
2. **Quill is an Architect** — revealed through dialogue after the player finds the matching glyph. He's 600 years old. He's trying to fix the Fracture.
3. **Rael's coercion** — his faction (Empire-adjacent, or something else?) is holding his brother. Who sent him is not resolved in Act 1.
4. **The veilmoth's default names include "Vael"** — if a player names their veilmoth Vael, that's deliberate foreshadowing. The veilmoth's `passiveId` is `reveal`.
5. **The Hollow are organized** — Cole notes this. They don't attack randomly. Something is directing them. This is Act 2.
6. **Wren's armor** — a real person with a real name was hollowed. The Hollow aren't just monsters.
7. **The Sunken Archive** — the Architects' hidden library, sealed from the inside. The survey team that entered was heard inside for 6 days before the sounds stopped.

### Planned Future Acts

**Act 2 (outline, not implemented):**
- The Sunken Archive — 2 days south. Player enters the sealed library. The Architects wrote down what happened. The archive is guarded by something that is neither Hollow nor alive.
- The player learns the word "Vael." It is the Architects' name for the process of making someone permanently dead — an irreversibility mark. Aldric was telling the player they were about to be Vael'd (permanently killed). He was wrong, or the thing doing it chose not to finish.
- The faction holding Torren is revealed: not the Empire. Something older.
- Kira appears, drawn by the player's presence in the Archive. She knows things she shouldn't. She's been in the Archive before.

**Act 3 (concept, not even outlined):**
- The player has to close the Fracture from the inside. Quill can't do it because the one who caused it can't be the one to end it (rule of the binding mark). Someone who wasn't there has to carry it.
- Aldric knew this. That's why he was teaching the player.

---

## 6. All Zones

### Zone 1: `ashfen_ruins`
**Name:** Ashfen — The Ruins
**Size:** 30x30
**Music:** somber | **Ambient:** wind_ash
**Player start:** tx:14, ty:24
**What's here:** Burned village. Ash tiles, ruin floors, collapsed walls. Central area with shrines and campfires. Two chest loot piles.
**NPCs:** Maren (tx:11, ty:17), Pell (tx:7, ty:22)
**Enemies:** 3 hollow walkers, 2 ember crawlers
**Pet spawns:** Puppy near chest (tx:9, ty:20), Veilmoth near shrine (tx:13, ty:14)
**Chests:** leather_vest+herb_minor, arrow+herb_minor
**Exit:** South at tx:13,ty:24 → thornwood_edge
**Story triggers:** Story opening dialogue on exit, shrine discovery lore

### Zone 2: `thornwood_edge`
**Name:** The Thornwood — Edge
**Size:** 30x30
**Music:** tense | **Ambient:** forest_wind
**Player start:** ty:27 (coming from south)
**What's here:** Dense forest paths, a small lake (DEEP_WATER center), two shrines.
**NPCs:** Sera (tx:14, ty:21), Cole (tx:8, ty:20)
**Enemies:** 2 hollow walkers, 1 shade
**Pet spawns:** Cat (tx:5, ty:14), Fox (tx:22, ty:8)
**Chests:** herb_minor+arrow (open), shortbow (requires flag `ashwalker_path`)
**Exits:** South → ashfen_ruins; North → thornkin_camp
**Story triggers:** `story_meet_sera` on Sera's tile

### Zone 3: `thornkin_camp`
**Name:** Thornkin Camp
**Size:** 30x30
**Music:** camp | **Ambient:** camp_fire
**Player start:** ty:26
**What's here:** Palisade walls, central fire pit (EMBER tiles at 14-15,10), Cole's tent (north), Quill's stall (west at tx:8), Maren's tent (east at tx:21), training grounds (south rectangle).
**NPCs:** Cole (tx:12, ty:7), Maren (tx:21, ty:15), Quill — shopkeeper (tx:8, ty:15), Davan (tx:14, ty:21), Rael (tx:18, ty:20)
**Enemies:** none (safe zone)
**Chests:** ashfen_blade+herb_major (requires flag `cole_trust_unlocked`)
**Exits:** North (tx:13-14, ty:1) → junction_approach; South → thornwood_edge
**Special:** Rael proximity sighting system — being near Rael near Cole's tent increments `rael_total_sightings`. At 3 sightings, `find_the_spy` quest starts.

### Zone 4: `junction_approach`
**Name:** Junction Approach
**Size:** 25x25
**Music:** tense | **Ambient:** forest_wind
**What's here:** Forest path leading to a stone tower. Mid-zone has a campfire with stone table (craft area).
**NPCs:** none
**Enemies:** 2 hollow walkers, 1 shade, 2 hollow brutes, 1 hollow sentinel (mini-boss near tower)
**Chests:** herb_major+veil_shard+iron_draught
**Exits:** South → thornkin_camp; Tower door (tx:10, ty:21) → junction_tower_interior (requires flag `approach_sentinel_killed`)
**Special:** Sabotage mechanic — if player hasn't reported Rael before entering, 2 extra hollow walkers are added on load.
**Story trigger:** `story_boss_approach` at tx:10, ty:17

### Zone 5: `junction_tower_interior`
**Name:** Junction Tower — Interior
**Size:** 15x15 (compact boss arena)
**Music:** boss | **Ambient:** hollow_hum
**What's here:** Stone floor with structural columns, a shrine (tx:7, ty:11).
**NPCs:** none
**Enemies:** Hollow Sentinel (boss, tx:7, ty:7) — this is Wren
**Chests:** architects_resin+sentinel_shard+herb_major (requires flag `tower_sentinel_killed`)
**Exit:** South at tx:7, ty:13 → back to junction_approach
**Story trigger:** `story_boss_face` on entry (first time) — player can choose to fight or try to reach whoever's left inside.

---

## 7. All Systems

### Combat

**Basic attack** (`[B]` button) dispatches based on equipped weapon type:
- **Melee:** Hit the tile in front of player. Crit chance based on AGI. Berserker talent scales below 30% HP.
- **Ranged:** Spawn projectile toward facing direction. Consumes ammo. Crit possible. Phantom Hunter talent: first shot from stealth = 3x damage.
- **Magic:** Fires veil bolt (or uses basic bolt if talent not learned). Costs MP.

**Dodge** (`[C]` button): 2-tile movement in facing direction. 30 iframes. Costs 12 stamina. 1.2s cooldown.

**Talents (Active):** All 9 active talents have a cost (stamina or MP) and a cooldown. Triggered by game logic, not currently mapped to a dedicated button — they activate through the basic attack system when certain talents are learned (e.g., having `veil_bolt` causes the magic attack to route through it).

**Damage formula:** `dmg = max(1, raw - def)`. Raw comes from weapon stats + STR scaling. DEF comes from armor + END scaling + iron_skin talent.

**Status effects on player:** poison (damage over time), burn, slow, venom. Rendered as colored dots above player sprite.

### Talent Trees

Three trees, all available to all classes. 3 tiers each, tier N requires tier N-1 point.

**Ironclad (red):**
- Tier 1: Heavy Strike (active, melee AoE boost), Iron Skin (passive, +DEF), Taunt (active, force aggro)
- Tier 2: Whirlwind (active, hit all adjacent), Endurance (passive, +stamina), Shield Bash (active, stun)
- Tier 3: Warlord (passive, STR scales with END — **edu gate: math**), Berserker (passive, damage boost below 30% HP)

**Ashwalker (green):**
- Tier 1: Quick Shot (active, faster ranged), Silent Step (passive, reduced detection range), Tracking (active, reveal enemies)
- Tier 2: Multi-Shot (active, spread), Shadow Step (active, 3-tile dash), Venom Arrow (passive, poison chance)
- Tier 3: Phantom Hunter (passive, stealth first shot 3x — **edu gate: science**), Eagle Eye (passive, +range, +crit)

**Veilcaster (purple):**
- Tier 1: Veil Bolt (active, magic projectile), Arcane Reserve (passive, +MP), Hex (active, reduce enemy damage)
- Tier 2: Frost Bind (active, slow enemy), Veil Shield (active, damage absorb), Memory Drain (active, MP from hits)
- Tier 3: Unraveling Blast (active, AoE nuke — **edu gate: history/architects**), Echo Cast (passive, free cast chance)

**Education gates:** Three tier-3 talents require education quests to unlock. Implemented in Player's `spendTalentPoint()` — checks `Player.state.flags['edu_gate_' + talentId]`. Currently:
- `edu_gate_warlord` — math subject
- `edu_gate_phantom_hunter` — science subject
- (unraveling has history gate — Architects lore)

### Crafting

**Access:** Stand adjacent to a campfire (EMBER tile), press `[A]`. Opens CRAFTING state.

**Timing mechanic (sweep bar):**
1. Select recipe from list. Press `[A]` to begin timing.
2. A white cursor sweeps left-to-right across a bar in 2 seconds.
3. Press `[A]` when the cursor is in a zone:
   - 0-20% or 80-100%: MISS — lose one ingredient
   - 20-35% or 65-80%: GOOD — craft succeeds normally
   - 35-65%: PERFECT — craft succeeds + bonus

**Perfect bonus types:**
- `double_qty`: Craft double the output quantity
- `bonus_duration`: Crafted buff lasts 2x as long (flag `__craft_bonus_{item_id}` set)
- `bonus_restore`: Crafted potion restores 50% more (flag `__craft_bonus_{item_id}` set)

**All 14 current recipes:** Healing Potion, Strong Healing Potion, Mana Tincture, Antidote, Hunter's Brew, Focus Tea, Iron Draught, Swift Step, Restored Tincture, Purified Veil, Battle Ration, Fire Arrows, Camp Remedy, Warden Compound (boss prep). Plus Sentinel Elixir (requires flag `sentinel_killed`).

**Active buffs:** Rendered as a circular icon row below the HP bar. Show abbr, countdown arc, and seconds remaining.

### Merchant (Quill)

**Access:** Face Quill's tile and press `[A]`. First time triggers `quill_first_meet` dialogue, then opens shop. Subsequent times: 40% chance of ambient line first, then shop.

**Stock:** 11 permanent items (herbs, veil shards, antidotes, ammo, trail rations, armor). Plus 2 daily specials from a pool of 12 (seeded by calendar date — same specials all day, changes at midnight).

**Discount system:** Every 5th purchase this session is 20% off. Quill will say a line about it. `sessionBuys` tracks this. Hint shows "N buys until Quill's discount" during the session.

**Sell:** Players can sell any non-quest item with `value > 0` for 50% of base value.

### Pets

**4 pet types:**

| Pet | Found in | Passive | Recovery message |
|-----|----------|---------|-----------------|
| **Puppy (Dog)** | ashfen_ruins (tx:9,ty:20) | Early warning — growls before enemy aggro | "limped back to camp" |
| **Cat** | thornwood_edge (tx:5,ty:14) | Scavenger — drops random items post-combat every ~45s | "vanished and reappeared at camp, uninjured, somehow" |
| **Veilmoth** | ashfen_ruins (tx:13,ty:14) | Reveal — highlights hidden chests within 3 tiles | "dissolved into light and reformed at the nearest shrine" |
| **Fox** | thornwood_edge (tx:22,ty:8) | Swift — +8% movement speed | "outran whatever caught it and found camp on its own" |

**Adoption:** Approach a pet's spawn tile, press `[A]`. Dialogue + name choice from 4 default names. Can only have one active pet at a time; previous goes to "at_camp."

**Pets cannot permanently die.** When hurt (low-probability hit during combat), pet enters `recovering` state with a flavor message. Recovers to `at_camp` on next zone enter or shrine rest. On shrine rest or zone enter with no active pet, camp pet re-joins automatically.

**Pell bond:** The puppy has `pellBond: true`. When the puppy is adopted, flag `pell_can_bond` is set. The dialogue `pell_meets_dog` fires when both Pell is following and the puppy is active. (Full trigger logic TBD — quest "The Other Shoe.")

**The veilmoth's default names include "Vael"** — this is a deliberate story seed.

### Quests

**Auto-started on new game:** survive_ashfen, find_survivors, aldric_journal, reach_thornkin_camp, craft_first_item

**Quest categories:** main (gold), side (blue), education (green)

**All current quests:**

| Quest | Category | Stages |
|-------|----------|--------|
| The Night Ashfen Burned | main | Reach southern gate |
| Find the Survivors | main | Find Maren + Pell |
| Reach the Thornkin Camp | main | Enter Thornwood, find Sera/Cole, reach camp |
| Clear the Junction Tower | main | Reach tower, kill 3 sentinels, destroy anchor |
| What He Knew (Aldric) | side | Read journal, find "Vael" lore |
| The Other Shoe (Pell) | side | Ask Maren about the boot, understand why |
| What Healers Carry (Maren) | side | Gather 3 ashroot, return to Maren |
| Follow the Path | main | Reach Thornkin Camp |
| Something's Wrong (Rael) | side | Observe Rael 3x, report to Cole |
| The Marked Hand (Quill) | side | Notice glyph, find Archive glyph, confront Quill |
| Learning the Fire | side | Craft any item at campfire |
| The Architect's Calculation | education | Solve math puzzle (edu gate for Warlord) |
| The Ashwalker's Eye | education | Solve science puzzle (edu gate for Phantom Hunter) |

**How quests work:** `Quests.checkAll(flags)` is called every frame in PLAYING state. Each quest stage has a `check(flags, vars)` function. When a stage passes, `stageIndex` increments. When all stages pass, `grantRewards()` runs (XP, items, flags). The `completed` array triggers the quest-complete toast message.

### Memory Prison

**Purpose:** Resurrection mechanic for major characters (currently Aldric). When a major character dies, a "Memory Prison" quiz becomes available.

**Mechanics:**
- Quiz starts at 5 questions, adds 2 each failed attempt
- Time limit: 90 seconds (never increases)
- Pass threshold: 70% correct
- Pass: flag `mem_prison_{characterId}` set, character returns
- Fail: attempt number increments, next attempt has more questions

**The eerie framing:** "The space between memory and death is not empty." Aldric is there, doesn't recognize the player by name — only recognizes the shape of someone who knew him. Wrong answers "accumulate" in the prison.

**Questions:** Currently using placeholder trivia questions. Will be replaced by curriculum questions once `Curriculum` module is integrated. Hook: `Story.MEMORY_PRISON.aldric.curriculumQuestions` — if this array is populated, it's mixed into the question pool.

**Integration point for `curriculum.js`:** Call `Story.MEMORY_PRISON.aldric.curriculumQuestions = Curriculum.getKnowledgeTrialQuiz();` or similar to inject curriculum questions into the prison pool.

---

## 8. Education System

### Current State

The education system is a **placeholder scaffold**. The infrastructure exists:
- Education gate flags checked in `Player.spendTalentPoint()`
- `edu_gate_math_1` and `edu_gate_science_1` quest definitions
- UI draws "[Study required]" on gated talents
- Memory Prison quiz UI is fully functional and reusable

What was missing: **actual curriculum content**. This was added in this session via `curriculum.js`.

### The Kids

- Both freshmen at **Ironwood Ridge High School**, part of **Amphitheater USD**, Tucson AZ
- Currently taking **Honors Biology** and **Honors Geometry**
- Grade level: 9th, ages 12 and 14
- Curriculum: Q1 content (beginning of school year)

### Teaching Model

Education happens through **in-world NPCs** who are survivors with relevant backgrounds. They do not announce themselves as teachers. They talk like people who know things and think you should too.

- **Biology** topics: a character who "used to be a doctor before all this" — she uses the game world as metaphor (camp as cell, tents as organelles)
- **Geometry** topics: a Thornkin elder who studied the Architects' structures — uses the ruins and towers as examples

Teaching NPCs deliver a 3-5 node dialogue: introduce themselves, give the lesson using in-world metaphor, offer a quiz.

### Pop Quiz Undo Mechanic — See Section 9

---

## 9. Pop Quiz Undo Mechanic — The Knowledge Trial

**Concept:** When the game gets unfair — player dies, pet gets hurt, boss fight goes badly — a "?" button appears in the top-right corner. Pressing it offers a **Knowledge Trial**: answer 5 curriculum questions in 60 seconds. Pass (70%, meaning 4/5 or 5/5), and the bad thing is undone or softened. Fail, and nothing changes (plus a cooldown before you can try again).

This is not a get-out-of-jail-free card. It requires actual knowledge. The kids will know that performing well in school directly makes the game easier.

### Trigger Conditions

The "?" button appears when ANY of these is true:
1. **GAME_OVER state** — player just died. Offers to undo death and return with 1 HP.
2. **Pet just got hurt** — `Player.state.flags.knowledge_trial_pet` is set to the pet ID. Offers to immediately recall the pet (skip recovery).
3. **Boss fight just failed** — `Engine.lastGameEvent.type === 'boss_fail'` within the last 60 seconds. Offers slight difficulty reduction (reduces boss HP by 20% for this encounter).
4. **Player is at a shrine** — always available as a "learn and earn" mode. Reward: gold, a random useful item, or an XP boost.

### Quiz Parameters

- **5 questions**, drawn from `Curriculum.getKnowledgeTrialQuiz()` — random mix from both subjects
- **60 second time limit** — tighter than Memory Prison (which has 90s for 5+ questions)
- **70% pass threshold** — must answer 4 of 5 correctly
- **90 second cooldown** on failure — prevents spamming
- **Tracked in:** `Engine.knowledgeTrialCooldown` timer

### UI Elements

- **`drawKnowledgeTrialButton(ctx, W, H, available)`:** Small pulsing "?" circle in top-right corner of screen. Only shown when available. Pulsing done with `Math.sin(Date.now() * 0.005)` alpha modulation.
- **`drawKnowledgeTrialPrompt(ctx, W, H, eventType, detail)`:** Confirmation overlay with dark background. Shows what the trial will undo/grant. "YES" and "NO" choices.
- **Touch handling:** Added to the existing touchstart listener in engine.js.

### Outcomes by Trigger Type

| Trigger | Pass Outcome | Fail Outcome |
|---------|-------------|--------------|
| Player death (GAME_OVER) | Revive with 1 HP, continue | Nothing; stay at game over menu |
| Pet hurt | Pet immediately returns | Pet recovers normally (no change) |
| Boss fail | Boss HP reduced by 20% for this session | Nothing; boss stays full |
| Shrine (learn-and-earn) | Random reward (XP/gold/item) | Nothing; no consequence |

### Implementation Location

- **`engine.js`:** `lastGameEvent` tracking, GAME_OVER rendering updated, `knowledgeTrialCooldown` timer, input handling for "?" button and prompt
- **`pets.js`:** `petHurt()` now also sets `Player.state.flags.knowledge_trial_pet = petId`
- **`ui.js`:** `drawKnowledgeTrialButton()` and `drawKnowledgeTrialPrompt()` added
- **`curriculum.js`:** `getKnowledgeTrialQuiz()` returns 5 random questions from the full pool

---

## 10. Roadmap

### Built (as of this session)

- Zones 1-5 (Ashfen Ruins, Thornwood Edge, Thornkin Camp, Junction Approach, Junction Tower)
- Full combat: melee, ranged, magic, dodge
- Talent trees: all 3 trees, all tiers, education gates wired (flags only, no curriculum content previously)
- Crafting: timing mechanic, all 14+ recipes, active buffs
- Merchant: Quill, daily specials, discount system
- Pets: all 4 types, full passives, hurt/recovery system
- Quests: 13 defined quests, journal, rewards
- Memory Prison: quiz infrastructure, placeholder questions
- Act 1 story: full dialogue trees for all characters
- Save system: 3 slots, localStorage
- **Curriculum module: Q1 Honors Bio + Geometry question banks (written this session)**
- **Knowledge Trial (pop quiz undo) system (written this session)**

### Phase 3 Planned

- **Companion combat AI (Sera):** Sera follows in combat zones, fires arrows at enemies in range. She has finite HP but recovers between zones. Her dialogue changes based on player actions.
- **Shop expansion:** More items, item tiers, Quill-specific story items that unlock as the story progresses.
- **Zone 6+:** Sea cliffs (escape route south), Corrupted Cathedral (Hollow major site, Act 2 dungeon), Sky Fortress (Architects' floating base, Act 3). Each zone approximately 30x30.
- **Curriculum injection into Memory Prison:** Replace placeholder questions with actual curriculum. `Story.MEMORY_PRISON.aldric.curriculumQuestions` is the hook.
- **More story acts:** Act 2 outline (Sunken Archive, the word Vael revealed), Act 3 concept (close the Fracture).
- **More boss fights:** Every 2-3 zones. Each boss is a story moment, not just a health pool.
- **More twists:** Kira's true identity, the faction holding Torren, what Aldric actually meant.

### Far Future

- **Multiplayer save sharing:** Siblings can show each other their saves. Requires a very simple backend or export-to-clipboard feature.
- **Voice/audio:** Sound effects and music tracks. Currently no audio.
- **Full Acts 2-3:** Complete story through the Fracture closure.
- **More teaching NPCs:** One NPC per curriculum topic, each with their own in-world backstory.

---

## 11. Tone Guide

The tone of this game is what makes it different from educational software. Follow this strictly.

**Dark like Attack on Titan.** Major characters die. Wren was a person and now she is not, and Cole has to live with that. Pell carries a dead sister's shoe. The boot lore is not resolved with a hug — it is resolved with Maren explaining quietly that Pell wore mismatched shoes for weeks after his sister died, and nobody made him stop.

**Villains have reasons.** The Empire burned Ashfen under a military doctrine. Someone in the command chain made a call they thought was justified. Rael was a spy because they had his brother. Even the Hollow are acting under direction from something that wants something.

**Aldric died.** He is recoverable via Memory Prison but his death in the prologue is not undone — Memory Prison is a way to keep his *memory* and wisdom accessible, not to bring him back to life in the normal world. This distinction matters and should be maintained.

**Cannibalism implied (Hollow faction).** There is a Hollow-adjacent human faction that is implied but never shown to have gone very dark. It is never described graphically. The implication is there for older players who notice it; younger players can miss it without losing story comprehension.

**No sexual content.** None. The kids are 12 and 14.

**Pets cannot permanently die.** This is a hard rule. The pet gets hurt and leaves, not dies. The recovery flavor text is always light (the veilmoth "dissolves into light and reforms at the nearest shrine"). This is sacred. Do not create any scenario in which a pet has a permanent death.

**Resurrection via Memory Prison is gated by actual learning.** The harder the quiz (more attempts = more questions), the more the player had to fail before. This is designed so kids who study can undo the worst moments. It rewards academic engagement directly.

**No emojis in any in-game text.** They render as blank squares in iMessage and certain game views. Use plain ASCII only.

---

## 12. Technical Notes for Future Sessions

**Adding a new dialogue:** Inject into `Story.DIALOGUES` directly. Runtime injection is the standard pattern (see how crafting, shrine, and chest dialogues work). Format: array of `{ speaker, text, choices?, setFlag?, setFlags?, next? }`.

**Adding a new zone:** Add to `World.ZONES` dict. Follow the existing format exactly — `id`, `name`, `music`, `ambient`, `playerStart`, `width`, `height`, `map` (2D array of TILE values), `exits`, `chests`, `npcs`, `enemySpawns`, `petSpawns`, `storyTriggers`. Then add a zone transition from an existing zone's `exits` array.

**Adding a quest:** Add to `Quests.QUEST_DEFS`. Auto-start it in `Quests.init()` if it should begin immediately, or start it via `Quests.startQuest(id)` from a dialogue `setFlag` trigger or story event.

**Adding an item:** Add to `ITEMS` in `items.js`. If it is a consumable, include a `use(player)` function. Add it to `Merchant`'s stock or recipe outputs as needed.

**curriculum.js integration into index.html:** Add `<script src="js/curriculum.js"></script>` between `merchant.js` and `engine.js` in index.html.

**Knowledge Trial state flow:**
```
PLAYING → [? tapped] → knowledge_trial_prompt (overlay, not state change)
  → [YES] → quizState set via Curriculum → state = MEMORY_PRISON (reusing quiz UI)
  → quiz done → if passed: apply outcome, clear event; if failed: set cooldown
  → state = PLAYING (or GAME_OVER if was death trial and failed)
```

The Knowledge Trial reuses the MEMORY_PRISON quiz UI. The only difference is the flavor text and the `onPass`/`onFail` callbacks.

---

## 13. Curriculum Integration — Story Puzzles and Mini-Games

**Design principle (Shaun's direction):** Education should feel *natural*, not bolted on. The best moments are when the player has to apply something they just learned to solve a real problem in the world — not a quiz popup, but a puzzle that only works if you understand the concept. Think Resident Evil's statue/symbol puzzles, but the symbols are equations and the arrangement is the answer.

---

### Category A — Story-Embedded Concept Moments

These are moments in dialogue or exploration where a concept is needed to make a decision. The player who paid attention wins. The player who didn't loses time or takes damage.

**Examples:**

**Bio: Cell Membrane (Active/Passive Transport)**
- Location: Corrupted Cathedral (planned Zone 6+)
- Setup: Dr. Kessler finds a sealed Architect door with two valves. One valve requires energy (glowing), one runs "freely." She explains: some things cross boundaries for free, some need to be pushed. The player must choose which valve to open first to not trigger the alarm. Answer: passive transport does not require energy — open the non-glowing valve first.
- Wrong choice: alarm triggers, spawns 3 enemies.

**Bio: Water Chemistry / Polarity**
- Location: Sunken Archive (Act 2 dungeon)
- Setup: Two fluids mixing in a flooded room. Rael (before betrayal is revealed) asks which fluid will dissolve in the water and which won't. Choosing correctly lets you drain the room without triggering a chemical reaction hazard. Answer: polar substances (like salt) dissolve in polar water; non-polar (like oil) do not.
- Wrong choice: the room fills faster; hazard adds a timed escape component.

**Geo: Angle Relationships (Parallel Lines)**
- Location: Junction Approach
- Setup: A collapsed bridge. Voss examines the support beams, says one beam is a transversal crossing two parallel support beams. The player must identify the correct corresponding angle to determine which bolt position is still load-bearing. Answer: corresponding angles are equal when lines are parallel.
- Wrong choice: bridge collapses under player's weight during crossing — fall damage + retry from edge.

**Geo: Triangle Congruence**
- Location: Sky Fortress (Act 3 planned)
- Setup: Architect machinery requires inserting a triangular key. Two triangles on display. The player must identify which is congruent to the original key using the inscribed markings (SSS, SAS, ASA clues). Wrong triangle jams the lock and triggers a combat encounter.

---

### Category B — Environmental Puzzles (Resident Evil style)

These are physical puzzles where understanding the subject is the mechanic. The player interacts with objects in the world — no quiz prompt, no UI overlay. Just the world behaving according to the rules.

**Bio: Cell Organelles — The Organelle Chamber**
- Location: Corrupted Cathedral (planned)
- Setup: A room modeled as a giant cell. Six pedestals, each with a symbol (endoplasmic reticulum, mitochondria, nucleus, ribosome, vacuole, Golgi body). Each has a function description on the wall in-world language: "the old power source," "the instruction vault," "the protein factory," etc.
- The door opens only when the player places the correct "energy crystal" on the pedestal whose description matches mitochondria ("the old power source").
- Fail state: wrong pedestal triggers a pulse that damages the player and resets the room.
- Davan explains in pre-puzzle dialogue what each Architect structure "feeds on" — the descriptions map to organelle functions without using biology terms. Smart players catch it.

**Geo: Triangle Congruence — The Sentinel's Lock**
- Location: Junction Tower Interior (Zone 5 — boss area, post-boss chest)
- Setup: Locked chest after Kira fight. Four triangular panels on the wall. One is marked as the "original." The other three have angle/side tick marks (SSS, SAS, AAS, invalid). Player must touch the correct congruent panel to unlock the chest.
- This can already be inserted as a world interaction before the existing chest. Quill can comment on it from across the room.

**Geo: Midpoint/Distance — The Broken Bridge**
- Location: Thornwood Edge or new zone
- Setup: Two bridge anchor points visible. Player must interact with both anchor stones to "measure" them (a floated distance number appears above each). Then a third point (the bridge midpoint) is marked. A puzzle dial asks which value represents the correct midpoint distance. Answer: average the two endpoint values.
- Correct: bridge rebuilds (walkable tile changes). Wrong: 2-second shock damage.

---

### Category C — Mini-Games (Chess / Tactical Puzzles)

**The Voss Cipher Board** (Geometry / Logic)
- Location: Thornkin Camp — Voss's corner of the training grounds
- Mechanic: A 4x4 grid. Voss places angle markers (acute, right, obtuse) in some cells. Player must complete the grid such that each row and column contains each type exactly once — like a Sudoku but with angle types.
- Completion reward: XP, Voss trusts the player more (unlock extra training dialogue).
- Implementation: A mini-game state (`PUZZLE` state in engine.js), drawn on canvas. Simple grid + touch/key input to cycle cell value.

**The Specimen Board** (Biology / Classification)
- Location: Dr. Kessler's corner of camp
- Mechanic: 6 specimen cards face-down. Kessler flips them one at a time. Player must sort them into two columns: "performs cellular respiration" vs "performs only fermentation." Memory component + bio knowledge required.
- Completion reward: Unlock Dr. Kessler's second teaching tier (cell transport lesson).

**The Architect's Equation Lock** (Geometry / Algebra)
- Location: Sunken Archive dungeon
- Mechanic: Three stone slabs with symbols. Each slab has a partial geometric equation with a missing value (e.g., find the missing angle in a triangle where two angles are given). Player rotates each slab to the correct number (a dial mechanic — up/down cycles through values). When all three are correct, the door opens.
- Teaches: triangle angle sum = 180, exterior angles, etc.

---

### Implementation Plan for Puzzles

Each puzzle is a separate mini-state:
1. Add `PUZZLE` to STATE enum in engine.js
2. Each puzzle definition lives in a new file `js/puzzles.js` (object keyed by puzzle ID)
3. Puzzle has: `draw(ctx, W, H)`, `handleInput(action)`, `isComplete()`, `onComplete()` callbacks
4. Engine enters `PUZZLE` state from a world interaction (same as CRAFTING triggers off campfire EMBER tile)
5. Analytics records puzzle attempts + outcomes (new column in topic records)

**Priority order for implementation:**
1. Triangle congruence panel (Junction Tower) — already has the zone, simplest first
2. Organelle chamber (Corrupted Cathedral) — needed for Act 2
3. Voss Cipher Board (Thornkin Camp) — good early-game engagement hook
4. Bridge midpoint puzzle (Thornwood Edge variant) — small, can be inserted soon

---

### Connecting to Talent Gates

Currently, Tier-3 talent gates check a curriculum flag. Replacing that with a puzzle outcome is better — instead of "pass quiz to unlock," it becomes "complete the organelle chamber to unlock Veilcaster Tier 3." This makes the gate feel like an in-world initiation, not a test.

Proposed mapping:
- Ironclad Tier 3 (Warlord): Complete the Broken Bridge midpoint puzzle (you calculated the load-bearing point)
- Ashwalker Tier 3 (Phantom Hunter): Complete the Specimen Board classification (Kessler teaches you how to track Hollow metabolism)
- Veilcaster Tier 3 (Unraveling): Complete the Organelle Chamber (you understand what the Architects used to power their magic)
