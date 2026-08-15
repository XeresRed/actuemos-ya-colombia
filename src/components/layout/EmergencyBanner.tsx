'use client';

import React from 'react';

interface EmergencyBannerProps {
  message?: string;
}

export function EmergencyBanner({ 
  message = 'ALERTA CRÍTICA: Desastre natural en desarrollo. Por favor, siga las instrucciones de los organismos de socorro y reporte cualquier emergencia.' 
}: EmergencyBannerProps) {
  return (
    <aside 
      aria-label="Alerta de emergencia"
      className="bg-error text-on-error w-full px-margin-mobile md:px-margin-desktop py-base flex justify-center items-center gap-stack-sm shadow-md z-50 transition-colors"
    >
      <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
        warning
      </span>
      <p className="font-body-md text-body-md font-bold text-center text-sm md:text-base">
        {message}
      </p>
    </aside>
  );
}
