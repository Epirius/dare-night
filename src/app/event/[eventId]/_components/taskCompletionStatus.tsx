"use client";

import { toggleCompleteTask } from "~/server/queries";
import { type TaskCardProps } from "./taskCard";
import { Button } from "~/components/ui/button";
import { Circle, CircleCheck } from "lucide-react";

type Props = {
  data: TaskCardProps;
};

export function TaskCompletedButton({ data }: Props) {
  return (
    <form action={toggleCompleteTask}>
      <input
        value={data.eventId}
        type="number"
        name="eventId"
        hidden
        readOnly
        aria-hidden
      />
      <input
        value={data.id}
        type="number"
        name="taskId"
        hidden
        aria-hidden
        readOnly
      />
      {!data.completionData?.completed && (
        <Button size="icon" variant="ghost" className="group">
          <Circle className="group-hover:hidden" />
          <CircleCheck className=" hidden text-lime-500 group-hover:block" />
        </Button>
        // </form>
      )}
      {data.completionData?.completed && (
        // <form action={toggleCompleteTask}>
        <Button size="icon" variant="ghost" className="group">
          <Circle className="hidden text-red-500 group-hover:block" />
          <CircleCheck className="  text-lime-500 group-hover:hidden" />
        </Button>
      )}
    </form>
  );
}
