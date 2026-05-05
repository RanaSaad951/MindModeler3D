import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const PendingApprovalPage = () => {
  const { mongoProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast('Signed out successfully.', 'success');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-lg text-center animate-slide-up">

        {/* Floating lock icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))',
                border: '1px solid rgba(245,158,11,0.25)',
                boxShadow: '0 0 60px rgba(245,158,11,0.15)',
              }}>
              <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-3xl animate-ping opacity-10"
              style={{ background: 'rgba(245,158,11,0.3)' }} />
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card p-10 space-y-6"
          style={{ boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 25px 60px rgba(0,0,0,0.5)' }}>

          <div className="space-y-2">
            <span className="badge-amber mx-auto text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Under Review
            </span>
            <h1 className="text-2xl font-bold text-white mt-3">Account Pending Approval</h1>
            {mongoProfile?.name && (
              <p className="text-slate-400 text-sm">
                Hello, <span className="text-slate-200 font-semibold">Dr. {mongoProfile.name}</span>
              </p>
            )}
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Your account has been successfully created. Our administrative team is currently
            verifying your <span className="text-amber-300 font-medium">PMDC credentials</span>.
            You will receive access once your registration is confirmed.
          </p>

          {/* PMDC info box */}
          {mongoProfile?.pmdcNumber && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium">PMDC Registration Number</p>
                <p className="text-sm text-amber-300 font-mono font-semibold">{mongoProfile.pmdcNumber}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3 text-left">
            {[
              { done: true,  label: 'Account created',           sub: 'Firebase Authentication' },
              { done: true,  label: 'Profile saved',             sub: 'Medical record created' },
              { done: false, label: 'PMDC verification',         sub: 'In progress — 1–2 business days' },
              { done: false, label: 'Access granted',            sub: 'Full platform access' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10'
                }`}>
                  {step.done
                    ? <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  }
                </div>
                <div>
                  <p className={`text-xs font-semibold ${step.done ? 'text-emerald-300' : i === 2 ? 'text-amber-300' : 'text-slate-500'}`}>{step.label}</p>
                  <p className="text-xs text-slate-600">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            id="pending-logout-btn"
            onClick={handleLogout}
            className="btn-secondary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-6">
          Questions? Contact <span className="text-cyan-500">support@mindmodeler.com</span>
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
