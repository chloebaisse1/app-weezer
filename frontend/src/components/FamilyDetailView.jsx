import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { ApplicationCard } from './ApplicationCard';
import { MainLayout } from './layouts/MainLayout';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, RefreshCcw, 
  LayoutGrid, ShieldCheck, AlertTriangle, Zap, EyeOff 
} from 'lucide-react';


function StatBadge({ label, value, icon, colorClass, bgColorClass, borderColorClass }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm dark:shadow-xl backdrop-blur-md transition-all
      /* Changement ici : bg-white seulement si on n'est pas en dark */
      bg-white dark:bg-slate-900/40 
      border-slate-200 dark:${borderColorClass}`}>
      
      {/* On s'assure que le fond de l'icône est aussi sombre */}
      <div className={`${colorClass} p-2 rounded-lg bg-slate-100 dark:bg-white/5`}>
        {icon}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
          {label}
        </span>
        <span className="text-xl font-[1000] text-slate-900 dark:text-white italic leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * VUE 2 : Détail d'une Famille d'applications
 */

export function FamilyDetailView({ familyId, onBack, onSelectApp }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback((showLoading = false) => {
    if (showLoading) setLoading(true);
    
    api.get(`/families/${familyId}?page=${currentPage}&nocache=${Date.now()}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur refresh:", err);
        setLoading(false);
      });
  }, [familyId, currentPage]);

  useEffect(() => {
    fetchData(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-blue-500" size={40} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">
            Initialisation Flux...
          </span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const meta = data.meta || { current_page: 1, last_page: 1, total_apps_in_family: 0 };
  const stats = data.family_stats || { up: 0, warn: 0, down: 0, non_suivi: 0, total: 0 };

  const totalForPercent = stats.total > 0 ? stats.total : 1;
  const upPercent = Math.round((stats.up / totalForPercent) * 100);
  const warnPercent = Math.round((stats.warn / totalForPercent) * 100);
  const downPercent = Math.round((stats.down / totalForPercent) * 100);
  const globalHealth = Math.round(((stats.up + (stats.warn * 0.5)) / totalForPercent) * 100);

  return (
    <MainLayout 
      stats={{ 
        ...data,
        up: upPercent,
        warn: warnPercent,
        down: downPercent,
        global_health: globalHealth,
        last_sync: data.last_sync || new Date().toLocaleTimeString('fr-FR') 
      }} 
      onNavigateHome={onBack}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={onBack} 
              className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                {data.family_name}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">
                EXPLORATION DU PARC APPLICATIF | {meta.total_apps_in_family} SERVICES
              </p>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatBadge label="Total" value={stats.total} icon={<LayoutGrid size={16}/>} colorClass="text-blue-500" bgColorClass="bg-blue-500/5" borderColorClass="border-blue-500/10" />
          <StatBadge label="Operational" value={stats.up} icon={<ShieldCheck size={16}/>} colorClass="text-emerald-500" bgColorClass="bg-emerald-500/5" borderColorClass="border-emerald-500/10" />
          <StatBadge label="Warnings" value={stats.warn} icon={<AlertTriangle size={16}/>} colorClass="text-amber-500" bgColorClass="bg-amber-500/5" borderColorClass="border-amber-500/10" />
          <StatBadge label="Critical" value={stats.down} icon={<Zap size={16}/>} colorClass="text-red-500" bgColorClass="bg-red-500/5" borderColorClass="border-red-500/10" />
          <StatBadge label="Non Suivis" value={stats.non_suivi} icon={<EyeOff size={16}/>} colorClass="text-slate-400" bgColorClass="bg-slate-500/5" borderColorClass="border-slate-500/10" />
        </div>

        {/* GRID DES APPLICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.applications?.map((app) => (
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onSelect={onSelectApp} 
            />
          ))}
        </div>

        {/* PAGINATION */}
        {meta.last_page > 1 && (
          <div className="flex flex-col items-center gap-4 py-12 border-t border-slate-200 dark:border-white/5 mt-10">
            <div className="flex items-center gap-8">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="flex flex-col items-center min-w-[100px]">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-1">Navigation</span>
                <span className="text-xl font-[1000] text-slate-900 dark:text-white italic">
                  {currentPage} <span className="text-slate-300 mx-2">/</span> {meta.last_page}
                </span>
              </div>

              <button 
                disabled={currentPage === meta.last_page}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}