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
  getCategory,
  getEventData,
  getTasks,
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
import { type User, clerkClient } from "@clerk/nextjs/server";
import HomeTab from "./_components/homeTab";
import Leaderboard from "./_components/leaderboardTab";
import CountdownTimer from "~/components/countdownTimer";
import { CreateCategory } from "./_components/createCategory";

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
  const userTeamId = await getUserTeamId(event.id);
  const taskData = await getTasks(event.id, userTeamId ?? undefined);
  const eventCategories = await getCategory(id);
  return (
    <main>
      <div>
        <header className="mb-4 flex flex-wrap items-center justify-between border-b-2 border-accent pb-2">
          <h1 className=" text-3xl font-semibold ">{event.name}</h1>
          <CountdownTimer date={event.finishedAt} />
          <div>
            {is_admin && (
              <div className="flex flex-wrap gap-4">
                <CreateCategory eventId={id} />
                <CreateTask eventId={id} categories={eventCategories} />
                <InviteOthers eventId={id} />
                <DeleteEvent eventId={id} />
              </div>
            )}
          </div>
        </header>
        <Tabs defaultValue="home" className=" w-full">
          <TabsList className="grid  w-full grid-cols-3">
            <TabsTrigger value="home">Tasks</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <HomeTab
              taskData={taskData}
              userTeamId={userTeamId}
              eventId={event.id}
              categories={eventCategories}
            />
          </TabsContent>
          <TabsContent value="teams">
            <TeamPage eventId={id} userTeamId={userTeamId ?? undefined} />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard eventId={id} />
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
        <Button variant="destructive" className="px-2">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Event
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

async function TeamPage({
  eventId,
  userTeamId,
}: {
  eventId: number;
  userTeamId?: number;
}) {
  const teams = await getTeamsWithMembers(eventId);

  return (
    <div className="flex flex-col gap-4 pt-2">
      {!userTeamId && (
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
