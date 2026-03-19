import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl, resolveThumbnailUrl } from "../utils/remoteAssets";

type Props = {
  submission: any;
  tile_id?: string;
  single?: boolean;
  onDelete?: (id: string) => void;
  muted?: boolean;
  startDelayMs?: number;
  sponsorLogoSrc?: string;
};

export default function FanWallTile({
  submission,
  tile_id,
  single = false,
  onDelete,
  muted = true,
  startDelayMs = 0,
  sponsorLogoSrc,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [src, setSrc] = useState<string>("");

  const rawMediaUrl =
    submission?.media_url ||
    submission?.submission?.media_url ||
    submission?.video_url ||
    submission?.submission?.video_url ||
    submission?.url ||
    "";

  const rawThumbnailUrl =
    submission?.thumbnail_url ||
    submission?.submission?.thumbnail_url ||
    submission?.poster_url ||
    submission?.submission?.poster_url ||
    "";

  const mediaUrl = resolveMediaUrl(rawMediaUrl);
  const thumbnailUrl = resolveThumbnailUrl(rawThumbnailUrl);

  const userName =
    submission?.user_name ||
    submission?.user?.full_name ||
    submission?.full_name ||
    submission?.submission?.user_name ||
    submission?.submission?.user?.full_name ||
    "Fan";

  const teamName =
    submission?.team?.name ||
    submission?.team_name ||
    submission?.submission?.team?.name ||
    submission?.submission?.team_name ||
    "";

  const teamLogoUrl =
    submission?.logo_url ||
    submission?.team?.logo_url ||
    submission?.team?.logo ||
    submission?.team_logo_url ||
    submission?.submission?.logo_url ||
    submission?.submission?.team?.logo_url ||
    submission?.submission?.team_logo_url ||
    "";

  const sponsorSrc =
    sponsorLogoSrc ||
    (import.meta.env.VITE_SPONSOR_LOGO_PATH as string | undefined) ||
    "/sponsor-logo.svg";

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !mediaUrl) return;
    const id = window.setTimeout(
      () => setSrc(mediaUrl),
      Math.max(0, startDelayMs),
    );
    return () => window.clearTimeout(id);
  }, [mediaUrl, shouldLoad, startDelayMs]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[20px] bg-black"
    >
      {/* Video — fills cell completely, minimal crop on portrait */}
      <video
        src={src || undefined}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload={src ? "metadata" : "none"}
        poster={thumbnailUrl || undefined}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ── Top-left: team / user badge ── */}
      {(teamName || teamLogoUrl || userName) && (
        <div className="absolute left-2 top-2 z-20 flex max-w-[65%] items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-2 py-1.5 text-white backdrop-blur-md">
          {teamLogoUrl && String(teamLogoUrl).trim() !== "" && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
              <img
                src={teamLogoUrl}
                alt="team logo"
                className="h-5 w-5 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          <div className="min-w-0 leading-tight">
            {teamName && (
              <div className="truncate text-[11px] font-semibold">{teamName}</div>
            )}
            <div className="truncate text-[10px] font-medium text-white/85">
              {userName}
            </div>
          </div>
        </div>
      )}

      {/*
       * FIX: Sponsor logo — NO wrapper div at all.
       * Any container (even with bg-transparent) can show as a box if
       * the image fails or loads slowly. The <img> is placed directly
       * absolute in the corner. drop-shadow gives it visibility on any
       * background without a visible box.
       */}
      {sponsorSrc && (
        <img
          src={sponsorSrc}
          alt="sponsor"
          className="absolute right-2 top-2 z-20 h-10 w-10 object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      {/* Delete button — only shown in moderator/preview mode */}
      {onDelete && tile_id && (
        <button
          onClick={() => onDelete(tile_id)}
          aria-label="Delete tile"
          className="absolute right-2 top-12 z-20 rounded-full bg-black/65 p-1 text-white transition hover:bg-red-600"
        >
          <X size={16} />
        </button>
      )}

      {/* Bottom name gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 py-2.5 text-sm font-semibold text-white">
        {userName}
      </div>
    </div>
  );
}