# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1-beta-2] - 2026-08-15

### Agregado
- **Lógica de Negocio y Dominio (Fase 1 - REQ-01 & REQ-02):**
  - Jerarquía centralizada de errores en `src/core/errors/index.ts` (`AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `DatabaseError`).
  - Capa de dominio puro con tipos e interfaces TypeScript en `src/core/domain/` (`idea`, `usuario`, `auth`, `comentario`, `iniciativa`, `busqueda`, `voluntariado`, `alerta`).
  - Capa de acceso a datos (DAL) con 8 repositorios en `src/db/repositories/` (`IdeaRepository`, `UsuarioRepository`, `AuthRepository`, `ComentarioRepository`, `IniciativaRepository`, `BusquedaRepository`, `VoluntariadoRepository`, `AlertaRepository`) usando Prepared Statements y transacciones atómicas.
  - Suite de pruebas unitarias en memoria SQLite (`scripts/test-dal.ts`).
- **Servicios de Negocio (Fase 2 - REQ-03):**
  - `SanitizeService`: Sanitización estricta contra ataques XSS en contenido Markdown/HTML y fuerza `rel="noopener noreferrer nofollow"`.
  - `CaptchaService`: Verificación de tokens anti-bot (reCAPTCHA v3 / Turnstile) con bypass seguro en desarrollo/test.
  - `EmailService`: Envío de correos transaccionales para OTP y Magic Links con soporte Resend/SMTP y fallback a consola.
  - `AuthService`: Generación y validación de OTPs (6 dígitos, 15m), Magic Links temporales y tokens de sesión stateless firmados con HMAC-SHA256.
  - `IdeaService`: Pipeline determinista de estados (`borrador` -> `idea` -> `promovida` -> `en_accion` -> `cerrada` / `redirigida`), soporte anónimo y verificación de OTP.
  - `IniciativaService`, `BusquedaService`, `VoluntariadoService` y `AlertaService`: Casos de uso completos para matching, reporte de desaparecidos y alertas de crisis.
  - Suite de pruebas unitarias de servicios en `scripts/test-services.ts`.
- **Controladores y Rutas API (Fase 3 - REQ-04):**
  - Formato unificado de respuesta JSON en `src/lib/api-response.ts` (`apiSuccess`, `apiError`).
  - Guardas de autenticación y sesión en `src/lib/api-auth.ts` con soporte dual (Cookie HttpOnly `auth_session` y Header `Authorization: Bearer`).
  - Limitador de tasa en memoria por IP en `src/lib/rate-limit.ts` (15 req/min en POST, 60 req/min en GET).
  - Validaciones de entrada estrictas con esquemas Zod en `src/lib/validations/index.ts`.
  - Rutas RESTful en `src/app/api/`: `/api/ideas`, `/api/ideas/[id]`, `/api/ideas/[id]/verify`, `/api/ideas/[id]/comentarios`, `/api/iniciativas`, `/api/busqueda`, `/api/busqueda/[id]`, `/api/voluntarios`, `/api/voluntarios/match`, `/api/alertas`, `/api/auth/magic-link/request`, `/api/auth/magic-link/verify`, `/api/auth/session`.
  - Suite de pruebas de integración de API en `scripts/test-api.ts`.
- **Diseño y Marca:**
  - Estilizado de la palabra **Colombia** en los títulos y logotipos con los colores de la bandera nacional: Amarillo Dorado (`#D97706`), Azul Confianza (`#005DB7`) y Rojo Acción (`#AF101A`).

---

## [0.0.1-beta-1] - 2026-08-15

### Agregado
- **Alerta de Emergencia Dinámica y Protocolo de Crisis:**
  - Especificación en `CONTEXT.md` del protocolo de alerta de alto impacto (`critica`, `alerta_naranja`, `informativa`) y articulación con el Sistema Nacional de Gestión del Riesgo (SNGRD).
  - Definición arquitectónica en `docs/ARCHITECTURE.md` para el ciclo de vida de alertas (`alerta.ts`, `alerta.service.ts`, `alerta.repository.ts`, `/api/alertas`) con lectura de zero-overhead en Server Components.
  - Adición de la tabla `alertas_sistema` e índice `idx_alertas_activa` en `docs/DATABASE.md` y migración incremental `002_add_alertas_sistema.sql`.
  - Especificaciones UI en `docs/DESIGN.md` para niveles de alerta visuales, pastillas de marcado rápido telefónico y tarjetas institucionales.
  - Actualización del diagrama MeR en `docs/diagrams/mer.md` con la entidad `ALERTAS_SISTEMA`.
- **Integración Multinivel de Canales Oficiales y Registro de Víctimas en Colombia:**
  - Enlaces y precarga oficial en base de datos (`src/db/seed.ts`) para:
    - **UNGRD:** Sala de Crisis y acceso al **RUND** (Registro Único Nacional de Damnificados).
    - **Cruz Roja Colombiana:** Programa **RCF** (Restablecimiento del Contacto Familiar) y línea 132.
    - **Unidad para las Víctimas:** Plataforma oficial del **RUV** (Registro Único de Víctimas).
    - **Defensa Civil Colombiana (144)** y **Bomberos (119)**.
  - Componente `EmergencyBanner` interactivo con soporte de severidad y selector desplegable de líneas de auxilio directo (`123`, `132`, `144`, `119`, `165`).
  - Bloque prioritario de *Fuentes Oficiales y Damnificados* en el Hub Principal (`/`).
  - Notice institucional de prevención y orientación a la Cruz Roja RCF en el módulo de búsqueda (`/busqueda`).
  - Enlaces oficiales permanentes en el `Footer` global.

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
