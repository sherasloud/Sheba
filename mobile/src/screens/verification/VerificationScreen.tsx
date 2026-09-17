import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import Ionicons from 'react-native-vector-icons/Ionicons'

const { width, height } = Dimensions.get('window')

export default function VerificationScreen() {
  const navigation = useNavigation()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions()

  const [step, setStep] = useState<'nid' | 'camera' | 'preview' | 'face'>('nid')
  const [nidNumber, setNidNumber] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)

  // Request camera permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
    if (!mediaLibraryPermission?.granted) {
      requestMediaLibraryPermission()
    }
  }, [])

  const validateNID = (nid: string) => {
    const nidRegex = /^\d{10,17}$/
    return nidRegex.test(nid.replace(/\s/g, ''))
  }

  const handleNIDContinue = () => {
    if (!nidNumber.trim()) {
      setError('Please enter your NID number')
      return
    }

    if (!validateNID(nidNumber)) {
      setError('Invalid NID format. NID should be 10-17 digits')
      return
    }

    setError('')
    setStep('camera')
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    setIsLoading(true)
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      })

      if (photo) {
        setCapturedImage(photo.uri)
        setStep('preview')
      }
    } catch (err) {
      setError('Failed to capture photo')
      console.error('[v0] Camera error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setStep('camera')
  }

  const handleConfirmImage = async () => {
    setIsLoading(true)
    try {
      // In production, you would send the image to your backend
      console.log('[v0] NID Image captured:', capturedImage)
      console.log('[v0] NID Number:', nidNumber)

      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          'Success',
          'NID verification submitted. Please proceed to facial verification.',
          [
            {
              text: 'Continue',
              onPress: () => {
                setStep('face')
                setIsLoading(false)
              },
            },
          ]
        )
      }, 1500)
    } catch (err) {
      setError('Failed to upload image')
      console.error('[v0] Upload error:', err)
      setIsLoading(false)
    }
  }

  const handleFacialVerification = () => {
    setIsLoading(true)
    setTimeout(() => {
      Alert.alert(
        'Verification Submitted',
        'Your verification request has been submitted. Admin will review and approve within 24 hours.',
        [
          {
            text: 'Go Home',
            onPress: () => {
              navigation.navigate('Home' as any)
            },
          },
        ]
      )
      setIsLoading(false)
    }, 1000)
  }

  // Step 1: NID Input
  if (step === 'nid') {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>NID Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Ionicons name="id-card" size={80} color="#3B82F6" style={styles.icon} />
          <Text style={styles.stepTitle}>Enter Your NID Number</Text>
          <Text style={styles.stepSubtitle}>
            This helps us verify your identity
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>National ID Number</Text>
            <View
              style={[
                styles.input,
                error ? styles.inputError : null,
              ]}
            >
              <Ionicons name="id-card-outline" size={18} color="#9CA3AF" />
              <Text
                style={[
                  styles.inputPlaceholder,
                  nidNumber && styles.inputText,
                ]}
              >
                {nidNumber || '1234567890123'}
              </Text>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.hint}>Enter your 10-17 digit NID</Text>
          </View>

          <TouchableOpacity
            style={styles.numericPad}
            onPress={() =>
              setNidNumber(nidNumber.slice(0, -1))
            }
          >
            <View style={styles.numericGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    if (nidNumber.length < 17) {
                      setNidNumber(nidNumber + num)
                      setError('')
                    }
                  }}
                  style={styles.numericButton}
                >
                  <Text style={styles.numericButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNIDContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // Step 2: Camera Capture
  if (step === 'camera') {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Camera permission not granted</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />

        {/* Camera Overlay */}
        <View style={styles.cameraOverlay}>
          <TouchableOpacity
            onPress={() => {
              setCapturedImage(null)
              setStep('nid')
            }}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.cameraInstruction}>
            Position your NID in the frame
          </Text>

          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                (!cameraReady || isLoading) && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={!cameraReady || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  // Step 3: Preview
  if (step === 'preview') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleRetake}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Review Photo</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.previewContainer}>
          {capturedImage && (
            <View style={styles.previewImage}>
              <Text style={styles.previewPlaceholder}>
                [NID Photo Preview]
              </Text>
            </View>
          )}

          <View style={styles.previewInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="id-card" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>NID: {nidNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.infoText}>Photo captured clearly</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRetake}
          >
            <Ionicons name="camera-reverse" size={20} color="#3B82F6" />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Retake
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleConfirmImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Confirm</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // Step 4: Facial Verification
  if (step === 'face') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={styles.title}>Facial Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Ionicons name="face" size={80} color="#10B981" style={styles.icon} />
          <Text style={styles.stepTitle}>Facial Verification</Text>
          <Text style={styles.stepSubtitle}>
            Let's verify your identity with a face scan
          </Text>

          <View style={styles.facialSteps}>
            <View style={styles.facialStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Good lighting</Text>
            </View>
            <View style={styles.facialStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Clear face</Text>
            </View>
            <View style={styles.facialStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Face in frame</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleFacialVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>Start Facial Scan</Text>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  inputText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
  },
  numericPad: {
    width: '100%',
    marginBottom: 32,
  },
  numericGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numericButton: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  numericButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#3B82F6',
  },
  buttonGroup: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInstruction: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  previewContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  previewImage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 250,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  previewInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
  },
  facialSteps: {
    width: '100%',
    marginBottom: 40,
  },
  facialStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  stepText: {
    fontSize: 14,
    color: '#1F2937',
  },
})
