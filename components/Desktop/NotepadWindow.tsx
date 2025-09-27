"use client";
import React, { useState, useEffect } from "react";

type NotepadWindowProps = {
  fileName?: string;
  fileUrl?: string;
  content?: string;
  onSave: (file: { id: string; title: string; type: "file"; content: string }) => void;
};

export default function NotepadWindow({ fileName, fileUrl, content: initialContent, onSave }: NotepadWindowProps) {
  const [content, setContent] = useState<string>(initialContent ?? "");

  useEffect(() => {
    if (!fileUrl) return;
    const fetchFile = async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        setContent(text);
      } catch (err) {
        setContent("⚠️ Failed to load file.");
        console.error(err);
      }
    };
    fetchFile();
  }, [fileUrl]);

  const handleSave = () => {
    const newFile = {
      id: Date.now().toString(),
      title: fileName || "NewFile.txt",
      type: "file" as const,
      content,
    };
    onSave(newFile);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center border-b p-2 bg-gray-100">
        <h2 className="font-semibold text-sm">{fileName || "Untitled - Notepad"}</h2>
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-200"
        >
          💾 Save
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-2 font-mono text-sm resize-none outline-none"
      />
    </div>
  );
}
