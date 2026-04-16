import React from 'react';
import { DashboardHeader } from '../DashboardHeader';

/**
 * MainLayout - Structure Globale compatible Mode Sombre / Clair
 */
export function MainLayout({ children, stats, onNavigateHome }) {
  
 
  const lastCheckTime = 
    stats?.last_sync ||                         // Vue 3 (Application)
    stats?.global_stats?.last_check ||          // Vue 1 (Accueil)
    stats?.updated_at ||                        // Vue 2 (Famille)
    new Date().toLocaleTimeString('fr-FR');

 
  const normalizedStats = {
    ...stats,
    global_stats: {
      ...stats?.global_stats,
      enterprise_health: stats?.global_stats?.enterprise_health || stats?.global_health || 0
    }
  };

  return (
    
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-blue-500/30 selection:text-white transition-colors duration-500">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-6 flex-grow">
        
        <DashboardHeader
          stats={normalizedStats} 
          lastCheck={lastCheckTime}
          onNavigateHome={onNavigateHome}
        />

        {/* Contenu principal */}
        <main className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </main>
      </div>

      {/* FOOTER : Adapté pour le mode clair */}
      <footer className="w-full border-t border-slate-200 dark:border-white/5 py-8 mt-12 transition-colors duration-500">
        <div className="mx-auto max-w-[1600px] px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-[#E30613] shadow-[0_0_8px_#E30613] animate-pulse" />
            WEEZER MONITORING SYSTEM V2.0
          </div>
          <div className="opacity-70 tracking-[0.3em]">
            &copy; {new Date().getFullYear()} LEADER SYS IT DEPT.
          </div>
        </div>
      </footer>
    </div>
  );
}