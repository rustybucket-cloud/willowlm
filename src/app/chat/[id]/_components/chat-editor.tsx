"use client";

import { useState } from "react";
import { MilkdownEditor, useMilkdownEditor, Viewer } from "~/app/_components";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowUp } from "lucide-react";
import { MilkdownProvider } from "@milkdown/react";
import type { ChatWithMessages, Model, TempMessage } from "~/types";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { MODELS } from "~/lib/models";
import "~/app/_components/md.css";
import { useRouter } from "next/navigation";

export default function ChatEditor({
  id,
  chat,
}: {
  id: string;
  chat?: ChatWithMessages;
}) {
  const [messages, setMessages] = useState<TempMessage[]>(chat?.messages || []);
  const router = useRouter();

  const createChatQuery = api.chat.create.useMutation({
    onSuccess: (data) => {
      // todo: handle error
      if (!data?.id) return;
      router.push(`/chat/${data.id}`);
    },
  });

  const saveMessageQuery = api.chat.saveMessages.useMutation({
    onError: (error: any) => {
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
    <MilkdownProvider>
      {messages.length === 0 ? (
        <p className="text-muted-foreground flex h-screen items-center justify-center text-center">
          Select a model and ask anything!
        </p>
      ) : null}
      {messages.length > 0 ? (
        <div className="md-container mx-auto mb-40 flex max-w-4xl flex-col gap-2 p-2">
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
      <ChatEditorChild onSubmit={onSubmit} />
    </MilkdownProvider>
  );
}

function ChatEditorChild({ onSubmit }: { onSubmit: (input: string) => void }) {
  const [model, setModel] = useState<Model>("gpt-4o");

  const editor = useMilkdownEditor();

  const sendChat = async () => {
    if (editor.loading) return;

    const markdown = editor.getMarkdown();
    if (!markdown) return;

    await editor.reset();
    onSubmit(markdown);
  };

  const updateModel = (value: string) => {
    if (!MODELS.includes(value as Model)) {
      throw new Error(`Invalid model: ${value}`);
    }
    setModel(value as Model);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex justify-between">
        <Select defaultValue={model} onValueChange={updateModel}>
          <SelectTrigger className="max-w-48">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4o-turbo">GPT-4o Turbo</SelectItem>
            <SelectItem value="o1-preview">O1 Preview</SelectItem>
            <SelectItem value="o1-mini">O1 Mini</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={sendChat}>
          <ArrowUp />
        </Button>
      </div>
      <MilkdownEditor />
    </div>
  );
}
