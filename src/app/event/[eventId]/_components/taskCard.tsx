import { Circle, CircleCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { toggleCompleteTask } from "~/server/queries";

type TaskCardProps = {
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

export async function TaskCard(data: TaskCardProps) {
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
              aria-hidden
            />
            <input
              value={data.id}
              type="number"
              name="taskId"
              hidden
              aria-hidden
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
        </div>
      </CardHeader>
      <p className="px-6 pb-8">{data.description}</p>
    </Card>
  );
}
