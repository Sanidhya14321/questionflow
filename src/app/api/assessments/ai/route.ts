import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";
import { createAssessment } from "@/lib/data/assessments";
import { getSessionFromRequest } from "@/lib/auth/session";

const schema = z.object({
  topic: z.string().min(2),
  numberOfQuestions: z.number().int().min(3).max(25),
  difficulty: z.enum(["easy", "easy-medium", "medium", "medium-hard", "hard", "professional"]),
});

const outputSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
  questions: z.array(
    z.object({
      questionText: z.string(),
      options: z.array(z.string()).min(2),
      correctAnswer: z.string(),
      type: z.enum(["multiple-choice", "true-false"]),
    })
  ),
});

function buildFallbackAssessment(input: {
  topic: string;
  difficulty: string;
  numberOfQuestions: number;
}) {
  const questions = Array.from({ length: input.numberOfQuestions }).map((_, index) => {
    const questionNo = index + 1;
    if (questionNo % 3 === 0) {
      return {
        questionText: `${input.topic}: statement ${questionNo} is accurate for ${input.difficulty} level learners.`,
        options: ["True", "False"],
        correctAnswer: "True",
        type: "true-false" as const,
      };
    }

    return {
      questionText: `Which option best answers ${input.topic} question ${questionNo}?`,
      options: [
        `${input.topic} core concept`,
        `${input.topic} advanced concept`,
        `${input.topic} implementation detail`,
        `${input.topic} best practice`,
      ],
      correctAnswer: `${input.topic} core concept`,
      type: "multiple-choice" as const,
    };
  });

  return {
    title: `${input.topic} (${input.difficulty}) AI Assessment`,
    category: input.topic,
    description: `Auto-generated ${input.difficulty} assessment for ${input.topic}.`,
    questions,
  };
}

function parseModelOutput(raw: string) {
  try {
    const parsedJson = JSON.parse(raw);
    return outputSchema.parse(parsedJson);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ message: "GROQ_API_KEY missing" }, { status: 500 });
    }

    const client = new Groq({ apiKey });
    const prompt = [
      "Generate a JSON assessment.",
      "Return strictly valid JSON only with fields: title, category, description, questions.",
      `Topic: ${payload.topic}`,
      `Difficulty: ${payload.difficulty}`,
      `Number of questions: ${payload.numberOfQuestions}`,
      "Each question must include questionText, options (2-5), correctAnswer, and type ('multiple-choice' or 'true-false').",
    ].join("\n");

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = parseModelOutput(raw) ?? buildFallbackAssessment(payload);

    const assessment = await createAssessment({
      title: parsed.title,
      category: parsed.category,
      description: parsed.description,
      questions: parsed.questions,
      createdByRole: "ai",
      createdByUserId: session.userId,
      isAIGenerated: true,
      durationMinutes: Math.max(10, payload.numberOfQuestions * 2),
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate AI assessment";
    return NextResponse.json({ message }, { status: 500 });
  }
}
