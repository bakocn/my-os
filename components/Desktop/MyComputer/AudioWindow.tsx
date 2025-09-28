"use client";
import React from "react";

interface AudioWindowProps {
  fileName: string;
  fileUrl: string;
}

export default function AudioWindow({ fileName, fileUrl }: AudioWindowProps) {
  return (
    <div className="w-full h-full flex flex-col items-center bg-[url('/images/audio-bg.jpg')] bg-cover bg-center justify-center p-2">
      <h3 className="mb-2">{fileName}</h3>
      <audio controls autoPlay>
        <source src={fileUrl}  type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
