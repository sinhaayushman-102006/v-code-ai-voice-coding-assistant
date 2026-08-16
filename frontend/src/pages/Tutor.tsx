import { useEffect } from "react";
import LessonList from "../components/tutor/LessonList";
import LessonView from "../components/tutor/LessonView";
import { useTutorStore } from "../stores/tutorStore";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import lessons from "../data/lessons.json";

export default function Tutor() {
  const { setLessons, lessons: loaded } = useTutorStore();
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    if (loaded.length === 0) setLessons(lessons as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main id="main-content" className="tutor-page">
      <h1 className="sr-only">Tutor mode</h1>
      <LessonList />
      <LessonView onSpeak={(t) => speak(t, { interrupt: true })} />
    </main>
  );
}
