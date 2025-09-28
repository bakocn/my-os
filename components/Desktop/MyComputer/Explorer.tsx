"use client";
import React, { useState } from "react";
import { FileItem } from "../../../utils/types";
import {  handleFileDrop, getIcon } from "@/utils/explorerHelper";

type ExplorerProps = {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  openApp?: (id: string, extra?: { content?: string; title?: string; fromExplorer?: boolean; id?: string }) => void;
};

export default function Explorer({ files, setFiles, openApp }: ExplorerProps) {
  const [currentPath, setCurrentPath] = useState<FileItem[]>([]);

  const currentFolder = currentPath.length
    ? currentPath[currentPath.length - 1]
    : { id: "root", name: "Root", type: "folder", children: files } as FileItem;

  const openFolder = (folder: FileItem) => {
    if ( !folder.children) return;
    setCurrentPath(prev => [...prev, folder]);
  };

  const goBack = () => setCurrentPath(prev => prev.slice(0, prev.length - 1));

  return (
    <div className="flex flex-col h-full p-2 bg-white w-full">
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        <button
          onClick={goBack}
          disabled={currentPath.length === 0}
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Back
        </button>
        {currentPath.map((f, i) => (
          <span key={f.id}>
            {f.name} {i < currentPath.length - 1 && ">"}
          </span>
        ))}
      </div>

      {/* File grid */}
      <div className="flex-1 overflow-auto border rounded p-2 grid grid-cols-4 gap-4">
        {currentFolder.children?.map(item => (
          <div
            key={item.id}
            className="flex flex-col items-center cursor-pointer p-2 hover:bg-gray-100 rounded"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
            onDrop={(e) => {
              const draggedId = e.dataTransfer.getData("text/plain");
              setFiles(handleFileDrop(files, draggedId, item.id));
            }}
            onDragOver={(e) => e.preventDefault()}
            onDoubleClick={() => {

  if (item.children) openFolder(item);
  else
    openApp?.(item.id, {
      title: item.name,
      
      fromExplorer: true,
      id: item.id,
    });
}}

          >
            <img src={getIcon(item)} alt={item.name} className="w-16 h-16 mb-1" />
            <span className="text-sm text-center break-words">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
