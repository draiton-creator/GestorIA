import React from 'react';
import logoUrl from '../../image/Logo-GestorIA-pequeño.png';

interface GestoriaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function GestoriaLogo({ className = "h-9 w-auto", showText = true }: GestoriaLogoProps) {
  return (
    <div className={`flex items-center overflow-hidden ${className}`}>
      <img
        src={logoUrl}
        alt="GestorIA"
        className={`h-full w-auto max-w-none select-none object-contain ${showText ? '' : '-translate-x-[62%]'}`}
        draggable={false}
      />
    </div>
  );
}
