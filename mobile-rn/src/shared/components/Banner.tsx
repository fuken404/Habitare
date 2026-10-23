import { C, BADGE_TONES, type BadgeTone } from '@/src/core/theme/tokens';
import { Text, View } from 'react-native';

interface BannerProps {
  tone?: BadgeTone;
  title: string;
  body?: string;
}

export function Banner({ tone = 'success', title, body }: BannerProps) {
  const { bg, fg } = BADGE_TONES[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 12, padding: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: fg }}>{title}</Text>
      {body && <Text style={{ fontSize: 13, color: fg, marginTop: 4, opacity: 0.85 }}>{body}</Text>}
    </View>
  );
}
