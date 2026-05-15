import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL ?? "https://openrouter.ai/api/v1";
const defaultModel = process.env.MODEL ?? "deepseek/deepseek-chat-v3";

if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set. AI features will be disabled.");
}

export const aiClient = new OpenAI({
  apiKey,
  baseURL,
});

export function getDefaultModel() {
  return defaultModel;
}

export function ensureApiKey() {
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Set it in the environment to enable AI workflows.");
  }
}
