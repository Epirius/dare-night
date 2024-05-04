"use client";
import { Card, CardHeader } from "~/components/ui/card";
import { toggleCompleteTask } from "~/server/queries";
import { Button } from "~/components/ui/button";
import { Circle, CircleCheck } from "lucide-react";

export type TaskCardProps = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  eventId: number;
  description: string | null;
  completionData?: {
    id: number;
    createdAt: Date;
    updatedAt: Date | null;
    eventId: number;
    teamId: number;
    taskId: number;
    completed: boolean;
    completedAt: Date | null;
  };
};

export function TaskCard(data: TaskCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between">
          <h2>{data.name}</h2>
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
            )}
            {data.completionData?.completed && (
              <Button size="icon" variant="ghost" className="group">
                <Circle className="hidden text-red-500 group-hover:block" />
                <CircleCheck className="  text-lime-500 group-hover:hidden" />
              </Button>
            )}
          </form>
        </div>
      </CardHeader>
      <p className="px-6 pb-8">{data.description}</p>
    </Card>
  );
}
