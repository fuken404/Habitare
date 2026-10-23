import { C } from '@/src/core/theme/tokens';
import { AppBar, Badge, BottomNav } from '@/src/shared/components';
import { type BadgeTone } from '@/src/core/theme/tokens';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { icon: 'document-text-outline' as const, label: 'Reportes', onPress: () => router.replace('/(security)/reportes' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.replace('/(security)/visitors' as any) },
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.replace('/(security)/dashboard' as any) },
  { icon: 'business-outline' as const, label: 'Zonas' },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.replace('/(security)/communications' as any) },
];

type ZoneStatus = 'Disponible' | 'Ocupada' | 'En mantenimiento';

interface Zone {
  name: string;
  capacity: string;
  status: ZoneStatus;
  reservations: number;
}

const STATUS_TONE: Record<ZoneStatus, BadgeTone> = {
  Disponible: 'success',
  Ocupada: 'warning',
  'En mantenimiento': 'danger',
};

const ZONES: Zone[] = [
  {
    name: 'Piscina',
    capacity: 'Capacidad: 30 personas',
    status: 'Disponible',
    reservations: 3,
  },
  {
    name: 'Gimnasio',
    capacity: 'Capacidad: 15 personas',
    status: 'Ocupada',
    reservations: 5,
  },
  {
    name: 'Salon Social',
    capacity: 'Capacidad: 80 personas',
    status: 'En mantenimiento',
    reservations: 0,
  },
  {
    name: 'BBQ',
    capacity: 'Capacidad: 20 personas',
    status: 'Disponible',
    reservations: 2,
  },
];

export default function SecurityCommonAreasScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Zonas comunes" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {ZONES.map((z) => (
          <View
            key={z.name}
            style={{
              backgroundColor: C.white,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.gray200,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.gray900 }}>{z.name}</Text>
                <Text style={{ fontSize: 13, color: C.gray500, marginTop: 3 }}>{z.capacity}</Text>
              </View>
              <Badge tone={STATUS_TONE[z.status]}>{z.status}</Badge>
            </View>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 10 }}>
              Reservas hoy: {z.reservations}
            </Text>
          </View>
        ))}
      </ScrollView>

      <BottomNav items={NAV_ITEMS} active={3} />
    </SafeAreaView>
  );
}
