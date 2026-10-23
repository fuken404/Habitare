// habitare-resident-2.jsx — Resident services (R10–R23)

// ============================================================
// R10 — PQRS: Lista
// ============================================================
function R_PQRSLista() {
  const items = [
    { tipo: 'Queja',      tone: 'danger',  asunto: 'Ruido en zona social después de las 11 p.m.', rad: '2025-PQR-0042', date: 'Hoy', estado: 'Abierta',    estadoTone: 'warning' },
    { tipo: 'Petición',   tone: 'primary', asunto: 'Solicitud de poda de arbusto frente al apto 504', rad: '2025-PQR-0040', date: 'Ayer', estado: 'En proceso', estadoTone: 'info' },
    { tipo: 'Incidente',  tone: 'danger',  asunto: 'Filtración en techo de parqueadero',           rad: '2025-PQR-0038', date: '12 jun', estado: 'En proceso', estadoTone: 'info' },
    { tipo: 'Sugerencia', tone: 'accent',  asunto: 'Mejorar iluminación senderos peatonales',      rad: '2025-PQR-0031', date: '8 jun',  estado: 'Cerrada',    estadoTone: 'success' },
    { tipo: 'Reclamo',    tone: 'warning', asunto: 'Cobro duplicado mes de abril',                  rad: '2025-PQR-0028', date: '2 jun',  estado: 'Cerrada',    estadoTone: 'success' },
  ];
  return (
    <Screen>
      <AppBar title="PQRS" />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={16} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Badge tone={it.tone}>{it.tipo}</Badge>
              <Badge tone={it.estadoTone} dot size="sm">{it.estado}</Badge>
            </div>
            <div style={{ ...HF.body, fontWeight: 600, color: HT.gray900, marginTop: 12, lineHeight: 1.35 }}>{it.asunto}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>{it.rad}</span>
              <span style={{ ...HF.small, color: HT.gray400 }}>{it.date}</span>
            </div>
          </Card>
        ))}
      </ScrollArea>
      <FAB icon="plus" label="Nueva PQRS" />
    </Screen>
  );
}

// ============================================================
// R11 — PQRS: Formulario nuevo
// ============================================================
function R_PQRSNueva() {
  return (
    <Screen>
      <AppBar title="Nueva PQRS" back />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        <div style={{ ...HF.body, color: HT.gray600, marginBottom: 18 }}>
          Cuéntanos qué necesitas. Tu administrador recibirá la solicitud y te responderá por este medio.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ ...HF.small, color: HT.gray700, fontWeight: 600, marginBottom: 8 }}>Tipo</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Chip>Petición</Chip>
              <Chip>Queja</Chip>
              <Chip>Reclamo</Chip>
              <Chip>Sugerencia</Chip>
              <Chip active>Incidente</Chip>
            </div>
          </div>
          <Input label="Asunto" placeholder="Resume en una línea" value="Filtración en techo de parqueadero" />
          <Input label="Descripción" placeholder="Cuenta los detalles" value="Hay una filtración constante sobre el cupo 47 del parqueadero sótano 2. El agua cae sobre el carro y la mancha ya está creciendo desde el viernes." multiline />
          {/* additional incidente fields */}
          <Card pad={14} bg={HT.warningBg} border={HT.warningBorder}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="alert" size={16} color={HT.warningText} />
              <span style={{ ...HF.small, color: HT.warningText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Detalles del incidente</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ ...HF.small, color: HT.gray700, fontWeight: 600, marginBottom: 6 }}>Severidad</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Chip>Baja</Chip>
                  <Chip active>Media</Chip>
                  <Chip>Alta</Chip>
                  <Chip>Crítica</Chip>
                </div>
              </div>
              <Input label="Ubicación" icon="location" value="Parqueadero sótano 2 · cupo 47" />
            </div>
          </Card>
        </div>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary">Radicar PQRS</Button>
      </div>
    </Screen>
  );
}

// ============================================================
// R12 — PQRS: Detalle
// ============================================================
function R_PQRSDetalle() {
  return (
    <Screen>
      <AppBar title="" back />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>2025-PQR-0042</span>
          <span style={{ ...HF.small, color: HT.gray400 }}>Radicado hace 4 horas</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <Badge tone="danger">Queja</Badge>
          <Badge tone="warning" dot>Abierta</Badge>
        </div>
        <div style={{ ...HF.h2, marginTop: 14, lineHeight: 1.3 }}>
          Ruido en zona social después de las 11 p.m.
        </div>
        <div style={{ ...HF.body, color: HT.gray700, marginTop: 10, lineHeight: 1.55 }}>
          Llevamos tres fines de semana seguidos con eventos en la zona social que se extienden hasta las 2 a.m. con música muy alta. Mi apartamento queda en el piso 5 y no podemos descansar.
        </div>

        <div style={{ marginTop: 22, ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>HISTORIAL</div>
        <div style={{ marginTop: 12, paddingLeft: 8 }}>
          <Timeline>
            <TimelineItem author="Ana Rivera" you when="Hoy, 9:42" body="Radicado inicial de la queja." />
            <TimelineItem author="Administración" when="Hoy, 11:15"
              body="Recibimos tu queja. Vamos a revisar el reglamento de uso del salón social y te respondemos esta misma semana." />
            <TimelineItem author="Ana Rivera" you when="Hoy, 13:20"
              body="Gracias. Adjunto envío audio del ruido tomado anoche a las 12:40 a.m." />
          </Timeline>
        </div>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 12px 28px', background: HT.bg, borderTop: `1px solid ${HT.gray200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: HT.white, border: `1px solid ${HT.gray200}`, borderRadius: 24, padding: '6px 6px 6px 16px' }}>
          <div style={{ flex: 1, ...HF.body, color: HT.gray400 }}>Escribe tu respuesta…</div>
          <button style={{ width: 38, height: 38, borderRadius: 19, border: 'none', background: HT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={18} color="#fff" />
          </button>
        </div>
      </div>
    </Screen>
  );
}

function Timeline({ children }) {
  const arr = React.Children.toArray(children);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: HT.gray200 }} />
      {arr.map((c, i) => <div key={i}>{c}</div>)}
    </div>
  );
}

function TimelineItem({ author, you, when, body }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 30, paddingBottom: 18 }}>
      <div style={{ position: 'absolute', left: 0, top: 6, width: 16, height: 16, borderRadius: 8, background: you ? HT.primary : HT.white, border: `2px solid ${you ? HT.primary : HT.gray300}` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900 }}>{author}{you && <span style={{ ...HF.small, color: HT.gray500, marginLeft: 6, fontWeight: 500 }}>(tú)</span>}</div>
        <div style={{ ...HF.small, color: HT.gray400 }}>{when}</div>
      </div>
      <div style={{ ...HF.bodySm, color: HT.gray700, marginTop: 4, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

// ============================================================
// R13 — PQRS: Éxito
// ============================================================
function R_PQRSExito({ titulo = 'PQRS radicada', rad = '2025-PQR-0042', sub = 'Tu solicitud fue enviada. Recibirás respuesta en máximo 5 días hábiles.', primary = 'Ver mis PQRS', secondary = 'Volver al inicio' }) {
  return (
    <Screen>
      <AppBar title="" back={false} action={<button style={{ border: 'none', background: 'transparent', ...HF.body, fontWeight: 600, color: HT.gray500 }}>Cerrar</button>} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 32px' }}>
        <CheckBurst />
        <div style={{ ...HF.h1, marginTop: 28 }}>{titulo}</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 10, maxWidth: 300 }}>{sub}</div>

        <div style={{ marginTop: 28, background: HT.primarySoft, border: `1px solid ${HT.primaryMuted}`, borderRadius: 14, padding: '14px 22px' }}>
          <div style={{ ...HF.small, color: HT.primaryDark, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Radicado</div>
          <div style={{ ...HF.h2, fontFamily: HF.mono, color: HT.primaryDark, marginTop: 4, letterSpacing: '0.5px' }}>{rad}</div>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 24 }}>
          <Button variant="primary">{primary}</Button>
          <Button variant="text">{secondary}</Button>
        </div>
      </div>
    </Screen>
  );
}

function CheckBurst() {
  return (
    <div style={{ position: 'relative', width: 120, height: 120, marginTop: 28 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 60, background: HT.primarySoft }} />
      <div style={{ position: 'absolute', inset: 16, borderRadius: 44, background: HT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={44} color="#fff" />
      </div>
      {/* sparkles */}
      <div style={{ position: 'absolute', top: 6, right: 10, color: HT.accent }}><Icon name="sparkle" size={18} color={HT.accent} filled /></div>
      <div style={{ position: 'absolute', bottom: 12, left: 4, color: HT.accent }}><Icon name="sparkle" size={12} color={HT.accent} filled /></div>
    </div>
  );
}

// ============================================================
// R14 — Zonas: mis reservas
// ============================================================
function R_ZonasMisReservas() {
  const items = [
    { zona: 'BBQ Terraza', icon: 'bbq', fecha: 'Sáb 21 jun', hora: '13:00 – 17:00', estado: 'Confirmada', tone: 'success' },
    { zona: 'Salón social', icon: 'handshake', fecha: 'Dom 29 jun', hora: '18:00 – 22:00', estado: 'Pendiente pago', tone: 'warning' },
    { zona: 'Cancha múltiple', icon: 'soccer', fecha: 'Mié 18 jun', hora: '19:00 – 20:30', estado: 'Realizada', tone: 'neutral' },
  ];
  return (
    <Screen>
      <AppBar title="Zonas comunes" back />
      <div style={{ padding: '4px 20px 12px' }}>
        <div style={{ ...HF.h3 }}>Mis reservas</div>
      </div>
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: HT.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={it.icon} size={24} color={HT.successText} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...HF.body, fontWeight: 700 }}>{it.zona}</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 4 }}>{it.fecha} · {it.hora}</div>
              <Badge tone={it.tone} size="sm" style={{ marginTop: 8 }}>{it.estado}</Badge>
            </div>
            <Icon name="chevR" size={18} color={HT.gray300} />
          </Card>
        ))}
        <div style={{ height: 6 }} />
      </ScrollArea>
      <FAB icon="plus" label="Reservar zona" />
    </Screen>
  );
}

// ============================================================
// R15 — Reservar zona común
// ============================================================
function R_ReservarZona() {
  const zones = [
    { name: 'BBQ Terraza',  icon: 'bbq',       cap: '12 personas', tone: HT.successBg, fg: HT.successText, sel: true  },
    { name: 'Salón social', icon: 'handshake', cap: '50 personas', tone: HT.accentSoft, fg: HT.accentDark },
    { name: 'Gimnasio',     icon: 'gym',       cap: '8 personas',  tone: HT.primarySoft, fg: HT.primaryDark },
    { name: 'Cancha',       icon: 'soccer',    cap: '10 personas', tone: HT.infoBg, fg: HT.infoText },
  ];
  const slots = [
    { h: '08:00 – 10:00', av: true  },
    { h: '10:00 – 12:00', av: false },
    { h: '13:00 – 17:00', av: true, sel: true },
    { h: '17:00 – 21:00', av: true  },
  ];
  return (
    <Screen>
      <AppBar title="Reservar zona" back />
      <ScrollArea style={{ padding: '0 20px 110px' }}>
        <div style={{ ...HF.small, color: HT.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>1 · Zona</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {zones.map((z, i) => (
            <div key={i} style={{ minWidth: 132, padding: 14, borderRadius: 14, background: HT.white, border: `2px solid ${z.sel ? HT.primary : HT.gray200}`, flexShrink: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: z.tone, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={z.icon} size={22} color={z.fg} />
              </div>
              <div style={{ ...HF.body, fontWeight: 600, marginTop: 10 }}>{z.name}</div>
              <div style={{ ...HF.small, color: HT.gray500, marginTop: 2 }}>{z.cap}</div>
            </div>
          ))}
        </div>

        <div style={{ ...HF.small, color: HT.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '22px 0 10px' }}>2 · Fecha</div>
        <Card pad={14}>
          <MiniCalendar />
        </Card>

        <div style={{ ...HF.small, color: HT.gray500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '22px 0 10px' }}>3 · Horario</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {slots.map((s, i) => (
            <div key={i} style={{
              padding: '14px 12px', borderRadius: 12, textAlign: 'center',
              background: s.sel ? HT.primary : HT.white,
              color: !s.av ? HT.gray300 : s.sel ? '#fff' : HT.gray900,
              border: `1.5px solid ${s.sel ? HT.primary : HT.gray200}`,
              ...HF.body, fontWeight: 600, textDecoration: !s.av ? 'line-through' : 'none',
            }}>{s.h}</div>
          ))}
        </div>

        <Card pad={16} style={{ marginTop: 22, background: HT.primarySoft, border: `1px solid ${HT.primaryMuted}` }}>
          <div style={{ ...HF.small, color: HT.primaryDark, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resumen</div>
          <div style={{ ...HF.body, color: HT.gray900, marginTop: 8, lineHeight: 1.55 }}>
            <strong>BBQ Terraza</strong> · Sáb 21 jun<br/>13:00 – 17:00 · 12 personas
          </div>
        </Card>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary">Confirmar reserva</Button>
      </div>
    </Screen>
  );
}

function MiniCalendar() {
  const days = ['L','M','M','J','V','S','D'];
  const dates = [
    null,null,null,null,null,null,1,
    2,3,4,5,6,7,8,
    9,10,11,12,13,14,15,
    16,17,18,19,20,21,22,
    23,24,25,26,27,28,29,
    30,null,null,null,null,null,null,
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Icon name="chevL" size={20} color={HT.gray500} />
        <div style={{ ...HF.body, fontWeight: 700 }}>Junio 2026</div>
        <Icon name="chevR" size={20} color={HT.gray500} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{ ...HF.small, color: HT.gray400, textAlign: 'center', fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {dates.map((d, i) => {
          const sel = d === 21;
          const today = d === 14;
          const past = d && d < 14;
          return (
            <div key={i} style={{
              aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...HF.bodySm, fontWeight: sel ? 700 : 500,
              background: sel ? HT.primary : 'transparent',
              color: !d ? 'transparent' : sel ? '#fff' : past ? HT.gray300 : today ? HT.primaryDark : HT.gray800,
              borderRadius: 10, position: 'relative',
            }}>
              {d}
              {today && !sel && <div style={{ position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2, background: HT.primary }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// R16 — Reserva: éxito
// ============================================================
function R_ReservaExito() {
  return (
    <Screen>
      <AppBar title="" action={<button style={{ border: 'none', background: 'transparent', ...HF.body, fontWeight: 600, color: HT.gray500 }}>Cerrar</button>} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 32px' }}>
        <CheckBurst />
        <div style={{ ...HF.h1, marginTop: 28 }}>Reserva confirmada</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 10, maxWidth: 300 }}>Te enviamos la confirmación al correo y a tu calendario.</div>

        <Card pad={16} style={{ marginTop: 28, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: HT.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bbq" size={22} color={HT.successText} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ ...HF.body, fontWeight: 700 }}>BBQ Terraza</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>Hasta 12 personas</div>
            </div>
          </div>
          <div style={{ height: 1, background: HT.gray100, margin: '14px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            <KV label="Fecha"   value="Sábado 21 jun" />
            <KV label="Horario" value="13:00 – 17:00" />
            <KV label="Código"  value="RES-2026-0231" />
          </div>
        </Card>

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 24 }}>
          <Button variant="primary">Ver mis reservas</Button>
          <Button variant="text">Volver al inicio</Button>
        </div>
      </div>
    </Screen>
  );
}

// ============================================================
// R17 — Reportar novedad
// ============================================================
function R_ReportarNovedad() {
  return (
    <Screen>
      <AppBar title="Reportar novedad" back />
      <ScrollArea style={{ padding: '0 20px 110px' }}>
        <div style={{ ...HF.body, color: HT.gray600, marginBottom: 18 }}>
          Reporta lo que viste. Llega a portería y administración de forma simultánea.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Tipo de novedad" value="Daño en zona común" />

          <div>
            <div style={{ ...HF.small, color: HT.gray700, fontWeight: 600, marginBottom: 8 }}>Severidad</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { l: 'Baja',    tone: 'success', sel: false },
                { l: 'Media',   tone: 'info',    sel: false },
                { l: 'Alta',    tone: 'warning', sel: true },
                { l: 'Crítica', tone: 'danger',  sel: false },
              ].map((s, i) => {
                const tones = { success: [HT.successBg, HT.successText, HT.successBorder], info: [HT.infoBg, HT.infoText, HT.infoBorder], warning: [HT.warningBg, HT.warningText, HT.warningBorder], danger: [HT.dangerBg, HT.dangerText, HT.dangerBorder] };
                const [bg, fg, bd] = tones[s.tone];
                return (
                  <div key={i} style={{
                    padding: '10px 4px', borderRadius: 10, textAlign: 'center', ...HF.bodySm, fontWeight: 600,
                    background: s.sel ? bg : HT.white, color: s.sel ? fg : HT.gray500,
                    border: `1.5px solid ${s.sel ? bd : HT.gray200}`,
                  }}>{s.l}</div>
                );
              })}
            </div>
          </div>

          <Input label="Ubicación" icon="location" value="Parqueadero sótano 2 · cupo 47" />
          <Input label="Descripción" placeholder="Cuenta qué pasó y qué deberíamos hacer" value="Hay vidrios rotos cerca de la zona de bicicletas. Riesgo de cortes para residentes." multiline />

          <Card pad={14} bg={HT.gray50} border={HT.gray200}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="info" size={18} color={HT.gray500} />
              <div style={{ ...HF.bodySm, color: HT.gray600 }}>Tu novedad será visible para administración y portería en menos de 1 minuto.</div>
            </div>
          </Card>
        </div>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary">Reportar novedad</Button>
      </div>
    </Screen>
  );
}

// ============================================================
// R18 — Novedad: éxito
// ============================================================
function R_NovedadExito() {
  return R_PQRSExito({
    titulo: 'Novedad reportada',
    rad: 'NOV-2026-119',
    sub: 'Portería y administración fueron notificados en este momento.',
    primary: 'Ver novedades',
    secondary: 'Volver al inicio',
  });
}

// ============================================================
// R19 — Servicios externos
// ============================================================
function R_ServiciosExternos() {
  const items = [
    { name: 'Andrés Cifuentes',  empresa: 'Domicilios Rappi',     date: 'Hoy 14:32',   estado: 'En conjunto', tone: 'info'    },
    { name: 'Marcela Rodríguez', empresa: 'Servicio limpieza S.A.',date: 'Hoy 9:00 – 13:00', estado: 'Salió', tone: 'neutral' },
    { name: 'Iván Castro',       empresa: 'Soporte técnico fibra', date: 'Ayer 11:00 – 12:30',estado: 'Salió', tone: 'neutral' },
  ];
  return (
    <Screen>
      <AppBar title="Servicios externos" back />
      <ScrollArea style={{ padding: '0 20px 100px' }}>
        <div style={{ ...HF.body, color: HT.gray600, marginBottom: 14 }}>Personal contratado para servicios en tu apartamento.</div>
        {items.map((it, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: HT.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="tools" size={20} color={HT.gray700} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...HF.body, fontWeight: 700 }}>{it.name}</div>
                <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{it.empresa}</div>
                <div style={{ ...HF.small, color: HT.gray500, marginTop: 6, fontFamily: HF.mono }}>{it.date}</div>
              </div>
              <Badge tone={it.tone} size="sm" dot>{it.estado}</Badge>
            </div>
          </Card>
        ))}
      </ScrollArea>
      <FAB icon="plus" label="Registrar ingreso" />
    </Screen>
  );
}

// ============================================================
// R20 — Citas con administración
// ============================================================
function R_CitasAdmin() {
  return (
    <Screen>
      <AppBar title="Citas administración" back />
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 24, borderBottom: `1px solid ${HT.gray200}` }}>
        <div style={{ paddingBottom: 12, borderBottom: `2px solid ${HT.primary}`, ...HF.body, fontWeight: 700 }}>Disponibilidad</div>
        <div style={{ paddingBottom: 12, ...HF.body, fontWeight: 600, color: HT.gray400 }}>Mis citas <span style={{ color: HT.gray400 }}>2</span></div>
      </div>
      <ScrollArea style={{ padding: '12px 20px 24px' }}>
        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, margin: '6px 0 8px' }}>MARTES 17 JUN</div>
        {[
          { hora: '9:00 – 9:30',  cupos: 1, sel: false },
          { hora: '10:00 – 10:30',cupos: 2, sel: true  },
          { hora: '11:00 – 11:30',cupos: 0, sel: false },
        ].map((s, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, border: s.sel ? `2px solid ${HT.primary}` : `1px solid ${HT.gray200}`, opacity: s.cupos === 0 ? 0.5 : 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: HT.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={22} color={HT.primaryDark} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...HF.body, fontWeight: 700 }}>{s.hora}</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{s.cupos === 0 ? 'Sin cupos' : `${s.cupos} cupo${s.cupos>1?'s':''} disponible${s.cupos>1?'s':''}`}</div>
            </div>
            {s.cupos > 0 && (
              <Badge tone={s.sel ? 'primary' : 'neutral'} size="sm">{s.sel ? 'Seleccionado' : 'Solicitar'}</Badge>
            )}
          </Card>
        ))}

        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, margin: '20px 0 8px' }}>MIÉRCOLES 18 JUN</div>
        {[
          { hora: '14:00 – 14:30', cupos: 3 },
          { hora: '15:00 – 15:30', cupos: 1 },
        ].map((s, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: HT.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={22} color={HT.primaryDark} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...HF.body, fontWeight: 700 }}>{s.hora}</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{s.cupos} cupos disponibles</div>
            </div>
            <Badge tone="neutral" size="sm">Solicitar</Badge>
          </Card>
        ))}
      </ScrollArea>
    </Screen>
  );
}

// ============================================================
// R21 — Sorteo parqueadero
// ============================================================
function R_SorteoParqueadero() {
  return (
    <Screen>
      <AppBar title="Sorteo parqueadero" back />
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        <Card pad={20} bg={HT.gray900} border={HT.gray900} style={{ position: 'relative', overflow: 'hidden' }}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', right: -60, bottom: -60, opacity: 0.08 }}>
            <rect x="20" y="20" width="180" height="180" rx="20" stroke="#fff" strokeWidth="2" fill="none"/>
            <path d="M70 140V80h30a18 18 0 0 1 0 36H70" stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Badge tone="dark" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }} dot>Sorteo activo</Badge>
          <div style={{ ...HF.h1, color: '#fff', marginTop: 14 }}>Sorteo de cupos<br/>segundo semestre</div>
          <div style={{ ...HF.body, color: 'rgba(255,255,255,.7)', marginTop: 8 }}>Hay 48 cupos para 73 unidades inscritas.</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
            <Stat label="Cupos" value="48" />
            <Stat label="Inscritos" value="73" />
            <Stat label="Cierra en" value="3 días" />
          </div>
        </Card>

        <Card pad={16} style={{ marginTop: 14 }}>
          <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Tu participación</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Icon name="xCircle" size={22} color={HT.gray400} />
            <div style={{ ...HF.body, color: HT.gray700 }}>Aún no estás inscrito en el sorteo.</div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Button variant="primary" icon="parking">Participar en el sorteo</Button>
          </div>
        </Card>

        <div style={{ marginTop: 22 }}>
          <div style={{ ...HF.h3, marginBottom: 10 }}>Resultados anteriores</div>
          <Card pad={0}>
            {[
              { sem: '2025 · 1er sem', cupos: '48 / 71' },
              { sem: '2024 · 2do sem', cupos: '48 / 68' },
              { sem: '2024 · 1er sem', cupos: '48 / 65' },
            ].map((r, i, arr) => (
              <div key={i} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${HT.gray100}` }}>
                <div style={{ ...HF.body, fontWeight: 600 }}>{r.sem}</div>
                <div style={{ ...HF.bodySm, color: HT.gray500, fontFamily: HF.mono }}>{r.cupos}</div>
              </div>
            ))}
          </Card>
        </div>
      </ScrollArea>
    </Screen>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ ...HF.h2, color: '#fff' }}>{value}</div>
      <div style={{ ...HF.small, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ============================================================
// R22 — Confirmar sorteo
// ============================================================
function R_ConfirmarSorteo() {
  return (
    <Screen>
      <AppBar title="Participar en el sorteo" back />
      <ScrollArea style={{ padding: '0 20px 110px' }}>
        <Card pad={20} bg={HT.gray900} border={HT.gray900}>
          <div style={{ ...HF.small, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sorteo</div>
          <div style={{ ...HF.h2, color: '#fff', marginTop: 6 }}>Cupos parqueadero · 2026·2</div>
          <div style={{ ...HF.bodySm, color: 'rgba(255,255,255,.7)', marginTop: 6 }}>Sorteo el 22 jun · 5:00 p.m.</div>
        </Card>

        <Card pad={16} style={{ marginTop: 14 }}>
          <div style={{ ...HF.small, color: HT.gray500, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Resumen</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <KV label="Residente" value="Ana Rivera" />
            <KV label="Unidad"    value="Torre 3 · Apto 502" />
            <KV label="Vehículo"  value="Mazda 3 · ABC123" />
            <KV label="Tipo cupo" value="Cubierto" />
          </div>
        </Card>

        <Card pad={16} style={{ marginTop: 14, background: HT.gray50, border: `1px solid ${HT.gray200}` }}>
          <div style={{ ...HF.bodySm, color: HT.gray700, lineHeight: 1.6 }}>
            Al participar aceptas el reglamento del sorteo: solo una inscripción por unidad, asignación aleatoria, el cupo es intransferible y vigente por 6 meses. La administración resuelve casos de empate o duplicado.
          </div>
        </Card>

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: HT.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={14} color="#fff" />
          </div>
          <div style={{ ...HF.bodySm, color: HT.gray800 }}>He leído y acepto los términos del sorteo.</div>
        </div>
      </ScrollArea>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 20px 36px', background: 'linear-gradient(to top, rgba(247,244,238,1) 70%, rgba(247,244,238,0))' }}>
        <Button variant="primary">Confirmar participación</Button>
      </div>
    </Screen>
  );
}

// ============================================================
// R23 — Paquetes en portería
// ============================================================
function R_Paquetes() {
  const items = [
    { desc: 'Sobre · Mensajería Tecnoenvíos', porteria: 'Portería principal', date: 'Hoy 11:24',  estado: 'Pendiente', tone: 'warning' },
    { desc: 'Caja mediana · Mercado Libre',   porteria: 'Portería principal', date: 'Ayer 17:08', estado: 'Pendiente', tone: 'warning' },
    { desc: 'Caja grande · Falabella',        porteria: 'Portería vehicular', date: '12 jun',     estado: 'Retirado',  tone: 'success' },
    { desc: 'Sobre · Notarial',               porteria: 'Portería principal', date: '8 jun',      estado: 'Retirado',  tone: 'success' },
  ];
  return (
    <Screen>
      <AppBar title="Paquetes" back />
      <div style={{ padding: '4px 20px 12px' }}>
        <Card pad={14} bg={HT.accentSoft} border="#EAD8B0">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="package" size={20} color={HT.accentDark} />
            <div style={{ ...HF.body, color: HT.accentDark, fontWeight: 600 }}>2 paquetes esperando</div>
          </div>
        </Card>
      </div>
      <ScrollArea style={{ padding: '0 20px 24px' }}>
        {items.map((it, i) => (
          <Card key={i} pad={14} style={{ marginBottom: 10, display: 'flex', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: it.tone === 'success' ? HT.gray100 : HT.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="package" size={22} color={it.tone === 'success' ? HT.gray500 : HT.accentDark} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...HF.body, fontWeight: 700 }}>{it.desc}</div>
              <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2 }}>{it.porteria}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ ...HF.small, color: HT.gray400, fontFamily: HF.mono }}>{it.date}</span>
                <Badge tone={it.tone} dot size="sm">{it.estado}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </ScrollArea>
    </Screen>
  );
}

Object.assign(window, {
  R_PQRSLista, R_PQRSNueva, R_PQRSDetalle, R_PQRSExito,
  R_ZonasMisReservas, R_ReservarZona, R_ReservaExito,
  R_ReportarNovedad, R_NovedadExito,
  R_ServiciosExternos, R_CitasAdmin,
  R_SorteoParqueadero, R_ConfirmarSorteo, R_Paquetes,
});
