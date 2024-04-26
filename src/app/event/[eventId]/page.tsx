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
import {
  createTeam,
  deleteEvent,
  getEventData,
  getTeamsWithMembers,
  getUserTeamId,
  isMember,
} from "~/server/queries";
import { InviteOthers } from "./_components/inviteOthers";
import { Trash2 } from "lucide-react";
import { CreateTask } from "./_components/createTask";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TeamCard } from "./_components/teamCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { User, clerkClient } from "@clerk/nextjs/server";

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
        <header className="mb-4 flex flex-wrap justify-between border-b-2 border-accent pb-2">
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
        <Tabs defaultValue="home" className=" w-full">
          <TabsList className="grid  w-full grid-cols-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <div>Home</div>
          </TabsContent>
          <TabsContent value="teams">
            <TeamPage eventId={id} />
          </TabsContent>
        </Tabs>
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

async function TeamPage({ eventId }: { eventId: number }) {
  const teams = await getTeamsWithMembers(eventId);
  const userTeamId = await getUserTeamId(eventId);
  return (
    <div className="flex flex-col gap-4 pt-2">
      {userTeamId === null && (
        <Dialog>
          <DialogTrigger asChild className="w-full">
            <Button variant="outline" className="py-6 text-lg font-semibold">
              Create team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Create Team</DialogHeader>
            <form action={createTeam}>
              <input
                type="number"
                name="eventId"
                value={eventId}
                hidden
                aria-hidden
              />
              <input
                type="text"
                name="teamName"
                placeholder="Team name"
                minLength={3}
                maxLength={50}
              />
              <DialogFooter>
                <Button>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {teams.map(async (t) => {
        const team = await t;
        const teamWithClerkUser = await Promise.all(
          team.members.map(async (member) => {
            const clerkUser: User = await clerkClient.users.getUser(
              member.userId,
            );
            const userData = {
              name: clerkUser.fullName,
              username: clerkUser.username,
              imageUrl: clerkUser.imageUrl,
            };
            return { ...member, userData };
          }),
        );

        return (
          <TeamCard
            key={team.id}
            team={{ ...team, members: teamWithClerkUser }}
            userTeamId={userTeamId}
          />
        );
      })}
    </div>
  );
}
