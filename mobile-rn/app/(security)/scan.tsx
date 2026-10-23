import { C } from '@/src/core/theme/tokens';
import { Button } from '@/src/shared/components';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ScanResult {
  data: string;
  type: string;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanned, setScanned] = useState(false);

  function handleScan({ data, type }: { data: string; type: string }) {
    if (scanned) return;
    setScanned(true);
    setResult({ data, type });
  }

  function handleClose() {
    setResult(null);
    setScanned(false);
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#16140E' }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#16140E', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.4)" />
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 20, textAlign: 'center', letterSpacing: -0.3 }}>
          Acceso a camara requerido
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 10, textAlign: 'center', lineHeight: 20 }}>
          Para escanear codigos QR de visitantes necesitamos acceder a tu camara
        </Text>
        <View style={{ marginTop: 28, alignSelf: 'stretch' }}>
          <Button variant="onDark" onPress={requestPermission}>
            Permitir acceso a camara
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#16140E' }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={handleScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay */}
      <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' }}>
        {/* Top bar */}
        <SafeAreaView>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
            <Pressable
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
              hitSlop={8}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Text style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 }}>
              Escanear QR
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        {/* Center viewfinder */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 240, height: 240, position: 'relative' }}>
            {/* Dark overlay sides */}
            {/* Corner brackets */}
            {/* Top-left */}
            <View style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#fff', borderTopLeftRadius: 4 }} />
            {/* Top-right */}
            <View style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#fff', borderTopRightRadius: 4 }} />
            {/* Bottom-left */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#fff', borderBottomLeftRadius: 4 }} />
            {/* Bottom-right */}
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#fff', borderBottomRightRadius: 4 }} />
          </View>
        </View>

        {/* Bottom hint */}
        <View style={{ alignItems: 'center', paddingBottom: 60, paddingHorizontal: 32 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'center', letterSpacing: 0.2 }}>
            Apunta al codigo QR del visitante
          </Text>
        </View>
      </View>

      {/* Result modal */}
      <Modal visible={!!result} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <View
            style={{
              backgroundColor: C.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: C.successBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Ionicons name="checkmark-circle" size={26} color={C.successText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.gray900 }}>QR leido</Text>
                <Text style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>Verificar autorizacion de ingreso</Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: C.gray50,
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: C.gray200,
              }}
            >
              <Text style={{ fontSize: 12, color: C.gray500, marginBottom: 4 }}>Datos escaneados</Text>
              <Text style={{ fontSize: 14, color: C.gray800, fontWeight: '600' }} numberOfLines={3}>
                {result?.data ?? ''}
              </Text>
            </View>

            <Button
              variant="primary"
              size="lg"
              style={{ marginBottom: 10 }}
              onPress={handleClose}
            >
              Autorizar ingreso
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onPress={handleClose}
            >
              Rechazar
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Inline StyleSheet to avoid extra import when using absoluteFillObject
const StyleSheet = {
  absoluteFillObject: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};
