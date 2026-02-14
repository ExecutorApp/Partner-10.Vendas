// ========================================
// Componente CameraModal
// Modal overlay para capturar multiplas fotos/videos
// Copiado do WebCameraModal, sem galeria
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { View, Text, Pressable, Modal, Image, StyleSheet, StatusBar, TouchableOpacity as RNTouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler, TapGestureHandlerStateChangeEvent, State, TouchableOpacity } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraConfig, CameraStyles, CameraIcons } from '../utils/cameraConstants';
import { hapticLight, hapticMedium, hapticCapture, hapticRecordingStart, hapticRecordingStop } from '../utils/cameraHaptics';

// ========================================
// Constantes
// ========================================
const MAX_CAPTURES = 30;                  //......Maximo de capturas por sessao
const FOCUS_SIZE = 70;                    //......Tamanho do indicador de foco
const FOCUS_DURATION = 1500;              //......Duracao do indicador visivel
const MAX_RECORDING_DURATION = 60;        //......Duracao maxima de video
const CONTROL_BG = '#303030';               //......Fundo chumbo solido (padrao do sistema)
const ACTIVE_TAB_COLOR = '#53BDEB';       //......Azul claro aba ativa
const INACTIVE_TAB_COLOR = '#FFFFFF';     //......Branco aba inativa
const FOOTER_BG = '#000000';              //......Fundo preto footer
const RECORDING_RED = '#FF3B30';          //......Vermelho gravacao

// ========================================
// Tipos
// ========================================
export interface CapturedMedia {
  id: string;                             //......ID unico
  uri: string;                            //......URI do arquivo
  type: 'photo' | 'video';                //......Tipo de midia
  width: number;                          //......Largura em pixels
  height: number;                         //......Altura em pixels
  duration?: number;                      //......Duracao em ms (apenas videos)
  thumbnail?: string;                     //......Thumbnail URI (apenas videos)
  fileSize?: number;                      //......Tamanho em bytes
}

interface CameraModalProps {
  visible: boolean;                       //......Modal visivel
  onClose: () => void;                    //......Callback fechar
  onCapture: (media: CapturedMedia[]) => void;
  capturedCount: number;                  //......Quantidade ja capturada
  lastThumbnail?: string;                 //......URI da ultima foto
}

interface FocusPoint {
  x: number;                              //......Coordenada X
  y: number;                              //......Coordenada Y
  visible: boolean;                       //......Visivel ou nao
}

type FlashModeType = 'auto' | 'on' | 'off';
type ZoomLevelType = '0.5x' | '1x' | '2x';
type CameraModeType = 'video' | 'photo';

// ========================================
// Icone Fechar
// ========================================
const CloseIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
));

// ========================================
// Icone Flash (raio com linha diagonal)
// ========================================
const FlashIcon: React.FC<{ mode: FlashModeType }> = memo(({ mode }) => {
  const color = mode === 'on' ? CameraColors.flashYellow : CameraColors.textWhite;
  return (
    <Svg width={24} height={24} viewBox="0 0 16.933 16.933" fill="none">
      <Path
        d="m6.98 1.058-.072.147-1.388 2.772 5.365 5.599 2.909-3.49H8.968l3.44-5.028zm-4.409.61-.38.367 2.825 2.949-2.005 4.012h4.043l-2.016 6.803.457.246 4.707-5.65 4.158 4.34.383-.366-4.2-4.383.001-.002-5.276-5.505v.002z"
        fill={color}
      />
    </Svg>
  );
});

// ========================================
// Icone Flip Camera (setas circulares)
// ========================================
const FlipIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 512 512" fill="none">
    <Path
      d="M260.22 48.45a206.36 206.36 0 0 0-163.77 80l-11-8.28a10 10 0 0 0-15.77 5.9l-11.77 54.69a10 10 0 0 0 14.54 10.89l49.16-26.57a10 10 0 0 0 1.25-16.8l-10.4-7.79a186.48 186.48 0 0 1 147.76-72c100.2 0 182.3 79 187.31 178a10 10 0 0 0 10 9.58 10 10 0 0 0 10-10.42C462.06 136 371.17 48.45 260.22 48.45zM439.55 320.35l-49.16 26.57a10 10 0 0 0-1.25 16.8l10.4 7.79a186.46 186.46 0 0 1-147.76 72c-100.2 0-182.3-79-187.31-178a10 10 0 0 0-10-9.58 10 10 0 0 0-10 10.42c5.47 109.65 96.36 197.2 207.31 197.2a206.36 206.36 0 0 0 163.77-80l11.05 8.28a10 10 0 0 0 15.77-5.9l11.72-54.65a10 10 0 0 0-14.54-10.93z"
      fill={CameraColors.textWhite}
      stroke={CameraColors.textWhite}
      strokeWidth={15}
    />
  </Svg>
));

// ========================================
// Componente Indicador de Foco
// ========================================
const FocusIndicator: React.FC<{
  point: FocusPoint;
  visible: boolean;
}> = memo(({ point, visible }) => {
  if (!visible) return null;
  return (
    <View style={[styles.focusIndicator, { left: point.x - FOCUS_SIZE / 2, top: point.y - FOCUS_SIZE / 2 }]}>
      <View style={[styles.focusCorner, styles.focusCornerTL]} />
      <View style={[styles.focusCorner, styles.focusCornerTR]} />
      <View style={[styles.focusCorner, styles.focusCornerBL]} />
      <View style={[styles.focusCorner, styles.focusCornerBR]} />
    </View>
  );
});

// ========================================
// Componente de Miniatura
// ========================================
const ThumbnailPreview: React.FC<{
  uri?: string;
  onPress: () => void;
}> = memo(({ uri, onPress }) => {
  if (!uri) return <View style={styles.controlButtonSpacer} />;
  return (
    <TouchableOpacity style={styles.thumbnailContainer} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri }} style={styles.thumbnailImage} />
    </TouchableOpacity>
  );
});

// ========================================
// Componente Principal CameraModal
// ========================================
const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onCapture,
  capturedCount,
  lastThumbnail,
}) => {
  const insets = useSafeAreaInsets();
  const [cameraPermission] = useCameraPermissions();
  const [micPermission] = useMicrophonePermissions();

  // ========================================
  // Estados de Camera
  // ========================================
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashModeType>('auto');
  const [zoom, setZoom] = useState(0.25);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevelType>('1x');
  const [isCapturing, setIsCapturing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<FocusPoint>({ x: 0, y: 0, visible: false });
  const [activeMode, setActiveMode] = useState<CameraModeType>('photo');

  // ========================================
  // Estados de Gravacao
  // ========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // ========================================
  // Estado das Capturas da Sessao
  // ========================================
  const [sessionCaptures, setSessionCaptures] = useState<CapturedMedia[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | undefined>(lastThumbnail);

  // ========================================
  // Refs
  // ========================================
  const cameraRef = useRef<CameraView>(null);
  const baseZoom = useRef(0.25);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // ========================================
  // Calcular Contagem Total
  // ========================================
  const totalCount = capturedCount + sessionCaptures.length;
  const canCapture = totalCount < MAX_CAPTURES;
  const isVideoMode = activeMode === 'video';

  // ========================================
  // Formatar Tempo de Gravacao
  // ========================================
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ========================================
  // Reset ao Abrir
  // ========================================
  useEffect(() => {
    if (visible) {
      setSessionCaptures([]);
      setCurrentThumbnail(lastThumbnail);
      setFacing('back');
      setFlash('auto');
      setZoom(0.25);
      setZoomLevel('1x');
      setFocusPoint({ x: 0, y: 0, visible: false });
      setActiveMode('photo');
      setIsRecording(false);
      setRecordingTime(0);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      canvasRef.current = null;
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      recordedChunksRef.current = [];
    }
  }, [visible, lastThumbnail]);

  // ========================================
  // Cleanup
  // ========================================
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      canvasRef.current = null;
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
    };
  }, []);

  // ========================================
  // Handler: Fechar Modal
  // ========================================
  const handleClose = useCallback(() => {
    if (sessionCaptures.length > 0) {
      onCapture(sessionCaptures);
    }
    onClose();
  }, [sessionCaptures, onCapture, onClose]);

  // ========================================
  // Handler: Miniatura Press
  // ========================================
  const handleThumbnailPress = useCallback(() => handleClose(), [handleClose]);

  // ========================================
  // Handler: Toggle Flash
  // ========================================
  const handleToggleFlash = useCallback(() => {
    hapticMedium();
    setFlash(prev => prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto');
  }, []);

  // ========================================
  // Handler: Flip Camera
  // ========================================
  const handleFlipCamera = useCallback(() => {
    hapticMedium();
    setFacing(prev => prev === 'back' ? 'front' : 'back');
  }, []);

  // ========================================
  // Handler: Toggle Zoom
  // ========================================
  const handleToggleZoom = useCallback(() => {
    hapticLight();
    setZoomLevel(prev => {
      if (prev === '0.5x') {
        setZoom(0.25);
        baseZoom.current = 0.25;
        return '1x';
      }
      if (prev === '1x') {
        setZoom(0.5);
        baseZoom.current = 0.5;
        return '2x';
      }
      setZoom(0);
      baseZoom.current = 0;
      return '0.5x';
    });
  }, []);

  // ========================================
  // Handler: Pinch Zoom
  // ========================================
  const handlePinchGesture = useCallback((e: PinchGestureHandlerGestureEvent) => {
    if (e.nativeEvent.state === State.ACTIVE) {
      const newZ = Math.max(0, Math.min(1, baseZoom.current * e.nativeEvent.scale));
      setZoom(newZ);
      setZoomLevel(newZ < 0.15 ? '0.5x' : newZ < 0.4 ? '1x' : '2x');
    }
    if (e.nativeEvent.state === State.END) baseZoom.current = zoom;
  }, [zoom]);

  // ========================================
  // Handler: Tap para Foco
  // ========================================
  const handleTapToFocus = useCallback((e: TapGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.state === State.ACTIVE && !isRecording) {
      const { x, y } = e.nativeEvent;
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      setFocusPoint({ x, y, visible: true });
      focusTimeoutRef.current = setTimeout(() => {
        setFocusPoint(prev => ({ ...prev, visible: false }));
      }, FOCUS_DURATION);
    }
  }, [isRecording]);

  // ========================================
  // Handler: Mudar Modo
  // ========================================
  const handleModeChange = useCallback((mode: CameraModeType) => {
    hapticLight();
    if (isRecording) {
      // Parar gravacao antes de mudar modo
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      canvasRef.current = null;
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      setIsRecording(false);
      setRecordingTime(0);
    }
    setActiveMode(mode);
  }, [isRecording]);

  // ========================================
  // Handler: Parar Gravacao
  // ========================================
  const stopRecording = useCallback(() => {
    hapticRecordingStop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const durationMs = Date.now() - recordingStartTimeRef.current;

    // Parar animacao do canvas
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    canvasRef.current = null;

    // Liberar stream de audio separado
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }

    if (Platform.OS === 'web' && mediaRecorderRef.current) {
      // Web: parar MediaRecorder e processar video no onstop
      const recorder = mediaRecorderRef.current;
      mediaRecorderRef.current = null;
      recorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/mp4' });
          const videoUrl = URL.createObjectURL(blob);
          const fileSize = blob.size;
          recordedChunksRef.current = [];

          // Gerar thumbnail do primeiro frame (resolucao real do video)
          let thumbnail: string | undefined;
          let videoWidth = 1920;
          let videoHeight = 1080;
          try {
            const vid = document.createElement('video');
            vid.src = videoUrl;
            vid.currentTime = 0.1;
            await new Promise<void>((resolve) => {
              vid.addEventListener('seeked', () => resolve(), { once: true });
              vid.addEventListener('error', () => resolve(), { once: true });
              setTimeout(() => resolve(), 3000);
            });
            // Usar dimensoes reais do video
            if (vid.videoWidth > 0 && vid.videoHeight > 0) {
              videoWidth = vid.videoWidth;
              videoHeight = vid.videoHeight;
            }
            const canvas = document.createElement('canvas');
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(vid, 0, 0, videoWidth, videoHeight);
              thumbnail = canvas.toDataURL('image/jpeg', 0.85);
            }
          } catch (thumbErr) {
            console.warn('[CameraModal] Falha ao gerar thumbnail:', thumbErr);
          }

          const newCapture: CapturedMedia = {
            id: `video_${Date.now()}`,
            uri: videoUrl,
            type: 'video',
            width: videoWidth,
            height: videoHeight,
            duration: durationMs,
            thumbnail,
            fileSize,
          };
          setSessionCaptures(prev => [...prev, newCapture]);
          setCurrentThumbnail(thumbnail || videoUrl);
          console.log('[CameraModal] Video web gerado:', { uri: videoUrl, durationMs, fileSize });
        } catch (err) {
          console.error('[CameraModal] Erro ao processar video web:', err);
        }
      };
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    } else {
      // Native: parar recordAsync
      if (cameraRef.current && isRecording) cameraRef.current.stopRecording();
    }

    setIsRecording(false);
    setRecordingTime(0);
  }, [isRecording]);

  // ========================================
  // Handler: Iniciar Gravacao
  // ========================================
  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording || !canCapture) return;
    hapticRecordingStart();
    setIsRecording(true);
    setRecordingTime(0);
    recordingStartTimeRef.current = Date.now();

    // Timer visual
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_DURATION - 1) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    if (Platform.OS === 'web') {
      // Web: usar Canvas + MediaRecorder para gravar exatamente o que aparece na tela
      try {
        let videoEl: HTMLVideoElement | null = null;
        let rawStream: MediaStream | null = null;
        // Buscar elemento <video> da CameraView no DOM
        const videoElements = document.querySelectorAll('video');
        for (const v of Array.from(videoElements)) {
          if (v.srcObject instanceof MediaStream) {
            videoEl = v;
            rawStream = v.srcObject;
            break;
          }
        }
        if (videoEl && rawStream) {
          recordedChunksRef.current = [];

          // Calcular crop para simular object-fit: cover (recortar exatamente como na tela)
          const displayRect = videoEl.getBoundingClientRect();
          const displayW = displayRect.width;
          const displayH = displayRect.height;
          const natW = videoEl.videoWidth;
          const natH = videoEl.videoHeight;

          const displayAspect = displayW / displayH;
          const videoAspect = natW / natH;

          let sx: number, sy: number, sw: number, sh: number;
          if (videoAspect > displayAspect) {
            // Video mais largo que a tela - corta laterais
            sh = natH;
            sw = natH * displayAspect;
            sx = (natW - sw) / 2;
            sy = 0;
          } else {
            // Video mais alto que a tela - corta topo/base
            sw = natW;
            sh = natW / displayAspect;
            sx = 0;
            sy = (natH - sh) / 2;
          }

          // Canvas com resolucao da area visivel (qualidade maxima)
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(sw);
          canvas.height = Math.round(sh);
          const ctx = canvas.getContext('2d');
          canvasRef.current = canvas;

          // Loop de desenho: copia frames do video com crop para o canvas
          const videoRef = videoEl;
          const drawFrame = () => {
            if (ctx && canvasRef.current) {
              ctx.drawImage(videoRef, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
              animFrameRef.current = requestAnimationFrame(drawFrame);
            }
          };
          drawFrame();

          // Stream do canvas (30fps) + audio
          const canvasStream = canvas.captureStream(30);

          // Tentar obter audio: primeiro do stream da camera, depois separadamente
          let audioTracks = rawStream.getAudioTracks();
          if (audioTracks.length === 0) {
            try {
              console.log('[CameraModal] Camera stream sem audio, solicitando separadamente...');
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              audioStreamRef.current = audioStream;
              audioTracks = audioStream.getAudioTracks();
              console.log('[CameraModal] Audio obtido separadamente:', audioTracks.length, 'tracks');
            } catch (audioErr) {
              console.warn('[CameraModal] Nao foi possivel obter audio:', audioErr);
            }
          }
          for (const track of audioTracks) {
            canvasStream.addTrack(track);
          }

          // Tentar diferentes mimeTypes suportados (MP4 primeiro para compatibilidade com WhatsApp)
          const mimeTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',  // MP4 H.264 Baseline + AAC (melhor compatibilidade)
            'video/mp4;codecs=avc1',                     // MP4 H.264 generico
            'video/mp4',                                 // MP4 sem codec especifico
            'video/webm;codecs=vp8,opus',                // WebM VP8 (fallback)
            'video/webm;codecs=vp9,opus',                // WebM VP9 (fallback)
            'video/webm',                                // WebM generico (fallback)
          ];
          let mimeType = '';
          for (const mt of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mt)) {
              mimeType = mt;
              break;
            }
          }
          const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunksRef.current.push(e.data);
            }
          };
          recorder.start(100);
          mediaRecorderRef.current = recorder;
          console.log('[CameraModal] Canvas MediaRecorder iniciado:', mimeType, `crop: ${Math.round(sw)}x${Math.round(sh)} de ${natW}x${natH}`);
        } else {
          console.error('[CameraModal] Stream de video nao encontrado no DOM');
        }
      } catch (err) {
        console.error('[CameraModal] Erro ao iniciar MediaRecorder:', err);
      }
    } else {
      // Native: usar expo-camera recordAsync
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: MAX_RECORDING_DURATION });
        if (video) {
          const durationMs = Date.now() - recordingStartTimeRef.current;
          const newCapture: CapturedMedia = {
            id: `video_${Date.now()}`,
            uri: video.uri,
            type: 'video',
            width: 1080,
            height: 1920,
            duration: durationMs,
          };
          setSessionCaptures(prev => [...prev, newCapture]);
          setCurrentThumbnail(video.uri);
        }
      } catch (e) {
        console.error('[CameraModal] Erro ao gravar video:', e);
      }
    }
  }, [isRecording, canCapture, stopRecording]);

  // ========================================
  // Handler: Capturar Foto
  // ========================================
  const handleCapturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing || isRecording || !canCapture) return;
    setIsCapturing(true);
    hapticCapture();
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: CameraConfig.photoQuality, skipProcessing: false });
      if (photo) {
        const newCapture: CapturedMedia = { id: `photo_${Date.now()}`, uri: photo.uri, type: 'photo', width: photo.width, height: photo.height };
        setSessionCaptures(prev => [...prev, newCapture]);
        setCurrentThumbnail(photo.uri);
      }
    } catch (e) {
      console.error('[CameraModal] Erro ao capturar foto:', e);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isRecording, canCapture]);

  // ========================================
  // Handler: Captura (depende do modo)
  // ========================================
  const handleCapture = useCallback(() => {
    if (activeMode === 'video') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    } else {
      handleCapturePhoto();
    }
  }, [activeMode, isRecording, stopRecording, startRecording, handleCapturePhoto]);

  // ========================================
  // Verificar Permissoes
  // ========================================
  const hasPermission = cameraPermission?.granted && micPermission?.granted;

  if (!hasPermission) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Permissao de camera necessaria</Text>
          <Pressable style={styles.permissionButton} onPress={handleClose}>
            <Text style={styles.permissionButtonText}>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <TapGestureHandler onHandlerStateChange={handleTapToFocus}>
          <PinchGestureHandler onGestureEvent={handlePinchGesture}>
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash as FlashMode}
                zoom={zoom}
                mode={isVideoMode ? 'video' : 'picture'}
              />

              {/* Indicador de Foco */}
              <FocusIndicator point={focusPoint} visible={focusPoint.visible} />

              {/* Header: Timer centralizado quando gravando, X + Timer + Flash quando nao */}
              <View style={[styles.header, { paddingTop: insets.top + 18 }, isRecording && styles.headerRecording]} pointerEvents="box-none">
                {isRecording ? (
                  <View style={[styles.timerContainer, styles.timerContainerRecording]}>
                    <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity style={styles.headerButton} onPress={handleClose} activeOpacity={0.7}>
                      <CloseIcon />
                    </TouchableOpacity>

                    {/* Timer - aparece no modo video */}
                    {activeMode === 'video' && (
                      <View style={styles.timerContainer}>
                        <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.headerButton} onPress={handleToggleFlash} activeOpacity={0.7}>
                      <FlashIcon mode={flash} />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Controles Principais */}
              <View style={[styles.controls, isRecording && styles.controlsRecording]} pointerEvents="box-none">
                {isRecording ? (
                  <>
                    {/* Gravando: Flash + Stop + Flip */}
                    <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash} activeOpacity={0.7}>
                      <FlashIcon mode={flash} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.captureButton}
                      onPress={handleCapture}
                      activeOpacity={0.7}
                    >
                      <View style={styles.captureButtonInnerRecording} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera} activeOpacity={0.7}>
                      <FlipIcon />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Normal: Miniatura + Flash + Captura + Zoom + Flip */}
                    <ThumbnailPreview uri={currentThumbnail} onPress={handleThumbnailPress} />

                    <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash} activeOpacity={0.7}>
                      <FlashIcon mode={flash} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                      onPress={handleCapture}
                      disabled={isCapturing || !canCapture}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.captureButtonInner,
                        isVideoMode && styles.captureButtonInnerVideo,
                      ]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={handleToggleZoom} activeOpacity={0.7}>
                      <Text style={styles.zoomText}>{zoomLevel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera} activeOpacity={0.7}>
                      <FlipIcon />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </PinchGestureHandler>
        </TapGestureHandler>

        {/* Footer: Abas de Modo (oculto durante gravacao) */}
        {!isRecording && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 40 }]}>
            <Pressable onPress={() => handleModeChange('video')}>
              <Text style={[styles.modeText, activeMode === 'video' && styles.modeTextActive]}>
                VÍDEO
              </Text>
            </Pressable>
            <Pressable onPress={() => handleModeChange('photo')}>
              <Text style={[styles.modeText, activeMode === 'photo' && styles.modeTextActive]}>
                FOTO
              </Text>
            </Pressable>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: CameraColors.cameraBackground,
  },

  // Container da camera
  cameraContainer: {
    flex: 1,                                //......Ocupa espaco disponivel
  },

  // Camera
  camera: {
    flex: 1,                                //......Ocupa espaco disponivel
  },

  // Header
  header: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 16,                               //......Esquerda
    right: 16,                              //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espaco entre
    alignItems: 'center',                   //......Centraliza vertical
    zIndex: 10,                             //......Camada superior
  },

  // Botao do header
  headerButton: {
    width: 40,                              //......Largura
    height: 40,                             //......Altura
    borderRadius: 20,                       //......Circular
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Header quando gravando (timer centralizado)
  headerRecording: {
    justifyContent: 'center',               //......Centraliza timer
  },

  // Spacer do header (mesmo tamanho do botao, mantem layout)
  headerButtonSpacer: {
    width: 40,                              //......Mesma largura do headerButton
    height: 40,                             //......Mesma altura do headerButton
  },

  // Container do timer
  timerContainer: {
    height: 40,                             //......Altura compacta
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    borderRadius: 8,                        //......Cantos levemente arredondados
    paddingHorizontal: 16,                  //......Padding horizontal
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Timer gravando (fundo vermelho)
  timerContainerRecording: {
    backgroundColor: RECORDING_RED,         //......Vermelho quando gravando
  },

  // Texto do timer
  timerText: {
    fontSize: 14,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: CameraColors.textWhite,          //......Branco
    fontFamily: 'monospace',                //......Monospace
  },

  // Controles
  controls: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 20,                             //......20px acima do footer
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-evenly',         //......Espaco uniforme
    alignItems: 'center',                   //......Centraliza vertical
    paddingHorizontal: 20,                  //......Padding horizontal
    zIndex: 5,                              //......Camada
  },

  // Controles quando gravando (compacto, centralizado)
  controlsRecording: {
    justifyContent: 'center',               //......Centraliza controles
    gap: 28,                                //......Espaco entre botoes
  },

  // Botao de controle
  controlButton: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: 22,                       //......Circular
    backgroundColor: CONTROL_BG,            //......Fundo preto opaco
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Spacer para manter posicao
  controlButtonSpacer: {
    width: 44,                              //......Mesma largura do botao
    height: 44,                             //......Mesma altura do botao
  },

  // Container da miniatura
  thumbnailContainer: {
    width: 44,                              //......Largura
    height: 44,                             //......Altura
    borderRadius: 8,                        //......Cantos arredondados
    overflow: 'hidden',                     //......Esconde overflow
    borderWidth: 2,                         //......Borda
    borderColor: CameraColors.textWhite,    //......Branca
  },

  // Imagem da miniatura
  thumbnailImage: {
    width: '100%',                          //......Largura total
    height: '100%',                         //......Altura total
  },

  // Badge de contador
  thumbnailBadge: {
    position: 'absolute',                   //......Posicao absoluta
    top: -4,                                //......Acima
    right: -4,                              //......Direita
    backgroundColor: CameraColors.primary,  //......Azul
    borderRadius: 10,                       //......Circular
    minWidth: 20,                           //......Largura minima
    height: 20,                             //......Altura
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    paddingHorizontal: 4,                   //......Padding
  },

  // Texto do badge
  thumbnailBadgeText: {
    fontSize: 10,                           //......Tamanho da fonte
    fontWeight: '600',                      //......Semi-bold
    color: CameraColors.textWhite,          //......Branco
  },

  // Botao de captura
  captureButton: {
    width: 72,                              //......Largura
    height: 72,                             //......Altura
    borderRadius: 36,                       //......Circular
    borderWidth: 4,                         //......Borda
    borderColor: CameraColors.textWhite,    //......Borda branca
    backgroundColor: 'transparent',         //......Fundo transparente
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao captura desabilitado
  captureButtonDisabled: {
    opacity: 0.5,                           //......Opacidade reduzida
  },

  // Interior do botao - modo foto
  captureButtonInner: {
    width: 60,                              //......Largura
    height: 60,                             //......Altura
    borderRadius: 30,                       //......Circular
    backgroundColor: CameraColors.textWhite,
  },

  // Interior do botao - modo video
  captureButtonInnerVideo: {
    backgroundColor: RECORDING_RED,         //......Vermelho
  },

  // Interior do botao - gravando
  captureButtonInnerRecording: {
    width: 28,                              //......Largura menor
    height: 28,                             //......Altura menor
    borderRadius: 6,                        //......Quadrado arredondado
    backgroundColor: RECORDING_RED,         //......Vermelho
  },

  // Texto do zoom
  zoomText: {
    fontSize: 13,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: ACTIVE_TAB_COLOR,                //......Azul
  },

  // Indicador de foco
  focusIndicator: {
    position: 'absolute',                   //......Posicao absoluta
    width: FOCUS_SIZE,                      //......Largura do indicador
    height: FOCUS_SIZE,                     //......Altura do indicador
    zIndex: 100,                            //......Acima de tudo
  },

  // Canto do foco
  focusCorner: {
    position: 'absolute',                   //......Posicao absoluta
    width: 20,                              //......Largura do canto
    height: 20,                             //......Altura do canto
    borderColor: CameraColors.flashYellow,  //......Cor amarela
    borderWidth: 2,                         //......Espessura da borda
  },

  // Canto superior esquerdo
  focusCornerTL: {
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    borderRightWidth: 0,                    //......Sem borda direita
    borderBottomWidth: 0,                   //......Sem borda inferior
  },

  // Canto superior direito
  focusCornerTR: {
    top: 0,                                 //......Topo
    right: 0,                               //......Direita
    borderLeftWidth: 0,                     //......Sem borda esquerda
    borderBottomWidth: 0,                   //......Sem borda inferior
  },

  // Canto inferior esquerdo
  focusCornerBL: {
    bottom: 0,                              //......Fundo
    left: 0,                                //......Esquerda
    borderRightWidth: 0,                    //......Sem borda direita
    borderTopWidth: 0,                      //......Sem borda superior
  },

  // Canto inferior direito
  focusCornerBR: {
    bottom: 0,                              //......Fundo
    right: 0,                               //......Direita
    borderLeftWidth: 0,                     //......Sem borda esquerda
    borderTopWidth: 0,                      //......Sem borda superior
  },

  // Footer com abas
  footer: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza vertical
    gap: 24,                                //......Espaco entre abas
    paddingTop: 20,                         //......Padding superior
    paddingBottom: 20,                      //......Padding inferior base
    backgroundColor: FOOTER_BG,             //......Fundo preto
  },

  // Texto da aba
  modeText: {
    fontSize: 12,                           //......Tamanho fonte
    fontWeight: '700',                      //......Bold
    color: INACTIVE_TAB_COLOR,              //......Branco
    letterSpacing: 1,                       //......Espacamento
    textTransform: 'uppercase',             //......Maiusculas
  },

  // Texto da aba ativa
  modeTextActive: {
    color: ACTIVE_TAB_COLOR,                //......Azul
  },

  // Container de permissao
  permissionContainer: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: CameraColors.cameraBackground,
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    padding: 20,                            //......Padding
  },

  // Texto de permissao
  permissionText: {
    fontSize: 16,                           //......Tamanho da fonte
    color: CameraColors.textWhite,          //......Branco
    textAlign: 'center',                    //......Centraliza
    marginBottom: 24,                       //......Margem inferior
  },

  // Botao de permissao
  permissionButton: {
    paddingHorizontal: 24,                  //......Padding horizontal
    paddingVertical: 12,                    //......Padding vertical
    borderRadius: CameraStyles.borderRadiusButton,
    backgroundColor: CameraColors.primary,  //......Azul
  },

  // Texto do botao de permissao
  permissionButtonText: {
    fontSize: 16,                           //......Tamanho da fonte
    color: CameraColors.textWhite,          //......Branco
    fontWeight: '600',                      //......Semi-bold
  },
});

// ========================================
// Export
// ========================================
export default CameraModal;
