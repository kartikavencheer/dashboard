import { X } from "lucide-react";

type Props = {
  submission: any;
  tile_id?: string;
  single?: boolean;
  onDelete?: (id: string) => void;
  muted?: boolean;
};

export default function FanWallTile({
  submission,
  tile_id,
  single = false,
  onDelete,
  muted = true,
}: Props) {
  const mediaUrl =
    submission?.media_url ||
    submission?.submission?.media_url ||
    submission?.video_url ||
    submission?.submission?.video_url ||
    submission?.url ||
    "";

  const userName =
    submission?.user_name ||
    submission?.user?.full_name ||
    submission?.full_name ||
    submission?.submission?.user_name ||
    submission?.submission?.user?.full_name ||
    "Fan";

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      {onDelete && tile_id && (
        <button
          onClick={() => onDelete(tile_id)}
          aria-label="Delete tile"
          title="Delete from scene"
          className="absolute top-1.5 right-1.5 z-20 bg-black/65 hover:bg-red-600 text-white p-1 rounded-full transition"
        >
          <X size={18} />
        </button>
      )}

      <video
        src={mediaUrl}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-0 w-full bg-black/50 text-white text-sm px-3 py-1">
        {userName}
      </div>
    </div>
  );
}
