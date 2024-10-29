import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { ROLES } from "~/lib/roles";

import {
  OPENAI_MODELS,
  stream as openAIStream,
} from "~/server/providers/openAI";

import { MODELS } from "~/lib/models";

import {
  PERPLEXITY_MODELS,
  stream as perplexityStream,
} from "~/server/providers/perplexity";

export const aiRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(ROLES),
            content: z.string(),
          }),
        ),
        model: z.enum(MODELS),
      }),
    )
    .mutation(async function* ({ input }) {
      let stream;
      try {
        if (
          PERPLEXITY_MODELS.includes(
            input.model as (typeof PERPLEXITY_MODELS)[number],
          )
        ) {
          stream = await perplexityStream(
            input.messages,
            input.model as (typeof PERPLEXITY_MODELS)[number],
          );
        } else if (
          OPENAI_MODELS.includes(input.model as (typeof OPENAI_MODELS)[number])
        ) {
          stream = openAIStream(
            [
              ...input.messages,
              {
                role: "system",
                content:
                  "Respond in markdown. Don't mention that you're using markdown.",
              },
            ],
            input.model,
          );
        }
      } catch (error) {
        console.error(error);
        throw error;
      }

      if (!stream) throw new Error("Failed to stream");

      for await (const chunk of stream) {
        yield chunk;
      }
    }),
});
