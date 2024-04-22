import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { event_members, events } from "~/server/db/schema";

export default function page() {
  async function handleEventCreation(formData: FormData) {
    "use server";
    const user = await currentUser();

    const name = formData.get("name") as string;
    if (!name) {
      throw new Error("Name is required");
    }
    if (!user) {
      throw new Error("User is required");
    }
    const eventData = await db
      .insert(events)
      .values({ name: name })
      .returning();
    if (!eventData?.[0]?.id) {
      throw new Error("Event data is required");
    }
    await db
      .insert(event_members)
      .values({ userId: user.id, role: "admin", eventId: eventData[0].id });
  }

  return (
    <main>
      <h1>Create new event</h1>
      <form action={handleEventCreation}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
