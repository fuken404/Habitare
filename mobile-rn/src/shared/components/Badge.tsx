import { BADGE_TONES, type BadgeTone } from '@/src/core/theme/tokens';
import { Text, View, type ViewStyle } from 'react-native';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function HBadge({ tone = 'neutral', children, dot = false, size = 'md', style }: BadgeProps) {
  const { bg, fg } = BADGE_TONES[tone];
  const py = size === 'sm' ? 3 : 5;
  const px = size === 'sm' ? 7 : 10;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: 10,
          paddingVertical: py,
          paddingHorizontal: px,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {dot && (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} />
      )}
      <Text style={{ fontSize: 11, fontWeight: '600', color: fg, letterSpacing: 0.3 }}>
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Text>
    </View>
  );
}
