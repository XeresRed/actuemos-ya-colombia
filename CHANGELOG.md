# 📝 Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.0-beta] - 2026-08-17

### Modificado
- **Flexibilización de Solicitudes de Voluntariado para Particulares y Terceros (`REQ-01`):**
  - Creación de migración SQLite `008_add_organizacion_to_voluntariado.sql` añadiendo la columna dedicada `organizacion TEXT` a la tabla `voluntariado_profesional`.
  - Actualización de entidades de dominio (`src/core/domain/voluntariado.ts`), DAL (`src/db/repositories/voluntariado.repository.ts`), servicios de negocio (`src/core/services/voluntariado.service.ts`) y esquema de validación Zod (`src/lib/validations/index.ts`).
  - Rediseño de campos del formulario en `/voluntarios`:
    - En «Ofrezco Habilidad»: campo obligatorio «Nombre Completo y Título / Especialidad *».
    - En «Busco Perfil»: campo obligatorio «Nombre del Solicitante o Contacto *» y nuevo campo opcional «Organización, Colectivo o Brigada (Opcional)» permitiendo a ciudadanos particulares, líderes vecinales o terceros no adscritos a una ONG solicitar apoyo técnico sin bloqueos.
  - Visualización del nombre de la organización como detalle complementario en las tarjetas públicas y en la consola de moderación de `/admin`.

---

## [0.8.0-beta] - 2026-08-17


### Agregado
- **Internacionalización Completa de Common, Hub y Recursos (`REQ-01`):**
  - Ampliación exhaustiva de los diccionarios bilingües (`es.ts` y `en.ts`) cubriendo namespaces para `nav`, `hub`, `recursos`, `iniciativas`, `emergency`, `actions` y `footer`.
  - Conexión del Hub (`/`), Recursos (`/recursos`), Footer (`Footer.tsx`), Banner de Emergencia (`EmergencyBanner.tsx`) y Navbar (`Navbar.tsx`) al hook `useTranslation()`.

- **Selector de Idioma con Botón de Ícono y Popover Flotante (`REQ-02`):**
  - Rediseño de `LanguageSelector.tsx` con un botón compacto con ícono de globo terráqueo (`language`) que despliega un popover flotante accesible con banderas y nombres oficiales (`🇨🇴 Español (Colombia)` / `🇺🇸 English (United States)`).
  - Indicador visual de idioma activo (`check`), cierre automático en selección, tecla `Escape` o clic fuera del popover.

- **Modal de Detalle Expandible para Iniciativas con Markdown (`REQ-03`):**
  - Componente modal interactivo `IniciativaDetailModal.tsx` con renderizado seguro de Markdown (encabezados, negrita, cursiva, listas, citas y enlaces externos).
  - Visualización de insignias de estado, categoría, cobertura geográfica, punto de acopio / dirección y fecha/hora del evento programado.
  - Botón de enlace a canal oficial externo y botón de compartir nativo (`navigator.share`).

- **Nuevos Campos Opcionales en Iniciativas & Asistente Markdown (`REQ-04`):**
  - Migración SQLite `007_add_direccion_fecha_to_iniciativas.sql` agregando las columnas `direccion TEXT` y `fecha_evento TEXT` a `iniciativas_activas`.
  - Actualización de entidades de dominio, DAL (`IniciativaRepository`) y esquemas Zod (`CreateIniciativaSchema`).
  - Formulario administrativo en `/admin` con inputs para Dirección y Fecha/Hora del Evento (`datetime-local`), barra de herramientas para inserción rápida de formato Markdown y pestaña de previsualización en vivo.

### Mejorado
- **Navegación Limpia de Una Sola Línea en Navbar (`REQ-02`):**
  - Menú de navegación desktop optimizado con etiquetas concisas: `[Hub, Ideas, Iniciativas, Búsqueda, Voluntariado, Recursos, Acerca]` / `[Hub, Ideas, Initiatives, Search, Volunteers, Resources, About]`, eliminando quiebres de línea en resoluciones intermedias.

---

## [0.7.0-beta] - 2026-08-17


### Agregado
- **Infraestructura de Internacionalización i18n (`REQ-02`):**
  - Creación de `LanguageContext` y hook `useTranslation()` en `src/lib/i18n/LanguageContext.tsx` con soporte para español (`es`) e inglés (`en`).
  - Diccionarios base en `src/lib/i18n/dictionaries/es.ts` y `en.ts` estructurados por namespaces (`nav`, `emergency`, `actions`, `common`, `footer`).
  - Componente accesible `LanguageSelector.tsx` con conmutador táctil `ES | EN` integrado en la barra de navegación desktop y en el menú drawer móvil.
  - Persistencia de preferencia de idioma en `localStorage` (`ayc_lang`) con detección automática del navegador.

- **Módulo de Recursos: Fichas de Cancillería y Trámites Consulares para Extranjeros (`REQ-03`):**
  - Nueva categoría oficial `cancilleria` ("Extranjeros & Cancillería") en `src/app/recursos/page.tsx`.
  - **Ficha 1:** *Asistencia Consular y Localización de Embajadas ante Desastres* (Canales 24/7 CIAC Cancillería, enlace con misiones diplomáticas acreditadas y retorno humanitario asistido).
  - **Ficha 2:** *Salvoconductos de Emergencia (SC-2), Prórrogas y Reposición de Permisos (PPT) ante Migración Colombia* (Trámite preferencial por fuerza mayor, regularización transitoria y reposición de documentos perdidos en catástrofes).

### Mejorado
- **Optimización de UX Móvil y Divulgación Progresiva (`REQ-01`):**
  - Barra de filtros con deslizamiento horizontal táctil (*pills*) y scrollbar oculto para evitar saturación de pantalla en móviles.
  - Divulgación progresiva (*Progressive Disclosure*) en tarjetas de trámites con acordeones colapsables interactivos en móvil ("Ver requisitos y pasos oficiales").
  - Reducción de márgenes y tipografías gigantes en encabezados móviles para maximizar el área visible.

- **Desduplicación y Visibilidad Contextual del Botón Flotante (`REQ-04`):**
  - Ocultamiento inteligente del FAB móvil en `/`, `/ideas`, `/ideas/nueva` y `/admin` para evitar colisión visual con botones primarios de acción (Hero CTA "Proponer Solución" y encabezado de ideas).
  - El botón flotante permanece activo como acceso rápido únicamente en páginas de consulta e informativas (`/recursos`, `/iniciativas`, `/voluntarios`, `/busqueda`, `/sobre-nosotros`).

---

## [0.6.0-beta] - 2026-08-17


### Agregado
- **Google Analytics In-House & Telemetría de Tráfico de Red (`REQ-01`):**
  - **Base de Datos SQLite:** Migración `006_add_in_house_analytics.sql` creando las tablas `analytics_visitas` y `analytics_eventos` con índices compuestos optimizados para consultas en milisegundos (`<2ms`).
  - **Privacidad Estricta (Habeas Data / GDPR):** Anonimización de direcciones IP mediante hash SHA-256 truncado con sal rotativa diaria en memoria; sin cookies de terceros ni rastreadores invasivos.
  - **Dominio y DAL:** `AnalyticsRepository` en `src/db/repositories/analytics.repository.ts` con consultas parametrizadas para KPIs, series temporales horarias/diarias, páginas principales, fuentes de referencia (WhatsApp, Google, X, etc.), desglose de dispositivos/navegadores/sistemas operativos, telemetría HTTP de red (2xx, 3xx, 4xx, 5xx, P95 y latencia promedio) y stream en vivo de tráfico.
  - **Capa de Servicios y Validaciones:** `AnalyticsService` en `src/core/services/analytics.service.ts` con analizador de User-Agent, clasificador de referrers y esquemas Zod `TrackBeaconSchema` y `AnalyticsQuerySchema`.
  - **Endpoints API:**
    - `POST /api/analytics/track`: Baliza de telemetría asíncrona no bloqueante para visitas de página y eventos de conversión.
    - `GET /api/analytics/stats`: Endpoint protegido para supervisores/administradores que entrega métricas consolidadas.
    - `GET /api/analytics/realtime`: Pulso de visitantes activos en vivo y stream de solicitudes recientes.
  - **Rastreador en Cliente:** `src/components/analytics/AnalyticsTracker.tsx` integrado en `src/app/layout.tsx` y utilidades en `src/lib/analytics.ts` (`trackPageView`, `trackEvent`).
  - **Panel de Control en `/admin`:** Nueva pestaña *"Analíticas & Red"* con dashboard interactivo, gráfico de series de tiempo, KPIs en vivo, desglose de tráfico y visor de solicitudes en tiempo real.
  - **Restricción Estricta RBAC en Analíticas (Admin Only):** Acceso a métricas de tráfico, visitantes en tiempo real y telemetría HTTP reservado exclusivamente a usuarios con rol `admin`. Se bloquea a supervisores y anónimos con error `403 Forbidden` en la capa de servicios y API, y se oculta la pestaña en la interfaz de usuario.
  - **Rolling Sessions y Persistencia de Cookies (30 Días):** Extensión de la cookie de sesión `auth_session` a 30 días (`maxAge: 2592000s`) con mecanismo de renovación continua automática (*Sliding Expiration*) en `/api/auth/session`, evitando deslogueos imprevistos de moderadores y cuidando la cuota de envío de Magic Links.
  - **Banner Legal de Consentimiento de Cookies (Ley 1581 de 2012 / Dec. 1074 de 2015 - SIC):** Implementación de `CookieConsentBanner.tsx` fijado en la parte inferior con opciones *«Aceptar todas»* y *«Solo esenciales»*. Condiciona dinámicamente la inyección de Google Tag Manager (`GoogleTagManager.tsx`) y el envío de eventos a `dataLayer` según la decisión libre e informada del ciudadano.


### Corregido
- **Fallas en Pipeline de CI/CD (GitHub Actions) y Suite de Pruebas (`REQ-02`):**
  - **Resolución de `FatalError: TypeScript dependencies missing` en CI:** Se eliminó `NODE_ENV: production` a nivel de job en `.github/workflows/ci.yml` y se garantizó la instalación completa de dependencias de desarrollo (`npm ci --include=dev`) previo a `npm run lint` y `npx tsc --noEmit`.
  - **Resolución de `SqliteError: no such table: usuarios` en `test-services.ts`:** Se incorporó la ejecución garantizada de migraciones `runMigrations()` y el paso `npm run db:migrate` en CI y al inicio de las suites de prueba (`scripts/test-services.ts`, `scripts/test-api.ts`), asegurando que `getDb()` y el entorno de pruebas posean el esquema DDL y usuarios inicializados en entornos limpios.
  - **Depuración de Workflows:** Se eliminó el archivo defectuoso `.github/workflows/node.js.yml`.
  - **Nueva Suite de Pruebas:** Creación de `scripts/test-analytics.ts` probando DAL, servicios, privacidad, parsing de User-Agent, referrers y endpoints API (100% pruebas pasando).

---

## [0.5.0-beta] - 2026-08-16

### Agregado
- **Verificación Just-in-Time con `TurnstileModal` (`REQ-01`):**
  - Creación del componente modal accesible y reutilizable `src/components/ui/TurnstileModal.tsx`.
  - Carga bajo demanda (`on-demand lazy loading`): Turnstile solo se monta y ejecuta cuando el usuario presiona "Enviar" y los campos locales obligatorios ya fueron validados.
  - Flujo `auto-submit`: al completarse la verificación anti-bot en milisegundos, despacha inmediatamente la petición al backend, cerrando el modal de forma fluida con feedback visual animado.
  - Reducción estimada del **40% al 70%** en solicitudes y consumo de APIs de terceros (zero-waste requests en visitas y rebotes) y eliminación completa de expiraciones de tokens por tiempo de redacción.

- **Estandarización en Todos los Formularios Públicos (`REQ-02`):**
  - Migración a `TurnstileModal` en:
    1. **Publicar Propuesta / Idea:** `src/app/ideas/nueva/page.tsx` (`proponer_idea`).
    2. **Registro de Voluntariado:** `src/app/voluntarios/page.tsx` (`registro_voluntario`).
    3. **Solicitud de Asistencia Legal:** `src/app/recursos/page.tsx` (`asistencia_legal`).
    4. **Postulación de Moderadores:** `src/app/admin/registro/page.tsx` (`postulacion_moderador`).
    5. **Comentarios y Aportes Ciudadanos:** `src/app/ideas/[id]/page.tsx` (`comentar_idea`).

---

## [0.4.1-beta] - 2026-08-16

### Agregado
- **Propuesta «Corag Ayuda Directa (Eje Cafetero)» en el Banco de Ideas (`REQ-01`):**
  - Incorporación en `src/db/seed.ts` y persistencia en base de datos SQLite de la iniciativa cívico-tecnológica `Corag Ayuda Directa` (`idea-corag-eje-cafetero`) en categoría `Tecnología` y estado `en_accion`.
  - Vinculación interactiva y clickeable al mapa vivo de necesidades y puntos de ayuda: [`https://ayuda.corag.app/emergencias/eje-cafetero/puntos-de-ayuda`](https://ayuda.corag.app/emergencias/eje-cafetero/puntos-de-ayuda) y al portal oficial [`http://corag.app/`](http://corag.app/).
  - Cobertura regional focalizada en Caldas, Risaralda y Quindío (**Eje Cafetero**).

---

## [0.4.0-beta] - 2026-08-16

### Agregado
- **Generador Asistido de Derecho de Petición Oficial en `/recursos` (`REQ-02`):**
  - Sección interactiva y guiada para estructurar derechos de petición ante emergencias, con previsualización en vivo y botón para copiar texto completo al portapapeles.
  - Generador dinámico en cliente (`src/lib/docx-generator.ts`) basado en la plantilla institucional `public/modelo-de-peticion.docx` utilizando `jszip`. Rellena automáticamente fechas, identificación, hechos, peticiones y entidades competentes según el departamento (Gobernación del Valle / Departamental, Alcaldía Municipal y UNGRD) con fundamentos de la Ley 1755 de 2015 y jurisprudencia constitucional.
  - Casillas obligatorias de consentimiento informado de datos personales (Ley 1581 de 2012) y descargo de responsabilidad cívica.

- **Bandeja de Asistencia Legal y Articulación con Abogados Voluntarios en `/admin` (`REQ-03`):**
  - **Base de datos:** Migración SQLite `005_add_solicitudes_asistencia_legal.sql` creando la tabla `solicitudes_asistencia_legal` con índices por estado, departamento y municipio.
  - **Dominio, DAL y Servicios:** Interfaces en `src/core/domain/solicitud-legal.ts`, repositorio `SolicitudLegalRepository`, validaciones Zod y `LegalService` con sanitización XSS estricta y control de acceso RBAC.
  - **Endpoints API:** `/api/recursos/asistencia-legal` (GET con filtros/conteos y POST público protegido con captcha) y `/api/recursos/asistencia-legal/[id]` (GET, PATCH y DELETE).
  - **Panel Administrativo:** Nueva pestaña *"Asistencia Legal"* en `/admin` con tarjeta KPI, filtro por estado (`pendiente`, `en_contacto`, `atendida`, `cerrada`), asignación de abogado solidario y botones de contacto directo por WhatsApp (`wa.me`) y correo electrónico.

### Corregido
- **Estabilización de Cloudflare Turnstile en Formularios Públicos (`REQ-01`):**
  - Refactorización de `src/components/ui/TurnstileWidget.tsx` con almacenamiento de callbacks (`onSuccess`, `onError`, `onExpire`) en `useRef`, reducción de dependencias del `useEffect` e integración con `React.memo`.
  - Eliminación total del parpadeo, desmonte y reinicio continuo del widget de seguridad anti-bot mientras el usuario escribe en los campos de texto de `/ideas/nueva`, `/voluntarios` y `/recursos`.

---

## [0.3.0-beta] - 2026-08-16

### Agregado
- **Integración del Favicon Institucional Oficial (`REQ-01`):**
  - Configuración del isotipo del asterisco humanitario en `src/app/layout.tsx` mediante `metadata.icons` (`icon`, `shortcut`, `apple`) y `<link rel="icon">` apuntando a `public/favicon-actuemos-ya-colombia-asterisco.ico`.

- **Solicitud de Voluntarios y Brigadistas en el Ciclo de Vida de Ideas (`REQ-02`):**
  - **Base de datos:** Migración SQLite `004_add_voluntarios_to_ideas.sql` agregando `requiere_voluntarios`, `cantidad_voluntarios` y `perfil_voluntarios` a la tabla `ideas`.
  - **Dominio y Validaciones:** Actualización de interfaces y DTOs en `src/core/domain/idea.ts` y esquemas Zod en `src/lib/validations/index.ts`.
  - **Formulario de Publicación (`/ideas/nueva`):** Checkbox interactivo *"¿Esta propuesta requiere voluntarios o brigadistas en terreno?"* que despliega dinámicamente inputs para la cantidad estimada y el perfil o rol requerido.
  - **Detalle de Propuesta (`/ideas/[id]`):** Banner destacado de convocatoria de voluntariado activa y badge en los metadatos del artículo.
  - **Tarjetas de Ideas (`/ideas` y `/`):** Pill visual indicando la cantidad de voluntarios solicitados por la iniciativa.

- **Regla Operativa en PLAYBOOK.md:**
  - Inclusión de la regla obligatoria de actualización de `CHANGELOG.md` tras cada modificación notable o historia completada.

---

## [0.2.2-beta] - 2026-08-16

### Agregado
- **Pipeline de Integración Continua (CI) en GitHub Actions (`REQ-01`):**
  - Creación del flujo de trabajo automatizado en `.github/workflows/ci.yml` ejecutado en `push` y `pull_request` dirigidos a `main`.
  - Concurrencia con `cancel-in-progress: true` para optimizar el uso de runners.
  - Validación secuencial de instalación limpia (`npm ci`), linter (`npm run lint`), verificación de tipos (`npx tsc --noEmit`), suite de pruebas (`npm test`) y compilación de producción (`npm run build`).

- **Autenticación Master Admin con Contraseña (`cam960210@gmail.com`) (`REQ-03`):**
  - Configuración de la variable de entorno `ADMIN_MASTER_PASSWORD` en `.env` y `.env.example`.
  - Creación del endpoint `/api/auth/master-login` con rate limiting estricto anti fuerza bruta (máximo 5 intentos/min) y validación criptográfica en tiempo constante (`timingSafeEqual`).
  - Detección reactiva en `/admin/login`: al ingresar `cam960210@gmail.com` se revela fluidamente el campo de contraseña para acceso directo de 30 días (`auth_session`), preservando el flujo de Magic Links para los demás supervisores.

### Corregido
- **Interactividad y Clickeabilidad de Iniciativas Vinculadas en Tarjetas (`REQ-02`):**
  - Integración del enlace de iniciativa externa vinculada interactivo y clickeable en las propuestas destacadas del Home (`/`), directorio de ideas (`/ideas`) y panel de moderación (`/admin`).
  - Normalización de protocolo `https://`, prevención de propagación de eventos (`e.stopPropagation()`), apertura en nueva pestaña (`_blank`) y truncado accesible de texto.

---

## [0.2.1-beta] - 2026-08-16

### Corregido
- **Renderizado Markdown en Detalle de Ideas y Comentarios (`REQ-01`):**
  - Implementación del componente modular y seguro `MarkdownRenderer.tsx` para parsear negritas, cursivas, listas con viñetas, listas ordenadas, citas en bloque y enlaces externos seguros con `target="_blank"` y `rel="noopener noreferrer"`.
  - Integración en `/ideas/[id]` para la descripción de la propuesta y en el hilo de aportes/comentarios y respuestas ciudadanas.

- **Optimización de Interfaz Móvil y Botón Flotante (`REQ-02`):**
  - Descongestión del encabezado superior (`Navbar`) en pantallas móviles (`< md`), mostrando únicamente el Logotipo institucional y el menú hamburguesa.
  - Creación de un Floating Action Button (FAB) persistente en la esquina inferior derecha (`bottom-6 right-6`) para "Proponer Idea" en dispositivos móviles.

- **Protección Visual de Acceso de Desarrollo en Producción (`REQ-03`):**
  - Ocultamiento condicional del botón *"⚡ Acceso Rápido de Desarrollo"* en `/admin/login` cuando `NODE_ENV === 'production'`.

- **Enlaces Clickeables en Tarjetas de Ideas (`REQ-04`):**
  - Conversión del badge de iniciativas existentes vinculadas en `/ideas` a enlaces interactivos directos con apertura en nueva pestaña y `e.stopPropagation()` para evitar navegación no deseada.

- **Integración Canónica de Cloudflare Turnstile (`REQ-05`):**
  - Configuración del widget con la sitekey oficial `0x4AAAAAAERMwI1eCPwFzmgW`, soporte para acciones (`proponer_idea`, `comentar_idea`, `postulacion_moderador`, `registro_voluntario`), callbacks de ciclo de vida y defaults en `Dockerfile` y `docker-compose.yml`.

---

## [0.2.0-beta] - 2026-08-16

### Agregado
- **Integración Global y Dinamización del Hub Principal (`/`) (REQ-01):**
  - Conexión del Hub de Emergencia en tiempo real a la base de datos de propuestas comunitarias con renderizado dinámico de ideas en acción, promovidas y abiertas (`/api/ideas?limit=4&order=desc`).
  - Barra de búsqueda global unificada con redirección directa a los listados filtrados.
  - Cuadrícula de accesos directos de alta prioridad de 6 módulos:
    1. 💡 *Proponer Solución* (`/ideas/nueva`)
    2. 🔍 *Buscar Personas / Mascotas* (`/busqueda` ➔ ColombiaTeBusca + MiGenteVe)
    3. 🏛️ *Trámites de Alcaldía (RUD)* (`/recursos`)
    4. 🤝 *Talento Técnico* (`/voluntarios`)
    5. 🌐 *Iniciativas Activas* (`/iniciativas`)
    6. 💬 *Muro Comunitario* (`/ideas`)
  - Barra de marcado telefónico directo 24/7 a Línea 123 (Emergencias), 132 (Cruz Roja), 144 (Defensa Civil) y Medicina Legal.
  - Tarjetas de articulación prioritaria de búsqueda humanitaria y canales oficiales del Estado Colombiano (UNGRD, RUV, Cruz Roja RCF, Defensa Civil).

---

## [0.1.0-beta] - 2026-08-16

### Agregado
- **Página Institucional: Sobre Nosotros (`/sobre-nosotros`) (REQ-01):**
  - Misión, origen y principio cívico de anti-duplicación ante emergencias en Colombia.
  - Declaración explícita de Neutralidad Cívica y Apolitismo (plataforma comunitaria 100% independiente, apolítica y sin fines comerciales).
  - Perfiles de los fundadores: **Juan Camilo Castaño Bonilla** (Desarrollador Senior de Software) y **Juan David Nuñez Aljure** (Articulación Comunitaria & Data Analyst) con enlaces a LinkedIn.
  - Filosofía de código abierto bajo licencia MIT (*"Todos unidos hacemos más"*).
  - Enlazado exclusivamente en el pie de página (`Footer`).

- **Guías Cívicas y Trámites de Alcaldía: Recursos (`/recursos`) (REQ-02):**
  - Repositorio interactivo con 5 guías paso a paso de trámites clave ante entidades públicas en emergencias:
    1. *Registro Único de Damnificados (RUD — UNGRD / Alcaldías)*.
    2. *Certificados Médicos y Registro Civil de Defunción por Desastre (RUAF-ND / Notarías / Medicina Legal)*.
    3. *Declaración y Registro Único de Víctimas (RUV — Unidad para las Víctimas)*.
    4. *Subsidio de Arrendamiento Temporal y Asistencia Habitacional*.
    5. *Directorio y Descarga de Formatos Oficiales y Circulares*.
  - Buscador interactivo por palabra clave y filtrado por pestañas temáticas.
  - Advertencia anti-fraude destacada sobre la total gratuidad de los trámites ante el Estado.

- **Reorganización de la Barra de Navegación (REQ-03):**
  - Se retiró el acceso directo de `Admin` del menú superior `Navbar`.
  - Se agregó el enlace directo a `/recursos` en `Navbar` y `Footer`.
  - Los accesos de administración (`/admin/login` y `/admin/registro`) permanecen accesibles en el `Footer`.

---

## [0.0.4-beta] - 2026-08-16

### Agregado
- **Paginación Progresiva y Filtros Cronológicos Globales (REQ-01, REQ-02):**
  - Carga progresiva por lotes con botón *"Cargar Más"* e indicador de conteo en vistas públicas: Directorio de Iniciativas (`/iniciativas`), Banco de Talento (`/voluntarios`) y Banco de Ideas (`/ideas`).
  - Buscador global conectado en backend (`?search=...`) con *debounce* de 350 ms.
  - Selector de orden cronológico (`Más recientes primero` / `Más antiguos primero`) en todas las vistas públicas.
  - Paginador numérico clásico (`< Anterior`, `Página X de Y`, `Siguiente >`) con selector de orden FIFO/LIFO en todas las pestañas de `/admin` (Borradores, Voluntariados, Iniciativas, Alertas y Supervisores).

### Corregido
- **Filtros por Categoría en Directorio de Iniciativas (`BUG-01`):**
  - Corrección de discrepancias en `src/db/seed.ts` y en el repositorio DAL (`IniciativaRepository.findMany`), permitiendo que las pestañas *ONGs y Fundaciones* y *Colectivos y Brigadas* filtren correctamente las iniciativas activas.

---

## [0.0.3-beta-2] - 2026-08-16

### Agregado
- **Integración Oficial del SDK de Resend y Vercel Best Practices:**
  - Adición del paquete oficial `resend` en backend [`src/core/services/email.service.ts`](file:///Users/juancamilo/Documents/actuemos-ya-colombia/src/core/services/email.service.ts).
  - Implementación del patrón singleton lazy (`getResend(apiKey)`) para evitar re-instanciaciones innecesarias por solicitud.
  - Soporte transparente para `RESEND_API_KEY` y `SMTP_PASS` con prefijo `re_`, manteniendo compatibilidad con transporte SMTP de Nodemailer y simulador local de consola para testing.

---



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
