import { useAuth } from '../../../context/AuthContext';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">

      {/* ─── LEFT: Content Area ─────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))',
                       border: '1px solid rgba(245,158,11,0.3)' }}>
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Account Pending Approval</h1>
            <p className="text-gray-400 text-sm mt-1">Mind Modeler 3D · Clinical AI Platform</p>
          </div>

          {/* Card — Dark Glass */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
            style={{ boxShadow: '0 0 60px rgba(0,180,255,0.06), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {/* Greeting & Status Badge */}
            <div className="space-y-3 text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/20"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Under Review
              </span>

              {mongoProfile?.name && (
                <p className="text-gray-400 text-sm">
                  Hello, <span className="text-white font-semibold">Dr. {mongoProfile.name}</span>
                </p>
              )}
            </div>

            {/* Message */}
            <p className="text-gray-400 text-sm leading-relaxed text-center">
              Your account has been successfully created. Our administrative team is currently
              verifying your <span className="text-cyan-400 font-medium">PMDC credentials</span>.
              You will receive access once your registration is confirmed.
            </p>

            {/* PMDC info box */}
            {mongoProfile?.pmdcNumber && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">PMDC Registration Number</p>
                  <p className="text-sm text-cyan-300 font-mono font-semibold">{mongoProfile.pmdcNumber}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3 text-left">
              {[
                { done: true,  label: 'Account created',   sub: 'Firebase Authentication' },
                { done: true,  label: 'Profile saved',     sub: 'Medical record created' },
                { done: false, label: 'PMDC verification',  sub: 'In progress — 1–2 business days' },
                { done: false, label: 'Access granted',     sub: 'Full platform access' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10'
                  }`}>
                    {step.done
                      ? <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      : <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`} />
                    }
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${step.done ? 'text-emerald-300' : i === 2 ? 'text-amber-300' : 'text-gray-500'}`}>{step.label}</p>
                    <p className="text-xs text-gray-600">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign Out Button — matches LoginPage primary button style */}
            <button
              id="pending-logout-btn"
              onClick={handleLogout}
              className="w-full py-3.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            🔒 Questions? Contact <span className="text-cyan-400">support@mindmodeler.com</span>
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Brain Image ──────────────────────────── */}
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center"
        style={{
          backgroundImage: "url('/images/brain-neural-bg.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: '80% auto',
        }}
      />
    </div>
  );
};

export default PendingApprovalPage;
