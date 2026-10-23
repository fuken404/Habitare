import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Button, Input } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIME_SLOTS = [
  '07:00 – 09:00',
  '09:00 – 11:00',
  '11:00 – 13:00',
  '13:00 – 15:00',
  '15:00 – 17:00',
  '17:00 – 19:00',
  '19:00 – 21:00',
];

const ZONE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  default: 'business-outline',
  piscina: 'water-outline',
  salon: 'people-outline',
  bbq: 'flame-outline',
  gym: 'barbell-outline',
  cancha: 'football-outline',
};

function todayStr() {
  return new Date().toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ReserveAreaScreen() {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['common-areas-zones'],
    queryFn: () => apiClient.get('/common-areas').then(r => r.data as any[]),
  });

  function getZoneIcon(zone: any): keyof typeof Ionicons.glyphMap {
    const name: string = (zone.nombre ?? '').toLowerCase();
    for (const key of Object.keys(ZONE_ICONS)) {
      if (name.includes(key)) return ZONE_ICONS[key];
    }
    return ZONE_ICONS.default;
  }

  async function handleConfirm() {
    if (!selectedZone) { setError('Selecciona una zona.'); return; }
    if (!selectedSlot) { setError('Selecciona un horario.'); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/common-areas/reservations', {
        zona_id: selectedZone.id,
        fecha: new Date().toISOString().split('T')[0],
        horario: selectedSlot,
      });
      router.replace('/(resident)/common-areas/success' as any);
    } catch {
      setError('No se pudo crear la reserva. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Reservar zona" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Zona selection */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, paddingHorizontal: 20, paddingTop: 20, marginBottom: 12 }}>
          Selecciona una zona
        </Text>

        {isLoading ? (
          <ActivityIndicator color={C.primary} style={{ marginVertical: 24 }} />
        ) : zones.length === 0 ? (
          <Text style={{ fontSize: 14, color: C.gray400, paddingHorizontal: 20, marginBottom: 16 }}>
            No hay zonas disponibles.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {zones.map((zone: any) => {
              const on = selectedZone?.id === zone.id;
              return (
                <Pressable
                  key={zone.id}
                  onPress={() => setSelectedZone(zone)}
                  style={{
                    width: 120,
                    backgroundColor: on ? C.primarySoft : C.white,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: on ? C.primary : C.gray200,
                    padding: 16,
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: on ? C.primaryMuted : C.gray100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons name={getZoneIcon(zone)} size={22} color={on ? C.primaryDark : C.gray500} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.primaryDark : C.gray800, textAlign: 'center' }} numberOfLines={2}>
                    {zone.nombre}
                  </Text>
                  {zone.capacidad && (
                    <Text style={{ fontSize: 11, color: on ? C.primaryDark : C.gray500 }}>
                      Cap. {zone.capacidad}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Fecha */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Fecha
        </Text>
        <View style={{ paddingHorizontal: 20 }}>
          <Input
            label=""
            value={todayStr()}
            editable={false}
            icon="calendar-outline"
          />
        </View>

        {/* Horario */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          Horario
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {TIME_SLOTS.map(slot => {
            const on = selectedSlot === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: on ? C.primary : C.gray200,
                  backgroundColor: on ? C.primarySoft : C.white,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: on ? C.primaryDark : C.gray700 }}>
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? (
          <Text style={{ fontSize: 13, color: C.dangerText, paddingHorizontal: 20, marginTop: 12 }}>{error}</Text>
        ) : null}
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 36,
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: C.gray100,
      }}>
        <Button variant="primary" loading={loading} onPress={handleConfirm}>
          Confirmar reserva
        </Button>
      </View>
    </SafeAreaView>
  );
}
