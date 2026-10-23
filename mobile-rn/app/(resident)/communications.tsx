import apiClient from '@/src/core/api/client';
import { C, type BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, BottomNav, Chip, EmptyState } from '@/src/shared/components';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------- types ----------

interface ComunicadoListResponse {
  id: string;
  titulo: string;
  tipo: 'informativo' | 'urgente' | 'evento' | 'mantenimiento';
  estado: 'borrador' | 'publicado' | 'archivado';
  nombre_autor?: string;
  fecha_publicacion?: string;
  created_at: string;
}

type CatFilter = 'todos' | 'urgente' | 'informativo' | 'mantenimiento' | 'evento';

// ---------- constants ----------

const TIPO_TONE: Record<ComunicadoListResponse['tipo'], BadgeTone> = {
  urgente: 'danger',
  mantenimiento: 'warning',
  evento: 'info',
  informativo: 'info',
};

const TIPO_LABEL: Record<ComunicadoListResponse['tipo'], string> = {
  urgente: 'Urgente',
  mantenimiento: 'Mantenimiento',
  evento: 'Evento',
  informativo: 'Informativo',
};

const FILTERS: { key: CatFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'urgente', label: 'Urgente' },
  { key: 'informativo', label: 'Informativo' },
  { key: 'mantenimiento', label: 'Mantenimiento' },
  { key: 'evento', label: 'Evento' },
];

const NAV_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(resident)/dashboard' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(resident)/visitors' as any) },
  { icon: 'card-outline' as const, label: 'Pagos', onPress: () => router.push('/(resident)/billing' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(resident)/communications' as any) },
  { icon: 'grid-outline' as const, label: 'Más', onPress: () => router.push('/(resident)/more' as any) },
];

// ---------- helpers ----------

function formatRelativeDate(iso?: string): string {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (date.toDateString() === todayStr) {
      return `Hoy ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }
    if (date.toDateString() === yesterdayStr) {
      return 'Ayer';
    }
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

// ---------- sub-components ----------

function CommCard({ item }: { item: ComunicadoListResponse }) {
  const dateStr = formatRelativeDate(item.fecha_publicacion ?? item.created_at);

  return (
    <Pressable
      onPress={() => router.push(`/(resident)/communications/${item.id}` as any)}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View
        style={{
          backgroundColor: C.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.gray200,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Badge tone={TIPO_TONE[item.tipo]} dot>
            {TIPO_LABEL[item.tipo]}
          </Badge>
          <Text style={{ fontSize: 12, color: C.gray400 }}>{dateStr}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900, marginTop: 10, lineHeight: 20 }}>
          {item.titulo}
        </Text>
        {item.nombre_autor && (
          <Text style={{ fontSize: 12, color: C.gray400, marginTop: 4 }}>
            {item.nombre_autor}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ---------- screen ----------

export default function CommunicationsScreen() {
  const [activeFilter, setActiveFilter] = useState<CatFilter>('todos');

  const { data: all = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['communications'],
    queryFn: () => apiClient.get('/communications').then((r) => r.data as ComunicadoListResponse[]),
  });

  const published = all.filter((c) => c.estado === 'publicado');
  const filtered =
    activeFilter === 'todos' ? published : published.filter((c) => c.tipo === activeFilter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Comunicados" />

      {/* Chip filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}
      >
        {FILTERS.map((f) => (
          <Chip key={f.key} active={activeFilter === f.key} onPress={() => setActiveFilter(f.key)}>
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
          icon="megaphone-outline"
          title="Sin comunicados"
          subtitle="No hay comunicados publicados en esta categoría."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.primary} />
          }
        >
          {filtered.map((comm) => (
            <CommCard key={comm.id} item={comm} />
          ))}
        </ScrollView>
      )}

      <BottomNav items={NAV_ITEMS} active={3} />
    </SafeAreaView>
  );
}
