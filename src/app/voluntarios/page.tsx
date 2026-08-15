'use client';

import React, { useState } from 'react';

export default function VoluntariosMatchingPage() {
  const [activeTab, setActiveTab] = useState<'ofrezco' | 'busco'>('ofrezco');

  const voluntariados = [
    {
      id: 'vol-1',
      type: 'ofrezco_habilidad',
      title: 'Médico Especialista en Urgencias y Trauma',
      professional: 'Dra. Camila Restrepo',
      area: 'Salud / Medicina',
      location: 'Popayán y alrededores',
      description: '10 años de experiencia en trauma y urgencias hospitalarias. Disponibilidad inmediata para turnos de 12 horas.',
      contact: 'camilarestrepo.med@gmail.com',
      phone: '+57 311 2233445',
    },
    {
      id: 'vol-2',
      type: 'busco_profesional',
      title: 'Se requieren 4 Ingenieros Estructurales para Habitabilidad',
      professional: 'Comité de Emergencia Departamental',
      area: 'Ingeniería / Construcción',
      location: 'Pasto y municipios aledaños',
      description: 'Inspección técnica rápida de habitabilidad en escuelas y viviendas tras réplicas del sismo.',
      contact: 'infraestructura@cauca.gov.co',
      phone: '+57 602 8240000',
    },
    {
      id: 'vol-3',
      type: 'ofrezco_habilidad',
      title: 'Psicología Clínica y de Crisis Post-Trauma',
      professional: 'David Valencia',
      area: 'Salud Mental y Psicología',
      location: 'Remoto / Popayán',
      description: 'Atención psicológica individual y grupal para primeros auxilios psicológicos y manejo de duelo.',
      contact: 'david.valencia.psi@gmail.com',
      phone: '+57 320 8899776',
    },
  ];

  const filteredItems = voluntariados.filter((item) =>
    activeTab === 'ofrezco' ? item.type === 'ofrezco_habilidad' : item.type === 'busco_profesional'
  );

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Title */}
      <div className="mb-stack-lg border-b border-outline-variant pb-6">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
          Matching de Voluntariado Profesional
        </h2>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mt-2 max-w-3xl">
          Conecta habilidades y perfiles técnicos especializados (médicos, ingenieros, psicólogos, rescatistas) con necesidades críticas en terreno sin burocracia.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Left Column: Mode Switch & Fast Form */}
        <div className="xl:col-span-4 flex flex-col gap-stack-md">
          {/* Mode Switcher */}
          <div className="bg-surface-container-low p-1.5 rounded-xl border border-outline-variant flex shadow-sm">
            <button
              onClick={() => setActiveTab('ofrezco')}
              className={`flex-1 py-2.5 text-center rounded-lg font-label-md text-xs font-bold transition-all ${
                activeTab === 'ofrezco'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Ofrezco mi Habilidad
            </button>
            <button
              onClick={() => setActiveTab('busco')}
              className={`flex-1 py-2.5 text-center rounded-lg font-label-md text-xs font-bold transition-all ${
                activeTab === 'busco'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Busco Talento Técnico
            </button>
          </div>

          {/* Quick Registration Form */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${activeTab === 'ofrezco' ? 'bg-primary' : 'bg-secondary'}`}></div>
            <h3 className="font-headline-md text-lg font-bold mb-2 text-on-surface">
              {activeTab === 'ofrezco' ? 'Publicar Mi Disponibilidad' : 'Publicar Solicitud de Personal'}
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant mb-4">
              Registro directo y validado para contacto inmediato.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Registro recibido.'); }} className="space-y-3 text-xs">
              <div>
                <label className="block font-label-sm text-on-surface-variant mb-1">Nombre o Entidad</label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                  placeholder="Ej. Dra. Camila Restrepo"
                  type="text"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-1">Área Profesional / Especialidad</label>
                <select className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none">
                  <option>Salud / Medicina</option>
                  <option>Ingeniería / Construcción</option>
                  <option>Psicología / Salud Mental</option>
                  <option>Logística / Transporte 4x4</option>
                  <option>Desarrollo de Software / Datos</option>
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-1">WhatsApp / Teléfono</label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                  placeholder="+57 300 000 0000"
                  type="tel"
                />
              </div>

              <div>
                <label className="block font-label-sm text-on-surface-variant mb-1">Ubicación o Disponibilidad de Viaje</label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                  placeholder="Ej. Popayán / Remoto"
                  type="text"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded font-label-md text-xs font-bold uppercase tracking-wider text-on-primary transition-colors mt-2 active:scale-95 ${
                  activeTab === 'ofrezco' ? 'bg-primary hover:bg-primary-container' : 'bg-secondary hover:bg-secondary-container'
                }`}
              >
                Registrar Publicación
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Listing of Profiles / Requests */}
        <div className="xl:col-span-8 flex flex-col gap-stack-md">
          {/* Header Search & Filter */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="flex-1 min-w-[200px] relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full bg-surface border border-outline-variant rounded-full pl-9 pr-4 py-1.5 text-xs focus:border-secondary outline-none"
                placeholder="Buscar por especialidad o palabra clave..."
                type="text"
              />
            </div>
            <span className="text-xs text-on-surface-variant font-semibold">
              {filteredItems.length} perfiles disponibles
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow relative border-t-4 border-t-secondary flex flex-col"
              >
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2.5 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded text-xs font-bold">
                      {item.area}
                    </span>
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> {item.location}
                    </span>
                  </div>

                  <h4 className="font-headline-md text-base font-bold text-on-surface mb-1">
                    {item.title}
                  </h4>
                  <p className="font-label-md text-xs text-secondary font-semibold mb-2">
                    {item.professional}
                  </p>

                  <p className="font-body-md text-xs text-on-surface-variant mb-4 flex-1">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-outline-variant flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-mono">{item.phone}</span>
                    <a
                      href={`mailto:${item.contact}`}
                      className="bg-secondary text-on-secondary font-label-md text-xs font-bold px-3 py-1.5 rounded hover:bg-secondary-container transition-colors inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">mail</span> Contactar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
