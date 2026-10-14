import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute
 *
 * Props:
 *  requireAuth              — user must be logged in
 *  requireApproved          — Doctor must have isApprovedByAdmin === true → else /pending-approval
 *  requireAdmin             — user email must be ADMIN_EMAIL       → else /dashboard
 *  requireProfileComplete   — Patient must have isProfileComplete  → else /complete-profile
 *  requireDoctorProfile     — Doctor must have isProfileComplete   → else /complete-doctor-profile
 */
const ProtectedRoute = ({
  children,
  requireAuth,
  requireApproved,
  requireAdmin,
  requireProfileComplete,
  requireDoctorProfile,
}) => {
  const { firebaseUser, mongoProfile, authLoading, isAdmin, ADMIN_EMAIL } = useAuth();

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Verifying credentials…" />;
  }

  // ── 1. Must be authenticated ─────────────────────────────────
  if (requireAuth && !firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // ── 2. Admin bypass — admins skip ALL role-specific gates ────
  //    Admin may not have a MongoDB profile, so doctor/patient
  //    checks (approval, profile-complete) must never block them.
  if (firebaseUser && isAdmin) {
    // If this is an admin-only route, allow through
    // If this is ANY other protected route, also allow through
    return children;
  }

  // ── 3. Admin-only route (non-admin user trying to access) ───
  if (requireAdmin) {
    if (!firebaseUser) return <Navigate to="/login" replace />;
    console.warn(`[ProtectedRoute] Access denied to /admin for ${firebaseUser.email}. Required: ${ADMIN_EMAIL}`);
    return <Navigate to="/dashboard" replace />;
  }

  // ── 3. Doctor profile onboarding gate ───────────────────────
  //    Doctor who hasn't completed profile → /complete-doctor-profile
  if (requireDoctorProfile && mongoProfile) {
    if (mongoProfile.role === 'Doctor' && !mongoProfile.isProfileComplete) {
      return <Navigate to="/complete-doctor-profile" replace />;
    }
  }

  // ── 4. Approval-gated route ──────────────────────────────────
  if (requireApproved && mongoProfile) {
    if (mongoProfile.role === 'Doctor' && !mongoProfile.isApprovedByAdmin) {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // ── 5. Patient profile-complete gate ────────────────────────
  if (requireProfileComplete && mongoProfile) {
    if (mongoProfile.role === 'Patient' && !mongoProfile.isProfileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
