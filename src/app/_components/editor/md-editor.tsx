"use client";
import React, { useEffect, useRef, useState } from "react";
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
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./md-editor.css";
import { PlainTextCodeEditorDescriptor } from "./code-block";

export default function MDEditor({
  initialValue,
  editorRef,
  onEnterKeyDown,
}: {
  initialValue: string;
  editorRef: React.RefObject<MDXEditorMethods>;
  onEnterKeyDown: () => void;
}) {
  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      const markdown = editorRef.current?.getMarkdown();
      if (event.metaKey && event.key === "Enter" && markdown) {
        onEnterKeyDown();
      }
    };
    document.addEventListener("keydown", handleEnter);
    return () => document.removeEventListener("keydown", handleEnter);
  }, [editorRef, onEnterKeyDown]);

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
          codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor],
        }),
      ]}
      markdown={initialValue}
      ref={editorRef}
      className="max-h-[500px] overflow-y-auto rounded-lg bg-gray-800 text-black"
    />
  );
}
