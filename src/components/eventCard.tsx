import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { eventStatusEnum } from "src/utils/enum";
import { Badge } from "~/components/ui/badge";

interface EventCardProps {
  name: string;
  link: string;
  members: number;
  finishedAt: Date;
}

const getEventStatus = (finishedAt: Date): eventStatusEnum => {
  const now = new Date();
  const dayBefore = new Date(finishedAt);
  dayBefore.setDate(finishedAt.getDate() - 1);
  if (now > finishedAt) {
    return eventStatusEnum.Finished;
  }
  if (now < dayBefore) {
    return eventStatusEnum.Upcoming;
  }
  return eventStatusEnum.Active;
};

const EventCard = (props: EventCardProps) => {
  const eventStatus = getEventStatus(props.finishedAt);
  return (
    <Card className="relative flex w-full pb-5">
      <Link href={props.link} className="w-full">
        <CardTitle className="relative pl-5 pt-5">
          {props.name}
          <Badge
            variant="secondary"
            className={`
                        absolute right-5 top-1/2 -translate-y-1/2 transform
                        ${
                          eventStatus === eventStatusEnum.Active
                            ? "bg-green-600"
                            : eventStatus === eventStatusEnum.Finished
                              ? "bg-red-600"
                              : eventStatus === eventStatusEnum.Upcoming
                                ? "bg-yellow-400"
                                : ""
                        }`}
          >
            {eventStatus}
          </Badge>
        </CardTitle>
        <div className="row flex space-x-10 pl-7 pt-2">
          <div className="row flex">
            <CardDescription>
              <Users />
            </CardDescription>
            <CardDescription className="pl-2 text-xl">
              {props.members}
            </CardDescription>
          </div>
          <div className="row flex">
            <CardDescription>
              <Calendar />
            </CardDescription>
            <CardDescription className="pl-2 text-xl">
              {props.finishedAt.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default EventCard;
