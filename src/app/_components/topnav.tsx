import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function TopNav() {
  return (
    <nav className="flex w-full items-center justify-between border-b px-6 py-4 text-lg font-semibold">
      <Link href="/" className="text-2xl">
        <h1>Dare Night</h1>
      </Link>
      <div className="flex items-center gap-5">
        <ThemeToggle />
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
