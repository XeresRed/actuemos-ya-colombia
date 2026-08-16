'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Voluntariado, TipoVoluntariado } from '../../core/domain/voluntariado';

const AREAS_PROFESIONALES = [
  'Operario de Drones / Sensores Térmicos',
  'Operador de Maquinaria Pesada / Remoción',
  'Ingeniería Civil / Estructural / Geotecnia',
  'Medicina General / Urgencias / Trauma',
  'Psicología de Crisis / Primeros Auxilios Psicológicos',
  'Telecomunicaciones / Radioaficionados / Redes Satelitales',
  'Logística / Bodegaje / Cadena de Frío y Suministro',
  'Búsqueda y Rescate / Guías Caninos',
  'Desarrollo de Software / Análisis de Datos / GIS',
  'Otros',
];

export default function VoluntariosMatchingPage() {
  const [voluntariados, setVoluntariados] = useState<Voluntariado[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'ofrezco' | 'busco'>('todos');
  const [selectedArea, setSelectedArea] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});

  // Estados del Formulario
  const [tipo, setTipo] = useState<TipoVoluntariado>('ofrezco_habilidad');
  const [areaProfesional, setAreaProfesional] = useState(AREAS_PROFESIONALES[0]);
  const [otraArea, setOtraArea] = useState('');
  const [tituloNecesidad, setTituloNecesidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [esMayorDeEdad, setEsMayorDeEdad] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVoluntariados() {
      try {
        const res = await fetch('/api/voluntarios?estado=activo');
        const json = await res.json();
        if (json.ok && json.data.voluntariados) {
          setVoluntariados(json.data.voluntariados);
        }
      } catch (err) {
        console.error('Error al cargar voluntarios:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVoluntariados();
  }, []);

  const handleRevealContact = (id: string) => {
    setRevealedContacts((prev) => ({ ...prev, [id]: true }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!esMayorDeEdad) {
      setFormError('Debes certificar que eres mayor de edad (+18 años) para registrarte.');
      return;
    }

    if (!aceptaTerminos) {
      setFormError('Debes aceptar los Términos de Voluntariado y el Descargo de Responsabilidad.');
      return;
    }

    setFormLoading(true);

    const finalArea = areaProfesional === 'Otros' && otraArea.trim() ? `Otros: ${otraArea.trim()}` : areaProfesional;

    try {
      const res = await fetch('/api/voluntarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          areaProfesional: finalArea,
          tituloNecesidad,
          descripcion,
          nombreContacto,
          emailContacto,
          telefonoContacto: telefonoContacto || null,
          ubicacion: ubicacion || null,
          esMayorDeEdad: true,
          aceptaTerminos: true,
          captchaToken: 'dev-token',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al enviar el registro.');
      }

      setFormSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar el registro.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormSuccess(false);
    setTituloNecesidad('');
    setDescripcion('');
    setNombreContacto('');
    setEmailContacto('');
    setTelefonoContacto('');
    setUbicacion('');
    setOtraArea('');
    setEsMayorDeEdad(false);
    setAceptaTerminos(false);
  };

  const filteredItems = useMemo(() => {
    return voluntariados.filter((item) => {
      // Filtro por Tipo
      if (activeFilter === 'ofrezco' && item.tipo !== 'ofrezco_habilidad') return false;
      if (activeFilter === 'busco' && item.tipo !== 'busco_profesional') return false;

      // Filtro por Área
      if (selectedArea !== 'todas' && !item.areaProfesional.toLowerCase().includes(selectedArea.toLowerCase())) {
        return false;
      }

      // Filtro por Búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.tituloNecesidad.toLowerCase().includes(q);
        const matchesDesc = item.descripcion.toLowerCase().includes(q);
        const matchesArea = item.areaProfesional.toLowerCase().includes(q);
        const matchesLocation = item.ubicacion ? item.ubicacion.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc && !matchesArea && !matchesLocation) return false;
      }

      return true;
    });
  }, [voluntariados, activeFilter, selectedArea, searchQuery]);

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Title Header */}
      <div className="mb-stack-lg border-b border-outline-variant pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">handshake</span>
          Matching de Voluntariado y Talento Técnico
        </h1>
        <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mt-2 max-w-3xl">
          Articulación cívica neutral para canalizar perfiles técnicos especializados (drones, maquinaria pesada, médicos, ingenieros estructurales, psicólogos) hacia brigadas y colectivos en zonas afectadas.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Left Column: Form / Registration Panel */}
        <div className="xl:col-span-5 flex flex-col gap-stack-md">
          {/* Mode Switcher */}
          <div className="bg-surface-container-low p-1.5 rounded-xl border border-outline-variant flex shadow-sm">
            <button
              type="button"
              onClick={() => { setTipo('ofrezco_habilidad'); if (formSuccess) resetForm(); }}
              className={`flex-1 py-2.5 text-center rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'ofrezco_habilidad'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Ofrezco mi Habilidad</span>
            </button>
            <button
              type="button"
              onClick={() => { setTipo('busco_profesional'); if (formSuccess) resetForm(); }}
              className={`flex-1 py-2.5 text-center rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                tipo === 'busco_profesional'
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">search</span>
              <span>Busco Talento Técnico</span>
            </button>
          </div>

          {/* Quick Registration Form / Confirmation */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${tipo === 'ofrezco_habilidad' ? 'bg-primary' : 'bg-secondary'}`}></div>

            {formSuccess ? (
              <div className="py-6 flex flex-col items-center text-center gap-stack-md animate-in fade-in">
                <span className="material-symbols-outlined text-green-700 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">
                  ¡Registro Recibido con Éxito!
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed max-w-sm">
                  Tu {tipo === 'ofrezco_habilidad' ? 'oferta de voluntariado' : 'solicitud de talento'} ha sido guardada en estado <strong>Pendiente de Moderación</strong>.
                  Para garantizar la legitimidad y seguridad humanitaria, el equipo de supervisores revisará el reporte antes de publicarlo en el tablero general.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-2 bg-secondary text-on-secondary font-label-md text-xs font-bold uppercase px-6 py-2.5 rounded hover:bg-secondary-container transition-colors"
                >
                  Registrar otra postulación
                </button>
              </div>
            ) : (
              <>
                <header className="mb-4">
                  <h2 className="font-headline-md text-lg font-bold text-on-surface">
                    {tipo === 'ofrezco_habilidad' ? 'Registrar Mi Disponibilidad Técnica' : 'Publicar Necesidad de Talento Técnico'}
                  </h2>
                  <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                    {tipo === 'ofrezco_habilidad'
                      ? 'Postúlate como profesional voluntario para asistir en labores de emergencia.'
                      : 'Solicita perfiles y maquinaria para labores comunitarias u operaciones de ONG.'}
                  </p>
                </header>

                {formError ? (
                  <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
                    <span className="material-symbols-outlined text-sm shrink-0">error</span>
                    <span>{formError}</span>
                  </div>
                ) : null}

                <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-nombre">
                      {tipo === 'ofrezco_habilidad' ? 'Nombre Completo y Título *' : 'Nombre de la ONG / Colectivo / Responsable *'}
                    </label>
                    <input
                      id="vol-nombre"
                      value={nombreContacto}
                      onChange={(e) => setNombreContacto(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                      placeholder={tipo === 'ofrezco_habilidad' ? 'Ej. Ing. Juan Barreto / Dra. Sofía Gómez' : 'Ej. Brigada de Socorro Popayán / Cruz Roja'}
                      required
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-area">
                      Área Profesional o Técnica *
                    </label>
                    <select
                      id="vol-area"
                      value={areaProfesional}
                      onChange={(e) => setAreaProfesional(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                      required
                    >
                      {AREAS_PROFESIONALES.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  {areaProfesional === 'Otros' ? (
                    <div>
                      <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-otra-area">
                        Especificar Especialidad *
                      </label>
                      <input
                        id="vol-otra-area"
                        value={otraArea}
                        onChange={(e) => setOtraArea(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                        placeholder="Ej. Topógrafo / Radioaficionado HF / Soldador"
                        required
                        type="text"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-titulo">
                      {tipo === 'ofrezco_habilidad' ? 'Título Resumen de tu Oferta *' : 'Título de la Necesidad / Convocatoria *'}
                    </label>
                    <input
                      id="vol-titulo"
                      value={tituloNecesidad}
                      onChange={(e) => setTituloNecesidad(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                      placeholder={tipo === 'ofrezco_habilidad' ? 'Ej. Piloto con Dron Térmico disponible 24/7' : 'Ej. Se requieren 3 Ingenieros Civiles para peritajes'}
                      required
                      minLength={5}
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-descripcion">
                      Descripción Detallada y Experiencia *
                    </label>
                    <textarea
                      id="vol-descripcion"
                      rows={3}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded p-3 text-sm focus:border-secondary outline-none"
                      placeholder="Describe tus habilidades, disponibilidad horaria, equipos con los que cuentas o requerimientos técnicos puntuales..."
                      required
                      minLength={15}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-email">
                        Correo Electrónico *
                      </label>
                      <input
                        id="vol-email"
                        value={emailContacto}
                        onChange={(e) => setEmailContacto(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                        placeholder="correo@ejemplo.com"
                        required
                        type="email"
                      />
                    </div>

                    <div>
                      <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-telefono">
                        WhatsApp / Teléfono
                      </label>
                      <input
                        id="vol-telefono"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                        placeholder="+57 300 123 4567"
                        type="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-ubicacion">
                      Ubicación y Cobertura
                    </label>
                    <input
                      id="vol-ubicacion"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-secondary outline-none"
                      placeholder="Ej. Popayán, Cauca / Remoto / Valle del Cauca"
                      type="text"
                    />
                  </div>

                  {/* Términos y Descargo de Responsabilidad (Disclaimer Legal) */}
                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-2 text-[11px] text-on-surface-variant mt-2">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">gavel</span>
                      <p className="leading-snug">
                        <strong>Descargo de Responsabilidad Legal:</strong> ActuemosYaColombia es una plataforma comunitaria y neutral de articulación cívica. Los voluntarios profesionales actúan de manera libre, autónoma y bajo su propia responsabilidad. La plataforma no asume relación laboral ni responsabilidad civil por actividades en terreno.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/60 flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-on-surface">
                        <input
                          type="checkbox"
                          checked={esMayorDeEdad}
                          onChange={(e) => setEsMayorDeEdad(e.target.checked)}
                          className="rounded border-outline text-secondary focus:ring-secondary w-4 h-4 shrink-0"
                          required
                        />
                        <span>Certifico bajo juramento que soy mayor de edad (+18 años) *</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer font-medium text-on-surface">
                        <input
                          type="checkbox"
                          checked={aceptaTerminos}
                          onChange={(e) => setAceptaTerminos(e.target.checked)}
                          className="rounded border-outline text-secondary focus:ring-secondary w-4 h-4 shrink-0"
                          required
                        />
                        <span>Acepto los Términos de Voluntariado y el Descargo de Responsabilidad *</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full py-3 rounded font-label-md text-xs font-bold uppercase tracking-wider text-on-primary transition-colors mt-2 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                      tipo === 'ofrezco_habilidad' ? 'bg-primary hover:bg-primary-container' : 'bg-secondary hover:bg-secondary-container'
                    }`}
                  >
                    <span>{formLoading ? 'Enviando...' : 'Registrar para Revisión'}</span>
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Listing of Profiles / Requests */}
        <div className="xl:col-span-7 flex flex-col gap-stack-md">
          {/* Header Search & Filter */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-sm">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-full pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
                placeholder="Buscar por especialidad, dron, médico, ubicación..."
                type="text"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveFilter('todos')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'todos' ? 'bg-on-surface text-surface' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('ofrezco')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'ofrezco' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Ofertas
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('busco')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'busco' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Demandas
              </button>
            </div>
          </div>

          {/* Area Filter Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-on-surface-variant shrink-0">Especialidad:</span>
            <button
              type="button"
              onClick={() => setSelectedArea('todas')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                selectedArea === 'todas' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Todas
            </button>
            {AREAS_PROFESIONALES.slice(0, 5).map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                  selectedArea === area ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {area.split('/')[0]}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-secondary">refresh</span>
              <p className="text-sm">Cargando perfiles técnicos verificados...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">engineering</span>
              <h3 className="font-bold text-sm text-on-surface">No se encontraron perfiles con los filtros actuales</h3>
              <p className="text-xs mt-1 max-w-md mx-auto">
                Sé el primero en registrar tu disponibilidad profesional o solicitud de soporte técnico en la columna izquierda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {filteredItems.map((item) => {
                const isOffer = item.tipo === 'ofrezco_habilidad';
                const isContactRevealed = revealedContacts[item.id];

                return (
                  <div
                    key={item.id}
                    className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow relative border-t-4 flex flex-col ${
                      isOffer ? 'border-t-primary' : 'border-t-secondary'
                    }`}
                  >
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2.5 gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOffer ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}>
                          {item.areaProfesional}
                        </span>
                        {item.ubicacion ? (
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1 shrink-0">
                            <span className="material-symbols-outlined text-xs">location_on</span> {item.ubicacion}
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-headline-md text-base font-bold text-on-surface mb-1">
                        {item.tituloNecesidad}
                      </h4>
                      <p className={`font-label-md text-xs font-semibold mb-2 ${isOffer ? 'text-primary' : 'text-secondary'}`}>
                        {item.nombreContacto}
                      </p>

                      <p className="font-body-md text-xs text-on-surface-variant mb-4 flex-1 leading-relaxed">
                        {item.descripcion}
                      </p>

                      {/* Contact Protection Section */}
                      <div className="pt-3 border-t border-outline-variant flex flex-col gap-2 text-xs">
                        {isContactRevealed ? (
                          <div className="flex flex-col gap-1.5 bg-surface-container-low p-2.5 rounded border border-outline-variant animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-on-surface-variant">Correo:</span>
                              <a
                                href={`mailto:${item.emailContacto}?subject=Contacto%20desde%20ActuemosYaColombia:%20${encodeURIComponent(item.tituloNecesidad)}`}
                                className="font-semibold text-secondary hover:underline flex items-center gap-1 text-xs"
                              >
                                <span className="material-symbols-outlined text-xs">mail</span>
                                {item.emailContacto}
                              </a>
                            </div>

                            {item.telefonoContacto ? (
                              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/60">
                                <span className="text-[11px] text-on-surface-variant">WhatsApp / Tel:</span>
                                <a
                                  href={`tel:${item.telefonoContacto}`}
                                  className="font-semibold text-green-700 hover:underline flex items-center gap-1 text-xs"
                                >
                                  <span className="material-symbols-outlined text-xs">call</span>
                                  {item.telefonoContacto}
                                </a>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevealContact(item.id)}
                            className="w-full py-2 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-xs text-secondary">visibility</span>
                            <span>Contactar / Ver Datos Protegidos</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
