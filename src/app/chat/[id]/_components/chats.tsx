"use client";
import { Menu, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { useChatStore } from "../stores/chatStore";
import { Chat } from "~/types";

export default function Chats({
  chats: initialChats,
  activeChatId,
}: {
  chats: Chat[];
  activeChatId: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // const chats = useChatStore((state) => state.chats);
  const { chats, setChats } = useChatStore();
  console.log("chats", chats);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  return (
    <Sheet open={isOpen} onOpenChange={(newOpen) => setIsOpen(newOpen)}>
      <SheetTrigger className="fixed left-2 top-2">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle>Chats</SheetTitle>
            <Link href="/chat/new">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <Plus />
              </Button>
            </Link>
          </div>
        </SheetHeader>

        <div className="h-[calc(100dvh-4rem)] overflow-y-auto">
          <ul>
            {chats.map((chat) => (
              <li key={chat.id}>
                <Button
                  variant={
                    Number(activeChatId) === chat.id ? "default" : "ghost"
                  }
                  className="flex w-full justify-start"
                >
                  <Link
                    href={`/chat/${chat.id}`}
                    className="w-[calc(100%-4px)] truncate text-start"
                  >
                    {chat.name}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
