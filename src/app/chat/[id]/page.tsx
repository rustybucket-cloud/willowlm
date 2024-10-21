import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat-editor";
import { notFound } from "next/navigation";
import Chats from "./_components/chats";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { getServerAuthSession } from "~/server/auth";
import { Button } from "~/components/ui/button";

export default async function Chat({ params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerAuthSession();

  let chat;
  if (id !== "new") {
    chat = await api.chat.getWithMessages({ id: parseInt(id) });
    if (chat == null) {
      return notFound();
    }
  }

  const allChats = await api.chat.getAll();

  return (
    <HydrateClient>
      <Menubar className="border-0">
        <MenubarMenu>
          <MenubarTrigger className="fixed right-2 top-2">
            {session?.user?.name}
          </MenubarTrigger>
          <MenubarContent className="relative right-2">
            <MenubarItem>
              <Link href="/api/auth/signout" className="h-full w-full">
                <Button variant="ghost" className="h-full w-full">
                  Logout
                </Button>
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Chats chats={allChats} activeChatId={id} />
      <ChatEditor id={id} chat={chat} />
    </HydrateClient>
  );
}
