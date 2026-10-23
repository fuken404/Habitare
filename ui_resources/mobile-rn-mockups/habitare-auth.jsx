// habitare-auth.jsx — auth screens (A1 Login, A2 Recuperar contraseña)

// ─────────────────────────────────────────────────────────────
// A1 — Login
// ─────────────────────────────────────────────────────────────
function ScreenLogin() {
  return (
    <Screen bg={HT.bg}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 28px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 48, gap: 20 }}>
          <Logo size={88} variant="chip" />
          <div style={{ ...HF.display, fontSize: 30, color: HT.gray900, letterSpacing: '-0.8px' }}>Habitare</div>
          <div style={{ ...HF.body, color: HT.gray500, textAlign: 'center', maxWidth: 260 }}>
            Gestión de conjuntos residenciales
          </div>
        </div>

        <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Correo electrónico" icon="mail" value="ana.rivera@correo.com" />
          <Input label="Contraseña" icon="lock" value="••••••••••" iconRight="eye" />
        </div>

        <div style={{ marginTop: 28 }}>
          <Button variant="primary">Iniciar sesión</Button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span style={{ ...HF.body, color: HT.primaryDark, fontWeight: 600 }}>¿Olvidaste tu contraseña?</span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ paddingBottom: 24, textAlign: 'center' }}>
          <div style={{ ...HF.bodySm, color: HT.gray500 }}>
            ¿No tienes cuenta? <span style={{ color: HT.gray700, fontWeight: 600 }}>Comunícate con tu administrador</span>
          </div>
          <div style={{ ...HF.small, color: HT.gray400, marginTop: 14 }}>© 2025 Habitare. Todos los derechos reservados.</div>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// A2 — Recuperar contraseña (con estado success)
// ─────────────────────────────────────────────────────────────
function ScreenRecover() {
  return (
    <Screen bg={HT.bg}>
      <AppBar title="Recuperar contraseña" back />
      <div style={{ padding: '8px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo size={44} variant="chip" />
        <div style={{ ...HF.body, color: HT.gray600 }}>
          Te enviaremos un enlace para restablecer tu contraseña al correo asociado a tu cuenta.
        </div>
      </div>
      <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input label="Correo electrónico" icon="mail" value="ana.rivera@correo.com" />
        <Button variant="primary">Enviar enlace</Button>
      </div>
      <div style={{ padding: '8px 24px' }}>
        <Banner tone="success" title="Enlace enviado" body="Revisa tu bandeja. El enlace expira en 30 minutos." />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '0 24px 40px' }}>
        <Button variant="text">Volver al inicio de sesión</Button>
      </div>
    </Screen>
  );
}

Object.assign(window, { ScreenLogin, ScreenRecover });
