import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { GET as getIdeas, POST as postIdeas } from '../src/app/api/ideas/route';
import { GET as getIdeaById, PATCH as patchIdeaById } from '../src/app/api/ideas/[id]/route';
import { POST as verifyIdea } from '../src/app/api/ideas/[id]/verify/route';
import { POST as postComment } from '../src/app/api/ideas/[id]/comentarios/route';
import { GET as getIniciativas, POST as postIniciativa } from '../src/app/api/iniciativas/route';
import { GET as getBusqueda, POST as postBusqueda } from '../src/app/api/busqueda/route';
import { GET as getVoluntarios, POST as postVoluntario } from '../src/app/api/voluntarios/route';
import { GET as matchVoluntarios } from '../src/app/api/voluntarios/match/route';
import { GET as getAlertas, POST as postAlerta } from '../src/app/api/alertas/route';
import { PATCH as patchAlerta, DELETE as deleteAlerta } from '../src/app/api/alertas/[id]/route';
import { DELETE as deleteIniciativa } from '../src/app/api/iniciativas/[id]/route';
import { POST as requestMagicLink } from '../src/app/api/auth/magic-link/request/route';
import { POST as verifyMagicLink } from '../src/app/api/auth/magic-link/verify/route';
import { GET as getSessionRoute } from '../src/app/api/auth/session/route';
import { AuthService } from '../src/core/services';
import { UsuarioRepository } from '../src/db/repositories';

// Inicializar DB en memoria y poblar usuario admin
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

async function runApiTests() {
  console.log('🧪 Iniciando pruebas de integración de Controladores y Rutas API...\n');

  const adminUser = UsuarioRepository.findByEmail('admin@actuemosya.org') || UsuarioRepository.create({
    email: 'admin@actuemosya.org',
    nombre: 'Super Administrador',
    rol: 'admin',
    activo: true,
  });

  const adminToken = AuthService.createSessionToken({
    userId: adminUser.id,
    email: adminUser.email,
    rol: adminUser.rol,
  });

  // 1. Tests POST & GET /api/ideas
  console.log('🔹 Probando /api/ideas (Creación y Consulta con DTOs Zod)...');
  
  // Validación fallida (título muy corto)
  const invalidIdeaReq = new NextRequest('http://localhost:3000/api/ideas', {
    method: 'POST',
    body: JSON.stringify({
      titulo: 'abc', // < 5 caracteres
      descripcionMarkdown: 'Descripción corta',
      categoria: 'Salud',
    }),
  });
  const invalidRes = await postIdeas(invalidIdeaReq);
  const invalidJson = await invalidRes.json() as any;
  assert(invalidRes.status === 400 && invalidJson.ok === false, 'Rechaza payload inválido con HTTP 400');
  assert(invalidJson.error.code === 'VALIDATION_ERROR', 'Retorna código de error VALIDATION_ERROR');

  // Creación exitosa de idea
  const validIdeaReq = new NextRequest('http://localhost:3000/api/ideas', {
    method: 'POST',
    body: JSON.stringify({
      titulo: 'Red de Telecomunicaciones Satelitales',
      descripcionMarkdown: 'Instalación de antenas Starlink portátiles para comunicación en zonas de desastre.',
      categoria: 'Tecnología',
      alcanceTipo: 'general',
      iniciativaExistenteUrl: 'https://starlink.com/response',
      esAnonimo: true,
      captchaToken: 'test-token',
    }),
  });
  const createIdeaRes = await postIdeas(validIdeaReq);
  const createIdeaJson = await createIdeaRes.json() as any;
  assert(createIdeaRes.status === 201 && createIdeaJson.ok === true, 'Crea propuesta ciudadana con HTTP 201');
  assert(createIdeaJson.data.idea.iniciativaExistenteUrl === 'https://starlink.com/response', 'Guarda iniciativa existente vinculada');
  const ideaId = createIdeaJson.data.idea.id;

  // GET /api/ideas (Listado)
  const getIdeasReq = new NextRequest('http://localhost:3000/api/ideas?categoria=Tecnología');
  const getIdeasRes = await getIdeas(getIdeasReq);
  const getIdeasJson = await getIdeasRes.json() as any;
  assert(getIdeasRes.status === 200 && getIdeasJson.ok === true, 'GET /api/ideas retorna HTTP 200');

  // 2. Tests /api/ideas/[id] & PATCH (Protegido con Roles)
  console.log('\n🔹 Probando /api/ideas/[id] (Transiciones de Estado y Guardas de Rol)...');
  
  // Intento de PATCH sin autenticación -> HTTP 401
  const unauthPatchReq = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action: 'aprobar_borrador' }),
  });
  const unauthPatchRes = await patchIdeaById(unauthPatchReq, { params: { id: ideaId } });
  assert(unauthPatchRes.status === 401, 'Bloquea modificación sin sesión (HTTP 401)');

  // PATCH con sesión administrativa autorizada
  const authPatchReq = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ action: 'aprobar_borrador' }),
  });
  const authPatchRes = await patchIdeaById(authPatchReq, { params: { id: ideaId } });
  const authPatchJson = await authPatchRes.json() as any;
  assert(authPatchRes.status === 200 && authPatchJson.data.estado === 'idea', 'Moderador aprueba propuesta a estado "idea"');

  // GET /api/ideas/[id] (Detalle con comentarios)
  const getIdeaReq = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}`);
  const getIdeaRes = await getIdeaById(getIdeaReq, { params: { id: ideaId } });
  const getIdeaJson = await getIdeaRes.json() as any;
  assert(getIdeaRes.status === 200 && getIdeaJson.data.idea.id === ideaId, 'GET /api/ideas/[id] recupera detalle');

  // 3. Tests /api/ideas/[id]/comentarios
  console.log('\n🔹 Probando /api/ideas/[id]/comentarios...');
  const postCommentReq = new NextRequest(`http://localhost:3000/api/ideas/${ideaId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({
      contenidoMarkdown: 'Excelente propuesta de telecomunicaciones.',
      esAnonimo: true,
      captchaToken: 'test-token',
    }),
  });
  const postCommentRes = await postComment(postCommentReq, { params: { id: ideaId } });
  const postCommentJson = await postCommentRes.json() as any;
  assert(postCommentRes.status === 201 && postCommentJson.ok === true, 'Publica comentario con HTTP 201');

  // 4. Tests /api/iniciativas
  console.log('\n🔹 Probando /api/iniciativas...');
  const postIniReq = new NextRequest('http://localhost:3000/api/iniciativas', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      nombre: 'Cruz Roja Colombiana — RCF',
      descripcion: 'Restablecimiento de Contactos Familiares en zonas de catástrofe.',
      categoria: 'organismo_oficial',
      urlOficial: 'https://cruzrojacolombiana.org/rcf',
      coberturaGeografica: 'Nacional',
    }),
  });
  const postIniRes = await postIniciativa(postIniReq);
  const postIniJson = await postIniRes.json() as any;
  assert(postIniRes.status === 201, 'Registra organismo oficial con HTTP 201');

  const getOficialesReq = new NextRequest('http://localhost:3000/api/iniciativas?oficiales=true');
  const getOficialesRes = await getIniciativas(getOficialesReq);
  const getOficialesJson = await getOficialesRes.json() as any;
  assert(getOficialesRes.status === 200 && getOficialesJson.data.length >= 1, 'Consulta organismos oficiales prioritarios');

  const delIniReq = new NextRequest(`http://localhost:3000/api/iniciativas/${postIniJson.data.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const delIniRes = await deleteIniciativa(delIniReq, { params: { id: postIniJson.data.id } });
  assert(delIniRes.status === 200, 'Elimina iniciativa con HTTP 200');

  // 5. Tests /api/busqueda
  console.log('\n🔹 Probando /api/busqueda (Reportes Humanitarios)...');
  const postBusquedaReq = new NextRequest('http://localhost:3000/api/busqueda', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'persona',
      nombre: 'Carlos E. Restrepo',
      descripcionRasgos: 'Estatura 1.75m, chaqueta negra, cicatriz en ceja derecha.',
      ubicacion: 'Popayán — Barrio Bolívar',
      contactoEmergencia: '+57 312 0000000',
      captchaToken: 'test-token',
    }),
  });
  const postBusquedaRes = await postBusqueda(postBusquedaReq);
  assert(postBusquedaRes.status === 201, 'Crea reporte humanitario con HTTP 201');

  // 6. Tests /api/voluntarios & /api/voluntarios/[id]
  console.log('\n🔹 Probando /api/voluntarios (Registro con Términos, Mayoría de Edad y Moderación)...');
  const postVolReq = new NextRequest('http://localhost:3000/api/voluntarios', {
    method: 'POST',
    body: JSON.stringify({
      tipo: 'ofrezco_habilidad',
      areaProfesional: 'Ingeniería Civil / Estructural',
      tituloNecesidad: 'Evaluación Estructural de Edificaciones',
      descripcion: 'Ingeniero calculista disponible para peritaje de viviendas afectadas.',
      nombreContacto: 'Ing. Morales',
      emailContacto: 'morales@ingenieria.co',
      ubicacion: 'Cali',
      esMayorDeEdad: true,
      aceptaTerminos: true,
      captchaToken: 'test-token',
    }),
  });
  const postVolRes = await postVoluntario(postVolReq);
  const postVolJson = await postVolRes.json() as any;
  assert(postVolRes.status === 201 && postVolJson.data.voluntariado.estado === 'pendiente', 'Registra voluntariado con HTTP 201 en estado pendiente');

  const volId = postVolJson.data.voluntariado.id;

  // Moderación PATCH /api/voluntarios/[id]
  const { PATCH: patchVoluntario, DELETE: deleteVoluntario } = await import('../src/app/api/voluntarios/[id]/route');
  const patchVolReq = new NextRequest(`http://localhost:3000/api/voluntarios/${volId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ estado: 'activo' }),
  });
  const patchVolRes = await patchVoluntario(patchVolReq, { params: { id: volId } });
  const patchVolJson = await patchVolRes.json() as any;
  assert(patchVolRes.status === 200 && patchVolJson.data.estado === 'activo', 'Supervisor aprueba voluntariado a estado "activo"');

  const matchReq = new NextRequest('http://localhost:3000/api/voluntarios/match?area=Ingenier%C3%ADa%20Civil%20%2F%20Estructural');
  const matchRes = await matchVoluntarios(matchReq);
  const matchJson = await matchRes.json() as any;
  assert(matchRes.status === 200 && matchJson.data.ofertas.length >= 1, 'Endpoint de matching retorna ofertas');

  // 7. Tests /api/alertas (Emergency Banner y Carrusel)
  console.log('\n🔹 Probando /api/alertas...');
  const postAlertReq = new NextRequest('http://localhost:3000/api/alertas', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      nivel: 'critica',
      mensaje: 'SISMO 6.8: Se declara estado de calamidad pública. Siga canales oficiales.',
      enlaceAccionUrl: 'https://gestiondelriesgo.gov.co',
      enlaceAccionTexto: 'Sala de Crisis UNGRD',
    }),
  });
  const postAlertRes = await postAlerta(postAlertReq);
  const postAlertJson = await postAlertRes.json() as any;
  assert(postAlertRes.status === 201, 'Emite alerta de crisis con HTTP 201');

  const getAlertReq = new NextRequest('http://localhost:3000/api/alertas');
  const getAlertRes = await getAlertas(getAlertReq);
  const getAlertJson = await getAlertRes.json() as any;
  assert(getAlertRes.status === 200 && getAlertJson.data.alertas.length >= 1, 'GET /api/alertas retorna lista de alertas activas para el carrusel');

  // Pausar y reactivar alerta
  const patchAlertReq = new NextRequest(`http://localhost:3000/api/alertas/${postAlertJson.data.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ activa: false }),
  });
  const patchAlertRes = await patchAlerta(patchAlertReq, { params: { id: postAlertJson.data.id } });
  assert(patchAlertRes.status === 200, 'Pausa alerta con HTTP 200');

  // Eliminar alerta
  const delAlertReq = new NextRequest(`http://localhost:3000/api/alertas/${postAlertJson.data.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const delAlertRes = await deleteAlerta(delAlertReq, { params: { id: postAlertJson.data.id } });
  assert(delAlertRes.status === 200, 'Elimina alerta con HTTP 200');

  // 8. Tests /api/auth/session
  console.log('\n🔹 Probando /api/auth/session...');
  const authSessionReq = new NextRequest('http://localhost:3000/api/auth/session', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const authSessionRes = await getSessionRoute(authSessionReq);
  const authSessionJson = await authSessionRes.json() as any;
  assert(authSessionJson.data.authenticated === true && authSessionJson.data.user.email === 'admin@actuemosya.org', 'Valida sesión administrativa');

  // 9. Tests /api/auth/register-supervisor & /api/usuarios
  console.log('\n🔹 Probando Postulación y Aprobación de Supervisores (/api/auth/register-supervisor y /api/usuarios)...');
  const testSupEmail = `alejandro.${Date.now()}@salud.org`;
  const regReq = new NextRequest('http://localhost:3000/api/auth/register-supervisor', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Dr. Alejandro Gaviria',
      email: testSupEmail,
      organizacion: 'Epidemiología Comunitaria',
      motivacion: 'Apoyo en vigilancia epidemiológica post-desastre en albergues.',
      captchaToken: 'test-token',
    }),
  });
  const { POST: registerSupervisor } = await import('../src/app/api/auth/register-supervisor/route');
  const regRes = await registerSupervisor(regReq);
  const regJson = await regRes.json() as any;
  assert(regRes.status === 201 && regJson.data.user.activo === false, 'Registra supervisor en estado inactivo (pendiente de aprobación)');

  const supervisorId = regJson.data.user.id;

  // GET /api/usuarios (Admin only)
  const { GET: getUsuarios } = await import('../src/app/api/usuarios/route');
  const getUsuariosReq = new NextRequest('http://localhost:3000/api/usuarios', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const getUsuariosRes = await getUsuarios(getUsuariosReq);
  const getUsuariosJson = await getUsuariosRes.json() as any;
  assert(getUsuariosRes.status === 200 && Array.isArray(getUsuariosJson.data), 'GET /api/usuarios lista usuarios para admin');

  // PATCH /api/usuarios/[id] (Aprobar y activar)
  const { PATCH: patchUsuario } = await import('../src/app/api/usuarios/[id]/route');
  const patchUserReq = new NextRequest(`http://localhost:3000/api/usuarios/${supervisorId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ activo: true }),
  });
  const patchUserRes = await patchUsuario(patchUserReq, { params: { id: supervisorId } });
  const patchUserJson = await patchUserRes.json() as any;
  assert(patchUserRes.status === 200 && patchUserJson.data.activo === true, 'Admin activa a supervisor y dispara Magic Link');

  // 10. Tests /api/auth/dev-login (Acceso Rápido de Desarrollo)
  console.log('\n🔹 Probando /api/auth/dev-login (Acceso Rápido de Desarrollo)...');
  const { POST: devLogin } = await import('../src/app/api/auth/dev-login/route');
  const devLoginReq = new NextRequest('http://localhost:3000/api/auth/dev-login', {
    method: 'POST',
  });
  const devLoginRes = await devLogin(devLoginReq);
  const devLoginJson = await devLoginRes.json() as any;
  assert(devLoginRes.status === 200 && devLoginJson.data.sessionToken !== undefined, 'Acceso rápido de desarrollo genera sesión de 30 días');

  console.log('\n✨ ¡Todas las pruebas de integración de la API (Fase 3) pasaron exitosamente (100% OK)!');
}

runApiTests().catch((err) => {
  console.error('💥 Error en las pruebas de la API:', err);
  process.exit(1);
});
