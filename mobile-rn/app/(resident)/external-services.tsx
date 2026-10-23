import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, Button, Card, EmptyState, Input } from '@/src/shared/components';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ESTADO_TONE: Record<string, BadgeTone> = {
  activo: 'success',
  pendiente: 'warning',
  finalizado: 'neutral',
  cancelado: 'danger',
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function ExternalServicesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: personnel = [], isLoading, refetch } = useQuery({
    queryKey: ['external-personnel'],
    queryFn: () => apiClient.get('/external-personnel').then(r => r.data as any[]),
  });

  function openModal() {
    setNombre('');
    setEmpresa('');
    setMotivo('');
    setFormError('');
    setModalVisible(true);
  }

  async function handleSubmit() {
    if (!nombre.trim()) { setFormError('Ingresa el nombre.'); return; }
    if (!motivo.trim()) { setFormError('Ingresa el motivo.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      await apiClient.post('/external-personnel', { nombre, empresa, motivo });
      setModalVisible(false);
      refetch();
    } catch {
      setFormError('No se pudo registrar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Servicios externos" back />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : personnel.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title="Sin personal externo"
          subtitle="Registra el ingreso de proveedores, técnicos u otros servicios externos."
          cta="Registrar ingreso"
          onCta={openModal}
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={C.primary} />}
        >
          {personnel.map((p: any) => (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.gray900 }}>{p.nombre}</Text>
                  {p.empresa && (
                    <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>{p.empresa}</Text>
                  )}
                  <Text style={{ fontSize: 13, color: C.gray600, marginTop: 4 }}>{p.motivo}</Text>
                </View>
                <Badge tone={ESTADO_TONE[p.estado] ?? 'neutral'}>
                  {p.estado ?? '—'}
                </Badge>
              </View>
              {p.hora_entrada && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Ionicons name="time-outline" size={13} color={C.gray500} />
                  <Text style={{ fontSize: 12, color: C.gray500 }}>
                    Ingreso: {formatTime(p.hora_entrada)}
                    {p.hora_salida ? ` · Salida: ${formatTime(p.hora_salida)}` : ''}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={openModal}
        style={({ pressed }) => [{
          position: 'absolute',
          bottom: 36,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: C.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
          elevation: 6,
          opacity: pressed ? 0.85 : 1,
        }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Register modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{ backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, gap: 14 }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.gray200 }} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.gray900 }}>
              Registrar servicio externo
            </Text>
            <Input
              label="Nombre"
              placeholder="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              icon="person-outline"
            />
            <Input
              label="Empresa"
              placeholder="Empresa u organización (opcional)"
              value={empresa}
              onChangeText={setEmpresa}
              icon="business-outline"
            />
            <Input
              label="Motivo"
              placeholder="¿Para qué viene?"
              value={motivo}
              onChangeText={setMotivo}
              icon="clipboard-outline"
            />
            {formError ? (
              <Text style={{ fontSize: 13, color: C.dangerText }}>{formError}</Text>
            ) : null}
            <Button variant="primary" loading={submitting} onPress={handleSubmit}>
              Registrar ingreso
            </Button>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
