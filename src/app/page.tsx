import { SignInButton,SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getMyEvents } from "~/server/queries";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
      <main className="">
          <SignedOut>
              <div className="flex w-full items-center p-20 flex-col">
                  <h2 className="text-6xl p-5">Dare Night</h2>
                  <p className="pb-5 text-center">Imagine a playground as vast as the city itself, where every alley and
                      avenue invites you to a challenge. Connect with friends or make new ones as you tackle dares that
                      push your limits and pump your adrenaline. It's a space that turns the urban landscape into a
                      game, daring you to live louder and laugh harder. Ready for your next thrill? Join us—if you
                      dare.</p>
                  <SignInButton>
                      <Button>Sign In</Button>
                  </SignInButton>
              </div>
          </SignedOut>
          <SignedIn>
              <SignedInContent/>
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
