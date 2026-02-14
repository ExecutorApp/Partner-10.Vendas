// ========================================
// Componente VideoEditorPanel
// Controles de trim e audio para video
// Trim bar com thumbnails + audio toggle
// Estilo WhatsApp: handles finos, azul escuro, tempo ao arrastar
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Platform,
  ActivityIndicator,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors } from '../utils/cameraConstants';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_PADDING = 5;                   //......Padding lateral externo (5px cada lado)
const OUTER_FRAME_WIDTH = 4;                  //......Largura do frame cinza (4px cada lado)
const INNER_PADDING = 2;                      //......Padding preto interno (2px cada lado)
const TOTAL_SIDE = TIMELINE_PADDING + OUTER_FRAME_WIDTH + INNER_PADDING;  //......11px cada lado
const TIMELINE_WIDTH = SCREEN_WIDTH - TOTAL_SIDE * 2;  //......Largura real da timeline interna
const HANDLE_WIDTH = 16;                      //......Largura do handle (visivel + toque)
const MIN_TRIM_DURATION = 1000;               //......Duracao minima em ms (1 segundo)
const THUMBNAIL_COUNT = 8;                    //......Quantidade de thumbnails
const TIMELINE_HEIGHT = 44;                   //......Altura da timeline (menor)
const TRIM_BORDER_COLOR = CameraColors.primary;  //......Azul escuro (#1777CF)
const DIMMED_COLOR = 'rgba(0,0,0,0.6)';       //......Cor da area escurecida
const OUTER_FRAME_COLOR = '#505050';           //......Cor do frame externo (cinza claro)

// ========================================
// Tipos
// ========================================
interface VideoEditorPanelProps {
  videoUri: string;                           //......URI do video
  duration: number;                           //......Duracao total em ms
  trimStart: number;                          //......Inicio do corte em ms
  trimEnd: number;                            //......Fim do corte em ms
  audioEnabled: boolean;                      //......Audio ativado
  fileSize?: number;                          //......Tamanho do arquivo em bytes
  currentPosition?: number;                   //......Posicao atual de playback em ms
  isPlaying?: boolean;                        //......Video esta tocando
  onTrimChange: (start: number, end: number) => void;
  onAudioToggle: () => void;                  //......Toggle audio
  onDragStateChange?: (isDragging: boolean) => void;  //......Estado de arrastar
}

// ========================================
// Funcoes Utilitarias
// ========================================
const formatTime = (ms: number): string => {
  if (!ms || !isFinite(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (!bytes || !isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ========================================
// Icone Speaker On (audio ativado)
// ========================================
const SpeakerOnIcon: React.FC = memo(() => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      fill={CameraColors.textWhite}
    />
  </Svg>
));

// ========================================
// Icone Speaker Off (audio desativado)
// ========================================
const SpeakerOffIcon: React.FC = memo(() => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
      fill={CameraColors.textSecondary}
    />
  </Svg>
));

// ========================================
// Componente Principal VideoEditorPanel
// Apenas trim bar + controles de audio (sem video player)
// ========================================
const VideoEditorPanel: React.FC<VideoEditorPanelProps> = ({
  videoUri,
  duration,
  trimStart,
  trimEnd,
  audioEnabled,
  fileSize,
  currentPosition = 0,
  isPlaying = false,
  onTrimChange,
  onAudioToggle,
  onDragStateChange,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(true);
  const [actualDuration, setActualDuration] = useState(duration);
  const [actualFileSize, setActualFileSize] = useState(fileSize || 0);
  const [isDragging, setIsDragging] = useState(false);

  // ========================================
  // Valores Animados para Handles
  // ========================================
  const startHandleX = useRef(new Animated.Value(0)).current;
  const endHandleX = useRef(new Animated.Value(TIMELINE_WIDTH - HANDLE_WIDTH)).current;
  const startHandleXRef = useRef(0);
  const endHandleXRef = useRef(TIMELINE_WIDTH - HANDLE_WIDTH);

  // ========================================
  // Gerar Thumbnails na Web
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web' || !videoUri) {
      setIsLoadingThumbs(false);
      return;
    }

    let cancelled = false;

    const generateThumbs = async () => {
      try {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.src = videoUri;
        vid.preload = 'auto';
        vid.muted = true;

        // Helper: esperar evento com timeout
        const waitForEvent = (eventName: string, timeoutMs: number = 5000): Promise<void> => {
          return new Promise<void>((resolve) => {
            let resolved = false;
            const done = () => { if (!resolved) { resolved = true; resolve(); } };
            vid.addEventListener(eventName, done, { once: true });
            setTimeout(done, timeoutMs);
          });
        };

        // Esperar carregar metadados
        await new Promise<void>((resolve, reject) => {
          vid.addEventListener('loadeddata', () => resolve(), { once: true });
          vid.addEventListener('error', () => reject(new Error('Video load failed')), { once: true });
          // Timeout de seguranca
          setTimeout(() => resolve(), 8000);
        });

        if (cancelled) return;

        // WebM blob fix: se duracao e Infinity/NaN, forcar busca do fim do video
        let realDurationSec = vid.duration;
        if (!isFinite(realDurationSec) || realDurationSec <= 0) {
          console.log('[VideoEditorPanel] Duration Infinity/NaN - aplicando WebM fix...');
          vid.currentTime = 1e10;
          await waitForEvent('seeked', 3000);
          realDurationSec = vid.duration;
          console.log('[VideoEditorPanel] Duration apos fix:', realDurationSec);
          vid.currentTime = 0;
          await waitForEvent('seeked', 2000);
        }

        // Se ainda nao tem duracao valida, usar fallback da prop
        if (!isFinite(realDurationSec) || realDurationSec <= 0) {
          realDurationSec = (duration > 0 ? duration : 10000) / 1000;
          console.log('[VideoEditorPanel] Usando duracao fallback:', realDurationSec);
        }

        const realDurationMs = realDurationSec * 1000;
        if (realDurationMs > 0 && isFinite(realDurationMs)) {
          setActualDuration(realDurationMs);
          if (trimEnd <= 0 || !isFinite(trimEnd) || Math.abs(trimEnd - duration) < 100) {
            onTrimChange(trimStart, realDurationMs);
          }
        }

        if (cancelled) return;

        // Obter tamanho do arquivo se nao fornecido
        if (!fileSize && videoUri.startsWith('blob:')) {
          try {
            const response = await fetch(videoUri);
            const blob = await response.blob();
            setActualFileSize(blob.size);
          } catch (e) {
            setActualFileSize(Math.round(realDurationSec * 300 * 1024));
          }
        }

        if (cancelled) return;

        // Gerar thumbnails
        const interval = realDurationSec / THUMBNAIL_COUNT;
        const thumbs: string[] = [];

        for (let i = 0; i < THUMBNAIL_COUNT; i++) {
          if (cancelled) return;
          const time = Math.min(i * interval + 0.01, realDurationSec - 0.01);
          vid.currentTime = time;

          await waitForEvent('seeked', 3000);
          await new Promise(r => setTimeout(r, 50));

          const canvas = document.createElement('canvas');
          canvas.width = 80;
          canvas.height = TIMELINE_HEIGHT;
          const ctx = canvas.getContext('2d');
          if (ctx && vid.videoWidth > 0) {
            const vw = vid.videoWidth;
            const vh = vid.videoHeight;
            const canvasAspect = canvas.width / canvas.height;
            const videoAspect = vw / vh;
            let sx = 0, sy = 0, sw = vw, sh = vh;
            if (videoAspect > canvasAspect) {
              sw = vh * canvasAspect;
              sx = (vw - sw) / 2;
            } else {
              sh = vw / canvasAspect;
              sy = (vh - sh) / 2;
            }
            ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
          }
        }

        if (!cancelled) {
          setThumbnails(thumbs);
        }

        vid.src = '';
        vid.load();
      } catch (error) {
        console.error('[VideoEditorPanel] Erro ao gerar thumbnails:', error);
      } finally {
        if (!cancelled) {
          setIsLoadingThumbs(false);
        }
      }
    };

    generateThumbs();

    return () => { cancelled = true; };
  }, [videoUri]);

  // ========================================
  // Sincronizar Handles com Trim Values
  // ========================================
  useEffect(() => {
    if (actualDuration > 0) {
      const startPct = trimStart / actualDuration;
      const endPct = trimEnd / actualDuration;
      const maxX = TIMELINE_WIDTH - HANDLE_WIDTH;
      const startX = Math.max(0, Math.min(maxX, startPct * maxX));
      const endX = Math.max(0, Math.min(maxX, endPct * maxX));
      startHandleXRef.current = startX;
      endHandleXRef.current = endX;
      startHandleX.setValue(startX);
      endHandleX.setValue(endX);
    }
  }, [actualDuration]);

  // ========================================
  // Handlers: Atualizar Trim
  // ========================================
  const updateTrimStart = useCallback((x: number) => {
    const maxX = TIMELINE_WIDTH - HANDLE_WIDTH;
    const pct = Math.max(0, x) / maxX;
    const newStart = pct * actualDuration;
    if (trimEnd - newStart >= MIN_TRIM_DURATION) {
      onTrimChange(newStart, trimEnd);
    }
  }, [actualDuration, trimEnd, onTrimChange]);

  const updateTrimEnd = useCallback((x: number) => {
    const pct = Math.min(TIMELINE_WIDTH, x + HANDLE_WIDTH) / TIMELINE_WIDTH;
    const newEnd = pct * actualDuration;
    if (newEnd - trimStart >= MIN_TRIM_DURATION) {
      onTrimChange(trimStart, newEnd);
    }
  }, [actualDuration, trimStart, onTrimChange]);

  // ========================================
  // Ref para posicao inicial do gesto (gravada no Grant)
  // ========================================
  const startGrabX = useRef(0);
  const endGrabX = useRef(0);

  // ========================================
  // PanResponder: Handle Inicio
  // ========================================
  const startPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startGrabX.current = startHandleXRef.current;
      setIsDragging(true);
      onDragStateChange?.(true);
    },
    onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      const maxLimit = endHandleXRef.current - HANDLE_WIDTH - 10;
      const newX = Math.max(0, Math.min(maxLimit, startGrabX.current + gs.dx));
      startHandleX.setValue(newX);
      startHandleXRef.current = newX;
      updateTrimStart(newX);
    },
    onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      const maxLimit = endHandleXRef.current - HANDLE_WIDTH - 10;
      const newX = Math.max(0, Math.min(maxLimit, startGrabX.current + gs.dx));
      startHandleXRef.current = newX;
      startHandleX.setValue(newX);
      setIsDragging(false);
      onDragStateChange?.(false);
    },
  }), [startHandleX, updateTrimStart, onDragStateChange]);

  // ========================================
  // PanResponder: Handle Fim
  // ========================================
  const endPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      endGrabX.current = endHandleXRef.current;
      setIsDragging(true);
      onDragStateChange?.(true);
    },
    onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      const minLimit = startHandleXRef.current + HANDLE_WIDTH + 10;
      const newX = Math.min(TIMELINE_WIDTH - HANDLE_WIDTH, Math.max(minLimit, endGrabX.current + gs.dx));
      endHandleX.setValue(newX);
      endHandleXRef.current = newX;
      updateTrimEnd(newX);
    },
    onPanResponderRelease: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
      const minLimit = startHandleXRef.current + HANDLE_WIDTH + 10;
      const newX = Math.min(TIMELINE_WIDTH - HANDLE_WIDTH, Math.max(minLimit, endGrabX.current + gs.dx));
      endHandleXRef.current = newX;
      endHandleX.setValue(newX);
      setIsDragging(false);
      onDragStateChange?.(false);
    },
  }), [endHandleX, updateTrimEnd, onDragStateChange]);

  // ========================================
  // Calcular Valores Derivados
  // ========================================
  const trimmedDuration = trimEnd - trimStart;
  const useDuration = actualDuration > 0 ? actualDuration : 1;
  const useFileSize = actualFileSize > 0 ? actualFileSize : (fileSize || 0);
  const estimatedSize = useFileSize > 0
    ? Math.round(useFileSize * (trimmedDuration / useDuration))
    : Math.round((trimmedDuration / 1000) * 300 * 1024);

  // Detectar se o trim foi alterado (nao esta no tamanho original do video)
  // Se inicio > 100ms ou fim < duracao - 100ms, houve corte
  const hasTrimChanged = trimStart > 100 || (actualDuration > 0 && trimEnd < actualDuration - 100);

  // Mostrar selecao branca: durante arraste OU se trim foi modificado
  const showSelection = isDragging || hasTrimChanged;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* ======================================== */}
      {/* Barra de Trim (Timeline com Thumbnails) */}
      {/* ======================================== */}
      <View style={styles.trimSection}>
        {isLoadingThumbs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={CameraColors.primary} />
          </View>
        ) : (
          /* Frame externo cinza com padding preto interno */
          <View style={styles.outerFrame}>
            <View style={styles.innerPadding}>
              <View style={styles.timeline}>
                {/* Strip de Thumbnails */}
                <View style={styles.thumbnailStrip}>
                  {thumbnails.length > 0 ? (
                    thumbnails.map((thumb, i) => (
                      <Image key={i} source={{ uri: thumb }} style={styles.thumbnail} />
                    ))
                  ) : (
                    Array.from({ length: THUMBNAIL_COUNT }).map((_, i) => (
                      <View key={i} style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
                    ))
                  )}
                </View>

                {/* Borda da Area Selecionada (topo e base) - branca, ao arrastar ou com trim modificado */}
                {showSelection && (
                  <Animated.View
                    style={[
                      styles.selectedArea,
                      {
                        left: Animated.add(startHandleX, HANDLE_WIDTH),
                        right: Animated.subtract(TIMELINE_WIDTH, endHandleX),
                      },
                    ]}
                  />
                )}

                {/* Area Escurecida Esquerda */}
                <Animated.View style={[styles.dimmedArea, styles.dimmedLeft, { width: startHandleX }]} />

                {/* Area Escurecida Direita */}
                <Animated.View
                  style={[
                    styles.dimmedArea,
                    styles.dimmedRight,
                    { width: Animated.subtract(TIMELINE_WIDTH - HANDLE_WIDTH, endHandleX) },
                  ]}
                />

                {/* Handle Inicio (esquerdo) - sempre visivel com seta < */}
                <Animated.View
                  style={[
                    styles.handle,
                    styles.handleLeft,
                    showSelection && styles.handleDragging,
                    { transform: [{ translateX: startHandleX }] },
                  ]}
                  {...startPanResponder.panHandlers}
                >
                  <Svg width={8} height={14} viewBox="0 0 8 14" fill="none">
                    <Path d="M7 1L1 7l6 6" stroke={TRIM_BORDER_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Animated.View>

                {/* Handle Fim (direito) - sempre visivel com seta > */}
                <Animated.View
                  style={[
                    styles.handle,
                    styles.handleRight,
                    showSelection && styles.handleDragging,
                    { transform: [{ translateX: endHandleX }] },
                  ]}
                  {...endPanResponder.panHandlers}
                >
                  <Svg width={8} height={14} viewBox="0 0 8 14" fill="none">
                    <Path d="M1 1l6 6-6 6" stroke={TRIM_BORDER_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Animated.View>

                {/* Indicador de Posicao de Playback (linha branca que se move) */}
                {isPlaying && actualDuration > 0 && (
                  <View
                    style={[
                      styles.playbackLine,
                      { left: Math.max(0, Math.min(TIMELINE_WIDTH - 2, (currentPosition / actualDuration) * TIMELINE_WIDTH)) },
                    ]}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ======================================== */}
      {/* Controles de Audio */}
      {/* ======================================== */}
      <View style={styles.audioRow}>
        <View style={styles.audioInfoContainer}>
          {/* Toggle Audio (sem container circular - icone direto) */}
          <Pressable onPress={onAudioToggle} hitSlop={8}>
            {audioEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
          </Pressable>

          {/* Duracao do Trim */}
          <Text style={styles.audioTimeText}>{formatTime(trimmedDuration)}</Text>

          {/* Separador + Tamanho (apenas se houver tamanho) */}
          {estimatedSize > 0 && (
            <>
              <View style={styles.audioSeparator} />
              <Text style={styles.audioSizeText}>{formatFileSize(estimatedSize)}</Text>
            </>
          )}
        </View>
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
    width: '100%',                            //......Largura total
  },

  // Secao do trim
  trimSection: {
    paddingHorizontal: TIMELINE_PADDING,      //......5px cada lado
    paddingVertical: 4,                       //......Padding vertical minimo
    justifyContent: 'center',                 //......Centraliza vertical
  },

  // Container de carregamento
  loadingContainer: {
    height: TIMELINE_HEIGHT,                  //......Altura fixa
    justifyContent: 'center',                 //......Centraliza vertical
    alignItems: 'center',                     //......Centraliza horizontal
  },

  // Frame externo cinza (container em volta da timeline - borda grossa)
  outerFrame: {
    borderWidth: OUTER_FRAME_WIDTH,           //......Borda cinza grossa (4px)
    borderColor: OUTER_FRAME_COLOR,           //......Cinza (#505050)
    borderRadius: 10,                         //......Cantos arredondados
    overflow: 'hidden',                       //......Esconde overflow
  },

  // Padding preto interno (entre frame cinza e thumbnails)
  innerPadding: {
    padding: INNER_PADDING,                   //......2px preto escuro
    backgroundColor: '#1A1A1A',               //......Chumbo mais escuro
  },

  // Timeline (dentro do padding preto)
  timeline: {
    width: '100%',                            //......Largura total
    height: TIMELINE_HEIGHT,                  //......Altura fixa (44px)
    position: 'relative',                     //......Posicao relativa
    borderRadius: 4,                          //......Cantos internos arredondados
    overflow: 'hidden',                       //......Esconde overflow
  },

  // Strip de thumbnails
  thumbnailStrip: {
    flexDirection: 'row',                     //......Layout horizontal
    width: '100%',                            //......Largura total
    height: '100%',                           //......Altura total
  },

  // Thumbnail individual
  thumbnail: {
    flex: 1,                                  //......Espaco igual
    height: '100%',                           //......Altura total
  },

  // Placeholder de thumbnail
  thumbnailPlaceholder: {
    backgroundColor: '#222222',               //......Fundo escuro
  },

  // Area selecionada (borda topo/base - azul escuro, so ao arrastar)
  selectedArea: {
    position: 'absolute',                     //......Posicao absoluta
    top: 0,                                   //......Topo
    bottom: 0,                                //......Base
    borderTopWidth: 2,                        //......Borda superior fina
    borderBottomWidth: 2,                     //......Borda inferior fina
    borderColor: '#FFFFFF',                   //......Branco
  },

  // Area escurecida
  dimmedArea: {
    position: 'absolute',                     //......Posicao absoluta
    top: 0,                                   //......Topo
    bottom: 0,                                //......Base
    backgroundColor: DIMMED_COLOR,            //......Fundo escurecido
  },

  // Area escurecida esquerda
  dimmedLeft: {
    left: 0,                                  //......Alinhado a esquerda
  },

  // Area escurecida direita
  dimmedRight: {
    right: 0,                                 //......Alinhado a direita
  },

  // Handle (arrastavel) - sempre visivel com seta < ou >
  handle: {
    position: 'absolute',                     //......Posicao absoluta
    top: 0,                                   //......Topo
    bottom: 0,                                //......Base
    width: HANDLE_WIDTH,                      //......16px - visivel e tocavel
    backgroundColor: OUTER_FRAME_COLOR,       //......Cinza (igual ao frame)
    justifyContent: 'center',                 //......Centraliza vertical
    alignItems: 'center',                     //......Centraliza horizontal
    zIndex: 10,                               //......Acima de tudo
  },

  // Handle esquerdo
  handleLeft: {
    borderTopLeftRadius: 4,                   //......Arredondado TL
    borderBottomLeftRadius: 4,                //......Arredondado BL
  },

  // Handle direito
  handleRight: {
    borderTopRightRadius: 4,                  //......Arredondado TR
    borderBottomRightRadius: 4,               //......Arredondado BR
  },

  // Handle quando arrastando (fica azul)
  handleDragging: {
    backgroundColor: '#FFFFFF',               //......Branco
  },

  // Indicador de posicao de playback (linha branca fina)
  playbackLine: {
    position: 'absolute',                     //......Posicao absoluta
    top: 0,                                   //......Topo
    bottom: 0,                                //......Base
    width: 2,                                 //......Largura fina
    backgroundColor: '#FFFFFF',               //......Branco
    zIndex: 15,                               //......Acima dos handles
  },

  // Linha de controles de audio
  audioRow: {
    flexDirection: 'row',                     //......Layout horizontal
    alignItems: 'center',                     //......Centraliza vertical
    paddingHorizontal: TIMELINE_PADDING,      //......Mesmo padding da timeline
    paddingVertical: 4,                       //......Padding vertical minimo
  },

  // Container do audio (fino, sem container extra no icone)
  audioInfoContainer: {
    flexDirection: 'row',                     //......Layout horizontal
    alignItems: 'center',                     //......Centraliza vertical
    backgroundColor: '#303030',               //......Fundo chumbo padrao
    borderRadius: 8,                          //......Cantos levemente arredondados
    paddingHorizontal: 10,                    //......Padding horizontal
    paddingVertical: 4,                       //......Padding vertical FINO
    gap: 8,                                   //......Espaco entre itens
  },

  // Texto do tempo de audio
  audioTimeText: {
    fontSize: 14,                             //......Tamanho fonte
    fontWeight: '600',                        //......Semi-bold
    color: CameraColors.textWhite,            //......Branco
    fontFamily: 'monospace',                  //......Monospace
  },

  // Separador vertical
  audioSeparator: {
    width: 1,                                 //......Largura
    height: 14,                               //......Altura menor
    backgroundColor: 'rgba(255,255,255,0.2)', //......Branco semi-transparente
  },

  // Texto do tamanho do arquivo (azul claro padrao do sistema)
  audioSizeText: {
    fontSize: 13,                             //......Tamanho fonte
    color: CameraColors.checkBlue,            //......Azul claro (#53BDEB)
  },
});

// ========================================
// Export
// ========================================
export default VideoEditorPanel;
