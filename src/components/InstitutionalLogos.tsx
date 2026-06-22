import React from 'react';

interface InstitutionalLogosProps {
  lightMode?: boolean; // If true, rendering for white/light footer. If false, for dark footer.
}

export default function InstitutionalLogos({ lightMode = true }: InstitutionalLogosProps) {
  const textColor = lightMode ? 'text-slate-800' : 'text-slate-200';
  const subTextColor = lightMode ? 'text-slate-500' : 'text-slate-400';
  const borderColor = lightMode ? 'border-slate-200' : 'border-slate-800';
  const badgeBg = lightMode ? 'bg-slate-50' : 'bg-slate-850/50';

  return (
    <div className={`w-full py-6 px-4 border-t ${borderColor} ${badgeBg} mt-8 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center mb-5 font-mono`}>
          Financiación y Cumplimiento de Políticas de Digitalización PYME 2026
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          
          {/* 1. COFINANCIADO POR LA UNIÓN EUROPEA */}
          <div className="flex items-center gap-3 max-w-[210px] select-none text-left">
            <svg className="w-14 h-9.5 shrink-0 shadow-xs rounded-xs" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="40" fill="#003399" />
              {/* Circle of 12 Stars */}
              <g fill="#FFCC00" transform="translate(30, 20)">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const r = 9;
                  const x = r * Math.cos(angle);
                  const y = r * Math.sin(angle);
                  return (
                    <polygon
                      key={i}
                      points="0,-1.6 0.5,-0.5 1.6,-0.5 0.8,0.3 1.1,1.4 0,0.8 -1.1,1.4 -0.8,0.3 -1.6,-0.5 -0.5,-0.5"
                      transform={`translate(${x}, ${y}) scale(0.9)`}
                    />
                  );
                })}
              </g>
            </svg>
            <div className="leading-tight">
              <p className={`text-[8px] font-medium ${subTextColor}`}>Cofinanciado por</p>
              <p className={`text-[10px] font-extrabold tracking-tight ${textColor}`}>la Unión Europea</p>
            </div>
          </div>

          {/* 2. MINISTERIO DE HACIENDA */}
          <div className="flex items-center gap-2 max-w-[210px] select-none text-left">
            {/* Elegant shield illustration of Spain Armas */}
            <svg className="w-9 h-11 shrink-0" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Crown on top */}
              <path d="M11 7C14 4 22 4 25 7L27 9H9L11 7Z" fill={lightMode ? "#334155" : "#94a3b8"} />
              <circle cx="18" cy="4" r="1.5" fill="#eab308" />
              {/* Symmetrical Pillars */}
              <rect x="5" y="12" width="2.5" height="18" rx="0.5" fill={lightMode ? "#475569" : "#64748b"} />
              <rect x="28.5" y="12" width="2.5" height="18" rx="0.5" fill={lightMode ? "#475569" : "#64748b"} />
              {/* Shield base body */}
              <path d="M10 11H26V25C26 29.5 22.5 33 18 33C13.5 33 10 29.5 10 25V11Z" fill={lightMode ? "#475569" : "#334155"} stroke={lightMode ? "#334155" : "#cbd5e1"} strokeWidth="1.5" />
              {/* Interior division */}
              <path d="M18 11V33M10 22H26" stroke={lightMode ? "#94a3b8" : "#475569"} strokeWidth="1" />
              {/* Golden Castle visual representation */}
              <rect x="12" y="13" width="4" height="6" fill="#eab308" />
              {/* Lion representation */}
              <circle cx="22" cy="16" r="2" fill="#ec4899" />
              {/* Red-yellow bands representation */}
              <rect x="12" y="25" width="4" height="5" fill="#ef4444" />
              <rect x="20" y="25" width="4" height="5" fill="#eab308" />
            </svg>
            <div className="h-8 w-px bg-slate-300"></div>
            <div className="leading-tight">
              <p className={`text-[8px] font-bold tracking-widest ${subTextColor}`}>MINISTERIO</p>
              <p className={`text-[9px] font-black tracking-tight ${textColor}`}>DE HACIENDA</p>
            </div>
          </div>

          {/* 3. FONDOS EUROPEOS */}
          <div className="flex items-center gap-3.5 max-w-[210px] select-none text-left">
            <svg className="w-13 h-10 shrink-0" viewBox="0 0 52 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Three Golden Stars */}
              <polygon points="6,3 7,5 9.5,5 7.5,7 8.2,9.5 6,8 3.8,9.5 4.5,7 2.5,5 5,5" fill="#b45309" />
              <polygon points="15,4 16,6 18.5,6 16.5,8 17.2,10.5 15,9 12.8,10.5 13.5,8 11.5,6 14,6" fill="#b45309" />
              <polygon points="9,13 10,15 12.5,15 10.5,17 11.2,19.5 9,18 6.8,19.5 7.5,17 5.5,15 8,15" fill="#b45309" />
              {/* Parallel stacked European finance bars */}
              <path d="M22 10H46L43 14H19L22 10Z" fill={lightMode ? "#1e293b" : "#94a3b8"} />
              <path d="M20 17H48L45 21H17L20 17Z" fill={lightMode ? "#1e293b" : "#94a3b8"} />
              <path d="M18 24H44L41 28H15L18 24Z" fill={lightMode ? "#1e293b" : "#94a3b8"} />
            </svg>
            <div className="leading-tight">
              <p className={`text-[10px] font-extrabold tracking-tight ${textColor}`}>Fondos Europeos</p>
              <p className={`text-[7.5px] font-medium leading-none ${subTextColor}`}>Sistemas Operacionales de Digitalización</p>
            </div>
          </div>

          {/* 4. CASTILLA-LA MANCHA */}
          <div className="flex items-center gap-3 max-w-[210px] select-none text-left">
            {/* Castilla-La Mancha Heraldry shield */}
            <svg className="w-9 h-11 shrink-0" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Crown on top */}
              <path d="M12 6C15 3 21 3 24 6L26 8H10L12 6Z" fill="#b45309" />
              <rect x="13" y="8" width="10" height="1.5" fill="#b45309" />
              {/* Shield Divided Symmetrically: Left is Red-Crimson with Gold Castle, Right is White */}
              <path d="M9 10.5H27V26C27 30.5 23.5 34 18 34C12.5 34 9 30.5 9 26V10.5Z" fill="#ffffff" stroke={lightMode ? "#475569" : "#cbd5e1"} strokeWidth="1.5" />
              {/* Crimson half */}
              <path d="M9 10.5H18V34C12.5 34 9 30.5 9 26V10.5Z" fill="#b91c1c" />
              {/* Golden Castle in the crimson half */}
              <g fill="#eab308">
                <rect x="12" y="18" width="4" height="7" rx="0.3" />
                <rect x="11.5" y="15" width="1.2" height="4" />
                <rect x="13.4" y="14" width="1.2" height="5" />
                <rect x="15.3" y="15" width="1.2" height="4" />
              </g>
            </svg>
            <div className="leading-tight">
              <p className={`text-[10px] font-extrabold tracking-tight ${textColor}`}>Castilla-La Mancha</p>
              <p className={`text-[7.5px] font-semibold leading-none text-indigo-600`}>Plan Adelante Digital</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
