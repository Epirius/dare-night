"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { join } from "path";
import { useRef } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { joinEvent } from "~/server/queries";

async function stopSubmit(e: React.FormEvent<HTMLFormElement>) {
  const formData = new FormData(e.currentTarget);
  console.log("form data", formData);
  const parsed = z.string().length(6).safeParse(formData.get("otp"));

  if (!parsed.success) {
    e.preventDefault();
    console.log("form submit prevented");
    return { error: parsed.error.errors.map((e) => e.message).join(", ") };
  }
}

export default function JoinEvent() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <main>
      <h1>Join event</h1>
      <form onSubmit={stopSubmit} action={joinEvent}>
        <div className="w-fit rounded-lg bg-primary-foreground p-4">
          <InputOTP
            autoFocus
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            onComplete={() => buttonRef.current?.focus()}
            name="otp"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button ref={buttonRef}>Submit</Button>
      </form>
    </main>
  );
}
