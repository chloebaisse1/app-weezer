import React from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, XCircle, EyeOff } from 'lucide-react';

export function FamilyCard({ family }) {
  // Récupération des stats incluant le nouvel état "non_suivi"
  const { up, warn, down, non_suivi } = family.stats || { up: 0, warn: 0, down: 0, non_suivi: 0 };
  const totalApps = family.total_apps || 0;
  const healthIndex = family.health_index || 0;

  // Détermination de la couleur de l'index de santé pour la carte
  const getHealthColor = (index) => {
    if (index >= 90) return 'text-emerald-400';
    if (index >= 70) return 'text-amber-400';
    return 'text-red-500';
  };

  const getBackgroundImage = (name) => {
    const familyName = name.toLowerCase();
    if (familyName.includes('supply')) return 'url(/images/supply.avif)';
    if (familyName.includes('rh') || familyName.includes('ressources')) return 'url(/images/rh.avif)';
    if (familyName.includes('autre')) return 'url(/images/autre.avif)';
    if (familyName.includes('finance')) return 'url(/images/compta.avif)';
    if (familyName.includes('si') || familyName.includes('info')) return 'url(/images/si.avif)';
    if (familyName.includes('commerce')) return 'url(/images/commerce.avif)';
    return 'none';
  };

  return (
    <div 
      className="relative aspect-[4/3] rounded-3xl overflow-hidden group border border-white/5 hover:border-blue-500/30 transition-all shadow-2xl shadow-black/40 cursor-pointer"
      style={{
        backgroundImage: getBackgroundImage(family.name),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay Sombre adaptatif au hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/20 transition-opacity group-hover:opacity-90" />

      {/* Contenu de la Carte */}
      <div className="relative h-full w-full p-6 flex flex-col justify-between z-10">
        
        {/* HEADER : Titre + Badge Total */}
        <div className="flex justify-between items-start">
          <h3 className="text-3xl font-[1000] text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors max-w-[70%]">
            {family.name}
          </h3>
          
          <div className="flex flex-col items-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm shadow-xl min-w-[60px]">
            <span className="text-3xl font-[1000] text-white italic leading-none">{totalApps}</span>
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">APPS</span>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="space-y-4">
          
          {/* LIGNE DES BADGES D'ÉTAT (4 ÉTATS) */}
          <div className="flex flex-wrap gap-2">
            {/* UP */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <CheckCircle2 size={11} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">{up}</span>
            </div>

            {/* WARN */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
              <AlertCircle size={11} className="text-amber-500" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">{warn}</span>
            </div>

            {/* DOWN */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <XCircle size={11} className="text-red-500" />
              <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">{down}</span>
            </div>

            {/* NON SUIVI */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-500/10 border border-white/5 backdrop-blur-sm opacity-60">
              <EyeOff size={11} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{non_suivi}</span>
            </div>
          </div>

          {/* HEALTH INDEX + BOUTON NAVIGATION */}
          <div className="flex justify-between items-center bg-slate-900/60 border border-white/5 p-3 rounded-2xl backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Family Health Index</span>
              <span className={`text-xl font-[1000] italic ${getHealthColor(healthIndex)}`}>
                {healthIndex}%
              </span>
            </div>
            
            <div className="bg-slate-800/80 p-3 rounded-xl text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* EFFET DE GLOW SUBTIL AU HOVER */}
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-600/5 blur-[60px] rounded-full group-hover:bg-blue-600/20 transition-all" />
    </div>
  );
}