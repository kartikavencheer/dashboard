import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const ModeratorDashboard = lazy(() => import("./pages/ModeratorDashboard"));
const LiveScreen = lazy(() => import("./pages/LiveScreen"));
const ScenePreview = lazy(() => import("./pages/preview/[sceneId]"));
const FanWallLivePage = lazy(() => import("./pages/FanWallLivePage"));
const SceneEditorPage = lazy(() => import("./pages/SceneEditorPage"));

{
  /* <Route path="/preview/:sceneId" element={<ScenePreview />} />; */
}

// export default function App() {
//   return <ModeratorDashboard />;
// }

export default function App() {
  return (
    <BrowserRouter>
      {/* <div className="h-screen overflow-hidden"> */}
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-slate-950 text-sm text-white/70">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<ModeratorDashboard />} />
          <Route path="/preview/:sceneId" element={<ScenePreview />} />
          <Route path="/LiveScreen/:sceneId" element={<LiveScreen />} />
          <Route path="/FanWallLivePage/:sceneId" element={<FanWallLivePage />} />
          <Route path="/scene/:sceneId/preview" element={<SceneEditorPage />} />
        </Routes>
      </Suspense>
      {/* </div> */}
    </BrowserRouter>
  );
}
