import { supabase } from "@/lib/supabase";
import type { EventWithRelations, Artist, Venue, Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as Category[];
}

export async function getEvents(options?: {
  category?: string;
  city?: string;
  from?: string;
  limit?: number;
}): Promise<EventWithRelations[]> {
  if (!supabase) return [];
  let q = supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .gte("event_date", options?.from ?? new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(options?.limit ?? 50);

  if (options?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .single();
    if (cat) q = q.eq("category_id", cat.id);
  }
  if (options?.city) {
    const { data: venues } = await supabase
      .from("venues")
      .select("id")
      .ilike("city", options.city);
    const ids = venues?.map((v) => v.id) ?? [];
    if (ids.length) q = q.in("venue_id", ids);
  }

  const { data } = await q;
  return (data ?? []).map((row) => normalizeEvent(row) as unknown as EventWithRelations);
}

export async function getEventBySlug(slug: string): Promise<EventWithRelations | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .eq("slug", slug)
    .single();
  if (!data) return null;
  return normalizeEvent(data) as unknown as EventWithRelations;
}

export async function getOnSaleSoon(limit = 10): Promise<EventWithRelations[]> {
  if (!supabase) return [];
  const now = new Date().toISOString();
  const week = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .gte("event_date", now)
    .not("on_sale_at", "is", null)
    .gte("on_sale_at", now)
    .lte("on_sale_at", week)
    .order("on_sale_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map((row) => normalizeEvent(row) as unknown as EventWithRelations);
}

export async function getFeaturedByCategory(
  categorySlug: string,
  limit = 8
): Promise<EventWithRelations[]> {
  if (!supabase) return [];
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();
  if (!cat) return [];
  const { data } = await supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .eq("category_id", cat.id)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  return (data ?? []).map((row) => normalizeEvent(row) as unknown as EventWithRelations);
}

export async function getArtists(limit = 100): Promise<Artist[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("artists")
    .select("id, name, slug, image_url")
    .order("name")
    .limit(limit);
  return (data ?? []) as Artist[];
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("artists").select("*").eq("slug", slug).single();
  return data as Artist | null;
}

export async function getArtistEvents(artistSlug: string): Promise<EventWithRelations[]> {
  if (!supabase) return [];
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", artistSlug)
    .single();
  if (!artist) return [];
  const { data: ea } = await supabase
    .from("event_artists")
    .select("event_id")
    .eq("artist_id", artist.id);
  const eventIds = ea?.map((e) => e.event_id) ?? [];
  if (!eventIds.length) return [];
  const { data } = await supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .in("id", eventIds)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });
  return (data ?? []).map((row) => normalizeEvent(row) as unknown as EventWithRelations);
}

export async function getVenues(limit = 200): Promise<Venue[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("venues")
    .select("*")
    .order("region")
    .order("city")
    .order("name")
    .limit(limit);
  return (data ?? []) as Venue[];
}

export async function getVenueBySlug(slug: string, city?: string): Promise<Venue | null> {
  if (!supabase) return null;
  let q = supabase.from("venues").select("*").eq("slug", slug);
  if (city) q = q.eq("city", city);
  const { data } = await q.limit(1).maybeSingle();
  return data as Venue | null;
}

export async function getVenueEvents(venueId: string, limit = 30): Promise<EventWithRelations[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("events")
    .select(
      "*, category:categories(*), venue:venues(*), event_artists(artist:artists(*))"
    )
    .eq("venue_id", venueId)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(limit);
  return (data ?? []).map((row) => normalizeEvent(row) as unknown as EventWithRelations);
}

export async function getCities(): Promise<{ city: string; region: string }[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("venues")
    .select("city, region")
    .order("region")
    .order("city");
  const seen = new Set<string>();
  const out: { city: string; region: string }[] = [];
  for (const row of data ?? []) {
    const key = `${row.region}|${row.city}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ city: row.city, region: row.region });
    }
  }
  return out;
}

function normalizeEvent(row: Record<string, unknown>): Record<string, unknown> {
  const artists = (row.event_artists as { artist: unknown }[] | null)?.map(
    (ea) => ea.artist
  );
  const { event_artists: _, ...rest } = row;
  return { ...rest, artists: artists ?? [] };
}
