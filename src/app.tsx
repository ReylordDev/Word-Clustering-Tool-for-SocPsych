import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import FileSelectionPage from "./components/FileSelectionPage";
import FileSettingsPage from "./components/FileSettingsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/file" element={<FileSelectionPage />} />
        <Route path="/file_settings" element={<FileSettingsPage />} />
      </Routes>
    </Router>
  );
}
