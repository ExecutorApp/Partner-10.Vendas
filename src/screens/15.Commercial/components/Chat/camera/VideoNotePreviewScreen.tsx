// ========================================
// Tela de Preview do Video Note
// Mostra video note circular antes de enviar
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet, StatusBar, Dimensions, Text } from 'react-native';
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

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.75; //.. Tamanho do circulo

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  VideoNoteRecordScreen: any;
  VideoNotePreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  LeadChatScreen: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VideoNotePreviewScreen'>;
type VideoNotePreviewRouteProp = RouteProp<RootStackParamList, 'VideoNotePreviewScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

const PlayIcon: React.FC = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill={CameraColors.textWhite} />
  </Svg>
);

const SendIcon: React.FC = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={CameraColors.textWhite} />
  </Svg>
);

const RetakeIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Componente Principal VideoNotePreviewScreen
// ========================================
const VideoNotePreviewScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoNotePreviewRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { videoUri, duration, leadName, leadId, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [isPlaying, setIsPlaying] = useState(false); //.. Video tocando
  const [isSending, setIsSending] = useState(false); //.. Enviando

  // ========================================
  // Refs
  // ========================================
  const videoRef = useRef<Video>(null);

  // ========================================
  // Handler de Descartar
  // ========================================
  const handleDiscard = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Regravar
  // ========================================
  const handleRetake = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
    setIsSending(true);

    try {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'LeadChatScreen',
          params: {
            leadId,
            leadName,
            leadPhone,
            pendingVideoNote: {
              uri: videoUri,
              duration,
            },
          },
        })
      );
    } catch (error) {
      console.error('[VideoNotePreviewScreen] Erro ao enviar:', error);
      setIsSending(false);
    }
  }, [isSending, navigation, leadId, leadName, leadPhone, videoUri, duration]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleDiscard} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </SafeAreaView>

      {/* Area Central com Video Circular */}
      <View style={styles.centerContainer}>
        {/* Label */}
        <Text style={styles.labelText}>Video Note para {leadName}</Text>

        {/* Container do Circulo */}
        <Pressable style={styles.circleContainer} onPress={handlePlayPause}>
          {/* Borda do Circulo */}
          <View style={styles.circleBorder}>
            {/* Video Circular */}
            <View style={styles.videoCircle}>
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />
            </View>
          </View>

          {/* Overlay de Play */}
          {!isPlaying && (
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <PlayIcon />
              </View>
            </View>
          )}
        </Pressable>
      </View>

      {/* Footer com Acoes */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Botao Regravar */}
        <Pressable style={styles.actionButton} onPress={handleRetake}>
          <RetakeIcon />
          <Text style={styles.actionText}>Regravar</Text>
        </Pressable>

        {/* Botao Enviar */}
        <Pressable style={styles.sendButton} onPress={handleSend} disabled={isSending}>
          <SendIcon />
        </Pressable>
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

  // Header
  header: {
    flexDirection: 'row', //......... Layout horizontal
    justifyContent: 'flex-start', //. Alinha a esquerda
    alignItems: 'center', //......... Centraliza verticalmente
    paddingHorizontal: 16, //........ Padding horizontal
    paddingTop: 8, //................ Padding superior
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

  // Container central
  centerContainer: {
    flex: 1, //................. Ocupa espaco disponivel
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.... Centraliza horizontal
  },

  // Texto de label
  labelText: {
    fontSize: 16, //............... Tamanho da fonte
    color: CameraColors.textWhite, // Cor branca
    marginBottom: 32, //........... Margem inferior
  },

  // Container do circulo
  circleContainer: {
    width: CIRCLE_SIZE, //...... Largura
    height: CIRCLE_SIZE, //..... Altura
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.... Centraliza horizontal
  },

  // Borda do circulo
  circleBorder: {
    width: CIRCLE_SIZE, //................. Largura
    height: CIRCLE_SIZE, //................ Altura
    borderRadius: CIRCLE_SIZE / 2, //...... Circular
    borderWidth: 3, //..................... Largura da borda
    borderColor: CameraColors.primary, //.. Cor azul
    overflow: 'hidden', //................. Esconde overflow
    justifyContent: 'center', //........... Centraliza vertical
    alignItems: 'center', //............... Centraliza horizontal
  },

  // Circulo do video
  videoCircle: {
    width: CIRCLE_SIZE - 6, //........... Largura interna
    height: CIRCLE_SIZE - 6, //.......... Altura interna
    borderRadius: (CIRCLE_SIZE - 6) / 2, // Circular
    overflow: 'hidden', //............... Esconde overflow
  },

  // Video
  video: {
    width: '100%', //... Largura total
    height: '100%', //.. Altura total
  },

  // Overlay de play
  playOverlay: {
    ...StyleSheet.absoluteFillObject, // Posicao absoluta
    justifyContent: 'center', //....... Centraliza vertical
    alignItems: 'center', //........... Centraliza horizontal
  },

  // Botao de play
  playButton: {
    width: 72, //................. Largura
    height: 72, //................ Altura
    borderRadius: 36, //.......... Circular
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo semi-transparente
    justifyContent: 'center', //.. Centraliza horizontal
    alignItems: 'center', //...... Centraliza vertical
  },

  // Footer
  footer: {
    flexDirection: 'row', //......... Layout horizontal
    justifyContent: 'space-between', // Espacamento entre elementos
    alignItems: 'center', //......... Centraliza verticalmente
    paddingHorizontal: 48, //........ Padding horizontal
    paddingTop: 24, //............... Padding superior
  },

  // Botao de acao
  actionButton: {
    alignItems: 'center', //.. Centraliza horizontal
    gap: 8, //............... Espaco entre icone e texto
  },

  // Texto de acao
  actionText: {
    fontSize: 14, //............... Tamanho da fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Botao de enviar
  sendButton: {
    width: 64, //........................ Largura
    height: 64, //....................... Altura
    borderRadius: 32, //................. Circular
    backgroundColor: CameraColors.primary, // Fundo azul
    justifyContent: 'center', //......... Centraliza horizontal
    alignItems: 'center', //............. Centraliza vertical
  },
});

// ========================================
// Export
// ========================================
export default VideoNotePreviewScreen;
