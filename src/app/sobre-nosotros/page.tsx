'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function SobreNosotrosPage() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(t.sobreNosotros.difusionMensajeTexto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(t.sobreNosotros.difusionMensajeTexto);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ActuemosYaColombia',
          text: t.sobreNosotros.difusionMensajeTexto,
          url: 'https://actuemosyacolombia.org',
        });
      } catch {
        // Ignorar si el usuario canceló el diálogo nativo
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-4 md:py-stack-lg">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 md:mb-stack-lg space-y-3">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
          <span className="material-symbols-outlined text-sm">handshake</span>
          <span>{t.sobreNosotros.tagHeader}</span>
        </div>

        <h1 className="font-headline-lg text-2xl sm:text-3xl md:text-5xl font-black text-on-background tracking-tight">
          {t.sobreNosotros.titulo}
        </h1>

        <p className="font-body-md text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
          {t.sobreNosotros.descripcion}
        </p>
      </div>

      {/* SECCIÓN SIGNATURE: CAJA DE DIFUSIÓN CÍVICA */}
      <div className="bg-gradient-to-br from-primary-container/25 via-surface-container-lowest to-secondary-container/20 border-2 border-primary/30 rounded-2xl p-5 md:p-7 mb-6 md:mb-stack-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {t.sobreNosotros.difusionTitulo}
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                {t.sobreNosotros.difusionSubtitulo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              <span className="material-symbols-outlined text-xs">share</span>
              1-Clic
            </span>
          </div>
        </div>

        {/* Preview del mensaje formateado */}
        <div className="bg-surface border border-outline-variant/80 rounded-xl p-4 mb-4 text-xs font-mono whitespace-pre-line text-on-surface leading-relaxed relative selection:bg-primary-container">
          {t.sobreNosotros.difusionMensajeTexto}
        </div>

        {/* Barra de Acciones de Difusión */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            <span>{t.sobreNosotros.difusionWhatsApp}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex-1 sm:flex-none px-4 py-2.5 font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer border ${
              copied
                ? 'bg-green-700 text-white border-green-800'
                : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {copied ? 'check_circle' : 'content_copy'}
            </span>
            <span>{copied ? t.sobreNosotros.difusionCopiado : t.sobreNosotros.difusionCopiar}</span>
          </button>

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full sm:w-auto px-4 py-2.5 bg-secondary text-on-secondary hover:bg-secondary-container font-bold text-xs uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">share</span>
              <span>{t.sobreNosotros.difusionCompartirNativo}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: ¿Qué es?, ¿Para qué sirve?, ¿Por qué nació? */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6 md:mb-stack-xl">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-primary flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">help_outline</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              {t.sobreNosotros.queEsTitulo}
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {t.sobreNosotros.queEsDesc}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-primary font-bold flex items-center gap-1">
            <span>{t.sobreNosotros.queEsTag}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-secondary flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              {t.sobreNosotros.paraQueTitulo}
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {t.sobreNosotros.paraQueDesc}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-secondary font-bold flex items-center gap-1">
            <span>{t.sobreNosotros.paraQueTag}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm border-t-4 border-t-[#D97706] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">electric_bolt</span>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              {t.sobreNosotros.porQueTitulo}
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
              {t.sobreNosotros.porQueDesc}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/60 text-xs text-amber-800 font-bold flex items-center gap-1">
            <span>{t.sobreNosotros.porQueTag}</span>
          </div>
        </div>
      </div>

      {/* Principios de Neutralidad y Apolitismo */}
      <div className="bg-surface-container-high border-l-4 border-secondary rounded-r-2xl p-5 md:p-7 mb-6 md:mb-stack-xl shadow-sm space-y-2.5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl shrink-0">policy</span>
          <h2 className="font-headline-md text-base sm:text-lg md:text-xl font-bold text-on-surface">
            {t.sobreNosotros.neutralidadTitulo}
          </h2>
        </div>
        <p className="font-body-md text-xs md:text-sm text-on-surface-variant leading-relaxed">
          {t.sobreNosotros.neutralidadDesc}
        </p>
      </div>

      {/* Equipo Fundador */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-8 mb-6 md:mb-stack-xl shadow-sm">
        <div className="border-b border-outline-variant pb-4 mb-6">
          <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            <span>{t.sobreNosotros.equipoTitulo}</span>
          </h2>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1">
            {t.sobreNosotros.equipoDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fundador 1: Juan Camilo Castaño */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-lg border border-primary/20 shrink-0">
                  JC
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">
                    {t.sobreNosotros.fundador1Nombre}
                  </h3>
                  <p className="font-label-md text-xs text-primary font-semibold">
                    {t.sobreNosotros.fundador1Rol}
                  </p>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                {t.sobreNosotros.fundador1Bio}
              </p>
            </div>

            <a
              href="https://www.linkedin.com/in/juan-camilo-castano-bonilla-819223182/?locale=es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-on-secondary font-label-md text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
            >
              <span>{t.sobreNosotros.conectarLinkedIn}</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>

          {/* Fundador 2: Juan David Nuñez */}
          <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary font-black flex items-center justify-center text-lg border border-secondary/20 shrink-0">
                  JN
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">
                    {t.sobreNosotros.fundador2Nombre}
                  </h3>
                  <p className="font-label-md text-xs text-secondary font-semibold">
                    {t.sobreNosotros.fundador2Rol}
                  </p>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                {t.sobreNosotros.fundador2Bio}
              </p>
            </div>

            <a
              href="https://www.linkedin.com/in/juandnunezaljure?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-on-secondary font-label-md text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors shadow-sm cursor-pointer"
            >
              <span>{t.sobreNosotros.conectarLinkedIn}</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Código Abierto y Filosofía */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container text-on-surface mx-auto">
          <span className="material-symbols-outlined text-2xl">code</span>
        </div>

        <h2 className="font-headline-md text-xl font-bold text-on-surface">
          {t.sobreNosotros.codigoAbiertoTitulo}
        </h2>

        <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {t.sobreNosotros.codigoAbiertoDesc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://github.com/XeresRed/actuemos-ya-colombia"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold uppercase rounded-lg hover:bg-surface-container-high transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">terminal</span>
            <span>{t.sobreNosotros.btnGitHub}</span>
          </a>

          <Link
            href="/voluntarios"
            className="px-5 py-2.5 bg-primary text-on-primary font-label-md text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">front_hand</span>
            <span>{t.sobreNosotros.btnUnirmeVoluntario}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
