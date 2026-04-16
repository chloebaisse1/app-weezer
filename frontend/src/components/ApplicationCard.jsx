import React from 'react';
import { Activity, EyeOff } from 'lucide-react';

export function ApplicationCard({ app, onSelect }) {
  
  const statusId = app.status?.id ?? 0;
  const statusLabel = app.status?.label || 'NON SUIVI';
  const updatedAt = app.status?.updated_at || 'N/A';
  const healthScore = app.health_score ?? 0;

  const getTheme = (id) => {
    switch (id) {
      case 3: // UP
        return { 
          stroke: '#10b981', 
          text: 'text-emerald-600 dark:text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/20', 
          dot: 'bg-emerald-500' 
        };
      case 4: // WARNING
        return { 
          stroke: '#f59e0b', 
          text: 'text-amber-600 dark:text-amber-400', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/20', 
          dot: 'bg-amber-500' 
        };
      case 5: case 13: case 14: // DOWN
        return { 
          stroke: '#ef4444', 
          text: 'text-red-600 dark:text-red-400', 
          bg: 'bg-red-500/10', 
          border: 'border-red-500/20', 
          dot: 'bg-red-500' 
        };
      default: // NON SUIVI
        return { 
          stroke: '#64748b', 
          text: 'text-slate-500 dark:text-slate-400', 
          bg: 'bg-slate-100 dark:bg-slate-800/40', 
          border: 'border-slate-200 dark:border-white/5', 
          dot: 'bg-slate-400 dark:bg-slate-600' 
        };
    }
  };

  const theme = getTheme(statusId);

  return (
    <div 
      onClick={() => onSelect(app.id)}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-2xl hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all group flex flex-col justify-between h-full cursor-pointer active:scale-[0.98]"
    >
      
      {/* HEADER CARTE */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-[1000] text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {app.name}
          </h3>
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 tracking-widest uppercase mt-1 italic">
            Détails Télémétrie
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text} border ${theme.border} group-hover:scale-110 transition-transform`}>
          {statusId === 0 ? <EyeOff size={18} /> : <Activity size={18} />}
        </div>
      </div>

      {/* BODY : CERCLE DE SANTÉ & STATUT */}
      <div className="flex items-center gap-6 my-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100 dark:stroke-slate-800/50" strokeWidth="3.5" />
            <circle 
              cx="18" cy="18" r="16" fill="none" 
              stroke={theme.stroke} strokeWidth="3.5" 
              strokeDasharray={`${healthScore}, 100`} 
              strokeLinecap="round" 
              className="transition-all duration-1000 ease-out" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center leading-none">
              <span className={`text-xl font-[1000] tracking-tighter ${statusId === 0 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                {healthScore}<span className="text-[10px] ml-0.5">%</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Statut Actuel</p>
          <p className={`text-sm font-black italic uppercase tracking-tight ${theme.text}`}>
            {statusLabel}
          </p>
          <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${statusId !== 0 ? 'animate-pulse' : ''} ${theme.dot}`} />
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-tighter italic">
                Sync: {updatedAt}
              </span>
          </div>
        </div>
      </div>

      {/* FOOTER CARTE */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div className="text-[8px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
          {app.sensors_count || 0} Sondes Actives
        </div>
        <div className={`${theme.bg} ${theme.text} text-[9px] font-black px-3 py-1 rounded-md border ${theme.border} uppercase`}>
            {statusLabel}
        </div>
      </div>
    </div>
  );
}