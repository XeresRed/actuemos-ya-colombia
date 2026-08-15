# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1-beta] - 2026-08-14

### Agregado
- **Setup Inicial del Proyecto (REQ-01):**
  - Estructuración de jerarquía de carpetas basada en Next.js (App Router), TypeScript y Tailwind CSS.
  - Integración de tokens de diseño de `docs/DESIGN.md` (colores de acción/confianza, fuentes Montserrat e Inter, elevaciones y bordes).
  - Creación de `.gitignore` y `.dockerignore` configurados para el entorno.
- **Base de Datos y Modelado (REQ-02):**
  - Diagrama MeR en `docs/diagrams/mer.md` con las entidades del sistema (usuarios, auth_tokens, ideas, comentarios, iniciativas_activas, reportes_busqueda, voluntariado_profesional).
  - Inicialización de cliente SQLite con `better-sqlite3` en modo WAL (`PRAGMA busy_timeout = 5000;`).
  - Script DDL de esquema y migraciones con seed data inicial.
- **Maquetación de Prototipos de Referencia (REQ-03):**
  - Maquetación de 9 vistas de alta fidelidad según `docs/references/`:
    - `/` (Hub de Emergencia)
    - `/ideas` (Banco de Ideas)
    - `/ideas/nueva` (Publicar Nueva Idea)
    - `/ideas/[id]` (Detalle de Idea y Debate)
    - `/iniciativas` (Directorio de Iniciativas Activas)
    - `/busqueda` (Búsqueda Humanitaria y Mascotas)
    - `/voluntarios` (Matching de Voluntariado Profesional)
    - `/admin/login` (Acceso Administrativo Passwordless)
    - `/admin` (Panel de Control y Supervisión)
  - Cumplimiento de estándares de accesibilidad WCAG 2.2 y Server Components.
