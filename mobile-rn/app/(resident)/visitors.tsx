import { C } from '@/src/core/theme/tokens';
import { AppBar, Avatar, Badge, BottomNav, EmptyState } from '@/src/shared/components';
import apiClient from '@/src/core/api/client';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'vigentes' | 'historial';

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

const NAV_ITEMS = [
  { icon: 'home-outline' as const, label: 'Inicio', onPress: () => router.push('/(resident)/dashboard' as any) },
  { icon: 'people-outline' as const, label: 'Visitantes', onPress: () => router.push('/(resident)/visitors' as any) },
  { icon: 'card-outline' as const, label: 'Pagos', onPress: () => router.push('/(resident)/billing' as any) },
  { icon: 'megaphone-outline' as const, label: 'Comunicados', onPress: () => router.push('/(resident)/communications' as any) },
  { icon: 'grid-outline' as const, label: 'Mas', onPress: () => router.push('/(resident)/more' as any) },
];

const ESTADO_TONE: Record<EstadoAutorizacion, 'success' | 'warning' | 'danger' | 'neutral'> = {
  activa: 'success',
  pendiente: 'warning',
  utilizada: 'success',
  vencida: 'danger',
  cancelada: 'neutral',
};

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string): string {
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const [year, month, day] = iso.split('-');
  return `${parseInt(day, 10)} ${MONTHS[parseInt(month, 10) - 1]} ${year}`;
}

function getInitials(visitante: Visitante): string {
  const first = visitante.nombre.charAt(0).toUpperCase();
  const second = visitante.apellido ? visitante.apellido.charAt(0).toUpperCase() : '';
  return first + second;
}

function VisitorCard({ item }: { item: AutorizacionResponse }) {
  const tone = ESTADO_TONE[item.estado];
  const initials = getInitials(item.visitante);
  const fullName = [item.visitante.nombre, item.visitante.apellido].filter(Boolean).join(' ');
  const doc = `${item.visitante.tipo_documento} ${item.visitante.n_documento}`;

  return (
    <Pressable
      onPress={() => router.push(`/(resident)/visitors/${item.id}` as any)}
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View
        style={{
          backgroundColor: C.white,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.gray200,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Avatar initials={initials} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }}>{fullName}</Text>
          <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>{doc}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
            <Badge tone={tone}>{capitalize(item.estado)}</Badge>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Ionicons name="calendar-outline" size={13} color={C.gray500} />
            <Text style={{ fontSize: 13, color: C.gray700 }}>{formatDate(item.fecha_visita)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.gray300} />
      </View>
    </Pressable>
  );
}

export default function VisitorsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('vigentes');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<AutorizacionResponse[]>({
    queryKey: ['autorizaciones'],
    queryFn: () => apiClient.get('/visitors/autorizaciones').then((r) => r.data),
  });

  const vigentes = (data ?? []).filter((a) => a.estado === 'pendiente' || a.estado === 'activa');
  const historial = (data ?? []).filter(
    (a) => a.estado === 'utilizada' || a.estado === 'vencida' || a.estado === 'cancelada'
  );
  const list = activeTab === 'vigentes' ? vigentes : historial;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar
        title="Visitantes"
        action={
          <Pressable
            onPress={() => router.push('/(resident)/visitors/create' as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        }
      />

      {/* Tab bar */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: C.gray200,
          backgroundColor: C.bg,
        }}
      >
        {(['vigentes', 'historial'] as Tab[]).map((tab) => {
          const on = activeTab === tab;
          const count = tab === 'vigentes' ? vigentes.length : historial.length;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: on ? C.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: on ? C.primary : C.gray400,
                }}
              >
                {tab === 'vigentes' ? `Vigentes${data ? ` ${count}` : ''}` : 'Historial'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 15, color: C.dangerText, textAlign: 'center' }}>
            No se pudo cargar las autorizaciones.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={list.length === 0 ? { flex: 1 } : { padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={C.primary}
            />
          }
        >
          {list.length === 0 ? (
            activeTab === 'vigentes' ? (
              <EmptyState
                icon="people-outline"
                title="Sin visitantes vigentes"
                subtitle="Autoriza una visita con el boton +"
              />
            ) : (
              <EmptyState
                icon="time-outline"
                title="Sin historial"
                subtitle="Aqui apareceran los visitantes anteriores"
              />
            )
          ) : (
            list.map((item) => <VisitorCard key={item.id} item={item} />)
          )}
        </ScrollView>
      )}

      <BottomNav items={NAV_ITEMS} active={1} />
    </SafeAreaView>
  );
}
