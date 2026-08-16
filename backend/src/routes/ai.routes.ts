import { Router } from "express";
import * as aiService from "../services/ai/aiService";

const router = Router();

router.post("/chat", async (req, res, next) => {
  try {
    const { message, code, language } = req.body ?? {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    res.json(await aiService.chat(message, code, language));
  } catch (e) { next(e); }
});

router.post("/explain", async (req, res, next) => {
  try {
    const { code, language } = req.body ?? {};
    if (!code) return res.status(400).json({ error: "code is required" });
    res.json(await aiService.explain(code, language ?? "python"));
  } catch (e) { next(e); }
});

router.post("/explain-error", async (req, res, next) => {
  try {
    const { errorMessage, code, language } = req.body ?? {};
    if (!errorMessage) return res.status(400).json({ error: "errorMessage is required" });
    res.json(await aiService.explainError(errorMessage, code ?? "", language ?? "python"));
  } catch (e) { next(e); }
});

router.post("/fix", async (req, res, next) => {
  try {
    const { errorMessage, code, language } = req.body ?? {};
    if (!errorMessage || !code) return res.status(400).json({ error: "errorMessage and code are required" });
    res.json(await aiService.fix(errorMessage, code, language ?? "python"));
  } catch (e) { next(e); }
});

router.post("/hint", async (req, res, next) => {
  try {
    const { exercisePrompt, code, language } = req.body ?? {};
    if (!exercisePrompt || typeof exercisePrompt !== "string") {
      return res.status(400).json({ error: "exercisePrompt is required" });
    }
    res.json(await aiService.hint(exercisePrompt, code ?? "", language ?? "python"));
  } catch (e) { next(e); }
});

export default router;
