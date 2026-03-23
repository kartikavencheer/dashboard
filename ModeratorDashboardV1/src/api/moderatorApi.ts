const API = import.meta.env.VITE_API_URL;

export const getEvents = async () => {
  const res = await fetch(`${API}/events/live/dropdown`);
  const json = await res.json();
  return json.data || json || [];
};

export const getTeams = (eventId: string) =>
  fetch(`${API}/events/${eventId}/teams`).then((r) => r.json());

export const getSubmissions = async (params: any = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API}/submissions/cheers?${query}`);

    if (!res.ok) throw new Error("Failed to fetch submissions");

    const json = await res.json();
    return json.data || json.submissions || json.items || json || [];
  } catch (err) {
    console.error("getSubmissions error:", err);
    return [];
  }
};

export const addToQueue = (eventId: string, submissionId: string) =>
  fetch(`${API}/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, submissionId }),
  });

export const rejectSubmission = (id: string) =>
  fetch(`${API}/submissions/${id}/reject`, { method: "PATCH" });

export const getQueue = async (eventId: string) => {
  if (!eventId) return [];

  const res = await fetch(`${API}/queue/${eventId}`);
  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const getScenes = async (eventId: string) => {
  if (!eventId) return [];

  const res = await fetch(`${API}/mosaic/scene/${eventId}`);
  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || fallback;
  } catch {
    try {
      const text = await res.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  }
};

export const createScene = async (params: {
  eventId: string;
  name: string;
  categoryId?: string;
  submissionIds?: string[];
}) => {
  const { eventId, name, categoryId, submissionIds } = params;

  const res = await fetch(`${API}/mosaic/scene`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      event_id: eventId,
      eventId,
      name,
      sceneName: name,
      category_id: categoryId,
      categoryId,
      submission_ids: submissionIds,
      submissionIds,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to create scene"));
  }

  const json = await res.json();
  return json?.data || json?.scene || json;
};

export const updateScene = async (sceneId: string, submissionId: string) => {
  const res = await fetch(`${API}/mosaic/scene/${sceneId}/tile`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ submission_id: submissionId }),
  });

  if (!res.ok) throw new Error("Failed to add tile to scene");
  return res.json();
};

export const removeTileFromScene = async (tileId: string) => {
  const res = await fetch(`${API}/mosaic/tile/${tileId}`, {
    method: "DELETE",
    headers: jsonHeaders,
  });

  if (!res.ok) throw new Error("Failed to remove tile");
  return res.json();
};

export const deleteScene = async (scene_id: string) => {
  const res = await fetch(`${API}/mosaic/scene/${scene_id}`, {
    method: "DELETE",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to delete scene"));
  }

  return res.json();
};

export const removeFromQueue = async (
  event_id: string,
  submission_id: string,
) => {
  const res = await fetch(`${API}/mosaic/queue/${event_id}/${submission_id}`, {
    method: "DELETE",
    headers: jsonHeaders,
  });

  if (!res.ok) throw new Error("Failed to remove tile");
  return res.json();
};

export const previewScene = async (sceneId: string) => {
  const res = await fetch(`${API}/mosaic/scene/${sceneId}/preview`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to preview scene");
  }

  return res.json();
};

export const pushLive = async (sceneId: string) => {
  const res = await fetch(`${API}/mosaic/scene/${sceneId}/live`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to push scene live");
  }

  return res.json();
};

export const getSceneDetails = async (sceneId: string) => {
  const res = await fetch(`${API}/mosaic/scenedetails/${sceneId}`);
  return res.json();
};

export const getCategories = async (eventId: string) => {
  const res = await fetch(`${API}/events/categories/${eventId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};

export const bulkAddToQueue = async (
  eventId: string,
  submissionIds: string[],
) => {
  const res = await fetch(`${API}/queue/addqueue/bulk`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ eventId, submissionIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to add to queue");
  }

  return res.json();
};

export const bulkReject = async (submissionIds: string[]) => {
  const res = await fetch(`${API}/queue/reject/bulk`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ submissionIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to reject submissions");
  }

  return res.json();
};

