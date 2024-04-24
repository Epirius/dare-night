import { redirect } from "next/navigation";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { getEventData, isMember } from "~/server/queries";

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const id = z.coerce.number().parse(params.eventId);
  const is_member = await isMember(id);
  if (!is_member) {
    redirect("/");
  }

  const { event, member_count, is_admin } = await getEventData(id);
  return (
    <main>
      <div>
        <h1>Event: {event.name}</h1>
        <p>member(s): {member_count}</p>
        {is_admin && (
          <div>
            <p>You are an admin</p>
            <Button>invite others</Button>
            <Button>Delete event</Button>
          </div>
        )}
      </div>
    </main>
  );
}
