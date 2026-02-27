import type { Metadata } from "next";
import "./global.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Events — Live music, comedy, theatre across the UK",
  description:
    "Find concerts, gigs, comedy, theatre and shows across the UK. Your clean guide to what’s on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
