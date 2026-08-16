import { useTutorStore } from "../../stores/tutorStore";

export default function LessonList() {
  const { lessons, currentLessonIndex, completed, startLesson } = useTutorStore();
  return (
    <nav aria-label="Lesson list">
      <ul className="lesson-list">
        {lessons.map((lesson, i) => (
          <li key={lesson.id}>
            <button
              type="button"
              aria-current={i === currentLessonIndex ? "true" : undefined}
              onClick={() => startLesson(i)}
              className={i === currentLessonIndex ? "active" : ""}
            >
              {completed.includes(lesson.id) ? "✓ " : ""}{lesson.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
