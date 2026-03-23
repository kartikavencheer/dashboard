import { useState, type ChangeEvent } from "react";
import { Film, Sparkles } from "lucide-react";

export default function SceneNameModal({
  open,
  onClose,
  onSubmit,
  scenes,
}: any) {
  const [name, setName] = useState("");
  const [sponsorStart, setSponsorStart] = useState<string>("");
  const [sponsorEnd, setSponsorEnd] = useState<string>("");
  const [durationSeconds, setDurationSeconds] = useState<number>(30);

  if (!open) return null;

  const exists = scenes.some(
    (s: any) => String(s.name || "").toLowerCase() === name.toLowerCase(),
  );

  const readFile = (file: File, onDone: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (result) onDone(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSponsorUpload =
    (kind: "start" | "end") => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      readFile(file, (dataUrl) => {
        if (kind === "start") setSponsorStart(dataUrl);
        else setSponsorEnd(dataUrl);
      });
    };

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
              Give this queue a memorable name.
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
          <p className="mt-2 text-xs text-rose-300">
            A scene with this name already exists.
          </p>
        )}

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
            Scene Duration (seconds)
          </div>
          <input
            type="number"
            min={6}
            step={1}
            className="form-control w-full"
            value={durationSeconds}
            onChange={(e) => {
              const next = Number(e.target.value);
              setDurationSeconds(Number.isFinite(next) ? next : 30);
            }}
          />
          <p className="mt-2 text-xs text-white/45">
            Minimum 6s. Sponsors stay 2s at start + 2s at end.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-white/80">Start sponsor</div>
              <label className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSponsorUpload("start")}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-3 overflow-hidden rounded-[14px] border border-white/10 bg-black/40">
              {sponsorStart ? (
                <img
                  src={sponsorStart}
                  alt="Start sponsor"
                  className="h-20 w-full object-contain"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center text-[11px] text-white/35">
                  Optional
                </div>
              )}
            </div>
            {sponsorStart && (
              <button
                type="button"
                onClick={() => setSponsorStart("")}
                className="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Clear
              </button>
            )}
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-white/80">End sponsor</div>
              <label className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSponsorUpload("end")}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-3 overflow-hidden rounded-[14px] border border-white/10 bg-black/40">
              {sponsorEnd ? (
                <img
                  src={sponsorEnd}
                  alt="End sponsor"
                  className="h-20 w-full object-contain"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center text-[11px] text-white/35">
                  Optional
                </div>
              )}
            </div>
            {sponsorEnd && (
              <button
                type="button"
                onClick={() => setSponsorEnd("")}
                className="mt-2 w-full rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            disabled={exists || !name}
            onClick={() =>
              onSubmit(name, {
                sponsorStart,
                sponsorEnd,
                durationSeconds: Math.max(6, Math.round(durationSeconds || 30)),
              })
            }
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
