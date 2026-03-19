import { useRef, useState } from "react";
import { Play, ShieldX, Sparkles, Trash2 } from "lucide-react";

const categoryColor: Record<string, string> = {
  boundary_four: "from-amber-300 to-yellow-500",
  six: "from-sky-300 to-blue-500",
  wicket: "from-rose-400 to-red-600",
  clap_cheer: "from-emerald-300 to-green-500",
  wow_moment: "from-fuchsia-400 to-violet-600",
};

function formatMaybeDateTime(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
    return value;
  }
  return String(value);
}

export default function SubmissionCard({
  submission,
  onAdd,
  onRemove,
  onReject,
  isQueued,
  onPlay,
  onDelete,
}: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  const toggle = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleVideoHoverStart = async () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = true;
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      // Autoplay might be blocked in some environments even when muted.
    }
  };

  const handleVideoHoverEnd = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  };

  const openPlayer = () => {
    handleVideoHoverEnd();
    onPlay?.(submission);
  };

  return (
    <div
      className="glass-soft group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-sky-300/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative h-44 cursor-pointer overflow-hidden bg-black ${playing ? "flex items-center justify-center" : ""}`}
        onClick={openPlayer}
        onMouseEnter={handleVideoHoverStart}
        onMouseLeave={handleVideoHoverEnd}
      >
        <video
          ref={videoRef}
          src={submission.media_url}
          muted
          playsInline
          preload="metadata"
          className={
            playing
              ? "h-full aspect-[9/16] object-contain"
              : "h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          }
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPlayer();
          }}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/90 opacity-100 backdrop-blur transition hover:bg-black/55 active:scale-95"
          aria-label="Play in player"
        >
          <Play size={16} className="ml-[1px] fill-current" />
        </button>

        {isQueued && (
          <div className="absolute left-3 top-3 rounded-full border border-emerald-300/35 bg-emerald-400/[0.18] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            In Queue
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
      
          <div className="rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold text-sky-100 backdrop-blur-md">
            {submission.team?.name || "Open Team"}
          </div>
        </div>
      </div>

      <div
        className={`flex justify-between bg-gradient-to-r px-4 py-2 text-sm font-semibold text-slate-950 ${
          categoryColor[submission.category?.code] || "from-slate-300 to-slate-400"
        }`}
      >
        <span className="capitalize">
          {submission.category?.label || submission.category?.code || "General"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles size={14} />
          Ready
        </span>
      </div>

      <div className="px-4 pt-4 text-white">
        <div className="flex items-center gap-3">
          {submission.logo_url && submission.logo_url.trim() !== "" && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <img
                src={submission.logo_url}
                alt="team logo"
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {submission.user?.full_name || "Anonymous Fan"}
            </div>
            <div className="truncate text-xs text-white/60">
              {submission.team?.name || "Independent submission"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 pb-4 pt-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-2">
            <ShieldX size={14} className="text-sky-200/80" />
            Moderation action
          </span>
          <span>{submission?.status || "Pending"}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              isQueued
                ? onRemove(submission.submission_id)
                : onAdd(submission.submission_id)
            }
            className={`flex-1 rounded-2xl px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition active:scale-95 ${
              isQueued
                ? "bg-rose-500/90 text-white hover:bg-rose-500"
                : "bg-emerald-300 text-slate-950 hover:bg-emerald-200"
            }`}
          >
            {isQueued ? "Remove" : "Select"}
          </button>

          <button
            onClick={() =>
              onDelete ? onDelete(submission) : onReject(submission.submission_id)
            }
            className="inline-flex w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/85 transition hover:bg-white/10 active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {hovered && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/70">
            <div className="flex items-center justify-between gap-3">
              <span className="uppercase tracking-[0.14em] text-white/50">Status</span>
              <span className="font-semibold text-white/80">
                {submission?.status || "Pending"}
              </span>
            </div>
            {(submission?.submission_date || submission?.submission_time) && (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="uppercase tracking-[0.14em] text-white/50">Date/Time</span>
                <span className="font-semibold text-white/80">
                  {[submission?.submission_date, submission?.submission_time]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </div>
            )}
            {submission?.created_at && (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="uppercase tracking-[0.14em] text-white/50">Created</span>
                <span className="font-semibold text-white/80">
                  {formatMaybeDateTime(submission.created_at)}
                </span>
              </div>
            )}
            {submission?.approved_at && (
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="uppercase tracking-[0.14em] text-white/50">Approved</span>
                <span className="font-semibold text-white/80">
                  {formatMaybeDateTime(submission.approved_at)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}