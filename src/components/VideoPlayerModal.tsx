import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  src: string | null;
  title?: string;
  subtitle?: string;
  status?: string;
  onClose: () => void;
};

export default function VideoPlayerModal({
  open,
  src,
  title,
  subtitle,
  status,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTimeRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const rebufferAttemptsRef = useRef(0);
  const [buffering, setBuffering] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !src || !videoRef.current) return;
    const v = videoRef.current;
    v.currentTime = 0;
    lastTimeRef.current = 0;
    rebufferAttemptsRef.current = 0;
    setWarning(null);

    const tryPlay = async () => {
      try {
        // Start muted for maximum autoplay compatibility + smoother playback.
        // User can unmute via the player's controls.
        v.muted = true;
        await v.play();
      } catch {
        // If playback is blocked, user can press play via controls.
      }
    };

    void tryPlay();

    const tickId = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // Detect "plays for ~3 seconds then freezes" by watching time progress.
      const now = video.currentTime;
      const prev = lastTimeRef.current;
      lastTimeRef.current = now;

      if (!open) return;
      if (video.ended) return;
      if (video.paused) return;

      const didProgress = now > prev + 0.01;
      if (didProgress) {
        lastTickRef.current = null;
        return;
      }

      const start = lastTickRef.current ?? Date.now();
      lastTickRef.current = start;
      const stuckForMs = Date.now() - start;

      if (stuckForMs < 2500) return;
      if (rebufferAttemptsRef.current >= 2) {
        setWarning("Playback stalled. This usually happens when the video URL/server can’t stream beyond the initial buffer (missing range support) or the network is slow.");
        return;
      }

      rebufferAttemptsRef.current += 1;
      setBuffering(true);
      try {
        // Force a rebuffer attempt.
        const current = video.currentTime;
        video.load();
        video.currentTime = current;
        void video.play().catch(() => {
          // ignore
        });
      } catch {
        // ignore
      }
    }, 1000);

    return () => {
      window.clearInterval(tickId);
      try {
        v.pause();
      } catch {
        // ignore
      }
    };
  }, [open, src]);

  if (!open || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-panel relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 backdrop-blur transition hover:bg-black/65 active:scale-95"
          aria-label="Close player"
        >
          <X size={18} />
        </button>

        <div className="relative bg-black">
          {buffering && (
            <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/20">
              <div className="rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur">
                Buffering…
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            src={src}
            controls
            autoPlay
            muted
            preload="auto"
            playsInline
            onPlaying={() => {
              setBuffering(false);
              setWarning(null);
            }}
            onWaiting={() => setBuffering(true)}
            onStalled={() => setBuffering(true)}
            onPause={() => setBuffering(false)}
            className="h-[72vh] w-full object-contain"
          />
        </div>

        {warning && (
          <div className="border-t border-white/10 bg-slate-950/30 px-4 py-3 text-xs text-amber-100/90">
            {warning}
          </div>
        )}

        {(title || subtitle || status) && (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
            <div className="min-w-0">
              {title && (
                <div className="truncate text-sm font-semibold text-white">{title}</div>
              )}
              {subtitle && <div className="truncate text-xs text-white/60">{subtitle}</div>}
            </div>
            {status && <div className="text-xs font-semibold text-white/60">{status}</div>}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}