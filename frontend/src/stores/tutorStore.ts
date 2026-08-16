import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lesson } from "../types/shared";

interface TutorState {
  lessons: Lesson[];
  currentLessonIndex: number;
  completed: string[];
  setLessons: (lessons: Lesson[]) => void;
  startLesson: (idOrIndex: string | number) => void;
  nextLesson: () => void;
  markComplete: (id: string) => void;
}

export const useTutorStore = create<TutorState>()(
  persist(
    (set, get) => ({
      lessons: [],
      currentLessonIndex: 0,
      completed: [],
      setLessons: (lessons) => set({ lessons }),
      startLesson: (idOrIndex) => {
        const { lessons } = get();
        const index =
          typeof idOrIndex === "number"
            ? idOrIndex
            : lessons.findIndex(
                (l) => l.id === idOrIndex || l.title.toLowerCase().includes(String(idOrIndex).toLowerCase())
              );
        if (index >= 0) set({ currentLessonIndex: index });
      },
      nextLesson: () => {
        const { currentLessonIndex, lessons } = get();
        set({ currentLessonIndex: Math.min(currentLessonIndex + 1, lessons.length - 1) });
      },
      markComplete: (id) => {
        const { completed } = get();
        if (!completed.includes(id)) set({ completed: [...completed, id] });
      },
    }),
    {
      name: "vcode-tutor",
      // Only persist the progress data, not the lessons array (loaded fresh from JSON on mount)
      partialize: (state) => ({
        currentLessonIndex: state.currentLessonIndex,
        completed: state.completed,
      }),
    }
  )
);
