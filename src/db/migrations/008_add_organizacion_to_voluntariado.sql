-- ==========================================================
-- 008_add_organizacion_to_voluntariado.sql
-- Agrega columna opcional de organización a voluntariado profesional
-- ==========================================================

ALTER TABLE voluntariado_profesional ADD COLUMN organizacion TEXT;
