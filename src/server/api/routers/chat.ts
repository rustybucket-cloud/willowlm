import { z } from "zod";
import { chats, messages } from "~/server/db/schema";

import { invoke } from "~/server/providers/openAI";

import { messageSchema } from "~/lib/zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { asc, desc, eq, and } from "drizzle-orm";
import { type Chat, type ChatWithMessages } from "~/types";

export const chatRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        messages: z.array(messageSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await invoke(
        [
          ...input.messages,
          {
            role: "system",
            content:
              "Create a name for this chat. Prefer names with 5 words or less. Do not mention that you are creating a name.",
          },
        ],
        "gpt-4o",
      );

      const name = response.content;

      if (typeof name !== "string") {
        throw new Error("Failed to create chat");
      }

      const chatInsert = await ctx.db
        .insert(chats)
        .values({
          userId: ctx.session?.user.id,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const newChat = chatInsert?.[0];

      const chatId = newChat?.id;

      if (chatId == null) {
        throw new Error("Failed to create chat");
      }

      for (const message of input.messages) {
        await ctx.db.insert(messages).values({
          chatId,
          role: message.role,
          content: message.content,
        });
      }

      return newChat;
    }),
  saveMessages: protectedProcedure
    .input(
      z.object({
        messages: z.array(messageSchema),
        chatId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [userMessage, assistantMessage] = input.messages;
      if (!userMessage || !assistantMessage) {
        throw new Error("Invalid messages");
      }
      await ctx.db.insert(messages).values([
        { chatId: input.chatId, ...userMessage },
        { chatId: input.chatId, ...assistantMessage },
      ]);
    }),
  getWithMessages: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }): Promise<ChatWithMessages | null> => {
      if (!ctx.session?.user.id) {
        // todo: handle this error
        return null;
      }
      const chat = await ctx.db
        .select()
        .from(chats)
        .where(
          and(eq(chats.id, input.id), eq(chats.userId, ctx.session.user.id)),
        )
        .leftJoin(messages, eq(messages.chatId, chats.id))
        .orderBy(asc(messages.createdAt));

      if (!chat[0]) {
        return null;
      }

      const chatWithMessages = chat[0].chat;

      return {
        ...chatWithMessages,
        messages: chat
          .map((c) => c.message)
          .filter(
            (message): message is NonNullable<typeof message> =>
              message !== null,
          ),
      };
    }),
  getAll: protectedProcedure.query(async ({ ctx }): Promise<Chat[]> => {
    const allChats = await ctx.db
      .select()
      .from(chats)
      .where(eq(chats.userId, ctx.session?.user.id))
      .orderBy(desc(chats.updatedAt));
    return allChats;
  }),
});
