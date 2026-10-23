import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge, Card, KV } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ESTADO_TONE: Record<string, BadgeTone> = {
  abierta: 'primary',
  en_proceso: 'warning',
  cerrada: 'neutral',
  rechazada: 'danger',
};

const TIPO_LABEL: Record<string, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
  incidente: 'Incidente',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function getInitials(name: string) {
  const parts = (name ?? '').split(' ');
  return parts.slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
}

export default function PqrsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mensaje, setMensaje] = useState('');
  const [sending, setSending] = useState(false);

  const { data: pqrs, isLoading, refetch } = useQuery({
    queryKey: ['pqrs', id],
    queryFn: () => apiClient.get(`/pqrs/${id}`).then(r => r.data as any),
    enabled: !!id,
  });

  async function handleSend() {
    if (!mensaje.trim() || !id) return;
    setSending(true);
    try {
      await apiClient.post(`/pqrs/${id}/mensajes`, { contenido: mensaje.trim() });
      setMensaje('');
      refetch();
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Detalle PQRS" back />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : !pqrs ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.gray500 }}>No se encontró la PQRS.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Badges */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Badge tone="neutral">{TIPO_LABEL[pqrs.tipo] ?? pqrs.tipo}</Badge>
              <Badge tone={ESTADO_TONE[pqrs.estado] ?? 'neutral'} dot>
                {pqrs.estado?.replace('_', ' ') ?? pqrs.estado}
              </Badge>
            </View>

            {/* Asunto */}
            <Text style={{ fontSize: 24, fontWeight: '700', color: C.gray900, letterSpacing: -0.4, marginTop: 14 }}>
              {pqrs.asunto}
            </Text>

            {/* Radicado */}
            <Text style={{ fontSize: 12, color: C.gray500, fontVariant: ['tabular-nums'], letterSpacing: 0.5 }}>
              {pqrs.numero_radicado ?? '—'}
            </Text>

            {/* Details card */}
            <Card style={{ marginTop: 14, gap: 10 }}>
              <KV label="Fecha" value={formatDate(pqrs.fecha_creacion)} />
              <View style={{ height: 1, backgroundColor: C.gray100 }} />
              <KV label="Tipo" value={TIPO_LABEL[pqrs.tipo] ?? pqrs.tipo} />
              <View style={{ height: 1, backgroundColor: C.gray100 }} />
              <KV label="Estado" value={pqrs.estado?.replace('_', ' ') ?? '—'} />
              {pqrs.descripcion ? (
                <>
                  <View style={{ height: 1, backgroundColor: C.gray100 }} />
                  <View>
                    <Text style={{ fontSize: 14, color: C.gray500, marginBottom: 4 }}>Descripción</Text>
                    <Text style={{ fontSize: 15, color: C.gray900, lineHeight: 22 }}>{pqrs.descripcion}</Text>
                  </View>
                </>
              ) : null}
            </Card>

            {/* Messages */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, marginTop: 6 }}>
              Mensajes
            </Text>

            {(pqrs.mensajes ?? []).length === 0 ? (
              <Text style={{ fontSize: 14, color: C.gray400, textAlign: 'center', marginVertical: 16 }}>
                Sin mensajes aún.
              </Text>
            ) : (
              (pqrs.mensajes as any[]).map((msg: any, i: number) => {
                const isAdmin = msg.rol !== 'residente';
                return (
                  <View
                    key={i}
                    style={{
                      backgroundColor: isAdmin ? C.primarySoft : C.white,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isAdmin ? C.primaryMuted : C.gray200,
                      padding: 14,
                      gap: 8,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Avatar
                        initials={getInitials(msg.nombre ?? (isAdmin ? 'Administrador' : 'Yo'))}
                        size={34}
                        bg={isAdmin ? C.primaryMuted : C.gray100}
                        fg={isAdmin ? C.primaryDark : C.gray700}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.gray900 }}>
                          {msg.nombre ?? (isAdmin ? 'Administración' : 'Tú')}
                        </Text>
                        <Text style={{ fontSize: 11, color: C.gray500 }}>{formatDate(msg.fecha_creacion)}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 14, color: C.gray800, lineHeight: 20 }}>{msg.contenido}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Message input row */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 12,
            gap: 10,
            backgroundColor: C.white,
            borderTopWidth: 1,
            borderTopColor: C.gray100,
          }}>
            <TextInput
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 100,
                backgroundColor: C.gray50,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.gray200,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 15,
                color: C.gray900,
              }}
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={C.gray400}
              multiline
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || !mensaje.trim()}
              style={({ pressed }) => [{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: mensaje.trim() ? C.primary : C.gray200,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Ionicons name="send" size={18} color={mensaje.trim() ? '#fff' : C.gray400} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
