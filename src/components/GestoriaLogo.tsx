import React from 'react';

interface GestoriaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function GestoriaLogo({ className = "h-9 w-auto", showText = true }: GestoriaLogoProps) {
  // Center of concentric rings
  const X = 250;
  const Y = 50;

  // Exact 6 concentric radii matching the logo proportions perfectly
  const radii = [14, 20.2, 26.4, 32.6, 38.8, 45];
  
  // Angle for opening cut on left (approx 29 degrees above/below left horizontal)
  // Standard math angles in SVG (Y-down):
  // Left horizontal is 180 deg. 
  // Top-left termination is at 180 - 29 = 151 deg.
  // Bottom-left termination is at 180 + 29 = 209 deg.
  const angleRad = (29 * Math.PI) / 180;
  const cosVal = Math.cos(angleRad); // approx 0.8746
  const sinVal = Math.sin(angleRad); // approx 0.4848

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 320 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto select-none"
      >
        {showText && (
          <>
            {/* GESTOR text in elegant bold slate navy matching the exact brand color */}
            <text
              x="12"
              y="66"
              fill="#031E3D"
              fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
              fontWeight="800"
              fontSize="45"
              letterSpacing="-1px"
            >
              GESTOR
            </text>
            
            {/* IA text in vibrant corporate teal matching the rings exactly */}
            <text
              x="196"
              y="66"
              fill="#00b49d"
              fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif"
              fontWeight="850"
              fontSize="45"
              letterSpacing="-1.5px"
            >
              IA
            </text>
          </>
        )}

        {/* Dynamic high-precision representation of 6 concentric rings */}
        <g stroke="#00b49d" strokeWidth="2.8" strokeLinecap="round">
          {radii.map((R, idx) => {
            // Symmetrical coordinates
            // Starts at bottom-left (209 degrees) and sweeps clockwise block to top-left (151 degrees)
            const xStart = X - R * cosVal;
            const yStart = Y + R * sinVal;
            const xEnd = X - R * cosVal;
            const yEnd = Y - R * sinVal;

            return (
              <path
                key={idx}
                d={`M ${xStart} ${yStart} A ${R} ${R} 0 1 1 ${xEnd} ${yEnd}`}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
