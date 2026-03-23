import React from "react";

type Props = {
  scenes: any[];
  activeSceneId?: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLive?: (id: string) => void;
  onArchive?: (id: string) => void;
};

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
    const previewWindow = window.open(`/moderator/preview/${sceneId}`, "_blank");
    await onPreview?.(sceneId);
    previewWindow?.location.reload();
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
    <div className="flex flex-col gap-3 overflow-y-auto h-full p-2">
      {scenes.map((scene) => {
        const active = scene.scene_id === activeSceneId;
        const normalizedStatus = String(scene.status || "").toUpperCase();
        const uiStatus = normalizedStatus || "UNKNOWN";
        const isArchived = normalizedStatus === "ARCHIVED";

        return (
          <button
            key={scene.scene_id}
            onClick={() => onSelect(scene.scene_id)}
            className={`
              group relative w-full h-44 rounded-xl overflow-hidden
              transition-all duration-200
              ${
                active
                  ? "ring-4 ring-blue-500"
                  : "hover:ring-2 hover:ring-blue-400"
              }
            `}
          >
            <div className="relative w-full h-full bg-black">
              {scene.thumbnail ? (
                <img
                  src={scene.thumbnail}
                  alt={scene.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  No preview
                </div>
              )}

              <div
                className={`
                  absolute top-2 left-2 text-[10px]
                  px-2 py-1 rounded text-white
                  ${statusColor[normalizedStatus] || "bg-gray-600"}
                `}
              >
                {uiStatus}
              </div>

              <div
                className="
                  absolute inset-0
                  bg-black/60
                  opacity-0
                  group-hover:opacity-100
                  flex items-center justify-center gap-2
                  transition-opacity
                "
              >
                <button
                  onClick={(e) => handlePreview(e, scene.scene_id)}
                  className="bg-yellow-500 px-3 py-1 rounded text-xs font-semibold"
                >
                  Preview
                </button>

                {!isArchived && (
                  <button
                    onClick={(e) => handleLive(e, scene.scene_id)}
                    className="bg-green-600 px-3 py-1 rounded text-xs font-semibold"
                  >
                    Live
                  </button>
                )}

                {!isArchived && (
                  <button
                    onClick={(e) => handleArchive(e, scene.scene_id)}
                    className="bg-slate-600 px-3 py-1 rounded text-xs font-semibold"
                  >
                    Archive
                  </button>
                )}

                {(normalizedStatus === "DRAFT" || normalizedStatus === "PREVIEW") && (
                  <button
                    onClick={(e) => handleDelete(e, scene.scene_id)}
                    className="bg-red-600 px-3 py-1 rounded text-xs font-semibold"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="absolute bottom-0 w-full bg-black/70 text-white text-xs text-center py-1 truncate px-2">
                {scene.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


