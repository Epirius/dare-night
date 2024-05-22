import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { Calendar, Users } from 'lucide-react';
import Link from "next/link";
import { eventStatusEnum } from "src/utils/enum";
import { Badge } from "~/components/ui/badge";

interface EventCardProps {
    name: string;
    link: string;
    members: number;
    eventStatus: eventStatusEnum;
}

const EventCard = (props: EventCardProps) => {
    return (
        <Card className="flex w-full pb-5 relative">
            <Link href={props.link} className="w-full">
                <CardTitle className="pl-5 pt-5 relative">
                    {props.name}
                    <Badge variant="secondary" className={`
                        absolute right-5 top-1/2 transform -translate-y-1/2
                        ${
                        props.eventStatus === eventStatusEnum.Active ? 'bg-green-600' :
                            props.eventStatus === eventStatusEnum.Finished ? 'bg-red-600' :
                                props.eventStatus === eventStatusEnum.Upcoming? 'bg-yellow-400' :
                                    ''
                    }`}>{props.eventStatus}</Badge>
                </CardTitle>
                <div className="flex row space-x-10 pl-7 pt-2">
                    <div className="flex row">
                        <CardDescription>
                            <Users />
                        </CardDescription>
                        <CardDescription className="text-xl pl-2">
                            {props.members}
                        </CardDescription>
                    </div>
                    <div className="flex row">
                        <CardDescription>
                            <Calendar />
                        </CardDescription>
                        <CardDescription className="text-xl pl-2">
                            10-12-24
                        </CardDescription>
                    </div>
                </div>
            </Link>
        </Card>
    );
}

export default EventCard;
