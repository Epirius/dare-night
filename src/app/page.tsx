import { SignedIn, SignedOut } from "@clerk/nextjs";
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
      {events.map((e) => (
        <div key={e.id}>{e.name}</div>
      ))}
    </>
  );
}
