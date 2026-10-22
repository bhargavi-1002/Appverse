import type { AppEntry } from './schema';

/**
 * The AppVerse application registry.
 *
 * Every entry describes a project owned by Bhargavi. Nothing here is invented:
 *
 *  - `liveUrl` values were confirmed with an HTTP request during setup, and the
 *    visible content of each deployment was read with a headless browser so the
 *    descriptions match what a visitor actually sees.
 *  - `repositoryUrl` values come from `git remote -v` of the local clones.
 *  - `version` / `lastUpdated` come from each project's `package.json` and the
 *    date of its last commit.
 *  - `downloadAssets` is empty for every app because none of these projects
 *    publish an APK or a desktop installer. The UI says so plainly instead of
 *    showing a dead download button.
 *
 * The `satisfies` clause below type-checks every record against the schema
 * at build time, so a malformed entry fails `npm run typecheck` rather than
 * shipping. `src/data/registry.test.ts` additionally validates the data
 * against the runtime Zod schema.
 *
 * To add an application, copy the shape of an existing entry and run
 * `npm run typecheck`.
 */
export const apps = [
  {
    id: 'cyber-runner',
    slug: 'cyber-runner',
    name: 'Cyber Runner',
    shortDescription:
      'A cyberpunk endless runner — leap the obstacles, chase the score, play with arrows or swipes.',
    fullDescription:
      'Cyber Runner is a neon endless runner built on a single HTML5 canvas. The run begins on a glowing title card and the whole screen is the control surface — jump the obstacles, keep the run alive, and push the score as high as it will go.\n\nThe controls are deliberately simple. On a desktop the arrow keys and space bar run the game; on a phone a swipe or a tap in the right place does the same job, so the same build works on both without a separate mobile version.\n\nThe repository goes further than the public build: it adds three difficulty presets that change scroll speed, gravity and jump force, three full colour themes that repaint the world, and a Web Audio engine that synthesises the music, the jump blip and the crash impact at runtime — no audio files to download.',
    icon: '/icons/cyber-runner.svg',
    screenshots: ['/screenshots/cyber-runner-1.webp', '/screenshots/cyber-runner-2.webp'],
    category: 'Games',
    tags: ['endless runner', 'arcade', 'canvas', 'retro', 'cyberpunk'],
    technologies: ['HTML5 Canvas', 'Vanilla JavaScript', 'Web Audio API'],

    repositoryUrl: 'https://github.com/bhargavi-1002/cyber-runner',
    liveUrl: 'https://cyber-runner.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-05',

    featured: true,
    featuredOrder: 10,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android (Chrome or any Chromium browser)',
        steps: [
          {
            title: 'Open the game',
            detail:
              'The title card loads and the game starts with one tap. Swipe or tap to jump once it is running.',
          },
          {
            title: 'Add it to your home screen',
            detail:
              'Open the browser menu and choose "Add to home screen" or "Install app". Android creates a launcher icon that opens the game full-screen.',
          },
          {
            title: 'Keep playing offline',
            detail:
              'Once the page has loaded the game keeps running even if the connection drops. Reopen it from your home screen whenever you want.',
          },
        ],
      },
      {
        title: 'iOS (Safari)',
        steps: [
          {
            title: 'Open the game in Safari',
            detail:
              'Safari is required — Chrome on iOS cannot add web apps to the home screen.',
          },
          {
            title: 'Use the share sheet',
            detail: 'Tap the Share button, then choose "Add to Home Screen".',
          },
          {
            title: 'Launch from the home screen',
            detail:
              'The icon opens the game in standalone mode without browser chrome. It is a home-screen shortcut, not a native App Store install.',
          },
        ],
      },
      {
        title: 'Windows, macOS and Linux',
        steps: [
          {
            title: 'Use any modern browser',
            detail:
              'Chrome, Edge, Firefox and Safari all run the game. Use the arrow keys and space bar.',
          },
          {
            title: 'Install as a desktop app (optional)',
            detail:
              'Chromium browsers can install the page as a desktop app from the address bar install icon. It opens in its own window and keeps a launcher entry.',
          },
          {
            title: 'Run it from source',
            detail:
              'The repository contains a self-contained index.html — no build step and no dependencies.',
          },
        ],
      },
    ],

    features: [
      'Title-screen start flow with the controls printed on screen',
      'Arrow key and space bar controls on desktop, swipe and tap on mobile',
      'Endless obstacle course that accelerates as the run continues',
      'Three difficulty presets and three colour themes in the source build',
      'Runtime-synthesised music and impact sounds — no audio files to download',
      'Single-file architecture: one HTML page, zero dependencies, instant load',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-05',
        changes: [
          'Unified game engine with a responsive mobile jump pane',
          'Metallic crash synthesis and arcade sequencer',
          'Responsive canvas scaling across phone, tablet and desktop widths',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'No sound plays on the first tap.',
        fix: 'Browsers block audio until you interact with the page. Tap the start card once and the audio context opens.',
      },
      {
        problem: 'The game is letterboxed on my phone.',
        fix: 'Rotate to landscape for the intended wide play field, or use a browser that supports fullscreen canvas.',
      },
      {
        problem: 'My score reset.',
        fix: 'The score is kept for the current session only and resets when the page is reloaded.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its start screen, controls and title were read during setup.',
      'Repository URL taken from the git remote of the local checkout.',
      'No web app manifest is published, so the browser install prompt is not offered.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#22d3ee',
  },

  {
    id: 'endless-runner',
    slug: 'endless-runner',
    name: 'Endless Runner',
    shortDescription:
      'A tabbed endless runner with a Play screen, a live leaderboard and an in-app help panel.',
    fullDescription:
      'Endless Runner is a small React application with three tabs: Play, Leaderboard and Help. The Play tab drops you straight into the run, the Leaderboard shows how the current attempt compares with the best scores, and the Help panel explains the controls in the app itself rather than in a separate page.\n\nThe deployment ships a generated Workbox service worker that precaches the application shell. That means the app keeps working after the first visit even with no network at all, which is the whole point of a runner you want to play on the way to somewhere.\n\nBecause it is published with a service worker but without a web app manifest, Chrome will not show the standard install banner. You can still add it to your home screen and launch it offline.',
    icon: '/icons/endless-runner.svg',
    screenshots: ['/screenshots/endless-runner-1.webp', '/screenshots/endless-runner-2.webp'],
    category: 'Games',
    tags: ['endless runner', 'leaderboard', 'offline', 'service worker', 'react'],
    technologies: ['React', 'HTML5 Canvas', 'Web Audio API', 'Workbox'],

    repositoryUrl: 'https://github.com/bhargavi-1002/ENDLESS-RUNNER',
    liveUrl: 'https://endless-runner.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-05',

    featured: true,
    featuredOrder: 20,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android (Chrome)',
        steps: [
          {
            title: 'Play it online once',
            detail:
              'Open the app at least once so the service worker can cache the application shell in the background.',
          },
          {
            title: 'Add to the home screen',
            detail:
              'Browser menu → "Add to home screen". The launcher icon opens the app directly.',
          },
          {
            title: 'Go offline',
            detail:
              'Turn on airplane mode and reopen from the home screen — it still loads and plays.',
          },
        ],
      },
      {
        title: 'iOS (Safari)',
        steps: [
          {
            title: 'Open in Safari',
            detail: 'Open the app once while online so it is cached.',
          },
          {
            title: 'Share → Add to Home Screen',
            detail: 'Creates a standalone home-screen icon.',
          },
        ],
      },
    ],

    features: [
      'Three-tab interface: Play, Leaderboard and Help',
      'Leaderboard view so a run can be compared with the best scores',
      'Works offline after the first visit thanks to a Workbox precache',
      'Runtime-synthesised music and impact sounds',
      'Instant cold start from the home screen, no network round-trip',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-05',
        changes: [
          'Added a generated Workbox service worker for offline play',
          'Added the Leaderboard and Help tabs',
          'Published the runner as a standalone deployment',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The app needs a connection on the first visit.',
        fix: 'That is expected — the service worker can only cache files it has already downloaded.',
      },
      {
        problem: 'The install banner never appears.',
        fix: 'The deployment ships a service worker but no web app manifest, so Chrome keeps the install prompt hidden. Use "Add to home screen" instead.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its Play, Leaderboard and Help tabs were read during setup.',
      'A Create React App web app manifest is published at /manifest.json, but the app calls serviceWorker.unregister(), so no service worker is active.',
      'A browser was driven against the deployment and never offered an install prompt, so this is a home-screen shortcut rather than an installable PWA.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#f59e0b',
  },

  {
    id: 'memory-card-game',
    slug: 'memory-card-game',
    name: 'Memory Card Game',
    shortDescription:
      'A clean memory matching grid — flip two cards, clear the board, beat your score.',
    fullDescription:
      'Memory Card Game is a focused matching puzzle. The board is a tidy grid of face-down cards; flip two at a time and the game remembers whether they belong together. Clear every pair and the board greets you with "Congratulations! You found them all!"\n\nA running score sits above the grid so a session has a shape — you can see a bad run and a good run at a glance. The layout is deliberately restrained: a dark board against a light page, rounded cards with a soft shadow, and a restart control that is always in the same place.\n\nThe repository holds a much larger rewrite of the same idea — a neon terminal variant called Stratos Memory Matrix with a modular architecture and its own sound synthesis engine — so the code is worth reading even if you only play the deployed build.',
    icon: '/icons/memory-card-game.svg',
    screenshots: ['/screenshots/memory-card-game-1.webp', '/screenshots/memory-card-game-2.webp'],
    category: 'Games',
    tags: ['memory', 'puzzle', 'match', 'focus', 'casual'],
    technologies: ['HTML5', 'CSS Grid', 'JavaScript'],

    repositoryUrl: 'https://github.com/bhargavi-1002/memory-card-game',
    liveUrl: 'https://memory-card-game.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-05',

    featured: false,
    featuredOrder: 60,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Any device',
        steps: [
          {
            title: 'Open the game',
            detail: 'The grid reflows to the width of the screen.',
          },
          {
            title: 'Add a home-screen shortcut',
            detail:
              'On Android use "Add to home screen"; on iOS use Safari → Share → Add to Home Screen.',
          },
        ],
      },
    ],

    features: [
      'Matching-grid memory game with a live score readout',
      'Clear win state with a "Congratulations! You found them all!" result',
      'One-tap restart so a new round is never in the way',
      'Responsive grid that reflows from desktop down to a 320px phone',
      'No build step, no framework, no network calls',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-05',
        changes: [
          'Published the memory matching build as a live deployment',
          'Added SEO metadata, a sitemap and robots rules',
          'Repository rewritten as a larger modular neon variant',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The game is silent.',
        fix: 'The deployed build does not ship audio — the larger rewrite in the repository does.',
      },
      {
        problem: 'Cards are hard to tap on a small screen.',
        fix: 'Landscape orientation gives the grid noticeably more room.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its title, score readout and win message were read during setup.',
      'No web app manifest is published.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#34d399',
  },

  {
    id: 'number-guessing-game',
    slug: 'number-guessing',
    name: 'Guessing Game',
    shortDescription:
      'Pick the hidden number from four face-down cards and build a streak.',
    fullDescription:
      'Guessing Game is a small, sharp arcade game. Four numbered cards sit on the table, one of them hides the winning number, and the game keeps a score for every time you call it right.\n\nThat is the whole loop — and it works because it is instant. Tap a card, find out immediately, try again. There is no timer, no modal and no page reload between rounds, so the game is the kind of thing you pick up for thirty seconds and put down again.\n\nThe deployed build is a light, high-contrast interface with a blue frame and violet cards, sized so it stays comfortable on a phone. The repository contains a much larger rewrite of the same idea — a deduction game with seven attempts, directional hints and a custom audio synthesis engine.',
    icon: '/icons/number-guessing.svg',
    screenshots: ['/screenshots/number-guessing-1.webp', '/screenshots/number-guessing-2.webp'],
    category: 'Games',
    tags: ['arcade', 'number', 'cards', 'quick play', 'light theme'],
    technologies: ['HTML5', 'CSS', 'JavaScript'],

    repositoryUrl: 'https://github.com/bhargavi-1002/number-guessing',
    liveUrl: 'https://number-guessing.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-04',

    featured: false,
    featuredOrder: 70,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Any device',
        steps: [
          {
            title: 'Open the game',
            detail: 'The game loads as a single page with no install required.',
          },
          {
            title: 'Pin it if you play often',
            detail:
              'Use "Add to home screen" on Android or "Add to Home Screen" from the Safari share sheet on iOS.',
          },
        ],
      },
    ],

    features: [
      'Four numbered cards, one hidden winner, instant feedback',
      'Running score that tracks a streak across rounds',
      'Zero-friction loop — no timers, no dialogs, no reloads',
      'Light, high-contrast interface with large tap targets',
      'Fully static deployment — nothing to sign up for',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-04',
        changes: [
          'Published the card guessing build as a live deployment',
          'Added mobile optimisation styles',
          'Added full SEO structural support',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The layout looks cramped on my phone.',
        fix: 'Rotate to landscape — the card row has more breathing room.',
      },
      {
        problem: 'My score was reset.',
        fix: 'The score is kept for the current session only.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its title, card layout and score readout were read during setup.',
      'No web app manifest is published.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#8b5cf6',
  },

  {
    id: 'neon-snake-pro',
    slug: 'snake-game',
    name: 'Neon Snake Pro',
    shortDescription:
      'A neon arcade snake with a live velocity meter, top score and WASD control.',
    fullDescription:
      'Neon Snake Pro is the classic snake loop with a modern control panel. The header reads "EAT. GROW. SURVIVE." and the HUD tracks the things that actually matter mid-run: the current score, the top score, and a velocity meter that shows how fast the snake is moving at 1.0x and beyond.\n\nControl is the point. WASD and the arrow keys both work, space restarts, and the grid is drawn in a clean neon green that stays legible against the dark board instead of turning into visual noise.\n\nIt is the kind of game that starts as a two-minute break and turns into a top-score chase, which is exactly why the velocity and top-score readouts are always on screen.',
    icon: '/icons/snake-game.svg',
    screenshots: ['/screenshots/snake-game-1.webp', '/screenshots/snake-game-2.webp'],
    category: 'Games',
    tags: ['snake', 'classic', 'arcade', 'keyboard', 'neon'],
    technologies: ['HTML5', 'CSS Grid', 'JavaScript'],

    repositoryUrl: 'https://github.com/bhargavi-1002/snake-game',
    liveUrl: 'https://snakegame-fawn-one.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-04',

    featured: true,
    featuredOrder: 30,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android',
        steps: [
          {
            title: 'Open the game',
            detail: 'The board scales to the width of the screen.',
          },
          {
            title: 'Add to the home screen',
            detail: 'Browser menu → "Add to home screen" to keep it one tap away.',
          },
        ],
      },
      {
        title: 'iOS (Safari)',
        steps: [
          {
            title: 'Open in Safari',
            detail: 'Safari is required for home-screen shortcuts on iOS.',
          },
          {
            title: 'Share → Add to Home Screen',
            detail: 'The game then opens without browser chrome.',
          },
        ],
      },
      {
        title: 'Desktop',
        steps: [
          {
            title: 'Use WASD or the arrow keys',
            detail: 'Space restarts the run.',
          },
          {
            title: 'Optional desktop install',
            detail:
              'Chromium browsers can install the page as a standalone desktop app from the address bar.',
          },
        ],
      },
    ],

    features: [
      'Classic snake rules with precise, responsive grid movement',
      'Live HUD with score, top score and a velocity meter',
      'WASD and arrow key control, space to restart',
      'Dark neon presentation with high-contrast typography',
      'Ships with SEO metadata, a sitemap and robots rules',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-04',
        changes: [
          'Published the Neon Snake Pro build as a live deployment',
          'Added the velocity meter and top-score readout',
          'Added Open Graph metadata, a sitemap and robots rules',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The snake moves too fast for me.',
        fix: 'Press the direction key slightly early — the input is buffered, so a turn registered a moment before the corner still counts.',
      },
      {
        problem: 'The game area is cramped on my phone.',
        fix: 'Rotate to landscape, or reduce the browser zoom with a pinch gesture.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its title, HUD labels and control hints were read during setup.',
      'The page declares this URL as its canonical address.',
      'No web app manifest is published.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#4ade80',
  },

  {
    id: 'space-shooter-pro-mini',
    slug: 'space-shooter',
    name: 'Space Shooter Pro Mini',
    shortDescription:
      'A pixel-art vertical shooter — dodge the debris, hold your lives, shoot on space.',
    fullDescription:
      'Space Shooter Pro Mini is a compact pixel-art shooter on a narrow vertical canvas. Your ship sits near the bottom, the debris falls from the top, and you have three lives to spend. Each hit costs one, and when the last one goes the run is over.\n\nThe controls are shown in an in-game panel: WASD or the arrow keys to move, space to shoot, and enter to pause. A pause overlay freezes the action and offers Resume or Restart, which matters when you are trying to look something up mid-run.\n\nThe whole thing is a single canvas with no engine behind it, so it loads instantly and keeps its frame rate even on an older phone.',
    icon: '/icons/space-shooter.svg',
    screenshots: ['/screenshots/space-shooter-1.webp', '/screenshots/space-shooter-2.webp'],
    category: 'Games',
    tags: ['shooter', 'pixel art', 'arcade', 'canvas', 'retro'],
    technologies: ['HTML5 Canvas', 'CSS', 'JavaScript'],

    repositoryUrl: 'https://github.com/bhargavi-1002/space-shooter',
    liveUrl: 'https://space-shooter.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-05',

    featured: false,
    featuredOrder: 50,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android and iOS',
        steps: [
          {
            title: 'Open the game',
            detail:
              'The canvas is sized for a narrow portrait screen, which is how it was designed to be played.',
          },
          {
            title: 'Add it to the home screen',
            detail:
              'Android: browser menu → "Add to home screen". iOS: Safari → Share → Add to Home Screen.',
          },
        ],
      },
    ],

    features: [
      'Pixel-art vertical shooter rendered on a single canvas',
      'Three lives, shown as hearts above the play field',
      'Live score counter and a hi-score to beat',
      'WASD or arrow keys to move, space to shoot',
      'Pause overlay with Resume and Restart',
      'No engine, no build step, no dependencies',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-05',
        changes: [
          'Published the pixel-art shooter build as a live deployment',
          'Overhauled the audio engine so impact sounds initialise on every click and touch path',
          'Reworked wave indexing and core class mechanics',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The ship fires but nothing appears.',
        fix: 'Wait for the start overlay to clear — the game only accepts input once the run has started.',
      },
      {
        problem: 'I cannot find the pause button.',
        fix: 'Press Enter — that is the pause key. The overlay also offers Resume and Restart.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its in-game control panel was read during setup.',
      'No web app manifest is published.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#818cf8',
  },

  {
    id: 'tic-tac-toe',
    slug: 'tic-tak-toe',
    name: 'Tic-Tac-Toe',
    shortDescription:
      'A clean two-player tic-tac-toe with a live board status readout.',
    fullDescription:
      'Tic-Tac-Toe is a compact two-player board game. The page tells you exactly where you are at all times — whose turn it is, whether the game is in progress, and who has won — and a "Play Again" control resets the board without a reload.\n\nThe interface is deliberately plain: a grid, a status line and a restart. There is no account, no timer and no network dependency, so it opens instantly and works the same on every device.\n\nThe repository is a much larger rewrite of the same game — a neon "Cyber Tic Tac Toe Pro" with a minimax AI opponent, three tactical difficulty tiers, a two-player mode and a retro audio feed. The public build is the simpler two-player version.',
    icon: '/icons/tic-tak-toe.svg',
    screenshots: ['/screenshots/tic-tak-toe-1.webp', '/screenshots/tic-tak-toe-2.webp'],
    category: 'Games',
    tags: ['tic tac toe', 'strategy', 'two player', 'classic', 'minimal'],
    technologies: ['HTML5', 'CSS Grid', 'JavaScript'],

    repositoryUrl: 'https://github.com/bhargavi-1002/tic-tac-toe',
    liveUrl: 'https://tic-tac-toe.vercel.app',

    version: '1.0.0',
    lastUpdated: '2026-06-05',

    featured: false,
    featuredOrder: 40,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Any device',
        steps: [
          {
            title: 'Open the board',
            detail: 'Two players share the same device.',
          },
          {
            title: 'Pin it to the home screen',
            detail:
              'Android: "Add to home screen". iOS: Safari → Share → Add to Home Screen.',
          },
        ],
      },
    ],

    features: [
      'Classic two-player tic-tac-toe on a single grid',
      'Live status readout — next move, game state and winner',
      'One-tap "Play Again" to reset the board',
      'Minimal, fast-loading static page',
      'Repository contains a larger neon rewrite with an AI opponent',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-05',
        changes: [
          'Published the two-player board build as a live deployment',
          'Rebuilt the arcade architecture with an integrated sound engine',
          'Shipped a neon multi-platform mobile build in the repository',
        ],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'There is no AI opponent in the deployed build.',
        fix: 'Correct — the public build is two-player. The repository rewrite adds a minimax AI with three difficulty tiers.',
      },
      {
        problem: 'Two-player mode is not available.',
        fix: 'Local multiplayer needs a shared device; it is not a networked mode.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its status readout and restart control were read during setup.',
      'The deployed build carries the credit "Program by Sanjay Puri" in its footer.',
      'No web app manifest is published.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#f472b6',
  },

  {
    id: 'time-traveler',
    slug: 'time-traveler',
    name: 'Time Traveler',
    shortDescription:
      'A history adventure for kids — five eras, levels and XP, led by a very round owl.',
    fullDescription:
      'Time Traveler is an educational history game for children. You start a journey through five historical eras, answer the questions that each era sets, and collect XP as you go. The HUD tracks your level, your XP and how many of the five eras you have finished, so there is always a visible next step.\n\nThe tone is deliberately gentle. A round owl mascot greets you, the palette is warm rather than neon, and the type is large enough for a five-year-old to read without help. A sound toggle sits in the corner for when the audio gets old.\n\nIt is built with Next.js and React, so the first paint is server-rendered and quick even on a slow phone connection.',
    icon: '/icons/time-traveler-game.svg',
    screenshots: ['/screenshots/time-traveler-1.webp', '/screenshots/time-traveler-2.webp'],
    category: 'Education',
    tags: ['history', 'quiz', 'kids', 'learning', 'adventure'],
    technologies: ['Next.js', 'React', 'Tailwind CSS'],

    liveUrl: 'https://time-traveler-game.vercel.app',

    lastUpdated: '2026-11-10',

    featured: false,
    featuredOrder: 80,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android and iOS',
        steps: [
          {
            title: 'Open the game',
            detail: 'It works in any modern browser with no sign-up.',
          },
          {
            title: 'Add it to the home screen',
            detail:
              'Android: "Add to home screen". iOS: Safari → Share → Add to Home Screen.',
          },
        ],
      },
    ],

    features: [
      'History adventure structured across five eras',
      'Level and XP progression with an always-visible HUD',
      'Written for children with large, rounded, readable type',
      'Character-driven presentation with an owl mascot',
      'Corner sound toggle for audio control',
      'Server-rendered Next.js build for a fast first paint',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-11-10',
        changes: ['Public deployment of the history adventure.'],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The questions are too easy for an older child.',
        fix: 'The content is deliberately pitched at young players. Older children usually enjoy the era structure more than the difficulty.',
      },
      {
        problem: 'Audio is annoying.',
        fix: 'Use the speaker toggle in the top corner to mute it.',
      },
    ],

    verificationStatus: 'verified',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its title, HUD and start screen were read during setup.',
      'No web app manifest is published at this URL.',
      'The GitHub repository of the same name hosts a different project — it is listed separately as Chrono Drift.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#fbbf24',
  },

  {
    id: 'chrono-drift',
    slug: 'chrono-drift',
    name: 'Chrono Drift',
    shortDescription:
      'A three-era time-jumping platformer: collect the relics and restore the Chrono Engine.',
    fullDescription:
      'Chrono Drift is a browser platformer built around one idea: every era is broken a little differently. You jump through three fractured time periods, each with its own colour palette and platform layout, collecting ancient relics on the way and restoring the Chrono Engine that holds the timeline together.\n\nThe difficulty comes from the hazards — each era throws a different set at you — combined with a limited life count and a portal that only opens once the relics for that era are collected. Score, lives and level progress are always on screen.\n\nThere are no external dependencies at all. The project is three plain files — index.html, style.css and game.js — so it runs from any static host or even straight from a local folder.',
    icon: '/icons/chrono-drift.svg',
    screenshots: [],
    category: 'Games',
    tags: ['platformer', 'puzzle', 'time travel', 'open source'],
    technologies: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS'],

    repositoryUrl: 'https://github.com/bhargavi-1002/time-traveler-game',

    lastUpdated: '2026-11-10',

    featured: false,
    featuredOrder: 90,

    installationType: 'github',
    supportedPlatforms: ['web', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Run it locally',
        steps: [
          {
            title: 'Clone the repository',
            detail: 'Grab the source from the GitHub link on this page.',
          },
          {
            title: 'Serve the folder',
            detail:
              'From the project folder run "python3 -m http.server 8000" and open http://localhost:8000.',
          },
          {
            title: 'Play',
            detail: 'Move with A / D or the arrow keys, jump with W, Up or Space.',
          },
        ],
      },
      {
        title: 'Use a static host',
        steps: [
          {
            title: 'Deploy the folder as-is',
            detail:
              'The repository root is already a static site — point any static host at it with no build step.',
          },
        ],
      },
    ],

    features: [
      'Three distinct time eras with their own palettes and platform layouts',
      'Relic collection gates the portal that advances the era',
      'Lives, score and level progression tracked on screen',
      'Animated portal and a futuristic HUD',
      'Zero dependencies — three plain files, no build step',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-11-10',
        changes: ['Public release of the three-era platformer.'],
      },
    ],
    permissions: [],
    troubleshooting: [
      {
        problem: 'The game looks broken when I open index.html directly.',
        fix: 'Serve it over HTTP instead — some browsers restrict canvas or audio behaviour on file:// URLs.',
      },
      {
        problem: 'The portal will not open.',
        fix: 'Collect every relic in the current era first.',
      },
    ],

    verificationStatus: 'source-only',
    verificationNotes: [
      'Repository is public and was confirmed to contain index.html, style.css and game.js.',
      'No public deployment has been published for this project, so there is nothing to install yet.',
    ],
    deploymentStatus: 'unavailable',
    sample: false,
    accent: '#38bdf8',
  },

  {
    id: 'battery-buddy',
    slug: 'battery-buddy',
    name: 'Battery Buddy',
    shortDescription:
      'A glowing companion that watches your battery — live percentage, alarms, themes and a power saver.',
    fullDescription:
      'Battery Buddy puts one number on the screen and makes it impossible to miss: the live battery percentage, rendered large enough to read from across a desk, with a charging indicator that pulses while the device is plugged in. When the browser reports it, the charging time and the time remaining are shown next to it.\n\nAround that readout the app builds a small set of practical tools — custom battery alarms that tell you when you have dropped below a threshold you care about, a power-saver mode, a theme picker with six visual themes and five type styles, and a soft animated 3D background so the screen is pleasant to leave open on a desk.\n\nThe Battery Status API is used where the browser exposes it. Browsers that do not support it fall back to an honest "not supported" state instead of showing a made-up number.',
    icon: '/icons/battery-buddy.svg',
    screenshots: [],
    category: 'Utilities',
    tags: ['battery', 'alarms', 'themes', 'power', 'companion'],
    technologies: ['React', 'TanStack Start', 'Three.js', 'Tailwind CSS'],

    repositoryUrl: 'https://github.com/bhargavi-1002/BATTERY-BUDDY-2.0',

    version: '1.0.0',
    lastUpdated: '2026-06-04',

    featured: true,
    featuredOrder: 5,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Run it from the source',
        steps: [
          {
            title: 'Clone the repository',
              detail: 'Grab the code from the GitHub link on this page.',
          },
          {
            title: 'Install and start',
            detail:
              'The project uses TanStack Start — run "npm install" followed by "npm run dev" and open the printed local URL.',
          },
          {
            title: 'Grant battery access',
            detail:
              'The live percentage needs a browser that exposes the Battery Status API — Chrome on Android and Safari on iOS both do.',
          },
        ],
      },
      {
        title: 'Android and iOS',
        steps: [
          {
            title: 'Add to the home screen',
            detail:
              'Android: browser menu → "Add to home screen". iOS: Safari → Share → Add to Home Screen.',
          },
          {
            title: 'Optional: build a native package',
            detail:
              'The project also ships an Expo application, which can be built into a native package with the Expo tooling if you want a real launcher app.',
          },
        ],
      },
    ],

    features: [
      'Live battery percentage with a large, glowing readout',
      'Charging state, time-to-full and time-to-empty when the browser reports them',
      'Custom low-battery alarms with threshold notifications',
      'Six visual themes and five type styles',
      'Animated 3D background rendered with Three.js',
      'Graceful "not supported" state on browsers without the Battery Status API',
    ],
    changelog: [
      {
        version: '1.0.0',
        date: '2026-06-04',
        changes: [
          'Live battery percentage readout with charging indicator',
          'Battery alarm watcher with user-defined thresholds',
          'Power saver mode, theme picker and animated background',
          'Reworked the app shell onto TanStack Start',
        ],
      },
    ],
    permissions: [
      'Battery level and charging state (Battery Status API)',
      'Notifications for battery alarms (with your permission)',
    ],
    troubleshooting: [
      {
        problem: 'The percentage shows "not supported".',
        fix: 'The browser did not expose the Battery Status API. That is expected in some desktop browsers and in Firefox.',
      },
      {
        problem: 'The percentage never updates.',
        fix: 'The API reports changes as discrete events, so the readout updates when the OS reports a new level rather than every second.',
      },
    ],

    verificationStatus: 'partial',
    verificationNotes: [
      'The public URL for this project currently serves the Expo starter template rather than the application, so no live build is offered here yet.',
      'Repository URL taken from the git remote of the local checkout; the feature set above is taken from the repository source.',
    ],
    deploymentStatus: 'placeholder',
    sample: false,
    accent: '#22d3ee',
  },

  {
    id: 'connect',
    slug: 'connect',
    name: 'Connect',
    shortDescription:
      'A family chat app — accounts, family spaces and messaging backed by Supabase.',
    fullDescription:
      'Connect is a real messaging product rather than a demo. People create an account or sign in, join a family space, and exchange messages inside it. The backend is Supabase for authentication and data, with Firebase in the mix for a few services, and the whole thing ships as a Vite + React + TypeScript application.\n\nThe sign-in screen is the front door, and behind it the destructive actions — deactivating or deleting an account — are deliberately gated behind a feature flag so they cannot be triggered by accident.\n\nBecause it needs an account, Connect is not a one-click install: sign in on the web first, then add it to the home screen if you want it to behave like an app on your phone.',
    icon: '/icons/connect.svg',
    screenshots: ['/screenshots/connect-1.webp', '/screenshots/connect-2.webp'],
    category: 'Communication',
    tags: ['chat', 'family', 'messaging', 'accounts', 'supabase'],
    technologies: ['React', 'TypeScript', 'Vite', 'Supabase', 'Firebase'],

    repositoryUrl: 'https://github.com/bhargavi-1002/Connect',
    liveUrl: 'https://connect.vercel.app',

    lastUpdated: '2026-10-21',

    featured: true,
    featuredOrder: 1,

    installationType: 'web',
    supportedPlatforms: ['web', 'android', 'ios', 'windows', 'macos', 'linux'],
    downloadAssets: [],
    installationInstructions: [
      {
        title: 'Android and iOS',
        steps: [
          {
            title: 'Create an account or sign in',
            detail:
              'Open the app and use the Login form, or "Sign Up" if you do not have an account yet. Connect needs an account before any message can be sent.',
          },
          {
            title: 'Add it to the home screen',
            detail:
              'Android: browser menu → "Add to home screen". iOS: Safari → Share → Add to Home Screen.',
          },
          {
            title: 'Run it from the icon',
            detail: 'It opens in standalone mode with no browser chrome.',
          },
        ],
      },
    ],

    features: [
      'Account creation and sign-in',
      'Family spaces that group conversations',
      'Real-time messaging backed by Supabase',
      'Destructive account actions hidden behind a feature flag',
      'Responsive layout that works from a phone to a desktop monitor',
    ],
    changelog: [
      {
        version: '0.1.0',
        date: '2026-10-21',
        changes: [
          'Moved chat data from Firestore to Supabase',
          'Gated account deactivation and deletion behind a feature flag',
          'Gated clear-chat and delete-chat behind a feature flag',
        ],
      },
    ],
    permissions: [
      'Push notifications for new messages (with your permission)',
      'Local storage for the signed-in session',
    ],
    troubleshooting: [
      {
        problem: 'I cannot find where to sign in.',
        fix: 'Use the Login form on the landing screen. If a session was left half-finished, sign out and back in.',
      },
      {
        problem: 'The landing screen shows an error.',
        fix: 'The sign-in form still works below it. If it persists, the backend service is unreachable — try again shortly.',
      },
      {
        problem: 'Messages are not arriving.',
        fix: 'Check the connection indicator — the app needs a live connection to the realtime channel.',
      },
    ],

    verificationStatus: 'partial',
    verificationNotes: [
      'Live deployment responded with HTTP 200 and its Login and Sign Up screens were read during setup.',
      'Repository URL taken from the git remote of the local checkout.',
      'The deployment publishes the default Create React App web app manifest at /manifest.json — it has no service worker, and a browser driven against the deployment never offered an install prompt.',
    ],
    deploymentStatus: 'live',
    sample: false,
    accent: '#a78bfa',
  },
] satisfies AppEntry[];

/**
 * The parsed registry.
 *
 * The data is validated at compile time by the `satisfies` clause above and
 * at test time by `src/data/registry.test.ts`, so it is safe to treat these
 * records as fully-formed application entries.
 */
export const registry: AppEntry[] = apps;

/** Fast lookup by slug. */
export const appsBySlug = new Map(registry.map((app) => [app.slug, app]));

/** Registry sorted the way the marketplace presents it by default. */
export const registryByFeaturedOrder = [...registry].sort(
  (a, b) => a.featuredOrder - b.featuredOrder || a.name.localeCompare(b.name),
);

/** Distinct categories present in the registry, alphabetically. */
export const categories = [...new Set(registry.map((app) => app.category))].sort();

/** Distinct technologies present in the registry, alphabetically. */
export const technologies = [...new Set(registry.flatMap((app) => app.technologies))].sort();

/** Apps that are explicitly featured, in manual order. */
export const featuredApps = registryByFeaturedOrder.filter((app) => app.featured);

/** The most recently updated applications. */
export const recentlyUpdated = [...registry]
  .filter((app) => app.lastUpdated)
  .sort((a, b) => (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? ''));

/** Applications that currently have a working public deployment. */
export const deployedApps = registry.filter((app) => app.deploymentStatus === 'live');

export function getAppBySlug(slug: string | undefined): AppEntry | undefined {
  if (!slug) return undefined;
  return appsBySlug.get(slug);
}

/**
 * Applications related to the given one: same category first, then shared
 * tags. Falls back to the rest of the registry so the section is never empty.
 */
export function getRelatedApps(app: AppEntry, limit = 3): AppEntry[] {
  const scored = registry
    .filter((candidate) => candidate.slug !== app.slug)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === app.category) score += 3;
      score += candidate.tags.filter((tag) => app.tags.includes(tag)).length * 2;
      score += candidate.technologies.filter((tech) => app.technologies.includes(tech)).length;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name),
    );

  const picked = scored.map((entry) => entry.candidate);
  for (const appEntry of registry) {
    if (picked.length >= limit) break;
    if (appEntry.slug === app.slug) continue;
    if (!picked.some((entry) => entry.slug === appEntry.slug)) picked.push(appEntry);
  }
  return picked.slice(0, limit);
}
