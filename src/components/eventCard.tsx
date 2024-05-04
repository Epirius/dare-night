import { Card, CardTitle, CardDescription} from "~/components/ui/card"
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
                <CardDescription>
                    {props.members}
                </CardDescription>
            </Link>
        </Card>
    );
}

export default EventCard;