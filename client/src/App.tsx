import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth.tsx';
import { ThemeProvider } from '@/hooks/useTheme';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Tickets from '@/pages/Tickets';
import LaptopsPage from '@/pages/Laptops';
import WarRoom from '@/pages/WarRoom';
import KnowledgeBase from '@/pages/KnowledgeBase';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-bg-base">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/laptops" element={<LaptopsPage />} />
                <Route path="/warroom" element={<WarRoom />} />
                <Route path="/kb" element={<KnowledgeBase />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
