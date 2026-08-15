# 🇨🇴 ActuemosYaColombia (AYC)

> **Plataforma Tecnológica de Respuesta Humanitaria Inmediata ante Emergencias y Desastres Naturales**

[![Next.js](https://img.shields.io/badge/Framework-Next.js_14+-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_(WAL)-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Caddy](https://img.shields.io/badge/Proxy-Caddy_Server-1F88C0?style=flat-square&logo=caddy)](https://caddyserver.com/)

---

## 📌 1. Visión y Propósito del Proyecto

En las primeras 72 horas tras un desastre natural de gran escala (como un terremoto), convergen tres problemas críticos:
1. **Saturación e información fragmentada:** Cadenas no verificadas y canales informales dispersan la atención pública y generan desinformación.
2. **Duplicación de esfuerzos:** Decenas de colectivos crean aplicaciones o campañas aisladas en lugar de sumar fuerzas a iniciativas activas (*reinventar la rueda*).
3. **Descoordinación entre recursos y necesidades:** Profesionales calificados desean ayudar pero desconocen dónde se requiere su especialidad; ONGs en campo sufren por falta de personal técnico.

**ActuemosYaColombia (AYC)** actúa como un punto neurálgico ágil, público y de ultra-bajo consumo que centraliza propuestas ciudadanas, canaliza talento técnico, visibiliza personas y animales no localizados, y redirige tráfico a soluciones que ya están funcionando en el terreno.

---

## 👥 2. Arquetipos de Usuario y Filosofía Operativa

### Arquetipos de Usuario
* **Ciudadano / Afectado:** Solicita ayuda, busca familiares o mascotas no localizados, o propone soluciones para su comunidad.
* **Profesional Solidario:** Ofrece su especialidad técnica (médicos, arquitectos, psicólogos, desarrolladores, diseñadores).
* **ONG / Colectivo en Campo:** Registra requerimientos de voluntariado técnico y enlaza sus canales oficiales.
* **Supervisor:** Modera contenidos, revisa borradores anónimos y aprueba ideas viables.
* **Administrador:** Coordina moderadores, gestiona el directorio de iniciativas oficiales y lidera la redirección estratégica.

### Filosofía Operativa
* **Cero Fricción (Passwordless):** Sin contraseñas guardadas. Acceso administrativo vía **Magic Links (ML)** temporales y validación ciudadana por **OTP** de 6 dígitos o modo anónimo moderado.
* **Ultra-Bajo Consumo de Datos:** Diseñado para redes 3G degradadas o saturadas post-sismo (peso reducido, renderizado en servidor, consumo `<150 MB RAM`).
* **Viralidad Útil:** Integración nativa con Web Share API (`navigator.share`) y metaetiquetas **OpenGraph (OG)** dinámicas para difusión en WhatsApp, Telegram y redes sociales.
* **Resguardo de Datos Sensibles:** Moderación activa de fichas humanitarias para evitar fraudes, extorsiones o exposición indebida.

---

## ⚙️ 3. Módulos Funcionales

### A. Banco de Ideas y Pipeline de Estados
Centraliza propuestas ciudadanas orientadas a resolver consecuencias de la crisis.

```text
                    ┌────────────────────────┐
                    │ Formulario de Registro │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
 (Envío Anónimo)                                 (Envío con Correo + OTP)
        ▼                                               ▼
┌───────────────┐                             ┌───────────────────┐
│   Borrador    │ ──(Aprobación Supervisor)──>│  Idea (Pública)   │
└───────────────┘                             └─────────┬─────────┘
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
             ┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
             │    Promovida    │               │   Redirigida    │               │     Cerrada     │
             └────────┬────────┘               │ (Ya existe app/ │               │ (Inviable/Meta  │
                      │                        │  iniciativa)    │               │  cumplida)      │
                      ▼                        └─────────────────┘               └─────────────────┘
             ┌─────────────────┐
             │    En Acción    │
             └─────────────────┘
```

* `borrador`: Creada anónimamente; requiere revisión previa de Supervisor o Admin.
* `idea`: Pública y abierta a debate de la comunidad. Validada con OTP de 6 dígitos.
* `promovida`: Priorizada por moderadores por su impacto y viabilidad.
* `en_accion`: En ejecución por ONGs, colectivos o equipos técnicos.
* `redirigida`: Congelada y enlazada directamente a una iniciativa activa existente.
* `cerrada`: Cumplida con éxito o archivada.

### B. Directorio de Iniciativas Activas (Anti-Duplicación)
Tablero público de apps, campañas y ONGs operativas para evitar la duplicación de esfuerzos.

### C. Espacio de Debate y Comunidad
Hilos de comentarios anidados bajo cada propuesta con soporte **Markdown** y protección anti-spam.

### D. Módulo de Búsqueda Humanitaria y Mascotas
Fichas estandarizadas de personas (`buscado`, `en_refugio`, `localizado`) y animales (`perdido`, `rescatado`, `en_hogar_temporal`).

### E. Tablero de Talento y Voluntariado Profesional (Matching)
Conexión directa entre ofertas de profesionales calificados y requerimientos técnicos de ONGs o colectivos en campo.

### F. Difusión y Viralización (OG & Web Share)
Generación dinámica de imágenes OpenGraph para previsualizaciones en redes y difusión móvil con un clic.

---

## 🏗️ 4. Arquitectura de Software y Capas

El proyecto sigue una arquitectura de **Monolito Modular en Capas (Layered Architecture)** basada en Next.js App Router con TypeScript:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. CAPA DE PRESENTACIÓN (Next.js / SSR & Client Components) │
│ - Renderizado de Vistas, Formularios, Editor Markdown       │
│ - OpenGraph dinámico para compartir en WhatsApp, X, etc.    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Petición HTTP / Server Action)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CAPA DE APLICACIÓN Y CONTROLADORES (API Routes)          │
│ - Validación de entrada con esquemas Zod (DTO)              │
│ - Rate Limiting & Control de bots (reCAPTCHA / Turnstile)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CAPA DE DOMINIO Y SERVICIOS (Lógica de Negocio)          │
│ - Pipeline de Estados (borrador -> idea -> promovida -> ...)│
│ - Sanitización de Markdown contra XSS (sanitize.service)     │
│ - Generación y verificación de OTP y Magic Links (ML)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CAPA DE ACCESO A DATOS (DAL / SQLite Singleton)          │
│ - Repositorios con consultas preparadas (Prepared Statements)│
│ - Modo WAL con PRAGMA busy_timeout = 5000 para concurrencia  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 5. Seguridad y Mitigación de Amenazas

1. **Prevención de XSS (Cross-Site Scripting):**
   - Sanitización estricta de Markdown en `sanitize.service.ts`.
   - Inyección forzada de `rel="noopener noreferrer nofollow"` en enlaces externos.
2. **Modelo Passwordless y RBAC:**
   - Sin almacenamiento de contraseñas.
   - Enlaces Mágicos (**ML**) con firmas HMAC-SHA256 (expiración de 15 min) para administradores y supervisores.
   - Cookies de sesión `HttpOnly`, `Secure` y `SameSite=Lax`.
3. **Protección Anti-Bot y Rate Limiting:**
   - reCAPTCHA v3 / Cloudflare Turnstile en formularios públicos.
   - Rate Limiter en memoria para peticiones sensibles (creación de ideas, comentarios, envío de OTP).
4. **Seguridad en Base de Datos:**
   - 100% de consultas parametrizadas con Prepared Statements (`better-sqlite3`).
5. **Blindaje de Red (Caddy Server):**
   - Inyección automática de cabeceras HSTS, `X-Content-Type-Options`, `X-Frame-Options` y renovación SSL de Let's Encrypt.

---

## 🛠️ 6. Decisiones de Infraestructura y Servidor

| Componente | Elección Tecnológica | Justificación Técnica |
| :--- | :--- | :--- |
| **Servidor / VPS** | DigitalOcean Droplet (1 vCPU / 1 GB RAM / 10 GB SSD) | Presupuesto estricto y despliegue rápido. |
| **Memoria Swap** | Swapfile de 2 GB | Previene caídas por *Out-Of-Memory* (**OOM**) durante picos de tráfico. |
| **Base de Datos** | **SQLite** (Modo **WAL**) | Ultra-bajo consumo (`<50 MB RAM`) sin sobrecarga de motor DB independiente. |
| **Persistencia** | Docker Bind Volume (`./data:/data`) | Resguardo directo de `database.sqlite` fuera de contenedores. |
| **Proxy / SSL** | **Caddy Server** | Emisión y renovación automatizada de SSL gratuito (Let's Encrypt). |
| **Contenedores** | **Docker Compose** | Despliegue modular, aislado e idéntico en desarrollo y producción. |

---

## 📁 7. Estructura de Directorios

```text
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── package.json
├── tsconfig.json
├── AGENTS.md                       # Visión, directrices, protocolo de actuación y gate obligatorio
├── CONTEXT.md                      # Contexto de negocio, arquetipos de usuario y pipeline de vida
├── docs/                           # Documentación oficial del proyecto
│   ├── ARCHITECTURE.md             # Especificación de arquitectura, seguridad y capas
│   ├── DATABASE.md                 # Esquema DDL SQLite, pragmas e índices de rendimiento
│   ├── DESIGN.md                   # Sistema de diseño UI, tokens de color, fuentes y componentes
│   ├── PLAYBOOK.md                 # Manual operativo, guía de commits, patrones y abreviaciones
│   └── references/                 # Especificaciones técnicas por módulo
├── data/                           # Volumen persistente en Docker (base de datos SQLite)
│   └── database.sqlite
├── public/                         # Archivos estáticos y uploads
└── src/
    ├── app/                        # Next.js App Router (Páginas, Layouts y API Routes)
    ├── components/                 # Componentes UI (Design System, Cards, Modales, Badges)
    ├── core/                       # Lógica de dominio, servicios (ideas, auth, XSS) y entidades
    ├── db/                         # Capa de Acceso a Datos (DAL, SQLite Client, Repositorios)
    └── lib/                        # Helpers, rate limiter y configuración (Zod)
```

---

## 📋 8. Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente esquema:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=/data/database.sqlite

# Anti-Bot (reCAPTCHA v3 / Turnstile)
RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key

# Servicio de Correo Transaccional (Magic Links & OTP)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=tu_api_key
EMAIL_FROM=no-reply@tudominio.org

# Dominio Oficial
APP_DOMAIN=tudominio.org
```

---

## 🚀 9. Guía de Instalación y Despliegue

### Requisitos Previos
* Node.js 18+ y npm
* Docker y Docker Compose (para despliegue)

### Desarrollo Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/actuemos-ya-colombia.git
   cd actuemos-ya-colombia
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

### Despliegue con Docker Compose (Producción)

```bash
docker-compose up -d --build
```

---

## 📚 10. Documentación Complementaria

Para profundizar en el desarrollo, arquitectura y convenciones de **ActuemosYaColombia**, consulta la documentación oficial en el directorio `docs/`:

* 📋 [`AGENTS.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/AGENTS.md) — Protocolo de actuación, reglas operativas y gate obligatorio.
* 🌍 [`CONTEXT.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/CONTEXT.md) — Contexto de negocio, arquetipos de usuario y pipeline de vida.
* 🏗️ [`docs/ARCHITECTURE.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/docs/ARCHITECTURE.md) — Arquitectura en capas, árbol de directorios y seguridad.
* 🗄️ [`docs/DATABASE.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/docs/DATABASE.md) — Esquema DDL SQLite, modo WAL e índices de rendimiento.
* 🎨 [`docs/DESIGN.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/docs/DESIGN.md) — Sistema de diseño UI, tokens de color (Acción, Confianza) y componentes.
* 📘 [`docs/PLAYBOOK.md`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/docs/PLAYBOOK.md) — Manual técnico, convenciones Conventional Commits y glosario de abreviaciones.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/LICENSE) para obtener más información.
