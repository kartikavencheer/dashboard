export default function MosaicGrid({ tiles }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {tiles.map((t) => (
        <video
          key={t.tile_id}
          src={t.submission.video_url}
          className="w-full h-40 object-cover rounded"
          autoPlay
          muted
          loop
        />
      ))}
    </div>
  );
}
