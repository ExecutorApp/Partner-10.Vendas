// ========================================
// Tela Principal da Camera
// Foto e gravacao de video
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Alert, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler, TapGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraConfig } from './utils/cameraConstants';
import { ANIMATION_DURATION, createEnterAnimation } from './utils/cameraAnimations';
import { hapticLight, hapticMedium, hapticCapture, hapticRecordingStart, hapticRecordingStop } from './utils/cameraHaptics';

// ========================================
// Imports de Componentes
// ========================================
import { CloseIcon, FlashIcon, FlipIcon } from './components/CameraIcons';
import GalleryCarousel from './components/GalleryCarousel';

// ========================================
// Imports de Tipos
// ========================================
import { CameraScreenProps } from './types/camera';

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  CameraScreen: CameraScreenProps;
  PhotoPreviewScreen: { photoUri: string; photoWidth: number; photoHeight: number; leadName: string; leadId: string; leadPhone: string };
  VideoPreviewScreen: { videoUri: string; duration: number; leadName: string; leadId: string; leadPhone: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'CameraScreen'>;
type CameraRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;

// ========================================
// Constantes
// ========================================
const ZOOM_LEVELS = [{ label: '0.5x', value: 0 }, { label: '1x', value: 0.25 }, { label: '2x', value: 0.5 }];
const FOCUS_SIZE = 70;
const FOCUS_DURATION = 1500;
const MAX_RECORDING_DURATION = 60;

// ========================================
// Tipo do Ponto de Foco
// ========================================
interface FocusPoint { x: number; y: number; visible: boolean }

// ========================================
// Formatar tempo (mm:ss)
// ========================================
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ========================================
// Componente Indicador de Foco
// ========================================
const FocusIndicator: React.FC<{ point: FocusPoint; scaleAnim: Animated.Value; opacityAnim: Animated.Value }> = ({ point, scaleAnim, opacityAnim }) => {
  if (!point.visible) return null;
  return (
    <Animated.View style={[styles.focusIndicator, { left: point.x - FOCUS_SIZE / 2, top: point.y - FOCUS_SIZE / 2, transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <View style={[styles.focusCorner, styles.focusCornerTL]} />
      <View style={[styles.focusCorner, styles.focusCornerTR]} />
      <View style={[styles.focusCorner, styles.focusCornerBL]} />
      <View style={[styles.focusCorner, styles.focusCornerBR]} />
    </Animated.View>
  );
};

// ========================================
// Componente Indicador de Gravacao
// ========================================
const RecordingIndicator: React.FC<{ duration: number; pulseAnim: Animated.Value }> = ({ duration, pulseAnim }) => (
  <View style={styles.recordingIndicator}>
    <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
    <Text style={styles.recordingTime}>{formatTime(duration)}</Text>
  </View>
);

// ========================================
// Componente Principal CameraScreen
// ========================================
const CameraScreen: React.FC = () => {
  console.log('📷 [CameraScreen] Componente montando...');
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CameraRouteProp>();
  const insets = useSafeAreaInsets();
  const { leadId, leadName, leadPhone } = route.params || {};
  console.log('📷 [CameraScreen] Params recebidos:', { leadId, leadName, leadPhone });
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  console.log('📷 [CameraScreen] Permissões:', { camera: cameraPermission?.granted, mic: micPermission?.granted });

  // ========================================
  // Estados de Camera
  // ========================================
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [zoom, setZoom] = useState(0.25);
  const [zoomLevelIndex, setZoomLevelIndex] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<FocusPoint>({ x: 0, y: 0, visible: false });

  // ========================================
  // Estados de Gravacao
  // ========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // ========================================
  // Refs
  // ========================================
  const cameraRef = useRef<CameraView>(null);
  const baseZoom = useRef(0.25);
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const focusScaleAnim = useRef(new Animated.Value(1.5)).current;
  const focusOpacityAnim = useRef(new Animated.Value(1)).current;
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // Animacoes de Entrada
  // ========================================
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const controlsTranslateY = useRef(new Animated.Value(30)).current;
  const galleryOpacity = useRef(new Animated.Value(0)).current;
  const galleryTranslateY = useRef(new Animated.Value(20)).current;

  // ========================================
  // Solicitar Permissoes ao Montar
  // ========================================
  useEffect(() => {
    console.log('📷 [CameraScreen] useEffect de permissões executando...');
    console.log('📷 [CameraScreen] cameraPermission:', cameraPermission);
    console.log('📷 [CameraScreen] micPermission:', micPermission);
    if (!cameraPermission?.granted) {
      console.log('📷 [CameraScreen] Solicitando permissão da câmera...');
      requestCameraPermission().then((result) => {
        console.log('📷 [CameraScreen] Resultado permissão câmera:', result);
      }).catch((err) => {
        console.log('📷 [CameraScreen] ERRO ao solicitar permissão câmera:', err);
      });
    }
    if (!micPermission?.granted) {
      console.log('📷 [CameraScreen] Solicitando permissão do microfone...');
      requestMicPermission().then((result) => {
        console.log('📷 [CameraScreen] Resultado permissão microfone:', result);
      }).catch((err) => {
        console.log('📷 [CameraScreen] ERRO ao solicitar permissão microfone:', err);
      });
    }
  }, [cameraPermission, requestCameraPermission, micPermission, requestMicPermission]);

  // ========================================
  // Animacoes de Entrada ao Montar
  // ========================================
  useEffect(() => {
    const enterAnimations = Animated.stagger(100, [
      createEnterAnimation(headerOpacity, headerTranslateY, ANIMATION_DURATION.normal),
      createEnterAnimation(controlsOpacity, controlsTranslateY, ANIMATION_DURATION.normal),
      createEnterAnimation(galleryOpacity, galleryTranslateY, ANIMATION_DURATION.normal),
    ]);
    enterAnimations.start();
  }, [headerOpacity, headerTranslateY, controlsOpacity, controlsTranslateY, galleryOpacity, galleryTranslateY]);

  // ========================================
  // Cleanup ao desmontar
  // ========================================
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // ========================================
  // Animacao de pulsar durante gravacao
  // ========================================
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // ========================================
  // Handlers Basicos
  // ========================================
  const handleClose = useCallback(() => navigation.goBack(), [navigation]);

  const handleToggleFlash = useCallback(() => {
    hapticMedium();
    setFlash(c => c === 'auto' ? 'on' : c === 'on' ? 'off' : 'auto');
  }, []);

  const handleFlipCamera = useCallback(() => {
    hapticMedium();
    setFacing(c => c === 'back' ? 'front' : 'back');
  }, []);

  // ========================================
  // Handler de Zoom
  // ========================================
  const handleToggleZoom = useCallback(() => {
    hapticLight();
    Animated.sequence([
      Animated.timing(zoomAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(zoomAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setZoomLevelIndex(c => {
      const next = (c + 1) % ZOOM_LEVELS.length;
      setZoom(ZOOM_LEVELS[next].value);
      baseZoom.current = ZOOM_LEVELS[next].value;
      return next;
    });
  }, [zoomAnim]);

  const handlePinchGesture = useCallback((e: PinchGestureHandlerGestureEvent) => {
    if (e.nativeEvent.state === State.ACTIVE) {
      let newZ = Math.max(0, Math.min(1, baseZoom.current * e.nativeEvent.scale));
      setZoom(newZ);
      setZoomLevelIndex(newZ < 0.15 ? 0 : newZ < 0.4 ? 1 : 2);
    }
    if (e.nativeEvent.state === State.END) baseZoom.current = zoom;
  }, [zoom]);

  // ========================================
  // Handler de Foco
  // ========================================
  const handleTapToFocus = useCallback((e: TapGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.state === State.ACTIVE && !isRecording) {
      const { x, y } = e.nativeEvent;
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusScaleAnim.setValue(1.5);
      focusOpacityAnim.setValue(1);
      setFocusPoint({ x, y, visible: true });
      Animated.spring(focusScaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();
      focusTimeoutRef.current = setTimeout(() => {
        Animated.timing(focusOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          setFocusPoint(p => ({ ...p, visible: false }));
        });
      }, FOCUS_DURATION);
    }
  }, [focusScaleAnim, focusOpacityAnim, isRecording]);

  // ========================================
  // Handler de Captura de Foto
  // ========================================
  const handleCapturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing || isRecording) return;
    setIsCapturing(true);
    hapticCapture();
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: CameraConfig.photoQuality, skipProcessing: false });
      if (photo) {
        navigation.navigate('PhotoPreviewScreen', { photoUri: photo.uri, photoWidth: photo.width, photoHeight: photo.height, leadName: leadName || '', leadId: leadId || '', leadPhone: leadPhone || '' });
      }
    } catch (e) {
      console.error('[CameraScreen] Erro foto:', e);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isRecording, navigation, leadName, leadId, leadPhone]);

  // ========================================
  // Handlers de Gravacao de Video
  // ========================================
  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;
    hapticRecordingStart();
    setIsRecording(true);
    setRecordingDuration(0);

    // Timer de duracao
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= MAX_RECORDING_DURATION - 1) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: MAX_RECORDING_DURATION });
      if (video) {
        navigation.navigate('VideoPreviewScreen' as any, { videoUri: video.uri, duration: recordingDuration, leadName: leadName || '', leadId: leadId || '', leadPhone: leadPhone || '' });
      }
    } catch (e) {
      console.error('[CameraScreen] Erro video:', e);
    }
  }, [isRecording, navigation, leadName, leadId, leadPhone, recordingDuration]);

  const stopRecording = useCallback(() => {
    hapticRecordingStop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    setIsRecording(false);
  }, [isRecording]);

  // ========================================
  // Handlers de Press no Botao
  // ========================================
  const handlePressIn = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      startRecording();
    }, 500); // 500ms para iniciar gravacao
  }, [startRecording]);

  const handlePressOut = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    } else {
      handleCapturePhoto();
    }
  }, [isRecording, stopRecording, handleCapturePhoto]);

  // ========================================
  // Handler de Galeria
  // ========================================
  const handleSelectFromGallery = useCallback((asset: { uri: string; width: number; height: number }) => {
    navigation.navigate('PhotoPreviewScreen', { photoUri: asset.uri, photoWidth: asset.width, photoHeight: asset.height, leadName: leadName || '', leadId: leadId || '', leadPhone: leadPhone || '' });
  }, [navigation, leadName, leadId, leadPhone]);

  const handleOpenGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 1, allowsEditing: false });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      if (a.type === 'video') {
        navigation.navigate('VideoPreviewScreen' as any, { videoUri: a.uri, duration: a.duration || 0, leadName: leadName || '', leadId: leadId || '', leadPhone: leadPhone || '' });
      } else {
        navigation.navigate('PhotoPreviewScreen', { photoUri: a.uri, photoWidth: a.width || 1080, photoHeight: a.height || 1920, leadName: leadName || '', leadId: leadId || '', leadPhone: leadPhone || '' });
      }
    }
  }, [navigation, leadName, leadId, leadPhone]);

  // ========================================
  // Render de Permissao
  // ========================================
  console.log('📷 [CameraScreen] Verificando permissões para render...');
  console.log('📷 [CameraScreen] cameraPermission:', cameraPermission);
  console.log('📷 [CameraScreen] micPermission:', micPermission);
  const hasPermission = cameraPermission?.granted && micPermission?.granted;
  console.log('📷 [CameraScreen] hasPermission:', hasPermission);
  if (!cameraPermission || !micPermission) {
    console.log('📷 [CameraScreen] Renderizando tela de carregamento (permissões ainda não carregadas)');
    return <View style={styles.permissionContainer}><Text style={styles.permissionText}>Carregando...</Text></View>;
  }
  if (!hasPermission) {
    console.log('📷 [CameraScreen] Renderizando tela de solicitação de permissão');
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Precisamos de acesso à câmera e microfone</Text>
        <Pressable style={styles.permissionButton} onPress={() => { requestCameraPermission(); requestMicPermission(); }}><Text style={styles.permissionButtonText}>Permitir</Text></Pressable>
        <Pressable style={[styles.permissionButton, styles.permissionButtonSecondary]} onPress={handleClose}><Text style={styles.permissionButtonTextSecondary}>Voltar</Text></Pressable>
      </View>
    );
  }
  console.log('📷 [CameraScreen] Renderizando câmera principal');

  // ========================================
  // Render Principal
  // ========================================
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <TapGestureHandler onHandlerStateChange={handleTapToFocus}>
        <PinchGestureHandler onGestureEvent={handlePinchGesture}>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} zoom={zoom} mode={isRecording ? 'video' : 'picture'}>
              <FocusIndicator point={focusPoint} scaleAnim={focusScaleAnim} opacityAnim={focusOpacityAnim} />

              {/* Indicador de Gravacao */}
              {isRecording && <RecordingIndicator duration={recordingDuration} pulseAnim={pulseAnim} />}

              {/* Header */}
              <Animated.View style={[styles.headerAnimated, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
                <SafeAreaView style={styles.header}>
                  <Pressable style={styles.headerButton} onPress={handleClose} hitSlop={12} disabled={isRecording}><CloseIcon /></Pressable>
                  <View style={styles.headerSpacer} />
                  <Pressable style={styles.headerButton} onPress={handleToggleFlash} hitSlop={12} disabled={isRecording}><FlashIcon mode={flash} /></Pressable>
                </SafeAreaView>
              </Animated.View>

              {/* Zoom Button */}
              {!isRecording && (
                <View style={styles.zoomContainer}>
                  <Animated.View style={{ transform: [{ scale: zoomAnim }] }}>
                    <Pressable style={styles.zoomButton} onPress={handleToggleZoom} hitSlop={12}>
                      <Text style={styles.zoomButtonText}>{ZOOM_LEVELS[zoomLevelIndex].label}</Text>
                    </Pressable>
                  </Animated.View>
                </View>
              )}

              {/* Controls */}
              <Animated.View style={[styles.controls, { paddingBottom: insets.bottom + 20, opacity: controlsOpacity, transform: [{ translateY: controlsTranslateY }] }]}>
                <View style={styles.controlSpacer} />
                <Pressable style={[styles.captureButton, isRecording && styles.captureButtonRecording]} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isCapturing}>
                  <View style={[styles.captureButtonInner, isRecording && styles.captureButtonInnerRecording]} />
                </Pressable>
                <View style={styles.controlSpacer}>
                  {!isRecording && <Pressable style={styles.flipButton} onPress={handleFlipCamera} hitSlop={12}><FlipIcon /></Pressable>}
                </View>
              </Animated.View>
            </CameraView>

            {/* Gallery Carousel */}
            {!isRecording && (
              <Animated.View style={[styles.galleryContainer, { opacity: galleryOpacity, transform: [{ translateY: galleryTranslateY }] }]}>
                <GalleryCarousel onSelectPhoto={handleSelectFromGallery} onOpenGallery={handleOpenGallery} />
              </Animated.View>
            )}
          </View>
        </PinchGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CameraColors.cameraBackground },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  headerAnimated: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  headerButton: { width: 44, height: 44, borderRadius: CameraStyles.borderRadiusButton, backgroundColor: CameraColors.overlayLight, justifyContent: 'center', alignItems: 'center' },
  headerSpacer: { flex: 1 },
  zoomContainer: { position: 'absolute', bottom: 260, left: 0, right: 0, alignItems: 'center' },
  zoomButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: CameraColors.overlayLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  zoomButtonText: { fontSize: 12, fontWeight: '600', color: CameraColors.textWhite },
  focusIndicator: { position: 'absolute', width: FOCUS_SIZE, height: FOCUS_SIZE, zIndex: 100 },
  focusCorner: { position: 'absolute', width: 20, height: 20, borderColor: CameraColors.flashYellow, borderWidth: 2 },
  focusCornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  focusCornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  focusCornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  focusCornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  recordingIndicator: { position: 'absolute', top: 100, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  recordingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: CameraColors.recordingRed },
  recordingTime: { fontSize: 16, fontWeight: '600', color: CameraColors.textWhite },
  controls: { position: 'absolute', bottom: 80, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 },
  controlSpacer: { width: 60, alignItems: 'center' },
  captureButton: { width: CameraStyles.captureButtonSize, height: CameraStyles.captureButtonSize, borderRadius: CameraStyles.captureButtonSize / 2, borderWidth: 4, borderColor: CameraColors.captureButtonBorder, backgroundColor: CameraColors.captureButton, justifyContent: 'center', alignItems: 'center' },
  captureButtonRecording: { borderColor: CameraColors.recordingRed },
  captureButtonInner: { width: CameraStyles.captureButtonInnerSize, height: CameraStyles.captureButtonInnerSize, borderRadius: CameraStyles.captureButtonInnerSize / 2, backgroundColor: CameraColors.captureButtonInner },
  captureButtonInnerRecording: { width: 28, height: 28, borderRadius: 6, backgroundColor: CameraColors.recordingRed },
  flipButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: CameraColors.overlayLight, justifyContent: 'center', alignItems: 'center' },
  galleryContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  permissionContainer: { flex: 1, backgroundColor: CameraColors.cameraBackground, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { fontSize: 16, color: CameraColors.textWhite, textAlign: 'center', marginBottom: 24 },
  permissionButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: CameraStyles.borderRadiusButton, backgroundColor: CameraColors.primary, marginBottom: 12 },
  permissionButtonText: { fontSize: 16, color: CameraColors.textWhite, fontWeight: '600' },
  permissionButtonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: CameraColors.textWhite },
  permissionButtonTextSecondary: { fontSize: 16, color: CameraColors.textWhite, fontWeight: '600' },
});

export default CameraScreen;
