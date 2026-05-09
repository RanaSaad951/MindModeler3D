import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FiHome, FiSettings, FiLogOut, FiMenu, FiX, FiBox,
  FiUsers, FiUserCheck, FiUserX, FiUser, FiActivity,
  FiShield, FiRefreshCw, FiClock, FiCheckCircle,
} from 'react-icons/fi';

/* ── Helpers ───────────────────────────────────────────────── */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── Sidebar Nav Items ─────────────────────────────────────── */
const navItems = [
  { label: 'Dashboard',      icon: FiHome,      id: 'admin-nav-dashboard' },
  { label: 'Doctor Requests', icon: FiUsers,     id: 'admin-nav-doctors'  },
  { label: 'Manage Users',    icon: FiUser,      id: 'admin-nav-manage-users' },
  { label: 'Settings',        icon: FiSettings,  id: 'admin-nav-settings' },
];

/* ── Empty State ───────────────────────────────────────────── */
const EmptyState = () => (
  <div className="text-center py-20 space-y-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-3"
      style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)' }}>
      <FiCheckCircle className="w-8 h-8 text-emerald-400" />
    </div>
    <p className="text-slate-300 font-semibold text-lg">All caught up!</p>
    <p className="text-slate-500 text-sm max-w-xs mx-auto">
      No doctors are currently awaiting approval. New applications will appear here automatically.
    </p>
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const AdminDashboard = () => {
  const { firebaseUser, BACKEND_URL, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [doctors,      setDoctors]      = useState([]);
  const [allUsers,     setAllUsers]     = useState([]);
  const [stats,        setStats]        = useState({ totalDoctors: 0, pendingDoctors: 0, approvedDoctors: 0, totalPatients: 0 });
  const [fetching,     setFetching]     = useState(true);
  const [fetchingUsers,setFetchingUsers]= useState(false);
  const [actionUid,    setActionUid]    = useState(null); // uid currently being processed
  const [activeNav,    setActiveNav]    = useState('Dashboard');
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  /* ── Fetch pending doctors ───────────────────────────────── */
  const fetchPendingDoctors = useCallback(async () => {
    setFetching(true);
    try {
      const token = await firebaseUser.getIdToken();
      const [doctorsRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/pending-doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const doctorsData = await doctorsRes.json();
      const statsData   = await statsRes.json();

      if (!doctorsRes.ok) throw new Error(doctorsData.message);
      setDoctors(doctorsData.doctors);

      if (statsRes.ok) setStats(statsData.stats);
    } catch (err) {
      addToast(err.message || 'Failed to fetch data.', 'error');
    } finally {
      setFetching(false);
    }
  }, [firebaseUser, BACKEND_URL, addToast]);

  useEffect(() => { fetchPendingDoctors(); }, [fetchPendingDoctors]);

  /* ── Fetch all users ─────────────────────────────────────── */
  const fetchAllUsers = useCallback(async () => {
    setFetchingUsers(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAllUsers(data.users);
    } catch (err) {
      addToast(err.message || 'Failed to fetch users.', 'error');
    } finally {
      setFetchingUsers(false);
    }
  }, [firebaseUser, BACKEND_URL, addToast]);

  useEffect(() => {
    if (activeNav === 'Manage Users') fetchAllUsers();
  }, [activeNav, fetchAllUsers]);

  /* ── Delete a user ───────────────────────────────────────── */
  const handleDeleteUser = async (uid, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action is permanent and cannot be undone.`)) return;

    setActionUid(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAllUsers((prev) => prev.filter((u) => u.firebaseUid !== uid));
      addToast(`${name} has been deleted successfully.`, 'success');
      
      // Update stats dynamically
      setStats((prev) => {
        const isDoctor = allUsers.find(u => u.firebaseUid === uid)?.role === 'Doctor';
        return {
          ...prev,
          totalDoctors: isDoctor ? Math.max(0, prev.totalDoctors - 1) : prev.totalDoctors,
          approvedDoctors: isDoctor ? Math.max(0, prev.approvedDoctors - 1) : prev.approvedDoctors,
          totalPatients: !isDoctor ? Math.max(0, prev.totalPatients - 1) : prev.totalPatients,
        };
      });
    } catch (err) {
      addToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setActionUid(null);
    }
  };

  /* ── Approve a doctor ────────────────────────────────────── */
  const handleApprove = async (uid, name) => {
    setActionUid(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/approve/${uid}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Instant UI update
      setDoctors((prev) => prev.filter((d) => d.firebaseUid !== uid));
      setStats((prev) => ({
        ...prev,
        pendingDoctors: Math.max(0, prev.pendingDoctors - 1),
        approvedDoctors: prev.approvedDoctors + 1,
      }));
      addToast(`Dr. ${name} has been approved successfully.`, 'success');
    } catch (err) {
      addToast(err.message || 'Approval failed.', 'error');
    } finally {
      setActionUid(null);
    }
  };

  /* ── Reject a doctor ─────────────────────────────────────── */
  const handleReject = async (uid, name) => {
    if (!window.confirm(`Are you sure you want to reject Dr. ${name}'s application? This action cannot be undone.`)) return;

    setActionUid(uid);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${BACKEND_URL}/api/admin/reject/${uid}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Instant UI update
      setDoctors((prev) => prev.filter((d) => d.firebaseUid !== uid));
      setStats((prev) => ({
        ...prev,
        pendingDoctors: Math.max(0, prev.pendingDoctors - 1),
        totalDoctors: Math.max(0, prev.totalDoctors - 1),
      }));
      addToast(`Dr. ${name}'s application has been rejected.`, 'success');
    } catch (err) {
      addToast(err.message || 'Rejection failed.', 'error');
    } finally {
      setActionUid(null);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /* ── Stats card config ───────────────────────────────────── */
  const statCards = [
    {
      label: 'Total Doctors',
      value: stats.totalDoctors,
      icon: FiUsers,
      gradient: 'from-cyan-500/15 to-cyan-600/5',
      border: 'border-cyan-500/20',
      hoverBorder: 'hover:border-cyan-500/35',
      text: 'text-cyan-400',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingDoctors,
      icon: FiClock,
      gradient: 'from-amber-500/15 to-yellow-600/5',
      border: 'border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/35',
      text: 'text-amber-400',
    },
    {
      label: 'Approved',
      value: stats.approvedDoctors,
      icon: FiUserCheck,
      gradient: 'from-emerald-500/15 to-green-600/5',
      border: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/35',
      text: 'text-emerald-400',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: FiActivity,
      gradient: 'from-violet-500/15 to-purple-600/5',
      border: 'border-violet-500/20',
      hoverBorder: 'hover:border-violet-500/35',
      text: 'text-violet-400',
    },
  ];

  return (
    <div id="premium-admin-dashboard-v2" data-version="2.0" className="min-h-screen bg-[#050505] flex relative text-white">

      {/* ── Mobile overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════════════════════════════════════════
          SIDEBAR — identical structure to DoctorDashboard
         ══════════════════════════════════════════════════════ */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-[260px] flex flex-col
        bg-white/[0.03] backdrop-blur-md border-r border-white/[0.08] transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Brand */}
        <div className="flex items-center justify-between px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <FiBox className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">
                <span className="text-cyan-400">Mind</span>{' '}
                <span className="text-white">Modeler</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, id }) => {
            const isActive = activeNav === label;
            return (
              <button key={id} id={id}
                onClick={() => { setActiveNav(label); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'text-cyan-400 bg-cyan-500/[0.08] border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}>
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Admin user footer */}
        <div className="px-3 pb-6">
          <div className="border-t border-white/[0.06] pt-4 mb-3" />
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <FiShield className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">{firebaseUser?.email}</p>
            </div>
          </div>
          <button id="admin-signout-btn" onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent hover:border-red-500/20 transition-all duration-200 group">
            <FiLogOut className="w-[18px] h-[18px] text-slate-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════════════════ */}
      <main className="flex-1 min-h-screen overflow-y-auto">

        {/* ── Sticky Header ─────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-lg border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 lg:px-10 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <FiMenu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs text-slate-500">{greeting()},</p>
                <h2 className="text-lg font-bold text-white">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Admin</span> Dashboard
                </h2>
              </div>
            </div>
            <button
              id="admin-refresh-btn"
              onClick={activeNav === 'Manage Users' ? fetchAllUsers : fetchPendingDoctors}
              disabled={fetching || fetchingUsers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 transition-all border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] disabled:opacity-50 shrink-0"
            >
              <FiRefreshCw className={`w-4 h-4 ${(fetching || fetchingUsers) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        <div className="px-6 lg:px-10 py-8 space-y-7 animate-fade-in">

          {/* ── Dashboard & Doctor Requests View ──────────────── */}
          {(activeNav === 'Dashboard' || activeNav === 'Doctor Requests') && (
            <>
              {activeNav === 'Dashboard' && (
                <>
                  {/* ── Stats Grid ──────────────────────────────────── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((s) => (
                      <div key={s.label}
                        className={`bg-white/[0.03] backdrop-blur-md border ${s.border} ${s.hoverBorder} rounded-2xl p-6 transition-all duration-300 group`}
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} border ${s.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <s.icon className={`w-5 h-5 ${s.text}`} />
                          </div>
                        </div>
                        <p className="text-3xl font-extrabold text-white tracking-tight">{fetching ? '—' : s.value}</p>
                        <p className="text-sm font-medium text-slate-400 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Doctor Requests Table Card ───────────────────── */}
              <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 0 0 1px rgba(34,211,238,0.08), 0 25px 60px rgba(0,0,0,0.4)' }}>

            {/* Table header */}
            <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-600/5 border border-amber-500/20 flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Doctor Requests</h3>
                  <p className="text-xs text-slate-500">Review and manage physician applications</p>
                </div>
              </div>
              {!fetching && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-300"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {doctors.length} pending
                </span>
              )}
            </div>

            {/* Table body */}
            {fetching ? (
              <div className="py-20">
                <LoadingSpinner message="Loading pending doctors…" />
              </div>
            ) : doctors.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Physician', 'Contact', 'PMDC Number', 'Applied', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {doctors.map((doc) => (
                      <tr key={doc.firebaseUid} className="hover:bg-white/[0.02] transition-colors group">

                        {/* Name + Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-cyan-300"
                              style={{
                                background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(2,132,199,0.2))',
                                border: '1px solid rgba(34,211,238,0.15)',
                              }}>
                              {doc.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">Dr. {doc.name}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-slate-400 text-xs">{doc.email}</td>

                        {/* PMDC */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs px-2.5 py-1 rounded-lg text-cyan-300"
                            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.12)' }}>
                            {doc.pmdcNumber || '—'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(doc.createdAt)}</td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Approve */}
                            <button
                              id={`approve-btn-${doc.firebaseUid}`}
                              onClick={() => handleApprove(doc.firebaseUid, doc.name)}
                              disabled={actionUid === doc.firebaseUid}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                            >
                              {actionUid === doc.firebaseUid ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FiUserCheck className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </button>

                            {/* Reject */}
                            <button
                              id={`reject-btn-${doc.firebaseUid}`}
                              onClick={() => handleReject(doc.firebaseUid, doc.name)}
                              disabled={actionUid === doc.firebaseUid}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171',
                              }}
                            >
                              <FiUserX className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}

          {/* ── Manage Users View ─────────────────────────────── */}
          {activeNav === 'Manage Users' && (
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-2xl overflow-hidden animate-fade-in"
              style={{ boxShadow: '0 0 0 1px rgba(167,139,250,0.08), 0 25px 60px rgba(0,0,0,0.4)' }}>

              <div className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-600/5 border border-violet-500/20 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">All Users</h3>
                    <p className="text-xs text-slate-500">Manage all approved patients and doctors</p>
                  </div>
                </div>
                {!fetchingUsers && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-violet-300"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    Total Users: {allUsers.length}
                  </span>
                )}
              </div>

              {fetchingUsers ? (
                <div className="py-20">
                  <LoadingSpinner message="Loading all users…" />
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <p className="text-slate-300 font-semibold text-lg">No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {allUsers.map((user) => (
                        <tr key={user.firebaseUid} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-violet-300"
                                style={{
                                  background: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(124,58,237,0.2))',
                                  border: '1px solid rgba(139,92,246,0.15)',
                                }}>
                                {user.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-200">{user.role === 'Doctor' ? `Dr. ${user.name}` : user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`font-medium text-xs px-2.5 py-1 rounded-lg ${user.role === 'Doctor' ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20' : 'text-violet-300 bg-violet-500/10 border border-violet-500/20'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-xs px-2.5 py-1 rounded-lg text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              id={`delete-btn-${user.firebaseUid}`}
                              onClick={() => handleDeleteUser(user.firebaseUid, user.name)}
                              disabled={actionUid === user.firebaseUid}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#f87171',
                              }}
                            >
                              {actionUid === user.firebaseUid ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                <FiUserX className="w-3.5 h-3.5" />
                              )}
                              Delete User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────── */}
          <div className="text-center pb-4">
            <p className="text-xs text-slate-600">🔒 256-bit SSL · HIPAA Compliant · Mind Modeler 3D v1.0</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
