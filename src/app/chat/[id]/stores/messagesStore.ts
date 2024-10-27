import { create } from "zustand";
import { TempMessage } from "~/types";

export const useMessagesStore = create<{
  messages: TempMessage[];
  setMessages: (messages: TempMessage[]) => void;
}>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
}));
