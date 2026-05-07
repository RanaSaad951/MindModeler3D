import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from './Toast';
import { useState } from 'react';
import {
  HiOutlineLogout,
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

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

const NavLink = ({ to, children, active, icon: Icon }) => (
  <Link
    to={to}
    className={`text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
      active
        ? 'text-cyan-400 bg-cyan-400/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </Link>
);

const Navbar = () => {
  const { firebaseUser, mongoProfile, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on auth pages or pages with their own inline navbar
  const hideOn = [
    '/login', '/register', '/', '/patient-info', '/doctor-info',
    '/privacy-policy', '/terms', '/forgot-password',
    '/patient-dashboard', '/complete-profile', '/patient-settings',
    '/doctor-dashboard', '/complete-doctor-profile', '/doctor-settings',
  ];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: '#0f172a' }}
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

          {/* Desktop Nav links */}
          {firebaseUser && (
            <nav className="hidden sm:flex items-center gap-1">
              {isAdmin && (
                <NavLink to="/admin" active={isActive('/admin')} icon={HiOutlineShieldCheck}>Admin</NavLink>
              )}
              <NavLink to="/dashboard" active={isActive('/dashboard')} icon={HiOutlineViewGrid}>Dashboard</NavLink>
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
                  className="hidden sm:flex text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10 disabled:opacity-50 items-center gap-1.5"
                  id="navbar-logout-btn"
                >
                  <HiOutlineLogout className="w-3.5 h-3.5" />
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="sm:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
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

      {/* Mobile Menu */}
      {mobileOpen && firebaseUser && (
        <div className="sm:hidden border-t border-white/[0.06] animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-2"><HiOutlineShieldCheck className="w-4 h-4" /> Admin Panel</span>
              </Link>
            )}
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <span className="flex items-center gap-2"><HiOutlineViewGrid className="w-4 h-4" /> Dashboard</span>
            </Link>

            <div className="pt-2 mt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium truncate">{mongoProfile?.name || firebaseUser.email}</span>
                {mongoProfile?.role && (
                  <span className="badge-cyan text-[10px] px-2 py-0.5">{mongoProfile.role}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full mt-1 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <HiOutlineLogout className="w-4 h-4" />
                {loggingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
