export default function MosaicPreview({ scene }: any) {
  if (!scene?.length) return null;

  return (
    <div className="relative w-full h-[420px] bg-black rounded-xl overflow-hidden">
      {scene.map((tile: any, i: number) => (
        <video
          key={i}
          src={tile.url}
          autoPlay
          muted
          loop
          controls
          className="absolute object-cover"
          style={{
            left: `${tile.x}%`,
            top: `${tile.y}%`,
            width: `${tile.w}%`,
            height: `${tile.h}%`,
          }}
        />
      ))}
    </div>
  );
}
