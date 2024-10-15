import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => null,
  loader: () => {
    throw redirect({ to: "/$chatName", params: { chatName: "new" } });
  },
});
