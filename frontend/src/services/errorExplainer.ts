import type { ExplainedError } from "@shared/types/code";

// Fast, offline pattern matches for the most common beginner errors so the
// user gets an instant spoken explanation without waiting on a network
// round-trip. Anything unmatched is still handed to the AI explainer
// (see commandRouter.ts) for a deeper explanation.

const RULES: { pattern: RegExp; explain: (m: RegExpMatchArray) => ExplainedError }[] = [
  {
    pattern: /NameError: name '(\w+)' is not defined/,
    explain: (m) => ({
      originalMessage: m[0],
      spokenExplanation: `Your program is trying to use ${m[1]}, but ${m[1]} has not been defined yet.`,
      suggestion: `Create the variable ${m[1]} before this line, or check for a typo.`,
    }),
  },
  {
    pattern: /IndentationError/,
    explain: (m) => ({
      originalMessage: m[0],
      spokenExplanation: "This line's indentation doesn't match the block it's supposed to be in.",
      suggestion: "Check that every line in the same block has exactly the same number of leading spaces.",
    }),
  },
  {
    pattern: /SyntaxError: unexpected EOF while parsing|SyntaxError: unexpected end of input/,
    explain: () => ({
      originalMessage: "SyntaxError: unexpected end of input",
      spokenExplanation: "The code ends before a block or expression is finished.",
      suggestion: "Check for a missing closing bracket, parenthesis, or colon.",
    }),
  },
  {
    pattern: /TypeError: (.+)/,
    explain: (m) => ({
      originalMessage: m[0],
      spokenExplanation: `A value is being used in a way its type doesn't support: ${m[1]}.`,
      suggestion: "Check the type of the values involved, such as mixing text and numbers.",
    }),
  },
  {
    pattern: /ZeroDivisionError/,
    explain: () => ({
      originalMessage: "ZeroDivisionError",
      spokenExplanation: "The code is trying to divide a number by zero, which is not allowed.",
      suggestion: "Check the value of the divisor before dividing.",
    }),
  },
  {
    pattern: /IndexError: (.+)/,
    explain: (m) => ({
      originalMessage: m[0],
      spokenExplanation: `The code is trying to access a position in a list that doesn't exist: ${m[1]}.`,
      suggestion: "Check the length of the list before accessing an index.",
    }),
  },
];

export function explainErrorLocally(rawError: string): ExplainedError | null {
  for (const rule of RULES) {
    const match = rawError.match(rule.pattern);
    if (match) return rule.explain(match);
  }
  return null;
}
