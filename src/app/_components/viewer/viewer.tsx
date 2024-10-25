import React, { useState } from "react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "~/lib/utils";

export function Viewer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      children={markdown}
      components={{
        code(props) {
          return <CodeBlock {...props} />;
        },
      }}
    />
  );
}

function CodeBlock(props: any) {
  const { children, className, node, ...rest } = props;

  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return match ? (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={copyToClipboard}
      >
        {copied ? <ClipboardCheck className="text-green-500" /> : <Clipboard />}
      </Button>
      <SyntaxHighlighter
        language={match[1]}
        style={dark}
        children={String(children).replace(/\n$/, "")}
      />
    </div>
  ) : (
    <code {...rest} className={cn("rounded bg-gray-700 px-1", className)}>
      {children}
    </code>
  );
}
