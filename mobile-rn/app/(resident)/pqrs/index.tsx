import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Badge, Card, EmptyState } from '@/src/shared/components';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ESTADO_TONE: Record<string, BadgeTone> = {
  abierta: 'primary',
  en_proceso: 'warning',
  cerrada: 'neutral',
  rechazada: 'danger',
};

const TIPO_LABEL: Record<string, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
  incidente: 'Incidente',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function PqrsListScreen() {
  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['pqrs'],
    queryFn: () => apiClient.get('/pqrs').then(r => r.data as any[]),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="PQRS" back />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Sin PQRS radicadas"
          subtitle="Radica tu primera petición, queja o reclamo."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        >
          {items.map((item: any) => (
            <Card key={item.id} onPress={() => router.push(`/(resident)/pqrs/${item.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Badge tone={ESTADO_TONE[item.estado] ?? 'neutral'}>
                  {item.estado?.replace('_', ' ') ?? item.estado}
                </Badge>
                <Text style={{ fontSize: 12, color: C.gray500 }}>{formatDate(item.fecha_creacion)}</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900, marginTop: 8 }} numberOfLines={2}>
                {item.asunto}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: C.gray500, fontVariant: ['tabular-nums'] }}>
                  {item.numero_radicado ?? '—'}
                </Text>
                <Text style={{ fontSize: 12, color: C.gray400 }}>
                  {TIPO_LABEL[item.tipo] ?? item.tipo}
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(resident)/pqrs/new' as any)}
        style={({ pressed }) => [
          {
            position: 'absolute',
            bottom: 36,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            elevation: 6,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}
