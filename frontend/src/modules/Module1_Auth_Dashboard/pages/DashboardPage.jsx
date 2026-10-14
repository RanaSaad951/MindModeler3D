import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

/* ══════════════════════════════════════════════════════════════
 *  DashboardPage — Role-Based Router (Traffic Police)
 *
 *  This page does NOT render any UI. It checks the current
 *  user's role and immediately redirects them:
 *
 *    • Admin   → /admin
 *    • Doctor  → /doctor-dashboard
 *    • Patient → /patient-dashboard
 *
 *  This keeps the /dashboard route alive so nothing breaks,
 *  while ensuring every user lands on their correct dashboard.
 * ══════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { mongoProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ── 1. Admin gets top priority ──────────────────────────────
    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    const role = mongoProfile?.role;

    // ── 2. Doctor redirect ─────────────────────────────────────
    if (role === 'Doctor') {
      navigate('/doctor-dashboard', { replace: true });
      return;
    }

    // ── 3. Patient redirect ────────────────────────────────────
    if (role === 'Patient') {
      navigate('/patient-dashboard', { replace: true });
      return;
    }

    // ── 4. Fallback: no profile yet → go home ──────────────────
    // This covers edge cases where the profile hasn't loaded or
    // the role is unrecognized.
    if (mongoProfile) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, mongoProfile, navigate]);

  // Show a brief loading spinner while the redirect fires
  return <LoadingSpinner fullScreen message="Redirecting to your dashboard…" />;
};

export default DashboardPage;
