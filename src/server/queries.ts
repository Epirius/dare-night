import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { event_members, events } from "./db/schema";

export async function createEvent(eventName: string) {
  const user = auth();
  if (!user.userId) {
    throw new Error("[Unautherized]: You must be signed in to create an event");
  }
  if (eventName.length < 1) {
    throw new Error("[Invalid Input]: Event name must be at least 1 character");
  }

  const newEvent = await db
    .insert(events)
    .values({ name: eventName })
    .returning();
  if (!newEvent?.[0]?.id) {
    throw new Error("[Internal Error]: Failed to create event");
  }

  await db
    .insert(event_members)
    .values({ userId: user.userId, role: "admin", eventId: newEvent[0].id });
}
