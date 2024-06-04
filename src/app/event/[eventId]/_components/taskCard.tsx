"use client";
import { Card, CardHeader } from "~/components/ui/card";
import { getTaskProof, toggleCompleteTask } from "~/server/queries";
import { Button } from "~/components/ui/button";
import { Circle, CircleCheck } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import TriggerBlocker from "./triggerBlocker";
import React, { use, useEffect, useState } from "react";
import { task_proof } from "~/server/db/schema";

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

type Props = {
  data: TaskCardProps;
  teamId: number | null;
};

export function TaskCard({ data, teamId }: Props) {
  type ExtractArray<T> = T extends (infer U)[] ? U[] : never;
  type Proof = ExtractArray<Awaited<ReturnType<typeof getTaskProof>>>;

  const [proofList, setProofList] = useState<Proof | null>(null);

  const getProof = async ({ data, teamId }: Props) => {
    if (!teamId) {
      return;
    }
    const proofData = await getTaskProof(data.eventId, data.id, teamId);
    if ("error" in proofData) {
      return;
    }
    setProofList(proofData);
  };

  useEffect(() => {
    void getProof({ data, teamId });
  }, [data, teamId]);

  return (
    <Dialog>
      <Card>
        <DialogTrigger className="w-full" asChild>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between">
              <h2 className="text-wrap text-2xl font-bold text-gray-900 dark:text-gray-200">
                {data.name}
              </h2>
              <div>
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
                  {!data.completionData?.completed && !!teamId && (
                    <TriggerBlocker>
                      <Button size="icon" variant="ghost" className="group">
                        <Circle className="group-hover:hidden" />
                        <CircleCheck className=" hidden text-lime-500 group-hover:block" />
                      </Button>
                    </TriggerBlocker>
                  )}
                  {data.completionData?.completed && !!teamId && (
                    <TriggerBlocker>
                      <Button size="icon" variant="ghost" className="group">
                        <Circle className="hidden text-red-500 group-hover:block" />
                        <CircleCheck className="  text-lime-500 group-hover:hidden" />
                      </Button>
                    </TriggerBlocker>
                  )}
                </form>
              </div>
            </div>
          </CardHeader>
        </DialogTrigger>
        <DialogContent>
          {/* <DialogContent onClick={() => getProof}> */}
          <DialogHeader>
            <DialogTitle>
              <h2>{data.name}</h2>
            </DialogTitle>
            <DialogDescription>
              <p>{data.description}</p>
            </DialogDescription>
          </DialogHeader>
          {/* <Proof data={data} teamId={teamId} /> */}
          <div>
            {proofList?.map((proof) => {
              return (
                <div key={proof.url}>
                  <img src={proof.url} alt={proof.url} />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            {teamId && (
              <TriggerBlocker>
                <UploadButton
                  className="z-10"
                  endpoint="proofUploader"
                  input={{
                    teamId,
                    eventId: data.eventId,
                    taskId: data.id,
                  }}
                />
              </TriggerBlocker>
            )}
          </DialogFooter>
        </DialogContent>
      </Card>
    </Dialog>
  );
}
