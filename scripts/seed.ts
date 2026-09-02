import { hash } from "bcryptjs";
import { db } from "../lib/db";
import {
  eventSaves,
  events,
  pulseConfirms,
  pulses,
  users,
} from "../lib/db/schema";
import {
  seedEvents,
  seedPassword,
  seedPulses,
  seedUsers,
} from "../lib/db/seed-data";

const LIFE_MS = 4 * 60 * 60 * 1000;

async function seed() {
  await db.delete(pulseConfirms);
  await db.delete(eventSaves);
  await db.delete(pulses);
  await db.delete(events);
  await db.delete(users);

  const passwordHash = await hash(seedPassword, 10);
  await db.insert(users).values(
    seedUsers.map((user) => ({
      ...user,
      passwordHash,
    })),
  );

  await db.insert(events).values(
    seedEvents.map((event) => ({
      ...event,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
    })),
  );

  const now = Date.now();
  await db.insert(pulses).values(
    seedPulses.map((pulse) => {
      const postedAt = new Date(now - pulse.postedMinutesAgo * 60_000);
      return {
        id: pulse.id,
        sessionId: pulse.sessionId,
        caption: pulse.caption,
        category: pulse.category,
        lat: pulse.lat,
        lng: pulse.lng,
        postedAt,
        expiresAt: new Date(postedAt.getTime() + LIFE_MS),
        confirmCount: 0,
      };
    }),
  );

  console.log(
    `Seeded ${seedUsers.length} organizers, ${seedEvents.length} events, ${seedPulses.length} pulses.`,
  );
  console.log(`Organizer login: ${seedUsers[0].email} / ${seedPassword}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
