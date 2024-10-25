"use client";
import React from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  BlockTypeSelect,
  InsertCodeBlock,
  codeBlockPlugin,
  sandpackPlugin,
  codeMirrorPlugin,
  type SandpackConfig,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./md-editor.css";
import PlainTextCodeEditorDescriptor from "./code-block";

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

export default function MDEditor({
  initialValue,
  editorRef,
}: {
  initialValue: string;
  editorRef: React.RefObject<MDXEditorMethods>;
}) {
  return (
    <MDXEditor
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <InsertCodeBlock />
            </>
          ),
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin({
          // defaultCodeBlockLanguage: "js",
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
        }),
        // sandpackPlugin({ sandpackConfig: simpleSandpackConfig }),
        // codeMirrorPlugin({
        //   codeBlockLanguages: {
        //     js: "JavaScript",
        //     css: "CSS",
        //     ts: "TypeScript",
        //     py: "Python",
        //     json: "JSON",
        //     html: "HTML",
        //     yaml: "YAML",
        //     bash: "Bash",
        //     php: "PHP",
        //     md: "Markdown",
        //     rb: "Ruby",
        //     rs: "Rust",
        //     go: "Go",
        //     java: "Java",
        //     kt: "Kotlin",
        //     c: "C",
        //     cpp: "C++",
        //     cs: "C#",
        //     swift: "Swift",
        //   },
        // }),
      ]}
      markdown={initialValue}
      ref={editorRef}
      className="max-h-[500px] overflow-y-auto rounded-lg bg-gray-800 text-black"
    />
  );
}
