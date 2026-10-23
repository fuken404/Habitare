import { useAuthInit } from '@/src/core/auth/useAuthInit';
import { useAuthStore } from '@/src/core/auth/authStore';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const ready = useAuthInit();
  const { isAuthenticated, user } = useAuthStore();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-scaffold">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.rol === 'seguridad') return <Redirect href="/(security)/dashboard" />;
  return <Redirect href="/(resident)/dashboard" />;
}
