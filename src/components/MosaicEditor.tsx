// import { useState } from "react";
// import { createScene, previewScene, pushLive } from "../api/moderatorApi";

// export default function MosaicEditor({ eventId }) {
//   const [sceneId, setSceneId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     setLoading(true);
//     const res = await createScene(eventId);
//     setSceneId(res.data.scene_id);
//     setLoading(false);
//   };

//   const handlePreview = async () => {
//     if (!sceneId) return;
//     await previewScene(sceneId);
//     alert("Preview started");
//   };

//   const handleLive = async () => {
//     if (!sceneId) return;
//     await pushLive(sceneId);
//     alert("Scene is LIVE 🚀");
//   };

//   return (
//     <div className="p-4 space-y-3">
//       <h2 className="font-bold text-lg">Mosaic Controls</h2>

//       <button
//         onClick={handleCreate}
//         className="bg-blue-600 w-full p-3 rounded"
//         disabled={loading}
//       >
//         Create Scene From Queue
//       </button>

//       <button
//         onClick={handlePreview}
//         className="bg-yellow-500 w-full p-3 rounded"
//         disabled={!sceneId}
//       >
//         Preview Scene
//       </button>

//       <button
//         onClick={handleLive}
//         className="bg-green-600 w-full p-3 rounded"
//         disabled={!sceneId}
//       >
//         Push Live
//       </button>

//       {sceneId && (
//         <div className="text-xs text-gray-400">Scene ID: {sceneId}</div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { createScene, previewScene, pushLive } from "../api/moderatorApi";

export default function MosaicEditor({ eventId }) {
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      const data = await createScene({ eventId, name: "Auto Scene" });
      setSceneId(data.scene_id); // <-- changed
    } catch (err) {
      console.error(err);
      alert("Failed to create scene");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!sceneId) return;

    try {
      await previewScene(sceneId);
      alert("Preview started");
    } catch (err) {
      console.error(err);
      alert("Preview failed");
    }
  };

  const handleLive = async () => {
    if (!sceneId) return;

    try {
      await pushLive(sceneId);
      alert("Scene is LIVE 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to push live");
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="font-bold text-lg">Mosaic Controls</h2>

      <button
        onClick={handleCreate}
        className="bg-blue-600 w-full p-3 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Scene From Queue"}
      </button>

      <button
        onClick={handlePreview}
        className="bg-yellow-500 w-full p-3 rounded"
        disabled={!sceneId}
      >
        Preview Scene
      </button>

      <button
        onClick={handleLive}
        className="bg-green-600 w-full p-3 rounded"
        disabled={!sceneId}
      >
        Push Live
      </button>

      {sceneId && (
        <div className="text-xs text-gray-400">Scene ID: {sceneId}</div>
      )}
    </div>
  );
}

