import { useState, useRef } from "react";
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

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  streaming: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [model, setModel] = useState<string>("gpt-4o");
  const markdownEditor = useMarkdownEditor();
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    const content = markdownEditor.getMarkdown() || "";
    if (!content) return;
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

    let newContent = "";
    for await (const chunk of stream) {
      newContent += chunk.content;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = newContent;
        return newMessages;
      });
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger className="fixed top-3 left-3">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <p>Chat</p>
              <Button variant="ghost" size="icon">
                <PlusIcon />
              </Button>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {messages.length === 0 ? (
        <div className="min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold">
            Select a model and ask anything!
          </h1>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-3xl mx-auto p-3 mb-48">
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
