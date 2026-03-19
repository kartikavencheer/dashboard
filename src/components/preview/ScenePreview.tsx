import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getSceneDetails } from "../../api/moderatorApi";

export default function ScenePreview({ sceneId }: { sceneId: string }) {
  const [scene, setScene] = useState<any[]>([]);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeMediaUrl, setActiveMediaUrl] = useState<string | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getSceneDetails(sceneId).then(setScene);
  }, [sceneId]);

  useEffect(() => {
    if (!playerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlayerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerOpen]);

  useEffect(() => {
    if (!playerOpen || !modalVideoRef.current) return;
    const v = modalVideoRef.current;
    v.currentTime = 0;
    const tryPlay = async () => {
      try {
        v.muted = false;
        await v.play();
      } catch {
        try {
          v.muted = true;
          await v.play();
        } catch {
          // If playback is still blocked, user can hit play in controls.
        }
      }
    };
    void tryPlay();
  }, [playerOpen, activeMediaUrl]);

  if (!scene.length) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading scene...
      </div>
    );
  }

  const uniqueScene = Array.from(
    new Map(scene.map((t: any) => [t.tile_id, t])).values(),
  );

  const cols = Math.ceil(Math.sqrt(uniqueScene.length));
  const rows = Math.ceil(uniqueScene.length / cols);

  return (
    <div className="h-full w-full overflow-hidden bg-black">
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "4px",
        }}
      >
        {uniqueScene.map((tile) => (
          <button
            key={tile.tile_id}
            type="button"
            onClick={() => {
              setActiveMediaUrl(tile.media_url);
              setPlayerOpen(true);
            }}
            className="group relative overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
            aria-label="Open video player"
          >
            <video
              src={tile.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {playerOpen && activeMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
          onClick={() => setPlayerOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPlayerOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 backdrop-blur transition hover:bg-black/65 active:scale-95"
              aria-label="Close player"
            >
              <X size={18} />
            </button>

            <div className="bg-black">
              <video
                ref={modalVideoRef}
                src={activeMediaUrl}
                controls
                autoPlay
                playsInline
                className="h-[72vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
