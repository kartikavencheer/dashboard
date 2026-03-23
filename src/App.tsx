import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { isModLoggedIn } from "./utils/modAuth";

const ModeratorDashboard = lazy(() => import("./pages/ModeratorDashboard"));
const LiveScreen = lazy(() => import("./pages/LiveScreen"));
const ScenePreview = lazy(() => import("./pages/preview/[sceneId]"));
const FanWallLivePage = lazy(() => import("./pages/FanWallLivePage"));
const SceneEditorPage = lazy(() => import("./pages/SceneEditorPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

{
  /* <Route path="/preview/:sceneId" element={<ScenePreview />} />; */
}

// export default function App() {
//   return <ModeratorDashboard />;
// }

export default function App() {
  function RequireAuth({ children }: { children: JSX.Element }) {
    const location = useLocation();
    if (!isModLoggedIn()) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
  }

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><ModeratorDashboard /></RequireAuth>} />
          <Route path="/preview" element={<RequireAuth><ScenePreview /></RequireAuth>} />
          <Route path="/preview/:sceneId" element={<RequireAuth><ScenePreview /></RequireAuth>} />
          <Route path="/LiveScreen/:sceneId" element={<LiveScreen />} />
          <Route path="/FanWallLivePage/:sceneId" element={<FanWallLivePage />} />
          <Route path="/scene/:sceneId/preview" element={<RequireAuth><SceneEditorPage /></RequireAuth>} />
        </Routes>
      </Suspense>
      {/* </div> */}
    </BrowserRouter>
  );
}
