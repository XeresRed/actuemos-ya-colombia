'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Iniciativa } from '../../core/domain/iniciativa';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { IniciativaDetailModal } from '@/components/iniciativas/IniciativaDetailModal';

export default function IniciativasPage() {
  const { t } = useTranslation();
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  // Modal de detalles
  const [selectedIniciativa, setSelectedIniciativa] = useState<Iniciativa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when category or order changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleOrderChange = (newOrder: 'desc' | 'asc') => {
    setOrder(newOrder);
    setPage(1);
  };

  // Fetch initiatives from API
  const fetchIniciativas = useCallback(
    async (currentPage: number, isAppending = false) => {
      if (isAppending) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', '9');
        params.append('order', order);

        if (activeCategory !== 'todas') {
          params.append('categoria', activeCategory);
        }

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        const res = await fetch(`/api/iniciativas?${params.toString()}`);
        const json = await res.json();

        if (json.ok && json.data) {
          const newItems: Iniciativa[] = json.data.iniciativas || [];
          const totalCount: number = json.data.total ?? 0;
          const serverHasMore: boolean = json.data.hasMore ?? false;

          setTotal(totalCount);
          setHasMore(serverHasMore);

          if (isAppending) {
            setIniciativas((prev) => [...prev, ...newItems]);
          } else {
            setIniciativas(newItems);
          }
        }
      } catch (err) {
        console.error('Error al cargar iniciativas:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, debouncedSearch, order]
  );

  useEffect(() => {
    fetchIniciativas(1, false);
  }, [fetchIniciativas]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchIniciativas(nextPage, true);
    }
  };

  const handleOpenDetail = (item: Iniciativa) => {
    setSelectedIniciativa(item);
    setIsModalOpen(true);
  };

  const getCategoryBadge = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'organismo_oficial':
        return (
          <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span> Oficial
          </span>
        );
      case 'ong':
        return (
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">public</span> ONG
          </span>
        );
      case 'colectivo':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-emerald-700">groups</span> Colectivo
          </span>
        );
      case 'campaña':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-amber-700">campaign</span> Campaña
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-900 font-label-sm text-[11px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
            {categoria}
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
            {t.iniciativas.titulo}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            {t.iniciativas.descripcion}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto gap-2 pb-1 no-scrollbar">
        {[
          { id: 'todas', label: 'Todas las Iniciativas', icon: 'grid_view' },
          { id: 'organismo_oficial', label: 'Organismos Oficiales 🏛️', icon: 'verified' },
          { id: 'ong', label: 'ONGs y Fundaciones 🌐', icon: 'public' },
          { id: 'colectivo', label: 'Colectivos y Brigadas 🤝', icon: 'groups' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleCategoryChange(tab.id)}
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

      {/* Search & Sort Bar */}
      <div className="mb-stack-lg bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
            placeholder={t.iniciativas.buscarPlaceholder}
            type="text"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Sort Selector & Count */}
        <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
          <span className="text-xs text-on-surface-variant font-medium">
            {t.actions.verMas}: <strong>{iniciativas.length}</strong> / <strong>{total}</strong>
          </span>

          <div className="flex items-center gap-1.5 bg-surface border border-outline-variant rounded-lg px-2.5 py-1 text-xs">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">sort</span>
            <select
              value={order}
              onChange={(e) => handleOrderChange(e.target.value as 'desc' | 'asc')}
              className="bg-transparent text-on-surface text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="desc">{t.iniciativas.masRecientes}</option>
              <option value="asc">{t.iniciativas.masAntiguas}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Initiatives Grid */}
      {loading ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-secondary">refresh</span>
          <p className="text-sm font-medium">{t.common.cargando}</p>
        </div>
      ) : iniciativas.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">corporate_fare</span>
          <h3 className="font-bold text-base text-on-surface">{t.common.noResultados}</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {iniciativas.map((item) => (
              <article
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 relative border-t-4 border-t-secondary p-5 cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  {getCategoryBadge(item.categoria)}
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
                    {t.iniciativas.activaEnCampo}
                  </span>
                </div>

                <h2 className="font-headline-md text-base font-bold text-on-background mb-2 group-hover:text-primary transition-colors">
                  {item.nombre}
                </h2>

                <p className="font-body-md text-xs text-on-surface-variant mb-3 flex-1 leading-relaxed line-clamp-3">
                  {item.descripcion}
                </p>

                {/* Badges de Cobertura, Dirección y Fecha */}
                <div className="flex flex-col gap-1.5 mb-4 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant text-xs text-on-surface">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-xs shrink-0 text-secondary">location_on</span>
                    <span className="truncate"><strong>{t.iniciativas.cobertura}</strong> {item.coberturaGeografica || t.common.nacional}</span>
                  </div>

                  {item.direccion ? (
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs shrink-0 text-primary">pin_drop</span>
                      <span className="truncate"><strong>Punto:</strong> {item.direccion}</span>
                    </div>
                  ) : null}

                  {item.fechaEvento ? (
                    <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                      <span className="material-symbols-outlined text-xs shrink-0 text-amber-700">event</span>
                      <span className="truncate font-semibold">{item.fechaEvento}</span>
                    </div>
                  ) : null}
                </div>

                {/* Footer de Tarjeta con botón de detalles y canal oficial */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant text-xs gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(item);
                    }}
                    className="text-primary font-bold text-xs hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t.actions.verDetalles}</span>
                    <span className="material-symbols-outlined text-xs">visibility</span>
                  </button>

                  <a
                    href={item.urlOficial.startsWith('http') ? item.urlOficial : `https://${item.urlOficial}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-primary text-on-primary font-label-md text-xs font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-primary-container transition-colors inline-flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <span>{t.iniciativas.canalOficial}</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore ? (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="px-6 py-3 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
              >
                {loadingMore ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin text-secondary">refresh</span>
                    <span>{t.common.cargando}</span>
                  </>
                ) : (
                  <>
                    <span>{t.actions.verMas}</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </>
                )}
              </button>
            </div>
          ) : null}
        </>
      )}

      {/* Modal de Detalle de Iniciativa */}
      <IniciativaDetailModal
        iniciativa={selectedIniciativa}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
