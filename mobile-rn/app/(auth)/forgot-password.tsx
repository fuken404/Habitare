import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { AppBar, Banner, Button, Input } from '@/src/shared/components';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Recuperar contraseña" back />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 32,
              maxWidth: 400,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            {/* Logo + description row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Image
                source={require('@/assets/images/logo.png')}
                style={{ width: 44, height: 44, flexShrink: 0 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: C.gray500,
                  lineHeight: 20,
                }}
              >
                Te enviaremos un enlace para restablecer tu contraseña al correo asociado a tu
                cuenta.
              </Text>
            </View>

            {/* Email input */}
            <Input
              label="Correo electrónico"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="tucorreo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{ marginBottom: 16 }}
            />

            {/* Error banner */}
            {error && (
              <View style={{ marginBottom: 16 }}>
                <Banner tone="danger" title={error} />
              </View>
            )}

            {/* Success banner */}
            {sent && (
              <View style={{ marginBottom: 16 }}>
                <Banner
                  tone="success"
                  title="Enlace enviado"
                  body="Revisa tu bandeja. El enlace expira en 30 minutos."
                />
              </View>
            )}

            {/* Send button */}
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={sent}
            >
              Enviar enlace
            </Button>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Back button */}
            <Button variant="text" onPress={() => router.back()}>
              Volver al inicio de sesión
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
