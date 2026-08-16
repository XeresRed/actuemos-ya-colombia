const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { runMigrations } = require('./migrate');

function runSeed() {
  console.log('🌱 [DB Seed] Iniciando seed de datos iniciales y oficiales para SQLite...');

  // 1. Asegurar que las migraciones estén ejecutadas
  runMigrations();

  const rawPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'database.sqlite');
  const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // Ignorar si ya existe o es gestionado por volumen Docker
    }
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('busy_timeout = 5000');

  const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'cam960210@gmail.com').trim().toLowerCase();

  // 2. Super Administrador Principal
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO usuarios (id, email, nombre, rol, activo)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertUser.run('usr-admin-principal', defaultAdminEmail, 'Super Administrador', 'admin', 1);

  // 3. Directorio de Iniciativas Activas y Canales Oficiales
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
    'ong',
    'https://colombiatebusca.com/?tab=persons',
    'https://colombiatebusca.com',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-migenteve',
    'MiGenteVe Colombia — Mascotas, Refugios y Veterinaria',
    'Plataforma especializada en el registro y reencuentro de mascotas extraviadas, directorio de albergues de animales y red de atención y servicios médicos veterinarios de emergencia.',
    'colectivo',
    'https://colombia.migenteve.com/',
    'https://colombia.migenteve.com',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-abaco',
    'Banco de Alimentos de Colombia (ÁBACO)',
    'Red nacional de acopio y distribución de víveres no perecederos, agua potable y paquetes humanitarios en zonas de calamidad.',
    'ong',
    'https://abaco.org.co',
    'donaciones@abaco.org.co',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-techo',
    'Techo Colombia — Refugios de Emergencia',
    'Construcción y ensamblaje ágil de viviendas modulares de emergencia para familias afectadas por desastres naturales.',
    'ong',
    'https://colombia.techo.org',
    'emergencia@techo.org',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-adoptaunhogar',
    'AdoptaUnHogar — Alojamiento y Hogares Temporales',
    'Plataforma solidaria para la conexión, acogida y facilitación de hogares temporales o alojamiento de emergencia para familias y mascotas damnificadas.',
    'colectivo',
    'https://www.adoptaunhogar.com/',
    'https://www.adoptaunhogar.com/',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-manosvisibles',
    'Fundación Manos Visibles — Fondo de Emergencia Chocó y Puntos de Acopio',
    'Corporación y red de liderazgo fundada por Paula Moreno. Ante la emergencia, activó su red comunitaria para monitorear necesidades críticas de infraestructura y salud en el Pacífico, canalizar ayuda económica a damnificados y gestionar puntos de acopio de donaciones en Bogotá (Casa Jardín Origen: Calle 38 #29-29 Teusaquillo; Human Construction: Cra 52A #134D-23 Local 1; Fundación Catalina Muñoz: Diag 48 #19-16).',
    'ong',
    'https://web.afrus.org/donamigosvisibleschoco',
    'Donaciones: https://web.afrus.org/donamigosvisibleschoco | Acopio Bogotá: 8:00 a.m. – 6:00 p.m.',
    'Chocó / Pacífico / Bogotá',
    'activa'
  );

  insertInitiative.run(
    'ini-plan-international',
    'Fundación Plan (Plan International Colombia) — Campaña «Terremoto en Colombia»',
    'Organización con más de 60 años en la promoción y protección de los derechos de la niñez. Despliega asistencia humanitaria de emergencia, entrega de alimentos y suministros esenciales, implementación de espacios seguros para la infancia y soporte psicológico a niñas, niños y adolescentes afectados.',
    'ong',
    'https://plan.org.co/quiero-ayudar/terremoto-en-colombia/',
    'Donaciones web: https://plan.org.co/quiero-ayudar/terremoto-en-colombia/ | Recaudo vía QR y llave Bre-B',
    'Nacional',
    'activa'
  );

  // 4. Banco de Ideas en Acción (Soluciones y Mapeos Comunitarios en Desarrollo / Desplegados)
  const insertIdea = db.prepare(`
    INSERT OR REPLACE INTO ideas (
      id, titulo, descripcion_markdown, categoria, alcance_tipo, alcance_detalle,
      estado, iniciativa_existente_url, es_anonimo, email_creador, verificado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIdea.run(
    'idea-emergency-rosy',
    'Emergency Rosy — Directorio y Mapeo de Centros de Acopio',
    `Aplicación web interactiva que geolocaliza y lista los **centros de acopio activos** con direcciones exactas, horarios y necesidades prioritarias de insumos para la atención de damnificados ante la emergencia.

- **Acceso a la plataforma:** [emergency-rosy.vercel.app](https://emergency-rosy.vercel.app/)
- **Funcionalidad principal:** Mapeo geográfico de puntos de acopio y recepción de víveres/donaciones con direcciones verificadas.`,
    'Logística',
    'general',
    'Bogotá y Nacional',
    'en_accion',
    'https://emergency-rosy.vercel.app/',
    0,
    defaultAdminEmail,
    1
  );

  insertIdea.run(
    'idea-mapa-artefactofilms',
    'Mapa de Emergencia — Georreferenciación de Edificaciones Afectadas',
    `Herramienta de cartografía comunitaria que mapea y reporta en tiempo real edificaciones, viviendas e infraestructura con daños estructurales o necesidades urgentes tras el sismo del 10 de agosto.

- **Acceso al mapa:** [mapa-emergencia.artefactofilms.workers.dev](https://mapa-emergencia.artefactofilms.workers.dev/)
- **Objetivo:** Identificar focos críticos de riesgo estructural para agilizar la respuesta de cuerpos de rescate y evaluación técnica de ingenieros.`,
    'Infraestructura',
    'region',
    'Zonas afectadas por el sismo del 10 de agosto',
    'en_accion',
    'https://mapa-emergencia.artefactofilms.workers.dev/',
    0,
    defaultAdminEmail,
    1
  );

  insertIdea.run(
    'idea-pereira-unida',
    'Pereira Unida — Mapeo Comunitario de Afectaciones en Pereira',
    `Plataforma cívica comunitaria desarrollada para georreferenciar edificaciones con afectaciones, solicitudes de apoyo y necesidades prioritarias en el municipio de Pereira y el Eje Cafetero.

- **Acceso a la plataforma:** [pereiraunida.com](https://pereiraunida.com/)
- **Enfoque:** Monitoreo barrial, verificación de daños en predios y articulación con comités locales de emergencia.`,
    'Infraestructura',
    'ciudad',
    'Pereira / Risaralda',
    'en_accion',
    'https://pereiraunida.com/',
    0,
    defaultAdminEmail,
    1
  );

  insertIdea.run(
    'idea-tebuscocolombia-dev',
    'TeBuscoColombia — Búsqueda Comunitaria de Personas Desaparecidas',
    `Plataforma cívica independiente desarrollada para el reporte, registro y localización ágil de personas no localizadas ante la emergencia.

- **Acceso a la plataforma:** [tebuscocolombia.desarrollando.co](https://tebuscocolombia.desarrollando.co/)
- **Articulación solidaria:** Opera de manera complementaria y en articulación con [ColombiaTeBusca](https://colombiatebusca.com) para maximizar la difusión y centralizar reportes humanitarios sin duplicar esfuerzos.`,
    'Rescate',
    'general',
    'Nacional',
    'en_accion',
    'https://tebuscocolombia.desarrollando.co/',
    0,
    defaultAdminEmail,
    1
  );

  // 5. Alertas Preventivas Institucionales
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

  console.log('✅ [DB Seed] Seed limpio y oficial completado con éxito.');
  db.close();
}

if (require.main === module || process.argv[1]?.includes('seed')) {
  runSeed();
}

module.exports = { runSeed };
