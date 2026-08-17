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
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface TramiteRecurso {
  id: string;
  categoria: 'rud' | 'defuncion' | 'victimas' | 'subsidios' | 'formatos' | 'derecho_peticion' | 'cancilleria';
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
    id: 'cancilleria-asistencia-consular',
    categoria: 'cancilleria',
    titulo: 'Asistencia Consular y Localización de Embajadas ante Desastres',
    entidad: 'Ministerio de Relaciones Exteriores (Cancillería) / Consulados y Embajadas',
    resumen: 'Canal oficial de auxilio y orientación inmediata para ciudadanos extranjeros, turistas o residentes afectados por emergencias en Colombia. Incluye enlace con misiones diplomáticas, reporte de extranjeros no localizados y apoyo para retorno asistido o repatriación sanitaria.',
    esGratuito: true,
    dondeAcudir: 'Centro Integral de Atención al Ciudadano (CIAC - Cancillería 24/7), correo contactenos@cancilleria.gov.co, o la sede de la Embajada/Consulado de tu país en Bogotá.',
    requisitos: [
      'Documento de identidad nacional, Pasaporte, Cédula de Extranjería o Permiso por Protección Temporal (PPT).',
      'Si perdiste tus documentos durante el desastre, suministra nombres completos, nacionalidad, fecha de nacimiento y datos de contacto de familiares en tu país.',
      'Ubicación exacta del albergue, hospital o zona de refugio en Colombia donde te encuentras.',
    ],
    pasos: [
      'Paso 1 (Emergencia 24/7): Comunícate con el CIAC de la Cancillería marcando al (+57) 601 382 6999 o línea gratuita 01 8000 938 000.',
      'Paso 2 (Reporte Consular): Envía tus datos al correo oficial de asistencia humanitaria consular indicando tu estado de salud y necesidades urgentes.',
      'Paso 3 (Contacto con Misión Diplomática): La Cancillería notificará formalmente a la Embajada de tu país en Colombia para coordinar emisión de salvoconductos o pasaportes de emergencia.',
      'Paso 4 (Apoyo Humanitario): Tu consulado y la UNGRD coordinarán alimentación, albergue y rutas de retorno seguro a tu país de origen.',
    ],
    enlacesOficiales: [
      { texto: 'Portal Oficial de la Cancillería de Colombia', url: 'https://www.cancilleria.gov.co/' },
      { texto: 'Directorio Oficial del Cuerpo Diplomático y Consular', url: 'https://www.cancilleria.gov.co/directorio-del-cuerpo-diplomatico-y-consular-acreditado-colombia' },
      { texto: 'Centro Integral de Atención al Ciudadano (CIAC)', url: 'https://www.cancilleria.gov.co/atencion-servicio-ciudadano' },
    ],
    alertaSeguridad: 'La asistencia y recepción de reportes de emergencia por la Cancillería de Colombia es 100% gratuita. Desconfíe de intermediarios o agencias no autorizadas que cobren por gestionar contactos consulares.',
    marcoLegal: 'Convención de Viena sobre Relaciones Consulares de 1963 y Decreto 869 de 2016.',
  },
  {
    id: 'migracion-salvoconductos-prorrogas',
    categoria: 'cancilleria',
    titulo: 'Salvoconductos de Emergencia (SC-2), Prórrogas y Reposición de Permisos (PPT)',
    entidad: 'Unidad Administrativa Especial Migración Colombia',
    resumen: 'Procedimiento prioritario para regularizar la estancia, solicitar prórroga de permanencia o tramitar el Salvoconducto SC-2 por fuerza mayor o desastre natural en caso de haber perdido pasaportes, cédulas de extranjería o vuelos de salida.',
    esGratuito: true,
    dondeAcudir: 'Centros Facilitadores de Servicios Migratorios de Migración Colombia en capitales departamentales o puestos de control migratorio habilitados en la emergencia.',
    requisitos: [
      'Documento de identidad o número de pasaporte / PPT con el que ingresaste al territorio colombiano.',
      'Constancia o certificación de damnificado emitida por la Alcaldía Municipal, UNGRD o Defensa Civil (Censo RUD o acta de evacuación).',
      'Denuncia por pérdida de documentos ante la Policía Nacional (se puede radicar en línea).',
    ],
    pasos: [
      'Paso 1: Presenta ante el Centro Facilitador de Migración Colombia el reporte de pérdida de documentos y el certificado de afectación por desastre.',
      'Paso 2: Solicita la expedición del Salvoconducto SC-2 por fuerza mayor o caso fortuito, el cual te otorga permanencia legal transitoria (hasta 30 días renovables).',
      'Paso 3: Si eres titular de Permiso por Protección Temporal (PPT), solicita el duplicado o certificación de estatus migratorio activo sin costo.',
      'Paso 4: Con el salvoconducto expedido, podrás realizar gestiones bancarias, traslados aéreos humanitarios y solicitar pasaporte de emergencia ante tu consulado.',
    ],
    enlacesOficiales: [
      { texto: 'Portal de Servicios de Migración Colombia', url: 'https://www.migracioncolombia.gov.co/' },
      { texto: 'Trámite de Salvoconductos y Permisos', url: 'https://www.migracioncolombia.gov.co/tramites-y-servicios' },
      { texto: 'Directorio de Centros Facilitadores Migratorios', url: 'https://www.migracioncolombia.gov.co/contacto' },
    ],
    alertaSeguridad: 'En situaciones de emergencia y desastres naturales, Migración Colombia otorga trato preferencial y humanitario para salvoconductos y trámites de salida sin sanción por vencimiento de estancia.',
    marcoLegal: 'Decreto 1067 de 2015, Resolución 3167 de 2019 de Migración Colombia.',
  },
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todas');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});


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

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleCaptchaSuccess = async (token: string) => {
    setSubmittingLegal(true);
    try {
      const response = await fetch('/api/recursos/asistencia-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCiudadano,
          tipoDocumento,
          cedulaCiudadano,
          departamento,
          municipio,
          direccionFisica: direccionFisica || undefined,
          emailContacto,
          telefonoContacto,
          asunto,
          hechos,
          peticiones,
          anexos: anexos || undefined,
          necesitaAbogado,
          aceptaConsentimiento,
          aceptaDescargo,
          turnstileToken: token,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error?.message || 'Error al enviar la solicitud de asistencia legal.');
      }

      setSubmitSuccess({ id: result.data.id });
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar la solicitud.');
    } finally {
      setSubmittingLegal(false);
    }
  };

  const filteredTramites = useMemo(() => {
    return TRAMITES.filter((t) => {
      const matchesCategory = activeCategory === 'todas' || t.categoria === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        t.titulo.toLowerCase().includes(q) ||
        t.entidad.toLowerCase().includes(q) ||
        t.resumen.toLowerCase().includes(q) ||
        t.requisitos.some((r) => r.toLowerCase().includes(q)) ||
        t.pasos.some((p) => p.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-4 md:py-stack-md">
      {/* Hero Header Condensado */}
      <div className="border-b border-outline-variant pb-4 md:pb-6 mb-4 md:mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase mb-1.5">
            <span className="material-symbols-outlined text-xs">gavel</span>
            <span>{t.recursos.tagHeader}</span>
          </div>
          <h1 className="font-headline-lg text-lg sm:text-xl md:text-2xl lg:text-3xl text-on-background flex items-center gap-2 font-black leading-tight">
            {t.recursos.titulo}
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-3xl leading-relaxed">
            {t.recursos.descripcion}
          </p>
        </div>

        <button
          onClick={() => {
            setShowGenerator(true);
            const el = document.getElementById('generador-derecho-peticion');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full md:w-auto px-4 py-2.5 bg-secondary text-on-secondary font-bold text-xs uppercase rounded-xl hover:bg-secondary-container transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">edit_document</span>
          <span>{t.recursos.botonCrearPeticion}</span>
        </button>
      </div>

      {/* Alerta Anti-Fraude Compacta */}
      <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-3 md:p-4 mb-4 md:mb-stack-lg flex items-start gap-2.5 shadow-xs text-xs text-amber-950">
        <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">verified_user</span>
        <div>
          <h2 className="font-bold text-xs sm:text-sm text-amber-950 mb-0.5">
            {t.recursos.alertaGratisTitulo}
          </h2>
          <p className="text-amber-900 text-[11px] sm:text-xs leading-relaxed">
            {t.recursos.alertaGratisDesc}
          </p>
        </div>
      </div>

      {/* SECCIÓN DESTACADA: GENERADOR ASISTIDO DE DERECHO DE PETICIÓN */}
      <div id="generador-derecho-peticion" className="mb-6 md:mb-stack-xl bg-surface-container-lowest border border-secondary/30 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant pb-4 mb-4 md:mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-secondary-container/40 text-secondary rounded-xl shrink-0">
              <span className="material-symbols-outlined text-2xl md:text-3xl">balance</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline-md text-base sm:text-lg md:text-xl font-bold text-on-surface">
                  {t.recursos.generadorTitulo}
                </h2>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {t.recursos.generadorTag}
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                {t.recursos.generadorDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/modelo-de-peticion.docx"
              download="modelo-de-peticion-oficial.docx"
              className="flex-1 sm:flex-none px-3 py-2 bg-surface border border-outline text-on-surface text-xs font-bold rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center justify-center gap-1.5 text-center"
              title="Descargar plantilla en blanco original"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{t.recursos.descargarPlantillaBlanco}</span>
            </a>
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className="flex-1 sm:flex-none px-3 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">{showGenerator ? 'expand_less' : 'edit_note'}</span>
              <span>{showGenerator ? t.recursos.ocultarFormulario : t.recursos.diligenciarEnLinea}</span>
            </button>
          </div>
        </div>

        {/* Formulario Desplegable del Generador */}
        {showGenerator ? (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center text-green-950 space-y-3">
                <span className="material-symbols-outlined text-green-600 text-4xl">task_alt</span>
                <h3 className="font-headline-md text-lg font-bold text-green-900">¡Solicitud de Asistencia Legal Radicada con Éxito!</h3>
                <p className="font-body-md text-xs text-green-800 max-w-xl mx-auto">
                  Tu derecho de petición y solicitud de apoyo han sido registrados con el radicado <strong>#{submitSuccess.id.substring(0, 8)}</strong>. Un abogado solidario voluntario revisará tu caso y se pondrá en contacto al correo o teléfono suministrado.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleDownloadDocx}
                    disabled={downloadingDocx}
                    className="px-4 py-2 bg-secondary text-on-secondary font-bold text-xs rounded-lg hover:bg-secondary-container transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>{downloadingDocx ? 'Generando...' : 'Descargar Archivo Word (.docx)'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSubmitSuccess(null);
                      setShowGenerator(false);
                    }}
                    className="px-4 py-2 bg-surface border border-outline text-xs font-bold rounded-lg hover:bg-surface-container transition-colors"
                  >
                    Cerrar Formulario
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitLegalRequest} className="space-y-4 md:space-y-6">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-lg text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-sm shrink-0">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Nombre Completo del Peticionario *</label>
                    <input
                      type="text"
                      required
                      value={nombreCiudadano}
                      onChange={(e) => setNombreCiudadano(e.target.value)}
                      placeholder="Ej. María Pérez Gómez"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Tipo de Documento *</label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                      <option value="PASAPORTE">Pasaporte Extranjero</option>
                      <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Número de Documento *</label>
                    <input
                      type="text"
                      required
                      value={cedulaCiudadano}
                      onChange={(e) => setCedulaCiudadano(e.target.value)}
                      placeholder="Ej. 1098765432"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Departamento *</label>
                    <select
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    >
                      {DEPARTAMENTOS_COLOMBIA.map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Municipio / Ciudad Afectada *</label>
                    <input
                      type="text"
                      required
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Ej. Dagua / Cali"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Dirección del Inmueble Afectado</label>
                    <input
                      type="text"
                      value={direccionFisica}
                      onChange={(e) => setDireccionFisica(e.target.value)}
                      placeholder="Ej. Vereda El Salado, Casa 12"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Correo Electrónico de Contacto *</label>
                    <input
                      type="email"
                      required
                      value={emailContacto}
                      onChange={(e) => setEmailContacto(e.target.value)}
                      placeholder="tu_correo@ejemplo.com"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Teléfono Móvil / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={telefonoContacto}
                      onChange={(e) => setTelefonoContacto(e.target.value)}
                      placeholder="Ej. 310 123 4567"
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Asunto de la Petición *</label>
                  <input
                    type="text"
                    required
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Relato Cronológico de los Hechos *</label>
                  <textarea
                    rows={4}
                    required
                    value={hechos}
                    onChange={(e) => setHechos(e.target.value)}
                    placeholder="1. El día [fecha], debido a las fuertes lluvias/deslizamiento, mi vivienda sufrió pérdida total...&#10;2. A la fecha no he sido censado en el RUD ni he recibido subsidio de arriendo temporal..."
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Peticiones Concretas y Respetuosas *</label>
                  <textarea
                    rows={3}
                    required
                    value={peticiones}
                    onChange={(e) => setPeticiones(e.target.value)}
                    placeholder="1. Solicito la inclusión inmediata de mi núcleo familiar en el Registro Único de Damnificados (RUD).&#10;2. Solicito la asignación y desembolso del subsidio de arrendamiento temporal..."
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant space-y-2 text-xs text-on-surface-variant">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={necesitaAbogado}
                      onChange={(e) => setNecesitaAbogado(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <span>
                      <strong className="text-on-surface">Solicitar acompañamiento de un Abogado Voluntario:</strong> Deseo que un profesional del derecho solidario revise mi caso y me oriente en la radicación.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaConsentimiento}
                      onChange={(e) => setAceptaConsentimiento(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <span>
                      Autorizo el tratamiento de mis datos personales para la gestión de este documento y contacto legal solidario (Ley 1581 de 2012).
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={aceptaDescargo}
                      onChange={(e) => setAceptaDescargo(e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <span>
                      Entiendo que esta es una herramienta cívica facilitadora y que la radicación formal ante las entidades del Estado es mi responsabilidad.
                    </span>
                  </label>
                </div>

                {/* Botones de Acción del Formulario */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>{showPreview ? 'Ocultar Vista Previa' : 'Previsualizar Texto'}</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      disabled={downloadingDocx}
                      className="px-4 py-2.5 bg-secondary text-on-secondary font-bold text-xs rounded-lg hover:bg-secondary-container transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>{downloadingDocx ? 'Generando...' : 'Descargar Word (.docx)'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submittingLegal}
                      className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase rounded-lg hover:bg-primary-container transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>{submittingLegal ? 'Enviando...' : 'Radicar Asistencia Legal'}</span>
                    </button>
                  </div>
                </div>

                {/* Modal Turnstile */}
                <TurnstileModal
                  isOpen={showCaptchaModal}
                  onClose={() => setShowCaptchaModal(false)}
                  onVerified={handleCaptchaSuccess}
                  action="asistencia_legal"
                />

                {/* Previsualización del Texto */}
                {showPreview && (
                  <div className="mt-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-outline-variant">
                      <span className="text-xs font-bold text-on-surface">Vista Previa del Texto Formal</span>
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="px-2.5 py-1 bg-surface border border-outline text-xs font-semibold rounded hover:bg-surface-variant flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">{copiedText ? 'check' : 'content_copy'}</span>
                        <span>{copiedText ? '¡Copiado!' : 'Copiar Texto'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-on-surface whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                      {generatedText}
                    </pre>
                  </div>
                )}
              </form>
            )}
          </div>
        ) : null}
      </div>

      {/* Categorías y Filtros con Desplazamiento Horizontal Móvil */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-stack-md">
        {/* Barra de Filtros Deslizable (Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar max-w-full">
          {[
            { id: 'todas', label: t.recursos.catTodas, icon: 'apps' },
            { id: 'cancilleria', label: t.recursos.catCancilleria, icon: 'public', badge: 'Nuevo' },
            { id: 'derecho_peticion', label: t.recursos.catPeticion, icon: 'balance' },
            { id: 'rud', label: t.recursos.catRud, icon: 'assignment' },
            { id: 'subsidios', label: t.recursos.catSubsidios, icon: 'home' },
            { id: 'victimas', label: t.recursos.catVictimas, icon: 'shield' },
            { id: 'defuncion', label: t.recursos.catDefuncion, icon: 'receipt_long' },
            { id: 'formatos', label: t.recursos.catFormatos, icon: 'folder' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-secondary text-on-secondary shadow-xs scale-100 font-bold'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.badge && (
                <span className="ml-1 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  {cat.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Buscador Rápido */}
        <div className="relative min-w-[240px] md:min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar trámite o entidad..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant text-xs text-on-surface focus:border-secondary outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
            search
          </span>
        </div>
      </div>

      {/* Grid de Trámites con Divulgación Progresiva en Móvil */}
      {filteredTramites.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-4xl md:text-5xl mb-2">find_in_page</span>
          <h3 className="font-headline-md text-sm md:text-base font-bold text-on-surface">No se encontraron trámites</h3>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Intenta con otro término de búsqueda o selecciona la categoría &ldquo;Todos los Trámites&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredTramites.map((tramite) => {
            const isExpanded = expandedCards[tramite.id] ?? false;

            return (
              <article
                key={tramite.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs hover:border-secondary/50 transition-all"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-outline-variant pb-3 mb-3 md:pb-4 md:mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        tramite.categoria === 'cancilleria'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {tramite.categoria === 'cancilleria' ? 'EXTRANJEROS & CANCILLERÍA' : tramite.categoria.toUpperCase()}
                      </span>
                      {tramite.esGratuito ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">money_off</span>
                          <span>100% Gratuito</span>
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-headline-md text-base sm:text-lg md:text-xl font-bold text-on-surface leading-snug">
                      {tramite.titulo}
                    </h3>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <span className="text-[10px] text-on-surface-variant block font-medium">Entidad Responsable:</span>
                    <span className="font-label-md text-xs font-bold text-secondary">{tramite.entidad}</span>
                  </div>
                </div>

                {/* Resumen */}
                <p className="font-body-md text-xs sm:text-sm text-on-surface leading-relaxed mb-4">
                  {tramite.resumen}
                </p>

                {/* Dónde Acudir */}
                <div className="mb-3 md:mb-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">location_on</span>
                  <div>
                    <strong className="text-on-surface block font-bold mb-0.5">{t.recursos.dondeAcudir}</strong>
                    <span className="text-on-surface-variant leading-relaxed text-[11px] sm:text-xs">{tramite.dondeAcudir}</span>
                  </div>
                </div>

                {/* Toggle Divulgación Progresiva en Móvil */}
                <div className="block lg:hidden mb-3">
                  <button
                    type="button"
                    onClick={() => toggleCardExpansion(tramite.id)}
                    className="w-full py-2 px-3 bg-surface-container text-secondary font-bold text-xs rounded-xl flex items-center justify-between border border-outline-variant/80 hover:bg-surface-container-high transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">{isExpanded ? 'visibility_off' : 'checklist'}</span>
                      <span>{isExpanded ? t.recursos.ocultarRequisitosPasos : t.recursos.verRequisitosPasos}</span>
                    </span>
                    <span className="material-symbols-outlined text-base">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                  </button>
                </div>

                {/* Grid Requisitos y Pasos (Siempre visible en desktop, colapsable en móvil) */}
                <div className={`${isExpanded ? 'block' : 'hidden lg:grid'} grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4 animate-in fade-in duration-200`}>
                  {/* Requisitos */}
                  <div className="bg-surface p-3.5 md:p-4 rounded-xl border border-outline-variant">
                    <h4 className="font-label-md text-xs font-bold text-on-surface uppercase mb-2.5 flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-sm">checklist</span>
                      <span>{t.recursos.requisitos}</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-on-surface-variant">
                      {tramite.requisitos.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-green-600 text-sm shrink-0 mt-0.5">check_circle</span>
                          <span className="leading-relaxed text-[11px] sm:text-xs">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pasos */}
                  <div className="bg-surface p-3.5 md:p-4 rounded-xl border border-outline-variant">
                    <h4 className="font-label-md text-xs font-bold text-on-surface uppercase mb-2.5 flex items-center gap-1.5 text-secondary">
                      <span className="material-symbols-outlined text-sm">route</span>
                      <span>{t.recursos.rutaPasos}</span>
                    </h4>
                    <ol className="space-y-2 text-xs text-on-surface-variant">
                      {tramite.pasos.map((paso, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] sm:text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed text-[11px] sm:text-xs">{paso}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Alerta de Seguridad del trámite */}
                {tramite.alertaSeguridad ? (
                  <div className="p-2.5 md:p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-950 mb-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-700 text-sm shrink-0 mt-0.5">gavel</span>
                    <span className="text-[11px] sm:text-xs leading-relaxed"><strong>Advertencia Cívica:</strong> {tramite.alertaSeguridad}</span>
                  </div>
                ) : null}

                {/* Enlaces Oficiales */}
                {tramite.enlacesOficiales && tramite.enlacesOficiales.length > 0 ? (
                  <div className="pt-3 border-t border-outline-variant flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] text-on-surface-variant font-bold mr-1">{t.recursos.canalesOficiales}</span>
                    {tramite.enlacesOficiales.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target={link.url.startsWith('http') ? '_blank' : undefined}
                        rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        download={link.url.endsWith('.docx') ? 'modelo-de-peticion.docx' : undefined}
                        className="px-2.5 py-1.5 bg-surface-container text-on-surface font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors inline-flex items-center gap-1 border border-outline-variant"
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
            );
          })}
        </div>
      )}

      {/* Footer Support Banner */}
      <div className="mt-6 md:mt-stack-xl bg-surface-container-high p-4 sm:p-6 rounded-2xl border border-outline-variant text-center space-y-2">
        <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
          ¿Eres abogado o representas a un consultorio jurídico?
        </h3>
        <p className="font-body-md text-xs text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Súmate al banco de voluntariado profesional para brindar asesoría jurídica solidaria a familias damnificadas en la radicación y seguimiento de derechos de petición.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-2.5">
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
