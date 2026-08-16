# 📘 PLAYBOOK.md: Reglas, Patrones, Abreviaciones y Guía de Commits (ActuemosYaColombia)

Este documento es el manual operativo y técnico del proyecto **ActuemosYaColombia**. Define las reglas estrictas de desarrollo, las convenciones de comentarios/commits, los patrones arquitectónicos y el glosario estandarizado de abreviaciones.

---

## 1. Reglas Operativas y de Código (Rules)

### 1.1. Principios Fundamentales
* **Cero Reinvención de la Rueda:** Si ya existe una iniciativa, aplicación o grupo respondiendo a una necesidad, se redirige el tráfico mediante el estado `redirigida` en lugar de duplicar esfuerzos.
* **Eficiencia Estricta de Memoria (<150 MB RAM):** No se permiten ORMs pesados ni dependencias innecesarias en runtime. Se utiliza `better-sqlite3` en modo WAL con consultas directas parametrizadas.
* **Seguridad por Capas (Defense in Depth):**
  - **Sanitización estricta de Markdown:** Todo contenido renderizado debe pasar por `sanitize.service.ts` para eliminar scripts, iFrames o eventos maliciosos.
  - **Passwordless:** Sin contraseñas guardadas. Acceso administrativo únicamente con Magic Links temporales.
  - **Protección Anti-Bot:** Captcha (reCAPTCHA v3 / Cloudflare Turnstile) obligatorio en todos los formularios públicos.
* **Validación Empírica:** Nunca se declara una tarea o bug como resuelto sin ejecutar comandos de verificación (build, lints o pruebas).
* **Actualización Obligatoria del Changelog:** Todo cambio notable, nueva funcionalidad, corrección de errores o refinamiento completado DEBE ser registrado inmediatamente en `CHANGELOG.md` documentando la versión, la fecha y los requerimientos abordados bajo el estándar Keep a Changelog.

### 1.2. Guía Concreta de Commits y Comentarios de Código

#### Estructura de Mensajes de Commit (Conventional Commits)
Todo commit debe seguir el formato estándar:

```text
<tipo>(<módulo>): <descripción corta en imperativo>

[cuerpo opcional detallando el motivo del cambio y reglas aplicadas]

[referencia a issues o requisitos, ej: Closes #12]
```

#### Tipos Permitidos (`<tipo>`)
* `feat`: Nueva funcionalidad (ej. módulo de voluntariado, generador OpenGraph).
* `fix`: Corrección de un error o bug (ej. sanitización de XSS en debate, bloqueo de concurrencia).
* `docs`: Cambios en la documentación (ej. actualización de `PLAYBOOK.md` o `ARCHITECTURE.md`).
* `style`: Cambios de formato o CSS sin alterar la lógica de negocio.
* `refactor`: Refactorización de código existente sin cambiar comportamiento externo.
* `perf`: Optimizaciones de rendimiento de SQLite, memoria o bundle.
* `test`: Adición o modificación de pruebas unitarias o de integración.
* `chore`: Mantenimiento de configuración, Dockerfile, Caddyfile o dependencias.

#### Módulos Válidos (`<módulo>`)
* `ideas` | `iniciativas` | `debate` | `busqueda` | `voluntarios` | `auth` | `db` | `ui` | `security`

#### Ejemplos de Commits Concretos
* `feat(ideas): implementar pipeline de estados borrador -> idea con OTP`
* `fix(security): aplicar sanitización estricta de HTML en el render de Markdown`
* `perf(db): habilitar PRAGMA busy_timeout = 5000 y WAL mode en SQLite client`
* `docs(playbook): definir gate obligatorio de verificación para agentes`

---

## 2. Patrones Arquitectónicos (Patterns)

### 2.1. Monolito Modular en Capas (Layered Architecture)
```text
Capa de Presentación (src/app, src/components)
       │
       ▼
Capa de Controladores & API Routes (src/app/api)
       │
       ▼
Capa de Dominio & Servicios (src/core/services)
       │
       ▼
Capa de Acceso a Datos / DAL (src/db/repositories)
```
- **Regla:** Ningún componente de interfaz debe invocar consultas SQL o acceder directamente a la base de datos. Toda la lógica de negocio reside en `src/core/services`.

### 2.2. Patrón Repository (SQLite Singleton)
- Consultas SQL centralizadas en `src/db/repositories/`.
- Uso exclusivo de **Prepared Statements** parametrizados para evitar inyecciones SQL.
- Configuración global de SQLite: `PRAGMA journal_mode = WAL;` y `PRAGMA busy_timeout = 5000;`.

### 2.3. Patrón Pipeline de Estados para Ideas
- Transiciones deterministas validadas en `idea.service.ts`:
  `borrador` ➔ `idea` ➔ `promovida` ➔ `en_accion` ➔ `cerrada` / `redirigida`
- Solo usuarios con rol `supervisor` o `admin` pueden autorizar la transición de `borrador` anónimo a `idea` pública o marcar como `promovida`.

### 2.4. Patrón Passwordless & OTP
- Tokens temporales de 6 dígitos expiran en 15 minutos.
- Hash HMAC-SHA256 para guardar tokens de acceso administrativo en `auth_tokens`.
- Cookies de sesión HttpOnly, Secure, SameSite=Lax.

---

## 3. Glosario de Abreviaciones (Abbreviations)

| Abreviación | Término Completo | Descripción en el Proyecto |
| :--- | :--- | :--- |
| **AYC** | ActuemosYaColombia | Nombre corto de la plataforma de respuesta humanitaria. |
| **WAL** | Write-Ahead Logging | Modo de alto rendimiento de SQLite que permite lecturas concurrentes sin bloquear escrituras. |
| **OTP** | One-Time Password | Código de verificación de 6 dígitos enviado por correo para validar autoría de ideas. |
| **ML** | Magic Link | Enlace de un solo uso enviado por correo para login administrativo sin contraseña. |
| **RBAC** | Role-Based Access Control | Sistema de permisos basado en roles (`publico`, `supervisor`, `admin`). |
| **DAL** | Data Access Layer | Capa de acceso a datos ubicada en `src/db/repositories/`. |
| **DTO** | Data Transfer Object | Esquema de validación de entrada (Zod) en la capa API. |
| **OG** | OpenGraph | Metaetiquetas dinámicas para previsualizaciones ricas en WhatsApp, X y Telegram. |
| **XSS** | Cross-Site Scripting | Vulnerabilidad mitigada por la sanitización en `sanitize.service.ts`. |
| **OOM** | Out-Of-Memory | Fallo de sistema prevenido mediante restricción de RAM (<150 MB) y 2 GB de Swap. |

---

## 4. Checklist de Calidad para Desarrollo

- [ ] ¿El código respeta el límite estricto de recursos y no incluye dependencias pesadas?
- [ ] ¿Toda entrada de usuario en Markdown o texto enriquecido se sanitiza en el backend?
- [ ] ¿Todas las consultas SQL son Prepared Statements parametrizados?
- [ ] ¿Los mensajes de commit siguen la especificación de `PLAYBOOK.md`?
- [ ] ¿Se ejecutaron las pruebas o el comando de build exitosamente?
- [ ] ¿Se actualizó `CHANGELOG.md` documentando la versión y los cambios realizados?

## 5. Ejemplos practicos 

### Sendgrip

´´´node
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// sgMail.setDataResidency('eu'); 
// uncomment the above line if you are sending mail using a regional EU subuser

const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
´´´
