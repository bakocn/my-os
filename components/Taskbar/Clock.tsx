"use client";
import React, { useEffect } from "react";
type ClockProps = {
  time: Date;
  setTime: React.Dispatch<React.SetStateAction<Date>>;
};

export default function Clock({ time, setTime }: ClockProps) {
  useEffect(() => {
    const update = () => setTime(new Date());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [setTime]);

  return <div className="text-white font-mono text-sm px-2">{time.toLocaleTimeString()}</div>;
}
