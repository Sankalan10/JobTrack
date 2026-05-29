import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Briefcase, Plus, Check, ExternalLink, Clock, Sparkles, 
  MapPin, Settings, Key, Info, HelpCircle, ShieldCheck, Database, Sliders, RotateCw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE 
  ? `${import.meta.env.VITE_API_BASE}/api` 
  : 'http://localhost:5000/api';

export default function JobDiscovery({ jobs, onJobAdded, setView }) {
  const [query, setQuery] = useState('React Developer');
  const [location, setLocation] = useState('Bangalore');
  const [country, setCountry] = useState('in'); // 'in' | 'us' | 'gb' | 'de' | 'ca'
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API credentials states
  const [showSettings, setShowSettings] = useState(false);
  const [appId, setAppId] = useState(() => localStorage.getItem('adzuna_app_id') || '');
  const [appKey, setAppKey] = useState(() => localStorage.getItem('adzuna_app_key') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Funnel tracking states
  const [addingJobId, setAddingJobId] = useState(null);

  // Default countries mapping
  const countries = [
    { code: 'in', name: 'India (Default)' },
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'de', name: 'Germany' },
    { code: 'ca', name: 'Canada' }
  ];

  // Perform search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const headers = {};
      if (appId.trim()) headers['x-adzuna-app-id'] = appId.trim();
      if (appKey.trim()) headers['x-adzuna-app-key'] = appKey.trim();

      const res = await axios.get(`${API_BASE}/jobs/search`, {
        params: {
          what: query,
          where: location,
          country: country,
          page: 1
        },
        headers
      });

      setResults(res.data || []);
    } catch (err) {
      console.error('Job search API error:', err);
      setError('Failed to fetch job opportunities. Utilizing fallback data.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial search on mount
  useEffect(() => {
    handleSearch();
  }, []);

  // Save custom credentials override
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    localStorage.setItem('adzuna_app_id', appId.trim());
    localStorage.setItem('adzuna_app_key', appKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    
    // Trigger fresh search with new credentials
    handleSearch();
  };

  // Clear credentials
  const handleClearCredentials = () => {
    localStorage.removeItem('adzuna_app_id');
    localStorage.removeItem('adzuna_app_key');
    setAppId('');
    setAppKey('');
    setShowSettings(false);
    handleSearch();
  };

  // Direct Funnel Track: Add to student's active jobs list
  const handleAddToFunnel = async (job) => {
    // Prevent double adding
    if (isJobTracked(job)) return;

    setAddingJobId(job.id);
    try {
      const parsedSalary = job.salary && job.salary !== 'Salary not listed' ? job.salary : '₹8,00,000 /yr (Est)';
      
      const payload = {
        company: job.company,
        role: job.title,
        descriptionUrl: job.url || '',
        salary: parsedSalary,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'APPLIED',
        notes: `Job discovered via Real-Time Discovery Portal.\nSource: ${job.id.startsWith('jbl') ? 'Jooble' : (job.id.startsWith('adz') ? 'Adzuna' : (job.id.startsWith('arb') ? 'Arbeitnow' : 'Curated Seed Pool'))}.\nPosted: ${new Date(job.created).toLocaleDateString()}`,
        checklist: [
          { id: '1', text: 'Tailor resume for keywords', done: false },
          { id: '2', text: 'Analyze CTC and take-home deductions', done: false },
          { id: '3', text: 'Schedule a recruiter introductory call', done: false },
          { id: '4', text: 'Prepare interview DSA mock worksheets', done: false }
        ]
      };

      await axios.post(`${API_BASE}/jobs`, payload);
      
      // Refresh user applications list
      if (onJobAdded) {
        await onJobAdded();
      }
    } catch (err) {
      console.error('Error adding job to funnel:', err);
      alert('Failed to add job to funnel. Please try again.');
    } finally {
      setAddingJobId(null);
    }
  };

  // Helper: check if a job is already added to Kanban board
  const isJobTracked = (job) => {
    return jobs.some(j => 
      j.company.toLowerCase().trim() === job.company.toLowerCase().trim() &&
      j.role.toLowerCase().trim() === job.title.toLowerCase().trim()
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 select-none">
            <Briefcase className="h-5 w-5 text-[#2BB794]" />
            <span>Job Discovery Center</span>
            <span className="text-[9px] bg-[#ffd167]/10 border border-[#ffd167]/20 text-[#ffd167] px-2 py-0.5 rounded font-black uppercase tracking-wider select-none animate-pulse">Real-Time Search</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-light">
            Search live job openings across premium developer networks and instantly funnel them directly onto your Kanban board.
          </p>
        </div>

        {/* API Settings toggle button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none ${
            appId.trim()
              ? 'bg-[#2BB794]/10 border-[#2BB794]/30 text-[#2BB794] hover:bg-[#2BB794]/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>API Credentials</span>
          {appId.trim() && <span className="h-1.5 w-1.5 rounded-full bg-[#2BB794]" />}
        </button>
      </div>

      {/* Collapse Credentials Settings panel */}
      {showSettings && (
        <div className="glass-card rounded-2xl border border-slate-800/80 p-5 space-y-4 text-left animate-fadeIn">
          <div className="flex items-start gap-3 border-b border-slate-800/60 pb-3">
            <div className="p-2 bg-[#2BB794]/15 border border-[#2BB794]/20 text-[#2BB794] rounded-xl shrink-0">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider leading-tight">Adzuna API Setup</h3>
              <p className="text-slate-500 text-[10px] font-light mt-0.5">Configure your custom Adzuna credentials to fetch direct real-world live jobs across search portals.</p>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adzuna App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="e.g. 5ae3c812"
                className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-850 focus:border-[#2BB794] rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-750 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adzuna App Key</label>
              <input
                type="password"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                placeholder="e.g. 84cb9128f72..."
                className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-850 focus:border-[#2BB794] rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-750 font-mono"
                required
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 border-t border-slate-900 mt-1">
              <span className="text-[10px] text-slate-500 font-light flex items-center gap-1.5 max-w-md leading-relaxed">
                <Info className="h-3.5 w-3.5 text-[#ffd167] shrink-0" />
                <span>
                  Register instantly for free keys at <a href="https://developer.adzuna.com/" target="_blank" rel="noopener noreferrer" className="text-[#2BB794] hover:underline font-semibold">developer.adzuna.com</a>. If keys are missing, we automatically switch back to keyless open endpoints or high-fidelity seeded simulations.
                </span>
              </span>

              <div className="flex gap-2 shrink-0 self-stretch sm:self-auto">
                {appId.trim() && (
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="flex-1 sm:flex-initial py-2 px-4 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Clear Credentials
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial py-2 px-5 bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#35c3a0] hover:to-[#12c48b] hover:shadow-[0_0_12px_rgba(43,183,148,0.35)] text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  {saveSuccess ? 'Saved & Synced!' : 'Save & Sync Key'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Search Panel Widget */}
      <form onSubmit={handleSearch} className="glass-card rounded-2xl p-5 border border-slate-800/80 shadow-lg relative overflow-hidden bg-gradient-to-tr from-indigo-950/15 via-[#0d1220]/60 to-[#0d1220]/60 text-left">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2BB794] via-[#ffd167] to-[#10b981]" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
          {/* Keyword Search */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1 leading-none select-none">
              <Sliders className="h-3 w-3 text-[#2BB794]" />
              <span>Job Role / Keyword</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React Developer, Backend Engineer"
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-650 font-medium"
                required
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-600" />
            </div>
          </div>

          {/* Location Search */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1 leading-none select-none">
              <MapPin className="h-3 w-3 text-[#ffd167]" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore, Delhi, Remote"
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-[#2BB794] rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-650 font-medium"
            />
          </div>

          {/* Country Selection */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1 leading-none select-none">
              <Database className="h-3 w-3 text-purple-400" />
              <span>Search Region</span>
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs font-semibold text-slate-300 bg-[#0f172a]/80 hover:bg-[#1e293b]/90 border border-slate-800 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all focus:outline-none focus:border-[#2BB794] appearance-none pr-8 font-mono"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232bb794' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem 1.25rem',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0b0f19] text-slate-350">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#35c3a0] hover:to-[#12c48b] text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.96] disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(43,183,148,0.2)]"
            >
              {loading ? (
                <RotateCw className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error state alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-300 text-xs font-light text-left flex items-center gap-2 select-none animate-fadeIn">
          <HelpCircle className="h-4 w-4 text-purple-400 shrink-0 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      {/* Results grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-10 w-10 rounded-full border-[3px] border-[#2BB794]/20 border-t-[#2BB794] animate-spin" />
            <p className="text-slate-500 text-xs font-light tracking-wide">Retrieving active positions across real job networks...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((job) => {
              const isAlreadyAdded = isJobTracked(job);
              const isAdding = addingJobId === job.id;
              
              // Identify feed source
              let sourceText = "Seeded Mock Feed";
              let sourceStyle = "bg-purple-500/10 border-purple-500/20 text-purple-400";
              let sourceIcon = <Database className="h-3 w-3" />;
              
              if (job.id.startsWith('jbl')) {
                sourceText = "Jooble Live Feed 💎";
                sourceStyle = "bg-[#ffd167]/10 border-[#ffd167]/25 text-[#ffd167]";
                sourceIcon = <Sparkles className="h-3 w-3 text-[#ffd167] animate-pulse" />;
              } else if (job.id.startsWith('adz')) {
                sourceText = "Adzuna Live Feed";
                sourceStyle = "bg-[#2BB794]/10 border-[#2BB794]/20 text-[#2BB794]";
                sourceIcon = <ShieldCheck className="h-3 w-3 text-[#2BB794]" />;
              } else if (job.id.startsWith('arb')) {
                sourceText = "Arbeitnow Open Feed";
                sourceStyle = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                sourceIcon = <ExternalLink className="h-3 w-3" />;
              }

              return (
                <div 
                  key={job.id} 
                  className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 relative group text-left"
                >
                  <div className="space-y-3.5">
                    {/* Source tag & created time */}
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider select-none ${sourceStyle}`}>
                        {sourceIcon}
                        <span>{sourceText}</span>
                      </span>
                      
                      <div className="flex items-center gap-1 text-[10px] text-slate-505 font-mono">
                        <Clock className="h-3 w-3 text-slate-505" />
                        <span>{new Date(job.created).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Main Company & Role Info */}
                    <div className="flex gap-3 pl-0.5">
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner shrink-0 mt-0.5">
                        {job.logoUrl ? (
                          <img 
                            src={job.logoUrl} 
                            alt={`${job.company} Favicon`} 
                            className="h-6 w-6 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Briefcase className="h-5 w-5 text-slate-750" />
                        )}
                      </div>
                      
                      <div className="space-y-0.5 overflow-hidden">
                        <h4 className="font-bold text-sm text-white truncate group-hover:text-[#2BB794] transition-colors leading-snug">{job.title}</h4>
                        <p className="text-xs font-semibold text-slate-350 truncate">{job.company}</p>
                      </div>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed line-clamp-3 pl-0.5">
                      {job.description}
                    </p>

                    {/* Specifications list (Location & Salary) */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10.5px] font-mono text-slate-450 border-t border-slate-900 pt-3 pl-0.5 select-none">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#2BB794]" />
                        <span className="truncate max-w-[150px]">{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Sparkles className="h-3.5 w-3.5 text-[#ffd167] animate-pulse" />
                        <span>{job.salary}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Suite */}
                  <div className="flex gap-2.5 pt-4 border-t border-slate-900/50 mt-4 select-none">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-350 hover:text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <span>View Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    {isAlreadyAdded ? (
                      <button
                        disabled
                        className="flex-1 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[10px] font-black rounded-lg flex items-center justify-center gap-1 cursor-default"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Funnel Tracked</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToFunnel(job)}
                        disabled={isAdding}
                        className="flex-1 py-1.5 px-3 bg-[#2BB794] hover:bg-[#208c70] text-slate-950 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(43,183,148,0.25)] active:scale-[0.97]"
                      >
                        {isAdding ? (
                          <RotateCw className="h-3 w-3 animate-spin text-slate-950" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add to Funnel</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 animate-pulse">
              <Search className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-white font-semibold">No Results Found</p>
              <p className="text-slate-500 text-xs font-light max-w-sm">
                We couldn't find any active job postings matching **"{query}"** in **"{location}"**. Try broadening your keywords or updating region filters!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
