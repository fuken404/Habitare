-- =====================================================
-- SISTEMA DE GESTIÓN DE CONJUNTOS RESIDENCIALES
-- Script DDL PostgreSQL
-- Fecha: 2026-02-17
-- Total Tablas: 42
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- GRUPO 1: NÚCLEO MULTI-TENANT (11 tablas)
-- =====================================================

-- Tabla: tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    nit VARCHAR(50),
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_tenant_nit UNIQUE (nit)
);

COMMENT ON TABLE tenants IS 'Conjuntos residenciales (multi-tenant)';
CREATE INDEX idx_tenants_activo ON tenants(is_activo);

-- Tabla: torres
CREATE TABLE torres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    n_pisos INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_torres_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_torre_tenant_nombre UNIQUE (tenant_id, nombre)
);

CREATE INDEX idx_torres_tenant ON torres(tenant_id);

-- Tabla: unidades
CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    torre_id UUID,
    numero VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('apartamento', 'casa', 'local', 'oficina', 'otro')),
    area_m2 DECIMAL(10,2),
    piso INTEGER,
    habitada BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_unidades_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_unidades_torre FOREIGN KEY (torre_id) 
        REFERENCES torres(id) ON DELETE SET NULL,
    CONSTRAINT unique_unidad_tenant_numero UNIQUE (tenant_id, numero)
);

CREATE INDEX idx_unidades_tenant ON unidades(tenant_id);
CREATE INDEX idx_unidades_torre ON unidades(torre_id);

-- Tabla: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'PA', 'TI', 'otro')),
    n_documento VARCHAR(50) NOT NULL,
    telefono VARCHAR(50),
    avatar_url TEXT,
    is_activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    fecha_ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_usuario_email UNIQUE (email),
    CONSTRAINT unique_usuario_documento UNIQUE (tipo_documento, n_documento)
);

COMMENT ON TABLE usuarios IS 'Usuarios globales del sistema';
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(is_activo);

-- Tabla: roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_rol_nombre UNIQUE (nombre)
);

CREATE INDEX idx_roles_activo ON roles(is_activo);

-- Tabla: permisos
CREATE TABLE permisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    modulo VARCHAR(100) NOT NULL,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_permiso_codigo UNIQUE (codigo)
);

CREATE INDEX idx_permisos_modulo ON permisos(modulo);
CREATE INDEX idx_permisos_activo ON permisos(is_activo);

-- Tabla: rol_permiso
CREATE TABLE rol_permiso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rol_id UUID NOT NULL,
    permiso_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_rol_permiso_rol FOREIGN KEY (rol_id) 
        REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) 
        REFERENCES permisos(id) ON DELETE CASCADE,
    CONSTRAINT unique_rol_permiso UNIQUE (rol_id, permiso_id)
);

CREATE INDEX idx_rol_permiso_rol ON rol_permiso(rol_id);
CREATE INDEX idx_rol_permiso_permiso ON rol_permiso(permiso_id);

-- Tabla: tenant_usuario
CREATE TABLE tenant_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    unidad_id UUID,
    rol_id UUID NOT NULL,
    is_activa BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tenant_usuario_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_usuario_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_usuario_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE SET NULL,
    CONSTRAINT fk_tenant_usuario_rol FOREIGN KEY (rol_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

COMMENT ON TABLE tenant_usuario IS 'Relación usuario-conjunto-rol-unidad (membresías)';
CREATE INDEX idx_tenant_usuario_usuario ON tenant_usuario(usuario_id);
CREATE INDEX idx_tenant_usuario_tenant ON tenant_usuario(tenant_id);
CREATE INDEX idx_tenant_usuario_unidad ON tenant_usuario(unidad_id);
CREATE UNIQUE INDEX idx_tenant_usuario_unique ON tenant_usuario(usuario_id, tenant_id, unidad_id) 
    WHERE unidad_id IS NOT NULL;

-- Tabla: planes
CREATE TABLE planes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_mensual DECIMAL(12,2) NOT NULL,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_plan_nombre UNIQUE (nombre)
);

CREATE INDEX idx_planes_activo ON planes(is_activo);

-- Tabla: suscripciones
CREATE TABLE suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('activa', 'periodo_prueba', 'suspendida', 'cancelada', 'vencida')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    fecha_proximo_pago DATE NOT NULL,
    precio_mensual DECIMAL(12,2) NOT NULL,
    auto_renovacion BOOLEAN DEFAULT TRUE,
    periodo_prueba BOOLEAN DEFAULT FALSE,
    fecha_fin_prueba DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_suscripciones_plan FOREIGN KEY (plan_id) 
        REFERENCES planes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_suscripciones_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_suscripcion_tenant UNIQUE (tenant_id)
);

CREATE INDEX idx_suscripciones_estado ON suscripciones(estado, fecha_proximo_pago);
CREATE INDEX idx_suscripciones_plan ON suscripciones(plan_id);

-- Tabla: pago_suscripcion
CREATE TABLE pago_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suscripcion_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    periodo_desde DATE NOT NULL,
    periodo_hasta DATE NOT NULL,
    fecha_pago TIMESTAMP,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'procesando', 'pagado', 'fallido', 'reembolsado')),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('tarjeta', 'transferencia', 'pse', 'efectivo', 'otro')),
    referencia_externa TEXT,
    gateway VARCHAR(50),
    invoice_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_pago_suscripcion_suscripcion FOREIGN KEY (suscripcion_id) 
        REFERENCES suscripciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_pago_suscripcion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_pago_suscripcion_suscripcion ON pago_suscripcion(suscripcion_id, periodo_desde);
CREATE INDEX idx_pago_suscripcion_tenant ON pago_suscripcion(tenant_id, created_at DESC);
CREATE INDEX idx_pago_suscripcion_estado ON pago_suscripcion(estado, fecha_pago);

-- =====================================================
-- GRUPO 2: VISITANTES Y PORTERÍA (4 tablas)
-- =====================================================

-- Tabla: visitantes
CREATE TABLE visitantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_documento VARCHAR(10) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'PA', 'TI', 'otro')),
    n_documento VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_visitante_documento UNIQUE (tipo_documento, n_documento)
);

COMMENT ON TABLE visitantes IS 'Visitantes globales (pueden visitar múltiples conjuntos)';
CREATE INDEX idx_visitantes_documento ON visitantes(n_documento);

-- Tabla: autorizacion_visitas
CREATE TABLE autorizacion_visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitante_id UUID NOT NULL,
    autorizado_por UUID NOT NULL,
    unidad_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    fecha DATE NOT NULL,
    requiere_parqueadero BOOLEAN DEFAULT FALSE,
    parqueadero_visitante_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_autorizacion_visitante FOREIGN KEY (visitante_id) 
        REFERENCES visitantes(id) ON DELETE CASCADE,
    CONSTRAINT fk_autorizacion_autorizado FOREIGN KEY (autorizado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_autorizacion_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_autorizacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_autorizacion_tenant ON autorizacion_visitas(tenant_id, fecha);
CREATE INDEX idx_autorizacion_visitante ON autorizacion_visitas(visitante_id);
CREATE INDEX idx_autorizacion_unidad ON autorizacion_visitas(unidad_id, fecha);
CREATE INDEX idx_autorizacion_parqueadero ON autorizacion_visitas(parqueadero_visitante_id);

-- Tabla: ingreso_visita
CREATE TABLE ingreso_visita (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitante_id UUID NOT NULL,
    autorizacion_id UUID,
    tenant_id UUID NOT NULL,
    fecha_hora_ingreso TIMESTAMP NOT NULL,
    registrado_por UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_ingreso_visitante FOREIGN KEY (visitante_id) 
        REFERENCES visitantes(id) ON DELETE CASCADE,
    CONSTRAINT fk_ingreso_autorizacion FOREIGN KEY (autorizacion_id) 
        REFERENCES autorizacion_visitas(id) ON DELETE SET NULL,
    CONSTRAINT fk_ingreso_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_ingreso_registrado FOREIGN KEY (registrado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ingreso_tenant ON ingreso_visita(tenant_id, fecha_hora_ingreso DESC);
CREATE INDEX idx_ingreso_visitante ON ingreso_visita(visitante_id, fecha_hora_ingreso DESC);
CREATE INDEX idx_ingreso_autorizacion ON ingreso_visita(autorizacion_id);

-- Tabla: vehiculo_visitante
CREATE TABLE vehiculo_visitante (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    autorizacion_visita_id UUID NOT NULL,
    placa VARCHAR(20) NOT NULL,
    marca VARCHAR(100),
    color VARCHAR(50),
    tipo VARCHAR(20) CHECK (tipo IN ('carro', 'moto', 'camion', 'bicicleta', 'otro')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_vehiculo_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_vehiculo_autorizacion FOREIGN KEY (autorizacion_visita_id) 
        REFERENCES autorizacion_visitas(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehiculo_tenant ON vehiculo_visitante(tenant_id, placa);
CREATE INDEX idx_vehiculo_autorizacion ON vehiculo_visitante(autorizacion_visita_id);
CREATE INDEX idx_vehiculo_placa ON vehiculo_visitante(placa);

-- =====================================================
-- GRUPO 3: PARQUEADEROS (5 tablas)
-- =====================================================



-- Tabla: parqueaderos_residentes
CREATE TABLE parqueaderos_residentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    numero VARCHAR(50) NOT NULL,
    ubicacion TEXT,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('permanente', 'temporal', 'vacio')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_parqueadero_residente_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_parqueadero_residente UNIQUE (tenant_id, numero)
);

CREATE INDEX idx_parqueadero_residente_tenant ON parqueaderos_residentes(tenant_id, estado);

-- Tabla: asignaciones_parqueadero_residente
CREATE TABLE asignaciones_parqueadero_residente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    parqueadero_residente_id UUID NOT NULL,
    unidad_id UUID NOT NULL,
    participacion_sorteo_id UUID,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('permanente', 'temporal')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('activa', 'vencida', 'cancelada')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_asignacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignacion_parqueadero FOREIGN KEY (parqueadero_residente_id) 
        REFERENCES parqueaderos_residentes(id) ON DELETE CASCADE,
    CONSTRAINT fk_asignacion_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE
);

CREATE INDEX idx_asignacion_tenant ON asignaciones_parqueadero_residente(tenant_id, estado);
CREATE INDEX idx_asignacion_parqueadero ON asignaciones_parqueadero_residente(parqueadero_residente_id, estado);
CREATE INDEX idx_asignacion_unidad ON asignaciones_parqueadero_residente(unidad_id, fecha_inicio DESC);
CREATE UNIQUE INDEX idx_asignacion_parqueadero_activa ON asignaciones_parqueadero_residente(parqueadero_residente_id) 
    WHERE estado = 'activa';

-- Tabla: sorteos_rotacion
CREATE TABLE sorteos_rotacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_sorteo DATE NOT NULL,
    duracion_asignacion_dias INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'ejecutado', 'cerrado')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_sorteo_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_sorteo_tenant ON sorteos_rotacion(tenant_id, fecha_sorteo DESC);
CREATE INDEX idx_sorteo_estado ON sorteos_rotacion(estado);

-- Tabla: participaciones_rotacion
CREATE TABLE participaciones_rotacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID NOT NULL,
    sorteo_id UUID NOT NULL,
    ganador BOOLEAN DEFAULT FALSE,
    parqueadero_asignado_id UUID,
    tenant_id UUID NOT NULL,
    fecha_asignacion DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_participacion_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_participacion_sorteo FOREIGN KEY (sorteo_id) 
        REFERENCES sorteos_rotacion(id) ON DELETE CASCADE,
    CONSTRAINT fk_participacion_parqueadero FOREIGN KEY (parqueadero_asignado_id) 
        REFERENCES parqueaderos_residentes(id) ON DELETE SET NULL,
    CONSTRAINT fk_participacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_participacion UNIQUE (sorteo_id, unidad_id)
);

CREATE INDEX idx_participacion_sorteo ON participaciones_rotacion(sorteo_id, ganador);
CREATE INDEX idx_participacion_unidad ON participaciones_rotacion(unidad_id);

-- FK posterior para asignaciones_parqueadero_residente
ALTER TABLE asignaciones_parqueadero_residente
ADD CONSTRAINT fk_asignacion_participacion FOREIGN KEY (participacion_sorteo_id) 
    REFERENCES participaciones_rotacion(id) ON DELETE SET NULL;

-- Tabla: parqueaderos_visitantes
CREATE TABLE parqueaderos_visitantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    numero VARCHAR(50) NOT NULL,
    ubicacion TEXT,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('libre', 'reservado')),
    reservado_desde TIMESTAMP,
    salida_reserva TIMESTAMP,
    reservado_para_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_parqueadero_visitante_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_parqueadero_visitante_ingreso FOREIGN KEY (reservado_para_id) 
        REFERENCES ingreso_visita(id) ON DELETE SET NULL,
    CONSTRAINT unique_parqueadero_visitante UNIQUE (tenant_id, numero)
);

CREATE INDEX idx_parqueadero_visitante_tenant ON parqueaderos_visitantes(tenant_id, estado);
CREATE INDEX idx_parqueadero_visitante_ingreso ON parqueaderos_visitantes(reservado_para_id);

-- FK posterior para autorizacion_visitas
ALTER TABLE autorizacion_visitas
ADD CONSTRAINT fk_autorizacion_parqueadero FOREIGN KEY (parqueadero_visitante_id) 
    REFERENCES parqueaderos_visitantes(id) ON DELETE SET NULL;

-- =====================================================
-- GRUPO 4: PAQUETES (1 tabla)
-- =====================================================

-- Tabla: paquetes
CREATE TABLE paquetes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    unidad_id UUID NOT NULL,
    recibido_por UUID NOT NULL,
    fecha_recepcion TIMESTAMP NOT NULL DEFAULT NOW(),
    retirado_por UUID,
    fecha_retiro TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_paquetes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_paquetes_unidad FOREIGN KEY (unidad_id) REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_paquetes_recibido FOREIGN KEY (recibido_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_paquetes_retirado FOREIGN KEY (retirado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT chk_fecha_retiro CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_recepcion),
    CONSTRAINT chk_retirado_coherente CHECK (
        (retirado_por IS NULL AND fecha_retiro IS NULL) OR 
        (retirado_por IS NOT NULL AND fecha_retiro IS NOT NULL)
    )
);

CREATE INDEX idx_paquetes_tenant ON paquetes(tenant_id, fecha_recepcion DESC);
CREATE INDEX idx_paquetes_unidad_pendientes ON paquetes(unidad_id) WHERE retirado_por IS NULL;
CREATE INDEX idx_paquetes_fecha ON paquetes(tenant_id, fecha_recepcion DESC);

COMMENT ON TABLE paquetes IS 'Registro de paquetes recibidos en recepción para las unidades';
COMMENT ON COLUMN paquetes.recibido_por IS 'Usuario de recepción que registró la llegada del paquete';
COMMENT ON COLUMN paquetes.retirado_por IS 'Usuario residente que retiró el paquete (NULL = pendiente)';
COMMENT ON COLUMN paquetes.fecha_retiro IS 'Fecha y hora en que se retiró el paquete (NULL = pendiente)';

-- =====================================================
-- GRUPO 5: PQRS (3 tablas)
-- =====================================================

-- Tabla: categorias_pqrs
CREATE TABLE categorias_pqrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    sla_primera_respuesta_horas INTEGER,
    sla_resolucion_dias INTEGER,
    is_activa BOOLEAN DEFAULT TRUE,
    orden INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_categoria_pqrs UNIQUE (nombre)
);

CREATE INDEX idx_categorias_pqrs_activa ON categorias_pqrs(is_activa, orden);

-- Tabla: pqrs
CREATE TABLE pqrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID NOT NULL,
    creado_por UUID NOT NULL,
    asignado_a UUID,
    categoria_id UUID,
    tenant_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('peticion', 'queja', 'reclamo', 'sugerencia')),
    asunto TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_radicacion TIMESTAMP NOT NULL,
    fecha_asignacion TIMESTAMP,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('radicada', 'en_revision', 'en_proceso', 'resuelta', 'cerrada', 'rechazada')),
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    fecha_resolucion TIMESTAMP,
    fecha_cierre TIMESTAMP,
    sla_primera_respuesta_vence TIMESTAMP,
    sla_resolucion_vence TIMESTAMP,
    sla_primera_respuesta_cumplido BOOLEAN,
    sla_resolucion_cumplido BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_pqrs_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_pqrs_creado FOREIGN KEY (creado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pqrs_asignado FOREIGN KEY (asignado_a) 
        REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_pqrs_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias_pqrs(id) ON DELETE SET NULL,
    CONSTRAINT fk_pqrs_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_pqrs_tenant ON pqrs(tenant_id, fecha_radicacion DESC);
CREATE INDEX idx_pqrs_unidad ON pqrs(unidad_id, estado);
CREATE INDEX idx_pqrs_estado ON pqrs(estado, fecha_radicacion);
CREATE INDEX idx_pqrs_sla_primera ON pqrs(estado, sla_primera_respuesta_vence) 
    WHERE estado NOT IN ('resuelta', 'cerrada');
CREATE INDEX idx_pqrs_sla_resolucion ON pqrs(estado, sla_resolucion_vence) 
    WHERE estado NOT IN ('resuelta', 'cerrada');

-- Tabla: mensajes_pqrs
CREATE TABLE mensajes_pqrs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pqrs_id UUID NOT NULL,
    autor_id UUID NOT NULL,
    tipo_autor VARCHAR(20) NOT NULL CHECK (tipo_autor IN ('residente', 'administracion')),
    mensaje TEXT NOT NULL,
    fecha_mensaje TIMESTAMP NOT NULL,
    es_interno BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    tenant_id UUID NOT NULL,
    
    CONSTRAINT fk_mensaje_pqrs FOREIGN KEY (pqrs_id) 
        REFERENCES pqrs(id) ON DELETE CASCADE,
    CONSTRAINT fk_mensaje_autor FOREIGN KEY (autor_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_mensaje_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_mensajes_pqrs ON mensajes_pqrs(pqrs_id, fecha_mensaje ASC);
CREATE INDEX idx_mensajes_autor ON mensajes_pqrs(autor_id);

-- =====================================================
-- GRUPO 6: NOVEDADES/INCIDENTES (3 tablas)
-- =====================================================

-- Tabla: tipos_incidente
CREATE TABLE tipos_incidente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('seguridad', 'mantenimiento', 'convivencia', 'servicios', 'otro')),
    descripcion TEXT,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_tipo_incidente_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_tipo_incidente UNIQUE (tenant_id, nombre)
);

CREATE INDEX idx_tipo_incidente_tenant ON tipos_incidente(tenant_id, is_activo);

-- Tabla: incidentes
CREATE TABLE incidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    tipo_incidente_id UUID,
    unidad_id UUID,
    turno_id UUID,
    reportado_por UUID NOT NULL,
    fecha_reporte TIMESTAMP NOT NULL,
    asignado_a UUID,
    fecha_asignacion TIMESTAMP,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion TEXT,
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('reportado', 'en_revision', 'en_proceso', 'resuelto', 'cerrado')),
    requiere_mantenimiento BOOLEAN DEFAULT FALSE,
    fecha_resolucion TIMESTAMP,
    fecha_cierre TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_incidente_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_incidente_tipo FOREIGN KEY (tipo_incidente_id) 
        REFERENCES tipos_incidente(id) ON DELETE SET NULL,
    CONSTRAINT fk_incidente_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE SET NULL,
    CONSTRAINT fk_incidente_reportado FOREIGN KEY (reportado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_incidente_asignado FOREIGN KEY (asignado_a) 
        REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_incidente_tenant ON incidentes(tenant_id, fecha_reporte DESC);
CREATE INDEX idx_incidente_tipo ON incidentes(tipo_incidente_id);
CREATE INDEX idx_incidente_unidad ON incidentes(unidad_id, estado);
CREATE INDEX idx_incidente_estado ON incidentes(estado, severidad, fecha_reporte);

-- Tabla: actualizaciones_incidente
CREATE TABLE actualizaciones_incidente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    actualizado_por UUID NOT NULL,
    fecha_actualizacion TIMESTAMP NOT NULL,
    comentario TEXT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    es_interno BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_actualizacion_incidente FOREIGN KEY (incidente_id) 
        REFERENCES incidentes(id) ON DELETE CASCADE,
    CONSTRAINT fk_actualizacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_actualizacion_usuario FOREIGN KEY (actualizado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_actualizacion_incidente ON actualizaciones_incidente(incidente_id, fecha_actualizacion ASC);
CREATE INDEX idx_actualizacion_usuario ON actualizaciones_incidente(actualizado_por);

-- =====================================================
-- GRUPO 7: COMUNICADOS (2 tablas)
-- =====================================================

-- Tabla: comunicados
CREATE TABLE comunicados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    creado_por UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('informativo', 'urgente', 'evento', 'normativo')),
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('borrador', 'programado', 'publicado', 'archivado')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_comunicado_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_comunicado_usuario FOREIGN KEY (creado_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_comunicado_tenant ON comunicados(tenant_id, estado, fecha_publicacion DESC);
CREATE INDEX idx_comunicado_estado ON comunicados(estado, fecha_publicacion);
CREATE INDEX idx_comunicado_tipo ON comunicados(tipo, estado);

-- Tabla: segmentaciones_comunicado
CREATE TABLE segmentaciones_comunicado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comunicado_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    tipo_segmentacion VARCHAR(20) NOT NULL CHECK (tipo_segmentacion IN ('todos', 'torre', 'unidad', 'rol')),
    torre_id UUID,
    unidad_id UUID,
    rol_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_segmentacion_comunicado FOREIGN KEY (comunicado_id) 
        REFERENCES comunicados(id) ON DELETE CASCADE,
    CONSTRAINT fk_segmentacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_segmentacion_torre FOREIGN KEY (torre_id) 
        REFERENCES torres(id) ON DELETE CASCADE,
    CONSTRAINT fk_segmentacion_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_segmentacion_rol FOREIGN KEY (rol_id) 
        REFERENCES roles(id) ON DELETE CASCADE
);

CREATE INDEX idx_segmentacion_comunicado ON segmentaciones_comunicado(comunicado_id, tipo_segmentacion);
CREATE INDEX idx_segmentacion_torre ON segmentaciones_comunicado(torre_id);
CREATE INDEX idx_segmentacion_unidad ON segmentaciones_comunicado(unidad_id);
CREATE INDEX idx_segmentacion_rol ON segmentaciones_comunicado(rol_id);

-- =====================================================
-- GRUPO 8: PAGOS Y CARTERA (3 tablas)
-- =====================================================

-- Tabla: facturas
CREATE TABLE facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    unidad_id UUID NOT NULL,
    n_factura VARCHAR(50) NOT NULL,
    periodo DATE NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto_total DECIMAL(12,2) NOT NULL,
    monto_pagado DECIMAL(12,2) DEFAULT 0,
    monto_pendiente DECIMAL(12,2) NOT NULL,
    intereses_mora DECIMAL(12,2) DEFAULT 0,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'parcial', 'pagada', 'vencida', 'anulada')),
    generado_por UUID,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_factura_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_factura_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_factura_generado FOREIGN KEY (generado_por) 
        REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT unique_n_factura UNIQUE (n_factura)
);

CREATE INDEX idx_factura_tenant ON facturas(tenant_id, periodo DESC);
CREATE INDEX idx_factura_unidad ON facturas(unidad_id, estado);
CREATE INDEX idx_factura_estado ON facturas(estado, fecha_vencimiento);

-- Tabla: pagos
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    factura_id UUID NOT NULL,
    unidad_id UUID NOT NULL,
    n_recibo VARCHAR(50) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'cheque', 'pse', 'otro')),
    referencia TEXT,
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('pendiente_confirmacion', 'confirmado', 'rechazado', 'anulado')),
    registrado_por UUID,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_pago_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_pago_factura FOREIGN KEY (factura_id) 
        REFERENCES facturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pago_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE CASCADE,
    CONSTRAINT fk_pago_registrado FOREIGN KEY (registrado_por) 
        REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT unique_n_recibo UNIQUE (n_recibo)
);

CREATE INDEX idx_pago_tenant ON pagos(tenant_id, fecha_pago DESC);
CREATE INDEX idx_pago_factura ON pagos(factura_id);
CREATE INDEX idx_pago_unidad ON pagos(unidad_id, fecha_pago DESC);
CREATE INDEX idx_pago_estado ON pagos(estado);

-- Tabla: transacciones_pago
CREATE TABLE transacciones_pago (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pago_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    tipo_transaccion VARCHAR(20) NOT NULL CHECK (tipo_transaccion IN ('intento', 'confirmacion', 'reverso', 'notificacion')),
    gateway VARCHAR(50),
    transaccion_id_externo TEXT,
    fecha_transaccion TIMESTAMP NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    estado_http INTEGER,
    resultado VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_transaccion_pago FOREIGN KEY (pago_id) 
        REFERENCES pagos(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaccion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_transaccion_pago ON transacciones_pago(pago_id, fecha_transaccion DESC);
CREATE INDEX idx_transaccion_externo ON transacciones_pago(transaccion_id_externo);

-- =====================================================
-- GRUPO 9: SEGURIDAD/TURNOS (1 tabla)
-- =====================================================

-- Tabla: turnos
CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_turno VARCHAR(20) NOT NULL CHECK (tipo_turno IN ('diurno', 'tarde', 'nocturno')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_turno_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_turno_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT unique_turno UNIQUE (tenant_id, usuario_id, fecha, hora_inicio)
);

CREATE INDEX idx_turno_tenant ON turnos(tenant_id, fecha DESC);
CREATE INDEX idx_turno_usuario ON turnos(usuario_id, fecha DESC);
CREATE INDEX idx_turno_tipo ON turnos(fecha, tipo_turno);

-- FK posterior para incidentes
ALTER TABLE incidentes
ADD CONSTRAINT fk_incidente_turno FOREIGN KEY (turno_id) 
    REFERENCES turnos(id) ON DELETE SET NULL;

-- =====================================================
-- GRUPO 10: TRANSVERSALES (4 tablas)
-- =====================================================

-- Tabla: archivos
CREATE TABLE archivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    subido_por UUID NOT NULL,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    nombre_archivo TEXT NOT NULL,
    ruta_almacenamiento TEXT NOT NULL,
    url_publica TEXT,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    extension VARCHAR(10) NOT NULL,
    metadata JSONB,
    fecha_eliminacion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_archivo_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_archivo_subido FOREIGN KEY (subido_por) 
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE INDEX idx_archivo_tenant ON archivos(tenant_id, created_at DESC);
CREATE INDEX idx_archivo_entidad ON archivos(entidad_tipo, entidad_id);
CREATE INDEX idx_archivo_subido ON archivos(subido_por);
CREATE INDEX idx_archivo_eliminacion ON archivos(fecha_eliminacion) 
    WHERE fecha_eliminacion IS NOT NULL;

-- Tabla: notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    entidad_tipo VARCHAR(50),
    entidad_id UUID,
    tipo_notificacion VARCHAR(20) NOT NULL CHECK (tipo_notificacion IN ('info', 'alerta', 'urgente', 'sistema')),
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    canales JSONB NOT NULL,
    estado_app VARCHAR(20) CHECK (estado_app IN ('pendiente', 'enviada', 'fallida')),
    estado_email VARCHAR(20) CHECK (estado_email IN ('pendiente', 'enviada', 'fallida')),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_notificacion_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificacion_tenant ON notificaciones(tenant_id, usuario_id, created_at DESC);
CREATE INDEX idx_notificacion_usuario ON notificaciones(usuario_id, created_at DESC) 
    WHERE estado_app IN ('pendiente', 'enviada');
CREATE INDEX idx_notificacion_entidad ON notificaciones(entidad_tipo, entidad_id);

-- Tabla: minutas_sistema
CREATE TABLE minutas_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    usuario_id UUID,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('crear', 'actualizar', 'eliminar', 'consultar', 'login', 'logout', 'exportar', 'importar', 'otro')),
    entidad_tipo VARCHAR(50),
    entidad_id UUID,
    descripcion TEXT NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_origen INET,
    user_agent TEXT,
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('exitoso', 'fallido', 'parcial')),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    duracion_ms INTEGER,
    
    CONSTRAINT fk_minuta_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_minuta_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE minutas_sistema IS 'Auditoría completa del sistema';
CREATE INDEX idx_minuta_tenant ON minutas_sistema(tenant_id, timestamp DESC);
CREATE INDEX idx_minuta_usuario ON minutas_sistema(usuario_id, timestamp DESC);
CREATE INDEX idx_minuta_entidad ON minutas_sistema(entidad_tipo, entidad_id, timestamp DESC);
CREATE INDEX idx_minuta_accion ON minutas_sistema(accion, timestamp DESC);

-- Tabla: eventos_outbox
CREATE TABLE eventos_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    tipo_evento VARCHAR(100) NOT NULL,
    agregado_tipo VARCHAR(50) NOT NULL,
    agregado_id UUID NOT NULL,
    payload JSONB NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente', 'procesando', 'procesado', 'fallido', 'descartado')),
    intentos INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    proximo_intento TIMESTAMP,
    error_mensaje TEXT,
    fecha_procesado TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_evento_tenant FOREIGN KEY (tenant_id) 
        REFERENCES tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE eventos_outbox IS 'Patrón outbox para eventos asíncronos';
CREATE INDEX idx_evento_pendiente ON eventos_outbox(estado, created_at) 
    WHERE estado = 'pendiente';
CREATE INDEX idx_evento_fallido ON eventos_outbox(estado, proximo_intento) 
    WHERE estado = 'fallido';
CREATE INDEX idx_evento_tenant ON eventos_outbox(tenant_id, tipo_evento, created_at DESC);
CREATE INDEX idx_evento_agregado ON eventos_outbox(agregado_tipo, agregado_id);

-- =====================================================
-- GRUPO 11: RESERVA DE ZONAS COMUNES (3 tablas)
-- =====================================================

-- Tabla: zonas_comunes
CREATE TABLE zonas_comunes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    capacidad_personas INTEGER,
    ubicacion TEXT,
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    tiempo_minimo_reserva_minutos INTEGER NOT NULL DEFAULT 60,
    tiempo_maximo_reserva_minutos INTEGER NOT NULL DEFAULT 240,
    anticipacion_minima_horas INTEGER DEFAULT 24,
    anticipacion_maxima_dias INTEGER DEFAULT 30,
    permite_reservas_simultaneas BOOLEAN DEFAULT FALSE,
    costo_reserva DECIMAL(12,2) DEFAULT 0,
    requiere_deposito BOOLEAN DEFAULT FALSE,
    monto_deposito DECIMAL(12,2),
    instrucciones TEXT,
    is_activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_zona_comun_tenant_nombre UNIQUE(tenant_id, nombre),
    CONSTRAINT chk_tiempo_reserva CHECK (tiempo_maximo_reserva_minutos >= tiempo_minimo_reserva_minutos)
);

CREATE INDEX idx_zona_comun_tenant ON zonas_comunes(tenant_id, is_activa);

COMMENT ON TABLE zonas_comunes IS 'Configuración de espacios comunes disponibles para reserva';
COMMENT ON COLUMN zonas_comunes.requiere_aprobacion IS 'Si TRUE, las reservas requieren aprobación administrativa';
COMMENT ON COLUMN zonas_comunes.tiempo_minimo_reserva_minutos IS 'Duración mínima de reserva en minutos';
COMMENT ON COLUMN zonas_comunes.anticipacion_minima_horas IS 'Horas mínimas de anticipación para reservar';

-- Tabla: horarios_zona_comun
CREATE TABLE horarios_zona_comun (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zona_comun_id UUID NOT NULL REFERENCES zonas_comunes(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dia_semana CHECK (dia_semana >= 0 AND dia_semana <= 6),
    CONSTRAINT chk_horario_valido CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_horario_zona_dia ON horarios_zona_comun(zona_comun_id, dia_semana, is_activo);

COMMENT ON TABLE horarios_zona_comun IS 'Horarios de disponibilidad por día de semana para cada zona común';
COMMENT ON COLUMN horarios_zona_comun.dia_semana IS '0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo';

-- Tabla: reservas_zona_comun
CREATE TABLE reservas_zona_comun (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    zona_comun_id UUID NOT NULL REFERENCES zonas_comunes(id) ON DELETE CASCADE,
    unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    reservado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    n_personas INTEGER,
    motivo TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    aprobado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_aprobacion TIMESTAMP,
    razon_rechazo TEXT,
    costo_total DECIMAL(12,2) DEFAULT 0,
    deposito_pagado BOOLEAN DEFAULT FALSE,
    deposito_devuelto BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_reserva_horario CHECK (hora_fin > hora_inicio),
    CONSTRAINT chk_reserva_estado CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'cancelada', 'completada'))
);

CREATE INDEX idx_reserva_tenant_fecha ON reservas_zona_comun(tenant_id, fecha_reserva);
CREATE INDEX idx_reserva_disponibilidad ON reservas_zona_comun(zona_comun_id, fecha_reserva, hora_inicio);
CREATE INDEX idx_reserva_unidad ON reservas_zona_comun(unidad_id, estado, fecha_reserva);
CREATE INDEX idx_reserva_usuario ON reservas_zona_comun(reservado_por);
CREATE INDEX idx_reserva_estado ON reservas_zona_comun(estado, fecha_reserva);

COMMENT ON TABLE reservas_zona_comun IS 'Reservas de zonas comunes realizadas por residentes';
COMMENT ON COLUMN reservas_zona_comun.estado IS 'Estados: pendiente (esperando aprobación), aprobada, rechazada, cancelada (por usuario), completada (reserva utilizada)';

-- =====================================================
-- GRUPO 12: VEHÍCULOS DE RESIDENTES (1 tabla)
-- =====================================================

-- Tabla: vehiculos_residentes
CREATE TABLE vehiculos_residentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unidad_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    placa VARCHAR(20) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    color VARCHAR(50),
    tipo VARCHAR(20) NOT NULL,
    año INTEGER,
    is_activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_vehiculo_tipo CHECK (tipo IN ('carro', 'moto', 'camion', 'bicicleta', 'otro')),
    CONSTRAINT uq_vehiculo_placa_tenant UNIQUE(tenant_id, placa)
);

CREATE INDEX idx_vehiculo_residente_tenant ON vehiculos_residentes(tenant_id, is_activo);
CREATE INDEX idx_vehiculo_residente_unidad ON vehiculos_residentes(unidad_id);
CREATE INDEX idx_vehiculo_residente_placa ON vehiculos_residentes(tenant_id, placa);

COMMENT ON TABLE vehiculos_residentes IS 'Vehículos registrados por los residentes de cada unidad';
COMMENT ON COLUMN vehiculos_residentes.tipo IS 'Tipo de vehículo: carro, moto, camion, bicicleta, otro';
COMMENT ON COLUMN vehiculos_residentes.is_activo IS 'Indica si el vehículo sigue activo/vigente para la unidad';

-- =====================================================
-- GRUPO 13: INGRESOS EXTERNOS (1 tabla)
-- =====================================================

-- Tabla: ingresos_externos
CREATE TABLE ingresos_externos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL,
    n_documento VARCHAR(50) NOT NULL,
    empresa_servicio VARCHAR(255),
    motivo TEXT,
    fecha_hora_ingreso TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_hora_salida TIMESTAMP,
    registrado_por UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ingresos_externos_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_ingresos_externos_registrado FOREIGN KEY (registrado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_documento_externo CHECK (tipo_documento IN ('CC', 'CE', 'PA', 'TI', 'otro')),
    CONSTRAINT chk_fecha_salida_externa CHECK (fecha_hora_salida IS NULL OR fecha_hora_salida >= fecha_hora_ingreso)
);

CREATE INDEX idx_ingresos_externos_tenant ON ingresos_externos(tenant_id, fecha_hora_ingreso DESC);
CREATE INDEX idx_ingresos_externos_documento ON ingresos_externos(tenant_id, n_documento);
CREATE INDEX idx_ingresos_externos_activos ON ingresos_externos(tenant_id) WHERE fecha_hora_salida IS NULL;

COMMENT ON TABLE ingresos_externos IS 'Registro de ingresos y salidas de proveedores, personal de mantenimiento y otros externos sin autorización previa de residente';
COMMENT ON COLUMN ingresos_externos.nombre IS 'Nombre completo de la persona que ingresa';
COMMENT ON COLUMN ingresos_externos.empresa_servicio IS 'Empresa o servicio que representa (ej: Acme Plomería, Domicilios Flash)';
COMMENT ON COLUMN ingresos_externos.motivo IS 'Razón del ingreso (ej: Reparación fuga torre 3, Entrega domicilio)';
COMMENT ON COLUMN ingresos_externos.fecha_hora_salida IS 'NULL indica que la persona aún está dentro del conjunto';

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                        BEFORE UPDATE ON %I 
                        FOR EACH ROW 
                        EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN DEL SCRIPT
-- Total: 42 tablas creadas
-- =====================================================