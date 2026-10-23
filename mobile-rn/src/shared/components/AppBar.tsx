import { C } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

interface AppBarProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
  bg?: string;
  dark?: boolean;
  style?: ViewStyle;
}

export function HAppBar({ title, subtitle, back = false, action, bg = C.bg, dark = false, style }: AppBarProps) {
  const fg = dark ? '#fff' : C.gray900;
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
      {back && (
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: -8 }}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={fg} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: fg, letterSpacing: -0.3 }} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,.7)' : C.gray500, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}
