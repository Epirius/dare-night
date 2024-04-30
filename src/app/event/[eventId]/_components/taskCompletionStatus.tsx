"use client";

import { toggleCompleteTask } from "~/server/queries";
import { type TaskCardProps } from "./taskCard";
import { Button } from "~/components/ui/button";
import { Circle, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusherClient";

type TaskCompletedStatusProps = {
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  eventId: number;
  teamId: number;
  taskId: number;
  completed: boolean;
  completedAt: Date | null;
};

type Props = {
  data: TaskCardProps;
  getData: () => Promise<
    | {
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        eventId: number;
        teamId: number;
        taskId: number;
        completed: boolean;
        completedAt: Date | null;
      }
    | undefined
  >;
};

export function TaskCompletedButton({ data, getData }: Props) {
  const [completed, setCompleted] = useState(
    data.completionData?.completed ?? false,
  );

  useEffect(() => {
    pusherClient.subscribe(`task-${data.eventId}`);
    pusherClient.bind(
      `task-updated`,
      async (updatedData: TaskCompletedStatusProps) => {
        if (
          updatedData &&
          updatedData.taskId === data.completionData?.taskId &&
          updatedData.teamId === data.completionData?.teamId
        ) {
          const result = await getData();
          if (result) {
            setCompleted(result.completed);
          }
        }
      },
    );

    return () => {
      pusherClient.unsubscribe(`task-${data.eventId}`);
    };
  }, [
    data.completionData?.taskId,
    data.completionData?.teamId,
    data.eventId,
    getData,
  ]);

  return (
    <form action={toggleCompleteTask}>
      <input
        value={data.eventId}
        type="number"
        name="eventId"
        hidden
        aria-hidden
      />
      <input value={data.id} type="number" name="taskId" hidden aria-hidden />
      {!completed && (
        <Button size="icon" variant="ghost" className="group">
          <Circle className="group-hover:hidden" />
          <CircleCheck className=" hidden text-lime-500 group-hover:block" />
        </Button>
        // </form>
      )}
      {completed && (
        // <form action={toggleCompleteTask}>
        <Button size="icon" variant="ghost" className="group">
          <Circle className="hidden text-red-500 group-hover:block" />
          <CircleCheck className="  text-lime-500 group-hover:hidden" />
        </Button>
      )}
    </form>
  );
}
