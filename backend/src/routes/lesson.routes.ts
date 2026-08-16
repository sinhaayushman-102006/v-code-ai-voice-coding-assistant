import { Router } from "express";
import lessons from "../data/lessons.json";

const router = Router();

router.get("/", (_req, res) => {
  res.json(lessons);
});

router.get("/:id", (req, res) => {
  const lesson = (lessons as any[]).find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  res.json(lesson);
});

router.post("/:id/validate", (req, res) => {
  const lesson = (lessons as any[]).find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  const { code } = req.body ?? {};
  const passed = lesson.exercise.validate.every((rule: any) =>
    rule.type === "regex" ? new RegExp(rule.value).test(code ?? "") : (code ?? "").includes(rule.value)
  );
  res.json({ passed, message: passed ? lesson.exercise.successMessage : lesson.exercise.voiceHint });
});

export default router;
