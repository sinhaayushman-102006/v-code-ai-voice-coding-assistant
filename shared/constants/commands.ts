// Human phrasing patterns mapped to intents. Order matters: more specific
// patterns are listed first so they win over generic ones.
export const COMMAND_PATTERNS: { intent: string; patterns: RegExp[] }[] = [
  { intent: "DICTATE_CODE", patterns: [/^type\s+(.+)$/i, /^dictate\s+(.+)$/i, /^insert code\s+(.+)$/i] },
  { intent: "GOTO_FUNCTION", patterns: [/^go to function (.+)$/i, /^jump to function (.+)$/i] },
  { intent: "GOTO_LINE", patterns: [/^go to line (\d+)$/i, /^jump to line (\d+)$/i] },
  { intent: "READ_FUNCTION", patterns: [/^read function (.+)$/i, /^read the (.+) function$/i] },
  { intent: "READ_LINE", patterns: [/^read line (\d+)$/i, /^what('?s| is) on line (\d+)/i] },
  { intent: "READ_SELECTION", patterns: [/^read selection$/i, /^read the selected code$/i] },
  { intent: "READ_CODE", patterns: [/^read( the)?( whole| entire)? code$/i, /^read( the)? file$/i] },
  { intent: "EXPLAIN_ERROR", patterns: [/^explain( this| the)? error$/i, /^why did (this|the code) break$/i, /^what('?s| is) wrong$/i] },
  { intent: "FIX_ERROR", patterns: [/^fix( it| this| the error| the code)?$/i] },
  { intent: "EXPLAIN_CODE", patterns: [/^explain( this| the)? code$/i, /^what does this code do$/i] },
  { intent: "RUN_CODE", patterns: [/^run( the)? code$/i, /^execute( the)? code$/i, /^run it$/i] },
  { intent: "STOP_CODE", patterns: [/^stop( the)? code$/i, /^stop running$/i] },
  { intent: "SAVE_FILE", patterns: [/^save( the)?( file)?$/i] },
  { intent: "OPEN_FILE", patterns: [/^open file (.+)$/i, /^open (.+)$/i] },
  { intent: "SET_LANGUAGE", patterns: [/^switch to (python|javascript)$/i, /^set language to (python|javascript)$/i] },
  { intent: "UNDO", patterns: [/^undo$/i] },
  { intent: "REDO", patterns: [/^redo$/i] },
  { intent: "DELETE_LINE", patterns: [/^delete line (\d+)$/i, /^delete this line$/i] },
  { intent: "REPLACE_LINE", patterns: [/^replace line (\d+) with (.+)$/i] },
  { intent: "START_LESSON", patterns: [/^teach me (.+)$/i, /^start lesson (.+)$/i, /^start( the)? tutor$/i] },
  { intent: "NEXT_LESSON", patterns: [/^next lesson$/i, /^continue$/i] },
  { intent: "REPEAT", patterns: [/^repeat( that)?$/i, /^say that again$/i] },
  { intent: "STOP_SPEAKING", patterns: [/^stop talking$/i, /^stop speaking$/i, /^quiet$/i] },
  { intent: "HELP", patterns: [/^help$/i, /^what can I say$/i, /^list commands$/i] },
];

// Anything that doesn't match a pattern above is routed to the AI assistant
// as a free-form question (ASK_AI) or code-insertion request (INSERT_CODE),
// decided by commandParser.ts heuristics.
