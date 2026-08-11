import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ProspectFormPage from "./pages/ProspectFormPage";
import ProspectDetailPage from "./pages/ProspectDetailPage";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/prospects/new"
            element={<ProspectFormPage mode="create" />}
          />
          <Route path="/prospects/:id" element={<ProspectDetailPage />} />
          <Route
            path="/prospects/:id/edit"
            element={<ProspectFormPage mode="edit" />}
          />
        </Routes>
      </main>
    </div>
  );
}
