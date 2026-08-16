'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface TramiteRecurso {
  id: string;
  categoria: 'rud' | 'defuncion' | 'victimas' | 'subsidios' | 'formatos';
  titulo: string;
  entidad: string;
  resumen: string;
  esGratuito: boolean;
  dondeAcudir: string;
  requisitos: string[];
  pasos: string[];
  enlacesOficiales?: { texto: string; url: string }[];
  alertaSeguridad?: string;
  marcoLegal?: string;
}

const TRAMITES: TramiteRecurso[] = [
  {
    id: 'rud-ungrd',
    categoria: 'rud',
    titulo: 'Inscripción en el Registro Único de Damnificados (RUD)',
    entidad: 'Alcaldías Municipales / UNGRD / CMGRD',
    resumen: 'Censo oficial obligatorio para que una persona o núcleo familiar afectado por un desastre natural acceda a las ayudas humanitarias de emergencia, kits alimentarios y subsidios gubernamentales.',
    esGratuito: true,
    dondeAcudir: 'Puntos de censo habilitados por la Alcaldía Municipal, Defensa Civil, Cruz Roja o el Consejo Municipal de Gestión del Riesgo (CMGRD).',
    requisitos: [
      'Documento de identidad original (Cédula de Ciudadanía, Tarjeta de Identidad, PPT o Registro Civil) de todos los integrantes del hogar.',
      'Dirección exacta del predio o vivienda afectada y descripción del daño (pérdida total, daño estructural severo, inundación).',
      'Si no cuenta con documentos físicos por haberlos perdido en la emergencia, se permite manifestación verbal bajo gravedad de juramento.',
    ],
    pasos: [
      'Acude al punto de censo o albergue oficial de tu municipio con tu núcleo familiar.',
      'Diligencia la Ficha de Caracterización RUD con el funcionario debidamente carnetizado de la Alcaldía o Defensa Civil.',
      'Verifica que los nombres, números de cédula y teléfono de contacto queden registrados con total exactitud.',
      'Solicita el número o comprobante de registro del censo para el seguimiento de entregas humanitarias.',
    ],
    enlacesOficiales: [
      { texto: 'Portal Oficial UNGRD — Sala de Crisis', url: 'http://portal.gestiondelriesgo.gov.co/' },
      { texto: 'Directrices Nacionales de Manejo de Desastres', url: 'http://portal.gestiondelriesgo.gov.co/Paginas/Estrategia-Nacional-de-Respuesta.aspx' },
    ],
    alertaSeguridad: 'El registro en el RUD es 100% GRATUITO. Ningún líder barrial, tramitador ni funcionario puede cobrar por inscribirte.',
    marcoLegal: 'Ley 1523 de 2012 (Sistema Nacional de Gestión del Riesgo de Desastres).',
  },
  {
    id: 'certificado-defuncion',
    categoria: 'defuncion',
    titulo: 'Certificado Médico y Registro Civil de Defunción por Desastre',
    entidad: 'Medicina Legal / IPS / Notarías / Registraduría Nacional',
    resumen: 'Procedimiento prioritario para la certificación médica gratuita de fallecimiento y la expedición del Registro Civil de Defunción sin costos notariales en zonas de calamidad pública declarada.',
    esGratuito: true,
    dondeAcudir: 'Instituto Nacional de Medicina Legal, Hospitales/IPS del municipio, o Notarías y Registradurías locales.',
    requisitos: [
      'Documento de identidad de la persona fallecida (o datos biográficos si no se tiene el plástico físico).',
      'Cédula de ciudadanía de quien realiza la declaración o familiar en primer grado de consanguinidad.',
      'Certificado Médico de Defunción (Formato RUAF-ND expedido por médico tratante o Medicina Legal).',
    ],
    pasos: [
      'Paso 1 (Médico): Si el deceso ocurrió en centro de salud o fue recuperado por organismos de rescate, el médico forense o de urgencias expedirá el Certificado Médico de Defunción (RUAF-ND) sin costo.',
      'Paso 2 (Identificación): En caso de cuerpos no identificados, Medicina Legal realizará cotejo dactilar o genético de urgencia.',
      'Paso 3 (Registro Civil): Presenta el certificado médico en cualquier Notaría del municipio o sede de la Registraduría Nacional para la inscripción del Registro Civil de Defunción.',
      'Paso 4 (Exención de Pago): Al existir declaratoria de calamidad o emergencia, la expedición de las primeras copias del Registro Civil es exenta de derechos notariales.',
    ],
    enlacesOficiales: [
      { texto: 'Medicina Legal — Atención a Familiares y Desaparecidos', url: 'https://www.medicinalegal.gov.co/' },
      { texto: 'Registraduría Nacional — Trámites de Registro Civil', url: 'https://www.registraduria.gov.co/' },
    ],
    alertaSeguridad: 'Los certificados de defunción y registros civiles ante la Registraduría son gratuitos. No pague a intermediarios para acelerar traslados.',
    marcoLegal: 'Decreto 1260 de 1970 y Circulares Conjuntas de Emergencia MinSalud/Registraduría.',
  },
  {
    id: 'ruv-victimas',
    categoria: 'victimas',
    titulo: 'Declaración y Registro Único de Víctimas (RUV)',
    entidad: 'Unidad para las Víctimas / Personería / Defensoría del Pueblo',
    resumen: 'Ruta de atención institucional para personas afectadas por eventos relacionados con el conflicto armado o calamidades humanitarias conexas para acceder a medidas de asistencia inmediata y reparación.',
    esGratuito: true,
    dondeAcudir: 'Personería Municipal, Defensoría del Pueblo, Procuraduría General o Centros Regionales de Atención a Víctimas (CRAV).',
    requisitos: [
      'Cédula de ciudadanía o documento de identidad del declarante y relación del grupo familiar afectado.',
      'Relato claro y detallado de los hechos (fecha, lugar, circunstancias del hecho victimizante).',
    ],
    pasos: [
      'Acércate a la Personería Municipal o Defensoría del Pueblo más cercana.',
      'Rinde la declaración formal ante el personero o defensor público mediante el Formulario Único de Declaración (FUD).',
      'La entidad remitirá la declaración a la Unidad para las Víctimas para su respectiva valoración técnica.',
      'Recibe el número de radicado para consultar el estado de inclusión en el RUV y solicitar Ayuda Humanitaria Inmediata (AHI).',
    ],
    enlacesOficiales: [
      { texto: 'Unidad para las Víctimas — Portal de Servicios', url: 'https://www.unidadvictimas.gov.co/' },
      { texto: 'Defensoría del Pueblo — Canales de Atención', url: 'https://www.defensoria.gov.co/' },
    ],
    alertaSeguridad: 'La declaración es gratuita e individual. Desconfíe de asociaciones fraudulentas que cobran porcentajes sobre indemnizaciones futuras.',
    marcoLegal: 'Ley 1448 de 2011 y Decretos Reglamentarios.',
  },
  {
    id: 'subsidio-arriendo-temporal',
    categoria: 'subsidios',
    titulo: 'Subsidio de Arrendamiento Temporal y Asistencia Habitacional',
    entidad: 'Alcaldías Municipales / Secretaría de Vivienda / UNGRD',
    resumen: 'Apoyo económico transitorio mensual otorgado a familias que perdieron su vivienda o cuyo predio fue evacuado preventivamente por riesgo inminente de colapso.',
    esGratuito: true,
    dondeAcudir: 'Secretaría de Gobierno o Planeación de la Alcaldía Municipal de tu localidad.',
    requisitos: [
      'Estar censado e incluido en la base de datos oficial del RUD municipal.',
      'Concepto técnico de habitabilidad / acta de evacuación expedida por el Cuerpo Oficial de Bomberos, Defensa Civil o ingenieros del CMGRD.',
      'Certificado de que la vivienda no es habitable o se encuentra en zona de amenaza alta no mitigable.',
      'Contrato o carta de intención de arrendamiento del nuevo inmueble temporal.',
    ],
    pasos: [
      'Verifica que tu vivienda cuente con el acta de visita técnica con dictamen de evacuación (bandera roja/naranja).',
      'Radica en la Alcaldía la solicitud de Subsidio de Arriendo Temporal anexando copia de tu cédula y el soporte del RUD.',
      'Una vez aprobado el subsidio por el comité municipal, suscribe el acta de compromiso de arrendamiento.',
      'El desembolso se realiza periódicamente (mensual) según la reglamentación y recursos del Fondo Municipal/Nacional de Gestión del Riesgo.',
    ],
    enlacesOficiales: [
      { texto: 'Guía UNGRD de Subsidios de Arrendamiento', url: 'http://portal.gestiondelriesgo.gov.co/' },
    ],
    alertaSeguridad: 'El subsidio se entrega directamente al beneficiario o al arrendador formalmente registrado. No requiere pagos previos.',
    marcoLegal: 'Resoluciones de Asistencia Humanitaria de Emergencia UNGRD.',
  },
  {
    id: 'formatos-declaraciones',
    categoria: 'formatos',
    titulo: 'Formatos Oficiales y Declaraciones Juramentadas de Emergencia',
    entidad: 'Dirección Nacional de Gestión del Riesgo / Notarías',
    resumen: 'Plantillas y modelos guía para trámites de declaración de pérdida de documentos, poderes para representación familiar y solicitudes de peritaje estructural.',
    esGratuito: true,
    dondeAcudir: 'Descarga en línea o solicita asesoría gratuita en los consultorios jurídicos y personerías.',
    requisitos: [
      'Datos del solicitante (Nombres, Cédula, Teléfono, Correo).',
      'Identificación del predio o situación fáctica objeto de la declaración.',
    ],
    pasos: [
      'Selecciona el formato correspondiente a tu necesidad (Declaración de Pérdida de Documentos, Autorización de Reclamación de Ayudas, Solicitud de Inspección Técnica).',
      'Diligencia los campos en letra legible y sin tachones.',
      'Preséntalo ante la autoridad municipal o entidad correspondiente con tu documento de identidad.',
    ],
    enlacesOficiales: [
      { texto: 'Formato Guía: Declaración Juramentada por Pérdida de Enseres (UNGRD)', url: 'http://portal.gestiondelriesgo.gov.co/' },
      { texto: 'Registraduría: Reporte en línea de Cédula Extraviada', url: 'https://www.registraduria.gov.co/' },
    ],
    alertaSeguridad: 'Los modelos aquí compartidos son de libre uso. Ninguna entidad puede exigir formatos con sellos comerciales privados.',
    marcoLegal: 'Código de Procedimiento Administrativo y de lo Contencioso Administrativo (CPACA).',
  },
];

export default function RecursosTramitesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todas');

  const filteredTramites = useMemo(() => {
    return TRAMITES.filter((item) => {
      if (activeCategory !== 'todas' && item.categoria !== activeCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.titulo.toLowerCase().includes(q);
        const matchEntidad = item.entidad.toLowerCase().includes(q);
        const matchResumen = item.resumen.toLowerCase().includes(q);
        const matchReq = item.requisitos.some((r) => r.toLowerCase().includes(q));
        const matchPasos = item.pasos.some((p) => p.toLowerCase().includes(q));
        if (!matchTitle && !matchEntidad && !matchResumen && !matchReq && !matchPasos) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      {/* Hero Header */}
      <div className="border-b border-outline-variant pb-6 mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-bold uppercase mb-2">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            Guías Cívicas y Trámites de Emergencia
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background flex items-center gap-2 font-black">
            Recursos, Documentos y Trámites en Alcaldía
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
            Directorio público y gratuito para orientar a personas afectadas por desastres naturales en Colombia. Conoce cómo realizar el censo de damnificados, certificar defunciones, declarar ante la Unidad de Víctimas y tramitar subsidios sin intermediarios.
          </p>
        </div>
      </div>

      {/* Alerta Anti-Fraude */}
      <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-4 mb-stack-lg flex items-start gap-3 shadow-sm text-xs text-amber-950">
        <span className="material-symbols-outlined text-amber-700 text-2xl shrink-0 mt-0.5">verified_user</span>
        <div>
          <h2 className="font-bold text-sm text-amber-950 mb-0.5 flex items-center gap-1.5">
            <span>Todos los trámites ante el Estado en emergencias son 100% GRATUITOS</span>
          </h2>
          <p className="text-amber-900 leading-relaxed">
            Ninguna persona, líder comunitario ni funcionario puede cobrar dinero por inscribirte en el Registro Único de Damnificados (RUD), expedir actas de evacuación o tramitar certificados de defunción. Denuncia cobros indebidos de inmediato en la Personería Municipal o al 123.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'todas', label: 'Todos los Trámites', icon: 'grid_view' },
          { id: 'rud', label: 'Censo Damnificados (RUD)', icon: 'how_to_reg' },
          { id: 'defuncion', label: 'Defunción y Registro Civil', icon: 'article' },
          { id: 'victimas', label: 'Unidad de Víctimas (RUV)', icon: 'policy' },
          { id: 'subsidios', label: 'Subsidio de Arriendo', icon: 'home_work' },
          { id: 'formatos', label: 'Formatos y Circulares', icon: 'download' },
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

      {/* Search Bar */}
      <div className="mb-stack-lg bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:border-secondary outline-none"
            placeholder="Buscar por palabra clave: defunción, arriendo, RUD, cédula perdida, medicina legal, albergue..."
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

        <span className="text-xs text-on-surface-variant font-medium shrink-0 hidden sm:inline-block">
          Mostrando <strong>{filteredTramites.length}</strong> de <strong>{TRAMITES.length}</strong> guías
        </span>
      </div>

      {/* Tramites Listing */}
      {filteredTramites.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">find_in_page</span>
          <h3 className="font-bold text-base text-on-surface">No se encontraron guías para la búsqueda actual</h3>
          <p className="text-xs mt-1 max-w-md mx-auto">
            Prueba buscando con otros términos o selecciona otra categoría en el menú superior.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTramites.map((tramite) => (
            <article
              key={tramite.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm border-t-4 border-t-secondary transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                    {tramite.entidad}
                  </span>
                  {tramite.esGratuito ? (
                    <span className="bg-green-100 text-green-900 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                      Trámite Gratuito
                    </span>
                  ) : null}
                </div>
                {tramite.marcoLegal ? (
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    Base Legal: {tramite.marcoLegal}
                  </span>
                ) : null}
              </div>

              <h2 className="font-headline-md text-lg md:text-xl font-bold text-on-surface mb-2">
                {tramite.titulo}
              </h2>

              <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-5 leading-relaxed">
                {tramite.resumen}
              </p>

              {/* Dónde acudir */}
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant mb-5 flex items-start gap-2.5 text-xs">
                <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">location_on</span>
                <div>
                  <strong className="text-on-surface">¿Dónde acudir?</strong>
                  <p className="text-on-surface-variant mt-0.5">{tramite.dondeAcudir}</p>
                </div>
              </div>

              {/* Requisitos y Pasos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                {/* Requisitos */}
                <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                  <h4 className="font-label-md text-xs font-bold text-on-surface uppercase mb-3 flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                    <span>Documentos y Requisitos</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {tramite.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pasos */}
                <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                  <h4 className="font-label-md text-xs font-bold text-on-surface uppercase mb-3 flex items-center gap-1.5 text-secondary">
                    <span className="material-symbols-outlined text-sm">route</span>
                    <span>Ruta Paso a Paso</span>
                  </h4>
                  <ol className="space-y-2.5 text-xs text-on-surface-variant">
                    {tramite.pasos.map((paso, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{paso}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Alerta de Seguridad del trámite */}
              {tramite.alertaSeguridad ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-950 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-700 text-sm shrink-0">gavel</span>
                  <span><strong>Advertencia Cívica:</strong> {tramite.alertaSeguridad}</span>
                </div>
              ) : null}

              {/* Enlaces Oficiales */}
              {tramite.enlacesOficiales && tramite.enlacesOficiales.length > 0 ? (
                <div className="pt-3 border-t border-outline-variant flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-on-surface-variant font-bold mr-1">Canales Oficiales:</span>
                  {tramite.enlacesOficiales.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-surface-container text-on-surface font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors inline-flex items-center gap-1 border border-outline-variant"
                    >
                      <span>{link.texto}</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {/* Footer Support Banner */}
      <div className="mt-stack-xl bg-surface-container-high p-6 rounded-2xl border border-outline-variant text-center space-y-2">
        <h3 className="font-headline-md text-base font-bold text-on-surface">
          ¿Representas a una Alcaldía o entidad de socorro?
        </h3>
        <p className="font-body-md text-xs text-on-surface-variant max-w-xl mx-auto">
          Ayúdanos a mantener las guías de trámites y los puntos de censo actualizados. Contáctanos o postúlate como moderador para certificar información local.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/admin/registro"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors shadow-sm"
          >
            Postularse como Moderador
          </Link>
          <Link
            href="/iniciativas"
            className="px-4 py-2 bg-surface border border-outline text-on-surface text-xs font-bold uppercase rounded-lg hover:bg-surface-container transition-colors"
          >
            Ver Directorio de Iniciativas
          </Link>
        </div>
      </div>
    </div>
  );
}
