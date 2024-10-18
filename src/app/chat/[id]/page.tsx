import { HydrateClient } from "~/trpc/server";

export default function Chat({ params }: { params: { id: string } }) {
  const { id } = params;
  console.log(id);

  return (
    <HydrateClient>
      <div>
        <h1>Chat</h1>
      </div>
    </HydrateClient>
  );
}
