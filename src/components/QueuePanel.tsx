// export default function QueuePanel({ queue }: any) {
//   return (
//     <div className="bg-white rounded shadow p-3">
//       <h2 className="font-semibold mb-2">Queue</h2>

//       {queue.map((q: any, i: number) => (
//         <div key={i} className="text-sm border-b py-1">
//           {i + 1}. {q.user_name}
//         </div>
//       ))}
//     </div>
//   );
// }
// import { Submission } from "../types/moderator.types";

// type Props = {
//   queue?: Submission[]; // optional
// };

// export default function QueuePanel({ queue = [] }: Props) {
//   return (
//     <div className="bg-white rounded shadow p-3">
//       <h2 className="font-semibold mb-2">Queue</h2>

//       {queue.length === 0 && <p className="text-gray-400 text-sm">No items</p>}

//       <div className="grid grid-cols-1 gap-3 p-3">
//         {queue.map((q, i) => (
//           <div
//             key={q.submission_id}
//             className="bg-slate-700 rounded-xl overflow-hidden shadow"
//           >
//             <video
//               src={q.submission.media_url}
//               className="w-full h-[160px] object-cover"
//             />

//             <div className="p-2 flex justify-between items-center">
//               <span className="text-sm">#{i + 1}</span>

//               <span className="text-xs text-gray-300">
//                 {q.submission.media_name}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// import { Submission } from "../types/moderator.types";

// type Props = {
//   queue?: Submission[];
// };

// export default function QueuePanel({ queue = [] }: Props) {
//   return (
//     <div className="p-3">
//       {queue.length === 0 && <p className="text-gray-400 text-sm">No items</p>}

//       <div className="grid grid-cols-1 gap-4">
//         {queue.map((q, i) => (
//           <div
//             key={q.submission_id}
//             className="bg-slate-700 rounded-xl overflow-hidden shadow"
//           >
//             <video
//               src={q.submission.media_url}
//               className="w-full h-32 object-cover"
//             />

//             <div className="px-3 py-2 flex justify-between text-xs text-white">
//               <span>#{i + 1}</span>
//               <span className="truncate max-w-[150px]">
//                 {q.submission.media_name}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// import { Submission } from "../types/moderator.types";

// type Props = {
//   queue?: Submission[];
// };

// const categoryColor: any = {
//   boundary_four: "bg-yellow-400",
//   six: "bg-blue-300",
//   wicket: "bg-red-500",
//   clap_cheer: "bg-green-500",
//   wow_moment: "bg-purple-500",
// };

// export default function QueuePanel({ queue = [] }: Props) {
//   if (!queue.length) {
//     return <p className="text-gray-400 text-sm">No items</p>;
//   }

//   return (
//     <div className="grid grid-cols-2 gap-4 p-2">
//       {queue.map((q, i) => (
//         <div
//           key={q.submission_id}
//           className="bg-slate-700 rounded-xl overflow-hidden shadow-md"
//         >
//           {/* MEDIA */}
//           <div className="relative h-32 bg-black">
//             <video
//               src={q.submission.media_url}
//               className="w-full h-full object-cover"
//             />

//             {/* play overlay */}
//             <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
//               ▶
//             </div>
//           </div>

//           {/* CATEGORY BAR */}
//           <div
//             className={`px-3 py-1 text-black font-semibold text-sm flex justify-between ${
//               categoryColor[q.submission.category.code || "FOUR"]
//             }`}
//           >
//             <span>{q.submission.category.code || "FOUR"}</span>
//             <span>✔</span>
//           </div>

//           {/* INFO */}
//           <div className="px-3 py-2 text-xs flex justify-between text-white">
//             <span className="truncate max-w-[120px]">
//               {q.submission.user.full_name}
//             </span>
//             <span>#{i + 1}</span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
import { useRef, useState } from "react";
import { Submission } from "../types/moderator.types";

type Props = {
  queue?: Submission[];
};

const categoryColor: any = {
  boundary_four: "bg-yellow-400",
  six: "bg-blue-300",
  wicket: "bg-red-500",
  clap_cheer: "bg-green-500",
  wow_moment: "bg-purple-500",
};

export default function QueuePanel({ queue = [] }: Props) {
  if (!queue.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 p-2">
      {queue.map((q, i) => (
        <QueueCard key={q.submission_id} q={q} index={i} />
      ))}
    </div>
  );
}

function QueueCard({ q, index }: { q: any; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-slate-700 rounded-xl overflow-hidden shadow-md">
      {/* MEDIA */}
      <div
        className="relative h-32 bg-black cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={q.media_url}
          className="w-full h-full object-cover"
        />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-3xl bg-black/30">
            ▶
          </div>
        )}
      </div>

      {/* CATEGORY BAR */}
      <div
        className={`px-3 py-1 text-black font-semibold text-sm flex justify-between ${
          categoryColor[q.submission.category?.code || "boundary_four"]
        }`}
      >
        <span>{q.submission.category?.code || "boundary_four"}</span>
        <span>✔</span>
      </div>

      {/* INFO */}
      <div className="px-3 py-2 text-xs flex justify-between text-white">
        <span className="truncate max-w-[120px]">
          {q.submission.user.full_name}
        </span>
        <span>#{index + 1}</span>
      </div>
    </div>
  );
}
