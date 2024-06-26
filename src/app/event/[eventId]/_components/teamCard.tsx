"use client";
import { ChevronDown, ChevronUp, DiamondPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { joinTeam, quitTeam } from "~/server/queries";

export type TeamCardProps = {
  members: {
    userData: {
      name: string | null;
      username: string | null;
      imageUrl: string;
    };
    eventId: number;
    id: number;
    createdAt: Date;
    updatedAt: Date | null;
    userId: string;
    teamId: number | null;
    role: "admin" | "member";
  }[];
  eventId: number;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export function TeamCard({
  team,
  userTeamId,
}: {
  team: TeamCardProps;
  userTeamId: number | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center justify-between gap-2 pl-2">
              <h2 className="text-lg font-semibold">{team.name}</h2>
              {!userTeamId && (
                <form action={joinTeam}>
                  <input
                    aria-hidden
                    type="hidden"
                    name="teamId"
                    value={team.id}
                  />
                  <input
                    aria-hidden
                    type="hidden"
                    name="eventId"
                    value={team.eventId}
                  />
                  <Button variant="ghost" size="sm" className="flex gap-2">
                    <DiamondPlus />
                    <p className="text-base font-semibold">Join team</p>
                  </Button>
                </form>
              )}
              {userTeamId === team.id && (
                <form action={quitTeam}>
                  <input
                    aria-hidden
                    type="hidden"
                    name="teamId"
                    value={team.id}
                  />
                  <input
                    aria-hidden
                    type="hidden"
                    name="eventId"
                    value={team.eventId}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex gap-2"
                  >
                    <Trash2 />
                    <p className="text-base font-semibold">Leave team</p>
                  </Button>
                </form>
              )}
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {!isOpen && <ChevronDown />}
                {isOpen && <ChevronUp />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <h3 className="text-lg font-semibold">Members:</h3>
            <ul className="pl-4">
              {team.members.map((member) => {
                return (
                  <li key={member.userId}>
                    <p>
                      {member.userData.name ??
                        member.userData.username ??
                        member.id}
                    </p>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
