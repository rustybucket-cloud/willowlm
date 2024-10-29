import { type TempMessage } from "~/types";
import { z } from "zod";

const perplexityRoute = "https://api.perplexity.ai/chat/completions";

export async function stream(
  messages: TempMessage[],
  model: (typeof PERPLEXITY_MODELS)[number],
) {
  const response = await fetch(perplexityRoute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  return streamIterator(response);
}

async function* streamIterator(response: Response) {
  if (!response.body) throw new Error("Failed to get body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the chunk and add it to the buffer
    buffer += decoder.decode(value, { stream: true });

    // Process each line in the buffer
    const lines = buffer.split("\n");

    // Keep the last incomplete line in the buffer
    buffer = lines.pop() ?? "";

    for (let line of lines) {
      // Trim whitespace and skip empty lines
      line = line.trim();
      if (!line) continue;

      // Remove the "data: " prefix and parse JSON
      if (line.startsWith("data: ")) {
        line = line.slice("data: ".length); // Remove "data: " prefix
        try {
          const data = PerplexityResponseSchema.parse(JSON.parse(line));
          if (data?.choices?.[0]?.delta?.content) {
            yield data.choices[0].delta.content;
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    }
  }
}

const PerplexityResponseSchema = z.object({
  choices: z.array(
    z.object({
      delta: z.object({
        content: z.string(),
      }),
    }),
  ),
});

export const PERPLEXITY_MODELS = [
  "llama-3.1-sonar-large-128k-chat",
  "llama-3.1-sonar-small-128k-chat",
  "llama-3.1-8b-instruct",
  "llama-3.1-70b-instruct",
  "llama-3.1-sonar-huge-128k-online",
  "llama-3.1-sonar-large-128k-online",
  "llama-3.1-sonar-small-128k-online",
] as const;
