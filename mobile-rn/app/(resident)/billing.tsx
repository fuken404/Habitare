import apiClient from '@/src/core/api/client';
import { C, type BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, BottomNav, Button, Chip, EmptyState } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------- types ----------

interface FacturaListResponse {
  id: string;
  numero_factura: string;
  periodo: string;
  fecha_vencimiento: string;
  monto_total: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'anulada';
  numero_unidad?: string;
  nombre_torre?: string;
}

type Filter = 'todas' | 'pendientes' | 'vencidas' | 'pagadas';

// ---------- constants ----------

const ESTADO_TONE: Record<FacturaListResponse['estado'], BadgeTone> = {
  pendiente: 'warning',
  vencida: 'danger',
  pagada: 'success',
  anulada: 'neutral',
};

const ESTADO_LABEL: Record<FacturaListResponse['estado'], string> = {
  pendiente: 'Pendiente',
  vencida: 'Vencida',
  pagada: 'Pagada',
  anulada: 'Anulada',
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'vencidas', label: 'Vencidas' },
  { key: 'pagadas', label: 'Pagadas' },
];

const NAV_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(resident)/dashboard' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(resident)/visitors' as any) },
  { icon: 'card-outline' as const, label: 'Pagos', onPress: () => router.push('/(resident)/billing' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(resident)/communications' as any) },
  { icon: 'grid-outline' as const, label: 'Más', onPress: () => router.push('/(resident)/more' as any) },
];

// ---------- helpers ----------

function formatCOP(value: string): string {
  return Number(value).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
}

function formatDueDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
  } catch {
    return iso;
  }
}

function applyFilter(facturas: FacturaListResponse[], filter: Filter): FacturaListResponse[] {
  if (filter === 'todas') return facturas;
  if (filter === 'pendientes') return facturas.filter((f) => f.estado === 'pendiente');
  if (filter === 'vencidas') return facturas.filter((f) => f.estado === 'vencida');
  if (filter === 'pagadas') return facturas.filter((f) => f.estado === 'pagada');
  return facturas;
}

/** Sort periods most-recent-first and return as an ordered list of [periodo, items[]] */
function groupByPeriodo(facturas: FacturaListResponse[]): [string, FacturaListResponse[]][] {
  const map = new Map<string, FacturaListResponse[]>();
  for (const f of facturas) {
    const group = map.get(f.periodo) ?? [];
    group.push(f);
    map.set(f.periodo, group);
  }
  // Sort keys descending by the earliest fecha_vencimiento in each group as a proxy for recency
  const entries = Array.from(map.entries());
  entries.sort(([, a], [, b]) => {
    const dateA = a[0]?.fecha_vencimiento ?? '';
    const dateB = b[0]?.fecha_vencimiento ?? '';
    return dateB.localeCompare(dateA);
  });
  return entries;
}

// ---------- sub-components ----------

function InvoiceCard({ item }: { item: FacturaListResponse }) {
  return (
    <View
      style={{
        backgroundColor: C.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.gray200,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: C.gray900 }}>
          {item.numero_factura}
        </Text>
        {(item.nombre_torre || item.numero_unidad) && (
          <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>
            {[item.nombre_torre, item.numero_unidad].filter(Boolean).join(' — Apto ')}
          </Text>
        )}
        <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>
          Vence {formatDueDate(item.fecha_vencimiento)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: C.gray900,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatCOP(item.monto_total)}
        </Text>
        <Badge tone={ESTADO_TONE[item.estado]}>{ESTADO_LABEL[item.estado]}</Badge>
      </View>
    </View>
  );
}

// ---------- screen ----------

export default function BillingScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('todas');

  const { data: facturas = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['facturas'],
    queryFn: () => apiClient.get('/billing/facturas').then((r) => r.data as FacturaListResponse[]),
  });

  // Computed values
  const unpaid = facturas.filter((f) => f.estado !== 'pagada' && f.estado !== 'anulada');
  const saldoTotal = unpaid.reduce((sum, f) => sum + Number(f.monto_total), 0);
  const nextDue = unpaid
    .map((f) => f.fecha_vencimiento)
    .sort()
    .at(0);

  const filtered = applyFilter(facturas, activeFilter);
  const groups = groupByPeriodo(filtered);

  // Dynamic filter labels with counts
  const pendientesCount = facturas.filter((f) => f.estado === 'pendiente').length;
  const vencidasCount = facturas.filter((f) => f.estado === 'vencida').length;
  const filters = FILTERS.map((f) => {
    if (f.key === 'pendientes' && pendientesCount > 0) return { ...f, label: `Pendientes ${pendientesCount}` };
    if (f.key === 'vencidas' && vencidasCount > 0) return { ...f, label: `Vencidas ${vencidasCount}` };
    return f;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Estado de cuenta" />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />
          }
        >
          {/* Saldo card */}
          <View
            style={{
              backgroundColor: C.primary,
              borderRadius: 20,
              padding: 22,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 6 }}>
              Saldo pendiente
            </Text>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#fff',
                letterSpacing: -0.5,
                fontVariant: ['tabular-nums'],
                marginBottom: 10,
              }}
            >
              {Number(saldoTotal).toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              })}
            </Text>
            {nextDue && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  Vence el {formatDueDate(nextDue)}
                </Text>
              </View>
            )}
            <Button variant="onDark" size="md" block={false} onPress={() => {}}>
              Pagar ahora
            </Button>
          </View>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          >
            {filters.map((f) => (
              <Chip key={f.key} active={activeFilter === f.key} onPress={() => setActiveFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </ScrollView>

          {/* Grouped invoice list */}
          {groups.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Sin facturas"
              subtitle="No hay facturas en esta categoría."
            />
          ) : (
            groups.map(([periodo, items]) => (
              <View key={periodo}>
                <Text
                  style={{
                    fontSize: 12,
                    color: C.gray500,
                    fontVariant: ['tabular-nums'],
                    letterSpacing: 0.8,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  {periodo}
                </Text>
                {items.map((item) => (
                  <InvoiceCard key={item.id} item={item} />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <BottomNav items={NAV_ITEMS} active={2} />
    </SafeAreaView>
  );
}
