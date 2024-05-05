import {Card, CardDescription, CardTitle} from "~/components/ui/card"
import {Calendar, Users} from 'lucide-react';
import Link from "next/link";
import {eventStatusEnum} from "src/utils/enum"


interface EventCardProps {
    name: string;
    link: string;
    members: number;
    eventStatus: eventStatusEnum;
}

const EventCard = (props: EventCardProps) => {
    return(
        <Card className="flex w-full pb-5" >
            <Link href={props.link}>
                <CardTitle className={`pl-5 pt-5 
                ${
                    props.eventStatus === eventStatusEnum.Active ? 'text-green-600' : 
                    props.eventStatus === eventStatusEnum.Finished ? 'text-red-600' :
                    ''    
                }`}>
                    {props.name}
                </CardTitle>
                <div className="flex row space-x-10 pl-7 pt-2">
                <div className="flex row">
                <CardDescription>
                    <Users/>
                </CardDescription>
                <CardDescription className="text-xl pl-2">
                    {props.members}
                </CardDescription>
                </div>
                <div className="flex row">
                <CardDescription>
                    <Calendar/>
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