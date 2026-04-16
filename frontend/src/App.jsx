import React, { useEffect, useState, useCallback } from 'react';
import api from './api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FamilyCard } from '@/components/FamilyCard';
import { FamilyDetailView } from './components/FamilyDetailView'; 
import { ApplicationDetailView } from './components/ApplicationDetailView';


function App() {
 
  const [stats, setStats] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de navigation
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [selectedAppId, setSelectedAppId] = useState(null);

  console.log("Vue actuelle :", selectedFamilyId ? `Famille ${selectedFamilyId}` : "Accueil");

  const fetchGlobalStats = useCallback(() => {
    setLoading(true);
    api.get('/dashboard/stats')
      .then(res => {
        if (res.data && res.data.success) {
          setStats(res.data);
          setError(null);
        } else {
          setError("Format de données invalide reçu de l'API.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de synchronisation Nebula:", err);
        const message = err.response?.data?.error || "Impossible de joindre l'API Weezer (Vérifiez le port 8080).";
        setError(message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 120000);
    return () => clearInterval(interval);
  }, [fetchGlobalStats]);


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
          <div className="flex flex-col gap-3">
            <button onClick={() => fetchGlobalStats()} className="rounded-xl bg-red-600/10 border border-red-600/50 px-8 py-3 text-xs font-black text-red-500 shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95 uppercase tracking-widest">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  if (selectedAppId) {
    return (
      <ApplicationDetailView 
        applicationId={selectedAppId} 
        onBack={() => setSelectedAppId(null)} 
      />
    );
  }

  // VUE 2 : DÉTAIL FAMILLE
  if (selectedFamilyId) {
    return (
      <FamilyDetailView 
        familyId={selectedFamilyId} 
        onBack={() => setSelectedFamilyId(null)} 
        onSelectApp={(appId) => setSelectedAppId(appId)} 
      />
    );
  }

  // VUE 1 : ACCUEIL GLOBAL
  return (
    <MainLayout stats={stats} onNavigateHome={() => setSelectedFamilyId(null)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {stats?.families?.map((family) => (
          <div 
            key={family.id} 
            onClick={() => setSelectedFamilyId(family.id)}
            className="cursor-pointer group"
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
    </MainLayout>
  );
}

export default App;