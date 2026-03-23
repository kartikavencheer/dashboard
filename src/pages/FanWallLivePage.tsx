import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SceneTimedSequence from "../components/SceneTimedSequence";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getLiveOrLastScene, goLiveScene } from "../api/mosaicLive.api";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_HISTORY_KEY = "fanwall_live_scene_history";
const ARCHIVED_SCENES_KEY = "fanwall_archived_scene_ids";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const AUDIO_MUTED_KEY = "fanwall_audio_muted";
const DEFAULT_LIVE_SCENE_MS = 30_000;
const SCENE_DURATION_MS_KEY_PREFIX = "fanwall_scene_duration_ms_";

// Keep the existing bottom sponsor ticker footer for Live.
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

function readSceneDurationMs(sceneId: string) {
  if (!sceneId) return DEFAULT_LIVE_SCENE_MS;
  try {
    const raw = localStorage.getItem(`${SCENE_DURATION_MS_KEY_PREFIX}${sceneId}`) || "";
    const ms = Number(raw);
    return Number.isFinite(ms) && ms >= 6000 ? Math.round(ms) : DEFAULT_LIVE_SCENE_MS;
  } catch {
    return DEFAULT_LIVE_SCENE_MS;
  }
}

export default function FanWallLivePage() {
  const { sceneId } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const goLiveCooldownUntilRef = useRef<number>(0);
  const goLiveFailCountRef = useRef<number>(0);
  const lastLivePollLogAtRef = useRef<number>(0);

  const [currentSceneId, setCurrentSceneId] = useState(sceneId || "");
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
    const readActive = () => localStorage.getItem(LIVE_ACTIVE_KEY) || "";

    const onStorage = (e: StorageEvent) => {
      if (e.key !== LIVE_ACTIVE_KEY && e.key !== "fanwall_live_active_updated") return;
      const next = readActive();
      if (next && next !== currentSceneId) goToScene(next);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [currentSceneId]);

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
        const now = Date.now();
        if (now - lastLivePollLogAtRef.current > 30_000) {
          lastLivePollLogAtRef.current = now;
          console.error("live-or-last poll failed:", err);
        }
      }
    };

    void syncFromBackend();
    const id = window.setInterval(syncFromBackend, 5000);
    return () => window.clearInterval(id);
  }, [liveEventId, currentSceneId]);

  const safeGoLiveScene = async (nextSceneId: string) => {
    const now = Date.now();
    if (now < goLiveCooldownUntilRef.current) return false;

    try {
      await goLiveScene(nextSceneId);
      goLiveFailCountRef.current = 0;
      return true;
    } catch (err) {
      goLiveFailCountRef.current += 1;
      const backoffMs = Math.min(60_000, 2000 * Math.pow(2, goLiveFailCountRef.current - 1));
      goLiveCooldownUntilRef.current = Date.now() + backoffMs;
      console.error(`goLiveScene failed (cooldown ${Math.round(backoffMs / 1000)}s):`, err);
      return false;
    }
  };

  const goNextScene = async () => {
    const archived = readArray(ARCHIVED_SCENES_KEY);
    const queue = readArray(LIVE_QUEUE_KEY).filter((id) => id && !archived.includes(id));
    writeArray(LIVE_QUEUE_KEY, queue);

    if (!queue.length) return;

    const nextQueued = queue.shift() as string;
    writeArray(LIVE_QUEUE_KEY, queue);
    localStorage.setItem("fanwall_live_queue_updated", String(Date.now()));

    const ok = await safeGoLiveScene(nextQueued);
    if (ok) goToScene(nextQueued);
  };

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

  }, [currentSceneId]);

  const goToScene = (nextScene: string) => {
    setCurrentSceneId(nextScene);
    localStorage.setItem(LIVE_ACTIVE_KEY, nextScene);
    navigate(`/FanWallLivePage/${nextScene}`, { replace: true });
  };

  useEffect(() => {
    if (!currentSceneId) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const durationMs = readSceneDurationMs(currentSceneId);
    timerRef.current = window.setTimeout(() => { void goNextScene(); }, durationMs);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [currentSceneId]);

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
        <SceneTimedSequence sceneId={currentSceneId} muted={isMuted} />
      </div>

      {/*
       * FIX: Pass showSponsors + sponsors so the ticker strip renders
       * Previously called <Footer /> with no props so showSponsors
       * defaulted to false — only the tiny credit text showed.
       */}
      <Footer showSponsors sponsors={LIVE_SPONSORS} />
    </div>
  );
}
