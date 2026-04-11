import { Chip } from '@mui/material';

type ColorMap = Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'>;

const defaultColors: ColorMap = {
  // Generic
  active: 'success',
  inactive: 'default',
  // Visitor
  pending: 'warning',
  inside: 'success',
  exited: 'default',
  // Package
  received: 'info',
  notified: 'warning',
  delivered: 'success',
  // Incident / PQRS
  open: 'error',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
  // Invoice
  paid: 'success',
  overdue: 'error',
  // Reservation
  confirmed: 'success',
  cancelled: 'error',
};

const defaultLabels: Record<string, string> = {
  pending: 'Pendiente',
  inside: 'Adentro',
  exited: 'Salió',
  received: 'Recibido',
  notified: 'Notificado',
  delivered: 'Entregado',
  open: 'Abierto',
  in_progress: 'En proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  paid: 'Pagado',
  overdue: 'Vencido',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  active: 'Activo',
  inactive: 'Inactivo',
};

interface StatusChipProps {
  status: string;
  label?: string;
  colorMap?: ColorMap;
  labelMap?: Record<string, string>;
}

export function StatusChip({ status, label, colorMap, labelMap }: StatusChipProps) {
  const colors = { ...defaultColors, ...colorMap };
  const labels = { ...defaultLabels, ...labelMap };
  const color = colors[status] ?? 'default';
  const text = label ?? labels[status] ?? status;

  return <Chip label={text} color={color} size="small" sx={{ fontWeight: 500 }} />;
}
