import apiClient from '@/src/core/api/client';
import { useAuthStore } from '@/src/core/auth/authStore';
import { C } from '@/src/core/theme/tokens';
import { type BadgeTone } from '@/src/core/theme/tokens';
import { Avatar, Badge, BottomNav, Button, Card } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CARD_W = Math.floor((Dimensions.get('window').width - 52) / 2);

const unreadCount = 2;

const NAV_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(resident)/dashboard' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(resident)/visitors' as any) },
  { icon: 'card-outline' as const, label: 'Pagos', onPress: () => router.push('/(resident)/billing' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(resident)/communications' as any) },
  { icon: 'grid-outline' as const, label: 'Más', onPress: () => router.push('/(resident)/more' as any) },
];

interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  iconBg: string;
  iconFg: string;
  badge?: number;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: 'people-outline',
    label: 'Autorizar\nvisitante',
    route: '/visitors/create',
    iconBg: C.primarySoft,
    iconFg: C.primaryDark,
  },
  {
    icon: 'cube-outline',
    label: 'Paquetes en\nportería',
    route: '/packages',
    iconBg: C.accentSoft,
    iconFg: C.accentDark,
    badge: 2,
  },
  {
    icon: 'warning-outline',
    label: 'Reportar\nnovedad',
    route: '/incidents/new',
    iconBg: C.warningBg,
    iconFg: C.warningText,
  },
  {
    icon: 'leaf-outline',
    label: 'Reservar zona\ncomún',
    route: '/common-areas',
    iconBg: C.successBg,
    iconFg: C.successText,
  },
];

interface FacturaListResponse {
  id: string;
  monto_total: string;
  estado: string;
  fecha_vencimiento: string;
  periodo: string;
}

interface ComunicadoListResponse {
  id: string;
  titulo: string;
  tipo: string;
  estado: string;
  nombre_autor: string;
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

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('es-CO');
}

function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `Vence el ${date.getDate()} de ${months[date.getMonth()]}`;
}

function formatCommDate(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre',
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : '?';
  const fullName = user ? `${user.nombre} ${user.apellido}` : 'Usuario';

  const { data: facturas, isLoading: billingLoading, isError: billingError } = useQuery<FacturaListResponse[]>({
    queryKey: ['facturas'],
    queryFn: () => apiClient.get('/billing/facturas').then((r) => r.data),
  });

  const { data: comunicados, isLoading: commLoading } = useQuery<ComunicadoListResponse[]>({
    queryKey: ['comunicados'],
    queryFn: () => apiClient.get('/communications').then((r) => r.data),
  });

  // Billing derived values
  const pendingFacturas = facturas?.filter(
    (f) => f.estado !== 'pagada' && f.estado !== 'anulada'
  ) ?? [];

  const saldoTotal = pendingFacturas.reduce((acc, f) => acc + Number(f.monto_total), 0);

  const nextDue = pendingFacturas
    .filter((f) => f.fecha_vencimiento)
    .sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))[0];

  const saldoDisplay = billingError
    ? '--'
    : billingLoading
    ? null
    : saldoTotal === 0
    ? '$0'
    : formatCurrency(saldoTotal);

  const dueDisplay =
    saldoTotal === 0
      ? 'Sin deudas pendientes'
      : nextDue
      ? formatDueDate(nextDue.fecha_vencimiento)
      : '';

  // Last published communication
  const lastComm = comunicados?.find((c) => c.estado === 'publicado') ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Avatar initials={initials} size={44} bg={C.primarySoft} fg={C.primaryDark} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.gray900, letterSpacing: -0.3 }}>
              Hola, {user?.nombre ?? 'Residente'}
            </Text>
            <Text style={{ fontSize: 12, color: C.gray500, fontVariant: ['tabular-nums'], letterSpacing: 0.5, marginTop: 2 }}>
              {'CONJUNTO HABITARE · TORRE 1 · APTO 401'}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications' as any)}
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
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: C.accent,
                }}
              />
            )}
          </Pressable>
        </View>

        {/* Saldo card */}
        <View
          style={{
            backgroundColor: C.primary,
            borderRadius: 20,
            padding: 22,
            marginBottom: 28,
            overflow: 'hidden',
          }}
        >
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 6 }}>
            Saldo total a pagar
          </Text>
          {billingLoading ? (
            <ActivityIndicator color="#fff" size="small" style={{ alignSelf: 'flex-start', marginBottom: 10 }} />
          ) : (
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#fff',
                letterSpacing: -0.5,
                fontVariant: ['tabular-nums'],
                marginBottom: 10,
              }}
            >
              {saldoDisplay}
            </Text>
          )}
          {!billingLoading && dueDisplay ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                {dueDisplay}
              </Text>
            </View>
          ) : (
            <View style={{ marginBottom: 18 }} />
          )}
          <Button variant="onDark" size="md" block={false} onPress={() => router.push('/billing' as any)}>
            Pagar ahora →
          </Button>
        </View>

        {/* Accesos rápidos */}
        <Text style={{ fontSize: 18, fontWeight: '600', color: C.gray900, marginBottom: 14 }}>
          Accesos rápidos
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {QUICK_ACTIONS.map((action) => (
            <Card
              key={action.label}
              style={{ width: CARD_W }}
              onPress={() => router.push(action.route as any)}
              pad={16}
            >
              <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: action.iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={action.icon} size={20} color={action.iconFg} />
                </View>
                {action.badge !== undefined && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      backgroundColor: C.dangerText,
                      borderRadius: 8,
                      minWidth: 16,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                      {action.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: C.gray900,
                  marginTop: 14,
                  lineHeight: 20,
                }}
              >
                {action.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Ultimo comunicado */}
        {!commLoading && lastComm && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28, marginBottom: 12 }}>
              <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: C.gray900 }}>
                Ultimo comunicado
              </Text>
              <Pressable onPress={() => router.push('/communications' as any)}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.primaryDark }}>Ver todos →</Text>
              </Pressable>
            </View>
            <Card onPress={() => router.push(`/(resident)/communications/${lastComm.id}` as any)}>
              <Badge tone={TIPO_TONE[lastComm.tipo] ?? 'neutral'} dot>
                {TIPO_LABEL[lastComm.tipo] ?? lastComm.tipo}
              </Badge>
              <Text style={{ fontSize: 17, fontWeight: '600', color: C.gray900, marginTop: 10 }}>
                {lastComm.titulo}
              </Text>
              {lastComm.fecha_publicacion && (
                <Text style={{ fontSize: 12, color: C.gray400, marginTop: 8 }}>
                  {formatCommDate(lastComm.fecha_publicacion)}
                </Text>
              )}
            </Card>
          </>
        )}
        {commLoading && (
          <ActivityIndicator color={C.primary} size="small" style={{ marginTop: 28, alignSelf: 'center' }} />
        )}
      </ScrollView>

      <BottomNav items={NAV_ITEMS} active={0} />
    </SafeAreaView>
  );
}
