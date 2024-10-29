import { ChatOpenAI } from "@langchain/openai";

import { type Model, type TempMessage } from "~/types";

export const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini"] as const;

export function invoke(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  return openai.invoke(messages);
}

export async function* stream(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  for await (const chunk of await openai.stream(messages)) {
    yield chunk.content;
  }
}

export function createOpenAI(model: Model) {
  return new ChatOpenAI({
    model,
    temperature: 0.0,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
