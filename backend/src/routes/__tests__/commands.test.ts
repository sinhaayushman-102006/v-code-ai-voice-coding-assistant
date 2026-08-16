import { describe, it, expect } from "vitest";
import { COMMAND_PATTERNS } from "@shared/constants/commands";

function parse(text: string) {
  const lower = text.trim().toLowerCase().replace(/[.?!]+$/, "");
  for (const { intent, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match) return { intent, match };
    }
  }
  return { intent: "UNKNOWN", match: null };
}

describe("voice command grammar", () => {
  it("parses go to line commands", () => {
    expect(parse("go to line 42").intent).toBe("GOTO_LINE");
  });

  it("parses run code commands", () => {
    expect(parse("run the code").intent).toBe("RUN_CODE");
    expect(parse("run it").intent).toBe("RUN_CODE");
  });

  it("parses explain error commands", () => {
    expect(parse("explain this error").intent).toBe("EXPLAIN_ERROR");
    expect(parse("why did this break").intent).toBe("EXPLAIN_ERROR");
  });

  it("parses help", () => {
    expect(parse("help").intent).toBe("HELP");
  });

  it("returns UNKNOWN for unmatched free text", () => {
    expect(parse("tell me a joke about pandas").intent).toBe("UNKNOWN");
  });
});
