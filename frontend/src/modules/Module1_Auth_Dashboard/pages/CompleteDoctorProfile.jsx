import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/* ── SVG Icons ─────────────────────────────────────────────── */
const IconUser = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconCity = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCamera = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const CompleteDoctorProfile = () => {
  const { firebaseUser, fetchMongoProfile, BACKEND_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const picInputRef = useRef(null);

  const [form, setForm] = useState({ specialization: '', contactNumber: '', city: '' });
  const [picFile, setPicFile]       = useState(null);
  const [picPreview, setPicPreview] = useState('');
  const [loading, setLoading]       = useState(false);
  const [formError, setFormError]   = useState('');

  const handleChange = (e) => {
    setFormError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError('Profile picture must be under 5 MB.'); return; }
    setPicFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.specialization || !form.contactNumber.trim() || !form.city.trim()) {
      setFormError('Specialization, Contact Number, and City are required.');
      return;
    }

    setLoading(true);
    try {
      // ── Profile photo upload (optional — skipped if no file selected) ──
      let profilePicURL = '';
      if (picFile) {
        const ext = picFile.name.split('.').pop();
        const storageRef = ref(storage, `user_profiles/${firebaseUser.uid}/profile.${ext}`);
        const snapshot = await uploadBytes(storageRef, picFile);
        profilePicURL = await getDownloadURL(snapshot.ref);
      }

      // ── Submit to backend ────────────────────────────────────────────
      const res = await fetch(`${BACKEND_URL}/api/users/complete-doctor-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid:      firebaseUser.uid,
          specialization:   form.specialization,
          contactNumber:    form.contactNumber.trim(),
          city:             form.city.trim(),
          profilePicURL,
          medicalLicenseUrl: '', // Bypassed — verified via PMDC number instead
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Failed to submit. Please try again.');
        setLoading(false);
        return;
      }

      await fetchMongoProfile(firebaseUser.uid);
      addToast('Profile submitted! Redirecting to your dashboard…', 'success');
      navigate('/doctor-dashboard');
    } catch (err) {
      console.error('Complete doctor profile error:', err);
      setFormError('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const inputCls  = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-gray-400';
  const selectCls = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all appearance-none cursor-pointer';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">

      {/* ─── LEFT: Form Area ─────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Complete Doctor Profile</h1>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed max-w-sm mx-auto">
              Your profile will be reviewed and approved by an administrator before you gain full access.
            </p>
          </div>

          {/* Card */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
            style={{ boxShadow: '0 0 60px rgba(0,180,255,0.06), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {formError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-slide-up">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-300 font-medium leading-snug">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Profile Picture — Optional */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/40 bg-white/[0.04] flex items-center justify-center cursor-pointer group hover:border-cyan-400/70 transition-all duration-300 overflow-hidden"
                  onClick={() => picInputRef.current?.click()}>
                  {picPreview
                    ? <img src={picPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                    : <div className="flex flex-col items-center gap-1 text-slate-400"><IconUser /><span className="text-[10px] font-medium">Photo</span></div>}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-cyan-400"><IconCamera /></span>
                  </div>
                </div>
                <input ref={picInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handlePicChange} id="doc-pic-input" />
                <p className="text-xs text-slate-500">Profile Photo <span className="text-slate-600">(Optional)</span></p>
              </div>

              {/* PMDC — locked/read-only display */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  PMDC / License Number <span className="text-slate-600 normal-case font-normal">(from registration)</span>
                </label>
                <div className="w-full pl-4 pr-4 py-3.5 rounded-full text-sm bg-white/[0.03] border border-white/10 text-slate-500 cursor-not-allowed select-none">
                  Verified via registration — no document upload required
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label htmlFor="doc-specialization" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Specialization</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </span>
                  <select id="doc-specialization" name="specialization"
                    value={form.specialization} onChange={handleChange}
                    className={selectCls + (form.specialization === '' ? ' text-gray-400' : '')}>
                    <option value="" disabled>Select specialization</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Oncologist">Oncologist</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>

              {/* Contact + City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doc-contact" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Contact</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconPhone /></span>
                    <input id="doc-contact" name="contactNumber" type="tel" placeholder="+92-3XX-XXXXXXX"
                      value={form.contactNumber} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label htmlFor="doc-city" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">City</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconCity /></span>
                    <input id="doc-city" name="city" type="text" placeholder="e.g. Karachi"
                      value={form.city} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button id="complete-doctor-submit-btn" type="submit" disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                {loading ? <LoadingSpinner message="Submitting…" /> : 'Submit for Verification'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            🔒 256-bit SSL · Firebase Authentication · HIPAA Compliant
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Brain Image ──────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center"
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

export default CompleteDoctorProfile;
