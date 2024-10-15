import { useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import "../markdown.css";

type Props = {
  markdown: string;
};

export const MarkdownViewer = ({ markdown }: Props) => {
  return (
    <div className="md-wrapper">
      <Markdown
        components={{
          code(props) {
            return <CodeBlock {...props} />;
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};

function CodeBlock(props: any) {
  const { children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {match ? (
        <div className="relative">
          <button
            className={cn(
              "absolute top-4 right-4",
              copied ? "text-green-500" : "text-white"
            )}
            onClick={() => copyToClipboard(String(children))}
          >
            {copied ? <ClipboardCheck /> : <Clipboard />}
          </button>
          <SyntaxHighlighter
            {...rest}
            PreTag="div"
            children={String(children).replace(/\n$/, "")}
            language={match[1]}
            style={dark}
          />
        </div>
      ) : (
        <code
          {...rest}
          className={cn(
            className,
            "bg-gray-100 px-1 rounded",
            "dark:bg-gray-800"
          )}
        >
          {children}
        </code>
      )}
    </>
  );
}
