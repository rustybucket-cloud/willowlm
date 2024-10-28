import { useEffect, useRef } from "react";
import { TempMessage } from "~/types";

export default function useIsNewChatRef(messages: TempMessage[]) {
  const isNewChatRef = useRef(messages.length === 0);

  useEffect(() => {
    // reset the new chat flag when the messages are reset
    if (messages.length === 0) {
      isNewChatRef.current = true;
    }
  }, [messages]);

  return isNewChatRef;
}
