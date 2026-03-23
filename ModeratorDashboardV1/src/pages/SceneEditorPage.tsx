// // import { useEffect, useMemo, useState } from "react";
// // import { useParams } from "react-router-dom";
// // import SceneRenderer from "../components/SceneRenderer";
// // import DragGrid from "../components/DragGrid";
// // import { ScreenConfig } from "../types/screen.types";
// // import { getSceneDetails, updateScene } from "../api/moderatorApi";
// // export type ScreenType = keyof typeof ScreenConfig;

// // type VideoItem = {
// //   id: string;
// //   url: string;
// // };

// // export default function SceneEditorPage() {
// //   const { sceneId } = useParams();

// //   //   const [scene, setScene] = useState<any>(null);

// //   type Scene = {
// //     scene_id: string;
// //     screenType: ScreenType;
// //     videos: any[];
// //   };

// //   const [scene, setScene] = useState<Scene | null>(null);
// //   const [videos, setVideos] = useState<VideoItem[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   // -------------------------
// //   // Fetch scene from backend
// //   // -------------------------
// //   useEffect(() => {
// //     if (!sceneId) return;

// //     const load = async () => {
// //       setLoading(true);

// //       const data = await getSceneDetails(sceneId);

// //       setScene(data);
// //       //   setVideos(data?.videos || []);

// //       setVideos(
// //         data?.tiles?.map((t: any) => ({
// //           id: t.tile_id,
// //           url: t.submission?.media_url,
// //         })) || [],
// //       );

// //       setLoading(false);
// //     };

// //     load();
// //   }, [sceneId]);

// //   // -------------------------
// //   // Safe grid config
// //   // -------------------------
// //   //   const { rows, cols } = useMemo(() => {
// //   //     if (!scene) return { rows: 1, cols: 1 };
// //   //     return ScreenConfig[scene.screenType];
// //   //   }, [scene]);

// //   const grid = useMemo(() => {
// //     if (!scene?.screenType) {
// //       return { rows: 1, cols: 1 };
// //     }

// //     return ScreenConfig[scene.screenType] || { rows: 1, cols: 1 };
// //   }, [scene]);

// //   const { rows, cols } = grid;

// //   // -------------------------
// //   // Add videos
// //   // -------------------------
// //   const addVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;

// //     const files = Array.from(e.target.files);

// //     const newVideos = files.map((f) => ({
// //       id: crypto.randomUUID(),
// //       url: URL.createObjectURL(f),
// //     }));

// //     setVideos((prev) => [...prev, ...newVideos]);
// //   };

// //   // -------------------------
// //   // Remove video
// //   // -------------------------
// //   const removeVideo = (id: string) => {
// //     setVideos((prev) => prev.filter((v) => v.id !== id));
// //   };

// //   // -------------------------
// //   // Save scene
// //   // -------------------------
// //   const handleSave = async (submission_id: string) => {
// //     if (!sceneId) return;

// //     await updateScene(sceneId, submission_id);

// //     alert("Scene saved!");
// //   };

// //   if (loading || !scene)
// //     return (
// //       <div className="h-screen flex items-center justify-center text-white">
// //         Loading scene...
// //       </div>
// //     );

// //   return (
// //     <div className="h-screen flex bg-slate-950 text-white">
// //       {/* LEFT CONTROLS */}
// //       <div className="w-72 bg-slate-900 p-5 space-y-4 border-r border-slate-800">
// //         <h2 className="font-bold text-lg">Screen Settings</h2>

// //         {/* Screen Type */}
// //         <select
// //           value={scene.screenType}
// //           onChange={(e) => setScene({ ...scene, screenType: e.target.value })}
// //           className="w-full bg-slate-800 p-2 rounded"
// //         >
// //           <option value="SMART_TV">Smart TV</option>
// //           <option value="LED_SMALL">LED Small</option>
// //           <option value="LED_MEDIUM">LED Medium</option>
// //           <option value="LED_LARGE">LED Large</option>
// //         </select>

// //         {/* Upload */}
// //         <input
// //           type="file"
// //           multiple
// //           accept="video/*"
// //           onChange={addVideos}
// //           className="w-full"
// //         />

// //         <button
// //           onClick={() => setVideos([])}
// //           className="w-full bg-red-600 hover:bg-red-700 p-2 rounded"
// //         >
// //           Clear All
// //         </button>
// //       </div>

// //       {/* CENTER PREVIEW */}
// //       <div className="flex-1 flex items-center justify-center bg-black">
// //         <DragGrid
// //           videos={videos}
// //           setVideos={setVideos}
// //           rows={rows}
// //           cols={cols}
// //           onRemove={removeVideo}
// //         />
// //       </div>

// //       {/* RIGHT PANEL */}
// //       <div className="w-80 bg-slate-900 p-5 border-l border-slate-800 space-y-4">
// //         <h2 className="font-bold text-lg">Scene Info</h2>

// //         <div className="text-sm space-y-1">
// //           <p>Total tiles: {rows * cols}</p>
// //           <p>Used: {videos.length}</p>
// //           <p>Free: {rows * cols - videos.length}</p>
// //         </div>

// //         <button
// //           onClick={handleSave}
// //           className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
// //         >
// //           Save Scene
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import DragGrid from "../components/DragGrid";
// import { ScreenConfig } from "../types/screen.types";
// import { getSceneDetails, updateScene } from "../api/moderatorApi";

// /* --------------------------------------- */
// /* Types                                  */
// /* --------------------------------------- */

// export type ScreenType = keyof typeof ScreenConfig;

// type VideoItem = {
//   id: string;
//   url: string;
// };

// type Scene = {
//   scene_id: string;
//   screenType: ScreenType;
//   tiles: any[]; // coming from backend
// };

// /* --------------------------------------- */
// /* Component                              */
// /* --------------------------------------- */

// export default function SceneEditorPage() {
//   const { sceneId } = useParams();

//   const [scene, setScene] = useState<Scene | null>(null);
//   const [videos, setVideos] = useState<VideoItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* --------------------------------------- */
//   /* Fetch Scene                            */
//   /* --------------------------------------- */

//   useEffect(() => {
//     if (!sceneId) return;

//     const load = async () => {
//       setLoading(true);

//       const data = await getSceneDetails(sceneId);

//       setScene(data);

//       // ✅ IMPORTANT: map tiles → videos
//       setVideos(
//         data?.tiles?.map((t: any) => ({
//           id: t.tile_id,
//           url: t.submission?.media_url,
//         })) || [],
//       );

//       setLoading(false);
//     };

//     load();
//   }, [sceneId]);

//   /* --------------------------------------- */
//   /* Safe Grid Config (never crashes)        */
//   /* --------------------------------------- */

//   const grid = useMemo(() => {
//     if (!scene?.screenType) return { rows: 1, cols: 1 };

//     return ScreenConfig[scene.screenType] || { rows: 1, cols: 1 };
//   }, [scene]);

//   const { rows, cols } = grid;

//   /* --------------------------------------- */
//   /* Add videos (local preview only)         */
//   /* --------------------------------------- */

//   const addVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;

//     const files = Array.from(e.target.files);

//     const newVideos = files.map((f) => ({
//       id: crypto.randomUUID(),
//       url: URL.createObjectURL(f),
//     }));

//     setVideos((prev) => [...prev, ...newVideos]);
//   };

//   /* --------------------------------------- */
//   /* Remove video                           */
//   /* --------------------------------------- */

//   const removeVideo = (id: string) => {
//     setVideos((prev) => prev.filter((v) => v.id !== id));
//   };

//   /* --------------------------------------- */
//   /* Save Scene                             */
//   /* --------------------------------------- */

//   //   const handleSave = async () => {
//   //     if (!sceneId || !scene) return;

//   //     await updateScene(sceneId, {
//   //       screenType: scene.screenType,
//   //       videos,
//   //     });

//   //     alert("Scene saved!");
//   //   };

//   const handleSave = async (submission_id: string) => {
//     if (!sceneId) return;

//     await updateScene(sceneId, submission_id);

//     alert("Scene saved!");
//   };

//   /* --------------------------------------- */
//   /* Loading                                */
//   /* --------------------------------------- */

//   if (loading || !scene) {
//     return (
//       <div className="h-screen flex items-center justify-center text-white">
//         Loading scene...
//       </div>
//     );
//   }

//   /* --------------------------------------- */
//   /* UI                                     */
//   /* --------------------------------------- */

//   return (
//     <div className="h-screen flex bg-slate-950 text-white">
//       {/* LEFT CONTROLS */}
//       <div className="w-72 bg-slate-900 p-5 space-y-4 border-r border-slate-800">
//         <h2 className="font-bold text-lg">Screen Settings</h2>

//         {/* Screen Type */}
//         <select
//           value={scene.screenType}
//           onChange={(e) =>
//             setScene({
//               ...scene,
//               screenType: e.target.value as ScreenType,
//             })
//           }
//           className="w-full bg-slate-800 p-2 rounded"
//         >
//           <option value="SMART_TV">Smart TV</option>
//           <option value="LED_SMALL">LED Small</option>
//           <option value="LED_MEDIUM">LED Medium</option>
//           <option value="LED_LARGE">LED Large</option>
//         </select>

//         {/* Upload local preview */}
//         <input
//           type="file"
//           multiple
//           accept="video/*"
//           onChange={addVideos}
//           className="w-full"
//         />

//         <button
//           onClick={() => setVideos([])}
//           className="w-full bg-red-600 hover:bg-red-700 p-2 rounded"
//         >
//           Clear All
//         </button>
//       </div>

//       {/* CENTER GRID */}
//       <div className="flex-1 flex items-center justify-center bg-black">
//         <DragGrid
//           videos={videos}
//           setVideos={setVideos}
//           rows={rows}
//           cols={cols}
//           onRemove={removeVideo}
//         />
//       </div>

//       {/* RIGHT INFO PANEL */}
//       <div className="w-80 bg-slate-900 p-5 border-l border-slate-800 space-y-4">
//         <h2 className="font-bold text-lg">Scene Info</h2>

//         <div className="text-sm space-y-1">
//           <p>Total tiles: {rows * cols}</p>
//           <p>Used: {videos.length}</p>
//           <p>Free: {rows * cols - videos.length}</p>
//         </div>

//         <button
//           onClick={handleSave}
//           className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold"
//         >
//           Save Scene
//         </button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getSceneDetails, updateScene } from "../api/moderatorApi";

const ScreenConfig = {
  SMART_TV: { rows: 1, cols: 1 },
  LED_SMALL: { rows: 2, cols: 2 },
  LED_MEDIUM: { rows: 3, cols: 3 },
  LED_LARGE: { rows: 4, cols: 4 },
} as const;

type ScreenType = keyof typeof ScreenConfig;

type VideoItem = {
  id: string;
  url: string;
};

export default function SceneEditorPage() {
  const { sceneId } = useParams();

  const [screenType, setScreenType] = useState<ScreenType>("LED_SMALL");
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // ✅ grid config
  const { rows, cols } = useMemo(() => {
    return ScreenConfig[screenType];
  }, [screenType]);

  // ✅ load videos
  useEffect(() => {
    const load = async () => {
      //   const res = await fetch(`/api/mosaic/scene/${sceneId}`);
      //   const data = await res.json();
      const data = await getSceneDetails(sceneId);

      console.log("API RESPONSE =", data);

      // ⭐⭐⭐ THIS IS THE ONLY THING YOU NEED ⭐⭐⭐
      setVideos(
        (data || []).map((s: any) => ({
          id: s.submission_id,
          url: s.media_url,
        })),
      );
    };

    load();
  }, [sceneId]);

  return (
    <div className="h-screen bg-black p-3">
      <div
        className="grid gap-2 w-full h-full"
        style={{
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const video = videos[i];

          return (
            <div key={i} className="bg-gray-900 rounded overflow-hidden">
              {video ? (
                <video
                  src={video.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                  Empty
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
