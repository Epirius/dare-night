"use client";
import { Button } from "~/components/ui/button";
import { changeLeaderboardVisibility } from "~/server/queries";

type Props = {
  eventId: number;
  revealWinner: boolean;
};

export default function ChangeLeaderboardVisabilityButton({
  eventId,
  revealWinner,
}: Props) {
  return (
    <Button
      onClick={(e) => changeLeaderboardVisibility(!revealWinner, eventId)}
    >
      {revealWinner ? "Hide" : "Show"} leaderboard
    </Button>
  );
}
