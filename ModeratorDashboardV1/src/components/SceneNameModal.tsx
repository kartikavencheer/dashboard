import { useState } from "react";

export default function SceneNameModal({
  open,
  onClose,
  onSubmit,
  scenes,
}: any) {
  const [name, setName] = useState("");

  if (!open) return null;

  const exists = scenes.some(
    (s: any) => s.name.toLowerCase() === name.toLowerCase(),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 p-6 rounded w-80">
        <h3 className="mb-3 font-bold">Scene Name</h3>

        <input
          className="w-full p-2 text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {exists && (
          <p className="text-red-400 text-xs mt-1">Name already exists</p>
        )}

        <div className="flex gap-2 mt-4">
          <button
            disabled={exists || !name}
            onClick={() => onSubmit(name)}
            className="bg-blue-600 px-3 py-1 rounded flex-1"
          >
            Create
          </button>

          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
