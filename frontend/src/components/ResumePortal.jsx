import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, GraduationCap, Briefcase, FileText, Download, Save, 
  Plus, X, Sparkles, AlertCircle, CheckCircle2, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

export default function ResumePortal({ userToken }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // CV Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [summary, setSummary] = useState('');
  
  // Array structures
  const [education, setEducation] = useState([{ school: '', degree: '', year: '', gpa: '' }]);
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', highlights: [''] }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [projects, setProjects] = useState([{ name: '', desc: '', tech: [''] }]);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/users/resume`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jobtrack_token')}` }
      });
      setName(res.data.name || '');
      setEmail(res.data.email || '');
      
      if (res.data.resumeData) {
        const parsed = JSON.parse(res.data.resumeData);
        setSummary(parsed.summary || '');
        setEducation(parsed.education || [{ school: '', degree: '', year: '', gpa: '' }]);
        setExperience(parsed.experience || [{ company: '', role: '', duration: '', highlights: [''] }]);
        setSkills(parsed.skills || []);
        setProjects(parsed.projects || [{ name: '', desc: '', tech: [''] }]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch CV profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const resumeObject = {
      summary,
      education: education.filter(e => e.school || e.degree),
      experience: experience.filter(exp => exp.company || exp.role),
      skills,
      projects: projects.filter(p => p.name || p.desc)
    };

    try {
      await axios.put(`${API_BASE}/users/resume`, {
        resumeUploaded: true,
        resumeData: resumeObject
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jobtrack_token')}` }
      });
      setSuccess('CV Profile successfully updated & synchronized!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to save CV details.');
    } finally {
      setSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', year: '', gpa: '' }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index, field, value) => {
    setEducation(education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu));
  };

  // Experience Helpers
  const addExperience = () => {
    setExperience([...experience, { company: '', role: '', duration: '', highlights: [''] }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index, field, value) => {
    setExperience(experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp));
  };
  const addHighlight = (expIndex) => {
    const updated = experience.map((exp, i) => {
      if (i === expIndex) {
        return { ...exp, highlights: [...exp.highlights, ''] };
      }
      return exp;
    });
    setExperience(updated);
  };
  const updateHighlight = (expIndex, hlIndex, value) => {
    const updated = experience.map((exp, i) => {
      if (i === expIndex) {
        const newHighlights = exp.highlights.map((hl, j) => j === hlIndex ? value : hl);
        return { ...exp, highlights: newHighlights };
      }
      return exp;
    });
    setExperience(updated);
  };
  const removeHighlight = (expIndex, hlIndex) => {
    const updated = experience.map((exp, i) => {
      if (i === expIndex) {
        return { ...exp, highlights: exp.highlights.filter((_, j) => j !== hlIndex) };
      }
      return exp;
    });
    setExperience(updated);
  };

  // Skills Helpers
  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!skillInput.trim()) return;
      const clean = skillInput.trim();
      if (!skills.includes(clean)) {
        setSkills([...skills, clean]);
      }
      setSkillInput('');
    }
  };
  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Projects Helpers
  const addProject = () => {
    setProjects([...projects, { name: '', desc: '', tech: [''] }]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  const updateProject = (index, field, value) => {
    setProjects(projects.map((proj, i) => i === index ? { ...proj, [field]: value } : proj));
  };
  const updateProjectTech = (projIndex, value) => {
    const tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setProjects(projects.map((proj, i) => i === projIndex ? { ...proj, tech: tags } : proj));
  };

  // DOCX Blob Download Helper
  const downloadDocx = () => {
    const escapedName = name.replace(/\s+/g, '_');
    
    // Formatted Word HTML
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
        <div class="subtitle">Email: ${email} | Platform: JobTrack Student Portal</div>

        <h2>Professional Summary</h2>
        <div class="section">${summary || 'No summary entered yet.'}</div>

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

  // High-Fidelity Scoped Browser PDF Printer
  const printPdf = () => {
    const escapedName = name.replace(/\s+/g, '_');
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
        ${experience && experience.length > 0 && experience.some(exp => exp.company || exp.role) ? experience.map(exp => {
          if (!exp.company && !exp.role) return '';
          return `
            <div class="section">
              <div class="item-row">
                <span class="item-title">${exp.role || 'Role'} at <span class="item-company">${exp.company || 'Company'}</span></span>
                <span class="item-meta">${exp.duration || 'Duration'}</span>
              </div>
              <ul>
                ${exp.highlights.map(hl => hl ? `<li>${hl}</li>` : '').join('')}
              </ul>
            </div>
          `;
        }).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No professional experience listed.</div>'}

        <h2>Education Background</h2>
        ${education && education.length > 0 && education.some(edu => edu.school || edu.degree) ? education.map(edu => {
          if (!edu.school && !edu.degree) return '';
          return `
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
          `;
        }).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No education details specified.</div>'}

        <h2>Academic & Tech Projects</h2>
        ${projects && projects.length > 0 && projects.some(p => p.name || p.desc) ? projects.map(proj => {
          if (!proj.name && !proj.desc) return '';
          return `
            <div class="section">
              <div class="item-row">
                <span class="item-title">${proj.name || 'Project Name'}</span>
                <span class="item-meta">Technologies: ${(proj.tech || []).join(' | ')}</span>
              </div>
              <div class="item-desc">${proj.desc || ''}</div>
            </div>
          `;
        }).join('') : '<div class="section" style="font-style: italic; color: #718096; font-size: 10pt;">No projects added.</div>'}

        <h2>Core Expertise & Skills</h2>
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

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <Sparkles className="h-8 w-8 text-purple-500 animate-spin" />
        <p className="text-slate-400 text-xs font-light">Loading CV Profile builder...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
      {/* Scope a hidden print style that targets ONLY the preview container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: none !important;
          }
          #printable-resume-card, #printable-resume-card * {
            visibility: visible;
          }
          #printable-resume-card {
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

      {/* LEFT: INTERACTIVE FORM BUILDER */}
      <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800/80 space-y-5 no-print">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-purple-400" />
              <span>Interactive CV Builder</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-light mt-0.5">Edit fields to dynamically compile your portfolio resume.</p>
          </div>

          <button
            onClick={handleSaveResume}
            disabled={saving}
            className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 hover:shadow-[0_0_12px_rgba(43,183,148,0.3)] text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            {saving ? <Sparkles className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Profile</span>
          </button>
        </div>

        {/* Message Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          {/* Section: Profile Info */}
          <div className="space-y-3 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">1. Professional Summary & Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 glass-input text-xs border-slate-800"
                    placeholder="Candidate Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 glass-input text-xs border-slate-800"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400">Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 glass-input text-xs border-slate-800 min-h-[60px] resize-none"
                placeholder="High-performing software engineer..."
              />
            </div>
          </div>

          {/* Section: Professional Experience */}
          <div className="space-y-4.5 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">2. Work Experience</h4>
              <button
                type="button"
                onClick={addExperience}
                className="p-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {experience.map((exp, expIndex) => (
              <div key={expIndex} className="p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl space-y-3 relative">
                {experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(expIndex)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Role Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(expIndex, 'role', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="e.g. SDE Intern"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Duration</label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(expIndex, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="Summer 2025"
                    />
                  </div>
                </div>

                {/* Highlights Sub-section */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-slate-500 uppercase">Bullet Highlights</label>
                    <button
                      type="button"
                      onClick={() => addHighlight(expIndex)}
                      className="text-[9px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      + Add Bullet
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exp.highlights.map((hl, hlIndex) => (
                      <div key={hlIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={hl}
                          onChange={(e) => updateHighlight(expIndex, hlIndex, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 glass-input text-xs border-slate-850"
                          placeholder="e.g. Engineered database logic..."
                        />
                        {exp.highlights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHighlight(expIndex, hlIndex)}
                            className="p-1 text-slate-600 hover:text-rose-400 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Education */}
          <div className="space-y-4.5 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">3. Education Background</h4>
              <button
                type="button"
                onClick={addEducation}
                className="p-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {education.map((edu, eduIndex) => (
              <div key={eduIndex} className="p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl space-y-3 relative">
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(eduIndex)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-slate-500 uppercase">University / School</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(eduIndex, 'school', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="Indian Institute of Technology, Kharagpur"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(eduIndex, 'degree', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="B.Tech in Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Year Span</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(eduIndex, 'year', e.target.value)}
                        className="w-full px-1.5 py-1.5 glass-input text-[11px] border-slate-850"
                        placeholder="2022 - 2026"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">GPA / CGPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(eduIndex, 'gpa', e.target.value)}
                        className="w-full px-1.5 py-1.5 glass-input text-[11px] border-slate-850"
                        placeholder="9.2/10 CGPA"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Core Skills */}
          <div className="space-y-3.5 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">4. Core Skills and Expertise</h4>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type skill & press Enter..."
                className="flex-1 px-3 py-1.5 glass-input text-xs border-slate-800"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-950/30 border border-slate-850 rounded-xl">
                {skills.map(skill => (
                  <span
                    key={skill}
                    onClick={() => handleRemoveSkill(skill)}
                    className="inline-flex items-center gap-1 py-1 px-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-semibold rounded-md cursor-pointer hover:bg-purple-500/25 hover:text-white transition-all"
                  >
                    <span>{skill}</span>
                    <X className="h-3 w-3 text-purple-400 shrink-0" />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section: Projects */}
          <div className="space-y-4.5 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">5. Featured Projects</h4>
              <button
                type="button"
                onClick={addProject}
                className="p-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300 rounded transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {projects.map((proj, projIndex) => (
              <div key={projIndex} className="p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl space-y-3 relative">
                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(projIndex)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Project Name</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(projIndex, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="e.g. E-Commerce API"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-500 uppercase">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={(proj.tech || []).join(', ')}
                      onChange={(e) => updateProjectTech(projIndex, e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="e.g. React, Node, SQLite"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-slate-500 uppercase">Description</label>
                    <input
                      type="text"
                      value={proj.desc}
                      onChange={(e) => updateProject(projIndex, 'desc', e.target.value)}
                      className="w-full px-2.5 py-1.5 glass-input text-xs border-slate-850"
                      placeholder="e.g. Engineered transactional database routers..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: PORTFOLIO CV PREVIEW SHEET CARD */}
      <div className="space-y-4 no-print">
        {/* Glowing Download Bar */}
        <div className="glass-panel p-4 rounded-2xl flex justify-between items-center shadow-lg border border-slate-800/80">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic CV Exporter</h4>
            <p className="text-[9px] text-slate-500 font-light mt-0.5">Click actions to immediately download files in Word or high-res PDF.</p>
          </div>

          <div className="flex gap-2">
            {/* Word DOCX Downloader */}
            <button
              onClick={downloadDocx}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-purple-400 hover:text-purple-300 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Word (.doc)</span>
            </button>

            {/* Scoped PDF Printer */}
            <button
              onClick={printPdf}
              className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_10px_rgba(43,183,148,0.3)] text-white text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Printable Resume Sheet Canvas Card */}
        <div 
          id="printable-resume-card"
          className="bg-white rounded-2xl p-8 text-[#1a202c] shadow-2xl border border-slate-200 min-h-[720px] transition-all relative select-none"
        >
          {/* Header Row */}
          <div className="text-center pb-5 border-b-2 border-indigo-900">
            <h2 className="text-2xl font-black text-indigo-900 uppercase tracking-tight">{name || 'Your Full Name'}</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">Email: {email || 'your.email@example.com'} | Active Candidate Portfolio</p>
          </div>

          {/* Resume Sections */}
          <div className="mt-5 space-y-5">
            {/* Section: Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-950 pb-0.5 uppercase tracking-wide">Professional Summary</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-light">{summary || 'No professional summary written yet. Use the editor on the left to write one!'}</p>
            </div>

            {/* Section: Work Experience */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-950 pb-0.5 uppercase tracking-wide">Work Experience</h3>
              
              {experience.some(exp => exp.company || exp.role) ? (
                <div className="space-y-3">
                  {experience.map((exp, index) => {
                    if (!exp.company && !exp.role) return null;
                    return (
                      <div key={index} className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline font-bold text-[#2d3748]">
                          <span>{exp.role || 'Role Title'} at <span className="italic text-indigo-900">{exp.company || 'Company'}</span></span>
                          <span className="text-[10px] text-slate-500 font-light italic font-mono">{exp.duration || 'Duration'}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 font-light text-[11px] leading-relaxed">
                          {exp.highlights.map((hl, i) => {
                            if (!hl) return null;
                            return <li key={i}>{hl}</li>;
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-light">No work experience entries populated.</p>
              )}
            </div>

            {/* Section: Education */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-950 pb-0.5 uppercase tracking-wide">Education Background</h3>
              
              {education.some(edu => edu.school || edu.degree) ? (
                <div className="space-y-2">
                  {education.map((edu, index) => {
                    if (!edu.school && !edu.degree) return null;
                    return (
                      <div key={index} className="text-xs flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#2d3748]">{edu.degree || 'Degree'}</p>
                          <p className="text-indigo-900 font-medium italic text-[11px] mt-0.5">{edu.school || 'School/University'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 font-light italic font-mono text-[10px]">{edu.year || 'Year Span'}</p>
                          <p className="text-[10px] text-indigo-900 font-bold font-mono mt-0.5">GPA: {edu.gpa || 'N/A'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-light">No education details entered.</p>
              )}
            </div>

            {/* Section: Projects */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-950 pb-0.5 uppercase tracking-wide">Featured Projects</h3>
              
              {projects.some(p => p.name || p.desc) ? (
                <div className="space-y-2.5">
                  {projects.map((proj, index) => {
                    if (!proj.name && !proj.desc) return null;
                    return (
                      <div key={index} className="text-xs space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-[#2d3748]">
                          <span>{proj.name || 'Project Title'}</span>
                          <span className="text-[9px] text-indigo-900 font-mono">{(proj.tech || []).join(' | ')}</span>
                        </div>
                        <p className="text-slate-600 font-light text-[11px] leading-relaxed">{proj.desc}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-light">No project specifications provided.</p>
              )}
            </div>

            {/* Section: Core Skills */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-indigo-900 border-b border-indigo-950 pb-0.5 uppercase tracking-wide">Core Skills and Expertise</h3>
              {skills.length > 0 ? (
                <div className="text-[11px] text-slate-700 leading-relaxed font-semibold tracking-wide font-mono">
                  {skills.join(' | ')}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-light">No core skills tags added.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
