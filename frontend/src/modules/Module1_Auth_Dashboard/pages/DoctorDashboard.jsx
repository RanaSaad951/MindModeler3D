import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FiHome, FiFolder, FiUploadCloud, FiSettings, FiLogOut, FiBell, FiUser, FiActivity, FiMenu, FiX, FiBox, FiUsers, FiFileText } from 'react-icons/fi';
import { HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineExclamation } from 'react-icons/hi';

const navItems = [
  { label: 'Dashboard',     icon: FiHome,       id: 'nav-dashboard' },
  { label: 'My Patients',   icon: FiUsers,      id: 'nav-patients'  },
  { label: 'Upload Scan',   icon: FiUploadCloud, id: 'nav-upload'   },
  { label: 'Reports',       icon: FiFileText,   id: 'nav-reports'   },
  { label: 'Settings',      icon: FiSettings,   id: 'nav-settings'  },
];

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

const DoctorDashboard = () => {
  const { mongoProfile, firebaseUser, logout, fetchMongoProfile } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const doctorName = mongoProfile?.name || firebaseUser?.displayName || 'Doctor';
  const isApproved = profileData?.isApprovedByAdmin ?? false;

  useEffect(() => {
    if (firebaseUser?.uid) {
      fetchMongoProfile(firebaseUser.uid).then((p) => { if (p) setProfileData(p); });
    }
  }, [firebaseUser, fetchMongoProfile]);

  useEffect(() => { if (mongoProfile) setProfileData(mongoProfile); }, [mongoProfile]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-[#050505] flex relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[260px] flex flex-col
        bg-white/[0.03] backdrop-blur-md border-r border-white/[0.08] transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <FiBox className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold"><span className="text-cyan-400">Mind</span> <span className="text-white">Modeler</span></h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">3D Platform</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, id }) => {
            const isActive = activeNav === label;
            return (
              <button key={id} id={id}
                onClick={() => {
                  if (label === 'Settings') { navigate('/doctor-settings'); }
                  else { setActiveNav(label); setSidebarOpen(false); }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive ? 'text-cyan-400 bg-cyan-500/[0.08] border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`}>
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
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
              {profileData?.profilePicURL
                ? <img src={profileData.profilePicURL} alt="" className="w-full h-full object-cover" />
                : <FiUser className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Dr. {doctorName}</p>
              <p className="text-[10px] text-slate-500 truncate">{firebaseUser?.email}</p>
            </div>
          </div>
          <button id="sidebar-signout-btn" onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent hover:border-red-500/20 transition-all duration-200 group">
            <FiLogOut className="w-[18px] h-[18px] text-slate-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-lg border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs text-slate-500">{greeting()},</p>
                <h2 className="text-lg font-bold text-white">
                  Welcome, Dr. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{doctorName}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button id="notification-bell" className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <FiBell className="w-[18px] h-[18px]" />
                {!isApproved && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border-2 border-cyan-500/30 flex items-center justify-center overflow-hidden">
                {profileData?.profilePicURL
                  ? <img src={profileData.profilePicURL} alt="" className="w-full h-full object-cover" />
                  : <HiOutlineUserCircle className="w-6 h-6 text-cyan-400" />}
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 lg:px-10 py-8 space-y-7 animate-fade-in">

          {/* ── APPROVAL WARNING BANNER ──────────────────────── */}
          {!isApproved && (
            <div id="approval-warning-banner"
              className="flex items-start gap-4 px-6 py-5 rounded-2xl border animate-slide-up"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.04))',
                borderColor: 'rgba(245,158,11,0.3)',
                boxShadow: '0 0 30px rgba(245,158,11,0.06)',
              }}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <HiOutlineExclamation className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Account Under Review</p>
                <p className="text-sm text-amber-400/80 mt-1 leading-relaxed">
                  Your account is currently under review by the Administrator. Access to clinical analysis tools is restricted until verified. You will be notified once approved.
                </p>
              </div>
            </div>
          )}

          {/* ── DOCTOR INFO CARD ─────────────────────────────── */}
          <div id="doctor-info-card"
            className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden hover:border-cyan-500/20 transition-all duration-300"
            style={{ boxShadow: '0 0 60px rgba(6,182,212,0.04), 0 8px 32px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Doctor Information</h3>
                  <p className="text-xs text-slate-500">Your registered clinical profile</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {profileData?.uniqueDoctorId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                    ID: {profileData.uniqueDoctorId}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border
                  ${isApproved ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-300 bg-amber-500/10 border-amber-500/20'}`}>
                  {isApproved ? <><HiOutlineShieldCheck className="w-3 h-3" /> Verified</> : '⏳ Pending Approval'}
                </span>
              </div>
            </div>

            <div className="px-6 lg:px-8 py-6 lg:py-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border-2 border-cyan-500/20 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.08)]">
                    {profileData?.profilePicURL
                      ? <img src={profileData.profilePicURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                      : <HiOutlineUserCircle className="w-16 h-16 text-cyan-400/40" />}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">Dr. {profileData?.name || doctorName}</p>
                    <p className="text-slate-500 text-xs font-medium">{profileData?.specialization || 'Physician'}</p>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 divide-y sm:divide-y-0 divide-white/[0.04]">
                    <InfoItem label="Doctor ID"    value={profileData?.uniqueDoctorId}   icon={FiBox} />
                    <InfoItem label="PMDC Number"  value={profileData?.pmdcNumber}        icon={FiUser} />
                    <InfoItem label="Specialization" value={profileData?.specialization}  icon={FiActivity} />
                    <InfoItem label="Contact"      value={profileData?.contactNumber}     icon={FiBell} />
                    <InfoItem label="City"         value={profileData?.city}              icon={FiFolder} />
                    <InfoItem label="Status"       value={isApproved ? '✅ Approved' : '⏳ Pending Review'} icon={HiOutlineShieldCheck} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS ROW ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { id: 'stat-patients', label: 'Patients Assigned', value: '0', icon: FiUsers, color: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'hover:border-cyan-500/30' },
              { id: 'stat-scans',    label: 'MRI Scans Pending', value: '0', icon: FiUploadCloud, color: 'from-amber-500/15 to-yellow-600/5', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/30' },
              { id: 'stat-reports',  label: 'Reports Generated', value: '0', icon: FiFileText, color: 'from-violet-500/15 to-purple-600/5', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/30' },
            ].map((s) => (
              <div key={s.id} id={s.id}
                className={`bg-white/[0.04] backdrop-blur-md border ${s.border} ${s.hover} rounded-2xl p-6 transition-all duration-300 group`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} border ${s.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className={`w-5 h-5 ${s.text}`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Module 2+</span>
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── ACTION CARDS ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="card-upload-mri"
              className={`bg-white/[0.03] border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[260px] transition-all duration-300 group
                ${isApproved ? 'border-white/[0.12] hover:border-cyan-500/40 hover:bg-cyan-500/[0.02] cursor-pointer' : 'border-white/[0.06] opacity-60 cursor-not-allowed'}`}
              onClick={() => isApproved && alert('Coming in Module 2')}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 flex items-center justify-center mb-5 transition-all duration-300 ${isApproved ? 'group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]' : ''}`}>
                <FiUploadCloud className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload MRI Scan</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">Upload DICOM/NIfTI MRI files for AI-powered 3D reconstruction and anomaly detection.</p>
              <button id="upload-scan-btn" disabled={!isApproved}
                onClick={(e) => { e.stopPropagation(); isApproved && alert('Coming in Module 2'); }}
                className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200">
                Upload Scan
              </button>
            </div>

            <div id="card-3d-viewer"
              className={`relative overflow-hidden rounded-2xl p-8 min-h-[260px] flex flex-col items-center justify-center text-center transition-all duration-300 group
                ${isApproved ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.08),rgba(59,130,246,0.12),rgba(139,92,246,0.06))', border: '1px solid rgba(6,182,212,0.15)' }}
              onClick={() => isApproved && alert('Coming in Module 2')}>
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle,#06b6d4,transparent 70%)' }} />
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center mb-5 transition-all duration-300 ${isApproved ? 'group-hover:scale-110 group-hover:shadow-cyan-500/50' : ''}`}>
                  <FiBox className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Review 3D Models</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">Explore patient MRI scans in an interactive 3D viewer with AI annotations and measurements.</p>
                <button id="review-3d-btn" disabled={!isApproved}
                  onClick={(e) => { e.stopPropagation(); isApproved && alert('Coming in Module 2'); }}
                  className="px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200">
                  View 3D Models
                </button>
              </div>
            </div>
          </div>

          {/* ── PATIENT LIST TABLE ────────────────────────────── */}
          <div id="patient-list-section" className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assigned Patients</h3>
                  <p className="text-xs text-slate-500">Recent patient activity</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Patient ID', 'Full Name', 'Last Scan Date', 'AI Status', 'Action'].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'MM-P-0001', name: 'Ali Raza', date: '2026-05-06', status: 'Analyzed' },
                    { id: 'MM-P-0002', name: 'Sara Khan', date: '2026-05-05', status: 'Pending' },
                  ].map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-cyan-400">{p.id}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{p.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                          ${p.status === 'Analyzed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => alert('Coming in Module 3')}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-full transition-all">
                          View Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center pb-4">
            <p className="text-xs text-slate-600">🔒 256-bit SSL · HIPAA Compliant · Mind Modeler 3D v1.0</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
