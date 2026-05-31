// Curriculum — Q1 Honors Biology + Honors Geometry
// Ironwood Ridge High School, Amphitheater USD, Tucson AZ
// Arizona state standards aligned, 9th grade honors level
// Teaching NPCs use in-world Fracture Chronicles framing

const Curriculum = (() => {

  // ── Subject metadata ─────────────────────────────────────────
  const SUBJECTS = {
    biology: {
      id: 'biology',
      name: 'Honors Biology',
      teacherBase: 'Dr. Kessler',
      teacherFlavor: 'A former field surgeon who has seen too much. She patches up wounded Thornkin now. She says the body is a system, and systems either hold or they fail.',
      color: '#27ae60',
    },
    geometry: {
      id: 'geometry',
      name: 'Honors Geometry',
      teacherBase: 'Voss',
      teacherFlavor: 'An elderly Thornkin who spent thirty years studying the Architects\' structures. He can tell you the angle of every stress joint in the Junction Tower from memory.',
      color: '#2471a3',
    },
  };

  // ── Topics ────────────────────────────────────────────────────
  const TOPICS = {
    biology: [
      {
        id: 'bio_scientific_method',
        name: 'Scientific Method & Experimental Design',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `When I needed to know which herb could stop the bleeding, I didn't just try them all and hope. I asked a question: does Ashroot close wounds faster than Thornweed? Then I made a prediction. Then I tested it — same wound type, same patient weight, same conditions I could control. Only change: the herb. That's a controlled experiment. Everything that doesn't change is your controlled variable. The one thing you do change is your independent variable. What you measure — wound closure time — that's your dependent variable. Science isn't magic. It's asking one question at a time and not lying to yourself about the answer.`,
        questions: [
          {
            q: 'A scientist wants to test whether a new fertilizer helps plants grow taller. She grows 10 plants with the fertilizer and 10 without it, keeping all other conditions the same. What is the independent variable?',
            choices: ['Plant height', 'Number of plants', 'Presence or absence of fertilizer', 'Amount of sunlight'],
            answer: 2,
          },
          {
            q: 'In the fertilizer experiment above, what is the dependent variable?',
            choices: ['The fertilizer', 'Plant height', 'Water amount', 'Soil type'],
            answer: 1,
          },
          {
            q: 'Dr. Kessler tests two herbs on identical wounds. She controls temperature, wound depth, and patient age. The only thing that changes is which herb she uses. The plants with no treatment represent the:',
            choices: ['Dependent variable', 'Independent variable', 'Control group', 'Hypothesis'],
            answer: 2,
          },
          {
            q: 'Which of the following is an example of a testable (scientific) hypothesis?',
            choices: [
              'The Hollow are evil.',
              'Patients given Ashroot will have 50% less bleeding after 10 minutes than patients given no treatment.',
              'The best herb is the one Maren recommends.',
              'Healing is a gift from the shrines.',
            ],
            answer: 1,
          },
          {
            q: 'A researcher tests a new antibiotic on 5 patients and all 5 improve. She concludes the antibiotic is effective. What is the most significant problem with her conclusion?',
            choices: [
              'She should have used a different antibiotic.',
              'The sample size is too small to draw a reliable conclusion.',
              'She should have measured improvement differently.',
              'Antibiotics do not affect patients.',
            ],
            answer: 1,
          },
          {
            q: 'Which step comes AFTER forming a hypothesis in the scientific method?',
            choices: ['Observation', 'Research', 'Experimentation', 'Asking a question'],
            answer: 2,
          },
          {
            q: 'Dr. Kessler records data from 40 patients over 3 weeks. This data is best described as:',
            choices: ['A hypothesis', 'A conclusion', 'Quantitative evidence', 'A theory'],
            answer: 2,
          },
          {
            q: 'What is the difference between a scientific theory and a scientific law?',
            choices: [
              'A theory is proven; a law is not.',
              'A law describes what happens; a theory explains why it happens.',
              'A theory is an opinion; a law is a fact.',
              'There is no difference.',
            ],
            answer: 1,
          },
          {
            q: 'In an experiment testing the effect of sleep on reaction time, a researcher measures how fast participants press a button when a light flashes. Which is the controlled variable?',
            choices: ['Hours of sleep', 'Reaction time', 'The color of the light', 'Age of participants (held constant)'],
            answer: 3,
          },
          {
            q: 'A student claims that Veil Shards restore memory because her grandfather said so. Why is this NOT a scientific claim?',
            choices: [
              'Veil Shards do not restore memory.',
              'It is based on personal testimony rather than controlled, repeatable experimentation.',
              'Memory cannot be measured.',
              'Grandfathers are not reliable sources.',
            ],
            answer: 1,
          },
        ],
      },

      {
        id: 'bio_chemistry_atoms',
        name: 'Chemistry of Life — Atoms, Elements, Bonds',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `Everything in this camp — the wood, the water, the herbs, your blood — is made of atoms. Atoms are the smallest unit of an element. Carbon, hydrogen, oxygen, nitrogen: those four make up almost all of you. Carbon is the backbone of life. It bonds with almost anything, which is why living things can build so many different shapes of molecules. Atoms share electrons to make covalent bonds — that's what holds water together, what holds your proteins in shape, what holds everything. Ionic bonds are different: one atom gives up an electron entirely to another. Salts work that way. Your cells use both kinds constantly, without ever knowing the words for them.`,
        questions: [
          {
            q: 'The smallest unit of an element that retains the chemical properties of that element is called a(n):',
            choices: ['Molecule', 'Compound', 'Atom', 'Ion'],
            answer: 2,
          },
          {
            q: 'Which of the following four elements makes up the majority of living matter?',
            choices: [
              'Carbon, hydrogen, oxygen, nitrogen',
              'Sodium, chlorine, potassium, calcium',
              'Iron, zinc, magnesium, phosphorus',
              'Helium, neon, argon, krypton',
            ],
            answer: 0,
          },
          {
            q: 'A covalent bond forms when two atoms:',
            choices: [
              'Transfer an electron from one to the other',
              'Share one or more pairs of electrons',
              'Repel each other due to charge',
              'Gain protons from each other',
            ],
            answer: 1,
          },
          {
            q: 'An ionic bond forms when:',
            choices: [
              'Two atoms share electrons equally',
              'Two nonmetals bond together',
              'One atom transfers an electron to another, creating oppositely charged ions that attract',
              'Atoms share electrons unequally due to electronegativity',
            ],
            answer: 2,
          },
          {
            q: 'The atomic number of an element tells you the number of:',
            choices: ['Neutrons in the nucleus', 'Protons in the nucleus', 'Electrons in the outer shell', 'Mass units in the nucleus'],
            answer: 1,
          },
          {
            q: 'Water (H2O) is held together by:',
            choices: ['Ionic bonds', 'Covalent bonds', 'Hydrogen bonds', 'Metallic bonds'],
            answer: 1,
          },
          {
            q: 'Carbon is considered the backbone of organic molecules primarily because:',
            choices: [
              'It is the most abundant element on Earth',
              'It forms 4 bonds and chains easily with other carbon atoms',
              'It has the highest atomic mass of common elements',
              'It dissolves in water',
            ],
            answer: 1,
          },
          {
            q: 'An atom with 6 protons, 6 neutrons, and 6 electrons is:',
            choices: ['Oxygen', 'Nitrogen', 'Carbon-12', 'Carbon-13'],
            answer: 2,
          },
          {
            q: 'Sodium (Na) has atomic number 11. In a neutral sodium atom, how many electrons does it have?',
            choices: ['10', '11', '12', '23'],
            answer: 1,
          },
          {
            q: 'Which statement best describes a polar covalent bond?',
            choices: [
              'Electrons are shared equally between the two atoms',
              'One atom takes the electrons entirely',
              'Electrons are shared unequally because the atoms have different electronegativities',
              'The bond only exists in ionic compounds',
            ],
            answer: 2,
          },
        ],
      },

      {
        id: 'bio_water_pH',
        name: 'Chemistry of Life — Water Properties & pH',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `Water is why anything in this camp is alive. It's a polar molecule — slightly positive on the hydrogen end, slightly negative on the oxygen end. That polarity is why water sticks to itself (cohesion), why it climbs up plants (adhesion), why it can dissolve almost anything (universal solvent). The high specific heat means it takes a lot of energy to heat up or cool down — that's why bodies hold temperature reasonably well. Acids release hydrogen ions (H+) in solution; bases release hydroxide ions (OH-). The pH scale measures this: 0 is pure acid, 14 is pure base, 7 is neutral. Blood runs at about 7.4. A small shift kills. Enzymes in your body work at specific pH ranges — mess with the pH, you mess with everything.`,
        questions: [
          {
            q: 'Water molecules stick to each other because of:',
            choices: ['Covalent bonds between water molecules', 'Hydrogen bonds between adjacent water molecules', 'Ionic bonds formed at the surface', 'Van der Waals forces only'],
            answer: 1,
          },
          {
            q: 'The tendency of water to stick to surfaces of other materials (like climbing up a plant stem) is called:',
            choices: ['Cohesion', 'Surface tension', 'Adhesion', 'Capillary action'],
            answer: 2,
          },
          {
            q: 'Water is called the "universal solvent" because:',
            choices: [
              'It can dissolve more substances than any other liquid due to its polarity',
              'It dissolves every substance known to chemistry',
              'It has a very high boiling point',
              'It contains both acids and bases',
            ],
            answer: 0,
          },
          {
            q: 'A solution with a pH of 3 is:',
            choices: ['Neutral', 'Slightly basic', 'Strongly acidic', 'Strongly basic'],
            answer: 2,
          },
          {
            q: 'A solution with a pH of 11 would be described as:',
            choices: ['Weakly acidic', 'Neutral', 'Basic/alkaline', 'Highly corrosive acid'],
            answer: 2,
          },
          {
            q: 'Human blood has a pH of approximately 7.4. This means blood is:',
            choices: ['Slightly acidic', 'Neutral', 'Slightly basic/alkaline', 'Strongly basic'],
            answer: 2,
          },
          {
            q: 'An acid is defined as a substance that:',
            choices: [
              'Accepts hydrogen ions (H+) in solution',
              'Donates hydrogen ions (H+) in solution',
              'Has a pH above 7',
              'Donates hydroxide ions (OH-)',
            ],
            answer: 1,
          },
          {
            q: 'Water has high specific heat. This means:',
            choices: [
              'It takes a large amount of energy to change its temperature by 1 degree Celsius',
              'It boils at a very high temperature',
              'It freezes at a lower temperature than most liquids',
              'It conducts electricity poorly',
            ],
            answer: 0,
          },
          {
            q: 'When water freezes, it becomes less dense than liquid water. Why is this biologically important?',
            choices: [
              'Ice is heavier and sinks, protecting organisms below from temperature changes',
              'Ice floats and insulates the water below, allowing aquatic life to survive under frozen surfaces',
              'Frozen water reflects sunlight and cools the environment',
              'This property has no biological significance',
            ],
            answer: 1,
          },
          {
            q: 'Going from pH 4 to pH 3 means the solution is how many times more acidic?',
            choices: ['2 times', '4 times', '10 times', '100 times'],
            answer: 2,
          },
        ],
      },

      {
        id: 'bio_macromolecules',
        name: 'Macromolecules',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `Four kinds of large molecules run everything alive. Carbohydrates: quick energy, cell structure. Simple sugars (monosaccharides) link into long chains — starch for storage, cellulose for plant walls. Lipids: fats and oils, long-term energy storage, and the material that cell membranes are made of. They don't mix with water, which is exactly why a cell membrane works — it's a barrier. Proteins are the workers. Made of amino acids linked into chains that fold into 3D shapes. Enzymes are proteins. Antibodies are proteins. Most of what a cell does, a protein does. Nucleic acids — DNA and RNA — store and carry genetic information. Everything your body is or does traces back to instructions written in nucleic acid. The monomer of a nucleic acid is a nucleotide. The monomer of a protein is an amino acid. Get those straight.`,
        questions: [
          {
            q: 'What is the monomer (building block) of a protein?',
            choices: ['Nucleotide', 'Fatty acid', 'Amino acid', 'Monosaccharide'],
            answer: 2,
          },
          {
            q: 'Which macromolecule is primarily responsible for long-term energy storage in animals?',
            choices: ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic acids'],
            answer: 1,
          },
          {
            q: 'Cellulose is a structural polysaccharide found in:',
            choices: ['Animal muscles', 'Cell membranes', 'Plant cell walls', 'DNA molecules'],
            answer: 2,
          },
          {
            q: 'The monomer of a nucleic acid is a:',
            choices: ['Amino acid', 'Fatty acid', 'Nucleotide', 'Glucose molecule'],
            answer: 2,
          },
          {
            q: 'Enzymes are biological catalysts made of:',
            choices: ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic acids'],
            answer: 2,
          },
          {
            q: 'Why do lipids NOT dissolve in water?',
            choices: [
              'They are too large',
              'They are nonpolar, while water is polar',
              'They have a pH above 7',
              'They contain carbon-carbon double bonds',
            ],
            answer: 1,
          },
          {
            q: 'DNA and RNA are examples of:',
            choices: ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic acids'],
            answer: 3,
          },
          {
            q: 'Starch is a polysaccharide that functions primarily as:',
            choices: ['A structural component of cell walls', 'A stored form of energy in plants', 'A catalyst for biochemical reactions', 'A building block for proteins'],
            answer: 1,
          },
          {
            q: 'The cell membrane is primarily made of:',
            choices: ['Proteins only', 'A phospholipid bilayer with embedded proteins', 'Polysaccharides', 'DNA and RNA'],
            answer: 1,
          },
          {
            q: 'Which of the following is a monosaccharide (simple sugar)?',
            choices: ['Starch', 'Cellulose', 'Glucose', 'Glycogen'],
            answer: 2,
          },
          {
            q: 'A dehydration synthesis reaction joins monomers by:',
            choices: [
              'Adding a water molecule between each monomer',
              'Removing a water molecule to form a covalent bond',
              'Breaking apart a polymer using acid',
              'Transferring electrons between monomers',
            ],
            answer: 1,
          },
        ],
      },

      {
        id: 'bio_cell_theory',
        name: 'Cell Theory & Cell Types',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `The cell is the basic unit of life. Every living thing is made of cells. New cells only come from existing cells — that's cell theory. There are two fundamental cell types. Prokaryotes are ancient, small, no membrane-bound nucleus — bacteria are prokaryotes. Eukaryotes are larger and have a true nucleus with a membrane around it, plus other membrane-bound organelles. Everything in this camp — every person, every plant, every animal — is eukaryotic. Bacteria that might infect your wounds are prokaryotic. That difference is why antibiotics can target bacteria without killing your own cells. The nucleus is the key structural difference: prokaryotes don't have one; eukaryotes do. Remember: pro = before, karyon = nucleus. Prokaryote = before the nucleus existed as a separate structure.`,
        questions: [
          {
            q: 'The three principles of modern cell theory are: (1) all living things are made of cells, (2) cells are the basic unit of life, and (3):',
            choices: [
              'Cells are always microscopic',
              'All cells have a nucleus',
              'All cells come from pre-existing cells',
              'Cells contain DNA in a nucleus',
            ],
            answer: 2,
          },
          {
            q: 'What is the primary structural difference between prokaryotic and eukaryotic cells?',
            choices: [
              'Eukaryotes have a cell wall; prokaryotes do not',
              'Eukaryotes have a membrane-bound nucleus; prokaryotes do not',
              'Prokaryotes are larger than eukaryotes',
              'Prokaryotes contain mitochondria; eukaryotes do not',
            ],
            answer: 1,
          },
          {
            q: 'Bacteria are classified as:',
            choices: ['Eukaryotes', 'Prokaryotes', 'Viruses', 'Archaea only'],
            answer: 1,
          },
          {
            q: 'Which of the following is an example of a eukaryotic cell?',
            choices: ['Streptococcus bacteria', 'E. coli', 'A human skin cell', 'A bacteriophage'],
            answer: 2,
          },
          {
            q: 'A prokaryotic cell would LACK which of the following?',
            choices: ['Cell membrane', 'DNA', 'Ribosomes', 'Membrane-bound nucleus'],
            answer: 3,
          },
          {
            q: 'Robert Hooke is associated with cell theory because he:',
            choices: [
              'First observed bacteria',
              'First observed cells in cork and named them "cells"',
              'Proposed that all cells come from pre-existing cells',
              'Discovered the cell membrane',
            ],
            answer: 1,
          },
          {
            q: 'Antibiotics can kill bacteria without harming human cells primarily because:',
            choices: [
              'Human cells are larger and antibiotics are too small to enter them',
              'Bacteria and human cells have fundamental structural differences that can be targeted selectively',
              'Human cells have more DNA than bacteria',
              'Antibiotics only work in acidic environments like the stomach',
            ],
            answer: 1,
          },
          {
            q: 'Which scientist first observed living cells in pond water, seeing what he called "animalcules"?',
            choices: ['Robert Hooke', 'Rudolf Virchow', 'Antonie van Leeuwenhoek', 'Matthias Schleiden'],
            answer: 2,
          },
          {
            q: 'The statement "all cells come from pre-existing cells" was contributed to cell theory by:',
            choices: ['Robert Hooke', 'Theodor Schwann', 'Rudolf Virchow', 'Louis Pasteur'],
            answer: 2,
          },
          {
            q: 'Organelles in eukaryotic cells are enclosed in membranes. What is the main advantage of this?',
            choices: [
              'It allows organelles to reproduce independently',
              'It allows different chemical environments to exist in different parts of the cell',
              'It prevents DNA from leaving the cell',
              'It makes cells larger and easier to see',
            ],
            answer: 1,
          },
        ],
      },

      {
        id: 'bio_organelles',
        name: 'Cell Organelles & Their Functions',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `Cells are like this camp. Each tent has a specific job — Maren's heals, Quill's trades, Cole's commands, Davan's trains. Your body works the same way inside every cell. The nucleus is Cole's tent — it holds the orders (DNA) and issues commands (mRNA). The mitochondria is the fire pit — it converts food into usable energy (ATP). The endoplasmic reticulum is the supply route — rough ER makes proteins (it has ribosomes attached), smooth ER makes lipids. The Golgi apparatus is Quill — receives, packages, and ships products to the right destinations. The ribosome makes proteins everywhere, even outside the ER. The vacuole stores things. The lysosome is the camp cleanup crew — breaks down waste and old organelles. In plant cells, add the chloroplast (photosynthesis) and a large central vacuole and a cell wall.`,
        questions: [
          {
            q: 'The "powerhouse of the cell" — the organelle that produces most of a cell\'s ATP through cellular respiration — is the:',
            choices: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'],
            answer: 2,
          },
          {
            q: 'The nucleus contains:',
            choices: ['ATP and energy reserves', 'The cell\'s genetic material (DNA)', 'Digestive enzymes', 'Lipids for the cell membrane'],
            answer: 1,
          },
          {
            q: 'Ribosomes are the sites of:',
            choices: ['DNA replication', 'Protein synthesis', 'Lipid breakdown', 'ATP production'],
            answer: 1,
          },
          {
            q: 'The Golgi apparatus functions to:',
            choices: [
              'Produce ATP',
              'Store genetic information',
              'Receive, modify, and package proteins and lipids for export',
              'Conduct cellular respiration',
            ],
            answer: 2,
          },
          {
            q: 'Rough endoplasmic reticulum (rough ER) is studded with ribosomes and primarily functions to:',
            choices: [
              'Produce lipids',
              'Generate ATP',
              'Synthesize and process proteins',
              'Break down waste materials',
            ],
            answer: 2,
          },
          {
            q: 'Lysosomes contain digestive enzymes. Their main function is to:',
            choices: [
              'Synthesize proteins',
              'Produce energy',
              'Break down and recycle cellular waste and old organelles',
              'Regulate what enters and exits the cell',
            ],
            answer: 2,
          },
          {
            q: 'Which organelle is found in plant cells but NOT in typical animal cells?',
            choices: ['Mitochondria', 'Ribosome', 'Nucleus', 'Chloroplast'],
            answer: 3,
          },
          {
            q: 'The cell membrane and all internal membrane-bound organelles together form the:',
            choices: ['Cytoplasm', 'Endomembrane system', 'Cytoskeleton', 'Genome'],
            answer: 1,
          },
          {
            q: 'A cell that actively makes and secretes a lot of proteins (like a pancreatic cell making digestive enzymes) would be expected to have a large number of:',
            choices: ['Vacuoles', 'Chloroplasts', 'Ribosomes and rough ER', 'Lysosomes'],
            answer: 2,
          },
          {
            q: 'Smooth endoplasmic reticulum differs from rough ER in that it:',
            choices: [
              'Lacks ribosomes and is primarily involved in lipid synthesis',
              'Contains more ribosomes and makes more proteins',
              'Is only found in plant cells',
              'Is attached to the nucleus directly',
            ],
            answer: 0,
          },
        ],
      },

      {
        id: 'bio_cell_membrane',
        name: 'Cell Membrane — Structure (Fluid Mosaic Model)',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `The cell membrane is not a solid wall. It's more like the palisade fence around this camp — a flexible barrier with gates and guards. The fluid mosaic model describes it: a double layer of phospholipids (the phospholipid bilayer) with proteins floating in it like islands. Each phospholipid has a hydrophilic (water-loving) head that faces outward into the water, and two hydrophobic (water-fearing) fatty acid tails that point inward, away from water. That hydrophobic core is why the membrane is a barrier — most water-soluble molecules can't cross it without help. The proteins embedded in the membrane serve as channels, receptors, and identity markers. "Fluid" because the phospholipids can move laterally. "Mosaic" because of the varied protein pattern. Cholesterol in the membrane adjusts fluidity — more cholesterol means less fluid at high temperatures.`,
        questions: [
          {
            q: 'The fluid mosaic model describes the cell membrane as:',
            choices: [
              'A rigid wall made of cellulose',
              'A double layer of phospholipids with proteins embedded in it',
              'A single layer of proteins with lipids attached',
              'A solid structure made of carbohydrates and proteins',
            ],
            answer: 1,
          },
          {
            q: 'In a phospholipid molecule, the "head" is hydrophilic and the two "tails" are hydrophobic. In the bilayer, where are the tails oriented?',
            choices: [
              'Facing the outside of the cell',
              'Facing the inside of the cell (cytoplasm)',
              'Pointing inward toward each other, away from water',
              'Pointing outward on both sides',
            ],
            answer: 2,
          },
          {
            q: 'Membrane proteins can function as all of the following EXCEPT:',
            choices: ['Transport channels', 'Cell surface receptors', 'Identity/recognition markers', 'Sites of DNA replication'],
            answer: 3,
          },
          {
            q: 'The term "fluid" in the fluid mosaic model refers to the fact that:',
            choices: [
              'Water is a key component of the membrane',
              'The membrane contains liquid cholesterol',
              'Phospholipids can move laterally within the bilayer',
              'The membrane dissolves in water',
            ],
            answer: 2,
          },
          {
            q: 'Why can\'t large polar molecules (like glucose) cross the cell membrane without assistance?',
            choices: [
              'They are too small to be detected by membrane proteins',
              'The hydrophobic interior of the bilayer repels polar and charged molecules',
              'Glucose is too acidic for the neutral membrane',
              'The membrane\'s proteins block all molecules',
            ],
            answer: 1,
          },
          {
            q: 'Cholesterol molecules in the cell membrane:',
            choices: [
              'Provide energy for membrane transport',
              'Help stabilize membrane fluidity by preventing phospholipids from packing too tightly or moving too freely',
              'Are only found in prokaryotic membranes',
              'Form the transport channels for ions',
            ],
            answer: 1,
          },
          {
            q: 'The term "mosaic" in the fluid mosaic model refers to:',
            choices: [
              'The colorful appearance of cells under a microscope',
              'The varied and scattered pattern of different proteins embedded in the membrane',
              'The geometric tile pattern of phospholipids',
              'The layered structure of the bilayer',
            ],
            answer: 1,
          },
          {
            q: 'Glycoproteins (carbohydrate chains attached to membrane proteins) are found on the outer surface of the cell membrane. Their function includes:',
            choices: [
              'ATP production',
              'Photosynthesis',
              'Cell recognition and signaling',
              'DNA storage',
            ],
            answer: 2,
          },
          {
            q: 'Small, nonpolar molecules like oxygen (O2) and carbon dioxide (CO2) can cross the cell membrane:',
            choices: [
              'Only through protein channels',
              'Only through active transport pumps',
              'Directly through the phospholipid bilayer (simple diffusion)',
              'They cannot cross the membrane at all',
            ],
            answer: 2,
          },
          {
            q: 'If a cell membrane became completely rigid and inflexible, what would most likely happen?',
            choices: [
              'The cell would function better because it would be more stable',
              'Transport proteins would stop working entirely',
              'The membrane could not properly perform functions requiring shape changes, like endocytosis',
              'The cell would gain more DNA',
            ],
            answer: 2,
          },
        ],
      },

      {
        id: 'bio_cell_transport',
        name: 'Cell Transport',
        subject: 'biology',
        teacherNPC: 'Dr. Kessler — camp surgeon',
        inWorldLesson: `Materials cross cell membranes constantly. Passive transport moves things from high concentration to low concentration — downhill, no energy needed. Diffusion is the simplest: a molecule moves from where there are many of it to where there are few. Osmosis is diffusion of water specifically — water moves toward higher solute concentration. Facilitated diffusion is passive but uses a protein channel to help a molecule that can't cross the hydrophobic layer alone. Active transport is uphill — moving things from low to high concentration. That costs ATP. Sodium-potassium pumps are the classic example: they push sodium out and potassium in, against the gradient, using ATP constantly. Endocytosis engulfs large molecules by wrapping membrane around them (the cell membrane forms a pocket that becomes a vesicle). Exocytosis is the reverse: a vesicle fuses with the membrane to release contents outside.`,
        questions: [
          {
            q: 'Diffusion moves substances from:',
            choices: [
              'Low concentration to high concentration',
              'High concentration to low concentration',
              'Inside the nucleus to outside the nucleus',
              'Across the membrane using ATP',
            ],
            answer: 1,
          },
          {
            q: 'Osmosis is best defined as:',
            choices: [
              'The movement of all solutes across a membrane',
              'The active transport of water against a concentration gradient',
              'The diffusion of water across a semi-permeable membrane from low solute to high solute concentration',
              'The movement of oxygen specifically across the membrane',
            ],
            answer: 2,
          },
          {
            q: 'A red blood cell is placed in pure water (hypotonic solution). What will happen?',
            choices: [
              'Water will leave the cell and it will shrink (crenation)',
              'Water will enter the cell and it may burst (lysis)',
              'Nothing — the cell is already in equilibrium',
              'Solutes will exit the cell to equalize concentration',
            ],
            answer: 1,
          },
          {
            q: 'Which type of transport requires ATP (energy)?',
            choices: [
              'Simple diffusion',
              'Osmosis',
              'Facilitated diffusion',
              'Active transport',
            ],
            answer: 3,
          },
          {
            q: 'Facilitated diffusion differs from simple diffusion because it:',
            choices: [
              'Requires ATP',
              'Moves substances from low to high concentration',
              'Uses transport proteins to help specific molecules cross the membrane',
              'Only applies to water molecules',
            ],
            answer: 2,
          },
          {
            q: 'The sodium-potassium pump is an example of active transport because it:',
            choices: [
              'Moves sodium and potassium along their concentration gradients without energy',
              'Uses ATP to move sodium out and potassium into the cell, against their gradients',
              'Only works in plant cells',
              'Moves water across the membrane',
            ],
            answer: 1,
          },
          {
            q: 'A cell engulfing a large particle by wrapping its membrane around it is called:',
            choices: ['Exocytosis', 'Osmosis', 'Endocytosis', 'Pinocytosis only'],
            answer: 2,
          },
          {
            q: 'Exocytosis involves:',
            choices: [
              'The cell engulfing material from outside',
              'A vesicle fusing with the cell membrane to release its contents outside the cell',
              'Water leaving the cell by osmosis',
              'Active transport of ions',
            ],
            answer: 1,
          },
          {
            q: 'A cell is placed in a solution with a higher solute concentration than the inside of the cell (hypertonic solution). Water will:',
            choices: [
              'Move into the cell, causing it to swell',
              'Stay still — it is already in equilibrium',
              'Move out of the cell, causing it to shrink',
              'Move into the cell through active transport',
            ],
            answer: 2,
          },
          {
            q: 'Which of the following would NOT require a transport protein to cross the cell membrane?',
            choices: ['Glucose', 'Sodium ions (Na+)', 'Oxygen (O2)', 'Large amino acids'],
            answer: 2,
          },
          {
            q: 'Nerve cells in the camp survivors are firing rapidly. This requires resetting the ion gradient constantly. This process relies heavily on:',
            choices: ['Simple diffusion', 'Osmosis', 'The sodium-potassium pump (active transport)', 'Facilitated diffusion only'],
            answer: 2,
          },
        ],
      },
    ],

    geometry: [
      {
        id: 'geo_foundations',
        name: 'Foundations — Points, Lines, Planes, Segments, Rays, Angles',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `The Architects built this tower using nothing but marks on paper. A point has no size — it is a location, that is all. A line extends forever in both directions. A ray starts at a point and goes on forever in one direction — like an arrow fired from a bow, it starts somewhere and never stops. A line segment has two endpoints — the length of one wall, the height of one stone block. A plane is a flat surface that extends forever in two dimensions — the floor of this room, extended. An angle is formed by two rays sharing a common endpoint, called the vertex. The Architects measured everything. Every beam, every arch, every block was placed using these relationships. The Junction Tower has stood six hundred years because someone took the time to get the angles right.`,
        questions: [
          {
            q: 'A point has:',
            choices: ['Length but no width', 'No dimensions — it is only a location', 'One dimension', 'Area but no volume'],
            answer: 1,
          },
          {
            q: 'How does a ray differ from a line?',
            choices: [
              'A ray has two endpoints; a line has none',
              'A ray has one endpoint and extends infinitely in one direction; a line extends infinitely in both directions',
              'A ray is curved; a line is straight',
              'A ray is always horizontal; a line can be diagonal',
            ],
            answer: 1,
          },
          {
            q: 'A line segment differs from a line because:',
            choices: [
              'A line segment is curved',
              'A line segment has exactly two endpoints; a line has none',
              'A line segment extends infinitely in both directions',
              'A line segment exists only on a plane',
            ],
            answer: 1,
          },
          {
            q: 'The common endpoint of the two rays that form an angle is called the:',
            choices: ['Origin', 'Axis', 'Vertex', 'Intersection'],
            answer: 2,
          },
          {
            q: 'How many points are needed to define exactly one line?',
            choices: ['1', '2', '3', '4'],
            answer: 1,
          },
          {
            q: 'Three or more points that lie on the same line are called:',
            choices: ['Coplanar', 'Collinear', 'Congruent', 'Concurrent'],
            answer: 1,
          },
          {
            q: 'Two lines in the same plane that do not intersect are:',
            choices: ['Perpendicular', 'Skew', 'Parallel', 'Collinear'],
            answer: 2,
          },
          {
            q: 'Skew lines are lines that:',
            choices: [
              'Lie in the same plane and do not intersect',
              'Intersect at exactly one point',
              'Do not lie in the same plane and do not intersect',
              'Are parallel and equal in length',
            ],
            answer: 2,
          },
          {
            q: 'How many planes are defined by exactly three non-collinear points?',
            choices: ['0', '1', '2', 'Infinitely many'],
            answer: 1,
          },
          {
            q: 'Voss measures the angle formed at the corner of a stone block in the Junction Tower. The angle appears to be exactly 90 degrees. This angle is called a:',
            choices: ['Acute angle', 'Obtuse angle', 'Right angle', 'Straight angle'],
            answer: 2,
          },
        ],
      },

      {
        id: 'geo_angle_relationships',
        name: 'Angle Relationships & Measurement',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `When two lines cross, they form four angles. The angles across from each other (vertical angles) are always equal — the Architects used this property in every arch they built. When two angles add up to 90 degrees, they are complementary. When they add up to 180 degrees, they are supplementary. A straight angle is 180 degrees — a straight line. When two angles share a side and a vertex and don't overlap, they are adjacent. If the two sides of two angles form two lines (not just a straight angle), the angles are vertical and congruent. Measuring angles: a protractor reads from 0 to 180. Acute angles are less than 90. Right angles are exactly 90. Obtuse angles are between 90 and 180. Straight angles are exactly 180. Reflex angles exceed 180 — the Architects used reflex angles in dome construction.`,
        questions: [
          {
            q: 'Two angles that are complementary have a sum of:',
            choices: ['45 degrees', '90 degrees', '180 degrees', '360 degrees'],
            answer: 1,
          },
          {
            q: 'Two angles that are supplementary have a sum of:',
            choices: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
            answer: 1,
          },
          {
            q: 'Vertical angles formed by two intersecting lines are always:',
            choices: ['Supplementary', 'Complementary', 'Congruent (equal in measure)', 'Right angles'],
            answer: 2,
          },
          {
            q: 'If angle A = 35 degrees, what is the measure of its complement?',
            choices: ['145 degrees', '55 degrees', '65 degrees', '35 degrees'],
            answer: 1,
          },
          {
            q: 'If angle B = 110 degrees, what is the measure of its supplement?',
            choices: ['70 degrees', '80 degrees', '250 degrees', '160 degrees'],
            answer: 0,
          },
          {
            q: 'An angle measuring 145 degrees is classified as:',
            choices: ['Acute', 'Right', 'Obtuse', 'Reflex'],
            answer: 2,
          },
          {
            q: 'Two adjacent angles together form a straight angle (180 degrees). If one angle is 62 degrees, what is the other?',
            choices: ['28 degrees', '118 degrees', '128 degrees', '62 degrees'],
            answer: 1,
          },
          {
            q: 'In the Junction Tower, Voss finds two vertical angles formed by crossing beams. One angle is 48 degrees. The other vertical angle is:',
            choices: ['132 degrees', '42 degrees', '48 degrees', '90 degrees'],
            answer: 2,
          },
          {
            q: 'Angle bisector divides an angle into:',
            choices: [
              'Two supplementary angles',
              'Two right angles',
              'Two congruent angles',
              'Two complementary angles',
            ],
            answer: 2,
          },
          {
            q: 'If two lines are perpendicular, the angles they form are:',
            choices: ['All acute', 'All obtuse', 'All right angles (90 degrees)', 'Vertical angles only'],
            answer: 2,
          },
        ],
      },

      {
        id: 'geo_midpoint_distance',
        name: 'Midpoint, Distance, and Segment Bisectors',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `The Architects laid out the tower floor plan on a coordinate system — every point had an x and a y. The distance between two points uses the Pythagorean theorem: distance = square root of ((x2-x1) squared plus (y2-y1) squared). To find the midpoint between two points, average the x-coordinates and average the y-coordinates: midpoint = ((x1+x2)/2, (y1+y2)/2). A segment bisector is any line, segment, or ray that passes through the midpoint of a segment, cutting it into two equal halves. The perpendicular bisector is special: it passes through the midpoint AND is perpendicular to the segment. Every point on the perpendicular bisector is equidistant from both endpoints of the segment. The Architects used this to center their arches perfectly.`,
        questions: [
          {
            q: 'What is the midpoint of the segment with endpoints (2, 4) and (8, 10)?',
            choices: ['(5, 7)', '(4, 6)', '(6, 7)', '(10, 14)'],
            answer: 0,
          },
          {
            q: 'What is the distance between points (0, 0) and (3, 4)?',
            choices: ['7', '5', '3.5', '12'],
            answer: 1,
          },
          {
            q: 'The distance formula is derived from:',
            choices: ['The midpoint formula', 'The Pythagorean theorem', 'The definition of slope', 'The properties of parallel lines'],
            answer: 1,
          },
          {
            q: 'What is the midpoint of the segment with endpoints (-4, 2) and (6, -8)?',
            choices: ['(1, -3)', '(2, -6)', '(1, -5)', '(-1, 5)'],
            answer: 0,
          },
          {
            q: 'A perpendicular bisector of a segment:',
            choices: [
              'Passes through only one endpoint of the segment',
              'Bisects the segment and is at a 45-degree angle to it',
              'Passes through the midpoint and is perpendicular to the segment',
              'Is always horizontal',
            ],
            answer: 2,
          },
          {
            q: 'What is the distance between points (1, 2) and (4, 6)?',
            choices: ['3', '4', '5', '7'],
            answer: 2,
          },
          {
            q: 'A segment has endpoints A(1, 3) and B(7, 3). What is the midpoint M?',
            choices: ['(4, 3)', '(3, 4)', '(6, 3)', '(4, 6)'],
            answer: 0,
          },
          {
            q: 'If M is the midpoint of segment AB, and AM = 6 cm, then AB =',
            choices: ['3 cm', '6 cm', '12 cm', '9 cm'],
            answer: 2,
          },
          {
            q: 'Point P is on the perpendicular bisector of segment AB. What can we conclude?',
            choices: [
              'P is the midpoint of AB',
              'P is equidistant from A and B',
              'P is on line AB',
              'P is the center of a circle containing A and B',
            ],
            answer: 1,
          },
          {
            q: 'Two points are at (0, 0) and (5, 12). What is the distance between them?',
            choices: ['13', '17', '12', '7'],
            answer: 0,
          },
        ],
      },

      {
        id: 'geo_reasoning_proof',
        name: 'Reasoning & Proof — Inductive/Deductive, Conditionals',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `Cole watches Rael go near the tent three times and concludes something is wrong. That is inductive reasoning — using specific observations to make a general conclusion. It might be wrong. Deductive reasoning is the opposite: you start with a rule that is definitely true (a postulate or theorem), and you apply it to a specific case to reach a certain conclusion. In geometry, we prove things deductively. A conditional statement has the form "if P, then Q" — "if two angles are supplementary, then they add to 180 degrees." The converse flips it: "if they add to 180, then they are supplementary." The inverse negates both parts: "if NOT P, then NOT Q." The contrapositive negates and flips: "if NOT Q, then NOT P." The contrapositive is always logically equivalent to the original — if the original is true, the contrapositive is true.`,
        questions: [
          {
            q: 'Cole notices Rael near the tent three times and concludes Rael is suspicious. This is an example of:',
            choices: ['Deductive reasoning', 'Inductive reasoning', 'Proof by contradiction', 'A biconditional'],
            answer: 1,
          },
          {
            q: 'Deductive reasoning begins with:',
            choices: [
              'A specific observation that leads to a general conclusion',
              'A hypothesis that may be incorrect',
              'General rules or facts that lead to specific, certain conclusions',
              'A guess based on pattern recognition',
            ],
            answer: 2,
          },
          {
            q: 'The conditional statement "If it rains, then the ground is wet" has which converse?',
            choices: [
              'If it does not rain, the ground is not wet.',
              'If the ground is wet, then it rained.',
              'If the ground is not wet, then it did not rain.',
              'It rains if and only if the ground is wet.',
            ],
            answer: 1,
          },
          {
            q: 'Which of the following is logically equivalent to the original conditional "If P, then Q"?',
            choices: [
              'If Q, then P (converse)',
              'If not P, then not Q (inverse)',
              'If not Q, then not P (contrapositive)',
              'P if and only if Q (biconditional)',
            ],
            answer: 2,
          },
          {
            q: 'A biconditional statement "P if and only if Q" is true when:',
            choices: [
              'P is true and Q is false',
              'P and Q are both true or both false',
              'P is true regardless of Q',
              'The converse of P → Q is false',
            ],
            answer: 1,
          },
          {
            q: 'A counterexample to a conjecture is:',
            choices: [
              'A proof that the conjecture is always true',
              'A specific case that shows the conjecture is false',
              'A general rule derived from many observations',
              'A deductive argument',
            ],
            answer: 1,
          },
          {
            q: '"If two angles are right angles, then they are congruent." What is the inverse of this statement?',
            choices: [
              'If two angles are congruent, then they are right angles.',
              'If two angles are NOT right angles, then they are NOT congruent.',
              'If two angles are NOT congruent, then they are NOT right angles.',
              'Two angles are right if and only if they are congruent.',
            ],
            answer: 1,
          },
          {
            q: 'A student observes that the first 5 multiples of 3 (3, 6, 9, 12, 15) are all odd or even alternately. She concludes all multiples of 3 follow this pattern. This is:',
            choices: [
              'A valid deductive proof',
              'A definition',
              'An inductive conjecture (could be right or wrong)',
              'A theorem',
            ],
            answer: 2,
          },
          {
            q: 'In a two-column geometry proof, the right column contains:',
            choices: ['The given information only', 'Statements only', 'Reasons (postulates, definitions, theorems) that justify each statement', 'Diagrams'],
            answer: 2,
          },
          {
            q: 'The Law of Detachment states: if "P → Q" is true and "P" is true, then:',
            choices: ['P is false', 'Q is false', 'Q must be true', 'We cannot conclude anything about Q'],
            answer: 2,
          },
        ],
      },

      {
        id: 'geo_parallel_lines',
        name: 'Parallel Lines & Transversals — Angle Pairs',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `Look at the beams across the tower ceiling — two parallel beams cut by a third beam at an angle. That third beam is a transversal. It creates eight angles: four near each parallel beam. Corresponding angles are in matching positions at each intersection — they are congruent when lines are parallel. Alternate interior angles are between the parallel lines, on opposite sides of the transversal — also congruent. Alternate exterior angles are outside the parallel lines, on opposite sides — also congruent. Co-interior angles (same-side interior, or consecutive interior angles) are between the parallel lines on the same side — they are supplementary (add to 180). If you know the lines are parallel, you can find every angle from just one angle. The Architects never measured more than they had to.`,
        questions: [
          {
            q: 'When a transversal crosses two parallel lines, corresponding angles are:',
            choices: ['Supplementary', 'Complementary', 'Congruent', 'Always 90 degrees'],
            answer: 2,
          },
          {
            q: 'Alternate interior angles formed by a transversal crossing two parallel lines are:',
            choices: ['Supplementary', 'Congruent', 'Complementary', 'Vertical angles'],
            answer: 1,
          },
          {
            q: 'Co-interior angles (same-side interior angles) formed by a transversal crossing two parallel lines are:',
            choices: ['Congruent', 'Complementary', 'Supplementary (sum to 180°)', 'Always equal to 45°'],
            answer: 2,
          },
          {
            q: 'A transversal crosses two parallel lines. One of the co-interior angles is 72 degrees. What is the other co-interior angle?',
            choices: ['72 degrees', '108 degrees', '18 degrees', '90 degrees'],
            answer: 1,
          },
          {
            q: 'Two parallel lines are cut by a transversal. An alternate exterior angle on one side measures 55 degrees. What is the corresponding angle at the other intersection?',
            choices: ['125 degrees', '55 degrees', '35 degrees', '90 degrees'],
            answer: 1,
          },
          {
            q: 'Which angle pair is NOT congruent when formed by a transversal cutting two parallel lines?',
            choices: ['Corresponding angles', 'Alternate interior angles', 'Alternate exterior angles', 'Co-interior (same-side interior) angles'],
            answer: 3,
          },
          {
            q: 'A transversal intersects two parallel lines. If one angle is 130 degrees, its alternate interior angle is:',
            choices: ['50 degrees', '130 degrees', '40 degrees', '90 degrees'],
            answer: 1,
          },
          {
            q: 'Voss examines the tower and finds two ceiling beams (parallel) cut by a support beam. An angle at the first intersection is 38 degrees. The co-interior angle at the second intersection is:',
            choices: ['38 degrees', '142 degrees', '52 degrees', '90 degrees'],
            answer: 1,
          },
          {
            q: 'How many angles are formed when a transversal crosses two parallel lines?',
            choices: ['4', '6', '8', '2'],
            answer: 2,
          },
          {
            q: 'If the co-interior angles formed by two lines and a transversal are supplementary, the two lines must be:',
            choices: ['Perpendicular', 'Skew', 'Parallel', 'Intersecting'],
            answer: 2,
          },
        ],
      },

      {
        id: 'geo_proving_parallel',
        name: 'Proving Lines Parallel',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `Knowing whether two lines are parallel matters for construction. Fortunately, the angle relationships work both ways: we used them to find angles given parallel lines, and we can use them to prove lines are parallel given angle information. If corresponding angles are congruent → the lines are parallel. If alternate interior angles are congruent → parallel. If alternate exterior angles are congruent → parallel. If co-interior angles are supplementary → parallel. If both lines are perpendicular to the same transversal → parallel. If both lines are parallel to the same third line → they are parallel to each other. The Architects used these converses to verify every wall before laying the next course of stones.`,
        questions: [
          {
            q: 'Which condition proves that two lines cut by a transversal are parallel?',
            choices: [
              'The corresponding angles are supplementary',
              'The co-interior angles are congruent',
              'The alternate interior angles are congruent',
              'The vertical angles are supplementary',
            ],
            answer: 2,
          },
          {
            q: 'Two lines are cut by a transversal. The co-interior angles measure 95 degrees and 85 degrees. Are the lines parallel?',
            choices: [
              'Yes, because the co-interior angles are supplementary (95 + 85 = 180)',
              'No, because the co-interior angles must be congruent for lines to be parallel',
              'No, because neither angle is 90 degrees',
              'Yes, because the angles are different',
            ],
            answer: 0,
          },
          {
            q: 'Two lines are each perpendicular to the same transversal. Therefore:',
            choices: [
              'The two lines are the same line',
              'The two lines are parallel to each other',
              'The two lines are perpendicular to each other',
              'We cannot determine a relationship',
            ],
            answer: 1,
          },
          {
            q: 'If line m is parallel to line n, and line n is parallel to line p, then:',
            choices: [
              'Lines m and p must be perpendicular',
              'Lines m and p must be parallel',
              'Lines m and p must intersect',
              'We cannot determine the relationship between m and p',
            ],
            answer: 1,
          },
          {
            q: 'To prove two lines are parallel using alternate exterior angles, those angles must be:',
            choices: ['Supplementary', 'Complementary', 'Congruent', 'Both less than 90 degrees'],
            answer: 2,
          },
          {
            q: 'Voss measures two angles formed by a transversal across two stone wall lines. The corresponding angles are 72 degrees and 72 degrees. What can he conclude?',
            choices: [
              'The lines are perpendicular',
              'The angles are supplementary',
              'The two walls are parallel',
              'The transversal is perpendicular to both walls',
            ],
            answer: 2,
          },
          {
            q: 'Two lines are cut by a transversal. The co-interior angles are 100 degrees and 100 degrees. Are the lines parallel?',
            choices: [
              'Yes, because co-interior angles are congruent',
              'No, because co-interior angles must be supplementary (sum to 180) for lines to be parallel',
              'Yes, because both angles are obtuse',
              'No, because corresponding angles must also be checked',
            ],
            answer: 1,
          },
          {
            q: 'Which of the following is NOT a valid method for proving two lines are parallel?',
            choices: [
              'Show that corresponding angles are congruent',
              'Show that alternate interior angles are congruent',
              'Show that adjacent angles are congruent',
              'Show that co-interior angles are supplementary',
            ],
            answer: 2,
          },
          {
            q: 'Two streets in a city grid both run perpendicular to Main Street. What can you conclude about the two streets relative to each other?',
            choices: [
              'They intersect at a 45-degree angle',
              'They are parallel to each other',
              'They are perpendicular to each other',
              'Nothing — you need more information',
            ],
            answer: 1,
          },
          {
            q: 'The Converse of the Alternate Interior Angles Theorem states:',
            choices: [
              'If lines are parallel, alternate interior angles are congruent',
              'If alternate interior angles are congruent, then the lines are parallel',
              'If alternate interior angles are supplementary, the lines are parallel',
              'Alternate interior angles are always congruent',
            ],
            answer: 1,
          },
        ],
      },

      {
        id: 'geo_triangle_basics',
        name: 'Triangle Basics — Angle Sum, Exterior Angles, Classifications',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `Triangles are the strongest shape — the Architects used them in every load-bearing structure. The interior angles of any triangle always sum to 180 degrees. No exceptions. If you know two angles, you can always find the third. An exterior angle of a triangle is formed by extending one side. The exterior angle theorem: an exterior angle of a triangle equals the sum of the two non-adjacent interior angles (the remote interior angles). Triangles are classified by sides: equilateral (all three sides equal, all angles 60), isosceles (two sides equal, two base angles equal), scalene (no sides equal). By angles: acute (all angles less than 90), right (one angle exactly 90), obtuse (one angle greater than 90). You cannot have two obtuse angles in a triangle — the angles would already exceed 180 degrees.`,
        questions: [
          {
            q: 'The sum of the interior angles of any triangle is:',
            choices: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
            answer: 1,
          },
          {
            q: 'Two angles of a triangle are 45 degrees and 75 degrees. What is the third angle?',
            choices: ['50 degrees', '60 degrees', '70 degrees', '80 degrees'],
            answer: 1,
          },
          {
            q: 'An exterior angle of a triangle equals:',
            choices: [
              'The sum of all three interior angles',
              'The supplement of the adjacent interior angle only',
              'The sum of the two non-adjacent (remote) interior angles',
              '180 degrees minus the largest interior angle',
            ],
            answer: 2,
          },
          {
            q: 'A triangle has interior angles of 50 degrees and 70 degrees. What is the exterior angle at the third vertex?',
            choices: ['60 degrees', '180 degrees', '120 degrees', '130 degrees'],
            answer: 2,
          },
          {
            q: 'A triangle with all three sides of equal length is called:',
            choices: ['Scalene', 'Isosceles', 'Equilateral', 'Right'],
            answer: 2,
          },
          {
            q: 'An isosceles triangle has two equal sides. The angles opposite those equal sides are:',
            choices: ['Always 60 degrees', 'Supplementary', 'Congruent (equal)', 'Complementary'],
            answer: 2,
          },
          {
            q: 'A triangle with one angle measuring 95 degrees is classified as:',
            choices: ['Acute', 'Right', 'Obtuse', 'Equilateral'],
            answer: 2,
          },
          {
            q: 'Can a triangle have two obtuse angles? Why or why not?',
            choices: [
              'Yes, as long as they are both between 90 and 120 degrees',
              'No, because two obtuse angles would already sum to more than 180 degrees',
              'Yes, if the third angle is very small',
              'No, because obtuse triangles must have exactly one obtuse angle',
            ],
            answer: 1,
          },
          {
            q: 'Voss examines a triangular support brace in the tower. Two angles are 40 degrees and 40 degrees. This triangle is:',
            choices: ['Scalene and acute', 'Isosceles and acute', 'Equilateral', 'Isosceles and obtuse'],
            answer: 1,
          },
          {
            q: 'An equilateral triangle has interior angles that each measure:',
            choices: ['45 degrees', '60 degrees', '90 degrees', '120 degrees'],
            answer: 1,
          },
          {
            q: 'A right triangle has angles of 90 degrees and 35 degrees. What is the third angle?',
            choices: ['45 degrees', '55 degrees', '65 degrees', '75 degrees'],
            answer: 1,
          },
        ],
      },

      {
        id: 'geo_triangle_congruence',
        name: 'Triangle Congruence — SSS, SAS, ASA, AAS, HL',
        subject: 'geometry',
        teacherNPC: 'Voss — Thornkin elder and Architect scholar',
        inWorldLesson: `Two triangles are congruent if they have exactly the same shape and size — all corresponding sides equal, all corresponding angles equal. But you don't have to measure all six parts. There are shortcuts. SSS: if all three pairs of sides are equal, the triangles are congruent. SAS: two sides and the included angle (the angle between those sides) equal — congruent. ASA: two angles and the included side equal — congruent. AAS: two angles and a non-included side equal — congruent. HL: only for right triangles — if the hypotenuse and one leg are equal, the triangles are congruent. Warning: SSA (side-side-angle, where the angle is not included) does NOT prove congruence — this is the "ambiguous case." AAA (all angles equal) does not prove congruence either — it proves similarity, not same size. The Architects used congruence to replicate arch segments precisely.`,
        questions: [
          {
            q: 'Two triangles have all three pairs of corresponding sides equal. What postulate proves they are congruent?',
            choices: ['SAS', 'ASA', 'SSS', 'AAS'],
            answer: 2,
          },
          {
            q: 'Triangle ABC has AB = 5, BC = 7, and angle B = 60 degrees. Triangle DEF has DE = 5, EF = 7, and angle E = 60 degrees. These triangles are congruent by:',
            choices: ['SSS', 'SAS', 'ASA', 'HL'],
            answer: 1,
          },
          {
            q: 'The "included angle" in SAS is the angle:',
            choices: [
              'Opposite the longest side',
              'Between the two given sides',
              'At the right angle',
              'Supplementary to one of the given angles',
            ],
            answer: 1,
          },
          {
            q: 'Which congruence theorem applies only to right triangles?',
            choices: ['SSS', 'SAS', 'ASA', 'HL'],
            answer: 3,
          },
          {
            q: 'HL (Hypotenuse-Leg) congruence requires:',
            choices: [
              'Two sides and any angle to be equal',
              'The two legs to be equal',
              'The hypotenuse and one leg of two right triangles to be equal',
              'All three sides of a right triangle to be equal',
            ],
            answer: 2,
          },
          {
            q: 'Why does AAA (all three angles equal) NOT prove triangle congruence?',
            choices: [
              'Because you need to know the side lengths, not just the angles',
              'Because two triangles with the same angles can have different sizes (similar but not congruent)',
              'Because you cannot have all three angles equal',
              'Because AAA is the same as SSS',
            ],
            answer: 1,
          },
          {
            q: 'Why is SSA NOT a valid congruence theorem?',
            choices: [
              'Because you need the angle between the two sides',
              'Because two different triangles can be constructed from the same SSA information (ambiguous case)',
              'Because S stands for supplementary',
              'Because SSA only works for obtuse triangles',
            ],
            answer: 1,
          },
          {
            q: 'In the diagram, triangles PQR and STU share: angle P = angle S, angle Q = angle T, and PQ = ST. These triangles are congruent by:',
            choices: ['SSS', 'SAS', 'ASA', 'AAS'],
            answer: 2,
          },
          {
            q: 'Triangles ABC and DEF have angle A = angle D, angle C = angle F, and BC = EF (the sides opposite the first named angles). These triangles are congruent by:',
            choices: ['SAS', 'ASA', 'AAS', 'HL'],
            answer: 2,
          },
          {
            q: 'Voss is replicating a triangular brace. He knows the lengths of all three sides of both triangles are identical. Which postulate confirms they are congruent?',
            choices: ['SAS', 'SSS', 'AAS', 'HL'],
            answer: 1,
          },
          {
            q: 'CPCTC stands for "Corresponding Parts of Congruent Triangles are Congruent." When is CPCTC used in a proof?',
            choices: [
              'Before proving congruence, to establish that sides are equal',
              'After proving two triangles are congruent, to conclude that specific corresponding parts are equal',
              'Only in right triangle proofs',
              'As a replacement for SSS',
            ],
            answer: 1,
          },
        ],
      },
    ],
  };

  // ── Helper: shuffle array ────────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Public functions ─────────────────────────────────────────

  /**
   * Returns up to `count` random questions from a specific topic.
   * difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
   * (For Q1, all questions are mixed difficulty by default; difficulty param
   *  is reserved for future per-question tagging)
   */
  function getRandomQuiz(subject, topicId, count, difficulty) {
    const subjectTopics = TOPICS[subject];
    if (!subjectTopics) return [];
    const topic = subjectTopics.find(t => t.id === topicId);
    if (!topic) return [];
    const pool = shuffle(topic.questions);
    return pool.slice(0, Math.min(count || 5, pool.length));
  }

  /**
   * Returns the list of topics for a given subject.
   */
  function getTopicsBySubject(subject) {
    return TOPICS[subject] || [];
  }

  /**
   * Returns a dialogue object (in Story.DIALOGUES format) for a teaching NPC
   * delivering a lesson on the given topic.
   * Format: array of { speaker, text } nodes.
   */
  function getTeacherDialogue(topicId) {
    // Find the topic in either subject
    let topic = null;
    for (const subj of Object.values(TOPICS)) {
      const found = subj.find(t => t.id === topicId);
      if (found) { topic = found; break; }
    }
    if (!topic) return null;

    const subjectDef = SUBJECTS[topic.subject];
    const speakerKey = topic.subject === 'biology' ? 'kessler' : 'voss';
    const speakerLabel = topic.subject === 'biology' ? 'Dr. Kessler' : 'Voss';

    // Inject speaker into Story.CHARACTERS if not already present
    if (typeof Story !== 'undefined' && !Story.CHARACTERS[speakerKey]) {
      Story.CHARACTERS[speakerKey] = { name: speakerLabel, color: subjectDef.color };
    }

    const nodes = [
      {
        speaker: speakerKey,
        text: `I heard you were asking about ${topic.name.toLowerCase()}. I know a bit about that.`,
      },
      {
        speaker: speakerKey,
        text: topic.inWorldLesson,
      },
      {
        speaker: speakerKey,
        text: 'Does that make sense? I can test you on it, if you want. Knowing it is one thing. Knowing that you know it is another.',
        choices: [
          { label: 'Give me the test.', next: '__kt_quiz_' + topicId, setFlag: 'kt_accepted_' + topicId },
          { label: 'Maybe later.', next: null },
        ],
      },
    ];

    return nodes;
  }

  /**
   * Sets up a quiz using the Memory Prison infrastructure.
   * Uses 8 questions, 70% pass threshold, 120 second limit.
   * onPass and onFail are callbacks.
   */
  function startTeachingQuiz(topicId, onPass, onFail) {
    let topic = null;
    for (const subj of Object.values(TOPICS)) {
      const found = subj.find(t => t.id === topicId);
      if (found) { topic = found; break; }
    }
    if (!topic) return false;

    const questions = shuffle(topic.questions).slice(0, 8);
    const subjectDef = SUBJECTS[topic.subject];
    const speakerLabel = topic.subject === 'biology' ? 'Dr. Kessler' : 'Voss';

    // Inject quiz into Story's Memory Prison infrastructure via UI.startMemoryPrison
    // We build a synthetic quiz object matching Story.getMemoryPrisonQuiz() format
    const quizObj = {
      characterName: speakerLabel,
      flavor: `${speakerLabel} is watching you carefully. Answer as if your life depends on it — because out here, it might.`,
      questions,
      timeLimit: 120,
      attemptNumber: 0,
    };

    if (typeof UI !== 'undefined') {
      // Directly set quizState — matches the shape UI.startMemoryPrison creates
      UI.quizState = {
        quiz: quizObj,
        currentQ: 0,
        selected: -1,
        answers: [],
        timeLeft: quizObj.timeLimit,
        done: false,
        passed: false,
        flash: 0,
        flashColor: '',
        _onPass: onPass,
        _onFail: onFail,
        _isTeachingQuiz: true,
      };
    }

    return true;
  }

  /**
   * Returns 5 random questions from the entire curriculum pool.
   * Used for Knowledge Trials (pop quiz undo mechanic).
   */
  function getKnowledgeTrialQuiz() {
    const allQuestions = [];
    for (const subjectTopics of Object.values(TOPICS)) {
      for (const topic of subjectTopics) {
        for (const q of topic.questions) {
          allQuestions.push({ ...q, _topic: topic.name, _subject: topic.subject });
        }
      }
    }
    return {
      flavor: 'The fracture between moments holds still. Answer well and reclaim what was lost.',
      timeLimit: 60,
      questions: shuffle(allQuestions).slice(0, 5),
    };
  }

  /**
   * Injects curriculum questions into the Memory Prison for Aldric.
   * Call once after curriculum is loaded.
   */
  function injectIntoMemoryPrison() {
    if (typeof Story === 'undefined') return;
    const aldricPrison = Story.MEMORY_PRISON.aldric;
    if (!aldricPrison) return;
    // Build a mixed pool of 20 questions from both subjects
    const pool = [
      ...getKnowledgeTrialQuiz().questions,
      ...getKnowledgeTrialQuiz().questions,
      ...getKnowledgeTrialQuiz().questions,
      ...getKnowledgeTrialQuiz().questions,
    ];
    aldricPrison.curriculumQuestions = shuffle(pool).slice(0, 20);
  }

  // ── Player-aware quiz (uses config.js to filter by profile) ────
  // Returns a quiz using only the subjects configured for this player.
  function getQuizForPlayer(profileName, count = 5) {
    const cfg = typeof getPlayerConfig !== 'undefined' ? getPlayerConfig(profileName) : null;
    const subjects = cfg?.subjects?.length ? cfg.subjects : Object.keys(TOPICS);
    const allQuestions = [];
    for (const subj of subjects) {
      for (const topic of (TOPICS[subj] || [])) {
        for (const q of topic.questions) {
          allQuestions.push({ ...q, _topicId: topic.id, _topicName: topic.name, _subject: subj });
        }
      }
    }
    return {
      flavor: 'The fracture between moments holds still. Answer well and reclaim what was lost.',
      timeLimit: 60,
      questions: shuffle(allQuestions).slice(0, count),
    };
  }

  // ── Record answer through analytics ─────────────────────────
  // Wraps Analytics.recordAnswer with topic name injection.
  function recordQuizAnswer(profileName, topicId, subject, questionText, choices, correctIdx, playerIdx) {
    if (typeof Analytics !== 'undefined') {
      // Ensure topic name is registered
      const topic = getTopicById(topicId);
      if (topic) Analytics.setTopicName(profileName, topicId, topic.name, subject);
      Analytics.recordAnswer(profileName, topicId, subject, questionText, choices, correctIdx, playerIdx);
    }
  }

  function getTopicById(topicId) {
    for (const topics of Object.values(TOPICS)) {
      const t = topics.find(t => t.id === topicId);
      if (t) return t;
    }
    return null;
  }

  // ── All topics flat list (for stats screen) ──────────────────
  function getAllTopics(profileName) {
    const cfg = typeof getPlayerConfig !== 'undefined' ? getPlayerConfig(profileName) : null;
    const subjects = cfg?.subjects?.length ? cfg.subjects : Object.keys(TOPICS);
    const result = [];
    for (const subj of subjects) {
      for (const topic of (TOPICS[subj] || [])) {
        result.push({ ...topic, subject: subj });
      }
    }
    return result;
  }

  return {
    SUBJECTS,
    TOPICS,
    getRandomQuiz,
    getTopicsBySubject,
    getTeacherDialogue,
    startTeachingQuiz,
    getKnowledgeTrialQuiz,
    injectIntoMemoryPrison,
    getQuizForPlayer,
    recordQuizAnswer,
    getTopicById,
    getAllTopics,
  };
})();
