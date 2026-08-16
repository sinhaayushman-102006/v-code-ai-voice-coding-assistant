import { Router } from "express";
import { COMMAND_PATTERNS } from "@shared/constants/commands";

const router = Router();

// Exposes the same voice-command grammar the frontend parses against, so
// other clients (a VS Code extension, a CLI, etc.) can query it instead of
// duplicating the pattern list.
router.get("/spec", (_req, res) => {
  res.json(
    COMMAND_PATTERNS.map((c) => ({
      intent: c.intent,
      examples: c.patterns.map((p) => p.source),
    }))
  );
});

router.post("/parse", (req, res) => {
  const { text } = req.body ?? {};
  if (!text) return res.status(400).json({ error: "text is required" });
  const lower = String(text).trim().toLowerCase().replace(/[.?!]+$/, "");
  for (const { intent, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = lower.match(pattern);
      if (match) return res.json({ intent, match: match.slice(1) });
    }
  }
  res.json({ intent: "UNKNOWN" });
});

export default router;
