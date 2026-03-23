import { useEffect, useState } from "react";
import { getSceneDetails, removeTileFromScene } from "../api/moderatorApi";
import FanWallTile from "./FanWallTile";

const TILES_PER_SLIDE = 48;
const SLIDE_COLS = 12;
const SLIDE_ROWS = 4;

function getGrid(count: number) {
  if (count === 1) return { cols: 1, rows: 1, centered: true, variant: "row" as const };
  if (count === 2) return { cols: 2, rows: 1, centered: true };
  if (count === 3) return { cols: 3, rows: 1, centered: false };
  if (count === 4) return { cols: 4, rows: 1, centered: true, variant: "row" as const };
  if (count <= 8) return { cols: 4, rows: 2, centered: false };
  if (count <= 16) return { cols: 8, rows: 2, centered: false };
  if (count <= 20) return { cols: 10, rows: 2, centered: false };
  if (count <= 24) return { cols: 12, rows: 2, centered: false };
  return { cols: SLIDE_COLS, rows: SLIDE_ROWS, centered: false };
}

export default function SceneRenderer({
  sceneId,
  allowDelete,
  muted = true,
  showControls = false,
}: {
  sceneId: any;
  allowDelete?: boolean;
  muted?: boolean;
  showControls?: boolean;
}) {
  const [tiles, setTiles] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    load();
  }, [sceneId]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [sceneId]);

  const load = async () => {
    const data = await getSceneDetails(sceneId);
    const resolvedTiles = Array.isArray(data) ? data : data?.tiles || data?.data || [];
    setTiles(resolvedTiles || []);
  };

  const handleDelete = async (tileId: string) => {
    await removeTileFromScene(tileId);
    setTiles((prev) => prev.filter((t) => t.tile_id !== tileId));
  };

  if (!tiles.length) return null;

  const count = tiles.length;
  const needsSlides = count > 24;

  if (needsSlides) {
    const totalSlides = Math.ceil(count / TILES_PER_SLIDE);
    const slideTiles = tiles.slice(
      currentSlide * TILES_PER_SLIDE,
      (currentSlide + 1) * TILES_PER_SLIDE
    );

    return (
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(83,182,255,0.14),transparent_26%),linear-gradient(180deg,#04070d,#000)]">

        {/* Grid */}
        <div className="flex-1 overflow-hidden">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${SLIDE_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${SLIDE_ROWS}, 1fr)`,
              gap: "2px",
              padding: "2px",
              width: "100%",
              height: "100%",
            }}
          >
            {slideTiles.map((t, index) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="relative overflow-hidden rounded-[8px]"
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
        </div>

        {/* Bottom controls — only shown when showControls=true */}
        {showControls && (
          <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-md z-[100]">
            <span className="text-xs text-white/50">
              Slide {currentSlide + 1} / {totalSlides}
            </span>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <button
                  onClick={() => setCurrentSlide((s) => s - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition"
                >
                  ← Prev
                </button>
              )}
              {currentSlide < totalSlides - 1 && (
                <button
                  onClick={() => setCurrentSlide((s) => s + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/80 transition"
                >
                  Next Slide →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Original logic for <= 24 tiles
  const { cols, rows, centered, variant } = getGrid(count) as any;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(83,182,255,0.14),transparent_26%),linear-gradient(180deg,#04070d,#000)]">
      <div className="flex-1 overflow-hidden">
        {centered ? (
          <div
            className="flex h-full items-center justify-center mx-auto"
            style={
              variant === "row"
                ? {
                    gap: "6px",
                    padding: "6px",
                    width: count === 1 ? "calc(100vh * 9 / 16)" : "100%",
                  }
                : { gap: "12px", padding: "12px", width: "100%" }
            }
          >
            {tiles.map((t, index) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="relative overflow-hidden"
                style={
                  variant === "row"
                    ? {
                        position: "relative",
                        flex: count === 1 ? "0 0 auto" : "1 1 0",
                        width: count === 1 ? "100%" : undefined,
                        alignSelf: "stretch",
                        minWidth: 0,
                      }
                    : {
                        aspectRatio: "9/16",
                        maxHeight: "100%",
                        position: "relative",
                      }
                }
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
              gap: "2px",
              padding: "2px",
            }}
          >
            {tiles.slice(0, cols * rows).map((t, index) => (
              <div
                key={t.tile_id ?? t.submission_id}
                className="relative overflow-hidden rounded-[8px]"
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
    </div>
  );
}