import re
import os

versions_dir = 'migrations/versions'
migration_files = [f for f in os.listdir(versions_dir) if f.endswith('.py') and f != '__pycache__']

if not migration_files:
    print("❌ No se encontró archivo de migración")
    exit(1)

migration_file = os.path.join(versions_dir, migration_files[0])
print(f"📝 Editando: {migration_file}")

with open(migration_file, 'r') as f:
    content = f.read()

# SQL para crear ENUMs con manejo de errores
enum_creates = '''    # Crear tipos ENUM con manejo de duplicados
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_autorizacion_enum AS ENUM ('PENDIENTE', 'ACTIVA', 'UTILIZADA', 'VENCIDA', 'CANCELADA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_vehiculo_enum AS ENUM ('AUTOMOVIL', 'MOTOCICLETA', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_documento_visitante_enum AS ENUM ('CC', 'CE', 'PA', 'TI', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'PA', 'TI', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_rol_enum AS ENUM ('RESIDENTE', 'ADMINISTRACION', 'SEGURIDAD', 'RECEPCION', 'SUPERADMIN');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_unidad_enum AS ENUM ('APARTAMENTO', 'CASA', 'LOCAL', 'OFICINA', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_suscripcion_enum AS ENUM ('ACTIVA', 'VENCIDA', 'SUSPENDIDA', 'CANCELADA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_pago_suscripcion_enum AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_paquete_enum AS ENUM ('RECIBIDO', 'NOTIFICADO', 'ENTREGADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_comunicado_enum AS ENUM ('INFORMATIVO', 'URGENTE', 'EVENTO', 'MANTENIMIENTO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_comunicado_enum AS ENUM ('BORRADOR', 'PUBLICADO', 'ARCHIVADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_segmentacion_enum AS ENUM ('TODOS', 'TORRE', 'UNIDAD', 'ROL');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_pqrs_enum AS ENUM ('ABIERTA', 'EN_PROCESO', 'RESUELTA', 'CERRADA', 'RECHAZADA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE prioridad_pqrs_enum AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_incidente_enum AS ENUM ('REPORTADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE severidad_incidente_enum AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_parqueadero_enum AS ENUM ('FIJO', 'ROTATIVO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_vehiculo_residente_enum AS ENUM ('AUTOMOVIL', 'MOTOCICLETA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_sorteo_enum AS ENUM ('PROGRAMADO', 'EJECUTADO', 'CANCELADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE dia_semana_enum AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_reserva_enum AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_turno_enum AS ENUM ('DIURNO', 'NOCTURNO', 'MIXTO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_documento_externo_enum AS ENUM ('CC', 'CE', 'PA', 'TI', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_personal_externo_enum AS ENUM ('MANTENIMIENTO', 'LIMPIEZA', 'MENSAJERIA', 'PROVEEDOR', 'CONTRATISTA', 'OTRO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE tipo_notificacion_enum AS ENUM ('INFO', 'ALERTA', 'URGENTE');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE canal_notificacion_enum AS ENUM ('PUSH', 'EMAIL', 'SMS');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_factura_enum AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_pago_enum AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE metodo_pago_enum AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)
    op.execute("""
        DO 84126 BEGIN
            CREATE TYPE estado_evento_enum AS ENUM ('PENDIENTE', 'PROCESADO', 'FALLIDO');
        EXCEPTION WHEN duplicate_object THEN null;
        END 84126;
    """)

'''

pattern = r'(def upgrade\(\) -> None:\s*\n)'
replacement = r'\1' + enum_creates
content = re.sub(pattern, replacement, content)

with open(migration_file, 'w') as f:
    f.write(content)

print("✅ Migración corregida con bloques DO")
