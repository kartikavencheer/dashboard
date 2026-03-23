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
    setTiles((data || []).slice(0, 36));
  };

  const handleDelete = async (tileId: string) => {
    await removeTileFromScene(tileId);
    setTiles((prev) => prev.filter((t) => t.tile_id !== tileId));
  };

  if (!tiles.length) return null;

  const count = tiles.length;
  const { cols, rows, centered } = getGrid(count);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col">
      <div className="flex-1 overflow-hidden">
        {centered ? (
          <div className="w-full h-full flex items-center justify-center gap-2 p-2">
            {tiles.map((t) => (
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
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="w-full h-full"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: "4px",
              padding: "4px",
            }}
          >
            {tiles.slice(0, cols * rows).map((t) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="relative overflow-hidden rounded-lg"
              >
                <FanWallTile
                  submission={t}
                  tile_id={t.tile_id}
                  onDelete={allowDelete ? handleDelete : undefined}
                  muted={muted}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 h-9 bg-black border-t border-gray-800 overflow-hidden flex items-center">
        <div
          className="whitespace-nowrap text-white text-sm font-medium"
          style={{
            display: "inline-block",
            animation: "marquee 30s linear infinite",
          }}
        >
          Welcome to CheerIT Fan Wall    Powered by CheerIT    Fan Engagement Live    Live Stream Powered by CheerIT Network
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
