# 日本語のマッチングゲーム — Japanese Matching Game

A web-based card-matching game for learning Japanese transitive and intransitive verb pairs. Players match written Japanese sentences (object + particle + verb) to their corresponding illustrations, reinforcing the grammatical distinction between を (transitive) and が (intransitive) constructions. Each text card also has an audio playback button so learners can hear correct pronunciation.

## Table of Contents

- [Overview](#overview)
  - [Difficulty Levels](#difficulty-levels)
  - [Scoring, Streaks, and Lives](#scoring-streaks-and-lives)
  - [Endless Mode](#endless-mode)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Play](#how-to-play)
- [Assets](#assets)
- [Credits](#credits)
- [Contributing](#contributing)
- [License](#license)

## Overview

The game presents two columns: **動詞 (Verbs)** on the left and **写真 (Pictures)** on the right. Verb cards display a Japanese sentence built from an object, a particle (を or が), and a verb in kanji. Picture cards show a hand-drawn illustration of the action. The player selects one card from each column and presses **Evaluate** to check the match.

On first visit a modal prompts the player for their name, which is saved to `localStorage` and displayed throughout the session.

### Difficulty Levels

| Difficulty | Cards shown |
|------------|-------------|
| Easy       | 6           |
| Medium     | 8           |
| Hard       | 10          |
| Endless    | 10          |

Difficulty is selected via radio buttons and takes effect when the player presses **Generate** to start a new round.

### Scoring, Streaks, and Lives

- **Score** increases on each correct match: `+1000 × (current streak)`.
- **Streak** increments by 1 on every consecutive correct match and resets to 0 on a wrong guess.
- In **Easy / Medium / Hard** modes there is no life limit; the game ends when all pairs are matched, triggering a "You Won" modal showing the player's name and final score.

### Endless Mode

- The board always shows 10 cards. A correct match **replaces** the matched pair with a new randomly chosen pair (rather than removing it).
- The player starts with **3 lives**; each wrong guess costs one life.
- When lives reach 0 the title bar displays a "Nice job!" message and the Evaluate button is disabled. Pressing **Generate** starts a fresh game.

## Tech Stack

| Component        | Version      |
|------------------|--------------|
| Next.js          | 14.2.4       |
| React            | 18.3.1       |
| TypeScript       | 5.5.2        |
| Mantine UI       | 7.12.2       |
| Mantine Hooks    | 7.12.2       |
| Tabler Icons     | ^3.19.0      |
| PostCSS          | ^8.4.38      |
| Yarn (Corepack)  | 4.5.0        |
| Node linker      | node-modules  |

Mantine import optimization is enabled via `next.config.mjs` (`optimizePackageImports`). PostCSS is configured with `postcss-preset-mantine` and `postcss-simple-vars` for Mantine breakpoint variables.

## Project Structure

```
matching-game/
├── app/
│   ├── layout.tsx                  # Root layout — MantineProvider, dark colour scheme, metadata
│   ├── page.tsx                    # Main game page — all game state, matching logic, UI
│   └── components/
│       ├── Phrases.tsx             # Phrase interface + phraseList (20 items, 10 verb pairs)
│       └── FlashCard/
│           ├── TextCard.tsx        # Clickable sentence button with audio playback
│           └── ImageCard.tsx       # Clickable image button
├── public/
│   ├── audio/                      # MP3 pronunciation clips (20 files)
│   ├── images/                     # PNG illustrations (20 files)
│   ├── icons/
│   │   └── player-play.svg         # Play icon
│   └── favicon.svg
├── theme.ts                        # Mantine theme overrides (currently empty)
├── next.config.mjs                 # Next.js config (strict mode, SWC minify, Mantine optimisation)
├── postcss.config.cjs              # PostCSS + Mantine breakpoints
├── tsconfig.json                   # TypeScript config (ES5 target, strict)
├── package.json                    # Scripts: dev, build, start, lint
├── .yarnrc.yml                     # Yarn 4.5.0, node-modules linker
└── yarn.lock
```

## Getting Started

**Prerequisites:** Node.js (≥ 18 recommended) with Corepack enabled for Yarn 4.

```sh
# Clone the repository
git clone https://github.com/Brown-University-Library/matching-game.git
cd matching-game

# Enable Corepack (ships with Node ≥ 16)
corepack enable

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The app will be available at `http://localhost:3000`.

Other available scripts:

```sh
yarn build   # Production build
yarn start   # Serve the production build
yarn lint    # Run ESLint (next lint)
```

## How to Play

1. **Enter your name** — on first visit a modal asks for your name (saved in your browser for future sessions).
2. **Choose a difficulty** — Easy (6 cards), Medium (8), Hard (10), or Endless (10, with replacement).
3. **Press Generate** to deal a new set of cards.
4. **Select a sentence** from the 動詞 (Verbs) column on the left. Click the ▶ button next to it to hear the pronunciation.
5. **Select the matching picture** from the 写真 (Pictures) column on the right.
6. **Press Evaluate**:
   - ✅ Correct — cards flash **green**, your streak increases, and the pair is removed (or replaced in Endless mode).
   - ❌ Wrong — cards flash **red**, your streak resets. In Endless mode you also lose a life.
7. **Win condition:** match all pairs (Easy/Medium/Hard) or survive until you run out of lives (Endless).

## Assets

All assets live under `public/` and follow a consistent naming convention:

```
<object>_<action>_<transitivity>.<ext>
```

- **`object`** — the noun involved (e.g. `door`, `cat`, `pen`)
- **`action`** — the verb/event (e.g. `open`, `close`, `leave`, `fall`)
- **`transitivity`** — `t` for transitive (を) or `i` for intransitive (が)
- **`ext`** — `.png` for images, `.mp3` for audio

Examples: `door_close_t.png` (someone closing a door — transitive), `door_close_i.png` (a door closing on its own — intransitive).

There are currently **10 verb pairs** (20 phrases total) covering actions like opening/closing doors, turning lights on/off, dirtying a shirt, breaking a toy, a dog entering, a cat leaving, dropping a pen, and boiling water.

## Credits

- **Project Director & Japanese Language Content:** Atsuko Suga Borgmann
- **Game Design & Programming:** Angel Arrazola and Ross Williams
- **Artist:** Phoebe Yao

*This project was developed at Brown University with support from the UTRA.*

## Contributing

No formal contribution guidelines (e.g. `CONTRIBUTING.md`) currently exist in the repository. If you'd like to contribute, consider opening an issue or pull request on [the GitHub repo](https://github.com/Brown-University-Library/matching-game).

## License

Not specified — no license file was found in the repository.
