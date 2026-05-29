import React, { useMemo } from 'react';
import { Calendar, TrendingUp, Award, Layers, IndianRupee, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export default function Dashboard({ jobs, onSelectJob }) {
  // Statistics Calculations
  const stats = useMemo(() => {
    const total = jobs.length;
    const interviewing = jobs.filter(j => j.status === 'INTERVIEWING').length;
    const offered = jobs.filter(j => j.status === 'OFFERED').length;
    const applied = jobs.filter(j => j.status === 'APPLIED').length;

    const interviewRate = total > 0 ? Math.round((interviewing / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offered / total) * 100) : 0;

    return { total, interviewing, offered, applied, interviewRate, offerRate };
  }, [jobs]);

  // Upcoming Interviews List (Interviews scheduled in the future)
  const upcomingInterviews = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return jobs
      .filter(j => j.interviewDate && j.interviewDate >= today)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
      .slice(0, 4); // Limit to top 4 upcoming
  }, [jobs]);

  // Chart Data: Group applications by date
  const chartTimelineData = useMemo(() => {
    const grouped = {};
    jobs.forEach(job => {
      const date = job.appliedDate || 'Unknown';
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Applications: grouped[date]
      }))
      .slice(-7); // Last 7 days with applications
  }, [jobs]);

  // Chart Data: Salary by Company (Only for jobs with salaries)
  const chartSalaryData = useMemo(() => {
    return jobs
      .filter(job => job.salary)
      .map(job => {
        // Clean salary string to integer (e.g. "$120,000" -> 120000)
        const numeric = parseInt(job.salary.replace(/[^0-9]/g, ''), 10);
        return {
          company: job.company,
          salary: isNaN(numeric) ? 0 : numeric,
          displaySalary: job.salary
        };
      })
      .filter(item => item.salary > 0)
      .slice(0, 6); // Top 6 for space
  }, [jobs]);

  // Helper to format days remaining
  const getDaysRemaining = (targetDate) => {
    const diffTime = new Date(targetDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Interview Rate</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.interviewRate}%</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Offers Received</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.offered}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Funnel</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats.interviewing + stats.applied}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications Timeline */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Application Velocity</h3>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Recent Activity
              </span>
            </div>
            
            <div className="h-[220px] w-full">
              {chartTimelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTimelineData}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2bb794" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2bb794" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis allowDecimals={false} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Applications" stroke="#2bb794" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-light">
                  <p>Add job applications to view your application timeline</p>
                </div>
              )}
            </div>
          </div>

          {/* Salary Dashboard */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Prospective Salaries</h3>
              <div className="p-1.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>

            <div className="h-[220px] w-full">
              {chartSalaryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartSalaryData}>
                    <XAxis dataKey="company" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      formatter={(value, name, props) => [`₹${value.toLocaleString('en-IN')}`, 'Salary']}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="salary" fill="#2bb794" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-light">
                  <p>Add salary numbers to job cards to populate this chart</p>
                  <p className="text-xs text-slate-600 mt-1">Example format: ₹8,00,000 or 600000</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Deadlines Widget */}
          <div className="glass-panel rounded-2xl p-5 shadow-xl relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-amber-500 opacity-60" />
            
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-400" />
              <span>Upcoming Interviews</span>
            </h3>

            {upcomingInterviews.length > 0 ? (
              <div className="space-y-3.5">
                {upcomingInterviews.map((job) => (
                  <div 
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="flex flex-col gap-1 p-3.5 bg-slate-900/50 border border-slate-800 hover:border-rose-500/30 rounded-xl cursor-pointer transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-white truncate max-w-[130px]">{job.company}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 warning-pulse shrink-0">
                        {getDaysRemaining(job.interviewDate)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 font-light truncate">{job.role}</p>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                      <span>Date: {new Date(job.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-0.5 text-purple-400 hover:underline">
                        Details <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center text-slate-500 text-xs font-light space-y-2">
                <span className="text-3xl">🎉</span>
                <p>No upcoming interviews scheduled.</p>
                <p className="text-[10px] text-slate-600">Open a job card and set an interview date to schedule reminders.</p>
              </div>
            )}
          </div>

          {/* Tips / Resume Builder Widget */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-purple-500" />
            <h4 className="font-semibold text-sm text-white mb-2">Resume Optimization Tip</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Always cross-reference the keywords from the **Job Description URL** inside the Job Details page. 
              Checking off targeted skills increases interview chances by **40%**!
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-purple-400 font-medium cursor-default">
              <span>Optimizing with JobTrack</span>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
