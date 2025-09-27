"use client";

import React from "react";

type PdfViewerProps = {
  fileUrl: string;
  width?: number;
  height?: number;
};


export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  return (
    <div className="w-full h-full">
      <iframe
        src={fileUrl}
        title="PDF Viewer"
        className="w-full h-full border-none"
      />
    </div>
  );
}
