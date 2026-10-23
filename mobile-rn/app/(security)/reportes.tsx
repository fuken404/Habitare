import apiClient from '@/src/core/api/client';
import { C, type BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, BottomNav, Chip, EmptyState } from '@/src/shared/components';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { icon: 'document-text-outline' as const, label: 'Reportes', onPress: () => router.push('/(security)/reportes' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(security)/visitors' as any) },
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(security)/dashboard' as any) },
  { icon: 'business-outline' as const, label: 'Zonas', onPress: () => router.push('/(security)/common-areas' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(security)/communications' as any) },
];

type Severity = 'todos' | 'baja' | 'media' | 'alta' | 'critica';

interface PqrsItem {
  id: string;
  radicado: string;
  tipo: string;
  asunto: string;
  estado: string;
  severidad?: string;
  ubicacion?: string;
  created_at: string;
}

const SEVERITY_TONE: Record<string, BadgeTone> = {
  baja: 'info',
  media: 'warning',
  alta: 'danger',
  critica: 'danger',
};

const ESTADO_TONE: Record<string, BadgeTone> = {
  abierta: 'warning',
  en_proceso: 'info',
  resuelta: 'success',
  cerrada: 'neutral',
};

const FILTERS: { key: Severity; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'critica', label: 'Critico' },
  { key: 'alta', label: 'Alto' },
  { key: 'media', label: 'Medio' },
  { key: 'baja', label: 'Bajo' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function SecurityReportesScreen() {
  const [filter, setFilter] = useState<Severity>('todos');

  const { data: all = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pqrs'],
    queryFn: () => apiClient.get('/pqrs').then((r) => r.data as PqrsItem[]),
  });

  const incidents = all.filter((p) => p.tipo === 'incidente');
  const filtered = filter === 'todos' ? incidents : incidents.filter((p) => p.severidad === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Reportes" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onPress={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Sin incidentes"
          subtitle="No hay incidentes con este filtro."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />
          }
        >
          {filtered.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: C.white,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: C.gray200,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                {item.severidad ? (
                  <Badge tone={SEVERITY_TONE[item.severidad] ?? 'neutral'}>{item.severidad}</Badge>
                ) : (
                  <Badge tone="neutral">sin severidad</Badge>
                )}
                <Badge tone={ESTADO_TONE[item.estado] ?? 'neutral'}>
                  {item.estado.replace('_', ' ')}
                </Badge>
              </View>
              <Text style={{ fontSize: 12, color: C.gray400, fontVariant: ['tabular-nums'], marginBottom: 4 }}>
                {item.radicado}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }}>{item.asunto}</Text>
              {item.ubicacion ? (
                <Text style={{ fontSize: 12, color: C.gray500, marginTop: 3 }}>{item.ubicacion}</Text>
              ) : null}
              <Text style={{ fontSize: 12, color: C.gray400, marginTop: 6 }}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <BottomNav items={NAV_ITEMS} active={0} />
    </SafeAreaView>
  );
}
