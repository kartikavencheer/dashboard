import { useRef, useState } from "react";

const categoryColor: Record<string, string> = {
  boundary_four: "bg-yellow-400",
  six: "bg-blue-300",
  wicket: "bg-red-500",
  clap_cheer: "bg-green-500",
  wow_moment: "bg-purple-500",
};

export default function SubmissionCard({
  submission,
  onAdd,
  onRemove,
  onReject,
  isQueued,
}: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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

  return (
    <div className="bg-slate-700 rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition">
      <div className="relative h-36 bg-black cursor-pointer" onClick={toggle}>
        <video
          ref={videoRef}
          src={submission.media_url}
          className="w-full h-full object-cover"
        />

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white" />
          </div>
        )}

        {isQueued && (
          <div className="absolute top-2 right-2 bg-green-600 text-xs px-2 py-1 rounded text-white">
            Selected
          </div>
        )}
      </div>

      <div
        className={`px-3 py-1 text-black font-semibold text-sm flex justify-between ${
          categoryColor[submission.category?.code] || "bg-gray-400"
        }`}
      >
        <span className="capitalize">{submission.category?.code}</span>
        <span>OK</span>
      </div>

      <div className="px-3 py-2 text-xs flex justify-between text-white/90">
        <span className="truncate">{submission.user?.full_name}</span>
        <span>Rank {submission?.rank}</span>
      </div>

      <div className="mt-auto px-3 pb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {submission.logo_url && submission.logo_url.trim() !== "" && (
            <img
              src={submission.logo_url}
              alt="team logo"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="font-semibold text-sm">{submission.team?.name}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              isQueued
                ? onRemove(submission.submission_id)
                : onAdd(submission.submission_id)
            }
            className={`
              flex-1 rounded text-xs py-1
              cursor-pointer active:scale-95 transition
              ${
                isQueued
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            `}
          >
            {isQueued ? "Remove" : "Select"}
          </button>

          <button
            onClick={() => onReject(submission.submission_id)}
            className="
              w-16 bg-gray-600 hover:bg-gray-700
              rounded text-xs cursor-pointer
              active:scale-95 transition
            "
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

