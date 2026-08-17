'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Voluntariado, TipoVoluntariado } from '../../core/domain/voluntariado';
import { TurnstileModal } from '../../components/ui/TurnstileModal';

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
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeFilter, setActiveFilter] = useState<'todos' | 'ofrezco' | 'busco'>('todos');
  const [selectedArea, setSelectedArea] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [revealedContacts, setRevealedContacts] = useState<Record<string, boolean>>({});

  // Estados del Formulario
  const [tipo, setTipo] = useState<TipoVoluntariado>('ofrezco_habilidad');
  const [areaProfesional, setAreaProfesional] = useState(AREAS_PROFESIONALES[0]);
  const [otraArea, setOtraArea] = useState('');
  const [tituloNecesidad, setTituloNecesidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [esMayorDeEdad, setEsMayorDeEdad] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleFilterTypeChange = (filter: 'todos' | 'ofrezco' | 'busco') => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    setPage(1);
  };

  const handleOrderChange = (newOrder: 'desc' | 'asc') => {
    setOrder(newOrder);
    setPage(1);
  };

  const fetchVoluntariados = useCallback(
    async (currentPage: number, isAppending = false) => {
      if (isAppending) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.append('estado', 'activo');
        params.append('page', currentPage.toString());
        params.append('limit', '8');
        params.append('order', order);

        if (activeFilter === 'ofrezco') {
          params.append('tipo', 'ofrezco_habilidad');
        } else if (activeFilter === 'busco') {
          params.append('tipo', 'busco_profesional');
        }

        if (selectedArea !== 'todas') {
          params.append('area', selectedArea);
        }

        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }

        const res = await fetch(`/api/voluntarios?${params.toString()}`);
        const json = await res.json();

        if (json.ok && json.data) {
          const newItems: Voluntariado[] = json.data.voluntariados || [];
          const totalCount: number = json.data.total ?? 0;
          const serverHasMore: boolean = json.data.hasMore ?? false;

          setTotal(totalCount);
          setHasMore(serverHasMore);

          if (isAppending) {
            setVoluntariados((prev) => [...prev, ...newItems]);
          } else {
            setVoluntariados(newItems);
          }
        }
      } catch (err) {
        console.error('Error al cargar voluntarios:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter, selectedArea, debouncedSearch, order]
  );

  useEffect(() => {
    fetchVoluntariados(1, false);
  }, [fetchVoluntariados]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVoluntariados(nextPage, true);
    }
  };

  const handleRevealContact = (id: string) => {
    setRevealedContacts((prev) => ({ ...prev, [id]: true }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
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

    if (!tituloNecesidad.trim() || !descripcion.trim() || !nombreContacto.trim() || !emailContacto.trim()) {
      setFormError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setShowCaptchaModal(true);
  };

  const handleVerifiedSubmit = async (token: string) => {
    setFormLoading(true);
    setFormError(null);

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
          organizacion: tipo === 'busco_profesional' ? (organizacion.trim() || null) : null,
          emailContacto,
          telefonoContacto: telefonoContacto || null,
          ubicacion: ubicacion || null,
          esMayorDeEdad: true,
          aceptaTerminos: true,
          captchaToken: token,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al enviar el registro.');
      }

      setFormSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar el registro.');
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormSuccess(false);
    setTituloNecesidad('');
    setDescripcion('');
    setNombreContacto('');
    setOrganizacion('');
    setEmailContacto('');
    setTelefonoContacto('');
    setUbicacion('');
    setOtraArea('');
    setEsMayorDeEdad(false);
    setAceptaTerminos(false);
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg border-b border-outline-variant pb-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
            Banco de Talento Técnico y Voluntariado
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
            Canal de matching solidario entre <strong>profesionales certificados</strong> (médicos, psicólogos, operadores de maquinaria/drones, ingenieros) y <strong>colectivos u ONGs</strong> con necesidades operativas urgentes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-stack-lg items-start">
        {/* Left Column: Form Section */}
        <div className="xl:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="border-b border-outline-variant pb-4 mb-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">assignment_ind</span>
              <span>Registro de Habilidades y Requerimientos</span>
            </h2>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">
              Publica tu oferta voluntaria o solicita perfiles especializados para tu equipo de respuesta.
            </p>
          </div>

          {formSuccess ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-center space-y-3 animate-in fade-in">
              <span className="material-symbols-outlined text-green-600 text-5xl">verified</span>
              <h3 className="font-bold text-base text-on-surface">¡Registro Recibido con Éxito!</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tu postulación se encuentra en <strong>revisión por el equipo de moderadores</strong>. Una vez validada, tus datos serán publicados en el tablero general protegiendo tu privacidad.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2.5 bg-primary text-on-primary font-label-md text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors mt-2"
              >
                Registrar Otro Perfil o Requerimiento
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {formError ? (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm shrink-0">error</span>
                  <span>{formError}</span>
                </div>
              ) : null}

              {/* Selector de Tipo */}
              <div>
                <label className="block font-label-sm font-bold text-on-surface mb-1.5">
                  Tipo de Publicación *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('ofrezco_habilidad')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      tipo === 'ofrezco_habilidad'
                        ? 'bg-primary-fixed border-primary text-on-primary-fixed shadow-sm'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">front_hand</span>
                    <span>Ofrezco Habilidad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('busco_profesional')}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      tipo === 'busco_profesional'
                        ? 'bg-secondary-fixed border-secondary text-on-secondary-fixed shadow-sm'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">person_search</span>
                    <span>Busco Perfil</span>
                  </button>
                </div>
              </div>

              {tipo === 'ofrezco_habilidad' ? (
                <div>
                  <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-nombre">
                    Nombre Completo y Título / Especialidad *
                  </label>
                  <input
                    id="vol-nombre"
                    value={nombreContacto}
                    onChange={(e) => setNombreContacto(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                    placeholder="Ej. Ing. Juan Barreto / Dra. Sofía Gómez"
                    required
                    type="text"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-nombre">
                      Nombre del Solicitante o Contacto *
                    </label>
                    <input
                      id="vol-nombre"
                      value={nombreContacto}
                      onChange={(e) => setNombreContacto(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                      placeholder="Ej. Carlos Gómez / Líder Comunitario"
                      required
                      type="text"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-label-sm font-bold text-on-surface" htmlFor="vol-organizacion">
                        Organización, Colectivo o Brigada
                      </label>
                      <span className="text-[10px] text-on-surface-variant font-medium">(Opcional)</span>
                    </div>
                    <input
                      id="vol-organizacion"
                      value={organizacion}
                      onChange={(e) => setOrganizacion(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                      placeholder="Ej. Cruz Roja / Brigada Popayán / Tercero Particular"
                      type="text"
                    />
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      Si eres un particular, vecino o tercero solicitando apoyo, puedes dejar este campo vacío.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-area">
                  Área Profesional o Técnica *
                </label>
                <select
                  id="vol-area"
                  value={areaProfesional}
                  onChange={(e) => setAreaProfesional(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none cursor-pointer"
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
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
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
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
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
                  className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-xs focus:border-secondary outline-none"
                  placeholder="Describe tus habilidades, disponibilidad horaria, equipos o requerimientos puntuales..."
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
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                    placeholder="contacto@profesional.co"
                    required
                    type="email"
                  />
                </div>

                <div>
                  <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-tel">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <input
                    id="vol-tel"
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                    placeholder="+57 300 1234567"
                    type="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm font-bold text-on-surface mb-1" htmlFor="vol-ubicacion">
                  Ubicación o Disponibilidad Geográfica (Opcional)
                </label>
                <input
                  id="vol-ubicacion"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:border-secondary outline-none"
                  placeholder="Ej. Popayán, Cauca / Remoto / Valle del Cauca"
                  type="text"
                />
              </div>

              {/* Términos y Descargo de Responsabilidad */}
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-3 space-y-2 text-[11px] text-on-surface-variant">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm shrink-0 mt-0.5">gavel</span>
                  <p className="leading-snug">
                    <strong>Descargo de Responsabilidad:</strong> Plataforma cívica neutral. Los voluntarios profesionales actúan de manera libre y autónoma bajo su propia responsabilidad.
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
                    <span>Acepto los Términos de Voluntariado y el Descargo *</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className={`w-full py-3 rounded-lg font-label-md text-xs font-bold uppercase tracking-wider text-on-primary transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                  tipo === 'ofrezco_habilidad' ? 'bg-primary hover:bg-primary-container' : 'bg-secondary hover:bg-secondary-container'
                }`}
              >
                <span>{formLoading ? 'Enviando Registro...' : 'Registrar para Revisión'}</span>
                <span className="material-symbols-outlined text-sm">send</span>
              </button>

              {/* Just-in-Time Security Verification Modal */}
              <TurnstileModal
                isOpen={showCaptchaModal}
                onClose={() => setShowCaptchaModal(false)}
                onVerified={handleVerifiedSubmit}
                action="registro_voluntario"
                title="Verificación de Voluntariado"
                description="Protegemos la red de voluntarios contra registros falsos y envíos automatizados."
              />
            </form>
          )}
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
                className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
                placeholder="Buscar por especialidad, dron, médico, Popayán, Pasto..."
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

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFilterTypeChange('todos')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'todos' ? 'bg-on-surface text-surface' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => handleFilterTypeChange('ofrezco')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'ofrezco' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Ofertas
              </button>
              <button
                type="button"
                onClick={() => handleFilterTypeChange('busco')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === 'busco' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Demandas
              </button>
            </div>
          </div>

          {/* Area Filter Selector & Sort Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-bold text-on-surface-variant shrink-0 mr-1">Área:</span>
              <button
                type="button"
                onClick={() => handleAreaChange('todas')}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                  selectedArea === 'todas' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Todas
              </button>
              {AREAS_PROFESIONALES.slice(0, 4).map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaChange(area)}
                  className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                    selectedArea === area ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {area.split('/')[0]}
                </button>
              ))}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-outline-variant/60 pt-2 sm:pt-0">
              <span className="text-[11px] text-on-surface-variant font-medium">
                <strong>{voluntariados.length}</strong> de <strong>{total}</strong>
              </span>

              <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded-lg px-2 py-0.5 text-xs">
                <span className="material-symbols-outlined text-xs text-on-surface-variant">sort</span>
                <select
                  value={order}
                  onChange={(e) => handleOrderChange(e.target.value as 'desc' | 'asc')}
                  className="bg-transparent text-on-surface text-[11px] font-semibold outline-none cursor-pointer"
                >
                  <option value="desc">Más recientes</option>
                  <option value="asc">Más antiguos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-secondary">refresh</span>
              <p className="text-sm font-medium">Cargando perfiles técnicos verificados...</p>
            </div>
          ) : voluntariados.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">engineering</span>
              <h3 className="font-bold text-sm text-on-surface">No se encontraron perfiles con los filtros actuales</h3>
              <p className="text-xs mt-1 max-w-md mx-auto">
                Sé el primero en registrar tu disponibilidad profesional o solicitud de soporte técnico en la columna izquierda.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {voluntariados.map((item) => {
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
                          <span>{item.nombreContacto}</span>
                          {item.organizacion ? (
                            <span className="text-on-surface-variant font-normal"> • {item.organizacion}</span>
                          ) : null}
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

              {/* Load More Button */}
              {hasMore ? (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-surface-container border border-outline text-on-surface font-label-md text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {loadingMore ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin text-secondary">refresh</span>
                        <span>Cargando más perfiles...</span>
                      </>
                    ) : (
                      <>
                        <span>Cargar más perfiles</span>
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-on-surface-variant">
                    Mostrando {voluntariados.length} de {total} perfiles activos
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
