'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Idea, IdeaEstado } from '../core/domain/idea';

export default function EmergencyHubPage() {
  const router = useRouter();
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
            placeholder="Buscar propuestas, recursos de alcaldía, iniciativas o insumos..."
            type="text"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container transition-colors uppercase"
          >
            Buscar
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
            Proponer Solución
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
            Buscar Personas / Mascotas
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
            Trámites Alcaldía (RUD)
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
            Talento Técnico
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
            Iniciativas Activas
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
            Muro Comunitario
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
            <span>🚨 123 (Emergencias)</span>
          </a>
          <a href="tel:132" className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            <span>🚑 132 (Cruz Roja)</span>
          </a>
          <a href="tel:144" className="px-3 py-1.5 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-colors inline-flex items-center gap-1 shadow-sm">
            <span>🦺 144 (Defensa Civil)</span>
          </a>
          <a href="tel:+576014069977" className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors inline-flex items-center gap-1 shadow-sm">
            <span>🏛️ Medicina Legal</span>
          </a>
        </div>
      </section>

      {/* Official Colombian Relief & Victim Registries */}
      <section className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-stack-md" aria-label="Canales oficiales y registro de víctimas">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-2 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <div>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                Canales Oficiales y Registro de Víctimas / Damnificados
              </h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                Portales oficiales del Estado Colombiano y organismos de socorro nacional
              </p>
            </div>
          </div>
          <span className="font-label-sm text-[11px] bg-secondary-fixed text-on-secondary-fixed font-bold px-2 py-0.5 rounded uppercase">
            Fuentes Oficiales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* UNGRD RUND */}
          <a
            href="http://portal.gestiondelriesgo.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface hover:bg-surface-container p-3.5 rounded-lg border border-outline-variant flex flex-col justify-between gap-2 transition-colors group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-primary font-bold text-xs">
                <span>UNGRD — RUND</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">open_in_new</span>
              </div>
              <p className="font-label-md text-sm font-bold text-on-surface mt-1">
                Sala de Crisis y Damnificados
              </p>
              <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                Censo oficial y registro único nacional de damnificados.
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
              <span>Propuestas Ciudadanas Destacadas</span>
            </h2>
            <Link href="/ideas" className="text-secondary font-label-md text-xs sm:text-sm font-bold hover:underline flex items-center gap-1">
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {loadingIdeas ? (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl animate-spin text-secondary mb-2">refresh</span>
              <p className="text-xs">Cargando propuestas recientes...</p>
            </div>
          ) : featuredIdeas.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">lightbulb</span>
              <h3 className="font-bold text-sm text-on-surface">No hay propuestas comunitarias registradas aún</h3>
              <p className="text-xs mt-1 max-w-md mx-auto">
                Sé el primero en proponer una solución tecnológica o humanitaria para la emergencia.
              </p>
              <Link
                href="/ideas/nueva"
                className="mt-3 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase rounded-lg inline-flex items-center gap-1 hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Publicar Primera Propuesta</span>
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
                          <span className="truncate">Iniciativa vinculada: {idea.iniciativaExistenteUrl.replace(/^https?:\/\//, '')}</span>
                        </div>
                        <span className="material-symbols-outlined text-[12px] opacity-70 group-hover/link:opacity-100 shrink-0">open_in_new</span>
                      </a>
                    ) : null}

                    {/* Volunteer Request Indicator */}
                    {idea.requiereVoluntarios ? (
                      <div className="mt-2 inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold w-fit">
                        <span className="material-symbols-outlined text-xs text-amber-700" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                        <span>{idea.cantidadVoluntarios ? `${idea.cantidadVoluntarios} ` : ''}voluntarios solicitados</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-2 border-t border-outline-variant/60 flex justify-between items-center text-xs">
                    <span className="bg-surface-variant text-[10px] font-bold uppercase px-2 py-0.5 rounded text-on-surface-variant">
                      {idea.categoria}
                    </span>
                    <Link href={`/ideas/${idea.id}`} className="text-secondary font-bold text-xs hover:underline flex items-center gap-0.5">
                      <span>Debatir</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Urgent Search Sidebar: Articulation with ColombiaTeBusca & MiGenteVe */}
        <aside className="lg:col-span-4 flex flex-col gap-stack-md">
          <div className="border-b border-outline-variant pb-2 flex justify-between items-center">
            <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">person_search</span>
              <span>Búsqueda Urgente</span>
            </h2>
            <span className="bg-red-100 text-red-900 border border-red-300 font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              Redes Oficiales
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* ColombiaTeBusca Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2 shadow-sm border-l-4 border-l-secondary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">person</span>
                <div>
                  <h4 className="font-headline-md text-sm font-bold text-on-surface">
                    Personas No Localizadas
                  </h4>
                  <span className="text-[11px] text-secondary font-semibold">
                    Vía ColombiaTeBusca + Cruz Roja RCF
                  </span>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Reporta o consulta el registro unificado nacional de personas desaparecidas o incomunicadas ante la emergencia.
              </p>
              <a
                href="https://colombiatebusca.com/?tab=persons"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 py-1.5 px-3 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors inline-flex items-center justify-between shadow-sm"
              >
                <span>Abrir ColombiaTeBusca</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>

            {/* MiGenteVe Colombia Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-2 shadow-sm border-l-4 border-l-primary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">pets</span>
                <div>
                  <h4 className="font-headline-md text-sm font-bold text-on-surface">
                    Mascotas, Refugios y Veterinaria
                  </h4>
                  <span className="text-[11px] text-primary font-semibold">
                    Vía MiGenteVe Colombia
                  </span>
                </div>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Registro de animales extraviados, mapa de albergues de paso y red de urgencias médicas veterinarias.
              </p>
              <a
                href="https://colombia.migenteve.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 py-1.5 px-3 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-colors inline-flex items-center justify-between shadow-sm"
              >
                <span>Abrir MiGenteVe</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>

            <Link
              href="/busqueda"
              className="w-full text-center py-2 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors"
            >
              Ver Protocolo de Búsqueda Completo →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
