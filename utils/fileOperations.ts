import React from "react";
import { IconItem, FileItem } from "./types";

export type ClipboardItem<T> = {
  item: T;
  action: "copy" | "cut";
};

export const getUniqueName = <T extends { name?: string; title?: string }>(
  name: string,
  items: T[],
  key: "title" | "name" = "title"
) => {
  let base = name.replace(/\(\d+\)$/, "").trim();
  let suffix = 1;
  let newName = base;
  while (items.some((i) => i[key] === newName)) {
    newName = `${base} (${suffix})`;
    suffix++;
  }
  return newName;
};

// --- Actions ---
export const pasteItem = <T extends { id: string; title?: string; name?: string; position?: any }>(
  clipboard: ClipboardItem<T> | null,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  pos?: { x: number; y: number },
  key: "title" | "name" = "title"
) => {
  if (!clipboard) return;
  const newId = `${clipboard.item.id}-${Date.now()}`;
  const newItem: T = {
    ...clipboard.item,
    id: newId,
    [key]: getUniqueName(clipboard.item[key]!, items, key),
    ...(pos ? { position: pos } : {}),
  } as T;
  setItems((prev) => [...prev, newItem]);
  return newItem;
};

export const renameItem = <T extends { id: string; title?: string; name?: string }>(
  itemId: string,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  key: "title" | "name" = "title"
) => {
  const target = items.find((i) => i.id === itemId);
  if (!target) return;
  const newName = prompt("Enter new name:", target[key]);
  if (!newName) return;
  setItems((prev) =>
    prev.map((i) => (i.id === itemId ? { ...i, [key]: newName } : i))
  );
};

export const deleteItem = <T extends { id: string }>(
  itemId: string,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) => {
  setItems((prev) => prev.filter((i) => i.id !== itemId));
};

export const recoverItem = <T extends { id: string }>(
  itemId: string,
  deletedItems: T[],
  setDeletedItems: React.Dispatch<React.SetStateAction<T[]>>,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) => {
  const target = deletedItems.find((i) => i.id === itemId);
  if (!target) return;
  setDeletedItems((prev) => prev.filter((i) => i.id !== itemId));
  setItems((prev) => [...prev, target]);
};

export function createNewIcon(
  type: "folder" | "txt",
  contextX: number,
  contextY: number,
  icons: IconItem[]
): IconItem {
  const newId = `${type}-${Date.now()}`;
  const newName = type === "folder" ? "New Folder" : "New Text Document.txt";
  let x = contextX - 50;
  let y = contextY - 20;
  while (icons.some((icon) => Math.abs(icon.position.x - x) < 40 && Math.abs(icon.position.y - y) < 40)) {
    x += 40;
    y += 40;
  }
  return {
    id: newId,
    title: newName,
    iconSrc: type === "folder" ? "/icons/folder.png" : "/icons/txt.png",
    position: { x, y },
    type,
  };
}

// Explorer helper
export function createNewFile(type: "folder" | "file", currentFiles: FileItem[], parentFolderId?: string): FileItem[] {
  const newId = `${type}-${Date.now()}`;
  const newName = type === "folder" ? "New Folder" : "New File";
  const newFile: FileItem = { id: newId, name: newName, type, children: type === "folder" ? [] : undefined };
  if (!parentFolderId) return [...currentFiles, newFile];
  const addToFolder = (files: FileItem[]): FileItem[] =>
    files.map((f) => {
      if (f.id === parentFolderId) {
        if (!f.children) f.children = [];
        f.children.push(newFile);
      } else if (f.children) f.children = addToFolder(f.children);
      return f;
    });
  return addToFolder(currentFiles);
}
