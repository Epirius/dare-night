import { Card, CardTitle, CardDescription} from "~/components/ui/card"
import Link from "next/link";


interface EventCardProps {
    name: string;
    link: string;
}

const EventCard = (props: EventCardProps) => {
    return(
        <Card className="flex w-11/12 h-32" >
            <Link href={props.link}>
                <CardTitle className="pl-5 pt-5">
                    {props.name}
                </CardTitle>
            </Link>
        </Card>
    );
}

export default EventCard;