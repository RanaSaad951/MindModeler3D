import { Link } from 'react-router-dom';
import {
  FaCloudUploadAlt, FaUserMd, FaShieldAlt, FaFileDownload,
  FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
} from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';

/* ─── Brain + AI Logo ────────────────────────────────────────── */
const BrainLogo = ({ size = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={size} aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="url(#bgP)" />
    <circle cx="20" cy="19" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    <path d="M20 10c-1.5 0-3 .6-4 1.7C14.5 13.3 14 15.5 14 17c0 2 .8 3.5 2 4.5.8.7 1.2 1.8 1.2 3v2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M14 17c-1.2.5-2 1.8-2 3.2 0 1.8 1.2 3 2.8 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <path d="M20 10c1.5 0 3 .6 4 1.7 1.5 1.6 2 3.8 2 5.3 0 2-.8 3.5-2 4.5-.8.7-1.2 1.8-1.2 3v2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M26 17c1.2.5 2 1.8 2 3.2 0 1.8-1.2 3-2.8 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <circle cx="16" cy="15" r="1.3" fill="#67e8f9" /><circle cx="24" cy="15" r="1.3" fill="#67e8f9" />
    <circle cx="20" cy="20" r="1.5" fill="#a5f3fc" /><circle cx="15" cy="22" r="1" fill="#67e8f9" /><circle cx="25" cy="22" r="1" fill="#67e8f9" />
    <line x1="16" y1="15" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.7" opacity="0.7" />
    <line x1="24" y1="15" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.7" opacity="0.7" />
    <line x1="15" y1="22" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.5" opacity="0.5" />
    <line x1="25" y1="22" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.5" opacity="0.5" />
    <defs><linearGradient id="bgP" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#0c4a6e"/><stop offset="0.5" stopColor="#0284c7"/><stop offset="1" stopColor="#0ea5e9"/></linearGradient></defs>
  </svg>
);

const features = [
  { icon: FaCloudUploadAlt, title: 'Secure MRI File Uploading', desc: 'Upload your MRI scans (including DICOM files) through our encrypted portal. All transfers use 256-bit SSL encryption and are stored in HIPAA-compliant cloud infrastructure, ensuring your medical data remains protected at every step.' },
  { icon: FaUserMd, title: 'Assign Scans to Your Doctor', desc: 'Easily assign uploaded scans to your preferred medical professional. Our platform connects you with pre-screened, board-certified doctors who specialize in neurological diagnostics and AI-assisted analysis.' },
  { icon: FaShieldAlt, title: 'Strict Data Privacy', desc: 'Your privacy is our top priority. All medical records are handled under strict HIPAA compliance with role-based access control — only you and your assigned physician can view your data. No third-party access, ever.' },
  { icon: FaFileDownload, title: 'Download AI-Generated Reports', desc: 'Once your doctor reviews the AI analysis, you can download comprehensive PDF diagnostic reports directly from your dashboard. Reports include 3D visualizations, anomaly markers, and physician notes.' },
];

const PatientInfoPage = () => (
  <div className="homepage-root min-h-screen bg-white font-inter flex flex-col">

    {/* ── TOP BAR ──────────────────────────────────────────────── */}
    <div className="bg-[#0b3558] text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><FaPhone className="w-3 h-3 text-cyan-300" /> (123) 456-7890</span>
          <span className="hidden sm:flex items-center gap-1.5"><FaEnvelope className="w-3 h-3 text-cyan-300" /> support@mindmodeler3d.com</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-cyan-300 transition-colors">Login</Link>
          <Link to="/register" className="hover:text-cyan-300 transition-colors">Register</Link>
          <span className="hidden sm:flex items-center gap-3 ml-2 border-l border-white/20 pl-3">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
              <a key={i} href="#" className="hover:text-cyan-300 transition-colors" aria-label="Social"><Icon className="w-3 h-3" /></a>
            ))}
          </span>
        </div>
      </div>
    </div>

    {/* ── NAVBAR ───────────────────────────────────────────────── */}
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5" id="patient-info-logo">
          <BrainLogo />
          <span className="text-slate-900 font-extrabold text-lg tracking-tight">Mind Modeler <span className="text-[#0284c7]">3D</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {['Home', 'Patients', 'Doctors'].map((link) => (
            <Link key={link} to={link === 'Home' ? '/' : link === 'Patients' ? '/patient-info' : '/doctor-info'}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${link === 'Patients' ? 'text-[#0284c7] bg-sky-50' : 'text-slate-600 hover:text-[#0284c7] hover:bg-sky-50'}`}>{link}</Link>
          ))}
        </nav>
        <Link to="/#contact" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/20 transition-all duration-200">Contact Us</Link>
      </div>
    </header>

    {/* ── HERO BANNER ──────────────────────────────────────────── */}
    <section className="relative py-16 sm:py-20" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight animate-fade-in">
          How Patients Use Mind Modeler 3D
        </h1>
        <p className="mt-4 text-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Your health data, your control. Experience a seamless journey from MRI upload to AI-powered diagnosis — with total privacy at every step.
        </p>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{ height: '40px' }}>
        <path d="M0 25C360 50 720 0 1080 25C1260 37 1350 10 1440 25V50H0V25Z" fill="#f8fafc" />
      </svg>
    </section>

    {/* ── FEATURES GRID ───────────────────────────────────────── */}
    <section className="py-20 sm:py-28 bg-[#f8fafc] flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors">
                <f.icon className="w-6 h-6 text-[#0284c7]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link to="/register" className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/25 transition-all duration-300 hover:-translate-y-0.5" id="patient-cta">
            Create Your Patient Account
            <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>

    {/* ── FOOTER ───────────────────────────────────────────────── */}
    <footer className="bg-[#0b3558] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrainLogo size="w-7 h-7" />
            <span className="font-bold text-sm">Mind Modeler <span className="text-cyan-400">3D</span></span>
          </div>
          <p className="text-xs text-sky-200/60">&copy; 2026 Mind Modeler 3D. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-sky-200/60">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default PatientInfoPage;
