import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroPage from "@/pages/IntroPage";
import ViaSacraPage from "@/pages/ViaSacraPage";
import FinalPage from "@/pages/FinalPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/via-sacra" element={<ViaSacraPage />} />
          <Route path="/final" element={<FinalPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
