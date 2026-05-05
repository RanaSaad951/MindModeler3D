import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute
 *
 * Props:
 *  requireAuth    — user must be logged in
 *  requireApproved— Doctor must have isApproved === true  → else /pending-approval
 *  requireAdmin   — user email must be ADMIN_EMAIL         → else /dashboard (frontend guard)
 */
const ProtectedRoute = ({ children, requireAuth, requireApproved, requireAdmin }) => {
  const { firebaseUser, mongoProfile, authLoading, isAdmin, ADMIN_EMAIL } = useAuth();

  // Wait for the initial Firebase onAuthStateChanged to resolve
  if (authLoading) {
    return <LoadingSpinner fullScreen message="Verifying credentials…" />;
  }

  // ── 1. Must be authenticated ─────────────────────────────────
  if (requireAuth && !firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // ── 2. Admin-only route ──────────────────────────────────────
  //    Frontend guard: email check. Backend enforces this independently via Firebase token.
  if (requireAdmin) {
    if (!firebaseUser) return <Navigate to="/login" replace />;
    if (!isAdmin) {
      console.warn(
        `[ProtectedRoute] Access denied to /admin for ${firebaseUser.email}. Required: ${ADMIN_EMAIL}`
      );
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // ── 3. Approval-gated route ──────────────────────────────────
  //    If the profile has loaded and the user is an unapproved Doctor → pending screen
  if (requireApproved && mongoProfile) {
    if (mongoProfile.role === 'Doctor' && !mongoProfile.isApproved) {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
