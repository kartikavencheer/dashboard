import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SceneRenderer from "../components/SceneRenderer";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getSceneDetails } from "../api/moderatorApi";
import { getLiveOrLastScene, goLiveScene } from "../api/mosaicLive.api";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_HISTORY_KEY = "fanwall_live_scene_history";
const ARCHIVED_SCENES_KEY = "fanwall_archived_scene_ids";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const AUDIO_MUTED_KEY = "fanwall_audio_muted";
const DEFAULT_SCENE_MS = 20000;

// FIX: Define sponsors here so the live page footer matches the preview footer
const LIVE_SPONSORS = [
  { label: "Emirates", logoSrc: "/sponsors/emirate.png" },
  { label: "Jio", logoSrc: "/sponsors/jio-logo-icon.png" },
];

function readArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function FanWallLivePage() {
  const { sceneId } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);

  const [currentSceneId, setCurrentSceneId] = useState(sceneId || "");
  const [sceneDurationMs, setSceneDurationMs] = useState(DEFAULT_SCENE_MS);
  const [isMuted, setIsMuted] = useState(true);
  const [liveEventId, setLiveEventId] = useState("");

  useEffect(() => {
    setIsMuted(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUDIO_MUTED_KEY || e.key === "fanwall_audio_changed") {
        const latest = localStorage.getItem(AUDIO_MUTED_KEY);
        if (latest === null || latest === "true") setIsMuted(true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem(AUDIO_MUTED_KEY, String(next));
    localStorage.setItem("fanwall_audio_changed", String(Date.now()));
    try {
      document.querySelectorAll("video").forEach((video) => {
        try {
          video.muted = next;
          if (!next) {
            const p = video.play();
            if (p && typeof (p as Promise<void>).catch === "function")
              (p as Promise<void>).catch(() => {});
          }
        } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (sceneId) setCurrentSceneId(sceneId);
  }, [sceneId]);

  useEffect(() => {
    const eventId = localStorage.getItem(LIVE_EVENT_KEY) || "";
    setLiveEventId(eventId);
  }, []);

  useEffect(() => {
    if (!liveEventId) return;

    const extractScene = (payload: any) => {
      const mode = payload?.mode || payload?.data?.mode || "";
      const scene = payload?.scene || payload?.data?.scene || payload?.data || payload;
      const selectedSceneId = scene?.scene_id || "";
      return { mode, sceneId: selectedSceneId };
    };

    const syncFromBackend = async () => {
      try {
        const payload = await getLiveOrLastScene(liveEventId);
        const { mode, sceneId: backendSceneId } = extractScene(payload);
        if (
          (mode === "LIVE" || mode === "PLAYING") &&
          backendSceneId &&
          backendSceneId !== currentSceneId
        ) {
          goToScene(backendSceneId);
        }
      } catch (err) {
        console.error("live-or-last poll failed:", err);
      }
    };

    void syncFromBackend();
    const id = window.setInterval(syncFromBackend, 5000);
    return () => window.clearInterval(id);
  }, [liveEventId, currentSceneId]);

  useEffect(() => {
    if (!currentSceneId) return;
    localStorage.setItem(LIVE_ACTIVE_KEY, currentSceneId);

    const archived = readArray(ARCHIVED_SCENES_KEY);
    if (!archived.includes(currentSceneId)) {
      const history = readArray(LIVE_HISTORY_KEY);
      if (!history.includes(currentSceneId)) {
        history.push(currentSceneId);
        writeArray(LIVE_HISTORY_KEY, history);
      }
    }

    const loadDuration = async () => {
      try {
        const data = await getSceneDetails(currentSceneId);
        const tiles = Array.isArray(data) ? data : data?.tiles || data?.data || [];
        const maxSeconds = tiles.reduce((max: number, t: any) => {
          const sec = Number(t?.duration_seconds || t?.submission?.duration_seconds || 0);
          return Math.max(max, sec);
        }, 0);
        setSceneDurationMs(maxSeconds > 0 ? (maxSeconds + 1) * 1000 : DEFAULT_SCENE_MS);
      } catch {
        setSceneDurationMs(DEFAULT_SCENE_MS);
      }
    };
    loadDuration();
  }, [currentSceneId]);

  const goToScene = (nextScene: string) => {
    setCurrentSceneId(nextScene);
    localStorage.setItem(LIVE_ACTIVE_KEY, nextScene);
    navigate(`/FanWallLivePage/${nextScene}`, { replace: true });
  };

  const goNextScene = async () => {
    const archived = readArray(ARCHIVED_SCENES_KEY);
    const queue = readArray(LIVE_QUEUE_KEY).filter((id) => !archived.includes(id));
    writeArray(LIVE_QUEUE_KEY, queue);

    if (queue.length) {
      const nextQueued = queue.shift() as string;
      writeArray(LIVE_QUEUE_KEY, queue);
      try { await goLiveScene(nextQueued); } catch (err) { console.error(err); }
      goToScene(nextQueued);
      return;
    }

    const history = readArray(LIVE_HISTORY_KEY).filter((id) => !archived.includes(id));
    writeArray(LIVE_HISTORY_KEY, history);
    if (history.length <= 1) return;

    const currentIndex = history.indexOf(currentSceneId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % history.length;
    const nextHistoryScene = history[nextIndex];

    if (nextHistoryScene && nextHistoryScene !== currentSceneId) {
      try { await goLiveScene(nextHistoryScene); } catch (err) { console.error(err); }
      goToScene(nextHistoryScene);
    }
  };

  useEffect(() => {
    if (!currentSceneId) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => { void goNextScene(); }, sceneDurationMs);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [currentSceneId, sceneDurationMs]);

  useEffect(() => {
    const onBeforeUnload = () => { localStorage.removeItem(LIVE_ACTIVE_KEY); };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const hasScene = useMemo(() => Boolean(currentSceneId), [currentSceneId]);

  if (!hasScene) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        Waiting for live scene...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black text-white">
      <Header
        title="FAN WALL LIVE"
        color="green"
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <SceneRenderer sceneId={currentSceneId} muted={isMuted} />
      </div>

      {/*
       * FIX: Pass showSponsors + sponsors so the ticker strip renders
       * on the live page, exactly matching the preview page footer.
       * Previously called <Footer /> with no props so showSponsors
       * defaulted to false — only the tiny credit text showed.
       */}
      <Footer showSponsors sponsors={LIVE_SPONSORS} />
    </div>
  );
}