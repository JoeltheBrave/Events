import { NextResponse } from "next/server";
import { getPublicArtists } from "@/lib/public-data";

export async function GET() {
  const artists = await getPublicArtists(300);
  return NextResponse.json({ artists });
}
