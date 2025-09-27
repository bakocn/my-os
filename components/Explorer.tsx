"use client";
import React, { useState } from "react";
import { FileItem } from "./types";

type ExplorerProps = {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  openApp?: (id: string, extra?: { content?: string; title?: string; fromExplorer?: boolean; id?: string }) => void;

};


export default function Explorer({ files, setFiles, openApp }: ExplorerProps) {
  const [currentPath, setCurrentPath] = useState<FileItem[]>([]);

  const currentFolder = currentPath.length
    ? currentPath[currentPath.length - 1]
    : { children: files } as FileItem;

  // --- Otvaranje foldera ---
  const openFolder = (folder: FileItem) => {
    if (folder.type !== "folder" || !folder.children) return;
    setCurrentPath(prev => [...prev, folder]);
  };

  const goBack = () => setCurrentPath(prev => prev.slice(0, prev.length - 1));

  // --- Pronalaženje fajla po ID ---
  const findFile = (items: FileItem[], id: string): FileItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findFile(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // --- Uklanjanje fajla iz strukture ---
  const removeFile = (items: FileItem[], id: string): FileItem[] => {
    return items
      .filter(item => item.id !== id)
      .map(item => ({ ...item, children: item.children ? removeFile(item.children, id) : undefined }));
  };

  // --- Drag & drop ---
  const handleFileDrop = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    const draggedItem = findFile(files, draggedId);
    if (!draggedItem) return;

    let newFiles = removeFile(files, draggedId);

    const addToTarget = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === targetId && item.type === "folder") {
          const children = item.children ? [...item.children, draggedItem] : [draggedItem];
          return { ...item, children };
        } else if (item.children) {
          return { ...item, children: addToTarget(item.children) };
        }
        return item;
      });
    };

    newFiles = addToTarget(newFiles);
    setFiles(newFiles);
  };

  // --- Odabir ikone ---
  const getIcon = (item: FileItem) => {
    if (item.type === "folder") return "/icons/folder.png";
    const ext = item.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "txt": return "/icons/txt.png";
      case "pdf": return "/icons/pdf.png";
      case "jpg": case "jpeg": case "png": return "/icons/image.png";
      default: return "/icons/file.png";
    }
  };

  return (
    <div className="flex flex-col h-full p-2 bg-white w-full">
      {/* --- Breadcrumb / Back --- */}
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

      {/* --- File grid --- */}
      <div className="flex-1 overflow-auto border rounded p-2 grid grid-cols-4 gap-4">
        {currentFolder.children?.map(item => (
          <div
            key={item.id}
            className="flex flex-col items-center cursor-pointer p-2 hover:bg-gray-100 rounded"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
            onDrop={(e) => {
              const draggedId = e.dataTransfer.getData("text/plain");
              handleFileDrop(draggedId, item.id);
            }}
            onDragOver={(e) => e.preventDefault()}
         onDoubleClick={() => {
  if (item.type === "folder") openFolder(item);
  else
    openApp?.(item.id, {
      title: item.name,
      content: item.content ?? "",
      fromExplorer: true,
      id: item.id, // ← dodaj ID fajla iz Explorer-a
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
