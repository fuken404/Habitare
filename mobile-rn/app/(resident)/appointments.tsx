import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, Button, Card, EmptyState, Input } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'disponibilidad' | 'mis_citas';

const ESTADO_TONE: Record<string, BadgeTone> = {
  pendiente: 'warning',
  confirmada: 'success',
  cancelada: 'danger',
  completada: 'neutral',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('disponibilidad');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [motivo, setMotivo] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');

  const { data: slots = [], isLoading: loadingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['citas-disponibilidad'],
    queryFn: () => apiClient.get('/citas/disponibilidad?solo_futuras=true').then(r => r.data as any[]),
    enabled: activeTab === 'disponibilidad',
  });

  const { data: citas = [], isLoading: loadingCitas, refetch: refetchCitas } = useQuery({
    queryKey: ['citas'],
    queryFn: () => apiClient.get('/citas').then(r => r.data as any[]),
    enabled: activeTab === 'mis_citas',
  });

  function openSlot(slot: any) {
    setSelectedSlot(slot);
    setMotivo('');
    setBookError('');
    setModalVisible(true);
  }

  async function handleBook() {
    if (!motivo.trim()) { setBookError('Ingresa el motivo de la cita.'); return; }
    setBookError('');
    setBooking(true);
    try {
      await apiClient.post('/citas', { slot_id: selectedSlot.id, motivo });
      setModalVisible(false);
      refetchSlots();
      refetchCitas();
    } catch {
      setBookError('No se pudo solicitar la cita. Intenta de nuevo.');
    } finally {
      setBooking(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'disponibilidad', label: 'Disponibilidad' },
    { key: 'mis_citas', label: 'Mis Citas' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Citas Admin" back />

      {/* Tab bar */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.gray200, backgroundColor: C.bg }}>
        {tabs.map(tab => {
          const on = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 13,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: on ? C.primary : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: on ? C.primary : C.gray400 }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'disponibilidad' ? (
        loadingSlots ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={C.primary} size="large" />
          </View>
        ) : slots.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Sin horarios disponibles"
            subtitle="No hay horarios disponibles en este momento."
          />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loadingSlots} onRefresh={refetchSlots} tintColor={C.primary} />}
          >
            {slots.map((slot: any) => (
              <Card key={slot.id} onPress={() => openSlot(slot)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }}>
                      {formatDate(slot.fecha)}
                    </Text>
                    <Text style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>
                      {slot.hora_inicio} – {slot.hora_fin}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    {slot.cupos_disponibles !== undefined && (
                      <Badge tone={slot.cupos_disponibles > 0 ? 'success' : 'danger'}>
                        {slot.cupos_disponibles} cupos
                      </Badge>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={C.gray300} />
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        )
      ) : (
        loadingCitas ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={C.primary} size="large" />
          </View>
        ) : citas.length === 0 ? (
          <EmptyState
            icon="calendar-clear-outline"
            title="Sin citas"
            subtitle="No tienes citas programadas."
          />
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loadingCitas} onRefresh={refetchCitas} tintColor={C.primary} />}
          >
            {citas.map((cita: any) => (
              <Card key={cita.id}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900, flex: 1 }} numberOfLines={2}>
                    {cita.motivo ?? 'Cita'}
                  </Text>
                  <Badge tone={ESTADO_TONE[cita.estado] ?? 'neutral'}>
                    {cita.estado ?? '—'}
                  </Badge>
                </View>
                <Text style={{ fontSize: 13, color: C.gray500, marginTop: 6 }}>
                  {formatDate(cita.fecha)} · {cita.hora_inicio}
                </Text>
                {cita.observaciones_admin ? (
                  <View style={{ marginTop: 10, padding: 10, backgroundColor: C.gray50, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, color: C.gray500, marginBottom: 2 }}>Respuesta admin</Text>
                    <Text style={{ fontSize: 13, color: C.gray800, lineHeight: 18 }}>{cita.observaciones_admin}</Text>
                  </View>
                ) : null}
              </Card>
            ))}
          </ScrollView>
        )
      )}

      {/* Book modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{ backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.gray200 }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.gray900, marginBottom: 6 }}>
              Solicitar cita
            </Text>
            {selectedSlot && (
              <Text style={{ fontSize: 14, color: C.gray500, marginBottom: 16 }}>
                {formatDate(selectedSlot.fecha)} · {selectedSlot.hora_inicio} – {selectedSlot.hora_fin}
              </Text>
            )}
            <Input
              label="Motivo"
              placeholder="¿Cuál es el motivo de tu cita?"
              value={motivo}
              onChangeText={setMotivo}
              multiline
              style={{ marginBottom: 12 }}
            />
            {bookError ? (
              <Text style={{ fontSize: 13, color: C.dangerText, marginBottom: 8 }}>{bookError}</Text>
            ) : null}
            <Button variant="primary" loading={booking} onPress={handleBook}>
              Solicitar cita
            </Button>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
