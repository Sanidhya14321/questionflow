// Override at deployment time when the provider retires or replaces a model.
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
