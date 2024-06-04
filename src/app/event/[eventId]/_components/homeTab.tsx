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
      {data.length > 0 && (
        <h3 className=" pt-2 text-2xl font-semibold">Tasks:</h3>
      )}
      {userTeamId === null && (
        <p className="mx-8 my-6 rounded-lg bg-destructive px-4 py-2 text-lg text-white">
          You do not appear to be part of any team. You will not be able to
          complete any tasks unless you join a team. Please go to the teams tab
          and join or create a team.
        </p>
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
          <AccordionTrigger className="bg-primary-foreground px-4">
            <div className="flex w-full justify-between pr-4">
              <h3>{category?.name ?? "Other tasks"}</h3>
              <p className="hover:no-underline">
                {data.filter((task) => task.completionData?.completed).length} /{" "}
                {data.length}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-primary-foreground px-2">
            <div className="flex flex-col gap-2">
              {data.map((task) => {
                return (
                  <TaskCard
                    key={`task-card-${task.id}`}
                    data={task}
                    teamId={userTeamId}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
