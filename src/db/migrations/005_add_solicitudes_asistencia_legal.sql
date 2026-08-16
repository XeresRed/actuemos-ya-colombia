-- ==============================================================================
-- Migración 005: Tabla para Solicitudes de Asistencia Legal y Derechos de Petición
-- ==============================================================================

CREATE TABLE IF NOT EXISTS solicitudes_asistencia_legal (
  id TEXT PRIMARY KEY,
  nombre_ciudadano TEXT NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'CC',
  cedula_ciudadano TEXT NOT NULL,
  email_contacto TEXT NOT NULL,
  telefono_contacto TEXT NOT NULL,
  departamento TEXT NOT NULL,
  municipio TEXT NOT NULL,
  direccion_fisica TEXT,
  asunto TEXT NOT NULL,
  hechos TEXT NOT NULL,
  peticiones TEXT NOT NULL,
  anexos TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente' | 'en_contacto' | 'atendida' | 'cerrada'
  abogado_asignado TEXT,
  notas_seguimiento TEXT,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_legal_estado ON solicitudes_asistencia_legal(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_legal_departamento ON solicitudes_asistencia_legal(departamento);
CREATE INDEX IF NOT EXISTS idx_solicitudes_legal_creado ON solicitudes_asistencia_legal(creado_en);
