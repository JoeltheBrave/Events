import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

/**
 * Eventbrite OAuth callback: exchange code for tokens, store in PlatformConnection.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=no_code", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
  const clientId = process.env.EVENTBRITE_CLIENT_ID;
  const clientSecret = process.env.EVENTBRITE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=config", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/eventbrite/callback`;
  const tokenRes = await fetch("https://www.eventbrite.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/dashboard/integrations?error=token", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
  const tokens = await tokenRes.json();
  const existing = await prisma.platformConnection.findFirst({
    where: { userId: session.user.id, platform: "eventbrite" },
  });
  const data = {
    accessTokenEncrypted: tokens.access_token,
    refreshTokenEncrypted: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    scope: tokens.scope ?? null,
  };
  if (existing) {
    await prisma.platformConnection.update({ where: { id: existing.id }, data });
  } else {
    await prisma.platformConnection.create({
      data: { userId: session.user.id, platform: "eventbrite", ...data },
    });
  }
  return NextResponse.redirect(new URL("/dashboard/integrations", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}
