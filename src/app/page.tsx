import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session) {
    return redirect("/chat/new");
  }

  return (
    <HydrateClient>
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold">WillowLM</h1>
        <Link href="/api/auth/signin">Login</Link>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold">WillowLM</h1>
        <p className="text-lg">Use LLMs your way</p>
      </main>
    </HydrateClient>
  );
}
