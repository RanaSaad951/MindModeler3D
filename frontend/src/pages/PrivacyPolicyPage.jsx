import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const BrainLogo = ({ size = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={size} aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="url(#bgPP)" />
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
    <defs><linearGradient id="bgPP" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#0c4a6e"/><stop offset="0.5" stopColor="#0284c7"/><stop offset="1" stopColor="#0ea5e9"/></linearGradient></defs>
  </svg>
);

const TopBar = () => (
  <div className="bg-[#0b3558] text-white text-xs">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5"><FaPhone className="w-3 h-3 text-cyan-300"/> (123) 456-7890</span>
        <span className="hidden sm:flex items-center gap-1.5"><FaEnvelope className="w-3 h-3 text-cyan-300"/> support@mindmodeler3d.com</span>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/login" className="hover:text-cyan-300 transition-colors">Login</Link>
        <Link to="/register" className="hover:text-cyan-300 transition-colors">Register</Link>
        <span className="hidden sm:flex items-center gap-3 ml-2 border-l border-white/20 pl-3">
          {[FaFacebookF,FaTwitter,FaLinkedinIn,FaInstagram].map((I,i)=><a key={i} href="#" className="hover:text-cyan-300 transition-colors" aria-label="Social"><I className="w-3 h-3"/></a>)}
        </span>
      </div>
    </div>
  </div>
);

const Nav = () => (
  <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <Link to="/" className="flex items-center gap-2.5"><BrainLogo/><span className="text-slate-900 font-extrabold text-lg tracking-tight">Mind Modeler <span className="text-[#0284c7]">3D</span></span></Link>
      <nav className="hidden md:flex items-center gap-1">
        {['Home','Patients','Doctors'].map(l=>(
          <Link key={l} to={l==='Home'?'/':l==='Patients'?'/patient-info':'/doctor-info'} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0284c7] rounded-lg hover:bg-sky-50 transition-all duration-200">{l}</Link>
        ))}
      </nav>
      <Link to="/#contact" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/20 transition-all duration-200">Contact Us</Link>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-[#0b3558] text-white py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5"><BrainLogo size="w-7 h-7"/><span className="font-bold text-sm">Mind Modeler <span className="text-cyan-400">3D</span></span></div>
        <p className="text-xs text-sky-200/60">&copy; 2026 Mind Modeler 3D. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-sky-200/60">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
    {children}
  </div>
);

const PrivacyPolicyPage = () => (
  <div className="homepage-root min-h-screen bg-white font-inter flex flex-col">
    <TopBar/><Nav/>
    <section className="relative py-14 sm:py-18" style={{background:'linear-gradient(135deg,#0284c7 0%,#0d9488 100%)'}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight animate-fade-in">Privacy Policy</h1>
        <p className="mt-3 text-white/80 text-sm">Last Updated: January 1, 2026</p>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{height:'40px'}}><path d="M0 25C360 50 720 0 1080 25C1260 37 1350 10 1440 25V50H0V25Z" fill="#f8fafc"/></svg>
    </section>

    <section className="py-16 sm:py-20 bg-[#f8fafc] flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 sm:p-10 text-slate-600 text-sm leading-relaxed space-y-0">

          <Section title="1. Introduction">
            <p>Mind Modeler 3D (&quot;we&quot;, &quot;our&quot;, or &quot;the Platform&quot;) is committed to protecting the privacy and security of your personal and medical information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our AI-powered MRI diagnostic platform.</p>
          </Section>

          <Section title="2. HIPAA Compliance">
            <p>Mind Modeler 3D is designed and operated in full compliance with the Health Insurance Portability and Accountability Act (HIPAA). All Protected Health Information (PHI) — including MRI scans, DICOM files, patient records, and diagnostic reports — is handled according to HIPAA Privacy and Security Rules. We maintain Business Associate Agreements (BAAs) with all third-party service providers who may access PHI.</p>
          </Section>

          <Section title="3. Information We Collect">
            <p className="mb-2">We collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, role (Doctor/Patient), and professional credentials for medical providers.</li>
              <li><strong>Medical Data:</strong> MRI scan files (DICOM format), AI-generated analysis results, 3D brain model data, and diagnostic reports.</li>
              <li><strong>Usage Data:</strong> Login timestamps, feature usage analytics, and platform interaction logs for security auditing.</li>
            </ul>
          </Section>

          <Section title="4. Secure Handling of Medical Records">
            <p>All medical files — including DICOM and MRI data — are encrypted in transit (TLS 1.3) and at rest (AES-256). Files are stored in SOC 2 Type II certified cloud infrastructure. Access to medical records is strictly limited to the uploading patient and their assigned physician(s).</p>
          </Section>

          <Section title="5. Role-Based Data Access">
            <p className="mb-2">We enforce strict role-based access control (RBAC):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Patients</strong> can view and manage only their own scans and reports.</li>
              <li><strong>Doctors</strong> can access only the records of patients explicitly assigned to them.</li>
              <li><strong>Administrators</strong> manage user approvals and platform operations but cannot access individual medical records.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention & Deletion">
            <p>Medical records are retained for the duration required by applicable healthcare regulations. Users may request deletion of their account and associated data by contacting our support team. Upon account deletion, all PHI is permanently removed within 30 days.</p>
          </Section>

          <Section title="7. Contact Us">
            <p>If you have questions about this Privacy Policy or your data, contact us at <a href="mailto:privacy@mindmodeler3d.com" className="text-[#0284c7] font-semibold hover:underline">privacy@mindmodeler3d.com</a> or call (123) 456-7890.</p>
          </Section>

        </div>
      </div>
    </section>
    <Footer/>
  </div>
);

export default PrivacyPolicyPage;
