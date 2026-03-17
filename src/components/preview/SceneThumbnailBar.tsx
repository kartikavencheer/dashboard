import { useEffect, useRef, useState } from "react";
import { Archive, Eye, Radio, Trash2 } from "lucide-react";
import type React from "react";
import { getSceneDetails } from "../../api/moderatorApi";
import { SCENE_THUMBNAIL_SYNC_KEY } from "../../utils/sceneRestore";
import { openNamedWindow, PREVIEW_WINDOW_NAME, setPreviewScene } from "../../utils/windowTargets";

type Props = {
  scenes: any[];
  activeSceneId?: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLive?: (id: string) => void;
  onArchive?: (id: string) => void;
};

type SceneTile = {
  tile_id?: string;
  submission_id?: string;
  media_url?: string;
  thumbnail_url?: string;
  submission?: {
    media_url?: string;
    thumbnail_url?: string;
  };
};

const sceneTileCache = new Map<string, SceneTile[]>();

function getPreviewGrid(count: number) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  if (count <= 9) return { cols: 3, rows: 3 };
  if (count <= 12) return { cols: 4, rows: 3 };
  return { cols: 4, rows: 4 };
}

function normalizeSceneTiles(data: any): SceneTile[] {
  const rawTiles = Array.isArray(data) ? data : data?.tiles || data?.data || [];
  return Array.isArray(rawTiles) ? rawTiles : [];
}

function SceneMosaicThumbnail({
  sceneId,
  fallbackThumbnail,
}: {
  sceneId: string;
  fallbackThumbnail?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tiles, setTiles] = useState<SceneTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "220px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    let active = true;

    const loadTiles = async () => {
      const cachedTiles = sceneTileCache.get(sceneId);
      if (cachedTiles) {
        setTiles(cachedTiles);
        setLoading(false);
        return;
      }

      try {
        const data = await getSceneDetails(sceneId);
        if (!active) return;
        const normalizedTiles = normalizeSceneTiles(data).slice(0, 16);
        sceneTileCache.set(sceneId, normalizedTiles);
        setTiles(normalizedTiles);
      } catch (error) {
        console.error("Failed to load scene thumbnail tiles:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadTiles();

    return () => {
      active = false;
    };
  }, [refreshToken, sceneId, shouldLoad]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SCENE_THUMBNAIL_SYNC_KEY || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue);
        if (payload?.sceneId !== sceneId) return;
        sceneTileCache.delete(sceneId);
        setLoading(true);
        setRefreshToken((value) => value + 1);
      } catch {
        sceneTileCache.delete(sceneId);
        setLoading(true);
        setRefreshToken((value) => value + 1);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [sceneId]);

  if (!loading && tiles.length) {
    const { cols, rows } = getPreviewGrid(tiles.length);

    return (
      <div
        ref={containerRef}
        className="grid h-full w-full gap-1.5 bg-slate-950 p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {tiles.slice(0, cols * rows).map((tile, index) => {
          const mediaUrl = tile.media_url || tile.submission?.media_url || "";
          const thumbnailUrl = tile.thumbnail_url || tile.submission?.thumbnail_url || "";

          return (
            <div
              key={tile.tile_id || tile.submission_id || `${sceneId}-${index}`}
              className="overflow-hidden rounded-[10px] bg-slate-900"
            >
              {mediaUrl ? (
                <video
                  src={mediaUrl}
                  poster={thumbnailUrl || undefined}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-8 items-center justify-center bg-slate-900 text-[10px] text-white/35">
                  Empty
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (fallbackThumbnail) {
    return (
      <div ref={containerRef} className="h-full w-full">
        <img
          src={fallbackThumbnail}
          alt="Scene preview"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center bg-slate-950 text-xs text-gray-400"
    >
      {shouldLoad && loading ? "Loading preview..." : "No preview"}
    </div>
  );
}

export default function SceneThumbnailBar({
  scenes,
  activeSceneId,
  onSelect,
  onPreview,
  onDelete,
  onLive,
  onArchive,
}: Props) {
  const statusColor: Record<string, string> = {
    READY: "bg-blue-500",
    QUEUED: "bg-yellow-500",
    LIVE: "bg-green-600 animate-pulse",
    PLAYING: "bg-green-600 animate-pulse",
    PLAYED: "bg-gray-500",
    ARCHIVED: "bg-gray-500",
    DRAFT: "bg-purple-600",
    PREVIEW: "bg-pink-500",
  };

  const handlePreview = async (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    // Keep the preview tab stable (no reload) and swap just the scene via localStorage.
    openNamedWindow(`/preview`, PREVIEW_WINDOW_NAME);
    setPreviewScene(sceneId);
    await onPreview?.(sceneId);
  };

  const handleDelete = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    onDelete?.(sceneId);
  };

  const handleLive = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    onLive?.(sceneId);
  };

  const handleArchive = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation();
    onArchive?.(sceneId);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
      {scenes.map((scene) => {
        const active = scene.scene_id === activeSceneId;
        const normalizedStatus = String(scene.status || "").toUpperCase();
        const uiStatus = normalizedStatus || "UNKNOWN";
        const isArchived = normalizedStatus === "ARCHIVED";
        const isLive = normalizedStatus === "LIVE" || normalizedStatus === "PLAYING";
        const canPreview = !isLive;
        const canLive = !isArchived && !isLive;
        const canArchive = isLive;
        const canDelete = true;

        return (
          <button
            key={scene.scene_id}
            onClick={() => onSelect(scene.scene_id)}
            className={`
              group relative w-full overflow-hidden rounded-[28px] text-left
              transition-all duration-300
              ${
                active
                  ? "translate-y-[-2px] ring-2 ring-cyan-300/70"
                  : "hover:-translate-y-1 hover:ring-2 hover:ring-cyan-300/35"
              }
            `}
          >
            <div className="glass-soft relative h-52 w-full overflow-hidden">
              <SceneMosaicThumbnail sceneId={scene.scene_id} fallbackThumbnail={scene.thumbnail} />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div
                className={`
                  absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white
                  ${statusColor[normalizedStatus] || "bg-gray-600"}
                `}
              >
                {uiStatus}
              </div>

              <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                Scene
              </div>

              <div
                className="
                  absolute inset-0
                  bg-slate-950/70
                  opacity-0
                  group-hover:opacity-100
                  flex items-center justify-center gap-2 p-4
                  transition-opacity duration-300
                "
              >
                {canPreview && (
                  <button
                    onClick={(e) => handlePreview(e, scene.scene_id)}
                    className="secondary-button px-3 py-2 text-xs"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                )}

                {canLive && (
                  <button
                    onClick={(e) => handleLive(e, scene.scene_id)}
                    className="primary-button px-3 py-2 text-xs"
                  >
                    <Radio size={14} />
                    Live
                  </button>
                )}

                {canArchive && (
                  <button
                    onClick={(e) => handleArchive(e, scene.scene_id)}
                    className="secondary-button px-3 py-2 text-xs"
                  >
                    <Archive size={14} />
                    Archive
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={(e) => handleDelete(e, scene.scene_id)}
                    className="danger-button px-3 py-2 text-xs"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>

              <div className="absolute bottom-0 w-full px-4 pb-4">
                <div className="truncate text-base font-semibold text-white">{scene.name}</div>
                <div className="mt-1 text-xs text-white/60">
                  Click to select this scene for review and control.
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
