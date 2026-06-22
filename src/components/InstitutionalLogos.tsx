import React from 'react';
import logosUrl from '../../image/logos-instituciones.png';

interface InstitutionalLogosProps {
  lightMode?: boolean;
}

export default function InstitutionalLogos({ lightMode = true }: InstitutionalLogosProps) {
  const borderColor = lightMode ? 'border-slate-200' : 'border-slate-800';
  const badgeBg = lightMode ? 'bg-slate-50' : 'bg-slate-850/50';
  const subTextColor = lightMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`w-full py-6 px-4 border-t ${borderColor} ${badgeBg} mt-8 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center mb-5 font-mono`}>
          Financiación y Cumplimiento de Políticas de Digitalización PYME 2026
        </p>
        <div className="flex justify-center">
          <img
            src={logosUrl}
            alt="Logos institucionales - Unión Europea, Ministerio de Hacienda, Fondos Europeos, Castilla-La Mancha"
            className="h-16 sm:h-20 md:h-24 w-auto max-w-full object-contain select-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
