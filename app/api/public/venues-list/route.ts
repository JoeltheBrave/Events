import { NextResponse } from "next/server";
import { getPublicVenues } from "@/lib/public-data";

export async function GET() {
  const venues = await getPublicVenues(300);
  return NextResponse.json({ venues });
}
