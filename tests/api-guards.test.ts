import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readJson, ApiError } from '../src/lib/api';
import { assessmentSchema } from '../src/lib/assessment-schema';

test('bounds streamed bodies even when content length is absent', async () => {
  const request = new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'x'.repeat(100) }) });
  await assert.rejects(readJson(request, 20), (error: unknown) => error instanceof ApiError && error.status === 413);
});
test('rejects malformed JSON and incorrect media types', async () => {
  await assert.rejects(readJson(new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })), (e: unknown) => e instanceof ApiError && e.status === 400);
  await assert.rejects(readJson(new Request('https://example.test', { method: 'POST', body: '{}' })), (e: unknown) => e instanceof ApiError && e.status === 415);
});
test('assessment validation rejects ambiguous questions and excessive collections', () => {
  const q = { id: 'a', questionText: 'Which answer is correct?', options: ['A', 'B'], correctAnswer: 'A', type: 'multiple-choice' };
  const assessment = { title: 'Sample assessment', category: 'Testing', description: 'A sample assessment for validation.', questions: [q] };
  assert.equal(assessmentSchema.safeParse(assessment).success, true);
  for (const questions of [[{ ...q, options: ['A', 'A'] }], [{ ...q, correctAnswer: 'C' }], [{ ...q, type: 'true-false' }], [q, q], Array.from({ length: 51 }, () => q)]) {
    assert.equal(assessmentSchema.safeParse({ ...assessment, questions }).success, false);
  }
});
