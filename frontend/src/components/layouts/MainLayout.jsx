import React from 'react';
import { DashboardHeader } from '../DashboardHeader';


export function MainLayout({ children, stats, onNavigateHome }) {
  
  const lastCheckTime = 
    stats?.last_sync ||                         // Vue 3 (Application)
    stats?.global_stats?.last_check ||          // Vue 1 (Global)
    stats?.updated_at ||                        // Vue 2 (Famille)
    new Date().toLocaleTimeString('fr-FR');

  const normalizedStats = {
    ...stats,
    global_stats: {
      ...stats?.global_stats,
      
      enterprise_health: stats?.global_stats?.enterprise_health || stats?.global_health || 0,
      total_apps: stats?.global_stats?.total_apps || 0,
      alerts_count: stats?.global_stats?.alerts_count || 0
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white transition-colors duration-500">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-6 flex-grow">
        
        {/* Header avec indicateurs temps réel */}
        <DashboardHeader
          stats={normalizedStats} 
          lastCheck={lastCheckTime}
          onNavigateHome={onNavigateHome}
        />

        {/* Contenu principal : Grid ou Vues détaillées */}
        <main className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </main>
      </div>

     
      <footer className="w-full border-t border-slate-200 dark:border-white/5 py-8 mt-12 transition-colors duration-500 bg-slate-50/50 dark:bg-transparent">
        <div className="mx-auto max-w-[1600px] px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-[900] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-600">
          <div className="flex items-center gap-2.5">
            {/* Pastille status système */}
            <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] animate-pulse" />
            NEBULA MONITORING SYSTEM 2026.
          </div>
          <div className="opacity-70 tracking-[0.3em] italic">
            &copy; {new Date().getFullYear()} LEADER SYS IT DEPT.
          </div>
        </div>
      </footer>
    </div>
  );
}