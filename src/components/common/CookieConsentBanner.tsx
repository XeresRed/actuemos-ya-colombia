'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ayc_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Ignorar si localStorage no está disponible
    }
  }, []);

  const handleConsent = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('ayc_cookie_consent', type);
      setShowBanner(false);
      window.dispatchEvent(
        new CustomEvent('ayc_cookie_consent_changed', { detail: type })
      );
    } catch {
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Consentimiento de Cookies y Privacidad"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-white/95 backdrop-blur-md border-t border-outline-variant shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Información y Fundamento Legal */}
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-surface-container rounded-lg text-primary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-2xl">privacy_tip</span>
          </div>
          <div className="text-xs text-on-surface leading-relaxed">
            <div className="font-bold text-sm text-on-surface mb-1 flex items-center gap-2">
              <span>Aviso de Privacidad y Uso de Cookies</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                Ley 1581 de 2012 — SIC
              </span>
            </div>
            <p className="text-on-surface-variant">
              Utilizamos cookies técnicas necesarias para la autenticación y operación del portal. De conformidad con la <strong>Ley Estatutaria 1581 de 2012</strong> de Protección de Datos Personales y el <strong>Decreto 1074 de 2015</strong> (Superintendencia de Industria y Comercio), solicitamos su autorización para el uso de herramientas de medición de tráfico y análisis de impacto cívico.{' '}
              <Link
                href="/sobre-nosotros"
                className="text-primary font-semibold underline hover:text-primary-container transition-colors"
              >
                Conozca nuestra Política de Privacidad
              </Link>.
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-lg border border-outline text-on-surface hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={() => handleConsent('all')}
            className="flex-1 lg:flex-none px-5 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary-container transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieConsentBanner;
