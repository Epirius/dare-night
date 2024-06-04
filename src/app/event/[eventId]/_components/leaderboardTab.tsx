"use client";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { getLeaderboard } from "~/server/queries";

type Props = {
  eventId: number;
};
type LeaderboardData = Awaited<ReturnType<typeof getLeaderboard>>;
type LeaderboardRow = {
  teamName: string;
  points: number;
};

export default function Leaderboard({ eventId }: Props) {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);

  const updateLeaderboard = async () => {
    const data = await getLeaderboard(eventId);
    setLeaderboardData(data);
  };

  useEffect(() => {
    void updateLeaderboard();
  }, [eventId]);

  return (
    <div>
      <Button onClick={updateLeaderboard} className="mb-6 mt-4">
        Refresh leaderboard
      </Button>
      <div>
        {leaderboardData &&
          toLeaderboardRows(leaderboardData).map((team) => (
            <Card key={team.teamName}>
              <CardContent className="flex items-center justify-between pt-4">
                <h3 className="text-lg">{team.teamName}</h3>
                <p className="text-lg">Points: {team.points}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

function toLeaderboardRows(data: LeaderboardData): LeaderboardRow[] {
  const rows: Record<string, number> = {};
  for (const team of data) {
    if (team.teams.name in rows) {
      rows[team.teams.name] += team.tasks.points;
    } else {
      rows[team.teams.name] = team.tasks.points;
    }
  }
  return Object.entries(rows)
    .map(([teamName, points]) => ({
      teamName,
      points,
    }))
    .sort((a, b) => b.points - a.points);
}
