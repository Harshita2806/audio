import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import Teacher from "./pages/TeacherPage";
import Student from "./pages/StudentPage";
import QuizPage from "./pages/QuizPage";
import VerifyEmail from './pages/VerifyEmail';

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to their correct dashboard
    return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  }

  return children;
}

// ─── Auth Route (redirect to dashboard if already logged in) ─────────────────
function AuthRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><AuthPage defaultMode="signup" /></AuthRoute>} />

            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          {/* Protected — Teacher */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <Teacher />
              </ProtectedRoute>
            }
          />

          {/* Protected — Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <Student />
              </ProtectedRoute>
            }
          />

          {/* Protected — Quiz */}
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SocketProvider>
    </AuthProvider>
  );
}