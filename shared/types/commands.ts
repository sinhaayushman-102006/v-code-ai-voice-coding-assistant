// Central list of every voice intent V-Code understands.
// Both frontend and backend import from here so the grammar never drifts apart.

export type CommandIntent =
  | "GOTO_LINE"
  | "GOTO_FUNCTION"
  | "READ_LINE"
  | "READ_FUNCTION"
  | "READ_CODE"
  | "READ_SELECTION"
  | "INSERT_CODE"
  | "DICTATE_CODE"
  | "REPLACE_LINE"
  | "DELETE_LINE"
  | "UNDO"
  | "REDO"
  | "RUN_CODE"
  | "STOP_CODE"
  | "SAVE_FILE"
  | "OPEN_FILE"
  | "SET_LANGUAGE"
  | "EXPLAIN_CODE"
  | "EXPLAIN_ERROR"
  | "FIX_ERROR"
  | "ASK_AI"
  | "START_LESSON"
  | "NEXT_LESSON"
  | "REPEAT"
  | "STOP_SPEAKING"
  | "HELP"
  | "UNKNOWN";

export interface ParsedCommand {
  intent: CommandIntent;
  raw: string;
  parameters: Record<string, string | number | undefined>;
  /** 0-1 confidence that the rule-based parser matched correctly */
  confidence: number;
}

export interface CommandResult {
  success: boolean;
  spokenResponse: string;
  /** Optional structured payload (e.g. inserted code) consumers can act on */
  data?: unknown;
}
