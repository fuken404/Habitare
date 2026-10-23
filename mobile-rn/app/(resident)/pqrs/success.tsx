import { C } from '@/src/core/theme/tokens';
import { Button } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PqrsSuccessScreen() {
  const { radicado } = useLocalSearchParams<{ radicado: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Success icon */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: C.successBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="checkmark" size={40} color={C.successText} />
        </View>

        <Text style={{ fontSize: 24, fontWeight: '700', color: C.gray900, marginTop: 24, textAlign: 'center' }}>
          PQRS radicada
        </Text>

        <Text style={{ fontSize: 14, color: C.gray500, textAlign: 'center', lineHeight: 22, marginTop: 10 }}>
          Tu solicitud fue enviada. Recibirás respuesta en máximo 5 días hábiles.
        </Text>

        {radicado ? (
          <Text style={{ fontSize: 20, fontWeight: '600', color: C.primary, marginTop: 12, letterSpacing: 0.5, fontVariant: ['tabular-nums'] }}>
            {radicado}
          </Text>
        ) : null}

        <View style={{ alignSelf: 'stretch', marginTop: 36, gap: 12 }}>
          <Button variant="primary" onPress={() => router.replace('/(resident)/pqrs' as any)}>
            Ver mis PQRS
          </Button>
          <Button variant="secondary" onPress={() => router.replace('/(resident)/dashboard' as any)}>
            Volver al inicio
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
