import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getMyEvents } from "~/server/queries";

export const dynamic = "force-dynamic";

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
    <>
      <div>Main page</div>
      <div className="flex gap-4">
        <Link href="/new-event">
          <Button variant="link" size="lg" className="px-0">
            Create event
          </Button>
        </Link>
        <Link href="/join-event">
          <Button variant="link" size="lg" className="px-0">
            Join Event
          </Button>
        </Link>
      </div>
      <ul className="flex flex-col">
        {events.map((e) => (
          <li key={`li-${e.id}`}>
            <Link href={`/event/${e.id}`} key={`link-${e.id}`}>
              {e.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
