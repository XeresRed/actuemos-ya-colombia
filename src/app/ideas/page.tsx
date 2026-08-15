import React from 'react';
import Link from 'next/link';

export default function IdeasDirectoryPage() {
  const ideas = [
    {
      id: 'idea-1',
      title: 'Red de Purificación de Agua Comunitaria en Zonas Aisladas',
      status: 'promovida',
      category: 'Salud y Agua',
      author: 'Comité Agua y Vida',
      location: 'Valle del Cauca y Nariño',
      commentsCount: 18,
      timeAgo: 'Hace 3h',
    },
    {
      id: 'idea-2',
      title: 'Brigada Móvil de Apoyo Psicológico Infantil Post-Trauma',
      status: 'en_accion',
      category: 'Salud Mental',
      author: 'Colectivo Sanar',
      location: 'Pasto, Nariño',
      commentsCount: 24,
      timeAgo: 'Hace 5h',
    },
    {
      id: 'idea-3',
      title: 'Censo Digital Geo-referenciado de Familias Damnificadas',
      status: 'redirigida',
      category: 'Logística',
      author: 'CivicTech Colombia',
      location: 'Nacional',
      commentsCount: 9,
      timeAgo: 'Hace 8h',
      redirectUrl: 'https://cruzrojacolombiana.org/censo-nacional',
    },
    {
      id: 'idea-4',
      title: 'Comedores Comunitarios Móviles con Alimentos Calientes',
      status: 'idea',
      category: 'Víveres',
      author: 'Junta de Acción Comunal',
      location: 'Popayán, Cauca',
      commentsCount: 7,
      timeAgo: 'Hace 12h',
    },
    {
      id: 'idea-5',
      title: 'Refugios Temporales Modulares de Ensamblaje Rápido',
      status: 'idea',
      category: 'Albergue',
      author: 'Arquitectura Solidaria',
      location: 'Cauca',
      commentsCount: 11,
      timeAgo: 'Hace 1d',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'promovida':
        return (
          <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
            Promovida
          </span>
        );
      case 'en_accion':
        return (
          <span className="bg-error-container text-on-error-container font-label-sm text-xs px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
            En Acción
          </span>
        );
      case 'redirigida':
        return (
          <span className="bg-surface-variant text-on-surface-variant font-label-sm text-xs px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">link</span> Redirigida
          </span>
        );
      default:
        return (
          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
            Idea
          </span>
        );
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'promovida':
        return 'border-t-tertiary-container';
      case 'en_accion':
        return 'border-t-primary';
      case 'redirigida':
        return 'border-t-outline';
      default:
        return 'border-t-secondary';
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
            Banco de Ideas Ciudadanas
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Repositorio central de propuestas ciudadanas y comunitarias. Debate, apoya y únete a las iniciativas que transforman la respuesta humanitaria.
          </p>
        </div>
        <div>
          <Link
            href="/ideas/nueva"
            className="bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-full font-bold uppercase tracking-wide hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Proponer Idea
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-stack-sm mb-stack-lg bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="filter-estado" className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
            Estado de la propuesta
          </label>
          <select
            id="filter-estado"
            className="w-full bg-surface border border-outline-variant rounded px-3 py-2 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            defaultValue=""
          >
            <option value="">Todos los estados</option>
            <option value="idea">Idea (Abierta a debate)</option>
            <option value="promovida">Promovida (Viable)</option>
            <option value="en_accion">En Acción (Ejecutándose)</option>
            <option value="redirigida">Redirigida (Iniciativa activa)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="filter-categoria" className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
            Categoría
          </label>
          <select
            id="filter-categoria"
            className="w-full bg-surface border border-outline-variant rounded px-3 py-2 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            defaultValue=""
          >
            <option value="">Todas las categorías</option>
            <option value="Salud y Agua">Salud y Agua</option>
            <option value="Salud Mental">Salud Mental</option>
            <option value="Albergue">Albergue y Techo</option>
            <option value="Logística">Logística y Rescate</option>
            <option value="Víveres">Víveres y Alimentación</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="filter-cobertura" className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
            Alcance Geográfico
          </label>
          <select
            id="filter-cobertura"
            className="w-full bg-surface border border-outline-variant rounded px-3 py-2 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
            defaultValue=""
          >
            <option value="">Nivel Nacional / Todos</option>
            <option value="Valle del Cauca">Valle del Cauca</option>
            <option value="Cauca">Cauca (Popayán)</option>
            <option value="Nariño">Nariño (Pasto)</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {ideas.map((idea) => (
          <article
            key={idea.id}
            className={`bg-surface-container-lowest border border-outline-variant rounded-lg border-t-4 ${getBorderColor(
              idea.status
            )} hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group p-stack-md`}
          >
            <div className="flex justify-between items-start mb-3">
              {getStatusBadge(idea.status)}
              <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span> {idea.timeAgo}
              </span>
            </div>

            <h3 className="font-headline-md text-lg font-bold text-on-surface flex-1 group-hover:text-primary transition-colors">
              <Link href={`/ideas/${idea.id}`}>
                {idea.title}
              </Link>
            </h3>

            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm font-semibold text-on-surface line-clamp-1">{idea.author}</span>
                  <span className="text-on-surface-variant flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">location_on</span> {idea.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
                <span className="material-symbols-outlined text-sm">chat_bubble</span> {idea.commentsCount}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
