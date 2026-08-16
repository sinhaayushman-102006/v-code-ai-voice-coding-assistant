import { Router } from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";
import fs from "fs";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/transcribe", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      fs.unlinkSync(req.file.path);
      return res.status(503).json({ error: "GROQ_API_KEY is not configured for transcription." });
    }

    const client = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: GROQ_API_KEY,
    });

    const fileStream = fs.createReadStream(req.file.path);
    const translation = await client.audio.transcriptions.create({
      file: await toFile(fileStream, req.file.originalname || "audio.webm"),
      model: "whisper-large-v3",
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ text: translation.text });
  } catch (e) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
    }
    next(e);
  }
});

export default router;
