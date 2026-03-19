export function generateTilesFromQueue(queue: any[]) {
  const count = queue.length;

  if (count === 2) return split(queue);
  if (count === 3) return triangle(queue);
  if (count === 4) return grid2x2(queue);
  if (count === 6) return broadcast(queue);
  if (count >= 8) return dynamic(queue);

  return dynamic(queue);
}

function split(q: any[]) {
  return [
    { submission_id: q[0].submission_id, position_index: 0 },
    { submission_id: q[1].submission_id, position_index: 1 },
  ];
}

function triangle(q: any[]) {
  return q.map((v, i) => ({
    submission_id: v.submission_id,
    position_index: i,
  }));
}

function grid2x2(q: any[]) {
  return q.map((v, i) => ({
    submission_id: v.submission_id,
    position_index: i,
  }));
}

function broadcast(q: any[]) {
  return q.map((v, i) => ({
    submission_id: v.submission_id,
    position_index: i,
  }));
}

function dynamic(q: any[]) {
  return q.map((v, i) => ({
    submission_id: v.submission_id,
    position_index: i,
  }));
}
