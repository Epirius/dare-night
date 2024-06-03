"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({ date }: { date: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(date));
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return <p className="font-mono text-xl font-bold">{timeLeft}</p>;
}

const calculateTimeLeft = (date: Date) => {
  const now = new Date();
  if (date < now) return "Event has ended";
  if (date.getTime() - new Date().getTime() > 1000 * 60 * 60 * 24) {
    return "Coming soon";
  }

  const difference = date.getTime() - now.getTime();

  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
