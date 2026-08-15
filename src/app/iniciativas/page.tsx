import React from 'react';
import Link from 'next/link';

export default function IniciativasPage() {
  const iniciativas = [
    {
      id: 'ini-1',
      name: 'Cruz Roja Colombiana - Operación Rescate Sismo',
      organization: 'Cruz Roja Colombiana',
      description: 'Atención médica prehospitalaria, rescate en estructuras colapsadas y distribución de kits humanitarios de emergencia en centros de acopio.',
      category: 'Salud y Rescate',
      location: 'Nivel Nacional',
      status: 'activa',
      url: 'https://cruzrojacolombiana.org',
      contact: '+57 601 4376300',
    },
    {
      id: 'ini-2',
      name: 'Techo Colombia - Refugios Transitorios de Emergencia',
      organization: 'Techo Colombia',
      description: 'Construcción acelerada de viviendas modulares de emergencia para familias en extrema vulnerabilidad y damnificados sin techo.',
      category: 'Vivienda y Albergue',
      location: 'Cauca y Nariño',
      status: 'activa',
      url: 'https://colombia.techo.org',
      contact: 'emergencia@techo.org',
    },
    {
      id: 'ini-3',
      name: 'Banco de Alimentos de Colombia (ÁBACO)',
      organization: 'Red ÁBACO',
      description: 'Acopio masivo y distribución de víveres no perecederos, agua potable tratada y kits de aseo prioritarios.',
      category: 'Víveres y Alimentación',
      location: 'Nacional',
      status: 'activa',
      url: 'https://abaco.org.co',
      contact: 'donaciones@abaco.org.co',
    },
  ];

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
            Directorio de Iniciativas Activas
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Tablero público anti-duplicación. Conoce las campañas, brigadas y organizaciones oficiales que ya están operando sobre el terreno.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <section className="flex flex-col gap-stack-sm bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-sm mb-stack-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-secondary">filter_list</span>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">Filtros de Iniciativas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div>
            <label className="font-label-sm text-xs text-on-surface-variant block mb-1">Zona Geográfica</label>
            <select className="w-full p-2.5 rounded border border-outline-variant bg-surface text-sm focus:border-secondary outline-none">
              <option value="">Todas las zonas</option>
              <option value="nacional">Nacional</option>
              <option value="cauca">Cauca</option>
              <option value="narino">Nariño</option>
              <option value="valle">Valle del Cauca</option>
            </select>
          </div>

          <div>
            <label className="font-label-sm text-xs text-on-surface-variant block mb-1">Tipo de Intervención</label>
            <select className="w-full p-2.5 rounded border border-outline-variant bg-surface text-sm focus:border-secondary outline-none">
              <option value="">Todas las categorías</option>
              <option value="salud">Salud y Rescate</option>
              <option value="vivienda">Vivienda y Albergue</option>
              <option value="viveres">Víveres y Alimentación</option>
            </select>
          </div>

          <div>
            <label className="font-label-sm text-xs text-on-surface-variant block mb-1">Buscar por Nombre u ONG</label>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full pl-9 pr-3 py-2 rounded border border-outline-variant bg-surface text-sm focus:border-secondary outline-none"
                placeholder="Ej. Cruz Roja, Techo..."
                type="text"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Initiatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {iniciativas.map((item) => (
          <article
            key={item.id}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 relative border-t-4 border-t-secondary"
          >
            <div className="p-stack-md flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-primary-fixed-variant px-2 py-0.5 rounded font-label-sm text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">sync</span>
                  Activa en Campo
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant">Oficial</span>
              </div>

              <h3 className="font-headline-md text-lg font-bold text-on-background mb-1">
                {item.name}
              </h3>

              <p className="font-label-md text-xs text-secondary mb-3 flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-sm">corporate_fare</span>
                {item.organization}
              </p>

              <p className="font-body-md text-sm text-on-surface-variant mb-stack-md flex-1">
                {item.description}
              </p>

              <div className="flex flex-col gap-1.5 mb-stack-md bg-surface p-3 rounded border border-outline-variant/50 text-xs text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                  <span><strong className="font-semibold">Cobertura:</strong> {item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-sm">category</span>
                  <span><strong className="font-semibold">Área:</strong> {item.category}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant text-xs">
                <span className="text-on-surface-variant font-mono">{item.contact}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary font-label-md font-bold px-3 py-1.5 rounded hover:bg-primary-container transition-colors inline-flex items-center gap-1"
                >
                  Sitio Oficial <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
