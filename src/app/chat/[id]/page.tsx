import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat";
import { notFound } from "next/navigation";
import Chats from "./_components/chats";
import { getServerAuthSession } from "~/server/auth";
import NavMenu from "~/components/nav-menu";

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
      {session ? <NavMenu session={session} /> : null}
      <Chats chats={allChats} activeChatId={id} />
      <ChatEditor id={id} chat={chat} />
    </HydrateClient>
  );
}
