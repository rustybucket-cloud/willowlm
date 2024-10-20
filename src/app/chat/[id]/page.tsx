import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat-editor";
import { notFound } from "next/navigation";
import Chats from "./_components/chats";

export default async function Chat({ params }: { params: { id: string } }) {
  const { id } = params;

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
      <Chats chats={allChats} activeChatId={id} />
      <ChatEditor id={id} chat={chat} />
    </HydrateClient>
  );
}
