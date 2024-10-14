import { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  MarkdownEditor,
  MarkdownViewer,
  useMarkdownEditor,
} from "./components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MenuIcon, PlusIcon } from "lucide-react";
import type { Message } from "./types";
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
  open,
  readDir,
  exists,
  mkdir,
  rename,
} from "@tauri-apps/plugin-fs";

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  streaming: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>("gpt-4o");
  const [chatName, setChatName] = useState<string>("untitled");
  const [files, setFiles] = useState<string[]>([]);
  const markdownEditor = useMarkdownEditor();
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const readFiles = async () => {
      const dirExists = await exists("chats", {
        baseDir: BaseDirectory.AppData,
      });
      if (!dirExists) {
        await mkdir("chats", {
          baseDir: BaseDirectory.AppData,
          recursive: true,
        });
      }

      const fs = await readDir("chats", {
        baseDir: BaseDirectory.AppData,
      });
      setFiles(fs.map((f) => f.name));
    };
    readFiles();
  }, []);

  const sendMessage = async () => {
    const content = markdownEditor.getMarkdown() || "";
    if (!content) return;

    let shouldNameFile = false;
    if (messages.length === 0) {
      shouldNameFile = true;
      const fs = await create("chats/untitled.md", {
        baseDir: BaseDirectory.AppData,
      });
      const newData = `# Untitled Chat\n\n--USER--\n\n${content}`;
      await fs.write(new TextEncoder().encode(newData));
    } else {
      const fs = await open(`chats/${chatName}.md`, {
        baseDir: BaseDirectory.AppData,
        append: true,
      });
      const newData = `\n\n--USER--\n\n${content}`;
      await fs.write(new TextEncoder().encode(newData));
    }

    setMessages([
      ...messages,
      { content, role: "user" },
      { content: "", role: "assistant" },
    ]);
    markdownEditor.setMarkdown("");

    const stream = await llm.stream([
      {
        role: "system",
        content: "Respond in markdown.",
      },
      {
        role: "user",
        content,
      },
    ]);

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
    console.log(chatName);
    const fs = await open(`chats/${chatName}.md`, {
      baseDir: BaseDirectory.AppData,
      append: true,
    });
    const newData = `\n\n--ASSISTANT--\n\n${newContent}`;
    await fs.write(new TextEncoder().encode(newData));

    if (shouldNameFile) {
      const response = await llm.invoke([
        ...(allMessages || []),
        {
          role: "system",
          content:
            "Create a short name for this chat based on the question and answer.",
        },
      ]);
      setChatName(response.content);
      await rename(`chats/untitled.md`, `chats/${response.content}.md`, {
        oldPathBaseDir: BaseDirectory.AppData,
        newPathBaseDir: BaseDirectory.AppData,
      });
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
    <>
      <Sheet>
        <SheetTrigger className="fixed top-3 left-3">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle>Chats</SheetTitle>
              <Button variant="ghost" size="icon">
                <PlusIcon />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <Button
                key={file}
                onClick={() => setChatName(file)}
                variant="ghost"
              >
                {file}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

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
    </>
  );
}

export default App;
