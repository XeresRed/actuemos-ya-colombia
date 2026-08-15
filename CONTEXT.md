# 🌍 CONTEXT.md: Contexto de Negocio, Dominio y Operación Humanitaria

## 1. Contexto de la Emergencia

Ante un desastre natural de gran escala (como un terremoto), las primeras 72 horas son críticas. En este periodo convergen tres dinámicas simultáneas:

1. **Saturación y Fragmentación de la Información:** Cientos de grupos de WhatsApp, publicaciones en redes sociales y cadenas no verificadas dispersan la atención pública y generan desinformación.
2. **Duplicación de Esfuerzos (Reinventar la Rueda):** Decenas de colectivos intentan crear herramientas o campañas idénticas desde cero en lugar de sumar fuerzas a iniciativas que ya están operativas.
3. **Descoordinación entre Necesidades y Recursos:** Profesionales calificados desean ayudar pero no saben dónde se requiere su conocimiento técnico específico; al mismo tiempo, ONGs en campo carecen de personal especializado.


> **Misión de la Plataforma:** Actuar como un punto neurálgico ágil, público y ligero que canalice propuestas ciudadanas , coordine talento , visibilice personas/mascotas no localizadas y dirija el tráfico hacia las causas que ya están funcionando en el terreno.

---

## 2. Arquetipos de Usuario y Actores del Ecosistema

| Actor | Motivación Principal | Interacciones Clave en la App |
| ----- | -------------------- | -------------------------------|
|Ciudadano / Afectado | Solicitar ayuda, buscar a un familiar o mascota , o proponer una idea para su comunidad. | Crea ideas (con email o anónimo) , registra reportes de búsqueda , comenta en propuestas. |
| Profesional Solidario | Donar su tiempo y especialidad técnica (médicos, arquitectos, psicólogos, diseñadores). | Publica su disponibilidad técnica o aplica a solicitudes de ONGs.|
| ONG / Colectivo en Campo | Conseguir voluntarios especializados y difundir su causa oficial. |Registra necesidades de personal técnico , vincula sus plataformas oficiales. |
| Supervisor | Filtrar spam, curar contenido y validar la viabilidad de las ideas. | Revisa borradores anónimos , promueve propuestas viables y modera comentarios. |
| Administrador | Coordinación estratégica, gestión de moderadores y alianzas con iniciativas activas. | Invita supervisores , gestiona el directorio de iniciativas oficiales y define el ciclo de vida de propuestas.|

---

## 3. Glosario del Dominio y Conceptos Clave

- **Banco de Ideas:** Espacio colaborativo abierto donde la ciudadanía propone soluciones prácticas ante las consecuencias de la crisis.
- **Iniciativa Activa:** Proyecto, aplicación web, albergue, brigada u ONG oficial que ya está ejecutando soluciones en el país.
- **Redirección de Idea:** Acción de vincular una idea ciudadana a una Iniciativa Activa existente para evitar la fragmentación de recursos y centralizar los esfuerzos de ayuda.
- **Alcance de Impacto:** Nivel de cobertura de una idea o solicitud (general, region, ciudad, grupo_especifico).
- **Matching Profesional:** Conexión puntual y sin intermediarios burocráticos entre una habilidad técnica específica y una necesidad logística/operativa.
- **Reporte de Búsqueda:** Ficha humanitaria estandarizada para visibilizar y registrar el estado de personas o mascotas no localizadas o rescatadas.

---

## 4. Pipeline de Vida de las Ideas

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

1. **borrador:** Envío anónimo protegido por captcha. Oculto al público hasta que un Supervisor valide que no es spam ni desinformación.
2. **idea:** Propuesta validada por OTP o moderador. Visible para toda la comunidad, abierta a debate con comentarios en Markdown y difusión en redes.
3. **promovida:** Cuenta con tracción, necesidad comprobada y viabilidad. Se busca líder o equipo para coordinar su ejecución.
4. **en_accion:** Colectivo, ONG o equipo ciudadano asignado y trabajando activamente en el terreno o en el desarrollo de la solución.
5. **redirigida:** Se detecta que ya hay una solución pública operando. Se congela la idea y se provee el enlace directo hacia la iniciativa existente.
6. **cerrada:** Objetivo alcanzado con éxito o archivada por pérdida de vigencia o inviabilidad técnica.

---

## 5. Principios de Experiencia y Filosofía Operativa

- **Cero Fricción (Passwordless):** En una crisis nadie quiere crear contraseñas ni pasar por procesos largos de registro. Para interactuar como admin/supervisor se usan Magic Links; para publicar como ciudadano, OTP de 6 dígitos o modo anónimo.
- **Ultra-Bajo Consumo de Datos:** La infraestructura local y las redes móviles suelen estar dañadas o saturadas tras un sismo. El sitio debe pesar pocos kilobytes, renderizar en servidor y cargar de inmediato incluso en conexiones 3G intermitentes.
- **Viralidad Útil:** Cada idea, reporte de persona/mascota o solicitud técnica debe compartirse con un clic en WhatsApp, Telegram y redes sociales con una tarjeta visual clara (OpenGraph dinámico).
- **Resguardo de Datos Sensibles:** La información de personas desaparecidas o vulnerables se procesa con moderación activa para mitigar extorsiones, fraudes o exposición indebida.

---

## 6. Restricciones del Entorno de Ejecución

- **Servidor Económico:** DigitalOcean Droplet de 1 vCPU, 1 GB de memoria RAM y 10 GB de disco SSD.
- **Memoria Estricta:** Límite de 600 MB por contenedor Docker y 2 GB de memoria Swap para evitar fallos por saturación (OOM).
- **Base de Datos Embebida:** SQLite configurado con modo WAL (Write-Ahead Logging) para lecturas rápidas sin sobrecarga de un motor DBMS dedicado.
- **Cero Costo en Certificados:** Caddy Server aprovisiona y renueva SSL automáticamente vía Let's Encrypt sin costo ni mantenimiento manual.
