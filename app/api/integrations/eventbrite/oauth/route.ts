import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
  const clientId = process.env.EVENTBRITE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Eventbrite not configured" }, { status: 503 });
  }
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const redirectUri = `${base}/api/integrations/eventbrite/callback`;
  const scope = "event:read";
  const url = `https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  return NextResponse.redirect(url);
}
