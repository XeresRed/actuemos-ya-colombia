# 📋 ARCHITECTURE.md: Arquitectura, Estructura y Seguridad (ActuemosYaColombia)

Este documento define el diseño arquitectónico de software, el árbol de directorios, la separación de capas y las directrices de seguridad para la plataforma de respuesta humanitaria.

---

## 1. Principios de Diseño del Sistema

1. **Eficiencia en Recursos:** Consumo de memoria mínimo (<150 MB en ejecución) para convivir de forma estable en un entorno con 1 GB de RAM.
2. **Monolito Modular:** Toda la lógica reside en una sola base de código para evitar la sobrecarga de red y memoria de microservicios.
3. **Seguridad por Capas (Defense in Depth):** Sanitización estricta de Markdown, mitigación anti-bot y autenticación sin contraseñas (Passwordless).
4. **Resiliencia Operativa:** SQLite en modo WAL para soportar alta concurrencia de lectura sin bloqueos.

---

## 2. Estructura de Directorios del Proyecto

Estructura basada en Next.js (App Router) / Node.js con TypeScript:

├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── package.json
├── tsconfig.json
├── AGENTS.md                       # Visión del proyecto, reglas, protocolo y gate obligatorio
├── CONTEXT.md                      # Contexto de negocio, arquetipos de usuario y pipeline
├── docs/                           # Documentación de arquitectura, base de datos y diseño
│   ├── ARCHITECTURE.md             # Especificación arquitectónica del sistema
│   ├── DATABASE.md                 # Esquema DDL SQLite y relaciones de datos
│   ├── DESIGN.md                   # Sistema de diseño, tokens UI, colores y tipografía
│   ├── PLAYBOOK.md                 # Manual operativo, guía de commits, patrones y abreviaciones
│   └── references/                 # Especificaciones y prototipos por módulo
│
├── data/                           # Volumen persistente montado en Docker
│   └── database.sqlite             # Archivo de base de datos SQLite (WAL)
│
├── public/                         # Archivos estáticos públicos
│   ├── favicon.ico
│   ├── robots.txt
│   └── uploads/                    # Fotos de reportes de búsqueda (optimizadas)
│
└── src/
    ├── app/                        # Capa de Presentación / Rutas (App Router)
    │   ├── layout.tsx              # Layout raíz (SEO, Meta tags, Providers)
    │   ├── page.tsx                # Landing principal + Feed de ideas
    │   ├── ideas/
    │   │   ├── page.tsx            # Directorio y filtros de ideas
    │   │   ├── nueva/page.tsx      # Formulario de creación (Anónimo o con Email)
    │   │   └── [id]/
    │   │       ├── page.tsx        # Detalle de idea + Hilos de debate
    │   │       └── opengraph-image.tsx # Generador dinámico de imagen para RRSS
    │   ├── iniciativas/            # Tablero de soluciones activas (anti-duplicación)
    │   ├── busqueda/               # Módulo de personas y mascotas extraviadas
    │   ├── voluntarios/            # Tablero de matching profesional
    │   ├── admin/                  # Panel de administración y supervisión
    │   └── api/                    # Endpoints internos (API Routes)
    │       ├── auth/               # Magic links, validación OTP y sesiones
    │       ├── ideas/              # CRUD y cambios de estado de ideas
    │       ├── comentarios/        # Creación y moderación de comentarios
    │       ├── iniciativas/        # Gestión del directorio de iniciativas activas
    │       ├── busqueda/           # Reportes de víctimas/animales
    │       ├── voluntarios/        # Matching y solicitudes de voluntariado
    │       └── captcha/            # Verificación de tokens de captcha
    │
    ├── components/                 # Componentes de Interfaz de Usuario (UI)
    │   ├── ui/                     # Componentes base (Botones, Modales, Inputs, Badges)
    │   ├── layout/                 # Navbar, Footer, Banner de crisis
    │   ├── ideas/                  # CardIdea, PipelineStatus, MarkdownRenderer
    │   ├── comentarios/            # CommentTree, CommentForm
    │   ├── iniciativas/            # InitiativeCard, AntiDuplicationBanner
    │   ├── busqueda/               # SearchCard, FiltersBar, BadgeEstado
    │   ├── voluntarios/            # VolunteerCard, SkillMatchForm
    │   └── common/                 # ShareButton, CaptchaWidget, MarkdownEditor
    │
    ├── core/                       # Capa de Dominio y Lógica de Negocio
    │   ├── domain/                 # Entidades y tipos de TypeScript
    │   │   ├── idea.ts             # Dominio de ideas y pipeline de estados
    │   │   ├── usuario.ts          # Dominio de usuarios, roles y autenticación
    │   │   ├── comentario.ts       # Dominio de comentarios e hilos
    │   │   ├── iniciativa.ts       # Dominio de iniciativas activas
    │   │   ├── busqueda.ts         # Dominio de reportes de búsqueda (personas/mascotas)
    │   │   ├── voluntariado.ts     # Dominio de matching profesional
    │   │   └── auth.ts             # Entidades de auth_tokens, magic links y OTP
    │   ├── services/               # Casos de uso y reglas de negocio
    │   │   ├── idea.service.ts     # Transiciones de estado [Borrador -> Idea -> Promovida]
    │   │   ├── iniciativa.service.ts # Registro y vinculación anti-duplicación
    │   │   ├── busqueda.service.ts # Gestión de reportes de búsqueda y estados
    │   │   ├── voluntariado.service.ts # Lógica de matching técnico/profesional
    │   │   ├── auth.service.ts     # Generación de tokens y verificación OTP / Magic Link
    │   │   ├── email.service.ts    # Envíos transaccionales (SMTP/Resend)
    │   │   ├── captcha.service.ts  # Validación reCAPTCHA / Turnstile
    │   │   └── sanitize.service.ts # Limpieza de HTML/Markdown contra XSS
    │   └── errors/                 # Manejo centralizado de excepciones
    │
    ├── db/                         # Capa de Acceso a Datos (DAL)
    │   ├── client.ts               # Conexión Singleton SQLite (better-sqlite3)
    │   ├── migrations/             # Scripts DDL de inicialización y actualización
    │   └── repositories/           # Consultas SQL optimizadas
    │       ├── idea.repository.ts
    │       ├── usuario.repository.ts
    │       ├── comentario.repository.ts
    │       ├── iniciativa.repository.ts
    │       ├── busqueda.repository.ts
    │       ├── voluntariado.repository.ts
    │       └── auth.repository.ts
    │
    └── lib/                        # Utilidades y configuración global
        ├── config.ts               # Validación de variables de entorno (Zod)
        ├── rate-limit.ts           # Limitador de peticiones en memoria
        └── share.ts                # Helpers para Web Share API

---

## 3. Arquitectura en Capas y Flujo de Datos

┌─────────────────────────────────────────────────────────────┐
│ 1. CAPA DE PRESENTACIÓN (Next.js / SSR & Client Components) │
│ - Renderizado de Vistas, Formularios, Editor Markdown       │
│ - OpenGraph dinámico para compartir en WhatsApp, X, etc.    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Petición HTTP / Server Action)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CAPA DE APLICACIÓN Y CONTROLADORES (API Routes)          │
│ - Validación de entrada (Zod Schemas)                       │
│ - Rate Limiting & Control de bots (reCAPTCHA / Turnstile)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CAPA DE DOMINIO Y SERVICIOS (Lógica de Negocio)          │
│ - Pipeline de Estados (borrador -> idea -> promovida -> ...)│
│ - Sanitización de Markdown (DOMPurify / sanitize-html)      │
│ - Generación/Verificación de OTP y Magic Links              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CAPA DE ACCESO A DATOS (Repositories / SQLite Singleton) │
│ - Consultas preparadas (Prepared Statements)                │
│ - Modo WAL con lecturas concurrentes                        │
└─────────────────────────────────────────────────────────────┘

---

## 4. Arquitectura de Seguridad y Mitigación de Amenazas

### A. Prevención de XSS (Cross-Site Scripting) en Markdown

- Los usuarios pueden redactar ideas y comentarios en formato Markdown enriquecido.
- **Medida de mitigación:** Todo el contenido Markdown se procesa con un pipeline de sanitización estricto antes de renderizarse:
  - Solo se permiten etiquetas seguras: `p`, `strong`, `em`, `ul`, `ol`, `li`, `blockquote`, `code`, `pre`, `h1-h4`.
  - Se bloquean terminantemente: `<script>`, `<iframe>`, `<object>`, `<embed>`, eventos `onerror=`, `onclick=`, etc.
  - Todos los enlaces generados incluyen forzosamente `rel="noopener noreferrer nofollow"`.

### B. Autenticación y Control de Roles (Passwordless)

- **Sin Contraseñas:** Se elimina el riesgo de filtración de credenciales (credential stuffing o rainbow tables).
- **Flujo de Acceso Administrativo (Admin / Supervisor):**
  1. El usuario solicita acceso con su correo institucional/autorizado.
  2. El sistema genera un token criptográfico seguro (HMAC-SHA256) de un solo uso con expiración de 15 minutos.
  3. Se envía un enlace mágico (Magic Link). Al acceder, se establece una cookie de sesión HttpOnly, Secure, SameSite=Lax.
- **RBAC (Control de Acceso Basado en Roles):**
  - Middleware intercepta todas las rutas bajo /admin/* y valida el rol antes de permitir ejecución.

### C. Protección Anti-Spam y Rate Limiting

- **Validación de Bots:** Todo envío público (ideas o comentarios) requiere la solución válida de reCAPTCHA v3 o Cloudflare Turnstile verificada en servidor.

- **Rate Limiter en Memoria:**
  1. **Límite de creación de ideas:** máximo 3 peticiones por IP cada 10 minutos.
  2. **Límite de comentarios:** máximo 10 peticiones por IP cada 5 minutos.
  3. Solicitudes de Magic Link: máximo 3 envíos por correo cada hora.

### D. Seguridad e Integridad de la Base de Datos SQLite

- **Inyecciones SQL:** 100% de las consultas utilizan Prepared Statements parametrizados. Ningún valor de usuario se concatena directamente en las sentencias SQL.
- **Manejo de Bloqueos:** Configuración de PRAGMA busy_timeout = 5000; para que los procesos esperen hasta 5 segundos si ocurre una escritura concurrente, evitando errores de base de datos ocupada (database locked).

### E. Blindaje de Red y Cabeceras HTTP (Caddy Proxy)

Caddy actúa como puerta de enlace expuesta al público, inyectando cabeceras de seguridad estrictas:

```caddyfile

# Cabeceras inyectadas automáticamente por Caddy
header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    X-XSS-Protection "1; mode=block"
    Referrer-Policy "strict-origin-when-cross-origin"
}

```
