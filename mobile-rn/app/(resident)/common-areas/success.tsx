import { C } from '@/src/core/theme/tokens';
import { Button } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReserveSuccessScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
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
          Reserva confirmada
        </Text>

        <Text style={{ fontSize: 14, color: C.gray500, textAlign: 'center', lineHeight: 22, marginTop: 10 }}>
          Tu reserva fue registrada exitosamente. Recibirás una confirmación pronto.
        </Text>

        <View style={{ alignSelf: 'stretch', marginTop: 36, gap: 12 }}>
          <Button variant="primary" onPress={() => router.replace('/(resident)/common-areas' as any)}>
            Ver mis reservas
          </Button>
          <Button variant="secondary" onPress={() => router.replace('/(resident)/dashboard' as any)}>
            Volver al inicio
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
