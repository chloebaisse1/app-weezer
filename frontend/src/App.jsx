import React, { useEffect, useState, useCallback } from 'react';
import api from './lib/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FamilyCard } from '@/components/FamilyCard';
import { FamilyDetailView } from './components/views/FamilyDetailView'; 
import { ApplicationDetailView } from './components/views/ApplicationDetailView';
import { MonitorView } from './components/views/MonitorView'; // Import de la vue Monitor
import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation par état
  const [selectedFamilyName, setSelectedFamilyName] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);

  // Pagination du Dashboard
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Détection de la route pour les écrans de l'openspace
  const isMonitorMode = window.location.pathname === '/monitor';

  const fetchGlobalStats = useCallback(() => {
    if (!stats) setLoading(true);

    api.get('/dashboard/stats')
      .then(res => {
        if (res.data && res.data.success) {
          setStats(res.data.data);
          setError(null);
        } else {
          setError("Flux Nebula corrompu (Format invalide).");
        }
      })
      .catch(err => {
        console.error("Nebula Sync Error:", err);
        const message = err.response?.data?.error || "Liaison API perdue (Vérifiez Docker port 8080).";
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [stats]); 

  useEffect(() => {
    // On ne lance pas les stats globales si on est en mode Monitor (il a sa propre logique de fetch)
    if (!isMonitorMode) {
      fetchGlobalStats();
      const interval = setInterval(fetchGlobalStats, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchGlobalStats, isMonitorMode]);

  // 1. ROUTE SPÉCIFIQUE : MONITOR (Écrans autonomes)
  if (isMonitorMode) {
    return <MonitorView />;
  }

  // 2. VUE DÉTAIL APPLICATION
  if (selectedAppId) {
    return (
      <ApplicationDetailView 
        applicationId={selectedAppId} 
        onBack={() => setSelectedAppId(null)} 
      />
    );
  }

  // 3. VUE DÉTAIL FAMILLE
  if (selectedFamilyName) {
    return (
      <FamilyDetailView 
        familyName={selectedFamilyName} 
        onBack={() => setSelectedFamilyName(null)} 
        onSelectApp={(appId) => setSelectedAppId(appId)} 
      />
    );
  }

  // 4. ÉCRAN DE CHARGEMENT
  if (loading && !stats) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 animate-pulse">
            Establishing Nebula Uplink...
          </p>
        </div>
      </div>
    );
  }

  // 5. ÉCRAN D'ERREUR
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#020617] p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="inline-block p-3 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
             <div className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
          </div>
          <h2 className="text-3xl font-[1000] text-red-600 italic tracking-tighter uppercase leading-none">
            System Critical Error
          </h2>
          <p className="font-bold text-slate-400 border-l-2 border-red-600 pl-4 text-sm text-left">
            {error}
          </p>
          <button 
            onClick={() => fetchGlobalStats()} 
            className="w-full rounded-xl bg-red-600/10 border border-red-600/50 px-8 py-3 text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // 6. DASHBOARD PRINCIPAL (Calculs pagination)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFamilies = stats?.families?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((stats?.families?.length || 0) / itemsPerPage);

  return (
    <MainLayout stats={stats} onNavigateHome={() => {
      setSelectedFamilyName(null);
      setSelectedAppId(null);
    }}>
      <div className="relative flex items-center justify-between gap-4 min-h-[600px] animate-in fade-in duration-700">
        
        {/* FLÈCHE GAUCHE */}
        <div className="w-16 flex justify-center">
          {totalPages > 1 && currentPage > 1 && (
            <button 
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 backdrop-blur-md shadow-2xl"
            >
              <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* GRILLE DES FAMILLES */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2">
            {currentFamilies?.map((family) => (
              <div 
                key={family.name} 
                onClick={() => setSelectedFamilyName(family.name)}
                className="cursor-pointer group transition-transform hover:scale-[1.02]"
              >
                <FamilyCard family={family} />
              </div>
            ))}
            
            {(!stats?.families || stats.families.length === 0) && (
              <div className="col-span-full text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">
                No Nebula Data Streams Detected
              </div>
            )}
          </div>
        </div>

        {/* FLÈCHE DROITE */}
        <div className="w-16 flex justify-center">
          {totalPages > 1 && currentPage < totalPages && (
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all duration-300 backdrop-blur-md shadow-2xl"
            >
              <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

export default App;