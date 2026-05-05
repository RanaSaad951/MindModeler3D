import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const ADMIN_EMAIL  = import.meta.env.VITE_ADMIN_EMAIL  || 'admin@mindmodeler.com';

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [mongoProfile, setMongoProfile] = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);  // initial onAuthStateChanged

  // ── Fetch MongoDB profile by Firebase UID ───────────────────
  const fetchMongoProfile = useCallback(async (uid) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setMongoProfile(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Failed to fetch MongoDB profile:', err);
    }
    return null;
  }, []);

  // ── Subscribe to Firebase auth state ────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchMongoProfile(user.uid);
      } else {
        setMongoProfile(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [fetchMongoProfile]);

  // ── Auth actions ─────────────────────────────────────────────
  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchMongoProfile(cred.user.uid);
    return { firebaseUser: cred.user, mongoProfile: profile };
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setMongoProfile(null);
  };

  // ── Admin check (frontend guard only) ───────────────────────
  const isAdmin = firebaseUser?.email === ADMIN_EMAIL;

  const value = {
    firebaseUser,
    mongoProfile,
    authLoading,
    isAdmin,
    register,
    login,
    logout,
    fetchMongoProfile,
    BACKEND_URL,
    ADMIN_EMAIL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
