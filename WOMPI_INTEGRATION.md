# Integración de Pagos con Wompi — Habitare

## Resumen

Wompi es la pasarela de pagos de Bancolombia. No tiene costo fijo mensual; cobra ~2.9% + $900 COP por transacción exitosa. Ofrece sandbox gratuito para desarrollo.

Casos de uso en Habitare:
- Pago de cuota de administración mensual
- Pago de reservas de zonas comunes
- Historial de pagos del residente

---

## 1. Registro y credenciales

1. Crear cuenta en [https://comercios.wompi.co](https://comercios.wompi.co)
2. En el dashboard obtener las claves:
   - `pub_test_...` — llave pública de sandbox
   - `prv_test_...` — llave privada de sandbox (solo backend)
   - `pub_prod_...` y `prv_prod_...` — para producción
3. Guardar en el `.env` del backend:
   ```
   WOMPI_PUBLIC_KEY=pub_test_xxxxx
   WOMPI_PRIVATE_KEY=prv_test_xxxxx
   WOMPI_EVENTS_SECRET=integrity_xxxxx
   WOMPI_BASE_URL=https://sandbox.wompi.co/v1
   ```

---

## 2. Flujo general

```
Flutter app
    │
    ├─ 1. Solicita crear transacción  ──▶  Backend FastAPI
    │                                          │
    │                                          ├─ Crea registro en DB (estado: PENDIENTE)
    │                                          ├─ Genera firma de integridad (SHA256)
    │                                          └─ Retorna: { transaction_id, amount_in_cents, integrity_hash }
    │
    ├─ 2. Abre WebView con widget Wompi (pasando los parámetros)
    │
    ├─ 3. Usuario paga en el widget de Wompi
    │
    └─ 4. Wompi notifica al backend vía webhook (POST /pagos/webhook)
               │
               └─ Backend actualiza estado en DB (APROBADO / RECHAZADO)
```

---

## 3. Backend — Cambios necesarios

### 3.1 Nuevo módulo `app/modules/pagos/`

**`models.py`**
```python
class Pago(Base):
    __tablename__ = "pagos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tenants.id"))
    usuario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("usuarios.id"))
    referencia: Mapped[str] = mapped_column(String(50), unique=True)  # PAG-YYYY-NNN
    concepto: Mapped[str] = mapped_column(String(200))               # "Cuota administración marzo 2026"
    monto: Mapped[int]                                               # en centavos COP
    estado: Mapped[str] = mapped_column(String(20), default="PENDIENTE")  # PENDIENTE / APROBADO / RECHAZADO
    wompi_transaction_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
```

**`schemas.py`**
```python
class CrearPagoRequest(BaseModel):
    concepto: str
    monto: int  # en pesos COP (el backend multiplica x100 para Wompi)

class PagoIniciadoResponse(BaseModel):
    referencia: str
    monto_centavos: int
    concepto: str
    integrity_hash: str
    public_key: str

class PagoResponse(BaseModel):
    id: uuid.UUID
    referencia: str
    concepto: str
    monto: int
    estado: str
    created_at: datetime
    model_config = {"from_attributes": True}
```

**`service.py`** — lógica principal
```python
import hashlib
from app.config import settings

def _generar_integrity_hash(referencia: str, monto_centavos: int, moneda: str = "COP") -> str:
    # Wompi requiere: referencia + monto + moneda + events_secret
    cadena = f"{referencia}{monto_centavos}{moneda}{settings.WOMPI_EVENTS_SECRET}"
    return hashlib.sha256(cadena.encode()).hexdigest()

async def iniciar_pago(data: CrearPagoRequest, usuario_id, tenant_id, db) -> PagoIniciadoResponse:
    # 1. Generar referencia única
    year = datetime.utcnow().year
    count = await repo.count_pagos_by_year(db, tenant_id, year)
    referencia = f"PAG-{year}-{count + 1:03d}"

    # 2. Guardar en DB con estado PENDIENTE
    monto_centavos = data.monto * 100
    await repo.crear_pago(db, {
        "tenant_id": tenant_id,
        "usuario_id": usuario_id,
        "referencia": referencia,
        "concepto": data.concepto,
        "monto": monto_centavos,
        "estado": "PENDIENTE",
    })

    # 3. Generar firma de integridad
    integrity_hash = _generar_integrity_hash(referencia, monto_centavos)

    return PagoIniciadoResponse(
        referencia=referencia,
        monto_centavos=monto_centavos,
        concepto=data.concepto,
        integrity_hash=integrity_hash,
        public_key=settings.WOMPI_PUBLIC_KEY,
    )

async def webhook_wompi(payload: dict, db) -> None:
    # Wompi envía el evento cuando la transacción cambia de estado
    evento = payload.get("event")
    if evento != "transaction.updated":
        return

    data = payload["data"]["transaction"]
    referencia = data["reference"]
    estado_wompi = data["status"]           # APPROVED / DECLINED / VOIDED / ERROR
    wompi_id = data["id"]

    estado_local = {
        "APPROVED": "APROBADO",
        "DECLINED": "RECHAZADO",
        "VOIDED": "RECHAZADO",
        "ERROR": "RECHAZADO",
    }.get(estado_wompi, "PENDIENTE")

    await repo.actualizar_estado_pago(db, referencia, estado_local, wompi_id)
```

**`router.py`**
```python
@router.post("/iniciar", response_model=PagoIniciadoResponse)
async def iniciar_pago(...):
    ...

@router.get("/mis-pagos", response_model=list[PagoResponse])
async def mis_pagos(...):
    ...

@router.post("/webhook", status_code=200)
async def webhook(request: Request, db = Depends(get_db)):
    # Este endpoint lo llama Wompi, no lleva autenticación JWT
    payload = await request.json()
    await pagos_service.webhook_wompi(payload, db)
    return {"status": "ok"}
```

### 3.2 Configurar la URL del webhook en Wompi

En el dashboard de Wompi → Eventos → agregar:
```
https://tu-dominio.com/pagos/webhook
```

> En desarrollo local se puede usar **ngrok** para exponer el backend temporalmente.

---

## 4. Flutter — Cambios necesarios

### 4.1 Dependencia

Agregar en `pubspec.yaml`:
```yaml
dependencies:
  webview_flutter: ^4.8.0
```

### 4.2 Flujo en la pantalla de pagos

```dart
// 1. Llamar al backend para iniciar el pago
final response = await ApiClient.instance.post('/pagos/iniciar', data: {
  'concepto': 'Cuota administración marzo 2026',
  'monto': 250000, // pesos COP
});

final referencia = response.data['referencia'];
final montoCentavos = response.data['monto_centavos'];
final integrityHash = response.data['integrity_hash'];
final publicKey = response.data['public_key'];

// 2. Construir la URL del widget de Wompi
final wompiUrl = Uri.https('checkout.wompi.co', '/p/', {
  'public-key': publicKey,
  'currency': 'COP',
  'amount-in-cents': montoCentavos.toString(),
  'reference': referencia,
  'signature:integrity': integrityHash,
  'redirect-url': 'habitare://pago-resultado', // deep link
});

// 3. Abrir WebView con esa URL
context.push('/pagos/webview', extra: wompiUrl.toString());
```

### 4.3 Pantalla WebView

```dart
class PagoWebViewScreen extends StatelessWidget {
  final String url;
  const PagoWebViewScreen({required this.url, super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Realizar pago')),
      body: WebViewWidget(
        controller: WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..setNavigationDelegate(NavigationDelegate(
            onNavigationRequest: (req) {
              // Detectar cuando Wompi redirige al deep link
              if (req.url.startsWith('habitare://pago-resultado')) {
                context.go('/billing'); // volver a pagos
                return NavigationDecision.prevent;
              }
              return NavigationDecision.navigate;
            },
          ))
          ..loadRequest(Uri.parse(url)),
      ),
    );
  }
}
```

### 4.4 Pantalla de historial (`BillingScreen`)

Llamar a `GET /pagos/mis-pagos` y mostrar la lista con estado (chip verde = APROBADO, rojo = RECHAZADO, gris = PENDIENTE).

---

## 5. Consideraciones adicionales

| Tema | Detalle |
|---|---|
| **Ambientes** | Usar `sandbox.wompi.co` en dev, `production.wompi.co` en prod |
| **Moneda** | Wompi trabaja en **centavos** — siempre multiplicar por 100 |
| **Referencia única** | Wompi rechaza dos transacciones con la misma referencia |
| **Webhook sin JWT** | El endpoint `/pagos/webhook` no debe requerir token |
| **Validación webhook** | Wompi recomienda verificar la firma del evento con el `events_secret` |
| **Deep links** | Configurar `habitare://` en `AndroidManifest.xml` e `Info.plist` |
| **Producción** | Requiere verificación de identidad del comercio en el dashboard de Wompi |

---

## 6. Orden de implementación sugerido

1. Crear el módulo `pagos` en backend (modelos + migraciones)
2. Implementar `POST /pagos/iniciar` y `GET /pagos/mis-pagos`
3. Implementar `POST /pagos/webhook`
4. Agregar `webview_flutter` y crear `PagoWebViewScreen` en Flutter
5. Actualizar `BillingScreen` para mostrar historial real
6. Probar flujo completo en sandbox con tarjeta de prueba `4242 4242 4242 4242`
7. Cambiar credenciales a producción cuando esté listo para lanzar
