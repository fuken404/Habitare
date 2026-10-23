import { C } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}

export function ProfileRow({ icon, label, value, last = false }: ProfileRowProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.gray100 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.gray100, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color={C.gray600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: C.gray500 }}>{label}</Text>
        <Text style={{ fontSize: 15, color: C.gray900, fontWeight: '600', marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}
