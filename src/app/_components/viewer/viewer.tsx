import React from "react";
import Markdown from "react-markdown";
import CodeBlock from "./code-block";

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
