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
import { Grid2x2, MonitorPlay, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { getSceneDetails } from "../api/moderatorApi";

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
      const data = await getSceneDetails(sceneId || "");

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
    <div className="app-shell">
      <div className="app-content flex min-h-screen flex-col gap-5 px-4 py-5 md:px-6">
        <section className="glass-panel rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="hero-chip mb-3">
                <Sparkles size={14} />
                Scene Preview
              </div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Layout review workspace</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Review how the selected scene fills different screen sizes before pushing it to a live surface.
              </p>
            </div>

            <div className="glass-soft flex flex-col gap-3 rounded-[24px] p-4 md:min-w-[320px]">
              <div className="metric-label">Display Format</div>
              <select
                value={screenType}
                onChange={(e) => setScreenType(e.target.value as ScreenType)}
                className="form-control"
              >
                <option value="SMART_TV">Smart TV</option>
                <option value="LED_SMALL">LED Small</option>
                <option value="LED_MEDIUM">LED Medium</option>
                <option value="LED_LARGE">LED Large</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                    <Grid2x2 size={14} />
                    Slots
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">{rows * cols}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                    <MonitorPlay size={14} />
                    Loaded
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white">{videos.length}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel flex-1 rounded-[32px] p-3 md:p-4">
          <div
            className="grid h-full w-full gap-3 rounded-[24px] bg-black/40 p-3"
            style={{
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => {
              const video = videos[i];

              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-950 shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
                >
                  {video ? (
                    <video
                      src={video.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
