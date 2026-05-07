import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

import HomePage            from './pages/HomePage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import DashboardPage       from './pages/DashboardPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import AdminDashboard      from './pages/AdminDashboard';
import PatientInfoPage     from './pages/PatientInfoPage';
import DoctorInfoPage      from './pages/DoctorInfoPage';
import PrivacyPolicyPage   from './pages/PrivacyPolicyPage';
import TermsOfServicePage  from './pages/TermsOfServicePage';

function App() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Initializing secure session…" />;
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-slate-900 font-inter">
        <Navbar />

        <Routes>
          {/* Public routes */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/patient-info"  element={<PatientInfoPage />} />
          <Route path="/doctor-info"   element={<DoctorInfoPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms"         element={<TermsOfServicePage />} />

          {/* Pending approval — auth required */}
          <Route
            path="/pending-approval"
            element={
              <ProtectedRoute requireAuth>
                <PendingApprovalPage />
              </ProtectedRoute>
            }
          />

          {/* Main dashboard — auth + Doctor must be approved */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAuth requireApproved>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard — strict email guard (frontend) + token guard (backend) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
