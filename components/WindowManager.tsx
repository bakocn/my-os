"use client";
import React, { useState, useEffect } from "react";
import Desktop from "./Desktop";
import Window from "./Window";
import Taskbar from "./Taskbar";
import RecycleBin from "./RecycleBin";
import Explorer from "./Explorer";
import PdfViewer from "./PdfViewer";
import { IconItem, FileItem, AppWindow } from "./types";
import GitHubWindow from "./GitHubWindow";
import NotepadWindow from "./NotepadWindow";

export default function WindowManager() {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [desktopMounted, setDesktopMounted] = useState(false);
  const [desktopIcons, setDesktopIcons] = useState<IconItem[]>([]);
  const [deletedIcons, setDeletedIcons] = useState<IconItem[]>([]);

  const [fileTree, setFileTree] = useState<FileItem[]>([
    {
      id: "nikola-bakoc",
      name: "Nikola Bakoč",
      type: "folder",
      children: [
        {
          id: "documents",
          name: "Documents",
          type: "folder",
          children: [
            { id: "resume", name: "Resume.pdf", type: "file" },
            { id: "notes", name: "Notes.txt", type: "file" },
          ],
        },
        { id: "todo", name: "todo.txt", type: "file" },
      ],
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "folder",
      children: [
        { id: "vacation", name: "Vacation.jpg", type: "file" },
        { id: "selfie", name: "Selfie.png", type: "file" },
      ],
    },
  ]);
// --- openFileInNotepad ---
const openFileInNotepad = (
  title: string,
  content: string,
  id?: string,
  fromExplorer: boolean = false
) => {
  const uniqueId = id ?? "notepad-" + Date.now();
  setWindows((prev) => [
    ...prev,
    {
      id: uniqueId,
      title,
      icon: "/icons/notepad.png",
      minimized: false,
      initialSize: { width: 600, height: 400 },
      initialPosition: { x: 120 + prev.length * 20, y: 80 + prev.length * 20 },
      render: () => (
        <NotepadWindow
          fileName={title}
          content={content}
          onSave={(file) => {
           if (fromExplorer) {
              // samo update sadržaja u Explorer-u
              setFileTree((prevFiles) => {
                const updateContent = (items: FileItem[]): FileItem[] =>
                  items.map((i) =>
                    i.id === id
                      ? { ...i, name: file.title, content: file.content }
                      : i.children
                      ? { ...i, children: updateContent(i.children) }
                      : i
                  );
                return updateContent(prevFiles);
              });
            } else {
              // update desktopIcons
              setDesktopIcons((icons) => {
                const exists = icons.find((i) => i.id === uniqueId);
                if (exists) {
                  return icons.map((i) =>
                    i.id === uniqueId ? { ...i, content: file.content, title: file.title } : i
                  );
                }
                return [
                  ...icons,
                  {
                    id: uniqueId,
                    title: file.title,
                    iconSrc: "/icons/txt.png",
                    position: { x: 200, y: 200 },
                    type: "file",
                    content: file.content,
                  },
                ];
              });
            }
          }}
        />
      ),
    },
  ]);
  setZOrder((prev) => [...prev, uniqueId]);
};



  const getInitialIconPositions = () => {
    if (typeof window === "undefined") return [];
    const padding = 20;
    const iconSize = 80;
    const verticalSpacing = 40;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const leftIcons: IconItem[] = [
      {
        id: "explorer",
        title: "My Computer",
        iconSrc: "/icons/pc.png",
        position: { x: padding, y: padding },
        type: "explorer",
      },
      {
        id: "notepad",
        title: "Notepad",
        iconSrc: "/icons/notepad.png",
        position: { x: padding, y: padding + iconSize + verticalSpacing },
        type: "notepad",
      },
      {
        id: "github",
        title: "GitHub",
        iconSrc: "/icons/github.png",
        position: { x: padding, y: padding + 2 * (iconSize + verticalSpacing) },
        type: "github",
      },
    ];

    const recycleBin: IconItem = {
      id: "recycle",
      title: "Recycle Bin",
      iconSrc: "/icons/recycle.png",
      position: {
        x: screenWidth - 120,
        y: screenHeight - 160,
      },
      type: "recycle",
    };

    return [...leftIcons, recycleBin];
  };

  useEffect(() => {
    setDesktopMounted(true);
    setDesktopIcons(getInitialIconPositions());
  }, []);

  const recoverIcon = (id: string) => {
    const icon = deletedIcons.find((i) => i.id === id);
    if (!icon) return;
    setDeletedIcons((prev) => prev.filter((i) => i.id !== id));
    setDesktopIcons((prev) => [...prev, icon]);
  };

  const deleteForever = (id: string) => {
    setDeletedIcons((prev) => prev.filter((i) => i.id !== id));
  };

  const openApp = (appId: string, extra?: { content?: string; title?: string;fromExplorer?: boolean }) => {
  // --- Provera da li je app već otvoren ---
  const exists = windows.find(
    (w) => w.id === appId || (w.id === "my-computer" && appId === "explorer")
  );
  if (exists) {
    focusApp(exists.id);
    return;
  }

  // --- RECYCLE BIN ---
  if (appId === "recycle-bin") {
    openWindow({
      id: "recycle-bin",
      title: "Recycle Bin",
      icon: "/icons/recycle.png",
      render: () => (
        <RecycleBin
          deletedIcons={deletedIcons}
          onRecover={recoverIcon}
          onDeleteForever={deleteForever}
        />
      ),
    });
    return;
  }

  // --- EXPLORER ---
  if (appId === "explorer") {
    openWindow({
      id: "my-computer",
      title: "My Computer",
      icon: "/icons/pc.png",
      render: () => (
        <Explorer files={fileTree} setFiles={setFileTree} openApp={openApp} />
      ),
      defaultMaximized: false,
      initialSize: { width: 600, height: 400 },
      initialPosition: { x: 100, y: 50 },
    });
    return;
  }

  // --- NOTEPAD / TEKSTUALNI FAJLOVI ---
  const desktopIcon = desktopIcons.find((i) => i.id === appId);
  if (desktopIcon && desktopIcon.type === "file" ) {
    const ext = desktopIcon.title.split(".").pop()?.toLowerCase();
    if (["txt", "md", "cs", "js", "json", "ts", "jsx", "tsx"].includes(ext!)) {
      const uniqueId = desktopIcon.id;
      openWindow({
        id: uniqueId,
        title: desktopIcon.title,
        icon: "/icons/txt.png",
        render: () => (
          <NotepadWindow
            fileName={desktopIcon.title}
            content={desktopIcon.content ?? ""}
            onSave={(file) => {
              setDesktopIcons((prev) =>
                prev.map((i) =>
                  i.id === uniqueId
                    ? { ...i, content: file.content, title: file.title }
                    : i
                )
              );
            }}
          />
        ),
        initialSize: { width: 600, height: 400 },
        initialPosition: { x: 120 + windows.length * 20, y: 80 + windows.length * 20 },
      });
      return;
    }
  }

  // --- PDF / Resume ---
  if (appId === "resume") {
    const width = window.innerWidth * 0.7;
    const height = window.innerHeight * 0.9;
    const x = window.innerWidth * 0.15;
    const y = window.innerHeight * 0.05;

    openWindow({
      id: "resume",
      title: "Resume.pdf",
      icon: "/icons/pdf.png",
      render: () => <PdfViewer fileUrl="/files/Resume.pdf" width={width} height={height} />,
      initialSize: { width, height },
      initialPosition: { x, y },
    });
    return;
  }

  // --- NOTEPAD ICON (general untitled) ---
  if (appId === "notepad") {
  const uniqueId = "notepad-" + Date.now(); // svaki put jedinstveno
  openWindow({
    id: uniqueId,
    title: extra?.title ?? "Untitled.txt",
    icon: "/icons/notepad.png",
    render: () => (
      <NotepadWindow
        fileName={extra?.title ?? "Untitled.txt"}
        content={extra?.content ?? ""}
        onSave={(file) => {
          // samo dodaj na desktop, ne utiče na GitHubWindow
          setDesktopIcons((prev) => [
            ...prev,
            {
              id: file.id,
              title: file.title,
              iconSrc: "/icons/txt.png",
              position: { x: 200, y: 200 },
              type: "file",
              content: file.content,
            },
          ]);
        }}
      />
    ),
    initialSize: { width: 600, height: 400 },
    initialPosition: { x: 120 + windows.length * 20, y: 80 + windows.length * 20 },
  });
  return;
}


  // --- GITHUB ---
  if (appId === "github") {
    openWindow({
      id: "github",
      title: "GitHub",
      icon: "/icons/github.png",
      render: () => (
        <GitHubWindow
          username="bakocn"
          openWindow={openApp}
          openFileInNotepad={openFileInNotepad
          }
        />
      ),
      initialSize: { width: 800, height: 600 },
      initialPosition: { x: 150, y: 100 },
    });
    return;
  }

  // --- DEFAULT FALLBACK ---
 if (desktopIcon && desktopIcon.type === "file" || extra?.content !== undefined) {
  const title = extra?.title ?? desktopIcon?.title ?? "Untitled.txt";
  const content = extra?.content ?? desktopIcon?.content ?? "";

  openFileInNotepad(title, content, desktopIcon?.id,extra?.fromExplorer);
  return;
}

// fallback za sve ostalo
openWindow({
  id: appId,
  title: appId.replace(/-/g, " "),
  icon: "/icons/txt.png",
  render: () => <div className="p-4">{`${appId} content...`}</div>,
});
};


  const openWindow = (
    config: Omit<AppWindow, "minimized"> & { render: () => React.ReactNode }
  ) => {
    setWindows([...windows, { ...config, minimized: false }]);
    setZOrder([...zOrder, config.id]);
  };

  const closeApp = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
    setZOrder(zOrder.filter((z) => z !== id));
  };

  const focusApp = (id: string) => {
    setZOrder([...zOrder.filter((z) => z !== id), id]);
  };

  const toggleMinimize = (id: string) => {
    setWindows(
      windows.map((w) =>
        w.id === id ? { ...w, minimized: !w.minimized } : w
      )
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {desktopMounted && (
        <Desktop
          onOpenApp={openApp}
          icons={desktopIcons}
          setIcons={setDesktopIcons}
          deletedIcons={deletedIcons}
          setDeletedIcons={setDeletedIcons}
        />
      )}

      {windows.map((w) => {
        const zIndex = zOrder.findIndex((z) => z === w.id) + 1;
        const key =
          w.id === "recycle-bin"
            ? `recycle-bin-${deletedIcons.length}`
            : w.id;

        return !w.minimized ? (
          <Window
            key={key}
            title={w.title}
            icon={w.icon}
            render={w.render}
            onClose={() => closeApp(w.id)}
            onMinimize={() => toggleMinimize(w.id)}
            onFocus={() => focusApp(w.id)}
            zIndex={zIndex}
            defaultMaximized={w.defaultMaximized}
            initialSize={w.initialSize}
            initialPosition={w.initialPosition}
          />
        ) : null;
      })}

      <Taskbar
        windows={windows}
        onToggle={toggleMinimize}
        onFocus={focusApp}
      />
    </div>
  );
}
