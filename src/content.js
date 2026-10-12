// All player-facing text lives here so it can be edited without touching code.
// (Dialogue and quiz texts from GAME_DESIGN.md §5 are added here in milestones 4–7.)
(function () {
  const G = window.G;

  G.CONTENT = {
    title: {
      logo: 'MIND THE ICEBERG',
      subtitle: 'The Case of Little Hans',
      tagline: "A 2-player game about Freud's psychodynamic approach",
      start: 'Press F or Enter to start',
      credits: 'A school project · AQA A-level Psychology',
    },

    // Animated back-story before the name entry (click through with F / Enter, Esc skips). Historically accurate.
    intro: {
      panels: [
        'Vienna, 1908. Four-year-old Herbert Graf loves watching the horses that pull the carts and buses through the busy streets.',
        'One day, a horse pulling a heavy bus falls down right in front of him. It kicks wildly with its legs. Herbert screams.',
        'From then on, Herbert is terrified of horses. He refuses to leave the house. He is afraid that a horse will bite him.',
        'His father, Max Graf, is a supporter of the famous doctor Sigmund Freud. He writes down everything his son says and does, and sends it to Freud.',
        'Freud studies every letter. To protect the boy, he gives him a different name in his notes: LITTLE HANS.',
        'Freud believes the fear of horses is only a disguise for something hidden much deeper. He needs help. Then there is a knock at the door…',
      ],
      letter: ['Dear Professor,', 'Herbert is afraid', 'that a horse will', 'bite him in the', 'street. He will not', 'go outside...', '', '   Max Graf'],
      file: { title: 'CASE NOTES', real: 'Herbert Graf', stamp: 'LITTLE HANS' },
      knock: 'KNOCK!',
      next: 'F / Enter: next',
      skip: 'Esc: skip',
    },

    names: {
      heading: 'WHO ARE YOU?',
      prompts: ['Player 1 (WASD) – type your name:', 'Player 2 (Arrows) – type your name:'],
      defaults: ['Player 1', 'Player 2'],
      hint: 'Enter to confirm · Backspace to delete',
      maxLen: 10,
    },

    creator: {
      heading: ['PLAYER 1 · THE ID', 'PLAYER 2 · THE SUPEREGO'],
      rows: ['BODY', 'FUR / SKIN COLOUR', 'HAIR / HEAD TUFT', 'OUTFIT COLOUR', 'ACCESSORY', 'READY'],
      bodies: ['Cat', 'Fox', 'Owl', 'Human'],
      hair: {
        cat: ['Pointy ears', 'Round ears', 'Folded ears', 'Ears + tuft'],
        fox: ['Tall ears', 'Dark tips', 'Short ears', 'Fluffy cheeks'],
        owl: ['Smooth head', 'Small tufts', 'Horn tufts', 'Crest'],
        human: ['Short', 'Long', 'Spiky', 'Bun'],
      },
      accessories: ['None', 'Round glasses', 'Top hat', 'Scarf', 'Flower crown', 'Cap'],
      roles: [
        'You will play: THE ID – fast, impulsive, can SMASH and PUSH',
        'You will play: THE SUPEREGO – wise and strict, can READ and BUILD',
      ],
      // first explanation of the two roles (Freud explains them in more detail in Room 1)
      explain: [
        'THE ID: the part of the mind that wants everything NOW.',
        'THE SUPEREGO: the inner sense of right and wrong.',
      ],
      keys: ['W/S row · A/D change · F ready', '↑/↓ row · ←/→ change · Enter ready'],
      readyButton: ['F: READY', 'Enter: READY'],
      ready: 'READY!',
      bothReady: 'Both ready!',
    },

    hud: { attacks: 'Anxiety attacks' },

    controls: {
      p1: 'WASD move · F action',
      p2: '↑↓←→ move · Enter action',
    },

    hints: {
      waitPartner: 'Wait for your partner!',
      crateSuperego: "That's not very Superego of you…",
      cantRead: "Boring. Can't read that.",
      cantBuild: 'Only the SUPEREGO can BUILD.',
      blueprintFirst: 'Read the Rule Stone first!',
      tooHeavy: 'Too heavy! Only the ID can PUSH.',
      agree: 'You need to agree!',
      checkAge: 'Wrong stage! Ask what the pedestal says.',
      plateFor: { id: 'Red plate: ID only!', superego: 'Blue plate: SUPEREGO only!' },
    },

    speakers: { freud: 'DR. FREUD', stone: 'RULE STONE', pedestal: 'PEDESTAL', repressor: 'THE REPRESSOR' },

    anxiety: {
      title: 'ANXIETY ATTACK!',
      id: 'Too much Id: impulsive and selfish!',
      superego: 'Too much Superego: crushed by guilt!',
    },

    // ---------- Rooms (§5). [P1] / [P2] are replaced by the players' names. ----------
    study: {
      freud: [
        'Ah, my new assistants, [P1] and [P2]! Welcome to Berggasse 19, Vienna.',
        "My PSYCHODYNAMIC approach says that our behaviour is driven by forces inside the mind, and we are not aware of most of them.",
        "My patient is Little Hans. He is five, and so afraid of horses that he won't leave the house.",
        'A fear like this, far stronger than the real danger, is called a PHOBIA.',
        'I believe this fear is a disguise. The real cause is hidden in his UNCONSCIOUS.',
        "The UNCONSCIOUS is the hidden part of the mind: we can't look into it, but it still drives what we do.",
        'I say the mind has three parts: the ID, the EGO and the SUPEREGO. You will meet all three.',
        'You will travel into his mind. [P1], you will be his ID. [P2], you will be his SUPEREGO.',
        'Together you form his EGO: the balance between you. Keep it steady!',
        'How to play: [P1] walks with WASD and acts with F. [P2] walks with the arrow keys and acts with Enter. Esc pauses the game.',
        'You can only leave a room TOGETHER: both of you must stand in the exit at the same time.',
        'The counter at the top left shows ANXIETY ATTACKS. I will explain them soon. Try to keep it at zero!',
        'The mind is like an iceberg. Most of it is hidden below the surface. Now, both of you: sit on the couch.',
      ],
    },

    surface: {
      intro: [
        "We are inside Hans's mind now. I can't come with you, but you will hear my voice guiding you.",
        "This is the conscious mind. Let's see what you two can do.",
        '[P1], you are the ID. You exist from birth and want everything NOW. Freud called this the PLEASURE PRINCIPLE: do what feels good, right away.',
        'Walk up to the cracked crates and press F to SMASH them!',
      ],
      superego: [
        '[P2], you are the SUPEREGO. You develop at around age 5. You are the inner sense of right and wrong: the MORALITY PRINCIPLE. You punish with guilt.',
        'Your rules come from your parents and society. Walk up to the Rule Stone and press Enter to READ it.',
        'Then stand on the glowing blueprint by the water and press Enter to BUILD.',
      ],
      rule: 'Rule: We do not jump into icy water. We build a bridge.',
      done: ['Excellent. Neither of you could have done that alone. Onwards, together!'],
    },

    egogate: {
      startEgo: -60,
      intro: [
        "The EGO develops at around age 2. It follows the REALITY PRINCIPLE: it finds realistic ways to satisfy the Id without breaking the Superego's rules.",
        'Look at the top of the screen: that is the EGO METER. The marker moves LEFT when the Id gets stronger, and RIGHT when the Superego gets stronger.',
        'Hans is a small child, so his Id is still very strong: the marker is far on the Id side.',
        "The green middle means the Ego is BALANCED. The Ego Gate only opens when the marker is in the green. Find the balance!",
        'Red DESIRE ORBS feed the Id: only [P1] can take them, and they pull the marker towards the Id. Blue RULE SCROLLS feed the Superego: only [P2] can take them.',
        'Careful: if the Id or the Superego gets far too strong, the Ego is overwhelmed by ANXIETY, a feeling of fear and stress. That is an ANXIETY ATTACK!',
        'When the screen edges glow red or blue, you are close to one. An attack freezes you both for a moment.',
      ],
      quizStart: [
        'Balanced! The gate is opening. Now answer my questions TOGETHER: both of you stand on the same answer tile until the ring is full.',
        'Think first: every wrong answer pushes the Ego off balance. To answer again, step off the tile and back on.',
      ],
      options: ['ID', 'EGO', 'SUPEREGO'],
      title: 'Who is speaking?',
      quiz: [
        { q: '"I want that cake. NOW!"', answer: 0,
          right: 'Right! The Id wants INSTANT GRATIFICATION: getting what it wants immediately. That is the pleasure principle.',
          hint: 'Who wants things immediately, without thinking?' },
        { q: '"Taking the cake would be stealing. You should feel ashamed!"', answer: 2,
          right: 'Right! The Superego is our CONSCIENCE, the inner voice of right and wrong. It punishes us with guilt.',
          hint: 'Who talks about right, wrong and guilt?' },
        { q: '"Let\'s wait until after dinner and ask if we can have a slice."', answer: 1,
          right: 'Right! The Ego finds a realistic compromise: the reality principle.',
          hint: 'Who balances wishes and rules?' },
      ],
    },

    stages: {
      intro: [
        'Freud believed children pass through five PSYCHOSEXUAL STAGES as they grow up.',
        '"Psycho" means mind. By "sexual", Freud meant any kind of bodily pleasure, not only adult sex.',
        'At each stage, the LIBIDO, our pleasure energy, focuses on a different part of the body.',
        '[P2], walk up to each pedestal and press Enter to read which stage belongs there.',
        '[P1], walk into a tablet to PUSH it. Push the right tablet onto each pedestal!',
      ],
      // Pedestals left → right (slot 1–5).
      pedestals: [
        { accept: 'oral', short: '0–1', text: 'The ORAL stage ("oral" = of the mouth). Age 0–1. Focus: the mouth. Pleasure from sucking and feeding.' },
        { accept: 'anal', short: '1–3', text: 'The ANAL stage. Age 1–3. Focus: the anus (the bottom). The big conflict: toilet training.' },
        { accept: 'phallic', short: '3–6', text: 'The PHALLIC stage ("phallus" = penis). Age 3–6. Focus: the genitals. The Oedipus or Electra complex.',
          explain: [
            'The GENITALS are the sex organs. A COMPLEX is a group of strong, hidden feelings that are in conflict.',
            'OEDIPUS COMPLEX: a boy wants his mother for himself and sees his father as a RIVAL, someone he competes with.',
            'It is named after Oedipus, a king in a Greek myth who married his mother without knowing it. In girls, Freud called the similar conflict the ELECTRA COMPLEX.',
          ] },
        { accept: 'latency', short: '6–12', text: 'The LATENCY stage ("latent" = hidden, sleeping). Age 6 to puberty. Earlier conflicts are repressed; energy goes into school and friends.',
          explain: ['REPRESSED means pushed out of awareness, down into the unconscious. PUBERTY is when the body grows into an adult body.'] },
        { accept: 'genital', short: '12+', text: 'The GENITAL stage. Puberty onwards. Sexual desires become conscious and lead to adult relationships.' },
      ],
      tablets: { oral: 'ORAL', anal: 'ANAL', phallic: 'PHALLIC', latency: 'LATENCY', genital: 'GENITAL' },
      done: ['Perfect. Every adult carries these stages inside them.'],
    },

    grove: {
      intro: [
        'If a conflict at one stage is not resolved, a person can become FIXATED: part of their libido stays stuck at that stage.',
        'The fixation shows in their adult personality. Which stage is each person stuck in?',
      ],
      options: ['ORAL', 'ANAL', 'PHALLIC'],
      title: 'Which stage?',
      quiz: [
        { q: '"I can\'t stop biting my nails… and I smoke a lot."', answer: 0,
          right: 'Right! Oral fixation: smoking, nail-biting, chewing, and sarcasm ("biting" people with words).',
          hint: 'Which stage is all about the mouth?' },
        { q: '"Everything must be perfectly tidy. And I never lend anyone money!"', answer: 1,
          right: 'Right! Anal-retentive: obsessively tidy and stingy (strict toilet training). Anal-expulsive people are messy and disorganised.',
          hint: 'Which stage is about toilet training and control?' },
        { q: '"Look at me! I\'m the best, I love myself, and I take crazy risks!"', answer: 2,
          right: 'Right! Phallic fixation: self-obsessed (narcissistic) and reckless.',
          hint: 'Which stage comes at age 3–6?' },
      ],
      memory: [
        'A memory of Hans. He is five, in the PHALLIC stage.',
        'Here, Freud says, boys experience the OEDIPUS COMPLEX: they want their mother for themselves and see their father as a rival.',
        'The boy fears his father will punish him. In girls, Freud described a similar conflict: the ELECTRA COMPLEX.',
        'It is resolved when the child IDENTIFIES with the same-sex parent, and that is when the Superego forms.',
        "To IDENTIFY with someone means wanting to be like them and taking on their values and rules.",
        "But Hans's fear of his father was too frightening… so his Ego pushed it down. Deeper.",
      ],
    },

    dream: {
      intro: [
        "The unconscious can't be seen directly, but it shows itself in DREAMS. Freud called dreams 'the royal road to the unconscious': the best way in.",
        'What you remember of a dream is the MANIFEST content. The hidden meaning behind it is the LATENT content.',
        "Hans keeps dreaming of a frightening horse with BLINKERS: the leather flaps beside a horse's eyes that make it look straight ahead.",
        'Match each dream image to its hidden meaning! [P2], stand on a BLUE plate: a dream image. [P1], stand on a RED plate: a hidden meaning.',
        'Stay on your plates together for a moment, and the match is checked. It is dark down here, so explore with your light.',
      ],
      // manifest (left, Superego) ↔ latent (right, Id)
      pairs: [
        { manifest: 'horse', latent: 'father', mLabel: 'BIG HORSE', lLabel: 'FATHER', text: "A big horse = Hans's father" },
        { manifest: 'blinkers', latent: 'glasses', mLabel: 'BLINKERS', lLabel: 'GLASSES', text: "Black blinkers = Father's glasses" },
        { manifest: 'mouth', latent: 'moustache', mLabel: 'BLACK MOUTH', lLabel: 'MOUSTACHE', text: "Black around the mouth = Father's moustache" },
      ],
      right: 'Match! ',
      hint: 'Look at the details: eyes, mouth, size…',
      done: [
        "Do you see? Hans isn't really afraid of horses. He is afraid of his FATHER.",
        "A DEFENCE MECHANISM is an unconscious strategy the Ego uses to protect itself from anxiety.",
        'His Ego moved the fear onto a safer target. That is a defence mechanism called DISPLACEMENT.',
      ],
    },

    boss: {
      intro: [
        { who: 'repressor', text: 'THIS MEMORY STAYS LOCKED. FORGET IT. FORGET… EVERYTHING.' },
        "That is THE REPRESSOR: Hans's repression in person, the force that keeps painful memories locked away.",
        "Behind it is the vault where Hans's Ego REPRESSED the memory. Open the three locks!",
        'To open a lock, [P1] stands on the RED plate and [P2] on the BLUE plate, TOGETHER, while the Ego is balanced. Then answer my question.',
        'Dodge the grey fog! If it hits [P1], the Id grows stronger. If it hits [P2], the Superego does. Either way, the Ego loses its balance.',
      ],
      title: 'Lock',
      charge: 'Stand on your plates together, with a balanced Ego!',
      needPlates: 'Both of you: stand on your plates!',
      needBalance: 'Balance the Ego first!',
      charging: 'Charging the lock…',
      quiz: [
        { q: 'Which psychosexual stage is Hans in?', options: ['ORAL', 'PHALLIC', 'LATENCY'], answer: 1,
          right: 'Right! Hans is 5: the phallic stage (age 3–6).', hint: 'How old is Hans?' },
        { q: "Which complex explains Hans's feelings towards his parents?", options: ['ELECTRA', 'OEDIPUS', 'INFERIORITY'], answer: 1,
          before: ["One answer is new: the INFERIORITY COMPLEX is not Freud's idea. Alfred Adler described it: feeling that you are worth less than other people."],
          right: 'Right! The Oedipus complex: rivalry with the father, fear of punishment.', hint: 'Hans is a boy…' },
        { q: 'Why is Hans really afraid of horses?', options: ['A HORSE BIT HIM', 'FEAR OF FATHER, DISPLACED', 'DENIAL'], answer: 1,
          right: 'Right! His fear of his father was displaced onto horses.', hint: 'Remember the dream!' },
      ],
    },

    ending: {
      freud: [
        'The repressed fear has become CONSCIOUS. Now Hans can face it.',
        'Hans resolved his Oedipus complex by IDENTIFYING with his father. He wanted to be like him, not to fight him.',
        'And without the fear, he no longer needs horses as a disguise. Well done, [P1] and [P2]!',
      ],
      caption: 'Hans is no longer afraid of horses.',
    },

    casenotes: {
      title: 'CASE NOTES – Little Hans (1909)',
      solved: 'Solved by [P1] (Id) & [P2] (Superego)',
      time: 'Time',
      score: 'Correct first try',
      attacks: 'Anxiety attacks',
      total: 20,
      realName: "'Little Hans' was really Herbert Graf (1903–1973). Freud changed his name to protect him. Herbert later became a famous opera director.",
      learnedTitle: 'What you learned:',
      learned: [
        'The mind is like an iceberg: conscious, preconscious, UNCONSCIOUS.',
        'ID (pleasure principle) · EGO (reality principle) · SUPEREGO (morality principle).',
        '5 PSYCHOSEXUAL STAGES: oral, anal, phallic, latency, genital. Unresolved conflict leads to FIXATION.',
        'OEDIPUS COMPLEX (boys) / ELECTRA COMPLEX (girls).',
        'DEFENCE MECHANISMS: repression, denial, displacement.',
        'DREAMS: manifest vs. latent content.',
      ],
      evalTitle: 'But is Freud right?',
      eval: [
        { good: true, label: 'Strength',
          text: 'Freud showed that unconscious processes can influence behaviour, and his ideas led to talking therapies like PSYCHOANALYSIS (the patient talks freely to uncover unconscious causes).' },
        { good: false, label: 'Limitation',
          text: 'Many of his ideas (e.g. the Oedipus complex) are UNFALSIFIABLE: they can\'t be scientifically tested or proven wrong (the philosopher Karl Popper).' },
        { good: false, label: 'Limitation',
          text: "His theory is based on CASE STUDIES (in-depth studies of one person) like Hans. Most information came from Hans's father, a supporter of Freud, and Freud only met Hans briefly. So it is hard to GENERALISE (apply to everyone), and open to BIAS (seeing what you hope to see)." },
      ],
      again: 'F / Enter: Play again',
    },

    pause: {
      title: 'PAUSED',
      items: ['Resume', 'Restart room', 'Sound', 'Music', 'Fullscreen', 'Quit to title'],
      on: 'ON', off: 'OFF',
      hint: 'W/S or ↑/↓ · F / Enter · Esc',
      keys: 'M: all sound · N: music · - / +: music volume',
    },

    guards: {
      intro: [
        "The Ego protects itself from anxiety with DEFENCE MECHANISMS. They work unconsciously, so we don't know we're using them.",
        "These guards protect Hans's secret. Name the defence mechanism in each case, and they will lose their power!",
        'REPRESSION: a painful memory is pushed out of awareness into the unconscious. DENIAL: refusing to accept a reality because it is too painful.',
        'And you know DISPLACEMENT: feelings are moved onto a safer target.',
      ],
      options: ['REPRESSION', 'DENIAL', 'DISPLACEMENT'],
      guards: ['DENIAL', 'DISPLACEMENT', 'REPRESSION'],
      title: 'Defence mechanism?',
      quiz: [
        { q: '"Sam\'s doctor says smoking is damaging his lungs. Sam says: \'Nonsense, I\'m perfectly healthy.\'"', answer: 1,
          right: "Right! Denial: refusing to accept reality because it's too painful.",
          hint: 'Sam refuses to accept the truth…' },
        { q: '"Mia gets shouted at by her boss. At home, she yells at her little brother."', answer: 2,
          right: 'Right! Displacement: feelings are redirected onto a safer target.',
          hint: "Mia's anger moves to someone else…" },
        { q: '"Leo was in a car crash as a child but has no memory of it at all."', answer: 0,
          right: 'Right! Repression: a distressing memory is forced into the unconscious, but it can still affect behaviour.',
          hint: 'The memory has been pushed out of awareness…' },
      ],
    },

    // Iceberg Map screens (§3.6 / §5), one per layer.
    layers: [
      { name: 'CONSCIOUS', text: 'CONSCIOUS: the tip of the iceberg. Everything you are aware of right now.' },
      { name: 'PRECONSCIOUS', text: "PRECONSCIOUS: just below the surface. Memories we aren't thinking about, but could recall if we tried." },
      { name: 'UNCONSCIOUS', text: 'UNCONSCIOUS: the hidden majority of the mind. Fears, desires and memories we cannot access, but they still drive our behaviour.' },
    ],
    mapContinue: 'Press F or Enter to continue',
  };
})();
