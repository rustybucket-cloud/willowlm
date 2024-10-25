"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ClipboardCheck, Clipboard } from "lucide-react";
import { cn } from "~/lib/utils";
import Editor from "@monaco-editor/react";

interface CodeBlockProps {
  children: React.ReactNode;
  className: string;
  node: React.ReactNode;
}

export default function CodeBlock(props: CodeBlockProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, node, ...rest } = props;

  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");

  console.log(match);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const value = String(children).replace(/\n$/, "");
  const lineCount = value.split("\n").length;
  const lineHeight = 20;
  const maxHeight = 500;
  const height = Math.min(lineCount * lineHeight, maxHeight);

  return match ? (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10"
        onClick={copyToClipboard}
      >
        {copied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
      </Button>
      <Editor
        height={`${height}px`}
        language={match[1]}
        value={value}
        theme="vs-dark"
        options={{
          readOnly: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  ) : (
    <code {...rest} className={cn("rounded bg-gray-700 px-1", className)}>
      {children}
    </code>
  );
}
