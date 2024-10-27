import { api, HydrateClient } from "~/trpc/server";
import ChatEditor from "./_components/chat";
import { notFound } from "next/navigation";
import Chats from "./_components/chats";
import { getServerAuthSession } from "~/server/auth";
import NavMenu from "~/components/nav-menu";
import { showAnthropic, showGemini, showPerplexity } from "~/lib/flags";

export default async function Chat({ params }: { params: { id: string } }) {
  const { id } = params;

  const [
    session,
    chat,
    showAnthropicFlag,
    showGeminiFlag,
    showPerplexityFlag,
    chats,
  ] = await Promise.all([
    getServerAuthSession(),
    id !== "new" ? api.chat.getWithMessages({ id: parseInt(id) }) : null,
    showAnthropic(),
    showGemini(),
    showPerplexity(),
    api.chat.getAll(),
  ]);

  const flags = {
    showAnthropic: showAnthropicFlag,
    showGemini: showGeminiFlag,
    showPerplexity: showPerplexityFlag,
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
