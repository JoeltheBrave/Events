import type { Metadata } from "next";
import "./global.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Cardiff Gig Guide — Live music, comedy, theatre",
  description:
    "Find gigs, shows and events in Cardiff. Your clean guide to what's on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
