"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Position } from "../../utils/types";

export type DesktopIconProps = {
  id: string;
  title: string;
  iconSrc: string;
  position: Position;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
};

export default function DesktopIcon({
  id,
  title,
  iconSrc,
  position,
  onDoubleClick,
  onContextMenu,
  className = "",
  draggable = false,
  onDragStart,
}: DesktopIconProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style: React.CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    cursor: "pointer",
    zIndex: 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={style}
      className={`w-20 flex flex-col items-center select-none ${className}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-lg hover:bg-white/20 transition">
        <img src={iconSrc} alt={title} className="w-12 h-12" />
      </div>
      <span className="mt-1 text-white text-sm text-center drop-shadow">{title}</span>
    </div>
  );
}
