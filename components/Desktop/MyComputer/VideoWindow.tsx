"use client";
import React from "react";

interface VideoWindowProps {
  fileName: string;
  fileUrl: string;
  width?: number;
  height?: number;
}

export default function VideoWindow({ fileName, fileUrl, width = 640, height = 360 }: VideoWindowProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      <h3 className="mb-2"></h3>
      <video width={width} height={height} autoPlay controls>
        <source src={fileUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
