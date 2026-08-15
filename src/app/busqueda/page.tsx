'use client';

import React, { useState } from 'react';

export default function BusquedaHumanitariaPage() {
  const [activeTab, setActiveTab] = useState<'todos' | 'persona' | 'animal'>('todos');
  const [activeStatus, setActiveStatus] = useState<string>('todos');

  const reportes = [
    {
      id: 'rep-1',
      type: 'persona',
      name: 'Carlos Andrés Mendoza',
      age: '34 años',
      details: 'Estatura 1.75m, camiseta azul oscuro, jean gris. Visto cerca al Parque Caldas tras el sismo.',
      location: 'Popayán, Cauca — Centro',
      status: 'buscado',
      contact: '+57 312 4567890',
      statusLabel: 'Persona Buscada',
      statusClass: 'bg-error text-on-error',
      borderClass: 'border-t-error',
    },
    {
      id: 'rep-2',
      type: 'persona',
      name: 'María Elena Gómez',
      age: '62 años',
      details: 'Cabello castaño corto, suéter de lana rojo. Localizada en albergue con atención médica.',
      location: 'Pasto, Nariño — Albergue Estadio Libertad',
      status: 'en_refugio',
      contact: '+57 315 9876543',
      statusLabel: 'En Refugio',
      statusClass: 'bg-tertiary-container text-on-tertiary-container',
      borderClass: 'border-t-tertiary',
    },
    {
      id: 'rep-3',
      type: 'animal',
      name: 'Rocky',
      species: 'Perro Labrador mestizo',
      details: 'Color dorado claro, collar rojo sin placa identificadora, mancha blanca en el pecho.',
      location: 'Popayán — Barrio Bolívar',
      status: 'buscado',
      contact: '+57 300 1122334',
      statusLabel: 'Animal Perdido',
      statusClass: 'bg-error text-on-error',
      borderClass: 'border-t-error',
    },
    {
      id: 'rep-4',
      type: 'animal',
      name: 'Luna',
      species: 'Gata Siamesa',
      details: 'Ojos azules intensos, rescatada de escombros. Recibiendo cuidado veterinario.',
      location: 'Pasto — Clínica Veterinaria Municipal',
      status: 'localizado',
      contact: '+57 318 5544332',
      statusLabel: 'Rescatado',
      statusClass: 'bg-secondary text-on-secondary',
      borderClass: 'border-t-secondary',
    },
  ];

  const filteredReportes = reportes.filter((rep) => {
    if (activeTab !== 'todos' && rep.type !== activeTab) return false;
    if (activeStatus !== 'todos' && rep.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
            Búsqueda Humanitaria y Mascotas
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Directorio centralizado y validado de personas y animales de compañía no localizados o albergados tras la emergencia.
          </p>
        </div>
        <button
          onClick={() => alert('Formulario de nuevo reporte en preparación para la siguiente fase')}
          className="bg-primary text-on-primary font-label-md text-label-md font-bold uppercase tracking-wider px-6 py-3 rounded shadow-sm hover:bg-primary-container active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Crear Reporte de Búsqueda
        </button>
      </div>

      {/* Tabs & Filter Chips */}
      <div className="flex flex-col gap-4 mb-stack-lg bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
        {/* Category Tabs */}
        <div className="flex gap-4 border-b border-outline-variant pb-2">
          <button
            onClick={() => setActiveTab('todos')}
            className={`font-label-md text-sm pb-2 font-bold transition-colors ${
              activeTab === 'todos'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todos los Reportes
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`font-label-md text-sm pb-2 font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'persona'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person</span> Personas
          </button>
          <button
            onClick={() => setActiveTab('animal')}
            className={`font-label-md text-sm pb-2 font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'animal'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">pets</span> Animales / Mascotas
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-label-sm text-xs text-on-surface-variant mr-2">Filtrar por Estado:</span>
          <button
            onClick={() => setActiveStatus('todos')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              activeStatus === 'todos'
                ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary'
                : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-variant'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveStatus('buscado')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
              activeStatus === 'buscado'
                ? 'bg-error text-on-error border-error'
                : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-variant'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
            Buscado / Perdido
          </button>
          <button
            onClick={() => setActiveStatus('en_refugio')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
              activeStatus === 'en_refugio'
                ? 'bg-tertiary-container text-on-tertiary-container border-tertiary'
                : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-variant'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary inline-block"></span>
            En Refugio
          </button>
          <button
            onClick={() => setActiveStatus('localizado')}
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
              activeStatus === 'localizado'
                ? 'bg-secondary text-on-secondary border-secondary'
                : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-variant'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
            Localizado / Rescatado
          </button>
        </div>
      </div>

      {/* Grid of Search Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {filteredReportes.map((rep) => (
          <article
            key={rep.id}
            className={`bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow border-t-4 ${rep.borderClass}`}
          >
            {/* Visual Icon Avatar */}
            <div className="bg-surface-container-low p-6 flex justify-between items-start border-b border-outline-variant">
              <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-3xl">
                  {rep.type === 'persona' ? 'person' : 'pets'}
                </span>
              </div>
              <span className={`font-label-sm text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider ${rep.statusClass}`}>
                {rep.statusLabel}
              </span>
            </div>

            <div className="p-5 flex flex-col flex-1 gap-3">
              <div>
                <h3 className="font-headline-md text-lg font-bold text-on-background">
                  {rep.name}
                </h3>
                {rep.species ? (
                  <p className="font-label-sm text-xs text-secondary font-semibold">{rep.species}</p>
                ) : (
                  <p className="font-label-sm text-xs text-on-surface-variant">{rep.age}</p>
                )}
              </div>

              <p className="font-body-md text-xs text-on-surface-variant flex-1">
                {rep.details}
              </p>

              <div className="flex items-start gap-2 pt-3 border-t border-outline-variant text-xs text-on-surface">
                <span className="material-symbols-outlined text-outline text-sm shrink-0">location_on</span>
                <span>{rep.location}</span>
              </div>

              <div className="bg-surface-container-low p-3 rounded flex items-center justify-between border border-outline-variant text-xs">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant">Contacto de Emergencia</span>
                  <span className="font-bold text-on-surface">{rep.contact}</span>
                </div>
                <button
                  onClick={() => alert(`Llamando al contacto de emergencia: ${rep.contact}`)}
                  className="bg-secondary text-on-secondary p-2 rounded hover:bg-secondary-container transition-colors"
                  title="Contactar"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
