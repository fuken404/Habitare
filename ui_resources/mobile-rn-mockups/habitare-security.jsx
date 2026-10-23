// habitare-security.jsx — Security flow screens S1–S8 + Nav flow diagram

// ============================================================
// S1 — Dashboard seguridad
// ============================================================
function S_Dashboard() {
  return (
    <Screen>
      <div style={{ padding: '4px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials="MO" size={44} bg={HT.gray900} color="#fff" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...HF.h2 }}>Hola, Manuel</div>
          <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, marginTop: 2 }}>RESERVAS DEL PRADO · TURNO 6 A.M. – 2 P.M.</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: HT.white, border: `1px solid ${HT.gray200}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell" size={20} color={HT.gray700} />
        </div>
      </div>

      <ScrollArea>
        {/* Big QR action card */}
        <div style={{ background: HT.primary, borderRadius: 20, padding: '22px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: 'absolute', right: -70, top: -50, opacity: 0.1 }}>
            <rect x="10" y="10" width="60" height="60" rx="8" stroke="#fff" strokeWidth="2" fill="none"/>
            <rect x="170" y="10" width="60" height="60" rx="8" stroke="#fff" strokeWidth="2" fill="none"/>
            <rect x="10" y="170" width="60" height="60" rx="8" stroke="#fff" strokeWidth="2" fill="none"/>
            <rect x="90" y="90" width="20" height="20" fill="#fff"/>
            <rect x="130" y="110" width="20" height="20" fill="#fff"/>
            <rect x="110" y="150" width="40" height="20" fill="#fff"/>
          </svg>
          <Badge style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }} dot>Acción rápida</Badge>
          <div style={{ ...HF.h1, color: '#fff', marginTop: 14, lineHeight: 1.2 }}>Escanear QR de visitante</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>Acceso autorizado en segundos.</div>
          <div style={{ marginTop: 20 }}>
            <Button variant="onDark" size="md" icon="scan" iconRight="arrowR">Abrir escáner</Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 22 }}>
          <div style={{ ...HF.h3, marginBottom: 12 }}>Hoy</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Card pad={16}>
              <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Ingresos</div>
              <div style={{ ...HF.display, color: HT.gray900, marginTop: 6, fontSize: 28 }}>27</div>
              <div style={{ ...HF.bodySm, color: HT.successText, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="chevU" size={12} color={HT.successText} /> +6 vs ayer
              </div>
            </Card>
            <Card pad={16}>
              <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>En conjunto</div>
              <div style={{ ...HF.display, color: HT.gray900, marginTop: 6, fontSize: 28 }}>12</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>visitantes activos</div>
            </Card>
            <Card pad={16}>
              <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Servicios externos</div>
              <div style={{ ...HF.display, color: HT.gray900, marginTop: 6, fontSize: 28 }}>4</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>en el conjunto</div>
            </Card>
            <Card pad={16}>
              <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Reportes</div>
              <div style={{ ...HF.display, color: HT.gray900, marginTop: 6, fontSize: 28 }}>2</div>
              <div style={{ ...HF.bodySm, color: HT.warningText, marginTop: 4 }}>severidad media</div>
            </Card>
          </div>
        </div>

        {/* Último comunicado */}
        <div style={{ marginTop: 24 }}>
          <div style={{ ...HF.h3, marginBottom: 12 }}>Último comunicado</div>
          <Card pad={16}>
            <Badge tone="warning" dot>Mantenimiento</Badge>
            <div style={{ ...HF.body, fontWeight: 700, marginTop: 10 }}>Corte de agua programado · torres 2 y 3</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 6 }}>Sábado 18 · 8:00 a.m. – 1:00 p.m.</div>
          </Card>
        </div>

        <div style={{ height: 16 }} />
      </ScrollArea>

      <BottomNav items={SECURITY_NAV} active={2} />
    </Screen>
  );
}

// ============================================================
// S2 — Visitantes seguridad
// ============================================================
function S_Visitantes() {
  const items = [
    { name: 'Carlos Mendoza',    unidad: 'T3 · 502', entrada: '08:12', salida: null,   tone: 'success', estado: 'En conjunto', ini: 'CM' },
    { name: 'Diego Pérez',       unidad: 'T1 · 304', entrada: '09:45', salida: null,   tone: 'success', estado: 'En conjunto', ini: 'DP' },
    { name: 'Andrés Cifuentes',  unidad: 'T3 · 502', entrada: '14:32', salida: null,   tone: 'info',    estado: 'Domicilio',   ini: 'AC' },
    { name: 'Laura Restrepo',    unidad: 'T3 · 502', entrada: '11:20', salida: '13:45', tone: 'neutral', estado: 'Salió',     ini: 'LR' },
    { name: 'María Vega',        unidad: 'T2 · 801', entrada: '10:00', salida: '14:00', tone: 'neutral', estado: 'Salió',     ini: 'MV' },
  ];
  return (
    <Screen>
      <AppBar title="Visitantes" subtitle="Hoy · 27 ingresos" action={
        <div style={{ width: 40, height: 40, borderRadius: 12, background: HT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="scan" size={22} color="#fff" />
        </div>
      } />
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <Chip active>Todos</Chip>
        <Chip>En conjunto <span style={{ marginLeft: 4, color: 'inherit', opacity: .6 }}>12</span></Chip>
        <Chip>Salieron <span style={{ marginLeft: 4, opacity: .6 }}>15</span></Chip>
      </div>
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        {items.map((v, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials={v.ini} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ ...HF.body, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                  <Badge tone={v.tone} dot size="sm">{v.estado}</Badge>
                </div>
                <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>Unidad {v.unidad}</div>
                <div style={{ ...HF.bodySm, color: HT.gray700, marginTop: 4, display: 'flex', gap: 12, fontFamily: HF.mono, fontSize: 12 }}>
                  <span>ENTRA {v.entrada}</span>
                  {v.salida && <span>SALE {v.salida}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
      <BottomNav items={SECURITY_NAV} active={1} />
    </Screen>
  );
}

// ============================================================
// S3 — Detalle visitante seguridad
// ============================================================
function S_VisitanteDetalle() {
  return (
    <Screen>
      <AppBar title="Ingreso del visitante" back />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        <Card pad={20} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Avatar initials="CM" size={80} />
          <div style={{ ...HF.h2, marginTop: 14 }}>Carlos Mendoza</div>
          <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4, fontFamily: HF.mono }}>CC · 1.045.872.391</div>
          <Badge tone="success" dot style={{ marginTop: 12 }}>En conjunto</Badge>
        </Card>

        <Card pad={0} style={{ marginTop: 14 }}>
          <ProfileRow icon="grid"    label="Unidad destino"  value="Torre 3 · Apto 502" />
          <ProfileRow icon="user"    label="Autorizado por"  value="Ana Rivera" />
          <ProfileRow icon="people"  label="Relación"        value="Empleado doméstico" />
          <ProfileRow icon="clock"   label="Entrada"         value="Hoy, 8:12 a.m." />
          <ProfileRow icon="calendar" label="Autorización"   value="08:00 – 18:00" last />
        </Card>

        <Card pad={16} style={{ marginTop: 14, background: HT.successBg, border: `1px solid ${HT.successBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="checkCircle" size={20} color={HT.successText} />
            <div style={{ flex: 1 }}>
              <div style={{ ...HF.body, color: HT.successText, fontWeight: 700 }}>Acceso vigente</div>
              <div style={{ ...HF.bodySm, color: HT.successText, opacity: .9, marginTop: 2 }}>Autorización válida por 5 h 48 min más.</div>
            </div>
          </div>
        </Card>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary" icon="logout">Registrar salida</Button>
      </div>
    </Screen>
  );
}

// ============================================================
// S4 — Escáner QR
// ============================================================
function S_Scanner() {
  return (
    <Screen bg={HT.gray900}>
      {/* fake camera view */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #2A2820, #0F0E0A 80%)' }} />
      {/* viewfinder */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={20} color="#fff" />
          </div>
          <div style={{ ...HF.body, color: '#fff', fontWeight: 600 }}>Escanear QR</div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sun" size={20} color="#fff" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 40px' }}>
          <Viewfinder size={260} />
        </div>

        <div style={{ padding: '0 32px 110px', textAlign: 'center' }}>
          <div style={{ ...HF.body, color: '#fff', fontWeight: 600 }}>Apunta al código QR del visitante</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>Mantén el código dentro del marco. El escaneo es automático.</div>
        </div>
      </div>

      {/* result sheet */}
      <div style={{ position: 'absolute', left: 12, right: 12, bottom: 24, background: HT.white, borderRadius: 20, padding: 18, boxShadow: '0 12px 32px rgba(0,0,0,.4)', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials="CM" size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...HF.body, fontWeight: 700 }}>Carlos Mendoza</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>Torre 3 · Apto 502</div>
          </div>
          <Badge tone="success" dot>Autorizado</Badge>
        </div>
        <div style={{ ...HF.bodySm, color: HT.gray600, marginTop: 12, lineHeight: 1.5 }}>Autorización vigente hasta hoy 6:00 p.m. Empleado doméstico.</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button variant="destructive" size="md">Rechazar</Button>
          <Button variant="primary" size="md">Autorizar ingreso</Button>
        </div>
      </div>
    </Screen>
  );
}

function Viewfinder({ size = 240 }) {
  const corner = (rot) => (
    <path d="M0 18V8a8 8 0 0 1 8-8h10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" transform={`rotate(${rot} 13 13)`} />
  );
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width="26" height="26" viewBox="0 0 26 26" style={{ position: 'absolute', top: 0,    left: 0   }}>{corner(0)}</svg>
      <svg width="26" height="26" viewBox="0 0 26 26" style={{ position: 'absolute', top: 0,    right: 0  }}>{corner(90)}</svg>
      <svg width="26" height="26" viewBox="0 0 26 26" style={{ position: 'absolute', bottom: 0, right: 0  }}>{corner(180)}</svg>
      <svg width="26" height="26" viewBox="0 0 26 26" style={{ position: 'absolute', bottom: 0, left: 0   }}>{corner(270)}</svg>
      {/* scan line */}
      <div style={{ position: 'absolute', top: '40%', left: 14, right: 14, height: 2, borderRadius: 1, background: 'linear-gradient(90deg, transparent, rgba(31,107,85,0) 0%, rgba(31,107,85,1) 50%, transparent 100%)', boxShadow: '0 0 20px rgba(31,107,85,.7)' }} />
    </div>
  );
}

// ============================================================
// S5 — Reportes seguridad
// ============================================================
function S_Reportes() {
  const items = [
    { tipo: 'Vidrios rotos',          desc: 'En zona de bicicletas',          sev: 'Alta',   tone: 'warning', date: 'Hoy 09:42', user: 'Ana Rivera (T3·502)' },
    { tipo: 'Persona no autorizada',  desc: 'Intentó ingresar por sótano 2',  sev: 'Crítica',tone: 'danger',  date: 'Hoy 04:18', user: 'Manuel O. (turno noche)' },
    { tipo: 'Mascota suelta',         desc: 'Perro sin correa en zona social',sev: 'Media',  tone: 'info',    date: 'Ayer 19:30', user: 'Reportado por residente' },
    { tipo: 'Daño ascensor torre 4',  desc: 'Atascado entre pisos 3 y 4',     sev: 'Alta',   tone: 'warning', date: 'Ayer 14:10', user: 'Manuel O.' },
    { tipo: 'Filtración parqueadero', desc: 'Cupo 47 sótano 2',               sev: 'Media',  tone: 'info',    date: '12 jun',     user: 'Ana Rivera' },
  ];
  return (
    <Screen>
      <AppBar title="Reportes" />
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <Chip active>Todos</Chip>
        <Chip>Crítica</Chip>
        <Chip>Alta</Chip>
        <Chip>Media</Chip>
        <Chip>Baja</Chip>
      </div>
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...HF.body, fontWeight: 700 }}>{it.tipo}</div>
                <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>{it.desc}</div>
              </div>
              <Badge tone={it.tone} dot size="sm">{it.sev}</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${HT.gray100}` }}>
              <span style={{ ...HF.small, color: HT.gray500 }}>{it.user}</span>
              <span style={{ ...HF.small, color: HT.gray400, fontFamily: HF.mono }}>{it.date}</span>
            </div>
          </Card>
        ))}
      </ScrollArea>
      <FAB icon="plus" label="Nuevo reporte" />
      <BottomNav items={SECURITY_NAV} active={0} />
    </Screen>
  );
}

// ============================================================
// S6 — Zonas comunes seguridad
// ============================================================
function S_Zonas() {
  const items = [
    { name: 'BBQ Terraza',  icon: 'bbq',      cap: 12, estado: 'Ocupada',       tone: 'warning', usuario: 'Familia Rivera · hasta 17:00' },
    { name: 'Salón social', icon: 'handshake', cap: 50, estado: 'Disponible',    tone: 'success', usuario: 'Próxima reserva · 18:00' },
    { name: 'Gimnasio',     icon: 'gym',      cap: 8,  estado: 'Ocupada',       tone: 'warning', usuario: '4 / 8 personas' },
    { name: 'Cancha múlt.', icon: 'soccer',   cap: 10, estado: 'Mantenimiento', tone: 'danger',  usuario: 'Hasta el viernes' },
    { name: 'Piscina',      icon: 'swimming', cap: 30, estado: 'Disponible',    tone: 'success', usuario: '0 personas ahora' },
  ];
  return (
    <Screen>
      <AppBar title="Zonas comunes" />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        {items.map((z, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: z.tone === 'danger' ? HT.dangerBg : z.tone === 'warning' ? HT.warningBg : HT.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={z.icon} size={24} color={z.tone === 'danger' ? HT.dangerText : z.tone === 'warning' ? HT.warningText : HT.successText} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ ...HF.body, fontWeight: 700 }}>{z.name}</div>
                  <Badge tone={z.tone} dot size="sm">{z.estado}</Badge>
                </div>
                <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>Capacidad {z.cap}</div>
                <div style={{ ...HF.bodySm, color: HT.gray700, marginTop: 4 }}>{z.usuario}</div>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
      <BottomNav items={SECURITY_NAV} active={3} />
    </Screen>
  );
}

// ============================================================
// S7 — Comunicados (seguridad — same list, marked role)
// ============================================================
function S_Comunicados() {
  // reuse layout from R_Comunicados but with security nav
  const items = [
    { tone: 'danger',  cat: 'Urgente',       title: 'Persona no autorizada · sótano 2',     preview: 'Reportar inmediatamente. Notificar a empresa de seguridad.', date: 'Hoy, 4:18' },
    { tone: 'warning', cat: 'Mantenimiento', title: 'Corte de agua programado torres 2 y 3', preview: 'Sábado 18 · 8:00 a.m. a 1:00 p.m.', date: 'Hoy, 8:00' },
    { tone: 'info',    cat: 'Informativo',   title: 'Nuevo horario zonas comunes',           preview: 'Desde julio 1 el gimnasio abre 5:00 a.m.',                  date: 'Ayer' },
    { tone: 'accent',  cat: 'Reunión',       title: 'Asamblea ordinaria · convocatoria',     preview: 'Domingo 30 jun, 9:00 a.m. en salón social.',                 date: '12 jun' },
  ];
  return (
    <Screen>
      <AppBar title="Comunicados" />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={16} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge tone={it.tone} dot>{it.cat}</Badge>
              <span style={{ ...HF.small, color: HT.gray400 }}>{it.date}</span>
            </div>
            <div style={{ ...HF.body, fontWeight: 700, marginTop: 10 }}>{it.title}</div>
            <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>{it.preview}</div>
          </Card>
        ))}
      </ScrollArea>
      <BottomNav items={SECURITY_NAV} active={4} />
    </Screen>
  );
}

// ============================================================
// S8 — Perfil seguridad
// ============================================================
function S_Perfil() {
  return (
    <Screen>
      <AppBar title="Perfil" back />
      <ScrollArea style={{ padding: '0 20px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 24px' }}>
          <Avatar initials="MO" size={96} bg={HT.gray900} color="#fff" />
          <div style={{ ...HF.h1, marginTop: 14 }}>Manuel Ortiz</div>
          <Badge tone="dark" style={{ marginTop: 8 }}>Seguridad</Badge>
        </div>

        <Card pad={0}>
          <ProfileRow icon="location" label="Conjunto" value="Reservas del Prado" />
          <ProfileRow icon="clock"    label="Turno"    value="6:00 a.m. – 2:00 p.m." />
          <ProfileRow icon="phone"    label="Teléfono" value="+57 320 991 4456" />
          <ProfileRow icon="document" label="ID empleado" value="SEG-2023-018" last />
        </Card>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="destructive" icon="logout">Cerrar sesión</Button>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${HT.gray200}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Logo size={36} variant="flat" />
          <div style={{ ...HF.small, color: HT.gray400, fontFamily: HF.mono, letterSpacing: '0.6px' }}>HABITARE · TURNO REGISTRADO</div>
        </div>
      </ScrollArea>
    </Screen>
  );
}

Object.assign(window, { S_Dashboard, S_Visitantes, S_VisitanteDetalle, S_Scanner, S_Reportes, S_Zonas, S_Comunicados, S_Perfil });
