import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, BarChart3, LogOut, Plus, RefreshCw, Briefcase, 
  User as UserIcon, CalendarDays, FileText, Rss, Search 
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import JobDrawer from './components/JobDrawer';
import RecruiterDashboard from './components/RecruiterDashboard';
import CalendarView from './components/CalendarView';
import ResumePortal from './components/ResumePortal';
import FeedPortal from './components/FeedPortal';
import JobDiscovery from './components/JobDiscovery';

const API_BASE = import.meta.env.VITE_API_BASE 
  ? `${import.meta.env.VITE_API_BASE}/api` 
  : typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/_/backend/api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('jobtrack_token'));
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('jobtrack_user');
      return cached && cached !== 'undefined' ? JSON.parse(cached) : null;
    } catch (err) {
      console.error('Error parsing cached user:', err);
      return null;
    }
  });

  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('board'); // 'board' | 'analytics' | 'calendar' | 'resume'
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [defaultDrawerStatus, setDefaultDrawerStatus] = useState('APPLIED');

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const filteredJobs = jobs.filter(job => {
    if (!appliedSearch) return true;
    const query = appliedSearch.toLowerCase().trim();
    return (
      job.company.toLowerCase().includes(query) ||
      job.role.toLowerCase().includes(query) ||
      (job.notes && job.notes.toLowerCase().includes(query)) ||
      (job.salary && job.salary.toLowerCase().includes(query))
    );
  });

  // Configure Axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchJobs();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (newToken, loggedInUser) => {
    localStorage.setItem('jobtrack_token', newToken);
    localStorage.setItem('jobtrack_user', JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('jobtrack_token');
    localStorage.removeItem('jobtrack_user');
    setToken(null);
    setUser(null);
    setJobs([]);
  };

  // Drag and Drop Update Status
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    const jobToUpdate = jobs.find(j => j.id === jobId);
    if (!jobToUpdate) return;

    // Optimistic UI Update
    const originalJobs = [...jobs];
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));

    try {
      await axios.put(`${API_BASE}/jobs/${jobId}`, { status: newStatus });
    } catch (err) {
      console.error('Update status error:', err);
      setJobs(originalJobs); // Rollback
    }
  };

  // Save (Create or Update)
  const handleSaveJob = async (jobPayload) => {
    try {
      if (jobPayload.id) {
        // Edit Mode
        const res = await axios.put(`${API_BASE}/jobs/${jobPayload.id}`, jobPayload);
        setJobs(jobs.map(j => j.id === jobPayload.id ? res.data : j));
      } else {
        // Create Mode
        const res = await axios.post(`${API_BASE}/jobs`, jobPayload);
        setJobs([res.data, ...jobs]);
      }
      setDrawerOpen(false);
      setSelectedJob(null);
    } catch (err) {
      console.error('Save job error:', err);
    }
  };

  // Delete
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;

    try {
      await axios.delete(`${API_BASE}/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
      setDrawerOpen(false);
      setSelectedJob(null);
    } catch (err) {
      console.error('Delete job error:', err);
    }
  };

  const openNewJobDrawer = (columnId = 'APPLIED') => {
    setDefaultDrawerStatus(columnId);
    setSelectedJob(null);
    setDrawerOpen(true);
  };

  const openEditJobDrawer = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  // Render Login/Signup screen if not authorized
  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Dual Role Routing: If recruiter, mount recruiter portal
  if (user?.role === 'RECRUITER') {
    return <RecruiterDashboard user={user} onLogout={handleLogout} />;
  }

  // User details
  const userName = user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col relative">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-15%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Premium Navbar */}
      <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-6 py-4 flex justify-between items-center shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl overflow-hidden shadow-md border border-[#2BB794]/20">
            <img src="/logo.png" alt="JobTrack Network Logo" className="h-full w-full object-cover animate-fadeIn" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1 select-none">
              <span className="font-light">Job</span>
              <span className="text-[#2BB794]">Track</span>
              <span className="text-[#ffd167] animate-pulse text-xs">✦</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold uppercase ml-1">
                Funnel
              </span>
            </h1>
          </div>
        </div>

        {/* Middle Toggle Tabs */}
        <nav className="flex bg-slate-950/60 border border-slate-800/80 p-1.5 rounded-2xl gap-1.5">
          <button
            onClick={() => setView('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'board'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Kanban Board</span>
          </button>
          
          <button
            onClick={() => setView('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'analytics'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'calendar'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setView('resume')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'resume'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>My CV</span>
          </button>

          <button
            onClick={() => setView('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'feed'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rss className="h-4 w-4" />
            <span>Community Feed</span>
          </button>

          <button
            onClick={() => setView('discovery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              view === 'discovery'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Job Discovery</span>
          </button>
        </nav>

        {/* Right side user segment */}
        <div className="flex items-center gap-4">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
            {/* User Avatar Initials */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#2BB794] to-[#10b981] text-white font-bold text-xs flex items-center justify-center shadow-md">
              {userInitials}
            </div>
            
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] text-slate-500 font-light truncate max-w-[100px]">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/0 hover:border-rose-500/10 rounded-xl transition-all shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full z-10">
        {/* Tab views layout */}
        {view === 'board' && (
          <div className="space-y-6">
            {/* Board Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Active Job Funnel</h2>
                <p className="text-slate-400 text-xs mt-1 font-light">
                  Manage your application process by dragging and dropping cards.
                </p>
              </div>

              {/* Modern Glassmorphic Search Bar with Click or Enter trigger */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 select-none">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setAppliedSearch(searchQuery);
                      }
                    }}
                    placeholder="Search by role, company, or notes..."
                    className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-light"
                  />
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-505" />
                </div>
                <button
                  onClick={() => setAppliedSearch(searchQuery)}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Search
                </button>
              </div>

              {jobs.length > 0 && (
                <button
                  onClick={() => openNewJobDrawer()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_15px_rgba(43,183,148,0.4)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Application</span>
                </button>
              )}
            </div>

            {appliedSearch && (
              <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-xl w-fit animate-fadeIn select-none">
                <span>Showing search results for: <strong className="text-purple-300">"{appliedSearch}"</strong> ({filteredJobs.length} found)</span>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setAppliedSearch('');
                  }}
                  className="ml-1 text-slate-500 hover:text-white cursor-pointer font-bold text-sm"
                >
                  ×
                </button>
              </div>
            )}

            <KanbanBoard 
              jobs={filteredJobs} 
              onUpdateJobStatus={handleUpdateJobStatus} 
              onSelectJob={openEditJobDrawer}
              onOpenNewJobModal={openNewJobDrawer}
            />
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header Section */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Funnel Insights & Analytics</h2>
              <p className="text-slate-400 text-xs mt-1 font-light">
                Analyze conversion rates, prospective earnings, and calendar goals.
              </p>
            </div>

            <Dashboard jobs={jobs} onSelectJob={openEditJobDrawer} />
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header Section */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Interview Calendar Grid</h2>
              <p className="text-slate-400 text-xs mt-1 font-light">
                View monthly agendas and check exact candidate follow-up schedules.
              </p>
            </div>

            <CalendarView jobs={jobs} onSelectJob={openEditJobDrawer} />
          </div>
        )}

        {view === 'resume' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active CV Resume Builder</h2>
              <p className="text-slate-400 text-xs mt-1 font-light">
                Configure your professional experience to impress recruiter applications and pass ATS filters.
              </p>
            </div>

            <ResumePortal />
          </div>
        )}

        {view === 'feed' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Community Hub & Feed</h2>
              <p className="text-slate-400 text-xs mt-1 font-light">
                Scroll updates, review advice, and apply to premium roles directly with verified recruiters.
              </p>
            </div>

            <FeedPortal 
              jobs={jobs} 
              onJobApplied={fetchJobs} 
              setView={setView} 
            />
          </div>
        )}

        {view === 'discovery' && (
          <div className="space-y-6">
            <JobDiscovery 
              jobs={jobs} 
              onJobAdded={fetchJobs} 
              setView={setView} 
            />
          </div>
        )}
      </main>

      {/* Slide-over Job Details Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <JobDrawer
            job={selectedJob}
            defaultStatus={defaultDrawerStatus}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedJob(null);
            }}
            onSave={handleSaveJob}
            onDelete={handleDeleteJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
