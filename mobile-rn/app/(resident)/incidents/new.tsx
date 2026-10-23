import apiClient from '@/src/core/api/client';
import { C } from '@/src/core/theme/tokens';
import type { BadgeTone } from '@/src/core/theme/tokens';
import { AppBar, Badge, Button, Input } from '@/src/shared/components';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tipo = 'ruido' | 'vandalismo' | 'intrusion' | 'accidente' | 'otro';
type Severidad = 'baja' | 'media' | 'alta' | 'critica';

const TIPO_OPTIONS: { value: Tipo; label: string }[] = [
  { value: 'ruido', label: 'Ruido' },
  { value: 'vandalismo', label: 'Vandalismo' },
  { value: 'intrusion', label: 'Intrusión' },
  { value: 'accidente', label: 'Accidente' },
  { value: 'otro', label: 'Otro' },
];

interface SevOpt {
  value: Severidad;
  label: string;
  tone: BadgeTone;
}

const SEVERIDAD_OPTIONS: SevOpt[] = [
  { value: 'baja', label: 'Baja', tone: 'neutral' },
  { value: 'media', label: 'Media', tone: 'warning' },
  { value: 'alta', label: 'Alta', tone: 'danger' },
  { value: 'critica', label: 'Crítica', tone: 'danger' },
];

export default function NewIncidentScreen() {
  const [tipo, setTipo] = useState<Tipo | null>(null);
  const [severidad, setSeveridad] = useState<Severidad | null>(null);
  const [ubicacion, setUbicacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipoModalVisible, setTipoModalVisible] = useState(false);
  const [error, setError] = useState('');

  const tipoLabel = tipo ? TIPO_OPTIONS.find(o => o.value === tipo)?.label ?? tipo : '';

  async function handleSubmit() {
    if (!tipo) { setError('Selecciona el tipo de novedad.'); return; }
    if (!descripcion.trim()) { setError('Ingresa la descripción.'); return; }
    setError('');
    setLoading(true);
    try {
      const body: any = {
        tipo: 'incidente',
        asunto: `Novedad: ${tipoLabel}`,
        descripcion,
        ubicacion: ubicacion || undefined,
        severidad: severidad || undefined,
      };
      const res = await apiClient.post('/pqrs', body);
      const radicado = res.data?.numero_radicado ?? '';
      router.replace({ pathname: '/(resident)/incidents/success', params: { radicado } } as any);
    } catch {
      setError('No se pudo reportar la novedad. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Reportar novedad" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tipo selector */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.gray700, marginBottom: 6 }}>Tipo de novedad</Text>
          <Pressable onPress={() => setTipoModalVisible(true)}>
            <View style={{
              minHeight: 52,
              backgroundColor: C.white,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: C.gray200,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 10,
            }}>
              <Text style={{ flex: 1, fontSize: 16, color: tipo ? C.gray900 : C.gray400 }}>
                {tipo ? tipoLabel : 'Selecciona el tipo'}
              </Text>
              <Text style={{ color: C.gray400, fontSize: 16 }}>▾</Text>
            </View>
          </Pressable>
        </View>

        {/* Severidad chips */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.gray700, marginBottom: 8 }}>Severidad</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SEVERIDAD_OPTIONS.map(opt => {
              const on = severidad === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSeveridad(opt.value)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: on ? C.primary : C.gray200,
                    backgroundColor: on ? C.primarySoft : C.white,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: on ? C.primaryDark : C.gray600 }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="Ubicación"
          placeholder="¿Dónde ocurrió?"
          value={ubicacion}
          onChangeText={setUbicacion}
          icon="location-outline"
          style={{ marginBottom: 16 }}
        />

        <Input
          label="Descripción"
          placeholder="Describe la novedad con detalle..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          style={{ marginBottom: 16 }}
        />

        {error ? (
          <Text style={{ fontSize: 13, color: C.dangerText, marginBottom: 8 }}>{error}</Text>
        ) : null}
      </ScrollView>

      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 36,
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: C.gray100,
      }}>
        <Button variant="primary" loading={loading} onPress={handleSubmit}>
          Reportar novedad
        </Button>
      </View>

      {/* Tipo picker modal */}
      <Modal
        visible={tipoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTipoModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setTipoModalVisible(false)}
        >
          <View style={{ backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 36 }}>
            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.gray200 }} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.gray900, paddingHorizontal: 20, marginBottom: 12 }}>
              Tipo de novedad
            </Text>
            {TIPO_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                onPress={() => { setTipo(opt.value); setTipoModalVisible(false); }}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: pressed ? C.gray50 : C.white,
                }]}
              >
                <Text style={{ flex: 1, fontSize: 16, color: C.gray900 }}>{opt.label}</Text>
                {tipo === opt.value && (
                  <Text style={{ fontSize: 16, color: C.primary }}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
