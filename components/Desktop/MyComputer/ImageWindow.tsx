
"use client";
import React from "react";

interface ImageWindowProps {
  fileName: string;
  fileUrl: string;
}

export default function ImageWindow({ fileName, fileUrl }: ImageWindowProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-center font-bold p-2"></h2>
      <div className="flex-1 flex items-center justify-center">
        <img src={fileUrl} alt={fileName} className="max-w-full max-h-full" />
      </div>
    </div>
  );
}
