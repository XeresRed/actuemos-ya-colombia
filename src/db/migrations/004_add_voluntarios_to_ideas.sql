-- ==============================================================================
-- Migración 004: Agregar campos de solicitud de voluntarios en propuestas
-- ==============================================================================
ALTER TABLE ideas ADD COLUMN requiere_voluntarios INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ideas ADD COLUMN cantidad_voluntarios INTEGER;
ALTER TABLE ideas ADD COLUMN perfil_voluntarios TEXT;
