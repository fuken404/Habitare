import { C } from '@/src/core/theme/tokens';
import { Text, View } from 'react-native';

export function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 14, color: C.gray500 }}>{label}</Text>
      <Text style={{ fontSize: 15, color: C.gray900, fontWeight: '600', textAlign: 'right', flex: 1 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
