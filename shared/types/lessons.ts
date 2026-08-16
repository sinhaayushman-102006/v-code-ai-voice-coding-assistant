export interface Exercise {
  prompt: string;
  voiceHint: string;
  /** Simple substring/regex checks used to validate the learner's code without an AI call */
  validate: { type: "includes" | "regex"; value: string }[];
  successMessage: string;
}

export interface Lesson {
  id: string;
  title: string;
  introduction: string;
  explanation: string;
  example: string;
  exercise: Exercise;
}
