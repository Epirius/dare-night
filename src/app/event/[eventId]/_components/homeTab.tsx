"use client";
import {
  type getUserTeamId,
  type getTasks,
  type getCategory,
} from "~/server/queries";
import { TaskCard } from "./taskCard";
import { useEffect, useState } from "react";
import { pusherClient } from "~/lib/pusherClient";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

type HomeTabProps = {
  taskData: Awaited<ReturnType<typeof getTasks>>;
  userTeamId: Awaited<ReturnType<typeof getUserTeamId>>;
  eventId: number;
  categories: Awaited<ReturnType<typeof getCategory>>;
};

type CompletionData = NonNullable<
  Awaited<ReturnType<typeof getTasks>>[0]["completionData"]
>;

export default function HomeTab({
  taskData,
  userTeamId,
  eventId,
  categories,
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
      <h2>Tasks</h2>
      {data.length > 0 && (
        <h3 className="pb-4 pt-6 text-2xl font-semibold">Tasks:</h3>
      )}
      {data.length === 0 && <p>No tasks yet</p>}
      {categories.map((category) => {
        return (
          <CategoryAccordion
            key={`category-accordion-${category.id}-${category.name}`}
            data={data.filter((task) => task.category === category.id)}
            category={category}
            userTeamId={userTeamId}
          />
        );
      })}
      <CategoryAccordion
        data={data.filter((task) => !task.category)}
        category={undefined}
        userTeamId={userTeamId}
      />
    </div>
  );
}

type CategoryAccordionProps = {
  data: Awaited<ReturnType<typeof getTasks>>;
  category?: Awaited<ReturnType<typeof getCategory>>[number];
  userTeamId: Awaited<ReturnType<typeof getUserTeamId>>;
};

function CategoryAccordion({
  data,
  category,
  userTeamId,
}: CategoryAccordionProps) {
  if (data.length === 0) {
    return null;
  }
  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={category?.name ?? "no-category"}>
          <AccordionTrigger>
            <h3>{category?.name ?? "No category"}</h3>
          </AccordionTrigger>
          <AccordionContent>
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
                <h3 className="pb-4 pt-6 text-2xl font-semibold">
                  completed tasks:
                </h3>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
