import { C } from '@/src/core/theme/tokens';
import { Pressable, Text } from 'react-native';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
}

export function HChip({ children, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: active ? C.primary : C.white,
        borderWidth: 1.5,
        borderColor: active ? C.primary : C.gray200,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : C.gray600 }}>
        {children}
      </Text>
    </Pressable>
  );
}
