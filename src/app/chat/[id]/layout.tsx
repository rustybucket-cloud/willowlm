import React from "react";
import { Menu } from "lucide-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Menu className="fixed left-2 top-2 text-gray-500" />
      {children}
    </>
  );
}
