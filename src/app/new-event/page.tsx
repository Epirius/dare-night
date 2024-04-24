"use client";

import { RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import { useFormState } from "react-dom";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createEvent } from "~/server/queries";
import { SubmitButton } from "../_components/submitButton";

export default function Page() {
  const [formState, formAction] = useFormState(createEvent, { error: "" });
  console.log(formState);
  return (
    <main>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
          <CardDescription>
            Events allow you to organize your friends into teams, and compete to
            finish dare challenges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-2 pb-6">
              <Label className="text-lg" htmlFor="name">
                Name *
              </Label>
              <Input type="text" id="name" name="name" />
            </div>
            <SubmitButton>Create</SubmitButton>
            {formState?.error && (
              <p className="pt-4 text-sm text-red-500">{formState.error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
