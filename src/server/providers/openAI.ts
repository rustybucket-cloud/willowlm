import { ChatOpenAI } from "@langchain/openai";

import { Message, Model, TempMessage } from "~/types";

export const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini"] as const;

export function invoke(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  return openai.invoke(messages);
}

export function stream(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  return openai.stream(messages);
}

export function createOpenAI(model: Model) {
  return new ChatOpenAI({
    model,
    temperature: 0.0,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
