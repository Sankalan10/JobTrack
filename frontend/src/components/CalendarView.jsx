import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, ExternalLink, Building2, Search } from 'lucide-react';

export default function CalendarView({ jobs, onSelectJob }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar search filter states
  const [calendarSearchQuery, setCalendarSearchQuery] = useState('');
  const [appliedCalendarSearch, setAppliedCalendarSearch] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (!appliedCalendarSearch) return true;
      const query = appliedCalendarSearch.toLowerCase().trim();
      return (
        job.company.toLowerCase().includes(query) ||
        job.role.toLowerCase().includes(query) ||
        (job.notes && job.notes.toLowerCase().includes(query)) ||
        (job.salary && job.salary.toLowerCase().includes(query))
      );
    });
  }, [jobs, appliedCalendarSearch]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper calculations for calendar grid
  const { calendarDays, monthYearLabel } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Starting day (0 = Sun, 6 = Sat)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Days in this month
    const totalDaysPrev = new Date(year, month, 0).getDate(); // Days in previous month

    const days = [];

    // 1. Previous month blank offsets
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = totalDaysPrev - i;
      const prevDateStr = new Date(year, month - 1, prevDay).toISOString().split('T')[0];
      days.push({
        dayNumber: prevDay,
        isCurrentMonth: false,
        dateString: prevDateStr
      });
    }

    // 2. Current Month active days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateString: dateStr
      });
    }

    // 3. Next month blank offsets (fill up to grid of 35 or 42)
    const remainingCells = days.length <= 35 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDateStr = new Date(year, month + 1, i).toISOString().split('T')[0];
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateString: nextDateStr
      });
    }

    return {
      calendarDays: days,
      monthYearLabel: `${monthNames[month]} ${year}`
    };
  }, [currentDate, year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group job interviews by date string "YYYY-MM-DD"
  const interviewsByDate = useMemo(() => {
    const grouped = {};
    filteredJobs.forEach(job => {
      if (job.interviewDate) {
        // Strip any timezone variables to match local date strings
        const dateStr = job.interviewDate.split('T')[0];
        if (!grouped[dateStr]) {
          grouped[dateStr] = [];
        }
        grouped[dateStr].push(job);
      }
    });
    return grouped;
  }, [filteredJobs]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl space-y-6">
      {/* Calendar header controller */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
            <CalendarDays className="h-5 w-5" />
          </div>
          <h3 className="text-md font-bold text-white tracking-wide">{monthYearLabel}</h3>
        </div>

        {/* Dynamic Calendar Search Engine */}
        <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-xs shrink-0">
          <div className="relative w-full">
            <input
              type="text"
              value={calendarSearchQuery}
              onChange={(e) => setCalendarSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedCalendarSearch(calendarSearchQuery);
                }
              }}
              placeholder="Search interview dates..."
              className="w-full bg-slate-950/50 hover:bg-slate-950/70 focus:bg-slate-950 border border-slate-800 focus:border-purple-600/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-light"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
          <button
            onClick={() => setAppliedCalendarSearch(calendarSearchQuery)}
            className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 shrink-0"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {appliedCalendarSearch && (
        <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-xl w-fit animate-fadeIn select-none">
          <span>Showing interviews matching: <strong className="text-purple-300">"{appliedCalendarSearch}"</strong></span>
          <button 
            onClick={() => {
              setCalendarSearchQuery('');
              setAppliedCalendarSearch('');
            }}
            className="ml-1 text-slate-500 hover:text-white cursor-pointer font-bold text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Seven days of the week headers */}
      <div className="grid grid-cols-7 gap-2.5 text-center select-none">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-slate-500 text-xs font-semibold uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid cells */}
      <div className="grid grid-cols-7 gap-2.5">
        {calendarDays.map((cell, index) => {
          const cellInterviews = interviewsByDate[cell.dateString] || [];
          const isToday = cell.dateString === todayStr;

          return (
            <div
              key={index}
              className={`min-h-[105px] p-2 border rounded-xl flex flex-col justify-between transition-all relative ${
                cell.isCurrentMonth
                  ? isToday
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-inner'
                    : 'bg-slate-900/20 border-slate-800 hover:border-slate-700/60'
                  : 'bg-slate-950/10 border-slate-900/60 opacity-30 cursor-not-allowed'
              }`}
            >
              {/* Day index number */}
              <div className="flex justify-between items-center mb-1 select-none">
                <span className={`text-[11px] font-semibold ${
                  isToday 
                    ? 'text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20' 
                    : cell.isCurrentMonth 
                      ? 'text-slate-400' 
                      : 'text-slate-600'
                }`}>
                  {cell.dayNumber}
                </span>
                {cellInterviews.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400 warning-pulse shrink-0" />
                )}
              </div>

              {/* Day scheduled interviews list */}
              <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 max-h-[70px]">
                {cellInterviews.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className={`p-1 px-1.5 rounded-lg border text-[9px] font-semibold truncate hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-1 select-none ${
                      job.status === 'OFFERED' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                    }`}
                    title={`${job.company} - ${job.role}`}
                  >
                    <span className="truncate flex-1">{job.company}</span>
                    <ExternalLink className="h-2 w-2 shrink-0 opacity-50 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
