// ========================================
// Tela de Preview do Video
// Mostra video gravado com opcao de legenda
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Text, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';
import { ANIMATION_DURATION, createEnterAnimation } from './utils/cameraAnimations';
import { hapticLight, hapticSuccess } from './utils/cameraHaptics';

// ========================================
// Imports de Componentes
// ========================================
import CaptionInput from './components/CaptionInput';

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  CameraScreen: any;
  VideoPreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  VideoTrimScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  LeadChatScreen: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VideoPreviewScreen'>;
type VideoPreviewRouteProp = RouteProp<RootStackParamList, 'VideoPreviewScreen'>;

// ========================================
// Icone de Fechar
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Icone de Play
// ========================================
const PlayIcon: React.FC = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Icone de Trim (Tesoura)
// ========================================
const TrimIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente Principal VideoPreviewScreen
// ========================================
const VideoPreviewScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoPreviewRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { videoUri, duration, leadName, leadId, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // ========================================
  // Refs
  // ========================================
  const videoRef = useRef<Video>(null);

  // ========================================
  // Animacoes de Entrada
  // ========================================
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(30)).current;
  const playButtonScale = useRef(new Animated.Value(0.5)).current;

  // ========================================
  // Executar Animacoes de Entrada
  // ========================================
  useEffect(() => {
    Animated.timing(videoOpacity, { toValue: 1, duration: ANIMATION_DURATION.normal, useNativeDriver: true }).start();
    Animated.stagger(100, [
      createEnterAnimation(headerOpacity, headerTranslateY, ANIMATION_DURATION.normal),
      createEnterAnimation(footerOpacity, footerTranslateY, ANIMATION_DURATION.normal),
    ]).start();
    Animated.spring(playButtonScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();
  }, [videoOpacity, headerOpacity, headerTranslateY, footerOpacity, footerTranslateY, playButtonScale]);

  // ========================================
  // Handler de Descartar
  // ========================================
  const handleDiscard = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Trim
  // ========================================
  const handleTrim = useCallback(() => {
    hapticLight();
    navigation.navigate('VideoTrimScreen' as any, {
      videoUri,
      duration,
      leadName,
      leadId,
      leadPhone,
    });
  }, [navigation, videoUri, duration, leadName, leadId, leadPhone]);

  // ========================================
  // Handler de Play/Pause
  // ========================================
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  // ========================================
  // Handler de Status do Video
  // ========================================
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        videoRef.current?.setPositionAsync(0);
        setIsPlaying(false);
      }
    }
  }, []);

  // ========================================
  // Handler de Enviar
  // ========================================
  const handleSend = useCallback(async () => {
    if (isSending) return;
    hapticSuccess();
    setIsSending(true);

    try {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'LeadChatScreen',
          params: {
            leadId,
            leadName,
            leadPhone,
            pendingVideo: {
              uri: videoUri,
              duration,
              caption: caption.trim() || undefined,
            },
          },
        })
      );
    } catch (error) {
      console.error('[VideoPreviewScreen] Erro ao enviar:', error);
      setIsSending(false);
    }
  }, [isSending, navigation, leadId, leadName, leadPhone, videoUri, duration, caption]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Video Player */}
      <Animated.View style={[styles.videoContainer, { opacity: videoOpacity }]}>
        <Pressable style={styles.videoTouchable} onPress={handlePlayPause}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {/* Overlay de Play */}
          {!isPlaying && (
            <View style={styles.playOverlay}>
              <Animated.View style={[styles.playButton, { transform: [{ scale: playButtonScale }] }]}>
                <PlayIcon />
              </Animated.View>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Header com Fechar e Trim */}
      <Animated.View style={[styles.headerAnimated, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <SafeAreaView style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleDiscard} hitSlop={12}>
            <CloseIcon />
          </Pressable>
          <View style={styles.headerSpacer} />
          <Pressable style={styles.headerButton} onPress={handleTrim} hitSlop={12}>
            <TrimIcon />
          </Pressable>
        </SafeAreaView>
      </Animated.View>

      {/* Campo de Legenda + Enviar */}
      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom, opacity: footerOpacity, transform: [{ translateY: footerTranslateY }] }]}>
        <CaptionInput
          value={caption}
          onChangeText={setCaption}
          onSend={handleSend}
          recipientName={leadName}
          placeholder="Adicione uma legenda..."
          isSending={isSending}
          showCameraButton={false}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: CameraColors.cameraBackground,
  },

  // Container do video
  videoContainer: {
    flex: 1,
  },

  // Video touchable
  videoTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Video
  video: {
    width: '100%',
    height: '100%',
  },

  // Overlay de play
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // Botao de play
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header animado container
  headerAnimated: {
    position: 'absolute', //.. Posicao absoluta
    top: 0, //............... Topo da tela
    left: 0, //.............. Esquerda
    right: 0, //............. Direita
    zIndex: 10, //........... Acima do video
  },

  // Header
  header: {
    flexDirection: 'row', //.............. Layout horizontal
    justifyContent: 'space-between', //... Espacamento entre elementos
    alignItems: 'center', //.............. Centraliza verticalmente
    paddingHorizontal: 16, //............. Padding horizontal
    paddingTop: 8, //..................... Padding superior
  },

  // Botao do header
  headerButton: {
    width: 44, //......................... Largura fixa
    height: 44, //........................ Altura fixa
    borderRadius: CameraStyles.borderRadiusButton, // Borda arredondada
    backgroundColor: CameraColors.overlayLight, //.. Fundo semi-transparente
    justifyContent: 'center', //.......... Centraliza horizontal
    alignItems: 'center', //.............. Centraliza vertical
  },

  // Espacador do header
  headerSpacer: {
    flex: 1, //.. Ocupa espaco disponivel
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

// ========================================
// Export
// ========================================
export default VideoPreviewScreen;
