import React, { useState } from 'react';
import axios from 'axios';
import { 
  Mail, Lock, User, Briefcase, ChevronRight, AlertCircle, Loader2, 
  Building2, GraduationCap, Plus, X, Sparkles, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : '/_/backend';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' or 'RECRUITER'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clipboard copy state helper
  const [copiedText, setCopiedText] = useState('');

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleAutoFillDemo = (type) => {
    setIsLogin(true);
    setError('');
    if (type === 'student') {
      setEmail('demo@jobtrack.com');
      setPassword('password');
      setRole('STUDENT');
    } else {
      setEmail('recruiter@jobtrack.com');
      setPassword('password');
      setRole('RECRUITER');
    }
  };

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [customCompanyInput, setCustomCompanyInput] = useState('');

  const POPULAR_COMPANIES = ['Google', 'Microsoft', 'Stripe', 'Uber', 'Zomato', 'Swiggy', 'CRED', 'Razorpay', 'Paytm', 'Flipkart', 'TCS'];

  const handleToggleCompany = (comp) => {
    if (selectedCompanies.includes(comp)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== comp));
    } else {
      if (selectedCompanies.length >= 5) {
        setError('You can select up to 5 companies maximum.');
        return;
      }
      setError('');
      setSelectedCompanies([...selectedCompanies, comp]);
    }
  };

  const handleAddCustomCompany = (e) => {
    e.preventDefault();
    if (!customCompanyInput.trim()) return;
    const trimmed = customCompanyInput.trim();
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    
    if (selectedCompanies.includes(capitalized)) {
      setCustomCompanyInput('');
      return;
    }

    if (selectedCompanies.length >= 5) {
      setError('You can select up to 5 companies maximum.');
      return;
    }

    setError('');
    setSelectedCompanies([...selectedCompanies, capitalized]);
    setCustomCompanyInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && role === 'RECRUITER' && selectedCompanies.length === 0) {
      setError('Please select at least one company to represent.');
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    const payload = isLogin 
      ? { email, password } 
      : { 
          name, 
          email, 
          password, 
          role, 
          company: role === 'RECRUITER' ? selectedCompanies.join(', ') : null 
        };

    try {
      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      const { token, user } = response.data;
      onLoginSuccess(token, user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center overflow-hidden bg-[#090d16] px-4 py-12">
      
      {/* Apna-style Brand Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#2BB794]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#FFD167]/5 blur-[130px] pointer-events-none" />

      {/* Hero Left Column (LinkedIn/Apna style brand intro, only visible on lg screens) */}
      <div className="hidden lg:flex flex-col max-w-lg text-left mr-16 z-10 space-y-6">
        
        {/* Brand Logo & Name */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-5 select-none mb-3"
        >
          <div className="h-24 w-24 rounded-3xl overflow-hidden shadow-2xl shadow-[#2BB794]/30 hover:scale-105 transition-all duration-300 cursor-pointer border border-[#2BB794]/30">
            <img src="/logo.png" alt="JobTrack Network Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-black text-5xl tracking-tight text-white flex items-center gap-1 select-none">
              <span className="font-light">Job</span>
              <span className="text-[#2BB794]">Track</span>
              <span className="text-[#ffd167] animate-pulse text-3xl ml-1">✦</span>
              <span className="text-[14px] text-slate-500 font-mono tracking-wider font-bold uppercase ml-2.5">
                Funnel
              </span>
            </h2>
          </div>
        </motion.div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2BB794]/10 border border-[#2BB794]/20 text-[#2BB794] text-xs font-bold w-fit">
          <Zap className="h-3.5 w-3.5 fill-[#2BB794]" />
          <span>India's Premium Application Funnel</span>
        </div>
        
        <h1 
          className="text-4xl font-bold text-slate-100 leading-tight tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Find your dream job,<br />
          the <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#2BB794] to-[#10b981]">JobTrack</span> way.
        </h1>
        
        <p className="text-slate-400 text-sm leading-relaxed font-light">
          JobTrack bridges the gap between top tech talent and premium recruiters. Visualize your pipeline, builder ATS-grade resumes, schedule interviews, and apply with 1-click directly in community streams!
        </p>

        {/* Dynamic Trust Badges */}
        <div className="space-y-4 pt-4 border-t border-slate-900 select-none">
          <div 
            onClick={() => handleAutoFillDemo('student')}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/40 border border-transparent hover:border-slate-800/60 cursor-pointer transition-all active:scale-[0.98] group"
            title="Click to auto-fill Student demo credentials"
          >
            <div className="h-9 w-9 rounded-xl bg-[#2BB794]/10 flex items-center justify-center text-[#2BB794] shrink-0 border border-[#2BB794]/20 group-hover:bg-[#2BB794]/20 group-hover:scale-105 transition-all duration-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-white">Direct-to-Recruiter Funnels</h4>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2BB794]/10 text-[#2BB794] border border-[#2BB794]/20 select-none animate-pulse">Try Click</span>
              </div>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Skip traditional search filters; apply instantly in streams.</p>
            </div>
          </div>

          <div 
            onClick={() => handleAutoFillDemo('recruiter')}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/40 border border-transparent hover:border-slate-800/60 cursor-pointer transition-all active:scale-[0.98] group"
            title="Click to auto-fill Recruiter demo credentials"
          >
            <div className="h-9 w-9 rounded-xl bg-[#FFD167]/10 flex items-center justify-center text-[#FFD167] shrink-0 border border-[#FFD167]/20 group-hover:bg-[#FFD167]/20 group-hover:scale-105 transition-all duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-white">Verified Represented Brands</h4>
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FFD167]/10 text-[#FFD167] border border-[#FFD167]/20 select-none animate-pulse">Try Click</span>
              </div>
              <p className="text-[10px] text-slate-500 font-light mt-0.5">Direct partnership tracks with Google, Swiggy, Stripe & CRED.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Card Right Column */}
      <div className="w-full max-w-md z-10 flex flex-col">
        
        {/* Mobile Header (Hidden on lg screens) */}
        <div className="text-center mb-8 lg:hidden">
          <div className="inline-flex items-center justify-center h-28 w-28 rounded-3xl overflow-hidden mb-4 shadow-xl shadow-[#2BB794]/15 animate-pulse border border-[#2BB794]/20">
            <img src="/logo.png" alt="JobTrack Network Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white flex items-center justify-center gap-1 select-none">
            <span className="font-light">Job</span>
            <span className="text-[#2BB794]">Track</span>
            <span className="text-[#ffd167] animate-pulse text-3xl ml-1">✦</span>
            <span className="text-[14px] text-slate-500 font-mono tracking-wider font-bold uppercase ml-2.5">
              Funnel
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-light">
            Visualize, track, and manage tech application funnels
          </p>
        </div>

        {/* Designative Form Panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-slate-800/80 bg-[#0d1322]/80">
          
          {/* Accent border styled with Apna's signature colors */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2BB794] via-[#ffd167] to-[#10b981] opacity-90 shadow-lg" />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <span className="text-[9px] bg-[#FFD167]/10 border border-[#FFD167]/20 text-[#FFD167] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black select-none">
              Career Portal
            </span>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-5 text-left"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Visual Double-Card Role Selector */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block select-none">
                {isLogin ? 'Log in as:' : 'Register an account as:'}
              </label>
              
              <div className="grid grid-cols-2 gap-3.5 select-none">
                {/* Student Card Selector */}
                <div
                  onClick={() => { setRole('STUDENT'); setSelectedCompanies([]); }}
                  className={`p-4 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                    role === 'STUDENT'
                      ? 'bg-[#2BB794]/10 border-[#2BB794] shadow-[0_0_15px_rgba(43,183,148,0.2)] scale-[1.02]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2 border transition-all ${
                    role === 'STUDENT' ? 'bg-[#2BB794]/15 border-[#2BB794]/25 text-[#2BB794]' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Student / Candidate</h3>
                  <p className="text-[9px] text-slate-500 font-light leading-relaxed mt-1">
                    Apply & track job funnels
                  </p>
                </div>

                {/* Recruiter Card Selector */}
                <div
                  onClick={() => setRole('RECRUITER')}
                  className={`p-4 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                    role === 'RECRUITER'
                      ? 'bg-[#2BB794]/10 border-[#2BB794] shadow-[0_0_15px_rgba(43,183,148,0.2)] scale-[1.02]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2 border transition-all ${
                    role === 'RECRUITER' ? 'bg-[#2BB794]/15 border-[#2BB794]/25 text-[#2BB794]' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Verified Recruiter</h3>
                  <p className="text-[9px] text-slate-500 font-light leading-relaxed mt-1">
                    Manage candidates & schedules
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden text-left"
                >
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Recruiter represented company field */}
            <AnimatePresence>
              {!isLogin && role === 'RECRUITER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden select-none text-left"
                >
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300">
                      Represented Companies (Select 1-5)
                    </label>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                      selectedCompanies.length === 5 
                        ? 'bg-[#FFD167]/10 border-[#FFD167]/30 text-[#FFD167]' 
                        : selectedCompanies.length > 0 
                          ? 'bg-[#2BB794]/15 border-[#2BB794]/30 text-[#2BB794]'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {selectedCompanies.length} / 5 Selected
                    </span>
                  </div>

                  {/* Predefined Grid Badges */}
                  <div className="grid grid-cols-3 gap-2">
                    {POPULAR_COMPANIES.map((comp) => {
                      const isSelected = selectedCompanies.includes(comp);
                      const isMaxReached = selectedCompanies.length >= 5;
                      return (
                        <div
                          key={comp}
                          onClick={() => handleToggleCompany(comp)}
                          className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#2BB794]/10 border-[#2BB794] text-white shadow-[0_0_8px_rgba(43,183,148,0.2)] font-black'
                              : isMaxReached
                                ? 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-950/40 border-slate-850/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-200'
                          }`}
                        >
                          {comp}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Company Bar */}
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={customCompanyInput}
                          onChange={(e) => setCustomCompanyInput(e.target.value)}
                          placeholder="Or type custom company..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-700"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCompany(e);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomCompany}
                        disabled={!customCompanyInput.trim() || selectedCompanies.length >= 5}
                        className="px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        title="Add Custom Company"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Selected Tags list */}
                  {selectedCompanies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-850">
                      {selectedCompanies.map(c => (
                        <span 
                          key={c}
                          onClick={() => handleToggleCompany(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2BB794]/15 border border-[#2BB794]/30 text-[#2BB794] text-[10px] font-bold cursor-pointer hover:bg-[#2BB794]/30 hover:border-[#2BB794]/50 transition-all"
                        >
                          <span>{c}</span>
                          <X className="h-3 w-3 shrink-0 text-[#2BB794]" />
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 font-light leading-relaxed">
                    You will be linked to represent up to 5 companies to manage their student applicant pipelines!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Apna Style CTA Button in Jungle Green */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#25a584] hover:to-[#0f9f72] text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(43,183,148,0.35)] disabled:opacity-50 transition-all cursor-pointer active:scale-95 duration-300 select-none"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to JobTrack' : 'Register Account'}</span>
                  <ChevronRight className="h-4 w-4 text-[#FFD167]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center select-none">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-[#2BB794] hover:text-[#1e9d7c] transition-colors font-bold cursor-pointer hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* Demo Credentials Segment */}
        <div className="mt-6 text-center text-xs text-slate-500 font-light max-w-sm mx-auto space-y-2.5">
          <p>Portfolio Reviewer? Create any account, or test using:</p>
          <div className="bg-[#0b101c]/90 border border-slate-900 p-3.5 rounded-xl text-[11px] text-left space-y-2.5 relative">
            <div className="absolute top-3.5 right-3.5 flex items-center gap-1 text-[9px] text-[#FFD167] font-semibold">
              <Sparkles className="h-3 w-3 fill-[#FFD167]" />
              <span>Seeds Enabled</span>
            </div>
            
            <div>
              <span className="font-bold text-slate-300 flex items-center gap-1.5 select-none">
                🎓 Student Account:
              </span>
              <span className="block font-light mt-1 flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                <code className="text-[#2BB794] font-bold select-all">demo@jobtrack.com</code>
                <button
                  type="button"
                  onClick={() => handleCopyText('demo@jobtrack.com')}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-[9px] flex items-center gap-1 select-none font-semibold"
                >
                  {copiedText === 'demo@jobtrack.com' ? 'Copied ✅' : 'Copy 📋'}
                </button>
              </span>
              <span className="block text-[10px] text-slate-500 font-light mt-0.5 select-none">Password: <code className="bg-slate-950/30 px-1 py-0.5 rounded text-slate-450 font-bold select-all">password</code></span>
            </div>

            <div className="border-t border-slate-900 pt-2.5 mt-2.5">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 select-none">
                💼 Recruiter Account (5-Company):
              </span>
              <span className="block font-light mt-1 flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                <code className="text-[#2BB794] font-bold select-all">recruiter@jobtrack.com</code>
                <button
                  type="button"
                  onClick={() => handleCopyText('recruiter@jobtrack.com')}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer text-[9px] flex items-center gap-1 select-none font-semibold"
                >
                  {copiedText === 'recruiter@jobtrack.com' ? 'Copied ✅' : 'Copy 📋'}
                </button>
              </span>
              <span className="block text-[10px] text-slate-500 font-light mt-0.5 select-none">Password: <code className="bg-slate-950/30 px-1 py-0.5 rounded text-slate-450 font-bold select-all">password</code></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
