// habitare-components.jsx — reusable UI primitives
// Depends on globals: HT, HF, Icon

// ─────────────────────────────────────────────────────────────
// Screen — the device frame wrapper. Wraps content in 390×844 iOS shell.
// ─────────────────────────────────────────────────────────────
function Screen({ children, bg = HT.bg, statusBarDark = false }) {
  return (
    <IOSDevice width={390} height={844} dark={false}>
      <div style={{ height: '100%', background: bg, display: 'flex', flexDirection: 'column', fontFamily: HF.family, color: HT.gray900 }}>
        <div style={{ height: 62, flexShrink: 0 }} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// AppBar — page title + optional back arrow + optional action
// ─────────────────────────────────────────────────────────────
function AppBar({ title, back = false, action, subtitle, dark = false, bg = HT.bg }) {
  const fg = dark ? HT.white : HT.gray900;
  return (
    <div style={{ background: bg, padding: '8px 20px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      {back && (
        <button style={{ width: 36, height: 36, marginLeft: -8, borderRadius: 18, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="chevL" size={22} color={fg} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...HF.h2, color: fg }}>{title}</div>
        {subtitle && <div style={{ ...HF.bodySm, color: dark ? 'rgba(255,255,255,.7)' : HT.gray500, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Button — primary | secondary | text | destructive | dark
// ─────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'lg', icon, iconRight, children, block = true, style = {} }) {
  const h = size === 'lg' ? 52 : size === 'md' ? 44 : 36;
  const padX = size === 'lg' ? 24 : size === 'md' ? 18 : 14;
  const fontSize = size === 'lg' ? 16 : 14;
  const variants = {
    primary:     { background: HT.primary, color: '#fff', border: '1px solid transparent' },
    secondary:   { background: HT.white, color: HT.primary, border: `1.5px solid ${HT.primary}` },
    text:        { background: 'transparent', color: HT.primary, border: '1px solid transparent' },
    destructive: { background: HT.white, color: HT.dangerText, border: `1.5px solid ${HT.dangerText}` },
    onDark:      { background: HT.white, color: HT.primaryDark, border: '1px solid transparent' },
    ghost:       { background: HT.gray100, color: HT.gray800, border: '1px solid transparent' },
  };
  return (
    <button style={{
      height: h, padding: `0 ${padX}px`, borderRadius: 12,
      fontFamily: HF.family, fontSize, fontWeight: 600, letterSpacing: '-0.1px',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: block ? '100%' : 'auto', cursor: 'pointer',
      transition: 'transform .1s', ...variants[variant], ...style,
    }}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Card — base container w/ optional padding & onClick affordance
// ─────────────────────────────────────────────────────────────
function Card({ children, pad = 16, style = {}, interactive = false, bg = HT.white, border = HT.gray200 }) {
  return (
    <div style={{
      background: bg, borderRadius: 16, border: `1px solid ${border}`,
      padding: pad, boxShadow: interactive ? '0 1px 2px rgba(20,20,15,.03)' : 'none',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Badge — small status pill. tone: success|warning|danger|info|neutral|primary|accent
// ─────────────────────────────────────────────────────────────
function Badge({ tone = 'neutral', children, dot = false, size = 'md', style = {} }) {
  const tones = {
    success: { bg: HT.successBg, fg: HT.successText },
    warning: { bg: HT.warningBg, fg: HT.warningText },
    danger:  { bg: HT.dangerBg,  fg: HT.dangerText  },
    info:    { bg: HT.infoBg,    fg: HT.infoText    },
    neutral: { bg: HT.gray100,   fg: HT.gray700     },
    primary: { bg: HT.primarySoft, fg: HT.primaryDark },
    accent:  { bg: HT.accentSoft, fg: HT.accentDark },
    dark:    { bg: HT.gray900,   fg: HT.white       },
  };
  const t = tones[tone];
  const p = size === 'sm' ? '3px 7px' : '5px 10px';
  return (
    <span style={{
      ...HF.badge, background: t.bg, color: t.fg,
      padding: p, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: t.fg }} />}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Input — text field with optional icon, error state, label
// ─────────────────────────────────────────────────────────────
function Input({ label, icon, iconRight, value, placeholder, error, type = 'text', readOnly = true, multiline = false, helper, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <div style={{ ...HF.small, color: HT.gray700, fontWeight: 600 }}>{label}</div>}
      <div style={{
        height: multiline ? 'auto' : 52, minHeight: multiline ? 96 : 52,
        background: HT.white, borderRadius: 12,
        border: `1.5px solid ${error ? HT.dangerText : HT.gray200}`,
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', padding: multiline ? '14px 14px' : '0 14px', gap: 10,
      }}>
        {icon && !multiline && <Icon name={icon} size={20} color={HT.gray400} />}
        <div style={{ flex: 1, ...HF.bodyLg, color: value ? HT.gray900 : HT.gray400, minWidth: 0 }}>
          {value || placeholder}
        </div>
        {iconRight && <Icon name={iconRight} size={20} color={HT.gray400} />}
      </div>
      {helper && <div style={{ ...HF.small, color: error ? HT.dangerText : HT.gray500 }}>{helper}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Select — looks like Input but with chev down
// ─────────────────────────────────────────────────────────────
function Select({ label, value, placeholder, style = {} }) {
  return <Input label={label} value={value} placeholder={placeholder} iconRight="chevD" style={style} />;
}

// ─────────────────────────────────────────────────────────────
// Avatar — initials in colored circle
// ─────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40, bg, color, photo = false, style = {} }) {
  const fs = Math.round(size * 0.4);
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: bg || HT.primarySoft, color: color || HT.primaryDark,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: HF.family, fontWeight: 700, fontSize: fs, letterSpacing: '-0.3px',
      flexShrink: 0, ...style,
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// BottomNav — 5-tab bottom navigation
// ─────────────────────────────────────────────────────────────
function BottomNav({ items, active }) {
  return (
    <div style={{
      background: HT.white, borderTop: `1px solid ${HT.gray200}`,
      paddingTop: 8, paddingBottom: 34, // 34 home indicator safe area
      display: 'flex', flexShrink: 0,
    }}>
      {items.map((it, i) => {
        const on = i === active;
        return (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 0', color: on ? HT.primary : HT.gray400,
          }}>
            <div style={{ position: 'relative' }}>
              <Icon name={it.icon} size={24} color={on ? HT.primary : HT.gray400} />
              {it.badge && (
                <span style={{
                  position: 'absolute', top: -4, right: -8,
                  background: HT.dangerText, color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 16, textAlign: 'center',
                }}>{it.badge}</span>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? HT.primary : HT.gray500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

const RESIDENT_NAV = [
  { icon: 'homeOutline', label: 'Inicio' },
  { icon: 'people',      label: 'Visitantes' },
  { icon: 'card',        label: 'Pagos' },
  { icon: 'megaphone',   label: 'Comunicados' },
  { icon: 'grid',        label: 'Más' },
];

const SECURITY_NAV = [
  { icon: 'alert',       label: 'Reportes' },
  { icon: 'people',      label: 'Visitantes' },
  { icon: 'homeOutline', label: 'Inicio' },
  { icon: 'leaf',        label: 'Zonas' },
  { icon: 'megaphone',   label: 'Comunicados' },
];

// ─────────────────────────────────────────────────────────────
// EmptyState — icon + title + subtitle + optional CTA
// ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', textAlign: 'center', gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: HT.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Icon name={icon} size={28} color={HT.gray500} />
      </div>
      <div style={{ ...HF.h3, color: HT.gray900 }}>{title}</div>
      <div style={{ ...HF.body, color: HT.gray500, maxWidth: 280 }}>{subtitle}</div>
      {action && <div style={{ marginTop: 12, width: '100%', maxWidth: 240 }}>{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton — loading placeholder
// ─────────────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #EFECE5, #F8F6F1, #EFECE5)', backgroundSize: '200% 100%', ...style }} />;
}

// ─────────────────────────────────────────────────────────────
// SectionHeader — small text label above a group
// ─────────────────────────────────────────────────────────────
function SectionHeader({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
      <div style={{ ...HF.h3, color: HT.gray900 }}>{children}</div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAB — floating action button
// ─────────────────────────────────────────────────────────────
function FAB({ icon = 'plus', label, style = {} }) {
  return (
    <div style={{
      position: 'absolute', right: 20, bottom: 100, // sits above bottom nav
      background: HT.primary, color: '#fff', borderRadius: 28,
      height: 56, paddingLeft: label ? 18 : 0, paddingRight: label ? 22 : 0,
      width: label ? 'auto' : 56,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: '0 6px 16px rgba(31,107,85,.32), 0 2px 4px rgba(31,107,85,.18)',
      fontFamily: HF.family, fontWeight: 600, fontSize: 15,
      cursor: 'pointer', zIndex: 5, ...style,
    }}>
      <Icon name={icon} size={22} color="#fff" />
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Chip — filter chip
// ─────────────────────────────────────────────────────────────
function Chip({ children, active = false, icon }) {
  return (
    <div style={{
      padding: '8px 14px', borderRadius: 20,
      background: active ? HT.gray900 : HT.white,
      color: active ? '#fff' : HT.gray700,
      border: `1px solid ${active ? HT.gray900 : HT.gray200}`,
      ...HF.bodySm, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
    }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ListItem — generic row with leading slot, title/subtitle, trailing slot
// ─────────────────────────────────────────────────────────────
function ListItem({ leading, title, subtitle, trailing, divider = true, onClick }) {
  return (
    <div style={{ borderBottom: divider ? `1px solid ${HT.gray100}` : 'none', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...HF.body, fontWeight: 600, color: HT.gray900 }}>{title}</div>
        {subtitle && <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScrollArea — main scrollable column inside Screen
// ─────────────────────────────────────────────────────────────
function ScrollArea({ children, style = {}, padX = 20 }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: `0 ${padX}px 24px`, position: 'relative', ...style }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Logo — Habitare twin-house mark (sources habitare-logo.svg variants).
// variant:
//   'flat'    — emerald mark on whatever the parent surface is
//   'chip'    — same mark on a soft-primary rounded square (default)
//   'inverse' — white mark on the primary emerald square
// ─────────────────────────────────────────────────────────────
function Logo({ size = 64, variant = 'chip', radius, style = {} }) {
  const map = {
    flat:    { src: 'habitare-logo.svg',         bg: 'transparent',   r: 0 },
    chip:    { src: 'habitare-logo-chip.svg',    bg: HT.primarySoft,  r: size * 0.26 },
    inverse: { src: 'habitare-logo-inverse.svg', bg: HT.primary,      r: size * 0.26 },
  };
  const v = map[variant] || map.chip;
  const r = radius !== undefined ? radius : v.r;
  // The SVG variants already include the colored background fill on the
  // 284×284 viewBox, so we render them as <img>. Setting background on the
  // wrapper just smooths the edge of the rounded corner.
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: v.bg, overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <img src={v.src} alt="Habitare" width={size} height={size} style={{ display: 'block' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Wordmark — Habitare full lockup (logo + name)
// ─────────────────────────────────────────────────────────────
function Wordmark({ size = 'md', variant = 'chip', color, vertical = false }) {
  const logoSize = size === 'lg' ? 88 : size === 'md' ? 52 : 32;
  const fs       = size === 'lg' ? 32 : size === 'md' ? 22 : 16;
  const c        = color || (variant === 'inverse' ? '#fff' : HT.gray900);
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: vertical ? 16 : 12 }}>
      <Logo size={logoSize} variant={variant} />
      <div style={{ fontFamily: HF.family, fontSize: fs, fontWeight: 700, color: c, letterSpacing: '-0.6px' }}>Habitare</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Banner — alert banner (success / error / info / warning)
// ─────────────────────────────────────────────────────────────
function Banner({ tone = 'success', title, body, icon }) {
  const tones = {
    success: { bg: HT.successBg, fg: HT.successText, bd: HT.successBorder, ic: 'checkCircle' },
    warning: { bg: HT.warningBg, fg: HT.warningText, bd: HT.warningBorder, ic: 'alert' },
    danger:  { bg: HT.dangerBg,  fg: HT.dangerText,  bd: HT.dangerBorder,  ic: 'xCircle' },
    info:    { bg: HT.infoBg,    fg: HT.infoText,    bd: HT.infoBorder,    ic: 'info' },
  };
  const t = tones[tone];
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.bd}`, borderRadius: 12, padding: '14px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Icon name={icon || t.ic} size={20} color={t.fg} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...HF.body, fontWeight: 600, color: t.fg }}>{title}</div>
        {body && <div style={{ ...HF.bodySm, color: t.fg, opacity: 0.85, marginTop: 4 }}>{body}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PhotoPlaceholder — striped block w/ monospace caption
// ─────────────────────────────────────────────────────────────
function PhotoPlaceholder({ label, w = '100%', h = 120, r = 12, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${HT.gray100}, ${HT.gray100} 8px, ${HT.gray200} 8px, ${HT.gray200} 16px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: HT.gray500, fontFamily: HF.mono, fontSize: 11,
      ...style,
    }}>{label}</div>
  );
}

Object.assign(window, {
  Screen, AppBar, Button, Card, Badge, Input, Select, Avatar,
  BottomNav, RESIDENT_NAV, SECURITY_NAV, EmptyState, Skeleton,
  SectionHeader, FAB, Chip, ListItem, ScrollArea, Logo, Wordmark, Banner, PhotoPlaceholder,
});
