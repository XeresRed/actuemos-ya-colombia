import JSZip from 'jszip';

export interface DerechoPeticionData {
  nombreCiudadano: string;
  tipoDocumento?: string;
  cedulaCiudadano: string;
  emailContacto: string;
  telefonoContacto: string;
  departamento: string;
  municipio: string;
  direccionFisica?: string | null;
  asunto: string;
  hechos: string;
  peticiones: string;
  anexos?: string | null;
  fechaTexto?: string;
}

export function getDestinatariosEntidades(departamento: string, municipio: string): string[] {
  const depUpper = departamento.trim().toUpperCase();
  const munUpper = municipio.trim().toUpperCase();

  const isValle = depUpper.includes('VALLE');
  const gobernacion = isValle ? 'GOBERNACIÓN DEL VALLE DEL CAUCA' : `GOBERNACIÓN DE ${depUpper}`;
  const alcaldia = `ALCALDÍA MUNICIPAL DE ${munUpper}`;
  const ungrd = 'UNIDAD NACIONAL PARA LA GESTIÓN DEL RIESGO DE DESASTRES (UNGRD)';

  return [gobernacion, alcaldia, ungrd];
}

export function getFechaTextoActual(): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const ahora = new Date();
  return `${ahora.getDate()} de ${meses[ahora.getMonth()]} de ${ahora.getFullYear()}`;
}

export function generateDerechoPeticionText(data: DerechoPeticionData): string {
  const fecha = data.fechaTexto || getFechaTextoActual();
  const tipoDoc = data.tipoDocumento || 'Cédula de Ciudadanía';
  const entidades = getDestinatariosEntidades(data.departamento, data.municipio);

  return `${data.municipio}, ${data.departamento}, ${fecha}

Señores:
${entidades.map(e => `• ${e}`).join('\n')}
E. S. D.

ASUNTO: DERECHO DE PETICIÓN — ${data.asunto.toUpperCase()}

Yo, ${data.nombreCiudadano}, identificado(a) con ${tipoDoc} No. ${data.cedulaCiudadano} expedida en ${data.municipio} (${data.departamento}), domiciliado(a) en el municipio de ${data.municipio}, muy respetuosamente por medio del presente escrito presento a ustedes DERECHO DE PETICIÓN teniendo en cuenta lo consagrado en el artículo 23 de la Constitución Política de Colombia y la Ley 1755 de 2015, con base en los siguientes:

HECHOS
${data.hechos.trim()}

Teniendo en cuenta los anteriores hechos, presento a ustedes respetuosamente las siguientes:

PETICIONES
${data.peticiones.trim()}

FUNDAMENTOS DE DERECHO
El presente derecho de petición se fundamenta en lo dispuesto en el artículo 23 de la Constitución Política de Colombia, y en los artículos 13, 14 y 24 de la Ley 1755 de 2015.

La Honorable Corte Constitucional ha destacado la obligación de que las entidades den respuesta a los derechos de petición comoquiera que este no solo es un derecho fundamental, sino que de su respuesta oportuna y de fondo depende la protección de otros derechos fundamentales esenciales. Así lo reiteró la Sentencia T-491 de 2013:
"El derecho de petición es fundamental y determinante para la efectividad de los mecanismos de la democracia participativa... El núcleo esencial del derecho de petición reside en la resolución pronta y oportuna de la cuestión, pues de nada serviría la posibilidad de dirigirse a la autoridad si ésta no resuelve o se reserva para sí el sentido de lo decidido."

ANEXOS
${data.anexos && data.anexos.trim().length > 0 ? data.anexos.trim() : 'No se aportan anexos documentales adicionales.'}

NOTIFICACIONES Y CONTACTO
Para efectos de recibir comunicaciones y respuestas formales:
Nombre: ${data.nombreCiudadano}
Documento: ${tipoDoc} No. ${data.cedulaCiudadano}
Teléfono / WhatsApp: ${data.telefonoContacto}
Correo Electrónico: ${data.emailContacto}
Dirección Física: ${data.direccionFisica || 'No indicada / Notificación electrónica'}

Términos legales para resolver conforme al artículo 14 de la Ley 1755 de 2015:
- 15 días hábiles para peticiones de interés general o particular.
- 10 días hábiles para solicitud de documentos o copias de información pública.
- 30 días hábiles para consultas ante autoridades en relación con sus funciones.

Atentamente,

___________________________________________
${data.nombreCiudadano}
${tipoDoc} No. ${data.cedulaCiudadano}
`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeParagraphXml(text: string, bold = false, align?: string): string {
  const pPr = [];
  if (align) {
    pPr.push(`<w:jc w:val="${align}"/>`);
  }
  const pPrXml = pPr.length > 0 ? `<w:pPr>${pPr.join('')}</w:pPr>` : '';
  const rPrXml = bold ? '<w:rPr><w:b/><w:bCs/></w:rPr>' : '';

  const lines = text.split('\n');
  const runsXml = lines
    .map(line => `<w:r>${rPrXml}<w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>`)
    .join('<w:r><w:br/></w:r>');

  return `<w:p>${pPrXml}${runsXml}</w:p>`;
}

export async function generateDerechoPeticionDocx(
  data: DerechoPeticionData,
  templateBufferOrUrl: ArrayBuffer | string = '/modelo-de-peticion.docx'
): Promise<Blob> {
  let templateArrayBuffer: ArrayBuffer;

  if (typeof templateBufferOrUrl === 'string') {
    const res = await fetch(templateBufferOrUrl);
    if (!res.ok) {
      throw new Error(`Fallo al cargar plantilla docx desde ${templateBufferOrUrl}`);
    }
    templateArrayBuffer = await res.arrayBuffer();
  } else {
    templateArrayBuffer = templateBufferOrUrl;
  }

  const zip = await JSZip.loadAsync(templateArrayBuffer);
  let docXml = await zip.file('word/document.xml')!.async('string');

  const fecha = data.fechaTexto || getFechaTextoActual();
  const tipoDoc = data.tipoDocumento || 'Cédula de Ciudadanía';
  const entidades = getDestinatariosEntidades(data.departamento, data.municipio);

  // 1. Reemplazar encabezado de fecha y lugar
  const lugarFechaText = `${data.municipio}, ${data.departamento}, ${fecha}`;
  docXml = docXml.replace(
    /Municipio y Departamento, fecha \(día, mes y año\)/g,
    escapeXml(lugarFechaText)
  );

  // 2. Reemplazar entidades
  const entidadesText = entidades.join(' / ');
  docXml = docXml.replace(
    /Entidad Pública o privada contra quien se dirige\./g,
    escapeXml(entidadesText)
  );

  // 3. Reemplazar Asunto
  const asuntoCompleto = `Petición sobre ${data.asunto.trim()}`;
  docXml = docXml.replace(
    /Petición de información sobre \(señalar el tema objeto de la petición\)/g,
    escapeXml(asuntoCompleto)
  );

  // 4. Reemplazar identificación del peticionario
  const identificacionTexto = `Yo, ${data.nombreCiudadano.trim()}, identificado (a) con ${tipoDoc} No. ${data.cedulaCiudadano.trim()} de ${data.municipio} (${data.departamento}), muy respetuosamente por medio del presente escrito presento a ustedes derecho de petición teniendo en cuenta lo consagrado en el artículo 23 de la Constitución Política y la Ley 1755 de 2015, con base en los siguientes hechos:`;
  docXml = docXml.replace(
    /Yo, ________________________, identificado \(a\) con la cédula de ciudadanía ______________ de _________________, muy respetuosamente por medio del presente escrito presento a ustedes derecho de petición teniendo en cuenta lo consagrado en el artículo 23 de la Constitución Política y la Ley 1755 de 2015, con base en los siguientes hechos:/g,
    escapeXml(identificacionTexto)
  );

  // 5. Reemplazar texto de guía de hechos con los hechos del usuario
  docXml = docXml.replace(
    /Enunciar de manera cronológica y clara los hechos relacionados con la petición o peticiones\./g,
    escapeXml(data.hechos.trim())
  );

  // 6. Reemplazar texto de guía de peticiones con las peticiones del usuario
  docXml = docXml.replace(
    /Señalar de forma muy precisa las peticiones respetuosas que se hagan ante las autoridades o ante los particulares\./g,
    escapeXml(data.peticiones.trim())
  );

  // 7. Reemplazar texto de guía de anexos
  const anexosTexto = data.anexos && data.anexos.trim().length > 0
    ? data.anexos.trim()
    : 'No se aportan anexos documentales adicionales.';
  docXml = docXml.replace(
    /Dependiendo de la clase de petición que se haga es recomendable anexar los documentos que orienten al destinatario en cuanto al tema de la petición que se haga\./g,
    escapeXml(anexosTexto)
  );

  // 8. Reemplazar bloque de firma
  docXml = docXml.replace(/Nombre: _______________________________/g, `Nombre: ${escapeXml(data.nombreCiudadano.trim())}`);
  docXml = docXml.replace(/C\.C\. __________________/g, `${escapeXml(tipoDoc)}: ${escapeXml(data.cedulaCiudadano.trim())} | Tel: ${escapeXml(data.telefonoContacto.trim())}`);
  docXml = docXml.replace(/Dirección Física: __________________________/g, `Dirección Física: ${escapeXml(data.direccionFisica || 'Notificación Electrónica')}`);
  docXml = docXml.replace(/Dirección Electrónica: __________________________/g, `Dirección Electrónica: ${escapeXml(data.emailContacto.trim())}`);

  zip.file('word/document.xml', docXml);

  const outBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return outBlob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
