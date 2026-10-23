import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Badge, Button, Card } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SorteoActivoResponse {
  id: string;
  fecha_sorteo: string;
  n_cupos: number;
  n_inscritos: number;
  ya_inscrito: boolean;
  estado: string;
}

interface SorteoParticipacion {
  id: string;
  unidad_id: string;
  numero_unidad?: string;
  es_ganador: boolean;
}

interface SorteoResponse {
  id: string;
  fecha_sorteo: string;
  fecha_limite_inscripcion?: string;
  estado: string;
  n_cupos: number;
  participaciones: SorteoParticipacion[];
  created_at: string;
}

function daysUntil(isoDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + 'T00:00:00');
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const months = [
    'ene','feb','mar','abr','may','jun',
    'jul','ago','sep','oct','nov','dic',
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ParkingScreen() {
  const { data: sorteoActivo, isLoading: activeLoading } = useQuery<SorteoActivoResponse | null>({
    queryKey: ['sorteo-activo'],
    queryFn: () =>
      apiClient
        .get('/parking/sorteos/activo')
        .then((r) => r.data)
        .catch((e: any) =>
          e.response?.status === 404 ? null : Promise.reject(e)
        ),
  });

  const { data: sorteos, isLoading: historyLoading } = useQuery<SorteoResponse[]>({
    queryKey: ['sorteos'],
    queryFn: () => apiClient.get('/parking/sorteos').then((r) => r.data),
  });

  const days = sorteoActivo ? daysUntil(sorteoActivo.fecha_sorteo) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Sorteo parqueadero" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading */}
        {activeLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator color={C.primary} size="large" />
          </View>
        )}

        {/* No active sorteo */}
        {!activeLoading && sorteoActivo === null && (
          <Card pad={24} style={{ alignItems: 'center' }}>
            <Ionicons name="car-outline" size={40} color={C.gray400} />
            <Text style={{ fontSize: 15, color: C.gray600, marginTop: 12, textAlign: 'center' }}>
              No hay sorteo activo actualmente
            </Text>
          </Card>
        )}

        {/* Active sorteo hero */}
        {!activeLoading && sorteoActivo && (
          <>
            <View
              style={{
                backgroundColor: C.gray900,
                borderRadius: 20,
                padding: 22,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Background P icon */}
              <View
                style={{
                  position: 'absolute',
                  right: -30,
                  bottom: -30,
                  width: 140,
                  height: 140,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 80, fontWeight: '900', color: 'rgba(255,255,255,0.08)' }}>P</Text>
              </View>

              <View style={{ marginBottom: 14 }}>
                <Badge tone="neutral" dot>Sorteo activo</Badge>
              </View>

              <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff', lineHeight: 30 }}>
                Sorteo de cupos{'\n'}parqueadero
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 20 }}>
                {`Hay ${sorteoActivo.n_cupos} cupos para ${sorteoActivo.n_inscritos} unidades inscritas.`}
              </Text>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', gap: 24, marginTop: 18 }}>
                {[
                  { label: 'CUPOS', value: String(sorteoActivo.n_cupos) },
                  { label: 'INSCRITOS', value: String(sorteoActivo.n_inscritos) },
                  { label: 'CIERRA EN', value: days > 0 ? `${days} días` : 'Hoy' },
                ].map((s) => (
                  <View key={s.label}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>{s.value}</Text>
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, marginTop: 2 }}>
                      {s.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Participation card */}
            <Card pad={16} style={{ marginTop: 14 }}>
              <Text style={{ fontSize: 11, color: C.gray500, letterSpacing: 0.5, fontWeight: '600', textTransform: 'uppercase' }}>
                Tu participacion
              </Text>

              {sorteoActivo.ya_inscrito ? (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: C.successBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color={C.successText} />
                    </View>
                    <Text style={{ fontSize: 15, color: C.gray800, flex: 1 }}>
                      {`Estas inscrito en el sorteo del ${formatShortDate(sorteoActivo.fecha_sorteo)}.`}
                    </Text>
                  </View>
                  <View style={{ marginTop: 14 }}>
                    <Button variant="secondary" size="md" onPress={() => router.back()}>
                      Volver
                    </Button>
                  </View>
                </View>
              ) : sorteoActivo.estado === 'abierto' ? (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: C.gray100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="close" size={16} color={C.gray400} />
                    </View>
                    <Text style={{ fontSize: 15, color: C.gray700 }}>
                      Aun no estas inscrito en el sorteo.
                    </Text>
                  </View>
                  <View style={{ marginTop: 14 }}>
                    <Button
                      variant="primary"
                      size="md"
                      onPress={() =>
                        router.push({
                          pathname: '/(resident)/parking/confirm' as any,
                          params: { sorteoId: sorteoActivo.id },
                        })
                      }
                    >
                      Participar en el sorteo
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 14, color: C.gray600 }}>
                    El sorteo esta {sorteoActivo.estado}. Ya no es posible inscribirse.
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}

        {/* History */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, marginTop: 22, marginBottom: 10 }}>
          Resultados anteriores
        </Text>

        {historyLoading && (
          <ActivityIndicator color={C.primary} size="small" style={{ alignSelf: 'center' }} />
        )}

        {!historyLoading && sorteos && sorteos.length === 0 && (
          <Text style={{ fontSize: 14, color: C.gray500, textAlign: 'center', paddingVertical: 16 }}>
            Sin historial disponible
          </Text>
        )}

        {!historyLoading && sorteos && sorteos.length > 0 && (
          <Card pad={0}>
            {sorteos.map((r, i) => (
              <View
                key={r.id}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: i < sorteos.length - 1 ? 1 : 0,
                  borderBottomColor: C.gray100,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.gray900 }}>
                  {formatShortDate(r.fecha_sorteo)}
                </Text>
                <Text style={{ fontSize: 13, color: C.gray500, fontVariant: ['tabular-nums'] }}>
                  {`${r.n_cupos} cupos · ${r.participaciones.length} inscritos`}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
