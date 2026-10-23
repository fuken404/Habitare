import { C } from '@/src/core/theme/tokens';
import { AppBar, Banner, Button, Input } from '@/src/shared/components';
import apiClient from '@/src/core/api/client';
import { useAuthStore } from '@/src/core/auth/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOC_TYPES = ['CC', 'CE', 'PA', 'TI'];

interface CreateAutorizacionBody {
  visitante: {
    tipo_documento: string;
    n_documento: string;
    nombre: string;
    apellido: string;
  };
  unidad_id: string;
  fecha_visita: string;
  requiere_parqueadero: boolean;
  vehiculos: never[];
}

export default function CreateVisitorScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [fechaVisita, setFechaVisita] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showDocTypes, setShowDocTypes] = useState(false);

  const mutation = useMutation({
    mutationFn: (body: CreateAutorizacionBody) =>
      apiClient.post('/visitors/autorizaciones', body).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] });
      router.replace('/(resident)/visitors' as any);
    },
  });

  function handleSubmit() {
    if (!user?.unidadId) return;
    mutation.mutate({
      visitante: {
        tipo_documento: docType,
        n_documento: docNumber,
        nombre,
        apellido,
      },
      unidad_id: user.unidadId,
      fecha_visita: fechaVisita,
      requiere_parqueadero: false,
      vehiculos: [],
    });
  }

  const canSubmit =
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    docNumber.trim().length > 0 &&
    fechaVisita.trim().length === 10 &&
    !!user?.unidadId;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <AppBar title="Autorizar visita" back />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 14 }}>
          {mutation.isError && (
            <Banner
              tone="danger"
              title="No se pudo crear la autorizacion"
              body="Verifica los datos e intenta de nuevo."
            />
          )}

          <Input
            label="Nombre"
            placeholder="Nombre del visitante"
            value={nombre}
            onChangeText={setNombre}
            icon="person-outline"
          />

          <Input
            label="Apellido"
            placeholder="Apellido del visitante"
            value={apellido}
            onChangeText={setApellido}
            icon="person-outline"
          />

          {/* Doc type + number */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ width: 100 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.gray700, marginBottom: 6 }}>
                Tipo doc.
              </Text>
              <Pressable
                onPress={() => setShowDocTypes((v) => !v)}
                style={{
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.gray200,
                  backgroundColor: C.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{ fontSize: 15, color: C.gray900, fontWeight: '500' }}>{docType}</Text>
                <Ionicons name="chevron-down" size={16} color={C.gray400} />
              </Pressable>
              {showDocTypes && (
                <View
                  style={{
                    position: 'absolute',
                    top: 74,
                    left: 0,
                    right: 0,
                    backgroundColor: C.white,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: C.gray200,
                    zIndex: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {DOC_TYPES.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => { setDocType(t); setShowDocTypes(false); }}
                      style={{ paddingVertical: 12, paddingHorizontal: 14 }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: t === docType ? C.primary : C.gray900,
                          fontWeight: t === docType ? '600' : '400',
                        }}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Input
                label="Numero"
                placeholder="Numero de documento"
                value={docNumber}
                onChangeText={setDocNumber}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Fecha de visita"
            placeholder="YYYY-MM-DD"
            value={fechaVisita}
            onChangeText={setFechaVisita}
            icon="calendar-outline"
          />

          <Input
            label="Observaciones (opcional)"
            placeholder="Notas para la porteria"
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
          />
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 36,
          backgroundColor: C.bg,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!canSubmit || mutation.isPending}
          loading={mutation.isPending}
        >
          Autorizar visita
        </Button>
      </View>
    </SafeAreaView>
  );
}
