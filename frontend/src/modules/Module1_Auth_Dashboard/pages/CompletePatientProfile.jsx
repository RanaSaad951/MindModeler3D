import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/* ── Inline SVG icons ──────────────────────────────────────── */
const IconUser = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconId = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>;
const IconCalendar = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconCity = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconGender = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconCamera = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

/* ── Upload image to Firebase Storage, return public URL ───── */
const uploadProfilePic = async (file, uid) => {
  const ext = file.name.split('.').pop();
  const storageRef = ref(storage, `user_profiles/${uid}/profile.${ext}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

const CompletePatientProfile = () => {
  const { firebaseUser, fetchMongoProfile, BACKEND_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ cnic: '', age: '', gender: '', contactNumber: '', city: '' });
  const [picFile, setPicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be smaller than 5 MB.');
      return;
    }
    setPicFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePicPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.cnic.trim() || !form.age || !form.gender || !form.contactNumber.trim() || !form.city.trim()) {
      setFormError('All fields are required. Please fill in every field.');
      return;
    }
    if (isNaN(form.age) || Number(form.age) < 1 || Number(form.age) > 150) {
      setFormError('Please enter a valid age between 1 and 150.');
      return;
    }

    setLoading(true);
    try {
      // ── Step 1: Upload profile picture to Firebase Storage (if chosen) ──
      let profilePicURL = '';
      if (picFile) {
        setUploadProgress('Uploading photo…');
        profilePicURL = await uploadProfilePic(picFile, firebaseUser.uid);
      }

      // ── Step 2: Save profile data to MongoDB ────────────────────────────
      setUploadProgress('Saving profile…');
      const res = await fetch(`${BACKEND_URL}/api/users/complete-patient-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          cnic: form.cnic.trim(),
          age: Number(form.age),
          gender: form.gender,
          contactNumber: form.contactNumber.trim(),
          city: form.city.trim(),
          profilePicURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Failed to submit profile. Please try again.');
        setLoading(false);
        setUploadProgress('');
        return;
      }

      // ── Step 3: Refresh auth context & navigate ──────────────────────────
      await fetchMongoProfile(firebaseUser.uid);
      addToast('Profile completed successfully! Welcome to Mind Modeler 3D.', 'success');
      navigate('/patient-dashboard');
    } catch (err) {
      console.error('Complete profile error:', err);
      setFormError('An error occurred. Please check your connection and try again.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  const inputCls = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-gray-400';
  const selectCls = 'w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all appearance-none cursor-pointer';

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Complete Your Registration</h1>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed max-w-sm mx-auto">
              Mind Modeler 3D requires some basic information for medical records.
            </p>
          </div>

          {/* Card — Dark Glass */}
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

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-2">
                <div
                  className="relative w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/40 bg-white/[0.04] flex items-center justify-center cursor-pointer group hover:border-cyan-400/70 transition-all duration-300 overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <IconUser />
                      <span className="text-[10px] font-medium">Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-cyan-400"><IconCamera /></span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handlePicChange} id="profile-pic-input" />
                <p className="text-xs text-slate-500 mt-2">Profile Picture <span className="text-slate-600">(Optional · max 5 MB)</span></p>
              </div>

              {/* CNIC */}
              <div>
                <label htmlFor="profile-cnic" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">CNIC Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconId /></span>
                  <input id="profile-cnic" name="cnic" type="text" placeholder="XXXXX-XXXXXXX-X"
                    value={form.cnic} onChange={handleChange} className={inputCls} />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-age" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Age</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconCalendar /></span>
                    <input id="profile-age" name="age" type="number" placeholder="e.g. 28" min="1" max="150"
                      value={form.age} onChange={handleChange} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label htmlFor="profile-gender" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Gender</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><IconGender /></span>
                    <select id="profile-gender" name="gender" value={form.gender} onChange={handleChange}
                      className={selectCls + (form.gender === '' ? ' text-gray-400' : '')}>
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <label htmlFor="profile-contact" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Contact Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconPhone /></span>
                  <input id="profile-contact" name="contactNumber" type="tel" placeholder="+92-3XX-XXXXXXX"
                    value={form.contactNumber} onChange={handleChange} className={inputCls} />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="profile-city" className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">City</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconCity /></span>
                  <input id="profile-city" name="city" type="text" placeholder="e.g. Lahore"
                    value={form.city} onChange={handleChange} className={inputCls} />
                </div>
              </div>

              {/* Submit */}
              <button id="complete-profile-submit-btn" type="submit" disabled={loading}
                className="w-full py-3.5 rounded-full text-sm font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                {loading ? <LoadingSpinner message={uploadProgress || 'Submitting…'} /> : 'Submit Profile'}
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

export default CompletePatientProfile;
