import { type messages } from "~/server/db/schema";

export type Message = typeof messages.$inferSelect;
export type TempMessage = Pick<Message, "role" | "content">;
