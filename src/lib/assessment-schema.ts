import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  questionText: z.string().trim().min(10).max(2000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(5),
  correctAnswer: z.string().min(1).max(500),
  type: z.enum(['multiple-choice', 'true-false']),
}).superRefine((q, context) => {
  if (!q.options.includes(q.correctAnswer)) context.addIssue({ code: 'custom', path: ['correctAnswer'], message: 'Correct answer must match an option.' });
  if (new Set(q.options).size !== q.options.length) context.addIssue({ code: 'custom', path: ['options'], message: 'Options must be unique.' });
  if (q.type === 'true-false' && (q.options.length !== 2 || !q.options.includes('True') || !q.options.includes('False'))) context.addIssue({ code: 'custom', path: ['options'], message: 'True/false questions require True and False options.' });
});

export const assessmentSchema = z.object({
  title: z.string().trim().min(5).max(150),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(2000),
  durationMinutes: z.number().int().min(1).max(240).optional(),
  questions: z.array(questionSchema).min(1).max(50),
}).superRefine((assessment, context) => {
  const ids = assessment.questions.map(q => q.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) context.addIssue({ code: 'custom', path: ['questions'], message: 'Question identifiers must be unique.' });
});
