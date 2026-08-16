'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Iniciativa } from '../../core/domain/iniciativa';

export default function IniciativasPage() {
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadInitiatives() {
      try {
        const res = await fetch('/api/iniciativas');
        const json = await res.json();
        if (json.ok && json.data && json.data.iniciativas) {
          setIniciativas(json.data.iniciativas);
        }
      } catch (err) {
        console.error('Error al cargar iniciativas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitiatives();
  }, []);

  const filteredIniciativas = useMemo(() => {
    return iniciativas.filter((item) => {
      if (activeCategory !== 'todas') {
        if (activeCategory === 'organismo_oficial' && item.categoria !== 'organismo_oficial') return false;
        if (activeCategory === 'ong' && item.categoria !== 'ong') return false;
        if (activeCategory === 'colectivo' && item.categoria !== 'colectivo' && item.categoria !== 'campaña') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.nombre.toLowerCase().includes(q);
        const matchDesc = item.descripcion.toLowerCase().includes(q);
        const matchLoc = item.coberturaGeografica ? item.coberturaGeografica.toLowerCase().includes(q) : false;
        const matchCat = item.categoria.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchCat) return false;
      }

      return true;
    });
  }, [iniciativas, activeCategory, searchQuery]);

  const getCategoryBadge = (categoria: string) => {
    switch (categoria) {
      case 'organismo_oficial':
        return (
          <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span> Organismo Oficial
          </span>
        );
      case 'ong':
        return (
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">public</span> ONG Internacional/Nacional
          </span>
        );
      default:
        return (
          <span className="bg-surface-variant text-on-surface-variant font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">groups</span> Colectivo / Brigada
          </span>
        );
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">corporate_fare</span>
            Directorio de Iniciativas Activas
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Tablero público anti-duplicación. Conoce las campañas, brigadas, ONGs y organismos de socorro que ya están operando sobre el terreno para coordinar esfuerzos.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'todas', label: 'Todas las Iniciativas', icon: 'grid_view' },
          { id: 'organismo_oficial', label: 'Organismos Oficiales 🏛️', icon: 'verified' },
          { id: 'ong', label: 'ONGs y Fundaciones 🌐', icon: 'public' },
          { id: 'colectivo', label: 'Colectivos y Brigadas 🤝', icon: 'groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === tab.id
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Filter Bar */}
      <div className="mb-stack-lg bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
            placeholder="Buscar por nombre de ONG, entidad oficial, insumos, Cruz Roja, Defensa Civil, Popayán, Pasto..."
            type="text"
          />
        </div>
      </div>

      {/* Initiatives Grid */}
      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-secondary">refresh</span>
          <p className="text-sm font-medium">Cargando directorio de iniciativas...</p>
        </div>
      ) : filteredIniciativas.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">corporate_fare</span>
          <h3 className="font-bold text-base text-on-surface">No se encontraron iniciativas con los filtros actuales</h3>
          <p className="text-xs mt-1 max-w-md mx-auto">
            ¿Eres parte de una ONG u organismo oficial operando en la emergencia? Contáctanos para registrar tu iniciativa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredIniciativas.map((item) => (
            <article
              key={item.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 relative border-t-4 border-t-secondary p-5"
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                {getCategoryBadge(item.categoria)}
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                  Activa en Campo
                </span>
              </div>

              <h2 className="font-headline-md text-base font-bold text-on-background mb-2">
                {item.nombre}
              </h2>

              <p className="font-body-md text-xs text-on-surface-variant mb-4 flex-1 leading-relaxed line-clamp-3">
                {item.descripcion}
              </p>

              <div className="flex flex-col gap-1.5 mb-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant text-xs text-on-surface">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs shrink-0">location_on</span>
                  <span className="truncate"><strong>Cobertura:</strong> {item.coberturaGeografica || 'Nacional'}</span>
                </div>
                {item.contacto ? (
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs shrink-0">call</span>
                    <span className="truncate"><strong>Contacto:</strong> {item.contacto}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant text-xs">
                <span className="text-[11px] text-on-surface-variant font-medium">Verificada por AYC</span>
                <a
                  href={item.urlOficial.startsWith('http') ? item.urlOficial : `https://${item.urlOficial}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary font-label-md text-xs font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Canal Oficial</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
