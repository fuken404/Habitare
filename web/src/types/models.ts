// ─── Auth ────────────────────────────────────────────────────────────────────
export type UserRole = 'superadmin' | 'administracion' | 'recepcion' | 'seguridad' | 'residente';

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  tenant_id: string;
  unidad_id?: string;
  nombre_conjunto?: string;
  avatar_url?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── Residents ───────────────────────────────────────────────────────────────
export interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id: string;
  unit_number: string;
  tower?: string;
  is_active: boolean;
  created_at: string;
}

// ─── Units ───────────────────────────────────────────────────────────────────
export interface Unit {
  id: string;
  number: string;
  tower?: string;
  floor?: number;
  area_m2?: number;
  is_active: boolean;
  resident_count: number;
}

// ─── Visitors ────────────────────────────────────────────────────────────────
export type VisitorStatus = 'pending' | 'inside' | 'exited';

export interface Visitor {
  id: string;
  full_name: string;
  document_type: string;
  document_number: string;
  unit_id: string;
  unit_number: string;
  authorized_by: string;
  qr_code: string;
  status: VisitorStatus;
  entry_time?: string;
  exit_time?: string;
  created_at: string;
}

// ─── Packages ────────────────────────────────────────────────────────────────
export type PackageStatus = 'received' | 'notified' | 'delivered';

export interface Package {
  id: string;
  tracking_number?: string;
  carrier?: string;
  description?: string;
  unit_id: string;
  unit_number: string;
  resident_name: string;
  status: PackageStatus;
  received_at: string;
  delivered_at?: string;
}

// ─── Visitor Parking ─────────────────────────────────────────────────────────
export interface ParkingSlot {
  id: string;
  code: string;
  tipo: 'carro' | 'moto' | 'mixto';
  is_active: boolean;
  is_ocupado: boolean;
}

export interface ParkingAssignment {
  id: string;
  visitor_id: string;
  visitor_name: string;
  lugar_id: string;
  numero: string;
  tipo: string;
  entry_time: string;
  exit_time?: string;
}

// ─── Common Areas ────────────────────────────────────────────────────────────
export interface CommonArea {
  id: string;
  name: string;
  capacity: number;
  rules?: string;
  is_active: boolean;
}

export interface Reservation {
  id: string;
  area_id: string;
  area_name: string;
  resident_id: string;
  resident_name: string;
  unit_number: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';
export type IncidentPriority = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  unit_id?: string;
  unit_number?: string;
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  unit_id: string;
  unit_number: string;
  resident_name: string;
  amount: number;
  concept: string;
  due_date: string;
  paid_at?: string;
  status: InvoiceStatus;
}

// ─── Communications ──────────────────────────────────────────────────────────
export interface Communication {
  id: string;
  title: string;
  body: string;
  type: 'notice' | 'alert' | 'event';
  created_by: string;
  created_at: string;
  scheduled_at?: string;
}

// ─── PQRS ────────────────────────────────────────────────────────────────────
export type PqrsType = 'petition' | 'complaint' | 'claim' | 'suggestion';
export type PqrsStatus = 'open' | 'in_progress' | 'closed';

export interface Pqrs {
  id: string;
  type: PqrsType;
  subject: string;
  description: string;
  status: PqrsStatus;
  unit_id?: string;
  unit_number?: string;
  submitted_by: string;
  response?: string;
  created_at: string;
  updated_at: string;
}

// ─── Superadmin ──────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  nit?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  plan: 'basic' | 'pro' | 'enterprise';
  created_at: string;
}
