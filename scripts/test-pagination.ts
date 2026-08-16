/**
 * Test Suite para Paginación, Ordenamiento y Filtros de Iniciativas (0.0.4-beta)
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { IdeaRepository } from '../src/db/repositories/idea.repository';
import { IniciativaRepository } from '../src/db/repositories/iniciativa.repository';
import { VoluntariadoRepository } from '../src/db/repositories/voluntariado.repository';

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

console.log('🧪 Iniciando pruebas de Paginación, Ordenamiento y Filtros (0.0.4-beta)...');

const db = setupTestDb();

// 1. Iniciativas: Categorías y Orden
console.log('\n🔹 Probando IniciativaRepository (Filtros de categoría y orden)...');

IniciativaRepository.create({
  nombre: 'Cruz Roja Seccional',
  descripcion: 'Atención prehospitalaria',
  categoria: 'organismo_oficial',
  urlOficial: 'https://cruzroja.org',
}, db);

IniciativaRepository.create({
  nombre: 'Fundación Techo',
  descripcion: 'Albergues modulares',
  categoria: 'ong',
  urlOficial: 'https://techo.org',
}, db);

IniciativaRepository.create({
  nombre: 'Brigada de Rescate Popayán',
  descripcion: 'Remoción de escombros comunitaria',
  categoria: 'colectivo',
  urlOficial: 'https://brigada.org',
}, db);

// Test filtro ong
const ongResult = IniciativaRepository.findMany({ categoria: 'ong' }, db);
assert(ongResult.iniciativas.length === 1, 'Filtro de categoría "ong" retorna 1 ONG');
assert(ongResult.iniciativas[0].nombre === 'Fundación Techo', 'ONG recuperada es Fundación Techo');

// Test filtro colectivo
const colectivoResult = IniciativaRepository.findMany({ categoria: 'colectivo' }, db);
assert(colectivoResult.iniciativas.length === 1, 'Filtro de categoría "colectivo" retorna 1 colectivo');
assert(colectivoResult.iniciativas[0].nombre === 'Brigada de Rescate Popayán', 'Colectivo recuperado es Brigada de Rescate');

// Test filtro organismo_oficial
const oficialResult = IniciativaRepository.findMany({ categoria: 'organismo_oficial' }, db);
assert(oficialResult.iniciativas.length === 1, 'Filtro de categoría "organismo_oficial" retorna 1 organismo oficial');

// Test Paginación y Orden
const allDesc = IniciativaRepository.findMany({ limit: 2, offset: 0, order: 'desc' }, db);
assert(allDesc.iniciativas.length === 2, 'Debe retornar 2 items en página 1');
assert(allDesc.total === 3, 'Total debe ser 3');
assert(allDesc.iniciativas[0].nombre === 'Brigada de Rescate Popayán', 'Primero debe ser el más reciente en DESC');

const allAsc = IniciativaRepository.findMany({ limit: 2, offset: 0, order: 'asc' }, db);
assert(allAsc.iniciativas[0].nombre === 'Cruz Roja Seccional', 'Primero debe ser el más antiguo en ASC');

// 2. Ideas: Paginación y Búsqueda
console.log('\n🔹 Probando IdeaRepository (Paginación, búsqueda y orden)...');

for (let i = 1; i <= 15; i++) {
  IdeaRepository.create({
    titulo: `Propuesta humanitaria #${i.toString().padStart(2, '0')}`,
    descripcionMarkdown: `Detalle de la propuesta número ${i} con suministros y agua`,
    categoria: 'Salud y Agua',
    estado: 'idea',
    esAnonimo: true,
  }, db);
}

const page1 = IdeaRepository.findMany({ limit: 6, offset: 0, order: 'desc' }, db);
assert(page1.ideas.length === 6, 'Página 1 debe tener 6 ideas');
assert(page1.total === 15, 'Total debe ser 15 ideas');
assert(page1.ideas[0].titulo === 'Propuesta humanitaria #15', 'Primer item debe ser #15');

const page2 = IdeaRepository.findMany({ limit: 6, offset: 6, order: 'desc' }, db);
assert(page2.ideas.length === 6, 'Página 2 debe tener 6 ideas');
assert(page2.ideas[0].titulo === 'Propuesta humanitaria #09', 'Primer item de página 2 debe ser #09');

const searchRes = IdeaRepository.findMany({ search: '#07' }, db);
assert(searchRes.ideas.length === 1, 'Búsqueda debe encontrar propuesta #07');
assert(searchRes.ideas[0].titulo === 'Propuesta humanitaria #07', 'Título coincide con #07');

// 3. Voluntariado: Paginación y Búsqueda
console.log('\n🔹 Probando VoluntariadoRepository (Paginación, búsqueda y orden)...');

for (let i = 1; i <= 10; i++) {
  VoluntariadoRepository.create({
    tipo: i % 2 === 0 ? 'ofrezco_habilidad' : 'busco_profesional',
    areaProfesional: i % 2 === 0 ? 'Operario de Drones' : 'Medicina General',
    tituloNecesidad: `Perfil técnico #${i}`,
    descripcion: `Experiencia de apoyo en rescate #${i}`,
    nombreContacto: `Contacto ${i}`,
    emailContacto: `contacto${i}@test.org`,
    estado: 'activo',
  }, db);
}

const volPage1 = VoluntariadoRepository.findMany({ limit: 5, offset: 0, order: 'desc' }, db);
assert(volPage1.voluntariados.length === 5, 'Página 1 de voluntariado debe tener 5 perfiles');
assert(volPage1.total === 10, 'Total de voluntariados activos debe ser 10');
assert(volPage1.voluntariados[0].tituloNecesidad === 'Perfil técnico #10', 'Primer item en DESC debe ser #10');

const volSearch = VoluntariadoRepository.findMany({ search: 'Drones' }, db);
assert(volSearch.voluntariados.length === 5, 'Debe encontrar 5 registros con la palabra Drones');

console.log('\n✨ ¡Todas las pruebas de Paginación, Ordenamiento y Filtros pasaron exitosamente (100% OK)!');
