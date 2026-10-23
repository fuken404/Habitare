import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, Button, Card, EmptyState } from '@/src/shared/components';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ESTADO_TONE: Record<string, BadgeTone> = {
  confirmada: 'success',
  pendiente: 'warning',
  cancelada: 'danger',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CommonAreasScreen() {
  const { data: reservations = [], isLoading, refetch } = useQuery({
    queryKey: ['common-areas-reservations'],
    queryFn: () => apiClient.get('/common-areas/reservations').then(r => r.data as any[]),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar
        title="Zonas Comunes"
        back
        action={
          <Button
            variant="primary"
            size="sm"
            block={false}
            onPress={() => router.push('/(resident)/common-areas/reserve' as any)}
          >
            Reservar zona
          </Button>
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Sin reservas"
          subtitle="No tienes reservas activas. Reserva una zona común para empezar."
          cta="Reservar zona"
          onCta={() => router.push('/(resident)/common-areas/reserve' as any)}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        >
          {reservations.map((r: any) => (
            <Card key={r.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, flex: 1 }} numberOfLines={1}>
                  {r.zona ?? r.nombre_zona ?? 'Zona común'}
                </Text>
                <Badge tone={ESTADO_TONE[r.estado] ?? 'neutral'}>
                  {r.estado ?? '—'}
                </Badge>
              </View>
              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={{ fontSize: 13, color: C.gray600 }}>
                  {formatDate(r.fecha)}
                </Text>
                {(r.hora_inicio || r.horario) && (
                  <Text style={{ fontSize: 13, color: C.gray500 }}>
                    {r.horario ?? `${r.hora_inicio} – ${r.hora_fin}`}
                  </Text>
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
