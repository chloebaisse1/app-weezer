import { Badge } from "@/components/ui/badge";
import { Clock, RefreshCw, ShieldCheck, AlertCircle, XCircle, Activity, EyeOff } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

/**
 * DashboardHeader - Version Finale Corrigée
 */
export function DashboardHeader({ stats, lastCheck, onNavigateHome }) {
  
  // 1. Détection intelligente du contexte
  const isApplicationView = !!stats?.is_application;
  const isFamilyView = !!stats?.family_stats && !isApplicationView;
  
  // 2. Préparation des compteurs (Conversion forcée en Number pour éviter NaN)
  let up, warn, down, nonSuivi, health;

  if (isApplicationView) {
    // FORCE : On lit à la racine de stats car ApplicationDetailView envoie un objet "à plat"
    up = Number(stats?.up) || 0;
    warn = Number(stats?.warn) || 0;
    down = Number(stats?.down) || 0;
    nonSuivi = 0;
    health = Number(stats?.global_health) || 0;
  } else if (isFamilyView) {
    up = Number(stats.family_stats?.up) || 0;
    warn = Number(stats.family_stats?.warn) || 0;
    down = Number(stats.family_stats?.down) || 0;
    nonSuivi = Number(stats.family_stats?.non_suivi) || 0;
    health = Number(stats.global_health) || 0;
  } else {
    // Mode GLOBAL
    const families = stats?.families || [];
    up = families.reduce((acc, f) => acc + Number(f.stats?.up || 0), 0);
    warn = families.reduce((acc, f) => acc + Number(f.stats?.warn || 0), 0);
    down = families.reduce((acc, f) => acc + Number(f.stats?.down || 0), 0);
    nonSuivi = families.reduce((acc, f) => acc + Number(f.stats?.non_suivi || 0), 0);
    health = Number(stats?.global_stats?.enterprise_health) || 0;
  }

  // 3. Logique de calcul des pourcentages
  const monitoredCount = up + warn + down;
  
  // On laisse le log pour le debug final
  console.log("Header State:", { view: isApplicationView ? 'APP' : 'FAMILY/GLOBAL', up, warn, down, total: monitoredCount });

  const getPct = (value) => {
  if (monitoredCount === 0) return 0;

  // AJOUT DE CETTE CONDITION :
  // Si on est dans une application, on veut voir son score réel (ex: 50%) 
  // dans la jauge de sa catégorie (Critique ici)
  if (isApplicationView) {
    return value > 0 ? health : 0;
  }

  // Logique normale pour les autres vues (Comptage par unité)
  return Math.round((Number(value) / monitoredCount) * 100);
  };

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-white/5 pb-8 mb-8 transition-colors duration-300">
      
      {/* GAUCHE : Logo & Navigation */}
      <div className="flex items-center gap-5">
        <div 
          onClick={onNavigateHome}
          className="bg-white p-2 rounded-xl shadow-lg dark:shadow-[0_0_20px_rgba(227,6,19,0.2)] cursor-pointer hover:scale-105 transition-transform active:scale-95 border border-slate-100 dark:border-transparent"
        >
          <img src="/logo.jpg" alt="Logo" className="h-8 w-auto object-contain" />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-[1000] italic tracking-tighter text-slate-900 dark:text-white leading-none">WEEZER</h1>
            <Badge variant="outline" className="text-[10px] font-bold tracking-widest px-2 h-5 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase rounded-md">
              Live
            </Badge>
          </div>

          <nav className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <button 
              onClick={onNavigateHome}
              className={`transition-colors cursor-pointer ${(isFamilyView || isApplicationView) ? "text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400" : "text-blue-600 dark:text-blue-400/80"}`}
            >
              Accueil
            </button>
            {(isFamilyView || isApplicationView) && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-blue-600 dark:text-blue-400/80 uppercase tracking-widest leading-none">
                  {stats.family_name || "Détails"}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* DROITE : Indicateurs & Contrôles */}
      <div className="flex items-center gap-4">
        
        {/* Jauges de santé */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-1 rounded-2xl shadow-sm dark:shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
            <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{getPct(up)}%</span>
              <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-500/50 uppercase tracking-widest mt-1 italic">Operationel</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
            <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{getPct(warn)}%</span>
              <span className="text-[7px] font-bold text-amber-600 dark:text-amber-500/50 uppercase tracking-widest mt-1 italic">Danger</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
            <XCircle size={16} className="text-red-500 dark:text-red-400" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{getPct(down)}%</span>
              <span className="text-[7px] font-bold text-red-600 dark:text-red-500/50 uppercase tracking-widest mt-1 italic">Critique</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-500/5 border border-slate-100 dark:border-white/5 opacity-80">
            <EyeOff size={16} className="text-slate-500 dark:text-slate-400" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{nonSuivi}</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Non Suivis</span>
            </div>
          </div>
        </div>

        {/* Santé globale */}
        <div className="hidden xl:flex flex-col items-end border-l border-slate-200 dark:border-white/10 pl-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 italic">
            {isApplicationView ? 'App Health' : isFamilyView ? 'Family Health' : 'Global Health'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter italic">{health}%</span>
            <Activity size={16} className={health < 80 ? "text-amber-500 dark:text-amber-400 animate-pulse" : "text-emerald-500 dark:text-emerald-400"} />
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex flex-col items-end border-l border-slate-200 dark:border-white/10 pl-6 mr-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 italic">Last Sync</span>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white italic font-black">
             <Clock size={12} className="text-blue-600 dark:text-blue-400" />
             <span className="text-sm tracking-tight">{lastCheck || "Sync..."}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => window.location.reload()}
            className="group p-2.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
          </button>
        </div>
      </div>
    </header>
  );
}