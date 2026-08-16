# V-Code

An AI-powered, voice-first coding assistant built for blind and low-vision learners. You can write, navigate, run, and debug code almost entirely by voice — the AI narrates code in plain spoken language instead of reading symbols literally, explains errors in plain English, and includes a voice-guided tutor for beginners.

Every core action has a keyboard- and screen-reader-accessible equivalent. Nothing in this app assumes the user can see the screen.

## Features

- **Voice input** — speak commands like "go to line 12" or "create a function called add that takes two numbers" (Web Speech API)
- **Voice output** — text-to-speech with adjustable rate, pitch, and voice
- **Structured code narration** — reads `if x > 5:` as *"If x is greater than 5, execute the following block"*, not as symbols
- **AI coding assistant** — explains code, explains errors, suggests fixes, answers questions (via your own AI API key)
- **Error-to-speech** — common Python/JS errors are explained instantly offline; anything else goes to the AI
- **Accessible Monaco editor** — full keyboard control, ARIA labels, works alongside NVDA/JAWS/VoiceOver rather than fighting them
- **Voice-guided tutor mode** — 5 starter lessons (variables → conditions → loops → functions → lists) with auto-validated exercises
- **Typed command fallback** — every voice command also works typed, for noisy rooms or no-mic setups

## Architecture

```
Browser (mic) ──▶ Web Speech STT ──▶ Rule-based command parser ──▶ Command router
                                                                        │
                        ┌───────────────────────────────────────────────┼───────────────┐
                        ▼                                                ▼               ▼
                 Monaco editor actions                       Backend /api/ai/*   Backend /api/code/run
                 (goto/read/insert/undo…)                     (AI provider)      (local JS sandbox or Judge0)
                        │                                                │               │
                        └────────────────────────▶ Web Speech TTS ◀──────┴───────────────┘
```

The command **parser is rule-based and runs entirely in the browser** — navigation, reading, and editing commands work even if the backend or an AI key isn't configured. Only free-form questions, AI explanations/fixes, and code execution touch the backend.

See `docs/technical-design.md` for the full breakdown and `docs/voice-command-spec.md` for every supported command.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind + Zustand |
| Editor | Monaco Editor |
| Speech | Web Speech API (STT + TTS) |
| Backend | Node.js + Express + TypeScript |
| AI | Groq (chat completions, via `groq-sdk`) |
| Code execution | Local Node `vm` sandbox (JS, zero-config) + Judge0 (Python, needs a key) |

## Folder Structure

```
v-code/
├── frontend/          React app (Vite)
├── backend/           Express API
├── shared/            Types & the voice-command grammar, imported by both
├── docs/               Technical design + voice command spec
└── package.json        Root scripts to run both together
```

## Installation

Requires Node.js 18+.

```bash
git clone <this project>
cd v-code
npm install
npm --prefix frontend install
npm --prefix backend install
```

## Environment Variables

Copy the example and fill in what you have:

```bash
cp backend/.env.example backend/.env
```

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

GROQ_API_KEY=[GROQ_API_KEY]  # optional — without it, AI features report "not configured" instead of faking answers. Get one free at https://console.groq.com/keys
GROQ_MODEL=llama-3.3-70b-versatile

JUDGE0_API_URL=       # optional — needed only to run Python. JS runs locally with no key.
JUDGE0_API_KEY=
```

## Running Locally

```bash
npm run dev
```

This starts the backend on `http://localhost:5000` and the frontend on `http://localhost:5173` (Vite proxies `/api/*` to the backend automatically). Open the frontend URL in **Chrome or Edge** (Web Speech API support is inconsistent in Firefox/Safari).

Grant microphone permission when prompted, click the mic button (or press `Ctrl+Shift+M`), and try:

> "Create a function called add that takes two numbers"

Then:

> "Run the code"

## Voice Commands

See `docs/voice-command-spec.md` for the full list. Highlights:

| Say | Does |
|---|---|
| "go to line 12" | Moves cursor to line 12 |
| "read the code" | Narrates the whole file in plain language |
| "read function add" | Narrates just that function |
| "run the code" | Executes and speaks the result |
| "explain this error" | Speaks a plain-language explanation of the last error |
| "fix it" | Asks the AI to correct the last error |
| "teach me loops" | Jumps to that tutor lesson |
| "help" | Lists what you can say |

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+M` | Start/stop microphone |
| `Ctrl+Enter` | Run code |
| `Escape` | Stop speech |

*(Currently wired: mic toggle via the on-screen button; global key bindings for run/read/explain are stubbed in `Workspace.tsx` as a documented next step — see Known Limitations.)*

## Accessibility

- WCAG 2.2 AA is the target baseline.
- Skip links, ARIA live regions, strong focus outlines, and a high-contrast theme are built in (`Settings` page).
- The editor keeps `accessibilitySupport: "on"` so Monaco exposes a screen-reader-friendly textarea rather than only a visual canvas.
- All voice actions are also reachable via the typed command box, so nothing requires a microphone.

## AI Configuration

AI features (explain, explain-error, fix, free-form chat) run on [Groq](https://groq.com) for low-latency inference, a good fit for a voice interface where the user is waiting on a spoken response. Requires `GROQ_API_KEY` in `backend/.env` (free tier available at console.groq.com/keys). Without it, the backend returns an honest, clearly-worded "not configured" response — it never fabricates an answer. `GROQ_MODEL` defaults to `llama-3.3-70b-versatile`; see console.groq.com/docs/models for alternatives.

## Code Execution

- **JavaScript** runs locally out of the box, sandboxed via Node's `vm` module (3-second timeout, isolated context). No setup required.
- **Python** requires [Judge0](https://judge0.com) — set `JUDGE0_API_URL` and `JUDGE0_API_KEY`. Without them, running Python returns a clear error explaining what's missing, rather than a fake result.

## Testing

```bash
npm test          # backend tests (vitest)
npm run typecheck # strict TS check across both apps
```

Test coverage in this MVP focuses on the command parser, error explainer, and code narrator (the offline, deterministic logic). See `docs/technical-design.md` → Testing for what's covered vs. what's a documented gap.

## Known Limitations

- **STT/TTS are browser-native (Web Speech API)**, not Whisper/Polly/ElevenLabs — quality and browser support vary. Chrome/Edge recommended. The service layer (`voiceService`-equivalent hooks) is isolated so swapping in Whisper or a paid TTS voice is a contained change.
- **Python execution needs an external Judge0 key** — it's not bundled, since it requires a hosted account.
- **No automated E2E voice tests** — voice interaction is inherently hard to script; manual testing with a real mic and a real screen reader (NVDA/VoiceOver) is recommended before considering this production-ready.
- **Global keyboard shortcuts beyond the mic toggle aren't wired yet** (Ctrl+Enter to run, Ctrl+Shift+E to explain, etc.) — the settings store already has a `shortcuts` extension point for this.
- **Single-file workspace only** — no multi-file projects, file tree, or persistence beyond localStorage settings and a "save to downloads" action.
- **No user accounts / lesson progress sync** — tutor progress lives in memory only (client-side Zustand state), resets on reload.

## Roadmap

1. Wire remaining global keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+R/F/E)
2. Swap Web Speech STT for Whisper API for reliability across browsers
3. Add a real screen-reader test pass (NVDA + Chrome, VoiceOver + Safari)
4. Multi-file workspace + persistence (backend-stored projects)
5. VS Code extension using the same `shared/` command grammar
6. Offline mode (bundle a small on-device model for narration/error explanation when no AI key is available)
#   v - c o d e - a i - v o i c e - c o d i n g - a s s i s t a n t  
 