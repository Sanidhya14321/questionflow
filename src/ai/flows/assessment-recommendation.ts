'use server';

import { z } from 'zod';
import Groq from 'groq-sdk';
import { GROQ_MODEL } from '@/ai/config';

const AssessmentRecommendationInputSchema = z.object({
  userHistory: z.array(
    z.object({
      assessmentCategory: z.string(),
      score: z.number(),
      interests: z.string(),
    })
  ),
  availableAssessments: z.array(
    z.object({
      assessmentCategory: z.string(),
      assessmentTitle: z.string(),
    })
  ),
});

export type AssessmentRecommendationInput = z.infer<typeof AssessmentRecommendationInputSchema>;

const AssessmentRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()),
});

export type AssessmentRecommendationOutput = z.infer<typeof AssessmentRecommendationOutputSchema>;

export async function assessmentRecommendation(
  input: AssessmentRecommendationInput
): Promise<AssessmentRecommendationOutput> {
  const parsedInput = AssessmentRecommendationInputSchema.parse(input);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { recommendations: [] };
  }

  const client = new Groq({ apiKey });

  const prompt = [
    'You are an assessment recommender.',
    'Return strict JSON only with this shape: {"recommendations": ["title"]}.',
    'Recommend up to 4 assessments from the provided available assessments.',
    'Prioritize categories where user has stronger scores and matching interests.',
    `User History: ${JSON.stringify(parsedInput.userHistory)}`,
    `Available Assessments: ${JSON.stringify(parsedInput.availableAssessments)}`,
  ].join('\n');

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content ?? '{"recommendations": []}';

  try {
    const parsed = JSON.parse(rawContent);
    return AssessmentRecommendationOutputSchema.parse(parsed);
  } catch {
    return { recommendations: [] };
  }
}
