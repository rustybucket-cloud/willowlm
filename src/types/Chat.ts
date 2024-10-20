import { type chats } from "~/server/db/schema";
import type { Message } from "./Message";

export type Chat = typeof chats.$inferSelect;
export type ChatWithMessages = Chat & {
  messages: Message[];
};
