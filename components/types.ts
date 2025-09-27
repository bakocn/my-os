// types.ts
export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type AppWindow = {
  id: string;
  title: string;
  icon: string;
  render: () => React.ReactNode;
  minimized: boolean; // OBAVEZNO sada
  defaultMaximized?: boolean;
  initialSize?: Size;
  initialPosition?: Position;
};

export type IconItem = {
  id: string;
  title: string;
  iconSrc: string;
  position: Position;
  type: "file" | "folder" | "txt" | "recycle" | "explorer" | "notepad" | "github";
  content?: string; // za tekstualne fajlove
};

export type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileItem[];
  content?: string; // <--- dodaj ovo
  download_url?: string;
  html_url?: string;
};
