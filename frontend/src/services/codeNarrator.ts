// Converts source code into structured, spoken-friendly descriptions instead
// of reading symbols literally. This is intentionally rule-based (regex /
// line-shape matching) rather than an AI call: narration needs to be
// instant and available offline, and Python/JS control-flow keywords are
// regular enough that a parser handles the common cases well.
//
// Anything the rules don't recognise falls back to a lightly cleaned-up
// literal reading rather than silently saying nothing.

export function narrateLine(line: string, lineNumber: number): string {
  const trimmed = line.trim();
  if (!trimmed) return `Line ${lineNumber} is blank.`;

  const rule = matchRule(trimmed);
  if (rule) return `Line ${lineNumber}: ${rule}`;
  return `Line ${lineNumber}: ${literalCleanup(trimmed)}`;
}

export function narrateCode(code: string): string {
  const lines = code.split("\n");
  const parts: string[] = [];
  let indentStack: number[] = [];

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    const indent = rawLine.length - rawLine.trimStart().length;
    const depth = indentStack.filter((i) => i < indent).length;

    const rule = matchRule(trimmed);
    const prefix = depth > 0 ? `At indent level ${depth}, ` : "";
    parts.push(`${prefix}${rule ?? literalCleanup(trimmed)}.`);

    if (/[:{]\s*$/.test(trimmed)) {
      indentStack.push(indent);
    }
  });

  if (parts.length === 0) return "The file is empty.";
  return parts.join(" ");
}

export function narrateFunction(code: string, functionName: string): string | null {
  const lines = code.split("\n");
  const startIdx = lines.findIndex((l) =>
    new RegExp(`\\b(def|function)\\s+${escapeRegex(functionName)}\\s*\\(`).test(l)
  );
  if (startIdx === -1) return null;

  const baseIndent = lines[startIdx].length - lines[startIdx].trimStart().length;
  const body: string[] = [lines[startIdx]];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const indent = line.length - line.trimStart().length;
    if (indent <= baseIndent) break;
    body.push(line);
  }
  return narrateCode(body.join("\n"));
}

function matchRule(line: string): string | null {
  let m: RegExpMatchArray | null;

  if ((m = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:?/))) {
    const params = m[2].trim();
    return `Define a function called ${m[1]}${params ? ` that takes ${humanizeParams(params)}` : " that takes no parameters"}`;
  }
  if ((m = line.match(/^function\s+(\w+)\s*\(([^)]*)\)/))) {
    const params = m[2].trim();
    return `Define a function called ${m[1]}${params ? ` that takes ${humanizeParams(params)}` : " that takes no parameters"}`;
  }
  if ((m = line.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+?);?$/))) {
    return `Create a variable called ${m[2]} and set it to ${humanizeExpression(m[3])}`;
  }
  if ((m = line.match(/^(\w+)\s*=\s*(.+)$/)) && !/^(if|elif|while|for)\b/.test(line)) {
    return `Set ${m[1]} to ${humanizeExpression(m[2])}`;
  }
  if ((m = line.match(/^if\s+(.+?):?\s*\{?$/))) {
    return `If ${humanizeCondition(m[1])}, execute the following block`;
  }
  if ((m = line.match(/^elif\s+(.+?):?\s*$/))) {
    return `Otherwise, if ${humanizeCondition(m[1])}, execute the following block`;
  }
  if (/^else\s*:?\s*\{?$/.test(line)) {
    return "Otherwise, execute the following block";
  }
  if ((m = line.match(/^for\s+(\w+)\s+in\s+range\((.+)\)\s*:?/))) {
    return `Loop, with ${m[1]} taking each value in the range ${humanizeExpression(m[2])}`;
  }
  if ((m = line.match(/^for\s+(\w+)\s+in\s+(.+?):?\s*$/))) {
    return `Loop through ${humanizeExpression(m[2])}, with each item called ${m[1]}`;
  }
  if ((m = line.match(/^while\s+(.+?):?\s*\{?$/))) {
    return `While ${humanizeCondition(m[1])}, repeat the following block`;
  }
  if ((m = line.match(/^return\s+(.+)$/))) {
    return `Return ${humanizeExpression(m[1])}`;
  }
  if (/^return\s*$/.test(line)) {
    return "Return, with no value";
  }
  if ((m = line.match(/^(import|from)\s+(.+)$/))) {
    return `Import ${m[2]}`;
  }
  if ((m = line.match(/^class\s+(\w+)/))) {
    return `Define a class called ${m[1]}`;
  }
  if ((m = line.match(/^#\s*(.*)$/)) || (m = line.match(/^\/\/\s*(.*)$/))) {
    return m[1] ? `Comment: ${m[1]}` : "An empty comment";
  }
  if ((m = line.match(/^(\w+)\s*\(([^)]*)\)\s*;?$/))) {
    return `Call ${m[1]} with ${m[2].trim() ? humanizeParams(m[2]) : "no arguments"}`;
  }
  if (/^\}\s*$/.test(line)) {
    return "End of block";
  }
  return null;
}

function humanizeParams(params: string): string {
  const list = params.split(",").map((p) => p.trim()).filter(Boolean);
  if (list.length === 0) return "no parameters";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function humanizeExpression(expr: string): string {
  return expr
    .replace(/==/g, " equals ")
    .replace(/!=/g, " does not equal ")
    .replace(/>=/g, " is greater than or equal to ")
    .replace(/<=/g, " is less than or equal to ")
    .replace(/>/g, " is greater than ")
    .replace(/</g, " is less than ")
    .replace(/\+/g, " plus ")
    .replace(/-/g, " minus ")
    .replace(/\*/g, " times ")
    .replace(/\//g, " divided by ")
    .replace(/\s+/g, " ")
    .trim();
}

function humanizeCondition(cond: string): string {
  return humanizeExpression(cond);
}

function literalCleanup(line: string): string {
  return line.replace(/;$/, "");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
