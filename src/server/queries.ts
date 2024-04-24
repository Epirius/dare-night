"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { event_members, events } from "./db/schema";
import { eventCreationSchema } from "~/schema/eventSchema";
import { redirect } from "next/navigation";
import "server-only";
import { eq } from "drizzle-orm";

export async function createEvent(
  currentState: { error: string },
  formData: FormData,
) {
  "use server";
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const data = eventCreationSchema.safeParse({
    name: formData.get("name"),
  });

  if (!data.success) {
    return { error: data.error.errors.map((e) => e.message).join(", ") };
  }

  await db.transaction(async (db) => {
    const newEvent = await db
      .insert(events)
      .values({ name: data.data.name })
      .returning();
    if (!newEvent?.[0]?.id) {
      db.rollback();
      return { error: "Failed to create event" };
    }
    await db
      .insert(event_members)
      .values({ userId: user.userId, role: "admin", eventId: newEvent[0].id });
  });
  redirect("/");
}

export async function getMyEvents() {
  const userId = auth().userId;
  if (!userId) {
    return Error("User not authenticated");
  }

  const data = await db.query.event_members.findMany({
    columns: {},
    where: eq(event_members.userId, userId),
    with: {
      events: true,
    },
  });

  return data.map((d) => d.events);
}
