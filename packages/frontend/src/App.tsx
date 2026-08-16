import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { FeedPage } from './pages/FeedPage';
import { StarredPage } from './pages/StarredPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="feed/:feedId" element={<FeedPage />} />
            <Route path="starred" element={<StarredPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  );
}
