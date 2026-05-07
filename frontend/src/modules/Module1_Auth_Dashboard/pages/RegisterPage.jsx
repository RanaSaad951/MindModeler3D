import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Inline SVG icons ──────────────────────────────────────── */
const IconUser = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconMail = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconLock = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconID = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;
const IconInfo = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

/* ── Shared input classes ─────────────────────────────────── */
const inputCls = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-gray-400';

/* ── Password regex: min 8 chars, 1 uppercase, 1 special char */
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,}$/;
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Input wrapper ─────────────────────────────────────────── */
const FormField = ({ label, id, icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input id={id} className={inputCls} {...props} />
    </div>
  </div>
);

const RegisterPage = () => {
  const { register, BACKEND_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', pmdcNumber: '' });
  const [role, setRole] = useState('Patient');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    /* ── Frontend validation ────────────────────────── */
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!PASSWORD_REGEX.test(form.password)) {
      setFormError('Password does not meet the requirements.');
      return;
    }
    if (role === 'Doctor' && !form.pmdcNumber.trim()) {
      setFormError('PMDC Registration Number is required for Doctors.');
      return;
    }

    setLoading(true);
    try {
      const firebaseUser = await register(form.email.trim(), form.password);

      const res = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          name:        form.name.trim(),
          email:       form.email.trim(),
          role,
          pmdcNumber:  role === 'Doctor' ? form.pmdcNumber.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Registration failed.');
        return;
      }

      addToast(
        role === 'Doctor'
          ? 'Account created! Awaiting admin approval.'
          : 'Account created successfully! Please sign in.',
        'success', 5000
      );
      navigate('/login');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setFormError('This email is already in use. Please log in or use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setFormError('Password is too weak. Use at least 8 characters.');
      } else {
        setFormError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">

      {/* ─── LEFT: Form Area ─────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)', boxShadow: '0 0 40px rgba(6,182,212,0.25)' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join Mind Modeler 3D Clinical Platform</p>
          </div>

          {/* Card — Dark Glass */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
            style={{ boxShadow: '0 0 60px rgba(0,180,255,0.06), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {/* ── Error Alert Box ── */}
            {formError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-slide-up">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-300 font-medium leading-snug">{formError}</p>
              </div>
            )}

            {/* Role Toggle */}
            <div>
              <p className="block text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">I am a</p>
              <div className="grid grid-cols-2 gap-3">
                {['Patient', 'Doctor'].map((r) => (
                  <button key={r} type="button" id={`role-${r.toLowerCase()}`} onClick={() => setRole(r)}
                    className={`py-2.5 px-4 rounded-full text-sm font-semibold border transition-all duration-200 ${
                      role === r
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 bg-transparent'
                    }`}>
                    {r === 'Doctor' ? '🩺 Doctor' : '🧑‍⚕️ Patient'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <FormField label="Full Name" id="reg-name" name="name" type="text" placeholder="Please enter your name" value={form.name} onChange={handleChange} icon={<IconUser />} autoComplete="name" />
              <FormField label="Email Address" id="reg-email" name="email" type="email" placeholder="you@hospital.com" value={form.email} onChange={handleChange} icon={<IconMail />} autoComplete="email" />

              {/* Password with show/hide + info tooltip */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <span className="text-gray-500 hover:text-cyan-400 transition-colors cursor-help"><IconInfo /></span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-900 border border-white/10 text-xs text-gray-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                      Minimum 8 characters, at least 1 uppercase letter, and 1 special character
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 border-r border-b border-white/10" />
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconLock /></span>
                  <input id="reg-password" name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange} autoComplete="new-password"
                    className={inputCls.replace('pr-4', 'pr-11')} />
                  <button type="button" onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle password visibility">
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>

              {/* PMDC field — animated when Doctor */}
              <div className="overflow-hidden transition-all ease-out"
                style={{ maxHeight: role === 'Doctor' ? '120px' : '0', opacity: role === 'Doctor' ? 1 : 0, transitionDuration: '350ms' }}>
                <div className="pt-1">
                  <FormField label="PMDC Registration Number" id="reg-pmdc" name="pmdcNumber" type="text" placeholder="e.g. 12345-P" value={form.pmdcNumber} onChange={handleChange} icon={<IconID />} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 ml-1">
                  Your PMDC number will be verified by an administrator.
                </p>
              </div>

              <button id="register-submit-btn" type="submit" disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                {loading ? <LoadingSpinner message="Creating account…" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            🔒 End-to-end encrypted · HIPAA-compliant · Powered by Firebase Auth
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

export default RegisterPage;
