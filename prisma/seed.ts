import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cardiff = "Cardiff";

  const venue1 = await prisma.venue.upsert({
    where: { slug: "tramshed" },
    create: {
      name: "Tramshed",
      slug: "tramshed",
      city: cardiff,
      addressLine1: "Clare Road",
      postcode: "CF11 6QP",
    },
    update: {},
  });

  const venue2 = await prisma.venue.upsert({
    where: { slug: "clwb-ifor-bach" },
    create: {
      name: "Clwb Ifor Bach",
      slug: "clwb-ifor-bach",
      city: cardiff,
      addressLine1: "11 Womanby Street",
      postcode: "CF10 1BR",
    },
    update: {},
  });

  const artist1 = await prisma.artist.upsert({
    where: { slug: "local-band" },
    create: {
      name: "Local Band",
      slug: "local-band",
      genreTags: ["rock", "indie"],
    },
    update: {},
  });

  const artist2 = await prisma.artist.upsert({
    where: { slug: "cardiff-acts" },
    create: {
      name: "Cardiff Acts",
      slug: "cardiff-acts",
      genreTags: ["comedy", "music"],
    },
    update: {},
  });

  const promoter1 = await prisma.promoter.upsert({
    where: { slug: "cardiff-gigs" },
    create: {
      name: "Cardiff Gigs",
      slug: "cardiff-gigs",
      contactEmail: "hello@cardiffgigs.example",
    },
    update: {},
  });

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.event.upsert({
    where: { slug: "local-band-at-tramshed" },
    create: {
      title: "Local Band at Tramshed",
      slug: "local-band-at-tramshed",
      description: "An evening of live music.",
      startAt: nextWeek,
      endAt: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
      venueId: venue1.id,
      promoterId: promoter1.id,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      genreTags: ["rock", "indie", "music"],
      ageRestriction: "18+",
      tickets: {
        create: [
          { platform: "eventbrite", url: "https://example.com/tickets/1", priceText: "£15" },
        ],
      },
      artists: {
        create: [{ artistId: artist1.id, billingOrder: 0 }],
      },
    },
    update: {},
  });

  await prisma.event.upsert({
    where: { slug: "cardiff-acts-comedy-night" },
    create: {
      title: "Cardiff Acts Comedy Night",
      slug: "cardiff-acts-comedy-night",
      description: "Stand-up comedy.",
      startAt: inTwoWeeks,
      endAt: new Date(inTwoWeeks.getTime() + 2 * 60 * 60 * 1000),
      venueId: venue2.id,
      promoterId: promoter1.id,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      genreTags: ["comedy"],
      ageRestriction: "18+",
      tickets: {
        create: [
          { platform: "eventbrite", url: "https://example.com/tickets/2", priceText: "£12" },
        ],
      },
      artists: {
        create: [{ artistId: artist2.id, billingOrder: 0 }],
      },
    },
    update: {},
  });

  console.log("Seed complete: venues, artists, promoter, events created.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
