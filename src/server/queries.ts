"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import {
  eventOtp,
  event_members,
  events,
  task_completion_status,
  tasks,
  teams,
} from "./db/schema";
import { eventCreationSchema } from "~/schema/eventSchema";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { unknown, z } from "zod";
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
  redirect(`/event/${event.eventId}`);
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

  const admin = await isAdmin(eventId, user.userId);
  if (typeof admin === "object") {
    return admin;
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

export async function createTask(
  currentState: { error: string },
  formData: FormData,
) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const data = z
    .object({
      name: z
        .string()
        .min(3, "Task name must be at least 3 characters")
        .max(50, "Max task name length is 50 characters"),
      description: z
        .string()
        .max(255, "Max description length is 255 characters")
        .optional(),
      eventId: z.coerce.number(),
    })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      eventId: formData.get("eventId"),
    });

  if (!data.success) {
    console.log(data.error.errors.map((e) => e.message).join(", "));
    return { error: data.error.errors.map((e) => e.message).join(", ") };
  }
  const { name, description, eventId } = data.data;
  const admin = await isAdmin(eventId, user.userId);
  if (typeof admin === "object") {
    return admin;
  }

  const existingEvent = await db.query.tasks.findFirst({
    where: and(eq(tasks.name, name), eq(tasks.eventId, eventId)),
  });
  if (!!existingEvent) {
    return { error: "Task with that name already exists" };
  }

  const newTask = await db
    .insert(tasks)
    .values({
      name,
      description,
      eventId,
    })
    .returning();

  const newTaskId = newTask[0]?.id;
  if (!newTaskId) {
    return { error: "Failed to create task" };
  }

  const teams = await getTeams(eventId);
  if (teams.length > 0) {
    console.log(
      teams.map((team) => ({
        taskId: newTaskId,
        teamId: team.id,
        eventId,
      })),
    );
    await db.insert(task_completion_status).values(
      teams.map((team) => ({
        taskId: newTaskId,
        teamId: team.id,
        eventId,
      })),
    );
  }
  revalidatePath(`/event/${eventId}`);
  redirect(`/event/${eventId}`);
}

async function isAdmin(
  eventId: number,
  userId: string,
): Promise<boolean | { error: string }> {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      event_members: {
        where: and(
          eq(event_members.userId, userId),
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
  return true;
}

export async function getTeams(eventId: number) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    columns: {},
    with: {
      teams: true,
    },
  });
  if (!event) {
    throw new Error("Event not found");
  }
  return event.teams;
}

export async function getTeamsWithMembers(eventId: number) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const teams = await getTeams(eventId);
  const withMembers = teams.map(async (team) => {
    const members = await db.query.event_members.findMany({
      where: eq(event_members.teamId, team.id),
    });
    return { ...team, members };
  });
  return withMembers;
}

export async function joinTeam(formData: FormData) {
  const userId = auth().userId;
  if (!userId) {
    redirect("/login");
  }
  const { eventId, teamId } = z
    .object({
      eventId: z.coerce.number(),
      teamId: z.coerce.number(),
    })
    .parse({
      eventId: formData.get("eventId"),
      teamId: formData.get("teamId"),
    });

  const user = await db.query.event_members.findFirst({
    where: and(
      eq(event_members.userId, userId),
      eq(event_members.eventId, eventId),
    ),
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.teamId) {
    throw new Error("User already in a team");
  }

  await db
    .update(event_members)
    .set({
      teamId,
    })
    .where(eq(event_members.id, user.id));
  revalidatePath(`/event/${eventId}`);
}

export async function quitTeam(formData: FormData) {
  const userId = auth().userId;
  if (!userId) {
    redirect("/login");
  }
  const { eventId, teamId } = z
    .object({
      eventId: z.coerce.number(),
      teamId: z.coerce.number(),
    })
    .parse({
      eventId: formData.get("eventId"),
      teamId: formData.get("teamId"),
    });

  await db
    .update(event_members)
    .set({
      teamId: null,
    })
    .where(
      and(eq(event_members.userId, userId), eq(event_members.teamId, teamId)),
    );

  const remainingMember = await db.query.event_members.findFirst({
    where: eq(event_members.teamId, teamId),
  });
  if (!remainingMember) {
    await db.delete(teams).where(eq(teams.id, teamId));
  }
  revalidatePath(`/event/${eventId}`);
}

export async function createTeam(formData: FormData) {
  const userId = auth().userId;
  if (!userId) {
    redirect("/login");
  }

  const { eventId, teamName } = z
    .object({
      eventId: z.coerce.number(),
      teamName: z.string().min(3).max(50),
    })
    .parse({
      eventId: formData.get("eventId"),
      teamName: formData.get("teamName"),
    });

  const user = await db.query.event_members.findFirst({
    where: and(
      eq(event_members.userId, userId),
      eq(event_members.eventId, eventId),
    ),
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (user.teamId) {
    throw new Error("User already in a team");
  }

  const team = await db
    .insert(teams)
    .values({
      name: teamName,
      eventId,
    })
    .returning();

  const newTeamId = team[0]?.id;
  if (!newTeamId) {
    throw new Error("Failed to create team");
  }

  await db
    .update(event_members)
    .set({
      teamId: newTeamId,
    })
    .where(eq(event_members.id, user.id));

  const existingTasks = await db.query.tasks.findMany({
    where: eq(tasks.eventId, eventId),
  });

  for (const task of existingTasks) {
    await db.insert(task_completion_status).values({
      taskId: task.id,
      teamId: newTeamId,
      eventId,
    });
  }

  revalidatePath(`/event/${eventId}`);
}

export async function getUserTeamId(eventId: number) {
  const userId = auth().userId;
  if (!userId) {
    redirect("/login");
  }
  const user = await db.query.event_members.findFirst({
    where: and(
      eq(event_members.userId, userId),
      eq(event_members.eventId, eventId),
    ),
  });

  return user?.teamId ?? null;
}

export async function getTasks(eventId: number, userTeamId?: number) {
  const user = auth();
  if (!user.userId) {
    redirect("/login");
  }

  const taskList = await db.query.tasks.findMany({
    where: eq(tasks.eventId, eventId),
  });

  const data = await Promise.all(
    taskList.map(async (task) => {
      if (!userTeamId) {
        return { ...task, completionData: undefined };
      }
      let completionData = await db.query.task_completion_status.findFirst({
        where: and(
          eq(task_completion_status.taskId, task.id),
          eq(task_completion_status.teamId, userTeamId),
        ),
      });

      if (!completionData) {
        const newInsert = await db
          .insert(task_completion_status)
          .values({
            taskId: task.id,
            teamId: userTeamId,
            eventId,
          })
          .returning();
        completionData = newInsert[0];
      }

      if (!completionData) {
        throw new Error("Failed to create task completion status");
      }

      return { ...task, completionData };
    }),
  );

  return data;
}

export async function toggleCompleteTask(formData: FormData) {
  const userId = auth().userId;
  if (!userId) {
    redirect("/login");
  }

  const { eventId, taskId } = z
    .object({
      eventId: z.coerce.number(),
      taskId: z.coerce.number(),
    })
    .parse({
      eventId: formData.get("eventId"),
      taskId: formData.get("taskId"),
    });

  const user = await db.query.event_members.findFirst({
    where: and(
      eq(event_members.userId, userId),
      eq(event_members.eventId, eventId),
    ),
  });
  if (!user) {
    throw new Error("User not found");
  }

  const teamId = user.teamId;
  if (!teamId) {
    throw new Error("User not in a team");
  }

  const completionData = await db.query.task_completion_status.findFirst({
    where: and(
      eq(task_completion_status.taskId, taskId),
      eq(task_completion_status.teamId, teamId),
    ),
  });
  if (!completionData) {
    throw new Error("Task completion status not found");
  }

  const newStatus = await db
    .update(task_completion_status)
    .set({
      completed: !completionData.completed,
      completedAt: new Date(),
    })
    .where(eq(task_completion_status.id, completionData.id))
    .returning();

  revalidatePath(`/event/${eventId}`);
  return newStatus;
}
