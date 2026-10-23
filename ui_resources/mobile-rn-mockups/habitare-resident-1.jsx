// habitare-resident.jsx — Resident flow screens R1–R23

// ============================================================
// R1 — Dashboard (tab Inicio)
// ============================================================
function R_Dashboard() {
  return (
    <Screen>
      {/* header */}
      <div style={{ padding: '4px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials="AR" size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...HF.h2, color: HT.gray900 }}>Hola, Ana</div>
          <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginTop: 2 }}>RESERVAS DEL PRADO · T3 · APTO 502</div>
        </div>
        <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 22, background: HT.white, border: `1px solid ${HT.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell" size={20} color={HT.gray700} />
          <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: 4, background: HT.accent, border: '2px solid #fff' }} />
        </div>
      </div>

      <ScrollArea>
        {/* saldo card */}
        <div style={{ background: HT.primary, borderRadius: 20, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -40, top: -40, opacity: 0.12 }}>
            <circle cx="90" cy="90" r="80" stroke="#fff" strokeWidth="1.5" fill="none" />
            <circle cx="90" cy="90" r="58" stroke="#fff" strokeWidth="1.5" fill="none" />
            <circle cx="90" cy="90" r="36" stroke="#fff" strokeWidth="1.5" fill="none" />
          </svg>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.75)', fontWeight: 500 }}>Saldo total a pagar</div>
          <div style={{ ...HF.display, color: '#fff', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>$487.500</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.8)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={14} color="rgba(255,255,255,.8)" />
            Vence el 15 de junio
          </div>
          <div style={{ marginTop: 18, position: 'relative' }}>
            <Button variant="onDark" size="md" iconRight="arrowR">Pagar ahora</Button>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div style={{ marginTop: 24 }}>
          <div style={{ ...HF.h3, marginBottom: 12 }}>Accesos rápidos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: 'people',  label: 'Autorizar\nvisitante', tone: HT.primarySoft, fg: HT.primaryDark },
              { icon: 'package', label: 'Paquetes en\nportería',  tone: HT.accentSoft,  fg: HT.accentDark, badge: 2 },
              { icon: 'alert',   label: 'Reportar\nnovedad',      tone: HT.warningBg,   fg: HT.warningText },
              { icon: 'leaf',    label: 'Reservar\nzona común',   tone: HT.successBg,   fg: HT.successText },
            ].map((q, i) => (
              <Card key={i} pad={16} style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: q.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={q.icon} size={20} color={q.fg} />
                </div>
                {q.badge && (
                  <span style={{ position: 'absolute', top: 14, right: 14, background: HT.dangerText, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{q.badge}</span>
                )}
                <div style={{ ...HF.body, fontWeight: 600, color: HT.gray900, marginTop: 14, whiteSpace: 'pre-line', lineHeight: 1.25 }}>{q.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* último comunicado */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ ...HF.h3 }}>Último comunicado</div>
            <span style={{ ...HF.bodySm, color: HT.primaryDark, fontWeight: 600 }}>Ver todos</span>
          </div>
          <Card pad={16}>
            <Badge tone="warning" dot>Mantenimiento</Badge>
            <div style={{ ...HF.h3, color: HT.gray900, marginTop: 10 }}>Corte de agua programado · torres 2 y 3</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 6 }}>Sábado 18 · 8:00 a.m. – 1:00 p.m. Por mantenimiento de tanques.</div>
            <div style={{ ...HF.small, color: HT.gray400, marginTop: 10, fontFamily: HF.mono }}>HACE 2 HORAS</div>
          </Card>
        </div>

        <div style={{ height: 16 }} />
      </ScrollArea>

      <BottomNav items={RESIDENT_NAV} active={0} />
    </Screen>
  );
}

// ============================================================
// R2 — Visitantes lista
// ============================================================
function R_Visitantes() {
  const visitors = [
    { name: 'Carlos Mendoza',  doc: 'CC 1.045.872.391', rel: 'Empleado doméstico', tone: 'success', state: 'Vigente',  date: 'Hoy · 8:00 – 18:00',     ini: 'CM' },
    { name: 'Laura Restrepo',  doc: 'CC 1.123.456.789', rel: 'Familiar',           tone: 'success', state: 'Vigente',  date: 'Hasta 18 jun',           ini: 'LR' },
    { name: 'Diego Pérez',     doc: 'CC 80.234.119',    rel: 'Visitante',          tone: 'warning', state: 'Por expirar', date: 'Vence en 2 horas',    ini: 'DP' },
    { name: 'María Vega',      doc: 'CC 53.789.220',    rel: 'Servicio técnico',   tone: 'neutral', state: 'Expirado', date: 'Ayer · 10:00 – 14:00',  ini: 'MV' },
    { name: 'Juan Torres',     doc: 'CC 1.067.543.211', rel: 'Visitante',          tone: 'success', state: 'Vigente',  date: '20 jun · 14:00 – 22:00', ini: 'JT' },
  ];
  return (
    <Screen>
      <AppBar
        title="Visitantes"
        action={
          <div style={{ width: 40, height: 40, borderRadius: 12, background: HT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={22} color="#fff" />
          </div>
        }
      />
      {/* tabs */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 24, borderBottom: `1px solid ${HT.gray200}` }}>
        <div style={{ paddingBottom: 12, borderBottom: `2px solid ${HT.primary}`, ...HF.body, fontWeight: 700, color: HT.gray900 }}>Vigentes <span style={{ color: HT.gray400 }}>3</span></div>
        <div style={{ paddingBottom: 12, ...HF.body, fontWeight: 600, color: HT.gray400 }}>Historial</div>
      </div>
      <ScrollArea style={{ padding: '8px 20px 24px' }}>
        {visitors.map((v, i) => (
          <Card key={i} pad={14} style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials={v.ini} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                  <Badge tone={v.tone} size="sm">{v.state}</Badge>
                </div>
                <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{v.rel} · {v.doc}</div>
                <div style={{ ...HF.bodySm, color: HT.gray700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="clock" size={13} color={HT.gray400} /> {v.date}
                </div>
              </div>
              <Icon name="chevR" size={18} color={HT.gray300} />
            </div>
          </Card>
        ))}
      </ScrollArea>
      <BottomNav items={RESIDENT_NAV} active={1} />
    </Screen>
  );
}

// ============================================================
// R3 — Detalle visitante (QR)
// ============================================================
function R_VisitanteDetalle() {
  return (
    <Screen>
      <AppBar title="Detalle de visita" back />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        <Card pad={20} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Avatar initials="CM" size={72} bg={HT.accentSoft} color={HT.accentDark} />
          <div style={{ ...HF.h2, marginTop: 12 }}>Carlos Mendoza</div>
          <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4, fontFamily: HF.mono }}>CC · 1.045.872.391</div>
          <Badge tone="primary" style={{ marginTop: 10 }}>Empleado doméstico</Badge>
        </Card>

        <Card pad={20} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginBottom: 12 }}>MUESTRA EN PORTERÍA</div>
          <QRMock size={210} />
          <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 14, textAlign: 'center' }}>
            La portería escanea este código al ingresar.
          </div>
        </Card>

        <Card pad={16} style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <KV label="Autorizado desde" value="Hoy, 8:00 a.m." />
            <KV label="Hasta"             value="Hoy, 6:00 p.m." />
            <KV label="Unidad"            value="Torre 3 · Apto 502" />
            <KV label="Autorizado por"    value="Ana Rivera" />
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="secondary"   size="md">Extender</Button>
          <Button variant="destructive" size="md">Revocar</Button>
        </div>
      </ScrollArea>
    </Screen>
  );
}

function KV({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div style={{ ...HF.bodySm, color: HT.gray500 }}>{label}</div>
      <div style={{ ...HF.body, color: HT.gray900, fontWeight: 600, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

// QR placeholder
function QRMock({ size = 200, color = HT.gray900 }) {
  // pseudo-random pattern; deterministic so it looks like a real QR
  const cells = 25;
  const cell = size / cells;
  const rand = (i, j) => ((i * 73856093) ^ (j * 19349663)) % 100 < 48;
  const isFinder = (i, j) =>
    (i < 7 && j < 7) || (i < 7 && j >= cells - 7) || (i >= cells - 7 && j < 7);
  const finder = (x, y) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x * cell} y={y * cell} width={cell * 7} height={cell * 7} fill={color} />
      <rect x={(x + 1) * cell} y={(y + 1) * cell} width={cell * 5} height={cell * 5} fill="#fff" />
      <rect x={(x + 2) * cell} y={(y + 2) * cell} width={cell * 3} height={cell * 3} fill={color} />
    </g>
  );
  const dots = [];
  for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
    if (!isFinder(i, j) && rand(i, j)) dots.push(<rect key={`${i}-${j}`} x={i * cell} y={j * cell} width={cell} height={cell} fill={color} />);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: '#fff', borderRadius: 8 }}>
      {dots}
      {finder(0, 0)}
      {finder(cells - 7, 0)}
      {finder(0, cells - 7)}
    </svg>
  );
}

// ============================================================
// R4 — Crear visita
// ============================================================
function R_CrearVisita() {
  return (
    <Screen>
      <AppBar title="Autorizar visita" back />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nombre completo"  icon="user"     value="Carlos Mendoza Rojas" />
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
            <Select label="Tipo doc." value="CC" />
            <Input label="Número"  placeholder="Número de documento" value="1.045.872.391" />
          </div>
          <Select label="Relación"   value="Empleado doméstico" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Desde"  icon="calendar" value="Hoy" />
            <Input label="Hasta"  icon="calendar" value="Hoy, 18:00" />
          </div>
          <Input label="Observaciones (opcional)" placeholder="Notas para la portería" multiline />
        </div>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary">Autorizar visita</Button>
      </div>
    </Screen>
  );
}

// ============================================================
// R5 — Pagos / Estado de cuenta
// ============================================================
function R_Pagos() {
  return (
    <Screen>
      <AppBar title="Estado de cuenta" />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        <Card pad={20} bg={HT.primary} border={HT.primary}>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.75)' }}>Saldo pendiente total</div>
          <div style={{ ...HF.display, color: '#fff', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>$487.500</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.85)', marginTop: 4 }}>Próximo vencimiento · 15 jun 2026</div>
          <div style={{ marginTop: 16 }}>
            <Button variant="onDark" size="md" iconRight="arrowR">Pagar ahora</Button>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, overflowX: 'auto' }}>
          <Chip active>Todas</Chip>
          <Chip>Pendientes <span style={{ marginLeft: 4, color: HT.gray400 }}>2</span></Chip>
          <Chip>Vencidas <span style={{ marginLeft: 4, color: HT.gray400 }}>1</span></Chip>
          <Chip>Pagadas</Chip>
        </div>

        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, margin: '18px 0 8px' }}>JUNIO 2026</div>
        <InvoiceCard concept="Administración" period="Junio 2026" amount="$385.000" due="Vence 15 jun" tone="warning" stateLabel="Pendiente" />
        <InvoiceCard concept="Multa parqueadero" period="06 jun · Visita" amount="$45.000" due="Vence 20 jun" tone="warning" stateLabel="Pendiente" />

        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, margin: '18px 0 8px' }}>MAYO 2026</div>
        <InvoiceCard concept="Cuota extraordinaria" period="Mayo 2026" amount="$57.500" due="Vencida hace 9 días" tone="danger" stateLabel="Vencida" />
        <InvoiceCard concept="Administración" period="Mayo 2026" amount="$385.000" due="Pagada 14 may" tone="success" stateLabel="Pagada" />
      </ScrollArea>
    </Screen>
  );
}

function InvoiceCard({ concept, period, amount, due, tone, stateLabel }) {
  return (
    <Card pad={16} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900 }}>{concept}</div>
          <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{period}</div>
          <div style={{ ...HF.bodySm, color: tone === 'danger' ? HT.dangerText : HT.gray700, marginTop: 6 }}>{due}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...HF.h3, color: HT.gray900, fontVariantNumeric: 'tabular-nums' }}>{amount}</div>
          <Badge tone={tone} size="sm" style={{ marginTop: 6 }}>{stateLabel}</Badge>
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// R6 — Comunicados
// ============================================================
function R_Comunicados() {
  const items = [
    { tone: 'danger',  cat: 'Urgente',       title: 'Fuga de agua en torre 4 · piso 8', preview: 'Personal técnico ya está atendiendo. Evitar el área temporalmente.', date: 'Hoy, 9:42' },
    { tone: 'warning', cat: 'Mantenimiento', title: 'Corte de agua programado · torres 2 y 3', preview: 'Sábado 18 · 8:00 a.m. a 1:00 p.m. Mantenimiento de tanques.', date: 'Hoy, 8:00' },
    { tone: 'info',    cat: 'Informativo',   title: 'Nuevo horario zonas comunes',        preview: 'Desde el 1 de julio el gimnasio abre 5:00 a.m. – 10:00 p.m.', date: 'Ayer' },
    { tone: 'accent',  cat: 'Reunión',       title: 'Asamblea ordinaria · convocatoria', preview: 'Domingo 30 de junio, 9:00 a.m. en el salón social. Quórum 60%.', date: '12 jun' },
    { tone: 'info',    cat: 'Informativo',   title: 'Cambio de empresa de aseo',         preview: 'Desde julio 1 inicia operaciones Limpiar S.A.S.',           date: '10 jun' },
  ];
  return (
    <Screen>
      <AppBar title="Comunicados" />
      <div style={{ padding: '4px 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <Chip active>Todos</Chip>
        <Chip>Urgente</Chip>
        <Chip>Informativo</Chip>
        <Chip>Mantenimiento</Chip>
        <Chip>Reunión</Chip>
      </div>
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={16} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge tone={it.tone} dot>{it.cat}</Badge>
              <span style={{ ...HF.small, color: HT.gray400 }}>{it.date}</span>
            </div>
            <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900, marginTop: 10 }}>{it.title}</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>{it.preview}</div>
          </Card>
        ))}
      </ScrollArea>
      <BottomNav items={RESIDENT_NAV} active={3} />
    </Screen>
  );
}

// ============================================================
// R7 — Detalle comunicado
// ============================================================
function R_ComunicadoDetalle() {
  return (
    <Screen>
      <AppBar title="" back action={<Icon name="moreV" size={22} color={HT.gray700} />} />
      <ScrollArea style={{ padding: '0 24px 32px' }}>
        <Badge tone="warning" dot>Mantenimiento</Badge>
        <div style={{ ...HF.display, color: HT.gray900, marginTop: 14, fontSize: 28 }}>
          Corte de agua programado · torres 2 y 3
        </div>
        <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="calendar" size={14} color={HT.gray400} /> Publicado · 13 jun 2026, 8:00 a.m.
        </div>

        <div style={{ marginTop: 24, ...HF.bodyLg, color: HT.gray800, lineHeight: 1.65 }}>
          <p style={{ margin: '0 0 14px' }}>
            Estimados residentes, les informamos que el próximo <strong>sábado 18 de junio</strong> entre las <strong>8:00 a.m. y la 1:00 p.m.</strong> se realizará un corte programado de agua en las torres 2 y 3 por mantenimiento preventivo de los tanques de almacenamiento.
          </p>
          <p style={{ margin: '0 0 14px' }}>
            Les sugerimos almacenar agua suficiente para sus necesidades durante este tiempo y revisar el cierre de llaves para evitar inconvenientes al restablecerse el servicio.
          </p>
          <p style={{ margin: 0 }}>
            En caso de imprevistos, el servicio podría restablecerse de manera escalonada entre 1:00 y 2:30 p.m.
          </p>
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${HT.gray200}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials="AM" size={40} bg={HT.gray100} color={HT.gray700} />
          <div>
            <div style={{ ...HF.body, fontWeight: 600 }}>Administración</div>
            <div style={{ ...HF.bodySm, color: HT.gray500 }}>Reservas del Prado</div>
          </div>
        </div>
      </ScrollArea>
    </Screen>
  );
}

// ============================================================
// R8 — Menú Más
// ============================================================
function R_Mas() {
  const services = [
    { icon: 'document',  label: 'PQRS',              tone: HT.primarySoft, fg: HT.primaryDark },
    { icon: 'leaf',      label: 'Zonas comunes',     tone: HT.successBg,   fg: HT.successText },
    { icon: 'parking',   label: 'Sorteo parqueadero', tone: HT.infoBg,      fg: HT.infoText },
    { icon: 'alert',     label: 'Reportar novedad',  tone: HT.warningBg,   fg: HT.warningText },
    { icon: 'tools',     label: 'Servicios externos',tone: HT.accentSoft,  fg: HT.accentDark },
    { icon: 'calendar',  label: 'Citas admin',       tone: HT.gray100,     fg: HT.gray700 },
  ];
  return (
    <Screen>
      <AppBar title="Más" />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        <Card pad={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials="AR" size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900 }}>Ana Rivera</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>ana.rivera@correo.com</div>
          </div>
          <Icon name="chevR" size={18} color={HT.gray300} />
        </Card>

        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, margin: '22px 4px 10px' }}>SERVICIOS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {services.map((s, i) => (
            <Card key={i} pad={16}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={20} color={s.fg} />
              </div>
              <div style={{ ...HF.body, fontWeight: 600, color: HT.gray900, marginTop: 14 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <Button variant="destructive" icon="logout">Cerrar sesión</Button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${HT.gray200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Logo size={36} variant="flat" />
          <div style={{ ...HF.small, color: HT.gray400, fontFamily: HF.mono, letterSpacing: '0.6px' }}>HABITARE · v2.4.0</div>
        </div>
      </ScrollArea>
      <BottomNav items={RESIDENT_NAV} active={4} />
    </Screen>
  );
}

// ============================================================
// R9 — Perfil residente
// ============================================================
function R_Perfil() {
  return (
    <Screen>
      <AppBar title="Perfil" back />
      <ScrollArea style={{ padding: '0 20px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 24px' }}>
          <Avatar initials="AR" size={96} />
          <div style={{ ...HF.h1, marginTop: 14 }}>Ana Rivera</div>
          <div style={{ ...HF.body, color: HT.gray500, marginTop: 2 }}>ana.rivera@correo.com</div>
        </div>

        <Card pad={0}>
          <ProfileRow icon="location" label="Conjunto" value="Reservas del Prado" />
          <ProfileRow icon="grid"     label="Unidad"   value="Torre 3 · Apto 502" />
          <ProfileRow icon="phone"    label="Teléfono" value="+57 312 487 9120" />
          <ProfileRow icon="document" label="Documento" value="CC · 1.123.456.789" last />
        </Card>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" icon="lock">Cambiar contraseña</Button>
          <Button variant="destructive" icon="logout">Cerrar sesión</Button>
        </div>
      </ScrollArea>
    </Screen>
  );
}

function ProfileRow({ icon, label, value, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px', borderBottom: last ? 'none' : `1px solid ${HT.gray100}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: HT.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={HT.gray600} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...HF.small, color: HT.gray500 }}>{label}</div>
        <div style={{ ...HF.body, color: HT.gray900, fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  R_Dashboard, R_Visitantes, R_VisitanteDetalle, R_CrearVisita, R_Pagos,
  R_Comunicados, R_ComunicadoDetalle, R_Mas, R_Perfil, QRMock,
});
