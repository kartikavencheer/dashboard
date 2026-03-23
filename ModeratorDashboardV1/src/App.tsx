import { BrowserRouter, Routes, Route } from "react-router-dom";
import ModeratorDashboard from "./pages/ModeratorDashboard";
// import ScenePreview from "./pages/ScenePreview";
import LiveScreen from "./pages/LiveScreen";
import ScenePreview from "./pages/preview/[sceneId]";
import FanWallLivePage from "./pages/FanWallLivePage";
import SceneEditorPage from "./pages/SceneEditorPage";

{
  /* <Route path="/preview/:sceneId" element={<ScenePreview />} />; */
}

// export default function App() {
//   return <ModeratorDashboard />;
// }

export default function App() {
  return (
    <BrowserRouter basename="/moderator">
      {/* <div className="h-screen overflow-hidden"> */}
      <Routes>
        <Route path="/" element={<ModeratorDashboard />} />
        <Route path="/preview/:sceneId" element={<ScenePreview />} />
        <Route path="/LiveScreen/:sceneId" element={<LiveScreen />} />
        <Route path="/FanWallLivePage/:sceneId" element={<FanWallLivePage />} />
        <Route path="/scene/:sceneId/preview" element={<SceneEditorPage />} />
      </Routes>
      {/* </div> */}
    </BrowserRouter>
  );
}
