import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const goLiveScene = async (sceneId: string) => {
  const { data } = await api.post(`/mosaic/scene/${sceneId}/live`);
  return data;
};

export const markScenePlayed = async (sceneId: string) => {
  const { data } = await api.post(`/mosaic/scene/${sceneId}/played`);
  return data;
};

export const archiveScene = async (sceneId: string) => {
  try {
    const { data } = await api.post(`/mosaic/scene/${sceneId}/archive`);
    return data;
  } catch {
    // Compatibility fallback for APIs that only expose "played" action.
    const { data } = await api.post(`/mosaic/scene/${sceneId}/played`);
    return data;
  }
};

export const getLiveOrLastScene = async (eventId: string) => {
  const { data } = await api.get(`/mosaic/scene/${eventId}/live-or-last`);
  return data;
};



