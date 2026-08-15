# 🗄️ Modelo de Base de Datos SQLite: Plataforma de Respuesta Humanitaria

Este esquema está diseñado para operar eficientemente bajo Docker en un entorno con recursos limitados (1 GB RAM) , utilizando el modo **WAL (Write-Ahead Logging)**  y claves foráneas activas.

---

## 1. Configuración Inicial Recomendada (Pragmas)

Ejecuta estos comandos al inicializar la conexión con SQLite para maximizar rendimiento y consistencia:

```sql
-- Activar soporte para claves foráneas
PRAGMA foreign_keys = ON;

-- Modo WAL: permite lecturas simultáneas mientras se escribe
PRAGMA journal_mode = WAL;

-- Sincronización normal optimizada para rendimiento y seguridad en disco
PRAGMA synchronous = NORMAL;

-- Guardar tablas temporales en memoria
PRAGMA temp_store = MEMORY;

```

---

## 2. Esquema DDL Completo

```sql
-- ==========================================================
-- 1. GESTIÓN DE ACCESO, ROLES Y SESIONES (ADMIN / SUPERVISOR)
-- ==========================================================
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    rol TEXT CHECK(rol IN ('admin', 'supervisor')) NOT NULL,
    activo INTEGER NOT NULL DEFAULT 0,          -- 1: Aprobado por Admin, 0: Pendiente
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    codigo_hash TEXT NOT NULL,                  -- OTP o Token para Magic Link
    tipo TEXT CHECK(tipo IN ('login_admin', 'verificacion_idea', 'verificacion_comentario')) NOT NULL,
    referencia_id TEXT,                         -- ID de la idea o comentario si aplica
    expira_en DATETIME NOT NULL,
    usado INTEGER NOT NULL DEFAULT 0,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. BANCO DE IDEAS Y PROPUESTAS (CON SOPORTE MARKDOWN)
-- ==========================================================
CREATE TABLE ideas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion_markdown TEXT NOT NULL,         -- Contenido enriquecido en Markdown
    categoria TEXT NOT NULL,                    -- ej: 'Albergue', 'Salud', 'Rescate', 'Logística'
    
    -- Alcance y segmentación de la idea
    alcance_tipo TEXT CHECK(alcance_tipo IN ('general', 'region', 'ciudad', 'grupo_especifico')) NOT NULL DEFAULT 'general',
    alcance_detalle TEXT,                       -- ej: 'Valle del Cauca', 'Barrio Centro', 'Población con discapacidad'
    
    -- Flujo y ciclo de vida
    estado TEXT CHECK(estado IN (
        'borrador',     -- Enviado por anónimo, pendiente de moderación
        'idea',         -- Pública, abierta a debate
        'promovida',    -- Validada y lista para organizarse
        'en_accion',    -- Equipo u ONG ejecutándola
        'cerrada',      -- Finalizada o descartada
        'redirigida'    -- Ya existe una iniciativa activa
    )) NOT NULL DEFAULT 'borrador',
    
    iniciativa_existente_url TEXT,              -- Enlace a causa/app existente si es 'redirigida'
    
    -- Autoría y validación
    es_anonimo INTEGER NOT NULL DEFAULT 0,      -- 1: Anónimo, 0: Con correo
    email_creador TEXT,                         -- NULL si es anónimo
    verificado INTEGER NOT NULL DEFAULT 0,      -- 1: Correo validado por OTP
    
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. ESPACIO DE DEBATE Y COMENTARIOS
-- ==========================================================
CREATE TABLE comentarios (
    id TEXT PRIMARY KEY,
    idea_id TEXT NOT NULL,
    comentario_padre_id TEXT,                   -- Para permitir respuestas anidadas (hilos)
    contenido_markdown TEXT NOT NULL,
    
    -- Autoría
    es_anonimo INTEGER NOT NULL DEFAULT 0,
    autor_email TEXT,
    verificado INTEGER NOT NULL DEFAULT 0,      -- 1 si validó su correo para comentar
    
    -- Moderación
    estado TEXT CHECK(estado IN ('visible', 'oculto', 'pendiente_moderacion')) NOT NULL DEFAULT 'visible',
    
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_padre_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

-- ==========================================================
-- 4. DIRECTORIO DE INICIATIVAS ACTIVAS (EVITAR DUPLICAR)
-- ==========================================================
CREATE TABLE iniciativas_activas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    categoria TEXT NOT NULL,
    url_oficial TEXT NOT NULL,
    contacto TEXT,
    cobertura_geografica TEXT,                  -- ej: 'Nacional', 'Ciudad de México', etc.
    estado_operacion TEXT CHECK(estado_operacion IN ('activa', 'pausada', 'completada')) DEFAULT 'activa',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. BÚSQUEDA DE PERSONAS Y ANIMALES EXTRAVIADOS
-- ==========================================================
CREATE TABLE reportes_busqueda (
    id TEXT PRIMARY KEY,
    tipo TEXT CHECK(tipo IN ('persona', 'animal')) NOT NULL,
    
    -- Datos del sujeto
    nombre TEXT,
    especie TEXT,                               -- Solo si tipo == 'animal' (ej: 'perro', 'gato')
    descripcion_rasgos TEXT NOT NULL,
    ubicacion TEXT NOT NULL,                    -- Última ubicación vista o encontrada
    foto_url TEXT,
    
    -- Estado humanitario
    estado TEXT CHECK(estado IN ('buscado', 'en_refugio', 'localizado')) NOT NULL DEFAULT 'buscado',
    contacto_emergencia TEXT NOT NULL,
    verificado_por_supervisor INTEGER DEFAULT 0,
    
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 6. MATCHING DE TALENTO Y VOLUNTARIADO PROFESIONAL
-- ==========================================================
CREATE TABLE voluntariado_profesional (
    id TEXT PRIMARY KEY,
    tipo TEXT CHECK(tipo IN ('ofrezco_habilidad', 'busco_profesional')) NOT NULL,
    area_profesional TEXT NOT NULL,             -- ej: 'Arquitectura', 'Diseño Gráfico', 'Medicina'
    titulo_necesidad TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    nombre_contacto TEXT NOT NULL,
    email_contacto TEXT NOT NULL,
    telefono_contacto TEXT,
    ubicacion TEXT,
    estado TEXT CHECK(estado IN ('activo', 'cubierto', 'pausado')) DEFAULT 'activo',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

---

## 3. Índices de Rendimiento y Búsqueda Rápida

Los índices permiten que SQLite responda en milisegundos sin consumir exceso de memoria RAM ni procesador:

```sql
-- Índices para el Banco de Ideas
CREATE INDEX idx_ideas_estado ON ideas(estado);
CREATE INDEX idx_ideas_alcance ON ideas(alcance_tipo, alcance_detalle);
CREATE INDEX idx_ideas_creado_en ON ideas(creado_en DESC);

-- Índices para Comentarios
CREATE INDEX idx_comentarios_idea ON comentarios(idea_id, creado_en ASC);

-- Índices para Búsqueda Humanitaria y Mascotas
CREATE INDEX idx_reportes_tipo_estado ON reportes_busqueda(tipo, estado);
CREATE INDEX idx_reportes_ubicacion ON reportes_busqueda(ubicacion);

-- Índices para Voluntariado
CREATE INDEX idx_voluntariado_area_tipo ON voluntariado_profesional(area_profesional, tipo);

-- Índices para Autenticación y Verificación
CREATE INDEX idx_auth_tokens_lookup ON auth_tokens(email, tipo, usado, expira_en);

```

---

## 4. Resumen de Flujos Integrados en la Base de Datos

| Flujo | Estado Inicial | Acción Requerida | Estado Final |
| --- | --- | --- | --- |
| **Idea con Email** | `borrador` | Usuario valida el OTP recibido por correo.

 | <br>`idea` (Pública) 

 |
| **Idea Anónima** | <br>`borrador` 

 | Supervisor o Admin revisa y aprueba.

 | <br>`idea` (Pública) 

 |
| **Comentario** | `visible` / `pendiente` | Si supera reCAPTCHA se publica directamente.

 | `visible` |
| **Redirección** | <br>`idea` / `promovida` 

 | Se enlaza con `iniciativas_activas` mediante URL.

 | <br>`redirigida` 

 |

---
