'use client';

import React, { useState } from 'react';

export type AlertLevel = 'critica' | 'alerta_naranja' | 'informativa';

export interface EmergencyBannerProps {
  level?: AlertLevel;
  message?: string;
  actionUrl?: string;
  actionText?: string;
  active?: boolean;
}

export function EmergencyBanner({ 
  level = 'critica',
  message = 'ALERTA CRÍTICA: Desastre natural en desarrollo. Siga las directrices de los organismos de socorro.',
  actionUrl = 'http://portal.gestiondelriesgo.gov.co/',
  actionText = 'Canal UNGRD',
  active = true,
}: EmergencyBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!active) return null;

  const levelStyles = {
    critica: {
      bg: 'bg-primary',
      text: 'text-on-primary',
      icon: 'warning',
      badge: 'bg-white/20 text-white',
      label: 'Emergencia Activa',
    },
    alerta_naranja: {
      bg: 'bg-tertiary-container',
      text: 'text-on-tertiary-container',
      icon: 'priority_high',
      badge: 'bg-black/10 text-on-tertiary-container',
      label: 'Alerta Naranja',
    },
    informativa: {
      bg: 'bg-secondary',
      text: 'text-on-secondary',
      icon: 'info',
      badge: 'bg-white/20 text-white',
      label: 'Comunicado Oficial',
    },
  }[level];

  return (
    <aside 
      aria-label="Alerta de emergencia nacional"
      className={`${levelStyles.bg} ${levelStyles.text} w-full px-margin-mobile md:px-margin-desktop py-2.5 shadow-md z-50 transition-colors`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* Main Alert Message */}
        <div className="flex items-center gap-2 text-center md:text-left flex-1 min-w-0">
          <span 
            className="material-symbols-outlined shrink-0 text-xl animate-pulse" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            {levelStyles.icon}
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shrink-0 hidden sm:inline-block ${levelStyles.badge}`}>
            {levelStyles.label}
          </span>
          <p className="font-body-md text-xs sm:text-sm font-semibold truncate-2-lines flex-1">
            {message}
          </p>
        </div>

        {/* Emergency Speed Dials and Action Link */}
        <div className="flex items-center gap-2 shrink-0">
          {actionUrl && (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold px-2.5 py-1 rounded border border-white/20"
            >
              <span>{actionText}</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 bg-black/10 hover:bg-black/20 text-xs font-medium px-2 py-1 rounded transition-colors"
            aria-expanded={isExpanded}
            aria-label="Ver líneas de emergencia de Colombia"
          >
            <span className="material-symbols-outlined text-xs">call</span>
            <span className="hidden sm:inline">Líneas 123/132</span>
            <span className="material-symbols-outlined text-xs">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Emergency Speed-Dial Bar */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-white/20 max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs">
          <span className="font-bold opacity-90">Líneas de socorro directo:</span>
          <a href="tel:123" className="font-bold underline hover:opacity-80 flex items-center gap-0.5">
            🚨 123 (Nacional)
          </a>
          <a href="tel:132" className="font-bold underline hover:opacity-80 flex items-center gap-0.5">
            🚑 132 (Cruz Roja)
          </a>
          <a href="tel:144" className="font-bold underline hover:opacity-80 flex items-center gap-0.5">
            🛡️ 144 (Defensa Civil)
          </a>
          <a href="tel:119" className="font-bold underline hover:opacity-80 flex items-center gap-0.5">
            🚒 119 (Bomberos)
          </a>
          <a href="tel:165" className="font-bold underline hover:opacity-80 flex items-center gap-0.5">
            👮 165 (Gaula Policía)
          </a>
        </div>
      )}
    </aside>
  );
}

