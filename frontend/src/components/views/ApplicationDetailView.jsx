import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import { MainLayout } from '../layouts/MainLayout';
import { 
  ArrowLeft, Activity, Zap, ShieldCheck, AlertCircle, 
  Clock, BarChart3, ListFilter, Search
} from 'lucide-react';

/**
 * Composant pour les cartes d'indicateurs clés (KPI)
 */
function KpiCard({ title, value, trend, color }) {
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-3xl shadow-sm dark:shadow-xl transition-all">
      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 italic">{title}</p>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-[1000] italic leading-none tracking-tighter ${color}`}>{value}</span>
        <span className="text-[9px] font-bold text-emerald-500 mb-1">{trend}</span>
      </div>
    </div>
  );
}

/**
 * Barre de progression pour la charge des ressources
 */
function ProgressBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
        <span className="text-slate-500 dark:text-slate-500">{label}</span>
        <span className="text-slate-900 dark:text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * Vue détaillée d'une application (Vue 3)
 */
export function ApplicationDetailView({ applicationId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(() => {
    api.get(`/applications/${applicationId}?nocache=${Date.now()}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement détails:", err);
        setLoading(false);
      });
  }, [applicationId]);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 30000); 
    return () => clearInterval(interval);
  }, [fetchDetails]);

  if (loading || !data) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Activity className="text-blue-500 animate-spin" size={40} />
        <span className="text-slate-500 font-black tracking-widest uppercase text-xs">Chargement Télémétrie...</span>
      </div>
    </div>
  );

  const { application, sensors } = data;
  const health = application.health_score || 0;

  // LOGIQUE HEADER : Unités (1/0) selon les nouveaux seuils (50/80)
  const headerStats = {
    is_application: true,
    up: health >= 80 ? 1 : 0,
    warn: (health >= 50 && health < 80) ? 1 : 0,
    down: health < 50 ? 1 : 0,
    global_health: health,
    family_name: application.family_name,
    family_stats: null,
    last_sync: data.last_sync || new Date().toLocaleTimeString('fr-FR')
  };

  return (
    <MainLayout stats={headerStats} onNavigateHome={onBack}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-[0.2em] transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              RETOUR {application.family_name}
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-[1000] text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                {application.name}
              </h1>
              {/* BADGE DE STATUT : Seuils 50/80 */}
              <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest italic ${
                  health >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                  health >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
                  'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                }`}>
                {health >= 80 ? 'OPÉRATIONNEL' : health >= 50 ? 'WARNING' : 'CRITIQUE'}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-slate-600 dark:text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 flex items-center gap-2">
              <Zap size={14} className="text-amber-500 dark:text-amber-400" /> SCANNER
            </button>
            <button className="px-4 py-2 bg-blue-600 border border-blue-400/50 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95 flex items-center gap-2">
               PARAMÈTRES
            </button>
          </div>
        </div>

        {/* GRILLE KPI : Couleurs selon seuils 50/80 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="INDICE DE SANTÉ" 
            value={`${health}%`} 
            trend="+0.05%" 
            color={
              health >= 80 ? "text-emerald-500 dark:text-emerald-400" : 
              health >= 50 ? "text-amber-500 dark:text-amber-400" : 
              "text-red-500 dark:text-red-400"
            } 
          />
          <KpiCard title="LATENCE MOYENNE" value="12.4ms" trend="-1.2ms" color="text-blue-500 dark:text-blue-400" />
          <KpiCard title="SONDES ACTIVES" value={sensors.length} trend="Stable" color="text-slate-900 dark:text-white" />
          <KpiCard title="SLA (24H)" value="99.98%" trend="Excellent" color="text-emerald-500 dark:text-emerald-400" />
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-xl">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <ListFilter size={16} className="text-blue-500" /> TÉLÉMÉTRIE LIVE DES SONDES
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="FILTRER SONDES..." 
                  className="bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-lg pl-9 pr-4 py-2 text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all w-64"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/[0.01] text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4">STATUT</th>
                    <th className="px-6 py-4">NOM DE LA SONDE</th>
                    <th className="px-6 py-4">VALEUR TEMPS RÉEL</th>
                    <th className="px-6 py-4">DERNIER CHECK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {sensors.map(sensor => (
                    <tr key={sensor.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                          sensor.status_id === 3 
                          ? 'bg-emerald-500/10 border-emerald-500/20' 
                          : 'bg-red-500/10 border-red-500/20'
                        }`}>
                          {sensor.status_id === 3 ? (
                            <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-500" />
                          ) : (
                            <AlertCircle size={12} className="text-red-600 dark:text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-tight text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {sensor.name} <br/>
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 tracking-widest mt-0.5 uppercase">ID: {sensor.id_prtg}</span>
                      </td>
                      <td className={`px-6 py-4 text-xs font-black italic ${sensor.status_id === 3 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
                        {sensor.last_value}
                      </td>
                      <td className="px-6 py-4 text-slate-400 italic text-[10px] font-bold flex items-center gap-2">
                        <Clock size={10} /> {sensor.updated_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" /> CHARGE RESSOURCES
              </h3>
              <div className="space-y-6">
                <ProgressBar label="Utilisation CPU" value={42} color="bg-blue-500" />
                <ProgressBar label="Charge Mémoire" value={68} color="bg-blue-400" />
                <ProgressBar label="Capacité Stockage" value={31} color="bg-emerald-500" />
                <ProgressBar label="Flux Réseau" value={14} color="bg-amber-500" />
              </div>
              <button className="w-full mt-8 py-3 border border-slate-200 dark:border-white/5 rounded-xl text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-all">
                VOIR DÉTAILS INFRASTRUCTURE
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}