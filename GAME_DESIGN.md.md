# MIND THE ICEBERG – The Case of Little Hans
### Game Design Document (complete spec for Claude Code)

> **For Claude Code:** This document describes the *whole* game: story, controls, mechanics, every room, every puzzle, all in-game text and the build order. Build exactly this. Where something is not specified, choose the simplest option that fits the style. The attached screenshots (Google Doodle "Champion Island Games") are a **style reference only** – see §9.

---

## 0. Quick facts

| | |
|---|---|
| **Genre** | 2D top-down co-op puzzle adventure, pixel art |
| **Players** | Exactly 2, on **one PC and one keyboard** (local co-op, no online) |
| **Play time** | 12–15 minutes for one full playthrough (hard limit: 15 min) |
| **Purpose** | School project (AQA A-level Psychology): learn **and apply** Freud's psychodynamic approach |
| **Platform** | Runs in a web browser: open `index.html`, no install, no internet needed |
| **Language** | All in-game text in **English** |
| **Core idea** | The two players *are* two parts of a child's mind: **Player 1 = the ID**, **Player 2 = the SUPEREGO**. The **EGO** is the balance between them (a shared meter). They travel down an iceberg-shaped mind to free a repressed memory. |

**Design rules (apply everywhere):**
1. **Nothing can be solved by one player alone.** Every gate, puzzle and quiz needs both players.
2. **Learn → apply right away.** Each Freud concept is introduced in 1–3 short lines, then the players must *use* it straight away (sort it, match it, identify it in a scenario).
3. **No game over.** Mistakes cost time and cause "anxiety" (a short penalty plus an explanation). The game can always be finished.
4. **Short text.** Max ~2 lines per dialogue box, max ~4 boxes in a row.

---

## 1. Story

**Vienna, 1909. Berggasse 19 – Sigmund Freud's study.**

Freud has a new patient: **Little Hans**, 5 years old, who is so terrified of horses that he refuses to leave the house. Freud believes the fear is a *disguise*: the real cause is locked away in Hans's **unconscious mind**.

The two players are Freud's new assistants. Freud sends them *into Hans's mind*: one becomes Hans's **Id**, the other his **Superego**. Together they form his **Ego** and must keep it balanced.

Hans's mind is an **iceberg**. The players travel down through its three levels:
1. **The Surface – CONSCIOUS** (sunny ice beach). They learn who they are (Id, Ego, Superego).
2. **The Memory Forest – PRECONSCIOUS** (snowy forest on the ice). They sort Hans's development (the psychosexual stages) and discover he is in the phallic stage (the Oedipus complex).
3. **The Deep – UNCONSCIOUS** (dark underwater ice caves). They analyse Hans's dream (displacement) and defeat the defence mechanisms.
4. **Boss: The Repression Vault.** They open the vault where Hans's Ego has **repressed** his real fear: fear of his **father**, which was **displaced** onto horses.

**Ending:** The fear becomes conscious, and Hans is no longer afraid of horses. The game ends with a "Case Notes" screen that summarises everything learned, plus an evaluation of Freud (strengths and limitations).

---

## 2. Controls

| Action | Player 1 – ID | Player 2 – SUPEREGO |
|---|---|---|
| Move | **W A S D** | **Arrow keys** |
| Action | **F** | **Enter** (also accept **Right Shift** and **Numpad 0**) |
| Advance dialogue | F *or* Enter (either player) | |
| Pause / menu | **Esc** | |
| Mute sound | **M** | |

- Both players must be able to move **at the same time**: track pressed keys in a set, never rely on key-repeat.
- Call `preventDefault()` on arrow keys, space and Enter so the page never scrolls.
- Diagonal movement allowed; normalise the speed.
- A **controls reminder** is always visible in small text in the bottom corners (P1 left, P2 right).

### Role abilities (this is what forces co-op)

| | ID (Player 1) | SUPEREGO (Player 2) |
|---|---|---|
| Speed | Fast (1.25×) | Normal (1.0×) |
| Action key | **SMASH:** breaks cracked crates and ice blocks in front of the player | **READ / BUILD:** reads Rule Stones (reveals hidden text) and builds bridges at Blueprint spots |
| Unique | **PUSH:** only the Id can push heavy stone tablets (by walking into them) | **REVEAL:** engraved texts and some objects only become readable when the Superego reads them |
| Collects | **Desire Orbs** (red, sweets/cake icons): push the Ego Meter toward the ID side | **Rule Scrolls** (blue): push the Ego Meter toward the SUPEREGO side |
| Look | warm aura (small red/orange flame particles) + "ID" tag | cool aura (small blue/white halo) + "SUPEREGO" tag |

The aura and tag are added **on top of** the customised character, so roles stay clear whatever the players choose.

---

## 3. Core mechanics

### 3.1 The Ego Meter (shared HUD bar, top centre)
- A horizontal bar from **ID (−100, left, red)** to **SUPEREGO (+100, right, blue)**, with a **green "Balanced" zone from −15 to +15** in the middle. A small marker shows the current value. Label: **EGO**.
- Desire Orb picked up by the Id: **−20**. Rule Scroll picked up by the Superego: **+20**.
- **Ego Gates** only open while the marker is inside the green zone (this teaches the reality principle and the Ego as mediator).
- **Anxiety:** the meter shakes and the screen gets a red/blue vignette when the value is beyond ±70. If it reaches ±100, an **ANXIETY ATTACK** happens: both players are stunned for 2 seconds, a short message appears ("Too much Id: impulsive and selfish!" / "Too much Superego: crushed by guilt!"), and the meter resets to 0.
- Wrong quiz answers push the meter 25 points away from the centre (toward whichever side it is already on; toward the Id side if it is at 0).

### 3.2 Agreement Tiles (the co-op quiz mechanic)
- A question appears in a text box at the top. 2–3 large floor tiles show the answer options.
- An answer is only submitted when **both players stand on the same tile**. A ring fills over **1 second**, then the answer is checked.
- If the players stand on **different** tiles, show a small bubble: *"You need to agree!"*
- **Correct:** chime, the tile glows green, and the explanation is shown (1–2 lines).
- **Wrong:** buzz, the tile flashes red, the Ego Meter is pushed (see 3.1), and a **hint** is shown. The players try again; the question stays the same.

### 3.3 Two-Player Plates
- Pressure plates coloured red (Id only) or blue (Superego only). Some mechanisms need **both plates held at the same time**. The other player's plate does not count if the wrong role stands on it.

### 3.4 Rooms and camera
- **Every room fits exactly one screen** (Zelda-style). No scrolling camera, so both players are always visible.
- Players cannot leave the screen. A room exit only triggers when **both players stand in the exit zone**; otherwise a hint appears: *"Wait for your partner!"*
- Room transition: quick fade (0.3 s).

### 3.5 Dialogue
- A text box at the bottom with a speaker portrait (Freud or the guard), a typewriter effect, and either action key to skip or advance.
- During dialogue the players cannot move.
- Freud speaks as a **"voice"** inside Hans's mind: show his portrait with a soft glow.

### 3.6 Iceberg Map (transition screen between zones)
- Between zones, show a full-screen **iceberg cross-section** (small tip above the water, huge part below). It has three labelled layers: CONSCIOUS / PRECONSCIOUS / UNCONSCIOUS. Two small player icons move down to the next layer. One line of text explains the layer. "Press F or Enter to continue."
- This map is the game's **visual metaphor** (the mind as an iceberg) and can also be used as a poster image.

---

## 4. Game flow (target times)

| # | Screen / Room | Content | ~Time |
|---|---|---|---|
| 0 | Title screen | Title, "Press F or Enter to start", credits line | 0:15 |
| 1 | Name entry and Character Creator | Both players customise at the same time (split screen) | 1:30 |
| 2 | Freud's Study (intro) | Story setup, roles assigned | 1:00 |
| – | Iceberg Map | → CONSCIOUS | 0:10 |
| 3 | Room 1: The Surface – Tutorial | Id vs Superego abilities, pleasure/morality principle | 1:30 |
| 4 | Room 2: The Ego Gate | Balancing the Ego, reality principle, Id/Ego/Superego quiz | 2:00 |
| – | Iceberg Map | → PRECONSCIOUS | 0:10 |
| 5 | Room 3: Stage Tablets | Order the 5 psychosexual stages (push + read) | 2:00 |
| 6 | Room 4: Fixation Grove | Identify fixations, Hans's memory → Oedipus complex | 1:45 |
| – | Iceberg Map | → UNCONSCIOUS | 0:10 |
| 7 | Room 5: The Dream Chasm | Manifest vs latent content → displacement | 1:45 |
| 8 | Room 6: Guards of the Ego | Defence mechanisms quiz (repression, denial, displacement) | 1:30 |
| 9 | Room 7: BOSS – The Repression Vault | 3 locks: plates + dodge + Hans questions | 2:00 |
| 10 | Ending and Case Notes | Resolution, summary, evaluation, score | 1:00 |
| | | **Total** | **~13–15 min** |

---

## 5. Screens and rooms in detail (incl. all text)

`[P1]` / `[P2]` = the names the players entered.

### 0 · Title screen
- Pixel logo **"MIND THE ICEBERG"**, subtitle *"The Case of Little Hans"*. Background: an iceberg in a sea at sunset, with gentle wave animation.
- Text: *"A 2-player game about Freud's psychodynamic approach"* · *"Press F or Enter to start"*.

### 1 · Name entry and Character Creator
**Name entry** (one after the other, so typing doesn't clash):
- "Player 1 (WASD) – type your name:" → max 10 characters, Enter to confirm. Default if empty: "Player 1".
- Then the same for Player 2 (default "Player 2").

**Character Creator** (split screen: left = P1, right = P2; both edit **at the same time**):
- Each half shows a large preview of the character (scaled 4×, idle animation, slowly turning through the 4 directions).
- **P1:** W/S = choose a row, A/D = change the option, F = Ready. **P2:** ↑/↓, ←/→, Enter = Ready.
- Rows:
  1. **Body:** Cat · Fox · Owl · Human
  2. **Fur / skin colour:** 6 palette options
  3. **Hair / head tuft:** 4 styles (for Human: 4 hairstyles; for animals: ear/tuft variants)
  4. **Outfit colour:** 8 options
  5. **Accessory:** None · Round glasses · Top hat · Scarf · Flower crown · Cap
  6. **READY**
- Small text under each preview: *"You will play: THE ID – fast, impulsive, can SMASH and PUSH"* (P1) or *"You will play: THE SUPEREGO – wise and strict, can READ and BUILD"* (P2).
- When both are READY: *"Both ready!"*, then go to the intro.

### 2 · Freud's Study (intro)
Cosy pixel study: bookshelves, a rug, a desk, a statue, and **the couch**. Freud NPC (pixel man with a white beard, round glasses, dark suit and cigar; keep it simple and respectful). The players spawn at the door.

Dialogue (Freud):
1. "Ah, my new assistants, [P1] and [P2]! Welcome to Berggasse 19, Vienna."
2. "My patient is Little Hans. He is five, and so afraid of horses that he won't leave the house."
3. "I believe this fear is a disguise. The real cause is hidden in his UNCONSCIOUS."
4. "You will travel into his mind. [P1], you will be his ID. [P2], you will be his SUPEREGO."
5. "Together you form his EGO: the balance between you. Keep it steady!"
6. "The mind is like an iceberg. Most of it is hidden below the surface. Now, both of you: sit on the couch."

→ When both players stand on the couch, a swirl transition plays and the Iceberg Map appears.

**Iceberg Map → CONSCIOUS:** *"CONSCIOUS: the tip of the iceberg. Everything you are aware of right now."*

### 3 · Room 1: The Surface (tutorial)
**Look:** bright ice beach, turquoise water, snow, small ice rocks.
**Layout:** the players start on the left. The path to the right is blocked by **cracked crates**. Further right is a **water gap** with a **Blueprint spot** and a **Rule Stone** next to it. The exit is on the right edge.

Freud (on entering):
1. "This is the conscious mind. Let's see what you two can do."
2. "[P1], you are the ID. You exist from birth and want everything NOW: the PLEASURE PRINCIPLE. Press F to SMASH!"

→ The Id smashes the 3 crates (only the Id can; if the Superego presses Enter at a crate: *"That's not very Superego of you…"*, nothing happens).

3. "[P2], you are the SUPEREGO. You develop at around age 5. You are the inner sense of right and wrong: the MORALITY PRINCIPLE. You punish with guilt."
4. "Press Enter at the Rule Stone to READ it."

→ The Superego reads the Rule Stone: *"Rule: We do not jump into icy water. We build a bridge."* The Blueprint spot activates. The Superego presses Enter on it, and a plank bridge builds with an animation. (The Id cannot read Rule Stones: *"Boring. Can't read that."*)

5. "Excellent. Neither of you could have done that alone. Onwards, together!"

### 4 · Room 2: The Ego Gate
**Look:** an ice plateau with a big ice gate (EGO GATE) in the middle of the top wall. In front of the gate are 3 Agreement Tiles. Placed around the room: **4 Rule Scrolls** (blue) and **3 Desire Orbs** (red, cake/sweet icons).
**Start value of the Ego Meter: −60** (Id side).

Freud:
1. "The EGO develops at around age 2. It follows the REALITY PRINCIPLE: it finds realistic ways to satisfy the Id without breaking the Superego's rules."
2. "Hans is a small child, so his Id is still very strong. Look at the Ego Meter!"
3. "The Ego Gate only opens when the Ego is BALANCED. Find the balance!"

→ The Superego collects scrolls (+20 each), the Id collects orbs (−20 each). With 3 scrolls the meter is at 0. If the Superego takes all 4 (+20), the Id has to take an orb. When the meter is in the green zone, the gate's ice cracks and the gate opens partly. Then the quiz starts in front of it.

**Quiz: "Who is speaking?"** Tiles: **ID · EGO · SUPEREGO**

| # | Question (shown in the top box) | Correct | Feedback if correct | Hint if wrong |
|---|---|---|---|---|
| 1 | *"I want that cake. NOW!"* | ID | "Right! The Id wants instant gratification: the pleasure principle." | "Who wants things immediately, without thinking?" |
| 2 | *"Taking the cake would be stealing. You should feel ashamed!"* | SUPEREGO | "Right! The Superego is our conscience and punishes us with guilt." | "Who talks about right, wrong and guilt?" |
| 3 | *"Let's wait until after dinner and ask if we can have a slice."* | EGO | "Right! The Ego finds a realistic compromise: the reality principle." | "Who balances wishes and rules?" |

→ After 3 correct answers the gate opens fully and a hole in the ice appears. Both players step in, and the Iceberg Map appears.

**Iceberg Map → PRECONSCIOUS:** *"PRECONSCIOUS: just below the surface. Memories we aren't thinking about, but could recall if we tried."*

### 5 · Room 3: The Stage Tablets
**Look:** a snowy forest on the ice, with glowing memory bubbles floating in the air (decoration).
**Layout:** **5 heavy stone tablets** scattered in the lower half, each labelled ORAL / ANAL / PHALLIC / LATENCY / GENITAL. In the upper half are **5 pedestals in a row (from left to right = slot 1–5)**. Each pedestal shows "?" until the **Superego reads it** (Enter); then it shows its engraved text permanently.

Freud:
1. "Freud believed children pass through five PSYCHOSEXUAL STAGES."
2. "At each stage, the LIBIDO, our pleasure energy, focuses on a different part of the body."
3. "[P2], read the pedestals. [P1], push the right tablet onto each one!"

| Pedestal (left → right) | Engraved text (shown after Superego reads it) | Correct tablet |
|---|---|---|
| 1 | "Age 0–1. Focus: the mouth. Pleasure from sucking and feeding." | ORAL |
| 2 | "Age 1–3. Focus: the anus. Conflict: toilet training." | ANAL |
| 3 | "Age 3–6. Focus: the genitals. The Oedipus or Electra complex." | PHALLIC |
| 4 | "Age 6 to puberty. Earlier conflicts are repressed; energy goes into school and friends." | LATENCY |
| 5 | "Puberty onwards. Desires become conscious; adult relationships." | GENITAL |

- Only the Id can push tablets (grid-based pushing, 1 tile per push, Sokoban-style but in an open area so nothing can get stuck; if a tablet does get stuck, it resets to its start position after 3 s).
- Tablet on the **correct** pedestal: it snaps in, glows gold, chime. On a **wrong** pedestal: buzz, it slides back one tile, and a hint appears: *"Check the age on the pedestal!"*
- All 5 correct → a path to the exit opens. Freud: *"Perfect. Every adult carries these stages inside them."*

### 6 · Room 4: The Fixation Grove
**Layout:** 3 ghostly "memory adults" (NPCs, semi-transparent) stand next to each other. In front of them are 3 Agreement Tiles: **ORAL · ANAL · PHALLIC**. A large, faint **memory bubble** floats at the top (initially closed).

Freud:
1. "If a conflict at one stage is not resolved, a person can become FIXATED at that stage."
2. "The fixation shows in their adult personality. Which stage is each person stuck in?"

| # | NPC says | Correct | Feedback if correct | Hint if wrong |
|---|---|---|---|---|
| 1 | *"I can't stop biting my nails… and I smoke a lot."* | ORAL | "Right! Oral fixation: smoking, nail-biting, chewing, sarcasm." | "Which stage is all about the mouth?" |
| 2 | *"Everything must be perfectly tidy. And I never lend anyone money!"* | ANAL | "Right! Anal-retentive: obsessively tidy and stingy (strict toilet training). Anal-expulsive people are messy and disorganised." | "Which stage is about toilet training and control?" |
| 3 | *"Look at me! I'm the best, I love myself, and I take crazy risks!"* | PHALLIC | "Right! Phallic fixation: self-obsessed (narcissistic) and reckless." | "Which stage comes at age 3–6?" |

→ After 3 correct answers, the NPCs fade out and the **memory bubble opens**: a pixel scene of little Hans (5) with his mother and his father (the father has **round glasses and a dark moustache**). The father stands slightly apart and looks big and stern.

Freud:
1. "A memory of Hans. He is five, in the PHALLIC stage."
2. "Here, Freud says, boys experience the OEDIPUS COMPLEX: they want their mother for themselves and see their father as a rival."
3. "The boy fears his father will punish him. In girls, Freud described a similar conflict: the ELECTRA COMPLEX."
4. "It is resolved when the child IDENTIFIES with the same-sex parent, and that is when the Superego forms."
5. "But Hans's fear of his father was too frightening… so his Ego pushed it down. Deeper."

→ The floor cracks and the players fall down to the Iceberg Map.

**Iceberg Map → UNCONSCIOUS:** *"UNCONSCIOUS: the hidden majority of the mind. Fears, desires and memories we cannot access, but they still drive our behaviour."*

### 7 · Room 5: The Dream Chasm
**Look:** dark underwater ice cave with bioluminescent plants. **Darkness effect:** everything is dark except a light circle (radius ~4 tiles) around each player.
**Layout:** a chasm through the middle (vertical). **Left side (Superego only can stand here; the Id spawns on the right):** 3 blue plates showing **manifest images**. **Right side (Id):** 3 red plates showing **latent images**. The plates are only visible inside a player's light circle. A bridge across the chasm is built piece by piece (3 parts).

Freud:
1. "The unconscious can't be seen directly, but it shows itself in DREAMS. Freud called dreams 'the royal road to the unconscious'."
2. "What you remember of a dream is the MANIFEST content. The hidden meaning behind it is the LATENT content."
3. "Hans keeps dreaming of a frightening horse. Match each dream image to its hidden meaning, both at the same time!"

| Manifest (left, Superego) | Latent (right, Id) |
|---|---|
| A big horse | Hans's father |
| Black blinkers around the horse's eyes | Father's glasses |
| Black around the horse's mouth | Father's moustache |

- The plate positions are shuffled. Both players stand on a plate at the same time → 1 s ring → check.
- **Correct pair:** both plates light up gold, and one bridge part appears. **Wrong:** buzz, Ego Meter push, and a hint: *"Look at the details: eyes, mouth, size…"*
- All 3 pairs → the bridge is complete and both sides connect.

Freud:
1. "Do you see? Hans isn't really afraid of horses. He is afraid of his FATHER."
2. "His Ego moved the fear onto a safer target. That is a defence mechanism called DISPLACEMENT."

### 8 · Room 6: Guards of the Ego
**Layout:** a corridor to a huge door. In front of the door stand **3 shadow guards** (dark armoured figures with glowing eyes): DENIAL, DISPLACEMENT, REPRESSION. In front of them are 3 Agreement Tiles: **REPRESSION · DENIAL · DISPLACEMENT**.

Freud:
1. "The Ego protects itself from anxiety with DEFENCE MECHANISMS. They work unconsciously, so we don't know we're using them."
2. "These guards protect Hans's secret. Name the defence mechanism in each case, and they will lose their power!"

| # | Question | Correct | Feedback if correct | Hint if wrong |
|---|---|---|---|---|
| 1 | *"Sam's doctor says smoking is damaging his lungs. Sam says: 'Nonsense, I'm perfectly healthy.'"* | DENIAL | "Right! Denial: refusing to accept reality because it's too painful." | "Sam refuses to accept the truth…" |
| 2 | *"Mia gets shouted at by her boss. At home, she yells at her little brother."* | DISPLACEMENT | "Right! Displacement: feelings are redirected onto a safer target." | "Mia's anger moves to someone else…" |
| 3 | *"Leo was in a car crash as a child but has no memory of it at all."* | REPRESSION | "Right! Repression: a distressing memory is forced into the unconscious, but it can still affect behaviour." | "The memory has been pushed out of awareness…" |

→ After each correct answer, one guard dissolves into smoke. After all three, the door opens.

### 9 · Room 7: BOSS – The Repression Vault
**Look:** a large circular ice hall. At the top is the **vault** (a massive round door with 3 locks and chains). In front of it is the boss **THE REPRESSOR**: a huge chained stone/ice golem whose eye is a keyhole. It doesn't move, but it fires attacks.
**Layout:** a **red plate** (Id) bottom left, a **blue plate** (Superego) bottom right, and 3 Agreement Tiles in the middle (only active during the question phase).

Boss intro:
- Repressor: *"THIS MEMORY STAYS LOCKED. FORGET IT. FORGET… EVERYTHING."*
- Freud: *"There it is: the vault where Hans's Ego REPRESSED the memory. Open the three locks!"*

**Each of the 3 locks has two phases:**
1. **Charge phase:** Both players must stand on their plates **at the same time** for a total of **4 seconds** (a progress bar fills while both stand on them; it pauses if one steps off) **and** the Ego Meter must be in the green zone. Meanwhile the Repressor fires slow **"forget-fog" orbs** (grey, 3–5 at a time, increasing per lock) in straight lines. A hit pushes the Ego Meter 20 points (Id hit → toward the Id side, Superego hit → toward the Superego side) and pushes the player back slightly. Desire Orbs and Rule Scrolls respawn in the room so the meter can be rebalanced.
2. **Question phase:** the attacks stop. A question about Hans appears, to be answered on the Agreement Tiles.

| Lock | Question | Tiles | Correct | Feedback if correct |
|---|---|---|---|---|
| 1 | "Which psychosexual stage is Hans in?" | ORAL · PHALLIC · LATENCY | PHALLIC | "Right! Hans is 5: the phallic stage (age 3–6)." |
| 2 | "Which complex explains Hans's feelings towards his parents?" | ELECTRA · OEDIPUS · INFERIORITY | OEDIPUS | "Right! The Oedipus complex: rivalry with the father, fear of punishment." |
| 3 | "Why is Hans really afraid of horses?" | A HORSE BIT HIM · FEAR OF FATHER, DISPLACED · DENIAL | FEAR OF FATHER, DISPLACED | "Right! His fear of his father was displaced onto horses." |

(Wrong answers work as in 3.2, with these hints: "How old is Hans?" / "Hans is a boy…" / "Remember the dream!")

- After each lock: a chain breaks and the Repressor cracks. After lock 3, the Repressor shatters, the vault opens, and a bright white light fills the screen.

### 10 · Ending and Case Notes
**Cutscene (in the light):** the memory scene again, but this time Hans walks up to his father, who smiles and takes his hand.

Freud:
1. "The repressed fear has become CONSCIOUS. Now Hans can face it."
2. "Hans resolved his Oedipus complex by IDENTIFYING with his father. He wanted to be like him, not to fight him."
3. "And without the fear, he no longer needs horses as a disguise. Well done, [P1] and [P2]!"

→ A short scene: Hans in front of the house with a horse and cart, happy. Fade to the Case Notes screen.

**Case Notes screen** (style: an old notebook page, pixel handwriting font):
- Title: *"CASE NOTES – Little Hans (1909)"* · "Solved by [P1] (Id) & [P2] (Superego)"
- **Time:** mm:ss · **Correct first try:** X / 20 (the 20 quiz questions and matches in Rooms 2, 3, 4, 5, 6 and the boss)
- **What you learned:**
  - The mind is like an iceberg: conscious, preconscious, **unconscious**.
  - **Id** (pleasure principle) · **Ego** (reality principle) · **Superego** (morality principle).
  - 5 **psychosexual stages:** oral, anal, phallic, latency, genital. Unresolved conflict leads to **fixation**.
  - **Oedipus complex** (boys) / **Electra complex** (girls).
  - **Defence mechanisms:** repression, denial, displacement.
  - **Dreams:** manifest vs. latent content.
- **But is Freud right?** (evaluation box)
  - ✔ *Strength:* Freud showed that unconscious processes can influence behaviour, and his ideas led to talking therapies (psychoanalysis).
  - ✘ *Limitation:* Many of his ideas (e.g. the Oedipus complex) are **unfalsifiable**: they can't be scientifically tested or proven wrong (Popper).
  - ✘ *Limitation:* His theory is based on **case studies** like Hans: one child, most information came from Hans's father (a supporter of Freud), and Freud only met Hans briefly. That makes it hard to generalise and open to bias.
- Buttons: *"F / Enter: Play again"* (back to the title, keeping the characters).

---

## 6. AQA content checklist (all of it must appear in the game)

AQA A-level Psychology, *Approaches*, the psychodynamic approach:

| Spec content | Where in the game |
|---|---|
| Role of the **unconscious** (iceberg: conscious / preconscious / unconscious) | Intro, Iceberg Maps, Room 5, Ending |
| **Structure of personality:** Id, Ego, Superego (principles, when they develop) | Roles themselves, Rooms 1 and 2, Ego Meter |
| **Defence mechanisms:** repression, denial, displacement | Rooms 5 and 6, Boss |
| **Psychosexual stages:** oral, anal, phallic, latency, genital (+ fixation) | Rooms 3 and 4 |
| **Oedipus / Electra complex** | Room 4, Boss, Ending |
| Case study **Little Hans** (supporting evidence + evaluation) | Whole story, Case Notes |
| **Evaluation** (strengths / limitations) | Case Notes |

**Content accuracy:** use the texts in §5 exactly. They have been checked against the AQA spec. Do not invent extra "facts" about Freud.

---

## 7. HUD and UI

- **Top centre:** Ego Meter (see 3.1).
- **Top left:** P1 name + small "ID" icon (flame). **Top right:** P2 name + "SUPEREGO" icon (halo).
- **Top, under the meter:** zone name with a layer icon (e.g. "THE SURFACE · CONSCIOUS").
- **Bottom corners:** controls reminder (small, semi-transparent).
- **Pause menu (Esc):** Resume · Restart room · Sound on/off · Quit to title.
- **Font:** a pixel font (e.g. "Press Start 2P" saved **locally** in the project folder, no online loading) or a self-drawn bitmap font. At least 8 px at base resolution; dialogue text should be clearly readable.

---

## 8. Technical spec

- **Tech:** HTML5 Canvas + plain JavaScript (ES modules allowed). **No build step** and no external libraries/CDN needed. It must run by **double-clicking `index.html`** (if ES modules don't work over `file://`, put everything in one bundled script or a classic `<script>`).
- **Resolution:** base resolution **480 × 270** (16:9), scaled to the window by the **largest integer factor** with `image-rendering: pixelated`. Letterbox the rest in black.
- **Tiles:** 16 × 16 px. **Characters:** 16 × 24 px (or 24 × 24), 4 directions, 2–4 walk frames, 2 idle frames.
- **Game loop:** `requestAnimationFrame` with fixed 60 fps logic.
- **Collisions:** simple AABB against tile collision maps.
- **Sprites:** ideally generated **in code** (pixel arrays/strings + palettes), so customisation works through layers and palette swaps: body → fur/skin colour → outfit → hair/tuft → accessory. Alternatively PNGs in `/assets`, but then customisation still has to work through layers and recolouring.
- **Rooms** as data (2D tile arrays + object lists) in `rooms.js`; dialogue and quiz texts in `content.js`. The content can then be edited without changing code.
- **Sound (optional, small):** short chiptune effects using the WebAudio API (step, chime, buzz, smash, build, door). Background music optional, quiet, loopable. **M** toggles mute.
- **Save:** not needed (game ≤ 15 min).
- **Suggested structure:**
  ```
  index.html
  /src  main.js, input.js, renderer.js, sprites.js, creator.js, rooms.js,
        content.js, dialogue.js, quiz.js, egometer.js, boss.js, ui.js, audio.js
  /assets (only if needed: font)
  ```
- **Debug mode** (for testing and for demos in class): `?debug=1` in the URL, or the key combination **Shift + D**. Then **N** = skip to the next room, **B** = jump to the boss, and collision boxes can be shown.

---

## 9. Art style

- **Reference:** the attached screenshots of the Google Doodle "Champion Island Games". Use them as **style inspiration only**: bright, saturated colours, a top-down 3/4 perspective, chunky pixel shapes with dark outlines, cheerful-cute characters, Japanese-inspired details translated here into **Vienna 1900 and ice/ocean**.
- **Important:** do **not** copy anything from the Google game. Do not recreate the cat "Lucky" (calico cat in a blue outfit with a red scarf), the Google logo, or any original characters or graphics. Everything must be **original**.
- **Palettes per zone:**
  - Freud's Study: warm brown, dark green, gold, cream.
  - The Surface (conscious): turquoise, white, light blue, sunny yellow.
  - Memory Forest (preconscious): dark green, snow white, soft violet glow (memory bubbles).
  - The Deep (unconscious): navy blue, black-blue, bioluminescent cyan/magenta.
  - Repression Vault: cold grey-blue, ice white; the boss's eye glows red.
- **Role colours:** Id = red/orange (#E8453C, #F39C34), Superego = blue/white (#3B7DD8, #EAF2FF), Ego balance = green (#3CC46B).
- **Animations:** small but lively (bouncing orbs, waves, glowing tablets, breaking crates into particles, a bridge that builds plank by plank, a slight screen shake during the boss).

---

## 10. Build order (milestones)

Build in this order. After each milestone the game should be startable and testable.

1. **Engine:** canvas, scaling, game loop, input for 2 players at the same time, one test room with tile collision, 2 moving placeholder characters.
2. **Rooms and transitions:** data-driven rooms, exits (both players must be at the exit), fade transitions, Iceberg Map screen.
3. **Character Creator:** name entry, split-screen editor, layered sprite generation, roles (aura/tag).
4. **Mechanics:** dialogue system, Ego Meter, orbs/scrolls, Agreement Tiles, two-player plates, Smash, Read/Build, Push.
5. **Content:** all rooms 1–6 with the texts from §5.
6. **Boss:** Repression Vault (charge phase, projectiles, question phase).
7. **Intro, Ending, Case Notes, title screen, pause menu.**
8. **Polish:** art, animations, sound, a test playthrough under 15 minutes.

---

## 11. Acceptance checklist (test before finishing)

- [ ] Both players can move and act **at the same time** without blocking each other's keys.
- [ ] Every room needs **both** players; one player alone cannot get through any room.
- [ ] Both characters can be customised independently; the roles stay recognisable.
- [ ] Every Freud concept from §6 appears and is **applied** at least once (not just read).
- [ ] Wrong answers never lead to a game over; there is always feedback and a hint.
- [ ] A full playthrough takes **12–15 minutes** (test it!).
- [ ] Runs offline by double-clicking `index.html` in Chrome/Edge.
- [ ] All texts are readable and free of typos; the content matches §5 exactly.
- [ ] No graphics or characters copied from the Google Doodle game.
