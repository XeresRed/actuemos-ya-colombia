---
name: ActuemosYaColombia
colors:
  surface: '#fff8f7'
  surface-dim: '#f1d3d0'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e7'
  surface-container-high: '#ffe2de'
  surface-container-highest: '#f9dcd9'
  on-surface: '#271816'
  on-surface-variant: '#5b403d'
  inverse-surface: '#3e2c2a'
  inverse-on-surface: '#ffedeb'
  outline: '#8f6f6c'
  outline-variant: '#e4beba'
  surface-tint: '#ba1a20'
  primary: '#af101a'
  on-primary: '#ffffff'
  primary-container: '#d32f2f'
  on-primary-container: '#fff2f0'
  inverse-primary: '#ffb3ac'
  secondary: '#005db7'
  on-secondary: '#ffffff'
  secondary-container: '#64a1ff'
  on-secondary-container: '#003670'
  tertiary: '#715300'
  on-tertiary: '#ffffff'
  tertiary-container: '#8f6a00'
  on-tertiary-container: '#fff3e3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#930010'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#a9c7ff'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#00468c'
  tertiary-fixed: '#ffdfa0'
  tertiary-fixed-dim: '#f8bd2a'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#fff8f7'
  on-background: '#271816'
  surface-variant: '#f9dcd9'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built on the principles of **Urgency, Trust, and Accessibility**. It serves as a bridge between immediate humanitarian needs and institutional action. The visual style is **Corporate Modern with a High-Contrast edge**, ensuring that critical information is never missed while maintaining a professional, reliable atmosphere.

The brand personality reflects a "calm in the storm" approach: bold color accents for immediate attention, balanced by structured, systematic layouts that convey stability. Subtle nods to Colombian identity are integrated through the color palette—using a refined interpretation of the national tricolor—without compromising the utility of the interface. In titles and navigation wordmarks, the word **Colombia** reflects the national flag: **Col** (Amarillo Dorado `#D97706`), **omb** (Azul Confianza `#005DB7`), **ia** (Rojo Acción `#AF101A`).

**Design Goals:**
- **Clarity under pressure:** High information density that remains scannable.
- **Universal access:** High contrast ratios and clear typography for diverse users across various devices.
- **Action-oriented:** Visual weight is heavily skewed toward interactive elements and status indicators.

## Colors

The palette utilizes "Action Red" as the primary driver for urgency and emergency reporting. "Trust Blue" functions as the secondary color, providing an institutional anchor for navigation and official statements. Yellow is used sparingly as a tertiary accent for "In Progress" or "Caution" states, rounding out the Colombian-inspired palette.

- **Action Red (#D32F2F):** Used for primary CTAs, critical alerts, and "Immediate Action Required" statuses.
- **Trust Blue (#1565C0):** Used for headers, institutional links, and verification badges.
- **Success Green (#2E7D32):** Used for resolved cases and successful submissions.
- **Neutrals:** A range of cool grays (from #F8F9FA to #212121) ensures background surfaces provide maximum legibility for text content.

## Typography

This design system uses a dual-font strategy. **Montserrat** is used for headlines to provide a bold, confident, and urgent presence. **Inter** is used for body copy and labels to ensure maximum legibility and a systematic, clean feel.

- **Headlines:** Should always be high-contrast (Dark Gray or Trust Blue). Use `display-lg` only for hero sections or critical statistics.
- **Body:** `body-md` is the standard for reports and descriptions. Use `body-lg` for lead paragraphs.
- **Labels:** Use `label-md` for status badges and buttons to maintain a clear, authoritative tone.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout is optimized for information density, allowing multiple reports to be visible at once without causing cognitive overload.

- **Information Density:** Vertical rhythm is strictly maintained using 8px increments.
- **Margins:** 16px on mobile to maximize screen real estate; 32px on desktop to provide breathing room.
- **Grid Behavior:** On tablet (768px+), the layout transitions to an 8-column grid. Cards should span 4 columns (3 per row) on desktop and 12 columns (1 per row) on mobile.

## Elevation & Depth

To maintain an atmosphere of efficiency and clarity, the design system avoids heavy shadows or decorative blurs. Depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Neutral base (#F8F9FA).
- **Level 1 (Cards/Surfaces):** Pure white background with a 1px border (#E0E0E0). This creates a "document" feel that suggests officiality.
- **Level 2 (Hover/Active):** A subtle, highly diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to indicate interactivity without breaking the flat, urgent aesthetic.
- **Critical Overlays:** Modals use a high-opacity dark overlay (70%) to force focus during emergency reporting.

## Shapes

The shape language is **Soft but Structured**. Using a subtle border radius (4px/0.25rem) ensures the UI feels modern and approachable while maintaining the serious, professional tone required for humanitarian aid.

- **Buttons & Inputs:** Use the standard `rounded` (4px).
- **Badges/Chips:** Use `rounded-xl` (12px) to create a distinct visual shape that contrasts against the rectangular nature of cards and headers.
- **Cards:** Use `rounded-lg` (8px) to softly frame content groups.

## Components

### Buttons
- **Primary (Emergency):** Action Red background, white text. Bold, uppercase labels.
- **Secondary (Institutional):** Trust Blue border, Trust Blue text, transparent background.
- **Tertiary:** Gray text, no border, used for "Cancel" or "Back" actions.

### Status Badges
Badges use high-contrast combinations for instant recognition:
- **Idea:** Light Blue background, Dark Blue text.
- **Promovida:** Light Yellow background, Dark Brown text.
- **En Acción:** Light Red background, Dark Red text.
- **Completada:** Light Green background, Dark Green text.

### Cards
Report cards feature a "Priority Header"—a thick 4px top-border in the status color. Content is left-aligned with a clear separation between the headline, the timestamp, and the location.

### Input Fields
Inputs must be highly visible with 16px padding and a 1px gray border that turns Trust Blue on focus. Error states use a 2px Action Red border and supporting error text.

### Progress Indicators
Used for "Promovida" cases to show funding or resource acquisition. Use a thick 8px track with high-contrast Success Green for the fill.

### Emergency Banner (Alerta de Crisis Dinámica)
Componente de máxima jerarquía visual fijado en la cabecera superior del viewport:
- **Nivel Crítica (`critica`):** Fondo Action Red (`#D32F2F`), texto `#FFFFFF`, icono `warning` con micro-animación pulsante.
- **Nivel Alerta Naranja (`alerta_naranja`):** Fondo Ámbar de Advertencia (`#8F6A00` / `#FFF3E3`), texto de alto contraste, icono `priority_high`.
- **Nivel Informativa (`informativa`):** Fondo Trust Blue (`#1565C0`), texto `#FFFFFF`, icono `info`.
- **Líneas de Auxilio Rápido:** Pastillas interactivas de marcado telefónico directo (`tel:123`, `tel:132`, `tel:144`, `tel:119`) con tipografía `label-sm` en negrita.

### Tarjetas de Organismos Oficiales & Avisos de Registro de Víctimas
- **Sello Institucional:** Borde superior Trust Blue (`#1565C0`) de 4px, badge `OFICIAL VERIFICADO` con fondo `secondary-fixed` y texto `on-secondary-fixed`.
- **Avisos de Búsqueda Humanitaria:** Caja de alerta preventiva en `/busqueda` con borde outline ámbar que instruye al usuario a acudir primero a la Cruz Roja (*RCF*) y a la UNGRD (*RUND* / Sala de Crisis).