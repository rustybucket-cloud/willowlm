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
import { Chat } from "~/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Chats({
  chats,
  activeChatId,
}: {
  chats: Chat[];
  activeChatId: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={(newOpen) => setIsOpen(newOpen)}>
      <SheetTrigger className="absolute left-2 top-2">
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
        {chats.map((chat) => (
          <Button
            key={chat.id}
            variant={Number(activeChatId) === chat.id ? "default" : "ghost"}
            className="flex w-full justify-start"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <Link href={`/chat/${chat.id}`} className="w-full text-start">
              {chat.name}
            </Link>
          </Button>
        ))}
      </SheetContent>
    </Sheet>
  );
}
