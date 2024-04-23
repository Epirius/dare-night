import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { event_members, events } from "./db/schema";
import { z } from "zod";

export const eventCreationSchema = z.object({
  name: z.string().min(3).max(255).trim(),
});

export async function createEvent(eventName: string) {
  const user = auth();
  if (!user.userId) {
    throw new Error("[Unautherized]: You must be signed in to create an event");
  }

  const name = eventCreationSchema.parse({ name: eventName }).name;

  const newEvent = await db.insert(events).values({ name: name }).returning();
  if (!newEvent?.[0]?.id) {
    throw new Error("[Internal Error]: Failed to create event");
  }

  await db
    .insert(event_members)
    .values({ userId: user.userId, role: "admin", eventId: newEvent[0].id });
}
