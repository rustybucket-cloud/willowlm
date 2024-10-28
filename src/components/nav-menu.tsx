import React from "react";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar";
import { Button } from "./ui/button";
import { type Session } from "next-auth";

export default function NavMenu({ session }: { session: Session }) {
  return (
    <Menubar className="border-0">
      <MenubarMenu>
        <MenubarTrigger className="fixed right-2 top-2 z-10 bg-background">
          {session?.user?.name}
        </MenubarTrigger>
        <MenubarContent className="relative right-2">
          <MenubarItem>
            <Link href="/dashboard" className="h-full w-full">
              <Button
                variant="ghost"
                className="flex h-full w-full items-center justify-start"
              >
                Dashboard
              </Button>
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/api/auth/signout" className="h-full w-full">
              <Button
                variant="ghost"
                className="flex h-full w-full items-center justify-start"
              >
                Logout
              </Button>
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
