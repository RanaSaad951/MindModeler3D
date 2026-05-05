import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, sub, color = 'cyan' }) => {
  const colors = {
    cyan:    { ring: 'border-cyan-500/20',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400' },
    emerald: { ring: 'border-emerald-500/20', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    violet:  { ring: 'border-violet-500/20',  bg: 'bg-violet-500/10',  text: 'text-violet-400' },
    amber:   { ring: 'border-amber-500/20',   bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  };
  const c = colors[color];

  return (
    <div className="glass-card p-6 hover:scale-[1.01] transition-transform duration-200">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} border ${c.ring} mb-4`}>
        <span className={`text-lg ${c.text}`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

const DashboardPage = () => {
  const { mongoProfile, firebaseUser, isAdmin } = useAuth();
  const role      = mongoProfile?.role || 'User';
  const isDoctor  = role === 'Doctor';
  const isPatient = role === 'Patient';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-grid-pattern py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">

        {/* ── Welcome banner ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(2,132,199,0.08) 50%, rgba(15,23,42,0) 100%)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}>
          {/* Decorative glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-cyan-400 text-sm font-semibold mb-1">
                {greeting()},
              </p>
              <h1 className="text-3xl font-bold text-white">
                {isDoctor ? 'Dr. ' : ''}{mongoProfile?.name || firebaseUser?.email}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={isDoctor ? 'badge-cyan' : 'badge-emerald'}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {role}
                </span>
                {isDoctor && mongoProfile?.isApproved && (
                  <span className="badge-emerald">✓ Verified Physician</span>
                )}
                {isAdmin && <span className="badge-cyan">🛡️ Admin</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Mind Modeler 3D</p>
              <p className="text-xs text-slate-600 mt-0.5">Clinical AI MRI System</p>
            </div>
          </div>
        </div>

        {/* ── Stats grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isDoctor ? (
            <>
              <StatCard icon="🧠" label="MRI Scans Analyzed"   value="—"   sub="Module 2 coming soon"  color="cyan"    />
              <StatCard icon="👥" label="Patients Assigned"    value="—"   sub="Module 3 coming soon"  color="violet"  />
              <StatCard icon="📋" label="Reports Generated"    value="—"   sub="Module 4 coming soon"  color="emerald" />
              <StatCard icon="🔬" label="AI Accuracy Score"    value="—"   sub="Module 2 coming soon"  color="amber"   />
            </>
          ) : (
            <>
              <StatCard icon="🧠" label="My MRI Scans"         value="—"   sub="Module 2 coming soon"  color="cyan"    />
              <StatCard icon="📋" label="My Reports"           value="—"   sub="Module 4 coming soon"  color="emerald" />
              <StatCard icon="🩺" label="Assigned Doctor"      value="—"   sub="Module 3 coming soon"  color="violet"  />
              <StatCard icon="🗓️" label="Next Appointment"    value="—"   sub="Module 3 coming soon"  color="amber"   />
            </>
          )}
        </div>

        {/* ── Module status ───────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            System Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { num: '01', name: 'User Management',    status: 'active',  desc: 'Auth & Roles'       },
              { num: '02', name: '3D MRI Analysis',    status: 'soon',    desc: 'AI Engine'           },
              { num: '03', name: 'Patient Management', status: 'soon',    desc: 'Records & History'   },
              { num: '04', name: 'Reports & Export',   status: 'soon',    desc: 'PDF & Analytics'     },
            ].map((m) => (
              <div key={m.num}
                className={`p-4 rounded-xl border transition-all ${
                  m.status === 'active'
                    ? 'border-cyan-500/25 bg-cyan-500/5'
                    : 'border-white/[0.05] bg-white/[0.02] opacity-60'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-500">MOD-{m.num}</span>
                  {m.status === 'active'
                    ? <span className="badge-emerald text-[10px] px-2 py-0.5">Active</span>
                    : <span className="badge-amber text-[10px] px-2 py-0.5">Soon</span>
                  }
                </div>
                <p className="text-sm font-semibold text-slate-200">{m.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Profile info ─────────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Account Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name',   value: mongoProfile?.name  || '—' },
              { label: 'Email',       value: mongoProfile?.email || firebaseUser?.email || '—' },
              { label: 'Role',        value: role },
              { label: 'Status',      value: mongoProfile?.isApproved ? 'Approved' : isPatient ? 'Active' : 'Pending' },
              ...(isDoctor && mongoProfile?.pmdcNumber
                ? [{ label: 'PMDC Number', value: mongoProfile.pmdcNumber }]
                : []),
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
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
