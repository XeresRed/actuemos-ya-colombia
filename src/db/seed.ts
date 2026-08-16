import { getDb } from './client';
import { runMigrations } from './migrate';

export function runSeed() {
  console.log('🌱 Iniciando seed de datos limpios y oficiales para SQLite...');
  runMigrations();
  const db = getDb();

  // 1. Super Administrador Oficial
  const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'cam960210@gmail.com').trim().toLowerCase();
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO usuarios (id, email, nombre, rol, activo)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-admin-principal', defaultAdminEmail, 'Super Administrador', 'admin', 1);

  // 2. Directorio de Iniciativas Activas y Canales Oficiales
  const insertInitiative = db.prepare(`
    INSERT OR REPLACE INTO iniciativas_activas (
      id, nombre, descripcion, categoria, url_oficial, contacto, cobertura_geografica, estado_operacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Organismos Oficiales del Estado
  insertInitiative.run(
    'ini-oficial-1',
    'UNGRD — Sala de Crisis y Registro RUND',
    'Coordinación nacional del Sistema de Gestión del Riesgo y Registro Único Nacional de Damnificados (RUND).',
    'organismo_oficial',
    'http://portal.gestiondelriesgo.gov.co/',
    '+57 601 5529696',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-oficial-2',
    'Cruz Roja Colombiana — Restablecimiento de Contactos Familiares (RCF)',
    'Atención prehospitalaria, albergues temporales y canal formal de Restablecimiento del Contacto entre Familiares (RCF).',
    'organismo_oficial',
    'https://cruzrojacolombiana.org/rcf',
    'Línea 132 / +57 601 4376300',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-oficial-3',
    'Defensa Civil Colombiana — Rescate y Albergues',
    'Operaciones de búsqueda, rescate y soporte logístico en zonas de impacto y calamidad pública.',
    'organismo_oficial',
    'https://www.defensacivil.gov.co/',
    'Línea 144 / +57 601 3199000',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-oficial-4',
    'Unidad para las Víctimas — Plataforma RUV',
    'Orientación humanitaria, atención prioritaria y Registro Único de Víctimas (RUV) ante emergencias.',
    'organismo_oficial',
    'https://www.unidadvictimas.gov.co/',
    '018000 911119',
    'Nacional',
    'activa'
  );

  // Redes Cívicas y Plataformas Especializadas
  insertInitiative.run(
    'ini-colombiatebusca',
    'ColombiaTeBusca — Registro de Personas Desaparecidas',
    'Plataforma cívica líder en Colombia para el reporte, registro y localización ágil de personas desaparecidas o incomunicadas ante emergencias y desastres naturales.',
    'ong_colectivo',
    'https://colombiatebusca.com/?tab=persons',
    'https://colombiatebusca.com',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-migenteve',
    'MiGenteVe Colombia — Mascotas, Refugios y Veterinaria',
    'Plataforma especializada en el registro y reencuentro de mascotas extraviadas, directorio de albergues de animales y red de atención y servicios médicos veterinarios de emergencia.',
    'ong_colectivo',
    'https://colombia.migenteve.com/',
    'https://colombia.migenteve.com',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-abaco',
    'Banco de Alimentos de Colombia (ÁBACO)',
    'Red nacional de acopio y distribución de víveres no perecederos, agua potable y paquetes humanitarios en zonas de calamidad.',
    'ong_colectivo',
    'https://abaco.org.co',
    'donaciones@abaco.org.co',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-techo',
    'Techo Colombia — Refugios de Emergencia',
    'Construcción y ensamblaje ágil de viviendas modulares de emergencia para familias afectadas por desastres naturales.',
    'ong_colectivo',
    'https://colombia.techo.org',
    'emergencia@techo.org',
    'Nacional',
    'activa'
  );

  // 3. Alertas Preventivas Institucionales
  const insertAlert = db.prepare(`
    INSERT OR REPLACE INTO alertas_sistema (
      id, nivel, mensaje, activa, enlace_accion_url, enlace_accion_texto, actualizado_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAlert.run(
    'alert-oficial-1',
    'informativa',
    'Canal oficial de coordinación cívica y humanitaria. Para emergencias inmediatas comuníquese a la línea 123 o con los organismos de socorro oficiales.',
    1,
    'http://portal.gestiondelriesgo.gov.co/',
    'Sitio Oficial UNGRD',
    defaultAdminEmail
  );

  console.log('✅ Seed limpio y oficial completado con éxito.');
}

if (require.main === module || process.argv[1]?.includes('seed')) {
  runSeed();
}
