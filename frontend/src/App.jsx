import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ─── Module 1: Auth & Dashboard ───────────────────────────────
import LoadingSpinner        from './modules/Module1_Auth_Dashboard/components/LoadingSpinner';
import ProtectedRoute        from './modules/Module1_Auth_Dashboard/components/ProtectedRoute';
import Navbar                from './modules/Module1_Auth_Dashboard/components/Navbar';
import ScrollToTop           from './modules/Module1_Auth_Dashboard/components/ScrollToTop';

import HomePage              from './modules/Module1_Auth_Dashboard/pages/HomePage';
import LoginPage             from './modules/Module1_Auth_Dashboard/pages/LoginPage';
import RegisterPage          from './modules/Module1_Auth_Dashboard/pages/RegisterPage';
import ForgotPasswordPage    from './modules/Module1_Auth_Dashboard/pages/ForgotPasswordPage';

// Patient flow
import CompletePatientProfile from './modules/Module1_Auth_Dashboard/pages/CompletePatientProfile';
import PatientSettings        from './modules/Module1_Auth_Dashboard/pages/PatientSettings';
import PatientDashboard       from './modules/Module1_Auth_Dashboard/pages/PatientDashboard';

// Doctor flow
import CompleteDoctorProfile  from './modules/Module1_Auth_Dashboard/pages/CompleteDoctorProfile';
import DoctorSettings         from './modules/Module1_Auth_Dashboard/pages/DoctorSettings';
import DoctorDashboard        from './modules/Module1_Auth_Dashboard/pages/DoctorDashboard';

// Shared / Legacy
import DashboardPage          from './modules/Module1_Auth_Dashboard/pages/DashboardPage';
import PendingApprovalPage    from './modules/Module1_Auth_Dashboard/pages/PendingApprovalPage';
import AdminDashboard         from './modules/Module1_Auth_Dashboard/pages/AdminDashboard';
import PatientInfoPage        from './modules/Module1_Auth_Dashboard/pages/PatientInfoPage';
import DoctorInfoPage         from './modules/Module1_Auth_Dashboard/pages/DoctorInfoPage';
import PrivacyPolicyPage      from './modules/Module1_Auth_Dashboard/pages/PrivacyPolicyPage';
import TermsOfServicePage     from './modules/Module1_Auth_Dashboard/pages/TermsOfServicePage';

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
          {/* ── Public routes ─────────────────────────────── */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/patient-info"   element={<PatientInfoPage />} />
          <Route path="/doctor-info"    element={<DoctorInfoPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms"          element={<TermsOfServicePage />} />

          {/* ── Pending approval ──────────────────────────── */}
          <Route path="/pending-approval" element={<ProtectedRoute requireAuth><PendingApprovalPage /></ProtectedRoute>} />

          {/* ── Patient onboarding & dashboard ────────────── */}
          <Route path="/complete-profile"
            element={<ProtectedRoute requireAuth><CompletePatientProfile /></ProtectedRoute>} />
          <Route path="/patient-dashboard"
            element={<ProtectedRoute requireAuth requireApproved requireProfileComplete><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient-settings"
            element={<ProtectedRoute requireAuth requireProfileComplete><PatientSettings /></ProtectedRoute>} />

          {/* ── Doctor onboarding & dashboard ─────────────── */}
          <Route path="/complete-doctor-profile"
            element={<ProtectedRoute requireAuth><CompleteDoctorProfile /></ProtectedRoute>} />
          <Route path="/doctor-dashboard"
            element={<ProtectedRoute requireAuth requireDoctorProfile><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor-settings"
            element={<ProtectedRoute requireAuth requireDoctorProfile><DoctorSettings /></ProtectedRoute>} />

          {/* ── Legacy doctor/admin dashboard ─────────────── */}
          <Route path="/dashboard"
            element={<ProtectedRoute requireAuth requireApproved><DashboardPage /></ProtectedRoute>} />

          {/* ── Admin dashboard ───────────────────────────── */}
          <Route path="/admin"
            element={<ProtectedRoute requireAuth requireAdmin><AdminDashboard /></ProtectedRoute>} />

          {/* ── 404 fallback ──────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
