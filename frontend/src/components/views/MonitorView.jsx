import React, { useEffect, useState, useMemo } from 'react';
import api from '../../lib/api';
import { CloudLightning, Sun, CloudRain, Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';


const RainEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(35)].map((_, i) => (
      <div 
        key={i} 
        className="absolute animate-drop rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 50}%`,
          animationDuration: `${1.2 + Math.random() * 0.6}s`, 
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

export function MonitorView() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    api.get('/monitor-data').then(res => {
      if (res.data.success) {
        const sorted = [...res.data.data].sort((a, b) => {
          const aCrit = a.applications.some(app => app.health_score === 0);
          const bCrit = b.applications.some(app => app.health_score === 0);
          return bCrit - aCrit;
        });
        setFamilies(sorted);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    let down = 0, warn = 0, up = 0;
    families.forEach(f => f.applications.forEach(app => {
      if (app.health_score === 0) down++;
      else if (app.health_score === 50) warn++;
      else up++;
    }));
    return { down, warn, up };
  }, [families]);

  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center font-bold text-2xl">
      <Activity className="animate-spin mb-4 text-blue-600" size={48} />
      SYSTÈMES WEEZER...
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-100 p-2 flex flex-col overflow-hidden font-sans text-slate-900">
      
      
      <div className="flex justify-between items-center mb-2 bg-white px-10 py-4 rounded-[2rem] shadow-sm border border-slate-200">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">MÉTÉO DES SERVICES</h1>
          <p className="text-blue-600 font-bold tracking-[0.4em] uppercase text-xs mt-1 italic">Live Supervision Open-Space</p>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex gap-8 bg-slate-50 px-8 py-2 rounded-2xl border shadow-inner">
            <div className="flex items-center gap-3 text-emerald-600 font-bold">
              <CheckCircle size={32}/> 
              <span className="text-4xl font-black leading-none text-slate-800">{stats.up}</span>
            </div>
            <div className="flex items-center gap-3 text-amber-500 font-bold border-l border-slate-200 pl-8">
              <AlertTriangle size={32} className={stats.warn > 0 ? "animate-bounce" : ""}/> 
              <span className="text-4xl font-black leading-none text-slate-800">{stats.warn}</span>
            </div>
            <div className="flex items-center gap-3 text-red-600 font-bold border-l border-slate-200 pl-8">
              <XCircle size={32} className={stats.down > 0 ? "animate-ping" : ""}/> 
              <span className="text-4xl font-black leading-none">{stats.down}</span>
            </div>
          </div>
          <div className="text-5xl font-black tabular-nums border-l border-slate-200 pl-10 leading-none">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      
      <div className="flex-1 grid grid-cols-6 grid-rows-2 gap-3 min-h-0 pb-1">
        {families.map(family => {
          const isCrit = family.applications.some(a => a.health_score === 0);
          const isWarn = !isCrit && family.applications.some(a => a.health_score === 50);

          return (
            <div 
              key={family.id} 
              className={`relative rounded-[2.5rem] border-[5px] flex flex-col overflow-hidden transition-all duration-700 shadow-xl ${
                isCrit ? 'animate-flash-bg border-red-800 shadow-red-200' : 
                isWarn ? 'bg-amber-500 border-amber-600 shadow-amber-200' : 
                'bg-white border-slate-300'
              }`}
            >
              
              {isCrit && <div className="absolute inset-0 bg-white/20 animate-lightning pointer-events-none z-0" />}
              {isWarn && <RainEffect />}
              {!isCrit && !isWarn && <div className="absolute inset-0 sun-glow z-0" />}

             
              <div className={`relative z-10 px-6 py-5 flex justify-between items-center ${
                isCrit ? 'bg-red-800 text-white shadow-lg' : 
                isWarn ? 'bg-amber-700 text-white shadow-lg' : 
                'bg-slate-900 text-white border-b-2 border-slate-800'
              }`}>
                <div className="flex items-center gap-4">
                    {isCrit ? <CloudLightning size={28} className="animate-bounce" /> : 
                     isWarn ? <CloudRain size={28} /> : 
                     <Sun size={28} className="text-emerald-400 animate-spin-slow" />}
                    <h2 className="text-xl font-bold uppercase tracking-wide italic leading-none truncate">
                      {family.name}
                    </h2>
                </div>
                <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full">{family.apps_count}</span>
              </div>

              
              <div className="relative z-10 flex-1 p-2 flex flex-col justify-between overflow-hidden">
                {[...family.applications].sort((a,b) => a.health_score - b.health_score).map(app => (
                  <div key={app.id} className={`flex items-center gap-3 px-4 rounded-2xl border-2 flex-grow my-0.5 shadow-md transition-all ${
                      app.health_score === 0 ? 'bg-white border-white text-red-700' :
                      app.health_score === 50 ? 'bg-white border-white text-amber-700' :
                      'bg-white/90 border-slate-50 text-slate-800'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full shrink-0 border-2 ${
                      app.health_score === 0 ? 'bg-red-600 border-red-900 animate-ping' :
                      app.health_score === 50 ? 'bg-amber-500 border-amber-600' :
                      'bg-emerald-500 border-emerald-700 shadow-sm shadow-emerald-200'
                    }`} />
                    
                 
                    <span className="text-[16px] font-bold uppercase tracking-normal truncate flex-1 leading-none">
                      {app.name}
                    </span>

                    {app.health_score < 100 && (
                      <span className={`text-[9px] font-black italic border px-1.5 py-0.5 rounded shrink-0 ${
                        app.health_score === 0 ? 'border-red-600 text-red-600' : 'border-amber-600 text-amber-600'
                      }`}>
                        {app.health_score === 0 ? 'HS' : '!!'}
                      </span>
                    )}
                  </div>
                ))}
                
                
                {Array.from({ length: Math.max(0, 1) }).map((_, i) => (
                  <div key={i} className="flex-grow opacity-0 pointer-events-none" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}