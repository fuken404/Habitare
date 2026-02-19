import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

from app.config import settings
from app.core.database.base import Base

from app.modules.tenants.models import Tenant, Torre, Unidad
from app.modules.users.models import Usuario, Rol, Permiso, RolPermiso, TenantUsuario
from app.modules.visitors.models import Visitante, AutorizacionVisita, VehiculoVisitante, IngresoVisita
from app.modules.subscriptions.models import Plan, Suscripcion, PagoSuscripcion
from app.modules.packages.models import Paquete
from app.modules.communications.models import Comunicado, SegmentacionComunicado
from app.modules.pqrs.models import CategoriaPQRS, PQRS, MensajePQRS
from app.modules.incidents.models import TipoIncidente, Incidente, ActualizacionIncidente
from app.modules.parking.models import ParqueaderoResidente, VehiculoResidente, AsignacionParqueaderoResidente, SorteoRotacion, ParticipacionRotacion
from app.modules.common_areas.models import ZonaComun, HorarioZonaComun, ReservaZonaComun
from app.modules.shifts.models import Turno
from app.modules.external_personnel.models import IngresoExterno
from app.modules.visitor_parking.models import ParqueaderoVisitante
from app.modules.notifications.models import Notificacion
from app.modules.billing.models import Factura, Pago, TransaccionPago
from app.modules.events.models import EventoOutbox
from app.modules.audit.models import MinutaSistema, Archivo

# --- Configuración Alembic ---
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# --- Modo offline ---
# Genera SQL sin conectarse a la DB - útil para revisar migraciones antes de ejecutar prod
def run_migrations_offline() -> None:
    context.configure(
        url=settings.db_url_sync,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# --- Modo online ---
def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    engine = create_async_engine(settings.db_url, poolclass=pool.NullPool)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()

# --- Entry point ---
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())