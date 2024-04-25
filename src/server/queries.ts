"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { eventOtp, event_members, events } from "./db/schema";
import { eventCreationSchema } from "~/schema/eventSchema";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import "server-only";

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
  revalidatePath("/");
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

export async function joinEvent(
  currentState: { error: string },
  formdata: FormData,
) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const parsedOtp = z.string().length(6).safeParse(formdata.get("otp"));
  if (!parsedOtp.success) {
    return { error: parsedOtp.error.errors.map((e) => e.message).join(", ") };
  }
  const otp = parsedOtp.data;

  const event = await db.query.eventOtp.findFirst({
    where: (table, { eq, and, gt }) =>
      and(eq(table.otp, otp), gt(table.invalidAfter, new Date())),
  });
  if (!event) {
    return { error: "Invalid or out of date OTP code" };
  }

  if (event.oneTimeUse) {
    await db.delete(eventOtp).where(eq(eventOtp.id, event.id));
  }

  const existingMember = await db.query.event_members.findFirst({
    where: (event_members, { eq, and }) =>
      and(
        eq(event_members.eventId, event.eventId),
        eq(event_members.userId, user.userId),
      ),
  });
  if (existingMember) {
    return { error: "You are already a member of this event" };
  }
  try {
    await db.insert(event_members).values({
      userId: user.userId,
      eventId: event.eventId,
      role: "member",
    });
  } catch (e) {
    console.log(e);
    return { error: "Failed to join event" };
  }
  revalidatePath("/");
  redirect("/");
}

export async function isMember(eventId: number) {
  const userId = auth().userId;
  if (!userId) {
    return false;
  }

  const member = await db.query.event_members.findFirst({
    where: (event_members, { eq, and }) =>
      and(eq(event_members.userId, userId), eq(event_members.eventId, eventId)),
  });
  return !!member;
}

export async function getEventData(eventId: number) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      event_members: true,
    },
  });
  if (!event) {
    //[TODO: redirect to 404 page]
    throw new Error("Event not found");
  }

  return {
    event,
    member_count: event.event_members.length,
    is_admin: event.event_members.some(
      (m) => m.userId === user.userId && m.role === "admin",
    ),
  };
}

export async function deleteEvent(formData: FormData) {
  console.log("delete event", formData.get("eventId"));
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const eventId = z.coerce.number().parse(formData.get("eventId"));

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      event_members: {
        where: and(
          eq(event_members.userId, user.userId),
          eq(event_members.role, "admin"),
        ),
      },
    },
  });

  if (!event) {
    return { error: "Could not find the event" };
  }
  if (!event.event_members.length) {
    return { error: "You are not an admin of this event" };
  }
  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/");
  redirect("/");
}

export async function createOtpCode(eventId: number, oneTimeUse: boolean) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const member = await db.query.event_members.findFirst({
    where: and(
      eq(event_members.userId, user.userId),
      eq(event_members.eventId, eventId),
    ),
  });
  if (!member) {
    return { error: "You are not a member of this event" };
  }
  if (member.role !== "admin") {
    return { error: "You are not an admin of this event" };
  }

  while (true) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    z.string().length(6).parse(otp);
    try {
      await db.insert(eventOtp).values({
        otp,
        eventId,
        oneTimeUse,
      });
      return { otp };
    } catch (e) {
      continue;
    }
  }
}
