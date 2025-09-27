"use client";
import React, { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import DesktopIcon from "./DesktopIcon";
import { IconItem } from "../types";
import {
  ClipboardItem,
  pasteItem,
  renameItem,
  deleteItem,
  recoverItem,
  createNewIcon,
} from "../../utils/fileOperations";

type DesktopProps = {
  onOpenApp: (appId: string) => void;
  icons: IconItem[];
  setIcons: React.Dispatch<React.SetStateAction<IconItem[]>>;
  deletedIcons: IconItem[];
  setDeletedIcons: React.Dispatch<React.SetStateAction<IconItem[]>>;
};

export default function Desktop({
  onOpenApp,
  icons,
  setIcons,
  deletedIcons,
  setDeletedIcons,
}: DesktopProps) {
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; iconId?: string }>({
    visible: false,
    x: 0,
    y: 0,
  });
  const [clipboard, setClipboard] = useState<ClipboardItem<IconItem> | null>(null);
  const [hoverNew, setHoverNew] = useState(false);

  const [selectionBox, setSelectionBox] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });

  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);

  // icon drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { delta, active } = event;
    const id = active.id as string;
    setIcons((prev) =>
      prev.map((icon) =>
        icon.id === id ? { ...icon, position: { x: icon.position.x + delta.x, y: icon.position.y + delta.y } } : icon
      )
    );
  };


  const handleMouseDown = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest(".desktop-icon");
    if (!target && e.button === 0) {
      setSelectionBox({ active: true, startX: e.clientX, startY: e.clientY, endX: e.clientX, endY: e.clientY });
      setSelectedIcons([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox.active) return;
    setSelectionBox((prev) => ({ ...prev, endX: e.clientX, endY: e.clientY }));
  };

  const handleMouseUp = () => {
    if (!selectionBox.active) return;

    const box = {
      x1: Math.min(selectionBox.startX, selectionBox.endX),
      y1: Math.min(selectionBox.startY, selectionBox.endY),
      x2: Math.max(selectionBox.startX, selectionBox.endX),
      y2: Math.max(selectionBox.startY, selectionBox.endY),
    };

    const selected = icons
      .filter((icon) => {
        const iconX = icon.position.x;
        const iconY = icon.position.y;
        const size = 64; 
        return iconX + size > box.x1 && iconX < box.x2 && iconY + size > box.y1 && iconY < box.y2;
      })
      .map((icon) => icon.id);

    setSelectedIcons(selected);
    setSelectionBox({ ...selectionBox, active: false });
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest(".desktop-icon");
    if (!target) setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
  const target = (e.target as HTMLElement);

  if (
    contextMenu.visible &&
    !target.closest(".desktop-icon") &&
    !target.closest(".context-menu")
  ) {
    setContextMenu({ ...contextMenu, visible: false });
  }
};

const handlePointerDown = (e: React.PointerEvent) => {
  const target = e.target as HTMLElement;
  if (
    contextMenu.visible &&
    !target.closest(".desktop-icon") &&
    !target.closest(".context-menu")
  ) {
    setContextMenu({ ...contextMenu, visible: false });
  }
};

 
  const handleIconContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, iconId: id });
  };

  // context
  const handleMenuAction = (action: string, targetId?: string) => {
    if (action === "paste") {
      pasteItem(clipboard, icons, setIcons, { x: contextMenu.x - 40, y: contextMenu.y - 20 });
      if (clipboard?.action === "cut") setClipboard(null);
    } else if (action === "rename" && targetId) renameItem(targetId, icons, setIcons);
    else if (action === "delete" && targetId) {
      const target = icons.find((i) => i.id === targetId)!;
      setDeletedIcons((prev) => [...prev, target]);
      deleteItem(targetId, icons, setIcons);
    } else if (action === "recover" && targetId) recoverItem(targetId, deletedIcons, setDeletedIcons, icons, setIcons);
    else if (action === "copy" && targetId) {
      const target = icons.find((i) => i.id === targetId)!;
      setClipboard({ item: { ...target }, action: "copy" });
    } else if (action === "cut" && targetId) {
      const target = icons.find((i) => i.id === targetId)!;
      setClipboard({ item: { ...target }, action: "cut" });
      deleteItem(targetId, icons, setIcons);
    } else if (!targetId && (action === "new-folder" || action === "new-txt")) {
      const newIcon = createNewIcon(action === "new-folder" ? "folder" : "txt", contextMenu.x, contextMenu.y, icons);
      setIcons((prev) => [...prev, newIcon]);
    }

    setContextMenu({ ...contextMenu, visible: false });
  };


  const handleDoubleClick = (icon: IconItem) => {
    onOpenApp(icon.type === "recycle" ? "recycle-bin" : icon.id);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        className="absolute inset-0 bg-[url('/images/image11.jpg')] bg-cover bg-center h-screen"
        onClick={handleClick}
        onContextMenu={handleDesktopContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onPointerDown={handlePointerDown}
        onMouseUp={handleMouseUp}
      >
        {icons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            id={icon.id}
            title={icon.title}
            iconSrc={icon.iconSrc}
            position={icon.position}
            onDoubleClick={() => handleDoubleClick(icon)}
            onContextMenu={(e) => handleIconContextMenu(e, icon.id)}
            className={`desktop-icon ${selectedIcons.includes(icon.id) ? "outline outline-2 outline-blue-500" : ""}`}
            draggable={icon.type !== "folder" && icon.type !== "recycle"}
          />
        ))}

        {/* Selection rectangle */}
        {selectionBox.active && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-200/30 z-40"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}

        {/* Context menu */}
        {contextMenu.visible && (
          <ul
  className="absolute bg-gray-900 text-white rounded-lg shadow-xl py-2 text-base z-50 cursor-default min-w-[180px] font-sans context-menu"
  style={{ left: contextMenu.x, top: contextMenu.y }}
>
  

            {contextMenu.iconId ? (
              <>
                <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("rename", contextMenu.iconId)}>Rename</li>
                <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("copy", contextMenu.iconId)}>Copy</li>
                <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("cut", contextMenu.iconId)}>Cut</li>
                {deletedIcons.some((i) => i.id === contextMenu.iconId) ? (
                  <>
                    <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("recover", contextMenu.iconId)}>Recover</li>
                    <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("delete-forever", contextMenu.iconId)}>Delete Forever</li>
                  </>
                ) : (
                  <li className="px-4 py-2 hover:bg-gray-800 rounded flex justify-between items-center" onClick={() => handleMenuAction("delete", contextMenu.iconId)}>Delete</li>
                )}
              </>
            ) : (
              <>
                {/* NEW submenu */}
                <li
                  className="px-4 py-2 hover:bg-gray-800 rounded relative flex justify-between items-center cursor-pointer"
                  onMouseEnter={() => setHoverNew(true)}
                  onMouseLeave={() => setHoverNew(false)}
                >
                  New
                  <span className="ml-2 text-gray-400 text-sm">▶</span>
                  {hoverNew && (
                    <ul className="absolute left-full top-0 bg-gray-900 text-white rounded-lg shadow-xl py-2 min-w-[160px]">
                      <li
                        className="px-4 py-2 hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => handleMenuAction("new-folder")}
                      >
                        Folder
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-800 rounded cursor-pointer"
                        onClick={() => handleMenuAction("new-txt")}
                      >
                        Text Document
                      </li>
                    </ul>
                  )}
                </li>

                {clipboard && (
                  <li
                    className="px-4 py-2 hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => handleMenuAction("paste")}
                  >
                    Paste
                  </li>
                )}
              </>
            )}
          </ul>
        )}
      </div>
    </DndContext>
  );
}
