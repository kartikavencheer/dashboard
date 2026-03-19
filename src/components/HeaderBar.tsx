// export default function HeaderBar({ events, eventId, onChange, stats }: any) {
//   return (
//     <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
//       <div className="flex items-center gap-3">
//         <h1 className="font-semibold text-lg">Moderator Dashboard</h1>

//         <select
//           value={eventId || ""}
//           onChange={(e) => onChange(e.target.value)}
//           className="bg-gray-800 px-3 py-1 rounded"
//         >
//           <option value="">Select Event</option>
//           {events.map((e: any) => (
//             <option key={e.event_id} value={e.event_id}>
//               {e.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {eventId && (
//         <div className="flex gap-6 text-sm">
//           <span className="text-green-400">● LIVE</span>
//           <span>Pending: {stats.pending}</span>
//           <span>Queue: {stats.queue}</span>
//           <span>Scenes: {stats.scenes}</span>
//         </div>
//       )}
//     </div>
//   );
// }
export default function HeaderBar() {
  return (
    <div className="flex items-center justify-between bg-slate-800/70 backdrop-blur px-6 py-4 rounded-2xl shadow-lg">
      <h1 className="text-xl font-bold">Moderator Dashboard</h1>

      <div className="flex items-center gap-6 text-sm">
        <span>● LIVE</span>
        <span>Pending: 42</span>
        <span>Queue: 6</span>
        <span>Scenes: 3</span>

        <button className="bg-blue-600 px-4 py-2 rounded-lg">
          Generate Mosaic
        </button>

        <button className="bg-green-600 px-4 py-2 rounded-lg">Push Live</button>
      </div>
    </div>
  );
}
