import { useEffect, useState } from "react";
import { getSceneDetails, removeTileFromScene } from "../api/moderatorApi";
import FanWallTile from "./FanWallTile";

function getGrid(count: number) {
  if (count === 1) return { cols: 1, rows: 1, centered: true };
  if (count === 2) return { cols: 2, rows: 1, centered: true };
  if (count === 3) return { cols: 3, rows: 1, centered: false };
  if (count === 4) return { cols: 4, rows: 1, centered: false };
  if (count <= 8) return { cols: 4, rows: 2, centered: false };
  if (count <= 16) return { cols: 8, rows: 2, centered: false };
  if (count <= 20) return { cols: 10, rows: 2, centered: false };
  if (count <= 24) return { cols: 12, rows: 2, centered: false };
  return { cols: 12, rows: 3, centered: false };
}

export default function SceneRenderer({ sceneId, allowDelete, muted = true }: any) {
  const [tiles, setTiles] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, [sceneId]);

  const load = async () => {
    const data = await getSceneDetails(sceneId);
    const resolvedTiles = Array.isArray(data) ? data : data?.tiles || data?.data || [];
    setTiles((resolvedTiles || []).slice(0, 36));
  };

  const handleDelete = async (tileId: string) => {
    await removeTileFromScene(tileId);
    setTiles((prev) => prev.filter((t) => t.tile_id !== tileId));
  };

  if (!tiles.length) return null;

  const count = tiles.length;
  const { cols, rows, centered } = getGrid(count);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(83,182,255,0.14),transparent_26%),linear-gradient(180deg,#04070d,#000)]">
      <div className="flex-1 overflow-hidden">
        {centered ? (
          <div className="flex h-full w-full items-center justify-center gap-3 p-3 md:p-4">
            {tiles.map((t, index) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="h-full"
                style={{
                  aspectRatio: "9/16",
                  maxHeight: "100%",
                  position: "relative",
                }}
              >
                <FanWallTile
                  submission={t}
                  tile_id={t.tile_id}
                  onDelete={allowDelete ? handleDelete : undefined}
                  muted={muted}
                  startDelayMs={Math.min(index, 12) * 120}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="h-full w-full"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: "10px",
              padding: "12px",
            }}
          >
            {tiles.slice(0, cols * rows).map((t, index) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="relative overflow-hidden rounded-[24px]"
              >
                <FanWallTile
                  submission={t}
                  tile_id={t.tile_id}
                  onDelete={allowDelete ? handleDelete : undefined}
                  muted={muted}
                  startDelayMs={Math.min(index, 12) * 120}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ticker-shell flex h-11 shrink-0 items-center overflow-hidden px-4">
        <div
          className="animate-marquee inline-block whitespace-nowrap text-sm font-semibold text-white/75"
        >
          Welcome to CheerIT Fan Wall    Powered by CheerIT    Fan Engagement Live    Live Stream Powered by CheerIT Network
        </div>
      </div>
    </div>
  );
}