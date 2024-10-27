import { useRef, useEffect } from "react";
import { useMessagesStore } from "../../stores/messagesStore";
import { ChatWithMessages } from "~/types";

export default function useChatMessages(chat: ChatWithMessages | null) {
  const mountedRef = useRef(false);
  const { messages: storedMessages, setMessages } = useMessagesStore();
  useEffect(() => {
    setMessages(chat?.messages ?? []);
    mountedRef.current = true;
  }, [chat]);

  return {
    messages: mountedRef.current ? storedMessages : (chat?.messages ?? []),
    setMessages,
  };
}
