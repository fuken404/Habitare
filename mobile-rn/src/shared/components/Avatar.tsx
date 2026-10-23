import { C } from '@/src/core/theme/tokens';
import { Text, View, type ViewStyle } from 'react-native';

interface AvatarProps {
  initials: string;
  size?: number;
  bg?: string;
  fg?: string;
  style?: ViewStyle;
}

export function HAvatar({ initials, size = 40, bg = C.primarySoft, fg = C.primaryDark, style }: AvatarProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.38, fontWeight: '700', color: fg, letterSpacing: -0.3 }}>
        {initials}
      </Text>
    </View>
  );
}
