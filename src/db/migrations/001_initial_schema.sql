-- ==========================================================
-- 1. GESTIÓN DE ACCESO, ROLES Y SESIONES (ADMIN / SUPERVISOR)
-- ==========================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    rol TEXT CHECK(rol IN ('admin', 'supervisor')) NOT NULL,
    activo INTEGER NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    codigo_hash TEXT NOT NULL,
    tipo TEXT CHECK(tipo IN ('login_admin', 'verificacion_idea', 'verificacion_comentario')) NOT NULL,
    referencia_id TEXT,
    expira_en DATETIME NOT NULL,
    usado INTEGER NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. BANCO DE IDEAS Y PROPUESTAS
-- ==========================================================
CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion_markdown TEXT NOT NULL,
    categoria TEXT NOT NULL,
    alcance_tipo TEXT CHECK(alcance_tipo IN ('general', 'region', 'ciudad', 'grupo_especifico')) NOT NULL DEFAULT 'general',
    alcance_detalle TEXT,
    estado TEXT CHECK(estado IN (
        'borrador',
        'idea',
        'promovida',
        'en_accion',
        'cerrada',
        'redirigida'
    )) NOT NULL DEFAULT 'borrador',
    iniciativa_existente_url TEXT,
    es_anonimo INTEGER NOT NULL DEFAULT 0,
    email_creador TEXT,
    verificado INTEGER NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. ESPACIO DE DEBATE Y COMENTARIOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS comentarios (
    id TEXT PRIMARY KEY,
    idea_id TEXT NOT NULL,
    comentario_padre_id TEXT,
    contenido_markdown TEXT NOT NULL,
    es_anonimo INTEGER NOT NULL DEFAULT 0,
    autor_email TEXT,
    verificado INTEGER NOT NULL DEFAULT 0,
    estado TEXT CHECK(estado IN ('visible', 'oculto', 'pendiente_moderacion')) NOT NULL DEFAULT 'visible',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_padre_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

-- ==========================================================
-- 4. DIRECTORIO DE INICIATIVAS ACTIVAS (ANTI-DUPLICACIÓN)
-- ==========================================================
CREATE TABLE IF NOT EXISTS iniciativas_activas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    url_oficial TEXT NOT NULL,
    contacto TEXT,
    cobertura_geografica TEXT,
    estado_operacion TEXT CHECK(estado_operacion IN ('activa', 'pausada', 'completada')) DEFAULT 'activa',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. BÚSQUEDA DE PERSONAS Y ANIMALES EXTRAVIADOS
-- ==========================================================
CREATE TABLE IF NOT EXISTS reportes_busqueda (
    id TEXT PRIMARY KEY,
    tipo TEXT CHECK(tipo IN ('persona', 'animal')) NOT NULL,
    nombre TEXT,
    especie TEXT,
    descripcion_rasgos TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    foto_url TEXT,
    estado TEXT CHECK(estado IN ('buscado', 'en_refugio', 'localizado', 'perdido', 'rescatado', 'en_hogar_temporal')) NOT NULL DEFAULT 'buscado',
    contacto_emergencia TEXT NOT NULL,
    verificado_por_supervisor INTEGER DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 6. MATCHING DE TALENTO Y VOLUNTARIADO PROFESIONAL
-- ==========================================================
CREATE TABLE IF NOT EXISTS voluntariado_profesional (
    id TEXT PRIMARY KEY,
    tipo TEXT CHECK(tipo IN ('ofrezco_habilidad', 'busco_profesional')) NOT NULL,
    area_profesional TEXT NOT NULL,
    titulo_necesidad TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    nombre_contacto TEXT NOT NULL,
    email_contacto TEXT NOT NULL,
    telefono_contacto TEXT,
    ubicacion TEXT,
    estado TEXT CHECK(estado IN ('pendiente', 'activo', 'cubierto', 'pausado', 'completado')) DEFAULT 'pendiente',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 7. GESTIÓN DINÁMICA DE ALERTAS DE EMERGENCIA
-- ==========================================================
CREATE TABLE IF NOT EXISTS alertas_sistema (
    id TEXT PRIMARY KEY,
    nivel TEXT CHECK(nivel IN ('critica', 'alerta_naranja', 'informativa')) NOT NULL DEFAULT 'critica',
    mensaje TEXT NOT NULL,
    activa INTEGER NOT NULL DEFAULT 1,
    enlace_accion_url TEXT,
    enlace_accion_texto TEXT,
    actualizado_por TEXT,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 8. ÍNDICES DE RENDIMIENTO Y CONCURRENCIA
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_ideas_estado ON ideas(estado);
CREATE INDEX IF NOT EXISTS idx_ideas_alcance ON ideas(alcance_tipo, alcance_detalle);
CREATE INDEX IF NOT EXISTS idx_ideas_creado_en ON ideas(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_comentarios_idea ON comentarios(idea_id, creado_en ASC);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo_estado ON reportes_busqueda(tipo, estado);
CREATE INDEX IF NOT EXISTS idx_reportes_ubicacion ON reportes_busqueda(ubicacion);
CREATE INDEX IF NOT EXISTS idx_voluntariado_area_tipo ON voluntariado_profesional(area_profesional, tipo);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_lookup ON auth_tokens(email, tipo, usado, expira_en);
CREATE INDEX IF NOT EXISTS idx_alertas_activa ON alertas_sistema(activa, actualizado_en DESC);

