import { Router } from "express";
import { runJavaScriptLocally } from "../services/execution/localJsExecutor";
import { runOnJudge0, isConfigured } from "../services/execution/judge0Service";
import type { SupportedLanguage } from "@shared/types/code";

const router = Router();

router.post("/run", async (req, res, next) => {
  try {
    const { code, language } = req.body ?? {} as { code?: string; language?: SupportedLanguage };
    if (!code || typeof code !== "string") return res.status(400).json({ error: "code is required" });
    if (language !== "python" && language !== "javascript") {
      return res.status(400).json({ error: "language must be python or javascript" });
    }

    if (language === "javascript" && !(await isConfigured())) {
      // Zero-config path: local sandboxed executor.
      return res.json(await runJavaScriptLocally(code));
    }

    // Python (and JS if Judge0 is explicitly configured) goes through Judge0.
    res.json(await runOnJudge0(code, language));
  } catch (e) { next(e); }
});

export default router;
