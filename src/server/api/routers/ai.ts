import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { ROLES } from "~/lib/roles";

import { OpenAI } from "@langchain/openai";

import { MODELS } from "~/lib/models";

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
      console.log(input);
      const model = new OpenAI({
        model: input.model,
        temperature: 0.0,
        apiKey: process.env.OPENAI_API_KEY,
      });

      let stream;
      try {
        stream = await model.stream([
          ...input.messages,
          {
            role: "system",
            content:
              "Respond in markdown. Don't mention that you're using markdown.",
          },
        ]);
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
