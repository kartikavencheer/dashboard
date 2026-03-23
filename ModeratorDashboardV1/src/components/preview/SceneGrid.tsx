// import React, { useMemo } from "react";

// type Tile = {
//   tile_id: string;
//   media_url: string;
// };

// type Props = {
//   tiles: Tile[];
// };

// export default function SceneGrid({ tiles }: Props) {
//   const uniqueTiles = useMemo(() => {
//     return Array.from(new Map(tiles.map((t) => [t.tile_id, t])).values());
//   }, [tiles]);

//   const { cols, rows } = useMemo(() => {
//     const count = uniqueTiles.length || 1;
//     const cols = Math.ceil(Math.sqrt(count));
//     const rows = Math.ceil(count / cols);
//     return { cols, rows };
//   }, [uniqueTiles]);

//   return (
//     <div className="h-full w-full overflow-hidden bg-black">
//       <div
//         className="grid h-full w-full"
//         style={{
//           gridTemplateColumns: `repeat(${cols}, 1fr)`,
//           gridTemplateRows: `repeat(${rows}, 1fr)`,
//           gap: "6px",
//         }}
//       >
//         {uniqueTiles.map((tile) => (
//           <div
//             key={tile.tile_id}
//             className="relative rounded-xl overflow-hidden bg-black shadow-md"
//           >
//             <video
//               src={tile.media_url}
//               autoPlay
//               muted
//               loop
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useMemo } from "react";

type Tile = { tile_id: string; media_url: string };
type Props = { tiles: Tile[] };

function getGrid(count: number) {
  if (count === 1) return { cols: 1, rows: 1, centered: true };
  if (count === 2) return { cols: 2, rows: 1, centered: true };
  if (count <= 4) return { cols: 2, rows: 2, centered: false };
  if (count <= 8) return { cols: 4, rows: 2, centered: false };
  return   { cols: 8, rows: 2, centered: false };
}

export default function SceneGrid({ tiles }: Props) {
  const uniqueTiles = useMemo(() =>
    Array.from(new Map(tiles.map((t) => [t.tile_id, t])).values()),
    [tiles]
  );

  const { cols, rows, centered } = useMemo(
    () => getGrid(uniqueTiles.length || 1),
    [uniqueTiles]
  );

  if (centered) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center gap-1">
        {uniqueTiles.map((tile) => (
          <div
            key={tile.tile_id}
            className="h-full overflow-hidden rounded-lg"
            style={{ aspectRatio: "9/16", maxHeight: "100%" }}
          >
            <video
              src={tile.media_url}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-black"
      style={{
        display: "grid",
        gridTemplateColumns: repeat(${cols}, 1fr),
        gridTemplateRows: repeat(${rows}, 1fr),  // ← fills height perfectly
        gap: "3px",
        padding: "3px",
      }}
    >
      {uniqueTiles.slice(0, cols * rows).map((tile) => (
        <div key={tile.tile_id} className="relative overflow-hidden rounded-md">
          <video
            src={tile.media_url}
            autoPlay muted loop playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}