import apiClient from '@/src/core/api/client';
import { useAuthStore } from '@/src/core/auth/authStore';
import { C, type BadgeTone } from '@/src/core/theme/tokens';
import { Avatar, Badge, BottomNav, Button, Card } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { icon: 'document-text-outline' as const, label: 'Reportes', onPress: () => router.push('/(security)/reportes' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(security)/visitors' as any) },
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(security)/dashboard' as any) },
  { icon: 'business-outline' as const, label: 'Zonas', onPress: () => router.push('/(security)/common-areas' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(security)/communications' as any) },
];

interface IngresoResponse {
  id: string;
  fecha_hora_ingreso: string;
}

interface PqrsItem {
  id: string;
  tipo: string;
  estado: string;
}

interface ComunicadoListResponse {
  id: string;
  titulo: string;
  tipo: 'informativo' | 'urgente' | 'evento' | 'mantenimiento';
  estado: 'borrador' | 'publicado' | 'archivado';
  nombre_autor?: string;
  fecha_publicacion?: string;
  created_at: string;
}

const TIPO_TONE: Record<ComunicadoListResponse['tipo'], BadgeTone> = {
  urgente: 'danger',
  mantenimiento: 'warning',
  evento: 'info',
  informativo: 'info',
};

const TIPO_LABEL: Record<ComunicadoListResponse['tipo'], string> = {
  urgente: 'Urgente',
  mantenimiento: 'Mantenimiento',
  evento: 'Evento',
  informativo: 'Informativo',
};

function isSameDay(iso: string): boolean {
  try {
    return new Date(iso).toDateString() === new Date().toDateString();
  } catch {
    return false;
  }
}

function formatRelativeDate(iso?: string): string {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return `Hoy ${date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

export default function SecurityDashboardScreen() {
  const { user } = useAuthStore();

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';

  const { data: ingresos = [], isLoading: loadingIngresos } = useQuery({
    queryKey: ['ingresos'],
    queryFn: () => apiClient.get('/visitors/ingresos').then((r) => r.data as IngresoResponse[]),
  });

  const { data: pqrs = [], isLoading: loadingPqrs } = useQuery({
    queryKey: ['pqrs'],
    queryFn: () => apiClient.get('/pqrs').then((r) => r.data as PqrsItem[]),
  });

  const { data: communications = [], isLoading: loadingComms } = useQuery({
    queryKey: ['communications'],
    queryFn: () => apiClient.get('/communications').then((r) => r.data as ComunicadoListResponse[]),
  });

  const ingresosHoy = ingresos.filter((e) => isSameDay(e.fecha_hora_ingreso)).length;

  const incidentesActivos = pqrs.filter(
    (p) => p.tipo === 'incidente' && (p.estado === 'abierta' || p.estado === 'en_proceso')
  ).length;

  const lastComm = communications.find((c) => c.estado === 'publicado');

  const isLoading = loadingIngresos || loadingPqrs || loadingComms;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.gray900, letterSpacing: -0.3 }}>
              Hola, {user?.nombre ?? 'Guardia'}
            </Text>
            <Text style={{ fontSize: 12, color: C.gray500, marginTop: 2, letterSpacing: 0.5 }}>
              CONJUNTO HABITARE
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Pressable
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: C.white,
                borderWidth: 1,
                borderColor: C.gray200,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications-outline" size={22} color={C.gray700} />
            </Pressable>
            <Pressable onPress={() => router.push('/(security)/profile' as any)}>
              <Avatar initials={initials} size={40} />
            </Pressable>
          </View>
        </View>

        {/* QR Scan card */}
        <View
          style={{
            backgroundColor: C.primary,
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: C.primary,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Ionicons name="qr-code" size={32} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 }}>
                Escanear visitante
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>
                Verificar autorizacion de ingreso
              </Text>
            </View>
          </View>
          <Button variant="onDark" size="md" block={false} onPress={() => router.push('/(security)/scan' as any)}>
            Abrir escaner
          </Button>
        </View>

        {/* Stats row */}
        {isLoading ? (
          <View style={{ height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <ActivityIndicator color={C.primary} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <Card style={{ flex: 1 }} pad={16}>
              <Text style={{ fontSize: 12, color: C.gray500, marginBottom: 6 }}>Ingresos hoy</Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: C.gray900, letterSpacing: -1 }}>
                {ingresosHoy}
              </Text>
            </Card>
            <Card style={{ flex: 1 }} pad={16}>
              <Text style={{ fontSize: 12, color: C.gray500, marginBottom: 6 }}>Incidentes activos</Text>
              <Text style={{ fontSize: 32, fontWeight: '700', color: C.gray900, letterSpacing: -1 }}>
                {incidentesActivos}
              </Text>
            </Card>
          </View>
        )}

        {/* Last communication */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: C.gray900 }}>
            Ultimo comunicado
          </Text>
          <Pressable onPress={() => router.push('/(security)/communications' as any)}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.primaryDark }}>Ver todos</Text>
          </Pressable>
        </View>

        {loadingComms ? (
          <Card>
            <ActivityIndicator color={C.primary} />
          </Card>
        ) : lastComm ? (
          <Card>
            <Badge tone={TIPO_TONE[lastComm.tipo]} dot>
              {TIPO_LABEL[lastComm.tipo]}
            </Badge>
            <Text style={{ fontSize: 17, fontWeight: '600', color: C.gray900, marginTop: 10 }}>
              {lastComm.titulo}
            </Text>
            <Text style={{ fontSize: 12, color: C.gray400, marginTop: 8 }}>
              {formatRelativeDate(lastComm.fecha_publicacion ?? lastComm.created_at)}
            </Text>
          </Card>
        ) : (
          <Card>
            <Text style={{ fontSize: 13, color: C.gray500 }}>No hay comunicados publicados.</Text>
          </Card>
        )}
      </ScrollView>

      <BottomNav items={NAV_ITEMS} active={2} />
    </SafeAreaView>
  );
}
