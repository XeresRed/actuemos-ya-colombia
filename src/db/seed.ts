import { getDb } from './client';
import { runMigrations } from './migrate';

export function runSeed() {
  console.log('🌱 Iniciando seed de datos para SQLite...');
  runMigrations();
  const db = getDb();

  // 1. Usuarios
  const defaultAdminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@actuemosya.org').trim().toLowerCase();
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO usuarios (id, email, nombre, rol, activo)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-1', defaultAdminEmail, 'Super Administrador', 'admin', 1);
  insertUser.run('usr-2', 'supervisor@actuemosya.org', 'Supervisor General', 'supervisor', 1);
  insertUser.run('usr-3-pending', 'postulante@voluntarios.org', 'Carlos Postulante', 'supervisor', 0);

  // 2. Ideas
  const insertIdea = db.prepare(`
    INSERT OR REPLACE INTO ideas (
      id, titulo, descripcion_markdown, categoria, alcance_tipo, alcance_detalle, estado, iniciativa_existente_url, es_anonimo, email_creador, verificado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIdea.run(
    'idea-1',
    'Red de Purificación de Agua Comunitaria en Zonas Aisladas',
    'Instalación de filtros potabilizadores solares de rápida acción en comunidades rurales sin acceso al acueducto tras el sismo.\n\n### Objetivos\n1. Proveer 5,000 litros diarios de agua potable.\n2. Capacitar a líderes locales en mantenimiento.\n3. Coordinar con brigadas de la Defensa Civil.',
    'Salud y Agua',
    'region',
    'Valle del Cauca y Nariño',
    'promovida',
    null,
    0,
    'contacto@aguavida.org',
    1
  );

  insertIdea.run(
    'idea-2',
    'Brigada Móvil de Apoyo Psicológico Infantil Post-Trauma',
    'Equipo interdisciplinario de psicólogos y terapeutas para atender niños y familias en albergues temporales de la zona centro.',
    'Salud Mental',
    'ciudad',
    'Pasto',
    'en_accion',
    null,
    0,
    'brigadas@psicologoscolombia.org',
    1
  );

  insertIdea.run(
    'idea-3',
    'Censo Digital Geo-referenciado de Familias Damnificadas',
    'Herramienta móvil offline para empadronar familias y mapear necesidades críticas en tiempo real.',
    'Logística',
    'general',
    'Nacional',
    'redirigida',
    'https://cruzrojacolombiana.org/censo-nacional',
    0,
    'civictech@colombia.co',
    1
  );

  insertIdea.run(
    'idea-4',
    'Comedores Comunitarios Móviles con Alimentos Calientes',
    'Despliegue de cocinas móviles alimentadas por gas propano para distribuir 1,200 raciones diarias a damnificados y rescatistas.',
    'Víveres',
    'ciudad',
    'Popayán',
    'idea',
    null,
    1,
    null,
    0
  );

  insertIdea.run(
    'idea-5',
    'Refugios Temporales Modulares de Ensamblaje Rápido',
    'Estructuras de madera inmunizada y lona impermeable armables en 3 horas para familias que perdieron su vivienda.',
    'Albergue',
    'region',
    'Cauca',
    'borrador',
    null,
    1,
    null,
    0
  );

  // 3. Comentarios
  const insertComment = db.prepare(`
    INSERT OR REPLACE INTO comentarios (
      id, idea_id, comentario_padre_id, contenido_markdown, es_anonimo, autor_email, verificado, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertComment.run(
    'com-1',
    'idea-1',
    null,
    'Contamos con 10 filtros de membrana donados por la Universidad del Valle listos para despacho. ¿Cómo coordinamos el transporte seguro?',
    0,
    'laboratorio@univalle.edu.co',
    1,
    'visible'
  );

  insertComment.run(
    'com-2',
    'idea-1',
    'com-1',
    'Excelente iniciativa. Desde la Defensa Civil podemos incluirlos en el convoy que sale mañana a las 06:00 AM desde Cali.',
    0,
    'operaciones@defensacivil.gov.co',
    1,
    'visible'
  );

  // 4. Iniciativas Activas y Canales Oficiales
  const insertInitiative = db.prepare(`
    INSERT OR REPLACE INTO iniciativas_activas (
      id, nombre, descripcion, categoria, url_oficial, contacto, cobertura_geografica, estado_operacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

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
    'Cruz Roja Colombiana — Búsqueda de Familiares (RCF)',
    'Atención prehospitalaria, albergues temporales y canal formal de Restablecimiento del Contacto entre Familiares (RCF).',
    'organismo_oficial',
    'https://cruzrojacolombiana.org',
    'Línea 132 / +57 601 4376300',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-oficial-3',
    'Unidad para las Víctimas — Plataforma RUV',
    'Orientación humanitaria, atención prioritaria y Registro Único de Víctimas (RUV) ante emergencias.',
    'organismo_oficial',
    'https://www.unidadvictimas.gov.co/',
    '018000 911119',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-oficial-4',
    'Defensa Civil Colombiana — Rescate y Albergues',
    'Operaciones de búsqueda, rescate y soporte logístico en zonas de impacto.',
    'organismo_oficial',
    'https://www.defensacivil.gov.co/',
    'Línea 144 / +57 601 3199000',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-1',
    'Cruz Roja Colombiana - Operación Rescate Sismo',
    'Atención médica prehospitalaria, rescate en estructuras colapsadas y distribución de kits humanitarios de emergencia.',
    'Salud y Rescate',
    'https://cruzrojacolombiana.org',
    '+57 601 4376300',
    'Nacional',
    'activa'
  );

  insertInitiative.run(
    'ini-2',
    'Techo Colombia - Refugios Transitorios de Emergencia',
    'Construcción acelerada de viviendas modulares de emergencia para familias en extrema vulnerabilidad.',
    'Vivienda',
    'https://colombia.techo.org',
    'emergencia@techo.org',
    'Departamental (Cauca, Nariño)',
    'activa'
  );

  insertInitiative.run(
    'ini-3',
    'Banco de Alimentos de Colombia (ÁBACO)',
    'Acopio y distribución de víveres no perecederos, agua embotellada y productos de aseo prioritarios.',
    'Víveres',
    'https://abaco.org.co',
    'donaciones@abaco.org.co',
    'Nacional',
    'activa'
  );

  // 5. Reportes de Búsqueda
  const insertSearch = db.prepare(`
    INSERT OR REPLACE INTO reportes_busqueda (
      id, tipo, nombre, especie, descripcion_rasgos, ubicacion, foto_url, estado, contacto_emergencia, verificado_por_supervisor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSearch.run(
    'rep-1',
    'persona',
    'Carlos Andrés Mendoza',
    null,
    '34 años, estatura 1.75m, camiseta azul oscuro, jean gris. Visto por última vez cerca al Parque Caldas.',
    'Popayán, Cauca',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'buscado',
    '+57 312 4567890',
    1
  );

  insertSearch.run(
    'rep-2',
    'persona',
    'María Elena Gómez',
    null,
    '62 años, cabello corto castaño, vestía saco de lana rojo. Localizada en albergue con atención médica.',
    'Pasto, Nariño - Albergue Estadio Libertad',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'en_refugio',
    '+57 315 9876543',
    1
  );

  insertSearch.run(
    'rep-3',
    'animal',
    'Rocky',
    'Perro Labrador mestizo',
    'Color dorado claro, collar rojo sin placa, mancha blanca en el pecho. Muy dócil.',
    'Popayán, Barrio Bolívar',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    'perdido',
    '+57 300 1122334',
    1
  );

  insertSearch.run(
    'rep-4',
    'animal',
    'Luna',
    'Gata Siamesa',
    'Ojos azules intensos, rescatada de escombros en sector Los Sauces. Se encuentra bajo cuidado veterinario.',
    'Pasto, Clínica Veterinaria Municipal',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
    'rescatado',
    '+57 318 5544332',
    1
  );

  // 6. Voluntariado Profesional
  const insertVolunteer = db.prepare(`
    INSERT OR REPLACE INTO voluntariado_profesional (
      id, tipo, area_profesional, titulo_necesidad, descripcion, nombre_contacto, email_contacto, telefono_contacto, ubicacion, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVolunteer.run(
    'vol-1',
    'ofrezco_habilidad',
    'Medicina de Urgencias',
    'Médico especialista con disponibilidad para turnos de 12 horas en puestos de salud avanzados',
    '10 años de experiencia en trauma y emergencias hospitalarias. Disponibilidad inmediata para trasladarme a la zona afectada.',
    'Dra. Camila Restrepo',
    'camilarestrepo.med@gmail.com',
    '+57 311 2233445',
    'Popayán y alrededores',
    'activo'
  );

  insertVolunteer.run(
    'vol-2',
    'busco_profesional',
    'Ingeniería Civil / Estructural',
    'Se requieren 4 ingenieros estructurales para inspección rápida de habitabilidad en escuelas y viviendas',
    'Coordinación con la Secretaría de Infraestructura para realizar dictámenes técnicos de habitabilidad post-sismo.',
    'Comité de Emergencia Departamental',
    'infraestructura@cauca.gov.co',
    '+57 602 8240000',
    'Pasto y Municipios Aledaños',
    'activo'
  );

  insertVolunteer.run(
    'vol-3',
    'ofrezco_habilidad',
    'Psicología de Crisis / Primeros Auxilios Psicológicos',
    'Atención psicológica remota y presencial para primeros auxilios psicológicos',
    'Especialista en duelo y trauma comunitario. Disponibilidad de 20 horas semanales.',
    'David Valencia',
    'david.valencia.psi@gmail.com',
    '+57 320 8899776',
    'Remoto / Popayán',
    'activo'
  );

  insertVolunteer.run(
    'vol-4-pending',
    'ofrezco_habilidad',
    'Operario de Drones / Sensores Térmicos',
    'Piloto de drones con cámara termográfica para búsqueda de personas',
    'Equipo DJI Matrice 300 con sensor térmico y autonomía de 4 baterías para rastreo nocturno.',
    'Andrés Barreto',
    'andres.drones@aereo.co',
    '+57 318 7766554',
    'Valle del Cauca y Cauca',
    'pendiente'
  );

  // 7. Alertas de Emergencia del Sistema
  const insertAlert = db.prepare(`
    INSERT OR REPLACE INTO alertas_sistema (
      id, nivel, mensaje, activa, enlace_accion_url, enlace_accion_texto, actualizado_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAlert.run(
    'alert-1',
    'critica',
    'ALERTA CRÍTICA: Desastre natural en desarrollo. Por favor, siga las instrucciones de los organismos de socorro y reporte cualquier emergencia.',
    1,
    'http://portal.gestiondelriesgo.gov.co/',
    'Ver Comunicado Oficial UNGRD',
    'admin@actuemosya.org'
  );

  console.log('✅ Seed completado con éxito.');
}

if (require.main === module || process.argv[1]?.includes('seed')) {
  runSeed();
}

