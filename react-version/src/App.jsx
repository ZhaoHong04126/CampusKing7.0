import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// 佔位頁面模組
import Schedule from './pages/Schedule';
import Accounting from './pages/Accounting';
import Calendar from './pages/Calendar';
import Lottery from './pages/Lottery';
import SelfStudy from './pages/SelfStudy';
import GradeCalc from './pages/GradeCalc';
import GradeManager from './pages/GradeManager';
import Homework from './pages/Homework';
import Anniversary from './pages/Anniversary';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

import './assets/css/base.css';
import './assets/css/layout.css';
import './assets/css/components.css';

// 路由守衛：保護需要登入的頁面
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // 尚未登入，將用戶重新導航回首頁
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

// 路由守衛：保護不該重複登入的頁面 (LandingPage)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser) {
    // 已登入，踢回 app 首頁
    const from = location.state?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        
        {/* Main Application Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lottery" element={<Lottery />} />
          <Route path="self-study" element={<SelfStudy />} />
          <Route path="grade-calc" element={<GradeCalc />} />
          <Route path="grade-manager" element={<GradeManager />} />
          <Route path="homework" element={<Homework />} />
          <Route path="anniversary" element={<Anniversary />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          
          {/* Default redirect for unknown /app routes */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
