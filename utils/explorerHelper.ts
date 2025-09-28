import { FileItem } from "./types";

// Find file by ID recursively
export const findFile = (items: FileItem[], id: string): FileItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findFile(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Remove file by ID recursively
export const removeFile = (items: FileItem[], id: string): FileItem[] => {
  return items
    .filter(item => item.id !== id)
    .map(item => ({ ...item, children: item.children ? removeFile(item.children, id) : undefined }));
};

// Handle drag & drop
export const handleFileDrop = (
  files: FileItem[],
  draggedId: string,
  targetId: string
): FileItem[] => {
  if (draggedId === targetId) return files;

  const draggedItem = findFile(files, draggedId);
  if (!draggedItem) return files;

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

  return addToTarget(newFiles);
};

// Get icon path by file type
export const getIcon = (item: FileItem) => {
  if (item.type === "folder") return "/icons/folder.png";
  else if (item.type === "songs") return "/icons/songs.png";
  else if (item.type === "videos") return "/icons/videos.png";
    else if (item.type === "pictures") return "/icons/pictures.png";
  const ext = item.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "txt": return "/icons/txt.png";
    case "pdf": return "/icons/pdf.png";
    case "jpg": case "jpeg": case "png": case "gif": return "/icons/image.png";
    case "mp3": case "wav": return "/icons/audio.png";
    case "mp4": return "/icons/video.png";
    default: return "/icons/file.png";
  }
};
