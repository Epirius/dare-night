"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Loader2 } from "lucide-react";
import { forwardRef, useRef } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { Button } from "~/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { joinEvent } from "~/server/queries";
import { SubmitButton } from "../_components/submitButton";

export default function JoinEvent() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [formState, formAction] = useFormState(joinEvent, { error: "" });

  return (
    <main className="flex justify-center">
      <div className="flex w-fit flex-col items-center gap-6 rounded-lg bg-primary-foreground p-8">
        <h1 className="text-3xl font-bold">Join event:</h1>
        <form action={formAction}>
          <div className="w-fit rounded-lg bg-primary-foreground pb-4">
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
          <SubmitButton ref={buttonRef}>Join</SubmitButton>
          {formState?.error && (
            <p className="pt-4 text-sm text-red-500">{formState.error}</p>
          )}
        </form>
      </div>
    </main>
  );
}
