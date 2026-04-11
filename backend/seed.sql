-- ============================================================
--  HABITARE — SEED COMPLETO
--  Fecha: 2026-03-14
--  Conserva: Brayan Fuquene (e1000000-0000-0000-0000-000000000003)
--            Julian Lopez   (e9000000-0000-0000-0000-000000000001)
-- ============================================================

SET session_replication_role = 'replica';  -- desactiva FK checks

TRUNCATE TABLE
  minutas_sistema, archivos,
  password_reset_codes,
  transacciones_pago, pagos, facturas,
  reservas_zona_comun, horarios_zona_comun, zonas_comunes,
  segmentaciones_comunicado, comunicados,
  eventos_outbox,
  ingresos_externos,
  actualizaciones_incidente, incidentes, tipos_incidente,
  notificaciones,
  paquetes,
  participaciones_rotacion, sorteos_rotacion,
  asignaciones_parqueadero_residente, vehiculos_residentes, parqueaderos_residentes,
  adjuntos_pqrs, mensajes_pqrs, pqrs, categorias_pqrs,
  turnos,
  pago_suscripcion, suscripciones, planes,
  parqueaderos_visitantes, ingreso_visita,
  vehiculo_visitante, autorizacion_visitas, visitantes,
  tenant_usuario, rol_permiso, permisos,
  unidades, torres, tenants,
  roles,
  usuarios
CASCADE;

SET session_replication_role = 'origin';

-- ============================================================
-- 1. USUARIOS
-- ============================================================
-- Hash para "EquisDe20." → $2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2
-- Hash Brayan (original) → $2b$12$7KR3VqAjW.WtsVx0Pz1BReEVToFBsZiSNDtXR1EvfEr4DBksZA4wu
-- Hash Julian (original) → $2b$12$veUJ2TePgTX5w4g0YegKSu1imPocg3sPISJlzAzl9ffvDvj4VXylG

INSERT INTO usuarios (id, email, password, nombre, apellido, tipo_documento, n_documento, telefono, is_activo, email_verificado, created_at, updated_at) VALUES
  -- Superadmin
  ('e1000000-0000-0000-0000-000000000010', 'superadmin@habitare.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Sebastián', 'Fuquene', 'CC', '1000000001', '+573101000001', true, true,
   NOW() - INTERVAL '90 days', NOW() - INTERVAL '1 day'),

  -- Administración
  ('e1000000-0000-0000-0000-000000000001', 'carlos.gonzalez@torresdelparque.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Carlos', 'González', 'CC', '79845632', '+573114521890', true, true,
   NOW() - INTERVAL '80 days', NOW() - INTERVAL '2 days'),

  ('e1000000-0000-0000-0000-000000000002', 'ana.torres@torresdelparque.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Ana', 'Torres', 'CC', '52963147', '+573124785963', true, true,
   NOW() - INTERVAL '75 days', NOW() - INTERVAL '3 days'),

  -- Brayan Fuquene (RESIDENTE) — PRESERVADO
  ('e1000000-0000-0000-0000-000000000003', 'sfuquene20@gmail.com',
   '$2b$12$7KR3VqAjW.WtsVx0Pz1BReEVToFBsZiSNDtXR1EvfEr4DBksZA4wu',
   'Brayan', 'Fuquene', 'CC', '1006789456', '+573208745632', true, true,
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 hour'),

  -- Residentes adicionales
  ('e1000000-0000-0000-0000-000000000004', 'maria.rodriguez@gmail.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'María', 'Rodríguez', 'CC', '52147896', '+573112345678', true, true,
   NOW() - INTERVAL '55 days', NOW() - INTERVAL '4 days'),

  ('e1000000-0000-0000-0000-000000000005', 'felipe.morales@gmail.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Felipe', 'Morales', 'CC', '80345621', '+573187654321', true, true,
   NOW() - INTERVAL '50 days', NOW() - INTERVAL '5 days'),

  ('e1000000-0000-0000-0000-000000000006', 'laura.castillo@gmail.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Laura', 'Castillo', 'CC', '1019876543', '+573196543210', true, true,
   NOW() - INTERVAL '45 days', NOW() - INTERVAL '6 days'),

  ('e1000000-0000-0000-0000-000000000007', 'pedro.vargas@gmail.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Pedro', 'Vargas', 'CC', '80741258', '+573152468135', true, true,
   NOW() - INTERVAL '40 days', NOW() - INTERVAL '7 days'),

  -- Seguridad adicional
  ('e1000000-0000-0000-0000-000000000008', 'andrea.perez@torresdelparque.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Andrea', 'Pérez', 'CC', '52987654', '+573163214569', true, true,
   NOW() - INTERVAL '35 days', NOW() - INTERVAL '8 hours'),

  -- Recepción
  ('e1000000-0000-0000-0000-000000000009', 'diego.ramirez@torresdelparque.com',
   '$2b$12$hdqET1VejrgVDTv/KInqvu7.H3.1/M9q6Y8caqmKF/GNJm9GUjdq2',
   'Diego', 'Ramírez', 'CC', '1001234567', '+573174569871', true, true,
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '9 hours'),

  -- Julian Lopez (SEGURIDAD) — PRESERVADO
  ('e9000000-0000-0000-0000-000000000001', 'fambroce@gmail.com',
   '$2b$12$veUJ2TePgTX5w4g0YegKSu1imPocg3sPISJlzAzl9ffvDvj4VXylG',
   'Julian', 'Lopez', 'CC', '1000456789', '+573145678912', true, true,
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '2 hours');


-- ============================================================
-- 2. ROLES
-- ============================================================
INSERT INTO roles (id, nombre, descripcion, is_activo, created_at, updated_at) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'ADMINISTRACION',
   'Gestión operativa, financiera y comunicacional del conjunto', true, NOW() - INTERVAL '90 days', NOW()),
  ('d1000000-0000-0000-0000-000000000002', 'RESIDENTE',
   'Personas que habitan una unidad residencial dentro del conjunto', true, NOW() - INTERVAL '90 days', NOW()),
  ('d1000000-0000-0000-0000-000000000003', 'RECEPCION',
   'Personal encargado de atender la entrada principal del conjunto', true, NOW() - INTERVAL '90 days', NOW()),
  ('d1000000-0000-0000-0000-000000000004', 'SEGURIDAD',
   'Personal encargado del control de accesos y vigilancia', true, NOW() - INTERVAL '90 days', NOW()),
  ('d1000000-0000-0000-0000-000000000005', 'SUPERADMIN',
   'Administrador del sistema a nivel plataforma', true, NOW() - INTERVAL '90 days', NOW());


-- ============================================================
-- 3. TENANT
-- ============================================================
INSERT INTO tenants (id, nombre, nit, direccion, telefono, email, is_activo, created_at, updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Conjunto Residencial Torres del Parque',
   '901234567-1',
   'Calle 15 # 8-42, Cajicá, Cundinamarca',
   '+576018765432',
   'admin@torresdelparque.com',
   true,
   NOW() - INTERVAL '90 days',
   NOW() - INTERVAL '1 day');


-- ============================================================
-- 4. PLANES Y SUSCRIPCIÓN
-- ============================================================
INSERT INTO planes (id, nombre, descripcion, precio_mensual, is_activo, created_at, updated_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Básico',
   'Hasta 50 unidades. Módulos: visitantes, paquetes, notificaciones.', 149000.00, true, NOW() - INTERVAL '90 days', NOW()),
  ('f1000000-0000-0000-0000-000000000002', 'Estándar',
   'Hasta 150 unidades. Módulos completos excepto integraciones.', 289000.00, true, NOW() - INTERVAL '90 days', NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'Premium',
   'Unidades ilimitadas. Todos los módulos + integraciones + soporte prioritario.', 499000.00, true, NOW() - INTERVAL '90 days', NOW());

INSERT INTO suscripciones (id, tenant_id, plan_id, fecha_inicio, fecha_fin, estado, created_at, updated_at) VALUES
  ('f2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'f1000000-0000-0000-0000-000000000002',
   CURRENT_DATE - INTERVAL '60 days',
   CURRENT_DATE + INTERVAL '30 days',
   'ACTIVA',
   NOW() - INTERVAL '60 days', NOW());

INSERT INTO pago_suscripcion (id, tenant_id, suscripcion_id, monto, fecha_pago, estado, referencia_pago, created_at, updated_at) VALUES
  ('f3000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'f2000000-0000-0000-0000-000000000001',
   289000.00,
   CURRENT_DATE - INTERVAL '60 days',
   'COMPLETADO',
   'TXN-2026-0114-001',
   NOW() - INTERVAL '60 days', NOW());


-- ============================================================
-- 5. TORRES
-- ============================================================
INSERT INTO torres (id, tenant_id, nombre, n_pisos, created_at, updated_at) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Torre A', 5, NOW() - INTERVAL '90 days', NOW()),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Torre B', 5, NOW() - INTERVAL '90 days', NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Torre C', 4, NOW() - INTERVAL '90 days', NOW());


-- ============================================================
-- 6. UNIDADES
-- ============================================================
INSERT INTO unidades (id, tenant_id, torre_id, numero, tipo, area_m2, piso, habitada, created_at, updated_at) VALUES
  -- Torre A
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', '101', 'APARTAMENTO', 68.50, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', '102', 'APARTAMENTO', 72.00, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', '201', 'APARTAMENTO', 68.50, 2, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', '302', 'APARTAMENTO', 85.00, 3, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', '401', 'APARTAMENTO', 68.50, 4, false, NOW() - INTERVAL '90 days', NOW()),
  -- Torre B
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', '101', 'APARTAMENTO', 70.00, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', '102', 'APARTAMENTO', 70.00, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', '201', 'APARTAMENTO', 80.00, 2, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000002', '301', 'APARTAMENTO', 80.00, 3, false, NOW() - INTERVAL '90 days', NOW()),
  -- Torre C
  ('c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003', '101', 'APARTAMENTO', 65.00, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003', '102', 'APARTAMENTO', 65.00, 1, true, NOW() - INTERVAL '90 days', NOW()),
  ('c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000003', '201', 'APARTAMENTO', 75.00, 2, true, NOW() - INTERVAL '90 days', NOW());


-- ============================================================
-- 7. TENANT_USUARIO (membresías)
--    NOTA: Seguridad y Recepción no tienen unidad_id obligatorio.
--    Usamos NULL via SET NULL FK — pero la columna tiene NOT NULL.
--    Los asignamos a la unidad 101 Torre A (c1000000-...-001) como
--    placeholder para staff sin unidad propia.
-- ============================================================
INSERT INTO tenant_usuario (id, usuario_id, tenant_id, unidad_id, rol_id, is_activa, fecha_inicio, created_at, updated_at) VALUES
  -- Superadmin
  ('10000000-0000-0000-0000-000000000010',
   'e1000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000005',
   true, CURRENT_DATE - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW()),

  -- Administración
  ('10000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   true, CURRENT_DATE - INTERVAL '80 days', NOW() - INTERVAL '80 days', NOW()),

  ('10000000-0000-0000-0000-000000000002',
   'e1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   true, CURRENT_DATE - INTERVAL '75 days', NOW() - INTERVAL '75 days', NOW()),

  -- Residentes
  ('10000000-0000-0000-0000-000000000003',  -- Brayan A-302
   'e1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   'd1000000-0000-0000-0000-000000000002',
   true, CURRENT_DATE - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW()),

  ('10000000-0000-0000-0000-000000000004',  -- María A-101
   'e1000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000002',
   true, CURRENT_DATE - INTERVAL '55 days', NOW() - INTERVAL '55 days', NOW()),

  ('10000000-0000-0000-0000-000000000005',  -- Felipe B-201
   'e1000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',
   'd1000000-0000-0000-0000-000000000002',
   true, CURRENT_DATE - INTERVAL '50 days', NOW() - INTERVAL '50 days', NOW()),

  ('10000000-0000-0000-0000-000000000006',  -- Laura B-102
   'e1000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',
   'd1000000-0000-0000-0000-000000000002',
   true, CURRENT_DATE - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW()),

  ('10000000-0000-0000-0000-000000000007',  -- Pedro C-201
   'e1000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',
   'd1000000-0000-0000-0000-000000000002',
   true, CURRENT_DATE - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW()),

  -- Seguridad
  ('10000000-0000-0000-0000-000000000008',  -- Julian Lopez
   'e9000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000004',
   true, CURRENT_DATE - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW()),

  ('10000000-0000-0000-0000-000000000009',  -- Andrea Pérez
   'e1000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000004',
   true, CURRENT_DATE - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW()),

  -- Recepción
  ('10000000-0000-0000-0000-000000000011',  -- Diego Ramírez
   'e1000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000003',
   true, CURRENT_DATE - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW());


-- ============================================================
-- 8. VISITANTES + AUTORIZACIONES + VEHÍCULOS + INGRESOS
-- ============================================================
INSERT INTO visitantes (id, tipo_documento, n_documento, nombre, apellido, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'CC', '52001234', 'Claudia',   'Herrera',   NOW() - INTERVAL '20 days', NOW()),
  ('20000000-0000-0000-0000-000000000002', 'CC', '80654321', 'Andrés',    'Salcedo',   NOW() - INTERVAL '15 days', NOW()),
  ('20000000-0000-0000-0000-000000000003', 'CC', '1020345678','Valentina','Ríos',      NOW() - INTERVAL '10 days', NOW()),
  ('20000000-0000-0000-0000-000000000004', 'CC', '79321456', 'Jorge',     'Medina',    NOW() - INTERVAL '8 days',  NOW()),
  ('20000000-0000-0000-0000-000000000005', 'CC', '52874123', 'Patricia',  'Suárez',    NOW() - INTERVAL '5 days',  NOW()),
  ('20000000-0000-0000-0000-000000000006', 'CE', '123456789','Alessandro','Ferrara',   NOW() - INTERVAL '3 days',  NOW()),
  ('20000000-0000-0000-0000-000000000007', 'CC', '1015678901','Sofía',    'Bermúdez',  NOW() - INTERVAL '2 days',  NOW());

-- Autorizaciones de visita
INSERT INTO autorizacion_visitas (id, tenant_id, unidad_id, visitante_id, autorizado_por, fecha_visita, requiere_parqueadero, estado, created_at, updated_at) VALUES
  -- Brayan autoriza a Claudia (hoy)
  ('30000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   CURRENT_DATE, false, 'ACTIVA',
   NOW() - INTERVAL '1 day', NOW()),

  -- María autoriza a Andrés (mañana, con parqueadero)
  ('30000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'e1000000-0000-0000-0000-000000000004',
   CURRENT_DATE + INTERVAL '1 day', true, 'PENDIENTE',
   NOW() - INTERVAL '6 hours', NOW()),

  -- Felipe autoriza a Valentina (hoy, utilizada)
  ('30000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',
   '20000000-0000-0000-0000-000000000003',
   'e1000000-0000-0000-0000-000000000005',
   CURRENT_DATE, false, 'UTILIZADA',
   NOW() - INTERVAL '3 hours', NOW()),

  -- Laura autoriza a Jorge (pasada)
  ('30000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',
   '20000000-0000-0000-0000-000000000004',
   'e1000000-0000-0000-0000-000000000006',
   CURRENT_DATE - INTERVAL '5 days', false, 'VENCIDA',
   NOW() - INTERVAL '6 days', NOW()),

  -- Brayan autoriza a Patricia (pasado mañana)
  ('30000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000005',
   'e1000000-0000-0000-0000-000000000003',
   CURRENT_DATE + INTERVAL '2 days', true, 'PENDIENTE',
   NOW() - INTERVAL '1 hour', NOW()),

  -- Pedro autoriza a Alessandro (hoy, cancelada)
  ('30000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',
   '20000000-0000-0000-0000-000000000006',
   'e1000000-0000-0000-0000-000000000007',
   CURRENT_DATE, false, 'CANCELADA',
   NOW() - INTERVAL '2 hours', NOW()),

  -- María autoriza a Sofía (próxima semana)
  ('30000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000007',
   'e1000000-0000-0000-0000-000000000004',
   CURRENT_DATE + INTERVAL '5 days', false, 'PENDIENTE',
   NOW() - INTERVAL '30 minutes', NOW());

-- Vehículo del visitante Andrés
INSERT INTO vehiculo_visitante (id, tenant_id, autorizacion_id, tipo, placa, marca, modelo, color, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000002',
   'AUTOMOVIL', 'ABC-123', 'Chevrolet', 'Spark', 'Gris',
   NOW() - INTERVAL '6 hours', NOW());

-- Vehículo de Patricia
INSERT INTO vehiculo_visitante (id, tenant_id, autorizacion_id, tipo, placa, marca, modelo, color, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000005',
   'MOTOCICLETA', 'XYZ-789', 'Yamaha', 'FZ', 'Rojo',
   NOW() - INTERVAL '1 hour', NOW());

-- Ingreso de visita (Valentina entró hoy)
INSERT INTO ingreso_visita (id, tenant_id, autorizacion_id, visitante_id, registrado_por, fecha_hora_ingreso, created_at, updated_at) VALUES
  ('50000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000003',
   'e9000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW()),

  ('50000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', NOW());


-- ============================================================
-- 9. PARQUEADEROS VISITANTES
-- ============================================================
INSERT INTO parqueaderos_visitantes (id, tenant_id, ingreso_visita_id, numero, tipo_vehiculo, placa, fecha_hora_asignacion, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000001',
   'V-03', 'carro', 'BDF-456',
   NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW());


-- ============================================================
-- 10. PAQUETES
-- ============================================================
INSERT INTO paquetes (id, tenant_id, unidad_id, recibido_por, entregado_por, fecha_recepcion, fecha_entrega, estado, created_at, updated_at) VALUES
  -- Paquete pendiente para Brayan (A-302)
  ('70000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   'e1000000-0000-0000-0000-000000000009',  -- Diego recibió
   NULL, NOW() - INTERVAL '3 hours', NULL, 'PENDIENTE',
   NOW() - INTERVAL '3 hours', NOW()),

  -- Paquete entregado para María (A-101)
  ('70000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000009',
   'e1000000-0000-0000-0000-000000000009',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours', 'ENTREGADO',
   NOW() - INTERVAL '1 day', NOW()),

  -- Paquete pendiente para Laura (B-102)
  ('70000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',
   'e1000000-0000-0000-0000-000000000009',
   NULL, NOW() - INTERVAL '5 hours', NULL, 'PENDIENTE',
   NOW() - INTERVAL '5 hours', NOW()),

  -- Paquete retirado para Felipe (B-201)
  ('70000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',
   'e1000000-0000-0000-0000-000000000009',
   'e1000000-0000-0000-0000-000000000009',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'RETIRADO',
   NOW() - INTERVAL '2 days', NOW()),

  -- Paquete pendiente para Pedro (C-201)
  ('70000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',
   'e9000000-0000-0000-0000-000000000001',
   NULL, NOW() - INTERVAL '1 hour', NULL, 'PENDIENTE',
   NOW() - INTERVAL '1 hour', NOW());


-- ============================================================
-- 11. COMUNICADOS
-- ============================================================
INSERT INTO comunicados (id, tenant_id, autor_id, titulo, contenido, tipo, estado, fecha_publicacion, created_at, updated_at) VALUES
  ('80000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'Mantenimiento programado ascensores Torre B',
   'Estimados residentes,\n\nInformamos que el día ' || TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'DD/MM/YYYY') || ' se realizará mantenimiento preventivo en los ascensores de la Torre B entre las 8:00 AM y las 12:00 PM. Durante este tiempo el servicio estará suspendido.\n\nAgradecemos su comprensión.\n\nAdministración',
   'MANTENIMIENTO', 'PUBLICADO', NOW() - INTERVAL '2 days',
   NOW() - INTERVAL '2 days', NOW()),

  ('80000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'Asamblea General Ordinaria de Copropietarios',
   'Se convoca a todos los propietarios del Conjunto Residencial Torres del Parque a la Asamblea General Ordinaria que se realizará el día ' || TO_CHAR(CURRENT_DATE + INTERVAL '15 days', 'DD/MM/YYYY') || ' a las 7:00 PM en el Salón Social.\n\nAgenda:\n1. Presentación de estados financieros 2025\n2. Presupuesto 2026\n3. Elección del Consejo de Administración\n4. Varios\n\nSu asistencia es fundamental.',
   'EVENTO', 'PUBLICADO', NOW() - INTERVAL '5 days',
   NOW() - INTERVAL '5 days', NOW()),

  ('80000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000002',
   'Restricción de ingreso de mascotas a zonas comunes',
   'Recordamos a todos los residentes que según el reglamento interno de propiedad horizontal, queda prohibido el ingreso de mascotas al Salón Social, la Piscina y la cancha deportiva. Las mascotas deben circular siempre con correa por las zonas verdes.\n\nAgradecemos el cumplimiento de esta norma para la convivencia de todos.',
   'INFORMATIVO', 'PUBLICADO', NOW() - INTERVAL '10 days',
   NOW() - INTERVAL '10 days', NOW()),

  ('80000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'Corte de agua programado Torre A y Torre C',
   'Por trabajos de mantenimiento en la red hidráulica, el día de mañana habrá suspensión del servicio de agua en las Torres A y C entre las 6:00 AM y las 2:00 PM. Se recomienda almacenar agua con anticipación.',
   'URGENTE', 'PUBLICADO', NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day', NOW()),

  ('80000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000002',
   'Campaña de reciclaje en el conjunto',
   'A partir del próximo lunes implementaremos una campaña de reciclaje. Se instalarán puntos ecológicos en cada torre. Los horarios para depositar residuos serán de lunes a sábado de 7:00 AM a 8:00 PM. Contamos con su participación activa.',
   'INFORMATIVO', 'BORRADOR',
   NULL, NOW() - INTERVAL '3 hours', NOW());

-- Segmentaciones (todos los comunicados van para todos)
INSERT INTO segmentaciones_comunicado (id, comunicado_id, tipo, created_at) VALUES
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'TODOS', NOW() - INTERVAL '2 days'),
  ('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000002', 'TODOS', NOW() - INTERVAL '5 days'),
  ('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000003', 'TODOS', NOW() - INTERVAL '10 days'),
  ('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000004', 'TODOS', NOW() - INTERVAL '1 day');


-- ============================================================
-- 12. TIPOS DE INCIDENTE + INCIDENTES
-- ============================================================
INSERT INTO tipos_incidente (id, tenant_id, nombre, descripcion, created_at, updated_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'Acceso no autorizado', 'Ingreso de personas sin autorización al conjunto', NOW() - INTERVAL '90 days', NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'Ruido excesivo', 'Perturbación de la convivencia por ruidos fuera del horario permitido', NOW() - INTERVAL '90 days', NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'Daño en infraestructura', 'Daños a bienes comunes o privados del conjunto', NOW() - INTERVAL '90 days', NOW()),
  ('a0000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   'Emergencia médica', 'Situación de salud que requiere atención urgente', NOW() - INTERVAL '90 days', NOW()),
  ('a0000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
   'Hurto o intento de hurto', 'Sustracción o intento de sustracción de bienes', NOW() - INTERVAL '90 days', NOW()),
  ('a0000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001',
   'Mal uso de zonas comunes', 'Uso inapropiado o irresponsable de los espacios compartidos', NOW() - INTERVAL '90 days', NOW());

INSERT INTO incidentes (id, tenant_id, tipo_id, unidad_id, reportado_por, titulo, descripcion, ubicacion, estado, severidad, numero_radicado, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000006',
   'e1000000-0000-0000-0000-000000000004',  -- María reporta
   'Música a alto volumen en Torre B 101',
   'Desde las 11 PM se escucha música muy alta proveniente del apto 101 de Torre B. Ya se ha solicitado bajar el volumen sin resultado.',
   'Torre B - Apto 101', 'EN_ATENCION', 'MEDIA', 'INC-2026-001',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  ('b0000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000003',
   NULL,
   'e9000000-0000-0000-0000-000000000001',  -- Julian reporta
   'Luminaria dañada en zona de parqueaderos',
   'La luminaria del sector norte del parqueadero lleva 3 días sin funcionar, generando una zona de oscuridad que puede ser un riesgo.',
   'Parqueadero norte', 'REPORTADO', 'ALTA', 'INC-2026-002',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  ('b0000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   NULL,
   'e9000000-0000-0000-0000-000000000001',
   'Persona desconocida en zona restringida',
   'Se observó una persona merodeando en la zona de cuartos técnicos sin identificación visible. Al ser interrogada, no dio razones claras de su presencia y se retiró.',
   'Cuartos técnicos - Sótano', 'CERRADO', 'ALTA', 'INC-2026-003',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),

  ('b0000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000006',
   NULL,
   'e1000000-0000-0000-0000-000000000003',  -- Brayan reporta
   'Niños jugando fútbol en salón social sin reserva',
   'Un grupo de niños está utilizando el salón social para jugar fútbol con balones, lo que puede causar daños al mobiliario. No tienen reserva activa.',
   'Salón Social', 'REPORTADO', 'BAJA', 'INC-2026-004',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  ('b0000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000005',
   'c1000000-0000-0000-0000-000000000004',
   'e1000000-0000-0000-0000-000000000003',  -- Brayan reporta
   'Intento de hurto en parqueadero',
   'Al revisar mi vehículo encontré el vidrio trasero rayado y señales de que intentaron abrir la puerta. Solicito revisión de cámaras del parqueadero.',
   'Parqueadero Torre A', 'REPORTADO', 'CRITICA', 'INC-2026-005',
   NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- Actualizaciones de incidente
INSERT INTO actualizaciones_incidente (id, incidente_id, usuario_id, descripcion, created_at) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'Se habló con el residente. Indicó que tiene visita y prometió bajar el volumen.', NOW() - INTERVAL '1 day'),

  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000003',
   'e9000000-0000-0000-0000-000000000001',
   'Se revisó el área. La persona fue identificada como técnico de mantenimiento contratado sin haber notificado a portería. Situación resuelta.', NOW() - INTERVAL '5 days'),

  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000005',
   'e1000000-0000-0000-0000-000000000001',
   'Se revisaron cámaras de seguridad. Se identificó un sospechoso. Se elevó el reporte a las autoridades locales.', NOW() - INTERVAL '4 hours');


-- ============================================================
-- 13. ZONAS COMUNES + HORARIOS + RESERVAS
-- ============================================================
INSERT INTO zonas_comunes (id, tenant_id, nombre, descripcion, capacidad_maxima, requiere_aprobacion, is_activa, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'Salón Social', 'Espacio para eventos sociales y reuniones de residentes. Cuenta con mesas, sillas, cocina básica y TV.',
   80, true, true, NOW() - INTERVAL '90 days', NOW()),

  ('d0000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'Zona BBQ', 'Área al aire libre con parrillas y mesas. Ideal para asados y reuniones familiares.',
   30, false, true, NOW() - INTERVAL '90 days', NOW()),

  ('d0000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'Cancha Deportiva', 'Cancha múltiple para fútbol de salón, microfútbol y básquetbol.',
   20, false, true, NOW() - INTERVAL '90 days', NOW()),

  ('d0000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'Piscina', 'Piscina adultos y zona de niños. Incluye cambiadores y duchas.',
   40, false, true, NOW() - INTERVAL '90 days', NOW());

-- Horarios (lunes a domingo para todas las zonas)
INSERT INTO horarios_zona_comun (id, zona_comun_id, dia_semana, hora_inicio, hora_fin, created_at, updated_at) VALUES
  -- Salón Social: L-V 6PM-11PM, Sáb-Dom 10AM-11PM
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'LUNES',    '18:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'MARTES',   '18:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'MIERCOLES','18:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'JUEVES',   '18:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'VIERNES',  '18:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'SABADO',   '10:00', '23:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', 'DOMINGO',  '10:00', '22:00', NOW(), NOW()),

  -- Zona BBQ: Sáb-Dom 9AM-8PM, Viernes 3PM-8PM
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 'VIERNES',  '15:00', '20:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002', 'SABADO',   '09:00', '20:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000002', 'DOMINGO',  '09:00', '18:00', NOW(), NOW()),

  -- Cancha: L-V 6AM-10PM, Sáb-Dom 7AM-9PM
  ('e0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000003', 'LUNES',    '06:00', '22:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000003', 'MARTES',   '06:00', '22:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000003', 'MIERCOLES','06:00', '22:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000003', 'JUEVES',   '06:00', '22:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000003', 'VIERNES',  '06:00', '22:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000003', 'SABADO',   '07:00', '21:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000003', 'DOMINGO',  '07:00', '21:00', NOW(), NOW()),

  -- Piscina: Mar-Dom 8AM-6PM
  ('e0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000004', 'MARTES',   '08:00', '18:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000004', 'MIERCOLES','08:00', '18:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000004', 'JUEVES',   '08:00', '18:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000004', 'VIERNES',  '08:00', '18:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000004', 'SABADO',   '08:00', '18:00', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000004', 'DOMINGO',  '08:00', '16:00', NOW(), NOW());

-- Reservas de zonas comunes (futuras)
INSERT INTO reservas_zona_comun (id, tenant_id, zona_comun_id, unidad_id, usuario_id, fecha_reserva, hora_inicio, hora_fin, n_asistentes, observaciones, estado, created_at, updated_at) VALUES
  -- Brayan reserva Salón Social sábado próximo
  ('f0000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',
   'e1000000-0000-0000-0000-000000000003',
   CURRENT_DATE + INTERVAL '6 days', '18:00', '22:00', 35,
   'Cumpleaños familiar. Se requieren 5 mesas redondas.', 'PENDIENTE',
   NOW() - INTERVAL '2 days', NOW()),

  -- Felipe reserva Zona BBQ este domingo
  ('f0000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000008',
   'e1000000-0000-0000-0000-000000000005',
   CURRENT_DATE + INTERVAL '2 days', '11:00', '15:00', 12,
   'Asado familiar', 'CONFIRMADA',
   NOW() - INTERVAL '3 days', NOW()),

  -- María reserva Cancha mañana
  ('f0000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000003',
   'c1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000004',
   CURRENT_DATE + INTERVAL '1 day', '07:00', '08:00', 10,
   NULL, 'CONFIRMADA',
   NOW() - INTERVAL '1 day', NOW()),

  -- Laura reserva Piscina esta semana
  ('f0000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000004',
   'c1000000-0000-0000-0000-000000000007',
   'e1000000-0000-0000-0000-000000000006',
   CURRENT_DATE + INTERVAL '3 days', '10:00', '12:00', 6,
   'Visita con familia', 'CONFIRMADA',
   NOW() - INTERVAL '1 day', NOW()),

  -- Pedro reserva Salón Social la semana siguiente
  ('f0000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'd0000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',
   'e1000000-0000-0000-0000-000000000007',
   CURRENT_DATE + INTERVAL '8 days', '19:00', '23:00', 50,
   'Reunión de copropietarios Torre C', 'PENDIENTE',
   NOW() - INTERVAL '12 hours', NOW());


-- ============================================================
-- 14. PARQUEADEROS DE RESIDENTES + VEHÍCULOS + ASIGNACIONES
-- ============================================================
INSERT INTO parqueaderos_residentes (id, tenant_id, numero, tipo, nivel, created_at, updated_at) VALUES
  ('11000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'R-01', 'CUBIERTO',    1, NOW() - INTERVAL '90 days', NOW()),
  ('11000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'R-02', 'CUBIERTO',    1, NOW() - INTERVAL '90 days', NOW()),
  ('11000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'R-03', 'CUBIERTO',    1, NOW() - INTERVAL '90 days', NOW()),
  ('11000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'R-04', 'DESCUBIERTO', NULL, NOW() - INTERVAL '90 days', NOW()),
  ('11000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'R-05', 'DESCUBIERTO', NULL, NOW() - INTERVAL '90 days', NOW()),
  ('11000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'R-06', 'CUBIERTO',    2, NOW() - INTERVAL '90 days', NOW());

INSERT INTO vehiculos_residentes (id, tenant_id, unidad_id, tipo, placa, marca, modelo, color, created_at, updated_at) VALUES
  ('22000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',  -- Brayan A-302
   'AUTOMOVIL', 'EKF-523', 'Mazda', '3', 'Blanco', NOW() - INTERVAL '60 days', NOW()),
  ('22000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',  -- María A-101
   'AUTOMOVIL', 'NKJ-741', 'Toyota', 'Corolla', 'Negro', NOW() - INTERVAL '55 days', NOW()),
  ('22000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',  -- Felipe B-201
   'AUTOMOVIL', 'PRX-302', 'Renault', 'Logan', 'Plata', NOW() - INTERVAL '50 days', NOW()),
  ('22000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',  -- Laura B-102
   'MOTOCICLETA', 'GTR-180', 'Honda', 'CB190', 'Azul', NOW() - INTERVAL '45 days', NOW()),
  ('22000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',  -- Pedro C-201
   'AUTOMOVIL', 'CKP-885', 'Kia', 'Picanto', 'Rojo', NOW() - INTERVAL '40 days', NOW());

INSERT INTO asignaciones_parqueadero_residente (id, tenant_id, parqueadero_id, unidad_id, is_activa, fecha_inicio, created_at, updated_at) VALUES
  ('33000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   '11000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',  -- Brayan → R-01
   true, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW()),
  ('33000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   '11000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',  -- María → R-02
   true, NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days', NOW()),
  ('33000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   '11000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000008',  -- Felipe → R-03
   true, NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days', NOW()),
  ('33000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   '11000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000012',  -- Pedro → R-05
   true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW());


-- ============================================================
-- 15. FACTURACIÓN
-- ============================================================
INSERT INTO facturas (id, tenant_id, unidad_id, numero_factura, periodo, fecha_emision, fecha_vencimiento, monto_total, descripcion, estado, created_at, updated_at) VALUES
  -- Marzo 2026 — unidades habitadas
  ('fa000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',  -- Brayan A-302
   'FAC-2026-0301', 'Marzo 2026', '2026-03-01', '2026-03-15', 320000.00,
   'Administración mensual + fondo de imprevistos', 'PENDIENTE', NOW() - INTERVAL '13 days', NOW()),

  ('fa000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',  -- María A-101
   'FAC-2026-0302', 'Marzo 2026', '2026-03-01', '2026-03-15', 285000.00,
   'Administración mensual', 'PAGADA', NOW() - INTERVAL '13 days', NOW()),

  ('fa000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',  -- Felipe B-201
   'FAC-2026-0303', 'Marzo 2026', '2026-03-01', '2026-03-15', 305000.00,
   'Administración mensual', 'PENDIENTE', NOW() - INTERVAL '13 days', NOW()),

  ('fa000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000007',  -- Laura B-102
   'FAC-2026-0304', 'Marzo 2026', '2026-03-01', '2026-03-15', 285000.00,
   'Administración mensual', 'PAGADA', NOW() - INTERVAL '13 days', NOW()),

  ('fa000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',  -- Pedro C-201
   'FAC-2026-0305', 'Marzo 2026', '2026-03-01', '2026-03-15', 295000.00,
   'Administración mensual', 'VENCIDA', NOW() - INTERVAL '13 days', NOW()),

  -- Febrero 2026
  ('fa000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',  -- Brayan
   'FAC-2026-0201', 'Febrero 2026', '2026-02-01', '2026-02-15', 320000.00,
   'Administración mensual', 'PAGADA', NOW() - INTERVAL '42 days', NOW()),

  ('fa000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',  -- Felipe
   'FAC-2026-0202', 'Febrero 2026', '2026-02-01', '2026-02-15', 305000.00,
   'Administración mensual', 'PAGADA', NOW() - INTERVAL '42 days', NOW()),

  ('fa000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',  -- Pedro
   'FAC-2026-0203', 'Febrero 2026', '2026-02-01', '2026-02-15', 295000.00,
   'Administración mensual', 'VENCIDA', NOW() - INTERVAL '42 days', NOW());

-- Pagos
INSERT INTO pagos (id, tenant_id, factura_id, unidad_id, monto, fecha_pago, metodo_pago, referencia, estado, created_at, updated_at) VALUES
  ('55000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
   'fa000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   285000.00, '2026-03-05', 'TRANSFERENCIA', 'TXF-20260305-M101', 'APROBADO',
   NOW() - INTERVAL '9 days', NOW()),

  ('55000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
   'fa000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000007',
   285000.00, '2026-03-07', 'TRANSFERENCIA', 'TXF-20260307-B102', 'APROBADO',
   NOW() - INTERVAL '7 days', NOW()),

  ('55000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   'fa000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004',
   320000.00, '2026-02-10', 'EFECTIVO', NULL, 'APROBADO',
   NOW() - INTERVAL '33 days', NOW()),

  ('55000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
   'fa000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000008',
   305000.00, '2026-02-12', 'TRANSFERENCIA', 'TXF-20260212-B201', 'APROBADO',
   NOW() - INTERVAL '31 days', NOW());


-- ============================================================
-- 16. PQRS
-- ============================================================
INSERT INTO categorias_pqrs (id, nombre, descripcion, is_activa, created_at, updated_at) VALUES
  ('66000000-0000-0000-0000-000000000001', 'Convivencia',
   'Problemas relacionados con la convivencia entre residentes', true, NOW() - INTERVAL '90 days', NOW()),
  ('66000000-0000-0000-0000-000000000002', 'Infraestructura',
   'Daños, fallas o mejoras en la infraestructura del conjunto', true, NOW() - INTERVAL '90 days', NOW()),
  ('66000000-0000-0000-0000-000000000003', 'Servicios',
   'Calidad de los servicios de administración y mantenimiento', true, NOW() - INTERVAL '90 days', NOW()),
  ('66000000-0000-0000-0000-000000000004', 'Seguridad',
   'Aspectos relacionados con la seguridad del conjunto', true, NOW() - INTERVAL '90 days', NOW()),
  ('66000000-0000-0000-0000-000000000005', 'Facturación',
   'Dudas o inconformidades sobre cobros y facturación', true, NOW() - INTERVAL '90 days', NOW());

INSERT INTO pqrs (id, tenant_id, unidad_id, tipo, categoria_id, radicado_por, asunto, descripcion, estado, prioridad, numero_radicado, created_at, updated_at) VALUES
  ('77000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000004',  -- Brayan
   'QUEJA', '66000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Ruido excesivo los fines de semana en Torre B',
   'Todos los fines de semana, especialmente el sábado, los residentes del piso 1 de Torre B realizan fiestas que superan las 12 AM con música a alto volumen. Solicito intervención de la administración.',
   'EN_PROCESO', 'ALTA', 'PQR-2026-001',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),

  ('77000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',  -- María
   'PETICION', '66000000-0000-0000-0000-000000000002',
   'e1000000-0000-0000-0000-000000000004',
   'Solicitud de reparación de grifo en zona de lavandería',
   'El grifo de la zona de lavandería del piso 1 de Torre A lleva más de dos semanas goteando. Solicito reparación urgente para evitar desperdicio de agua y daños adicionales.',
   'ABIERTA', 'MEDIA', 'PQR-2026-002',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  ('77000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000012',  -- Pedro
   'RECLAMO', '66000000-0000-0000-0000-000000000005',
   'e1000000-0000-0000-0000-000000000007',
   'Cobro incorrecto en factura de febrero',
   'En mi factura de febrero 2026 aparece un cobro adicional de $45.000 por concepto de multa que no me fue notificado previamente. Solicito revisión y ajuste de la factura.',
   'RESUELTA', 'MEDIA', 'PQR-2026-003',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),

  ('77000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000008',  -- Felipe
   'SUGERENCIA', '66000000-0000-0000-0000-000000000003',
   'e1000000-0000-0000-0000-000000000005',
   'Implementar WiFi en zonas comunes',
   'Sería muy conveniente contar con red WiFi en el Salón Social y la zona de descanso. Esto mejoraría la experiencia de los residentes durante eventos y reuniones de trabajo remoto.',
   'ABIERTA', 'BAJA', 'PQR-2026-004',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

INSERT INTO mensajes_pqrs (id, pqrs_id, autor_id, contenido, is_interno, created_at) VALUES
  ('88000000-0000-0000-0000-000000000001',
   '77000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'Gracias por su reporte. Hemos notificado al residente involucrado y realizaremos seguimiento durante los próximos fines de semana.',
   false, NOW() - INTERVAL '8 days'),

  ('88000000-0000-0000-0000-000000000002',
   '77000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Gracias por la respuesta. El sábado pasado volvió a repetirse la situación. Espero que se tome una medida más contundente.',
   false, NOW() - INTERVAL '2 days'),

  ('88000000-0000-0000-0000-000000000003',
   '77000000-0000-0000-0000-000000000003',
   'e1000000-0000-0000-0000-000000000002',
   'Revisada la situación, el cobro correspondía a una multa por uso incorrecto del parqueadero el mes pasado. Se adjuntó soporte. Sin embargo, al revisar el proceso de notificación identificamos una falla y se hace el ajuste.',
   false, NOW() - INTERVAL '5 days'),

  ('88000000-0000-0000-0000-000000000004',
   '77000000-0000-0000-0000-000000000003',
   'e1000000-0000-0000-0000-000000000001',
   'Nota interna: Se ajustó la factura FAC-2026-0203. Se emitirá nota crédito por $45.000.',
   true, NOW() - INTERVAL '5 days');


-- ============================================================
-- 17. TURNOS DE SEGURIDAD
-- ============================================================
INSERT INTO turnos (id, tenant_id, usuario_id, tipo, fecha_inicio, fecha_fin, observaciones, created_at, updated_at) VALUES
  -- Julian turno nocturno ayer
  ('99000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'NOCTURNO',
   NOW() - INTERVAL '1 day' + INTERVAL '22 hours',
   NOW() + INTERVAL '6 hours',
   'Turno sin novedades mayores. Se registró ingreso de visitante Valentina Ríos.', NOW() - INTERVAL '1 day', NOW()),

  -- Andrea turno diurno ayer
  ('99000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000008',
   'DIURNO',
   NOW() - INTERVAL '1 day' + INTERVAL '6 hours',
   NOW() - INTERVAL '1 day' + INTERVAL '18 hours',
   'Se atendió incidente de ruido. Se realizó revisión de parqueadero en horas de la mañana.', NOW() - INTERVAL '1 day', NOW()),

  -- Julian turno nocturno hace 2 días
  ('99000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'NOCTURNO',
   NOW() - INTERVAL '3 days' + INTERVAL '22 hours',
   NOW() - INTERVAL '2 days' + INTERVAL '6 hours',
   'Novedad: persona extraña en zona técnica. Reporte enviado a administración.', NOW() - INTERVAL '3 days', NOW()),

  -- Andrea turno mañana
  ('99000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000008',
   'DIURNO',
   NOW() + INTERVAL '6 hours',
   NOW() + INTERVAL '18 hours',
   NULL, NOW(), NOW());


-- ============================================================
-- 18. INGRESOS DE PERSONAL EXTERNO
-- ============================================================
INSERT INTO ingresos_externos (id, tenant_id, registrado_por, tipo_documento, n_documento, nombre, tipo_personal, empresa, motivo, fecha_hora_ingreso, fecha_hora_salida, observaciones, created_at, updated_at) VALUES
  ('aa000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'CC', '80123456', 'Roberto Cárdenas', 'MANTENIMIENTO',
   'TecnoElec S.A.S', 'Revisión del tablero eléctrico de la zona técnica',
   NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '3 hours',
   'Trabajo completado. Se ajustó breaker del circuito 4.', NOW() - INTERVAL '7 days', NOW()),

  ('aa000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000009',
   'CC', '52741258', 'Mónica Salazar', 'LIMPIEZA',
   'Aseo Total Ltda', 'Limpieza profunda de zonas comunes',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '6 hours',
   NULL, NOW() - INTERVAL '2 days', NOW()),

  ('aa000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'CC', '1019234567', 'Alejandro Niño', 'PROVEEDOR',
   'Aguas Cajicá', 'Revisión de medidores de agua',
   NOW() - INTERVAL '4 hours', NULL,
   'En proceso de revisión.', NOW() - INTERVAL '4 hours', NOW());


-- ============================================================
-- 19. NOTIFICACIONES
-- ============================================================
INSERT INTO notificaciones (id, tenant_id, usuario_id, titulo, mensaje, tipo, canal, estado_app, estado_correo, entidad_tipo, entidad_id, created_at) VALUES
  -- Brayan: paquete pendiente
  ('bb000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Paquete en portería', 'Tienes un paquete esperando en portería. Por favor retíralo a la brevedad posible.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'paquete', '70000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '3 hours'),

  -- Brayan: factura pendiente
  ('bb000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Factura de administración pendiente', 'Tu factura de Marzo 2026 por $320.000 está próxima a vencer el 15/03/2026.',
   'ALERTA', 'PUSH', 'ENVIADA', 'PENDIENTE', 'factura', 'fa000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- Brayan: comunicado
  ('bb000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Nuevo comunicado de administración', 'Se publicó un aviso sobre corte de agua programado para mañana.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'comunicado', '80000000-0000-0000-0000-000000000004',
   NOW() - INTERVAL '1 day'),

  -- Brayan: reserva confirmada
  ('bb000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000003',
   'Reserva en revisión', 'Tu reserva del Salón Social está en revisión por la administración.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'reserva', 'f0000000-0000-0000-0000-000000000001',
   NOW() - INTERVAL '2 days'),

  -- Julian: incidente reportado
  ('bb000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'Nueva novedad reportada', 'Intento de hurto en parqueadero — reportado por Brayan Fuquene.',
   'ALERTA', 'PUSH', 'ENVIADA', 'PENDIENTE', 'incidente', 'b0000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '6 hours'),

  -- Julian: incidente de luminaria
  ('bb000000-0000-0000-0000-000000000006',
   'a1000000-0000-0000-0000-000000000001',
   'e9000000-0000-0000-0000-000000000001',
   'Nueva novedad reportada', 'Niños usando el salón social sin reserva.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'incidente', 'b0000000-0000-0000-0000-000000000004',
   NOW() - INTERVAL '1 day'),

  -- Andrea: nuevo paquete
  ('bb000000-0000-0000-0000-000000000007',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000008',
   'Nueva novedad reportada', 'Intento de hurto en parqueadero Torre A. Requiere atención.',
   'URGENTE', 'PUSH', 'ENVIADA', 'PENDIENTE', 'incidente', 'b0000000-0000-0000-0000-000000000005',
   NOW() - INTERVAL '6 hours'),

  -- María: comunicado
  ('bb000000-0000-0000-0000-000000000008',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000004',
   'Paquete en portería', 'Tienes un paquete esperando en portería. Ya fue recogido. Gracias.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'paquete', '70000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '4 hours'),

  -- Felipe: reserva confirmada
  ('bb000000-0000-0000-0000-000000000009',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000005',
   'Reserva confirmada', 'Tu reserva de la Zona BBQ para el ' || TO_CHAR(CURRENT_DATE + INTERVAL '2 days', 'DD/MM/YYYY') || ' fue confirmada.',
   'INFO', 'PUSH', 'ENVIADA', 'PENDIENTE', 'reserva', 'f0000000-0000-0000-0000-000000000002',
   NOW() - INTERVAL '3 days'),

  -- Laura: paquete pendiente
  ('bb000000-0000-0000-0000-000000000010',
   'a1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000006',
   'Paquete en portería', 'Tienes un paquete esperando en portería desde hace 5 horas.',
   'ALERTA', 'PUSH', 'ENVIADA', 'PENDIENTE', 'paquete', '70000000-0000-0000-0000-000000000003',
   NOW() - INTERVAL '5 hours');
