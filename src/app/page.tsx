import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getMyEvents } from "~/server/queries";
import { Card, CardTitle, CardDescription} from "~/components/ui/card"
export const dynamic = "force-dynamic";
import { CirclePlus, CalendarPlus } from 'lucide-react';
import EventCard from "~/components/eventCard";



export default function HomePage() {
  return (
    <main className="">
      <SignedOut>
        <h2 className="flex w-full justify-center">Sign in above</h2>
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

  return (
    <Card>
        <CardTitle className="pt-5 pl-5">Feel daring?</CardTitle>
        <CardDescription className="pl-5">Here is an overview of all your dare-nights so far</CardDescription>
      <div className="flex gap-4 p-5">
        <Link href="/new-event">
          <Button size="lg" className="px-2">
            <CalendarPlus className="mr-2 h-4 w-4"/> Create Event
          </Button>
        </Link>
        <Link href="/join-event">
          <Button size="lg" className="px-2">
              <CirclePlus className="mr-2 h-4 w-4"/> Join Event
          </Button>
        </Link>
      </div>
        <div className="flex justify-center items-center h-full px-4">
            <ul className="flex flex-col items-center w-full py-5">
                {events.map((e) => (
                    <li key={`li-${e.id}`} className="w-full flex justify-center mb-4 last:mb-0 py-1">
                        <EventCard link={`/event/${e.id}`} name={e.name}/>
                    </li>
                ))}
        {/*{events.map((e) => (*/}
        {/*  <li key={`li-${e.id}`}>*/}
        {/*    <Link href={`/event/${e.id}`} key={`link-${e.id}`}>*/}
        {/*      {e.name}*/}
        {/*    </Link>*/}
        {/*  </li>*/}
        {/*))}*/}
      </ul>
        </div>
    </Card>
  );
}
