import { ChatAnthropic } from "@langchain/anthropic";
import { type Model, type TempMessage } from "~/types";

export function stream(messages: TempMessage[], model: Model) {
  const anthropic = createAnthropic(model);

  return anthropic.stream([
    {
      role: "system",
      content: "Respond in markdown. Don't mention that you're using markdown.",
    },
    ...messages,
  ]);
}

function createAnthropic(model: Model) {
  return new ChatAnthropic({
    model,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
