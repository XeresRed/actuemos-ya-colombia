-- ==========================================================
-- 007_add_direccion_fecha_to_iniciativas.sql
-- Agrega soporte para dirección física y fecha/hora de evento
-- ==========================================================

ALTER TABLE iniciativas_activas ADD COLUMN direccion TEXT;
ALTER TABLE iniciativas_activas ADD COLUMN fecha_evento TEXT;
