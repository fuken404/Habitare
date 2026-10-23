import { useAuthStore } from '@/src/core/auth/authStore';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, BottomNav, Button, Card } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServiceItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  iconBg: string;
  iconFg: string;
}

const SERVICES: ServiceItem[] = [
  {
    icon: 'document-text-outline',
    label: 'PQRS',
    route: '/pqrs',
    iconBg: C.primarySoft,
    iconFg: C.primaryDark,
  },
  {
    icon: 'leaf-outline',
    label: 'Zonas comunes',
    route: '/common-areas',
    iconBg: C.successBg,
    iconFg: C.successText,
  },
  {
    icon: 'car-outline',
    label: 'Sorteo parqueadero',
    route: '/(resident)/parking',
    iconBg: C.infoBg,
    iconFg: C.infoText,
  },
  {
    icon: 'alert-circle-outline',
    label: 'Reportar novedad',
    route: '/incidents/new',
    iconBg: C.warningBg,
    iconFg: C.warningText,
  },
  {
    icon: 'construct-outline',
    label: 'Servicios externos',
    route: '/external-services',
    iconBg: C.accentSoft,
    iconFg: C.accentDark,
  },
  {
    icon: 'calendar-outline',
    label: 'Citas admin',
    route: '/appointments',
    iconBg: C.gray100,
    iconFg: C.gray700,
  },
];

const NAV_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(resident)/dashboard' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(resident)/visitors' as any) },
  { icon: 'card-outline' as const, label: 'Pagos', onPress: () => router.push('/(resident)/billing' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(resident)/communications' as any) },
  { icon: 'grid-outline' as const, label: 'Más', onPress: () => router.push('/(resident)/more' as any) },
];

export default function MoreScreen() {
  const { user, logout } = useAuthStore();

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Más" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <Card onPress={() => router.push('/profile' as any)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar initials={initials} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900 }}>
                {user?.nombre} {user?.apellido}
              </Text>
              <Text style={{ fontSize: 14, color: C.gray500, marginTop: 2 }}>{user?.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gray300} />
          </View>
        </Card>

        {/* Services section */}
        <Text
          style={{
            fontSize: 12,
            color: C.gray500,
            letterSpacing: 0.8,
            marginTop: 22,
            marginBottom: 4,
          }}
        >
          SERVICIOS
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          {SERVICES.map((svc) => (
            <Card
              key={svc.label}
              style={{ width: '47%', flexGrow: 1 }}
              onPress={() => router.push(svc.route as any)}
              pad={16}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: svc.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={svc.icon} size={20} color={svc.iconFg} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.gray900, marginTop: 14, lineHeight: 20 }}>
                {svc.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Logout */}
        <View style={{ marginTop: 24 }}>
          <Button
            variant="destructive"
            size="md"
            onPress={async () => {
              await logout();
              router.replace('/login' as any);
            }}
          >
            Cerrar sesión
          </Button>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 28, gap: 4 }}>
          <Pressable style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: C.primary }}>H</Text>
          </Pressable>
          <Text
            style={{
              fontSize: 12,
              color: C.gray400,
              fontVariant: ['tabular-nums'],
              letterSpacing: 0.5,
            }}
          >
            HABITARE · v1.0.0
          </Text>
        </View>
      </ScrollView>

      <BottomNav items={NAV_ITEMS} active={4} />
    </SafeAreaView>
  );
}
