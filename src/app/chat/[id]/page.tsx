import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat";
import { notFound, redirect } from "next/navigation";
import Chats from "./_components/chats";
import { getServerAuthSession } from "~/server/auth";
import NavMenu from "~/components/nav-menu";
import { showGemini } from "~/lib/flags";

export default async function Chat({ params }: { params: { id: string } }) {
  const { id } = params;

  const session = await getServerAuthSession();
  if (!session) {
    return redirect("/");
  }

  const [chat, showGeminiFlag, chats] = await Promise.all([
    id !== "new" ? api.chat.getWithMessages({ id: parseInt(id) }) : null,
    showGemini(),
    api.chat.getAll(),
  ]);

  const flags = {
    showGemini: showGeminiFlag,
  };

  if (id !== "new" && chat == null) {
    return notFound();
  }

  return (
    <HydrateClient>
      {session ? <NavMenu session={session} /> : null}
      <Chats chats={chats} activeChatId={id} />
      <ChatEditor id={id} chat={chat} session={session} flags={flags} />
    </HydrateClient>
  );
}
