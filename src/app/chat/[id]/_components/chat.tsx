"use client";

import { useState } from "react";
import { Viewer } from "~/app/_components";
import type { ChatWithMessages, TempMessage } from "~/types";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import "~/app/_components/md.css";
import { useRouter } from "next/navigation";
import Editor from "./editor";

export default function Chat({
  id,
  chat,
}: {
  id: string;
  chat?: ChatWithMessages;
}) {
  const [messages, setMessages] = useState<TempMessage[]>(chat?.messages ?? []);
  const router = useRouter();

  const createChatQuery = api.chat.create.useMutation({
    onSuccess: (data) => {
      // todo: handle error
      if (!data?.id) return;
      router.push(`/chat/${data.id}`);
    },
  });

  const saveMessageQuery = api.chat.saveMessages.useMutation({
    onError: (error: unknown) => {
      // todo: handle error
      console.error(error);
    },
  });

  const chatQuery = api.ai.chat.useMutation({
    onSuccess: async (data) => {
      let response = "";
      for await (const chunk of data) {
        response += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = response;
          }
          return newMessages;
        });
      }

      if (id === "new") {
        createChatQuery.mutate({
          messages: messages,
        });
      } else {
        const lastUserMessage = messages?.[messages.length - 2];
        const lastAssistantMessage = messages?.[messages.length - 1];
        if (!lastUserMessage || !lastAssistantMessage) return;
        saveMessageQuery.mutate({
          chatId: Number(id),
          messages: [lastUserMessage, lastAssistantMessage],
        });
      }
    },
  });

  const onSubmit = async (input: string) => {
    setMessages((prev) => {
      return [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: "" },
      ];
    });

    chatQuery.mutate({
      messages: [...messages, { role: "user", content: input }],
      model: "gpt-4o",
    });
  };

  return (
    <>
      {messages.length === 0 ? (
        <p className="flex h-screen items-center justify-center text-center text-muted-foreground">
          Select a model and ask anything!
        </p>
      ) : null}
      {messages.length > 0 ? (
        <div className="md-container mx-auto mb-44 flex max-w-4xl flex-col gap-2 p-2 px-4">
          {messages.map((message) => (
            <div
              key={message.content}
              className={cn(
                message.role === "user"
                  ? "self-end rounded bg-gray-800 p-2"
                  : "",
              )}
            >
              <Viewer markdown={message.content} />
            </div>
          ))}
        </div>
      ) : null}
      <Editor onSubmit={onSubmit} />
    </>
  );
}
