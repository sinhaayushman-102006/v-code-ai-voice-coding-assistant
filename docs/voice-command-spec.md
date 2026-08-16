# V-Code Voice Command Specification

Every command below is matched by the rule-based parser in `shared/constants/commands.ts` (also queryable at `GET /api/commands/spec`). Matching is case-insensitive and trailing punctuation is ignored. Anything that doesn't match falls through to the AI assistant as either a code-generation request or a free-form question.

---

### GOTO_LINE
**Say:** "go to line 20" · "jump to line 20"
**Parameters:** `line = 20`
**Action:** Moves the editor cursor to that line and scrolls it into view.
**Response:** "Moved to line 20."

### GOTO_FUNCTION
**Say:** "go to function add" · "jump to function add"
**Parameters:** `name = "add"`
**Action:** Finds the `def`/`function` declaration and moves the cursor there.
**Response:** "Moved to function add on line 8." (or a not-found message)

### READ_LINE
**Say:** "read line 20" · "what's on line 20"
**Parameters:** `line = 20`
**Action:** Narrates that single line in plain language.
**Response:** e.g. "Line 20: Set x to x plus 1."

### READ_FUNCTION
**Say:** "read function add" · "read the add function"
**Parameters:** `name = "add"`
**Action:** Narrates the full body of that function.

### READ_CODE
**Say:** "read the code" · "read the entire code" · "read the file"
**Action:** Narrates the whole buffer, block by block.

### READ_SELECTION
**Say:** "read selection" · "read the selected code"
**Action:** Narrates whatever text is currently selected in the editor.

### EXPLAIN_ERROR
**Say:** "explain this error" · "explain the error" · "why did this break" · "what's wrong"
**Action:** Checks the last runtime error against offline rules first (instant); falls back to the AI for anything not recognized.
**Response:** e.g. "The variable x is being used before it was defined. Define x before this line."

### FIX_ERROR
**Say:** "fix it" · "fix this" · "fix the error" · "fix the code"
**Action:** Sends the last error + code to the AI, replaces editor contents with the corrected version if returned.

### EXPLAIN_CODE
**Say:** "explain this code" · "explain the code" · "what does this code do"
**Action:** Sends the current buffer to the AI for a plain-language explanation.

### RUN_CODE
**Say:** "run the code" · "execute the code" · "run it"
**Action:** Sends code to `/api/code/run`; speaks stdout, or an error summary + prompt to say "explain this error".

### STOP_CODE
**Say:** "stop the code" · "stop running"
**Action:** Reserved for stopping a long-running execution (see Known Limitations — currently a no-op placeholder since the local/Judge0 executors are synchronous request/response).

### SAVE_FILE
**Say:** "save" · "save the file"
**Action:** Downloads the current buffer as `main.py` or `main.js`.
**Response:** "File saved to your downloads."

### OPEN_FILE
**Say:** "open file utils" · "open utils"
**Parameters:** `filename = "utils"`
**Action:** Reserved for multi-file support (see Known Limitations — this MVP is single-file).

### SET_LANGUAGE
**Say:** "switch to python" · "set language to javascript"
**Parameters:** `language = "python" | "javascript"`
**Action:** Switches the editor's language mode.

### UNDO / REDO
**Say:** "undo" · "redo"
**Action:** Triggers Monaco's native undo/redo stack.

### DELETE_LINE
**Say:** "delete line 12" · "delete this line" (uses current cursor line)
**Parameters:** `line = 12`

### REPLACE_LINE
**Say:** "replace line 5 with print of hello" (dictate the replacement text)
**Parameters:** `line = 5`, `content = "..."`

### START_LESSON
**Say:** "teach me loops" · "start lesson functions" · "start the tutor"
**Parameters:** `topic = "loops"`
**Action:** Jumps the tutor to the matching lesson by title/id.

### NEXT_LESSON
**Say:** "next lesson" · "continue"

### REPEAT
**Say:** "repeat" · "say that again"
**Action:** Re-speaks the last assistant response.

### STOP_SPEAKING
**Say:** "stop talking" · "stop speaking" · "quiet"
**Action:** Immediately cancels any in-progress speech synthesis.

### HELP
**Say:** "help" · "what can I say" · "list commands"
**Action:** Speaks a short summary of available commands.

---

## Fallback behavior (no pattern match)

| Heuristic | Routed to |
|---|---|
| Starts with create/define/make/write/add/generate | `INSERT_CODE` → AI code generation, inserted at end of buffer |
| Anything else | `ASK_AI` → AI chat, shown in the assistant panel and spoken |
