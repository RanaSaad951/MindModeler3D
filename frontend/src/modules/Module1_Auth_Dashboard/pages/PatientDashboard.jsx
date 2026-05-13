import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FiHome, FiFolder, FiUploadCloud, FiSettings, FiLogOut,
  FiBell, FiUser, FiActivity, FiDownload, FiMenu, FiX, FiBox,
} from 'react-icons/fi';
import { HiOutlineUserCircle } from 'react-icons/hi';

const StethoscopeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4.5 12.75a4.5 4.5 0 009 0V4.5M4.5 4.5v0a1.5 1.5 0 013 0v0M10.5 4.5v0a1.5 1.5 0 013 0v0M19.5 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM17.25 12.75v1.5a3.75 3.75 0 01-3.75 3.75h-1.5" />
  </svg>
);

const navItems = [
  { label: 'Dashboard',   icon: FiHome,        id: 'nav-dashboard' },
  { label: 'My Scans',    icon: FiFolder,       id: 'nav-scans' },
  { label: 'Upload Scan', icon: FiUploadCloud,  id: 'nav-upload' },
  { label: 'Settings',    icon: FiSettings,     id: 'nav-settings' },
];

/* ── Info Row helper for the Patient Info card ─────────────── */
const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/15 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-cyan-400" />
    </div>
    <div>
      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PATIENT DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const PatientDashboard = () => {
  const { mongoProfile, firebaseUser, logout, fetchMongoProfile } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const patientName = mongoProfile?.name || firebaseUser?.displayName || 'Patient';

  /* ── Fetch fresh profile data on mount ──────────────────── */
  useEffect(() => {
    if (firebaseUser?.uid) {
      fetchMongoProfile(firebaseUser.uid).then((p) => {
        if (p) setProfileData(p);
      });
    }
  }, [firebaseUser, fetchMongoProfile]);

  // Keep profileData in sync with context updates
  useEffect(() => {
    if (mongoProfile) setProfileData(mongoProfile);
  }, [mongoProfile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-[#050505] flex relative">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[260px] flex flex-col
        bg-white/[0.03] backdrop-blur-md border-r border-white/[0.08] transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="flex items-center justify-between px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <FiBox className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                <span className="text-cyan-400">Mind</span>{' '}
                <span className="text-white">Modeler</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">3D Platform</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors" aria-label="Close sidebar">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, id }) => {
            const isActive = activeNav === label;
            return (
              <button key={id} id={id}
                onClick={() => {
                  if (label === 'Settings') {
                    navigate('/patient-settings');
                  } else {
                    setActiveNav(label);
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'text-cyan-400 bg-cyan-500/[0.08] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.06)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
                <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <div className="border-t border-white/[0.06] pt-4 mb-3" />
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
              {profileData?.profilePic || profileData?.profilePicURL
                ? <img src={profileData.profilePic ? `http://localhost:5000/${profileData.profilePic}` : profileData.profilePicURL} alt="" className="w-full h-full object-cover" />
                : <FiUser className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{patientName}</p>
              <p className="text-[10px] text-slate-500 truncate">{firebaseUser?.email}</p>
            </div>
          </div>
          <button id="sidebar-signout-btn" onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent
              hover:border-red-500/20 transition-all duration-200 group">
            <FiLogOut className="w-[18px] h-[18px] text-slate-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen overflow-y-auto">

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-lg border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white transition-colors" aria-label="Open sidebar">
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs text-slate-500 font-medium">{greeting()},</p>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{patientName}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button id="notification-bell"
                className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center
                  text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200" aria-label="Notifications">
                <FiBell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </button>
              <div id="user-avatar"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border-2 border-cyan-500/30 flex items-center justify-center cursor-pointer
                  hover:border-cyan-400/60 transition-all duration-200 overflow-hidden">
                {profileData?.profilePic || profileData?.profilePicURL
                  ? <img src={profileData.profilePic ? `http://localhost:5000/${profileData.profilePic}` : profileData.profilePicURL} alt="" className="w-full h-full object-cover" />
                  : <HiOutlineUserCircle className="w-6 h-6 text-cyan-400" />}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-6 lg:px-10 py-8 space-y-7 animate-fade-in">

          {/* ─── PATIENT INFORMATION CARD ──────────────────── */}
          <div id="patient-info-card"
            className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden
              hover:border-cyan-500/20 transition-all duration-300"
            style={{ boxShadow: '0 0 60px rgba(6,182,212,0.04), 0 8px 32px rgba(0,0,0,0.3)' }}>
            
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Patient Information</h3>
                  <p className="text-xs text-slate-500">Your registered medical profile</p>
                </div>
              </div>
              {profileData?.uniquePatientId && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  ID: {profileData.uniquePatientId}
                </span>
              )}
            </div>

            {/* Card Body — Profile Pic + Info Grid */}
            <div className="px-6 lg:px-8 py-6 lg:py-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5
                    border-2 border-cyan-500/20 flex items-center justify-center overflow-hidden
                    shadow-[0_0_30px_rgba(6,182,212,0.08)]">
                    {profileData?.profilePic || profileData?.profilePicURL ? (
                      <img src={profileData.profilePic ? `http://localhost:5000/${profileData.profilePic}` : profileData.profilePicURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <HiOutlineUserCircle className="w-16 h-16 text-cyan-400/40" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">{profileData?.name || patientName}</p>
                    <p className="text-slate-500 text-xs font-medium">{firebaseUser?.email}</p>
                  </div>
                  {/* Mobile Patient ID badge */}
                  {profileData?.uniquePatientId && (
                    <span className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                      text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                      ID: {profileData.uniquePatientId}
                    </span>
                  )}
                </div>

                {/* Info Grid */}
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 divide-y sm:divide-y-0 divide-white/[0.04]">
                    <InfoItem label="Patient ID" value={profileData?.uniquePatientId} icon={FiBox} />
                    <InfoItem label="CNIC Number" value={profileData?.cnic} icon={FiUser} />
                    <InfoItem label="Age" value={profileData?.age ? `${profileData.age} years` : null} icon={FiActivity} />
                    <InfoItem label="Gender" value={profileData?.gender} icon={FiUser} />
                    <InfoItem label="Contact" value={profileData?.contactNumber} icon={FiBell} />
                    <InfoItem label="City" value={profileData?.city} icon={FiFolder} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── STATS ROW (3 Cards) ─────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div id="stat-total-scans"
              className="bg-white/[0.04] backdrop-blur-md border border-white/[0.10] rounded-2xl p-6
                hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.06)] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20
                  flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiFolder className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Scans</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">0</p>
              <p className="text-sm font-medium text-slate-400 mt-1">Total Scans</p>
            </div>

            <div id="stat-ai-status"
              className="bg-white/[0.04] backdrop-blur-md border border-white/[0.10] rounded-2xl p-6
                hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.06)] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-600/5 border border-amber-500/20
                  flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiActivity className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">AI</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                </span>
                <p className="text-lg font-bold text-emerald-300">Ready</p>
              </div>
              <p className="text-sm font-medium text-slate-400 mt-1">AI Status</p>
            </div>

            <div id="stat-assigned-doctor"
              className="bg-white/[0.04] backdrop-blur-md border border-white/[0.10] rounded-2xl p-6
                hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-600/5 border border-violet-500/20
                  flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <StethoscopeIcon className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor</span>
              </div>
              <p className="text-lg font-bold text-white">Not Assigned</p>
              <p className="text-sm font-medium text-slate-400 mt-1">Assigned Doctor</p>
            </div>
          </div>

          {/* ─── ACTION CARDS ────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="card-upload-mri"
              className="bg-white/[0.03] backdrop-blur-md border-2 border-dashed border-white/[0.12] rounded-2xl p-8
                hover:border-cyan-500/40 hover:bg-cyan-500/[0.02] transition-all duration-300 group cursor-pointer
                flex flex-col items-center justify-center text-center min-h-[260px]"
              onClick={() => alert('Coming in Module 2')}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20
                flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
                <FiUploadCloud className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload New MRI</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
                Upload New DICOM/MRI Scan for AI-powered analysis and 3D reconstruction.
              </p>
              <button id="upload-file-btn"
                onClick={(e) => { e.stopPropagation(); alert('Coming in Module 2'); }}
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white
                  bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20
                  hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200">
                Upload File
              </button>
            </div>

            <div id="card-3d-viewer"
              className="relative overflow-hidden rounded-2xl p-8 min-h-[260px]
                flex flex-col items-center justify-center text-center cursor-pointer group
                transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.12) 50%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(6,182,212,0.15)',
              }}
              onClick={() => alert('Coming in Module 2')}>
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full opacity-15 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30
                  flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-cyan-500/50 transition-all duration-300">
                  <FiBox className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Launch AI 3D Viewer</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
                  Explore your brain MRI in an interactive 3D environment with AI-powered annotations.
                </p>
                <button id="view-3d-btn"
                  onClick={(e) => { e.stopPropagation(); alert('Coming in Module 2'); }}
                  className="px-7 py-2.5 rounded-full text-sm font-semibold text-white
                    bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20
                    hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200">
                  View 3D Model
                </button>
              </div>
            </div>
          </div>

          {/* ─── RECENT SCANS TABLE ──────────────────────────── */}
          <div id="recent-scans-section"
            className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20
                  flex items-center justify-center">
                  <FiFolder className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Scans</h3>
                  <p className="text-xs text-slate-500">Your latest MRI scan history</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scan ID</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FiFolder className="w-8 h-8 text-slate-600" />
                        <p className="text-sm text-slate-500 font-medium">No scans uploaded yet</p>
                        <p className="text-xs text-slate-600">Upload your first MRI scan to get started</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-4">
            <p className="text-xs text-slate-600">
              🔒 256-bit SSL · HIPAA Compliant · Mind Modeler 3D v1.0
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
