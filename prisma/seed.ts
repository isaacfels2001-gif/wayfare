import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;
const img = (seed: string, w = 900, h = 560) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * DAY_MS);
}

async function seedUsers() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const customerPassword = await bcrypt.hash("Traveler123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ota-demo.test" },
    update: {},
    create: {
      name: "Ava Administrator",
      email: "admin@ota-demo.test",
      passwordHash: adminPassword,
      role: "admin",
      currency: "USD",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@ota-demo.test" },
    update: {},
    create: {
      name: "Jordan Traveler",
      email: "customer@ota-demo.test",
      passwordHash: customerPassword,
      role: "customer",
      currency: "USD",
    },
  });

  console.log(`Seeded users: admin=${admin.email} customer=${customer.email}`);
}

async function seedFxRates() {
  const rates = [
    { code: "USD", name: "US Dollar", symbol: "$", rateToUsd: 1 },
    { code: "EUR", name: "Euro", symbol: "€", rateToUsd: 0.92 },
    { code: "GBP", name: "British Pound", symbol: "£", rateToUsd: 0.79 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToUsd: 155.4 },
  ];
  for (const rate of rates) {
    await prisma.fxRate.upsert({ where: { code: rate.code }, update: rate, create: rate });
  }
  console.log(`Seeded ${rates.length} FX rates`);
}

const AIRLINES = [
  { code: "AA", name: "American Airlines" },
  { code: "DL", name: "Delta Air Lines" },
  { code: "UA", name: "United Airlines" },
  { code: "BA", name: "British Airways" },
  { code: "B6", name: "JetBlue" },
];

interface RouteDef {
  o: string;
  oc: string;
  d: string;
  dc: string;
  durationMinutes: number;
  aircraft: string;
  economyBaseCents: number;
  longHaul: boolean;
}

const ROUTES: RouteDef[] = [
  { o: "JFK", oc: "New York", d: "LAX", dc: "Los Angeles", durationMinutes: 375, aircraft: "Boeing 737-900", economyBaseCents: 24900, longHaul: false },
  { o: "LAX", oc: "Los Angeles", d: "JFK", dc: "New York", durationMinutes: 330, aircraft: "Boeing 737-900", economyBaseCents: 25900, longHaul: false },
  { o: "JFK", oc: "New York", d: "LHR", dc: "London", durationMinutes: 435, aircraft: "Boeing 787-9", economyBaseCents: 52900, longHaul: true },
  { o: "LHR", oc: "London", d: "JFK", dc: "New York", durationMinutes: 495, aircraft: "Boeing 787-9", economyBaseCents: 54900, longHaul: true },
  { o: "SFO", oc: "San Francisco", d: "NRT", dc: "Tokyo", durationMinutes: 655, aircraft: "Boeing 777-300ER", economyBaseCents: 79900, longHaul: true },
  { o: "NRT", oc: "Tokyo", d: "SFO", dc: "San Francisco", durationMinutes: 575, aircraft: "Boeing 777-300ER", economyBaseCents: 82900, longHaul: true },
  { o: "JFK", oc: "New York", d: "MIA", dc: "Miami", durationMinutes: 195, aircraft: "Airbus A320", economyBaseCents: 16900, longHaul: false },
  { o: "MIA", oc: "Miami", d: "JFK", dc: "New York", durationMinutes: 180, aircraft: "Airbus A320", economyBaseCents: 17900, longHaul: false },
];

async function seedFlights() {
  await prisma.fareOption.deleteMany({});
  await prisma.flight.deleteMany({});

  const today = new Date();
  const horizonDays = 45;
  let flightCount = 0;
  let fareCount = 0;

  for (const route of ROUTES) {
    for (let dayOffset = 1; dayOffset <= horizonDays; dayOffset++) {
      const departureDay = addDays(today, dayOffset);
      const slots = [{ hour: 8, airlineIdx: (dayOffset + 0) % AIRLINES.length }, { hour: 18, airlineIdx: (dayOffset + 2) % AIRLINES.length }];

      for (const slot of slots) {
        const airline = AIRLINES[slot.airlineIdx];
        const departAt = new Date(
          Date.UTC(departureDay.getUTCFullYear(), departureDay.getUTCMonth(), departureDay.getUTCDate(), slot.hour, 0, 0)
        );
        const arriveAt = new Date(departAt.getTime() + route.durationMinutes * 60 * 1000);
        const flightNumber = `${airline.code}${100 + ((dayOffset * 7 + slot.hour) % 900)}`;
        const priceJitter = 1 + (((dayOffset * 13) % 10) - 5) / 100; // +/-5% so prices aren't identical every day

        const flight = await prisma.flight.create({
          data: {
            flightNumber,
            airline: airline.name,
            airlineCode: airline.code,
            originCode: route.o,
            originCity: route.oc,
            destinationCode: route.d,
            destinationCity: route.dc,
            departAt,
            arriveAt,
            durationMinutes: route.durationMinutes,
            stops: 0,
            aircraft: route.aircraft,
          },
        });
        flightCount++;

        const economyPrice = Math.round(route.economyBaseCents * priceJitter);
        const fares = [
          {
            flightId: flight.id,
            cabin: "economy",
            priceUsdCents: economyPrice,
            seatsAvailable: 24 + (dayOffset % 6),
            baggageAllowance: "1 carry-on, 1 checked bag (23kg)",
            refundable: false,
          },
          {
            flightId: flight.id,
            cabin: "business",
            priceUsdCents: Math.round(economyPrice * (route.longHaul ? 3.4 : 2.6)),
            seatsAvailable: 6 + (dayOffset % 3),
            baggageAllowance: "2 carry-on, 2 checked bags (32kg)",
            refundable: true,
          },
        ];
        if (route.longHaul && dayOffset % 3 === 0) {
          fares.push({
            flightId: flight.id,
            cabin: "first",
            priceUsdCents: Math.round(economyPrice * 5.2),
            seatsAvailable: 2,
            baggageAllowance: "3 carry-on, 3 checked bags (32kg)",
            refundable: true,
          });
        }
        await prisma.fareOption.createMany({ data: fares });
        fareCount += fares.length;
      }
    }
  }
  console.log(`Seeded ${flightCount} flights with ${fareCount} fare options across ${ROUTES.length} routes`);
}

const HOTELS = [
  {
    name: "The Meridian New York",
    city: "New York",
    country: "USA",
    address: "350 5th Ave, New York, NY",
    starRating: 5,
    reviewScore: 4.7,
    reviewCount: 2140,
    amenities: ["Free WiFi", "Rooftop Bar", "Fitness Center", "Spa", "Concierge", "Pet Friendly"],
    description: "A landmark Midtown hotel steps from Fifth Avenue shopping, with skyline views and a celebrated rooftop bar.",
  },
  {
    name: "Harborview Inn NYC",
    city: "New York",
    country: "USA",
    address: "88 South St, New York, NY",
    starRating: 3,
    reviewScore: 4.1,
    reviewCount: 860,
    amenities: ["Free WiFi", "Breakfast Included", "24-hour Front Desk"],
    description: "A comfortable, budget-friendly base near the Seaport with easy subway access to the whole city.",
  },
  {
    name: "Sunset Boulevard Suites",
    city: "Los Angeles",
    country: "USA",
    address: "7080 Sunset Blvd, Los Angeles, CA",
    starRating: 4,
    reviewScore: 4.4,
    reviewCount: 1310,
    amenities: ["Free WiFi", "Pool", "Fitness Center", "Valet Parking", "Bar"],
    description: "Modern all-suite hotel in the heart of Hollywood, with a rooftop pool and easy access to studio tours.",
  },
  {
    name: "Santa Monica Pier Hotel",
    city: "Los Angeles",
    country: "USA",
    address: "101 Ocean Ave, Santa Monica, CA",
    starRating: 4,
    reviewScore: 4.6,
    reviewCount: 990,
    amenities: ["Free WiFi", "Beach Access", "Pool", "Bike Rentals"],
    description: "Steps from the pier and the beach, with bright rooms and an easygoing California feel.",
  },
  {
    name: "The Kensington Townhouse",
    city: "London",
    country: "United Kingdom",
    address: "24 Kensington High St, London",
    starRating: 5,
    reviewScore: 4.8,
    reviewCount: 1750,
    amenities: ["Free WiFi", "Afternoon Tea", "Concierge", "Spa", "Bar"],
    description: "An elegant townhouse hotel moments from Kensington Gardens and the museum district.",
  },
  {
    name: "Shoreditch Loft Hotel",
    city: "London",
    country: "United Kingdom",
    address: "12 Redchurch St, London",
    starRating: 3,
    reviewScore: 4.2,
    reviewCount: 640,
    amenities: ["Free WiFi", "Rooftop Bar", "Bike Rentals"],
    description: "Industrial-chic rooms in the middle of East London's gallery and nightlife scene.",
  },
  {
    name: "Shinjuku Sky Hotel",
    city: "Tokyo",
    country: "Japan",
    address: "2-7-1 Nishi-Shinjuku, Tokyo",
    starRating: 4,
    reviewScore: 4.6,
    reviewCount: 2010,
    amenities: ["Free WiFi", "Onsen Bath", "Restaurant", "Fitness Center"],
    description: "High-rise comfort above Shinjuku Station with panoramic city views and an on-site onsen bath.",
  },
  {
    name: "Asakusa Riverside Ryokan",
    city: "Tokyo",
    country: "Japan",
    address: "3-1-14 Asakusa, Tokyo",
    starRating: 3,
    reviewScore: 4.5,
    reviewCount: 505,
    amenities: ["Free WiFi", "Tatami Rooms", "Breakfast Included"],
    description: "A traditional-style ryokan near Senso-ji Temple, blending tatami comfort with modern conveniences.",
  },
  {
    name: "South Beach Art Deco Resort",
    city: "Miami",
    country: "USA",
    address: "1500 Ocean Dr, Miami Beach, FL",
    starRating: 4,
    reviewScore: 4.5,
    reviewCount: 1420,
    amenities: ["Free WiFi", "Beachfront", "Pool", "Bar", "Spa"],
    description: "A restored Art Deco icon right on Ocean Drive, with a beach club and poolside DJ sets.",
  },
  {
    name: "Left Bank Boutique Hotel",
    city: "Paris",
    country: "France",
    address: "15 Rue de Seine, Paris",
    starRating: 4,
    reviewScore: 4.7,
    reviewCount: 980,
    amenities: ["Free WiFi", "Breakfast Included", "Concierge"],
    description: "A charming boutique stay on the Left Bank, an easy walk from the Louvre and Saint-Germain cafes.",
  },
];

async function seedHotels() {
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});

  let hotelCount = 0;
  let roomCount = 0;

  for (const h of HOTELS) {
    const hotel = await prisma.hotel.create({
      data: {
        name: h.name,
        description: h.description,
        city: h.city,
        country: h.country,
        address: h.address,
        starRating: h.starRating,
        reviewScore: h.reviewScore,
        reviewCount: h.reviewCount,
        amenitiesCsv: h.amenities.join(","),
        imagesCsv: [img(`${h.name}-1`), img(`${h.name}-2`), img(`${h.name}-3`)].join(","),
      },
    });
    hotelCount++;

    const basePrice = 80 + h.starRating * 45;
    const rooms = [
      {
        hotelId: hotel.id,
        name: "Standard Queen Room",
        description: "A comfortable room with a queen bed, city or courtyard view.",
        maxOccupancy: 2,
        bedType: "1 Queen Bed",
        pricePerNightCents: basePrice * 100,
        totalRooms: 12,
        amenitiesCsv: "Free WiFi,Air Conditioning,Flat-screen TV",
      },
      {
        hotelId: hotel.id,
        name: "Deluxe King Room",
        description: "A spacious room with a king bed and upgraded views.",
        maxOccupancy: 2,
        bedType: "1 King Bed",
        pricePerNightCents: Math.round(basePrice * 1.35) * 100,
        totalRooms: 8,
        amenitiesCsv: "Free WiFi,Air Conditioning,Minibar,Bathrobe",
      },
      {
        hotelId: hotel.id,
        name: "Family Suite",
        description: "A two-room suite that comfortably sleeps a family of four.",
        maxOccupancy: 4,
        bedType: "1 King Bed + Sofa Bed",
        pricePerNightCents: Math.round(basePrice * 1.9) * 100,
        totalRooms: 5,
        amenitiesCsv: "Free WiFi,Air Conditioning,Kitchenette,Extra Space",
      },
    ];
    await prisma.room.createMany({ data: rooms });
    roomCount += rooms.length;
  }
  console.log(`Seeded ${hotelCount} hotels with ${roomCount} room types`);
}

const TOURS = [
  {
    slug: "tokyo-highlights-5-day",
    title: "Tokyo Highlights",
    summary: "Temples, teamLab digital art, Tsukiji food tours, and a day trip to Mt. Fuji.",
    destination: "Tokyo, Japan",
    durationDays: 5,
    basePriceCents: 189900,
    maxGroupSize: 14,
    difficulty: "easy",
    included: ["4 nights hotel", "Daily breakfast", "Airport transfers", "Guided city tour", "Mt. Fuji day trip"],
    itinerary: [
      { day: 1, title: "Arrival & Shinjuku", description: "Airport pickup, evening at leisure in Shinjuku." },
      { day: 2, title: "Asakusa & Tsukiji", description: "Senso-ji Temple, Tsukiji Outer Market food tour." },
      { day: 3, title: "teamLab & Shibuya", description: "teamLab Planets digital art museum, Shibuya Crossing." },
      { day: 4, title: "Mt. Fuji Day Trip", description: "Scenic bus tour to the Fuji Five Lakes region." },
      { day: 5, title: "Departure", description: "Free morning, airport transfer." },
    ],
  },
  {
    slug: "paris-in-style-4-day",
    title: "Paris in Style",
    summary: "Louvre skip-the-line access, a Seine dinner cruise, and Montmartre wandering.",
    destination: "Paris, France",
    durationDays: 4,
    basePriceCents: 154900,
    maxGroupSize: 16,
    difficulty: "easy",
    included: ["3 nights hotel", "Daily breakfast", "Louvre skip-the-line tickets", "Seine dinner cruise"],
    itinerary: [
      { day: 1, title: "Arrival & Eiffel Tower", description: "Check in, evening at the Eiffel Tower and Champ de Mars." },
      { day: 2, title: "The Louvre", description: "Guided skip-the-line tour of the Louvre's highlights." },
      { day: 3, title: "Montmartre & Seine Cruise", description: "Sacre-Coeur, artist square, evening dinner cruise." },
      { day: 4, title: "Departure", description: "Free morning for last-minute shopping." },
    ],
  },
  {
    slug: "grand-canyon-adventure-3-day",
    title: "Grand Canyon Adventure",
    summary: "South Rim hiking, a sunset viewpoint tour, and a stargazing evening.",
    destination: "Arizona, USA",
    durationDays: 3,
    basePriceCents: 99900,
    maxGroupSize: 12,
    difficulty: "moderate",
    included: ["2 nights lodge", "All meals", "Park entrance fees", "Guided hikes"],
    itinerary: [
      { day: 1, title: "Arrival & Rim Trail", description: "Check in, easy sunset walk along the Rim Trail." },
      { day: 2, title: "South Kaibab Hike", description: "Guided morning hike, afternoon stargazing prep and talk." },
      { day: 3, title: "Desert View & Departure", description: "Desert View Watchtower stop, transfer to airport." },
    ],
  },
  {
    slug: "italian-coast-escape-6-day",
    title: "Italian Coast Escape",
    summary: "Amalfi Coast villages, a Capri boat day, and hands-on pasta making in Naples.",
    destination: "Amalfi Coast, Italy",
    durationDays: 6,
    basePriceCents: 249900,
    maxGroupSize: 10,
    difficulty: "easy",
    included: ["5 nights hotel", "Daily breakfast", "Capri boat tour", "Pasta-making class", "Airport transfers"],
    itinerary: [
      { day: 1, title: "Arrival in Naples", description: "Transfer to the coast, welcome dinner." },
      { day: 2, title: "Positano", description: "Guided walk through Positano's lanes and beaches." },
      { day: 3, title: "Capri Boat Day", description: "Full-day boat tour of Capri and the Blue Grotto." },
      { day: 4, title: "Ravello & Amalfi", description: "Garden villas in Ravello, cathedral square in Amalfi." },
      { day: 5, title: "Pasta Making in Naples", description: "Hands-on cooking class with a local chef." },
      { day: 6, title: "Departure", description: "Transfer to Naples airport." },
    ],
  },
  {
    slug: "iceland-northern-lights-5-day",
    title: "Iceland Northern Lights",
    summary: "The Golden Circle, Blue Lagoon soak, and guided aurora-hunting drives.",
    destination: "Reykjavik, Iceland",
    durationDays: 5,
    basePriceCents: 219900,
    maxGroupSize: 14,
    difficulty: "moderate",
    included: ["4 nights hotel", "Daily breakfast", "Golden Circle tour", "Blue Lagoon entry", "2 aurora-hunting tours"],
    itinerary: [
      { day: 1, title: "Arrival in Reykjavik", description: "Check in, evening city orientation walk." },
      { day: 2, title: "Golden Circle", description: "Thingvellir, Geysir, and Gullfoss waterfall." },
      { day: 3, title: "Blue Lagoon", description: "Relax at the Blue Lagoon, evening aurora hunt." },
      { day: 4, title: "South Coast", description: "Seljalandsfoss and Skogafoss waterfalls, black sand beach." },
      { day: 5, title: "Departure", description: "Free morning, airport transfer." },
    ],
  },
  {
    slug: "safari-kenya-7-day",
    title: "Kenya Safari Explorer",
    summary: "Masai Mara game drives, a Great Rift Valley overlook, and a Nairobi elephant sanctuary.",
    destination: "Masai Mara, Kenya",
    durationDays: 7,
    basePriceCents: 329900,
    maxGroupSize: 8,
    difficulty: "moderate",
    included: ["6 nights lodge/camp", "All meals", "All game drives", "Park fees", "Airport transfers"],
    itinerary: [
      { day: 1, title: "Arrival in Nairobi", description: "Elephant sanctuary visit, overnight in Nairobi." },
      { day: 2, title: "Into the Mara", description: "Scenic drive via the Great Rift Valley overlook." },
      { day: 3, title: "Game Drives", description: "Morning and afternoon game drives in the Mara." },
      { day: 4, title: "Full-Day Safari", description: "Full-day game drive with a bush picnic lunch." },
      { day: 5, title: "Mara Conservancy", description: "Visit a community conservancy and local village." },
      { day: 6, title: "Return to Nairobi", description: "Final game drive, transfer back to Nairobi." },
      { day: 7, title: "Departure", description: "Airport transfer." },
    ],
  },
];

async function seedTours() {
  await prisma.tourDeparture.deleteMany({});
  await prisma.tourPackage.deleteMany({});

  let tourCount = 0;
  let departureCount = 0;
  const today = new Date();

  for (const t of TOURS) {
    const tour = await prisma.tourPackage.create({
      data: {
        slug: t.slug,
        title: t.title,
        summary: t.summary,
        description: `${t.summary} This ${t.durationDays}-day small-group package includes accommodation, key activities, and expert local guides so you can focus on the experience.`,
        destination: t.destination,
        durationDays: t.durationDays,
        basePriceCents: t.basePriceCents,
        imagesCsv: [img(`${t.slug}-1`), img(`${t.slug}-2`), img(`${t.slug}-3`)].join(","),
        itineraryJson: JSON.stringify(t.itinerary),
        includedCsv: t.included.join(","),
        maxGroupSize: t.maxGroupSize,
        difficulty: t.difficulty,
        published: true,
      },
    });
    tourCount++;

    const departures = [3, 6, 9, 12, 16].map((weeks) => ({
      tourId: tour.id,
      date: addDays(today, weeks * 7),
      seatsAvailable: 6 + ((weeks * 3) % (t.maxGroupSize - 4)),
    }));
    await prisma.tourDeparture.createMany({ data: departures });
    departureCount += departures.length;
  }
  console.log(`Seeded ${tourCount} tour packages with ${departureCount} departure dates`);
}

async function seedPromoCodes() {
  const promos = [
    {
      code: "WELCOME10",
      description: "10% off your first booking",
      discountType: "percent",
      discountValue: 10,
      minSpendCents: 0,
      appliesToCsv: "flight,hotel,tour",
      maxUses: null as number | null,
      active: true,
    },
    {
      code: "SUMMER50",
      description: "$50 off bookings over $300",
      discountType: "fixed",
      discountValue: 5000,
      minSpendCents: 30000,
      appliesToCsv: "flight,hotel,tour",
      maxUses: 500,
      active: true,
    },
    {
      code: "TOURSAVE15",
      description: "15% off any tour package",
      discountType: "percent",
      discountValue: 15,
      minSpendCents: 0,
      appliesToCsv: "tour",
      maxUses: 200,
      active: true,
    },
    {
      code: "EXPIRED5",
      description: "Expired test code (5% off) — for demoing invalid-code handling",
      discountType: "percent",
      discountValue: 5,
      minSpendCents: 0,
      appliesToCsv: "flight,hotel,tour",
      maxUses: null,
      active: false,
    },
  ];
  for (const p of promos) {
    await prisma.promoCode.upsert({ where: { code: p.code }, update: p, create: p });
  }
  console.log(`Seeded ${promos.length} promo codes`);
}

async function seedContentPages() {
  const pages = [
    {
      slug: "new-york",
      title: "New York City Travel Guide",
      heroImage: img("content-new-york", 1600, 700),
      bodyMarkdown:
        "# New York City\n\nThe city that never sleeps packs world-class museums, Broadway shows, and iconic skyline views into five boroughs. Fly into JFK and pair a stay in Midtown with day trips to Brooklyn.\n\n## Highlights\n- Central Park and the Met\n- Broadway theatre district\n- Rooftop bars with skyline views",
    },
    {
      slug: "tokyo",
      title: "Tokyo Travel Guide",
      heroImage: img("content-tokyo", 1600, 700),
      bodyMarkdown:
        "# Tokyo\n\nA city where centuries-old temples sit beside neon-lit skyscrapers. Explore Shinjuku by night, Asakusa by day, and don't miss a day trip to Mt. Fuji.\n\n## Highlights\n- Senso-ji Temple\n- Shibuya Crossing\n- teamLab digital art museums",
    },
    {
      slug: "paris",
      title: "Paris Travel Guide",
      heroImage: img("content-paris", 1600, 700),
      bodyMarkdown:
        "# Paris\n\nThe City of Light offers world-famous art, café culture, and riverside walks along the Seine. Base yourself on the Left Bank for easy access to the Louvre and Saint-Germain.\n\n## Highlights\n- The Louvre\n- Eiffel Tower at sunset\n- Montmartre and Sacre-Coeur",
    },
  ];
  for (const p of pages) {
    await prisma.contentPage.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`Seeded ${pages.length} CMS content pages`);
}

async function main() {
  console.log("Seeding database...");
  await seedUsers();
  await seedFxRates();
  await seedFlights();
  await seedHotels();
  await seedTours();
  await seedPromoCodes();
  await seedContentPages();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
