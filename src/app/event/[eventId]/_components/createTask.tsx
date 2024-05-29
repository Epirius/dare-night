"use client";
import { SquarePlus } from "lucide-react";
import { useFormState } from "react-dom";
import { SubmitButton } from "~/app/_components/submitButton";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { createTask } from "~/server/queries";

export function CreateTask({ eventId }: { eventId: number }) {
  const [formState, formAction] = useFormState(createTask, { error: "" });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="px-2">
          <SquarePlus className="mr-2 h-4 w-4"/> Add Dare
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-md pl-1">
              Task name:
            </Label>
            <Input id="name" name="name" autoFocus placeholder="Task name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-md pl-1">
              Description (optional):
            </Label>
            <Textarea
              name="description"
              id="description"
              placeholder="Description"
              maxLength={255}
            />
          </div>
          <Input
            name="eventId"
            aria-hidden
            type="number"
            className="hidden"
            id="eventId"
            value={eventId}
          />
          <Input
            name="points"
            type="number"
            id="points"
          />
          <DialogFooter>
            <DialogClose>Cancle</DialogClose>
            <SubmitButton>Create</SubmitButton>
            {/* <Button variant="default">Create</Button> */}
          </DialogFooter>
          {formState?.error && (
            <p className="pt-4 text-sm text-red-500">{formState.error}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
