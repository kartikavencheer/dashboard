import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Film, LayoutPanelTop, ListVideo, Radio, SearchCheck, Sparkles } from "lucide-react";
import FilterBar from "../components/FiltersPanel";
import Header from "../components/layout/Header";
import SceneThumbnailBar from "../components/preview/SceneThumbnailBar";
import SubmissionCard from "../components/SubmissionCard";

const SceneNameModal = lazy(() => import("../components/SceneNameModal"));
const VideoPlayerModal = lazy(() => import("../components/VideoPlayerModal"));

import {
  addToQueue,
  bulkAddToQueue,
  createScene,
  deleteScene,
  getCategories,
  getEvents,
  getQueue,
  getScenes,
  getSubmissions,
  getTeams,
  previewScene,
  rejectSubmission,
  removeFromQueue,
} from "../api/moderatorApi";
import { Submission } from "../types/moderator.types";
import { archiveScene, goLiveScene } from "../api/mosaicLive.api";
import { LIVE_WINDOW_NAME, openNamedWindow } from "../utils/windowTargets";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const LIVE_HISTORY_KEY = "fanwall_live_scene_history";
const ARCHIVED_SCENES_KEY = "fanwall_archived_scene_ids";
const RECYCLE_BIN_KEY_PREFIX = "fanwall_recycle_bin_event_";

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

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readRecycleBin(eventId: string): any[] {
  if (!eventId) return [];
  try {
    const raw = localStorage.getItem(`${RECYCLE_BIN_KEY_PREFIX}${eventId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecycleBin(eventId: string, items: any[]) {
  if (!eventId) return;
  localStorage.setItem(`${RECYCLE_BIN_KEY_PREFIX}${eventId}`, JSON.stringify(items));
}

export default function ModeratorDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [activeSceneId, setActiveSceneId] = useState("");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerSubmission, setPlayerSubmission] = useState<any>(null);
  const [recycleBin, setRecycleBin] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [creatingScene, setCreatingScene] = useState(false);

  const [filters, setFilters] = useState({
    eventId: "",
    teamId: "",
    categoryId: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  useEffect(() => {
    if (!filters.eventId) {
      setTeams([]);
      setCategories([]);
      setSubmissions([]);
      setQueue([]);
      setScenes([]);
      setRecycleBin([]);
      return;
    }

    getTeams(filters.eventId).then(setTeams);
    getCategories(filters.eventId).then(setCategories);
    reloadQueue(filters.eventId);
    loadScenes(filters.eventId);
    setRecycleBin(readRecycleBin(filters.eventId));
  }, [filters.eventId]);

  useEffect(() => {
    if (!filters.eventId) return;
    reloadSubmissions();
  }, [filters]);
  useEffect(() => {
    if (!filters.eventId) return;

    const poll = async () => {
      try {
        await Promise.all([reloadSubmissions(), reloadQueue(), loadScenes()]);
      } catch (error) {
        console.error("Dashboard polling failed:", error);
      }
    };

    poll();
    const id = window.setInterval(poll, 8000);
    return () => window.clearInterval(id);
  }, [
    filters.eventId,
    filters.teamId,
    filters.categoryId,
    filters.status,
    filters.search,
  ]);

  const reloadSubmissions = async (override?: Partial<typeof filters>) => {
    const params = override ? { ...filters, ...override } : filters;
    const subs = await getSubmissions(params);
    setSubmissions(subs || []);
  };

  const reloadQueue = async (eventId = filters.eventId) => {
    if (!eventId) return;
    const q = await getQueue(eventId);
    setQueue(q || []);
  };

  const loadScenes = async (eventId = filters.eventId) => {
    if (!eventId) return;
    const data = await getScenes(eventId);
    setScenes(data || []);
  };

  const onChange = (k: string, v: string) => {
    if (k === "eventId") {
      setFilters({
        eventId: v,
        teamId: "",
        categoryId: "",
        status: "",
        search: "",
      });
      return;
    }

    setFilters((p) => ({ ...p, [k]: v }));
  };

  const queueIds = useMemo(
    () =>
      new Set(
        queue
          .map((q: any) => q?.submission_id ?? q?.submission?.submission_id)
          .filter(Boolean),
      ),
    [queue],
  );

  const recycleIds = useMemo(
    () => new Set(recycleBin.map((s: any) => s?.submission_id).filter(Boolean)),
    [recycleBin],
  );

  const approvedSubmissions = useMemo(
    () => submissions.filter((item) => String(item?.status || "").toUpperCase() === "APPROVED").length,
    [submissions],
  );

  const selectedEventName = useMemo(
    () => events.find((event) => event.event_id === filters.eventId)?.event_name || "Choose an event to begin moderating",
    [events, filters.eventId],
  );

  const handleAdd = async (submissionId: string) => {
    if (!filters.eventId) return;
    await addToQueue(filters.eventId, submissionId);
    await Promise.all([reloadSubmissions(), reloadQueue()]);
  };

  const handlePlaySubmission = (submission: any) => {
    setPlayerSubmission(submission);
    setPlayerOpen(true);
  };

  const handleDeleteClick = (submission: any) => {
    setDeleteTarget(submission);
    setDeleteModalOpen(true);
  };

  const moveToRecycleBin = () => {
    if (!filters.eventId || !deleteTarget) return;
    setRecycleBin((prev) => {
      const id = deleteTarget?.submission_id;
      const next = prev.some((x: any) => x?.submission_id === id) ? prev : [deleteTarget, ...prev];
      writeRecycleBin(filters.eventId, next);
      return next;
    });
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const restoreFromRecycleBin = (submissionId: string) => {
    if (!filters.eventId) return;
    setRecycleBin((prev) => {
      const next = prev.filter((x: any) => x?.submission_id !== submissionId);
      writeRecycleBin(filters.eventId, next);
      return next;
    });
  };

  const restoreAllRecycleBin = () => {
    if (!filters.eventId) return;
    setRecycleBin(() => {
      writeRecycleBin(filters.eventId, []);
      return [];
    });
    void reloadSubmissions();
  };

  const showAllFromDb = async () => {
    if (!filters.eventId) return;

    // Clear any frontend-only hiding (Recycle Bin) and clear UI filters so we fetch everything for the event.
    setRecycleBin(() => {
      writeRecycleBin(filters.eventId, []);
      return [];
    });

    const nextFilters = {
      ...filters,
      teamId: "",
      categoryId: "",
      status: "",
      search: "",
    };

    setFilters(nextFilters);

    // Fetch from API using the cleared filters.
    await Promise.all([reloadSubmissions(nextFilters), reloadQueue(), loadScenes()]);
  };

  const permanentlyDeleteTarget = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget?.submission_id;
    if (id) {
      await handleReject(id);
      if (filters.eventId) {
        setRecycleBin((prev) => {
          const next = prev.filter((x: any) => x?.submission_id !== id);
          writeRecycleBin(filters.eventId, next);
          return next;
        });
      }
    }
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleRemove = async (submissionId: string) => {
    if (!filters.eventId) return;
    await removeFromQueue(filters.eventId, submissionId);
    await Promise.all([reloadSubmissions(), reloadQueue()]);
  };

  const handleReject = async (submissionId: string) => {
    await rejectSubmission(submissionId);
    await Promise.all([reloadSubmissions(), reloadQueue()]);
  };

  const handleSelectAll = async () => {
    if (!filters.eventId || submissions.length === 0) return;

    const visibleSubmissionIds = submissions.map((s) => s.submission_id);
    const idsToQueue = visibleSubmissionIds.filter((id) => !queueIds.has(id));

    if (idsToQueue.length === 0) return;

    await bulkAddToQueue(filters.eventId, idsToQueue);
    await Promise.all([reloadSubmissions(), reloadQueue()]);
  };

  const handleClearAll = async () => {
    if (!filters.eventId || queue.length === 0) return;

    const queueSubmissionIds = queue
      .map((q: any) => q?.submission_id ?? q?.submission?.submission_id)
      .filter(Boolean);

    await Promise.all(
      queueSubmissionIds.map((submissionId: string) =>
        removeFromQueue(filters.eventId, submissionId),
      ),
    );

    await Promise.all([reloadSubmissions(), reloadQueue()]);
  };

  const handleCreateScene = async (name: string) => {
    if (creatingScene || !filters.eventId) return;

    if (!queue.length) {
      alert("Queue is empty. Add items to queue first.");
      return;
    }

    setCreatingScene(true);

    try {
      const queueSubmissionIds = queue
        .map((q: any) => q?.submission_id ?? q?.submission?.submission_id)
        .filter(Boolean);

      const scene = await createScene({
        eventId: filters.eventId,
        name,
        categoryId: filters.categoryId || undefined,
        submissionIds: queueSubmissionIds,
      });

      setScenes((prev) => [...prev, scene]);
      setActiveSceneId(scene.scene_id);
      setShowModal(false);
      await Promise.all([reloadSubmissions(), reloadQueue(), loadScenes()]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create scene");
    } finally {
      setCreatingScene(false);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    try {
      await deleteScene(sceneId);
      await loadScenes();
      // Ensure any frontend-only hidden clips (Recycle Bin) are still visible after scene operations.
      void reloadSubmissions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete scene");
    }
  };

  const handlePreviewScene = async (sceneId: string) => {
    await previewScene(sceneId);
    await loadScenes();
  };

  const handleLiveScene = async (sceneId: string) => {
    localStorage.setItem(LIVE_EVENT_KEY, filters.eventId);

    const activeScene = localStorage.getItem(LIVE_ACTIVE_KEY);

    let targetSceneForScreen = activeScene || sceneId;

    if (!activeScene) {
      localStorage.setItem(LIVE_ACTIVE_KEY, sceneId);
      targetSceneForScreen = sceneId;
    } else if (activeScene !== sceneId) {
      const sceneQueue = readQueue();
      if (!sceneQueue.includes(sceneId)) {
        sceneQueue.push(sceneId);
        writeQueue(sceneQueue);
        localStorage.setItem("fanwall_live_queue_updated", String(Date.now()));
      }
      targetSceneForScreen = activeScene;
    }

    // Open/reuse the live screen tab immediately (before awaits) to avoid pop-up blockers.
    openNamedWindow(`/FanWallLivePage/${targetSceneForScreen}`, LIVE_WINDOW_NAME);

    try {
      await goLiveScene(sceneId);
    } catch (err) {
      console.error("goLiveScene failed:", err);
    }

    await loadScenes();
  };

  const handleArchiveScene = async (sceneId: string) => {
    await archiveScene(sceneId);

    const archived = readList(ARCHIVED_SCENES_KEY);
    if (!archived.includes(sceneId)) {
      archived.push(sceneId);
      writeList(ARCHIVED_SCENES_KEY, archived);
      localStorage.setItem("fanwall_archived_updated", String(Date.now()));
    }

    const liveQueue = readQueue().filter((id) => id !== sceneId);
    writeQueue(liveQueue);

    const history = readList(LIVE_HISTORY_KEY).filter((id) => id !== sceneId);
    writeList(LIVE_HISTORY_KEY, history);

    await loadScenes();
  };

  return (
    <div className="app-shell overflow-visible">
      <div className="sticky top-0 z-50">
        <Header title="MODERATOR DASHBOARD" color="green" />
      </div>
      <div className="app-content mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-6 overflow-x-hidden px-4 py-5 md:px-6 xl:px-8">
        <section className="glass-panel rounded-[36px] p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
               
                <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                  Moderator command center for fast, confident live curation.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  Review fan submissions, build scene queues, and push polished fan wall moments live from one elevated control room.
                </p>
              </div>

              <div className="glass-soft rounded-[28px] p-5 xl:min-w-[360px]">
                <div className="metric-label">Active Event</div>
                <div className="mt-3 text-xl font-semibold text-white">{selectedEventName}</div>
                <div className="mt-2 text-sm text-white/55">
                  {filters.eventId
                    ? "Dashboard syncs submissions, queue, and scenes every 8 seconds."
                    : "Select an event to unlock teams, categories, and moderation actions."}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="metric-label">Visible Cheers</div>
                  <SearchCheck size={18} className="text-cyan-200/80" />
                </div>
                <div className="metric-value">{submissions.length}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="metric-label">Approved Clips</div>
                  <LayoutPanelTop size={18} className="text-emerald-200/80" />
                </div>
                <div className="metric-value">{approvedSubmissions}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="metric-label">Queue Depth</div>
                  <ListVideo size={18} className="text-amber-200/80" />
                </div>
                <div className="metric-value">{queue.length}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="metric-label">Scenes Ready</div>
                  <Film size={18} className="text-fuchsia-200/80" />
                </div>
                <div className="metric-value">{scenes.length}</div>
              </div>
            </div>

            <FilterBar
              events={events}
              teams={teams}
              categories={categories}
              filters={filters}
              onChange={onChange as any}
            />

            {Boolean(filters.eventId) && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/60">
                  Showing DB results for: <span className="font-semibold text-white/85">{selectedEventName}</span>
                </div>
                <button
                  type="button"
                  onClick={showAllFromDb}
                  className="secondary-button px-4 py-3"
                >
                  Show All (DB)
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="dashboard-grid min-h-0 flex-1">
            <section className="glass-panel col-span-1 flex min-h-0 flex-col rounded-[32px] xl:col-span-8">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div>
                  <div className="section-title">Submission Review</div>
                  <div className="section-subtitle">
                    Moderate incoming fan cheers and choose the strongest moments for the live queue.
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  disabled={!queue.length}
                  className="primary-button"
                >
                  <Film size={16} />
                  {creatingScene ? "Creating..." : "Create Scene"}
                </button>
              </div>

              {Boolean(filters.eventId && recycleBin.length) && (
                <div className="mx-5 mt-5 flex flex-col gap-3 rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-4 text-white md:mx-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">
                      {recycleBin.length} clip{recycleBin.length === 1 ? "" : "s"} hidden in Recycle Bin
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      These are hidden only on the frontend. Restore them to show again in the grid.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={restoreAllRecycleBin}
                    className="secondary-button px-4 py-2 text-xs"
                  >
                    Restore All Clips
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSelectAll}
                  disabled={!submissions.length}
                  className="secondary-button"
                >
                  Select All
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={!queue.length}
                  className="secondary-button"
                >
                  Clear All
                </button>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] px-4 py-2 text-sm text-cyan-100/90">
                <Radio size={14} className="animate-pulse" />
                Queue Items: {queue.length}
              </div>
            </div>

              <div className="flex-1 overflow-auto p-5 md:p-6">
                {submissions.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {submissions.map((s) => {
                    const isRecycled = recycleIds.has(s.submission_id);
                    const isQueued =
                      queueIds.has(s.submission_id) ||
                      Boolean(s.venueplayoutqueues && s.venueplayoutqueues.length > 0);

                    return (
                      <div key={s.submission_id} className="relative">
                        {isRecycled && (
                          <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
                            <div className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 backdrop-blur">
                              In Recycle Bin
                            </div>
                            <button
                              type="button"
                              onClick={() => restoreFromRecycleBin(s.submission_id)}
                              className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-500/20"
                            >
                              Restore
                            </button>
                          </div>
                        )}

                        <div className={isRecycled ? "opacity-60 grayscale-[0.25]" : ""}>
                          <SubmissionCard
                            submission={s}
                            onAdd={handleAdd}
                            onRemove={handleRemove}
                            onReject={handleReject}
                            isQueued={isQueued}
                            onPlay={handlePlaySubmission}
                            onDelete={handleDeleteClick}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center">
                  <div className="glass-soft max-w-lg rounded-[28px] px-8 py-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/5">
                      <Sparkles size={24} className="text-cyan-100" />
                    </div>
                    <div className="text-xl font-semibold text-white">No submissions in view</div>
                    <p className="mt-3 text-sm leading-7 text-white/60">
                      Pick an event or adjust your filters to surface cheers ready for moderation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="col-span-1 flex min-h-0 flex-col gap-6 xl:col-span-4">
            <section className="glass-panel rounded-[32px] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="section-title">Recycle Bin</div>
                  <div className="section-subtitle">Restore clips or permanently delete them.</div>
                </div>
                <div className="flex items-center gap-3">
                  {Boolean(recycleBin.length) && (
                    <button
                      type="button"
                      onClick={restoreAllRecycleBin}
                      className="secondary-button px-4 py-2 text-xs"
                    >
                      Restore All
                    </button>
                  )}
                  <div className="hero-chip">{recycleBin.length} items</div>
                </div>
              </div>

              {!recycleBin.length ? (
                <div className="glass-soft rounded-[24px] px-5 py-6 text-sm text-white/55">
                  Nothing in recycle bin.
                </div>
              ) : (
                <div className="max-h-72 overflow-auto rounded-[24px] border border-white/8 bg-white/[0.03]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-950/95 text-left text-[11px] uppercase tracking-[0.18em] text-white/45 backdrop-blur">
                      <tr>
                        <th className="px-4 py-3">Fan</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recycleBin.map((s: any) => (
                        <tr
                          key={s?.submission_id}
                          className="border-t border-white/8 text-white/80"
                        >
                          <td className="px-4 py-3">
                            <div className="max-w-[160px] truncate font-medium">
                              {s?.user?.full_name || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-[140px] truncate text-white/55">
                              {s?.team?.name || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/55">{s?.status || "-"}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => restoreFromRecycleBin(s?.submission_id)}
                                className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget(s);
                                  setDeleteModalOpen(true);
                                }}
                                className="rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="glass-panel rounded-[32px] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="section-title">Queue</div>
                  <div className="section-subtitle">Ordered fan moments ready for scene creation.</div>
                </div>
                <div className="hero-chip">{queue.length} items</div>
              </div>

              {!queue.length ? (
                <div className="glass-soft rounded-[24px] px-5 py-6 text-sm text-white/55">
                  No queued submissions yet. Select clips from the moderation grid to build your next scene.
                </div>
              ) : (
                <div className="max-h-72 overflow-auto rounded-[24px] border border-white/8 bg-white/[0.03]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-950/95 text-left text-[11px] uppercase tracking-[0.18em] text-white/45 backdrop-blur">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Fan</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((q: any, idx: number) => {
                        const submission = q.submission || q;
                        const submissionId = q?.submission_id ?? q?.submission?.submission_id;

                        return (
                          <tr key={submissionId || `${idx}`} className="border-t border-white/8 text-white/80">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="max-w-[140px] truncate font-medium">
                                {submission?.user?.full_name || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-[120px] truncate text-white/55">
                                {q?.team_name || submission?.team?.name || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => submissionId && handleRemove(submissionId)}
                                className="rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="glass-panel flex min-h-0 flex-1 flex-col rounded-[32px] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="section-title">Scenes</div>
                  <div className="section-subtitle">Preview, publish, archive, and manage generated walls.</div>
                </div>
                <div className="hero-chip">{scenes.length} total</div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                {scenes.length ? (
                  <SceneThumbnailBar
                    scenes={scenes}
                    activeSceneId={activeSceneId}
                    onSelect={setActiveSceneId}
                    onDelete={handleDeleteScene}
                    onPreview={handlePreviewScene}
                    onLive={handleLiveScene}
                    onArchive={handleArchiveScene}
                  />
                ) : (
                  <div className="glass-soft flex h-full min-h-[260px] items-center justify-center rounded-[24px] px-6 text-center text-sm text-white/55">
                    Scenes will appear here after you queue submissions and create a new fan wall sequence.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showModal && (
        <Suspense fallback={null}>
          <SceneNameModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleCreateScene}
            scenes={scenes}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <VideoPlayerModal
          open={playerOpen}
          src={playerSubmission?.media_url ?? null}
          title={playerSubmission?.user?.full_name || "Anonymous Fan"}
          subtitle={playerSubmission?.team?.name || "Independent submission"}
          status={playerSubmission?.status || "Pending"}
          onClose={() => setPlayerOpen(false)}
        />
      </Suspense>

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
          onClick={() => setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="glass-panel w-full max-w-md rounded-[32px] border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-white">Delete this clip?</div>
            <div className="mt-2 text-sm text-white/60">
              Choose Recycle Bin to restore later, or permanently delete to remove it immediately.
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={moveToRecycleBin} className="secondary-button w-full">
                Move to Recycle Bin
              </button>
              <button onClick={permanentlyDeleteTarget} className="danger-button w-full">
                Permanently Delete
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="secondary-button w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}








