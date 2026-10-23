import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, Card, EmptyState } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ESTADO_TONE: Record<string, BadgeTone> = {
  pendiente: 'warning',
  retirado: 'success',
  devuelto: 'danger',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function PackagesScreen() {
  const { data: packages = [], isLoading, refetch } = useQuery({
    queryKey: ['packages'],
    queryFn: () => apiClient.get('/packages').then(r => r.data as any[]),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Paquetes en portería" back />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : packages.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title="Sin paquetes"
          subtitle="No tienes paquetes registrados en portería."
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        >
          {packages.map((pkg: any) => (
            <Card key={pkg.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }} numberOfLines={2}>
                    {pkg.descripcion ?? 'Paquete'}
                  </Text>
                  {pkg.porteria && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Ionicons name="location-outline" size={13} color={C.gray500} />
                      <Text style={{ fontSize: 13, color: C.gray500 }}>{pkg.porteria}</Text>
                    </View>
                  )}
                </View>
                <Badge tone={ESTADO_TONE[pkg.estado] ?? 'neutral'}>
                  {pkg.estado ?? '—'}
                </Badge>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }}>
                <Ionicons name="time-outline" size={13} color={C.gray400} />
                <Text style={{ fontSize: 12, color: C.gray400 }}>
                  Llegó: {formatDate(pkg.fecha_llegada)}
                </Text>
              </View>
              {pkg.fecha_retiro && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <Ionicons name="checkmark-circle-outline" size={13} color={C.successText} />
                  <Text style={{ fontSize: 12, color: C.successText }}>
                    Retirado: {formatDate(pkg.fecha_retiro)}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
