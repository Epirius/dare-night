import { redirect } from "next/navigation";
import { createEvent } from "~/server/queries";

export default function page() {
  async function handleEventCreation(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    await createEvent(name);
    redirect("/");
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
