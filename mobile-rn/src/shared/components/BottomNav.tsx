import { C } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';

interface NavItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
  onPress?: () => void;
}

interface BottomNavProps {
  items: NavItem[];
  active: number;
}

export function BottomNav({ items, active }: BottomNavProps) {
  return (
    <View style={{ backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.gray200, flexDirection: 'row', paddingTop: 8, paddingBottom: 34 }}>
      {items.map((item, i) => {
        const on = i === active;
        return (
          <Pressable key={i} onPress={item.onPress} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8 }}>
            <View style={{ position: 'relative' }}>
              <Ionicons name={item.icon} size={24} color={on ? C.primary : C.gray400} />
              {!!item.badge && (
                <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: C.dangerText, borderRadius: 8, minWidth: 16, paddingHorizontal: 5, paddingVertical: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, fontWeight: on ? '700' : '500', color: on ? C.primary : C.gray500 }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
