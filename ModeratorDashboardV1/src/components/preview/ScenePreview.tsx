import { useEffect, useState } from "react";
import { getSceneDetails } from "../../api/moderatorApi";

export default function ScenePreview({ sceneId }: { sceneId: string }) {
  const [scene, setScene] = useState<any[]>([]);

  useEffect(() => {
    getSceneDetails(sceneId).then(setScene);
  }, [sceneId]);

  if (!scene.length) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading scene...
      </div>
    );
  }

  const uniqueScene = Array.from(
    new Map(scene.map((t: any) => [t.tile_id, t])).values(),
  );

  const cols = Math.ceil(Math.sqrt(uniqueScene.length));
  const rows = Math.ceil(uniqueScene.length / cols);

  return (
    <div className="h-full w-full overflow-hidden bg-black">
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "4px",
        }}
      >
        {uniqueScene.map((tile) => (
          <video
            key={tile.tile_id}
            src={tile.media_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover rounded-md"
          />
        ))}
      </div>
    </div>
  );
}
