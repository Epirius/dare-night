import { Card, CardTitle, CardDescription} from "~/components/ui/card"
import { Users, Calendar } from 'lucide-react';
import Link from "next/link";


interface EventCardProps {
    name: string;
    link: string;
    members: number;
}

const EventCard = (props: EventCardProps) => {
    return(
        <Card className="flex w-full h-32" >
            <Link href={props.link}>
                <CardTitle className="pl-5 pt-5">
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
                <CardDescription className="text-xl">
                    Start date: 10-12-24
                </CardDescription>
                </div>
            </Link>
        </Card>
    );
}

export default EventCard;