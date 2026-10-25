import type { Question } from "./types";

/** Grade a complete submission against the stored assessment, never client scores. */
export function gradeAssessment(
  questions: Question[],
  answers: { questionId: string; selectedAnswer: string }[],
): number {
  if (questions.length === 0 || answers.length !== questions.length) {
    throw new Error("Answer every question exactly once.");
  }
  const byId = new Map(answers.map(answer => [answer.questionId, answer.selectedAnswer]));
  if (byId.size !== questions.length) throw new Error("Duplicate answers are not allowed.");
  let correct = 0;
  for (const question of questions) {
    const answer = byId.get(question.id);
    if (answer === undefined || !question.options.includes(answer)) {
      throw new Error("Invalid answer or question.");
    }
    if (answer === question.correctAnswer) correct++;
  }
  return Math.round((correct / questions.length) * 100);
}
