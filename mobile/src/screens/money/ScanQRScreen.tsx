import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [result, setResult] = useState('')

  if (!permission) return <View style={styles.center}><Text>Camera loading…</Text></View>
  if (!permission.granted) return <View style={styles.center}><Text style={styles.title}>QR scan-এর জন্য camera permission দিন</Text><TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Allow Camera</Text></TouchableOpacity></View>

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : ({ data }) => { setScanned(true); setResult(data) }}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanBox} />
        <Text style={styles.hint}>QR code-এর দিকে camera ধরুন</Text>
      </View>
      {result ? <View style={styles.result}><Ionicons name="checkmark-circle" size={28} color="#36ACE7" /><Text style={styles.resultText}>QR scanned</Text><Text numberOfLines={2} style={styles.data}>{result}</Text></View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { textAlign: 'center', fontSize: 17, marginBottom: 18, color: '#1F2937' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanBox: { width: 230, height: 230, borderWidth: 3, borderColor: '#36ACE7', borderRadius: 20 },
  hint: { marginTop: 24, color: '#fff', fontSize: 16, fontWeight: '600' },
  result: { position: 'absolute', left: 20, right: 20, bottom: 30, padding: 18, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center' },
  resultText: { marginTop: 6, color: '#36ACE7', fontSize: 18, fontWeight: '700' },
  data: { marginTop: 8, color: '#4B5563', textAlign: 'center' },
  button: { paddingHorizontal: 24, paddingVertical: 13, borderRadius: 24, backgroundColor: '#36ACE7' },
  buttonText: { color: '#fff', fontWeight: '700' },
})
