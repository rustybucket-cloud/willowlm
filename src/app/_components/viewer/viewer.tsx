import React from "react";
import Markdown from "react-markdown";
import CodeBlock from "./code-block";

export function Viewer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      components={{
        code(props) {
          const value = String(props.children).replace(/\n$/, "");
          // @ts-expect-error react-markdown types are outdated
          return <CodeBlock {...props} value={value} />;
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
