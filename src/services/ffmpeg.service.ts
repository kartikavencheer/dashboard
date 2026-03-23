import { spawn } from "child_process";
import prisma from "../prisma";

export async function startLiveStream(sceneId: string) {
  const tiles = await prisma.mosaicTile.findMany({
    where: { scene_id: sceneId },
    include: { submission: true },
    orderBy: { position_index: "asc" },
  });

  const inputs = tiles.map((t) => t.submission.media_url);

  const ffmpegArgs = [];

  inputs.forEach((url) => {
    ffmpegArgs.push("-i", url);
  });

  // 2 video split example
  ffmpegArgs.push(
    "-filter_complex",
    "hstack=inputs=2",
    "-f",
    "flv",
    "rtmp://localhost/live/scene",
  );

  const ffmpeg = spawn("ffmpeg", ffmpegArgs);

  ffmpeg.stderr.on("data", (data) => {
    console.log("FFmpeg:", data.toString());
  });
}
