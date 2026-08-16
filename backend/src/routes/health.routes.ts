import { Router } from "express";
import { isConfigured as isGroqConfigured } from "../services/ai/aiService";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    aiProvider: "groq",
    aiConfigured: isGroqConfigured(),
    judge0Configured: Boolean(process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_URL),
  });
});

export default router;
