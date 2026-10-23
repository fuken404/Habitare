import { C } from '@/src/core/theme/tokens';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, type ViewStyle } from 'react-native';

type Variant = 'primary' | 'secondary' | 'text' | 'destructive' | 'onDark' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  style?: ViewStyle;
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary:     { bg: C.primary,     fg: '#fff',        border: 'transparent' },
  secondary:   { bg: C.white,       fg: C.primary,     border: C.primary },
  text:        { bg: 'transparent', fg: C.primary,     border: 'transparent' },
  destructive: { bg: C.white,       fg: C.dangerText,  border: C.dangerText },
  onDark:      { bg: C.white,       fg: C.primaryDark, border: 'transparent' },
  ghost:       { bg: C.gray100,     fg: C.gray800,     border: 'transparent' },
};

const HEIGHTS: Record<Size, number>    = { lg: 52, md: 44, sm: 36 };
const PAD_X:   Record<Size, number>    = { lg: 24, md: 18, sm: 14 };
const FONT_SZ: Record<Size, number>    = { lg: 16, md: 14, sm: 13 };

export function HButton({
  variant = 'primary', size = 'lg', children, onPress,
  disabled, loading, block = true, style,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const v = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[
        {
          height: HEIGHTS[size],
          paddingHorizontal: PAD_X[size],
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: v.border,
          backgroundColor: v.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          alignSelf: block ? 'stretch' : 'flex-start',
        },
        (pressed || disabled) && { opacity: 0.75 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <Text style={{ fontSize: FONT_SZ[size], fontWeight: '600', color: v.fg, letterSpacing: -0.1 }}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
