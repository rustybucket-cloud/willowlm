import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat";
import { notFound } from "next/navigation";
import Chats from "./_components/chats";
import { getServerAuthSession } from "~/server/auth";
import NavMenu from "~/components/nav-menu";
import ChatList from "./_components/chat-list";
import { Suspense } from "react";

export default async function Chat({ params }: { params: { id: string } }) {
  const { id } = params;

  void api.chat.getAll();

  const [session, chat] = await Promise.all([
    getServerAuthSession(),
    id !== "new" ? api.chat.getWithMessages({ id: parseInt(id) }) : null,
  ]);

  if (id !== "new" && chat == null) {
    return notFound();
  }

  return (
    <HydrateClient>
      {session ? <NavMenu session={session} /> : null}
      <Chats>
        <Suspense fallback={<div>Loading chats...</div>}>
          <ChatList activeChatId={id} />
        </Suspense>
      </Chats>
      <ChatEditor id={id} chat={chat} session={session} />
    </HydrateClient>
  );
}
