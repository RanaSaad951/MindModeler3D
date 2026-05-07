import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineUpload,
  HiOutlineClipboardList,
  HiOutlineUserCircle,
  HiOutlineArrowRight,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlinePhotograph,
  HiOutlineClock,
} from 'react-icons/hi';

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color = 'cyan' }) => {
  const palettes = {
    cyan:    { ring: 'border-cyan-500/20',    bg: 'from-cyan-500/15 to-cyan-600/5',       text: 'text-cyan-400',    glow: 'shadow-cyan-500/10'    },
    emerald: { ring: 'border-emerald-500/20', bg: 'from-emerald-500/15 to-emerald-600/5', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    violet:  { ring: 'border-violet-500/20',  bg: 'from-violet-500/15 to-violet-600/5',   text: 'text-violet-400',  glow: 'shadow-violet-500/10'  },
    amber:   { ring: 'border-amber-500/20',   bg: 'from-amber-500/15 to-amber-600/5',     text: 'text-amber-400',   glow: 'shadow-amber-500/10'   },
  };
  const c = palettes[color];

  return (
    <div className={`glass-card-strong p-6 hover:scale-[1.02] transition-all duration-300 group cursor-default shadow-lg ${c.glow}`}>
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${c.bg} border ${c.ring} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      <p className="text-sm font-semibold text-slate-300 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
    </div>
  );
};

/* ── Action Card (large) ───────────────────────────────────── */
const ActionCard = ({ icon: Icon, title, desc, btnText, color = 'cyan', accent, id }) => {
  const accents = {
    cyan:    { border: 'border-cyan-500/20',    hover: 'hover:border-cyan-500/40',    btnBg: 'from-cyan-500 to-blue-600',    glow: 'shadow-cyan-500/20'    },
    violet:  { border: 'border-violet-500/20',  hover: 'hover:border-violet-500/40',  btnBg: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20'  },
    emerald: { border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/40', btnBg: 'from-emerald-500 to-teal-600',  glow: 'shadow-emerald-500/20' },
    amber:   { border: 'border-amber-500/20',   hover: 'hover:border-amber-500/40',   btnBg: 'from-amber-500 to-orange-600',  glow: 'shadow-amber-500/20'   },
  };
  const a = accents[color];

  return (
    <div
      className={`glass-card-strong p-7 ${a.border} ${a.hover} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${a.glow} group cursor-pointer`}
      id={id}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${a.btnBg} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-5">{desc}</p>
      <button className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${a.btnBg} shadow-lg ${a.glow} transition-all duration-200 hover:-translate-y-0.5`}>
        {btnText}
        <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

/* ── Placeholder Module Card ───────────────────────────────── */
const ModuleCard = ({ icon: Icon, title, status, desc, tag, id }) => (
  <div
    className={`glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-default ${
      status === 'active'
        ? 'border-cyan-500/25 hover:border-cyan-500/40'
        : 'hover:border-white/15 opacity-75 hover:opacity-100'
    }`}
    id={id}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <Icon className={`w-5 h-5 ${status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`} />
        <span className="text-xs font-mono font-bold text-slate-500">{tag}</span>
      </div>
      {status === 'active'
        ? <span className="badge-emerald text-[10px] px-2 py-0.5">Active</span>
        : <span className="badge-amber text-[10px] px-2 py-0.5">Coming Soon</span>
      }
    </div>
    <p className="text-sm font-semibold text-slate-200">{title}</p>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
/*  DOCTOR / ADMIN DASHBOARD                                     */
/*  Patients are immediately redirected to /patient-dashboard.   */
/* ══════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { mongoProfile, firebaseUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const role     = mongoProfile?.role || 'User';
  const isDoctor = role === 'Doctor';

  // ── Foolproof guard: redirect patients away ─────────────────
  useEffect(() => {
    if (role === 'Patient') {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [role, navigate]);

  // Don't render anything for patients while the redirect fires
  if (role === 'Patient') return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-grid-pattern py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* ── Welcome Banner ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(15,23,42,0) 100%)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}>
          {/* Decorative glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-cyan-400 text-sm font-semibold mb-1.5 flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4" />
                {greeting()},
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome Dr. <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{mongoProfile?.name || 'Doctor'}</span>
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge-cyan">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {role}
                </span>
                {isDoctor && mongoProfile?.isApproved && (
                  <span className="badge-emerald">
                    <HiOutlineShieldCheck className="w-3 h-3" /> Verified Physician
                  </span>
                )}
                {isAdmin && <span className="badge-cyan">🛡️ Admin</span>}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Mind Modeler 3D</p>
              <p className="text-xs text-slate-600 mt-0.5">Clinical AI MRI System</p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* ── DOCTOR DASHBOARD ──────────────────────────────── */}
        {/* ════════════════════════════════════════════════════ */}
        {isDoctor && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <StatCard
                icon={HiOutlinePhotograph}
                label="Pending MRI Scans"
                value="—"
                sub="Module 02 coming soon"
                color="cyan"
              />
              <StatCard
                icon={HiOutlineChartBar}
                label="Analyzed Reports"
                value="—"
                sub="Module 04 coming soon"
                color="emerald"
              />
              <StatCard
                icon={HiOutlineUsers}
                label="Total Patients"
                value="—"
                sub="Module 03 coming soon"
                color="violet"
              />
            </div>

            {/* Quick Action: Launch AI MRI Viewer */}
            <ActionCard
              icon={HiOutlineCube}
              title="Launch AI MRI Viewer"
              desc="Upload a new MRI scan and let our AI engine analyze, reconstruct 3D models, and detect anomalies in real-time. This module is the core of the Mind Modeler 3D platform."
              btnText="Upload Scan"
              color="cyan"
              id="doctor-launch-mri-btn"
            />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ActionCard
                icon={HiOutlineUsers}
                title="My Patients"
                desc="View and manage assigned patients, review scan history, and track treatment progress with a streamlined clinical workflow."
                btnText="View Patients"
                color="violet"
                id="doctor-patients-btn"
              />
              <ActionCard
                icon={HiOutlineDocumentReport}
                title="Generate & Export PDF Reports"
                desc="Create comprehensive diagnostic reports with AI-powered insights. Export and share securely with patients and colleagues."
                btnText="Generate Report"
                color="emerald"
                id="doctor-reports-btn"
              />
            </div>
          </>
        )}

        {/* ── System Modules (shared) ─────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <HiOutlineClipboardList className="w-4 h-4 text-cyan-400" />
            System Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ModuleCard icon={HiOutlineShieldCheck} title="User Management"    status="active" desc="Auth & Roles"     tag="MOD-01" id="mod-01" />
            <ModuleCard icon={HiOutlineCube}         title="3D MRI Analysis"    status="soon"   desc="AI Engine"        tag="MOD-02" id="mod-02" />
            <ModuleCard icon={HiOutlineUsers}        title="Patient Management" status="soon"   desc="Records & History" tag="MOD-03" id="mod-03" />
            <ModuleCard icon={HiOutlineDocumentReport} title="Reports & Export" status="soon"   desc="PDF & Analytics"  tag="MOD-04" id="mod-04" />
          </div>
        </div>

        {/* ── Profile Info ───────────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <HiOutlineUserCircle className="w-4 h-4 text-cyan-400" />
            Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Full Name',   value: mongoProfile?.name  || '—' },
              { label: 'Email',       value: mongoProfile?.email || firebaseUser?.email || '—' },
              { label: 'Role',        value: role },
              { label: 'Status',      value: mongoProfile?.isApproved ? 'Approved' : 'Pending' },
              ...(isDoctor && mongoProfile?.pmdcNumber
                ? [{ label: 'PMDC Number', value: mongoProfile.pmdcNumber }]
                : []),
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-colors">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{f.label}</span>
                <span className="text-sm text-slate-200 font-medium">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
