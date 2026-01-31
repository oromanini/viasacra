import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomPage from "@/pages/RoomPage";
import IntroPage from "@/pages/IntroPage";
import ViaSacraPage from "@/pages/ViaSacraPage";
import FinalPage from "@/pages/FinalPage";
import AdminPage from "@/pages/AdminPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/via-sacra" element={<ViaSacraPage />} />
          <Route path="/final" element={<FinalPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
