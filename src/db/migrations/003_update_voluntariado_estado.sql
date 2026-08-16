-- ==========================================================
-- ACTUALIZACIÓN DEL ESTADO DE VOLUNTARIADO (MODERACIÓN)
-- ==========================================================
PRAGMA foreign_keys=off;

CREATE TABLE IF NOT EXISTS voluntariado_profesional_new (
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

INSERT OR IGNORE INTO voluntariado_profesional_new 
SELECT id, tipo, area_profesional, titulo_necesidad, descripcion, nombre_contacto, email_contacto, telefono_contacto, ubicacion, estado, creado_en 
FROM voluntariado_profesional;

DROP TABLE voluntariado_profesional;

ALTER TABLE voluntariado_profesional_new RENAME TO voluntariado_profesional;

CREATE INDEX IF NOT EXISTS idx_voluntariado_area_tipo ON voluntariado_profesional(area_profesional, tipo);
CREATE INDEX IF NOT EXISTS idx_voluntariado_estado ON voluntariado_profesional(estado);

PRAGMA foreign_keys=on;
