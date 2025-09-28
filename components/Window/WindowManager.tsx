"use client";
import React, { useState, useEffect } from "react";
import Desktop from "../Desktop/Desktop";
import Window from "./Window";
import Taskbar from "../Taskbar/Taskbar";
import RecycleBin from "../Desktop/RecycleBin";
import Explorer from "../Desktop/MyComputer/Explorer";
import PdfViewer from "../Desktop/MyComputer/PdfViewer";
import ImageWindow from "../Desktop/MyComputer/ImageWindow";
import NotepadWindow from "../Desktop/NotepadWindow";
import GitHubWindow from "../Desktop/GitHubWindow";
import { IconItem, FileItem, AppWindow } from "../../utils/types";
import AudioWindow from "../Desktop/MyComputer/AudioWindow";
import VideoWindow from "../Desktop/MyComputer/VideoWindow";

export default function WindowManager() {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [desktopMounted, setDesktopMounted] = useState(false);
  const [desktopIcons, setDesktopIcons] = useState<IconItem[]>([]);
  const [deletedIcons, setDeletedIcons] = useState<IconItem[]>([]);
  const asciiPC =String.raw`        ___________________
        | _______________ |
        | |*************| |
        | |****HELLO****| |
        | |*************| |
        | |****WORLD****| |
        | |*************| |
        |_________________|
            _[_______]_
        ___[___________]___
       |         [_____] []|__
       |         [_____] []|  \__
       L___________________J     \ \___\/
        ___________________      /\
       /###################\    (__)`;

let keep="";
let i=0
for(i;i<8;i++){
keep+=`${i+1}. Keep learning! \n`
};

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
            { id: "resume", name: "Resume.pdf", type: "file", url: "/files/Resume.pdf" },
            { id: "notes", name: "Notes.txt", type: "file", content: `You are the best!\nKeep grinding! \n 
${asciiPC}` },
          ],
        },
        {
          id: "todo",
          name: "todo.txt",
          type: "file",
          content: `TODO list:\n${keep}${i+1}. Find a job`,
        },
      ],
    },
    {
      id: "pictures",
      name: "Pictures",
      type: "pictures",
      children: [
        { id: "vacation", name: "Vacation.jpg", type: "file", url: "/images/vacation.jpg" },
        { id: "Me", name: "Me.png", type: "file", url: "/images/me.png"},
             { id: "Hello", name: "Hello.gif", type: "file", url: "/images/hello.gif"},
      ],
    },
     {
      id: "videos",
      name: "Videos",
      type: "videos",
      children: [
        { id: "roll", name: "Open me.mp4", type: "file", url: "/videos/roll.mp4" },

      ],
    },
     {
      id: "Songs",
      name: "Songs",
      type: "songs",
      children: [
        { id: "bring", name: "My favorite song.mp3", type: "file", url: "/songs/bring.mp3" },
      { id: "nir", name: "Fav2.wav", type: "file", url: "/songs/song2.mp3" },
      ],
    },
  ]);

  // --- opens text file in Notepad ---
  const openFileInNotepad = (title: string, content: string, id?: string, fromExplorer = false) => {
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
                setDesktopIcons((icons) =>
                  icons.map((i) =>
                    i.id === uniqueId ? { ...i, title: file.title, content: file.content } : i
                  )
                );
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
      { id: "explorer", title: "About me", iconSrc: "/icons/about-me.png", position: { x: padding, y: padding }, type: "explorer" },
      { id: "notepad", title: "Notepad", iconSrc: "/icons/notepad.png", position: { x: padding, y: padding + iconSize + verticalSpacing }, type: "notepad" },
      { id: "github", title: "My GitHub", iconSrc: "/icons/github.png", position: { x: padding, y: padding + 2 * (iconSize + verticalSpacing) }, type: "github" },
    ];

    const recycleBin: IconItem = { id: "recycle", title: "Recycle Bin", iconSrc: "/icons/recycle.png", position: { x: screenWidth - 120, y: screenHeight - 160 }, type: "recycle" };

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

  const openApp = (appId: string, extra?: { content?: string; title?: string; fromExplorer?: boolean }) => {
    const exists = windows.find((w) => w.id === appId || (w.id === "my-computer" && appId === "explorer"));
    if (exists) { focusApp(exists.id); return; }

    const findFileInTree = (items: FileItem[]): FileItem | undefined => {
      for (let i of items) {
        if (i.id === appId && i.type === "file") return i;
        if (i.children) {
          const found = findFileInTree(i.children);
          if (found) return found;
        }
      }
    };

    const fileFromTree = findFileInTree(fileTree);

    // --- IMAGE FILES ---
    if (fileFromTree) {
      const ext = (fileFromTree.name.split(".").pop() ?? "").toLowerCase();
      if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        openWindow({
          id: fileFromTree.id,
          title: fileFromTree.name,
          icon: "/icons/image.png",
          render: () => <ImageWindow fileName={fileFromTree.name} fileUrl={fileFromTree.url ?? ""} />,
          initialSize: { width: 700, height: 500 },
          initialPosition: { x: 120 + windows.length * 20, y: 80 + windows.length * 20 },
        });
        return;
      }
      if (["mp4"].includes(ext)) {
    openWindow({
      id: fileFromTree.id,
      title: fileFromTree.name,
      icon: "/icons/video.png",
      render: () => (
        <VideoWindow fileName={fileFromTree.name} fileUrl={fileFromTree.url ?? ""} />
      ),
      initialSize: { width: 740, height: 460 },
      initialPosition: { x: 120 + windows.length * 20, y: 80 + windows.length * 20 },
    });
    return;
  }

  if (["mp3", "wav"].includes(ext)) {
    openWindow({
      id: fileFromTree.id,
      title: fileFromTree.name,
      icon: "/icons/audio.png",
      
      render: () => (
        <AudioWindow fileName={fileFromTree.name} fileUrl={fileFromTree.url ?? ""} />
      ),
        initialSize: { width: 600, height: 400 },  // <-- ovde postavi veće
  initialPosition: { x: 120 + windows.length * 20, y: 80 + windows.length * 20 },
    });
    return;
  }
      // --- TEXT FILES ---
      if (["txt", "md", "cs", "js", "json", "ts", "jsx", "tsx"].includes(ext)) {
        openFileInNotepad(extra?.title ?? fileFromTree.name, extra?.content ?? fileFromTree.content ?? "", fileFromTree.id, true);
        return;
      }
      // --- PDF FILES ---
      if (ext === "pdf") {
        const width = window.innerWidth * 0.7;
        const height = window.innerHeight * 0.9;
        const x = window.innerWidth * 0.15;
        const y = window.innerHeight * 0.05;
        openWindow({
          id: fileFromTree.id,
          title: fileFromTree.name,
          icon: "/icons/pdf.png",
          render: () => <PdfViewer fileUrl={fileFromTree.url ?? ""} width={width} height={height} />,
          initialSize: { width, height },
          initialPosition: { x, y },
        });
        return;
      }
    }

    // --- RECYCLE BIN ---
    if (appId === "recycle-bin") {
      openWindow({
        id: "recycle-bin",
        title: "Recycle Bin",
        icon: "/icons/recycle.png",
        render: () => <RecycleBin deletedIcons={deletedIcons} onRecover={recoverIcon} onDeleteForever={deleteForever} />,
      });
      return;
    }

    // --- EXPLORER ---
    if (appId === "explorer") {
      openWindow({
        id: "my-computer",
        title: "My Computer",
        icon: "/icons/about-me.png",
        render: () => <Explorer files={fileTree} setFiles={setFileTree} openApp={openApp} />,
        defaultMaximized: false,
        initialSize: { width: 600, height: 400 },
        initialPosition: { x: 100, y: 50 },
      });
      return;
    }

    // --- NOTEPAD NEW ---
    if (appId === "notepad") {
      const uniqueId = "notepad-" + Date.now();
      openWindow({
        id: uniqueId,
        title: extra?.title ?? "Untitled.txt",
        icon: "/icons/notepad.png",
        render: () => (
          <NotepadWindow
            fileName={extra?.title ?? "Untitled.txt"}
            content={extra?.content ?? ""}
            onSave={(file) => {
              setDesktopIcons((prev) => [
                ...prev,
                { id: file.id, title: file.title, iconSrc: "/icons/txt.png", position: { x: 200, y: 200 }, type: "file", content: file.content },
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
        render: () => <GitHubWindow username="bakocn" openWindow={openApp} openFileInNotepad={openFileInNotepad} />,
        initialSize: { width: 800, height: 600 },
        initialPosition: { x: 150, y: 100 },
      });
      return;
    }
  };

  const openWindow = (config: Omit<AppWindow, "minimized"> & { render: () => React.ReactNode }) => {
    setWindows((prev) => [...prev, { ...config, minimized: false }]);
    setZOrder((prev) => [...prev, config.id]);
  };

  const closeApp = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
    setZOrder(zOrder.filter((z) => z !== id));
  };

  const focusApp = (id: string) => {
    setZOrder([...zOrder.filter((z) => z !== id), id]);
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {desktopMounted && <Desktop onOpenApp={openApp} icons={desktopIcons} setIcons={setDesktopIcons} deletedIcons={deletedIcons} setDeletedIcons={setDeletedIcons} />}

      {windows.map((w) => {
        const zIndex = zOrder.findIndex((z) => z === w.id) + 1;
        const key = w.id === "recycle-bin" ? `recycle-bin-${deletedIcons.length}` : w.id;

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

      <Taskbar windows={windows} onToggle={toggleMinimize} onFocus={focusApp} />
    </div>
  );
}
