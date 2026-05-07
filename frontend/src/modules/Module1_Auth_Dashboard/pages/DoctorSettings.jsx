import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { HiOutlineUserCircle } from 'react-icons/hi';
import { FiLock } from 'react-icons/fi';

const IconCamera = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconPhone = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IconCity = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const LockedField = ({ label, value, icon: Icon }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
      <FiLock className="w-3 h-3" /> {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><Icon /></span>
      <div className="w-full pl-11 pr-4 py-3.5 rounded-full text-sm bg-white/[0.03] border border-white/10 text-slate-500 cursor-not-allowed select-none truncate">{value || '—'}</div>
    </div>
  </div>
);

const ActiveField = ({ label, id, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Icon /></span>
      <input id={id} className="w-full pl-11 pr-4 py-3.5 rounded-full text-sm text-black bg-white border border-gray-300 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-gray-400" {...props} />
    </div>
  </div>
);

const DoctorSettings = () => {
  const { firebaseUser, mongoProfile, fetchMongoProfile, BACKEND_URL } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ contactNumber: '', city: '' });
  const [picFile, setPicFile]           = useState(null);
  const [picPreview, setPicPreview]     = useState('');
  const [loading, setLoading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formError, setFormError]       = useState('');

  useEffect(() => {
    if (mongoProfile) {
      setForm({ contactNumber: mongoProfile.contactNumber || '', city: mongoProfile.city || '' });
      setPicPreview(mongoProfile.profilePicURL || '');
    }
  }, [mongoProfile]);

  const handleChange = (e) => { setFormError(''); setForm((p) => ({ ...p, [e.target.name]: e.target.value })); };

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError('Image must be under 5 MB.'); return; }
    setPicFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPicPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      let profilePicURL = mongoProfile?.profilePicURL || '';
      if (picFile) {
        setUploadProgress('Uploading photo…');
        const ext = picFile.name.split('.').pop();
        const storageRef = ref(storage, `user_profiles/${firebaseUser.uid}/profile.${ext}`);
        const snap = await uploadBytes(storageRef, picFile);
        profilePicURL = await getDownloadURL(snap.ref);
      }

      setUploadProgress('Saving changes…');
      const res = await fetch(`${BACKEND_URL}/api/users/update-doctor-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          profilePicURL,
          contactNumber: form.contactNumber || undefined,
          city: form.city || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setFormError(data.message || 'Failed to save changes.'); setLoading(false); setUploadProgress(''); return; }

      await fetchMongoProfile(firebaseUser.uid);
      setPicFile(null);
      addToast('Profile updated successfully!', 'success');
      navigate('/doctor-dashboard');
    } catch (err) {
      console.error('Doctor settings error:', err);
      setFormError('An error occurred. Please try again.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  const IconId = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>;
  const IconSpec = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
  const IconUser = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const IconBox = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up py-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">Doctor Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Update your profile information</p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
            style={{ boxShadow: '0 0 60px rgba(0,180,255,0.06), 0 8px 32px rgba(0,0,0,0.4)' }}>

            {formError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <p className="text-sm text-red-300 font-medium leading-snug">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/40 bg-white/[0.04] flex items-center justify-center cursor-pointer group hover:border-cyan-400/70 transition-all duration-300 overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}>
                  {picPreview ? <img src={picPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    : <HiOutlineUserCircle className="w-14 h-14 text-cyan-400/30" />}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-cyan-400"><IconCamera /></span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} id="doc-settings-pic" />
                <p className="text-xs text-slate-500">Click to change photo <span className="text-slate-600">(max 5 MB)</span></p>
              </div>

              {/* Locked Fields */}
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                  <FiLock className="w-3 h-3" /> Read-only fields
                </p>
                <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <LockedField label="Doctor ID"      value={mongoProfile?.uniqueDoctorId}   icon={IconBox}  />
                  <LockedField label="Full Name"       value={mongoProfile?.name}             icon={IconUser} />
                  <LockedField label="PMDC Number"     value={mongoProfile?.pmdcNumber}       icon={IconId}   />
                  <LockedField label="Specialization"  value={mongoProfile?.specialization}   icon={IconSpec} />
                </div>
              </div>

              {/* Editable Fields */}
              <div>
                <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-semibold mb-3">Editable fields</p>
                <div className="space-y-4">
                  <ActiveField label="Contact Number" id="doc-settings-contact" name="contactNumber" type="tel" placeholder="+92-3XX-XXXXXXX" value={form.contactNumber} onChange={handleChange} icon={IconPhone} />
                  <ActiveField label="City" id="doc-settings-city" name="city" type="text" placeholder="e.g. Karachi" value={form.city} onChange={handleChange} icon={IconCity} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => navigate('/doctor-dashboard')}
                  className="flex-1 py-3.5 rounded-full text-sm font-semibold text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200">
                  Cancel
                </button>
                <button id="doc-settings-save-btn" type="submit" disabled={loading}
                  className="flex-1 py-3.5 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
                  {loading ? <LoadingSpinner message={uploadProgress || 'Saving…'} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">🔒 256-bit SSL · Firebase Authentication · HIPAA Compliant</p>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 items-center justify-center"
        style={{ backgroundImage: "url('/images/brain-neural-bg.png')", backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: '80% auto' }}
      />
    </div>
  );
};

export default DoctorSettings;
