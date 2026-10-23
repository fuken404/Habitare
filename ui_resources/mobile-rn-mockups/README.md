# Handoff: Habitare — App Móvil (React Native)

## Overview

Habitare es una app móvil de gestión para conjuntos residenciales. Dos roles con flujos completamente separados:

- **Residente**: paga cuotas, autoriza visitantes, reporta novedades, hace PQRS, reserva zonas comunes, consulta comunicados y paquetes.
- **Guardia de seguridad**: registra ingresos, escanea QR de visitantes, consulta reportes y zonas comunes.

Este paquete incluye el sistema de diseño completo + 33 pantallas en alta fidelidad listas para implementar.

---

## About the design files

Los archivos de este bundle son **referencias de diseño hechas en HTML/React/JSX** — prototipos que muestran la apariencia y el comportamiento previstos. **No son código de producción para copiar directamente.**

La tarea es **recrear estos diseños en React Native + Expo Router + NativeWind v4**, siguiendo los patrones del codebase existente:

- React Native + Expo SDK (último)
- Expo Router (file-based routing)
- NativeWind v4 (Tailwind CSS para RN)
- Tipografía vía `expo-google-fonts/plus-jakarta-sans`
- Íconos vía `@expo/vector-icons` → set Ionicons
- Light mode únicamente

Cada componente del HTML mockup tiene un equivalente en React Native: `<div>` → `<View>`, `<span>`/texto → `<Text>`, `<button>` → `<Pressable>`/`<TouchableOpacity>`, `<input>` → `<TextInput>`, `ScrollArea` → `<ScrollView>`, `<img>` → `<Image>` o `<SvgUri>` para SVG.

Para abrir el mockup como referencia visual: abre `Habitare.html` en un navegador moderno.

---

## Fidelity

**High-fidelity (hifi).** Todos los valores son finales y deben implementarse pixel-perfect:
- Colores con hex exactos
- Spacing en px (mapear directo a Tailwind o a una escala 4-pt)
- Tipografía: Plus Jakarta Sans con pesos 400/500/600/700
- Radii: 10/12/14/16/20/24 px según componente
- Sombras suaves (no dramáticas)

---

## Tech stack target

```
expo                  ^52+
expo-router           ^4+
nativewind            ^4+
react-native-svg      (para los logos SVG y QR mock)
@expo/vector-icons    (Ionicons)
expo-google-fonts/plus-jakarta-sans
expo-google-fonts/jetbrains-mono   (para mono/radicados)
expo-camera           (para S4 escáner QR)
expo-barcode-scanner  (idem)
react-native-qrcode-svg   (para R3 mostrar QR)
date-fns / dayjs      (para fechas en español)
```

Setup mínimo de NativeWind v4: `tailwind.config.js` con `presets: [require('nativewind/preset')]` + `content` apuntando a `./app/**/*.{js,jsx,ts,tsx}` y `./components/**/*.{js,jsx,ts,tsx}`. Pon los tokens (paleta + escala tipográfica) en `tailwind.config.js → theme.extend`.

---

## Design tokens

### Paleta

Implementar en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      // Brand
      primary:       '#1F6B55',
      'primary-dark':'#14513F',
      'primary-deep':'#0E3D2E',
      'primary-soft':'#E8F1ED',
      'primary-muted':'#C7DBD2',
      accent:        '#E8A968',
      'accent-dark': '#C28244',
      'accent-soft': '#FBEEDC',

      // Surfaces
      bg:            '#F7F4EE', // scaffold (warm off-white)
      white:         '#FFFFFF',

      // Neutrals (warm)
      gray: {
        50:  '#F8F6F1',
        100: '#EFECE5',
        200: '#E2DED4',
        300: '#C9C4B7',
        400: '#A39E8F',
        500: '#736E62',
        600: '#52503F',
        700: '#3A3830',
        800: '#26241D',
        900: '#16140E',
      },

      // Semantic
      'success-bg':     '#E2F1E7',
      'success-text':   '#1E7D4D',
      'success-border': '#B6DCC2',
      'warning-bg':     '#FBF1D9',
      'warning-text':   '#9C6A00',
      'warning-border': '#EFDCA5',
      'danger-bg':      '#FBE5E1',
      'danger-text':    '#B23A33',
      'danger-border':  '#F2C5BD',
      'info-bg':        '#E2ECF7',
      'info-text':      '#1F5AA0',
      'info-border':    '#BAD0EA',
    },
  },
}
```

### Tipografía

Font family: `'Plus Jakarta Sans'` (cargada con `expo-google-fonts/plus-jakarta-sans`).
Mono: `'JetBrains Mono'` (para radicados, fechas técnicas, IDs).

| Token  | size | weight | lineHeight | letterSpacing |
|--------|------|--------|------------|---------------|
| display| 32   | 700    | 1.10       | -0.6          |
| h1     | 24   | 700    | 1.20       | -0.4          |
| h2     | 20   | 700    | 1.25       | -0.3          |
| h3     | 18   | 600    | 1.30       | -0.2          |
| bodyLg | 16   | 400    | 1.50       | 0             |
| body   | 15   | 400    | 1.50       | 0             |
| bodySm | 14   | 400    | 1.45       | 0             |
| small  | 12   | 500    | 1.40       | 0             |
| badge  | 11   | 600    | 1.30       | 0.3 (UPPERCASE) |

### Spacing scale (px)

`4, 8, 12, 16, 20, 24, 32, 40, 48` — usar la escala Tailwind por defecto (`p-1`, `p-2`, etc.) que ya cubre esto.

### Radii

| Token | px | Uso |
|-------|----|-----|
| sm    | 8  | chips menores |
| md    | 10 | badges |
| lg    | 12 | buttons, inputs |
| xl    | 14 | inputs grandes |
| 2xl   | 16 | cards |
| 3xl   | 20 | cards destacadas, modals |
| pill  | 9999 | chips, FAB |

### Shadows (suaves)

```css
shadow-1: 0 1px 2px rgba(20,20,15,.04)
shadow-2: 0 2px 6px rgba(20,20,15,.06), 0 1px 2px rgba(20,20,15,.04)
shadow-3: 0 6px 16px rgba(20,20,15,.08), 0 2px 4px rgba(20,20,15,.05)
FAB:      0 6px 16px rgba(31,107,85,.32), 0 2px 4px rgba(31,107,85,.18)
```

En React Native: usar `elevation` (Android) + `shadowOffset/Opacity/Radius` (iOS) o un wrapper como `nativewind` plugin de sombras.

---

## Component library (base)

Todos los componentes están implementados en `habitare-components.jsx`. Resumen de specs:

### Button
- Variantes: `primary | secondary | text | destructive | onDark | ghost`
- Tamaños: `lg (52px) | md (44px) | sm (36px)`
- Radio: 12 · padding horizontal: lg 24 / md 18 / sm 14
- Tipo: 16/14 px, weight 600
- Soporta `icon` (izquierda) y `iconRight` (derecha), gap 8
- `primary`: bg `primary`, texto blanco
- `secondary`: bg blanco, border 1.5px `primary`, texto `primary`
- `destructive`: bg blanco, border 1.5px `danger-text`, texto `danger-text`
- `onDark`: bg blanco, texto `primary-dark` (para colocar sobre superficie primary)

### Card
- Bg `white`, border 1px `gray-200`, radius 16
- Padding default 16
- Sin sombra por defecto (usa `shadow-1` solo en cards interactivas)

### Badge
- Radius 10, padding `5px 10px` (md) / `3px 7px` (sm)
- Type style: badge (11/600/uppercase/letterSpacing 0.3)
- Tones: `success | warning | danger | info | neutral | primary | accent | dark`
- Cada tone tiene par `bg + fg` (ver tokens semánticos)
- Optional `dot` (puntito del color del texto, 6×6) a la izquierda

### Input
- Altura 52 (single line) o min-height 96 (multiline)
- Bg `white`, border 1.5px `gray-200` (normal) o `danger-text` (error)
- Radius 12, padding `0 14px`
- Optional `icon` (left, 20px, color `gray-400`) y `iconRight`
- Label arriba: small/600/`gray-700`, gap 6
- Helper text abajo: small/normal/`gray-500` o `danger-text` si error

### Avatar
- Circle (radius = size/2)
- Bg default `primary-soft`, color `primary-dark`
- Variantes color por tono (`gray`, `accent`, etc.)
- Font size = `0.4 × size`, weight 700, tracking -0.3

### BottomNav
- Altura visible: 52px + 34px safe area (home indicator iOS) = 86px total
- Bg `white`, border-top 1px `gray-200`
- 5 ítems, flex equal
- Item: icon 24px (top, color `primary` si activo, `gray-400` si no) + label 11px (`primary` si activo bold700, `gray-500` regular)
- Badge: dot rojo `danger-text`, 8×8 absolute top:-4 right:-8, opcional con número

#### Variantes de bottom nav

```js
RESIDENT_NAV = [
  { icon: 'home-outline',        label: 'Inicio'      },
  { icon: 'people-outline',      label: 'Visitantes'  },
  { icon: 'card-outline',        label: 'Pagos'       },
  { icon: 'megaphone-outline',   label: 'Comunicados' },
  { icon: 'grid-outline',        label: 'Más'         },
];

SECURITY_NAV = [
  { icon: 'alert-circle-outline',label: 'Reportes'    },
  { icon: 'people-outline',      label: 'Visitantes'  },
  { icon: 'home-outline',        label: 'Inicio'      },
  { icon: 'leaf-outline',        label: 'Zonas'       },
  { icon: 'megaphone-outline',   label: 'Comunicados' },
];
```

### FAB (Floating Action Button)
- Absolute, right:20, bottom:100 (encima del bottom nav)
- Bg `primary`, color blanco
- Altura 56, radius 28 (circle) o pill si tiene label
- Shadow FAB (ver tokens)
- Icon 22 + label opcional 15/600

### Chip
- Radius pill (9999), padding `8px 14px`
- Inactive: bg `white`, border `gray-200`, color `gray-700`
- Active: bg `gray-900`, color `white`, border `gray-900`
- Type: bodySm/600

### Banner
- Radius 12, padding `14px`
- Display flex, gap 12
- Icon 20px arriba a la izquierda
- Title (body/600/tone-text) + body opcional (bodySm/tone-text/0.85 opacity)
- Tones: `success | warning | danger | info` (bg + border + text definidos en tokens)

### EmptyState
- Center, flex column, gap 12, padding `40px 32px`
- Circle 64×64 radius 32 con icon 28px en `gray-500`
- Title h3
- Subtitle body/gray-500/maxWidth 280
- Action opcional debajo

### Logo
- 3 variantes en `assets/`:
  - `habitare-logo.svg` (flat — verde sobre transparente)
  - `habitare-logo-chip.svg` (verde sobre primary-soft 26% radius)
  - `habitare-logo-inverse.svg` (blanco sobre primary 26% radius)
- Cargar con `react-native-svg` (`<SvgUri />` o copiar como componente Svg con paths)
- Tamaños usados: 24/32/36/44/52/72/88/96/120 px

### QR display (R3)
- Cuadrado 210×210, blanco, radius 8
- Generar con `react-native-qrcode-svg` (color `gray-900`)

### Status pill / Stat / Timeline / MiniCalendar / Viewfinder
Implementaciones específicas — referenciar el código JSX correspondiente:
- Timeline: vertical line `gray-200` 2px, dots 16×16 con borde 2px (`primary` si "tú", `gray-300` si admin)
- MiniCalendar: grid 7 cols, cell aspect 1:1, día seleccionado bg primary radius 10, hoy dot debajo
- Viewfinder: 4 esquinas L 26×26 con stroke 3.5px blanco, scan line con glow

---

## Inventario de pantallas (33)

> Resolución target: **iPhone 14 Pro 390×844** (light mode). El diseño respeta safe areas: status bar 62 top, home indicator 34 bottom.

### Auth (2 pantallas)

#### A1 · Login
- **Layout**: padding `28px 28px 0`, flex column
- **Header**: logo chip 88 + título "Habitare" display/30/gray-900 + subtítulo "Gestión de conjuntos residenciales" body/gray-500/center/maxW 260, gap 20, margin-top 48
- **Form**: gap 14, marginTop 44 — Input "Correo electrónico" icon mail, Input "Contraseña" icon lock + iconRight eye
- **CTA**: Button primary "Iniciar sesión", marginTop 28
- **Link**: "¿Olvidaste tu contraseña?" body/600/primary-dark/center, marginTop 16
- **Footer** (mt: auto): "¿No tienes cuenta? Comunícate con tu administrador" bodySm/gray-500 + © 2025 Habitare small/gray-400

#### A2 · Recuperar contraseña
- AppBar con back + título
- Logo chip 44 + descripción
- Input "Correo electrónico"
- Button primary "Enviar enlace"
- Banner success "Enlace enviado" (sub: "Revisa tu bandeja. El enlace expira en 30 minutos.")
- Button text "Volver al inicio de sesión" en footer

### Residente (23 pantallas) — bottom nav 5 tabs

> **Nav tabs**: Inicio / Visitantes / Pagos / Comunicados / Más

#### R1 · Dashboard (tab Inicio)
- Header: Avatar "AR" 44 + "Hola, Ana" h2 + "RESERVAS DEL PRADO · T3 · APTO 502" small/mono + bell icon button con dot accent
- **Card saldo** (bg primary, radius 20, padding 22):
  - "Saldo total a pagar" bodySm/blanco 75%
  - **$487.500** display/blanco tabular-nums
  - "Vence el 15 de junio" con icon clock
  - Button onDark "Pagar ahora" con arrowR
  - Decoración: círculos concéntricos SVG opacity 0.12 arriba-derecha
- **Accesos rápidos** (h3 "Accesos rápidos" + grid 2×2 gap 12):
  - Cada card 16: icon 40×40 con bg tono semántico → label `body/600` whitespace pre-line
  - 4 items: Autorizar visitante (primary-soft/primary-dark), Paquetes en portería (accent-soft/accent-dark, **badge numérico 2**), Reportar novedad (warning), Reservar zona común (success)
- **Último comunicado** (mt 28):
  - h3 + link "Ver todos"
  - Card: Badge tone warning "Mantenimiento" + título + bodySm preview + "HACE 2 HORAS" small/mono

#### R2 · Visitantes (lista, tab)
- AppBar "Visitantes" + action botón "+" (40×40 radius 12 bg primary)
- Tabs: "Vigentes 3" (activa, underline primary 2px) / "Historial"
- Lista de cards (pad 14, mb 10): Avatar 46 + nombre h2 + bodySm "rel · doc" + body w/icon clock fecha + chevR + Badge tone (success/warning/neutral)

#### R3 · Detalle visitante (con QR)
- AppBar back "Detalle de visita"
- Card 20 pad center: Avatar 72 + nombre h2 + doc mono + Badge "Empleado doméstico" primary
- Card 20: "MUESTRA EN PORTERÍA" small/mono + **QR 210×210** + caption bodySm
- Card 16: KV rows (label gray-500 / value gray-900 700): Autorizado desde, Hasta, Unidad, Autorizado por
- Botones row: Button secondary "Extender" / Button destructive "Revocar"

#### R4 · Crear visita
- AppBar back "Autorizar visita"
- Form (gap 14): Input "Nombre completo" / Select "Tipo doc." (120px) + Input "Número" / Select "Relación" / Input "Desde" + Input "Hasta" / Input multiline "Observaciones"
- Bottom bar (sticky/absolute): Button primary "Autorizar visita" con gradient bg para que el fade-out se vea con scroll

#### R5 · Pagos (Estado de cuenta, tab)
- AppBar "Estado de cuenta"
- Card 20 bg primary: "Saldo pendiente total" + monto display + "Próximo vencimiento" + Button onDark "Pagar ahora"
- Chips horizontales: Todas (active) / Pendientes 2 / Vencidas 1 / Pagadas
- Section header "JUNIO 2026" mono/gray-500
- InvoiceCard (pad 16): concepto h6/700, período bodySm, due fecha (gray-700 o danger-text), monto h3 tabular-nums, Badge estado (pendiente warning, vencida danger, pagada success)
- Section header "MAYO 2026" + más cards

#### R6 · Comunicados (tab)
- AppBar "Comunicados"
- Chips horizontales: Todos (active) / Urgente / Informativo / Mantenimiento / Reunión
- Cards lista (pad 16): row Badge tone + fecha right (small/gray-400), título body/700, preview bodySm/gray-500

#### R7 · Detalle comunicado
- AppBar "" back + icon moreV trailing
- Badge tone categoría
- Título display/28 (mt 14)
- Meta: "Publicado · 13 jun 2026, 8:00 a.m." con icon calendar
- Body bodyLg/gray-800/line-height 1.65 (3 párrafos)
- Footer: Avatar + "Administración" body/600 + "Reservas del Prado" bodySm/gray-500

#### R8 · Más (tab)
- AppBar "Más"
- Profile card 16: Avatar 52 + nombre + email + chevR
- Section header "SERVICIOS" mono/gray-500
- Grid 2×2 de cards (pad 16): icon 40 en bg tono + label
  - PQRS (primary), Zonas comunes (success), Sorteo parqueadero (info), Reportar novedad (warning), Servicios externos (accent), Citas admin (gray)
- Button destructive "Cerrar sesión" con icon logout
- Footer (mt 32, pt 24, border-top): Logo flat 36 + "HABITARE · v2.4.0" small/mono/gray-400/letterSpacing 0.6

#### R9 · Perfil residente
- AppBar back "Perfil"
- Center: Avatar 96 + nombre h1 + email body/gray-500
- Card 0 con rows divididos (cada row pad 16, border-bottom gray-100):
  - ProfileRow: icon 36×36 radius 10 bg gray-100 + label small/gray-500 + value body/700
  - Conjunto, Unidad, Teléfono, Documento
- Button secondary "Cambiar contraseña" icon lock
- Button destructive "Cerrar sesión" icon logout

#### R10 · PQRS Lista
- AppBar "PQRS"
- Cards lista (pad 16): row Badge tipo + Badge estado dot (sizes sm); asunto body/700/leading 1.35; row radicado mono small + fecha small/gray-400
- FAB "Nueva PQRS" pill con icon plus

#### R11 · PQRS Nueva
- AppBar back "Nueva PQRS"
- Helper text body/gray-600
- Chips row "Tipo": Petición / Queja / Reclamo / Sugerencia / Incidente (selected)
- Input "Asunto"
- Input multiline "Descripción"
- **Si tipo = Incidente**: Card warning con título "DETALLES DEL INCIDENTE" + Chips row severidad (Baja/Media (active)/Alta/Crítica) + Input "Ubicación"
- Bottom bar: Button primary "Radicar PQRS"

#### R12 · PQRS Detalle
- AppBar "" back
- Row radicado mono + "Radicado hace 4 horas"
- Badges row: tipo + estado
- Asunto h2/leading 1.3
- Descripción body/gray-700/leading 1.55
- "HISTORIAL" small/mono
- Timeline (vertical line gray-200 2px):
  - Cada item: dot circular + autor body/700 (con "(tú)" si propio) + fecha right + mensaje bodySm/gray-700/leading 1.5
- Bottom bar: input estilo "chat" (rounded pill blanco + send button circular primary 38×38)

#### R13 · PQRS Éxito
- AppBar action "Cerrar" (text button)
- CheckBurst centrado (animación de check):
  - Círculo 120 bg primary-soft
  - Círculo interior 88 bg primary con check 44 blanco
  - Sparkles accent decorativos
- Título h1 "PQRS radicada" mt 28
- Subtítulo body/gray-500/center maxW 300
- **Radicado** chip: card primary-soft pad `14 22` radius 14:
  - "RADICADO" small/600/primary-dark/uppercase letterSpacing 0.6
  - "2025-PQR-0042" h2 mono primary-dark/letterSpacing 0.5
- Mt auto, botones: Button primary "Ver mis PQRS" + Button text "Volver al inicio"

#### R14 · Zonas Mis reservas
- AppBar back "Zonas comunes"
- h3 "Mis reservas"
- Lista cards (pad 14): icon 52 en bg tono + nombre body/700 + bodySm fecha · horario + Badge tone estado (success/warning/neutral) + chevR
- FAB "Reservar zona" plus

#### R15 · Reservar zona
- AppBar back "Reservar zona"
- **1 · Zona**: scroll horizontal de cards 132 wide pad 14, border 2 primary si selected, icon 40 + nombre + cap
- **2 · Fecha**: card 14 con MiniCalendar (header con chevrons + grid 7 cols + día seleccionado bg primary radius 10)
- **3 · Horario**: grid 2 cols cards 14 12 — selected bg primary blanco / unavailable strikethrough gray-300
- **Resumen** card primary-soft con datos seleccionados
- Bottom: Button primary "Confirmar reserva"

#### R16 · Reserva éxito
- Mismo patrón que R13 pero con summary card detalle de la reserva (KV rows)
- Botones: "Ver mis reservas" / "Volver al inicio"

#### R17 · Reportar novedad
- AppBar back "Reportar novedad"
- Helper body/gray-600
- Select "Tipo de novedad"
- **Severidad**: grid 4 cols con pills tone (Baja success / Media info / Alta warning (active) / Crítica danger)
- Input "Ubicación" con icon location
- Input multiline "Descripción"
- Card info pad 14 bg gray-50: "Tu novedad será visible para administración y portería en menos de 1 minuto."
- Bottom: Button primary "Reportar novedad"

#### R18 · Novedad éxito
- Igual a R13 con título "Novedad reportada" + radicado "NOV-2026-119"

#### R19 · Servicios externos
- AppBar back "Servicios externos"
- Helper
- Lista cards (pad 14): icon tools 44 en gray-100 + nombre + empresa + fecha mono + Badge tone (info "En conjunto" / neutral "Salió")
- FAB "Registrar ingreso" plus

#### R20 · Citas administración
- AppBar back
- Tabs: Disponibilidad (active) / Mis citas 2
- Sections por día ("MARTES 17 JUN" mono/gray-500):
  - Cada card 14 con icon clock 48 primary-soft + horario body/700 + cupos bodySm + Badge "Solicitar" o "Seleccionado"
  - Sin cupos: opacity 0.5
  - Selected: border 2px primary

#### R21 · Sorteo parqueadero
- AppBar back "Sorteo parqueadero"
- Hero card bg gray-900 pad 20 con badge "Sorteo activo" rgba blanco 14%:
  - Título h1 blanco
  - "Hay 48 cupos para 73 unidades inscritas." body blanco 70%
  - Stats row: Cupos 48 · Inscritos 73 · Cierra en 3 días (label small/mono blanco/60% uppercase)
  - Decoración SVG "P" parking opacity 0.08
- Card "Tu participación" pad 16: small uppercase + icon xCircle gray-400 + "Aún no estás inscrito" + Button primary "Participar en el sorteo"
- "Resultados anteriores" h3 + Card 0 con rows pad 14 div gray-100: "2025 · 1er sem" body/600 + "48 / 71" small/mono

#### R22 · Confirmar sorteo
- AppBar back
- Card bg gray-900: pequeño label "SORTEO" + h2 blanco + bodySm "Sorteo el 22 jun · 5:00 p.m."
- Card resumen 16: KV rows (Residente, Unidad, Vehículo, Tipo cupo)
- Card gray-50 con términos (bodySm/gray-700/leading 1.6)
- Checkbox row: 22×22 radius 6 bg primary con check + bodySm "He leído y acepto los términos del sorteo"
- Bottom: Button primary "Confirmar participación"

#### R23 · Paquetes en portería
- AppBar back "Paquetes"
- Top card accent-soft pad 14: icon package + "2 paquetes esperando" body/600/accent-dark
- Lista cards (pad 14): icon package 48 en bg tono (success gray / pendiente accent-soft) + descripción body/700 + portería bodySm + row fecha mono + Badge tone estado

### Seguridad (8 pantallas) — bottom nav 5 tabs

> **Nav tabs**: Reportes / Visitantes / Inicio / Zonas / Comunicados

#### S1 · Dashboard
- Header: Avatar "MO" 44 bg gray-900/blanco + "Hola, Manuel" h2 + "RESERVAS DEL PRADO · TURNO 6 A.M. – 2 P.M." small/mono
- **Hero card escáner** bg primary radius 20 pad 22:
  - Badge "Acción rápida" rgba blanco 18%
  - "Escanear QR de visitante" h1 blanco/leading 1.2
  - "Acceso autorizado en segundos." bodySm blanco 85%
  - Button onDark "Abrir escáner" con icon scan + arrowR
  - Decoración SVG QR mock opacity 0.1
- **Hoy** h3 + grid 2×2 cards (pad 16):
  - Ingresos (27, +6 vs ayer success), En conjunto (12), Servicios externos (4), Reportes (2, severidad media warning)
- **Último comunicado** card (igual R1)

#### S2 · Visitantes seguridad
- AppBar "Visitantes" subtitle "Hoy · 27 ingresos" + scan button trailing
- Chips: Todos / En conjunto 12 / Salieron 15
- Lista cards (pad 14): Avatar 44 + row nombre + Badge tone (success en conjunto / info domicilio / neutral salió) + bodySm unidad + row mono "ENTRA HH:MM" + "SALE HH:MM"

#### S3 · Detalle visitante seguridad
- AppBar back "Ingreso del visitante"
- Card center: Avatar 80 + nombre h2 + doc mono + Badge success "En conjunto"
- Card 0 con ProfileRows: Unidad destino, Autorizado por, Relación, Entrada, Autorización
- Card success border: icon checkCircle + "Acceso vigente" + "Autorización válida por 5 h 48 min más."
- Bottom bar: Button primary "Registrar salida" con icon logout

#### S4 · Escáner QR
- **Pantalla a pantalla completa** (no AppBar normal — fondo gray-900 con radial gradient)
- Top row: cancel button (40×40 rgba blanco 14%) + "Escanear QR" body/600/blanco + flash button
- **Viewfinder centrado** 260×260: 4 esquinas L 26×26 stroke 3.5px blanco + scan line con glow primary
- Texto guía abajo: "Apunta al código QR del visitante" body/600/blanco + bodySm blanco 70%
- **Result sheet** (absolute bottom 24, radius 20, shadow alto):
  - Avatar 48 + nombre + unidad + Badge success "Autorizado"
  - bodySm descripción
  - Row botones: Button destructive "Rechazar" / Button primary "Autorizar ingreso"

#### S5 · Reportes
- AppBar "Reportes"
- Chips severidad: Todos / Crítica / Alta / Media / Baja
- Lista cards (pad 14): row tipo body/700 + descripción bodySm + Badge severidad tone dot
- Footer card: user (small/gray-500) + fecha mono right
- FAB "Nuevo reporte" plus

#### S6 · Zonas seguridad
- AppBar "Zonas comunes"
- Lista cards (pad 14): icon 52 en bg tono semántico + nombre + Badge estado dot (success disponible / warning ocupada / danger mantenimiento) + bodySm capacidad + bodySm contexto (próxima reserva, personas, etc.)

#### S7 · Comunicados seguridad
- Idéntico a R6 pero con bottom nav seguridad (tab 4 active)

#### S8 · Perfil seguridad
- AppBar back "Perfil"
- Center: Avatar 96 bg gray-900/blanco + nombre h1 + Badge dark "Seguridad"
- Card ProfileRows: Conjunto, Turno, Teléfono, ID empleado
- Button destructive "Cerrar sesión"
- Footer: Logo flat 36 + "HABITARE · TURNO REGISTRADO" small/mono

---

## Flujo de navegación

```
AUTH
  A1 Login ──┐
  A2 Recover ┘ → R1 / S1 según rol

RESIDENTE (tabs)
  R1 Dashboard ──► R23 Paquetes (desde "Paquetes en portería" card)
  R1 ──► R17 Reportar novedad ──► R18 éxito
  R1 ──► R4 Crear visita ──► R3 Detalle (con QR)
  R2 Visitantes ──► R3 / R4
  R5 Pagos
  R6 Comunicados ──► R7 Detalle
  R8 Más ──► R9 Perfil
       ├──► R10 PQRS ──► R11 Nueva ──► R13 éxito
       │              └─► R12 Detalle
       ├──► R14 Zonas ──► R15 Reservar ──► R16 éxito
       ├──► R19 Servicios externos
       ├──► R20 Citas administración
       └──► R21 Sorteo ──► R22 Confirmar

SEGURIDAD (tabs)
  S1 Dashboard ──► S4 Escáner ──► S3 Detalle
  S2 Visitantes ──► S3 Detalle
  S5 Reportes (FAB nuevo)
  S6 Zonas
  S7 Comunicados
  S1/S8 Perfil (acceso desde avatar header)
```

Sugerencia de estructura Expo Router:

```
app/
  (auth)/
    login.tsx              → A1
    recover.tsx            → A2
  (resident)/
    _layout.tsx            → Tabs
    index.tsx              → R1
    visitors/
      _layout.tsx
      index.tsx            → R2
      [id].tsx             → R3
      new.tsx              → R4
    payments.tsx           → R5
    announcements/
      index.tsx            → R6
      [id].tsx             → R7
    more/
      index.tsx            → R8
      profile.tsx          → R9
      pqrs/
        index.tsx          → R10
        new.tsx            → R11
        [id].tsx           → R12
        success.tsx        → R13
      amenities/
        index.tsx          → R14
        book.tsx           → R15
        success.tsx        → R16
      report.tsx           → R17
      report-success.tsx   → R18
      external.tsx         → R19
      appointments.tsx     → R20
      parking-raffle/
        index.tsx          → R21
        confirm.tsx        → R22
      packages.tsx         → R23
  (security)/
    _layout.tsx            → Tabs
    index.tsx              → S1
    visitors/
      index.tsx            → S2
      [id].tsx             → S3
    scanner.tsx            → S4
    reports.tsx            → S5
    amenities.tsx          → S6
    announcements.tsx      → S7
    profile.tsx            → S8
```

---

## Interactions & behavior

### Patrones globales
- **Pull-to-refresh** en todas las listas (`RefreshControl` en `ScrollView`)
- **Loading**: skeleton loaders (no spinners standalone) — animación shimmer izquierda-derecha 1.5s loop
- **Error**: Banner danger con mensaje + Button text "Reintentar"
- **Empty state**: ícono + título + subtítulo + CTA (componente `EmptyState`)
- **Bottom sheets**: para formularios cortos (solicitar cita, registrar salida, confirmar acción)
- **FAB**: cuando el CTA principal es "crear nuevo" (PQRS, visitantes, reportes)
- **Confirmación destructiva**: ActionSheet/sheet antes de revocar visita, cancelar reserva, etc. — title + body + Button destructive + Button text Cancelar

### Animaciones
- Transición entre pantallas: navegación stack iOS por defecto (slide horizontal)
- Tabs: cambio instantáneo (sin animación)
- Botones: scale 0.97 al press (active:scale-[0.97])
- CheckBurst (success screens): spring entrance — círculo exterior aparece 0→1 (300ms), inner check fade in (200ms) con delay 150ms, sparkles parallax delay 250ms
- FAB: spring scale al mount
- Skeleton: shimmer 1.5s loop infinite

### QR Scanner (S4)
- Permission flow: si denegada, mostrar EmptyState con icon scan + Button "Permitir cámara"
- Mientras escanea: viewfinder pulse + scan line moviéndose vertical 1.5s
- Al detectar QR: tactile haptic medium + result sheet sube spring 300ms
- Si QR inválido: result sheet rojo + haptic error

### Forms
- Validación reactiva al blur (no while typing)
- Errores: border `danger-text` + helper `danger-text` debajo
- Submit: button disabled si form inválido (no opacity, sino bg `gray-300` + color `gray-500`)

---

## State management

Recomendado: **React Query / TanStack Query** para datos del servidor + **Zustand** o Context para sesión/rol/preferencias.

### Slices sugeridos
- `auth`: usuario, rol, token, conjunto activo
- `notifications`: count de unread (para badge del bell + tab Paquetes)
- `cart` no aplica (no es e-commerce)

### Queries por feature
- `useVisitors(filter)` → R2/S2
- `useVisitor(id)` → R3/S3
- `useInvoices(period, status)` → R5
- `useAnnouncements(category)` → R6/S7
- `useAnnouncement(id)` → R7
- `usePQRS(filter)` → R10
- `usePQRSDetail(id)` → R12
- `useAmenities()` + `useMyBookings()` → R14/R15
- `useReports(severity)` → S5
- `usePackages()` → R23
- `useDashboardSummary(role)` → R1/S1
- etc.

Mutaciones: `createVisit`, `revokeVisit`, `extendVisit`, `payInvoice`, `submitPQRS`, `replyPQRS`, `bookAmenity`, `reportIncident`, `scanQR`, `registerEntry/Exit`, etc.

---

## Assets

### Logo (en `assets/`)
3 SVGs ya recoloreados a la paleta Habitare:
- `habitare-logo.svg` — esmeralda sobre transparente (flat)
- `habitare-logo-chip.svg` — esmeralda sobre `primary-soft` (default)
- `habitare-logo-inverse.svg` — blanco sobre `primary` (para hero/oscuros)

Cargar con `react-native-svg-transformer` para usar como import: `import Logo from './assets/habitare-logo.svg'` y renderizar `<Logo width={64} height={64} />`. Alternativa: `<SvgUri />`.

### Íconos
Set: **Ionicons** (`@expo/vector-icons/Ionicons`). El mockup usa una capa de abstracción `<Icon name="..." />` — al portar, mapear cada nombre interno al equivalente Ionicon:

| Nombre interno      | Ionicon                       |
|---------------------|-------------------------------|
| home, homeOutline   | `home`, `home-outline`        |
| people              | `people-outline`              |
| card                | `card-outline`                |
| megaphone           | `megaphone-outline`           |
| grid                | `grid-outline`                |
| bell                | `notifications-outline`       |
| qr                  | `qr-code-outline`             |
| scan                | `scan-outline`                |
| package             | `cube-outline`                |
| document            | `document-text-outline`       |
| alert               | `alert-circle-outline`        |
| calendar            | `calendar-outline`            |
| clock               | `time-outline`                |
| lock                | `lock-closed-outline`         |
| mail                | `mail-outline`                |
| eye / eyeOff        | `eye-outline` / `eye-off-outline` |
| chevR / L / D / U   | `chevron-forward/back/down/up` |
| plus                | `add`                         |
| check               | `checkmark`                   |
| checkCircle         | `checkmark-circle-outline`    |
| x / xCircle         | `close` / `close-circle-outline` |
| user                | `person-outline`              |
| settings            | `settings-outline`            |
| logout              | `log-out-outline`             |
| parking             | `car-outline` (o `square-P` custom) |
| swimming            | `water-outline`               |
| soccer              | `football-outline`            |
| location            | `location-outline`            |
| phone               | `call-outline`                |
| info                | `information-circle-outline`  |
| search              | `search-outline`              |
| filter              | `filter-outline`              |
| refresh             | `refresh-outline`             |
| send                | `send-outline`                |
| arrowR / arrowL     | `arrow-forward` / `arrow-back` |
| moreH / moreV       | `ellipsis-horizontal/vertical` |
| tools               | `construct-outline`           |
| paint               | `color-palette-outline`       |
| leaf                | `leaf-outline`                |
| gym                 | `barbell-outline`             |
| bbq                 | `flame-outline`               |
| handshake           | `people-circle-outline`       |
| sun                 | `sunny-outline`               |
| sparkle             | `sparkles-outline`            |

### Placeholders fotográficos
El mockup usa cards generadas — no hay imágenes raster. Si en producción se quiere fotos de zonas comunes, alturas (R15): cards de 132×~140 con foto + overlay + título.

---

## Files en este bundle

```
design_handoff_habitare/
├── README.md                       ← este archivo
├── Habitare.html                   ← entry point (abre en navegador)
├── design-canvas.jsx               ← canvas wrapper (solo para preview)
├── ios-frame.jsx                   ← iPhone bezel (solo para preview)
├── habitare-tokens.jsx             ← tokens HT + HF + Icon (referencia hex/typography)
├── habitare-components.jsx         ← biblioteca de componentes (Button, Card, Input, etc.)
├── habitare-system.jsx             ← pantallas del design system
├── habitare-auth.jsx               ← A1, A2
├── habitare-resident-1.jsx         ← R1–R9
├── habitare-resident-2.jsx         ← R10–R23 (incluye Timeline, CheckBurst, MiniCalendar)
├── habitare-security.jsx           ← S1–S8 (incluye Viewfinder)
├── habitare-flow.jsx               ← diagrama de navegación
├── habitare-app.jsx                ← ensamblaje del canvas (orden de pantallas)
└── assets/
    ├── habitare-logo.svg
    ├── habitare-logo-chip.svg
    └── habitare-logo-inverse.svg
```

**Para visualizar**: abre `Habitare.html` en Chrome/Safari. La página renderiza un canvas con todas las pantallas — se puede hacer pan/zoom con trackpad, y click en cualquier label para entrar en modo focus (←/→ para navegar entre pantallas).

**Para implementar**: usa `habitare-tokens.jsx` como referencia canónica de valores. Usa los `habitare-*-*.jsx` como referencia exacta de layouts de cada pantalla (los estilos están inline, fáciles de traducir a `className="..."` de Tailwind/NativeWind).

---

## Next steps recomendados

1. **Setup base**: instalar dependencias, configurar Tailwind con los tokens, cargar fuente Plus Jakarta Sans, configurar `react-native-svg-transformer`.
2. **Atomic components first**: Button, Card, Input, Badge, Avatar, Icon (wrapper de Ionicons con tu mapeo), Logo. Estos son la base — todo lo demás se construye sobre ellos.
3. **Layout components**: Screen wrapper (con SafeAreaView), AppBar, BottomNav (con `expo-router/tabs`), ScrollArea (con RefreshControl), FAB.
4. **Auth flow**: A1, A2 — esto valida el setup tipográfico y de paleta antes de meterse con pantallas complejas.
5. **Bottom-nav skeletons**: levantar los 5+5 tabs vacíos para validar navegación.
6. **Pantallas por feature**: residente primero (Dashboard, Visitantes, Pagos), luego seguridad. Los flujos de éxito (R13/R16/R18) comparten un componente `<SuccessScreen>` parametrizado.
7. **Integraciones**: cámara para S4, QR generation para R3, calendar picker para R15.

Cualquier ambigüedad de copy o data shape: pregunta al PM antes de inventar — el brief de diseño es deliberadamente concreto para que la implementación sea pixel-perfect.
