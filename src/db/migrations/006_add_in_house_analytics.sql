-- ==============================================================================
-- Migración 006: In-House Privacy-First Analytics & Network Traffic Telemetry
-- ==============================================================================

-- 1. Tabla de Visitas y Tráfico de Red (Pageviews / API Requests)
CREATE TABLE IF NOT EXISTS analytics_visitas (
  id TEXT PRIMARY KEY,
  session_id TEXT,                              -- ID de sesión anónimo efímero
  path TEXT NOT NULL,                           -- Ruta visitada o endpoint
  metodo TEXT DEFAULT 'GET',                    -- GET, POST, PATCH, DELETE, etc.
  codigo_estado INTEGER DEFAULT 200,            -- 200, 201, 400, 404, 500, etc.
  tiempo_respuesta_ms INTEGER DEFAULT 0,        -- Latencia en ms
  origen_referencia TEXT,                       -- Referrer (directo, google, whatsapp, twitter, facebook, etc.)
  tipo_dispositivo TEXT DEFAULT 'desktop',      -- mobile, desktop, tablet, bot
  navegador TEXT DEFAULT 'desconocido',         -- Chrome, Safari, Firefox, Edge, etc.
  sistema_operativo TEXT DEFAULT 'desconocido', -- Android, iOS, Windows, macOS, Linux, etc.
  pais TEXT DEFAULT 'Colombia',                 -- País / Región
  ip_hash TEXT NOT NULL,                        -- Hash SHA256 con sal para total privacidad (Habeas Data)
  es_pagina INTEGER NOT NULL DEFAULT 1,         -- 1: Pageview de usuario, 0: Solicitud de red / API
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Eventos de Conversión e Interacción
CREATE TABLE IF NOT EXISTS analytics_eventos (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  nombre_evento TEXT NOT NULL,                  -- ej: 'idea_creada', 'compartir_whatsapp', 'clic_linea_123'
  categoria TEXT NOT NULL DEFAULT 'interaccion',-- 'conversion', 'interaccion', 'emergencia', 'navegacion'
  etiqueta TEXT,                                -- Metadato descriptivo
  valor_numerico REAL,                          -- Valor numérico opcional
  metadatos_json TEXT,                          -- Objeto JSON con detalles adicionales
  path TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices de alto rendimiento para consultas agregadas y streaming en tiempo real (<2ms)
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_creado ON analytics_visitas(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_path ON analytics_visitas(path);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_es_pagina ON analytics_visitas(es_pagina, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_ip ON analytics_visitas(ip_hash, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_dispositivo ON analytics_visitas(tipo_dispositivo);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_referencia ON analytics_visitas(origen_referencia);
CREATE INDEX IF NOT EXISTS idx_analytics_visitas_estado ON analytics_visitas(codigo_estado);

CREATE INDEX IF NOT EXISTS idx_analytics_eventos_creado ON analytics_eventos(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_nombre ON analytics_eventos(nombre_evento, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_eventos_categoria ON analytics_eventos(categoria, creado_en DESC);
