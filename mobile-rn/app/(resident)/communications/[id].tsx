import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import { type BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ComunicadoResponse {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'informativo' | 'urgente' | 'evento' | 'mantenimiento';
  estado: string;
  fecha_publicacion?: string;
  created_at: string;
}

const TIPO_TONE: Record<string, BadgeTone> = {
  urgente:      'danger',
  mantenimiento:'warning',
  evento:       'info',
  informativo:  'info',
};

const TIPO_LABEL: Record<string, string> = {
  urgente:      'Urgente',
  mantenimiento:'Mantenimiento',
  evento:       'Evento',
  informativo:  'Informativo',
};

function formatPublishedDate(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}, ${hour12}:${minutes} ${ampm}`;
}

export default function CommunicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: comm, isLoading, isError } = useQuery<ComunicadoResponse>({
    queryKey: ['comunicado', id],
    queryFn: () => apiClient.get(`/communications/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="" back />

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 15, color: C.gray500, textAlign: 'center' }}>
            No se pudo cargar el comunicado.
          </Text>
        </View>
      )}

      {!isLoading && !isError && comm && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Badge tone={TIPO_TONE[comm.tipo] ?? 'neutral'} dot>
            {TIPO_LABEL[comm.tipo] ?? comm.tipo}
          </Badge>

          <Text style={{ fontSize: 28, fontWeight: '700', color: C.gray900, marginTop: 14, lineHeight: 36 }}>
            {comm.titulo}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            <Ionicons name="calendar-outline" size={14} color={C.gray400} />
            <Text style={{ fontSize: 13, color: C.gray500 }}>
              {comm.fecha_publicacion
                ? `Publicado · ${formatPublishedDate(comm.fecha_publicacion)}`
                : `Publicado · ${formatPublishedDate(comm.created_at)}`}
            </Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 15, color: C.gray800, lineHeight: 24 }}>
              {comm.contenido}
            </Text>
          </View>

          {/* Author footer */}
          <View
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: C.gray200,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Avatar initials="AM" size={40} />
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.gray900 }}>Administracion</Text>
              <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>Conjunto Habitare</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
