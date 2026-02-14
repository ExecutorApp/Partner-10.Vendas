// ========================================
// Tela de Trim do Video
// Timeline para cortar inicio e fim do video
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet, StatusBar, Dimensions, Text, ActivityIndicator, PanResponder, GestureResponderEvent, PanResponderGestureState, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Navegacao
// ========================================
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles, CameraIcons } from './utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 64; //... Largura da timeline
const HANDLE_WIDTH = 20; //.................... Largura do handle
const MIN_DURATION = 1000; //.................. Duracao minima em ms
const THUMBNAIL_COUNT = 8; //.................. Numero de thumbnails

// ========================================
// Tipo de Navegacao
// ========================================
type RootStackParamList = {
  VideoTrimScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
  VideoPreviewScreen: {
    videoUri: string;
    duration: number;
    leadName: string;
    leadId: string;
    leadPhone: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'VideoTrimScreen'>;
type VideoTrimRouteProp = RouteProp<RootStackParamList, 'VideoTrimScreen'>;

// ========================================
// Icones
// ========================================
const CloseIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d={CameraIcons.close} fill={CameraColors.textWhite} />
  </Svg>
);

const CheckIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill={CameraColors.textWhite} />
  </Svg>
);

const PlayIcon: React.FC = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill={CameraColors.textWhite} />
  </Svg>
);

const PauseIcon: React.FC = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill={CameraColors.textWhite} />
  </Svg>
);

// ========================================
// Funcao para formatar tempo
// ========================================
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000); //.. Converte para segundos
  const minutes = Math.floor(totalSeconds / 60); // Calcula minutos
  const seconds = totalSeconds % 60; //........... Calcula segundos restantes
  return `${minutes}:${seconds.toString().padStart(2, '0')}`; // Formata
};

// ========================================
// Componente Principal VideoTrimScreen
// ========================================
const VideoTrimScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoTrimRouteProp>();
  const insets = useSafeAreaInsets();

  // ========================================
  // Parametros da Rota
  // ========================================
  const { videoUri, duration, leadName, leadId, leadPhone } = route.params;

  // ========================================
  // Estados
  // ========================================
  const [thumbnails, setThumbnails] = useState<string[]>([]); //.... Thumbnails da timeline
  const [isLoading, setIsLoading] = useState(true); //.............. Carregando thumbnails
  const [isPlaying, setIsPlaying] = useState(false); //............. Video tocando
  const [currentTime, setCurrentTime] = useState(0); //............. Tempo atual
  const [trimStart, setTrimStart] = useState(0); //................. Inicio do corte em ms
  const [trimEnd, setTrimEnd] = useState(duration); //.............. Fim do corte em ms

  // ========================================
  // Refs
  // ========================================
  const videoRef = useRef<Video>(null);

  // ========================================
  // Valores Animados
  // ========================================
  const startHandleX = useRef(new Animated.Value(0)).current;
  const endHandleX = useRef(new Animated.Value(TIMELINE_WIDTH - HANDLE_WIDTH)).current;
  const startHandleXRef = useRef(0);
  const endHandleXRef = useRef(TIMELINE_WIDTH - HANDLE_WIDTH);

  // ========================================
  // Gerar Thumbnails
  // ========================================
  useEffect(() => {
    const generateThumbnails = async () => {
      try {
        const thumbs: string[] = []; //.................. Array de thumbnails
        const interval = duration / THUMBNAIL_COUNT; //.. Intervalo entre thumbs

        for (let i = 0; i < THUMBNAIL_COUNT; i++) {
          const time = i * interval; //.................. Tempo do thumbnail
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time });
          thumbs.push(uri);
        }

        setThumbnails(thumbs);
        setIsLoading(false);
      } catch (error) {
        console.error('[VideoTrimScreen] Erro ao gerar thumbnails:', error);
        setIsLoading(false);
      }
    };

    generateThumbnails();
  }, [videoUri, duration]);

  // ========================================
  // Handler de Cancelar
  // ========================================
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Confirmar
  // ========================================
  const handleConfirm = useCallback(() => {
    navigation.navigate('VideoPreviewScreen', {
      videoUri,
      duration: trimEnd - trimStart,
      leadName,
      leadId,
      leadPhone,
    });
  }, [navigation, videoUri, trimStart, trimEnd, leadName, leadId, leadPhone]);

  // ========================================
  // Handler de Play/Pause
  // ========================================
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.setPositionAsync(trimStart);
      await videoRef.current.playAsync();
    }
  }, [isPlaying, trimStart]);

  // ========================================
  // Handler de Status do Video
  // ========================================
  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setCurrentTime(status.positionMillis);

      if (status.positionMillis >= trimEnd) {
        videoRef.current?.pauseAsync();
        videoRef.current?.setPositionAsync(trimStart);
        setIsPlaying(false);
      }
    }
  }, [trimStart, trimEnd]);

  // ========================================
  // Atualizar Trim Start
  // ========================================
  const updateTrimStart = useCallback((x: number) => {
    const percentage = x / (TIMELINE_WIDTH - HANDLE_WIDTH);
    const newStart = Math.max(0, percentage * duration);
    const minEnd = newStart + MIN_DURATION;
    if (minEnd < trimEnd) {
      setTrimStart(newStart);
    }
  }, [duration, trimEnd]);

  // ========================================
  // Atualizar Trim End
  // ========================================
  const updateTrimEnd = useCallback((x: number) => {
    const percentage = (x + HANDLE_WIDTH) / TIMELINE_WIDTH;
    const newEnd = Math.min(duration, percentage * duration);
    const maxStart = newEnd - MIN_DURATION;
    if (trimStart < maxStart) {
      setTrimEnd(newEnd);
    }
  }, [duration, trimStart]);

  // ========================================
  // PanResponder para Handle Inicio
  // ========================================
  const startPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startHandleX.setOffset(startHandleXRef.current);
      startHandleX.setValue(0);
    },
    onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newX = Math.max(0, Math.min(endHandleXRef.current - HANDLE_WIDTH - 20, startHandleXRef.current + gestureState.dx));
      startHandleX.setValue(gestureState.dx);
      updateTrimStart(newX);
    },
    onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newX = Math.max(0, Math.min(endHandleXRef.current - HANDLE_WIDTH - 20, startHandleXRef.current + gestureState.dx));
      startHandleXRef.current = newX;
      startHandleX.flattenOffset();
      startHandleX.setValue(newX);
    },
  }), [startHandleX, updateTrimStart]);

  // ========================================
  // PanResponder para Handle Fim
  // ========================================
  const endPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      endHandleX.setOffset(endHandleXRef.current);
      endHandleX.setValue(0);
    },
    onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newX = Math.min(TIMELINE_WIDTH - HANDLE_WIDTH, Math.max(startHandleXRef.current + HANDLE_WIDTH + 20, endHandleXRef.current + gestureState.dx));
      endHandleX.setValue(gestureState.dx);
      updateTrimEnd(newX);
    },
    onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newX = Math.min(TIMELINE_WIDTH - HANDLE_WIDTH, Math.max(startHandleXRef.current + HANDLE_WIDTH + 20, endHandleXRef.current + gestureState.dx));
      endHandleXRef.current = newX;
      endHandleX.flattenOffset();
      endHandleX.setValue(newX);
    },
  }), [endHandleX, updateTrimEnd]);

  // ========================================
  // Calcular Duracao Selecionada
  // ========================================
  const selectedDuration = trimEnd - trimStart;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Header */}
        <SafeAreaView style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleCancel} hitSlop={12}>
            <CloseIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Cortar</Text>
          <Pressable style={[styles.headerButton, styles.confirmButton]} onPress={handleConfirm} hitSlop={12}>
            <CheckIcon />
          </Pressable>
        </SafeAreaView>

        {/* Video Preview */}
        <Pressable style={styles.videoContainer} onPress={handlePlayPause}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {/* Overlay de Play/Pause */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </View>
          </View>
        </Pressable>

        {/* Duracao Selecionada */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {formatTime(trimStart)} - {formatTime(trimEnd)}
          </Text>
          <Text style={styles.durationLabel}>
            Duração: {formatTime(selectedDuration)}
          </Text>
        </View>

        {/* Timeline */}
        <View style={[styles.timelineContainer, { paddingBottom: insets.bottom + 16 }]}>
          {isLoading ? (
            <ActivityIndicator size="small" color={CameraColors.primary} />
          ) : (
            <View style={styles.timeline}>
              {/* Thumbnails */}
              <View style={styles.thumbnailsContainer}>
                {thumbnails.map((thumb, index) => (
                  <Image key={index} source={{ uri: thumb }} style={styles.thumbnail} />
                ))}
              </View>

              {/* Area Selecionada */}
              <Animated.View style={[styles.selectedArea, { left: Animated.add(startHandleX, HANDLE_WIDTH), right: Animated.subtract(TIMELINE_WIDTH, endHandleX) }]} />

              {/* Area Escurecida Esquerda */}
              <Animated.View style={[styles.dimmedArea, styles.dimmedLeft, { width: startHandleX }]} />

              {/* Area Escurecida Direita */}
              <Animated.View style={[styles.dimmedArea, styles.dimmedRight, { width: Animated.subtract(TIMELINE_WIDTH - HANDLE_WIDTH, endHandleX) }]} />

              {/* Handle Inicio */}
              <Animated.View style={[styles.handle, styles.handleLeft, { transform: [{ translateX: startHandleX }] }]} {...startPanResponder.panHandlers}>
                <View style={styles.handleBar} />
              </Animated.View>

              {/* Handle Fim */}
              <Animated.View style={[styles.handle, styles.handleRight, { transform: [{ translateX: endHandleX }] }]} {...endPanResponder.panHandlers}>
                <View style={styles.handleBar} />
              </Animated.View>
            </View>
          )}
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
    justifyContent: 'space-between', // Espacamento entre elementos
    alignItems: 'center', //......... Centraliza verticalmente
    paddingHorizontal: 16, //........ Padding horizontal
    paddingTop: 8, //................ Padding superior
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

  // Botao confirmar
  confirmButton: {
    backgroundColor: CameraColors.primary, // Fundo azul
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18, //............ Tamanho da fonte
    fontWeight: '600', //....... Peso da fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Container do video
  videoContainer: {
    flex: 1, //................. Ocupa espaco disponivel
    justifyContent: 'center', // Centraliza vertical
    alignItems: 'center', //.... Centraliza horizontal
  },

  // Video
  video: {
    width: '100%', //.. Largura total
    height: '100%', //. Altura total
  },

  // Overlay de play
  playOverlay: {
    ...StyleSheet.absoluteFillObject, // Posicao absoluta
    justifyContent: 'center', //....... Centraliza vertical
    alignItems: 'center', //........... Centraliza horizontal
  },

  // Botao de play
  playButton: {
    width: 60, //................. Largura fixa
    height: 60, //................ Altura fixa
    borderRadius: 30, //.......... Circular
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo semi-transparente
    justifyContent: 'center', //.. Centraliza horizontal
    alignItems: 'center', //...... Centraliza vertical
  },

  // Container da duracao
  durationContainer: {
    alignItems: 'center', //.. Centraliza horizontal
    paddingVertical: 16, //... Padding vertical
  },

  // Texto da duracao
  durationText: {
    fontSize: 16, //............... Tamanho da fonte
    fontWeight: '600', //.......... Peso da fonte
    color: CameraColors.textWhite, // Cor branca
  },

  // Label da duracao
  durationLabel: {
    fontSize: 14, //............... Tamanho da fonte
    color: CameraColors.textSecondary, // Cor cinza
    marginTop: 4, //............... Margem superior
  },

  // Container da timeline
  timelineContainer: {
    paddingHorizontal: 32, //. Padding horizontal
    paddingTop: 16, //........ Padding superior
  },

  // Timeline
  timeline: {
    width: TIMELINE_WIDTH, //. Largura fixa
    height: 60, //............ Altura fixa
    position: 'relative', //.. Posicao relativa
  },

  // Container dos thumbnails
  thumbnailsContainer: {
    flexDirection: 'row', //........ Layout horizontal
    width: '100%', //............... Largura total
    height: '100%', //.............. Altura total
    borderRadius: 8, //............. Borda arredondada
    overflow: 'hidden', //.......... Esconde overflow
  },

  // Thumbnail individual
  thumbnail: {
    flex: 1, //.......... Ocupa espaco igual
    height: '100%', //... Altura total
  },

  // Area selecionada
  selectedArea: {
    position: 'absolute', //...... Posicao absoluta
    top: 0, //.................... Topo
    bottom: 0, //................. Base
    borderTopWidth: 3, //......... Borda superior
    borderBottomWidth: 3, //...... Borda inferior
    borderColor: CameraColors.primary, // Cor azul
  },

  // Area escurecida
  dimmedArea: {
    position: 'absolute', //................ Posicao absoluta
    top: 0, //............................. Topo
    bottom: 0, //.......................... Base
    backgroundColor: 'rgba(0,0,0,0.6)', //.. Fundo escurecido
  },

  // Area escurecida esquerda
  dimmedLeft: {
    left: 0, //.. Alinhado a esquerda
  },

  // Area escurecida direita
  dimmedRight: {
    right: 0, //.. Alinhado a direita
  },

  // Handle
  handle: {
    position: 'absolute', //................ Posicao absoluta
    top: -4, //............................ Acima da timeline
    bottom: -4, //......................... Abaixo da timeline
    width: HANDLE_WIDTH, //................ Largura fixa
    backgroundColor: CameraColors.primary, // Fundo azul
    justifyContent: 'center', //........... Centraliza horizontal
    alignItems: 'center', //............... Centraliza vertical
  },

  // Handle esquerdo
  handleLeft: {
    borderTopLeftRadius: 8, //.... Borda superior esquerda
    borderBottomLeftRadius: 8, //. Borda inferior esquerda
  },

  // Handle direito
  handleRight: {
    borderTopRightRadius: 8, //.... Borda superior direita
    borderBottomRightRadius: 8, //. Borda inferior direita
  },

  // Barra do handle
  handleBar: {
    width: 4, //................... Largura fixa
    height: 24, //................. Altura fixa
    backgroundColor: CameraColors.textWhite, // Cor branca
    borderRadius: 2, //............ Borda arredondada
  },
});

// ========================================
// Export
// ========================================
export default VideoTrimScreen;
