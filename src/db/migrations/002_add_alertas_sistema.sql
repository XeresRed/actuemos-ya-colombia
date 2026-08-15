-- ==========================================================
-- GESTIÓN DINÁMICA DE ALERTAS DE EMERGENCIA
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

CREATE INDEX IF NOT EXISTS idx_alertas_activa ON alertas_sistema(activa, actualizado_en DESC);
