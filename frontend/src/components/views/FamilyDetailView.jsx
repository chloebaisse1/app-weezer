import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import { ApplicationCard } from "../ApplicationCard";
import { MainLayout } from "../layouts/MainLayout";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, RefreshCcw, 
  LayoutGrid, ShieldCheck, AlertTriangle, Zap 
} from 'lucide-react';

function StatBadge({ label, value, icon, colorClass, borderColorClass }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm dark:shadow-xl backdrop-blur-md transition-all bg-white dark:bg-slate-900/40 border-slate-200 dark:${borderColorClass}`}>
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

export function FamilyDetailView({ familyName, onBack, onSelectApp }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback((showLoading = false) => {
    if (showLoading) setLoading(true);
    
    api.get(`/applications/family/${familyName}?page=${currentPage}`)
      .then(res => {
        setData(res.data.data || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Nebula Sync Error (Family):", err);
        setLoading(false);
      });
  }, [familyName, currentPage]);

  useEffect(() => {
    fetchData(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-blue-500" size={40} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">
            Scanning District: {familyName}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const applications = data.applications || [];
  const stats = data.family_stats || { up: 0, warn: 0, down: 0, total: 0 };
  const pagination = data.pagination || { current_page: 1, last_page: 1 };

  return (
    <MainLayout 
      stats={{ 
        ...data,
        global_health: data.health_score || 0,
        last_sync: new Date().toLocaleTimeString('fr-FR') 
      }} 
      onNavigateHome={onBack}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={onBack} 
              className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-[1000] text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                Famille <span className="text-blue-500">{familyName}</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">
                Monitoring de Secteur | {stats.total} Appareils Connectés
              </p>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBadge label="Total Services" value={stats.total} icon={<LayoutGrid size={16}/>} colorClass="text-blue-500" borderColorClass="border-blue-500/10" />
          <StatBadge label="Operational" value={stats.up} icon={<ShieldCheck size={16}/>} colorClass="text-emerald-500" borderColorClass="border-emerald-500/10" />
          <StatBadge label="Warnings" value={stats.warn} icon={<AlertTriangle size={16}/>} colorClass="text-amber-500" borderColorClass="border-amber-500/10" />
          <StatBadge label="Critical" value={stats.down} icon={<Zap size={16}/>} colorClass="text-red-500" borderColorClass="border-red-500/10" />
        </div>

        {/* APPLICATIONS GRID */}
        <div className="relative flex items-center justify-between gap-4">
          
          <div className="w-12">
            {pagination.last_page > 1 && currentPage > 1 && (
              <button 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-blue-500 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            )}
          </div>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {applications.map((app) => (
              <ApplicationCard 
                key={app.id || app.IDAPP} 
                app={{
                  ...app,
                  name: app.APPNOM || "Sans Nom", 
                  status: {
                    id: app.status_id || 0, 
                    label: app.status_label || 'NON SUIVI',
                    updated_at: app.updated_at || 'N/A'
                  },
                  health_score: app.health_score || 0,
                  sensors_count: app.sondes_count || 0
                }} 
                onSelect={onSelectApp} 
              />
            ))}
          </div>

          <div className="w-12 text-right">
            {pagination.last_page > 1 && currentPage < pagination.last_page && (
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 hover:text-blue-500 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}