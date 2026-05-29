import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ThumbsUp, MessageSquare, Send, Briefcase, Building2, Sparkles, 
  Check, TrendingUp, Rss, ArrowRight, BookOpen, Clock, Award, Search,
  Edit3, Trash2, Bookmark, ChevronDown, ChevronUp, FolderOpen, X
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function FeedPortal({ jobs, onJobApplied, setView }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [applyingPostId, setApplyingPostId] = useState(null);
  const [visibleComments, setVisibleComments] = useState({}); // maps postId -> boolean

  // Current user info to identify post ownership
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('jobtrack_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);
  const currentUserId = currentUser?.id || '';

  // Edit / Delete / Draft states
  const [editingPostId, setEditingPostId] = useState(null);
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem('jobtrack_post_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');

  // Interactive Mentorship Form States
  const [mentorshipTopic, setMentorshipTopic] = useState('System Design');
  const [mentorshipDate, setMentorshipDate] = useState('');
  const [mentorshipTime, setMentorshipTime] = useState('');
  const [mentorshipReqs, setMentorshipReqs] = useState('');
  const [mentorshipContact, setMentorshipContact] = useState('demo@jobtrack.com');
  const [mentorshipSubmitted, setMentorshipSubmitted] = useState(false);
  const [mentorshipSubmitting, setMentorshipSubmitting] = useState(false);

  // Feed search states
  const [feedSearchQuery, setFeedSearchQuery] = useState('');
  const [appliedFeedSearch, setAppliedFeedSearch] = useState('');

  // Start a post (LinkedIn style) states
  const [newPostContent, setNewPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showJobLinker, setShowJobLinker] = useState(false);
  const [linkerRole, setLinkerRole] = useState('');
  const [linkerCompany, setLinkerCompany] = useState('');

  // Post action handlers
  const handleStartEditPost = (post) => {
    setEditingPostId(post.id);
    setNewPostContent(post.content);
    if (post.roleLink) {
      setLinkerRole(post.roleLink.role);
      setLinkerCompany(post.roleLink.company);
      setShowJobLinker(true);
    } else {
      setLinkerRole('');
      setLinkerCompany('');
      setShowJobLinker(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setNewPostContent('');
    setLinkerRole('');
    setLinkerCompany('');
    setShowJobLinker(false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await axios.delete(`${API_BASE}/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  };

  const handleSaveDraft = () => {
    if (!newPostContent.trim()) return;
    const newDraft = {
      id: Date.now().toString(),
      content: newPostContent.trim(),
      linkerRole: linkerRole.trim(),
      linkerCompany: linkerCompany.trim(),
      date: new Date().toLocaleString()
    };
    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem('jobtrack_post_drafts', JSON.stringify(updatedDrafts));
    
    setNewPostContent('');
    setLinkerRole('');
    setLinkerCompany('');
    setShowJobLinker(false);
    
    setDraftSavedMessage('Draft saved successfully! 📁');
    setTimeout(() => setDraftSavedMessage(''), 3000);
  };

  const handleLoadDraft = (draft) => {
    setNewPostContent(draft.content);
    if (draft.linkerRole || draft.linkerCompany) {
      setLinkerRole(draft.linkerRole || '');
      setLinkerCompany(draft.linkerCompany || '');
      setShowJobLinker(true);
    } else {
      setLinkerRole('');
      setLinkerCompany('');
      setShowJobLinker(false);
    }
    
    const updatedDrafts = drafts.filter(d => d.id !== draft.id);
    setDrafts(updatedDrafts);
    localStorage.setItem('jobtrack_post_drafts', JSON.stringify(updatedDrafts));
    
    setEditingPostId(null); // Load draft resets editing mode
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDraft = (draftId, e) => {
    if (e) e.stopPropagation();
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('jobtrack_post_drafts', JSON.stringify(updatedDrafts));
  };

  const handlePublishPost = async (e) => {
    if (e) e.preventDefault();
    if (!newPostContent.trim()) return;

    setPublishing(true);
    try {
      const roleLink = linkerRole.trim() && linkerCompany.trim()
        ? { role: linkerRole.trim(), company: linkerCompany.trim() }
        : null;

      if (editingPostId) {
        // Edit mode (PUT)
        const res = await axios.put(`${API_BASE}/posts/${editingPostId}`, {
          content: newPostContent.trim(),
          roleLink
        });
        
        setPosts(prev => prev.map(p => p.id === editingPostId ? { ...p, ...res.data } : p));
        setEditingPostId(null);
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 2000);
      } else {
        // Create mode (POST)
        const res = await axios.post(`${API_BASE}/posts`, {
          content: newPostContent.trim(),
          roleLink
        });
        
        // Add the new post to the top of the list!
        setPosts(prev => [res.data, ...prev]);
        setPublishSuccess(true);
        setTimeout(() => setPublishSuccess(false), 2000);
      }

      setNewPostContent('');
      setLinkerRole('');
      setLinkerCompany('');
      setShowJobLinker(false);
    } catch (err) {
      console.error('Error publishing post:', err);
      alert(err.response?.data?.error || 'Failed to publish post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!appliedFeedSearch) return true;
      const query = appliedFeedSearch.toLowerCase().trim();
      return (
        post.company.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query) ||
        post.authorTitle.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.roleLink && post.roleLink.role.toLowerCase().includes(query))
      );
    });
  }, [posts, appliedFeedSearch]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    // Optimistic UI updates
    const originalPosts = [...posts];
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked,
          likes: hasLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
        };
      }
      return post;
    }));

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`);
      // Update with exact server response state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: res.data.likes, hasLiked: res.data.hasLiked } 
          : post
      ));
    } catch (err) {
      console.error('Like error:', err);
      setPosts(originalPosts); // Rollback
    }
  };

  const toggleComments = (postId) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/comment`, { text });
      
      // Update comments in local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, res.data]
          };
        }
        return post;
      }));

      // Reset input
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      
      // Make comments section visible if it wasn't
      setVisibleComments(prev => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentTextChange = (postId, text) => {
    setCommentTexts(prev => ({
      ...prev,
      [postId]: text
    }));
  };

  const handleDirectApply = async (post) => {
    if (!post.roleLink) return;
    const { company, role } = post.roleLink;
    
    // Check if already applied to prevent double tracking
    const alreadyApplied = jobs.some(j => 
      j.company.toLowerCase() === company.toLowerCase() && 
      j.role.toLowerCase() === role.toLowerCase()
    );
    if (alreadyApplied) return;

    setApplyingPostId(post.id);

    // Extract potential salary package from the post text if possible, else default
    let parsedSalary = '';
    const salaryMatch = post.content.match(/(?:salary|package|stipend|base)(?:\s*offered)?:\s*(₹[0-9,\s]+(?:\s*LPA|\/month)?|[0-9,\s]+LPA|₹[0-9,\s]+)/i);
    if (salaryMatch) {
      parsedSalary = salaryMatch[1].trim();
    } else if (company === 'Google') {
      parsedSalary = '₹95,000/month';
    } else if (company === 'Stripe') {
      parsedSalary = '₹25,00,000 LPA';
    } else if (company === 'CRED') {
      parsedSalary = '₹28.5 LPA';
    } else if (company === 'Swiggy') {
      parsedSalary = '₹18 LPA';
    } else if (company === 'Zomato') {
      parsedSalary = '₹16 LPA';
    } else {
      parsedSalary = '₹15 LPA';
    }

    try {
      const jobPayload = {
        company: company,
        role: role,
        appliedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        status: 'APPLIED',
        salary: parsedSalary,
        notes: `Applied directly via the JobTrack Community Social Feed post by ${post.authorName}.`,
        checklist: [
          { id: 'ch1', text: 'Resume tailor and check', completed: true },
          { id: 'ch2', text: 'Prepare coding test basics', completed: false },
          { id: 'ch3', text: 'Review company tech architecture', completed: false }
        ]
      };

      // Call API to create job application
      await axios.post(`${API_BASE}/jobs`, jobPayload);
      
      // Let parent know a job has been created to refresh the main state list
      if (onJobApplied) {
        await onJobApplied();
      }
    } catch (err) {
      console.error('Direct apply error:', err);
    } finally {
      setApplyingPostId(null);
    }
  };

  // Check helper
  const isAlreadyApplied = (roleLink) => {
    if (!roleLink) return false;
    return jobs.some(j => 
      j.company.toLowerCase() === roleLink.company.toLowerCase() && 
      j.role.toLowerCase() === roleLink.role.toLowerCase()
    );
  };

  // Profile Stats
  const activeApplications = jobs.length;
  const interviewsCount = jobs.filter(j => j.status === 'INTERVIEWING').length;
  const offersCount = jobs.filter(j => j.status === 'OFFERED').length;

  // Custom Avatar Gradient Helper
  const getAvatarGradient = (company) => {
    const c = company.toLowerCase();
    if (c === 'google') return 'from-blue-600 via-red-500 to-yellow-500';
    if (c === 'stripe') return 'from-indigo-600 to-purple-500';
    if (c === 'swiggy') return 'from-orange-500 to-red-600';
    if (c === 'cred') return 'from-gray-900 via-slate-800 to-slate-900 border border-slate-700';
    if (c === 'zomato') return 'from-red-600 to-rose-700';
    if (c === 'student') return 'from-emerald-600 to-[#2bb794]';
    return 'from-[#2bb794] to-[#10b981]';
  };

  // Helper to parse content hashtags
  const renderFormattedContent = (content) => {
    const words = content.split(' ');
    return words.map((word, idx) => {
      if (word.startsWith('#')) {
        return (
          <span key={idx} className="text-purple-400 font-medium hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('🚀') || word.startsWith('🔥') || word.startsWith('💻') || word.startsWith('💡') || word.startsWith('🌟') || word.startsWith('📈')) {
        return <span key={idx} className="text-lg">{word} </span>;
      }
      return word + ' ';
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Candidate Micro Profile */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-[#2bb794]/20 opacity-80" />
          
          <div className="relative mt-8 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#2bb794] to-[#10b981] text-white font-bold text-lg flex items-center justify-center shadow-lg border border-slate-800">
              CANDIDATE
            </div>
          </div>

          <div className="relative mt-4">
            <h3 className="font-bold text-white text-base tracking-tight">Active Candidate</h3>
            <p className="text-slate-400 text-xs mt-1">demo@jobtrack.com</p>
          </div>

          <hr className="border-slate-800/80 my-5" />

          {/* Core Mini Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-2.5">
              <span className="block text-xs text-slate-500">Tracked</span>
              <span className="block text-base font-bold text-white mt-0.5">{activeApplications}</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-2.5">
              <span className="block text-xs text-slate-500">Interviews</span>
              <span className="block text-base font-bold text-purple-400 mt-0.5">{interviewsCount}</span>
            </div>
            <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-2.5">
              <span className="block text-xs text-slate-500">Offers</span>
              <span className="block text-base font-bold text-emerald-400 mt-0.5">{offersCount}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <button
              onClick={() => setView('board')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5 text-purple-400" />
              <span>Open Kanban Board</span>
            </button>

            <button
              onClick={() => setView('resume')}
              className="w-full py-2 px-3 rounded-xl bg-purple-950/15 hover:bg-purple-950/25 border border-purple-500/10 hover:border-purple-500/20 text-purple-300 hover:text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Award className="h-3.5 w-3.5 text-purple-400" />
              <span>ATS CV Builder</span>
            </button>
          </div>
        </div>

        {/* ATS Quote Widget */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-3 relative overflow-hidden bg-gradient-to-tr from-purple-950/10 to-indigo-950/10">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">ATS Tip of the Day</h4>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed font-light">
            "Before clicking <strong className="text-purple-300 font-semibold">Apply Direct</strong>, make sure your resume lists custom keywords such as <code className="text-slate-400 bg-slate-950/80 px-1 py-0.5 rounded">Vite</code> or <code className="text-slate-400 bg-slate-950/80 px-1 py-0.5 rounded">Tailwind</code> under core expertise. This maximizes ATS keyword scores up to 98% instantly!"
          </p>
        </div>
      </div>

      {/* CENTER COLUMN: The Social Feed Stream */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Feed Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/85">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Rss className="h-4 w-4 text-purple-400" />
              <span>Recruiting Social Stream</span>
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-light">
              Connect directly with verified premium recruiters representing Google, Stripe, CRED & Swiggy.
            </p>
          </div>
          
          <button 
            onClick={fetchPosts} 
            className="text-xs text-purple-400 hover:text-purple-300 transition-all font-semibold flex items-center gap-1 cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 px-3 py-1.5 border border-purple-500/10 hover:border-purple-500/20 rounded-xl"
          >
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Shimmer Load State */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(n => (
              <div key={n} className="glass-card rounded-2xl p-6 border border-slate-800/60 space-y-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-800" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-800 rounded w-2/5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                </div>
                <div className="h-16 bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Start a Post (LinkedIn style) */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4 text-left relative overflow-hidden bg-gradient-to-tr from-indigo-950/15 via-[#0d1220]/60 to-[#0d1220]/60 animate-fadeIn">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2BB794] via-[#ffd167] to-[#10b981]" />
              
              {/* Editing Mode Indicator */}
              {editingPostId && (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-400 text-[11px] font-semibold select-none animate-fadeIn">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5 animate-pulse" />
                    <span>You are currently editing a post. Saving will update the feed.</span>
                  </span>
                  <button
                    onClick={handleCancelEdit}
                    className="text-slate-400 hover:text-white font-bold cursor-pointer text-[10px] flex items-center gap-0.5 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              {/* Draft Saved Success Indicator */}
              {draftSavedMessage && (
                <div className="bg-[#2BB794]/10 border border-[#2BB794]/20 text-[#2BB794] px-3 py-1.5 rounded-xl text-[11px] font-bold select-none animate-fadeIn">
                  {draftSavedMessage}
                </div>
              )}

              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#2BB794] to-[#10b981] text-slate-950 font-black text-[10px] flex items-center justify-center shadow-md select-none shrink-0">
                  YOU
                </div>
                
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What is on your mind? Share your ideas, thoughts, or internship goals..."
                  rows={2}
                  className="flex-1 bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-850 focus:border-[#2BB794] rounded-xl px-4 py-3 text-xs text-slate-205 outline-none transition-all resize-none placeholder:text-slate-650 font-medium"
                />
              </div>

              {/* Slide-down Job Linker Panel */}
              {showJobLinker && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-950/40 border border-slate-900 rounded-xl select-none animate-fadeIn">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Job Title / Opening</label>
                    <input
                      type="text"
                      value={linkerRole}
                      onChange={(e) => setLinkerRole(e.target.value)}
                      placeholder="e.g. SDE Intern, Frontend Developer"
                      className="w-full bg-[#0d1322] border border-slate-850 focus:border-[#2BB794] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Company Name</label>
                    <input
                      type="text"
                      value={linkerCompany}
                      onChange={(e) => setLinkerCompany(e.target.value)}
                      placeholder="e.g. Google, Swiggy, Stripe"
                      className="w-full bg-[#0d1322] border border-slate-850 focus:border-[#2BB794] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-between items-center pt-2.5 border-t border-slate-900 select-none">
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setNewPostContent(prev => prev + ' 🚀')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white text-xs cursor-pointer animate-fadeIn"
                  >
                    🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostContent(prev => prev + ' 💻')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white text-xs cursor-pointer animate-fadeIn"
                  >
                    💻
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostContent(prev => prev + ' 💡')}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white text-xs cursor-pointer animate-fadeIn"
                  >
                    💡
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPostContent(prev => prev + ' #Opportunity')}
                    className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white text-[10px] font-mono cursor-pointer animate-fadeIn"
                  >
                    #Opportunity
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowJobLinker(!showJobLinker)}
                    className={`py-1 px-2.5 rounded-lg border text-[10px] font-black cursor-pointer flex items-center gap-1 transition-all ${
                      showJobLinker || (linkerRole.trim() && linkerCompany.trim())
                        ? 'bg-[#2BB794]/10 border-[#2BB794]/30 text-[#2BB794]'
                        : 'bg-slate-900 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Briefcase className="h-3 w-3" />
                    <span>💼 Link Job</span>
                    {(linkerRole.trim() && linkerCompany.trim()) && <span className="h-1.5 w-1.5 rounded-full bg-[#2BB794]" />}
                  </button>

                  {/* Save Draft Option */}
                  {newPostContent.trim() && !editingPostId && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="py-1 px-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all animate-fadeIn"
                      title="Save this post as a draft locally"
                    >
                      <Bookmark className="h-3 w-3" />
                      <span>Save Draft</span>
                    </button>
                  )}

                  {/* My Saved Drafts Toggle */}
                  {drafts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowDrafts(!showDrafts)}
                      className="py-1 px-2.5 rounded-lg bg-slate-950/50 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <FolderOpen className="h-3 w-3 text-purple-400" />
                      <span>My Drafts ({drafts.length})</span>
                      {showDrafts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingPostId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="py-1.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-400 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer animate-fadeIn"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handlePublishPost}
                    disabled={publishing || !newPostContent.trim()}
                    className="py-1.5 px-4.5 bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#35c3a0] hover:to-[#12c48b] disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shadow-[0_0_12px_rgba(43,183,148,0.2)]"
                  >
                    {publishing 
                      ? 'Publishing...' 
                      : publishSuccess 
                      ? 'Saved! 🎉' 
                      : editingPostId 
                      ? 'Update Post' 
                      : 'Share Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Persistent Drafts Tray */}
            {showDrafts && drafts.length > 0 && (
              <div className="glass-card rounded-2xl p-4.5 border border-purple-500/10 space-y-3 bg-gradient-to-tr from-purple-950/10 via-slate-950/50 to-slate-950/50 select-none animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-purple-400 animate-pulse" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">My Saved Drafts</h4>
                  </div>
                  <button 
                    onClick={() => setShowDrafts(false)}
                    className="text-slate-500 hover:text-slate-350 cursor-pointer text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {drafts.map((draft) => (
                    <div 
                      key={draft.id} 
                      onClick={() => handleLoadDraft(draft)}
                      className="bg-slate-950/60 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 p-3 rounded-xl flex justify-between items-start gap-4 cursor-pointer transition-all hover:scale-[1.005] group"
                    >
                      <div className="space-y-1 text-left min-w-0 flex-1">
                        <p className="text-slate-300 text-xs font-light line-clamp-2 leading-relaxed break-words">{draft.content}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] text-slate-500 font-light">
                          <span>Saved: {draft.date}</span>
                          {(draft.linkerRole || draft.linkerCompany) && (
                            <>
                              <span>•</span>
                              <span className="text-[#2BB794] font-medium flex items-center gap-0.5">
                                <Briefcase className="h-2.5 w-2.5" />
                                {draft.linkerRole} at {draft.linkerCompany}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-rose-950/40 text-slate-500 hover:text-rose-400 transition-all shrink-0 cursor-pointer"
                        title="Delete Draft"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Feed Search Bar */}
            <div className="flex items-center gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900 select-none animate-fadeIn">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={feedSearchQuery}
                  onChange={(e) => setFeedSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setAppliedFeedSearch(feedSearchQuery);
                    }
                  }}
                  placeholder="Search posts by company, recruiter, role, keywords..."
                  className="w-full bg-slate-950/60 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-205 outline-none transition-all placeholder:text-slate-600 font-light"
                />
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-505" />
              </div>
              
              <button
                onClick={() => setAppliedFeedSearch(feedSearchQuery)}
                className="py-2 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
              >
                Search
              </button>
            </div>

            {appliedFeedSearch && (
              <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/5 border border-purple-500/10 px-3.5 py-2 rounded-xl w-fit select-none animate-fadeIn">
                <span>Showing posts matching: <strong className="text-purple-300">"{appliedFeedSearch}"</strong> ({filteredPosts.length} found)</span>
                <button 
                  onClick={() => {
                    setFeedSearchQuery('');
                    setAppliedFeedSearch('');
                  }}
                  className="ml-1 text-slate-500 hover:text-white cursor-pointer font-bold text-sm"
                >
                  ×
                </button>
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 border border-slate-800/80 text-center space-y-3">
                <p className="text-slate-400 text-sm">No recruiting updates match your search criteria.</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const applied = isAlreadyApplied(post.roleLink);
                const showComments = !!visibleComments[post.id];

                return (
                  <article key={post.id} className="glass-card rounded-2xl p-6 border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-all duration-300 relative shadow-md">
                    
                    {/* Post Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        {/* Elegant Company Avatar */}
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${getAvatarGradient(post.company)} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                          {post.avatarText}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-bold text-sm text-slate-100 break-words">{post.authorName}</span>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none border ${
                              post.isJoobleSourced
                                ? 'bg-[#ffd167]/10 border-[#ffd167]/25 text-[#ffd167] animate-pulse'
                                : post.company.toLowerCase() === 'student'
                                ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                : 'bg-[#2BB794]/10 border-[#2BB794]/20 text-[#2BB794]'
                            }`}>
                              {post.isJoobleSourced 
                                ? 'Jooble Live Feed 💎' 
                                : post.company.toLowerCase() === 'student' 
                                ? 'Student Member 🎓' 
                                : 'Verified Recruiter 💼'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-light break-words">{post.authorTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{post.date}</span>
                        </div>

                        {post.userId === currentUserId && (
                          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800/80 pl-2.5 animate-fadeIn">
                            <button
                              onClick={() => handleStartEditPost(post)}
                              className="p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
                              title="Edit Post"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Body Content */}
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-light break-words overflow-hidden">
                      {renderFormattedContent(post.content)}
                    </p>

                    {/* Optional Post Media Graphic (LinkedIn style) */}
                    {post.postImage && (
                      <div className="w-full overflow-hidden rounded-xl border border-slate-800/60 shadow-inner group-hover:border-slate-700/50 transition-all duration-300 relative select-none">
                        <img 
                          src={post.postImage} 
                          alt="Recruitment Highlight" 
                          className="w-full max-h-[260px] sm:max-h-[320px] object-cover hover:scale-[1.012] transition-all duration-500 ease-out"
                        />
                      </div>
                    )}

                    {/* Role Highlight Card for Apply Direct */}
                    {post.roleLink && (
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700/60 transition-all relative overflow-hidden group">
                        {/* Glow accent */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-600 to-indigo-600" />
                        
                        <div className="space-y-1 pl-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                            <Briefcase className="h-3 w-3" />
                            <span>Featured Opening</span>
                          </div>
                          <h4 className="font-bold text-xs text-white tracking-tight">{post.roleLink.role}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-light">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-500" />
                              {post.roleLink.company}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">
                              {post.company === 'Google' ? '₹95,000/mo stipend' : 
                               (post.company === 'Stripe' ? '₹25 LPA base' : 
                               (post.company === 'CRED' ? '₹28.5 LPA base' : 
                               (post.company === 'Swiggy' ? '₹18 LPA package' : '₹16 LPA package')))}
                            </span>
                          </div>
                        </div>

                        <div className="w-full md:w-auto self-stretch md:self-auto flex items-center justify-end">
                          {applied ? (
                            <button
                              disabled
                              className="w-full md:w-auto py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Check className="h-4 w-4" />
                              <span>Funnel Tracked</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDirectApply(post)}
                              disabled={applyingPostId === post.id}
                              className="w-full md:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md hover:shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
                            >
                              {applyingPostId === post.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Tracking...</span>
                                </>
                              ) : (
                                <>
                                  <span>Apply Direct</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactive Mentorship / Interview Topic Request Form */}
                    {post.isFormPost && (
                      <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden text-left space-y-4 shadow-inner animate-fadeIn">
                        {/* Elegant Green Border Accent */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#2BB794]" />
                        
                        <div className="flex items-center gap-2 select-none">
                          <Sparkles className="h-4 w-4 text-[#2BB794] animate-pulse" />
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider">Mentorship & Mock Session Request</h4>
                        </div>

                        {mentorshipSubmitted ? (
                          <div className="bg-[#2BB794]/10 border border-[#2BB794]/20 rounded-xl p-5 text-center space-y-3 animate-fadeIn select-none">
                            <div className="h-10 w-10 rounded-full bg-[#2BB794] text-white flex items-center justify-center mx-auto shadow-md">
                              <Check className="h-5 w-5 stroke-[3]" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-100">Mentorship Request Registered!</h5>
                              <p className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed">
                                Your requirement details for <strong className="text-[#2BB794]">"{mentorshipTopic}"</strong> have been submitted to Rohan Sen's team. We will review and contact you at <span className="text-[#2BB794] underline">{mentorshipContact || 'demo@jobtrack.com'}</span> shortly.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMentorshipSubmitted(false);
                                setMentorshipReqs('');
                                setMentorshipDate('');
                                setMentorshipTime('');
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-350 font-semibold cursor-pointer underline hover:no-underline"
                            >
                              Submit Another Request
                            </button>
                          </div>
                        ) : (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              setMentorshipSubmitting(true);
                              setTimeout(() => {
                                setMentorshipSubmitting(false);
                                setMentorshipSubmitted(true);
                              }, 1200);
                            }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Topic Selection */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Interview Topic</label>
                                <select
                                  required
                                  value={mentorshipTopic}
                                  onChange={(e) => setMentorshipTopic(e.target.value)}
                                  className="w-full bg-[#0d1322] border border-slate-800 focus:border-[#2BB794] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-medium"
                                >
                                  <option value="System Design">System Design (High Concurrency)</option>
                                  <option value="Data Structures & Algorithms">Data Structures & Algorithms (LeetCode)</option>
                                  <option value="Frontend Architecture">Frontend Architecture (Vite, React HMR)</option>
                                  <option value="ATS Resume Optimization">ATS Resume Optimization</option>
                                  <option value="Product Management Case Studies">Product Management Case Studies</option>
                                </select>
                              </div>

                              {/* Contact Email */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Preferred Contact</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g. demo@jobtrack.com"
                                  value={mentorshipContact}
                                  onChange={(e) => setMentorshipContact(e.target.value)}
                                  className="w-full bg-[#0d1322] border border-slate-800 focus:border-[#2BB794] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all font-light"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Date Selection */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Preferred Date</label>
                                <input
                                  type="date"
                                  required
                                  value={mentorshipDate}
                                  onChange={(e) => setMentorshipDate(e.target.value)}
                                  className="w-full bg-[#0d1322] border border-slate-800 focus:border-[#2BB794] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all cursor-pointer"
                                />
                              </div>

                              {/* Time Selection */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Preferred Time</label>
                                <input
                                  type="time"
                                  required
                                  value={mentorshipTime}
                                  onChange={(e) => setMentorshipTime(e.target.value)}
                                  className="w-full bg-[#0d1322] border border-slate-800 focus:border-[#2BB794] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Requirements Textarea */}
                            <div className="space-y-1.5">
                              <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Custom Requirements / Focus Topics</label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Describe specific topics you want to cover (e.g. distributed caches, trie trees, React hooks optimization...)"
                                value={mentorshipReqs}
                                onChange={(e) => setMentorshipReqs(e.target.value)}
                                className="w-full bg-[#0d1322] border border-slate-800 focus:border-[#2BB794] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-600 font-light"
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={mentorshipSubmitting}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2BB794] to-[#10b981] hover:from-[#35c3a0] hover:to-[#12c48b] hover:shadow-[0_0_15px_rgba(43,183,148,0.4)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                            >
                              {mentorshipSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Submitting Details...</span>
                                </>
                              ) : (
                                <>
                                  <span>Submit Prep Requirements</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    <hr className="border-slate-800/80 my-3" />

                    {/* Like & Comment Action Buttons */}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-xs font-semibold py-1.5 px-3.5 rounded-xl cursor-pointer transition-all ${
                          post.hasLiked
                            ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-sm shadow-purple-950/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${post.hasLiked ? 'fill-purple-400 text-purple-400' : ''}`} />
                        <span>{post.likes} Likes</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 text-xs font-semibold py-1.5 px-3.5 rounded-xl cursor-pointer transition-all ${
                          showComments 
                            ? 'bg-slate-900 text-slate-200 border border-slate-800' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments.length} Comments</span>
                      </button>
                    </div>

                    {/* Comments Tray Drawer */}
                    {showComments && (
                      <div className="mt-4 space-y-4 pt-4 border-t border-slate-800/60 animate-fadeIn">
                        
                        {/* List of comments */}
                        {post.comments.length > 0 && (
                          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="bg-slate-950/40 border border-slate-900/80 p-3 rounded-xl flex gap-3 items-start text-left">
                                <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600/30 text-white font-bold text-[10px] flex items-center justify-center uppercase shrink-0">
                                  {comment.author.split(' ').map(n => n[0]).join('').slice(0,2)}
                                </div>
                                <div className="flex-1 space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[11px] text-slate-200">{comment.author}</span>
                                    <span className="text-[9px] text-slate-500 font-light">{comment.date}</span>
                                  </div>
                                  <p className="text-slate-400 text-xs font-light leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Inline Comment Input Area */}
                        <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Share your thoughts or ask a question..."
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                            className="flex-1 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800/80 focus:border-purple-600/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
                          />
                          <button
                            type="submit"
                            disabled={submittingComment[post.id] || !(commentTexts[post.id] || '').trim()}
                            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer hover:shadow-purple-950/40"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>

                      </div>
                    )}

                  </article>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Hiring Highlights & Active Recruiters */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Active Companies & Openings */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-purple-400" />
              <span>Partner Hubs</span>
            </h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Top-tier represented brands</p>
          </div>

          <div className="space-y-3.5">
            {[
              { name: 'Google', roles: 'Software Engineer Intern', active: true, color: 'text-blue-400 bg-blue-500/5' },
              { name: 'Stripe', roles: 'Security Engineer', active: true, color: 'text-indigo-400 bg-indigo-500/5' },
              { name: 'Swiggy', roles: 'Frontend Developer', active: true, color: 'text-orange-400 bg-orange-500/5' },
              { name: 'CRED', roles: 'iOS Engineer', active: true, color: 'text-slate-300 bg-slate-700/10' },
              { name: 'Zomato', roles: 'Associate Product Manager', active: true, color: 'text-rose-400 bg-rose-500/5' }
            ].map((company) => (
              <div key={company.name} className="flex justify-between items-center bg-slate-950/30 border border-slate-900/60 p-2.5 rounded-xl hover:border-slate-800 transition-all">
                <div className="space-y-0.5 text-left">
                  <span className="block font-bold text-xs text-slate-200">{company.name}</span>
                  <span className="block text-[10px] text-slate-500 font-light truncate max-w-[130px]">{company.roles}</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border border-purple-500/10 bg-purple-500/5 text-purple-400 uppercase tracking-wider shrink-0 animate-pulse">
                  Hiring
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prep guides panel */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4">
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              <span>Prep Resource Center</span>
            </h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Cracking top-tier technical funnels</p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'System Design cheat sheet', time: '5 min read', icon: Award },
              { title: 'Google DS & Algo prep framework', time: '12 min read', icon: Sparkles },
              { title: 'Vibrant React Microfrontends guide', time: '8 min read', icon: BookOpen }
            ].map((resource, i) => {
              const IconComp = resource.icon;
              return (
                <a key={i} href="#" className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-900/60 transition-all text-left group">
                  <div className="p-2 bg-slate-900 border border-slate-800 group-hover:border-slate-700 text-slate-400 group-hover:text-purple-400 rounded-lg shrink-0 transition-all">
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[11px] text-slate-300 leading-tight group-hover:text-white transition-all">{resource.title}</h5>
                    <span className="text-[9px] text-slate-500 font-light block mt-0.5">{resource.time}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
