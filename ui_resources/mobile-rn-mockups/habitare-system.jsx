// habitare-system.jsx — design system showcase artboards
// Renders DS pages at iPhone width but freely sized vertically

// SysFrame uses minHeight + pb so content can grow without being clipped by
// the wrapper. The host DCArtboard's overflow: hidden handles edge cropping
// — but we now size artboards generously, so nothing should hit it.
const SysFrame = ({ children, w = 390, h = 844 }) => (
  <div style={{ width: w, minHeight: h, background: HT.white, fontFamily: HF.family, paddingBottom: 32 }}>
    {children}
  </div>
);

const SysSection = ({ title, children, pad = 24 }) => (
  <div style={{ padding: `28px ${pad}px 0`, display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ ...HF.h3, color: HT.gray900 }}>{title}</div>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// SysOverview — brand intro
// ─────────────────────────────────────────────────────────────
function SysOverview() {
  return (
    <SysFrame>
      <div style={{ background: HT.primary, padding: '60px 32px 48px', color: '#fff' }}>
        <Wordmark size="lg" variant="inverse" color="#fff" vertical={false} />
        <div style={{ ...HF.display, color: '#fff', marginTop: 36, lineHeight: 1.05 }}>
          Sistema de<br/>diseño Habitare
        </div>
        <div style={{ ...HF.bodyLg, color: 'rgba(255,255,255,.85)', marginTop: 12, maxWidth: 300 }}>
          Lenguaje visual para la app móvil. Cálido, claro, confiable.
        </div>
      </div>
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Etimología</div>
          <div style={{ ...HF.bodyLg, color: HT.gray800 }}>
            <em style={{ fontStyle: 'italic', color: HT.primaryDark }}>habitāre</em> — del latín, "habitar, morar". Pertenecer a un lugar.
          </div>
        </div>
        <div style={{ height: 1, background: HT.gray200 }} />
        <div>
          <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Tono</div>
          <div style={{ ...HF.bodyLg, color: HT.gray800 }}>Cercano, ordenado, sin ruido. Como hablar con un buen vecino.</div>
        </div>
        <div style={{ height: 1, background: HT.gray200 }} />
        <div>
          <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>Principios</div>
          <div style={{ ...HF.body, color: HT.gray700, lineHeight: 1.6 }}>
            01 — Espaciado generoso<br/>
            02 — Jerarquía por tipografía, no por color<br/>
            03 — Color para significado, nunca decorativo<br/>
            04 — Estados claros: vacíos, carga, error
          </div>
        </div>
      </div>
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysColors — palette
// ─────────────────────────────────────────────────────────────
const Swatch = ({ name, hex, bg = hex, fg = '#fff', size = 'lg' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{
      width: size === 'lg' ? 56 : 44, height: size === 'lg' ? 56 : 44, borderRadius: 12,
      background: bg, border: hex === HT.white ? `1px solid ${HT.gray200}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} />
    <div style={{ flex: 1 }}>
      <div style={{ ...HF.body, fontWeight: 600, color: HT.gray900 }}>{name}</div>
      <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>{hex}</div>
    </div>
  </div>
);

function SysColors({ h = 1480 }) {
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 0' }}>
        <div style={{ ...HF.h1 }}>Color</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Paleta cálida con verde esmeralda como ancla.</div>
      </div>
      <SysSection title="Marca">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Swatch name="Primario"        hex={HT.primary} />
          <Swatch name="Primario oscuro" hex={HT.primaryDark} />
          <Swatch name="Primario suave"  hex={HT.primarySoft} fg={HT.primaryDark} />
          <Swatch name="Acento"          hex={HT.accent} />
          <Swatch name="Acento suave"    hex={HT.accentSoft} fg={HT.accentDark} />
        </div>
      </SysSection>
      <SysSection title="Neutros (cálidos)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Scaffold / fondo', HT.bg],
            ['Blanco', HT.white],
            ['Gray 100', HT.gray100], ['Gray 200', HT.gray200], ['Gray 300', HT.gray300],
            ['Gray 400', HT.gray400], ['Gray 500', HT.gray500], ['Gray 700', HT.gray700], ['Gray 900', HT.gray900],
          ].map(([n, h]) => <Swatch key={n} name={n} hex={h} size="md" />)}
        </div>
      </SysSection>
      <SysSection title="Semánticos">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Success', HT.successBg, HT.successText, '#1E7D4D'],
            ['Warning', HT.warningBg, HT.warningText, '#9C6A00'],
            ['Danger',  HT.dangerBg,  HT.dangerText,  '#B23A33'],
            ['Info',    HT.infoBg,    HT.infoText,    '#1F5AA0'],
          ].map(([n, bg, fg]) => (
            <div key={n} style={{ background: bg, border: `1px solid ${HT.gray200}`, borderRadius: 12, padding: 14 }}>
              <Badge tone={n.toLowerCase()}>{n}</Badge>
              <div style={{ ...HF.small, fontFamily: HF.mono, color: fg, marginTop: 10 }}>{bg}</div>
              <div style={{ ...HF.small, fontFamily: HF.mono, color: fg }}>{fg}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </SysSection>
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysType — typographic scale
// ─────────────────────────────────────────────────────────────
function SysType({ h = 1080 }) {
  const rows = [
    ['display', 'Display 32',  'Inicio en Habitare'],
    ['h1',      'H1 · 24',     'Mis visitantes'],
    ['h2',      'H2 · 20',     'Saldo a pagar'],
    ['h3',      'H3 · 18',     'Accesos rápidos'],
    ['bodyLg',  'Body Lg · 16','Reserva tu zona común sin filas.'],
    ['body',    'Body · 15',   'Mantén al día las cuotas y novedades.'],
    ['bodySm',  'Body Sm · 14','Última actualización hace 2 horas.'],
    ['small',   'Small · 12',  'TORRE 3 · APTO 502'],
    ['badge',   'Badge · 11',  'VIGENTE'],
  ];
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Tipografía</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Plus Jakarta Sans · pesos 400 / 500 / 600 / 700</div>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {rows.map(([k, label, sample]) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6, borderBottom: `1px solid ${HT.gray100}`, paddingBottom: 18 }}>
            <div style={{ ...HF.small, fontFamily: HF.mono, color: HT.gray500 }}>{label}</div>
            <div style={{ ...HF[k], color: HT.gray900 }}>{sample}</div>
          </div>
        ))}
      </div>
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysButtons — button states
// ─────────────────────────────────────────────────────────────
function SysButtons({ h = 980 }) {
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Botones</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Altura 52 / 44 / 36 · radio 12px</div>
      </div>
      <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Button variant="primary"     icon="checkCircle">Autorizar visita</Button>
        <Button variant="secondary">Reservar zona común</Button>
        <Button variant="destructive" icon="x">Revocar acceso</Button>
        <Button variant="text">Olvidé mi contraseña</Button>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="primary" size="md" block={false}>Confirmar</Button>
          <Button variant="secondary" size="md" block={false}>Cancelar</Button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="primary" size="sm" block={false}>Pagar</Button>
          <Button variant="ghost" size="sm" block={false} icon="filter">Filtrar</Button>
        </div>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...HF.h3 }}>Inputs</div>
        <Input label="Correo electrónico" icon="mail" value="ana@habitare.co" />
        <Input label="Contraseña" icon="lock" value="••••••••" iconRight="eye" />
        <Input label="Documento" icon="document" placeholder="Número de cédula" />
        <Input label="Correo electrónico" icon="mail" value="ana@" error helper="Ingresa un correo válido" />
      </div>
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysComponents — badges, cards, avatars, etc.
// ─────────────────────────────────────────────────────────────
function SysComponents({ h = 1240 }) {
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Componentes</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Badges, cards, avatares, estados</div>
      </div>

      <SysSection title="Badges">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Badge tone="success" dot>Vigente</Badge>
          <Badge tone="warning" dot>Por vencer</Badge>
          <Badge tone="danger"  dot>Vencida</Badge>
          <Badge tone="info"    dot>En proceso</Badge>
          <Badge tone="neutral">Cerrada</Badge>
          <Badge tone="primary">Petición</Badge>
          <Badge tone="accent">Reunión</Badge>
        </div>
      </SysSection>

      <SysSection title="Avatares">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar initials="MR" size={56} />
          <Avatar initials="JC" size={44} bg={HT.accentSoft} color={HT.accentDark} />
          <Avatar initials="AS" size={36} bg={HT.gray100} color={HT.gray700} />
          <Avatar initials="LD" size={28} />
        </div>
      </SysSection>

      <SysSection title="Cards">
        <Card pad={16}>
          <div style={{ ...HF.h3 }}>Card básica</div>
          <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>Fondo blanco · borde gray200 · radio 16</div>
        </Card>
        <Card pad={16} bg={HT.primary} border={HT.primary}>
          <div style={{ ...HF.h3, color: '#fff' }}>Card primario</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>Usar para CTA principal</div>
        </Card>
      </SysSection>

      <SysSection title="Banners">
        <Banner tone="success" title="PQRS radicada"      body="Número 2025-PQR-0042" />
        <Banner tone="warning" title="Cuota por vencer"   body="Vence el 15 de junio" />
        <Banner tone="danger"  title="Pago rechazado"     body="Reintenta o cambia método" />
      </SysSection>

      <SysSection title="Empty state">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <EmptyState
            icon="document"
            title="Sin PQRS aún"
            subtitle="Cuando radiques una solicitud aparecerá aquí."
            action={<Button variant="primary" size="md" icon="plus">Nueva PQRS</Button>}
          />
        </Card>
      </SysSection>

      <SysSection title="Loading skeleton">
        <Card pad={16}>
          <Skeleton w={120} h={12} />
          <div style={{ height: 12 }} />
          <Skeleton w="100%" h={16} />
          <div style={{ height: 8 }} />
          <Skeleton w="80%" h={16} />
        </Card>
      </SysSection>

      <div style={{ height: 32 }} />
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysSpacing — spacing scale + radii + shadows
// ─────────────────────────────────────────────────────────────
function SysSpacing({ h = 860 }) {
  const tokens = [4, 8, 12, 16, 20, 24, 32, 40, 48];
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Espaciado &amp; Forma</div>
      </div>
      <SysSection title="Spacing scale (px)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tokens.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>{t}</div>
              <div style={{ width: t, height: 12, background: HT.primary, borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </SysSection>
      <SysSection title="Radios">
        <div style={{ display: 'flex', gap: 12 }}>
          {[8, 10, 12, 16, 24].map(r => (
            <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 56, height: 56, background: HT.primarySoft, border: `1px solid ${HT.primaryMuted}`, borderRadius: r }} />
              <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>{r}px</div>
            </div>
          ))}
        </div>
      </SysSection>
      <SysSection title="Sombras">
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 100, height: 60, background: HT.white, borderRadius: 12, boxShadow: '0 1px 2px rgba(20,20,15,.04)' }} />
          <div style={{ width: 100, height: 60, background: HT.white, borderRadius: 12, boxShadow: '0 2px 6px rgba(20,20,15,.06), 0 1px 2px rgba(20,20,15,.04)' }} />
          <div style={{ width: 100, height: 60, background: HT.white, borderRadius: 12, boxShadow: '0 6px 16px rgba(20,20,15,.08), 0 2px 4px rgba(20,20,15,.05)' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
          <div style={{ width: 100, ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>shadow-1</div>
          <div style={{ width: 100, ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>shadow-2</div>
          <div style={{ width: 100, ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>shadow-3</div>
        </div>
        <div style={{ height: 24 }} />
      </SysSection>
    </SysFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SysBottomNav — both bottom nav variants
// ─────────────────────────────────────────────────────────────
function SysBottomNav({ h = 620 }) {
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Bottom navigation</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Dos variantes según rol</div>
      </div>
      <div style={{ padding: '24px 16px' }}>
        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginBottom: 6, paddingLeft: 4 }}>RESIDENTE</div>
        <div style={{ background: HT.bg, borderRadius: 18, overflow: 'hidden', border: `1px solid ${HT.gray200}` }}>
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HT.gray400, fontFamily: HF.mono, fontSize: 11 }}>contenido del tab</div>
          <BottomNav items={RESIDENT_NAV} active={0} />
        </div>
      </div>
      <div style={{ padding: '12px 16px 32px' }}>
        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginBottom: 6, paddingLeft: 4 }}>SEGURIDAD</div>
        <div style={{ background: HT.bg, borderRadius: 18, overflow: 'hidden', border: `1px solid ${HT.gray200}` }}>
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: HT.gray400, fontFamily: HF.mono, fontSize: 11 }}>contenido del tab</div>
          <BottomNav items={SECURITY_NAV} active={2} />
        </div>
      </div>
    </SysFrame>
  );
}

Object.assign(window, { SysOverview, SysLogo, SysColors, SysType, SysButtons, SysComponents, SysSpacing, SysBottomNav });

// ─────────────────────────────────────────────────────────────
// SysLogo — logo variants + usage notes
// ─────────────────────────────────────────────────────────────
function SysLogo({ h = 1180 }) {
  return (
    <SysFrame h={h}>
      <div style={{ padding: '40px 24px 8px' }}>
        <div style={{ ...HF.h1 }}>Identidad</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 4 }}>Dos casas superpuestas — comunidad, hogar, vecindad.</div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: HT.primary, borderRadius: 18, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Logo size={120} variant="inverse" />
          <div style={{ ...HF.h1, color: '#fff', letterSpacing: '-0.6px' }}>Habitare</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.75)' }}>Lockup principal · superficie de marca</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card pad={20} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Logo size={72} variant="chip" />
            <div style={{ ...HF.bodySm, fontWeight: 600 }}>Chip</div>
            <div style={{ ...HF.small, color: HT.gray500, textAlign: 'center', lineHeight: 1.4 }}>Por defecto. Fondo soft sobre superficies claras.</div>
          </Card>
          <Card pad={20} bg={HT.gray900} border={HT.gray900} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Logo size={72} variant="inverse" />
            <div style={{ ...HF.bodySm, fontWeight: 600, color: '#fff' }}>Inverse</div>
            <div style={{ ...HF.small, color: 'rgba(255,255,255,.6)', textAlign: 'center', lineHeight: 1.4 }}>Sobre fondos oscuros o el primario.</div>
          </Card>
          <Card pad={20} style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 22 }}>
            <Logo size={64} variant="flat" />
            <div style={{ flex: 1 }}>
              <div style={{ ...HF.bodySm, fontWeight: 600 }}>Flat</div>
              <div style={{ ...HF.small, color: HT.gray500, marginTop: 4 }}>Sin contenedor. Para footers, listas, slots discretos.</div>
            </div>
          </Card>
        </div>

        <div>
          <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginBottom: 10, letterSpacing: '0.6px' }}>ESCALAS</div>
          <Card pad={20}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
              {[24, 32, 44, 56, 72, 96].map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Logo size={s} variant="chip" />
                  <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>{s}px</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginBottom: 10, letterSpacing: '0.6px' }}>LOCKUPS</div>
          <Card pad={20} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Wordmark size="lg" />
            <Wordmark size="md" />
            <Wordmark size="sm" />
          </Card>
        </div>
      </div>
    </SysFrame>
  );
}
