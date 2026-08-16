import { COMMAND_PATTERNS } from "@shared/constants/commands";
import type { CommandIntent, ParsedCommand } from "@shared/types/commands";

// Rule-based intent parser. This runs entirely offline (no AI call), so
// navigation/editing/narration commands work even if the AI backend is
// unreachable or unconfigured -- accessibility features shouldn't be
// hostage to an API key.
export function parseCommand(raw: string): ParsedCommand {
  const text = raw.trim().toLowerCase().replace(/[.?!]+$/, "");

  for (const { intent, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          intent: intent as CommandIntent,
          raw,
          parameters: extractParameters(intent as CommandIntent, match),
          confidence: 0.95,
        };
      }
    }
  }

  // Heuristic fallback: if it sounds like a request to create/define
  // something, treat it as a code-generation request via the AI. Otherwise
  // treat it as a general question for the AI assistant.
  const creationVerbs = /^(create|define|make|write|add|generate)\b/;
  if (creationVerbs.test(text)) {
    return { intent: "INSERT_CODE", raw, parameters: { description: raw }, confidence: 0.5 };
  }

  return { intent: "ASK_AI", raw, parameters: { question: raw }, confidence: 0.3 };
}

function extractParameters(intent: CommandIntent, match: RegExpMatchArray): Record<string, string | number> {
  switch (intent) {
    case "GOTO_LINE":
    case "READ_LINE":
    case "DELETE_LINE":
      return { line: Number(match[match.length - 1]) };
    case "GOTO_FUNCTION":
    case "READ_FUNCTION":
      return { name: match[1].trim() };
    case "OPEN_FILE":
      return { filename: match[1].trim() };
    case "SET_LANGUAGE":
      return { language: match[1].trim().toLowerCase() };
    case "REPLACE_LINE":
      return { line: Number(match[1]), content: match[2] };
    case "START_LESSON":
      return { topic: match[1]?.trim() ?? "" };
    case "DICTATE_CODE":
      return { text: match[1].trim() };
    default:
      return {};
  }
}
