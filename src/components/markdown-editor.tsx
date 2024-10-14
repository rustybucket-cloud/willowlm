import { useRef, useCallback } from "react";
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  codeBlockPlugin,
  sandpackPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
  SandpackConfig,
  BlockTypeSelect,
  CodeToggle,
  InsertCodeBlock,
  InsertTable,
  UndoRedo,
  CreateLink,
  InsertThematicBreak,
  ListsToggle,
  BoldItalicUnderlineToggles,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import "./markdown.css";

const simpleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
    },
  ],
};

type Props = {
  initialMarkdown?: string;
} & UseMarkdowEditorReturn;

export const MarkdownEditor = ({ initialMarkdown = "", editorRef }: Props) => {
  return (
    <div className="shadow-lg rounded md-wrapper bg-gray-100">
      <MDXEditor
        ref={editorRef}
        markdown={initialMarkdown}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
          thematicBreakPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
          sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
          codeMirrorPlugin({
            codeBlockLanguages: { js: "JavaScript", css: "CSS" },
          }),
          toolbarPlugin({
            toolbarContents() {
              return (
                <>
                  <UndoRedo />
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <ListsToggle />
                  <CodeToggle />
                  <InsertCodeBlock />
                  <InsertTable />
                  <CreateLink />
                  <InsertThematicBreak />
                </>
              );
            },
          }),
        ]}
      />
    </div>
  );
};

export type UseMarkdowEditorReturn = {
  editorRef: React.RefObject<MDXEditorMethods>;
  getMarkdown: () => string | undefined;
  setMarkdown: (markdown: string) => void;
};

export function useMarkdownEditor(): UseMarkdowEditorReturn {
  const editorRef = useRef<MDXEditorMethods | null>(null);

  const getMarkdown = useCallback(() => {
    return editorRef.current?.getMarkdown();
  }, []);

  const setMarkdown = useCallback((markdown: string) => {
    editorRef.current?.setMarkdown(markdown);
  }, []);

  return { editorRef, getMarkdown, setMarkdown };
}
