import { IconItem } from "../../utils/types";

export default function RecycleBin({
  deletedIcons,
  onRecover,
  onDeleteForever,
}: {
  deletedIcons: IconItem[];
  onRecover: (id: string) => void;
  onDeleteForever: (id: string) => void;
}) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">🗑️ Recycle Bin</h2>
      {deletedIcons.length === 0 ? (
        <p>Recycle Bin is empty</p>
      ) : (
        <ul className="space-y-2">
          {deletedIcons.map((icon) => (
            <li
              key={icon.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded shadow"
            >
              <div className="flex items-center gap-2">
                <img src={icon.iconSrc} alt={icon.title} className="w-6 h-6" />
                <span>{icon.title}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onRecover(icon.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Recover
                </button>
                <button
                  onClick={() => onDeleteForever(icon.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete Forever
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}