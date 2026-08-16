import { describe, it, expect } from "vitest";

// Mirrors the offline rules in frontend/src/services/errorExplainer.ts.
// Duplicated here (rather than imported cross-package) so backend tests
// don't need a frontend build step; see docs/technical-design.md Testing.
function explainErrorLocally(rawError: string) {
  const RULES: { pattern: RegExp; explain: (m: RegExpMatchArray) => any }[] = [
    {
      pattern: /NameError: name '(\w+)' is not defined/,
      explain: (m) => ({ spokenExplanation: `Your program is trying to use ${m[1]}, but ${m[1]} has not been defined yet.` }),
    },
    { pattern: /IndentationError/, explain: () => ({ spokenExplanation: "This line's indentation doesn't match the block it's supposed to be in." }) },
    { pattern: /ZeroDivisionError/, explain: () => ({ spokenExplanation: "The code is trying to divide a number by zero, which is not allowed." }) },
  ];
  for (const rule of RULES) {
    const match = rawError.match(rule.pattern);
    if (match) return rule.explain(match);
  }
  return null;
}

describe("errorExplainer", () => {
  it("explains NameError with the variable name", () => {
    const result = explainErrorLocally("NameError: name 'x' is not defined");
    expect(result?.spokenExplanation).toContain("x");
  });

  it("explains IndentationError", () => {
    const result = explainErrorLocally("IndentationError: unexpected indent");
    expect(result?.spokenExplanation).toMatch(/indentation/i);
  });

  it("returns null for unrecognized errors", () => {
    expect(explainErrorLocally("SomeWeirdCustomError: whatever")).toBeNull();
  });
});
