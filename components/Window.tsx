    "use client";
    import React, { useEffect, useState } from "react";
    import { Rnd } from "react-rnd";

    type WindowProps = {
      title: string;
      icon: string;
      render: () => React.ReactNode;
      onClose: () => void;
      onFocus?: () => void;
      zIndex?: number;
      onMinimize?: () => void;
      defaultMaximized?: boolean;
      initialSize?: { width: number; height: number };
      initialPosition?: { x: number; y: number };
    };

    export default function Window({
      title,
      icon,
      render,
      onClose,
      onFocus,
      zIndex = 1,
      onMinimize,
      defaultMaximized = false,
      initialSize,
      initialPosition,
    }: WindowProps) {
      const defaultWidth = initialSize?.width ?? 400;
      const defaultHeight = initialSize?.height ?? 300;
      const defaultX = initialPosition?.x ?? 100;
      const defaultY = initialPosition?.y ?? 100;

      const [position, setPosition] = useState({ x: defaultX, y: defaultY });
      const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
      const [isMaximized, setIsMaximized] = useState(defaultMaximized);
      const [prevSize, setPrevSize] = useState(size);
      const [prevPosition, setPrevPosition] = useState(position);

      useEffect(() => {
        if (defaultMaximized) {
          setPrevSize(size);
          setPrevPosition(position);
          setPosition({ x: 0, y: 0 });
          setSize({ width: window.innerWidth, height: window.innerHeight });
        }
      }, [defaultMaximized]);

      const toggleMaximize = () => {
        if (isMaximized) {
          setSize(prevSize);
          setPosition(prevPosition);
        } else {
          setPrevSize(size);
          setPrevPosition(position);
          setPosition({ x: 0, y: 0 });
          setSize({ width: window.innerWidth, height: window.innerHeight });
        }
        setIsMaximized(!isMaximized);
      };

      return (
        <Rnd
          size={{ width: size.width, height: size.height }}
          position={{ x: position.x, y: position.y }}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, newPos) => {
            setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
            setPosition(newPos);
          }}
          bounds="parent"
          style={{ zIndex }}
          className="shadow-lg bg-white rounded-md border border-gray-300 flex flex-col overflow-hidden absolute"
          onMouseDown={onFocus}
          dragHandleClassName="window-header"
          enableResizing={!isMaximized}
        >
          <div className="window-header flex items-center justify-between bg-gray-800 text-white px-2 py-1 cursor-move select-none">
            <div className="flex items-center gap-2">
              <img src={icon} alt={title} className="w-4 h-4" />
              <span className="text-sm">{title}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
              >
                &#8211;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
              >
                {isMaximized ? "🗗" : "🗖"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="w-6 h-6 flex items-center justify-center hover:bg-red-600 rounded"
              >
                ×
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full overflow-hidden">
            {render()}
          </div>
        </Rnd>
      );
    }
