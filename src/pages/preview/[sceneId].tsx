import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SceneRenderer from "../../components/SceneRenderer";
import { useParams } from "react-router-dom";
import { goLiveScene } from "../../api/mosaicLive.api";
import { getSceneDetails } from "../../api/moderatorApi";
import { LIVE_WINDOW_NAME, openNamedWindow } from "../../utils/windowTargets";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const AUDIO_MUTED_KEY = "fanwall_audio_muted";

function readQueue(): string[] {
  try {
    const raw = localStorage.getItem(LIVE_QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: string[]) {
  localStorage.setItem(LIVE_QUEUE_KEY, JSON.stringify(queue));
}

export default function ScenePreview() {
  const { sceneId } = useParams();
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Always start muted so autoplay works reliably.
    // Only unmute after an explicit user action (toggle button).
    setIsMuted(true);
  }, []);

  useEffect(() => {
    const resolveEvent = async () => {
      if (!sceneId) return;
      try {
        const details = await getSceneDetails(sceneId);
        const first = Array.isArray(details) ? details[0] : details?.tiles?.[0];
        const eventId = first?.event_id || first?.submission?.event_id || "";
        if (eventId) localStorage.setItem(LIVE_EVENT_KEY, eventId);
      } catch (err) {
        console.error("Failed to resolve event for live sync:", err);
      }
    };

    void resolveEvent();
  }, [sceneId]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem(AUDIO_MUTED_KEY, String(next));
    localStorage.setItem("fanwall_audio_changed", String(Date.now()));

    // Apply immediately within the click gesture to avoid autoplay-with-audio restrictions.
    try {
      document.querySelectorAll("video").forEach((video) => {
        try {
          video.muted = next;
          if (!next) {
            const p = video.play();
            if (p && typeof (p as Promise<void>).catch === "function") (p as Promise<void>).catch(() => {});
          }
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  };

  const handleGoLive = async () => {
    if (!sceneId) return;

    const activeScene = localStorage.getItem(LIVE_ACTIVE_KEY);

    if (!activeScene) {
      localStorage.setItem(LIVE_ACTIVE_KEY, sceneId);
      openNamedWindow(`/FanWallLivePage/${sceneId}`, LIVE_WINDOW_NAME);
    } else if (activeScene === sceneId) {
      openNamedWindow(`/FanWallLivePage/${activeScene}`, LIVE_WINDOW_NAME);
    } else {
      const queue = readQueue();
      if (!queue.includes(sceneId)) {
        queue.push(sceneId);
        writeQueue(queue);
        localStorage.setItem("fanwall_live_queue_updated", String(Date.now()));
      }

      openNamedWindow(`/FanWallLivePage/${activeScene}`, LIVE_WINDOW_NAME);
    }

    // Fire the API call after opening the tab so the click stays a user gesture.
    try {
      await goLiveScene(sceneId);
    } catch (err) {
      console.error("goLiveScene failed:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <Header
        title="FAN WALL"
        color="green"
        onGoLive={handleGoLive}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />

      <div className="flex-1 overflow-hidden">
        <SceneRenderer sceneId={sceneId!} allowDelete muted={isMuted} />
      </div>

      <Footer />
    </div>
  );
}


