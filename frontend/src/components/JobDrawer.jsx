import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  X, Calendar, IndianRupee, Link as LinkIcon, Save, Trash2, Plus, 
  Check, Info, FileSearch, History, Sparkles, AlertCircle, Play, 
  Coins, FileText, Loader2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Master keyword dictionary for local resume parsing
const MATCH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust', 'swift', 'php', 'html', 'css', 'sql', 'nosql',
  'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'express', 'node.js', 'nodejs', 'spring boot', 'springboot', 'django', 'flask', 'fastapi', 'rails', 'laravel', 'tailwind', 'bootstrap', 'redux', 'prisma', 'sequelize', 'graphql',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'github', 'jenkins', 'ci/cd', 'cicd', 'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'firebase', 'supabase', 'terraform', 'linux',
  'rest api', 'restful', 'microservices', 'system design', 'agile', 'scrum', 'testing', 'jest', 'cypress', 'oop', 'mvc', 'data structures', 'algorithms',
  'communication', 'teamwork', 'problem solving', 'leadership', 'collaboration'
];

export default function JobDrawer({ job, onClose, onSave, onDelete, defaultStatus = 'APPLIED' }) {
  const isEdit = !!job?.id;

  const getRelativeTimeString = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Active Tab: 'details' | 'matcher' | 'cover' | 'salary' | 'timeline'
  const [activeTab, setActiveTab] = useState('details');

  // Local Form States
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [descriptionUrl, setDescriptionUrl] = useState('');
  const [salary, setSalary] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(defaultStatus);
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  
  // Checklist input
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Resume Matcher Local States
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [matchingRunning, setMatchingRunning] = useState(false);

  // CTC Analyzer Inputs (Lakhs)
  const [baseLpa, setBaseLpa] = useState('');
  const [bonusLpa, setBonusLpa] = useState('');
  const [signonLpa, setSignonLpa] = useState('');
  const [stocksLpa, setStocksLpa] = useState(''); // Annual Stocks (Total Stocks / 4 years vesting)

  // Timeline State
  const [activityLog, setActivityLog] = useState([]);
  
  // Autofill Loading State
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofillError, setAutofillError] = useState('');
  
  // Cover Letter Copy Success State
  const [copySuccess, setCopySuccess] = useState(false);

  // Load active job data if in Edit Mode
  useEffect(() => {
    if (isEdit && job) {
      setCompany(job.company || '');
      setRole(job.role || '');
      setDescriptionUrl(job.descriptionUrl || '');
      setSalary(job.salary || '');
      setAppliedDate(job.appliedDate || '');
      setStatus(job.status || defaultStatus);
      setInterviewDate(job.interviewDate || '');
      setNotes(job.notes || '');
      setActiveTab('details');

      // Parse Checklist
      let parsedCheck = [];
      try {
        parsedCheck = typeof job.checklist === 'string' ? JSON.parse(job.checklist) : job.checklist || [];
      } catch (e) {
        parsedCheck = [];
      }
      setChecklist(parsedCheck);

      // Parse Activity Log
      let parsedLog = [];
      try {
        parsedLog = typeof job.activityLog === 'string' ? JSON.parse(job.activityLog) : job.activityLog || [];
      } catch (e) {
        parsedLog = [];
      }
      setActivityLog(parsedLog);

      // Parse Resume Matcher Data
      let parsedMatch = {};
      try {
        parsedMatch = typeof job.resumeMatcherData === 'string' 
          ? JSON.parse(job.resumeMatcherData || '{}') 
          : job.resumeMatcherData || {};
      } catch (e) {
        parsedMatch = {};
      }

      setJdText(parsedMatch.jdText || '');
      setResumeText(parsedMatch.resumeText || '');
      setMatchScore(parsedMatch.matchScore !== undefined ? parsedMatch.matchScore : null);
      setMatchedSkills(parsedMatch.matchedSkills || []);
      setMissingSkills(parsedMatch.missingSkills || []);

      // Parse Salary Analyzer Data
      let parsedSalary = {};
      try {
        parsedSalary = typeof job.salaryCalculatorData === 'string'
          ? JSON.parse(job.salaryCalculatorData || '{}')
          : job.salaryCalculatorData || {};
      } catch (e) {
        parsedSalary = {};
      }
      setBaseLpa(parsedSalary.baseLpa || '');
      setBonusLpa(parsedSalary.bonusLpa || '');
      setSignonLpa(parsedSalary.signonLpa || '');
      setStocksLpa(parsedSalary.stocksLpa || '');

    } else {
      // Clear for New Mode
      setCompany('');
      setRole('');
      setDescriptionUrl('');
      setSalary('');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setStatus(defaultStatus);
      setInterviewDate('');
      setNotes('');
      setChecklist([
        { id: '1', text: 'Research company history & culture', done: false },
        { id: '2', text: 'Analyze job description keywords', done: false },
        { id: '3', text: 'Prepare 3 CAR stories (Challenge, Action, Result)', done: false },
        { id: '4', text: 'Draft 5 follow-up questions for the team', done: false }
      ]);
      setActivityLog([
        { id: 'init', action: 'Pending Creation', date: new Date().toISOString() }
      ]);
      setJdText('');
      setResumeText('');
      setMatchScore(null);
      setMatchedSkills([]);
      setMissingSkills([]);
      setBaseLpa('');
      setBonusLpa('');
      setSignonLpa('');
      setStocksLpa('');
      setActiveTab('details');
    }
  }, [job, isEdit, defaultStatus]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!company.trim() || !role.trim() || !appliedDate) return;

    // Pack resume scanner cache
    const resumeMatcherDataPack = {
      jdText,
      resumeText,
      matchScore,
      matchedSkills,
      missingSkills
    };

    // Pack salary calculator cache
    const salaryCalculatorDataPack = {
      baseLpa: Number(baseLpa) || 0,
      bonusLpa: Number(bonusLpa) || 0,
      signonLpa: Number(signonLpa) || 0,
      stocksLpa: Number(stocksLpa) || 0
    };

    // Auto-update standard salary field to map back to board if BaseLpa is filled!
    let standardSalary = salary;
    if (Number(baseLpa) > 0) {
      // e.g. 18L LPA
      standardSalary = `₹${baseLpa}L LPA`;
    }

    const payload = {
      company,
      role,
      descriptionUrl,
      salary: standardSalary,
      appliedDate,
      status,
      interviewDate: interviewDate || null,
      notes,
      checklist,
      resumeMatcherData: resumeMatcherDataPack,
      salaryCalculatorData: salaryCalculatorDataPack
    };

    if (isEdit) {
      payload.id = job.id;
    }

    onSave(payload);
  };

  // Smart autofill parser Axios call
  const handleAutofillLink = async () => {
    if (!descriptionUrl.trim()) return;
    setAutofillLoading(true);
    setAutofillError('');

    try {
      const res = await axios.post('http://localhost:5000/api/jobs/autofill', { url: descriptionUrl });
      const { company: scrapedCompany, role: scrapedRole } = res.data;
      if (scrapedCompany) setCompany(scrapedCompany);
      if (scrapedRole) setRole(scrapedRole);
    } catch (err) {
      console.error(err);
      setAutofillError('Autofill fell back to domain extraction due to URL CORS blockages.');
    } finally {
      setAutofillLoading(false);
    }
  };

  // Local Keyword matching algorithm
  const handleAnalyzeResume = () => {
    if (!jdText.trim() || !resumeText.trim()) return;
    setMatchingRunning(true);

    setTimeout(() => {
      const jdLower = jdText.toLowerCase();
      const resumeLower = resumeText.toLowerCase();

      // Extract keywords found in JD
      const jdKeywords = MATCH_KEYWORDS.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(jdLower);
      });

      // Extract keywords found in Resume
      const resumeKeywords = MATCH_KEYWORDS.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(resumeLower);
      });

      // Intersect keywords
      const matched = jdKeywords.filter(word => resumeKeywords.includes(word));
      const missing = jdKeywords.filter(word => !resumeKeywords.includes(word));

      // Calculate matching percentage
      const score = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 0;

      setMatchScore(score);
      setMatchedSkills(matched);
      setMissingSkills(missing);
      setMatchingRunning(false);

      if (isEdit) {
        onSave({
          id: job.id,
          company,
          role,
          descriptionUrl,
          salary,
          appliedDate,
          status,
          interviewDate: interviewDate || null,
          notes,
          checklist,
          resumeMatcherData: {
            jdText,
            resumeText,
            matchScore: score,
            matchedSkills: matched,
            missingSkills: missing
          },
          salaryCalculatorData: {
            baseLpa: Number(baseLpa) || 0,
            bonusLpa: Number(bonusLpa) || 0,
            signonLpa: Number(signonLpa) || 0,
            stocksLpa: Number(stocksLpa) || 0
          },
          newAction: `Scanned Resume: Match Score ${score}%`
        });
      }
    }, 850);
  };

  // Indian New Tax Regime monthly take-home calculator
  const salaryBreakdown = useMemo(() => {
    const base = Number(baseLpa) || 0;
    const bonus = Number(bonusLpa) || 0;
    const signon = Number(signonLpa) || 0;
    const stocks = Number(stocksLpa) || 0;

    const annualCash = base + bonus; // Signon is one-time cash, usually calculated separately or added in 1st year
    
    if (annualCash === 0) return { inhand: 0, tax: 0, epf: 0, chart: [] };

    // Standard deduction under New Regime = ₹75,000 (0.75 Lakhs)
    const taxableCash = Math.max(0, annualCash - 0.75);
    
    // EPF - flat statutory estimate (approx ₹21,600 / year = 0.216 Lakhs)
    const epfAnnual = 0.216;

    // Professional tax (₹2,500 / year = 0.025 Lakhs)
    const profTax = 0.025;

    // Calculate tax slabs under New Regime (FY 2025-2026/2026-2027 standard estimates)
    let annualTax = 0;
    if (taxableCash <= 3.0) {
      annualTax = 0;
    } else if (taxableCash <= 7.0) {
      annualTax = (taxableCash - 3.0) * 0.05;
    } else if (taxableCash <= 10.0) {
      annualTax = 0.20 + (taxableCash - 7.0) * 0.10;
    } else if (taxableCash <= 12.0) {
      annualTax = 0.50 + (taxableCash - 10.0) * 0.15;
    } else if (taxableCash <= 15.0) {
      annualTax = 0.80 + (taxableCash - 12.0) * 0.20;
    } else {
      annualTax = 1.40 + (taxableCash - 15.0) * 0.30;
    }

    // Cess of 4% on tax
    annualTax = annualTax * 1.04;

    const totalDeductions = annualTax + epfAnnual + profTax;
    
    // In hand monthly salary (in Lakhs -> convert to absolute Rupees)
    const annualInhand = Math.max(0, annualCash - totalDeductions);
    const monthlyInhandAbs = Math.round((annualInhand * 100000) / 12);

    // Recharts data packing
    const chartData = [
      { name: 'Monthly Take-Home', value: Math.round((annualInhand / 12) * 100000), color: '#10b981' },
      { name: 'Income Tax (Est)', value: Math.round((annualTax / 12) * 100000), color: '#ef4444' },
      { name: 'Provident Fund (EPF)', value: Math.round((epfAnnual / 12) * 100000), color: '#2bb794' }
    ];

    if (stocks > 0) {
      chartData.push({ name: 'Stock ESOPs (Annualized)', value: Math.round((stocks / 12) * 100000), color: '#3b82f6' });
    }
    if (signon > 0) {
      chartData.push({ name: 'Sign-On Bonus (Avg)', value: Math.round((signon / 12) * 100000), color: '#eab308' });
    }

    return {
      inhand: monthlyInhandAbs,
      tax: Math.round(annualTax * 100000),
      epf: Math.round(epfAnnual * 100000),
      chart: chartData
    };
  }, [baseLpa, bonusLpa, signonLpa, stocksLpa]);

  // Cover Letter Template Stitcher
  const coverLetterText = useMemo(() => {
    const studentName = 'Demo Candidate';
    const companyName = company || '[Company]';
    const roleTitle = role || '[Software Engineer]';
    
    const matchedSkillsList = matchedSkills.length > 0 
      ? matchedSkills.slice(0, 4).join(', ') 
      : 'software engineering and problem solving';

    const missingSkillsList = missingSkills.length > 0 
      ? missingSkills.slice(0, 3).join(', ') 
      : '';

    return `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${roleTitle} position at ${companyName}. As a developer deeply committed to creating scalable, robust systems, I have long admired how ${companyName} pushes the envelope of technology.

Through my hands-on experience, I have developed solid foundational capabilities in ${matchedSkillsList}. I have successfully utilized these to architect and deploy end-to-end applications, solving critical operational bottlenecks along the way. I thrive in collaborative team environments and look forward to contributing my technical skills and enthusiasm to your team.

${missingSkillsList ? `Furthermore, I am actively sharpening my expertise in ${missingSkillsList} to align with your team's technical architecture, ensuring I can contribute immediately upon joining.` : ''}

Thank you for your time and consideration. I welcome the opportunity to discuss how my profile matches your requirements in an interview.

Sincerely,
${studentName}`;
  }, [company, role, matchedSkills, missingSkills]);

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Checklist Actions
  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      done: false
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
  };

  const handleToggleChecklist = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const handleDeleteChecklist = (id) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  return (
    <>
      {/* Dim Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#020617]/70 backdrop-blur-sm z-40 transition-all"
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#0f172a] border-l border-slate-800/80 shadow-2xl z-50 flex flex-col"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-[#090d16] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isEdit ? 'Application Hub' : 'Track New Application'}</span>
              {isEdit && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                  ID: #{job.id.substring(0, 5)}
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-light">
              {isEdit ? `${role} at ${company}` : 'Register a new card in your application funnel'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabbed Navigation selector */}
        {isEdit && (
          <div className="flex border-b border-slate-800 bg-[#0c1220]/60 p-2 gap-1 justify-around overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'details' 
                  ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="h-4 w-4" />
              <span>Details</span>
            </button>

            <button
              onClick={() => setActiveTab('matcher')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'matcher' 
                  ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSearch className="h-4 w-4" />
              <span>ATS Matcher</span>
            </button>

            {matchScore !== null && (
              <button
                onClick={() => setActiveTab('cover')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cover' 
                    ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Cover Letter</span>
              </button>
            )}

            {status === 'OFFERED' && (
              <button
                onClick={() => setActiveTab('salary')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'salary' 
                    ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="h-4 w-4" />
                <span>Salary Analyzer</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'timeline' 
                  ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Activity</span>
            </button>
          </div>
        )}

        {/* Dynamic scrollable body content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* Job Link URL field with Smart Autofill sparkles */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Job Description URL</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={descriptionUrl}
                      onChange={(e) => setDescriptionUrl(e.target.value)}
                      placeholder="Paste career link (e.g. LinkedIn, Stripe Careers)"
                      className="flex-1 px-4 py-2.5 glass-input text-sm text-purple-300"
                    />
                    <button
                      type="button"
                      disabled={autofillLoading || !descriptionUrl.trim()}
                      onClick={handleAutofillLink}
                      className="px-4 bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-purple-400 hover:text-purple-300 disabled:opacity-40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer select-none"
                    >
                      {autofillLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>Autofill</span>
                    </button>
                  </div>
                  {autofillError && (
                    <p className="text-[9px] text-amber-500 font-light italic mt-1">{autofillError}</p>
                  )}
                </div>

                {/* Primary inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Google, Stripe, etc."
                      className="w-full px-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Role Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Software Engineer Intern"
                      className="w-full px-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                      <span>Prospective Salary</span>
                    </label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. ₹8,00,000 or ₹60k/month"
                      className="w-full px-4 py-2.5 glass-input text-sm text-emerald-300"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 glass-input text-sm"
                    >
                      <option value="APPLIED" className="bg-[#0f172a]">Applied</option>
                      <option value="INTERVIEWING" className="bg-[#0f172a]">Interviewing</option>
                      <option value="OFFERED" className="bg-[#0f172a]">Offered</option>
                      <option value="REJECTED" className="bg-[#0f172a]">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Date Applied</span>
                    </label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="w-full px-4 py-2.5 glass-input text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-purple-400" />
                      <span>Interview Date</span>
                    </label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-4 py-2.5 glass-input text-sm text-purple-300 border-purple-500/20"
                    />
                  </div>
                </div>

                {/* Prep checklist */}
                <div className="border-t border-slate-800/60 pt-4 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Interview Prep Checklist
                  </label>
                  
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {checklist.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/50 rounded-xl transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleChecklist(item.id)}
                          className="flex items-center gap-2.5 text-left text-xs text-slate-300 font-light flex-1 pr-4"
                        >
                          <span className={`p-0.5 rounded border transition-colors shrink-0 ${
                            item.done 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'border-slate-700 text-slate-500'
                          }`}>
                            <Check className={`h-3 w-3 ${item.done ? 'opacity-100' : 'opacity-0'}`} />
                          </span>
                          <span className={item.done ? 'line-through text-slate-500 font-extralight' : ''}>
                            {item.text}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteChecklist(item.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition-colors rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add task (e.g. System Design patterns)"
                      className="flex-1 px-3 py-2 glass-input text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-slate-800/60 pt-4 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Notes & Interview Research</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste company research, technical requirements, or interviewer notes..."
                    rows={4}
                    className="w-full px-4 py-3 glass-input text-xs font-light leading-relaxed resize-none"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'matcher' && (
              <motion.div
                key="matcher"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-5 flex items-center justify-between border border-purple-500/10">
                  <div className="space-y-1 max-w-[280px]">
                    <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span>Resume-to-JD Matcher</span>
                    </h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-light">
                      Input the target job specifications and copy-paste your active resume contents below. We will extract critical keywords and audit your structural match index.
                    </p>
                  </div>

                  {/* Circular Match Progress Ring */}
                  <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.04)" strokeWidth="6" fill="transparent" />
                      <motion.circle 
                        cx="40" cy="40" r="32" 
                        stroke={matchScore >= 70 ? "#10b981" : matchScore >= 40 ? "#eab308" : "#f43f5e"} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 32}
                        initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - (matchScore || 0) / 100) }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-lg font-bold text-white leading-none">
                        {matchScore !== null ? `${matchScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-300">Job Description Text</label>
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste keywords, skills, and JD text here..."
                      rows={5}
                      className="w-full p-3 glass-input text-[11px] font-light leading-relaxed resize-none"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-300">Your Resume Content</label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume / skills summary text here..."
                      rows={5}
                      className="w-full p-3 glass-input text-[11px] font-light leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={matchingRunning || !jdText.trim() || !resumeText.trim()}
                  onClick={handleAnalyzeResume}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {matchingRunning ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Parsing Stacks...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Audit Resume Match</span>
                    </>
                  )}
                </button>

                {matchScore !== null && (
                  <div className="space-y-4 border-t border-slate-800/80 pt-4">
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        <span>Matched Keywords ({matchedSkills.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((tag) => (
                          <span key={tag} className="text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full capitalize">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Missing Target Keywords ({missingSkills.length})</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((tag) => (
                          <span key={tag} className="text-[10px] font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full capitalize">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'cover' && (
              <motion.div
                key="cover"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Cover Letter Tailor</h3>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5">Stitched dynamically from matched ATS scanner keywords.</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCopyCoverLetter}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer select-none"
                  >
                    {copySuccess ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="glass-panel border border-slate-800 rounded-xl p-5 min-h-[300px]">
                  <pre className="text-slate-300 text-[11px] font-sans font-light leading-relaxed whitespace-pre-wrap">
                    {coverLetterText}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'salary' && (
              <motion.div
                key="salary"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/10 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-emerald-400" />
                      <span>Take-Home Salary Breakdown (Indian Tax Regime)</span>
                    </h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-light">
                      Input compensation details in lakhs (e.g. 18 for ₹18 Lakhs) to audit take-home monthly values after standard tax deductions.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">EST. MONTHLY CASH:</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      ₹{salaryBreakdown.inhand.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>

                {/* Form parameters */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-5">
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Base Salary LPA (Lakhs)</label>
                    <input
                      type="number"
                      value={baseLpa}
                      onChange={(e) => setBaseLpa(e.target.value)}
                      placeholder="e.g. 18"
                      className="w-full px-4 py-2.5 glass-input text-sm text-emerald-300"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Variable / Performance LPA</label>
                    <input
                      type="number"
                      value={bonusLpa}
                      onChange={(e) => setBonusLpa(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full px-4 py-2.5 glass-input text-sm text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Annual Stocks / ESOPs (LPA)</label>
                    <input
                      type="number"
                      value={stocksLpa}
                      onChange={(e) => setStocksLpa(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full px-4 py-2.5 glass-input text-sm text-blue-300"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-300">Sign-on Bonus (One-time)</label>
                    <input
                      type="number"
                      value={signonLpa}
                      onChange={(e) => setSignonLpa(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="w-full px-4 py-2.5 glass-input text-sm text-amber-300"
                    />
                  </div>
                </div>

                {/* Pie Chart display */}
                {Number(baseLpa) > 0 && (
                  <div className="flex flex-col md:flex-row gap-5 items-center justify-around bg-slate-950/20 p-5 rounded-xl border border-slate-800">
                    <div className="h-[150px] w-[150px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salaryBreakdown.chart}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={55}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {salaryBreakdown.chart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Monthly Value']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart Legend listing */}
                    <div className="space-y-2 text-[10px] w-full max-w-[240px]">
                      {salaryBreakdown.chart.map((entry) => (
                        <div key={entry.name} className="flex justify-between items-center p-1.5 bg-slate-900/40 rounded-lg border border-slate-800/40">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-400 truncate">{entry.name}</span>
                          </div>
                          <span className="font-bold text-slate-200 font-mono">₹{entry.value.toLocaleString('en-IN')}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="relative pl-6 space-y-5 border-l border-dashed border-[#2BB794]/30 ml-3 py-2">
                  {activityLog.map((log, index) => {
                    const isRecruiterAction = log.action.toLowerCase().includes('recruiter') || 
                                              log.action.toLowerCase().includes('scheduled') ||
                                              log.action.toLowerCase().includes('offer') ||
                                              log.action.toLowerCase().includes('rejected');
                    return (
                      <div key={log.id || index} className="relative group transition-all duration-200">
                        {/* Glowing indicator bullet */}
                        <span className={`absolute -left-[31px] top-[4px] h-2.5 w-2.5 rounded-full border border-slate-950 transition-all duration-300 ${
                          isRecruiterAction 
                            ? 'bg-[#2BB794] shadow-[0_0_8px_rgba(43,183,148,0.7)] group-hover:scale-110' 
                            : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] group-hover:scale-110'
                        }`} />
                        
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-slate-200 leading-tight group-hover:text-white transition-colors">
                            {log.action}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <span>{new Date(log.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            <span>•</span>
                            <span className="text-[#2BB794] font-semibold">{getRelativeTimeString(log.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {activityLog.length === 0 && (
                    <p className="text-slate-600 italic font-light text-xs py-1">No activities logged yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-[#090d16]">
          {isEdit ? (
            <button
              type="button"
              onClick={() => onDelete(job.id)}
              className="px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Application</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_15px_rgba(43,183,148,0.4)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
          >
            <Save className="h-4 w-4" />
            <span>{isEdit ? 'Save Changes' : 'Track Application'}</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
