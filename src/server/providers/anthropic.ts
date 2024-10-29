import { ChatAnthropic } from "@langchain/anthropic";
import { type Model, type TempMessage } from "~/types";

export async function* stream(messages: TempMessage[], model: Model) {
  const anthropic = createAnthropic(model);

  for await (const chunk of await anthropic.stream([
    {
      role: "system",
      content: "Respond in markdown. Don't mention that you're using markdown.",
    },
    ...messages,
  ])) {
    yield chunk.content;
  }
}

function createAnthropic(model: Model) {
  return new ChatAnthropic({
    model,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-latest",
  "claude-3-opus-latest",
] as const;
