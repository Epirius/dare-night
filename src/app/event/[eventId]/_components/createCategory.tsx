"use client";
import { SquarePlus } from "lucide-react";
import { useFormState } from "react-dom";
import { SubmitButton } from "~/app/_components/submitButton";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createCategory } from "~/server/queries";

export function CreateCategory({ eventId }: { eventId: number }) {
  const [formState, formAction] = useFormState(createCategory, { error: "" });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="px-2">
          <SquarePlus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new category</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-md pl-1">
              Category name:
            </Label>
            <Input
              id="name"
              name="name"
              autoFocus
              placeholder="Category name"
            />
            <Input
              id="eventId"
              name="eventId"
              value={eventId}
              type="text"
              hidden
              aria-hidden
              className="hidden"
            />
          </div>
          <DialogFooter>
            <DialogClose>Cancle</DialogClose>
            <SubmitButton>Create</SubmitButton>
            {/* <Button variant="default">Create</Button> */}
          </DialogFooter>
        </form>
        {formState?.error && (
          <p className="pt-4 text-sm text-red-500">{formState.error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
