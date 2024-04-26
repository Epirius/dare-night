import { CircleCheck } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";

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

export function TaskCard(data: TaskCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between">
          <h2>{data.name}</h2>
          <Button size="icon" variant="ghost">
            <CircleCheck />
          </Button>
        </div>
      </CardHeader>
      <p className="px-6 pb-8">{data.description}</p>
    </Card>
  );
}
