"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Clock from "./Clock";

type TaskbarProps = {
  windows: { id: string; title: string; icon: string; minimized: boolean }[];
  onToggle: (id: string) => void; 
  onFocus: (id: string) => void;  
};

export default function Taskbar({ windows, onToggle, onFocus }: TaskbarProps) {
const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (id: string, minimized: boolean) => {
    if (minimized) {
      onToggle(id);
      onFocus(id);
    } else {
      onToggle(id);
    }
  };

  return (
   <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-r from-blue-300/50 to-transparent backdrop-blur-md flex items-center justify-between px-4">
   {/* Glowing linija iznad taskbara */}
  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 shadow-[0_0_10px_2px_rgba(59,130,246,0.5)] rounded-t"></div>
  {/* Srednji centrirani deo */}
  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
    {/* Search */}
    <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/20 cursor-pointer" onClick={() => onFocus("search")}>
      <Image src="/icons/search.png" alt="Search" width={24} height={24} />
    </div>

    {/* Open windows */}
    {windows.map(w => (
      <div key={w.id} onClick={() => handleClick(w.id, w.minimized)} className={`w-10 h-10 flex items-center justify-center rounded cursor-pointer ${w.minimized ? "bg-transparent" : "bg-white/20"}`}>
        <Image src={w.icon} alt={w.title} width={24} height={24} />
      </div>
    ))}
  </div>

  {/* Sat desno */}
  <div className="ml-auto">
    <Clock time={time} setTime={setTime} />

  </div>
</div>


  );
}
