import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge, BottomNav, EmptyState } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { icon: 'document-text-outline' as const, label: 'Reportes', onPress: () => router.push('/(security)/reportes' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(security)/visitors' as any) },
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(security)/dashboard' as any) },
  { icon: 'business-outline' as const, label: 'Zonas', onPress: () => router.push('/(security)/common-areas' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(security)/communications' as any) },
];

interface IngresoVisitante {
  id: string;
  tipo_documento: string;
  n_documento: string;
  nombre: string;
  apellido?: string;
}

interface IngresoResponse {
  id: string;
  autorizacion_id?: string;
  visitante: IngresoVisitante;
  registrado_por: string;
  fecha_hora_ingreso: string;
  created_at: string;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function getInitials(nombre: string, apellido?: string): string {
  const first = nombre.trim()[0] ?? '';
  const last = apellido?.trim()[0] ?? '';
  return (first + last).toUpperCase();
}

export default function SecurityVisitorsScreen() {
  const { data: ingresos = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ingresos'],
    queryFn: () => apiClient.get('/visitors/ingresos').then((r) => r.data as IngresoResponse[]),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar
        title="Visitantes"
        action={
          <Pressable
            onPress={() => router.push('/(security)/scan' as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : ingresos.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Sin ingresos"
          subtitle="No hay registros de ingresos."
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
          {ingresos.map((entry) => {
            const fullName = `${entry.visitante.nombre}${entry.visitante.apellido ? ' ' + entry.visitante.apellido : ''}`;
            const initials = getInitials(entry.visitante.nombre, entry.visitante.apellido);
            return (
              <View
                key={entry.id}
                style={{
                  backgroundColor: C.white,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: C.gray200,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Avatar initials={initials} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }}>{fullName}</Text>
                  <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>
                    {entry.visitante.tipo_documento}: {entry.visitante.n_documento}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <Badge tone="info">Ingreso</Badge>
                    <Text style={{ fontSize: 12, color: C.gray400 }}>
                      {formatDateTime(entry.fecha_hora_ingreso)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <BottomNav items={NAV_ITEMS} active={1} />
    </SafeAreaView>
  );
}
