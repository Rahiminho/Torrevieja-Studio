import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TracklistPage from './pages/TracklistPage';
import LyricsPage from './pages/LyricsPage';
import FilesPage from './pages/FilesPage';
import CrewPage from './pages/CrewPage';
import FinalePage from './pages/FinalePage';
import SettingsPage from './pages/SettingsPage';

function AppRoutes() {
  const { state } = useStore();

  if (!state.currentUser) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracklist" element={<TracklistPage />} />
        <Route path="/paroles" element={<LyricsPage />} />
        <Route path="/fichiers" element={<FilesPage />} />
        <Route path="/crew" element={<CrewPage />} />
        <Route path="/finale" element={<FinalePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppRoutes />
      </StoreProvider>
    </BrowserRouter>
  );
}
