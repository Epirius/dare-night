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
import { InviteOthers } from "./_components/inviteOthers";
import { Trash2 } from "lucide-react";
import { CreateTask } from "./_components/createTask";

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
        <header className="flex flex-wrap justify-between border-b-2 border-accent pb-2">
          <h1 className=" text-3xl font-semibold ">{event.name}</h1>
          <div>
            {is_admin && (
              <div className="flex flex-wrap gap-4">
                <CreateTask eventId={id} />
                <InviteOthers eventId={id} />
                <DeleteEvent eventId={id} />
              </div>
            )}
          </div>
        </header>
        <p>member(s): {member_count}</p>
      </div>
    </main>
  );
}

function DeleteEvent({ eventId }: { eventId: number }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 />
        </Button>
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
