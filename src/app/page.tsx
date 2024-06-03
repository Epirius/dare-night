import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getEventData, getMyEvents } from "~/server/queries";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { CalendarPlus, CirclePlus } from "lucide-react";
import EventCard from "~/components/eventCard";
import { eventStatusEnum } from "~/utils/enum";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="">
      <SignedOut>
        <div className="flex w-full flex-col items-center p-20">
          <h2 className="p-5 text-6xl">Dare Night</h2>
          <p className="pb-5 text-center">
            Imagine a playground as vast as the city itself, where every alley
            and avenue invites you to a challenge. Connect with friends or make
            new ones as you tackle dares that push your limits and pump your
            adrenaline. It&apos;s a space that turns the urban landscape into a
            game, daring you to live louder and laugh harder. Ready for your
            next thrill? Join us—if you dare.
          </p>
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
          DiamondPlus
        </div>
      </SignedOut>
      <SignedIn>
        <SignedInContent />
      </SignedIn>
    </main>
  );
}

async function SignedInContent() {
  const events = await getMyEvents();

  if (events instanceof Error) {
    return <div>Error: {events.message}</div>;
  }
  const eventDataPromises = events.map((event) => getEventData(event.id));
  const eventsData = await Promise.all(eventDataPromises);

  return (
    <Card>
      <CardTitle className="pl-5 pt-5">Feel daring?</CardTitle>
      <CardDescription className="pl-5">
        Here is an overview of all your dare-nights you are a part of
      </CardDescription>
      <div className="flex gap-4 p-5">
        <Link href="/new-event">
          <Button size="lg" className="px-2">
            <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Link>
        <Link href="/join-event">
          <Button size="lg" className="px-2">
            <CirclePlus className="mr-2 h-4 w-4" /> Join Event
          </Button>
        </Link>
      </div>
      <div className="flex h-full items-center justify-center px-4">
        <ul className="flex w-full flex-col items-center py-5">
          {eventsData.map((e) => (
            <li
              key={`li-${e.event.id}`}
              className="mb-4 flex w-full justify-center py-1 last:mb-0"
            >
              <EventCard
                link={`/event/${e.event.id}`}
                name={e.event.name}
                members={e.member_count}
                finishedAt={e.event.finishedAt}
              />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
