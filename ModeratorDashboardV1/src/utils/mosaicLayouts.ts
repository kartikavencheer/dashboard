export function generateMosaicLayout(videos: any[]) {
  const count = videos.length;

  if (count === 2) return splitScreen(videos);
  if (count === 3) return triangle(videos);
  if (count === 4) return grid2x2(videos);
  if (count === 6) return broadcast(videos);
  if (count >= 8) return dynamicGrid(videos);

  return dynamicGrid(videos);
}

function splitScreen(v: any[]) {
  return [
    { url: v[0].media_url, x: 0, y: 0, w: 50, h: 100 },
    { url: v[1].media_url, x: 50, y: 0, w: 50, h: 100 },
  ];
}

function triangle(v: any[]) {
  return [
    { url: v[0].media_url, x: 25, y: 0, w: 50, h: 50 },
    { url: v[1].media_url, x: 0, y: 50, w: 50, h: 50 },
    { url: v[2].media_url, x: 50, y: 50, w: 50, h: 50 },
  ];
}

function grid2x2(v: any[]) {
  return [
    { url: v[0].media_url, x: 0, y: 0, w: 50, h: 50 },
    { url: v[1].media_url, x: 50, y: 0, w: 50, h: 50 },
    { url: v[2].media_url, x: 0, y: 50, w: 50, h: 50 },
    { url: v[3].media_url, x: 50, y: 50, w: 50, h: 50 },
  ];
}

function broadcast(v: any[]) {
  const tiles: any[] = [];

  tiles.push({ url: v[0].media_url, x: 0, y: 0, w: 65, h: 100 });

  const h = 100 / 5;
  for (let i = 1; i < 6; i++) {
    tiles.push({
      url: v[i].media_url,
      x: 65,
      y: (i - 1) * h,
      w: 35,
      h,
    });
  }

  return tiles;
}

function dynamicGrid(v: any[]) {
  const n = v.length;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);

  const w = 100 / cols;
  const h = 100 / rows;

  return v.map((vid, i) => ({
    url: vid.media_url,
    x: (i % cols) * w,
    y: Math.floor(i / cols) * h,
    w,
    h,
  }));
}
