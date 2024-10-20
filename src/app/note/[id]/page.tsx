"use client";
import { useEffect, useRef } from "react";
import { MilkdownProvider } from "@milkdown/react";
import { MilkdownEditor } from "~/app/_components/editor/editor";

import "./note.css";

export default function NotePage({ params }: { params: { id: string } }) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.value = params.id === "new" ? "Untitled" : "";
    }
  }, [params.id]);

  return (
    <MilkdownProvider>
      <div className="mx-auto max-w-screen-xl">
        <input
          type="text"
          className="bg-background text-foreground w-full border-none p-3 text-4xl font-bold ring-0 focus:border-none focus:outline-none focus:ring-0"
          ref={titleRef}
        />
        <MilkdownEditor className="h-screen" />
      </div>
    </MilkdownProvider>
  );
}
