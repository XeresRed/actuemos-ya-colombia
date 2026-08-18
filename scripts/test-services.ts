import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { runMigrations } from '../src/db/migrate';
import {
  SanitizeService,
  CaptchaService,
  EmailService,
  AuthService,
  IdeaService,
  IniciativaService,
  BusquedaService,
  VoluntariadoService,
  AlertaService,
  LegalService,
} from '../src/core/services';
import {
  IdeaRepository,
  UsuarioRepository,
  AuthRepository,
  ComentarioRepository,
  IniciativaRepository,
  BusquedaRepository,
  VoluntariadoRepository,
  AlertaRepository,
} from '../src/db/repositories';
import { ForbiddenError, ValidationError, NotFoundError } from '../src/core/errors';

// Configurar base de datos SQLite en memoria para pruebas
function setupTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }

  return db;
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Falló la aserción: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 Iniciando pruebas unitarias de los Servicios de Negocio (Core Services)...\n');

  // Asegurar que las migraciones estén ejecutadas sobre la base de datos de servicios
  runMigrations();

  // Inicializar DB en memoria y poblar usuario admin de prueba
  const db = setupTestDb();
  
  // Re-enlazar repositorios con la instancia en memoria si se ejecutan directamente
  // En Next.js client.ts usa process.env.DATABASE_URL
  const admin = UsuarioRepository.findByEmail('admin@actuemosya.org') || UsuarioRepository.create({
    email: 'admin@actuemosya.org',
    nombre: 'Admin General',
    rol: 'admin',
    activo: true,
  });

  // 1. SanitizeService Tests
  console.log('🔹 Probando SanitizeService (Mitigación XSS)...');
  const dirtyMarkdown = `
    # Título Seguro
    <script>alert("XSS")</script>
    <p onclick="stealCookies()">Texto con evento malicioso</p>
    <iframe src="http://evil.com"></iframe>
    [Enlace Malicioso](javascript:alert(1))
    <a href="https://cruzroja.org">Cruz Roja</a>
  `;

  const cleanMarkdown = SanitizeService.sanitizeMarkdown(dirtyMarkdown);
  assert(!cleanMarkdown.includes('<script>'), 'Elimina etiquetas <script>');
  assert(!cleanMarkdown.includes('onclick='), 'Elimina eventos inline onclick');
  assert(!cleanMarkdown.includes('<iframe>'), 'Elimina etiquetas <iframe>');
  assert(!cleanMarkdown.includes('javascript:'), 'Elimina esquemas javascript:');
  assert(cleanMarkdown.includes('rel="noopener noreferrer nofollow"'), 'Inyecta rel noopener noreferrer nofollow');

  // 2. CaptchaService Tests
  console.log('\n🔹 Probando CaptchaService...');
  const devCaptcha = await CaptchaService.verifyToken('dev-token');
  assert(devCaptcha === true, 'Bypass seguro en development/testing');

  // 3. AuthService Tests (Tokens de Sesión y Magic Links)
  console.log('\n🔹 Probando AuthService (Tokens de Sesión Stateless & OTP)...');
  const sessionToken = AuthService.createSessionToken({
    userId: admin.id,
    email: admin.email,
    rol: admin.rol,
  });

  assert(typeof sessionToken === 'string' && sessionToken.split('.').length === 3, 'Genera token JWT firmado válido');
  
  const payload = AuthService.verifySessionToken(sessionToken);
  assert(payload !== null && payload.userId === admin.id && payload.rol === 'admin', 'Verifica sesión y extrae payload');

  const tamperedToken = sessionToken.slice(0, -5) + 'AAAAA';
  assert(AuthService.verifySessionToken(tamperedToken) === null, 'Rechaza token manipulado');

  // Magic Link request & verification
  const magicLinkReq = await AuthService.requestMagicLink('admin@actuemosya.org');
  assert(magicLinkReq.sent === true, 'Solicita Magic Link exitosamente');

  // Supervisor Registration & Approval Flow
  const testEmail = `laura.${Date.now()}@medicos.org`;
  const regSupervisor = await AuthService.registerSupervisor({
    nombre: 'Dra. Laura Voluntaria',
    email: testEmail,
    organizacion: 'Médicos Sin Fronteras',
    motivacion: 'Atención prehospitalaria en zonas de difícil acceso',
  }, 'test-token');

  assert(regSupervisor.isNew === true, 'Registra postulación de nuevo supervisor');
  assert(regSupervisor.user.activo === false, 'Supervisor queda inactivo (activo = false)');

  const approvedSupervisor = await AuthService.approveSupervisor(regSupervisor.user.id, undefined, 'admin');
  assert(approvedSupervisor.activo === true, 'Admin aprueba y activa al supervisor con dominio resuelto automáticamente');

  // Probar getAppBaseUrl utility
  const { getAppBaseUrl } = await import('../src/lib/server-url');
  assert(getAppBaseUrl().startsWith('http'), 'getAppBaseUrl retorna una URL HTTP(S) válida');
  
  // Probar con variable de entorno y neutralización de 0.0.0.0
  const prevDomain = process.env.APP_DOMAIN;
  const prevNodeEnv = process.env.NODE_ENV;

  // 1. Dominio canónico de producción
  process.env.APP_DOMAIN = 'actuayacolombia.org';
  assert(getAppBaseUrl() === 'https://actuayacolombia.org', 'getAppBaseUrl formatea APP_DOMAIN con https://');
  process.env.APP_DOMAIN = 'https://actuayacolombia.org/';
  assert(getAppBaseUrl() === 'https://actuayacolombia.org', 'getAppBaseUrl remueve trailing slash');

  // 2. Neutralización de 0.0.0.0 en desarrollo
  (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
  process.env.APP_DOMAIN = '0.0.0.0:3000';
  assert(getAppBaseUrl() === 'http://localhost:3000', 'Neutraliza 0.0.0.0:3000 a http://localhost:3000 en dev');
  process.env.APP_DOMAIN = 'https://0.0.0.0:3000';
  assert(getAppBaseUrl() === 'http://localhost:3000', 'Corrige https://0.0.0.0:3000 a http://localhost:3000 en dev');

  // 3. Neutralización de 0.0.0.0 en producción
  (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
  process.env.APP_DOMAIN = '0.0.0.0:3000';
  assert(getAppBaseUrl() === 'https://actuayacolombia.org', 'Neutraliza 0.0.0.0:3000 a https://actuayacolombia.org en producción');

  // Restaurar entorno previo
  process.env.APP_DOMAIN = prevDomain;
  (process.env as Record<string, string | undefined>).NODE_ENV = prevNodeEnv;

  // 4. IdeaService Tests (Pipeline de Estados & OTP)
  console.log('\n🔹 Probando IdeaService (Pipeline de Estados y OTP)...');
  
  // A. Creación anónima
  const anonIdeaRes = await IdeaService.createIdea({
    titulo: 'Comedores Comunitarios en Albergues',
    descripcionMarkdown: 'Instalación de cocinas a gas para proveer 1000 raciones diarias.',
    categoria: 'Víveres',
    esAnonimo: true,
  });

  assert(anonIdeaRes.idea.estado === 'borrador', 'Idea anónima queda en estado borrador');
  assert(anonIdeaRes.requiresOtp === false, 'Idea anónima no requiere OTP');

  // Moderador aprueba borrador anónimo
  const approvedIdea = await IdeaService.approveDraft(anonIdeaRes.idea.id, 'supervisor');
  assert(approvedIdea.estado === 'idea', 'Moderador aprueba borrador -> pasa a idea');

  // B. Creación con correo y OTP e iniciativa vinculada
  const emailIdeaRes = await IdeaService.createIdea({
    titulo: 'Brigada de Rescate con Drones Térmicos',
    descripcionMarkdown: 'Drones con sensores infrarrojos para ubicar sobrevivientes en zonas aisladas.',
    categoria: 'Rescate',
    emailCreador: 'drones@rescate.org',
    iniciativaExistenteUrl: 'https://cruzroja.org.co/drones',
    requiereVoluntarios: true,
    cantidadVoluntarios: 12,
    perfilVoluntarios: 'Pilotos de drones y rescatistas',
    esAnonimo: false,
  });

  assert(emailIdeaRes.requiresOtp === true, 'Idea con email requiere verificación OTP');
  assert(emailIdeaRes.idea.estado === 'borrador', 'Comienza en borrador antes de validar OTP');
  assert(emailIdeaRes.idea.iniciativaExistenteUrl === 'https://cruzroja.org.co/drones', 'Iniciativa existente vinculada guardada');
  assert(emailIdeaRes.idea.requiereVoluntarios === true, 'requiereVoluntarios guardado en IdeaService');
  assert(emailIdeaRes.idea.cantidadVoluntarios === 12, 'cantidadVoluntarios guardado en IdeaService');
  assert(emailIdeaRes.idea.perfilVoluntarios === 'Pilotos de drones y rescatistas', 'perfilVoluntarios guardado en IdeaService');

  // C. Transiciones del Pipeline
  const promoted = await IdeaService.promoteIdea(approvedIdea.id, 'admin');
  assert(promoted.estado === 'promovida', 'Transición a promovida');

  const activated = await IdeaService.activateIdea(approvedIdea.id, 'supervisor');
  assert(activated.estado === 'en_accion', 'Transición a en_accion');

  const redirected = await IdeaService.redirectIdea(approvedIdea.id, 'https://cruzrojacolombiana.org/drones', 'admin');
  assert(redirected.estado === 'redirigida', 'Transición a redirigida');
  assert(redirected.iniciativaExistenteUrl === 'https://cruzrojacolombiana.org/drones', 'URL de redirección guardada');

  // D. Comentarios anidados
  const comment = await IdeaService.addComment({
    ideaId: approvedIdea.id,
    contenidoMarkdown: 'Excelente propuesta. Disponemos de 2 pilotos certificados.',
    autorEmail: 'piloto@drones.co',
    esAnonimo: false,
  });

  assert(comment.id !== undefined, 'Comentario creado exitosamente');

  // 5. IniciativaService Tests (Organismos Oficiales & Anti-duplicación)
  console.log('\n🔹 Probando IniciativaService...');
  
  // Intentar crear organismo oficial sin rol de moderador -> debe fallar
  try {
    IniciativaService.createInitiative({
      nombre: 'Entidad Fake',
      descripcion: 'Entidad no verificada intentando registrarse como oficial',
      categoria: 'organismo_oficial',
      urlOficial: 'http://fake.org',
    });
    assert(false, 'Debe lanzar ForbiddenError al crear organismo oficial sin rol');
  } catch (err) {
    assert(err instanceof ForbiddenError, 'Bloquea creación no autorizada de organismo oficial');
  }

  const officialInit = IniciativaService.createInitiative({
    nombre: 'UNGRD — Sala de Crisis',
    descripcion: '### Punto de mando unificado\n- Operaciones 24/7\n- [Portal](http://portal.gov.co)',
    categoria: 'organismo_oficial',
    urlOficial: 'http://portal.gestiondelriesgo.gov.co/',
    direccion: 'Avenida El Dorado # 69-76, Bogotá',
    fechaEvento: '2026-08-20T08:00',
  }, 'admin');

  assert(officialInit.categoria === 'organismo_oficial', 'Crea organismo oficial con rol admin');
  assert(officialInit.direccion === 'Avenida El Dorado # 69-76, Bogotá', 'Guarda dirección de la iniciativa');
  assert(officialInit.fechaEvento === '2026-08-20T08:00', 'Guarda fecha del evento programado');
  assert(officialInit.descripcion.includes('### Punto de mando unificado'), 'Preserva estructura Markdown en descripción');


  // 6. BusquedaService Tests
  console.log('\n🔹 Probando BusquedaService...');
  const report = await BusquedaService.createReport({
    tipo: 'persona',
    nombre: 'Persona Extraviada',
    descripcionRasgos: 'Camisa verde, 1.70m, 28 años',
    ubicacion: 'Popayán',
    contactoEmergencia: '+57 310 1234567',
  });

  assert(report.estado === 'buscado', 'Reporte creado en estado buscado');

  const updatedReport = await BusquedaService.updateStatus(report.id, 'en_refugio');
  assert(updatedReport.estado === 'en_refugio', 'Actualiza estado humanitario a en_refugio');

  const verifiedReport = await BusquedaService.verifyReport(report.id, 'supervisor');
  assert(verifiedReport.verificadoPorSupervisor === true, 'Moderador verifica reporte');

  // 7. VoluntariadoService Tests (Moderación y Matching)
  console.log('\n🔹 Probando VoluntariadoService (Moderación y Matching de Habilidades)...');
  const createdOffer = await VoluntariadoService.createVolunteering({
    tipo: 'ofrezco_habilidad',
    areaProfesional: 'Psicología',
    tituloNecesidad: 'Psicólogo Clínico de Emergencias',
    descripcion: 'Primeros auxilios psicológicos y atención post-trauma',
    nombreContacto: 'Dr. Mendoza',
    emailContacto: 'mendoza@psi.co',
    ubicacion: 'Pasto',
  }, 'test-token');

  assert(createdOffer.estado === 'pendiente', 'Voluntariado creado queda en estado pendiente');
  assert(createdOffer.organizacion === null, 'Organización es null cuando no se especifica');

  const approvedOffer = VoluntariadoService.approveVolunteering(createdOffer.id, 'supervisor');
  assert(approvedOffer.estado === 'activo', 'Supervisor aprueba voluntariado a estado activo');

  const createdDemand = await VoluntariadoService.createVolunteering({
    tipo: 'busco_profesional',
    areaProfesional: 'Psicología',
    tituloNecesidad: 'Se requieren psicólogos para albergues',
    descripcion: 'Atención a familias afectadas por el sismo',
    nombreContacto: 'Carlos Gómez (Coordinador)',
    organizacion: 'Cruz Roja Seccional Nariño',
    emailContacto: 'albergue@pasto.gov.co',
    ubicacion: 'Pasto',
  }, 'test-token');

  assert(createdDemand.organizacion === 'Cruz Roja Seccional Nariño', 'Persiste y recupera nombre de organización');

  VoluntariadoService.approveVolunteering(createdDemand.id, 'admin');

  const matches = VoluntariadoService.matchSkills('Psicología');
  assert(matches.ofertas.length >= 1, 'Matching encuentra ofertas de psicología activas');
  assert(matches.demandas.length >= 1, 'Matching encuentra demandas de psicología activas');

  // 8. AlertaService Tests
  console.log('\n🔹 Probando AlertaService (Banner de Crisis y Carrusel)...');
  const alert = AlertaService.broadcastAlert({
    nivel: 'critica',
    mensaje: 'ALERTA CRÍTICA: Desastre natural activo. Evacuar zonas de ladera.',
    enlaceAccionUrl: 'http://portal.gestiondelriesgo.gov.co/',
    enlaceAccionTexto: 'Ver Directrices UNGRD',
  }, 'admin', 'admin@actuemosya.org');

  assert(alert.activa === true, 'Emite alerta activa');
  assert(alert.nivel === 'critica', 'Nivel de alerta es crítica');

  const alert2 = AlertaService.broadcastAlert({
    nivel: 'alerta_naranja',
    mensaje: 'ALERTA NARANJA: Albergues habilitados en Popayán.',
  }, 'admin', 'admin@actuemosya.org');

  const activeAlerts = AlertaService.getActiveAlerts();
  assert(activeAlerts.some(a => a.id === alert.id) && activeAlerts.some(a => a.id === alert2.id), 'getActiveAlerts retorna todas las alertas activas para el carrusel');

  AlertaService.toggleAlertStatus(alert.id, false, 'admin', 'admin@actuemosya.org');
  const activeAfterPause = AlertaService.getActiveAlerts();
  assert(!activeAfterPause.some(a => a.id === alert.id) && activeAfterPause.some(a => a.id === alert2.id), 'Pausar alerta actualiza el carrusel');

  AlertaService.deleteAlert(alert.id, 'admin');
  assert(!AlertaService.listAlertHistory(50, 'admin').some(a => a.id === alert.id), 'Elimina alerta correctamente');

  // Eliminación de iniciativa
  IniciativaService.deleteInitiative(officialInit.id, 'admin');

  // 9. LegalService Tests
  console.log('\n🔹 Probando LegalService (Derecho de Petición y Asistencia Legal)...');
  const legalReq = await LegalService.createSolicitud(
    {
      nombreCiudadano: 'Elena Restrepo <script>alert("xss")</script>',
      tipoDocumento: 'CC',
      cedulaCiudadano: '31223344',
      emailContacto: 'elena@ejemplo.com',
      telefonoContacto: '3101234567',
      departamento: 'Valle del Cauca',
      municipio: 'Cali',
      asunto: 'Subsidio de Arrendamiento Temporal y Caracterización RUD',
      hechos: '1. Mi vivienda en Siloé sufrió agrietamiento severo. 2. No he recibido subsidio.',
      peticiones: 'Se asigne subsidio de arriendo y se certifique la condición de damnificada.',
      aceptaConsentimiento: true,
    },
    'dev-token'
  );

  assert(legalReq.id !== undefined, 'LegalService crea solicitud con ID');
  assert(!legalReq.nombreCiudadano.includes('<script>'), 'LegalService sanitiza XSS en nombre');
  assert(legalReq.estado === 'pendiente', 'Estado inicial es pendiente');

  const supervisorLegalList = await LegalService.listSolicitudes({ estado: 'pendiente' }, 'supervisor');
  assert(supervisorLegalList.solicitudes.length >= 1, 'Supervisor puede listar solicitudes');

  const updatedReq = await LegalService.updateSolicitud(
    legalReq.id,
    {
      estado: 'en_contacto',
      abogadoAsignado: 'Dr. Alejandro Legal',
      notasSeguimiento: 'Llamada realizada y agendada revisión de documentos.',
    },
    'supervisor'
  );
  assert(updatedReq.estado === 'en_contacto', 'Actualiza estado a en_contacto');
  assert(updatedReq.abogadoAsignado === 'Dr. Alejandro Legal', 'Asigna abogado');

  const retrievedReq = await LegalService.getSolicitudById(legalReq.id, 'supervisor');
  assert(retrievedReq.id === legalReq.id, 'getSolicitudById retorna la solicitud');

  // Solo admin puede eliminar
  try {
    await LegalService.deleteSolicitud(legalReq.id, 'supervisor');
    assert(false, 'Supervisor no debería poder eliminar solicitudes');
  } catch (err: any) {
    assert(err.statusCode === 403 || err instanceof ForbiddenError, 'Supervisor recibe ForbiddenError al intentar eliminar');
  }

  await LegalService.deleteSolicitud(legalReq.id, 'admin');

  console.log('\n✨ ¡Todas las pruebas unitarias de los Servicios de Negocio (Core Services) pasaron exitosamente (100% OK)!');
}

runTests().catch((err) => {
  console.error('💥 Error en la suite de pruebas de servicios:', err);
  process.exit(1);
});
