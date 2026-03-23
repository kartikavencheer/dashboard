import { useCallback, useEffect, useRef, useState } from "react";
import SceneRenderer from "./SceneRenderer";

const DEFAULT_SCENE_MS = 30_000;
const SPONSOR_START_MS = 2_000;
const SPONSOR_END_MS = 2_000;
const SCENE_DURATION_MS_KEY_PREFIX = "fanwall_scene_duration_ms_";

const SPONSOR_START_KEY_PREFIX = "fanwall_scene_sponsor_start_";
const SPONSOR_END_KEY_PREFIX = "fanwall_scene_sponsor_end_";

type Phase = "sponsorStart" | "video" | "sponsorEnd";

function getSponsorStartKey(sceneId: string) {
  return `${SPONSOR_START_KEY_PREFIX}${sceneId}`;
}

function getSponsorEndKey(sceneId: string) {
  return `${SPONSOR_END_KEY_PREFIX}${sceneId}`;
}

export default function SceneTimedSequence({
  sceneId,
  muted = true,
  allowDelete,
}: {
  sceneId: string;
  muted?: boolean;
  allowDelete?: boolean;
}) {
  const timersRef = useRef<number[]>([]);
  const cycleTimeoutRef = useRef<number | null>(null);
  const sceneIdRef = useRef(sceneId);
  const totalSlidesRef = useRef(1);
  const sceneDurationMsRef = useRef(DEFAULT_SCENE_MS);

  const [phase, setPhase] = useState<Phase>("sponsorStart");
  const [totalSlides, setTotalSlides] = useState(1);
  const [slideIndex, setSlideIndex] = useState(0);
  const [sponsorStartSrc, setSponsorStartSrc] = useState<string>("");
  const [sponsorEndSrc, setSponsorEndSrc] = useState<string>("");
  const [sceneDurationMs, setSceneDurationMs] = useState(DEFAULT_SCENE_MS);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const clearCycleTimeout = () => {
    if (cycleTimeoutRef.current) window.clearTimeout(cycleTimeoutRef.current);
    cycleTimeoutRef.current = null;
  };

  const getDurationKey = (id: string) => `${SCENE_DURATION_MS_KEY_PREFIX}${id}`;

  const loadDuration = useCallback((id: string) => {
    try {
      const raw = localStorage.getItem(getDurationKey(id)) || "";
      const ms = Number(raw);
      const safe = Number.isFinite(ms) && ms >= 6000 ? Math.round(ms) : DEFAULT_SCENE_MS;
      sceneDurationMsRef.current = safe;
      setSceneDurationMs(safe);
      return safe;
    } catch {
      sceneDurationMsRef.current = DEFAULT_SCENE_MS;
      setSceneDurationMs(DEFAULT_SCENE_MS);
      return DEFAULT_SCENE_MS;
    }
  }, []);

  const loadSponsors = useCallback(
    (id: string) => {
      try {
        setSponsorStartSrc(localStorage.getItem(getSponsorStartKey(id)) || "");
        setSponsorEndSrc(localStorage.getItem(getSponsorEndKey(id)) || "");
      } catch {
        setSponsorStartSrc("");
        setSponsorEndSrc("");
      }
    },
    [],
  );


  const runCycle = useCallback(() => {
    clearTimers();
    clearCycleTimeout();

    const totalMs = Math.max(6000, sceneDurationMsRef.current || DEFAULT_SCENE_MS);
    const slides = Math.max(1, totalSlidesRef.current);
    const videoMs = Math.max(0, totalMs - SPONSOR_START_MS - SPONSOR_END_MS);
    setPhase("sponsorStart");

    // Start sponsor -> video slides -> end sponsor
    const tStartVideo = window.setTimeout(() => {
      setPhase("video");
      setSlideIndex(0);
    }, SPONSOR_START_MS);

    const slideTimers: number[] = [];
    for (let i = 1; i < slides; i += 1) {
      const atMs = SPONSOR_START_MS + Math.floor((videoMs * i) / slides);
      slideTimers.push(window.setTimeout(() => setSlideIndex(i), atMs));
    }

    const tEnd = window.setTimeout(
      () => setPhase("sponsorEnd"),
      SPONSOR_START_MS + videoMs,
    );

    timersRef.current.push(tStartVideo, ...slideTimers, tEnd);

    // Schedule the next cycle based on this cycle's actual start time to avoid drift/races.
    cycleTimeoutRef.current = window.setTimeout(() => {
      runCycle();
    }, totalMs);
  }, []);

  useEffect(() => {
    sceneIdRef.current = sceneId;
    setTotalSlides(1);
    setSlideIndex(0);
    totalSlidesRef.current = 1;
    loadSponsors(sceneId);
    const durationMs = loadDuration(sceneId);
    sceneDurationMsRef.current = durationMs;

    runCycle();
    return () => {
      clearTimers();
      clearCycleTimeout();
    };
  }, [loadDuration, loadSponsors, runCycle, sceneId]);

  useEffect(() => {
    if (!sceneId) return;
    loadSponsors(sceneId);

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === getSponsorStartKey(sceneId) || e.key === getSponsorEndKey(sceneId)) {
        loadSponsors(sceneId);
      }
      if (e.key === getDurationKey(sceneId)) {
        const nextMs = loadDuration(sceneId);
        sceneDurationMsRef.current = nextMs;
        runCycle();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadDuration, loadSponsors, runCycle, sceneId]);

  useEffect(() => {
    if (!sceneId) return;
    // When slide count changes (scene loads), resync the timeline so sponsor isn't shown between slides.
    runCycle();
  }, [runCycle, sceneId, totalSlides]);

  const SponsorSlide = ({ src, label }: { src: string; label: string }) => {
    if (src) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <img
            src={src}
            alt={label}
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="px-6 text-center text-sm font-semibold tracking-wide text-white/70">
          {label} (upload in dashboard)
        </div>
      </div>
    );
  };

  if (!sceneId) return null;

  return (
    <div className="h-full w-full overflow-hidden">
      {/* Preload sponsor images so the end slide doesn't appear blank while the image decodes/loads. */}
      {sponsorStartSrc && (
        <img
          src={sponsorStartSrc}
          alt=""
          aria-hidden="true"
          className="hidden"
          loading="eager"
          decoding="async"
        />
      )}
      {sponsorEndSrc && (
        <img
          src={sponsorEndSrc}
          alt=""
          aria-hidden="true"
          className="hidden"
          loading="eager"
          decoding="async"
        />
      )}
      {phase === "sponsorStart" && (
        <SponsorSlide src={sponsorStartSrc} label="Sponsor" />
      )}

      {phase === "video" && (
        <div className="h-full w-full">
          <SceneRenderer
            sceneId={sceneId}
            allowDelete={allowDelete}
            muted={muted}
            renderMode="single-slide"
            slideIndex={slideIndex}
            onMeta={(meta) => {
              if (sceneIdRef.current !== sceneId) return;
              totalSlidesRef.current = meta.totalSlides;
              setTotalSlides(meta.totalSlides);
            }}
          />
        </div>
      )}

      {phase === "sponsorEnd" && (
        <SponsorSlide src={sponsorEndSrc} label="Sponsor" />
      )}
    </div>
  );
}
