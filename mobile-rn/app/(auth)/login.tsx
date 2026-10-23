import apiClient from '@/src/core/api/client';
import { useAuthStore, type AuthUser } from '@/src/core/auth/authStore';
import { C } from '@/src/core/theme/tokens';
import { Banner, Button, HabitareLogo, Input } from '@/src/shared/components';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

interface MeResponse {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  tenant_id: string;
  unidad_id?: string;
  numero_unidad?: string;
}

export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('username', email.trim().toLowerCase());
      params.append('password', password);

      const { data: tokens } = await apiClient.post<TokenResponse>('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { data: me } = await apiClient.get<MeResponse>('/auth/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const user: AuthUser = {
        id: me.id,
        nombre: me.nombre,
        apellido: me.apellido,
        email: me.email,
        rol: me.rol as any,
        tenantId: me.tenant_id,
        unidadId: me.unidad_id,
        numeroUnidad: me.numero_unidad,
      };

      await setAuth(user, tokens.access_token, tokens.refresh_token);

      const dest = me.rol === 'seguridad' ? '/(security)/dashboard' : '/(resident)/dashboard';
      router.replace(dest as any);
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      if (!e.response) {
        setError(`Sin conexión al servidor (${e.message})`);
      } else {
        setError(typeof detail === 'string' ? detail : `Error ${e.response.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingTop: 0,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo block */}
          <View style={{ alignItems: 'center', marginTop: 48, gap: 12 }}>
            <HabitareLogo size={88} />
            <Text
              style={{
                fontSize: 30,
                fontWeight: '700',
                color: C.gray900,
                letterSpacing: -0.8,
                marginTop: 8,
              }}
            >
              Habitare
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: C.gray500,
                textAlign: 'center',
                maxWidth: 260,
              }}
            >
              Gestión de conjuntos residenciales
            </Text>
          </View>

          {/* Inputs */}
          <View style={{ marginTop: 44, gap: 14 }}>
            <Input
              label="Correo electrónico"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Error banner */}
          {error && (
            <View style={{ marginTop: 12 }}>
              <Banner tone="danger" title={error} />
            </View>
          )}

          {/* Login button */}
          <View style={{ marginTop: 28 }}>
            <Button variant="primary" size="lg" onPress={handleLogin} loading={loading}>
              Iniciar sesión
            </Button>
          </View>

          {/* Forgot password */}
          <Pressable
            style={{ alignItems: 'center', paddingVertical: 16 }}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={{ fontSize: 15, color: C.primaryDark, fontWeight: '600' }}>
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          {/* Spacer pushes footer down */}
          <View style={{ flex: 1, minHeight: 24 }} />

          {/* Footer */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 14, color: C.gray500, textAlign: 'center' }}>
              {'¿No tienes cuenta? '}
              <Text style={{ color: C.gray700, fontWeight: '700' }}>
                Comunícate con tu administrador
              </Text>
            </Text>
            <Text style={{ fontSize: 12, color: C.gray400, letterSpacing: 0.2 }}>
              © 2025 Habitare. Todos los derechos reservados.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
