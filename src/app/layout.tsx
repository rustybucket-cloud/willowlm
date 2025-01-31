import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { VercelToolbar } from "@vercel/toolbar/next";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "WillowLM",
  description: "Use LLMs your way",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development";
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="dark">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}
