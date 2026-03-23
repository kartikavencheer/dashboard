import { Radio, Volume2, VolumeX } from "lucide-react";
import logo from "../../assets/CheerITLogo9.png";

export default function Header({
  title,
  color = "green",
  onGoLive,
  isMuted,
  onToggleMute,
}: {
  title: string;
  color?: "green" | "red";
  onGoLive?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}) {
  const accent =
    color === "red"
      ? "from-rose-500/90 via-orange-400/80 to-amber-300/70"
      : "from-emerald-400/80 via-cyan-400/70 to-blue-500/70";

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-slate-950/70 px-5 py-4 text-white backdrop-blur-xl md:px-8">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%)]" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="CheerIT"
            className="h-9 w-auto"
          />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
              CheerIT Broadcast
            </div>
            <span className="font-bold text-lg tracking-wide">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="secondary-button px-3 py-2"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
          )}

          {onGoLive && (
            <button
              onClick={onGoLive}
              className="danger-button px-4 py-2"
            >
              Go Live
            </button>
          )}

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            <Radio size={14} className="animate-pulse" />
            On Air
          </div>
        </div>
      </div>
    </div>
  );
}
