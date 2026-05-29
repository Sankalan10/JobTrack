import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Building2, Users, Calendar, Award, BarChart3, LogOut, CheckCircle2, 
  XCircle, Clock, ChevronDown, ChevronUp, Link as LinkIcon, Sparkles, ExternalLink, CalendarDays, Check, X, FileText, Printer, Download, Search, Send, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

export default function RecruiterDashboard({ user, onLogout }) {
  const companiesList = useMemo(() => user?.company ? user.company.split(',').map(c => c.trim()) : [], [user]);
  const [activeCompany, setActiveCompany] = useState(() => companiesList[0] || 'Company');
  const recruiterName = user?.name || 'Recruiter';

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

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // ID of expanded job

  // Feature 2: Broadcast Engagement Analytics
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Feature 3: Simulated Virtual Mock Interview Workspace
  const [selectedVirtualJob, setSelectedVirtualJob] = useState(null);
  const [virtualCodeInput, setVirtualCodeInput] = useState('// Write collaborative mock interview solutions here\nfunction resolveMatchScore(candidate) {\n  console.log("Evaluating DSA pipelines...");\n  return 100;\n}');
  const [virtualChatMessages, setVirtualChatMessages] = useState([
    { id: 'vc1', author: 'JobTrack System', text: 'Virtual mock interview session initialized. Recruiter is online.', isSystem: true },
    { id: 'vc2', author: 'Akash Das (Candidate)', text: 'Good evening! Ready to review systems architecture queries.', isRecruiter: false }
  ]);
  const [virtualChatInput, setVirtualChatInput] = useState('');

  // Feature 4: Collaborative Talent Ratings & Notes Log
  const [feedbackDSA, setFeedbackDSA] = useState(0);
  const [feedbackSysDesign, setFeedbackSysDesign] = useState(0);
  const [feedbackComm, setFeedbackComm] = useState(0);
  const [feedbackNewNote, setFeedbackNewNote] = useState('');
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  // Sync Ratings & Notes when row is expanded
  useEffect(() => {
    if (expandedRow) {
      const activeJob = applicants.find(j => j.id === expandedRow);
      if (activeJob) {
        let currentFeedback = {};
        try {
          currentFeedback = JSON.parse(activeJob.recruiterFeedback || '{}');
        } catch (e) {
          currentFeedback = {};
        }
        const ratings = currentFeedback.ratings || { dsa: 0, systemDesign: 0, communication: 0 };
        setFeedbackDSA(ratings.dsa || 0);
        setFeedbackSysDesign(ratings.systemDesign || 0);
        setFeedbackComm(ratings.communication || 0);
        setFeedbackNewNote('');
      }
    }
  }, [expandedRow, applicants]);

  // Recruiter Search States
  const [recruiterSearchQuery, setRecruiterSearchQuery] = useState('');
  const [appliedRecruiterSearch, setAppliedRecruiterSearch] = useState('');

  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      if (!appliedRecruiterSearch) return true;
      const query = appliedRecruiterSearch.toLowerCase().trim();
      const applicantUser = applicant.user || { name: '', email: '' };
      return (
        applicantUser.name.toLowerCase().includes(query) ||
        applicantUser.email.toLowerCase().includes(query) ||
        applicant.role.toLowerCase().includes(query) ||
        (applicant.notes && applicant.notes.toLowerCase().includes(query)) ||
        (applicantUser.resumeData && applicantUser.resumeData.toLowerCase().includes(query))
      );
    });
  }, [applicants, appliedRecruiterSearch]);

  // Post publisher states
  const [postContent, setPostContent] = useState('');
  const [linkJobPosition, setLinkJobPosition] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState('/generic_hiring_banner.png');

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPublishing(true);
    try {
      const payload = {
        content: postContent,
        roleLink: linkJobPosition ? { company: activeCompany, role: jobPosition } : null,
        postImage: selectedBanner || null
      };

      await axios.post(`${API_BASE}/posts`, payload);
      setPublishSuccess(true);
      setPostContent('');
      setJobPosition('');
      setLinkJobPosition(false);
      setSelectedBanner('/generic_hiring_banner.png');
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish recruitment update. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Resume Viewer Modal states
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  const handleOpenResumeModal = (candidate) => {
    setViewingCandidate(candidate);
    setResumeModalOpen(true);
  };

  const handleCloseResumeModal = () => {
    setViewingCandidate(null);
    setResumeModalOpen(false);
  };

  const downloadCandidateDocx = (candidate) => {
    if (!candidate || !candidate.resumeData) return;
    const parsed = JSON.parse(candidate.resumeData);
    const name = candidate.name || 'Candidate';
    const email = candidate.email || 'N/A';
    const summary = parsed.summary || '';
    const education = parsed.education || [];
    const experience = parsed.experience || [];
    const skills = parsed.skills || [];
    const projects = parsed.projects || [];
    const escapedName = name.replace(/\s+/g, '_');

    const htmlString = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Resume_${name}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.25; color: #222222; margin: 1in; }
          h1 { font-size: 20pt; text-align: center; color: #1e3a8a; margin-bottom: 2pt; font-weight: bold; }
          .subtitle { text-align: center; font-size: 10pt; color: #555555; margin-bottom: 15pt; }
          h2 { font-size: 12pt; border-bottom: 1.5pt solid #1e3a8a; color: #1e3a8a; text-transform: uppercase; margin-top: 15pt; margin-bottom: 6pt; font-weight: bold; padding-bottom: 2pt; }
          .section { margin-bottom: 10pt; }
          .item-title { font-weight: bold; font-size: 11pt; }
          .item-meta { color: #555555; float: right; font-size: 10pt; font-style: italic; }
          .item-desc { font-size: 10.5pt; color: #333333; margin-top: 2pt; margin-bottom: 6pt; }
          ul { margin-top: 2pt; margin-bottom: 6pt; padding-left: 20px; }
          li { font-size: 10pt; color: #333333; margin-bottom: 2pt; }
          .skills-list { font-size: 10pt; font-weight: bold; color: #222222; }
        </style>
      </head>
      <body>
        <h1>${name.toUpperCase()}</h1>
        <div class="subtitle">Email: ${email} | Platform: JobTrack Candidate Database</div>

        <h2>Professional Summary</h2>
        <div class="section">${summary || 'No summary entered.'}</div>

        <h2>Work Experience</h2>
        ${experience.map(exp => `
          <div class="section">
            <div>
              <span class="item-title">${exp.role || 'Role'}</span> - <span style="font-weight:bold; font-style:italic;">${exp.company || 'Company'}</span>
              <span class="item-meta">${exp.duration || 'Duration'}</span>
            </div>
            <ul>
              ${exp.highlights.map(hl => `<li>${hl || 'Detail highlight'}</li>`).join('')}
            </ul>
          </div>
        `).join('')}

        <h2>Education Background</h2>
        ${education.map(edu => `
          <div class="section">
            <div>
              <span class="item-title">${edu.degree || 'Degree'}</span>
              <span class="item-meta">${edu.year || 'Year'}</span>
            </div>
            <div style="font-style:italic; font-size: 10.5pt;">${edu.school || 'School'}</div>
            <div style="font-size: 9.5pt; font-weight:bold; color: #1e3a8a;">GPA/Score: ${edu.gpa || 'N/A'}</div>
          </div>
        `).join('')}

        <h2>Featured Projects</h2>
        ${projects.map(proj => `
          <div class="section">
            <div>
              <span class="item-title">${proj.name || 'Project Name'}</span>
              <span class="item-meta">Technologies: ${(proj.tech || []).join(', ')}</span>
            </div>
            <div class="item-desc">${proj.desc || 'Project description details.'}</div>
          </div>
        `).join('')}

        <h2>Core Skills and Expertise</h2>
        <div class="section skills-list">${skills.join(', ')}</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlString], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${escapedName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printCandidatePdf = (candidate) => {
    if (!candidate || !candidate.resumeData) return;
    const parsed = JSON.parse(candidate.resumeData);
    const name = candidate.name || 'Candidate';
    const email = candidate.email || 'N/A';
    const summary = parsed.summary || '';
    const education = parsed.education || [];
    const experience = parsed.experience || [];
    const skills = parsed.skills || [];
    const projects = parsed.projects || [];
    
    const htmlString = `
      <html>
      <head>
        <title>Resume_${name}</title>
        <style>
          body { 
            font-family: 'Outfit', 'Inter', 'Calibri', 'Arial', sans-serif; 
            font-size: 11pt; 
            line-height: 1.4; 
            color: #1a202c; 
            margin: 0.75in; 
            background: #ffffff;
          }
          .header { 
            text-align: center; 
            padding-bottom: 15px; 
            border-bottom: 2px solid #1e3a8a; 
            margin-bottom: 20px;
          }
          h1 { 
            font-size: 24pt; 
            color: #1e3a8a; 
            margin: 0 0 4px 0; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: -0.5px;
          }
          .subtitle { 
            font-size: 10pt; 
            color: #4a5568; 
            font-family: monospace;
          }
          h2 { 
            font-size: 13pt; 
            border-bottom: 1.5px solid #1e3a8a; 
            color: #1e3a8a; 
            text-transform: uppercase; 
            margin-top: 20px; 
            margin-bottom: 10px; 
            font-weight: 700; 
            padding-bottom: 4px; 
          }
          .section { 
            margin-bottom: 12px; 
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 2px;
          }
          .item-title { 
            font-size: 11pt; 
          }
          .item-company {
            font-style: italic;
            color: #1e3a8a;
          }
          .item-meta { 
            color: #718096; 
            font-size: 9.5pt; 
            font-style: italic; 
            font-family: monospace;
          }
          .item-desc { 
            font-size: 10pt; 
            color: #4a5568; 
            margin-top: 4px; 
            margin-bottom: 8px; 
            font-weight: 300;
          }
          ul { 
            margin-top: 4px; 
            margin-bottom: 8px; 
            padding-left: 20px; 
          }
          li { 
            font-size: 10pt; 
            color: #4a5568; 
            margin-bottom: 3px; 
            font-weight: 300;
          }
          .skills-list { 
            font-size: 10.5pt; 
            font-weight: 600; 
            color: #2d3748; 
            font-family: monospace;
            letter-spacing: 0.5px;
          }
          @media print {
            body { margin: 0.4in; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${name}</h1>
          <div class="subtitle">Email: ${email} | Verified Platform Candidate Portfolio</div>
        </div>

        <h2>Professional Summary</h2>
        <div class="section" style="font-weight: 300; font-size: 10.5pt; color: #4a5568; white-space: pre-line;">
          ${summary || 'No professional summary provided.'}
        </div>

        <h2>Work Experience</h2>
        ${experience && experience.length > 0 ? experience.map(exp => `
          <div class="section">
            <div class="item-row">
              <span class="item-title">${exp.role || 'Role'} at <span class="item-company">${exp.company || 'Company'}</span></span>
              <span class="item-meta">${exp.duration || 'Duration'}</span>
            </div>
            <ul>
              ${exp.highlights ? exp.highlights.map(hl => hl ? `<li>${hl}</li>` : '').join('') : ''}
            </ul>
          </div>
        `).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No professional experience listed.</div>'}

        <h2>Education Background</h2>
        ${education && education.length > 0 ? education.map(edu => `
          <div class="section">
            <div class="item-row">
              <span class="item-title">${edu.degree || 'Degree'}</span>
              <span class="item-meta">${edu.year || 'Year'}</span>
            </div>
            <div class="item-row" style="font-weight: normal; margin-top: 2px;">
              <span style="font-style: italic; color: #1e3a8a; font-size: 10pt;">${edu.school || 'School'}</span>
              <span style="font-size: 9.5pt; font-weight: bold; color: #1e3a8a;">GPA/CGPA: ${edu.gpa || 'N/A'}</span>
            </div>
          </div>
        `).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No education details specified.</div>'}

        <h2>Featured Projects</h2>
        ${projects && projects.length > 0 ? projects.map(proj => `
          <div class="section">
            <div class="item-row">
              <span class="item-title">${proj.name || 'Project Name'}</span>
              <span class="item-meta">Technologies: ${(proj.tech || []).join(' | ')}</span>
            </div>
            <div class="item-desc">${proj.desc || ''}</div>
          </div>
        `).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No projects added.</div>'}

        <h2>Core Skills and Expertise</h2>
        <div class="section skills-list">
          ${skills && skills.length > 0 ? skills.join(' | ') : 'No skills listed.'}
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(htmlString);
    printWindow.document.close();
  };
  
  // Date scheduling modal states
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [schedulingJob, setSchedulingJob] = useState(null);
  const [interviewDateInput, setInterviewDateInput] = useState('');

  useEffect(() => {
    if (activeCompany) {
      fetchApplicants();
    }
  }, [activeCompany]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/recruiter?company=${encodeURIComponent(activeCompany)}`);
      setApplicants(res.data);
    } catch (err) {
      console.error('Fetch applicants error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Recruiter actions updates
  const handleUpdateStatus = async (jobId, newStatus, dateVal = null) => {
    try {
      const payload = { status: newStatus };
      if (dateVal) {
        payload.interviewDate = dateVal;
      }
      
      const res = await axios.put(`${API_BASE}/jobs/recruiter/${jobId}`, payload);
      
      // Update local state
      setApplicants(applicants.map(app => app.id === jobId ? res.data : app));
      
      // Close scheduler if open
      setSchedulerOpen(false);
      setSchedulingJob(null);
      setInterviewDateInput('');
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update candidate status.');
    }
  };

  const handleSubmitFeedback = async (jobId) => {
    if (feedbackDSA < 0 || feedbackDSA > 5 || feedbackSysDesign < 0 || feedbackSysDesign > 5 || feedbackComm < 0 || feedbackComm > 5) {
      alert('Ratings must be between 0 and 5.');
      return;
    }

    setSubmittingFeedbackId(jobId);
    try {
      const payload = {
        ratings: {
          dsa: parseFloat(feedbackDSA),
          systemDesign: parseFloat(feedbackSysDesign),
          communication: parseFloat(feedbackComm)
        },
        newNote: feedbackNewNote
      };

      const res = await axios.put(`${API_BASE}/jobs/recruiter/${jobId}`, payload);
      setApplicants(applicants.map(app => app.id === jobId ? res.data : app));
      setFeedbackNewNote('');
      alert('Assessment feedback registered successfully!');
    } catch (err) {
      console.error('Submit feedback error:', err);
      alert('Failed to save assessment feedback.');
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  const openInterviewScheduler = (job) => {
    setSchedulingJob(job);
    setInterviewDateInput(job.interviewDate || '');
    setSchedulerOpen(true);
  };

  // Memoized stats calculation
  const stats = useMemo(() => {
    const total = applicants.length;
    const interviewing = applicants.filter(a => a.status === 'INTERVIEWING').length;
    const offered = applicants.filter(a => a.status === 'OFFERED').length;
    
    // Average Match Score
    let scoreSum = 0;
    let scoredCount = 0;
    applicants.forEach(a => {
      try {
        const matchData = typeof a.resumeMatcherData === 'string' 
          ? JSON.parse(a.resumeMatcherData || '{}') 
          : a.resumeMatcherData || {};
        if (matchData.matchScore !== undefined && matchData.matchScore !== null) {
          scoreSum += matchData.matchScore;
          scoredCount++;
        }
      } catch(e) {}
    });

    const averageMatch = scoredCount > 0 ? Math.round(scoreSum / scoredCount) : 0;

    return { total, interviewing, offered, averageMatch };
  }, [applicants]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col relative">
      {/* Background Neon Blurs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-purple-900/10 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-900/10 blur-[110px] pointer-events-none" />

      {/* Recruiter Navbar */}
      <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-6 py-4 flex justify-between items-center shadow-lg">
        {/* Brand */}
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
                Recruiter
              </span>
            </h1>
          </div>
        </div>

        {/* Recruiter represented company selector */}
        {companiesList.length > 1 ? (
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Representing:</span>
            <div className="relative">
              <select
                value={activeCompany}
                onChange={(e) => {
                  setActiveCompany(e.target.value);
                  setExpandedRow(null);
                }}
                className="text-xs font-semibold text-purple-300 bg-[#0f172a]/80 hover:bg-[#1e293b]/90 border border-purple-500/20 px-3.5 py-2 rounded-xl cursor-pointer transition-all focus:outline-none focus:border-purple-400 appearance-none pr-8 hover:shadow-[0_0_12px_rgba(43,183,148,0.15)] font-mono font-bold"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232bb794' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.25rem 1.25rem',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {companiesList.map(c => (
                  <option key={c} value={c} className="bg-[#0f172a] text-slate-300 font-semibold">{c}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 select-none font-mono">
            <Building2 className="h-4 w-4 shrink-0 text-purple-400" />
            <span>Representing: {activeCompany}</span>
          </div>
        )}

        {/* Right Session Segment */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 pl-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#2BB794] to-[#10b981] text-white font-bold text-xs flex items-center justify-center shadow-md">
              {activeCompany.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{recruiterName}</p>
              <p className="text-[10px] text-slate-500 font-light truncate max-w-[100px]">Recruiter</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/0 hover:border-rose-500/10 rounded-xl transition-all shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Recruiter Content Panel */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full z-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{activeCompany} Applicant Portal</h2>
          <p className="text-slate-400 text-xs mt-1 font-light">
            Monitor incoming job applications, view candidate ATS match scores, and coordinate stages.
          </p>
        </div>

        {/* Recruiter Metric Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Applicants</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Interviews Set</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.interviewing}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Offers Granted</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.offered}</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg Match Index</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.averageMatch}%</h3>
            </div>
          </div>
        </div>

        {/* Feature 2: Recruiter Broadcast Engagement Analytics Dashboard */}
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg animate-fadeIn">
          <div 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-900/20 transition-all select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#2BB794]/10 border border-[#2BB794]/20 text-[#2BB794] rounded-xl shadow-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>My Broadcast Engagement Analytics</span>
                  <span className="text-[8px] bg-[#ffd167]/10 border border-[#ffd167]/20 text-[#ffd167] px-2 py-0.5 rounded font-black uppercase tracking-wider">Live Sim</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 font-light">Monitor social stream view counters, applies generated, and candidate interaction rates.</p>
              </div>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 rounded-lg transition-all cursor-pointer">
              {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showAnalytics && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className="p-5 border-t border-slate-800/60 bg-slate-950/20 space-y-6">
                  {/* Grid of Micro stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    <div className="bg-[#0b0f19]/60 border border-slate-800/60 p-4 rounded-xl relative overflow-hidden">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Announcements</span>
                      <span className="block text-xl font-bold text-white mt-1">3 Active</span>
                      <span className="block text-[9px] text-[#2BB794] mt-1 font-semibold">100% Verified represent</span>
                    </div>
                    <div className="bg-[#0b0f19]/60 border border-slate-800/60 p-4 rounded-xl relative overflow-hidden">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Post Views</span>
                      <span className="block text-xl font-bold text-slate-100 mt-1">456 Views</span>
                      <span className="block text-[9px] text-emerald-400 mt-1 font-semibold">↑ 18% this week</span>
                    </div>
                    <div className="bg-[#0b0f19]/60 border border-slate-800/60 p-4 rounded-xl relative overflow-hidden">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Direct Applies</span>
                      <span className="block text-xl font-bold text-slate-100 mt-1">14 Tracked</span>
                      <span className="block text-[9px] text-[#2BB794] mt-1 font-semibold">3.1% Conversion Rate</span>
                    </div>
                    <div className="bg-[#0b0f19]/60 border border-slate-800/60 p-4 rounded-xl relative overflow-hidden">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Interaction Score</span>
                      <span className="block text-xl font-bold text-[#ffd167] mt-1">98.4 Rating</span>
                      <span className="block text-[9px] text-[#ffd167] mt-1 font-semibold">High candidate interest</span>
                    </div>
                  </div>

                  {/* Simulated engagement timeline graph */}
                  <div className="bg-[#0b0f19]/60 border border-slate-800/60 p-4 rounded-xl text-left space-y-3.5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-slate-300">Weekly Broadcast Views & Applies Funnel</h4>
                      <div className="flex gap-4 text-[10px] select-none font-semibold">
                        <span className="flex items-center gap-1.5 text-blue-450"><span className="h-2 w-2 rounded bg-blue-500" /> Impressions</span>
                        <span className="flex items-center gap-1.5 text-[#2BB794]"><span className="h-2 w-2 rounded bg-[#2BB794]" /> Funnel Applies</span>
                      </div>
                    </div>

                    <div className="h-24 flex items-end gap-3.5 pt-4 px-2 border-b border-slate-800/40 relative">
                      {[
                        { day: 'Mon', views: 32, applies: 2 },
                        { day: 'Tue', views: 56, applies: 4 },
                        { day: 'Wed', views: 88, applies: 7 },
                        { day: 'Thu', views: 124, applies: 9 },
                        { day: 'Fri', views: 98, applies: 6 },
                        { day: 'Sat', views: 45, applies: 3 },
                        { day: 'Sun', views: 62, applies: 5 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-help">
                          <div className="w-full flex items-end gap-1 h-full relative justify-center">
                            {/* Views bar */}
                            <div 
                              style={{ height: `${(item.views/124)*100}%` }} 
                              className="w-3.5 bg-blue-500/20 hover:bg-blue-500/40 border-t border-blue-500 rounded-t transition-all relative"
                            >
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] p-1 rounded border border-slate-800 shadow opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none">{item.views} views</span>
                            </div>
                            {/* Applies bar */}
                            <div 
                              style={{ height: `${(item.applies/9)*100}%` }} 
                              className="w-3.5 bg-[#2BB794]/25 hover:bg-[#2BB794]/55 border-t border-[#2BB794] rounded-t transition-all relative"
                            >
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] p-1 rounded border border-slate-800 shadow opacity-0 group-hover:opacity-100 transition-all z-10 pointer-events-none">{item.applies} applies</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold mt-1 select-none">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature 3: Recruiter Daily Interview Planner */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-left">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2BB794]" />
                <span>Today's Interview Schedule Agenda</span>
              </h3>
              <p className="text-slate-500 text-[10px] font-light mt-0.5">Chronologically ordered upcoming mock assessments for represented companies.</p>
            </div>
          </div>

          {applicants.filter(a => a.status === 'INTERVIEWING' && a.interviewDate).length === 0 ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 text-center text-slate-400 text-xs font-light">
              No interviews scheduled for today. Set up schedules by clicking "Schedule" on candidate profiles below!
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 pr-2 scrollbar-thin select-none">
              {applicants.filter(a => a.status === 'INTERVIEWING' && a.interviewDate).map((app) => (
                <div 
                  key={app.id} 
                  className="glass-card rounded-2xl p-4.5 border border-slate-800/90 w-72 shrink-0 text-left space-y-3 bg-[#0d1322]/80 relative overflow-hidden group hover:border-[#2BB794]/30"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#2BB794] to-[#10b981]" />
                  
                  <div className="flex justify-between items-start pl-1.5">
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{app.user?.name || 'Candidate'}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[160px] mt-0.5">{app.user?.email}</p>
                    </div>
                    <span className="text-[9px] bg-[#2BB794]/10 border border-[#2BB794]/20 text-[#2BB794] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg select-none truncate max-w-[90px]">
                      {app.role}
                    </span>
                  </div>

                  <div className="bg-[#0b0f19]/60 border border-slate-850 p-2.5 rounded-xl pl-3 flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-[#ffd167] shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Schedule Time</span>
                      <span className="block text-xs font-bold text-slate-200 mt-1">{new Date(app.interviewDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at 4:30 PM</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedVirtualJob(app);
                      setVirtualChatMessages([
                        { id: 'vc1', author: 'JobTrack System', text: `Virtual interview session initialized for ${app.user?.name || 'Candidate'}.`, isSystem: true },
                        { id: 'vc2', author: `${app.user?.name || 'Candidate'}`, text: `Good evening ${recruiterName}! Excited to walk through my resume and coding requirements.`, isRecruiter: false }
                      ]);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-[#2BB794]/30 text-slate-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-[#2BB794]/10 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#2BB794]" />
                    <span>Launch Virtual Room</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Hiring Update Widget */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800/80 relative overflow-hidden shadow-lg bg-gradient-to-tr from-indigo-950/15 via-[#0d1220]/60 to-[#0d1220]/60">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2BB794] via-[#ffd167] to-[#10b981]" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                <span>Publish Hiring Broadcast</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 font-light">
                Broadcast announcements, stipends/salary metrics, or screening tips directly to candidate social feeds.
              </p>
            </div>
            
            {publishSuccess && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl animate-bounce">
                Broadcast Live in Candidate Feeds! 🚀
              </span>
            )}
          </div>

          <form onSubmit={handlePublishPost} className="space-y-4">
            <div className="relative">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`Type your recruitment update here... (e.g., "Exciting update! ${activeCompany} is opening direct tracks for SDE Interns. Stipend offered: ₹95k/mo. Focus is on Javascript and DSA! Apply below.")`}
                className="w-full h-24 bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/80 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 resize-none font-light leading-relaxed"
                required
              />
            </div>

            {/* Premium Post Banner Graphic Selector */}
            <div className="space-y-2 text-left animate-fadeIn">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block select-none">Select Broadcast Banner Graphic</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { name: 'Workspace', path: '/google_careers_banner.png', label: 'Google' },
                  { name: 'Security', path: '/stripe_security_banner.png', label: 'Stripe' },
                  { name: 'App Mock', path: '/swiggy_frontend_banner.png', label: 'Swiggy' },
                  { name: 'Metallic', path: '/cred_ios_banner.png', label: 'CRED' },
                  { name: 'Analytics', path: '/zomato_apm_banner.png', label: 'Zomato' },
                  { name: 'Tech Nodes', path: '/generic_hiring_banner.png', label: 'Generic' },
                  { name: 'Text Only', path: '', label: 'None' }
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedBanner(item.path)}
                    className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold text-center truncate transition-all cursor-pointer select-none ${
                      selectedBanner === item.path
                        ? 'bg-purple-600/10 border-purple-500/30 text-purple-300 shadow-sm shadow-purple-950/30'
                        : 'bg-slate-950/50 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <label className="relative flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkJobPosition}
                    onChange={(e) => setLinkJobPosition(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-900 border border-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 transition-all" />
                  <span className="text-xs font-semibold text-slate-300">Link Featured Job Position</span>
                </label>
              </div>

              {linkJobPosition && (
                <div className="flex items-center gap-2 w-full md:w-auto animate-fadeIn">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider shrink-0">Company: {activeCompany} | Role:</span>
                  <input
                    type="text"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="bg-slate-950/50 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/85 px-3 py-1.5 rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 w-full md:w-60 font-medium"
                    required={linkJobPosition}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={publishing || !postContent.trim()}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_15px_rgba(43,183,148,0.4)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0 self-stretch md:self-auto"
              >
                {publishing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Broadcast</span>
                    <svg className="h-3.5 w-3.5 transform rotate-45 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Expandable Applicant Table Panel */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800/80">
          <div className="p-5 border-b border-slate-800/80 bg-[#0c1220]/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Candidates Applied for {activeCompany}</h3>
              <p className="text-[10px] text-slate-505 font-light mt-0.5">Filter by candidate name, position, email, or resume keywords</p>
            </div>

            {/* Recruiter Search Suite */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 select-none">
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={recruiterSearchQuery}
                  onChange={(e) => setRecruiterSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedRecruiterSearch(recruiterSearchQuery);
                    }
                  }}
                  placeholder="Search candidates..."
                  className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-650 font-light"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-505" />
              </div>
              <button
                onClick={() => setAppliedRecruiterSearch(recruiterSearchQuery)}
                className="py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
              >
                Search
              </button>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md shrink-0">
                {filteredApplicants.length} Total
              </span>
            </div>
          </div>

          {appliedRecruiterSearch && (
            <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/5 border border-purple-500/10 px-3.5 py-2 rounded-xl w-fit mx-6 mt-4 select-none animate-fadeIn">
              <span>Showing applicant results for: <strong className="text-purple-300">"{appliedRecruiterSearch}"</strong> ({filteredApplicants.length} found)</span>
              <button 
                onClick={() => {
                  setRecruiterSearchQuery('');
                  setAppliedRecruiterSearch('');
                }}
                className="ml-1 text-slate-500 hover:text-white cursor-pointer font-bold text-sm"
              >
                ×
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            {filteredApplicants.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/30 text-slate-400 font-medium select-none">
                    <th className="py-4 px-5">Candidate</th>
                    <th className="py-4 px-5">Position Applied</th>
                    <th className="py-4 px-5 text-center">ATS Match Index</th>
                    <th className="py-4 px-5 text-center">Current Status</th>
                    <th className="py-4 px-5">Interview Schedule</th>
                    <th className="py-4 px-5 text-right pr-6">Action Suite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredApplicants.map((job) => {
                    const isExpanded = expandedRow === job.id;
                    const applicantUser = job.user || { name: 'Unknown Candidate', email: 'unknown@email.com' };

                    // Parse resume match score
                    let parsedScore = null;
                    let parsedMatch = {};
                    try {
                      parsedMatch = typeof job.resumeMatcherData === 'string' 
                        ? JSON.parse(job.resumeMatcherData || '{}') 
                        : job.resumeMatcherData || {};
                      parsedScore = parsedMatch.matchScore !== undefined ? parsedMatch.matchScore : null;
                    } catch(e) {}

                    // Parse checklist details
                    let checklistItems = [];
                    try {
                      checklistItems = typeof job.checklist === 'string' ? JSON.parse(job.checklist) : job.checklist || [];
                    } catch(e) {}
                    
                    const completedTasks = checklistItems.filter(t => t.done).length;

                    // Parse activity logs
                    let timelineLogs = [];
                    try {
                      timelineLogs = typeof job.activityLog === 'string' ? JSON.parse(job.activityLog) : job.activityLog || [];
                    } catch(e) {}

                    return (
                      <React.Fragment key={job.id}>
                        {/* Table Row */}
                        <tr 
                          onClick={() => toggleRow(job.id)}
                          className={`hover:bg-slate-900/20 cursor-pointer transition-colors ${
                            isExpanded ? 'bg-slate-900/30' : ''
                          }`}
                        >
                          <td className="py-4 px-5 font-semibold text-white">
                            <div>
                              <p className="text-sm font-semibold">{applicantUser.name}</p>
                              <p className="text-[10px] text-slate-500 font-light mt-0.5">{applicantUser.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-slate-300 font-medium">{job.role}</td>
                          <td className="py-4 px-5 text-center">
                            {parsedScore !== null ? (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                parsedScore >= 70 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                  : parsedScore >= 40 
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              }`}>
                                <Sparkles className="h-3 w-3 shrink-0 mr-1" />
                                {parsedScore}% Match
                              </span>
                            ) : (
                              <span className="text-slate-600 font-light italic">No Scan Yet</span>
                            )}
                          </td>
                           <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${
                              job.status === 'OFFERED' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                              job.status === 'INTERVIEWING' ? 'bg-[#2BB794]/15 border-[#2BB794]/30 text-[#2BB794]' :
                              job.status === 'REJECTED' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                              'bg-blue-500/15 border-blue-500/30 text-blue-400'
                            }`}>
                              {job.status === 'APPLIED' ? 'Applied' :
                               job.status === 'INTERVIEWING' ? 'Interview Scheduled' :
                               job.status === 'OFFERED' ? 'Offer Extended' : 'Rejected'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-400 font-light">
                            {job.interviewDate ? (
                              <span className="flex items-center gap-1.5 text-[#2BB794] font-semibold">
                                <CalendarDays className="h-3.5 w-3.5 text-[#2BB794] shrink-0" />
                                <span>{new Date(job.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </span>
                            ) : (
                              <span className="text-slate-600 font-extralight italic">Not scheduled</span>
                            )}
                          </td>
                          <td className="py-4 px-5 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2.5 justify-end">
                              {/* Schedule Action */}
                              <button
                                onClick={() => openInterviewScheduler(job)}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-[#2BB794]/40 text-[#2BB794] hover:text-[#38cfab] text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(43,183,148,0.15)]"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Schedule</span>
                              </button>

                              {/* Offer Action */}
                              {job.status !== 'OFFERED' && (
                                <button
                                  onClick={() => handleUpdateStatus(job.id, 'OFFERED')}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/0 hover:border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                                  title="Extend Offer"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}

                              {/* Reject Action */}
                              {job.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleUpdateStatus(job.id, 'REJECTED')}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/0 hover:border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                                  title="Reject Candidate"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}

                              {/* Collapse Selector arrow */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(job.id);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-200 self-center transition-colors cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-800/40"
                                title={isExpanded ? "Collapse Details" : "Expand Details"}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Details Container */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="bg-[#090d17]/50 py-4 px-6 border-b border-slate-800/80">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-400 overflow-hidden"
                                >
                                  {/* Column 1: Candidate Summary & Prep Progress */}
                                  <div className="space-y-4.5 md:col-span-1 border-r border-slate-800/60 pr-6 text-left">
                                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-200">Candidate Info & CV</h4>
                                    
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase">Prospective Salary:</p>
                                      <p className="text-emerald-400 font-semibold font-mono text-sm">{job.salary || 'Not specified'}</p>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[10px] text-slate-500 uppercase">Job Spec URL:</p>
                                      {job.descriptionUrl ? (
                                        <a href={job.descriptionUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:underline hover:text-purple-300 transition-colors">
                                          <span>View Spec Description</span>
                                          <ExternalLink className="h-3 w-3 shrink-0" />
                                        </a>
                                      ) : (
                                        <p className="text-slate-650 font-light italic">No URL provided</p>
                                      )}
                                    </div>

                                    {/* Candidate Resume CV attachment */}
                                    <div className="space-y-1.5">
                                      {applicantUser.resumeUploaded && applicantUser.resumeData ? (
                                        <button
                                          onClick={() => handleOpenResumeModal(applicantUser)}
                                          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#2BB794]/10 border border-[#2BB794]/20 hover:border-[#2BB794]/40 text-[#2BB794] text-[10px] font-bold transition-all cursor-pointer hover:bg-[#2BB794]/20"
                                        >
                                          <FileText className="h-3.5 w-3.5" />
                                          <span>Open Candidate CV</span>
                                        </button>
                                      ) : (
                                        <p className="text-slate-650 font-light italic text-[11px]">No CV uploaded by candidate</p>
                                      )}
                                    </div>

                                    {/* Student Prep progress stack */}
                                    <div className="space-y-2 pt-2 border-t border-slate-900">
                                      <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-slate-400 uppercase tracking-wider">Prep Progress</span>
                                        <span className="text-slate-500 font-mono font-bold">
                                          {completedTasks}/{checklistItems.length}
                                        </span>
                                      </div>

                                      <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
                                        {checklistItems.map(item => (
                                          <div key={item.id} className="flex items-center gap-1.5 p-1.5 bg-slate-950/30 border border-slate-850 rounded-lg">
                                            <span className={`p-0.5 rounded border shrink-0 ${
                                              item.done 
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                                : 'border-slate-800 text-slate-700'
                                            }`}>
                                              <Check className={`h-2 w-2 ${item.done ? 'opacity-100' : 'opacity-0'}`} />
                                            </span>
                                            <span className={`text-[10px] truncate font-light ${item.done ? 'line-through text-slate-600' : 'text-slate-400'}`}>
                                              {item.text}
                                            </span>
                                          </div>
                                        ))}
                                        {checklistItems.length === 0 && (
                                          <p className="text-slate-650 italic font-light text-[10px]">No prep checklists created.</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 2: Dashboard Timeline Audits */}
                                  <div className="space-y-3.5 md:col-span-1 border-r border-slate-800/60 pr-6 text-left">
                                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-200">Timeline Audits</h4>
                                    
                                    <div className="relative pl-6 space-y-3.5 border-l border-dashed border-[#2BB794]/30 ml-2.5 py-1 max-h-[220px] overflow-y-auto pr-1">
                                      {timelineLogs.map((log, index) => {
                                        const isRecruiterAction = log.action.toLowerCase().includes('recruiter') || 
                                                                  log.action.toLowerCase().includes('scheduled') ||
                                                                  log.action.toLowerCase().includes('offer') ||
                                                                  log.action.toLowerCase().includes('rejected') ||
                                                                  log.action.toLowerCase().includes('evaluated') ||
                                                                  log.action.toLowerCase().includes('feedback');
                                        return (
                                          <div key={log.id || index} className="relative group transition-all duration-200">
                                            {/* Glowing indicator bullet */}
                                            <span className={`absolute -left-[31px] top-[3px] h-2.5 w-2.5 rounded-full border border-slate-950 transition-all duration-300 ${
                                              isRecruiterAction 
                                                ? 'bg-[#2BB794] shadow-[0_0_8px_rgba(43,183,148,0.7)] group-hover:scale-110' 
                                                : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] group-hover:scale-110'
                                            }`} />
                                            
                                            <div className="space-y-0.5">
                                              <p className="text-[11px] font-medium text-slate-200 leading-tight group-hover:text-white transition-colors">{log.action}</p>
                                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
                                                <span>{new Date(log.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                <span>•</span>
                                                <span className="text-[#2BB794] font-semibold">{getRelativeTimeString(log.date)}</span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {timelineLogs.length === 0 && (
                                        <p className="text-slate-650 italic font-light text-[10px] py-1">No activities logged yet.</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Column 3: Feature 1 (ATS Keyword Radar Match Analyzer) */}
                                  <div className="space-y-3.5 md:col-span-1 border-r border-slate-800/60 pr-6 text-left select-none">
                                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-200 flex items-center gap-1">
                                      <Sparkles className="h-3.5 w-3.5 text-[#2BB794]" />
                                      <span>ATS Match & Keyword Gap</span>
                                    </h4>
                                    
                                    <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                                      {/* Custom Radial SVG progress */}
                                      <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                          <circle cx="24" cy="24" r="20" className="stroke-slate-900 fill-none" strokeWidth="2.5" />
                                          <circle cx="24" cy="24" r="20" className="stroke-[#2BB794] fill-none" strokeWidth="2.5" 
                                            strokeDasharray={125.6} 
                                            strokeDashoffset={125.6 - (125.6 * (parsedScore || 75)) / 100}
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 4px rgba(43,183,148,0.4))' }}
                                          />
                                        </svg>
                                        <span className="absolute text-[10px] font-black text-white">{parsedScore || 75}%</span>
                                      </div>
                                      
                                      <div>
                                        <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">ATS Score Index</span>
                                        <span className="block text-[10px] text-slate-350 font-light mt-0.5 leading-none">
                                          {parsedScore >= 80 ? 'Excellent Match Fit' : (parsedScore >= 60 ? 'Strong Potential' : 'Review Gaps')}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Keyword Tags */}
                                    <div className="space-y-2">
                                      <div>
                                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Matched Keywords</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {['React', 'Vite', 'Tailwind', 'JavaScript', 'NodeJS'].slice(0, (parsedScore ? Math.floor(parsedScore/18) : 3)).map((kw) => (
                                            <span key={kw} className="text-[9px] font-bold text-[#2BB794] bg-[#2BB794]/10 border border-[#2BB794]/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                              <Check className="h-2.5 w-2.5" />
                                              {kw}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Missing Keywords</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {['Docker', 'Kubernetes', 'WebRTC', 'TypeScript', 'GraphQL'].slice(0, (parsedScore ? Math.max(1, 5 - Math.floor(parsedScore/18)) : 2)).map((kw) => (
                                            <span key={kw} className="text-[9px] font-bold text-[#ffd167] bg-[#ffd167]/10 border border-[#ffd167]/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                              <AlertCircle className="h-2.5 w-2.5 text-[#ffd167]" />
                                              {kw}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Column 4: Feature 4 (Collaborative Ratings & Notes Log) */}
                                  <div className="space-y-3.5 md:col-span-1 text-left">
                                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-200 flex items-center gap-1">
                                      <Award className="h-3.5 w-3.5 text-[#ffd167]" />
                                      <span>Technical Evaluation</span>
                                    </h4>

                                    <div className="space-y-2 bg-[#0b0f19]/65 border border-slate-800/65 p-2.5 rounded-xl text-left select-none">
                                      {/* DSA rating slider */}
                                      <div className="space-y-0.5">
                                        <div className="flex justify-between items-center text-[9px]">
                                          <span className="text-slate-450 font-bold uppercase tracking-wider">DSA Skills</span>
                                          <span className="text-[#ffd167] font-black">{feedbackDSA} ★</span>
                                        </div>
                                        <input 
                                          type="range" min="0" max="5" step="0.5" 
                                          value={feedbackDSA} 
                                          onChange={(e) => setFeedbackDSA(parseFloat(e.target.value))}
                                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2BB794]"
                                        />
                                      </div>

                                      {/* System Design rating slider */}
                                      <div className="space-y-0.5">
                                        <div className="flex justify-between items-center text-[9px]">
                                          <span className="text-slate-455 font-bold uppercase tracking-wider">System Design</span>
                                          <span className="text-[#ffd167] font-black">{feedbackSysDesign} ★</span>
                                        </div>
                                        <input 
                                          type="range" min="0" max="5" step="0.5" 
                                          value={feedbackSysDesign} 
                                          onChange={(e) => setFeedbackSysDesign(parseFloat(e.target.value))}
                                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2BB794]"
                                        />
                                      </div>

                                      {/* Communication rating slider */}
                                      <div className="space-y-0.5">
                                        <div className="flex justify-between items-center text-[9px]">
                                          <span className="text-slate-460 font-bold uppercase tracking-wider">Communication</span>
                                          <span className="text-[#ffd167] font-black">{feedbackComm} ★</span>
                                        </div>
                                        <input 
                                          type="range" min="0" max="5" step="0.5" 
                                          value={feedbackComm} 
                                          onChange={(e) => setFeedbackComm(parseFloat(e.target.value))}
                                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2BB794]"
                                        />
                                      </div>
                                    </div>

                                    {/* Collaborative Note Thread & Form */}
                                    <div className="space-y-1.5 pt-1 border-t border-slate-900 mt-2">
                                      <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Recruiter Feedback Log</span>
                                      
                                      {/* Collaborative Notes scroll box */}
                                      <div className="max-h-20 overflow-y-auto space-y-1 pr-1 text-[10px]">
                                        {(() => {
                                          let parsedFeedback = {};
                                          try {
                                            parsedFeedback = JSON.parse(job.recruiterFeedback || '{}');
                                          } catch(e) {}
                                          const notesLog = parsedFeedback.notesLog || [];

                                          return notesLog.map((note, nIdx) => (
                                            <div key={note.id || nIdx} className="bg-slate-950/60 border border-slate-900/60 p-2 rounded-lg text-left relative">
                                              <div className="flex justify-between text-[8px] text-slate-500 font-semibold mb-0.5">
                                                <span>{note.author} ({note.company})</span>
                                                <span>{getRelativeTimeString(note.timestamp)}</span>
                                              </div>
                                              <p className="text-slate-300 font-light leading-snug">{note.text}</p>
                                            </div>
                                          ));
                                        })()}

                                        {(!job.recruiterFeedback || !JSON.parse(job.recruiterFeedback || '{}').notesLog || JSON.parse(job.recruiterFeedback || '{}').notesLog.length === 0) && (
                                          <p className="text-slate-650 italic font-light text-[9px] py-1">No evaluation notes recorded yet.</p>
                                        )}
                                      </div>

                                      {/* Add note input */}
                                      <div className="flex gap-1.5 items-center mt-1.5">
                                        <input 
                                          type="text" 
                                          placeholder="Log internal feedback..."
                                          value={feedbackNewNote}
                                          onChange={(e) => setFeedbackNewNote(e.target.value)}
                                          className="flex-1 bg-slate-950/60 focus:bg-slate-950 border border-slate-850 focus:border-[#2BB794] rounded-lg px-2 py-1 text-[10px] text-slate-200 outline-none transition-all placeholder:text-slate-600 font-light"
                                        />
                                        <button
                                          onClick={() => handleSubmitFeedback(job.id)}
                                          disabled={submittingFeedbackId === job.id}
                                          className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#35c3a0] hover:to-[#12c48b] text-white text-[10px] font-bold cursor-pointer transition-all active:scale-[0.96] shrink-0"
                                        >
                                          {submittingFeedbackId === job.id ? 'Save...' : 'Save'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 animate-pulse">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-semibold">No Applicants Tracked Yet</p>
                  <p className="text-slate-500 text-xs font-light max-w-sm">
                    Student applications targeting your represented company **{activeCompany}** will automatically show up here once they apply!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Date Scheduling Modal */}
      <AnimatePresence>
        {schedulerOpen && schedulingJob && (
          <>
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSchedulerOpen(false); setSchedulingJob(null); }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl z-50 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">Schedule Interview</h3>
                  <p className="text-slate-400 text-xs mt-1 font-light">
                    Select a date to interview **{(schedulingJob.user || {}).name}** for **{schedulingJob.role}**.
                  </p>
                </div>
                <button 
                  onClick={() => { setSchedulerOpen(false); setSchedulingJob(null); }}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#2BB794]" />
                  <span>Interview Date Selection</span>
                </label>
                <input 
                  type="date"
                  value={interviewDateInput}
                  onChange={(e) => setInterviewDateInput(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-sm text-[#2BB794] border-[#2BB794]/20 focus:border-[#2BB794]/60"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSchedulerOpen(false); setSchedulingJob(null); }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!interviewDateInput}
                  onClick={() => handleUpdateStatus(schedulingJob.id, 'INTERVIEWING', interviewDateInput)}
                  className="px-5 py-2 bg-[#2BB794] hover:bg-[#208c70] disabled:opacity-40 text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(43,183,148,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Interview
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Simulated Fullscreen Virtual Mock Interview Workspace Modal */}
      <AnimatePresence>
        {selectedVirtualJob && (() => {
          const candidateName = selectedVirtualJob.user?.name || 'Candidate';

          const getSimulatedCandidateReply = (recruiterText) => {
            const cleanText = recruiterText.toLowerCase().trim();
            const words = cleanText.split(/\s+/);
            const hasWord = (w) => words.includes(w);
            
            // 1. Specific JobTrack / Internship Opportunity Questions
            if (cleanText.includes('where do you find') || cleanText.includes('how do you find') || cleanText.includes('where did you find') || cleanText.includes('how did you find') || cleanText.includes('find these') || cleanText.includes('discover') || cleanText.includes('opportunities') || cleanText.includes('platform') || cleanText.includes('portal') || cleanText.includes('jobtrack')) {
              return {
                text: `I discovered this incredible internship opportunity directly through the JobTrack platform! I saw your represented company profile in the portal, read your recruitment social stream update, and clicked 'Apply Direct'. The direct-to-recruiter tracking made the process incredibly seamless and transparent!`,
                codeToType: null
              };
            }

            // 2. Affirmations & Conversational bridges ("all good", "ok", "fine", "go ahead")
            if (cleanText.includes('all good') || cleanText.includes('all-good') || hasWord('ok') || hasWord('okay') || hasWord('fine') || hasWord('nice') || hasWord('cool') || hasWord('proceed') || hasWord('start') || cleanText.includes('go ahead')) {
              return {
                text: `Perfect! Let's get right into the technical solution. I'll outline the core logic and algorithmic structures directly inside our shared coding notepad now so you can inspect the design.`,
                codeToType: `// Initializing candidate coding draft...\nfunction initializeAssessment() {\n  console.log("Mock interview starting - logically processing orders...");\n  return true;\n}`
              };
            }

            // 3. Greetings
            const greetingRegex = /\b(hi|hello|hey|welcome|morning|evening|afternoon)\b/i;
            if (greetingRegex.test(cleanText)) {
              const replies = [
                `Hello! Thank you so much. I am doing very well, excited to talk through my background with you today! How are you doing?`,
                `Hi ${recruiterName}! Thank you for having me. I've been looking forward to this technical assessment. How is your day going?`,
                `Good evening! Ready to dive in. It's a privilege to present my profile to ${selectedVirtualJob.company}.`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: null
              };
            }
            
            // 4. DSA / Algorithms / Coding
            if (cleanText.includes('dsa') || cleanText.includes('code') || cleanText.includes('write') || cleanText.includes('complexity') || cleanText.includes('algorithm') || cleanText.includes('function') || cleanText.includes('runtime') || cleanText.includes('array') || cleanText.includes('string') || cleanText.includes('map') || cleanText.includes('space') || cleanText.includes('time') || cleanText.includes('tree') || cleanText.includes('binary') || cleanText.includes('recursion') || cleanText.includes('hash')) {
              
              const codeSnippet = `// Optimized O(N) Two-Sum implementation using Map\nfunction findTargetPair(nums, target) {\n  console.log("Analyzing index pair complexities...");\n  const seenMap = new Map(); // O(N) space auxiliary allocation\n  \n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seenMap.has(complement)) {\n      // Found matching pair satisfying O(1) lookup!\n      return [seenMap.get(complement), i];\n    }\n    seenMap.set(nums[i], i);\n  }\n  return []; // Edge case fallback\n}`;

              const replies = [
                `Yes, that completely aligns! I can refactor this algorithm using a hash map to achieve O(n) runtime complexity and O(n) space complexity, avoiding the nested nested loops. Let me update the coding notepad!`,
                `I see! For that constraint, we can utilize a two-pointer technique or binary search. That would optimize the runtime to O(log N) or O(N) while keeping the auxiliary space complexity at O(1). Let me draft that template in the shared notepad.`,
                `Excellent suggestion. I'll write a clean, modular Javascript function in our shared coding editor. Let's make sure we handle boundary conditions like null inputs and integer overflows.`,
                `To improve the search time, we can pre-sort the array in O(N log N) time, or use a Trie structure if we are doing prefix matching. I am writing out the code for this in our notepad right now!`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: codeSnippet
              };
            }
            
            // 5. System Design / Scale / Architecture
            if (cleanText.includes('system') || cleanText.includes('design') || cleanText.includes('scale') || cleanText.includes('database') || cleanText.includes('sql') || cleanText.includes('nosql') || cleanText.includes('redis') || cleanText.includes('cache') || cleanText.includes('load') || cleanText.includes('latency') || cleanText.includes('microservices') || cleanText.includes('kafka') || cleanText.includes('queue') || cleanText.includes('architecture')) {
              
              const architectureSnippet = `==================================================\n${selectedVirtualJob.company.toUpperCase()} MOCK INTERVIEW SYSTEM ARCHITECTURE\n==================================================\n\n[Client Portal] ---> [Nginx Load Balancer] ---> [API Gateway (Rate Limiter)]\n                                                   |\n           +---------------------------------------+-------------------------+\n           |                                       |                         |\n[Order Service (NodeJS)]                 [User Service (Go)]       [Billing Service (Java)]\n     |                                             |                         |\n     +---> [Kafka Broker] ---> [Workers]           +---> [Redis Cache]       +---> [DB Replicas]\n                 |                                             |\n           [PostgreSQL DB]                               [SQLite Cache]`;

              const replies = [
                `For low-latency at high-scale, I'd introduce an in-memory Redis caching layer to offload heavy reads from our relational database (e.g. PostgreSQL). We can also use consistent hashing to shard the user records across multiple database nodes.`,
                `To decouple our order processing services, I'd implement an asynchronous message broker like Apache Kafka or RabbitMQ. This ensures that even if our payment service experiences spike latency, order events are durably queued and consumed.`,
                `For the API gateway layer, we should enforce rate limiting (using token-bucket algorithm) to protect our downstream microservices, and deploy read-replicas globally with CDN routing for static payloads.`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: architectureSnippet
              };
            }

            // 6. Behavioral / Experience / Resume details
            if (cleanText.includes('resume') || cleanText.includes('project') || cleanText.includes('experience') || cleanText.includes('tell me') || cleanText.includes('weakness') || cleanText.includes('strength') || cleanText.includes('team') || cleanText.includes('conflict') || cleanText.includes('challenge')) {
              
              const projectSnippet = `// Verified Candidate Technical Experience Metrics\nconst CandidateExperience = {\n  role: "Software Engineering Intern",\n  coreStack: ["React 18", "Express", "Prisma", "SQLite", "Tailwind CSS"],\n  highlights: [\n    "Designed real-time activity log trails with relative time offsets",\n    "Constructed monthly calendar view linking direct scheduled modals",\n    "Optimized SQL indexing reducing database response times by 35%"\n  ]\n};`;

              const replies = [
                `In my recent project, I built a highly responsive career tracking dashboard using Node, Express, and SQLite. A key challenge was managing concurrent status shifts, which I solved by building transaction triggers and custom state synchronization logic.`,
                `I excel at turning ambiguous business specifications into clean, maintainable modular systems. My key strength is my quick learning agility—I picked up Prisma and Tailwind CSS in a single weekend to deliver high-fidelity features under tight timelines!`,
                `I believe active communication and thorough code reviews are vital. When conflicts arise in technical designs, I prefer to run A/B benchmark tests to let clean data and metrics guide our team decisions rather than personal opinions.`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: projectSnippet
              };
            }

            // 7. Salaries, Offers, Stipend
            if (cleanText.includes('salary') || cleanText.includes('stipend') || cleanText.includes('ctc') || cleanText.includes('package') || cleanText.includes('lpa') || cleanText.includes('expect')) {
              const replies = [
                `I am open to standard industry packages for my experience level. My primary focus is to work under great mentors at ${selectedVirtualJob.company} and solve challenging engineering problems!`,
                `I saw the stipend metrics on your recent hiring social broadcast, and I find the terms highly competitive and aligned! I'm completely satisfied with your standard HR guidelines.`,
                `Compensation is definitely important, but getting to work on ${selectedVirtualJob.company}'s core high-concurrency systems is what truly excites me. I am open to standard alignment.`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: null
              };
            }

            // 8. Closings / Thanks / Praise
            if (cleanText.includes('bye') || cleanText.includes('thanks') || cleanText.includes('thank you') || cleanText.includes('good job') || cleanText.includes('perfect') || cleanText.includes('awesome') || cleanText.includes('great') || cleanText.includes('nice')) {
              const replies = [
                `Thank you so much! It has been an absolute pleasure discussing these system queries and coding architectures with you. I really appreciate your time and mentorship today!`,
                `Awesome, thank you! I'm really excited about this potential opportunity. Let me know if you would like me to clarify any more algorithms in our editor!`,
                `Thank you, ${recruiterName}! I will save this notepad and look forward to hearing about the next round of evaluations.`
              ];
              return {
                text: replies[Math.floor(Math.random() * replies.length)],
                codeToType: null
              };
            }

            // 9. General Context-Rich responses
            const boundarySnippet = `// Defensive Edge-Case Validation & Safeguards\nfunction processSecureTransaction(payload) {\n  // 1. Boundary criteria & null reference checks\n  if (!payload || typeof payload !== 'object') {\n    throw new Error("Invalid transaction boundary exception");\n  }\n  \n  const { amount, userId } = payload;\n  \n  // 2. Value overflows & logical constraints\n  if (amount <= 0 || amount > Number.MAX_SAFE_INTEGER) {\n    console.warn("Logical transaction limit overflow detected");\n    return false;\n  }\n  \n  // 3. User authenticity\n  if (!userId || typeof userId !== 'string') {\n    return false;\n  }\n  \n  return true; // Logical constraints satisfied\n}`;

            const fallbackReplies = [
              `That makes complete sense! I'll refactor the code in our shared notepad to handle those specific boundary criteria. Let me write that out.`,
              `Interesting design query! We could also handle this edge case by adding defensive validations. Let me write some comments in the editor to illustrate.`,
              `I completely agree with that optimization. I'll clean up the runtime memory footprint of our function in the shared coding notepad now. Let me know if you'd like me to explain the space complexity trade-offs!`,
              `Absolutely! I'm currently typing out the logic. I really enjoy finding elegant tradeoffs between compute runtime and memory overhead.`
            ];
            
            const replyText = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
            return {
              text: replyText,
              codeToType: replyText.includes('boundary') ? boundarySnippet : null
            };
          };

          const simulateTypingInNotepad = (codeText) => {
            if (!codeText) return;
            let currentLength = 0;
            // Clear notepad first
            setVirtualCodeInput('// Simulating candidate response typing...\n');
            const timer = setInterval(() => {
              currentLength += Math.min(15, codeText.length - currentLength);
              setVirtualCodeInput(codeText.substring(0, currentLength));
              if (currentLength >= codeText.length) {
                clearInterval(timer);
              }
            }, 30);
          };

          return (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full h-full max-w-6xl bg-[#090d16] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
                >
                  {/* Modal Top Bar */}
                  <div className="bg-[#0b0f19] px-6 py-4 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Virtual Interview Workspace</span>
                        <span className="text-[9px] bg-[#2BB794]/10 border border-[#2BB794]/20 text-[#2BB794] px-2 py-0.5 rounded font-black uppercase tracking-wider">Active Call</span>
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-500 font-mono">Candidate: <strong className="text-slate-350">{candidateName}</strong> | Company: <strong className="text-[#2BB794]">{selectedVirtualJob.company}</strong></span>
                      <button 
                        onClick={() => setSelectedVirtualJob(null)}
                        className="px-3.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        End Meeting
                      </button>
                    </div>
                  </div>

                  {/* Modal Body columns */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* Left Column (span 4): Camera previews */}
                    <div className="lg:col-span-4 border-r border-slate-850 p-5 flex flex-col gap-4 overflow-y-auto bg-slate-950/10 justify-center">
                      {/* Recruiter Preview */}
                      <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner group">
                        <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-300">You (Recruiter)</div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#2BB794] to-[#10b981] text-white font-bold text-xs flex items-center justify-center shadow-md">RE</div>
                        <span className="text-[10px] text-slate-500 absolute bottom-3 right-3 font-mono font-bold uppercase tracking-wider">Camera Active</span>
                      </div>
                      {/* Candidate Preview */}
                      <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner group">
                        <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-300">{candidateName}</div>
                        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">{candidateName.split(' ').map(n => n[0]).join('')}</div>
                        <span className="text-[10px] text-slate-500 absolute bottom-3 right-3 font-mono font-bold uppercase tracking-wider">Connected</span>
                      </div>
                    </div>

                    {/* Middle Column (span 5): Collaborative notepad code editor */}
                    <div className="lg:col-span-5 border-r border-slate-850 flex flex-col overflow-hidden bg-slate-950/30">
                      <div className="px-5 py-2.5 bg-[#0b0f19]/80 border-b border-slate-850 flex justify-between items-center shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Shared Coding Notepad</span>
                        <span className="text-[9px] text-[#2BB794] font-semibold flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#2BB794]" /> Collaborative</span>
                      </div>
                      <textarea
                        value={virtualCodeInput}
                        onChange={(e) => setVirtualCodeInput(e.target.value)}
                        className="flex-1 w-full bg-slate-950/50 p-5 font-mono text-xs text-emerald-400 border-none outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Right Column (span 3): Quick Candidate Chat & profile summary */}
                    <div className="lg:col-span-3 flex flex-col overflow-hidden">
                      {/* Candidate specs header */}
                      <div className="p-4 border-b border-slate-850 bg-slate-950/10 text-left space-y-1.5 shrink-0">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Candidate Resume Info</span>
                        <h4 className="font-bold text-xs text-white leading-none">{candidateName}</h4>
                        <div className="flex gap-2 text-[10px] text-slate-400 leading-none">
                          <span>ATS Match: <strong className="text-[#2BB794]">{selectedVirtualJob.resumeMatcherData ? JSON.parse(selectedVirtualJob.resumeMatcherData).matchScore : 75}%</strong></span>
                        </div>
                      </div>

                      {/* Simulated chat timeline */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d1322]/20 flex flex-col justify-end">
                        {virtualChatMessages.map((msg) => (
                          <div key={msg.id} className={`text-left text-xs ${msg.isSystem ? 'text-center py-1 text-slate-500 font-mono text-[9px]' : ''}`}>
                            {msg.isSystem ? (
                              <span>{msg.text}</span>
                            ) : (
                              <div className={`p-2 rounded-xl border max-w-[85%] ${
                                msg.isRecruiter
                                  ? 'bg-[#2BB794]/10 border-[#2BB794]/25 text-slate-100 ml-auto' 
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}>
                                <span className="block text-[8px] text-slate-500 font-bold mb-0.5">{msg.author}</span>
                                <p className="leading-snug">{msg.text}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Chat input */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const queryText = virtualChatInput.trim();
                          if (!queryText) return;
                          
                          const newMsg = {
                            id: `vmsg-${Date.now()}`,
                            author: recruiterName,
                            text: queryText,
                            isRecruiter: true
                          };
                          setVirtualChatMessages(prev => [...prev, newMsg]);
                          setVirtualChatInput('');
                          
                          // Simulate candidate immediate replies
                          setTimeout(() => {
                            const result = getSimulatedCandidateReply(queryText);
                            const reply = {
                              id: `vmsg-${Date.now()+1}`,
                              author: candidateName,
                              text: result.text,
                              isRecruiter: false
                            };
                            setVirtualChatMessages(prev => [...prev, reply]);

                            // Trigger notepad typing if candidate typed code!
                            if (result.codeToType) {
                              simulateTypingInNotepad(result.codeToType);
                            }
                          }, 1200);
                        }}
                        className="p-3 border-t border-slate-850 bg-slate-950/40 flex gap-2 items-center shrink-0"
                      >
                        <input
                          type="text"
                          placeholder="Send message to candidate..."
                          value={virtualChatInput}
                          onChange={(e) => setVirtualChatInput(e.target.value)}
                          className="flex-1 bg-slate-950 focus:bg-slate-950 border border-slate-850 focus:border-[#2BB794] rounded-lg px-3 py-2 text-[11px] text-slate-200 outline-none transition-all placeholder:text-slate-650"
                        />
                        <button type="submit" className="p-2 rounded-lg bg-[#2BB794] hover:bg-[#208c70] text-slate-950 transition-colors cursor-pointer">
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Scope a hidden print style that targets ONLY the recruiter's candidate resume card */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: none !important;
          }
          #printable-recruiter-resume-card, #printable-recruiter-resume-card * {
            visibility: visible;
          }
          #printable-recruiter-resume-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #111 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Recruiter Candidate CV Modal overlay */}
      <AnimatePresence>
        {resumeModalOpen && viewingCandidate && (() => {
          const name = viewingCandidate.name || 'Candidate';
          const email = viewingCandidate.email || 'N/A';
          let parsedResume = {};
          try {
            parsedResume = typeof viewingCandidate.resumeData === 'string'
              ? JSON.parse(viewingCandidate.resumeData || '{}')
              : viewingCandidate.resumeData || {};
          } catch (e) {}

          const summary = parsedResume.summary || '';
          const education = parsedResume.education || [];
          const experience = parsedResume.experience || [];
          const skills = parsedResume.skills || [];
          const projects = parsedResume.projects || [];

          return (
            <>
              {/* Modal Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseResumeModal}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 no-print"
              />

              {/* Modal Box Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="fixed inset-x-4 md:inset-x-auto md:w-full md:max-w-4xl top-[5%] bottom-[5%] md:left-1/2 md:-translate-x-1/2 bg-[#0c1220]/95 border border-slate-800 rounded-3xl p-6 shadow-2xl z-50 overflow-y-auto no-print space-y-5"
              >
                {/* Modal Toolbar Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <FileText className="h-5 w-5 text-purple-400" />
                      <span>{name}'s Candidate CV</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5">Secure sandbox CV inspector. Print to PDF or export to Word.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* DOCX Download */}
                    <button
                      onClick={() => downloadCandidateDocx(viewingCandidate)}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-purple-400 hover:text-purple-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .doc</span>
                    </button>

                    {/* PDF Print */}
                    <button
                      onClick={() => printCandidatePdf(viewingCandidate)}
                      className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_10px_rgba(43,183,148,0.3)] text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print .pdf</span>
                    </button>

                    <button
                      onClick={handleCloseResumeModal}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-850 transition-all cursor-pointer ml-1.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Styled Resume Preview Core */}
                <div 
                  id="printable-recruiter-resume-card"
                  className="bg-white rounded-2xl p-8 text-[#1a202c] shadow-lg border border-slate-200 min-h-[680px] select-none text-left"
                >
                  {/* Header Row */}
                  <div className="text-center pb-5 border-b-2 border-indigo-900">
                    <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">{name}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-1">Email: {email} | Verified Platform Candidate</p>
                  </div>

                  {/* Sections */}
                  <div className="mt-5 space-y-5">
                    {/* Summary */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black text-indigo-950 border-b border-indigo-900 pb-0.5 uppercase tracking-wide">Professional Summary</h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-light">{summary || 'No professional summary provided.'}</p>
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-900 pb-0.5 uppercase tracking-wide">Work Experience</h3>
                      {experience.length > 0 ? (
                        <div className="space-y-3">
                          {experience.map((exp, index) => (
                            <div key={index} className="space-y-1 text-xs">
                              <div className="flex justify-between items-baseline font-bold text-[#2d3748]">
                                <span>{exp.role} at <span className="italic text-indigo-900">{exp.company}</span></span>
                                <span className="text-[10px] text-slate-500 font-light italic font-mono">{exp.duration}</span>
                              </div>
                              <ul className="list-disc pl-4 space-y-1 text-slate-600 font-light text-[11px] leading-relaxed">
                                {exp.highlights.map((hl, i) => hl && <li key={i}>{hl}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-light">No professional experience listed.</p>
                      )}
                    </div>

                    {/* Education */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-900 pb-0.5 uppercase tracking-wide">Education Background</h3>
                      {education.length > 0 ? (
                        <div className="space-y-2">
                          {education.map((edu, index) => (
                            <div key={index} className="text-xs flex justify-between items-start">
                              <div>
                                <p className="font-bold text-[#2d3748]">{edu.degree}</p>
                                <p className="text-indigo-900 font-medium italic text-[11px] mt-0.5">{edu.school}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-500 font-light italic font-mono text-[10px]">{edu.year}</p>
                                <p className="text-[10px] text-indigo-900 font-bold font-mono mt-0.5">GPA: {edu.gpa}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-light">No education details specified.</p>
                      )}
                    </div>

                    {/* Projects */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-900 pb-0.5 uppercase tracking-wide">Featured Projects</h3>
                      {projects.length > 0 ? (
                        <div className="space-y-2.5">
                          {projects.map((proj, index) => (
                            <div key={index} className="text-xs space-y-0.5">
                              <div className="flex justify-between items-baseline font-bold text-[#2d3748]">
                                <span>{proj.name}</span>
                                <span className="text-[9px] text-indigo-900 font-mono">{(proj.tech || []).join(' | ')}</span>
                              </div>
                              <p className="text-slate-600 font-light text-[11px] leading-relaxed">{proj.desc}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-light">No projects added.</p>
                      )}
                    </div>

                    {/* Core Skills */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-900 pb-0.5 uppercase tracking-wide">Core Skills and Expertise</h3>
                      {skills.length > 0 ? (
                        <div className="text-[11px] text-slate-700 leading-relaxed font-semibold tracking-wide font-mono">
                          {skills.join(' | ')}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-light">No skills listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
