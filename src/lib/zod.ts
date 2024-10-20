import { z } from "zod";

import { ROLES } from "~/lib/roles";

export const messageSchema = z.object({
  role: z.enum(ROLES),
  content: z.string(),
});

export const chatSchema = z.object({
  name: z.string(),
  messages: z.array(messageSchema),
});
