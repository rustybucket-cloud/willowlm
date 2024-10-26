import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function ChatList({
  activeChatId,
}: {
  activeChatId: string | null;
}) {
  const chats = await api.chat.getAll();

  return (
    <ul>
      {chats.map((chat) => (
        <li key={chat.id}>
          <Button
            variant={Number(activeChatId) === chat.id ? "default" : "ghost"}
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
  );
}
