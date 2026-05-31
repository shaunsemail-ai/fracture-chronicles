// Story: dialogue trees, lore, characters, Act 1 content
const Story = (() => {

  // ── Character definitions ─────────────────────────────────────
  const CHARACTERS = {
    player:   { name: 'You', color: '#d4c89a' },
    aldric:   { name: 'Aldric', color: '#c8a060', desc: 'Your mentor. Former imperial scholar.' },
    maren:    { name: 'Maren', color: '#a0c8a0', desc: 'A healer from Ashfen.' },
    pell:     { name: 'Pell', color: '#d4a0a0', desc: 'A ten-year-old boy. He hasn\'t spoken since the fire.' },
    sera:     { name: 'Sera', color: '#a0b4d4', desc: 'Imperial deserter. Thornkin scout.' },
    cole:     { name: 'Cole', color: '#8a7a60', desc: 'Thornkin resistance leader. Older. Tired.' },
    kira:     { name: 'Kira', color: '#c0a0d0', desc: 'Playful, brilliant, dangerous. Nobody knows where she came from.' },
    quill:    { name: 'Quill', color: '#d4ac0d', desc: 'Merchant. Too cheerful. Too informed.' },
    davan:    { name: 'Davan', color: '#7a9060', desc: 'Camp fighter. Gruff but fair.' },
    rael:     { name: 'Rael', color: '#9a8a6a', desc: 'A survivor from the eastern settlements. Eager. Too eager.' },
    narrator: { name: '', color: '#7a6e52' },
  };

  // ── Dialogue trees ────────────────────────────────────────────
  // Each dialogue is an array of nodes: { speaker, text, next?, choices? }
  // choices: [{ label, next, setFlag? }]
  const DIALOGUES = {};

  // ── Maren in the Ruins ───────────────────────────────────────
  DIALOGUES.maren_ruins = [
    { speaker: 'maren', text: 'You\'re alive. Good. I wasn\'t sure anyone else made it out of the east quarter.' },
    { speaker: 'maren', text: 'Don\'t ask me what happened. I don\'t know. I saw the Guard open the gates. I thought it was a drill.' },
    { speaker: 'maren', text: 'It wasn\'t a drill.' },
    { speaker: 'player', text: '(You want to ask about Aldric, but she looks like she hasn\'t slept.)' },
    { speaker: 'maren', text: 'I found bandages in the old supply room. I left what I could near the shrine. Take what you need.' },
    { speaker: 'maren', text: 'The Hollow are still moving through here. Don\'t stay too long. And — if you find others — send them south. The Thornwood. There\'s supposed to be a camp.' },
    { speaker: 'narrator', text: '[Maren gives you 2 bandages. Quest "Find the Survivors" updated.]' },
  ];

  DIALOGUES.maren_ruins_later = [
    { speaker: 'maren', text: 'Still here. Someone has to make sure the stragglers don\'t get turned around.' },
    { speaker: 'maren', text: 'Go. I\'ll be fine.' },
    { speaker: 'narrator', text: '(She probably won\'t.)' },
  ];

  // ── Pell in the Ruins ────────────────────────────────────────
  DIALOGUES.pell_ruins = [
    { speaker: 'narrator', text: 'The boy is sitting in the ash with his back against a collapsed wall. He\'s holding a boot that doesn\'t match either of the ones he\'s wearing.' },
    { speaker: 'pell', text: '...' },
    { speaker: 'player', text: '(You crouch down. He doesn\'t look at you.)' },
    { speaker: 'pell', text: '...' },
    { speaker: 'narrator', text: 'After a long moment, he stands up. He points south — toward the Thornwood — and starts walking.' },
    { speaker: 'narrator', text: '[Pell will follow. Quest "Find the Survivors" updated.]' },
  ];

  DIALOGUES.pell_following = [
    { speaker: 'pell', text: '...' },
    { speaker: 'narrator', text: '(He\'s still holding the boot.)' },
  ];

  // ── Story trigger: ashfen exit ───────────────────────────────
  DIALOGUES.story_ashfen_exit = [
    { speaker: 'narrator', text: 'The path south is open. The Thornwood is three hours on foot — less, if the Hollow haven\'t blocked the road yet.' },
    { speaker: 'narrator', text: 'Behind you: the ruins of the only place you\'ve ever known.' },
    { speaker: 'narrator', text: 'Aldric is dead. You watched it happen. He didn\'t beg. He didn\'t even look surprised.' },
    {
      speaker: 'narrator',
      text: 'He said something before the end. One word. You barely heard it over the smoke.',
      choices: [
        { label: 'Try to remember the word', next: 'story_aldric_word_A' },
        { label: 'Keep moving. You can grieve later.', next: 'story_ashfen_exit_leave', setFlag: 'chose_grieve_later' },
      ]
    },
  ];

  DIALOGUES.story_aldric_word_A = [
    { speaker: 'narrator', text: 'It might have been a name. It might have been a warning.' },
    { speaker: 'narrator', text: 'You\'re not sure those are different things.' },
    { speaker: 'narrator', text: '[Memory added: "Aldric\'s last word." You\'ll need more pieces to understand it.]' },
  ];

  DIALOGUES.story_ashfen_exit_leave = [
    { speaker: 'narrator', text: 'You put one foot in front of the other.' },
    { speaker: 'narrator', text: 'It\'s the only thing left to do.' },
  ];

  // ── Story trigger: shrine found ───────────────────────────────
  DIALOGUES.story_found_shrine = [
    { speaker: 'narrator', text: 'The shrine is old. Older than Ashfen, maybe. The glyph on the pedestal is one you\'ve never seen in any book.' },
    { speaker: 'narrator', text: 'When you put your hand near it, you feel nothing. And then you feel too much.' },
    { speaker: 'narrator', text: 'A flash: a city burning. But wrong — the smoke is going upward too fast. Like it\'s being pulled.' },
    { speaker: 'narrator', text: 'Then it\'s gone. Just old stone and ash.' },
    { speaker: 'narrator', text: '[Shrine attuned. Fast travel unlocked: Ashfen Shrine. Lore fragment added: "The First Fracture."]' },
  ];

  // ── Pell and the dog ─────────────────────────────────────────
  // Triggered when player has both Pell following AND the puppy adopted
  DIALOGUES.pell_meets_dog = [
    { speaker: 'narrator', text: 'Pell stops walking.' },
    { speaker: 'narrator', text: 'The dog has noticed him. It sits down in front of him and tilts its head — that broken-ear tilt — and waits.' },
    { speaker: 'narrator', text: 'Pell stares at it for a long time.' },
    { speaker: 'narrator', text: 'Then he sits down too.' },
    { speaker: 'narrator', text: 'The dog puts its head in his lap.' },
    { speaker: 'pell', text: '...' },
    { speaker: 'narrator', text: 'He still doesn\'t speak. But he pets the dog. And for a moment he looks like a kid instead of a witness.' },
    { speaker: 'narrator', text: '[Pell bonded with the dog. Something shifted. Quest "The Other Shoe" updated.]' },
  ];

  DIALOGUES.pell_after_bond = [
    { speaker: 'narrator', text: 'Pell walks with one hand near the dog\'s back. Not quite touching. Almost.' },
  ];

  // ── Meeting Sera ─────────────────────────────────────────────
  DIALOGUES.sera_first_meet = [
    { speaker: 'sera', text: 'Hold it.' },
    { speaker: 'sera', text: 'You\'re not Hollow. Good. I almost shot you anyway.' },
    { speaker: 'player', text: 'I\'m from Ashfen.' },
    { speaker: 'sera', text: '...' },
    { speaker: 'sera', text: 'I know. I was there.' },
    { speaker: 'player', text: 'You\'re imperial. That uniform—' },
    { speaker: 'sera', text: 'Was imperial. I cut off the rank insignia three days ago. The shoulder piece was heavy anyway.' },
    { speaker: 'sera', text: 'I was given the orders. I read them. I rode hard in the wrong direction and I haven\'t stopped moving since.' },
    {
      speaker: 'sera',
      text: 'I know what you want to ask. What was in those orders.',
      choices: [
        { label: 'What was in them?', next: 'sera_orders_A' },
        { label: 'Why should I trust you?', next: 'sera_trust' },
        { label: 'Later. I need to find the camp.', next: 'sera_camp_direction' },
      ]
    },
  ];

  DIALOGUES.sera_orders_A = [
    { speaker: 'sera', text: '"Suppress potential insurgency. Civilian losses acceptable. Burn what cannot be held. Classified under Imperial Writ of Pacification."' },
    { speaker: 'sera', text: 'Ashfen wasn\'t an insurgency. It was a grain village. My grandmother lived there.' },
    { speaker: 'sera', text: '...' },
    { speaker: 'sera', text: 'She might still be alive. I choose not to think about what that means right now.' },
  ];

  DIALOGUES.sera_trust = [
    { speaker: 'sera', text: 'You probably shouldn\'t. I\'m a soldier who followed orders for seven years before deciding not to. That\'s not a great record.' },
    { speaker: 'sera', text: 'But I know this forest. I know where the patrols are. And I\'m very good at keeping people alive.' },
    { speaker: 'sera', text: 'Make your call.' },
  ];

  DIALOGUES.sera_camp_direction = [
    { speaker: 'sera', text: 'Northwest through the ford. You\'ll smell the cook fires before you see the camp.' },
    { speaker: 'sera', text: 'Ask for Cole. Tell him I sent you. He\'ll hate that, but he\'ll let you in.' },
  ];

  DIALOGUES.story_meet_sera = [
    { speaker: 'narrator', text: 'Sera joins your party. She fights with a shortbow and knows the Thornwood well.' },
    { speaker: 'narrator', text: '[Companion Sera added. Quest "Reach the Thornkin Camp" updated.]' },
  ];

  // ── Cole - resistance leader ──────────────────────────────────
  DIALOGUES.cole_first_meet = [
    { speaker: 'cole', text: 'Another one. How many of you are there?' },
    { speaker: 'player', text: 'Three from Ashfen, that I found. More might still be coming.' },
    { speaker: 'cole', text: 'They\'re not. I had scouts. The road east is — it\'s gone.' },
    { speaker: 'cole', text: 'We have eighty-three people here. Forty-one of them can fight. I have enough food for two weeks if everyone eats half.' },
    { speaker: 'cole', text: 'We\'ve been watching the Hollow. They\'re not random. I don\'t know what they are, but they\'re not random.' },
    {
      speaker: 'cole',
      text: 'Sera sent you, she said. I don\'t like that. I\'ll take your help anyway.',
      choices: [
        { label: 'What do you need from me?', next: 'cole_quest_offer', setFlag: 'met_cole' },
        { label: 'What do you know about the Hollow?', next: 'cole_hollow_info' },
        { label: 'I need to keep moving. There has to be someone who knows what happened.', next: 'cole_dismissal' },
      ]
    },
  ];

  DIALOGUES.cole_hollow_info = [
    { speaker: 'cole', text: 'They started appearing six months ago. Before Ashfen. Isolated incidents — a patrol goes missing, a village on the frontier reports "dead travelers" in the roads.' },
    { speaker: 'cole', text: 'Then a month ago it changed. The incidents stopped being isolated.' },
    { speaker: 'cole', text: 'My best theory: something woke them up. Or woke up what\'s controlling them.' },
    { speaker: 'cole', text: 'I don\'t know what it is. I don\'t think the Empire does either, which means they started burning villages as a solution before they understood the problem.' },
    { speaker: 'narrator', text: '(He says this without anger. That somehow makes it worse.)' },
  ];

  DIALOGUES.cole_quest_offer = [
    { speaker: 'cole', text: 'There\'s a junction tower half a mile east. We need it clear — the Hollow are using it as a staging point.' },
    { speaker: 'cole', text: 'Clear it and I\'ll give you access to everything we\'ve found. Maps, supply caches, whatever our scouts have dug up.' },
    { speaker: 'narrator', text: '[Quest "Clear the Junction Tower" added.]' },
  ];

  DIALOGUES.cole_dismissal = [
    { speaker: 'cole', text: 'There\'s a library called the Sunken Archive. Two days south. The old scholars used it.' },
    { speaker: 'cole', text: 'If anyone wrote down what\'s happening — or what happened before — it would be there.' },
    { speaker: 'cole', text: 'We found evidence that the Archive was sealed deliberately. From the inside.' },
    { speaker: 'narrator', text: '[Lore added: "The Sunken Archive." New waypoint unlocked.]' },
  ];

  // ── Phase 2 dialogues ─────────────────────────────────────────

  DIALOGUES.story_enter_camp = [
    { speaker: 'narrator', text: 'The camp is real. Forty-odd people moving between rough shelters, a central fire burning low. Someone built this in a hurry and it shows.' },
    { speaker: 'narrator', text: 'A man is waiting at the gate. Not blocking it — watching.' },
    { speaker: 'cole', text: 'Alive. Good. I\'ve stopped being surprised.' },
    { speaker: 'cole', text: 'Cole. I run things here, which mostly means I count what we have left and tell people it\'s enough.' },
    { speaker: 'player', text: '(You notice the camp: a healer working east, someone with a merchant\'s stall near the west wall. Near the supply pile, a man you don\'t know is watching you watch him.)' },
    { speaker: 'cole', text: 'Maren\'s east if you\'re hurt. Don\'t waste her supplies. The man near the stall calls himself Quill. Don\'t ask him anything personal.' },
    { speaker: 'cole', text: 'You\'ll want to eat. After that, come find me. I have a problem you might be useful for.' },
    { speaker: 'narrator', text: '[Thornkin Camp unlocked. Quest "Follow the Path" complete.]' },
  ];

  DIALOGUES.quill_first_meet = [
    { speaker: 'quill', text: 'You made it! From Ashfen, yes? The eastern quarter, if the ash on your coat means anything.' },
    { speaker: 'player', text: 'I didn\'t tell you that.' },
    { speaker: 'quill', text: 'No, you didn\'t. Forgive me — habit. I read people. Occupational advantage. Quill, merchant and occasional optimist.' },
    { speaker: 'player', text: '(You notice a mark on his wrist. Not a scar. Too deliberate. Too familiar in shape, though you can\'t place it.)' },
    {
      speaker: 'player',
      text: 'That mark on your wrist—',
      choices: [
        { label: 'Ask about it directly', next: 'quill_glyph_ask' },
        { label: 'Let it go for now', next: 'quill_deflect_anyway' },
      ]
    },
  ];

  DIALOGUES.quill_glyph_ask = [
    { speaker: 'quill', text: 'Oh, this? Old story. Childhood thing. I fell asleep in a library once and woke up with a lot of reading done and very sore wrists.' },
    { speaker: 'quill', text: 'The inscription? Architectural notation. Completely mundane.' },
    { speaker: 'narrator', text: '(He is smiling. He is also lying. Both of these things are true at the same time and he knows you can tell.)' },
    { speaker: 'quill', text: 'Anyway. You look like someone who needs things. I have things. Shall we?' },
    { speaker: 'narrator', text: '[Quill\'s glyph noted. Quest "The Marked Hand" can now begin.]', setFlag: 'noticed_quill_glyph' },
  ];

  DIALOGUES.quill_deflect_anyway = [
    { speaker: 'quill', text: 'Smart. We all have things better left unasked on first meeting. Come back when you need supplies.' },
  ];

  DIALOGUES.quill_ambient_0 = [
    { speaker: 'quill', text: 'Supply and demand. Right now there is very little supply and an enormous amount of demand. This is called opportunity.' },
  ];

  DIALOGUES.quill_ambient_1 = [
    { speaker: 'quill', text: 'You know what\'s interesting about a collapsing civilization? Everyone starts valuing the same things. Warmth. Food. Someone watching the perimeter. Very clarifying.' },
  ];

  DIALOGUES.quill_ambient_2 = [
    { speaker: 'quill', text: 'I once sold a man a map to a place he was already standing. He said it was the most useful thing he\'d ever bought.' },
    { speaker: 'narrator', text: '(You cannot tell if this is a joke.)' },
  ];

  DIALOGUES.quill_ambient_3 = [
    { speaker: 'quill', text: 'The Hollow are expanding east. I know because the merchants who used to come from there have stopped coming. Merchants don\'t stop unless something very bad happens or something very good happens. I\'m told it is not the second one.' },
  ];

  DIALOGUES.quill_ambient_4 = [
    { speaker: 'quill', text: 'Do you know what the Architects built the towers for? Not military. Not watch-posts. They were — well. Doesn\'t matter. Old history.' },
    { speaker: 'narrator', text: '(He looks at his wrist without meaning to.)' },
  ];

  DIALOGUES.davan_trainer = [
    { speaker: 'davan', text: 'You\'re the one from Ashfen. I can tell by the way you hold your guard. Soft.' },
    { speaker: 'davan', text: 'I\'m Davan. I train the camp\'s fighters. You want to not die in the junction tower, I can help with that.' },
    {
      speaker: 'davan',
      text: 'What do you want to know?',
      choices: [
        { label: 'How does dodging work?', next: 'davan_teach_dodge' },
        { label: 'How do I fight Hollow?', next: 'davan_teach_hollow' },
        { label: 'What about magic users?', next: 'davan_teach_magic' },
        { label: 'Nothing right now.', next: 'davan_dismissal' },
      ]
    },
  ];

  DIALOGUES.davan_teach_dodge = [
    { speaker: 'davan', text: 'Dodge [C] gives you a brief window where nothing touches you. Two tiles of movement, short cooldown, burns stamina.' },
    { speaker: 'davan', text: 'The trick is timing. Dodge INTO the attack, not away from it. Counter-intuitive. Most people die learning it.' },
    { speaker: 'davan', text: 'Watch your stamina bar. If you run it to zero you can\'t dodge. That\'s when you die. Don\'t do that.' },
    { speaker: 'narrator', text: '(Davan demonstrates a dodge. You\'ve never seen someone your age move like that.)' },
  ];

  DIALOGUES.davan_teach_hollow = [
    { speaker: 'davan', text: 'Hollow aren\'t fast. They\'re patient. They wait for you to make a mistake.' },
    { speaker: 'davan', text: 'Brutes hit hard. Don\'t let them close range. Stun talents, frost effects, anything to slow them down.' },
    { speaker: 'davan', text: 'Sentinels are different. They pause before attacking. That pause is a dodge window. Use it or you\'ll be feeling the hit for a week.' },
    { speaker: 'narrator', text: '(He\'s talking about the tower. He knows what\'s in there.)' },
  ];

  DIALOGUES.davan_teach_magic = [
    { speaker: 'davan', text: 'Veilcasters are effective but exposed. You need distance and line of sight.' },
    { speaker: 'davan', text: 'Your Spell Power determines damage. Upgrade your WIL stat. The math is simple: more WIL, more MP, harder spells.' },
    { speaker: 'davan', text: 'One thing nobody tells you: if your weapon has spell power bonus, it stacks with your stats. Archive Staff is worth finding.' },
  ];

  DIALOGUES.davan_dismissal = [
    { speaker: 'davan', text: 'Fine. Come back when you\'ve been hit enough times to care about not getting hit.' },
  ];

  DIALOGUES.rael_first = [
    { speaker: 'rael', text: 'Hey! You\'re the one who came in through the south approach, right? I\'ve been watching for new arrivals.' },
    { speaker: 'rael', text: 'I\'m Rael. Made it here three days ago from the eastern settlements — Millhaven, you know it?' },
    { speaker: 'player', text: '(Millhaven is four days east even on a fast horse. Something doesn\'t add up.)' },
    { speaker: 'rael', text: 'Rough trip. I was lucky. Listen — where did you come from? What did you see on the road? Any organized groups, supply caches, that kind of thing?' },
    { speaker: 'narrator', text: '(He\'s asking the right questions. Too many of the right questions. Too fast.)' },
    {
      speaker: 'rael',
      text: 'Anything you remember could really help us plan.',
      choices: [
        { label: 'Tell him what you saw', next: 'rael_trusting', setFlag: 'rael_trusted' },
        { label: 'Keep it vague', next: 'rael_guarded' },
      ]
    },
  ];

  DIALOGUES.rael_trusting = [
    { speaker: 'narrator', text: '(You give him a general account. He listens carefully. Too carefully. Takes nothing out to write it down, but you\'re certain he\'s memorizing everything.)' },
    { speaker: 'rael', text: 'Good, good. That\'s really helpful. I\'ll let Cole know.' },
    { speaker: 'narrator', text: '(He won\'t.)' },
  ];

  DIALOGUES.rael_guarded = [
    { speaker: 'rael', text: 'Of course, of course. It\'s a lot to process. Maybe later.' },
    { speaker: 'narrator', text: '(He smiles. The smile is practiced.)' },
  ];

  DIALOGUES.rael_near_tent = [
    { speaker: 'narrator', text: '(Rael is near the entrance to Cole\'s tent. Again. He sees you notice and nods, like it\'s normal.)' },
    { speaker: 'rael', text: 'Just checking in on things. You know how it is.' },
    { speaker: 'narrator', text: '[Rael sighting noted. (' + '1/3' + ' observations toward "Something\'s Wrong.")]' },
  ];

  DIALOGUES.rael_caught = [
    { speaker: 'narrator', text: 'Cole listens without moving. His hands stay on the table. He looks at Rael like he\'s doing a calculation.' },
    { speaker: 'cole', text: 'Three times near the tent. The locked supply ledger. The timing with the patrol changes.' },
    { speaker: 'rael', text: 'This is — you can\'t seriously—' },
    { speaker: 'cole', text: 'I\'m not asking. I\'m telling you what I know. The telling is over. What comes next is your decision.' },
    { speaker: 'rael', text: '...' },
    { speaker: 'rael', text: 'They have my brother. Alright? The ones who sent me. They have Torren and they said if I didn\'t — they said—' },
    { speaker: 'narrator', text: '(He stops. It\'s the first real thing he\'s said since he arrived.)' },
    { speaker: 'cole', text: 'I know about Torren. I\'ve known for two days.' },
    { speaker: 'rael', text: '...' },
    { speaker: 'cole', text: 'I was waiting to see what you\'d do. You kept coming back to the tent but you never opened anything. That tells me something.' },
    { speaker: 'narrator', text: '[Rael\'s situation revealed. Cole\'s trust +1. Quest "Something\'s Wrong" complete. Chest unlocked.]', setFlags: ['cole_trust_unlocked', 'spy_reported'] },
  ];

  DIALOGUES.story_boss_approach = [
    { speaker: 'narrator', text: 'The Junction Tower is visible now. Stone older than anything standing in Ashfen. The air is wrong here — not cold, exactly. Thin.' },
    { speaker: 'narrator', text: 'The Hollow Sentinels at the base stop moving.' },
    { speaker: 'narrator', text: 'They are all facing you. They stopped at the same moment.' },
    { speaker: 'narrator', text: 'Like they heard something you didn\'t.' },
    { speaker: 'narrator', text: 'Then they turn.' },
  ];

  DIALOGUES.story_boss_face = [
    { speaker: 'narrator', text: 'It moves differently from the others. The armor is wrong — older, better-made. The crest is half-worn off but you recognize the pattern.' },
    { speaker: 'narrator', text: 'Ashfen guard standard. Sixth Ward. You passed the barracks every morning for three years.' },
    { speaker: 'narrator', text: 'Something used to live in that armor.' },
    {
      speaker: 'narrator',
      text: 'It comes at you without hesitation.',
      choices: [
        { label: 'Fight', next: 'story_boss_fight' },
        { label: 'Try to reach whatever\'s left inside', next: 'story_boss_reach' },
      ]
    },
  ];

  DIALOGUES.story_boss_fight = [
    { speaker: 'narrator', text: 'There is nothing left to reach. You know this. You fight.' },
  ];

  DIALOGUES.story_boss_reach = [
    { speaker: 'narrator', text: 'You say the name. Wren. You say it loud enough for whatever\'s wearing her to hear it.' },
    { speaker: 'narrator', text: 'It pauses for half a second.' },
    { speaker: 'narrator', text: 'Then it attacks harder than before.' },
    { speaker: 'narrator', text: '(Some things you can\'t undo by naming them.)' },
  ];

  DIALOGUES.story_boss_defeated = [
    { speaker: 'narrator', text: 'It stops moving.' },
    { speaker: 'narrator', text: 'Something leaves the armor. Not like smoke — more like the moment before a candle goes out. A shape that was almost a person and then wasn\'t.' },
    { speaker: 'narrator', text: 'The tower is quiet.' },
    { speaker: 'narrator', text: 'The armor crest catches the light. Sixth Ward. Ashfen. Someone\'s name is scratched on the inside of the gauntlet in small careful letters.' },
    { speaker: 'narrator', text: '[Hollow Sentinel defeated. Flag set: tower_sentinel_killed. Chest available upstairs.]' },
  ];

  DIALOGUES.cole_after_boss = [
    { speaker: 'cole', text: '...' },
    { speaker: 'cole', text: 'That was Wren. She was my second.' },
    { speaker: 'cole', text: 'She went into the tower three weeks ago. Scouting. We didn\'t hear from her.' },
    { speaker: 'narrator', text: '(He looks at the window for a long time. Not thinking. Just looking.)' },
    { speaker: 'cole', text: 'She was the best fighter I\'ve ever seen. If something was strong enough to hollow her—' },
    { speaker: 'cole', text: 'Don\'t tell me what it looked like. I know what it looked like.' },
    { speaker: 'narrator', text: '(You stay quiet. Sometimes staying quiet is the right thing.)' },
    { speaker: 'cole', text: 'The tower\'s clear?' },
    { speaker: 'player', text: 'Yes.' },
    { speaker: 'cole', text: 'Good.' },
    { speaker: 'narrator', text: '(He doesn\'t say anything else for a while.)' },
  ];

  DIALOGUES.quill_mystery_find = [
    { speaker: 'quill', text: 'Ah. You found the matching inscription in the Archive notes.' },
    { speaker: 'quill', text: 'You\'re more thorough than I expected. Pleasantly surprised.' },
    {
      speaker: 'quill',
      text: 'I promised: one true thing. Ask.',
      choices: [
        { label: 'What are you?', next: 'quill_truth_what' },
        { label: 'Who sent you?', next: 'quill_truth_who' },
        { label: 'What is the Fracture?', next: 'quill_truth_fracture' },
      ]
    },
  ];

  DIALOGUES.quill_truth_what = [
    { speaker: 'quill', text: 'I am someone who was present at the beginning of the thing that made all of this necessary.' },
    { speaker: 'quill', text: 'I have been — trying to fix it — for a very long time.' },
    { speaker: 'quill', text: 'I am not as good at it as I would like.' },
    { speaker: 'narrator', text: '[Lore added: "Quill\'s Mark." Major story fragment unlocked.]', setFlag: 'quill_truth_given' },
  ];

  DIALOGUES.quill_truth_who = [
    { speaker: 'quill', text: 'No one sent me. I sent myself. Six centuries is long enough to understand the difference.' },
    { speaker: 'narrator', text: '[Lore added: "Quill\'s Mark." Major story fragment unlocked.]', setFlag: 'quill_truth_given' },
  ];

  DIALOGUES.quill_truth_fracture = [
    { speaker: 'quill', text: 'A wound in the mechanism that keeps the dead from walking back. The Architects made it trying to fix something they should have left alone.' },
    { speaker: 'quill', text: 'I was one of the Architects.' },
    { speaker: 'quill', text: 'The others are dead. I am not. I have opinions about which of those outcomes is worse.' },
    { speaker: 'narrator', text: '[Lore added: "Quill\'s Mark." Major story fragment unlocked. Quest "The Marked Hand" stage 2 complete.]', setFlag: 'quill_truth_given' },
  ];

  // ── Memory Prison System ─────────────────────────────────────
  // When a major character dies, the Memory Prison quiz unlocks.
  // The player must complete a timed quiz to "recover" them.
  // Questions increase by 2 each attempt. Time stays fixed.

  const MEMORY_PRISON = {
    aldric: {
      characterName: 'Aldric',
      flavor: [
        'The space between memory and death is not empty.',
        'Aldric is here — or something that was Aldric. The questions are his price.',
        'He doesn\'t recognize you. He recognizes the shape of someone who knew him.',
        'Answer correctly. The wrong answers don\'t disappear here. They accumulate.',
      ],
      baseQuestions: 5,
      questionsPerAttempt: 2,  // adds 2 each time
      timeLimit: 90,           // seconds, never increases
      consequence: 'aldric_returned', // flag set on success
      failConsequence: 'aldric_more_lost', // stacks: deeper each fail
      subjects: [], // filled by parent when curriculum is set
      // Placeholder questions until curriculum is loaded:
      placeholderQuestions: [
        { q: 'What is 7 × 8?', choices: ['54','56','58','52'], answer: 1 },
        { q: 'Which planet is closest to the sun?', choices: ['Venus','Earth','Mercury','Mars'], answer: 2 },
        { q: 'What gas do plants absorb?', choices: ['Oxygen','Carbon dioxide','Nitrogen','Helium'], answer: 1 },
        { q: 'Who wrote Romeo and Juliet?', choices: ['Dickens','Marlowe','Shakespeare','Chaucer'], answer: 2 },
        { q: 'What is the square root of 144?', choices: ['10','11','12','13'], answer: 2 },
        { q: 'What is H2O?', choices: ['Salt','Water','Hydrogen gas','Helium'], answer: 1 },
        { q: 'How many sides does a hexagon have?', choices: ['5','6','7','8'], answer: 1 },
        { q: 'What is the largest ocean?', choices: ['Atlantic','Indian','Arctic','Pacific'], answer: 3 },
        { q: 'What force keeps planets in orbit?', choices: ['Magnetism','Friction','Gravity','Tension'], answer: 2 },
        { q: 'What is 15% of 200?', choices: ['20','25','30','35'], answer: 2 },
        { q: 'In what year did WW2 end?', choices: ['1943','1944','1945','1946'], answer: 2 },
        { q: 'What is the powerhouse of the cell?', choices: ['Nucleus','Ribosome','Mitochondria','Vacuole'], answer: 2 },
        { q: 'What is 2³?', choices: ['5','6','8','9'], answer: 2 },
        { q: 'Speed equals distance divided by what?', choices: ['Mass','Volume','Time','Force'], answer: 2 },
      ],
    },
  };

  function getMemoryPrisonQuiz(characterId, attemptNumber) {
    const prison = MEMORY_PRISON[characterId];
    if (!prison) return null;
    const questionCount = prison.baseQuestions + prison.questionsPerAttempt * attemptNumber;
    // Pull from curriculum or placeholder
    const pool = prison.curriculumQuestions?.length
      ? [...prison.curriculumQuestions, ...prison.placeholderQuestions]
      : prison.placeholderQuestions;
    // Shuffle and pick
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return {
      characterName: prison.characterName,
      flavor: prison.flavor[Math.min(attemptNumber, prison.flavor.length - 1)],
      questions: shuffled.slice(0, questionCount),
      timeLimit: prison.timeLimit,
      attemptNumber,
    };
  }

  // ── Lore fragments ────────────────────────────────────────────
  const LORE = {
    'The First Fracture': `Six centuries ago, a council of scholars called the Architects attempted to rewrite a fundamental law: the permanence of death. Their reasoning was recorded and later burned. What remains are three facts: they succeeded partially, they were not prepared for what came next, and none of them survived to explain themselves. The world has not been the same since. Most people don't know this. Most people don't need to.`,

    'The Hollow': `They are not the dead. Or: they are, but incompletely. Something is missing — the part that makes a person a person — and something else has taken the space. What that something else wants is unknown. What it does is organize them. Slowly. Methodically. Like it's building toward something.`,

    'The Writ of Pacification': `Imperial military doctrine, Sixth Legion. Used historically against frontier populations deemed "destabilizing." The decision to apply it to Ashfen was made at the command level, not the top — which means someone in the middle made a call. Who gave that order, and what they were told to justify it, remains unclear.`,

    'The Sunken Archive': `Built by the Architects. Hidden after the First Fracture, sealed from the inside. Found three years ago by a Thornkin survey team. Entrance discovered. Interior: unknown. The survey team who entered did not return. The one who stayed outside described hearing them inside for six days before the sounds stopped.`,

    'Aldric\'s Last Word': `You heard it wrong. Or you heard it right and don't understand it yet. The word was: Vael. You've never heard it. Aldric never mentioned it. It is not in any book you've read. [More pieces needed.]`,

    'Quill\'s Mark': `The glyph on Quill's wrist is an Architect's notation — specifically, a binding mark indicating membership in the First Council. Quill has confirmed he was one of the Architects. He survived the First Fracture. He has been alive for six hundred years. He sells camping supplies and is cheerful about it. It is unclear which of these facts is most disturbing.`,
  };

  // ── Dialogue state ────────────────────────────────────────────
  let currentDialogue = null;
  let currentNodeIndex = 0;
  let onComplete = null;

  function startDialogue(dialogueId, completeCb) {
    const d = DIALOGUES[dialogueId];
    if (!d) return false;
    currentDialogue = d;
    currentNodeIndex = 0;
    onComplete = completeCb || null;
    return true;
  }

  function getCurrentNode() {
    if (!currentDialogue) return null;
    if (currentNodeIndex >= currentDialogue.length) return null;
    return currentDialogue[currentNodeIndex];
  }

  function advance(choiceIndex = null) {
    if (!currentDialogue) return false;
    const node = getCurrentNode();
    if (!node) { end(); return false; }

    // Apply node-level flags (non-choice nodes)
    if (node.setFlag) Player.state.flags[node.setFlag] = true;
    if (node.setFlags) node.setFlags.forEach(f => { Player.state.flags[f] = true; });

    if (node.choices) {
      if (choiceIndex === null) return false;
      const choice = node.choices[choiceIndex];
      if (!choice) return false;
      if (choice.setFlag) Player.state.flags[choice.setFlag] = true;
      if (choice.setFlags) choice.setFlags.forEach(f => { Player.state.flags[f] = true; });
      if (choice.next) {
        currentDialogue = DIALOGUES[choice.next] || [];
        currentNodeIndex = 0;
        return true;
      } else {
        end(); return false;
      }
    }

    currentNodeIndex++;
    if (currentNodeIndex >= currentDialogue.length) {
      end(); return false;
    }
    return true;
  }

  function end() {
    const cb = onComplete;
    currentDialogue = null;
    currentNodeIndex = 0;
    onComplete = null;
    if (cb) cb();
  }

  function isActive() { return !!currentDialogue && currentNodeIndex < currentDialogue.length; }

  return {
    CHARACTERS, DIALOGUES, LORE, MEMORY_PRISON,
    startDialogue, getCurrentNode, advance, end, isActive,
    getMemoryPrisonQuiz,
  };
})();
