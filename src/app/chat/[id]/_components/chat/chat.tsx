"use client";

import { useRef } from "react";
import { Viewer } from "~/app/_components";
import type { ChatWithMessages, Model, TempMessage } from "~/types";
import { api } from "~/trpc/react";
import "~/app/_components/md.css";
import Editor from "../editor";
import { create } from "zustand";
import { type Session } from "next-auth";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { useChatStore } from "../../stores/chatStore";
import useChatMessages from "./useChatMessages";
import useIsNewChatRef from "./useIsNewChatRef";

export default function Chat({
  id,
  chat,
  session,
  flags,
}: {
  id: string;
  chat: ChatWithMessages | null;
  session: Session | null;
  flags: {
    showGemini: boolean;
  };
}) {
  const { messages, setMessages } = useChatMessages(chat);

  const setCreatedMessage = useCreatedMessageStore(
    (state) => state.setCreatedMessage,
  );
  const isNewChatRef = useIsNewChatRef(messages);

  const { toast } = useToast();

  const addChat = useChatStore((state) => state.addChat);

  const createChatQuery = api.chat.create.useMutation({
    onSuccess: (data) => {
      if (!data?.id) return;
      addChat(data);
      const currentUrl = window.location.href;
      const newUrl = currentUrl.replace("new", data.id.toString());
      // we don't want to reload the page
      window.history.pushState({}, "", newUrl);
    },
  });
  const chatId = id === "new" ? createChatQuery.data?.id : Number(id);

  const saveMessageQuery = api.chat.saveMessages.useMutation({
    onError: (error: unknown) => {
      // todo: handle error
      console.error(error);
    },
  });

  const createdMessageRef = useRef<string>("");
  const chatQuery = api.ai.chat.useMutation({
    onSuccess: async (data) => {
      for await (const chunk of data) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        createdMessageRef.current += chunk;
        setCreatedMessage(createdMessageRef.current);
      }

      setCreatedMessage(null);
      const newMessages = [...messages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        lastMessage.content = createdMessageRef.current;
      }
      setMessages(newMessages);
      createdMessageRef.current = "";

      if (isNewChatRef.current) {
        createChatQuery.mutate({
          messages: messages,
        });
        isNewChatRef.current = false;
      } else {
        const lastUserMessage = messages?.[messages.length - 2];
        const lastAssistantMessage = messages?.[messages.length - 1];

        if (!lastUserMessage || !lastAssistantMessage) return;
        if (!chatId) {
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
          return;
        }

        saveMessageQuery.mutate({
          chatId,
          messages: [lastUserMessage, lastAssistantMessage],
        });
      }
    },
    onError: (error: unknown) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      const newMessages = [...messages];
      newMessages.pop();
      if (createdMessageRef.current.length > 0) {
        newMessages.push({
          role: "assistant",
          content: createdMessageRef.current,
        });
      }
      createdMessageRef.current = "";
      setMessages(newMessages);
      setCreatedMessage(null);
    },
  });

  const onSubmit = async (input: string, model: Model) => {
    const newMessages = [
      ...messages,
      { role: "user", content: input },
      { role: "assistant", content: "" },
    ];
    setMessages(newMessages as TempMessage[]);

    chatQuery.mutate({
      messages: [...messages, { role: "user", content: input }],
      model: model,
    });
  };

  return (
    <>
      {messages.length === 0 ? (
        <p className="flex h-[calc(100dvh-4rem)] items-center justify-center text-center text-muted-foreground">
          Select a model and ask anything!
        </p>
      ) : null}
      {messages.length > 0 ? (
        <div className="md-container mx-auto mb-44 flex max-w-4xl flex-col p-2 px-4">
          {messages.map((message, i) => (
            <div
              key={message.content}
              className={cn("flex gap-4", i !== 0 && "pt-12")}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-800">
                {message.role === "user"
                  ? (session?.user?.name?.[0] ?? "Y")
                  : "AI"}
              </div>
              <div className="relative flex pt-[8px]">
                {i !== messages.length - 1 ? (
                  <div className="absolute -left-10 top-0 z-[-1] h-[calc(100%+50px)] min-h-[40px] w-[1px] bg-gray-600" />
                ) : (
                  <div>
                    <CreatedMessage />
                  </div>
                )}
                <div>
                  <Viewer markdown={message.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <Editor onSubmit={onSubmit} flags={flags} />
      <Toaster />
    </>
  );
}

// using an extra component to avoid re-rendering the entire chat when the created message changes
function CreatedMessage() {
  const createdMessage = useCreatedMessageStore(
    (state) => state.createdMessage,
  );
  return createdMessage ? <Viewer markdown={createdMessage} /> : null;
}

const useCreatedMessageStore = create<{
  createdMessage: string | null;
  setCreatedMessage: (message: string | null) => void;
}>((set) => ({
  createdMessage: null,
  setCreatedMessage: (message) => set({ createdMessage: message }),
}));
