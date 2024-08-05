import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import FileSelectionPage from "./components/FileSelectionPage";
import FilePreviewPage from "./components/FilePreviewPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/file" element={<FileSelectionPage />} />
        <Route path="/file_settings" element={<FilePreviewPage />} />
      </Routes>
    </Router>
  );
}
