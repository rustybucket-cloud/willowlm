import { OpenAI } from "@langchain/openai";

import { Message, Model, TempMessage } from "~/types";

export function invoke(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  return openai.invoke(messages);
}

export function stream(messages: TempMessage[], model: Model) {
  const openai = createOpenAI(model);

  return openai.stream(messages);
}

export function createOpenAI(model: Model) {
  return new OpenAI({
    model,
    temperature: 0.0,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
