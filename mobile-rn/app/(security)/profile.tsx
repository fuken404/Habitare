import { useAuthStore } from '@/src/core/auth/authStore';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge, Button, Card } from '@/src/shared/components';
import { ProfileRow } from '@/src/shared/components';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecurityProfileScreen() {
  const { user, logout } = useAuthStore();

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';
  const fullName = user ? `${user.nombre} ${user.apellido}` : 'Guardia';

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Perfil" back={true} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Avatar initials={initials} size={96} />
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.gray900, marginTop: 16, letterSpacing: -0.4 }}>
            {fullName}
          </Text>
          <Text style={{ fontSize: 14, color: C.gray500, marginTop: 4, marginBottom: 12 }}>
            {user?.email ?? ''}
          </Text>
          <Badge tone="neutral">Seguridad</Badge>
        </View>

        {/* Info card */}
        <Card pad={0} style={{ marginBottom: 20 }}>
          <ProfileRow
            icon="business-outline"
            label="Conjunto"
            value="Conjunto Habitare"
          />
          <ProfileRow
            icon="call-outline"
            label="Telefono"
            value="+57 300 000 0000"
            last
          />
        </Card>

        {/* Logout */}
        <Button variant="destructive" onPress={handleLogout}>
          Cerrar sesion
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
