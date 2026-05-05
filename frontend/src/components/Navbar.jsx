import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { useState } from 'react';

const BrainIcon = () => (
  <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7" aria-hidden="true">
    <circle cx="18" cy="18" r="18" fill="url(#ng)" />
    <path
      d="M12 20c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6m0-12c0-2.2 1.8-4 4-4"
      stroke="#fff" strokeWidth="1.8" strokeLinecap="round"
    />
    <path d="M18 14v4l2.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="ng" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06b6d4" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-lg ${
      active
        ? 'text-cyan-400 bg-cyan-400/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const { firebaseUser, mongoProfile, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      addToast('Signed out successfully.', 'success');
      navigate('/login');
    } catch {
      addToast('Failed to sign out. Please try again.', 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on auth pages
  const hideOn = ['/login', '/register'];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <BrainIcon />
            <div>
              <span className="text-white font-bold text-sm tracking-tight leading-none block">
                Mind Modeler <span className="text-cyan-400">3D</span>
              </span>
              <span className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">
                Clinical AI System
              </span>
            </div>
          </Link>

          {/* Nav links */}
          {firebaseUser && (
            <nav className="hidden sm:flex items-center gap-1">
              {isAdmin && (
                <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
              )}
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {firebaseUser ? (
              <>
                {/* User pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-300 font-medium max-w-[140px] truncate">
                    {mongoProfile?.name || firebaseUser.email}
                  </span>
                  {mongoProfile?.role && (
                    <span className="badge-cyan text-[10px] px-2 py-0.5">{mongoProfile.role}</span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10 disabled:opacity-50"
                  id="navbar-logout-btn"
                >
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register"
                  className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg transition-all"
                  style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
