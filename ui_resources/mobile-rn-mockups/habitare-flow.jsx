// habitare-flow.jsx — Navigation flow diagram (residente + seguridad)

function FlowDiagram() {
  // Layout: a horizontal flow with nodes and connecting lines.
  // We render it inline as plain HTML so it stays readable at any zoom.
  return (
    <div style={{ background: HT.white, padding: '36px 40px', fontFamily: HF.family, minWidth: 1240 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...HF.display, color: HT.gray900 }}>Flujo de navegación</div>
        <div style={{ ...HF.body, color: HT.gray500, marginTop: 6 }}>33 pantallas · 2 roles · light mode</div>
      </div>

      <FlowRow
        title="Auth"
        subtitle="Entrada a la app — ambos roles"
        accent={HT.gray700}
        nodes={[
          { id: 'A1', label: 'Login' },
          { id: 'A2', label: 'Recuperar contraseña' },
        ]}
        edges={[['A1','A2']]}
      />

      <RoleBlock
        title="Residente"
        accent={HT.primary}
        accentSoft={HT.primarySoft}
        tabs={[
          { id: 'R1', label: 'Dashboard'    },
          { id: 'R2', label: 'Visitantes'   },
          { id: 'R5', label: 'Pagos'        },
          { id: 'R6', label: 'Comunicados'  },
          { id: 'R8', label: 'Más'          },
        ]}
        groups={[
          {
            title: 'Visitantes',
            from: 'R2',
            nodes: [
              { id: 'R3', label: 'Detalle visita (QR)' },
              { id: 'R4', label: 'Crear visita' },
            ],
            edges: [['R2','R3'], ['R2','R4']],
          },
          {
            title: 'Comunicados',
            from: 'R6',
            nodes: [
              { id: 'R7', label: 'Detalle comunicado' },
            ],
            edges: [['R6','R7']],
          },
          {
            title: 'Perfil',
            from: 'R8',
            nodes: [
              { id: 'R9', label: 'Perfil residente' },
            ],
            edges: [['R8','R9']],
          },
          {
            title: 'PQRS',
            from: 'R8',
            nodes: [
              { id: 'R10', label: 'Lista PQRS'  },
              { id: 'R11', label: 'Nueva PQRS'  },
              { id: 'R12', label: 'Detalle PQRS' },
              { id: 'R13', label: 'Éxito',  success: true },
            ],
            edges: [['R8','R10'], ['R10','R11'], ['R10','R12'], ['R11','R13']],
          },
          {
            title: 'Zonas comunes',
            from: 'R8',
            nodes: [
              { id: 'R14', label: 'Mis reservas' },
              { id: 'R15', label: 'Reservar zona' },
              { id: 'R16', label: 'Éxito reserva', success: true },
            ],
            edges: [['R8','R14'], ['R14','R15'], ['R15','R16']],
          },
          {
            title: 'Reportar novedad',
            from: 'R1',
            nodes: [
              { id: 'R17', label: 'Formulario' },
              { id: 'R18', label: 'Éxito',  success: true },
            ],
            edges: [['R1','R17'], ['R17','R18']],
          },
          {
            title: 'Servicios externos',
            from: 'R8',
            nodes: [{ id: 'R19', label: 'Lista servicios' }],
            edges: [['R8','R19']],
          },
          {
            title: 'Citas administración',
            from: 'R8',
            nodes: [{ id: 'R20', label: 'Disponibilidad / mis citas' }],
            edges: [['R8','R20']],
          },
          {
            title: 'Sorteo parqueadero',
            from: 'R8',
            nodes: [
              { id: 'R21', label: 'Estado del sorteo' },
              { id: 'R22', label: 'Confirmar' },
            ],
            edges: [['R8','R21'], ['R21','R22']],
          },
          {
            title: 'Paquetes',
            from: 'R1',
            nodes: [{ id: 'R23', label: 'Lista de paquetes' }],
            edges: [['R1','R23']],
          },
        ]}
      />

      <RoleBlock
        title="Seguridad"
        accent={HT.gray900}
        accentSoft={HT.gray100}
        tabs={[
          { id: 'S5', label: 'Reportes' },
          { id: 'S2', label: 'Visitantes' },
          { id: 'S1', label: 'Inicio' },
          { id: 'S6', label: 'Zonas' },
          { id: 'S7', label: 'Comunicados' },
        ]}
        groups={[
          {
            title: 'Escáner & ingresos',
            from: 'S1',
            nodes: [
              { id: 'S4', label: 'Escáner QR' },
              { id: 'S3', label: 'Detalle visitante' },
            ],
            edges: [['S1','S4'], ['S4','S3'], ['S2','S3']],
          },
          {
            title: 'Perfil',
            from: 'S1',
            nodes: [{ id: 'S8', label: 'Perfil seguridad' }],
            edges: [['S1','S8']],
          },
        ]}
      />

      <div style={{ marginTop: 36, ...HF.small, color: HT.gray500 }}>
        Las flechas indican navegación principal. Los nodos verdes son pantallas de éxito (terminales). Los hubs cuadrados son tabs del bottom nav del rol.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single horizontal row of nodes
// ─────────────────────────────────────────────────────────────
function FlowRow({ title, subtitle, accent, nodes, edges }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ ...HF.h2, color: accent }}>{title}</div>
      {subtitle && <div style={{ ...HF.bodySm, color: HT.gray500, marginTop: 2, marginBottom: 16 }}>{subtitle}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={n.id}>
            <FlowNode id={n.id} label={n.label} accent={accent} />
            {i < nodes.length - 1 && <Arrow color={HT.gray300} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RoleBlock — tab hubs row + grouped sub-flows
// ─────────────────────────────────────────────────────────────
function RoleBlock({ title, accent, accentSoft, tabs, groups }) {
  return (
    <div style={{ marginTop: 28, paddingTop: 28, borderTop: `1px solid ${HT.gray200}` }}>
      <div style={{ ...HF.h2, color: accent }}>{title}</div>

      {/* Tab hubs */}
      <div style={{ marginTop: 14, marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono, textTransform: 'uppercase', minWidth: 84 }}>Bottom nav</div>
        {tabs.map((t, i) => (
          <div key={t.id} style={{ padding: '10px 16px', background: accentSoft, color: accent, borderRadius: 12, ...HF.bodySm, fontWeight: 600, border: `1px solid ${accent}22` }}>
            <span style={{ ...HF.small, fontFamily: HF.mono, marginRight: 8, opacity: .7 }}>{t.id}</span>{t.label}
          </div>
        ))}
      </div>

      {/* Sub-flows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
        {groups.map((g, i) => (
          <FlowGroup key={i} group={g} accent={accent} accentSoft={accentSoft} />
        ))}
      </div>
    </div>
  );
}

function FlowGroup({ group, accent }) {
  return (
    <div style={{ background: HT.gray50, border: `1px solid ${HT.gray200}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ ...HF.body, fontWeight: 700, color: HT.gray900 }}>{group.title}</div>
        <div style={{ ...HF.small, color: HT.gray500, fontFamily: HF.mono }}>desde {group.from}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {group.nodes.map((n, i) => (
          <React.Fragment key={n.id}>
            <FlowNode id={n.id} label={n.label} accent={n.success ? HT.successText : accent} success={n.success} />
            {i < group.nodes.length - 1 && <Arrow color={HT.gray300} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function FlowNode({ id, label, accent, success }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 12,
      background: success ? HT.successBg : HT.white,
      border: `1.5px solid ${success ? HT.successBorder : HT.gray200}`,
      minWidth: 130,
    }}>
      <div style={{ ...HF.small, fontFamily: HF.mono, color: success ? HT.successText : HT.gray500, fontWeight: 600 }}>{id}</div>
      <div style={{ ...HF.bodySm, color: success ? HT.successText : HT.gray900, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Arrow({ color = HT.gray300 }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
      <path d="M2 7h17M14 2l5 5-5 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, { FlowDiagram });
