import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SceneRenderer from "../components/SceneRenderer";
import { useParams } from "react-router-dom";

export default function LiveScreen() {
  const { sceneId } = useParams();
  console.log(sceneId);
  return (
    <div className="app-shell flex h-screen flex-col overflow-hidden bg-black text-white">
      <Header title="LIVE" color="red" />

      <div className="app-content flex-1">
        <SceneRenderer sceneId={sceneId!} />
      </div>

      <Footer />
    </div>
  );
}
