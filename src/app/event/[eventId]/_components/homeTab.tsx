"use client";
import { type getUserTeamId, type getTasks } from "~/server/queries";
import { TaskCard } from "./taskCard";
import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusherClient";

type HomeTabProps = {
  taskData: Awaited<ReturnType<typeof getTasks>>;
  userTeamId: Awaited<ReturnType<typeof getUserTeamId>>;
  eventId: number;
};

export default function HomeTab({
  taskData,
  userTeamId,
  eventId,
}: HomeTabProps) {
  const [data, setData] = useState(taskData);

  useEffect(() => {
    pusherClient.subscribe(`task-${eventId}`);
    pusherClient.bind(
      `task-updated`,
      function updateData(updatedData: CompletionData) {
        if (
          updatedData.eventId !== eventId ||
          updatedData.teamId !== userTeamId
        ) {
          return;
        }
        const newData = data.map((task) => {
          if (task.id === updatedData.taskId) {
            return { ...task, completionData: updatedData };
          }
          return task;
        });
        setData(newData);
      },
    );
    return () => {
      pusherClient.unsubscribe(`task-${eventId}`);
    };
  }, [data, eventId, userTeamId]);

  return (
    <div>
      <h2>Home</h2>
      {data.length > 0 && (
        <h3 className="pb-4 pt-6 text-2xl font-semibold">Tasks:</h3>
      )}
      {data.length === 0 && <p>No tasks yet</p>}
      {data
        .filter((task) => !task.completionData?.completed ?? true)
        .map((task) => {
          return (
            <TaskCard
              key={`task-card-${task.id}`}
              data={task}
              teamId={userTeamId}
            />
          );
        })}
      {data[0]?.completionData &&
        data.find((task) => task.completionData?.completed) && (
          <h3 className="pb-4 pt-6 text-2xl font-semibold">completed tasks:</h3>
        )}
      {data
        .filter((task) => task.completionData?.completed ?? false)
        .map((task) => {
          return (
            <TaskCard
              key={`task-card-${task.id}`}
              data={task}
              teamId={userTeamId}
            />
          );
        })}
    </div>
  );
}

type CompletionData = {
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  eventId: number;
  teamId: number;
  taskId: number;
  completed: boolean;
  completedAt: Date | null;
};
