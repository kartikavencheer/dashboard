// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getSceneDetails } from "../api/moderatorApi";

// export default function ScenePreview() {
//   const { sceneId } = useParams();
//   const [scene, setScene] = useState<any>(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     if (!sceneId) return;

//     getSceneDetails(sceneId).then((res) => {
//       setScene(res);

//       // wait 1 frame so DOM measures correctly
//       requestAnimationFrame(() => {
//         setReady(true);
//       });
//     });
//   }, [sceneId]);

//   const getCols = (count: number) => {
//     if (count <= 2) return 2;
//     if (count <= 4) return 2;
//     if (count <= 6) return 3;
//     if (count <= 9) return 3;
//     return 4;
//   };

//   if (!scene) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-black text-white">
//         Loading scene...
//       </div>
//     );
//   }
//   const count = scene.length;

//   const uniqueScene = Array.from(
//     new Map(scene.map((t: any) => [t.tile_id, t])).values(),
//   );

//   const cols = Math.ceil(Math.sqrt(uniqueScene.length));
//   const rows = Math.ceil(uniqueScene.length / cols);

//   return (
//     <div
//       className="fixed inset-0 grid gap-2 bg-black"
//       style={{
//         gridTemplateColumns: `repeat(${cols}, 1fr)`,
//         gridAutoRows: "1fr",
//       }}
//     >
//       {uniqueScene.map((tile: any) => (
//         <video
//           key={tile.tile_id}
//           src={tile.media_url}
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="w-full h-full object-cover rounded-lg bg-black"
//         />
//       ))}
//     </div>
//   );

//   //   const cols = Math.ceil(Math.sqrt(scene.length));

//   //   return (
//   //     <div
//   //       className="fixed inset-0 bg-black grid gap-2 overflow-hidden"
//   //       style={{
//   //         gridTemplateColumns: `repeat(${cols}, 1fr)`,
//   //       }}
//   //     >
//   //       {scene.map((tile: any) => (
//   //         <video
//   //           key={tile.tile_id}
//   //           src={tile.media_url}
//   //           autoPlay
//   //           muted
//   //           loop
//   //           playsInline
//   //           className="w-full aspect-[9/16] object-contain bg-black rounded-lg"
//   //         />
//   //       ))}
//   //     </div>
//   //   );

//   //   return (
//   //     <div
//   //       className="fixed inset-0 bg-black grid gap-2 overflow-hidden"
//   //       style={{
//   //         gridTemplateColumns: `repeat(${getCols}, 1fr)`,
//   //       }}
//   //     >
//   //       {scene.map((tile: any) => (
//   //         <video
//   //           key={tile.tile_id}
//   //           src={tile.media_url}
//   //           autoPlay
//   //           muted
//   //           loop
//   //           controls={false}
//   //           className="w-full aspect-[9/16] object-contain bg-black rounded-lg"
//   //         />
//   //       ))}
//   //     </div>
//   //   );
// }

//before code
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom"; // 👈 ADD THIS
// import { getSceneDetails } from "../api/moderatorApi";

// export default function ScenePreview() {
//   const { sceneId } = useParams();
//   const [scene, setScene] = useState<any>(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     if (!sceneId) return;

//     getSceneDetails(sceneId).then((res) => {
//       setScene(res);

//       requestAnimationFrame(() => {
//         setReady(true);
//       });
//     });
//   }, [sceneId]);

//   if (!scene || !ready) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-black text-white">
//         Loading scene...
//       </div>
//     );
//   }

//   const uniqueScene = Array.from(
//     new Map(scene.map((t: any) => [t.tile_id, t])).values(),
//   );
//   const cols = Math.ceil(Math.sqrt(uniqueScene.length));
//   const rows = Math.ceil(uniqueScene.length / cols);

//   return (
//     <div
//       className="fixed inset-0 grid bg-black overflow-hidden"
//       style={{
//         gridTemplateColumns: `repeat(${cols}, 1fr)`,
//         gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
//         gap: "4px",
//       }}
//     >
//       {uniqueScene.map((tile: any) => (
//         <video
//           key={tile.tile_id}
//           src={tile.media_url}
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="w-full h-full object-cover" // ⭐ CHANGE HERE
//         />
//       ))}
//     </div>
//   );
// }

// karti
// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   rectSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { io } from "socket.io-client";
// import { getSceneDetails } from "../api/moderatorApi";
// import Header from "../components/layout/Header";
// import Footer from "../components/layout/Footer";

// /* ================= COMPONENT ================= */

// export default function ScenePreview() {
//   const { sceneId } = useParams();

//   const [videos, setVideos] = useState<any[]>([]);
//   const [page, setPage] = useState(0);
//   const [maxPerScreen, setMaxPerScreen] = useState(12);
//   const [rotation, setRotation] = useState(false);
//   const [presentation, setPresentation] = useState(false);

//   /* ---------------- FETCH INITIAL ---------------- */
//   useEffect(() => {
//     if (!sceneId) return;
//     getSceneDetails(sceneId).then(setVideos);
//   }, [sceneId]);

//   /* ---------------- LIVE SOCKET ---------------- */
//   useEffect(() => {
//     const socket = io("http://localhost:4000"); // your backend

//     socket.on("new-tile", (tile) => {
//       setVideos((prev) => [tile, ...prev]); // live join
//     });

//     return () => socket.disconnect();
//   }, []);

//   /* ---------------- PAGINATION ---------------- */
//   const pages = Math.ceil(videos.length / maxPerScreen);

//   const pageVideos = useMemo(() => {
//     const start = page * maxPerScreen;
//     return videos.slice(start, start + maxPerScreen);
//   }, [videos, page, maxPerScreen]);

//   /* ---------------- AUTO ROTATION ---------------- */
//   useEffect(() => {
//     if (!rotation || pages <= 1) return;
//     const id = setInterval(() => {
//       setPage((p) => (p + 1) % pages);
//     }, 5000);
//     return () => clearInterval(id);
//   }, [rotation, pages]);

//   /* ---------------- GRID ---------------- */
//   const cols = Math.ceil(Math.sqrt(pageVideos.length));
//   const rows = Math.ceil(pageVideos.length / cols);

//   /* ---------------- DRAG DROP ---------------- */
//   const handleDragEnd = (event: any) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = videos.findIndex((v) => v.tile_id === active.id);
//     const newIndex = videos.findIndex((v) => v.tile_id === over.id);

//     setVideos(arrayMove(videos, oldIndex, newIndex));
//   };

//   function SortableVideo({ tile }: any) {
//     const { attributes, listeners, setNodeRef, transform, transition } =
//       useSortable({ id: tile.tile_id });

//     const style = {
//       transform: CSS.Transform.toString(transform),
//       transition,
//     };

//     return (
//       <div
//         ref={setNodeRef}
//         style={style}
//         {...attributes}
//         {...listeners}
//         className="relative rounded-xl overflow-hidden cursor-move bg-black"
//       >
//         <video
//           src={tile.media_url}
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs p-1">
//           {tile.full_name || "Fan"}
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">
//       {/* ========= HEADER ========= */}
//       {!presentation && (
//         <Header
//           title=""
//           // total={videos.length}
//           // perScreen={maxPerScreen}
//           // pages={pages}
//           // rotation={rotation}
//           // setRotation={setRotation}
//           // presentation={presentation}
//           // setPresentation={setPresentation}
//         />
//       )}

//       {/* ========= GRID WITH ANIMATION ========= */}
//       <div className="flex-1 relative overflow-hidden">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={page}
//             initial={{ x: 300, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -300, opacity: 0 }}
//             transition={{ duration: 0.4 }}
//             className="absolute inset-0 grid gap-2 p-2"
//             style={{
//               gridTemplateColumns: `repeat(${cols}, 1fr)`,
//               gridTemplateRows: `repeat(${rows}, minmax(0,1fr))`,
//             }}
//           >
//             <DndContext
//               collisionDetection={closestCenter}
//               onDragEnd={handleDragEnd}
//             >
//               <SortableContext
//                 items={pageVideos.map((v) => v.tile_id)}
//                 strategy={rectSortingStrategy}
//               >
//                 {pageVideos.map((tile) => (
//                   <SortableVideo key={tile.tile_id} tile={tile} />
//                 ))}
//               </SortableContext>
//             </DndContext>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* ========= FOOTER ========= */}
//       {!presentation && (
//         <Footer
//         // setMaxPerScreen={setMaxPerScreen}
//         // setPage={setPage}
//         // page={page}
//         // pages={pages}
//         />
//       )}
//     </div>
//   );
// }


// Rohit

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { io } from "socket.io-client";
import { getSceneDetails } from "../api/moderatorApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

/* ───────────────────────────────────────────────────────────────
   GRID LOGIC — Portrait 9:16 videos on a 16:9 screen
   Rule: max 4 columns per row (fits without overflow on 16:9).
   Row fills in order: 1 → 2 → 3 → 4, then wraps to the next row.
   Layout examples:
     n=1  → 1×1   (1 video centred)
     n=2  → 2×1
     n=3  → 3×1
     n=4  → 4×1
     n=5  → 3×2   (ceil(5/2)=3 cols keeps both rows balanced)
     n=6  → 3×2
     n=7  → 4×2
     n=8  → 4×2
     n=9  → 3×3
     n=10 → 4×3   (ceil(10/3)=4)
     n=11 → 4×3
     n=12 → 4×3
─────────────────────────────────────────────────────────────── */
function getPortraitGrid(n: number): { cols: number; rows: number } {
  if (n <= 0) return { cols: 1, rows: 1 };

  // Try rows from 1 upward; pick the first layout where cols ≤ 4
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);
    if (cols <= 4) return { cols, rows };
  }

  // Fallback (n > 16)
  const cols = 4;
  return { cols, rows: Math.ceil(n / cols) };
}

/* ================= SORTABLE VIDEO TILE ================= */
function SortableVideo({ tile }: { tile: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tile.tile_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      /*
       * KEY FIX:
       * - "flex items-center justify-center" centres the video in its cell.
       * - "overflow-hidden" clips nothing; combined with object-contain the
       *   full portrait frame is always visible with black letterbox bars
       *   on the sides (if the cell is wider than 9:16).
       */
      className="relative flex items-center justify-center overflow-hidden cursor-move bg-black rounded-xl"
    >
      {/*
       * KEY FIX: object-contain (was object-cover).
       * object-cover crops the video to fill the cell — wrong for portrait.
       * object-contain scales the video to fit inside the cell — no cropping.
       */}
      <video
        src={tile.media_url}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Overlay name tag */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-xs text-white px-2 py-1 truncate">
        {tile.full_name || "Fan"}
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function ScenePreview() {
  const { sceneId } = useParams();

  const [videos, setVideos]               = useState<any[]>([]);
  const [page, setPage]                   = useState(0);
  const [maxPerScreen, setMaxPerScreen]   = useState(12);
  const [rotation, setRotation]           = useState(false);
  const [presentation, setPresentation]   = useState(false);

  /* ── FETCH INITIAL ── */
  useEffect(() => {
    if (!sceneId) return;
    getSceneDetails(sceneId).then(setVideos);
  }, [sceneId]);

  /* ── LIVE SOCKET ── */
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("new-tile", (tile) => {
      setVideos((prev) => [tile, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  /* ── PAGINATION ── */
  const pages = Math.ceil(videos.length / maxPerScreen);

  const pageVideos = useMemo(() => {
    const start = page * maxPerScreen;
    return videos.slice(start, start + maxPerScreen);
  }, [videos, page, maxPerScreen]);

  /* ── AUTO ROTATION ── */
  useEffect(() => {
    if (!rotation || pages <= 1) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % pages);
    }, 5000);
    return () => clearInterval(id);
  }, [rotation, pages]);

  /* ── GRID DIMENSIONS ── */
  // KEY FIX: use portrait-aware grid helper instead of sqrt()
  const { cols, rows } = getPortraitGrid(pageVideos.length);

  /* ── DRAG-DROP ── */
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = videos.findIndex((v) => v.tile_id === active.id);
    const newIndex = videos.findIndex((v) => v.tile_id === over.id);
    setVideos(arrayMove(videos, oldIndex, newIndex));
  };

  /* ── RENDER ── */
  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white overflow-hidden">

      {/* ── HEADER (hidden in presentation mode) ── */}
      {!presentation && (
        <Header
          title=""
          // total={videos.length}
          // perScreen={maxPerScreen}
          // pages={pages}
          // rotation={rotation}
          // setRotation={setRotation}
          // presentation={presentation}
          // setPresentation={setPresentation}
        />
      )}

      {/* ── VIDEO GRID ── */}
      {/*
       * KEY FIX: "flex-1 min-h-0" is critical.
       * flex-1 lets this section grow, but WITHOUT min-h-0 a flex child
       * can still overflow its parent — min-h-0 overrides the default
       * min-height:auto so the grid truly stays inside the remaining space.
       */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            /*
             * KEY FIX: "absolute inset-0" makes the grid fill EXACTLY the
             * space between header and footer — no more, no less.
             * The inline gridTemplateRows uses `fr` units so rows share the
             * available height equally (no overflow).
             */
            className="absolute inset-0 grid gap-2 p-2"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows:    `repeat(${rows}, 1fr)`,
            }}
          >
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pageVideos.map((v) => v.tile_id)}
                strategy={rectSortingStrategy}
              >
                {pageVideos.map((tile) => (
                  <SortableVideo key={tile.tile_id} tile={tile} />
                ))}
              </SortableContext>
            </DndContext>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FOOTER (hidden in presentation mode) ── */}
      {!presentation && (
        <Footer
        // setMaxPerScreen={setMaxPerScreen}
        // setPage={setPage}
        // page={page}
        // pages={pages}
        />
      )}
    </div>
  );
}