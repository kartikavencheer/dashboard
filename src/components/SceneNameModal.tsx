import { useState } from "react";
import { Film, Sparkles } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-6 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="hero-chip mb-3">
              <Sparkles size={14} />
              New Scene
            </div>
            <h3 className="text-2xl font-bold text-white">Create scene</h3>
            <p className="mt-2 text-sm text-white/65">
              Give this queue a memorable name before sending it to preview or live.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
            <Film size={20} />
          </div>
        </div>

        <input
          className="form-control w-full"
          placeholder="Example: Stadium Wave Intro"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {exists && (
          <p className="mt-2 text-xs text-rose-300">A scene with this name already exists.</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            disabled={exists || !name}
            onClick={() => onSubmit(name)}
            className="primary-button flex-1"
          >
            Create
          </button>

          <button onClick={onClose} className="secondary-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
