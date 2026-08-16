import { useState } from "react";
import { useTutorStore } from "../../stores/tutorStore";
import { useEditorStore } from "../../stores/editorStore";
import { getHint } from "../../services/aiService";

interface Props {
  onSpeak: (text: string) => void;
}

export default function LessonView({ onSpeak }: Props) {
  const { lessons, currentLessonIndex, markComplete, nextLesson } = useTutorStore();
  const { code, language } = useEditorStore();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const lesson = lessons[currentLessonIndex];

  if (!lesson) return <p>No lessons loaded.</p>;

  const checkExercise = () => {
    const passed = lesson.exercise.validate.every((rule) =>
      rule.type === "regex" ? new RegExp(rule.value).test(code) : code.includes(rule.value)
    );
    if (passed) {
      markComplete(lesson.id);
      setFeedback(lesson.exercise.successMessage);
      onSpeak(lesson.exercise.successMessage);
    } else {
      const msg = "Not quite yet. " + lesson.exercise.voiceHint;
      setFeedback(msg);
      onSpeak(msg);
    }
  };

  const handleGetHint = async () => {
    setHintLoading(true);
    setFeedback("Getting a hint for you…");
    try {
      const ai = await getHint(lesson.exercise.prompt, code, language);
      const hintMsg = ai.spokenResponse || lesson.exercise.voiceHint;
      setFeedback("Hint: " + hintMsg);
      onSpeak("Here is your hint. " + hintMsg);
    } catch {
      // Graceful fallback to static hint if AI is unavailable
      const fallback = "Here's a tip: " + lesson.exercise.voiceHint;
      setFeedback(fallback);
      onSpeak(fallback);
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <article aria-labelledby="lesson-heading" className="lesson-view">
      <h2 id="lesson-heading">{lesson.title}</h2>
      <p>{lesson.explanation}</p>
      <pre aria-label="Example code"><code>{lesson.example}</code></pre>

      <h3>Exercise</h3>
      <p>{lesson.exercise.prompt}</p>

      <div className="lesson-actions">
        <button type="button" onClick={checkExercise}>Check my code</button>
        <button
          type="button"
          onClick={handleGetHint}
          disabled={hintLoading}
          aria-busy={hintLoading}
          className="hint-button"
        >
          {hintLoading ? "Getting hint…" : "💡 Get a Hint"}
        </button>
        <button type="button" onClick={() => { nextLesson(); }}>Next lesson</button>
      </div>

      {feedback && <p role="status" className="lesson-feedback">{feedback}</p>}
    </article>
  );
}
