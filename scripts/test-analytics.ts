import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { runMigrations } from '../src/db/migrate';
import { AnalyticsRepository, UsuarioRepository } from '../src/db/repositories';
import { AnalyticsService, AuthService } from '../src/core/services';
import { POST as trackRoute } from '../src/app/api/analytics/track/route';
import { GET as statsRoute } from '../src/app/api/analytics/stats/route';
import { GET as realtimeRoute } from '../src/app/api/analytics/realtime/route';
import { ForbiddenError, UnauthorizedError } from '../src/core/errors';

function setupMemoryDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

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

async function runAnalyticsTests() {
  console.log('🧪 Iniciando pruebas unitarias e integración de In-House Analytics & Telemetría...\n');

  // Asegurar que la base de datos singleton tenga todas las migraciones ejecutadas
  runMigrations();

  // 1. Probar Base de Datos en Memoria y Repositorio DAL
  console.log('🔹 Probando AnalyticsRepository (DAL en memoria)...');
  const memDb = setupMemoryDb();

  // Registrar visitas de prueba
  const visit1 = AnalyticsRepository.recordVisit(
    {
      path: '/ideas',
      sessionId: 'sess_123',
      metodo: 'GET',
      codigoEstado: 200,
      tiempoRespuestaMs: 45,
      origenReferencia: 'WhatsApp',
      tipoDispositivo: 'mobile',
      navegador: 'Safari',
      sistemaOperativo: 'iOS',
      pais: 'Colombia',
      ipHash: 'hash_user_alpha',
      esPagina: true,
    },
    memDb
  );

  assert(visit1.id !== undefined, 'Visita creada tiene ID');
  assert(visit1.path === '/ideas', 'Guarda ruta visitada');
  assert(visit1.tipoDispositivo === 'mobile', 'Guarda tipo de dispositivo');

  const visit2 = AnalyticsRepository.recordVisit(
    {
      path: '/voluntarios',
      sessionId: 'sess_456',
      metodo: 'GET',
      codigoEstado: 200,
      tiempoRespuestaMs: 30,
      origenReferencia: 'Google Search',
      tipoDispositivo: 'desktop',
      navegador: 'Google Chrome',
      sistemaOperativo: 'Windows',
      pais: 'Colombia',
      ipHash: 'hash_user_beta',
      esPagina: true,
    },
    memDb
  );

  const apiHit = AnalyticsRepository.recordVisit(
    {
      path: '/api/ideas',
      sessionId: 'sess_123',
      metodo: 'POST',
      codigoEstado: 201,
      tiempoRespuestaMs: 85,
      origenReferencia: 'Directo / Navegación Interna',
      tipoDispositivo: 'mobile',
      navegador: 'Safari',
      sistemaOperativo: 'iOS',
      pais: 'Colombia',
      ipHash: 'hash_user_alpha',
      esPagina: false,
    },
    memDb
  );

  // Registrar evento de interacción
  const event1 = AnalyticsRepository.recordEvent(
    {
      nombreEvento: 'idea_creada',
      categoria: 'conversion',
      etiqueta: 'Salud',
      valorNumerico: 1,
      metadatos: { categoria: 'Salud', urgente: true },
      path: '/ideas/nueva',
      ipHash: 'hash_user_alpha',
    },
    memDb
  );

  assert(event1.id !== undefined, 'Evento creado con ID');
  assert(event1.nombreEvento === 'idea_creada', 'Guarda nombre del evento');
  assert(event1.categoria === 'conversion', 'Guarda categoría de evento');

  // Comprobar KPIs de resumen
  const kpis = AnalyticsRepository.getSummaryKPIs('24h', memDb);
  assert(kpis.totalVistas === 2, 'KPI totalVistas cuenta solo es_pagina = 1 (2 vistas)');
  assert(kpis.visitantesUnicos === 2, 'KPI visitantesUnicos cuenta hashes distintos (2)');
  assert(kpis.totalEventos === 1, 'KPI totalEventos cuenta 1 evento');
  assert(kpis.usuariosActivosAhora >= 2, 'Visitantes activos en tiempo real >= 2');

  // Comprobar Top Pages
  const topPages = AnalyticsRepository.getTopPages(10, '24h', memDb);
  assert(topPages.length === 2, 'Retorna 2 páginas visitadas');
  assert(topPages.some((p) => p.path === '/ideas') && topPages.some((p) => p.path === '/voluntarios'), 'TopPages contiene /ideas y /voluntarios');

  // Comprobar Top Referrers
  const topReferrers = AnalyticsRepository.getTopReferrers(10, '24h', memDb);
  assert(topReferrers.length >= 2, 'Retorna fuentes de tráfico');
  assert(topReferrers.some((r) => r.origen === 'WhatsApp'), 'Identifica WhatsApp como fuente de tráfico');

  // Comprobar Device Breakdown
  const devices = AnalyticsRepository.getDeviceBreakdown('24h', memDb);
  assert(devices.dispositivos.length === 2, 'Desglosa dispositivos mobile y desktop');
  assert(devices.navegadores.some((n) => n.nombre === 'Safari'), 'Desglosa navegadores');

  // Comprobar Network Performance
  const netPerf = AnalyticsRepository.getNetworkPerformance('24h', memDb);
  assert(netPerf.totalSolicitudes === 3, 'Telemetría de red cuenta todas las solicitudes (3)');
  assert(netPerf.codigosEstado.exitos2xx === 3, '3 solicitudes con status 2xx');

  // Comprobar Top Events
  const topEvents = AnalyticsRepository.getTopEvents(10, '24h', memDb);
  assert(topEvents.length === 1 && topEvents[0].nombreEvento === 'idea_creada', 'Top events incluye idea_creada');

  // Comprobar Live Feed
  const liveFeed = AnalyticsRepository.getLiveTrafficFeed(10, memDb);
  assert(liveFeed.length === 3, 'Live stream feed retorna 3 solicitudes');

  // 2. Probar AnalyticsService (Lógica de Negocio & Privacidad)
  console.log('\n🔹 Probando AnalyticsService (Privacidad & Parsing)...');

  // IP Anonymization test
  const ip1 = '190.24.120.45';
  const hash1 = AnalyticsService.anonymizeIp(ip1);
  const hash2 = AnalyticsService.anonymizeIp(ip1);
  assert(hash1 === hash2, 'Hash de IP es determinista para el mismo día');
  assert(hash1.length === 16, 'Hash de IP está truncado a 16 caracteres para prevenir reidentificación');
  assert(!hash1.includes(ip1), 'El hash no revela la IP original');

  // User-Agent Parsing
  const mobileUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
  const desktopUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  assert(AnalyticsService.parseDeviceType(mobileUa) === 'mobile', 'Detecta dispositivo móvil iPhone');
  assert(AnalyticsService.parseBrowser(mobileUa) === 'Safari', 'Detecta navegador Safari');
  assert(AnalyticsService.parseOperatingSystem(mobileUa) === 'iOS', 'Detecta sistema operativo iOS');

  assert(AnalyticsService.parseDeviceType(desktopUa) === 'desktop', 'Detecta dispositivo desktop Windows');
  assert(AnalyticsService.parseBrowser(desktopUa) === 'Google Chrome', 'Detecta navegador Chrome');
  assert(AnalyticsService.parseOperatingSystem(desktopUa) === 'Windows', 'Detecta sistema operativo Windows');

  // Referrer normalization
  assert(AnalyticsService.normalizeReferrer('https://www.google.com/search?q=ayuda') === 'Google Search', 'Normaliza Google Search');
  assert(AnalyticsService.normalizeReferrer('https://api.whatsapp.com/send?text=123') === 'WhatsApp', 'Normaliza WhatsApp');
  assert(AnalyticsService.normalizeReferrer('https://t.co/xyz123') === 'X (Twitter)', 'Normaliza X (Twitter)');
  assert(AnalyticsService.normalizeReferrer(null) === 'Directo / Orgánico', 'Null referrer normaliza a Directo / Orgánico');

  // Service Role Security Gate
  try {
    AnalyticsService.getDashboardAnalytics('24h', undefined);
    assert(false, 'Debe fallar sin autenticación');
  } catch (err) {
    assert(err instanceof UnauthorizedError, 'Lanza UnauthorizedError para llamadas anónimas');
  }

  // 3. Probar Endpoints API (/api/analytics/track, /api/analytics/stats, /api/analytics/realtime)
  console.log('\n🔹 Probando Rutas API de Analítica...');

  const admin = UsuarioRepository.findByEmail('admin@actuemosya.org') || UsuarioRepository.create({
    email: 'admin@actuemosya.org',
    nombre: 'Super Administrador',
    rol: 'admin',
    activo: true,
  });

  const adminToken = AuthService.createSessionToken({
    userId: admin.id,
    email: admin.email,
    rol: admin.rol,
  });

  // POST /api/analytics/track (Pageview)
  const trackReq1 = new NextRequest('http://localhost:3000/api/analytics/track', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': mobileUa,
      'x-forwarded-for': '181.129.50.10',
    },
    body: JSON.stringify({
      type: 'pageview',
      path: '/busqueda',
      referrer: 'https://whatsapp.com',
      tiempoRespuestaMs: 22,
    }),
  });

  const trackRes1 = await trackRoute(trackReq1);
  const trackJson1 = await trackRes1.json() as any;
  assert(trackRes1.status === 200 && trackJson1.ok === true, 'POST /api/analytics/track registra pageview con éxito');

  // POST /api/analytics/track (Custom Event)
  const trackReq2 = new NextRequest('http://localhost:3000/api/analytics/track', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': desktopUa,
      'x-forwarded-for': '186.84.100.22',
    },
    body: JSON.stringify({
      type: 'event',
      path: '/busqueda',
      nombreEvento: 'clic_llamar_123',
      categoria: 'emergencia',
      etiqueta: 'Linea 123 Nacional',
    }),
  });

  const trackRes2 = await trackRoute(trackReq2);
  const trackJson2 = await trackRes2.json() as any;
  assert(trackRes2.status === 200 && trackJson2.ok === true, 'POST /api/analytics/track registra evento personalizado');

  // GET /api/analytics/stats (Protegido con Token)
  const statsReq = new NextRequest('http://localhost:3000/api/analytics/stats?timeframe=24h', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });

  const statsRes = await statsRoute(statsReq);
  const statsJson = await statsRes.json() as any;
  assert(statsRes.status === 200 && statsJson.ok === true, 'GET /api/analytics/stats retorna métricas completas para admin');
  assert(statsJson.data.kpis !== undefined, 'statsJson contiene objeto kpis');
  assert(Array.isArray(statsJson.data.topPages), 'statsJson contiene array topPages');
  assert(Array.isArray(statsJson.data.devices.dispositivos), 'statsJson contiene desglose de dispositivos');

  // 4. Probar Restricción Estricta RBAC (Supervisor NO puede ver analíticas)
  console.log('\n🔹 Probando Restricción RBAC (Supervisores reciben 403 Forbidden)...');
  
  const supervisorUser = UsuarioRepository.findByEmail('supervisor.test@actuemosya.org') || UsuarioRepository.create({
    email: 'supervisor.test@actuemosya.org',
    nombre: 'Supervisor Moderador',
    rol: 'supervisor',
    activo: true,
  });

  const supervisorToken = AuthService.createSessionToken({
    userId: supervisorUser.id,
    email: supervisorUser.email,
    rol: supervisorUser.rol,
  });

  // Service layer check
  try {
    AnalyticsService.getDashboardAnalytics('24h', 'supervisor');
    assert(false, 'Supervisor no debe tener permiso en AnalyticsService.getDashboardAnalytics');
  } catch (err) {
    assert(err instanceof ForbiddenError, 'AnalyticsService lanza ForbiddenError a supervisor');
  }

  // API Route check /api/analytics/stats
  const supStatsReq = new NextRequest('http://localhost:3000/api/analytics/stats?timeframe=24h', {
    headers: { 'Authorization': `Bearer ${supervisorToken}` },
  });
  const supStatsRes = await statsRoute(supStatsReq);
  const supStatsJson = await supStatsRes.json() as any;
  assert(supStatsRes.status === 403 && supStatsJson.ok === false, 'GET /api/analytics/stats devuelve HTTP 403 a supervisor');

  // API Route check /api/analytics/realtime
  const supRtReq = new NextRequest('http://localhost:3000/api/analytics/realtime', {
    headers: { 'Authorization': `Bearer ${supervisorToken}` },
  });
  const supRtRes = await realtimeRoute(supRtReq);
  const supRtJson = await supRtRes.json() as any;
  assert(supRtRes.status === 403 && supRtJson.ok === false, 'GET /api/analytics/realtime devuelve HTTP 403 a supervisor');

  // 5. Probar Rolling Session (Renovación continua de cookie de 30 días)
  console.log('\n🔹 Probando Rolling Session (Auto-renovación de cookie auth_session)...');
  const { GET: getSessionRoute } = await import('../src/app/api/auth/session/route');
  const sessionReq = new NextRequest('http://localhost:3000/api/auth/session', {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const sessionRes = await getSessionRoute(sessionReq);
  const sessionJson = await sessionRes.json() as any;
  assert(sessionRes.status === 200 && sessionJson.ok === true, 'GET /api/auth/session responde HTTP 200');
  assert(sessionJson.data.authenticated === true, 'Sesión autenticada correctamente');
  const setCookie = sessionRes.headers.get('set-cookie');
  assert(Boolean(setCookie && setCookie.includes('auth_session=') && setCookie.includes('Max-Age=2592000')), 'GET /api/auth/session renueva cookie auth_session por 30 días (2592000s)');

  console.log('\n✨ ¡Todas las pruebas unitarias e integración de In-House Analytics, RBAC y Rolling Session pasaron exitosamente (100% OK)!');
}

runAnalyticsTests().catch((err) => {
  console.error('💥 Error en la suite de pruebas de Analytics:', err);
  process.exit(1);
});
