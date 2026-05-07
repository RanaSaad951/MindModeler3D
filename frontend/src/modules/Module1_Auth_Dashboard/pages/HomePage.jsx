import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram,
  FaWheelchair, FaStethoscope, FaPlus, FaHeadset,
} from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';

/* ─── Brain + AI Logo SVG ────────────────────────────────────── */
const BrainLogo = ({ size = 'w-9 h-9' }) => (
  <svg viewBox="0 0 40 40" fill="none" className={size} aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="url(#brainGrad)" />
    {/* Outer glow */}
    <circle cx="20" cy="19" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
    {/* Left brain hemisphere */}
    <path d="M20 10c-1.5 0-3 .6-4 1.7C14.5 13.3 14 15.5 14 17c0 2 .8 3.5 2 4.5.8.7 1.2 1.8 1.2 3v2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M14 17c-1.2.5-2 1.8-2 3.2 0 1.8 1.2 3 2.8 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    {/* Right brain hemisphere */}
    <path d="M20 10c1.5 0 3 .6 4 1.7 1.5 1.6 2 3.8 2 5.3 0 2-.8 3.5-2 4.5-.8.7-1.2 1.8-1.2 3v2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M26 17c1.2.5 2 1.8 2 3.2 0 1.8-1.2 3-2.8 3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    {/* Neural network nodes */}
    <circle cx="16" cy="15" r="1.3" fill="#67e8f9" />
    <circle cx="24" cy="15" r="1.3" fill="#67e8f9" />
    <circle cx="20" cy="20" r="1.5" fill="#a5f3fc" />
    <circle cx="15" cy="22" r="1" fill="#67e8f9" />
    <circle cx="25" cy="22" r="1" fill="#67e8f9" />
    {/* Neural connections */}
    <line x1="16" y1="15" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.7" opacity="0.7" />
    <line x1="24" y1="15" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.7" opacity="0.7" />
    <line x1="15" y1="22" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.5" opacity="0.5" />
    <line x1="25" y1="22" x2="20" y2="20" stroke="#67e8f9" strokeWidth="0.5" opacity="0.5" />
    <defs>
      <linearGradient id="brainGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0c4a6e" />
        <stop offset="0.5" stopColor="#0284c7" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Decorative dot grid ────────────────────────────────────── */
const DotGrid = ({ className = '' }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
    {Array.from({ length: 36 }, (_, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      return <circle key={i} cx={10 + col * 20} cy={10 + row * 20} r="2.5" fill="#0ea5e9" opacity="0.25" />;
    })}
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const { firebaseUser } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', city: '', state: '', message: '' });



  const navLinks = ['Home', 'Patients', 'Doctors'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); alert('Thank you! We will be in touch shortly.'); setForm({ name: '', email: '', city: '', state: '', message: '' }); };

  return (
    <div className="homepage-root min-h-screen bg-white overflow-hidden font-inter">

      {/* ════════════════════════════════════════════════════════
          SECTION 1 — TOP BAR + NAVBAR
          ════════════════════════════════════════════════════════ */}

      {/* Thin top bar */}
      <div className="bg-[#0b3558] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><FaPhone className="w-3 h-3 text-cyan-300" /> (123) 456-7890</span>
            <span className="hidden sm:flex items-center gap-1.5"><FaEnvelope className="w-3 h-3 text-cyan-300" /> support@mindmodeler3d.com</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-cyan-300 transition-colors" id="topbar-login">Login</Link>
            <Link to="/register" className="hover:text-cyan-300 transition-colors" id="topbar-register">Register</Link>
            <span className="hidden sm:flex items-center gap-3 ml-2 border-l border-white/20 pl-3">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
                <a key={i} href="#" className="hover:text-cyan-300 transition-colors" aria-label="Social"><Icon className="w-3 h-3" /></a>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="home-logo">
            <BrainLogo />
            <span className="text-slate-900 font-extrabold text-lg tracking-tight">Mind Modeler <span className="text-[#0284c7]">3D</span></span>
          </Link>

          {/* Center nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0284c7] rounded-lg hover:bg-sky-50 transition-all duration-200" id="nav-home">Home</a>
            <Link to="/patient-info" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0284c7] rounded-lg hover:bg-sky-50 transition-all duration-200" id="nav-patients">Patients</Link>
            <Link to="/doctor-info" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#0284c7] rounded-lg hover:bg-sky-50 transition-all duration-200" id="nav-doctors">Doctors</Link>
          </nav>

          {/* Right — Contact button + mobile toggle */}
          <div className="flex items-center gap-3">

            <a href="#contact" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/20 hover:shadow-sky-600/40 transition-all duration-200" id="nav-contact-btn">
              Contact Us
            </a>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <a href="#" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 transition">Home</a>
              <Link to="/patient-info" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 transition">Patients</Link>
              <Link to="/doctor-info" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 transition">Doctors</Link>
              <a href="#contact" onClick={() => setMobileMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0284c7] text-center mt-2">Contact Us</a>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════
          SECTION 2 — HERO
          ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center" id="hero">
        {/* Background image + gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(2,132,199,0.88) 0%, rgba(13,148,136,0.85) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              AI-Powered MRI Diagnostics, <br className="hidden sm:block" />everywhere you need it.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
              Empowering Doctors and Patients with cutting-edge 3D precision. Our advanced AI models deliver faster, more accurate neurological diagnostics.
            </p>
            <Link to={firebaseUser ? '/dashboard' : '/register'}
              className="group inline-flex items-center gap-2.5 mt-8 px-8 py-3.5 rounded-xl text-base font-bold text-[#0284c7] bg-white hover:bg-slate-50 shadow-xl shadow-black/10 transition-all duration-300 hover:-translate-y-0.5" id="hero-cta-btn">
              {firebaseUser ? 'Go to Dashboard' : 'Get Started Now'}
              <HiOutlineArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style={{ height: '50px' }}>
          <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z" className="fill-[#f8fafc]" />
        </svg>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 3 — LEARN MORE
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#f8fafc]" id="patients">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learn More about Mind Modeler 3D
          </h2>
          <div className="mt-3 mx-auto w-16 h-1 rounded-full bg-gradient-to-r from-[#0284c7] to-cyan-400" />
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We connect pre-screened, top-tier medical professionals with AI-powered diagnostic tools to deliver faster, more accurate results — helping patients get the care they need without the wait.
          </p>

          {/* Two cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Card 1 — Patients */}
            <div className="relative rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(2,132,199,0.2)] group">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img src="/images/patient-card-bg.png" alt="" className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/60 to-white/70" />
              </div>
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-50/80 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-sky-100/80 transition-colors">
                  <FaWheelchair className="w-7 h-7 text-[#0284c7]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Patients</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">Access world-class AI diagnostics from the comfort of your home. Upload scans, track results, and communicate with your care team.</p>
                <Link to="/patient-info" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0284c7] border-2 border-[#0284c7] hover:bg-[#0284c7] hover:text-white transition-all duration-200" id="learn-more-patients">
                  Learn More <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2 — Doctors */}
            <div className="relative rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(2,132,199,0.2)] group">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img src="/images/doctor-card-bg.png" alt="" className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/60 to-white/70" />
              </div>
              <div className="relative z-10 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-50/80 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-sky-100/80 transition-colors">
                  <FaStethoscope className="w-7 h-7 text-[#0284c7]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Doctors</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">Leverage cutting-edge AI models to enhance your diagnostic workflow, manage cases, and deliver precise reports in minutes.</p>
                <Link to="/doctor-info" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0284c7] border-2 border-[#0284c7] hover:bg-[#0284c7] hover:text-white transition-all duration-200" id="learn-more-providers">
                  Learn More <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 4 — THE MIND MODELER 3D ADVANTAGE
          ════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b3558 0%, #0c4a6e 50%, #0369a1 100%)' }} id="doctors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <div className="animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                The Mind Modeler 3D <br className="hidden sm:block" />Advantage
              </h2>
              <div className="mt-2 w-16 h-1 rounded-full bg-cyan-400" />

              <div className="mt-10 space-y-6">
                {[
                  { title: 'Tier 1 AI Network', desc: 'Top precision models trained on millions of clinical scans.' },
                  { title: 'Quality First', desc: 'Real-time diagnostic feedback with confidence scoring.' },
                  { title: 'Case Management Portal', desc: 'Powerful tracking & reporting for every patient journey.' },
                  { title: '3D Viewer App', desc: 'Step-by-step anomaly detection with interactive 3D models.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center mt-0.5 group-hover:bg-cyan-400/30 transition-colors">
                      <FaPlus className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base">{item.title}</h4>
                      <p className="text-sky-200/70 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Image with decorative elements */}
            <div className="relative flex justify-center lg:justify-end">
              <DotGrid className="absolute -top-6 -right-4 opacity-40" />
              <DotGrid className="absolute -bottom-6 -left-4 opacity-30 rotate-45" />
              <div className="relative w-[340px] h-[400px] sm:w-[400px] sm:h-[460px]">
                {/* Blob shape mask */}
                <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl shadow-black/30 border-4 border-white/10"
                  style={{ borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%' }}>
                  <img src="/images/doctor-patient.png" alt="Doctor consulting with patient" className="w-full h-full object-cover" />
                </div>
                {/* Floating accent */}
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-cyan-400/20 backdrop-blur-xl border border-cyan-400/20 flex items-center justify-center animate-float">
                  <FaStethoscope className="w-8 h-8 text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-28 overflow-hidden" id="contact">
        {/* Sparkling brain background */}
        <div className="absolute inset-0 z-0">
          <img src="/images/sparkling-brain-light.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 mb-5">
            <FaHeadset className="w-6 h-6 text-[#0284c7]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Contact Us</h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">We&apos;re here to help! Please contact us with any questions or feedback.</p>

          {/* Contact Card */}
          <div className="mt-12 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-2 relative min-h-[240px] lg:min-h-full">
                <img src="/images/support-person.png" alt="Friendly support representative" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0284c7]/40 to-transparent lg:bg-gradient-to-r" />
              </div>
              <div className="lg:col-span-3 p-8 sm:p-10 text-left">
                <div className="flex items-center gap-2 mb-6 pb-5 border-b border-slate-100">
                  <FaPhone className="w-4 h-4 text-[#0284c7]" />
                  <span className="text-sm font-bold text-slate-700">Call Us: <span className="text-[#0284c7]">(123) 456-7890</span></span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                      <input id="contact-name" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-city" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                      <input id="contact-city" name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all" placeholder="New York" />
                    </div>
                    <div>
                      <label htmlFor="contact-state" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">State</label>
                      <input id="contact-state" name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all" placeholder="NY" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                    <textarea id="contact-message" name="message" rows={4} value={form.message} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl text-sm text-slate-800 bg-slate-50 border border-slate-200 outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 transition-all resize-none" placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/20 hover:shadow-sky-600/40 transition-all duration-200" id="contact-submit-btn">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0b3558] text-white py-10" id="company">
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
};

export default HomePage;
