"use client";

import React from "react";
import { cn } from "~/lib/utils";
import { Milkdown, useEditor, useInstance } from "@milkdown/react";
import { Crepe } from "@milkdown/crepe";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/nord-dark.css";
import { editorViewCtx, serializerCtx } from "@milkdown/kit/core";

import "./editor.css";

export function MilkdownEditor({ className }: { className?: string }) {
  useEditor((root) => {
    return new Crepe({
      root,
      defaultValue: "",
    }).editor;
  });

  return (
    <div className={cn("md-container", className)}>
      <Milkdown />
    </div>
  );
}

export function useMilkdownEditor() {
  const [loading, getEditor] = useInstance();

  const getMarkdown = React.useCallback((): string | undefined => {
    const editor = getEditor();
    if (!editor) return;

    return editor.action((ctx) => {
      const editorView = ctx.get(editorViewCtx);
      const serializer = ctx.get(serializerCtx);
      return serializer(editorView.state.doc);
    });
  }, [getEditor]);

  const reset = React.useCallback(async () => {
    const editor = getEditor();
    if (!editor) return;
    await editor.create(); // deletes and recreates the editor
  }, [getEditor]);

  return { loading, getMarkdown, reset };
}
