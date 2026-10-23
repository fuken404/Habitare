import { useAuthStore } from '@/src/core/auth/authStore';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Button, Card } from '@/src/shared/components';
import { ProfileRow } from '@/src/shared/components/ProfileRow';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';
  const fullName = user ? `${user.nombre} ${user.apellido}` : 'Usuario';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Perfil" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Avatar initials={initials} size={96} bg={C.primarySoft} fg={C.primaryDark} />
          <Text style={{ fontSize: 24, fontWeight: '700', color: C.gray900, marginTop: 14, letterSpacing: -0.3 }}>
            {fullName}
          </Text>
          <Text style={{ fontSize: 15, color: C.gray500, marginTop: 4 }}>
            {user?.email ?? '—'}
          </Text>
        </View>

        {/* Info card */}
        <Card pad={0}>
          <ProfileRow
            icon="business-outline"
            label="Conjunto"
            value="Habitare"
          />
          <ProfileRow
            icon="grid-outline"
            label="Unidad"
            value={user?.numeroUnidad ?? '—'}
          />
          <ProfileRow
            icon="call-outline"
            label="Teléfono"
            value="—"
          />
          <ProfileRow
            icon="document-text-outline"
            label="Documento"
            value="—"
            last
          />
        </Card>

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <Button variant="secondary">
            Cambiar contraseña
          </Button>
          <Button variant="destructive" onPress={logout}>
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
