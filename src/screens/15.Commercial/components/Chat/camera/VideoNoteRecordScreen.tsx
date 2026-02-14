// ========================================
// Tela de Gravacao de Video Note
// Video circular estilo WhatsApp
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Alert, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraConfig, CameraIcons } from './utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.75; //............. Tamanho do circulo
const RING_WIDTH = 6; //................................ Largura do anel de progresso
const MAX_DURATION = CameraConfig.videoNoteMaxDuration; // Duracao maxima

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  VideoNoteRecordScreen: {
    leadId: string;
    leadName: string;
    leadPhone: string;
  };
  VideoNotePreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VideoNoteRecordScreen'>;
type VideoNoteRecordRouteProp = RouteProp<RootStackParamList, 'VideoNoteRecordScreen'>;

// ========================================
// Icone de Fechar
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Icone de Flip Camera
// ========================================
const FlipIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.flip} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Formatar tempo (mm:ss)
// ========================================
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60); //.. Calcula minutos
  const secs = seconds % 60; //.............. Calcula segundos
  return `${mins}:${secs.toString().padStart(2, '0')}`; // Formata
};

// ========================================
// Componente Principal VideoNoteRecordScreen
// ========================================
const VideoNoteRecordScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoNoteRecordRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { leadId, leadName, leadPhone } = route.params;

  // ========================================
  // Permissoes
  // ========================================
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // ========================================
  // Estados
  // ========================================
  const [facing, setFacing] = useState<CameraType>('front'); //... Camera frontal por padrao
  const [isRecording, setIsRecording] = useState(false); //....... Gravando
  const [recordingDuration, setRecordingDuration] = useState(0); // Duracao

  // ========================================
  // Refs
  // ========================================
  const cameraRef = useRef<CameraView>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ========================================
  // Solicitar Permissoes
  // ========================================
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
    })();
  }, []);

  // ========================================
  // Animacao de Pulse durante gravacao
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
  }, [isRecording]);

  // ========================================
  // Handler de Fechar
  // ========================================
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Flip Camera
  // ========================================
  const handleFlip = useCallback(() => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // ========================================
  // Iniciar Gravacao
  // ========================================
  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);

      // Animar progresso
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: MAX_DURATION * 1000,
        useNativeDriver: false,
      }).start();

      // Timer de duracao
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Iniciar gravacao
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
      });

      if (video?.uri) {
        navigation.navigate('VideoNotePreviewScreen', {
          videoUri: video.uri,
          duration: recordingDuration * 1000,
          leadName,
          leadId,
          leadPhone,
        });
      }
    } catch (error) {
      console.error('[VideoNoteRecordScreen] Erro ao gravar:', error);
      setIsRecording(false);
    }
  }, [isRecording, navigation, leadName, leadId, leadPhone, recordingDuration]);

  // ========================================
  // Parar Gravacao
  // ========================================
  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      progressAnim.stopAnimation();
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('[VideoNoteRecordScreen] Erro ao parar:', error);
      setIsRecording(false);
    }
  }, [isRecording]);

  // ========================================
  // Cleanup
  // ========================================
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // ========================================
  // Verificar Permissoes
  // ========================================
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Permissão de câmera e microfone necessária</Text>
          <Pressable style={styles.permissionButton} onPress={() => { requestCameraPermission(); requestMicPermission(); }}>
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </Pressable>
          <Pressable style={styles.closeButtonTop} onPress={handleClose}>
            <CloseIcon />
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // ========================================
  // Calcular rotacao do progresso
  // ========================================
  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
        <View style={styles.headerSpacer} />
        <Pressable style={styles.headerButton} onPress={handleFlip} hitSlop={12}>
          <FlipIcon />
        </Pressable>
      </SafeAreaView>

      {/* Area Central com Camera Circular */}
      <View style={styles.centerContainer}>
        {/* Instrucao */}
        <Text style={styles.instructionText}>
          {isRecording ? formatTime(recordingDuration) : 'Segure para gravar'}
        </Text>

        {/* Container do Circulo */}
        <View style={styles.circleContainer}>
          {/* Anel de Progresso */}
          {isRecording && (
            <Animated.View style={[styles.progressRing, { transform: [{ rotate: progressRotation }] }]}>
              <View style={styles.progressArc} />
            </Animated.View>
          )}

          {/* Borda do Circulo */}
          <View style={[styles.circleBorder, isRecording && styles.circleBorderRecording]}>
            {/* Camera View Circular */}
            <View style={styles.cameraCircle}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                mode="video"
              />
            </View>
          </View>
        </View>

        {/* Botao de Gravacao */}
        <Pressable
          style={styles.recordButton}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Animated.View style={[styles.recordButtonInner, isRecording && { opacity: pulseAnim, backgroundColor: CameraColors.recordingRed }]} />
        </Pressable>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.footerText}>Vídeo de até {MAX_DURATION}s</Text>
      </View>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //..................... Ocupa toda a tela
    backgroundColor: CameraColors.cameraBackground, // Fundo escuro
  },

  // Container de permissao
  permissionContainer: {
    flex: 1, //................. Ocupa toda a tela
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.... Centraliza horizontal
    paddingHorizontal: 32, //... Padding horizontal
  },

  // Texto de permissao
  permissionText: {
    fontSize: 16, //............... Tamanho da fonte
    color: CameraColors.textWhite, // Cor branca
    textAlign: 'center', //........ Centraliza texto
    marginBottom: 24, //........... Margem inferior
  },

  // Botao de permissao
  permissionButton: {
    paddingHorizontal: 24, //................ Padding horizontal
    paddingVertical: 12, //.................. Padding vertical
    backgroundColor: CameraColors.primary, // Fundo azul
    borderRadius: 8, //...................... Borda arredondada
  },

  // Texto do botao de permissao
  permissionButtonText: {
    fontSize: 16, //............... Tamanho da fonte
    fontWeight: '600', //.......... Peso da fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Botao fechar no topo
  closeButtonTop: {
    position: 'absolute', //...... Posicao absoluta
    top: 60, //................... Topo
    left: 16, //.................. Esquerda
    width: 44, //................. Largura
    height: 44, //................ Altura
    borderRadius: CameraStyles.borderRadiusButton, // Borda arredondada
    backgroundColor: CameraColors.overlayLight, //.. Fundo semi-transparente
    justifyContent: 'center', //.. Centraliza horizontal
    alignItems: 'center', //...... Centraliza vertical
  },

  // Header
  header: {
    flexDirection: 'row', //......... Layout horizontal
    justifyContent: 'space-between', // Espacamento entre elementos
    alignItems: 'center', //......... Centraliza verticalmente
    paddingHorizontal: 16, //........ Padding horizontal
    paddingTop: 60, //............... Padding superior (status bar)
    paddingBottom: 16, //............ Padding inferior
  },

  // Botao do header
  headerButton: {
    width: 44, //.................... Largura fixa
    height: 44, //................... Altura fixa
    borderRadius: CameraStyles.borderRadiusButton, // Borda arredondada
    backgroundColor: CameraColors.overlayLight, //.. Fundo semi-transparente
    justifyContent: 'center', //..... Centraliza horizontal
    alignItems: 'center', //......... Centraliza vertical
  },

  // Espacador do header
  headerSpacer: {
    flex: 1, //.. Ocupa espaco disponivel
  },

  // Container central
  centerContainer: {
    flex: 1, //................. Ocupa espaco disponivel
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.... Centraliza horizontal
  },

  // Texto de instrucao
  instructionText: {
    fontSize: 18, //............... Tamanho da fonte
    fontWeight: '600', //.......... Peso da fonte
    color: CameraColors.textWhite, // Cor branca
    marginBottom: 32, //........... Margem inferior
  },

  // Container do circulo
  circleContainer: {
    width: CIRCLE_SIZE + RING_WIDTH * 2, //.. Largura total
    height: CIRCLE_SIZE + RING_WIDTH * 2, // Altura total
    justifyContent: 'center', //............ Centraliza vertical
    alignItems: 'center', //................ Centraliza horizontal
    marginBottom: 48, //.................... Margem inferior
  },

  // Anel de progresso
  progressRing: {
    position: 'absolute', //.............. Posicao absoluta
    width: CIRCLE_SIZE + RING_WIDTH * 2, // Largura total
    height: CIRCLE_SIZE + RING_WIDTH * 2, // Altura total
  },

  // Arco de progresso
  progressArc: {
    position: 'absolute', //................. Posicao absoluta
    top: 0, //............................... Topo
    left: '50%', //.......................... Centro horizontal
    width: RING_WIDTH, //.................... Largura do arco
    height: (CIRCLE_SIZE + RING_WIDTH * 2) / 2, // Metade da altura
    backgroundColor: CameraColors.primary, // Cor azul
    borderTopLeftRadius: RING_WIDTH / 2, //.. Borda superior esquerda
    borderTopRightRadius: RING_WIDTH / 2, //. Borda superior direita
    marginLeft: -RING_WIDTH / 2, //.......... Centraliza
    transformOrigin: 'center bottom', //..... Origem da rotacao
  },

  // Borda do circulo
  circleBorder: {
    width: CIRCLE_SIZE, //...................... Largura
    height: CIRCLE_SIZE, //..................... Altura
    borderRadius: CIRCLE_SIZE / 2, //........... Circular
    borderWidth: 3, //.......................... Largura da borda
    borderColor: CameraColors.textWhite, //..... Cor branca
    overflow: 'hidden', //...................... Esconde overflow
    justifyContent: 'center', //................ Centraliza vertical
    alignItems: 'center', //.................... Centraliza horizontal
  },

  // Borda durante gravacao
  circleBorderRecording: {
    borderColor: CameraColors.recordingRed, //.. Cor vermelha
  },

  // Circulo da camera
  cameraCircle: {
    width: CIRCLE_SIZE - 6, //........... Largura interna
    height: CIRCLE_SIZE - 6, //.......... Altura interna
    borderRadius: (CIRCLE_SIZE - 6) / 2, // Circular
    overflow: 'hidden', //............... Esconde overflow
  },

  // Camera
  camera: {
    width: '100%', //.... Largura total
    height: '100%', //... Altura total
    transform: [{ scaleX: -1 }], // Espelha camera frontal
  },

  // Botao de gravacao
  recordButton: {
    width: 72, //............... Largura
    height: 72, //.............. Altura
    borderRadius: 36, //........ Circular
    borderWidth: 4, //.......... Largura da borda
    borderColor: CameraColors.textWhite, // Cor branca
    justifyContent: 'center', // Centraliza horizontal
    alignItems: 'center', //.... Centraliza vertical
  },

  // Interior do botao de gravacao
  recordButtonInner: {
    width: 56, //........................ Largura
    height: 56, //....................... Altura
    borderRadius: 28, //................. Circular
    backgroundColor: CameraColors.recordingRed, // Cor vermelha
  },

  // Footer
  footer: {
    alignItems: 'center', //.. Centraliza horizontal
    paddingTop: 16, //........ Padding superior
  },

  // Texto do footer
  footerText: {
    fontSize: 14, //.................. Tamanho da fonte
    color: CameraColors.textSecondary, // Cor cinza
  },
});

// ========================================
// Export
// ========================================
export default VideoNoteRecordScreen;
