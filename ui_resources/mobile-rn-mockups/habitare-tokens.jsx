// habitare-tokens.jsx — design tokens + icon set
// Globals: HT (color tokens), HF (typography), Icon

const HT = {
  // Brand
  primary:        '#1F6B55',
  primaryDark:    '#14513F',
  primaryDeep:    '#0E3D2E',
  primarySoft:    '#E8F1ED',
  primaryMuted:   '#C7DBD2',
  accent:         '#E8A968',
  accentDark:     '#C28244',
  accentSoft:     '#FBEEDC',

  // Surfaces
  bg:             '#F7F4EE',  // scaffold (warm off-white)
  white:          '#FFFFFF',

  // Neutrals (warm)
  gray50:         '#F8F6F1',
  gray100:        '#EFECE5',
  gray200:        '#E2DED4',
  gray300:        '#C9C4B7',
  gray400:        '#A39E8F',
  gray500:        '#736E62',
  gray600:        '#52503F',
  gray700:        '#3A3830',
  gray800:        '#26241D',
  gray900:        '#16140E',

  // Semantic
  successBg:      '#E2F1E7',
  successText:    '#1E7D4D',
  successBorder:  '#B6DCC2',
  warningBg:      '#FBF1D9',
  warningText:    '#9C6A00',
  warningBorder:  '#EFDCA5',
  dangerBg:       '#FBE5E1',
  dangerText:     '#B23A33',
  dangerBorder:   '#F2C5BD',
  infoBg:         '#E2ECF7',
  infoText:       '#1F5AA0',
  infoBorder:     '#BAD0EA',
};

const HF = {
  family: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  mono:   '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
  display: { fontSize: 32, fontWeight: 700, lineHeight: 1.1,  letterSpacing: '-0.6px' },
  h1:      { fontSize: 24, fontWeight: 700, lineHeight: 1.2,  letterSpacing: '-0.4px' },
  h2:      { fontSize: 20, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.3px' },
  h3:      { fontSize: 18, fontWeight: 600, lineHeight: 1.3,  letterSpacing: '-0.2px' },
  bodyLg:  { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  body:    { fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
  bodySm:  { fontSize: 14, fontWeight: 400, lineHeight: 1.45 },
  small:   { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
  badge:   { fontSize: 11, fontWeight: 600, lineHeight: 1.3,  letterSpacing: '0.3px', textTransform: 'uppercase' },
};

// ─────────────────────────────────────────────────────────────
// Icon — Ionicons-style outline. size + color props.
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 22, color = 'currentColor', filled = false, style = {} }) {
  const sw = filled ? 0 : 1.8;
  const fill = filled ? color : 'none';
  const stroke = filled ? color : color;
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    home:        <><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></>,
    homeOutline: <><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z"/><path d="M9 22v-7h6v7"/></>,
    people:      <><circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M14.5 14.5c2.5 0 5 1.5 5 4.5"/></>,
    card:        <><rect x="2" y="6" width="20" height="13" rx="2.5"/><path d="M2 11h20"/><path d="M6 16h4"/></>,
    megaphone:   <><path d="M3 11v2a1 1 0 0 0 1 1h2l8 5V5L6 10H4a1 1 0 0 0-1 1z"/><path d="M18 8a4 4 0 0 1 0 8"/></>,
    grid:        <><rect x="3" y="3"  width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    bell:        <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    bellFilled:  <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" fill={color}/><path d="M10 19a2 2 0 0 0 4 0" fill={color}/></>,
    qr:          <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z M20 14h1v1h-1z M14 20h1v1h-1z M17 17h1v1h-1z M20 17h1v4 M17 20h1v1"/></>,
    scan:        <><path d="M4 8V5a1 1 0 0 1 1-1h3"/><path d="M20 8V5a1 1 0 0 0-1-1h-3"/><path d="M4 16v3a1 1 0 0 0 1 1h3"/><path d="M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M3 12h18"/></>,
    package:     <><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
    document:    <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></>,
    alert:       <><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v.5"/></>,
    calendar:    <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    clock:       <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    lock:        <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
    mail:        <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></>,
    eye:         <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff:      <><path d="M3 3l18 18"/><path d="M10.5 6.2A10 10 0 0 1 12 6c7 0 10 6 10 6a17 17 0 0 1-3.4 4.3M6 7.5C3.5 9.5 2 12 2 12s3 7 10 7c1.7 0 3.2-.4 4.5-1"/><path d="M9.5 9.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-1"/></>,
    chevR:       <><path d="M9 6l6 6-6 6"/></>,
    chevL:       <><path d="M15 6l-9 6 9 6" strokeWidth="2.2"/></>,
    chevD:       <><path d="M6 9l6 6 6-6"/></>,
    chevU:       <><path d="M6 15l6-6 6 6"/></>,
    plus:        <><path d="M12 5v14M5 12h14" strokeWidth="2.2"/></>,
    check:       <><path d="M4 12l5 5L20 6" strokeWidth="2.4"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
    x:           <><path d="M6 6l12 12M18 6L6 18"/></>,
    xCircle:     <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
    user:        <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></>,
    logout:      <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    parking:     <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6h-4"/></>,
    swimming:    <><path d="M3 17c1 0 2 1 4 1s3-2 5-2 3 2 5 2 3-1 4-1"/><path d="M3 20c1 0 2 1 4 1s3-2 5-2 3 2 5 2 3-1 4-1"/><circle cx="17" cy="7" r="2"/><path d="M11 12l3-3"/></>,
    soccer:      <><circle cx="12" cy="12" r="9"/><path d="M12 7l3 2v3l-3 2-3-2V9z"/></>,
    location:    <><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
    phone:       <><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z"/></>,
    info:        <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    filter:      <><path d="M4 5h16M7 12h10M10 19h4"/></>,
    refresh:     <><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></>,
    send:        <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
    arrowR:      <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowL:      <><path d="M19 12H5M11 5l-7 7 7 7"/></>,
    moreH:       <><circle cx="5"  cy="12" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="19" cy="12" r="1.5" fill={color}/></>,
    moreV:       <><circle cx="12" cy="5"  r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="12" cy="19" r="1.5" fill={color}/></>,
    tools:       <><path d="M14 7l3-3 4 4-3 3-4-4z"/><path d="M14 7l-9 9v3h3l9-9"/></>,
    paint:       <><rect x="3" y="3" width="18" height="6" rx="1"/><path d="M19 9v3a2 2 0 0 1-2 2h-7v3"/><rect x="9" y="17" width="2" height="4" rx="1"/></>,
    leaf:        <><path d="M21 3c0 10-7 16-13 16-3 0-5-2-5-5C3 8 11 3 21 3z"/><path d="M3 21l9-9"/></>,
    gym:         <><path d="M3 9v6M21 9v6"/><path d="M6 6v12M18 6v12"/><path d="M6 12h12"/></>,
    bbq:         <><path d="M4 8h16l-2 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L4 8z"/><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><path d="M8 13l8 4"/></>,
    dot:         <><circle cx="12" cy="12" r="4" fill={color}/></>,
    sparkle:     <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 16l.7 2L22 19l-2.3 1L19 22l-.7-2L16 19l2.3-1z"/></>,
    handshake:   <><path d="M11 13l-3 3-3-3 7-7 7 7-3 3-3-3"/><path d="M5 16l3 3a2 2 0 0 0 3 0l2-2a2 2 0 0 1 3 0l1 1"/></>,
    box:         <><path d="M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 M21 7v10l-9 4"/></>,
    sun:         <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></>,
  };
  return <svg {...props}>{paths[name] || <text x="2" y="16" fontSize="10" fill={color}>?</text>}</svg>;
}

Object.assign(window, { HT, HF, Icon });
