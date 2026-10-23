// habitare-app.jsx — assembles all design artboards into the canvas

function HabitareApp() {
  // Standard iPhone 14 Pro screen artboard dimensions
  const W = 390, H = 844;

  return (
    <DesignCanvas>
      {/* ─────────────────────────────────────────────────────────────
          DESIGN SYSTEM
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="ds" title="Design system" subtitle="Tokens, escala, componentes — antes de las pantallas">
        <DCArtboard id="ds-1" label="01 · Marca"             width={W} height={H}><SysOverview/></DCArtboard>
        <DCArtboard id="ds-1b" label="02 · Logo & lockups"   width={W} height={1180}><SysLogo h={1180}/></DCArtboard>
        <DCArtboard id="ds-2" label="03 · Color"             width={W} height={1480}><SysColors h={1480}/></DCArtboard>
        <DCArtboard id="ds-3" label="04 · Tipografía"        width={W} height={1080}><SysType h={1080}/></DCArtboard>
        <DCArtboard id="ds-4" label="05 · Botones e inputs"  width={W} height={980}><SysButtons h={980}/></DCArtboard>
        <DCArtboard id="ds-5" label="06 · Componentes"       width={W} height={1240}><SysComponents h={1240}/></DCArtboard>
        <DCArtboard id="ds-6" label="07 · Espaciado y forma" width={W} height={860}><SysSpacing h={860}/></DCArtboard>
        <DCArtboard id="ds-7" label="08 · Bottom navigation" width={W} height={620}><SysBottomNav h={620}/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          AUTH
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="auth" title="Auth" subtitle="2 pantallas · sin sesión">
        <DCArtboard id="A1" label="A1 · Login"                width={W} height={H}><ScreenLogin/></DCArtboard>
        <DCArtboard id="A2" label="A2 · Recuperar contraseña" width={W} height={H}><ScreenRecover/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          RESIDENTE — tabs principales
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="r-main" title="Residente · tabs principales" subtitle="Bottom nav · 5 tabs">
        <DCArtboard id="R1" label="R1 · Dashboard"   width={W} height={H}><R_Dashboard/></DCArtboard>
        <DCArtboard id="R2" label="R2 · Visitantes"  width={W} height={H}><R_Visitantes/></DCArtboard>
        <DCArtboard id="R5" label="R5 · Pagos"       width={W} height={H}><R_Pagos/></DCArtboard>
        <DCArtboard id="R6" label="R6 · Comunicados" width={W} height={H}><R_Comunicados/></DCArtboard>
        <DCArtboard id="R8" label="R8 · Más"         width={W} height={H}><R_Mas/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          RESIDENTE — visitantes y comunicados
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="r-vis" title="Residente · visitantes &amp; comunicados">
        <DCArtboard id="R3" label="R3 · Detalle visita + QR"  width={W} height={H}><R_VisitanteDetalle/></DCArtboard>
        <DCArtboard id="R4" label="R4 · Crear visita"         width={W} height={H}><R_CrearVisita/></DCArtboard>
        <DCArtboard id="R7" label="R7 · Detalle comunicado"   width={W} height={H}><R_ComunicadoDetalle/></DCArtboard>
        <DCArtboard id="R9" label="R9 · Perfil residente"     width={W} height={H}><R_Perfil/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          RESIDENTE — PQRS
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="r-pqrs" title="Residente · PQRS" subtitle="Petición · queja · reclamo · sugerencia · incidente">
        <DCArtboard id="R10" label="R10 · Lista PQRS"      width={W} height={H}><R_PQRSLista/></DCArtboard>
        <DCArtboard id="R11" label="R11 · Nueva PQRS"      width={W} height={H}><R_PQRSNueva/></DCArtboard>
        <DCArtboard id="R12" label="R12 · Detalle PQRS"    width={W} height={H}><R_PQRSDetalle/></DCArtboard>
        <DCArtboard id="R13" label="R13 · Éxito PQRS"      width={W} height={H}><R_PQRSExito/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          RESIDENTE — zonas y novedades
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="r-zonas" title="Residente · zonas comunes &amp; novedades">
        <DCArtboard id="R14" label="R14 · Mis reservas"      width={W} height={H}><R_ZonasMisReservas/></DCArtboard>
        <DCArtboard id="R15" label="R15 · Reservar zona"     width={W} height={H}><R_ReservarZona/></DCArtboard>
        <DCArtboard id="R16" label="R16 · Éxito reserva"     width={W} height={H}><R_ReservaExito/></DCArtboard>
        <DCArtboard id="R17" label="R17 · Reportar novedad"  width={W} height={H}><R_ReportarNovedad/></DCArtboard>
        <DCArtboard id="R18" label="R18 · Éxito novedad"     width={W} height={H}><R_NovedadExito/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          RESIDENTE — servicios extra
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="r-extra" title="Residente · servicios">
        <DCArtboard id="R19" label="R19 · Servicios externos"  width={W} height={H}><R_ServiciosExternos/></DCArtboard>
        <DCArtboard id="R20" label="R20 · Citas administración" width={W} height={H}><R_CitasAdmin/></DCArtboard>
        <DCArtboard id="R21" label="R21 · Sorteo parqueadero"   width={W} height={H}><R_SorteoParqueadero/></DCArtboard>
        <DCArtboard id="R22" label="R22 · Confirmar sorteo"     width={W} height={H}><R_ConfirmarSorteo/></DCArtboard>
        <DCArtboard id="R23" label="R23 · Paquetes en portería" width={W} height={H}><R_Paquetes/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          SEGURIDAD
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="sec" title="Seguridad" subtitle="8 pantallas · bottom nav diferente del residente">
        <DCArtboard id="S1" label="S1 · Dashboard"          width={W} height={H}><S_Dashboard/></DCArtboard>
        <DCArtboard id="S2" label="S2 · Visitantes"         width={W} height={H}><S_Visitantes/></DCArtboard>
        <DCArtboard id="S3" label="S3 · Detalle visitante"  width={W} height={H}><S_VisitanteDetalle/></DCArtboard>
        <DCArtboard id="S4" label="S4 · Escáner QR"         width={W} height={H}><S_Scanner/></DCArtboard>
        <DCArtboard id="S5" label="S5 · Reportes"           width={W} height={H}><S_Reportes/></DCArtboard>
        <DCArtboard id="S6" label="S6 · Zonas comunes"      width={W} height={H}><S_Zonas/></DCArtboard>
        <DCArtboard id="S7" label="S7 · Comunicados"        width={W} height={H}><S_Comunicados/></DCArtboard>
        <DCArtboard id="S8" label="S8 · Perfil"             width={W} height={H}><S_Perfil/></DCArtboard>
      </DCSection>

      {/* ─────────────────────────────────────────────────────────────
          NAV FLOW DIAGRAM
          ───────────────────────────────────────────────────────────── */}
      <DCSection id="flow" title="Flujo de navegación" subtitle="Mapa de conexiones entre pantallas">
        <DCArtboard id="FL1" label="Diagrama de flujo · 33 pantallas" width={1280} height={1720}>
          <FlowDiagram/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<HabitareApp/>);
