import { useState } from "react";
import { Film, Sparkles, LayoutGrid } from "lucide-react";

export type GridType = "1x1" | "2x1" | "3x1" | "4x4" | "6x6" | "8x8";

export const GRID_OPTIONS: { label: string; value: GridType; cols: number; rows: number }[] = [
  { label: "1 × 1  (Single)",      value: "1x1", cols: 1, rows: 1 },
  { label: "2 × 1  (Side by Side)", value: "2x1", cols: 2, rows: 1 },
  { label: "3 × 1  (Trio Row)",    value: "3x1", cols: 3, rows: 1 },
  { label: "4 × 4  (16 tiles)",    value: "4x4", cols: 4, rows: 4 },
  { label: "6 × 6  (36 tiles)",    value: "6x6", cols: 6, rows: 6 },
  { label: "8 × 8  (64 tiles)",    value: "8x8", cols: 8, rows: 8 },
];

export function gridConfigFromType(type: GridType) {
  return GRID_OPTIONS.find((o) => o.value === type) ?? GRID_OPTIONS[0];
}

function GridPreview({ cols, rows }: { cols: number; rows: number }) {
  const displayCols = Math.min(cols, 4);
  const displayRows = Math.min(rows, 4);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${displayCols}, 1fr)`,
        gridTemplateRows: `repeat(${displayRows}, 1fr)`,
        gap: "2px",
        width: 40,
        height: 32,
      }}
    >
      {Array.from({ length: displayCols * displayRows }).map((_, i) => (
        <div key={i} className="rounded-[2px] bg-current opacity-70" />
      ))}
    </div>
  );
}

export default function SceneNameModal({
  open,
  onClose,
  onSubmit,
  scenes,
}: any) {
  const [name, setName] = useState("");
  const [gridType, setGridType] = useState<GridType>("2x1");

  if (!open) return null;

  const exists = scenes.some(
    (s: any) => s.name.toLowerCase() === name.toLowerCase(),
  );

  const selectedGrid = gridConfigFromType(gridType);

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
              Give this queue a memorable name and choose a grid layout.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
            <Film size={20} />
          </div>
        </div>

        {/* Scene name */}
        <input
          className="form-control w-full"
          placeholder="Example: Stadium Wave Intro"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {exists && (
          <p className="mt-2 text-xs text-rose-300">A scene with this name already exists.</p>
        )}

        {/* Grid selector */}
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/50">
            <LayoutGrid size={13} />
            Grid Layout
          </div>
          <div className="grid grid-cols-3 gap-2">
            {GRID_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGridType(opt.value)}
                className={[
                  "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition",
                  gridType === opt.value
                    ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                    : "border-white/8 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/80",
                ].join(" ")}
              >
                <GridPreview cols={opt.cols} rows={opt.rows} />
                <span className="text-[10px] font-semibold leading-tight">{opt.value}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">
            {selectedGrid.cols} × {selectedGrid.rows} ={" "}
            {selectedGrid.cols * selectedGrid.rows} tile
            {selectedGrid.cols * selectedGrid.rows !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            disabled={exists || !name}
            onClick={() => onSubmit(name, gridType)}
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
