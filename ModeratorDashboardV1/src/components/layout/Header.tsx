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
  const bg = color === "red" ? "bg-red-600" : "bg-green-600";

  return (
    <div
      className={`${bg} text-white px-6 py-3 flex items-center justify-between shadow-md`}
    >
      <div className="flex items-center gap-3">
        <img
          src="/src/assets/CheerITLogo9.png"
          alt="CheerIT"
          className="h-8 w-auto"
        />
        <span className="font-bold text-lg tracking-wide">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="bg-slate-800/70 hover:bg-slate-700 px-3 py-1 rounded-md font-semibold text-sm"
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>
        )}

        {onGoLive && (
          <button
            onClick={onGoLive}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-md font-semibold"
          >
            Go Live
          </button>
        )}

        <span className="animate-pulse text-xl">*</span>
      </div>
    </div>
  );
}
