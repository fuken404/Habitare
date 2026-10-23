import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Banner, Button, Chip, Input } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TipoVehiculo = 'carro' | 'moto';

interface InscribirseBody {
  tipo_vehiculo: TipoVehiculo;
  placa: string;
  marca?: string;
  modelo?: string;
  color?: string;
}

export default function ParkingConfirmScreen() {
  const { sorteoId } = useLocalSearchParams<{ sorteoId: string }>();

  const [accepted, setAccepted] = useState(false);
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('carro');
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');

  const mutation = useMutation({
    mutationFn: (body: InscribirseBody) =>
      apiClient.post(`/parking/sorteos/${sorteoId}/inscribirse`, body).then((r) => r.data),
    onSuccess: () => {
      router.replace('/(resident)/parking' as any);
    },
  });

  const canSubmit = accepted && placa.trim().length > 0 && !mutation.isPending;

  const handleConfirm = () => {
    if (!canSubmit) return;
    mutation.mutate({
      tipo_vehiculo: tipoVehiculo,
      placa: placa.trim().toUpperCase(),
      marca: marca.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Participar en el sorteo" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sorteo banner */}
        <View
          style={{
            backgroundColor: C.gray900,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Sorteo
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 6 }}>
            Cupos parqueadero
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
            {sorteoId ? `ID: ${sorteoId}` : 'Cargando sorteo...'}
          </Text>
        </View>

        {/* Error banner */}
        {mutation.isError && (
          <View style={{ marginTop: 14 }}>
            <Banner
              tone="danger"
              title="No fue posible inscribirse"
              body={
                (mutation.error as any)?.response?.data?.detail ??
                'Intenta de nuevo en unos momentos.'
              }
            />
          </View>
        )}

        {/* Vehicle type chips */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.gray700, marginBottom: 10 }}>
            Tipo de vehiculo
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Chip active={tipoVehiculo === 'carro'} onPress={() => setTipoVehiculo('carro')}>
              Carro
            </Chip>
            <Chip active={tipoVehiculo === 'moto'} onPress={() => setTipoVehiculo('moto')}>
              Moto
            </Chip>
          </View>
        </View>

        {/* Placa */}
        <View style={{ marginTop: 16 }}>
          <Input
            label="Placa *"
            placeholder="Ej. ABC 123"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
            icon="car-outline"
          />
        </View>

        {/* Marca */}
        <View style={{ marginTop: 12 }}>
          <Input
            label="Marca (opcional)"
            placeholder="Ej. Mazda"
            value={marca}
            onChangeText={setMarca}
          />
        </View>

        {/* Terms */}
        <View style={{ marginTop: 14, backgroundColor: C.gray50, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 14, color: C.gray700, lineHeight: 22 }}>
            Al participar aceptas el reglamento del sorteo: solo una inscripcion por unidad, asignacion aleatoria, el cupo es intransferible y vigente por 6 meses. La administracion resuelve casos de empate o duplicado.
          </Text>
        </View>

        {/* Checkbox */}
        <Pressable
          onPress={() => setAccepted(!accepted)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: accepted ? C.primary : C.white,
              borderWidth: accepted ? 0 : 1.5,
              borderColor: C.gray300,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {accepted && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={{ fontSize: 14, color: C.gray800, flex: 1 }}>
            He leido y acepto los terminos del sorteo.
          </Text>
        </Pressable>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 36,
          backgroundColor: C.bg,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          loading={mutation.isPending}
          onPress={handleConfirm}
        >
          Confirmar participacion
        </Button>
      </View>
    </SafeAreaView>
  );
}
