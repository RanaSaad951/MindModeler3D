import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

/* ── Inline SVG icons ──────────────────────────────────────── */
const IconUser   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconMail   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconLock   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconID     = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>;

/* ── Input wrapper ─────────────────────────────────────────── */
const FormField = ({ label, id, icon, ...props }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      <input id={id} className="input-field pl-10" {...props} />
    </div>
  </div>
);

const RegisterPage = () => {
  const { register, BACKEND_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', pmdcNumber: '' });
  const [role, setRole]       = useState('Patient');   // 'Doctor' | 'Patient'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return addToast('Please fill in all required fields.', 'error');
    }
    if (form.password.length < 6) {
      return addToast('Password must be at least 6 characters.', 'error');
    }
    if (role === 'Doctor' && !form.pmdcNumber.trim()) {
      return addToast('PMDC Registration Number is required for Doctors.', 'error');
    }

    setLoading(true);
    try {
      // Step 1: Firebase Auth signup
      const firebaseUser = await register(form.email.trim(), form.password);

      // Step 2: Save profile in MongoDB
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
      if (!res.ok) throw new Error(data.message || 'Registration failed.');

      addToast(
        role === 'Doctor'
          ? 'Account created! Awaiting admin approval.'
          : 'Account created successfully! Please sign in.',
        'success',
        5000
      );
      navigate('/login');
    } catch (err) {
      // Firebase error codes → human readable
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 6 characters.'
        : err.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0284c7, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)', boxShadow: '0 0 40px rgba(6,182,212,0.3)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join Mind Modeler 3D Clinical Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card glow-border p-8 space-y-6">

          {/* Role Toggle */}
          <div>
            <p className="form-label mb-3">I am a</p>
            <div className="grid grid-cols-2 gap-3">
              {['Patient', 'Doctor'].map((r) => (
                <button
                  key={r}
                  type="button"
                  id={`role-${r.toLowerCase()}`}
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    role === r
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                      : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300 bg-white/[0.03]'
                  }`}
                >
                  {r === 'Doctor' ? '🩺 Doctor' : '🧑‍⚕️ Patient'}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Full Name"
              id="reg-name"
              name="name"
              type="text"
              placeholder="Dr. Sarah Ahmed"
              value={form.name}
              onChange={handleChange}
              icon={<IconUser />}
              autoComplete="name"
            />
            <FormField
              label="Email Address"
              id="reg-email"
              name="email"
              type="email"
              placeholder="you@hospital.com"
              value={form.email}
              onChange={handleChange}
              icon={<IconMail />}
              autoComplete="email"
            />

            {/* Password with show/hide */}
            <div>
              <label htmlFor="reg-password" className="form-label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><IconLock /></span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* PMDC field — animated in when Doctor is selected */}
            <div
              className="overflow-hidden transition-all duration-350 ease-out"
              style={{ maxHeight: role === 'Doctor' ? '100px' : '0', opacity: role === 'Doctor' ? 1 : 0 }}
            >
              <div className="pt-1">
                <FormField
                  label="PMDC Registration Number"
                  id="reg-pmdc"
                  name="pmdcNumber"
                  type="text"
                  placeholder="e.g. 12345-P"
                  value={form.pmdcNumber}
                  onChange={handleChange}
                  icon={<IconID />}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 ml-1">
                Your PMDC number will be verified by an administrator before access is granted.
              </p>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary mt-2"
            >
              {loading ? <LoadingSpinner message="Creating account…" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          🔒 End-to-end encrypted · HIPAA-compliant · Powered by Firebase Auth
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
