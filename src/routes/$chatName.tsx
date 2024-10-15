import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  MarkdownEditor,
  MarkdownViewer,
  useMarkdownEditor,
} from "@/components";
import { Button } from "@/components/ui/button";
import type { Message } from "@/types";
import { ArrowUpIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatOpenAI } from "@langchain/openai";
import {
  create,
  BaseDirectory,
  rename,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import isEqual from "lodash.isequal";

export const Route = createFileRoute("/$chatName")({
  component: Home,
  loader: async ({ params }) => {
    const chatName = params.chatName;
    if (chatName === "new") {
      return { initialMessages: [] };
    }
    const content = await readTextFile(`chats/${params.chatName}`, {
      baseDir: BaseDirectory.AppData,
    });
    try {
      const initialMessages = JSON.parse(content);
      return { initialMessages };
    } catch (e: any) {
      console.error(e);
      return { initialMessages: [] };
    }
  },
});

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  streaming: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

function Home() {
  const { initialMessages } = Route.useLoaderData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>("gpt-4o");
  const [chatName, setChatName] = useState<string>("untitled");
  const markdownEditor = useMarkdownEditor();
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEqual(messages, initialMessages)) {
      setMessages(initialMessages);
      setTimeout(() => {
        scrollableRef.current?.scrollTo({
          top: scrollableRef.current.scrollHeight,
        });
      }, 10);
    }
  }, [initialMessages]);

  const errorToast = useErrorToast();

  const sendMessage = async () => {
    const content = markdownEditor.getMarkdown() || "";
    if (!content) return;

    const isFirstMessage = messages.length === 0;
    if (isFirstMessage) {
      const fs = await create("chats/untitled.json", {
        baseDir: BaseDirectory.AppData,
      });
      await fs.close();
    }

    setMessages([
      ...messages,
      { content, role: "user" },
      { content: "", role: "assistant" },
    ]);
    markdownEditor.setMarkdown("");

    let stream;
    try {
      stream = await llm.stream([
        ...messages,
        {
          role: "user",
          content,
        },
        {
          role: "system",
          content: "Respond in markdown.",
        },
      ]);
    } catch (e: any) {
      console.error(e);
      errorToast("ERROR_CONNECTING");
      return;
    }

    let allMessages;
    let newContent = "";
    for await (const chunk of stream) {
      newContent += chunk.content;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = newContent;
        allMessages = newMessages;
        return newMessages;
      });
    }

    try {
      await writeTextFile(
        `chats/${chatName}.json`,
        JSON.stringify(allMessages),
        {
          baseDir: BaseDirectory.AppData,
        }
      );
    } catch (e: any) {
      console.error(e);
      errorToast("ERROR_SAVING");
      return;
    }

    if (isFirstMessage) {
      try {
        var response = await llm.invoke([
          ...(allMessages || []),
          {
            role: "system",
            content:
              "Create a short name for this chat based on the question and answer. Prefer names fewer than 5 words.",
          },
        ]);
      } catch (e: any) {
        console.error(e);
        errorToast("ERROR_NAMING");
        return;
      }

      let newChatName = response.content;
      if (typeof newChatName !== "string") {
        console.error("Failed to create a new chat name.");
        errorToast("ERROR_NAMING");
        return;
      }
      newChatName = encodeURIComponent(newChatName);

      setChatName(newChatName);
      try {
        await rename(`chats/untitled.json`, `chats/${newChatName}.json`, {
          oldPathBaseDir: BaseDirectory.AppData,
          newPathBaseDir: BaseDirectory.AppData,
        });
      } catch (e: any) {
        console.error(e);
        errorToast("ERROR_NAMING");
        return;
      }
    }
  };

  const [editorHeight, setEditorHeight] = useState(0);
  useEffect(() => {
    const editorWrapper = editorWrapperRef.current;
    if (!editorWrapper) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        setEditorHeight(height);
      }
    });
    resizeObserver.observe(editorWrapper);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <ToastProvider>
      {messages.length === 0 ? (
        <div className="min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold">
            Select a model and ask anything!
          </h1>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 max-w-3xl mx-auto p-3"
          style={{
            marginBottom: `${editorHeight + 24}px`,
          }}
          ref={scrollableRef}
        >
          {messages.map((message) => (
            <div
              key={message.content}
              className={
                message.role === "user"
                  ? "self-end bg-gray-100 rounded-lg p-2"
                  : ""
              }
            >
              <MarkdownViewer markdown={message.content} />
            </div>
          ))}
        </div>
      )}

      <div
        className="fixed bottom-8 left-0 right-0 mx-auto w-full max-w-3xl px-3 gap-2 flex flex-col"
        ref={editorWrapperRef}
      >
        <div className="flex justify-between">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="max-w-40">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={sendMessage} variant="ghost" size="icon">
            <ArrowUpIcon />
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <MarkdownEditor {...markdownEditor} />
        </div>
      </div>
      <Toast />
    </ToastProvider>
  );
}

const ERROR_TITLES: Record<
  "ERROR_SAVING" | "ERROR_CONNECTING" | "ERROR_NAMING",
  string
> = {
  ERROR_SAVING: "Failed to save the chat.",
  ERROR_CONNECTING: "Failed to connect to the model.",
  ERROR_NAMING: "Failed to name the chat.",
};
function useErrorToast() {
  const { toast } = useToast();

  return (error: "ERROR_SAVING" | "ERROR_CONNECTING" | "ERROR_NAMING") => {
    const title = ERROR_TITLES[error];
    toast({
      title,
      variant: "destructive",
    });
  };
}
