"use client";

import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { ArrowUp } from "lucide-react";
import { MODELS } from "~/lib/models";
import type { Model } from "~/types";
import MDEditor from "~/app/_components/editor/md-editor";
import { type MDXEditorMethods } from "@mdxeditor/editor";

export default function ChatEditor({
  onSubmit = () => null,
  flags,
}: {
  onSubmit?: (input: string, model: Model) => void;
  flags: {
    showAnthropic: boolean;
    showGemini: boolean;
  };
}) {
  const [model, setModel] = useState<Model>("gpt-4o");

  const editorRef = useRef<MDXEditorMethods>(null);

  const sendChat = async () => {
    if (!editorRef.current) return;

    const markdown = editorRef.current.getMarkdown();
    if (!markdown) return;

    editorRef.current.setMarkdown("");

    onSubmit(markdown, model);
  };

  const updateModel = (value: string) => {
    if (!MODELS.includes(value as Model)) {
      throw new Error(`Invalid model: ${value}`);
    }
    setModel(value as Model);
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 mx-auto flex max-w-4xl flex-col gap-4 px-4">
      <div className="flex justify-between">
        <Select defaultValue={model} onValueChange={updateModel}>
          <SelectTrigger className="max-w-48">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>OpenAI</SelectLabel>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4o-turbo">GPT-4o Turbo</SelectItem>
              <SelectItem value="o1-preview">O1 Preview</SelectItem>
              <SelectItem value="o1-mini">O1 Mini</SelectItem>
            </SelectGroup>
            {flags.showAnthropic ? (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Anthropic</SelectLabel>
                  <SelectItem value="claude-3-5-sonnet">
                    Claude 3.5 Sonnet
                  </SelectItem>
                </SelectGroup>
              </>
            ) : null}
            {flags.showGemini ? (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Google</SelectLabel>
                  <SelectItem value="gemini-1.5-flash">
                    Gemini 1.5 Flash
                  </SelectItem>
                </SelectGroup>
              </>
            ) : null}
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Perplexity</SelectLabel>
              <SelectItem value="llama-3.1-sonar-large-128k-chat">
                Llama Sonar Large
              </SelectItem>
              <SelectItem value="llama-3.1-sonar-small-128k-chat">
                Llama Sonar Small
              </SelectItem>
              <SelectItem value="llama-3.1-8b-instruct">
                Llama 8B Instruct
              </SelectItem>
              <SelectItem value="llama-3.1-70b-instruct">
                Llama 70B Instruct
              </SelectItem>
              <SelectItem value="llama-3.1-sonar-huge-128k-online">
                Llama Sonar Huge Online
              </SelectItem>
              <SelectItem value="llama-3.1-sonar-large-128k-online">
                Llama Sonar Large Online
              </SelectItem>
              <SelectItem value="llama-3.1-sonar-small-128k-online">
                Llama Sonar Small Online
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={sendChat} className="bg-background">
          <ArrowUp />
        </Button>
      </div>
      <MDEditor initialValue={""} editorRef={editorRef} />
    </div>
  );
}
