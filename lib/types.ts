export type CategorySlug = "music" | "comedy" | "theatre" | "family" | "other";

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string;
  address: string | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  doors_at: string | null;
  ticket_url: string | null;
  on_sale_at: string | null;
  category_id: string;
  venue_id: string;
  category?: Category;
  venue?: Venue;
  artists?: Artist[];
}

export interface EventWithRelations extends Event {
  category: Category;
  venue: Venue;
  artists: Artist[];
}
