import React from "react";
import NavMenu from "~/components/nav-menu";
import { getServerAuthSession } from "~/server/auth";

export default async function Dashboard() {
  const session = await getServerAuthSession();
  return (
    <>
      {session ? <NavMenu session={session} /> : null}
      <div>Dashboard</div>
    </>
  );
}
