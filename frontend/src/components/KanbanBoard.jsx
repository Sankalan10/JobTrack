import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Briefcase, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import JobCard from './JobCard';

const COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10' },
  { id: 'OFFERED', title: 'Offered', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10' }
];

export default function KanbanBoard({ jobs, onUpdateJobStatus, onSelectJob, onOpenNewJobModal }) {
  
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid column
    if (!destination) return;

    // Dropped in the same column at the same index
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Call state update handler to trigger PUT request
    onUpdateJobStatus(draggableId, destination.droppableId);
  };

  // Group jobs by column ID
  const groupedJobs = COLUMNS.reduce((acc, col) => {
    acc[col.id] = jobs.filter(job => job.status === col.id);
    return acc;
  }, {});

  const totalJobsCount = jobs.length;

  return (
    <div className="space-y-4">
      {/* Onboarding State for empty board */}
      {totalJobsCount === 0 && (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-6 mt-10">
          <div className="inline-flex p-4 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 animate-bounce">
            <Sparkles className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Your Funnel is Empty</h3>
            <p className="text-slate-400 text-sm font-light leading-relaxed">
              Start your job application tracking journey! Add your active job or internship applications, 
              then drag them across stages as you progress.
            </p>
          </div>
          <button
            onClick={() => onOpenNewJobModal()}
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(43,183,148,0.3)] hover:scale-105 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Track Your First Job</span>
          </button>
        </div>
      )}

      {totalJobsCount > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {COLUMNS.map((column) => {
              const columnJobs = groupedJobs[column.id] || [];

              return (
                <div key={column.id} className="flex flex-col rounded-2xl glass-panel p-4 max-h-[80vh] min-h-[500px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        column.id === 'APPLIED' ? 'bg-blue-500' :
                        column.id === 'INTERVIEWING' ? 'bg-purple-500' :
                        column.id === 'OFFERED' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      <h3 className="font-semibold text-sm text-slate-200">{column.title}</h3>
                    </div>
                    
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-md">
                      {columnJobs.length}
                    </span>
                  </div>

                  {/* Droppable Column Area */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-3 pr-1 min-h-[350px] transition-all rounded-xl ${
                          snapshot.isDraggingOver ? 'bg-slate-900/30 border border-dashed border-slate-800' : ''
                        }`}
                      >
                        {columnJobs.map((job, index) => (
                          <JobCard 
                            key={job.id} 
                            job={job} 
                            index={index} 
                            onSelectJob={onSelectJob}
                          />
                        ))}
                        {provided.placeholder}

                        {columnJobs.length === 0 && (
                          <div className="h-40 flex items-center justify-center border border-dashed border-slate-800/40 rounded-xl text-xs text-slate-600 font-light">
                            Drag jobs here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>

                  {/* Add Column-Specific Job Trigger */}
                  <button
                    onClick={() => onOpenNewJobModal(column.id)}
                    className={`w-full mt-4 py-2.5 border border-dashed rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${column.color} cursor-pointer`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to {column.title}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
