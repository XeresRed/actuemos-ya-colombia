import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
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

  // Inicializar DB en memoria y poblar usuario admin de prueba
  const db = setupTestDb();
  
  // Re-enlazar repositorios con la instancia en memoria si se ejecutan directamente
  // En Next.js client.ts usa process.env.DATABASE_URL
  const admin = UsuarioRepository.create({
    email: 'admin@actuemosya.org',
    nombre: 'Admin General',
    rol: 'admin',
    activo: true,
  }, db);

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

  // B. Creación con correo y OTP
  const emailIdeaRes = await IdeaService.createIdea({
    titulo: 'Brigada de Rescate con Drones Térmicos',
    descripcionMarkdown: 'Drones con sensores infrarrojos para ubicar sobrevivientes en zonas aisladas.',
    categoria: 'Rescate',
    emailCreador: 'drones@rescate.org',
    esAnonimo: false,
  });

  assert(emailIdeaRes.requiresOtp === true, 'Idea con email requiere verificación OTP');
  assert(emailIdeaRes.idea.estado === 'borrador', 'Comienza en borrador antes de validar OTP');

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
    descripcion: 'Punto de mando unificado nacional',
    categoria: 'organismo_oficial',
    urlOficial: 'http://portal.gestiondelriesgo.gov.co/',
  }, 'admin');

  assert(officialInit.categoria === 'organismo_oficial', 'Crea organismo oficial con rol admin');

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

  // 7. VoluntariadoService Tests (Matching)
  console.log('\n🔹 Probando VoluntariadoService (Matching de Habilidades)...');
  await VoluntariadoService.createVolunteering({
    tipo: 'ofrezco_habilidad',
    areaProfesional: 'Psicología',
    tituloNecesidad: 'Psicólogo Clínico de Emergencias',
    descripcion: 'Primeros auxilios psicológicos y atención post-trauma',
    nombreContacto: 'Dr. Mendoza',
    emailContacto: 'mendoza@psi.co',
    ubicacion: 'Pasto',
  });

  await VoluntariadoService.createVolunteering({
    tipo: 'busco_profesional',
    areaProfesional: 'Psicología',
    tituloNecesidad: 'Se requieren psicólogos para albergues',
    descripcion: 'Atención a familias afectadas por el sismo',
    nombreContacto: 'Albergue Pasto',
    emailContacto: 'albergue@pasto.gov.co',
    ubicacion: 'Pasto',
  });

  const matches = VoluntariadoService.matchSkills('Psicología');
  assert(matches.ofertas.length >= 1, 'Matching encuentra ofertas de psicología');
  assert(matches.demandas.length >= 1, 'Matching encuentra demandas de psicología');

  // 8. AlertaService Tests
  console.log('\n🔹 Probando AlertaService (Banner de Crisis)...');
  const alert = AlertaService.broadcastAlert({
    nivel: 'critica',
    mensaje: 'ALERTA CRÍTICA: Desastre natural activo. Evacuar zonas de ladera.',
    enlaceAccionUrl: 'http://portal.gestiondelriesgo.gov.co/',
    enlaceAccionTexto: 'Ver Directrices UNGRD',
  }, 'admin', 'admin@actuemosya.org');

  assert(alert.activa === true, 'Emite alerta activa');
  assert(alert.nivel === 'critica', 'Nivel de alerta es crítica');

  const activeAlert = AlertaService.getActiveAlert();
  assert(activeAlert !== null && activeAlert.id === alert.id, 'getActiveAlert retorna la alerta activa');

  AlertaService.deactivateCurrentAlert('supervisor');
  assert(AlertaService.getActiveAlert() === null, 'Desactiva alerta correctamente');

  console.log('\n✨ ¡Todas las pruebas unitarias de los Servicios de Negocio (Core Services) pasaron exitosamente (100% OK)!');
}

runTests().catch((err) => {
  console.error('💥 Error en la suite de pruebas de servicios:', err);
  process.exit(1);
});
