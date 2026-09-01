# CodeVS — Project Summary

> Real-time multiplayer code-typing race. Two players type the same snippet; WPM/Accuracy decide the winner. React SPA + Firebase (Auth + Firestore + Realtime Database). Deployed to Firebase Hosting.

## 1) Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Build | Vite | `^8.0.12` | Dev server, HMR, production build to `dist/` |
| UI | React | `^19.2.6` | SPA, hooks, components |
| DOM | React-DOM | `^19.2.6` | |
| Routing | React Router DOM | `^7.15.1` | SPA routes, `ProtectedRoute` guards |
| Styling | Tailwind CSS + `@tailwindcss/postcss` + PostCSS | `^4.3.0` / `^8.5.15` | Hacker dark theme, glass-card, grid/vignette overlays |
| Backend | Firebase JS SDK | `^12.15.0` | Auth + Firestore + Realtime Database |
| Hosting | Firebase Hosting | — | SPA rewrite `** → /index.html` (`firebase.json:9-13`) |
| Lint | ESLint + `eslint-plugin-react-hooks/refresh` + `@eslint/js` + `globals` | `^10.3.0` | `npm run lint` |
| Tooling | `@vitejs/plugin-react` | `^6.0.1` | JSX fast refresh |

**Config files:** `codevs/vite.config.js:1-7` (single `react()` plugin), `codevs/postcss.config.js`, `codevs/eslint.config.js`, `codevs/firebase.json:1-16`, `codevs/index.html`

**Env vars** (`codevs/.env.example` → `codevs/src/firebase.js:6-14` via `import.meta.env`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

**Scripts (`codevs/package.json:6-12`):** `dev` (vite), `build` (vite build), `preview`, `lint` (eslint .), `deploy` (firebase deploy --only hosting)

## 2) Project Structure

```
codevs/
  index.html
  vite.config.js          # react() only
  firebase.json           # hosting public=dist, SPA rewrite
  src/
    main.jsx              # BrowserRouter + App
    App.jsx               # Routes + AuthProvider + Navbar  (App.jsx:14-31)
    firebase.js           # initializeApp, getAuth, getFirestore, getDatabase  (firebase.js:16-19)
    contexts/AuthContext.jsx  # register/login/logout, onAuthStateChanged + Firestore profile merge
    hooks/useGameEngine.js    # charStates, cursor, WPM/Accuracy, handleKeyDown, Firebase progress sync
    hooks/useMatchmaking.jsx  # queues/{lang}/{uid}, matchmaking_results, runTransaction claim, UID tie-breaker
    hooks/useRooms.jsx        # createRoom (6-char ID), joinRoom (validation)
    data/languages.js         # 7 options: random/c/cpp/python/javascript/java/php
    data/snippetBank.js       # getRandomSnippetId(lang) via snippet_metadata/{lang}.ids
    utils/formatters.js       # formatPercent, formatTime
    components/Navbar.jsx, ProtectedRoute.jsx
    components/game/          # PlayerPanel, CompactOpponentCard, ProgressBar, StatPill, CodeGhostText
    pages/Home.jsx            # language picker + QuickMatch/Create/Join
    pages/Lobby.jsx           # ready toggle, bothReady → snippet assign → /game
    pages/Game.jsx            # snippet fetch, useGameEngine, progress, winner transaction, countdown
    pages/Result.jsx          # winner, stats, rematchRequests, leaderboard transaction
    pages/Leaderboard.jsx     # orderBy average_wpm desc, podium + table
    pages/Login.jsx, Register.jsx, Profile.jsx
    assets/hero.png, react.svg
  public/favicon.svg, icons.svg
```

## 3) Data Models

### 3.1 Firestore (`codevs/src/firebase.js:18` → `firestore`)

**`users/{uid}`** — created in `AuthContext.jsx:52-60` on `register`, updated in `Result.jsx:181-195`
```js
{
  username: string,          // unique, checked via query where('username','==',...)  AuthContext.jsx:40
  email: string,
  quick_match_count: number, // default 0, incremented per quickmatch win
  average_wpm: number,       // rolling avg: ((oldAvg*oldGames)+newWpm)/newGames
  created_at: serverTimestamp()
}
```

**`snippets/{snippetId}`** — fetched in `Game.jsx:111` via `getDoc(doc(firestore,'snippets',snippetId))`
```js
{ code: string }  // full source text to type; fallback mockSnippet in Game.jsx:14-17 if missing
```

**`snippet_metadata/{language}`** — read in `snippetBank.js:10`
```js
{ ids: string[] }  // random pick via Math.random(); fallback 'fallback-snippet-id'
```
Languages: `c`, `python`, `javascript`, `cpp`, `java`, `php` (+ `random` resolved client-side) — `languages.js:1-9`

### 3.2 Realtime Database (`codevs/src/firebase.js:17` → `db`)

**`rooms/{roomId}`** — 6-char uppercase `Math.random().toString(36).substring(2,8).toUpperCase()` (`useRooms.jsx:23`, `useMatchmaking.jsx:120`)
```js
{
  creatorUID: string,
  language: string,          // original picker value ('random'|'cpp'|...)
  resolvedLanguage: string,  // random→actual (langs pick), else == language
  snippetId: string|null,    // set by lobby creator after bothReady via getRandomSnippetId()
  status: 'waiting'|'full'|'active',
  matchType: 'quickmatch'|'private',
  statEligible: boolean,     // quickmatch && language=='random' only
  winner: string|null,       // uid, set via runTransaction on finish (Game.jsx:119-124) or disconnect forfeit
  reason: string|null,       // 'opponent_disconnected'
  countdownStart: serverTimestamp()|null,
  rematchRequests: { [uid]: true }|null, // private rooms only (Result.jsx:144-164)
  players: {
    [uid]: { ready: boolean, progress: number, stats: {wpm:number, accuracy:number}|null }
  }
}
```

**`queues/{language}/{uid}`** — `useMatchmaking.jsx:46-47`
```js
{ joinedAt: serverTimestamp(), _claim?: string } // _claim = claimer uid during transaction
```

**`matchmaking_results/{uid}`** — `useMatchmaking.jsx:55-58`, `148` — transient notification: value = `roomId` string, removed on read.

### 3.3 Presence / onDisconnect

- Queue: `onDisconnect(queueRef).remove()` on enter (`useMatchmaking.jsx:50-52`), cancelled on match/timeout.
- Room player: `onDisconnect(rooms/{id}/players/{uid}).remove()` in `Lobby.jsx:168`, `Game.jsx:45-46` — triggers opponent win/forfeit logic.
- Lobby ghost timeout: 15 s if `quickmatch` and no opponent (`Lobby.jsx:324-336`); matchmaking timeout 60 s (`useMatchmaking.jsx:186-189`).

## 4) Routes & Navigation

| Path | Component | Guard | Query | Description |
|---|---|---|---|---|
| `/login` | `Login.jsx` | public | — | Firebase email/password |
| `/register` | `Register.jsx` | public | — | Username uniqueness check + `createUserWithEmailAndPassword` |
| `/` | `Home.jsx` | `ProtectedRoute` | — | Language picker (7 chips) + Quick Match / Create Room / Join modal |
| `/lobby?roomId=XXXXXX` | `Lobby.jsx` | protected | `roomId` | Ready toggle, VS panel, bothReady→assign snippet→countdown→`/game` |
| `/game?roomId=XXXXXX` | `Game.jsx` | protected | `roomId` | Split panels, `useGameEngine`, local 3-2-1 countdown, live progress via `players/{uid}.progress` |
| `/result?roomId=XXXXXX` | `Result.jsx` | protected | `roomId` | Winner, WPM/Accuracy, rematch (private only), leaderboard `runTransaction` |
| `/leaderboard` | `Leaderboard.jsx` | **public** (`App.jsx:27`) | — | Global top-10 by `average_wpm` |
| `/profile` | `Profile.jsx` | protected | — | Current user profile |

`ProtectedRoute.jsx` redirects unauthenticated → `/login`. `Navbar.jsx` present on all routes.

## 5) Core Logic & Formulas

### WPM (`useGameEngine.js:40-45`, `Game.jsx:183`, `Result.jsx:183`)
```js
wpm = (correctChars / 5) / (elapsedSeconds / 60)   // 5 chars = 1 word, rounded
```
Live display `—` until `startedAt` and `elapsedSeconds >=1`. Final stats: `Math.round((correctChars/5)/(minutes))`.

### Accuracy (`useGameEngine.js:47-51`, `Game.jsx:184`)
```js
accuracy = (correctKeystrokes / totalKeystrokes) * 100  // live: Math.round; final: Math.round(x*10)/10 (Result.jsx:11,84)
```
Char states: `'c'` correct / `'e'` error / `''` pending (`useGameEngine.js:19,109,133`). Backspace rewinds `progress` (`useGameEngine.js:68-79`). Wrong key does NOT advance cursor, triggers shake (`isError` 400 ms).

### Progress Sync
- On each correct keystroke and Backspace: `update(ref(db, rooms/{id}/players/{uid}), {progress: nextIndex})` (`useGameEngine.js:78,116`).
- Opponent progress: `roomData.players[oppUid].progress / snippet.length *100` → `PlayerPanel` progress bar + `CodeGhostText` overlay.
- Winner: `runTransaction(rooms/{id}, d=>{if(!d.winner) d.winner=uid})` first to finish wins (`useGameEngine.js:119-124`).

### Leaderboard (`Leaderboard.jsx:232-236`, `Result.jsx:181-195`)
- Query: `query(collection(firestore,'users'), orderBy('average_wpm','desc'), limit(50))` → normalize → filter `gamesPlayed>=1` → `sortByRankRules` (WPM desc, then games desc, then username) → top 10.
- Write (quickmatch only, once per result): `runTransaction(users/{uid}, {quick_match_count: old+1, average_wpm: ((oldAvg*oldGames)+wpm)/newGames})`.
- Podium: ranks 1-3 with Gold/Silver/Bronze tones; table + mobile cards.

## 6) Firebase API Surface (no REST — all SDK calls)

### Auth (`AuthContext.jsx`)
- `createUserWithEmailAndPassword(auth,email,password)` + `setDoc(users/{uid}, {username,email,quick_match_count:0,average_wpm:0})` — `register()`
- `signInWithEmailAndPassword(auth,email,password)` — `login()`
- `signOut(auth)` — `logout()`
- `onAuthStateChanged(auth, cb)` → `fetchUserProfile(uid)` via `getDoc(users/{uid})` — merges `firebaseUser` + profile into `user`
- Username uniqueness: `query(users, where('username','==',username))` before create

### Firestore reads/writes
| Call | Location | Purpose |
|---|---|---|
| `getDoc(doc(firestore,'users',uid))` | `AuthContext.jsx:24` | Profile fetch |
| `getDoc(doc(firestore,'snippets',snippetId))` | `Game.jsx:111` | Load code to type |
| `getDoc(doc(firestore,'snippet_metadata',lang))` | `snippetBank.js:10` | Random snippet ID pool |
| `getDocs(query(users, orderBy('average_wpm','desc'), limit(50)))` | `Leaderboard.jsx:235` | Rankings |
| `runTransaction(users/{uid}, update avg)` | `Result.jsx:181` | Leaderboard increment |

### Realtime Database
| Call | Location | Purpose |
|---|---|---|
| `set(queues/{lang}/{uid}, {joinedAt})` + `onDisconnect().remove()` | `useMatchmaking.jsx:46` | Enter queue |
| `onValue(matchmaking_results/{uid})` | `useMatchmaking.jsx:56` | Matched notification → navigate lobby |
| `onValue(queues/{lang})` + `runTransaction(queues/{lang}/{oppUid}, claim)` + UID `>` tie-breaker | `useMatchmaking.jsx:76-113` | Atomic opponent claim (prevents double room) |
| `set(rooms/{id}, {creatorUID,language,resolvedLanguage,snippetId,status,matchType,statEligible,players})` | `useMatchmaking.jsx:133`, `useRooms.jsx:32` | Create room (quick vs private) |
| `get(rooms/{id})` + `update(players/{uid}, ready/progress)` | `useRooms.jsx:70`, `Lobby.jsx:290` | Join / ready toggle |
| `onValue(rooms/{id})` | `Lobby.jsx:171`, `Game.jsx:48`, `Result.jsx:116` | Live room sync, disconnect/win detection |
| `update(rooms/{id}/players/{uid}, {progress})` | `useGameEngine.js:78,116` | Typing progress |
| `runTransaction(rooms/{id}, set winner)` | `useGameEngine.js:119` | First finisher wins |
| `update(rooms/{id}, {snippetId,countdownStart})` | `Lobby.jsx:305` | Creator assigns snippet after bothReady |
| `update(rooms/{id}/players/{uid}, {stats:{wpm,accuracy}})` | `Game.jsx:187` | Final stats before `/result` |
| `update(rooms/{id}, {winner,reason})` on `<2 players` | `Game.jsx:76` | Forfeit handling |
| `remove(rooms/{id})` / `remove(rooms/{id}/players/{uid})` | `Lobby.jsx:199,230`, `Game.jsx:203` | Leave/forfeit |
| `update(rooms/{id}, {rematchRequests/{uid}:true})` + wipe when 2 requests | `Result.jsx:264,151` | Private rematch handshake |

## 7) Deployment

- `firebase.json:3` `public: dist` (Vite output), SPA rewrites, ignore `node_modules`.
- `npm run build` → `dist/` → `npm run deploy` (`firebase deploy --only hosting`). Live site referenced in PPT slide 34: `https://codevs-a9bf1.web.app` (also `narukami00/CodeVS` on GitHub).

## 8) Project Management (from report & PPT)

- Jira Cloud `SCRUM` (113 issues: 26 Tasks + 82 Subtasks + 5 Epics), 3 sprints (Sprint 1: 20 issues, Sprint 2: 45, Sprint 3: 43). Branch convention `SCRUM-{n}-{slug}` (13 branches), 31 commits (68% tagged), 14 PRs.
- Epics: SCRUM-1 Project Setup & Auth (4 tasks), SCRUM-2 Matchmaking (3), SCRUM-3 Game Engine (6), SCRUM-4 UI/Frontend (8), SCRUM-5 Snippet Bank & Leaderboard (5).
- Zephyr Scale for QA; test cases in `CodeVS_Zephyr_Testing_Report.docx` (no embedded screenshots beyond thumbnail; see extracted Zephyr screenshots from PPT).

## 9) Assets

All figures/screenshots extracted to `docs/assets/` — **76 files**, see `docs/assets/INDEX.md` for full descriptions and `docs/assets/_manifest.json` for hash→source mapping. Key diagrams: `uml-class-diagram.jpg`, `use-case-diagram.png`, `activity-diagram.png`, `sequence-diagram.png`, `component-diagram.jpg`, `dfd-level0-context.png`, `dfd-level1-main-processes.png`, `dfd-level2-a..e.png`.
