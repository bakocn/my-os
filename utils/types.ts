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
  path?:string,
  type: "file" | "folder" | "songs" | "dir" | "videos" | "pictures";
  children?: FileItem[];
  content?: string; // <--- dodaj ovo
  download_url?: string;
  html_url?: string;
  url?:string;
};
export type Repo = { id: number; name: string; html_url: string; description: string | null; };
export type ClipboardItem<T> = { item: T; action: "copy" | "cut" };