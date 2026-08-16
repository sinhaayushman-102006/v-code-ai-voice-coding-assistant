# V-Code — Technical Design Document

## 1. Architecture Overview

V-Code is a two-tier app: a React/TypeScript SPA (frontend) and an Express/TypeScript API (backend), sharing a `shared/` package of types and the voice-command grammar so the two never drift apart.

```
┌─────────────────────────────── Browser ───────────────────────────────┐
│  Web Speech STT ──▶ commandParser.ts ──▶ commandRouter.ts              │
│                                             │        │                 │
│                                       Zustand stores  fetch()          │
│                              (editor, voice, assistant, tutor)         │
│                                                        │                │
│  Monaco Editor ◀── narration (codeNarrator.ts) ◀── Web Speech TTS      │
└─────────────────────────────────────────────────────┬──────────────────┘
                                                        │ /api/*
┌───────────────────────────────────────────────────────▼──────────────┐
│ Express backend                                                       │
│  /api/ai/*    → aiService.ts → Groq chat completions API (groq-sdk)     │
│  /api/code/run → localJsExecutor.ts (Node vm) | judge0Service.ts      │
│  /api/lessons  → static lesson JSON                                   │
│  /api/commands → shared command grammar, exposed for other clients    │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Voice Pipeline

1. `useSpeechRecognition` wraps the browser's `SpeechRecognition`, emitting a final transcript string.
2. `commandParser.parseCommand()` runs a **rule-based regex match** against `shared/constants/commands.ts` — this is deliberate: navigation, reading, and editing must work even with zero network access or no AI key, since those are the actions most critical for a blind user to never lose access to.
3. Anything that doesn't match a known pattern is classified heuristically: verbs like "create/define/write" → `INSERT_CODE` (AI code-gen), everything else → `ASK_AI` (AI chat).
4. `commandRouter.routeCommand()` is the single place that mutates state in response to an intent — it either acts directly on the Monaco instance / Zustand stores (for offline-capable intents), or calls the backend (for AI/execution intents).
5. Every result includes a `spokenResponse`, which is immediately sent to `useSpeechSynthesis().speak()` and, in parallel, an ARIA live region (`LiveRegion.tsx`) for users who have speakers off but a screen reader running.

## 3. AI Pipeline

- Frontend never holds an API key; `aiService.ts` (frontend) only calls `/api/ai/*`.
- Backend `aiService.ts` calls the configured provider with a system prompt that forces **structured JSON output** (`{type, spokenResponse, code, language, suggestions}`), so the frontend never has to guess whether a response contains narratable text vs. code to insert.
- If `GROQ_API_KEY` is unset, every AI function short-circuits to a fixed, honest "not configured" response — this was a hard requirement (no fabricated answers, ever).
- If the provider returns non-JSON text (rare, but LLMs sometimes wrap in prose), the backend falls back to treating the raw text as `spokenResponse` rather than crashing the request.

## 4. Code Execution Pipeline

- **JavaScript**: runs in a Node `vm.createContext` sandbox with a 3-second timeout and a stubbed `console`. This is a real, working, zero-configuration path — verified in this build to correctly execute and capture stdout/stderr.
- **Python** (and JS if explicitly configured): proxied to **Judge0**. Requires `JUDGE0_API_URL` + `JUDGE0_API_KEY`. Without them, the route returns a `501` with a clear message rather than silently failing or faking output.
- The route (`code.routes.ts`) picks the executor based on language + configuration, so adding a third language later (e.g. via a WASM runtime) is a matter of adding one branch, not restructuring.

### Security note
Node's `vm` module is a *soft* isolation boundary — it prevents accidental collisions with backend globals but is not a hardened multi-tenant sandbox against a determined attacker. For anything beyond a single-user local prototype, JS execution should also move to Judge0 (or a container-per-run model).

## 5. Accessibility Architecture

- **Two parallel feedback channels**: spoken TTS (`useSpeechSynthesis`) for anyone listening, and ARIA live regions (`LiveRegion.tsx`) for anyone using a screen reader with speech synthesis muted. They are intentionally decoupled so they don't double-announce through two competing voices.
- **No mouse-only paths**: every button target is ≥44px, focus outlines are never removed (`:focus-visible` styled globally, not disabled), and skip links jump to editor / voice controls / assistant.
- **Narration is semantic, not literal**: `codeNarrator.ts` pattern-matches common constructs (functions, conditionals, loops, returns, imports) and describes them in plain English rather than reading punctuation — this was the single most-repeated requirement in the spec and is implemented as pure, testable, offline logic.
- **Settings are a single source of truth**: speech rate/pitch/voice, font size, contrast, and motion preferences all live in `settingsStore.ts` (persisted to `localStorage`) and are read by every component that speaks or renders — so a screen-reader user only has to set preferences once.

## 6. State Management

Zustand, five focused stores instead of one global blob:
- `editorStore` — code, language, cursor, run output, last error
- `voiceStore` — last transcript/response, short history
- `assistantStore` — chat messages, thinking state
- `settingsStore` — all accessibility/speech preferences, persisted
- `tutorStore` — lessons, current lesson, completed set

Kept separate so, e.g., a chat re-render doesn't cascade into the editor, and each store's shape maps 1:1 to a slice of the UI spec.

## 7. Security

- API keys live only in `backend/.env`, read via `process.env`, never sent to the client.
- CORS restricted to `FRONTEND_URL`.
- `/api/ai/*` and `/api/code/run` are rate-limited (30 req/min/IP) since they're the two costly/abusable routes.
- Centralized error handler (`errorHandler.ts`) logs full errors server-side but only returns a `publicMessage` to the client, avoiding leaking stack traces or provider internals.
- Code execution never uses `eval`/`child_process.exec` directly against the host; JS goes through `vm`, everything else through the external Judge0 sandbox.

## 8. Error Handling

- Frontend: every AI/execution call is wrapped in try/catch inside `commandRouter.ts`; failures produce a spoken, honest message ("I couldn't reach the AI assistant…") rather than a silent failure or a stuck loading state.
- Backend: a single Express error-handling middleware normalizes all thrown errors into `{ error: string }` with an appropriate status code.
- Common runtime errors (NameError, IndentationError, TypeError, ZeroDivisionError, IndexError) are explained **instantly, offline** via `errorExplainer.ts` pattern rules before ever calling the AI — this keeps the most common beginner mistakes fast and free.

## 9. Scalability / Future Architecture

- The command grammar (`shared/constants/commands.ts`) is exposed over HTTP (`/api/commands/spec`) specifically so a future VS Code extension or CLI client can reuse it without re-implementing the regex table.
- `aiService.ts` uses the official `groq-sdk` client; `GROQ_MODEL` is configurable via env var. Swapping to a different provider (e.g. Anthropic, OpenAI) means replacing the client construction and the single `callModel()` function -- the rest of the service (chat/explain/explainError/fix) is provider-agnostic.
- STT/TTS are isolated behind two hooks (`useSpeechRecognition`, `useSpeechSynthesis`); replacing browser Web Speech with Whisper (STT) or Polly/ElevenLabs (TTS) means rewriting those two files, not the command pipeline that depends on them.

## 10. Testing Strategy

Prioritized for what's deterministic and safety-critical:
- `commandParser` — every intent pattern, plus the fallback heuristics
- `errorExplainer` — each rule against real Python/JS error strings
- `codeNarrator` — functions, conditionals, loops, variables, returns
- Accessibility — manual pass required (axe/automated tools catch ARIA misuse but not real screen-reader UX; see README Known Limitations)
