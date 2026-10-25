import assert from "node:assert/strict";
import { test } from "node:test";
import { gradeAssessment } from "../src/lib/grade-assessment";

import type { Question } from "../src/lib/types";

const questions: Question[] = [
  { type: "multiple-choice", id: "a", questionText: "First?", options: ["yes", "no"], correctAnswer: "yes" },
  { type: "multiple-choice", id: "b", questionText: "Second?", options: ["yes", "no"], correctAnswer: "no" },
];
test("grades independently of answer order", () => {
  assert.equal(gradeAssessment(questions, [
    { questionId: "b", selectedAnswer: "no" }, { questionId: "a", selectedAnswer: "yes" },
  ]), 100);
  assert.equal(gradeAssessment(questions, [
    { questionId: "a", selectedAnswer: "no" }, { questionId: "b", selectedAnswer: "no" },
  ]), 50);
});
test("rejects incomplete, duplicate, unknown and invalid answers", () => {
  for (const answers of [
    [],
    [{ questionId: "a", selectedAnswer: "yes" }, { questionId: "a", selectedAnswer: "yes" }],
    [{ questionId: "a", selectedAnswer: "yes" }, { questionId: "unknown", selectedAnswer: "no" }],
    [{ questionId: "a", selectedAnswer: "invalid" }, { questionId: "b", selectedAnswer: "no" }],
  ]) assert.throws(() => gradeAssessment(questions, answers));
  assert.throws(() => gradeAssessment([], []));
});
