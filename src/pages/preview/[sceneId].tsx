import { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SceneRenderer from "../../components/SceneRenderer";
import { useParams } from "react-router-dom";
import { goLiveScene } from "../../api/mosaicLive.api";
import { getSceneDetails } from "../../api/moderatorApi";
import {
  LIVE_WINDOW_NAME,
  openNamedWindow,
  PREVIEW_SCENE_ID_KEY,
  PREVIEW_SCENE_UPDATED_KEY,
  setPreviewScene,
} from "../../utils/windowTargets";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const AUDIO_MUTED_KEY = "fanwall_audio_muted";

const PREVIEW_SPONSORS = [
  { label: "Emirates", logoSrc: "/sponsors/emirate.png" },
  { label: "Jio", logoSrc: "/sponsors/jio-logo-icon.png" },
];

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
  const { sceneId: routeSceneId } = useParams();
  const [sceneId, setSceneId] = useState<string | null>(routeSceneId ?? null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (routeSceneId) {
      setSceneId(routeSceneId);
      setPreviewScene(routeSceneId);
      return;
    }

    const readStored = () => localStorage.getItem(PREVIEW_SCENE_ID_KEY);
    setSceneId(readStored());

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key !== PREVIEW_SCENE_UPDATED_KEY &&
        event.key !== PREVIEW_SCENE_ID_KEY
      ) {
        return;
      }
      setSceneId(readStored());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [routeSceneId]);

  useEffect(() => {
    setIsMuted(true);
    localStorage.setItem(AUDIO_MUTED_KEY, "true");
    localStorage.setItem("fanwall_audio_changed", String(Date.now()));

    try {
      document.querySelectorAll("video").forEach((video) => {
        try {
          video.muted = true;
          const p = video.play();
          if (p && typeof (p as Promise<void>).catch === "function")
            (p as Promise<void>).catch(() => {});
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
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

    try {
      const videos = Array.from(document.querySelectorAll("video"));
      videos.forEach((video) => {
        try {
          video.muted = next;
          if (!next) {
            const p = video.play();
            if (p && typeof (p as Promise<void>).catch === "function")
              (p as Promise<void>).catch(() => {});
          }
        } catch {
          // ignore
        }
      });

      if (!next) {
        const ensurePlayback = async () => {
          try {
            await Promise.all(
              videos.map(async (video) => {
                try {
                  await video.play();
                } catch {
                  // ignore
                }
              }),
            );
          } catch {
            // ignore
          }

          const blocked = videos.some((video) => video.paused);
          if (blocked) {
            setIsMuted(true);
            localStorage.setItem(AUDIO_MUTED_KEY, "true");
            localStorage.setItem("fanwall_audio_changed", String(Date.now()));
            videos.forEach((video) => {
              try {
                video.muted = true;
                void video.play().catch(() => {});
              } catch {
                // ignore
              }
            });
          }
        };
        void ensurePlayback();
      }
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

      {/*
       * FIX: Added min-h-0.
       * Without min-h-0, a flex child in a column container defaults to
       * min-height:auto, which lets it grow beyond the available space and
       * push into (or behind) the Footer. min-h-0 forces it to respect
       * the flex layout and stay between Header and Footer.
       */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {sceneId ? (
          <SceneRenderer sceneId={sceneId} allowDelete muted={isMuted} />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/70">
            Select a scene and click Preview to show it here.
          </div>
        )}
      </div>

      <Footer showSponsors sponsors={PREVIEW_SPONSORS} />
    </div>
  );
}