import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, IndianRupee, CheckSquare, Link as LinkIcon } from 'lucide-react';

export default function JobCard({ job, index, onSelectJob }) {
  
  // Custom deterministic avatar colors based on company name hash
  const getAvatarColors = (name = 'C') => {
    const colors = [
      { from: 'from-blue-600', to: 'to-indigo-500', text: 'text-blue-100' },
      { from: 'from-purple-600', to: 'to-indigo-500', text: 'text-purple-100' },
      { from: 'from-emerald-600', to: 'to-teal-500', text: 'text-emerald-100' },
      { from: 'from-rose-600', to: 'to-amber-500', text: 'text-rose-100' },
      { from: 'from-cyan-600', to: 'to-blue-500', text: 'text-cyan-100' }
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const nameInitial = job.company ? job.company.trim().charAt(0).toUpperCase() : 'J';
  const theme = getAvatarColors(job.company);

  // Parse checklist data
  let parsedChecklist = [];
  try {
    parsedChecklist = typeof job.checklist === 'string' ? JSON.parse(job.checklist) : job.checklist || [];
  } catch (err) {
    parsedChecklist = [];
  }

  const checklistTotal = parsedChecklist.length;
  const checklistCompleted = parsedChecklist.filter(item => item.done).length;

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelectJob(job)}
          className={`glass-card p-4 rounded-xl shadow-md cursor-pointer block select-none border border-slate-800 ${
            snapshot.isDragging ? 'shadow-2xl border-purple-500/40 ring-1 ring-purple-500/20 scale-[1.02] bg-slate-800/80' : ''
          }`}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'transform 0.1s ease, background-color 0.2s ease, border-color 0.2s ease'
          }}
        >
          <div className="flex gap-3 items-start">
            {/* Unique Company Logo Avatar */}
            <div className={`h-9 w-9 rounded-xl shrink-0 bg-gradient-to-br ${theme.from} ${theme.to} flex items-center justify-center font-bold text-sm ${theme.text} shadow-inner`}>
              {nameInitial}
            </div>

            {/* Title Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-purple-400 transition-colors">
                {job.role}
              </h4>
              <p className="text-xs text-slate-400 font-light truncate mt-0.5">{job.company}</p>
            </div>
          </div>

          {/* Separation line */}
          <div className="my-3 border-t border-slate-800/60" />

          {/* Badges / Metrics Footer */}
          <div className="flex flex-wrap gap-2 items-center text-[10px]">
            {/* Applied Date */}
            <div className="flex items-center gap-1 text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800/40">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Prospective Salary */}
            {job.salary && (
              <div className="flex items-center gap-0.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 font-medium">
                <IndianRupee className="h-3 w-3 shrink-0" />
                <span>{job.salary.startsWith('₹') ? job.salary : `₹${job.salary}`}</span>
              </div>
            )}

            {/* Checklist Progress */}
            {checklistTotal > 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md border font-mono ${
                checklistCompleted === checklistTotal 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              }`}>
                <CheckSquare className="h-3 w-3" />
                <span>{checklistCompleted}/{checklistTotal}</span>
              </div>
            )}

            {/* Job URL indicator */}
            {job.descriptionUrl && (
              <div className="p-1 text-slate-500 bg-slate-900/30 border border-slate-800/30 rounded-md ml-auto hover:text-purple-400 transition-colors">
                <LinkIcon className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
