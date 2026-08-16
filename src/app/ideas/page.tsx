'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Idea, IdeaEstado } from '../../core/domain/idea';

const CATEGORIAS = [
  'Todas',
  'Salud y Agua',
  'Salud Mental',
  'Albergue',
  'Logística',
  'Víveres',
  'Rescate',
  'Tecnología',
  'Educación',
  'Otros',
];

export default function IdeasDirectoryPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEstado, setActiveEstado] = useState<string>('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadIdeas() {
      try {
        const res = await fetch('/api/ideas');
        const json = await res.json();
        if (json.ok && json.data.ideas) {
          setIdeas(json.data.ideas);
        }
      } catch (err) {
        console.error('Error al cargar propuestas ciudadanas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadIdeas();
  }, []);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      // Filtro por Estado
      if (activeEstado !== 'todos' && idea.estado !== activeEstado) {
        return false;
      }

      // Filtro por Categoría
      if (selectedCategoria !== 'Todas' && !idea.categoria.toLowerCase().includes(selectedCategoria.toLowerCase())) {
        return false;
      }

      // Filtro por Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = idea.titulo.toLowerCase().includes(q);
        const matchesDesc = idea.descripcionMarkdown.toLowerCase().includes(q);
        const matchesCat = idea.categoria.toLowerCase().includes(q);
        const matchesScope = idea.alcanceDetalle ? idea.alcanceDetalle.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesScope) return false;
      }

      return true;
    });
  }, [ideas, activeEstado, selectedCategoria, searchQuery]);

  const getStatusBadge = (estado: IdeaEstado) => {
    switch (estado) {
      case 'promovida':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-700">star</span> Promovida
          </span>
        );
      case 'en_accion':
        return (
          <span className="bg-red-100 text-red-900 border border-red-300 font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            <span className="material-symbols-outlined text-xs text-red-700">local_fire_department</span> En Acción
          </span>
        );
      case 'redirigida':
        return (
          <span className="bg-slate-100 text-slate-800 border border-slate-300 font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">open_in_new</span> Solución Existente
          </span>
        );
      case 'cerrada':
        return (
          <span className="bg-gray-100 text-gray-700 font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold">
            Meta Completada
          </span>
        );
      default:
        return (
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">lightbulb</span> Propuesta
          </span>
        );
    }
  };

  const getBorderColor = (estado: IdeaEstado) => {
    switch (estado) {
      case 'promovida':
        return 'border-t-amber-500';
      case 'en_accion':
        return 'border-t-primary';
      case 'redirigida':
        return 'border-t-slate-400';
      case 'cerrada':
        return 'border-t-gray-300';
      default:
        return 'border-t-secondary';
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Banner de Neutralidad Cívica y Apolitismo (REQ-01 & REQ-06) */}
      <div className="bg-surface-container-high border-l-4 border-[#005DB7] rounded-r-xl p-4 mb-stack-md flex items-start gap-3.5 shadow-sm">
        <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          policy
        </span>
        <div className="text-xs text-on-surface leading-relaxed">
          <h2 className="font-label-md font-bold text-on-surface text-sm mb-0.5 flex items-center gap-1.5">
            <span>Declaración de Neutralidad Cívica y Apolitismo</span>
            <span className="bg-secondary/10 text-secondary text-[10px] px-2 py-0.2 rounded font-bold uppercase">100% Cívico</span>
          </h2>
          <p className="text-on-surface-variant">
            ActuemosYa<span className="inline-flex font-semibold"><span className="text-[#D97706]">Col</span><span className="text-secondary">omb</span><span className="text-primary">ia</span></span> es una iniciativa tecnológica humanitaria y ciudadana independiente. Esta plataforma es estrictamente neutral, apolítica y sin ningún fin partidista ni electoral. Todas las propuestas buscan la articulación solidaria ante emergencias.
          </p>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">lightbulb</span>
            Banco de Ideas y Propuestas Ciudadanas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Centralizamos soluciones colaborativas para emergencias. Debate, apoya y canaliza talento técnico para ejecutar proyectos de alto impacto humanitario.
          </p>
        </div>
        <div>
          <Link
            href="/ideas/nueva"
            className="bg-primary text-on-primary font-label-md text-xs font-bold uppercase py-3.5 px-6 rounded-full hover:bg-primary-container transition-all shadow-sm inline-flex items-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Proponer Nueva Idea
          </Link>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'todos', label: 'Todas las Propuestas', icon: 'grid_view' },
          { id: 'en_accion', label: 'En Acción 🔥', icon: 'local_fire_department' },
          { id: 'promovida', label: 'Promovidas ⭐', icon: 'star' },
          { id: 'idea', label: 'Ideas Abiertas 💡', icon: 'lightbulb' },
          { id: 'redirigida', label: 'Soluciones Existentes 🔗', icon: 'link' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveEstado(tab.id)}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeEstado === tab.id
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-stack-lg bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm items-center">
        <div className="md:col-span-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
            placeholder="Buscar por palabra clave, agua, puente, kits, Popayán, Pasto..."
            type="text"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <label htmlFor="filter-categoria-select" className="text-xs font-bold text-on-surface-variant shrink-0">
            Categoría:
          </label>
          <select
            id="filter-categoria-select"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-secondary">refresh</span>
          <p className="text-sm font-medium">Cargando propuestas comunitarias...</p>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">lightbulb</span>
          <h3 className="font-bold text-base text-on-surface">No se encontraron propuestas con los filtros actuales</h3>
          <p className="text-xs mt-1 max-w-md mx-auto">
            ¿Tienes una solución innovadora para la emergencia? Sé el primero en compartirla con la comunidad.
          </p>
          <Link
            href="/ideas/nueva"
            className="mt-4 bg-primary text-on-primary font-label-md text-xs font-bold uppercase py-2.5 px-6 rounded-full inline-flex items-center gap-1.5 hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Publicar Propuesta</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredIdeas.map((idea) => (
            <article
              key={idea.id}
              className={`bg-surface-container-lowest border border-outline-variant rounded-xl border-t-4 ${getBorderColor(
                idea.estado
              )} hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group p-5`}
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                {getStatusBadge(idea.estado)}
                <span className="font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {new Date(idea.creadoEn).toLocaleDateString()}
                </span>
              </div>

              <h2 className="font-headline-md text-base font-bold text-on-surface group-hover:text-secondary transition-colors mb-2 line-clamp-2">
                <Link href={`/ideas/${idea.id}`}>
                  {idea.titulo}
                </Link>
              </h2>

              <p className="font-body-md text-xs text-on-surface-variant line-clamp-3 mb-4 flex-1 leading-relaxed">
                {idea.descripcionMarkdown.replace(/[#*`_\[\]]/g, '')}
              </p>

              {/* Scope and Existing Initiative indicator */}
              {idea.iniciativaExistenteUrl ? (
                <div className="mb-3 bg-surface-container-low p-2 rounded text-[11px] text-secondary flex items-center gap-1 font-semibold truncate">
                  <span className="material-symbols-outlined text-xs shrink-0">link</span>
                  <span className="truncate">Iniciativa vinculada: {idea.iniciativaExistenteUrl}</span>
                </div>
              ) : null}

              <div className="pt-3 border-t border-outline-variant flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                  <span className="bg-surface-variant text-on-surface-variant font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {idea.categoria}
                  </span>
                  <span>• {idea.alcanceTipo}</span>
                </div>

                <Link
                  href={`/ideas/${idea.id}`}
                  className="text-secondary font-label-md text-xs font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>Debatir</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
