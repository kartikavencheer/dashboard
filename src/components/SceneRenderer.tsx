import { useCallback, useEffect, useRef, useState } from "react";
import { getSceneDetails, removeTileFromScene } from "../api/moderatorApi";

/*
 * ROOT CAUSES OF STUCK/STUTTERING VIDEOS
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. autoPlay attribute DOES NOT re-fire after programmatic video.src changes.
 *    You must call video.play() explicitly after video.load().
 *
 * 2. Browsers hardware-decode ~4 videos simultaneously max.
 *    16-20 videos all playing → 12-16 fall back to software decode → CPU
 *    saturates → ALL videos stutter, not just the extras.
 *
 * FIXES
 * ─────────────────────────────────────────────────────────────────────────────
 * - Explicit video.play() called after canplay fires (not just after load)
 * - IntersectionObserver on each tile: pause when off-screen, play when visible
 *   This caps concurrent decoders to only what's actually on screen
 * - Batch src assignment (4 at a time) to avoid network saturation
 * - preload="none" until src is assigned — zero network cost for unloaded tiles
 * - video.load() + play() wrapped in try/catch — browser may block autoplay
 *   with audio; falls back to muted play silently
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BATCH_SIZE    = 4;
const BATCH_TIMEOUT = 3500;
const TARGET_AR     = 9 / 16;
const MAX_ROWS      = 3;
const MAX_COLS      = 10;

function getOptimalGrid(n: number, W: number, H: number) {
  if (n <= 0) return { cols: 1, rows: 1 };
  if (W < 100 || H < 100) {
    const rows = n <= 4 ? 1 : n <= 12 ? 2 : 3;
    return { cols: Math.min(Math.ceil(n / rows), MAX_COLS), rows };
  }
  let best = { cols: n, rows: 1, score: Infinity };
  for (let rows = 1; rows <= Math.min(n, MAX_ROWS); rows++) {
    const cols  = Math.min(Math.ceil(n / rows), MAX_COLS);
    const score = Math.abs(Math.log((W / cols) / (H / rows) / TARGET_AR));
    if (score < best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

/* ─────────────────── Single tile ─────────────────── */
type TileProps = {
  tile:     any;
  active:   boolean;   // true = allowed to load src
  muted:    boolean;
  onDelete?: (id: string) => void;
  onReady:  (id: string) => void;
};

function QueuedTile({ tile, active, muted, onDelete, onReady }: TileProps) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const timerRef     = useRef<number | null>(null);
  const readyFired   = useRef(false);  // ensure onReady called exactly once
  const srcAssigned  = useRef(false);

  const mediaUrl =
    tile?.media_url || tile?.submission?.media_url ||
    tile?.video_url || tile?.url || "";

  const thumbnail =
    tile?.thumbnail_url || tile?.submission?.thumbnail_url ||
    tile?.poster_url    || "";

  const userName =
    tile?.user_name        || tile?.user?.full_name    ||
    tile?.full_name        || tile?.submission?.user_name ||
    tile?.submission?.user?.full_name || "Fan";

  const sponsorSrc =
    (import.meta.env.VITE_SPONSOR_LOGO_PATH as string | undefined) ||
    "/sponsor-logo.svg";

  const tileId = tile.tile_id ?? tile.submission_id ?? "";

  /* ── Fire ready signal exactly once ── */
  const fireReady = useCallback(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    onReady(tileId);
  }, [tileId, onReady]);

  /* ── Assign src + explicitly call play() ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || !mediaUrl || srcAssigned.current) return;
    srcAssigned.current = true;

    video.src   = mediaUrl;
    video.muted = muted;
    video.load();

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        // Browser blocked unmuted autoplay — retry muted (silent fallback)
        try {
          video.muted = true;
          await video.play();
        } catch {
          // Still blocked (background tab etc.) — fire ready anyway
        }
      }
      fireReady();
    };

    /*
     * FIX #1: Listen for canplay THEN call play().
     * The autoPlay HTML attribute does NOT re-trigger after programmatic
     * src changes — you must call .play() yourself.
     */
    video.addEventListener("canplay", tryPlay, { once: true });
    video.addEventListener("error",   fireReady, { once: true });

    // Safety timeout — advance queue even if canplay never fires
    timerRef.current = window.setTimeout(fireReady, BATCH_TIMEOUT);

    return () => {
      video.removeEventListener("canplay",  tryPlay);
      video.removeEventListener("error",    fireReady);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, mediaUrl, muted, fireReady]);

  /* Sync muted changes after load */
  useEffect(() => {
    const video = videoRef.current;
    if (video && srcAssigned.current) video.muted = muted;
  }, [muted]);

  /*
   * FIX #2: IntersectionObserver — pause when tile scrolls/animates off
   * screen, resume when it comes back. This caps concurrent hardware
   * decoders to only what's actually visible. Without this, 16 videos all
   * decode simultaneously → CPU/GPU saturated → everything stutters.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!srcAssigned.current) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-black">
      {/* Spinner shown until src is assigned */}
      {!active && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      )}

      <video
        ref={videoRef}
        muted={muted}
        loop
        playsInline
        preload="none"
        poster={thumbnail || undefined}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Sponsor — bare img, no wrapper box */}
      {sponsorSrc && (
        <img
          src={sponsorSrc}
          alt="sponsor"
          className="absolute right-2 top-2 z-20 h-10 w-10 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      {/* Name badge — top left */}
      <div className="absolute left-2 top-2 z-20 max-w-[62%] truncate rounded-xl border border-white/10 bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-md">
        {userName}
      </div>

      {/* Delete */}
      {onDelete && tileId && (
        <button
          onClick={() => onDelete(tileId)}
          aria-label="Delete"
          className="absolute right-2 top-12 z-20 rounded-full bg-black/65 p-1 text-white transition hover:bg-red-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Name gradient — bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 py-2 text-sm font-semibold text-white">
        {userName}
      </div>
    </div>
  );
}

/* ─────────────────── Main component ─────────────────── */
export default function SceneRenderer({
  sceneId,
  allowDelete,
  muted = true,
}: any) {
  const [tiles, setTiles]       = useState<any[]>([]);
  const [activeUpTo, setActiveUpTo] = useState(0);
  const pendingRef              = useRef<Set<string>>(new Set());
  const containerRef            = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState({ cols: 4, rows: 1 });

  /* ── Fetch tiles ── */
  useEffect(() => {
    if (!sceneId) return;
    setActiveUpTo(0);
    pendingRef.current = new Set();

    (async () => {
      const data = await getSceneDetails(sceneId);
      const raw: any[] = Array.isArray(data)
        ? data : data?.tiles ?? data?.data ?? [];
      const sliced = raw.slice(0, MAX_ROWS * MAX_COLS);
      setTiles(sliced);

      // Kick off first batch
      const firstEnd = Math.min(BATCH_SIZE, sliced.length);
      pendingRef.current = new Set(
        sliced.slice(0, firstEnd).map((t: any) => t.tile_id ?? t.submission_id),
      );
      setActiveUpTo(firstEnd);
    })();
  }, [sceneId]);

  /* ── Responsive grid ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      setGridSize(getOptimalGrid(tiles.length, W, H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tiles.length]);

  /* ── Batch queue advance ── */
  const handleReady = useCallback((id: string) => {
    pendingRef.current.delete(id);
    if (pendingRef.current.size > 0) return;

    setActiveUpTo((prev) => {
      if (prev >= tiles.length) return prev;
      const nextEnd = Math.min(prev + BATCH_SIZE, tiles.length);
      pendingRef.current = new Set(
        tiles.slice(prev, nextEnd).map((t) => t.tile_id ?? t.submission_id),
      );
      return nextEnd;
    });
  }, [tiles]);

  /* ── Delete ── */
  const handleDelete = async (tileId: string) => {
    await removeTileFromScene(tileId);
    setTiles((prev) => prev.filter((t) => t.tile_id !== tileId));
  };

  if (!tiles.length) return null;

  const { cols, rows } = gridSize;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top,rgba(83,182,255,0.1),transparent 26%),linear-gradient(180deg,#04070d,#000)",
      }}
    >
      <div
        className="h-full w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows:    `repeat(${rows}, 1fr)`,
          gap:     "6px",
          padding: "6px",
          boxSizing: "border-box",
        }}
      >
        {tiles.slice(0, cols * rows).map((t, i) => (
          <div
            key={t.tile_id ?? t.submission_id}
            className="relative min-h-0 overflow-hidden rounded-[20px]"
          >
            <QueuedTile
              tile={t}
              active={i < activeUpTo}
              muted={muted}
              onDelete={allowDelete ? handleDelete : undefined}
              onReady={handleReady}
            />
          </div>
        ))}
      </div>
    </div>
  );
}