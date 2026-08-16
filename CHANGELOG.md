# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.3-beta-1] - 2026-08-16

### Agregado
- **Centro de Articulación y Redirección en Búsquedas (`/busqueda`) (REQ-01):**
  - Rediseño integral de la página de búsqueda aplicando el principio de **no duplicidad y articulación estratégica**.
  - Tarjeta destacada de **Búsqueda de Personas Desaparecidas** con acceso directo a **[ColombiaTeBusca](https://colombiatebusca.com/?tab=persons)** y al programa formal **RCF (Restablecimiento del Contacto entre Familiares) de la Cruz Roja Colombiana**.
  - Tarjeta destacada de **Mascotas, Refugios y Veterinaria** con acceso directo a **[MiGenteVe Colombia](https://colombia.migenteve.com/)**, directorio de albergues y red de atención médica animal.
  - **Protocolo de Acción Inmediata (Primeras 24-48 horas)**: Guía cívica paso a paso con advertencia de seguridad para prevención de falsas llamadas de rescate/extorsión.
  - **Directorio de Líneas Telefónicas Directas de Emergencia**: Marcado con 1 clic para Línea 123, Cruz Roja 132, Defensa Civil 144 y Medicina Legal.

- **Sincronización Transversal de Iniciativas y Limpieza de Semilla (REQ-02, REQ-03):**
  - Registro de ColombiaTeBusca y MiGenteVe Colombia en [`src/db/seed.ts`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/db/seed.ts) y en el Directorio Activo (`/iniciativas`).
  - Depuración completa de datos simulados en la base de datos de arranque: las tablas de propuestas comunitarias, comentarios, reportes y voluntariado inician limpias para recibir exclusivamente aportes reales de la ciudadanía en staging y producción.

---

## [0.0.2-beta-2] - 2026-08-16

### Agregado
- **Acciones de Descarte y Cierre en Panel Administrativo (REQ-01):**
  - Botón *"Descartar / Cerrar"* en la pestaña de Borradores de Ideas de `/admin`, archivando propuestas inviables como `cerrada` y retirándolas de la cola de revisión.
  - Botón *"Rechazar Postulación"* en la pestaña de Supervisores de `/admin`, permitiendo a los administradores descartar y eliminar postulantes inactivos.
  - Botón *"Revocar / Eliminar"* en el listado de Supervisores Activos para retirar permisos de acceso.

- **Protección Anti-Bot con Cloudflare Turnstile (REQ-02):**
  - Componente oficial [`TurnstileWidget.tsx`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/components/ui/TurnstileWidget.tsx) con inyección asíncrona del script y soporte para `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
  - Verificación robusta en backend [`CaptchaService.ts`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/core/services/captcha.service.ts) contra el endpoint oficial `https://challenges.cloudflare.com/turnstile/v0/siteverify` con fallback a Google reCAPTCHA.
  - Integración en los formularios públicos: Postulación de Moderadores (`/admin/registro`), Publicación de Ideas (`/ideas/nueva`), Voluntariado Profesional (`/voluntarios`) y Debate Comunitario (`/ideas/[id]`).
  - Bypass seguro en entorno de desarrollo local y suites de prueba.

---

## [0.0.2-beta-1] - 2026-08-16

### Agregado
- **Gestión de Alertas de Crisis y Carrusel Rotativo Global (REQ-01, REQ-02):**
  - Módulo de control de alertas en `/admin` restringido exclusivamente al rol `admin`.
  - Soporte para **múltiples alertas activas simultáneas** rotando suavemente en un carrusel dinámico cada 6 segundos en [`EmergencyBanner.tsx`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/components/layout/EmergencyBanner.tsx).
  - Pausa automática de rotación al hacer hover, controles táctiles y flechas anterior/siguiente con indicador de posición.
  - Estilización y contraste adaptativo según nivel de riesgo: `critica` (🔴 rojo emergencia), `alerta_naranja` (🟠 ámbar advertencia), `informativa` (🔵 azul institucional).
  - Conservación permanente y fija del enlace oficial de la **UNGRD** y del desplegable de **Líneas de Emergencia Nacionales** (123, 132, 144, 119, 165) con marcación directa telefónica.
  - Switch interactivo para alternar estado Activa/Pausada en 1 clic (`PATCH /api/alertas/[id]`) y eliminación permanente (`DELETE /api/alertas/[id]`).

- **Directorio y Gestión de Iniciativas Activas Anti-Duplicación (REQ-03, REQ-04):**
  - Módulo de creación y administración de iniciativas activas en `/admin` disponible para administradores y supervisores (`POST /api/iniciativas`, `DELETE /api/iniciativas/[id]`).
  - Conexión en tiempo real del directorio público [`/iniciativas`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/app/iniciativas) a la base de datos con filtros por pestañas (*Todas*, *Organismos Oficiales 🏛️*, *ONGs 🌐*, *Colectivos Ciudadanos 🤝*), buscador en tiempo real y enlaces oficiales de articulación.

---

## [0.0.1-beta-5] - 2026-08-15

### Agregado
- **Banco de Ideas, Debate Comunitario y Neutralidad Cívica (REQ-01, REQ-02, REQ-03, REQ-04):**
  - Banner institucional en `/ideas` con Declaración de Neutralidad Cívica y Apolitismo (plataforma 100% comunitaria, humanitaria e independiente).
  - Conexión del frontend a base de datos en `/ideas`, `/ideas/nueva` y `/ideas/[id]`.
  - Filtros dinámicos por estado (`Todas`, `En Acción 🔥`, `Promovidas ⭐`, `Ideas 💡`, `Soluciones Existentes 🔗`), selector por categoría y buscador en tiempo real.
  - Formulario de publicación (`/ideas/nueva`) con selector de modo:
    - **Envío Anónimo Rápido (Recomendado):** Resuelve Captcha anti-bot de humano, 0 correos consumidos, pasa a moderación como `borrador`.
    - **Envío Verificado con Correo:** Código OTP de 6 dígitos con publicación instantánea tras validación.
  - Nuevo campo opcional: *"Organización, Iniciativa o Enlace Existente Relacionado"* para vincular esfuerzos existentes y evitar la duplicación.
  - Vista de detalle `/ideas/[id]` con visualizador dinámico del pipeline de vida, renderizado Markdown, bloque destacado de iniciativa vinculada, árbol de comentarios y respuestas anidadas con captcha, y botón Web Share API para WhatsApp y redes sociales.
  - Soporte multi-proveedor en `EmailService` para SendGrid API (`https://api.sendgrid.com/v3/mail/send`), MailerSend, Resend y SMTP genérico con rate limit estricto y logger local en desarrollo.

---

## [0.0.1-beta-4] - 2026-08-15

### Agregado
- **Módulo de Voluntariado y Talento Técnico (REQ-01, REQ-02, REQ-03):**
  - Catálogo ampliado de áreas técnicas de respuesta inmediata (Drones/Sensores Térmicos, Maquinaria Pesada/Remoción, Ingeniería Estructural, Medicina de Urgencias, Psicología de Crisis, Telecomunicaciones/Radioaficionados, Logística/Cadena de Frío, Búsqueda y Rescate Canino, Software/GIS, Otros).
  - Formulario interactivo en `/voluntarios` con validaciones estrictas:
    - Verificación obligatoria de mayoría de edad (`esMayorDeEdad: true`, +18 años).
    - Aceptación obligatoria del Descargo de Responsabilidad Legal (`aceptaTerminos: true`).
    - Protección anti-bot con `CaptchaService`.
  - Moderación previa obligatoria: Todas las ofertas y demandas inician en estado `pendiente` y se validan en `/admin` antes de publicarse en el muro público.
  - Endpoints RESTful completos: `GET /api/voluntarios`, `POST /api/voluntarios`, `PATCH /api/voluntarios/[id]` (aprobación/cambio de estado), `DELETE /api/voluntarios/[id]` y `GET /api/voluntarios/match`.
  - Migración incremental `003_update_voluntariado_estado.sql` para actualizar la restricción CHECK de estados (`pendiente`, `activo`, `cubierto`, `pausado`, `completado`).
  - Protección de datos de contacto contra scrapers y bots mediante botón interactivo de revelación segura (`mailto:` y `tel:`).
  - Pestaña de moderación "Talento y Voluntariado" integrada en `/admin` con aprobación y descarte en 1 clic.

---

## [0.0.1-beta-3] - 2026-08-15

### Agregado
- **Módulo de Postulación y Registro de Supervisores (REQ-01):**
  - Página accesible en `/admin/registro` con formulario para aspirantes a moderadores/voluntarios calificados (nombre, email, organización, justificación y captcha anti-bot).
  - Endpoint `POST /api/auth/register-supervisor` con esquema Zod `RegisterSupervisorSchema` para registrar usuarios en estado inactivo (`activo: 0`) a la espera de revisión.
- **Panel de Gestión y Activación por el Administrador (REQ-02):**
  - Pestaña "Postulantes y Supervisores" en `/admin` con visualización de candidatos pendientes y equipo activo.
  - Endpoint `GET /api/usuarios` y `PATCH /api/usuarios/[id]` protegidos con rol de Administrador.
  - Flujo de activación inmediata con generación y envío automático de Magic Link de bienvenida al supervisor aprobado.
- **Estrategia Multi-Capa de Ahorro de Cuota de Correo (REQ-03):**
  - Ampliación de la vigencia de sesión administrativa en cookie HttpOnly `auth_session` a 30 días (`AuthService.createSessionToken(payload, 30)`), minimizando el consumo de Magic Links a <1-2 correos por mes por moderador.
  - Cooldown anti-spam de 5 minutos por correo en solicitudes de Magic Link para prevenir saturación de proveedores SMTP y ataques de inundación.
  - Soporte multi-proveedor en `EmailService` para MailerSend API (`https://api.mailersend.com/v1/email`), Resend API (`https://api.resend.com/emails`), SMTP estándar y fallback a Console Logger.
  - Formulario de ideas ciudadanas (`/ideas/nueva`) optimizado para resaltar el envío anónimo directo (0 correos consumidos).
- **Semilla Configurable y Acceso Rápido en Desarrollo (REQ-04):**
  - Soporte de variable `ADMIN_DEFAULT_EMAIL` en `.env` y `src/db/seed.ts`.
  - Botón "⚡ Acceso Rápido de Desarrollo" en `/admin/login` (`POST /api/auth/dev-login`) para inicio de sesión en 1 clic en entorno local sin consumir cuotas de correo.

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
