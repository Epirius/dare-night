"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

export type TeamCardProps = {
  members: {
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
  userTeamId?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{team.name}</h2>
            <div className="flex items-center gap-4">
              {!userTeamId && <Button>Join team</Button>}
              {userTeamId === team.id && <Button>Quit team</Button>}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {!isOpen && <ChevronDown />}
                  {isOpen && <ChevronUp />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ul>
              {team.members.map((member) => (
                <li key={member.userId}>
                  member: {member.userId} {member.role}
                </li>
              ))}
            </ul>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
