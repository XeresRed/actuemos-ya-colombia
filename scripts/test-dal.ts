import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
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
import { ConflictError, NotFoundError } from '../src/core/errors';

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
  console.log('🧪 Iniciando pruebas unitarias de la capa de repositorios (DAL) en SQLite (:memory:)...\n');

  const db = setupTestDb();

  // 1. Tests IdeaRepository
  console.log('🔹 Probando IdeaRepository...');
  const idea1 = IdeaRepository.create({
    titulo: 'Red de Filtros de Agua',
    descripcionMarkdown: 'Filtros solares en zonas rurales',
    categoria: 'Salud',
    alcanceTipo: 'region',
    alcanceDetalle: 'Cauca',
    emailCreador: 'creador@example.com',
    esAnonimo: false,
  }, db);

  assert(idea1.id !== undefined, 'Idea creada tiene ID UUID');
  assert(idea1.estado === 'borrador', 'Estado inicial es borrador');
  assert(idea1.esAnonimo === false, 'esAnonimo es booleano falso');
  assert(idea1.emailCreador === 'creador@example.com', 'emailCreador coincide');

  const fetchedIdea = IdeaRepository.findById(idea1.id, db);
  assert(fetchedIdea !== null && fetchedIdea.titulo === 'Red de Filtros de Agua', 'findById recupera la idea');

  const updatedIdea = IdeaRepository.updateStatus(idea1.id, 'idea', null, db);
  assert(updatedIdea.estado === 'idea', 'updateStatus cambia a idea pública');

  const listResult = IdeaRepository.findMany({ estado: 'idea' }, db);
  assert(listResult.total === 1 && listResult.ideas.length === 1, 'findMany filtra por estado');

  const counts = IdeaRepository.countByEstado(db);
  assert(counts.idea === 1 && counts.borrador === 0, 'countByEstado calcula totales');

  // 2. Tests UsuarioRepository
  console.log('\n🔹 Probando UsuarioRepository...');
  const user1 = UsuarioRepository.create({
    email: 'admin@actuemosya.org',
    nombre: 'Admin General',
    rol: 'admin',
    activo: true,
  }, db);

  assert(user1.email === 'admin@actuemosya.org', 'Usuario creado correctamente');
  assert(user1.activo === true, 'activo es booleano true');

  const userByEmail = UsuarioRepository.findByEmail('ADMIN@actuemosya.org', db);
  assert(userByEmail !== null && userByEmail.id === user1.id, 'findByEmail es case-insensitive');

  try {
    UsuarioRepository.create({
      email: 'admin@actuemosya.org',
      nombre: 'Duplicado',
      rol: 'supervisor',
    }, db);
    assert(false, 'Debe lanzar ConflictError al duplicar correo');
  } catch (err) {
    assert(err instanceof ConflictError, 'Lanza ConflictError en duplicados');
  }

  // 3. Tests AuthRepository
  console.log('\n🔹 Probando AuthRepository...');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const token1 = AuthRepository.createToken({
    email: 'user@example.com',
    codigoHash: 'hash-otp-123456',
    tipo: 'verificacion_idea',
    referenciaId: idea1.id,
    expiraEn: expiresAt,
  }, db);

  assert(token1.usado === false, 'Token creado sin usar');

  const validToken = AuthRepository.findValidToken('user@example.com', 'hash-otp-123456', 'verificacion_idea', db);
  assert(validToken !== null && validToken.id === token1.id, 'findValidToken encuentra token vigente');

  AuthRepository.markTokenAsUsed(token1.id, db);
  const usedToken = AuthRepository.findValidToken('user@example.com', 'hash-otp-123456', 'verificacion_idea', db);
  assert(usedToken === null, 'Token marcado como usado ya no es válido');

  // 4. Tests ComentarioRepository
  console.log('\n🔹 Probando ComentarioRepository...');
  const com1 = ComentarioRepository.create({
    ideaId: idea1.id,
    contenidoMarkdown: 'Primer comentario raíz',
    autorEmail: 'comentador@example.com',
    esAnonimo: false,
    verificado: true,
  }, db);

  assert(com1.id !== undefined, 'Comentario raíz creado');

  const reply1 = ComentarioRepository.create({
    ideaId: idea1.id,
    comentarioPadreId: com1.id,
    contenidoMarkdown: 'Respuesta anidada al comentario raíz',
    esAnonimo: true,
  }, db);

  const tree = ComentarioRepository.findByIdeaId(idea1.id, true, db);
  assert(tree.length === 1, 'Árbol de comentarios tiene 1 raíz');
  assert(tree[0].respuestas.length === 1, 'Comentario raíz contiene 1 respuesta anidada');
  assert(tree[0].respuestas[0].id === reply1.id, 'ID de respuesta coincide');

  // 5. Tests IniciativaRepository
  console.log('\n🔹 Probando IniciativaRepository...');
  const ini1 = IniciativaRepository.create({
    nombre: 'UNGRD Oficial',
    descripcion: 'Gestión Nacional del Riesgo',
    categoria: 'organismo_oficial',
    urlOficial: 'http://portal.gestiondelriesgo.gov.co/',
    coberturaGeografica: 'Nacional',
  }, db);

  assert(ini1.categoria === 'organismo_oficial', 'Iniciativa creada con categoría oficial');

  const officialList = IniciativaRepository.findOfficial(db);
  assert(officialList.length === 1 && officialList[0].id === ini1.id, 'findOfficial retorna organismos oficiales');

  // 6. Tests BusquedaRepository
  console.log('\n🔹 Probando BusquedaRepository...');
  const rep1 = BusquedaRepository.create({
    tipo: 'persona',
    nombre: 'Familiar Extraviado',
    descripcionRasgos: 'Camisa azul, 1.80m',
    ubicacion: 'Popayán Centro',
    contactoEmergencia: '+57 300 0000000',
    estado: 'buscado',
  }, db);

  assert(rep1.tipo === 'persona', 'Reporte de persona creado');

  const repPet = BusquedaRepository.create({
    tipo: 'animal',
    nombre: 'Firulais',
    especie: 'Perro',
    descripcionRasgos: 'Mancha en ojo izquierdo',
    ubicacion: 'Popayán',
    contactoEmergencia: '+57 300 1111111',
    estado: 'perdido',
  }, db);

  const searchPets = BusquedaRepository.findMany({ tipo: 'animal' }, db);
  assert(searchPets.total === 1 && searchPets.reportes[0].id === repPet.id, 'findMany filtra por tipo animal');

  const updatedRep = BusquedaRepository.updateStatus(rep1.id, 'localizado', db);
  assert(updatedRep.estado === 'localizado', 'updateStatus cambia estado a localizado');

  // 7. Tests VoluntariadoRepository
  console.log('\n🔹 Probando VoluntariadoRepository...');
  const vol1 = VoluntariadoRepository.create({
    tipo: 'ofrezco_habilidad',
    areaProfesional: 'Medicina',
    tituloNecesidad: 'Médico General disponible',
    descripcion: 'Turnos nocturnos en hospital de campaña',
    nombreContacto: 'Dr. López',
    emailContacto: 'drlopez@med.co',
    ubicacion: 'Cali',
  }, db);

  assert(vol1.tipo === 'ofrezco_habilidad', 'Voluntariado oferta creado');

  const volList = VoluntariadoRepository.findMany({ areaProfesional: 'Medicina' }, db);
  assert(volList.total === 1 && volList.voluntariados[0].id === vol1.id, 'findMany filtra por área profesional');

  // 8. Tests AlertaRepository
  console.log('\n🔹 Probando AlertaRepository...');
  const alert1 = AlertaRepository.create({
    nivel: 'critica',
    mensaje: 'Sismo de 6.8 en desarrollo, diríjase a zonas seguras.',
    activa: true,
    enlaceAccionUrl: 'http://portal.gestiondelriesgo.gov.co/',
    enlaceAccionTexto: 'UNGRD Oficial',
    actualizadoPor: 'admin@actuemosya.org',
  }, db);

  const activeAlert = AlertaRepository.getActive(db);
  assert(activeAlert !== null && activeAlert.id === alert1.id, 'getActive obtiene alerta crítica activa');

  // Crear segunda alerta activa y verificar que coexisten como carrusel
  const alert2 = AlertaRepository.create({
    nivel: 'informativa',
    mensaje: 'Comités de rescate operando en normalidad.',
    activa: true,
  }, db);

  const allActive = AlertaRepository.getActiveAlerts(10, db);
  assert(allActive.length === 2, 'Múltiples alertas activas coexisten en el sistema');
  assert(allActive[0].id === alert2.id && allActive[1].id === alert1.id, 'Alertas ordenadas por fecha reciente');

  AlertaRepository.setActive(alert1.id, false, db);
  const activeAfterPause = AlertaRepository.getActiveAlerts(10, db);
  assert(activeAfterPause.length === 1 && activeAfterPause[0].id === alert2.id, 'Pausar alerta 1 deja solo alerta 2 activa');

  AlertaRepository.delete(alert1.id, db);
  assert(AlertaRepository.findById(alert1.id, db) === null, 'Alerta eliminada correctamente');

  AlertaRepository.deactivateAll(db);
  assert(AlertaRepository.getActive(db) === null, 'deactivateAll desactiva todas las alertas');

  console.log('\n✨ ¡Todas las pruebas unitarias de los 8 repositorios DAL pasaron exitosamente (100% OK)!');
}

runTests().catch((err) => {
  console.error('💥 Error en la suite de pruebas:', err);
  process.exit(1);
});
