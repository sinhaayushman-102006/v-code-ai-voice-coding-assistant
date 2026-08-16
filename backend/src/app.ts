import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import healthRoutes from "./routes/health.routes";
import aiRoutes from "./routes/ai.routes";
import codeRoutes from "./routes/code.routes";
import lessonRoutes from "./routes/lesson.routes";
import commandRoutes from "./routes/commands.routes";
import audioRoutes from "./routes/audio.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

// AI and execution routes are rate-limited separately from health/lessons
// since they're the expensive/abusable ones.
const heavyLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

app.use("/api/health", healthRoutes);
app.use("/api/ai", heavyLimiter, aiRoutes);
app.use("/api/code", heavyLimiter, codeRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/commands", commandRoutes);
app.use("/api/audio", heavyLimiter, audioRoutes);

app.use(errorHandler);

export default app;
