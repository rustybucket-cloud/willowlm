import { z } from "zod";
import { chats, messages } from "~/server/db/schema";

import { invoke } from "~/server/providers/openAI";

import { messageSchema } from "~/lib/zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { asc, desc, eq } from "drizzle-orm";
import { Chat, ChatWithMessages } from "~/types";

export const chatRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ messages: z.array(messageSchema) }))
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

      const name = response.split("\n")[0];

      if (!name) {
        throw new Error("Failed to create chat");
      }

      const chatInsert = await ctx.db
        .insert(chats)
        .values({
          userId: ctx.session?.user.id,
          name,
          //   messages: input.messages,
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
  getWithMessages: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }): Promise<ChatWithMessages | null> => {
      const chat = await ctx.db
        .select()
        .from(chats)
        .where(eq(chats.id, input.id))
        .leftJoin(messages, eq(messages.chatId, chats.id))
        .orderBy(asc(messages.createdAt));

      if (!chat[0]) {
        return null;
      }

      const chatWithMessages = chat[0].chat;

      const chatMessages = chat
        .filter((c) => c.message != null)
        .map((c) => c.message);

      return {
        ...chatWithMessages,
        messages: chatMessages.filter(
          (message): message is NonNullable<typeof message> => message !== null,
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
