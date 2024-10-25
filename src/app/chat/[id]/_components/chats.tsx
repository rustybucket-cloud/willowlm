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
import { useState } from "react";

export default function Chats({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

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

        {children}
      </SheetContent>
    </Sheet>
  );
}
