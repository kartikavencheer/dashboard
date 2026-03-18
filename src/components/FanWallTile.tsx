import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  const mediaUrl =
    submission?.media_url ||
    submission?.submission?.media_url ||
    submission?.video_url ||
    submission?.submission?.video_url ||
    submission?.url ||
    "";

  const thumbnailUrl =
    submission?.thumbnail_url ||
    submission?.submission?.thumbnail_url ||
    submission?.poster_url ||
    submission?.submission?.poster_url ||
    "";

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
        const entry = entries[0];
        if (entry?.isIntersecting) {
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
    if (!shouldLoad) return;
    if (!mediaUrl) return;

    const id = window.setTimeout(() => {
      setSrc(mediaUrl);
    }, Math.max(0, startDelayMs));

    return () => window.clearTimeout(id);
  }, [mediaUrl, shouldLoad, startDelayMs]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
    >
      {(teamName || teamLogoUrl || userName) && (
        <div className="absolute left-3 top-3 z-20 flex max-w-[70%] items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-2.5 py-2 text-white backdrop-blur-md">
          {teamLogoUrl && String(teamLogoUrl).trim() !== "" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <img
                src={teamLogoUrl}
                alt="team logo"
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="min-w-0 leading-tight">
            {teamName && (
              <div className="truncate text-[12px] font-semibold">{teamName}</div>
            )}
            <div className="truncate text-[11px] font-medium text-white/85">
              {userName}
            </div>
          </div>
        </div>
      )}

      {sponsorSrc && (
        <div className="absolute right-3 top-3 z-20 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/45 p-2 backdrop-blur-md">
          <img
            src={sponsorSrc}
            alt="sponsor logo"
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {onDelete && tile_id && (
        <button
          onClick={() => onDelete(tile_id)}
          aria-label="Delete tile"
          title="Delete from scene"
          className={`absolute right-2 z-20 rounded-full bg-black/65 p-1.5 text-white transition hover:bg-red-600 ${
            sponsorSrc ? "top-14" : "top-2"
          }`}
        >
          <X size={18} />
        </button>
      )}

      <video
        src={src || undefined}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload={src ? "metadata" : "none"}
        poster={thumbnailUrl || undefined}
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 py-3 text-sm font-semibold text-white">
        {userName}
      </div>
    </div>
  );
}
