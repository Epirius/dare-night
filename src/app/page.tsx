import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await db.query.events.findMany();
  return (
    <main className="">
      <div>Main page</div>
      {events.map((event) => (
        <div key={event.id}>{event.name}</div>
      ))}
    </main>
  );
}
