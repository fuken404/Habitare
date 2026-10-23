import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge, Button, Card, KV } from '@/src/shared/components';
import apiClient from '@/src/core/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EstadoAutorizacion = 'pendiente' | 'activa' | 'utilizada' | 'vencida' | 'cancelada';

interface Visitante {
  id: string;
  tipo_documento: string;
  n_documento: string;
  nombre: string;
  apellido?: string;
}

interface Vehiculo {
  id: string;
  tipo: string;
  placa: string;
  marca?: string;
}

interface AutorizacionResponse {
  id: string;
  unidad_id: string;
  numero_unidad?: string;
  nombre_torre?: string;
  visitante: Visitante;
  nombre_autorizado_por?: string;
  fecha_visita: string;
  requiere_parqueadero: boolean;
  estado: EstadoAutorizacion;
  vehiculos: Vehiculo[];
  created_at: string;
}

const ESTADO_TONE: Record<EstadoAutorizacion, 'success' | 'warning' | 'danger' | 'neutral'> = {
  activa: 'success',
  pendiente: 'warning',
  utilizada: 'success',
  vencida: 'danger',
  cancelada: 'neutral',
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function VisitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<AutorizacionResponse>({
    queryKey: ['autorizacion', id],
    queryFn: () => apiClient.get(`/visitors/autorizaciones/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/visitors/autorizaciones/${id}`, { estado: 'cancelada' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['autorizacion', id] });
      router.back();
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <AppBar title="Detalle de visita" back />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <AppBar title="Detalle de visita" back />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 15, color: C.dangerText, textAlign: 'center' }}>
            No se pudo cargar el detalle.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials =
    data.visitante.nombre.charAt(0).toUpperCase() +
    (data.visitante.apellido ? data.visitante.apellido.charAt(0).toUpperCase() : '');
  const fullName = [data.visitante.nombre, data.visitante.apellido].filter(Boolean).join(' ');
  const docLabel = `${data.visitante.tipo_documento} · ${data.visitante.n_documento}`;
  const unitLabel = [data.nombre_torre, data.numero_unidad].filter(Boolean).join(' · ');
  const relation = data.nombre_autorizado_por ?? 'Visitante';
  const tone = ESTADO_TONE[data.estado];
  const isCancellable = data.estado === 'pendiente' || data.estado === 'activa';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Detalle de visita" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <Card pad={20}>
          <View style={{ alignItems: 'center' }}>
            <Avatar initials={initials} size={72} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.gray900, marginTop: 12 }}>
              {fullName}
            </Text>
            <Text
              style={{ fontSize: 13, color: C.gray500, marginTop: 4, fontVariant: ['tabular-nums'] }}
            >
              {docLabel}
            </Text>
            <View style={{ marginTop: 10 }}>
              <Badge tone="primary">{relation}</Badge>
            </View>
          </View>
        </Card>

        {/* QR placeholder card */}
        <Card pad={20} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text
            style={{ fontSize: 11, color: C.gray500, letterSpacing: 0.8, marginBottom: 14 }}
          >
            MUESTRA EN PORTERIA
          </Text>
          <View
            style={{
              width: 210,
              height: 210,
              borderRadius: 12,
              backgroundColor: C.gray100,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: C.gray200,
            }}
          >
            <Ionicons name="qr-code-outline" size={120} color={C.gray400} />
          </View>
          <Text
            style={{
              fontSize: 13,
              color: C.gray500,
              marginTop: 14,
              textAlign: 'center',
              lineHeight: 18,
            }}
          >
            La porteria escanea este codigo al ingresar.
          </Text>
        </Card>

        {/* Details card */}
        <Card pad={16} style={{ marginTop: 14 }}>
          <View style={{ gap: 12 }}>
            <KV label="Fecha de visita" value={formatDate(data.fecha_visita)} />
            {unitLabel ? <KV label="Unidad" value={unitLabel} /> : null}
            {data.nombre_autorizado_por ? (
              <KV label="Autorizado por" value={data.nombre_autorizado_por} />
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 14, color: C.gray500 }}>Estado</Text>
              <Badge tone={tone}>{capitalize(data.estado)}</Badge>
            </View>
          </View>
        </Card>

        {/* Actions */}
        {isCancellable && (
          <View style={{ marginTop: 16 }}>
            <Button
              variant="destructive"
              size="md"
              onPress={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar visita'}
            </Button>
          </View>
        )}

        {cancelMutation.isError && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 13, color: C.dangerText, textAlign: 'center' }}>
              No se pudo cancelar la visita. Intenta de nuevo.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
