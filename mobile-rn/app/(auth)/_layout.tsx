import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/core/auth/authStore';

export default function AuthLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Redirect href={user.rol === 'seguridad' ? '/(security)/dashboard' : '/(resident)/dashboard'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
