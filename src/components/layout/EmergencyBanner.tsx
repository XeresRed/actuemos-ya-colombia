'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { AlertaSistema, NivelAlerta } from '../../core/domain/alerta';

export function EmergencyBanner() {
  const [alertas, setAlertas] = useState<AlertaSistema[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carga de alertas activas desde la API
  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch('/api/alertas');
        const json = await res.json();
        if (json.ok && json.data.alertas && Array.isArray(json.data.alertas)) {
          setAlertas(json.data.alertas);
        }
      } catch (err) {
        console.error('Error al cargar alertas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  // Rotación automática del carrusel cada 6 segundos si hay más de 1 alerta activa
  useEffect(() => {
    if (alertas.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alertas.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [alertas.length, isPaused]);

  if (loading || alertas.length === 0) return null;

  const currentAlert = alertas[currentIndex] || alertas[0];
  const level = currentAlert.nivel || 'critica';

  const levelStyles: Record<NivelAlerta, { bg: string; text: string; icon: string; badge: string; label: string }> = {
    critica: {
      bg: 'bg-primary',
      text: 'text-on-primary',
      icon: 'warning',
      badge: 'bg-white/20 text-white',
      label: 'Emergencia Activa',
    },
    alerta_naranja: {
      bg: 'bg-amber-600',
      text: 'text-white',
      icon: 'priority_high',
      badge: 'bg-black/20 text-white',
      label: 'Alerta Naranja',
    },
    informativa: {
      bg: 'bg-secondary',
      text: 'text-on-secondary',
      icon: 'info',
      badge: 'bg-white/20 text-white',
      label: 'Comunicado Oficial',
    },
  };

  const currentStyle = levelStyles[level] || levelStyles.critica;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + alertas.length) % alertas.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % alertas.length);
  };

  return (
    <aside 
      aria-label="Alerta de emergencia nacional"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`${currentStyle.bg} ${currentStyle.text} w-full px-margin-mobile md:px-margin-desktop py-2.5 shadow-md z-50 transition-colors duration-500`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* Carrusel / Mensaje principal */}
        <div className="flex items-center gap-2 text-center md:text-left flex-1 min-w-0">
          <span 
            className="material-symbols-outlined shrink-0 text-xl animate-pulse" 
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
          >
            {currentStyle.icon}
          </span>

          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shrink-0 hidden sm:inline-block ${currentStyle.badge}`}>
            {currentStyle.label}
          </span>

          {/* Carrusel Controls si hay múltiples alertas */}
          {alertas.length > 1 ? (
            <div className="flex items-center gap-1 shrink-0 bg-black/15 px-1.5 py-0.5 rounded text-[11px] font-bold">
              <button
                type="button"
                onClick={handlePrev}
                className="hover:bg-white/20 p-0.5 rounded flex items-center justify-center transition-colors"
                title="Alerta anterior"
              >
                <span className="material-symbols-outlined text-xs">chevron_left</span>
              </button>
              <span>{currentIndex + 1}/{alertas.length}</span>
              <button
                type="button"
                onClick={handleNext}
                className="hover:bg-white/20 p-0.5 rounded flex items-center justify-center transition-colors"
                title="Siguiente alerta"
              >
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </button>
            </div>
          ) : null}

          <p className="font-body-md text-xs sm:text-sm font-semibold truncate-2-lines flex-1">
            {currentAlert.mensaje}
          </p>
        </div>

        {/* Elementos Fijos: Acción opcional + Canal UNGRD + Líneas de Emergencia */}
        <div className="flex items-center gap-2 shrink-0">
          {currentAlert.enlaceAccionUrl ? (
            <a
              href={currentAlert.enlaceAccionUrl.startsWith('http') ? currentAlert.enlaceAccionUrl : `https://${currentAlert.enlaceAccionUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-xs font-bold px-2.5 py-1 rounded border border-white/30"
            >
              <span>{currentAlert.enlaceAccionTexto || 'Ver Acción'}</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          ) : null}

          {/* Enlace UNGRD permanente */}
          <a
            href="https://portal.gestiondelriesgo.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-black/15 hover:bg-black/25 active:scale-95 transition-all text-xs font-bold px-2.5 py-1 rounded border border-white/20"
          >
            <span>Canal UNGRD</span>
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>

          {/* Botón Líneas de Atención */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-xs font-bold px-2.5 py-1 rounded transition-colors border border-white/20"
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
        <div className="mt-2.5 pt-2.5 border-t border-white/20 max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-5 text-xs animate-in fade-in">
          <span className="font-bold opacity-90 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">emergency</span>
            Líneas de socorro directo:
          </span>
          <a href="tel:123" className="font-bold underline hover:opacity-80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
            🚨 123 (Nacional / Policía)
          </a>
          <a href="tel:132" className="font-bold underline hover:opacity-80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
            🚑 132 (Cruz Roja)
          </a>
          <a href="tel:144" className="font-bold underline hover:opacity-80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
            🛡️ 144 (Defensa Civil)
          </a>
          <a href="tel:119" className="font-bold underline hover:opacity-80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
            🚒 119 (Bomberos)
          </a>
          <a href="tel:165" className="font-bold underline hover:opacity-80 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
            👮 165 (Gaula)
          </a>
        </div>
      )}
    </aside>
  );
}
