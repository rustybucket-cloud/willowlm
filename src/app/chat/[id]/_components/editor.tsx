"use client";

import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { ArrowUp } from "lucide-react";
import { MODELS } from "~/lib/models";
import type { Model } from "~/types";
import MDEditor from "~/app/_components/editor/md-editor";
import { type MDXEditorMethods } from "@mdxeditor/editor";
export default function ChatEditor({
  onSubmit = () => null,
}: {
  onSubmit?: (input: string, model: Model) => void;
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
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4o-turbo">GPT-4o Turbo</SelectItem>
            <SelectItem value="o1-preview">O1 Preview</SelectItem>
            <SelectItem value="o1-mini">O1 Mini</SelectItem>
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
