import { redirect } from "next/navigation";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { deleteEvent, getEventData, isMember } from "~/server/queries";

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
            <DeleteEvent eventId={id} />
          </div>
        )}
      </div>
    </main>
  );
}

function DeleteEvent({ eventId }: { eventId: number }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Event</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this event? This action cannot be
            undone. You will also delete all Teams and Task associated with this
            event.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>cancle</AlertDialogCancel>
          <form action={deleteEvent}>
            <input
              value={eventId}
              type="number"
              name="eventId"
              hidden
              aria-hidden
            />
            <Button variant="destructive">Delete</Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
