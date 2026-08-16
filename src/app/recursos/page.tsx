'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  generateDerechoPeticionText,
  generateDerechoPeticionDocx,
  downloadBlob,
  getDestinatariosEntidades,
} from '../../lib/docx-generator';
import { TurnstileModal } from '../../components/ui/TurnstileModal';

interface TramiteRecurso {
  id: string;
  categoria: 'rud' | 'defuncion' | 'victimas' | 'subsidios' | 'formatos' | 'derecho_peticion';
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

const DEPARTAMENTOS_COLOMBIA = [
  'Valle del Cauca',
  'Cauca',
  'Nariño',
  'Antioquia',
  'Cundinamarca',
  'Bogotá D.C.',
  'Huila',
  'Tolima',
  'Santander',
  'Norte de Santander',
  'Chocó',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cesar',
  'Córdoba',
  'Guaviare',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Sucre',
  'Vaupés',
  'Vichada',
  'Amazonas',
  'Arauca',
  'Guainía',
];

const TRAMITES: TramiteRecurso[] = [
  {
    id: 'derecho-peticion-oficial',
    categoria: 'derecho_peticion',
    titulo: 'Derecho de Petición ante Emergencias y Desastres Naturales',
    entidad: 'Gobernaciones / Alcaldías Municipales / UNGRD / Personerías',
    resumen: 'Herramienta constitucional para exigir a las autoridades la inclusión en el censo RUD, entrega oportuna de víveres, subsidios de arriendo temporal o informes sobre obras de mitigación del riesgo.',
    esGratuito: true,
    dondeAcudir: 'Ventanilla Única o correo electrónico institucional de la Alcaldía, Gobernación, UNGRD o Personería Municipal.',
    requisitos: [
      'Documento de identidad del peticionario (Cédula de Ciudadanía, Tarjeta de Identidad, PPT o Cédula de Extranjería).',
      'Relato cronológico y conciso de los hechos ocurridos con ocasión del desastre natural o la emergencia.',
      'Petición respetuosa y concreta indicando el auxilio o información requerida.',
      'Dirección física o correo electrónico donde autoriza recibir la respuesta oficial.',
    ],
    pasos: [
      'Paso 1: Completa el Generador Asistido de esta plataforma con tus datos, hechos y peticiones.',
      'Paso 2: Si requieres acompañamiento jurídico, marca la opción de asistencia para que un abogado voluntario revise tu caso.',
      'Paso 3: Descarga el archivo editable en formato Word (.docx) o copia el texto formal generado.',
      'Paso 4: Radica el documento de manera presencial en la ventanilla única o remítelo al correo de radicación oficial de la entidad.',
      'Paso 5: La entidad tiene 15 días hábiles de regla general (o 10 días para solicitar copias de documentos) para responderte de fondo.',
    ],
    enlacesOficiales: [
      { texto: 'Plantilla Modelo Institucional (.docx)', url: '/modelo-de-peticion.docx' },
      { texto: 'Ley 1755 de 2015 — Estatuto del Derecho de Petición', url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334' },
    ],
    alertaSeguridad: 'Presentar un derecho de petición es un derecho fundamental 100% gratuito. No requiere apoderado ni sellos pagos de tramitadores.',
    marcoLegal: 'Artículo 23 de la Constitución Política de Colombia, Ley 1755 de 2015 y Sentencia T-491 de 2013.',
  },
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

  // Estado del Generador de Derecho de Petición
  const [showGenerator, setShowGenerator] = useState(false);
  const [nombreCiudadano, setNombreCiudadano] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [cedulaCiudadano, setCedulaCiudadano] = useState('');
  const [departamento, setDepartamento] = useState('Valle del Cauca');
  const [municipio, setMunicipio] = useState('');
  const [direccionFisica, setDireccionFisica] = useState('');
  const [emailContacto, setEmailContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [asunto, setAsunto] = useState('Inclusión en Registro Único de Damnificados (RUD) y Entrega de Ayuda Humanitaria de Emergencia');
  const [hechos, setHechos] = useState('');
  const [peticiones, setPeticiones] = useState('');
  const [anexos, setAnexos] = useState('');
  const [necesitaAbogado, setNecesitaAbogado] = useState(false);
  const [aceptaConsentimiento, setAceptaConsentimiento] = useState(false);
  const [aceptaDescargo, setAceptaDescargo] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  // Estados de proceso de generación y envío
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [submittingLegal, setSubmittingLegal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ id: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const previewData = useMemo(() => {
    return {
      nombreCiudadano: nombreCiudadano || '________________________',
      tipoDocumento,
      cedulaCiudadano: cedulaCiudadano || '______________',
      departamento: departamento || 'Valle del Cauca',
      municipio: municipio || 'Municipio',
      direccionFisica: direccionFisica || null,
      emailContacto: emailContacto || 'correo@ejemplo.com',
      telefonoContacto: telefonoContacto || '3000000000',
      asunto: asunto || 'Petición respetuosa ante emergencia',
      hechos: hechos || '1. Enunciar de manera cronológica los hechos ocurridos con ocasión de la emergencia.',
      peticiones: peticiones || '1. Solicito de manera respetuosa la atención prioritaria de mi situación humanitaria.',
      anexos: anexos || null,
    };
  }, [
    nombreCiudadano,
    tipoDocumento,
    cedulaCiudadano,
    departamento,
    municipio,
    direccionFisica,
    emailContacto,
    telefonoContacto,
    asunto,
    hechos,
    peticiones,
    anexos,
  ]);

  const generatedText = useMemo(() => {
    return generateDerechoPeticionText(previewData);
  }, [previewData]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      setErrorMsg('No se pudo copiar el texto automáticamente. Puedes seleccionarlo manualmente.');
    }
  };

  const handleDownloadDocx = async () => {
    if (!nombreCiudadano.trim() || !cedulaCiudadano.trim() || !municipio.trim()) {
      setErrorMsg('Por favor completa tu Nombre, Cédula y Municipio antes de descargar.');
      return;
    }
    if (!aceptaConsentimiento || !aceptaDescargo) {
      setErrorMsg('Debes aceptar el consentimiento de datos y el descargo de responsabilidad.');
      return;
    }

    setErrorMsg(null);
    setDownloadingDocx(true);

    try {
      const blob = await generateDerechoPeticionDocx({
        nombreCiudadano,
        tipoDocumento,
        cedulaCiudadano,
        departamento,
        municipio,
        direccionFisica,
        emailContacto: emailContacto || 'No especificado',
        telefonoContacto: telefonoContacto || 'No especificado',
        asunto,
        hechos: hechos || 'Enunciar cronológicamente los hechos.',
        peticiones: peticiones || 'Peticiones respetuosas.',
        anexos,
      });

      const filename = `Derecho_Peticion_${municipio.replace(/\s+/g, '_')}_${cedulaCiudadano.replace(/\s+/g, '_')}.docx`;
      downloadBlob(blob, filename);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al generar el archivo .docx.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleSubmitLegalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombreCiudadano.trim() || !cedulaCiudadano.trim() || !municipio.trim() || !emailContacto.trim() || !telefonoContacto.trim() || !asunto.trim() || !hechos.trim() || !peticiones.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios del derecho de petición.');
      return;
    }

    if (!aceptaConsentimiento || !aceptaDescargo) {
      setErrorMsg('Debes marcar las casillas de consentimiento y descargo de responsabilidad.');
      return;
    }

    setShowCaptchaModal(true);
  };

  const handleVerifiedSubmitLegal = async (token: string) => {
    setSubmittingLegal(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/recursos/asistencia-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCiudadano,
          tipoDocumento,
          cedulaCiudadano,
          emailContacto,
          telefonoContacto,
          departamento,
          municipio,
          direccionFisica: direccionFisica || null,
          asunto,
          hechos,
          peticiones,
          anexos: anexos || null,
          aceptaConsentimiento: true,
          captchaToken: token,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || 'Error al registrar la solicitud de asistencia.');
      }

      setSubmitSuccess({ id: json.data.id });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar la solicitud.');
      throw err;
    } finally {
      setSubmittingLegal(false);
    }
  };

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
            <span className="material-symbols-outlined text-sm">gavel</span>
            Herramientas Cívicas y Trámites de Emergencia
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background flex items-center gap-2 font-black">
            Recursos, Derechos de Petición y Guías en Alcaldía
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-3xl leading-relaxed">
            Directorio público y gratuito para orientar a personas afectadas por desastres naturales en Colombia. Genera tu <strong>Derecho de Petición oficial en Word (.docx)</strong>, solicita asistencia de abogados voluntarios o consulta cómo inscribirte en el RUD y tramitar subsidios.
          </p>
        </div>

        <button
          onClick={() => {
            setShowGenerator(true);
            const el = document.getElementById('generador-derecho-peticion');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-5 py-3 bg-secondary text-on-secondary font-bold text-xs uppercase rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">edit_document</span>
          <span>Crear Derecho de Petición</span>
        </button>
      </div>

      {/* Alerta Anti-Fraude */}
      <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-4 mb-stack-lg flex items-start gap-3 shadow-sm text-xs text-amber-950">
        <span className="material-symbols-outlined text-amber-700 text-2xl shrink-0 mt-0.5">verified_user</span>
        <div>
          <h2 className="font-bold text-sm text-amber-950 mb-0.5 flex items-center gap-1.5">
            <span>Todos los trámites ante el Estado en emergencias son 100% GRATUITOS</span>
          </h2>
          <p className="text-amber-900 leading-relaxed">
            Ningún funcionario, líder comunal ni particular puede cobrarte por incluirte en el <strong>Censo RUD</strong>, expedir registros de defunción o tramitar subsidios de arriendo. Si te exigen dinero, denuncia de inmediato ante la <strong>Personería Municipal</strong> o la <strong>Fiscalía General de la Nación</strong>.
          </p>
        </div>
      </div>

      {/* SECCIÓN DESTACADA: GENERADOR ASISTIDO DE DERECHO DE PETICIÓN */}
      <div id="generador-derecho-peticion" className="mb-stack-xl bg-surface-container-lowest border-2 border-secondary/40 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-secondary-container/40 text-secondary rounded-xl">
              <span className="material-symbols-outlined text-3xl">balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-lg md:text-xl font-bold text-on-surface">
                  Generador Asistido de Derecho de Petición ante Emergencias
                </h2>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Plantilla Oficial .docx
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Genera tu documento formal dirigido a la <strong>Gobernación, Alcaldía Municipal y UNGRD</strong> con fundamentos de la Ley 1755 de 2015 y jurisprudencia constitucional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/modelo-de-peticion.docx"
              download="modelo-de-peticion-oficial.docx"
              className="px-3.5 py-2 bg-surface border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center gap-1.5"
              title="Descargar plantilla en blanco original"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Plantilla en Blanco (.docx)</span>
            </a>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="px-4 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">{showGenerator ? 'expand_less' : 'edit'}</span>
              <span>{showGenerator ? 'Ocultar Formulario' : 'Diligenciar en Línea'}</span>
            </button>
          </div>
        </div>

        {/* Formulario Expandible */}
        {showGenerator ? (
          <div className="animate-in fade-in duration-300">
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-300 p-6 rounded-xl text-center space-y-3">
                <span className="material-symbols-outlined text-green-600 text-5xl">task_alt</span>
                <h3 className="font-headline-md text-lg font-bold text-green-950">
                  ¡Solicitud de Asistencia Legal Registrada con Éxito!
                </h3>
                <p className="font-body-md text-xs text-green-900 max-w-xl mx-auto">
                  Hemos enviado tus datos y hechos al equipo de moderación y red de abogados voluntarios. Un profesional jurídico revisará tu caso y te contactará vía WhatsApp o correo electrónico para asesorarte.
                </p>
                <div className="p-3 bg-white border border-green-200 rounded-lg max-w-md mx-auto text-xs text-green-950 font-mono">
                  Radicado de Solicitud: <strong>{submitSuccess.id}</strong>
                </div>
                <div className="pt-3 flex justify-center gap-3">
                  <button
                    onClick={handleDownloadDocx}
                    className="px-5 py-2.5 bg-secondary text-on-secondary text-xs font-bold uppercase rounded-lg hover:bg-secondary-container shadow-sm inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Descargar Copia en Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitSuccess(null);
                      setNecesitaAbogado(false);
                    }}
                    className="px-4 py-2.5 bg-surface border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant"
                  >
                    Generar Otra Petición
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={necesitaAbogado ? handleSubmitLegalRequest : (e) => { e.preventDefault(); handleDownloadDocx(); }} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-lg text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Datos del Ciudadano */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-4">
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>1. Información del Peticionario / Ciudadano</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-nombre">
                        Nombre Completo <span className="text-error">*</span>
                      </label>
                      <input
                        id="pet-nombre"
                        value={nombreCiudadano}
                        onChange={(e) => setNombreCiudadano(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="Ej. María Clemencia Rodríguez Pérez"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-tipodoc">
                        Tipo de Documento
                      </label>
                      <select
                        id="pet-tipodoc"
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="TI">Tarjeta de Identidad (TI)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PTP">Permiso por Protección Temporal (PPT)</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-cedula">
                        Número de Documento <span className="text-error">*</span>
                      </label>
                      <input
                        id="pet-cedula"
                        value={cedulaCiudadano}
                        onChange={(e) => setCedulaCiudadano(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="Ej. 1144123456"
                        required
                      />
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-depto">
                        Departamento <span className="text-error">*</span>
                      </label>
                      <select
                        id="pet-depto"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        required
                      >
                        {DEPARTAMENTOS_COLOMBIA.map((dep) => (
                          <option key={dep} value={dep}>{dep}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-municipio">
                        Municipio / Ciudad <span className="text-error">*</span>
                      </label>
                      <input
                        id="pet-municipio"
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="Ej. Cali, Jamundí, Popayán, Pasto, etc."
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-tel">
                        Teléfono / WhatsApp de Contacto <span className="text-error">*</span>
                      </label>
                      <input
                        id="pet-tel"
                        type="tel"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="Ej. 3151234567"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-email">
                        Correo Electrónico para Notificaciones <span className="text-error">*</span>
                      </label>
                      <input
                        id="pet-email"
                        type="email"
                        value={emailContacto}
                        onChange={(e) => setEmailContacto(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="ejemplo@correo.com"
                        required
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-dir">
                        Dirección Física de Notificación (Opcional)
                      </label>
                      <input
                        id="pet-dir"
                        value={direccionFisica}
                        onChange={(e) => setDireccionFisica(e.target.value)}
                        className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                        placeholder="Ej. Barrio El Prado, Calle 5 # 12-34 / Albergue Central"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Destinatarios calculados automáticamente */}
                <div className="p-3 bg-secondary-container/20 rounded-xl border border-secondary/30 text-xs">
                  <span className="font-bold text-secondary flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    <span>Destinatarios Institucionales Asignados Automáticamente:</span>
                  </span>
                  <ul className="list-disc list-inside text-on-surface space-y-0.5 ml-1">
                    {getDestinatariosEntidades(departamento, municipio || '[Municipio]').map((ent, idx) => (
                      <li key={idx} className="font-semibold">{ent}</li>
                    ))}
                  </ul>
                </div>

                {/* 3. Contenido de la Petición */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-4">
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>2. Asunto, Hechos y Peticiones</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-asunto">
                      Asunto de la Petición <span className="text-error">*</span>
                    </label>
                    <input
                      id="pet-asunto"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                      placeholder="Ej. Solicitud de Inclusión en RUD y Asistencia Humanitaria de Emergencia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-hechos">
                      Hechos (Describe de forma cronológica lo ocurrido durante la emergencia) <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="pet-hechos"
                      rows={5}
                      value={hechos}
                      onChange={(e) => setHechos(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-surface p-3 text-xs font-body-md focus:border-secondary outline-none"
                      placeholder="1. El día [fecha], mi vivienda ubicada en [dirección/vereda] resultó afectada por [inundación/derrumbe/sismo]...&#10;2. A la fecha no he sido censado en el RUD municipal ni he recibido kit alimentario...&#10;3. Mi núcleo familiar está integrado por [número] personas, incluyendo [menores de edad/adultos mayores]..."
                      required
                      minLength={15}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-peticiones">
                      Peticiones Concretas (Qué solicitas específicamente a la entidad) <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="pet-peticiones"
                      rows={4}
                      value={peticiones}
                      onChange={(e) => setPeticiones(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-surface p-3 text-xs font-body-md focus:border-secondary outline-none"
                      placeholder="PRIMERO: Se realice la visita técnica e inclusión prioritaria de mi grupo familiar en el Registro Único de Damnificados (RUD).&#10;SEGUNDO: Se haga entrega inmediata del subsidio de arriendo temporal o albergue digno.&#10;TERCERO: Se informe por escrito el cronograma de ayudas asignadas a mi sector."
                      required
                      minLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="pet-anexos">
                      Anexos Documentales (Opcional)
                    </label>
                    <input
                      id="pet-anexos"
                      value={anexos}
                      onChange={(e) => setAnexos(e.target.value)}
                      className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-xs focus:border-secondary outline-none"
                      placeholder="Ej. Fotocopia de cédula de ciudadanía, fotografías de los daños en la vivienda, constancia de evacuación de bomberos."
                    />
                  </div>
                </div>

                {/* 4. Solicitud de Asistencia Legal de Abogado Voluntario */}
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="necesita-abogado-check"
                      checked={necesitaAbogado}
                      onChange={(e) => setNecesitaAbogado(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-amber-400 text-amber-700 focus:ring-amber-600 cursor-pointer"
                    />
                    <label htmlFor="necesita-abogado-check" className="cursor-pointer">
                      <span className="font-bold text-amber-950 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">support_agent</span>
                        ¿Necesitas asistencia de un abogado voluntario / asesoría jurídica gratuita?
                      </span>
                      <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                        Si tienes dudas sobre cómo radicar, necesitas revisión legal de los hechos o estás en situación de vulnerabilidad extrema, marca esta opción para que tu solicitud llegue a la bandeja de supervisores y sea articulada con nuestra red de abogados solidarios.
                      </p>
                    </label>
                  </div>
                </div>

                {/* 5. Consentimiento y Descargo de Responsabilidad (OBLIGATORIOS) */}
                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl space-y-3">
                  <h4 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider text-secondary">
                    3. Consentimiento Informado y Descargo Legal Obligatorio
                  </h4>

                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="consentimiento-check"
                      checked={aceptaConsentimiento}
                      onChange={(e) => setAceptaConsentimiento(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-outline text-secondary focus:ring-secondary cursor-pointer"
                      required
                    />
                    <label htmlFor="consentimiento-check" className="text-[11px] text-on-surface cursor-pointer leading-tight">
                      <strong>Consentimiento de Tratamiento de Datos (Ley 1581 de 2012):</strong> Autorizo el tratamiento de mis datos personales únicamente para la estructuración de este derecho de petición y, en caso de solicitarlo, para el contacto con abogados voluntarios.
                    </label>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="descargo-check"
                      checked={aceptaDescargo}
                      onChange={(e) => setAceptaDescargo(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-outline text-secondary focus:ring-secondary cursor-pointer"
                      required
                    />
                    <label htmlFor="descargo-check" className="text-[11px] text-on-surface cursor-pointer leading-tight">
                      <strong>Descargo de Responsabilidad Cívica:</strong> Entiendo que ActuemosYaColombia es una herramienta ciudadana de facilitación y código abierto. La presente plantilla no constituye por sí sola un contrato de representación judicial formal con la plataforma.
                    </label>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2.5 bg-surface border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">{showPreview ? 'visibility_off' : 'visibility'}</span>
                    <span>{showPreview ? 'Ocultar Previsualización' : 'Ver Previsualización'}</span>
                  </button>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-4 py-2.5 bg-surface border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      <span>{copiedText ? '¡Copiado al Portapapeles!' : 'Copiar Texto Completo'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={downloadingDocx || !aceptaConsentimiento || !aceptaDescargo}
                      onClick={handleDownloadDocx}
                      className="px-5 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>{downloadingDocx ? 'Generando .docx...' : 'Descargar en Word (.docx)'}</span>
                    </button>

                    {necesitaAbogado && (
                      <button
                        type="submit"
                        disabled={submittingLegal || !aceptaConsentimiento || !aceptaDescargo}
                        className="px-6 py-2.5 bg-secondary text-on-secondary text-xs font-bold uppercase rounded-lg hover:bg-secondary-container transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                        <span>{submittingLegal ? 'Enviando...' : 'Solicitar Asistencia a Abogados'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Just-in-Time Security Verification Modal */}
                <TurnstileModal
                  isOpen={showCaptchaModal}
                  onClose={() => setShowCaptchaModal(false)}
                  onVerified={handleVerifiedSubmitLegal}
                  action="asistencia_legal"
                  title="Verificación de Asistencia Legal"
                  description="Verificamos tu solicitud de soporte legal para canalizarla de forma segura hacia la red de abogados voluntarios."
                />

                {/* Caja de Previsualización en Vivo */}
                {showPreview && (
                  <div className="mt-4 p-6 bg-white border border-outline-variant rounded-xl shadow-inner font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {generatedText}
                  </div>
                )}
              </form>
            )}
          </div>
        ) : null}
      </div>

      {/* Categorías y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-md">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'todas', label: 'Todos los Trámites' },
            { id: 'derecho_peticion', label: 'Derecho de Petición' },
            { id: 'rud', label: 'Censo RUD' },
            { id: 'subsidios', label: 'Subsidios de Arriendo' },
            { id: 'victimas', label: 'Víctimas / AHI' },
            { id: 'defuncion', label: 'Defunción y Registro' },
            { id: 'formatos', label: 'Formatos Guía' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat.id
                  ? 'bg-secondary text-on-secondary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palabra clave (ej. arriendo, censo, defunción)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
            search
          </span>
        </div>
      </div>

      {/* Grid de Trámites */}
      {filteredTramites.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-2">find_in_page</span>
          <h3 className="font-headline-md text-base font-bold text-on-surface">No se encontraron trámites</h3>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Intenta con otro término de búsqueda o selecciona la categoría &ldquo;Todos los Trámites&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTramites.map((tramite) => (
            <article
              key={tramite.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-sm hover:border-secondary/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-outline-variant pb-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                      {tramite.categoria.toUpperCase()}
                    </span>
                    {tramite.esGratuito ? (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">money_off</span>
                        <span>Trámite 100% Gratuito</span>
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-headline-md text-lg md:text-xl font-bold text-on-surface">
                    {tramite.titulo}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-on-surface-variant block font-medium">Entidad Responsable:</span>
                  <span className="font-label-md text-xs font-bold text-secondary">{tramite.entidad}</span>
                </div>
              </div>

              <p className="font-body-md text-xs md:text-sm text-on-surface leading-relaxed mb-6">
                {tramite.resumen}
              </p>

              {/* Dónde Acudir */}
              <div className="mb-4 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface">
                <span className="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">location_on</span>
                <div>
                  <strong className="text-on-surface block font-bold mb-0.5">¿Dónde acudir o presentar la solicitud?</strong>
                  <span className="text-on-surface-variant leading-relaxed">{tramite.dondeAcudir}</span>
                </div>
              </div>

              {/* Grid Requisitos y Pasos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Requisitos */}
                <div className="bg-surface p-4 rounded-xl border border-outline-variant">
                  <h4 className="font-label-md text-xs font-bold text-on-surface uppercase mb-3 flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-sm">checklist</span>
                    <span>Requisitos y Documentos Necesarios</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {tramite.requisitos.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-600 text-sm shrink-0 mt-0.5">check_circle</span>
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
                  <span className="text-[11px] text-on-surface-variant font-bold mr-1">Canales Oficiales y Plantillas:</span>
                  {tramite.enlacesOficiales.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      download={link.url.endsWith('.docx') ? 'modelo-de-peticion.docx' : undefined}
                      className="px-3 py-1.5 bg-surface-container text-on-surface font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors inline-flex items-center gap-1 border border-outline-variant"
                    >
                      <span>{link.texto}</span>
                      <span className="material-symbols-outlined text-xs">
                        {link.url.endsWith('.docx') ? 'download' : 'open_in_new'}
                      </span>
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
          ¿Eres abogado o representas a un consultorio jurídico?
        </h3>
        <p className="font-body-md text-xs text-on-surface-variant max-w-xl mx-auto">
          Súmate al banco de voluntariado profesional para brindar asesoría jurídica solidaria a familias damnificadas en la radicación y seguimiento de derechos de petición.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/voluntarios"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase rounded-lg hover:bg-primary-container transition-colors shadow-sm"
          >
            Registrarme como Abogado Voluntario
          </Link>
          <Link
            href="/admin/registro"
            className="px-4 py-2 bg-surface border border-outline text-on-surface text-xs font-bold uppercase rounded-lg hover:bg-surface-container transition-colors"
          >
            Postularme como Moderador
          </Link>
        </div>
      </div>
    </div>
  );
}
