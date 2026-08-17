'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Idea, IdeaEstado } from '../core/domain/idea';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export default function EmergencyHubPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  useEffect(() => {
    async function loadFeaturedIdeas() {
      try {
        const res = await fetch('/api/ideas?limit=4&order=desc');
        const json = await res.json();
        if (json.ok && json.data && json.data.ideas) {
          setFeaturedIdeas(json.data.ideas);
        }
      } catch (err) {
        console.error('Error al cargar propuestas en Hub:', err);
      } finally {
        setLoadingIdeas(false);
      }
    }

    loadFeaturedIdeas();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ideas?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getStatusBadge = (estado: IdeaEstado) => {
    switch (estado) {
      case 'promovida':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-700">star</span> Promovida
          </span>
        );
      case 'en_accion':
        return (
          <span className="bg-red-100 text-red-900 border border-red-300 font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            <span className="material-symbols-outlined text-xs text-red-700">local_fire_department</span> En Acción
          </span>
        );
      case 'redirigida':
        return (
          <span className="bg-slate-100 text-slate-800 border border-slate-300 font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">open_in_new</span> Solución Existente
          </span>
        );
      default:
        return (
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">lightbulb</span> Propuesta
          </span>
        );
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center w-full px-margin-mobile md:px-margin-desktop py-stack-md gap-stack-lg max-w-7xl mx-auto">
      {/* Search Header for Mobile / Quick Search */}
      <div className="w-full">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-3 border border-outline-variant rounded-xl bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md font-body-md outline-none shadow-sm text-xs sm:text-sm"
            placeholder={t.hub.searchPlaceholder}
            type="text"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container transition-colors uppercase"
          >
            {t.actions.buscar}
          </button>
        </form>
      </div>

      {/* High Priority Direct Access Grid (6 Key Modules) */}
      <section className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-gutter" aria-label="Accesos directos de emergencia">
        {/* Card 1: Proponer Idea */}
        <Link
          href="/ideas/nueva"
          className="bg-primary text-on-primary p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            {t.hub.cardProponer}
          </span>
        </Link>

        {/* Card 2: Búsqueda Humanitaria */}
        <Link
          href="/busqueda"
          className="bg-surface border-2 border-secondary text-secondary p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            person_search
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            {t.hub.cardBusqueda}
          </span>
        </Link>

        {/* Card 3: Recursos y Trámites */}
        <Link
          href="/recursos"
          className="bg-surface-container-high border-2 border-[#D97706] text-[#D97706] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-amber-100 transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            menu_book
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide text-amber-950">
            {t.hub.cardRecursos}
          </span>
        </Link>

        {/* Card 4: Voluntariado */}
        <Link
          href="/voluntarios"
          className="bg-surface border border-outline text-on-surface p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-variant transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            handshake
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            {t.hub.cardVoluntarios}
          </span>
        </Link>

        {/* Card 5: Iniciativas */}
        <Link
          href="/iniciativas"
          className="bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-tertiary-fixed-dim transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
            corporate_fare
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            {t.hub.cardIniciativas}
          </span>
        </Link>

        {/* Card 6: Banco de Ideas */}
        <Link
          href="/ideas"
          className="bg-surface-container-lowest border border-outline-variant text-on-surface p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-all shadow-sm hover:shadow-md h-28 sm:h-36 group active:scale-95 text-center"
        >
          <span className="material-symbols-outlined text-3xl sm:text-4xl group-hover:scale-110 transition-transform text-primary">
            forum
          </span>
          <span className="font-label-md text-[11px] sm:text-xs font-bold uppercase tracking-wide">
            {t.hub.cardIdeas}
          </span>
        </Link>
      </section>

      {/* Direct Dial Emergency Bar */}
      <section className="w-full bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-red-950 font-bold">
          <span className="material-symbols-outlined text-red-700 animate-pulse text-xl">phone_in_talk</span>
          <span>Líneas Telefónicas de Socorro Nacional (Marcado Directo 24/7):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="tel:123" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            🚨 123 (Nacional)
          </a>
          <a href="tel:132" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            🚑 132 (Cruz Roja)
          </a>
          <a href="tel:144" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            🛡️ 144 (Defensa Civil)
          </a>
          <a href="tel:119" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            🚒 119 (Bomberos)
          </a>
        </div>
      </section>

      {/* Official Emergency Organizations Feed */}
      <section className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
              Organismos Oficiales y de Socorro del Estado
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Verificación y Enlaces Directos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* UNGRD */}
          <a
            href="https://portal.gestiondelriesgo.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3.5 rounded-lg border border-outline-variant flex flex-col justify-between gap-2 transition-colors group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>UNGRD</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Gestión del Riesgo
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Reportes oficiales de afectación y salas de crisis nacional.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">gestiondelriesgo.gov.co →</span>
          </a>

          {/* Cruz Roja Colombiana */}
          <a
            href="https://cruzrojacolombiana.org"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3.5 rounded-lg border border-outline-variant flex flex-col justify-between gap-2 transition-colors group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Cruz Roja (Línea 132)</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Búsqueda Familiar (RCF)
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Restablecimiento de contacto y atención médica de urgencia.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">cruzrojacolombiana.org →</span>
          </a>

          {/* Unidad para las Víctimas (RUV) */}
          <a
            href="https://www.unidadvictimas.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3.5 rounded-lg border border-outline-variant flex flex-col justify-between gap-2 transition-colors group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Unidad para las Víctimas</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Plataforma RUV
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Registro Único de Víctimas y orientación humanitaria.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">unidadvictimas.gov.co →</span>
          </a>

          {/* Defensa Civil Colombiana */}
          <a
            href="https://www.defensacivil.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3.5 rounded-lg border border-outline-variant flex flex-col justify-between gap-2 transition-colors group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>Defensa Civil (Línea 144)</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Operaciones de Rescate
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Búsqueda, rescate en colapso y albergues provisionales.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-secondary">defensacivil.gov.co →</span>
          </a>
        </div>
      </section>

      {/* Featured Feed & Quick Búsqueda */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Featured Ideas Column */}
        <section className="lg:col-span-8 flex flex-col gap-stack-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <span>{t.hub.propuestasRecientes}</span>
            </h2>
            <Link href="/ideas" className="text-secondary font-label-md text-xs sm:text-sm font-bold hover:underline flex items-center gap-1">
              <span>{t.actions.verMas}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {loadingIdeas ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl animate-spin text-secondary mb-2">refresh</span>
              <p className="text-xs">{t.common.cargando}</p>
            </div>
          ) : featuredIdeas.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">lightbulb</span>
              <h3 className="font-bold text-sm text-on-surface">{t.hub.sinPropuestas}</h3>
              <p className="text-xs mt-1 max-w-md mx-auto">
                {t.hub.ctaSePrimero}
              </p>
              <Link
                href="/ideas/nueva"
                className="mt-3 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase rounded-lg inline-flex items-center gap-1 hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{t.nav.proponerIdea}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {featuredIdeas.map((idea) => (
                <article
                  key={idea.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 border-t-secondary gap-2"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      {getStatusBadge(idea.estado)}
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(idea.creadoEn).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-2 mb-1">
                      <Link href={`/ideas/${idea.id}`}>
                        {idea.titulo}
                      </Link>
                    </h3>

                    <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {idea.descripcionMarkdown.replace(/[#*`_\[\]]/g, '')}
                    </p>

                    {/* Linked Initiative clickable pill */}
                    {idea.iniciativaExistenteUrl ? (
                      <a
                        href={idea.iniciativaExistenteUrl.startsWith('http') ? idea.iniciativaExistenteUrl : `https://${idea.iniciativaExistenteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/50 p-1.5 rounded text-[11px] text-secondary hover:text-primary transition-colors flex items-center justify-between gap-1 font-semibold truncate group/link z-10"
                        title={`Abrir iniciativa externa vinculada: ${idea.iniciativaExistenteUrl}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-xs shrink-0">link</span>
                          <span className="truncate">Iniciativa: {idea.iniciativaExistenteUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                        <span className="material-symbols-outlined text-[12px] opacity-70 group-hover/link:opacity-100 shrink-0">open_in_new</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant/60 text-xs">
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {idea.alcanceDetalle || idea.alcanceTipo}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-primary font-bold hover:underline flex items-center gap-0.5 text-xs"
                    >
                      <span>Ver debate</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar: Búsqueda rápida & Voluntariado Callout */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="material-symbols-outlined">person_search</span>
              <span>Búsqueda Rápida</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              ¿Buscas a un familiar o mascota reportada tras la emergencia?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/busqueda?tipo=persona"
                className="p-3 bg-surface-container-low hover:bg-secondary hover:text-white rounded-lg text-center transition-all text-xs font-bold border border-outline-variant flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-2xl">person</span>
                <span>Personas</span>
              </Link>
              <Link
                href="/busqueda?tipo=animal"
                className="p-3 bg-surface-container-low hover:bg-secondary hover:text-white rounded-lg text-center transition-all text-xs font-bold border border-outline-variant flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-2xl">pets</span>
                <span>Mascotas</span>
              </Link>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span className="material-symbols-outlined">handshake</span>
              <span>Matching de Talento</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Conectamos profesionales en medicina, rescate, logística y desarrollo con colectivos que atienden el desastre.
            </p>
            <Link
              href="/voluntarios"
              className="w-full py-2 bg-secondary text-on-secondary text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-1 hover:bg-secondary-container transition-colors shadow-sm"
            >
              <span>Ver Banco de Voluntarios</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
