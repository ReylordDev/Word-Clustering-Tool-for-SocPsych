import { MemoryRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import FileSelection from "./components/FileSelection";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/file" element={<FileSelection />} />
      </Routes>
    </Router>
  );
}
