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
      components={{
        code(props) {
          // @ts-expect-error react-markdown types are outdated
          return <CodeBlock {...props} />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}

interface CodeBlockProps {
  children: React.ReactNode;
  className: string;
  node: React.ReactNode;
}

function CodeBlock(props: CodeBlockProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, node, ...rest } = props;

  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(String(children));
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
      <SyntaxHighlighter language={match[1]} style={dark}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...rest} className={cn("rounded bg-gray-700 px-1", className)}>
      {children}
    </code>
  );
}
