import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const BrainLogo = ({ size = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={size} aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="url(#bgT)" />
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
    <defs><linearGradient id="bgT" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#0c4a6e"/><stop offset="0.5" stopColor="#0284c7"/><stop offset="1" stopColor="#0ea5e9"/></linearGradient></defs>
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

const TermsOfServicePage = () => (
  <div className="homepage-root min-h-screen bg-white font-inter flex flex-col">
    <TopBar/><Nav/>
    <section className="relative py-14 sm:py-18" style={{background:'linear-gradient(135deg,#0b3558 0%,#0c4a6e 60%,#0369a1 100%)'}}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight animate-fade-in">Terms of Service</h1>
        <p className="mt-3 text-white/80 text-sm">Last Updated: January 1, 2026</p>
      </div>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" style={{height:'40px'}}><path d="M0 25C360 50 720 0 1080 25C1260 37 1350 10 1440 25V50H0V25Z" fill="#f8fafc"/></svg>
    </section>

    <section className="py-16 sm:py-20 bg-[#f8fafc] flex-1">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 sm:p-10 text-slate-600 text-sm leading-relaxed space-y-0">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Mind Modeler 3D (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, you must not use the Platform. These terms apply to all users, including Patients, Doctors, and Administrators.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Mind Modeler 3D provides an AI-powered clinical decision-support platform for MRI scan analysis, 3D brain model reconstruction, and automated diagnostic report generation. The Platform is intended for use by licensed medical professionals and their patients.</p>
          </Section>

          <Section title="3. AI as a Decision-Support Tool">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
              <p className="text-slate-700"><strong className="text-amber-800">Critical Disclaimer:</strong> The AI-generated analyses, anomaly detections, and diagnostic suggestions provided by Mind Modeler 3D are intended solely as <strong>assistive tools for licensed medical professionals</strong>. They are <strong>not a replacement for human medical judgment</strong>. All AI outputs must be independently reviewed, verified, and confirmed by a qualified physician before any clinical decisions are made.</p>
            </div>
            <p>Mind Modeler 3D, its operators, and its AI models shall not be held liable for misdiagnosis or clinical outcomes resulting from sole reliance on AI-generated findings without appropriate physician oversight.</p>
          </Section>

          <Section title="4. User Accounts & Responsibilities">
            <ul className="list-disc pl-5 space-y-1">
              <li>Users must provide accurate registration information and maintain the confidentiality of their credentials.</li>
              <li>Medical professionals must hold valid, active licenses and are subject to admin verification before platform access is granted.</li>
              <li>Users must not share accounts, upload falsified data, or attempt to circumvent platform security measures.</li>
            </ul>
          </Section>

          <Section title="5. Medical Data & Intellectual Property">
            <p>Patients retain ownership of their medical data. By uploading MRI scans, you grant Mind Modeler 3D a limited license to process files for diagnostic analysis. AI models and platform software remain the intellectual property of Mind Modeler 3D.</p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>Mind Modeler 3D is provided &quot;as is&quot; without warranties of any kind. We are not liable for indirect, incidental, or consequential damages arising from use of the Platform, including but not limited to clinical decisions informed by AI outputs.</p>
          </Section>

          <Section title="7. Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these Terms, engage in unauthorized access, or misuse the Platform. Upon termination, users may request export of their personal data in accordance with our Privacy Policy.</p>
          </Section>

          <Section title="8. Contact">
            <p>For questions about these Terms, contact <a href="mailto:legal@mindmodeler3d.com" className="text-[#0284c7] font-semibold hover:underline">legal@mindmodeler3d.com</a> or call (123) 456-7890.</p>
          </Section>

        </div>
      </div>
    </section>
    <Footer/>
  </div>
);

export default TermsOfServicePage;
