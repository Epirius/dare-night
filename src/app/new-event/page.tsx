import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
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
import { createEvent, eventCreationSchema } from "~/server/queries";

export default function page() {
  const user = auth();
  if (!user.userId) {
    redirect("/");
  }

  async function handleEventCreation(formData: FormData) {
    "use server";
    const data = eventCreationSchema.safeParse({
      name: formData.get("name"),
    });

    if (!data.success) {
      return Promise.reject({
        status: 400,
        body: {
          error: "Invalid data",
          details: data.error.errors,
        },
      });
    }

    await createEvent(data.data.name);
    redirect("/");
  }

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
          <CardDescription>
            Events allow you to organize your friends into teams, and compete to
            finish dare challenges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleEventCreation}>
            <div className="flex flex-col gap-2 pb-6">
              <Label className="text-lg" htmlFor="name">
                Name *
              </Label>
              <Input type="text" id="name" name="name" />
            </div>
            <Button variant="default" type="submit">
              Create
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
