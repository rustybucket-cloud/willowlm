import { create } from "zustand";
import { Chat } from "~/types";

export const useChatStore = create<{
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
}>((set) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
  addChat: (chat) =>
    set((state) => {
      const chats = [...state.chats];
      chats.unshift(chat);
      return { chats };
    }),
}));
