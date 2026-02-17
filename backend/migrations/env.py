import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

from app.config import settings
from app.core.database.base import Base

from app.modules.tenants.models import Tenant, Torre, Unidad
from app.modules.users.models import Usuario, Rol, Permiso, RolPermiso, TenantUsuario

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