import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FiltersPanel";
import SceneNameModal from "../components/SceneNameModal";
import SceneThumbnailBar from "../components/preview/SceneThumbnailBar";
import SubmissionCard from "../components/SubmissionCard";

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
  pushLive,
  rejectSubmission,
  removeFromQueue,
} from "../api/moderatorApi";
import { Submission } from "../types/moderator.types";
import { archiveScene, goLiveScene } from "../api/mosaicLive.api";

const LIVE_QUEUE_KEY = "fanwall_live_scene_queue";
const LIVE_ACTIVE_KEY = "fanwall_live_active_scene";
const LIVE_EVENT_KEY = "fanwall_live_event_id";
const LIVE_HISTORY_KEY = "fanwall_live_scene_history";
const ARCHIVED_SCENES_KEY = "fanwall_archived_scene_ids";

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

export default function ModeratorDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [activeSceneId, setActiveSceneId] = useState("");

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
      return;
    }

    getTeams(filters.eventId).then(setTeams);
    getCategories(filters.eventId).then(setCategories);
    reloadQueue(filters.eventId);
    loadScenes(filters.eventId);
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

  const reloadSubmissions = async () => {
    const subs = await getSubmissions(filters);
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

  const handleAdd = async (submissionId: string) => {
    if (!filters.eventId) return;
    await addToQueue(filters.eventId, submissionId);
    await Promise.all([reloadSubmissions(), reloadQueue()]);
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
    await goLiveScene(sceneId);

    const activeScene = localStorage.getItem(LIVE_ACTIVE_KEY);

    if (!activeScene) {
      localStorage.setItem(LIVE_ACTIVE_KEY, sceneId);
      window.open(`/moderator/FanWallLivePage/${sceneId}`, "fanwall_live_screen");
      await loadScenes();
      return;
    }

    if (activeScene === sceneId) {
      window.open(`/moderator/FanWallLivePage/${activeScene}`, "fanwall_live_screen");
      await loadScenes();
      return;
    }

    const sceneQueue = readQueue();
    if (!sceneQueue.includes(sceneId)) {
      sceneQueue.push(sceneId);
      writeQueue(sceneQueue);
      localStorage.setItem("fanwall_live_queue_updated", String(Date.now()));
    }

    window.open(`/moderator/FanWallLivePage/${activeScene}`, "fanwall_live_screen");
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
    <div className="min-h-screen flex flex-col bg-slate-900 text-white p-6 gap-6">
      <div className="flex items-center justify-between gap-6">
        <h1 className="text-2xl font-bold">Moderator Dashboard</h1>

        <FilterBar
          events={events}
          teams={teams}
          categories={categories}
          filters={filters}
          onChange={onChange as any}
        />
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 bg-slate-800 rounded-xl flex flex-col min-h-0">
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <div className="font-semibold text-lg">Cheers ({submissions.length})</div>

            <button
              onClick={() => setShowModal(true)}
              disabled={!queue.length}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-40"
            >
              {creatingScene ? "Creating..." : "Create Scene"}
            </button>
          </div>

          <div className="p-4 border-b border-slate-700">
            <div className="flex gap-3">
              <button
                onClick={handleSelectAll}
                disabled={!submissions.length}
                className="bg-slate-700 px-3 py-1 rounded disabled:opacity-40"
              >
                Select All
              </button>

              <button
                onClick={handleClearAll}
                disabled={!queue.length}
                className="bg-slate-700 px-3 py-1 rounded disabled:opacity-40"
              >
                Clear All
              </button>

              <div className="ml-auto text-sm text-slate-300">Queue Items: {queue.length}</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {submissions.map((s) => {
                const isQueued =
                  queueIds.has(s.submission_id) ||
                  Boolean(s.venueplayoutqueues && s.venueplayoutqueues.length > 0);

                return (
                  <SubmissionCard
                    key={s.submission_id}
                    submission={s}
                    onAdd={handleAdd}
                    onRemove={handleRemove}
                    onReject={handleReject}
                    isQueued={isQueued}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-slate-800 rounded-xl p-4 flex flex-col min-h-0 gap-4">
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="font-semibold mb-2">Queue ({queue.length})</div>

            {!queue.length ? (
              <div className="text-sm text-slate-400">No queued submissions</div>
            ) : (
              <div className="max-h-56 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-left">
                      <th className="py-1 pr-2">#</th>
                      <th className="py-1 pr-2">Name</th>
                      <th className="py-1 pr-2">Team</th>
                      <th className="py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((q: any, idx: number) => {
                      const submission = q.submission || q;
                      const submissionId = q?.submission_id ?? q?.submission?.submission_id;

                      return (
                        <tr key={submissionId || `${idx}`} className="border-t border-slate-700">
                          <td className="py-2 pr-2">{idx + 1}</td>
                          <td className="py-2 pr-2 truncate max-w-[120px]">
                            {submission?.user?.full_name || "-"}
                          </td>
                          <td className="py-2 pr-2 truncate max-w-[120px]">
                            {q?.team_name || submission?.team?.name || "-"}
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() => submissionId && handleRemove(submissionId)}
                              className="text-xs bg-red-600 px-2 py-1 rounded"
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
          </div>

          <div className="font-semibold">Scenes ({scenes.length})</div>

          <div className="flex-1 overflow-hidden">
            <SceneThumbnailBar
              scenes={scenes}
              activeSceneId={activeSceneId}
              onSelect={setActiveSceneId}
              onDelete={handleDeleteScene}
              onPreview={handlePreviewScene}
              onLive={handleLiveScene}
              onArchive={handleArchiveScene}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <SceneNameModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateScene}
          scenes={scenes}
        />
      )}
    </div>
  );
}











