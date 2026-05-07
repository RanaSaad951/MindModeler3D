import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormError('');
    setSuccessMsg('');
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEmail('');
      setSuccessMsg('Password reset link has been sent to your email. Please check your inbox.');
    } catch (err) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-email'
      ) {
        setFormError('No account found with this email, or the email is invalid.');
      } else if (err.code === 'auth/too-many-requests') {
        setFormError('Too many requests. Please try again later.');
      } else {
        setFormError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* shared input classes — identical to LoginPage */
  const inputCls = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-gray-400';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">

      {/* ─── LEFT: Form Area ─────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Reset Password</h1>
            <p className="text-gray-400 text-sm mt-1">Mind Modeler 3D · Clinical AI Platform</p>
          </div>

          {/* Card — Dark Glass */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
            style={{ boxShadow: '0 0 60px rgba(0,180,255,0.06), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {/* ── Success Alert Box ── */}
            {successMsg && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-slide-up">
                <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-emerald-300 font-medium leading-snug">{successMsg}</p>
              </div>
            )}

            {/* ── Error Alert Box ── */}
            {formError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-slide-up">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-300 font-medium leading-snug">{formError}</p>
              </div>
            )}

            <p className="text-gray-400 text-sm leading-relaxed text-center">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Email */}
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <input id="reset-email" name="email" type="email" placeholder="Enter your registered email"
                    value={email} onChange={handleChange} autoComplete="email" className={inputCls} />
                </div>
              </div>

              {/* Submit */}
              <button id="reset-submit-btn" type="submit" disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                {loading ? <LoadingSpinner message="Sending…" /> : 'Send Reset Link'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <p className="text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Back to Login
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            🔒 256-bit SSL · Firebase Authentication · HIPAA Compliant
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

export default ForgotPasswordPage;
