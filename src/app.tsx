import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import FileSelectionPage from "./components/FileSelectionPage";
import FilePreviewPage from "./components/FilePreviewPage";
import AlgorithmSettingsPage from "./components/AlgorithmSettingsPage";
import ProgressPage from "./components/ProgressPage";
import ResultsPage from "./components/ResultsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/file" element={<FileSelectionPage />} />
        <Route path="/file_preview" element={<FilePreviewPage />} />
        <Route path="/algorithm_settings" element={<AlgorithmSettingsPage />} />
        <Route path="/clustering" element={<ProgressPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}
