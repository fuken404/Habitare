import { C } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { HButton as Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  cta?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, subtitle, cta, onCta }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Ionicons name={icon} size={32} color={C.gray400} />
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: C.gray900, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 14, color: C.gray500, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>}
      {cta && onCta && (
        <View style={{ marginTop: 8, alignSelf: 'stretch' }}>
          <Button onPress={onCta}>{cta}</Button>
        </View>
      )}
    </View>
  );
}
