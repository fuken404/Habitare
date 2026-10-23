import { C } from '@/src/core/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View, type ViewStyle } from 'react-native';

interface InputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoComplete?: any;
  style?: ViewStyle;
  editable?: boolean;
  onPress?: () => void;
}

export function HInput({
  label, icon, iconRight, value, onChangeText, placeholder, error,
  helper, secureTextEntry, multiline, keyboardType, autoCapitalize,
  autoComplete, style, editable = true, onPress,
}: InputProps) {
  const [obscure, setObscure] = useState(secureTextEntry ?? false);
  const borderColor = error ? C.dangerText : C.gray200;

  const inner = (
    <View style={{
      minHeight: multiline ? 96 : 52,
      backgroundColor: C.white,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      paddingHorizontal: 14,
      paddingVertical: multiline ? 14 : 0,
      gap: 10,
    }}>
      {icon && !multiline && <Ionicons name={icon} size={20} color={C.gray400} />}
      <TextInput
        style={{ flex: 1, fontSize: 16, color: C.gray900, paddingVertical: 0 }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.gray400}
        secureTextEntry={obscure}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        editable={editable}
        numberOfLines={multiline ? 4 : 1}
      />
      {secureTextEntry && (
        <Pressable onPress={() => setObscure(!obscure)} hitSlop={8}>
          <Ionicons name={obscure ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.gray400} />
        </Pressable>
      )}
      {iconRight && !secureTextEntry && <Ionicons name={iconRight} size={20} color={C.gray400} />}
    </View>
  );

  return (
    <View style={style}>
      {label && <Text style={{ fontSize: 12, fontWeight: '600', color: C.gray700, marginBottom: 6 }}>{label}</Text>}
      {onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner}
      {(error || helper) && (
        <Text style={{ fontSize: 12, color: error ? C.dangerText : C.gray500, marginTop: 4 }}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}
