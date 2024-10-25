import React from "react";
import { LoaderCircle } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin" />
    </div>
  );
}
