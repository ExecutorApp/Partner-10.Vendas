import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useMiniPlayer } from '../context/MiniPlayerContext';

// ========================================
// IMPORTA ICONES DO PLAYER (MESMOS DO LOCAL)
// ========================================

import {
  PlayIcon,
  PauseIcon,
  PreviousIcon,
  NextIcon,
  CloseIcon,
  ExpandIcon,
} from '../screens/14.Training/07.Training-PlayerIcons';

// ========================================
// CONSTANTES DE CORES
// ========================================

const COLORS = {
  primary: '#1777CF', //..Azul primario
  white: '#FFFFFF', //....Branco
};

// ========================================
// CONSTANTES (sincronizado com PlayerStyles)
// ========================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dimensoes do Mini Player (sincronizado com PlayerStyles)
const MINI_PLAYER_WIDTH_SMALL = 200; //...Largura pequena (tamanho 1)
const MINI_PLAYER_HEIGHT_SMALL = 112; //..Altura pequena (16:9)
const MINI_PLAYER_WIDTH_MEDIUM = 280; //..Largura media (tamanho 2)
const MINI_PLAYER_HEIGHT_MEDIUM = 158; //.Altura media (16:9)

// ========================================
// COMPONENTE GLOBAL MINI PLAYER
// ========================================

const GlobalMiniPlayer: React.FC = () => {
  // Contexto do Mini Player
  const {
    isActive,
    isMinimized,
    isPlayerScreenActive,
    contents,
    currentLessonIndex,
    isPlaying,
    videoProgress,
    videoDuration,
    videoPosition,
    miniPlayerSize,
    showMiniControls,
    panPosition,
    videoRef,
    expandedVideoLayout,
    playPause,
    nextLesson,
    previousLesson,
    deactivate,
    expand,
    setShowMiniControls,
    getVideoUrl,
    repeatEnabled,
    cycleMiniPlayerSize,
    updateVideoState,
    updateWatchedRange,
  } = useMiniPlayer();

  // Estado local para seeking
  const [isSeeking, setIsSeeking] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  // Key para forcar desmontagem completa dos controles - calculada diretamente do miniPlayerSize
  // Isso garante que a key mude SINCRONAMENTE com miniPlayerSize (sem delay de useEffect)
  const controlsKey = useMemo(() => `controls-size-${miniPlayerSize}`, [miniPlayerSize]);

  // Ref para o container atual do mini player (para proteger de remocao)
  const currentContainerRef = useRef<any>(null);

  // Refs para dimensoes do mini player
  const miniPlayerWidthRef = useRef(MINI_PLAYER_WIDTH_SMALL);
  const miniPlayerHeightRef = useRef(MINI_PLAYER_HEIGHT_SMALL);

  // Ref para rastrear se o gesto comecou na barra de progresso
  const isGestureOnProgressBarRef = useRef(false);

  // Ref para rastrear se o mini player esta sendo arrastado
  const isDraggingMiniPlayerRef = useRef(false);

  // Ref para seeking sincrono
  const isSeekingRef = useRef(false);

  // Ref para duracao do video (para handlers acessarem valor atual)
  const videoDurationRef = useRef(videoDuration);

  // Atualiza ref de duracao quando muda
  useEffect(() => {
    videoDurationRef.current = videoDuration;
  }, [videoDuration]);

  // Refs para rastreamento de progresso real assistido
  const lastKnownPositionRef = useRef(0); //................Ultima posicao conhecida (em ms)
  const currentWatchRangeStartRef = useRef(0); //...........Inicio da faixa atual sendo assistida (em ms)
  const isTrackingWatchRangeRef = useRef(false); //..........Se esta rastreando uma faixa assistida

  // Atualiza progresso local quando nao esta seeking
  useEffect(() => {
    if (!isSeeking) {
      setLocalProgress(videoProgress);
    }
  }, [videoProgress, isSeeking]);

  // Reseta rastreamento de progresso quando aula muda
  useEffect(() => {
    console.log('[PROGRESS_TRACKING] Aula mudou - resetando rastreamento');

    // Finaliza faixa atual se estava rastreando
    if (isTrackingWatchRangeRef.current) {
      const rangeStart = currentWatchRangeStartRef.current;
      const rangeEnd = lastKnownPositionRef.current;

      if (rangeEnd > rangeStart) {
        updateWatchedRange(rangeStart, rangeEnd);
      }
    }

    // Reseta refs
    lastKnownPositionRef.current = 0;
    currentWatchRangeStartRef.current = 0;
    isTrackingWatchRangeRef.current = false;
  }, [currentLessonIndex, updateWatchedRange]);

  // Calcula dimensoes do mini player baseado no tamanho atual
  const getMiniPlayerDimensions = useCallback(() => {
    switch (miniPlayerSize) {
      case 1:
        return { width: MINI_PLAYER_WIDTH_SMALL, height: MINI_PLAYER_HEIGHT_SMALL };
      case 2:
        return { width: MINI_PLAYER_WIDTH_MEDIUM, height: MINI_PLAYER_HEIGHT_MEDIUM };
      case 3:
        const largeWidth = SCREEN_WIDTH - 20;
        const largeHeight = (largeWidth * 9) / 16;
        return { width: largeWidth, height: largeHeight };
      default:
        return { width: MINI_PLAYER_WIDTH_SMALL, height: MINI_PLAYER_HEIGHT_SMALL };
    }
  }, [miniPlayerSize]);

  // Atualiza refs de dimensoes quando tamanho muda
  useEffect(() => {
    const { width, height } = getMiniPlayerDimensions();
    miniPlayerWidthRef.current = width;
    miniPlayerHeightRef.current = height;
  }, [miniPlayerSize, getMiniPlayerDimensions]);

  // Estado para forcar update do videoStyle quando panPosition muda
  const [forceUpdateValue, forceUpdate] = useState(0);

  // Calcula estilo do video baseado no estado (expandido vs minimizado)
  const videoStyle = useMemo(() => {
    console.log('[DEBUG_VIDEO_STYLE] Recalculando videoStyle...', {
      isActive,
      isMinimized,
      expandedVideoLayout,
    });

    if (!isActive) {
      console.log('[DEBUG_VIDEO_STYLE] isActive = false -> display: none');
      // Oculta video quando nao ativo
      // Inclui position: static para evitar elemento fixed residual
      return {
        display: 'none',
        position: 'static' as any,
        width: 0,
        height: 0,
      };
    }

    const { width: miniWidth, height: miniHeight } = getMiniPlayerDimensions();

    if (isMinimized) {
      // Modo mini player flutuante
      // IMPORTANTE: React Native Animated move o valor para _offset quando AnimatedValue tem children
      // Por isso precisamos somar _value + _offset para obter a posicao real
      const xValue = (panPosition.x as any)._value || 0;
      const xOffset = (panPosition.x as any)._offset || 0;
      const yValue = (panPosition.y as any)._value || 0;
      const yOffset = (panPosition.y as any)._offset || 0;

      const currentX = xValue + xOffset;
      const currentY = yValue + yOffset;

      console.log('[DEBUG_VIDEO_POSITION] ==================== LENDO POSICAO ====================');
      console.log('[DEBUG_VIDEO_POSITION] panPosition:', panPosition);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.x:', panPosition.x);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.y:', panPosition.y);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.x._value:', xValue);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.x._offset:', xOffset);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.y._value:', yValue);
      console.log('[DEBUG_VIDEO_POSITION] panPosition.y._offset:', yOffset);
      console.log('[DEBUG_VIDEO_POSITION] currentX calculado (_value + _offset):', currentX);
      console.log('[DEBUG_VIDEO_POSITION] currentY calculado (_value + _offset):', currentY);
      console.log('[DEBUG_VIDEO_POSITION] ================================================================');

      const style = {
        position: 'fixed' as const,
        top: currentY,
        left: currentX,
        width: miniWidth,
        height: miniHeight,
        objectFit: 'cover' as const,
        borderRadius: 12, //..............Bordas arredondadas do video (AJUSTE AQUI para alterar o arredondamento)
        zIndex: 1, //.....................Abaixo dos controles
        pointerEvents: 'none' as const, //..Permite cliques atraves do video
        backgroundColor: 'transparent', //..Fundo transparente
      };

      console.log('[DEBUG_VIDEO_STYLE] Modo MINIMIZADO:', style);
      return style;
    } else {
      // Modo expandido (ocupa area do PlayerScreen)
      const layout = expandedVideoLayout;

      if (!layout) {
        console.log('[DEBUG_VIDEO_STYLE] expandedVideoLayout = null -> usando fallback');
        // Fallback: usa dimensoes da tela
        return {
          position: 'fixed' as const,
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: (SCREEN_WIDTH * 9) / 16, //..16:9
          objectFit: 'contain' as const,
          zIndex: 1, //.....................Acima do fundo mas abaixo dos controles
          pointerEvents: 'none' as const, //..Permite cliques atraves do video
          backgroundColor: '#000',
        };
      }

      const style = {
        position: 'fixed' as const,
        top: layout.top,
        left: layout.left,
        width: layout.width,
        height: layout.height,
        objectFit: 'contain' as const,
        zIndex: 1, //.....................Acima do fundo mas abaixo dos controles
        pointerEvents: 'none' as const, //..Permite cliques atraves do video
        backgroundColor: '#000',
      };

      console.log('[DEBUG_VIDEO_STYLE] Modo EXPANDIDO:', style);
      return style;
    }
  }, [isActive, isMinimized, panPosition, getMiniPlayerDimensions, expandedVideoLayout, miniPlayerSize, forceUpdateValue]);

  // Ajusta posicao quando tamanho muda
  useEffect(() => {
    if (isMinimized && miniPlayerSize > 1) {
      const { width, height } = getMiniPlayerDimensions();
      const currentX = (panPosition.x as any)._value;
      const currentY = (panPosition.y as any)._value;

      const minX = 10;
      const maxX = SCREEN_WIDTH - width - 10;
      const minY = 10;
      const maxY = SCREEN_HEIGHT - height - 10;

      const boundedX = Math.max(minX, Math.min(currentX, maxX));
      const boundedY = Math.max(minY, Math.min(currentY, maxY));

      const diffX = Math.abs(boundedX - currentX);
      const diffY = Math.abs(boundedY - currentY);

      if (diffX > 2 || diffY > 2) {
        panPosition.setValue({ x: boundedX, y: boundedY });
      }
    }
  }, [miniPlayerSize, isMinimized, getMiniPlayerDimensions, panPosition]);

  // Listener para panPosition (forca update do estilo do video quando arrasta)
  useEffect(() => {
    if (!isMinimized) return;

    const listenerId = panPosition.addListener(() => {
      // Forca re-render para atualizar estilo do video
      forceUpdate(prev => prev + 1);
    });

    return () => {
      panPosition.removeListener(listenerId);
    };
  }, [isMinimized, panPosition]);

  // PanResponder para arrastar o mini player (nao responde na barra de progresso)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Verifica se o toque esta na regiao da barra de progresso (30px do fundo)
        const touchY = evt.nativeEvent.locationY;
        const height = miniPlayerHeightRef.current || MINI_PLAYER_HEIGHT_SMALL;
        const isInProgressArea = touchY > height - 30;
        // Salva na ref se o gesto comecou na barra
        isGestureOnProgressBarRef.current = isInProgressArea;
        return !isInProgressArea; //......................Nao responde se estiver na barra
      },
      onMoveShouldSetPanResponder: () => {
        // Se o gesto comecou na barra, nao responde ao movimento
        return !isGestureOnProgressBarRef.current;
      },
      onStartShouldSetPanResponderCapture: (evt) => {
        // Captura eventos fora da barra de progresso para evitar scroll
        const touchY = evt.nativeEvent.locationY;
        const height = miniPlayerHeightRef.current || MINI_PLAYER_HEIGHT_SMALL;
        const isInProgressArea = touchY > height - 30;
        return !isInProgressArea; //..Captura se nao estiver na barra
      },
      onMoveShouldSetPanResponderCapture: () => {
        // Sempre captura movimento se estiver arrastando ou nao estiver na barra
        return isDraggingMiniPlayerRef.current || !isGestureOnProgressBarRef.current;
      },
      onPanResponderTerminationRequest: () => {
        // Nunca permite interrupcao enquanto estiver arrastando
        return !isDraggingMiniPlayerRef.current && isGestureOnProgressBarRef.current;
      },
      onPanResponderGrant: () => {
        // Marca que estamos arrastando
        isDraggingMiniPlayerRef.current = true;
        // Mostra controles ao tocar fora da barra de progresso
        setShowMiniControls(true);
        // Salva posicao atual antes de comecar o arrasto
        panPosition.setOffset({
          x: (panPosition.x as any)._value,
          y: (panPosition.y as any)._value,
        });
        panPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panPosition.x, dy: panPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        // Marca que nao estamos mais arrastando
        isDraggingMiniPlayerRef.current = false;

        panPosition.flattenOffset();
        const currentX = (panPosition.x as any)._value;
        const currentY = (panPosition.y as any)._value;

        const width = miniPlayerWidthRef.current;
        const height = miniPlayerHeightRef.current;

        const minX = 10;
        const maxX = SCREEN_WIDTH - width - 10;
        const minY = 10;
        const maxY = SCREEN_HEIGHT - height - 10;

        const boundedX = Math.max(minX, Math.min(currentX, maxX));
        const boundedY = Math.max(minY, Math.min(currentY, maxY));

        if (boundedX !== currentX || boundedY !== currentY) {
          panPosition.setValue({ x: boundedX, y: boundedY });
        }
      },
    })
  ).current;


  // Funcao para calcular e aplicar seek baseado na posicao X do toque
  const applySeekFromX = useCallback((clientX: number, rect: DOMRect) => {
    const barWidth = rect.width;
    const touchX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (touchX / barWidth) * 100));
    setLocalProgress(percentage);

    // Aplica seek no video - obtem duracao DIRETAMENTE do elemento video
    const video = videoRef.current;
    if (video && Platform.OS === 'web') {
      // Obtem duracao diretamente do video (em segundos), nao da ref/estado
      const videoDurationSeconds = video.duration;
      if (videoDurationSeconds && videoDurationSeconds > 0 && isFinite(videoDurationSeconds)) {
        const newPositionSeconds = (percentage / 100) * videoDurationSeconds;

        // IMPORTANTE: Garante que nao passa do limite do video
        // HTML5 video pode ter imprecisoes no final, entao limitamos a 99.5% da duracao
        const maxAllowedTime = videoDurationSeconds * 0.995;
        const clampedTime = Math.min(newPositionSeconds, maxAllowedTime);

        console.log('[SEEK_DEBUG] Aplicando seek:', {
          percentage: percentage.toFixed(2),
          videoDuration: videoDurationSeconds.toFixed(2),
          requestedTime: newPositionSeconds.toFixed(2),
          clampedTime: clampedTime.toFixed(2),
          currentTime: video.currentTime.toFixed(2),
        });

        video.currentTime = clampedTime;
        // Atualiza a ref para manter sincronizado
        videoDurationRef.current = videoDurationSeconds * 1000;
      }
    }

    return percentage;
  }, [videoRef]);

  // Ref para o container da barra de progresso (elemento DOM nativo)
  const progressContainerRef = useRef<any>(null);

  // Ref para armazenar o elemento DOM da barra de progresso
  const progressDomElementRef = useRef<HTMLDivElement | null>(null);

  // Efeito para adicionar event listeners nativos do DOM na barra de progresso
  // Isso e necessario porque React Native Web nao mapeia onMouseDown etc. para Views
  useEffect(() => {
    if (Platform.OS !== 'web' || !isActive || !isMinimized || !showMiniControls) {
      return;
    }

    // Obtem o elemento DOM da ref do React Native Web
    const element = progressContainerRef.current;
    if (!element) return;

    // No React Native Web, a ref pode ser um objeto com _nativeTag ou o proprio elemento
    const domElement = (element as any)._nativeTag
      ? document.querySelector(`[data-rnw-element-id="${(element as any)._nativeTag}"]`)
      : (element as HTMLDivElement);

    // Se ainda nao encontrou, tenta pelo ref diretamente (RNW pode variar)
    const targetElement = domElement || element;
    if (!targetElement || typeof targetElement.addEventListener !== 'function') {
      return;
    }

    progressDomElementRef.current = targetElement as HTMLDivElement;

    // Handler para mousedown/touchstart
    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();

      isSeekingRef.current = true;
      setIsSeeking(true);

      const rect = targetElement.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      applySeekFromX(clientX, rect);
    };

    // Handler para mousemove/touchmove
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isSeekingRef.current) return;

      e.stopPropagation();
      e.preventDefault();

      const rect = targetElement.getBoundingClientRect();
      let clientX = 0;
      if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
      }
      applySeekFromX(clientX, rect);
    };

    // Handler para mouseup/touchend/mouseleave
    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!isSeekingRef.current) return;

      e.stopPropagation();
      e.preventDefault();

      const rect = targetElement.getBoundingClientRect();
      let clientX = 0;
      if ('changedTouches' in e && (e as TouchEvent).changedTouches.length > 0) {
        clientX = (e as TouchEvent).changedTouches[0].clientX;
      } else if ('touches' in e && (e as TouchEvent).touches.length > 0) {
        clientX = (e as TouchEvent).touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }

      const percentage = applySeekFromX(clientX, rect);

      // Atualiza estado no contexto
      const video = videoRef.current;
      if (video) {
        const videoDurationSeconds = video.duration;
        if (videoDurationSeconds && videoDurationSeconds > 0 && isFinite(videoDurationSeconds)) {
          const durationMs = videoDurationSeconds * 1000;
          updateVideoState({
            position: (percentage / 100) * durationMs,
            progress: percentage,
            duration: durationMs,
          });
        }
      }

      isSeekingRef.current = false;
      setIsSeeking(false);
    };

    // Adiciona event listeners com capture para garantir que recebemos o evento
    targetElement.addEventListener('mousedown', handleStart, { capture: true });
    targetElement.addEventListener('touchstart', handleStart, { capture: true, passive: false });

    // Move e end listeners no document para capturar mesmo quando mouse sai do elemento
    document.addEventListener('mousemove', handleMove, { capture: true });
    document.addEventListener('touchmove', handleMove, { capture: true, passive: false });
    document.addEventListener('mouseup', handleEnd, { capture: true });
    document.addEventListener('touchend', handleEnd, { capture: true });
    targetElement.addEventListener('mouseleave', handleEnd, { capture: true });

    // Cleanup
    return () => {
      targetElement.removeEventListener('mousedown', handleStart, { capture: true } as any);
      targetElement.removeEventListener('touchstart', handleStart, { capture: true } as any);
      document.removeEventListener('mousemove', handleMove, { capture: true } as any);
      document.removeEventListener('touchmove', handleMove, { capture: true } as any);
      document.removeEventListener('mouseup', handleEnd, { capture: true } as any);
      document.removeEventListener('touchend', handleEnd, { capture: true } as any);
      targetElement.removeEventListener('mouseleave', handleEnd, { capture: true } as any);
    };
  }, [isActive, isMinimized, showMiniControls, applySeekFromX, updateVideoState, videoRef]);



  // Esconde controles apos 3 segundos
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isMinimized && isPlaying && showMiniControls) {
      timeout = setTimeout(() => {
        setShowMiniControls(false);
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isMinimized, isPlaying, showMiniControls, setShowMiniControls]);

  // Handler para expandir tamanho do mini player (cicla 1 -> 2 -> 3 -> 1)
  const handleExpandSize = useCallback(() => {
    console.log('[EXPAND_SIZE] ==================== BOTAO EXPANDIR CLICADO ====================');
    console.log('[EXPAND_SIZE] miniPlayerSize ANTES:', miniPlayerSize);
    const dimensionsBefore = getMiniPlayerDimensions();
    console.log('[EXPAND_SIZE] Dimensoes ANTES:', dimensionsBefore);

    cycleMiniPlayerSize();
    console.log('[EXPAND_SIZE] cycleMiniPlayerSize() chamado');
    console.log('[EXPAND_SIZE] ===============================================================');
  }, [cycleMiniPlayerSize, miniPlayerSize, getMiniPlayerDimensions]);

  // Handler para play/pause (usa funcao do contexto)
  const handlePlayPause = useCallback(() => {
    console.log('[GLOBAL_MINI_PLAY_PAUSE] ==================== CHAMADO ====================');
    console.log('[GLOBAL_MINI_PLAY_PAUSE] Estado ANTES:', {
      isActive,
      isMinimized,
      isPlaying,
      showMiniControls,
    });
    playPause();
    console.log('[GLOBAL_MINI_PLAY_PAUSE] playPause() do contexto chamado');
    console.log('[GLOBAL_MINI_PLAY_PAUSE] ================================================================');
  }, [playPause, isActive, isMinimized, isPlaying, showMiniControls]);

  // Handler para capturar duracao do video quando carrega (loadedmetadata)
  const handleLoadedMetadata = useCallback(() => {
    console.log('[TRANSITION_DEBUG] ========== VIDEO GLOBAL: LOADEDMETADATA EVENT ==========');
    if (videoRef.current && Platform.OS === 'web') {
      const video = videoRef.current;
      const duration = video.duration * 1000;
      console.log('[TRANSITION_DEBUG] Video GLOBAL metadata carregada:', {
        duration,
        currentTime: video.currentTime,
        readyState: video.readyState,
        contextIsPlaying: isPlaying,
        contextVideoPosition: videoPosition,
      });

      if (duration > 0) {
        updateVideoState({ duration: duration });
        videoDurationRef.current = duration;
      }

      // Restaura posicao e continua tocando se estava tocando antes da transicao
      if (videoPosition > 0) {
        console.log('[TRANSITION_DEBUG] Restaurando posicao:', videoPosition);
        video.currentTime = videoPosition / 1000;
      }

      if (isPlaying) {
        console.log('[TRANSITION_DEBUG] Retomando reproducao (estava tocando antes)');
        video.play().catch((error: any) => {
          console.error('[TRANSITION_DEBUG] Erro ao retomar reproducao:', error);
        });
      }
    }
  }, [updateVideoState, isPlaying, videoPosition]);

  // Handler para atualizar progresso do video (timeupdate)
  const handleTimeUpdate = useCallback(() => {
    // Nao atualiza se estiver seeking
    if (isSeekingRef.current) return;

    if (videoRef.current && Platform.OS === 'web') {
      const video = videoRef.current;
      const currentTime = video.currentTime * 1000;
      const duration = video.duration * 1000;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

      // Detecta se esta proximo do fim (ultimos 0.5 segundos)
      const isNearEnd = duration > 0 && (duration - currentTime) < 500;

      // Log reduzido (apenas a cada 1 segundo OU quando proximo do fim)
      const shouldLog = (Math.floor(video.currentTime) % 1 === 0 && Math.abs(video.currentTime - Math.floor(video.currentTime)) < 0.1) || isNearEnd;
      if (shouldLog) {
        console.log('[TRANSITION_DEBUG] VIDEO GLOBAL: timeupdate:', {
          currentTime: video.currentTime.toFixed(2),
          duration: video.duration.toFixed(2),
          progress: progress.toFixed(2) + '%',
          paused: video.paused,
          isNearEnd,
          timeRemaining: ((duration - currentTime) / 1000).toFixed(2) + 's',
        });
      }

      // ========================================
      // RASTREAMENTO DE PROGRESSO REAL ASSISTIDO
      // ========================================

      const lastPosition = lastKnownPositionRef.current;
      const timeDiff = currentTime - lastPosition;

      // Threshold para considerar um seek (pulo): 1.5 segundos
      const SEEK_THRESHOLD = 1500;

      // Detecta se houve um seek (pulo grande na timeline)
      const isSeek = Math.abs(timeDiff) > SEEK_THRESHOLD;

      if (isSeek) {
        // Houve um seek (pulo)
        console.log('[PROGRESS_TRACKING] Seek detectado:', {
          de: (lastPosition / 1000).toFixed(2) + 's',
          para: (currentTime / 1000).toFixed(2) + 's',
          diferenca: (timeDiff / 1000).toFixed(2) + 's',
        });

        // Se havia uma faixa sendo rastreada, finaliza ela
        if (isTrackingWatchRangeRef.current) {
          const rangeStart = currentWatchRangeStartRef.current;
          const rangeEnd = lastPosition;

          console.log('[PROGRESS_TRACKING] Finalizando faixa assistida:', {
            inicio: (rangeStart / 1000).toFixed(2) + 's',
            fim: (rangeEnd / 1000).toFixed(2) + 's',
            duracao: ((rangeEnd - rangeStart) / 1000).toFixed(2) + 's',
          });

          // Salva a faixa assistida (apenas se > 0)
          if (rangeEnd > rangeStart) {
            updateWatchedRange(rangeStart, rangeEnd);
          }

          isTrackingWatchRangeRef.current = false;
        }

        // Se o seek foi para FRENTE, nao conta como assistido
        // Se o seek foi para TRAS, permite continuar rastreando da nova posicao
        if (timeDiff > 0) {
          console.log('[PROGRESS_TRACKING] Seek para FRENTE - nao conta como assistido');
        } else {
          console.log('[PROGRESS_TRACKING] Seek para TRAS - permite rastreamento da nova posicao');
        }

        // Inicia nova faixa a partir da posicao atual
        currentWatchRangeStartRef.current = currentTime;
        isTrackingWatchRangeRef.current = true;

      } else {
        // Nao houve seek - video tocando naturalmente

        if (!isTrackingWatchRangeRef.current) {
          // Inicia nova faixa
          console.log('[PROGRESS_TRACKING] Iniciando rastreamento de nova faixa em:', (currentTime / 1000).toFixed(2) + 's');
          currentWatchRangeStartRef.current = currentTime;
          isTrackingWatchRangeRef.current = true;
        }

        // Continua rastreando a faixa atual (a faixa sera finalizada quando houver seek ou video pausar)
      }

      // Atualiza ultima posicao conhecida
      lastKnownPositionRef.current = currentTime;

      // ========================================
      // FIM DO RASTREAMENTO DE PROGRESSO REAL
      // ========================================

      // Se chegou muito proximo do fim e ainda esta tocando, dispara ended manualmente
      // Isso resolve o problema de videos HTML5 que param antes do tempo
      if (isNearEnd && !video.paused && !video.ended) {
        console.log('[VIDEO_END_DETECTION] Proximo do fim - pausando e marcando como ended');

        // Finaliza a faixa atual antes de pausar
        if (isTrackingWatchRangeRef.current) {
          const rangeStart = currentWatchRangeStartRef.current;
          const rangeEnd = currentTime;

          if (rangeEnd > rangeStart) {
            updateWatchedRange(rangeStart, rangeEnd);
          }

          isTrackingWatchRangeRef.current = false;
        }

        video.pause();
        updateVideoState({ isPlaying: false, progress: 100 });
        return; // Retorna para evitar atualizar estado novamente
      }

      updateVideoState({
        position: currentTime,
        duration: duration,
        progress: progress,
      });
    }
  }, [updateVideoState, updateWatchedRange]);

  // Handler para evento play do video
  const handleVideoPlay = useCallback(() => {
    console.log('[TRANSITION_DEBUG] ========== VIDEO GLOBAL: PLAY EVENT ==========');
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('[TRANSITION_DEBUG] Video GLOBAL play:', {
        currentTime: video.currentTime,
        paused: video.paused,
        muted: video.muted,
        volume: video.volume,
      });
    }
    updateVideoState({ isPlaying: true });
  }, [updateVideoState]);

  // Handler para evento pause do video
  const handleVideoPause = useCallback(() => {
    console.log('[TRANSITION_DEBUG] ========== VIDEO GLOBAL: PAUSE EVENT ==========');
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('[TRANSITION_DEBUG] Video GLOBAL pause:', {
        currentTime: video.currentTime,
        paused: video.paused,
        muted: video.muted,
      });
    }

    // Finaliza a faixa assistida atual ao pausar
    if (isTrackingWatchRangeRef.current) {
      const rangeStart = currentWatchRangeStartRef.current;
      const rangeEnd = lastKnownPositionRef.current;

      console.log('[PROGRESS_TRACKING] Video pausado - finalizando faixa assistida:', {
        inicio: (rangeStart / 1000).toFixed(2) + 's',
        fim: (rangeEnd / 1000).toFixed(2) + 's',
        duracao: ((rangeEnd - rangeStart) / 1000).toFixed(2) + 's',
      });

      if (rangeEnd > rangeStart) {
        updateWatchedRange(rangeStart, rangeEnd);
      }

      isTrackingWatchRangeRef.current = false;
    }

    updateVideoState({ isPlaying: false });
  }, [updateVideoState, updateWatchedRange]);

  // Handler para evento ended do video
  const handleVideoEnded = useCallback(() => {
    console.log('[TRANSITION_DEBUG] ========== VIDEO GLOBAL: ENDED EVENT ==========');
    updateVideoState({ isPlaying: false });
  }, [updateVideoState]);

  // Funcao para calcular estilos responsivos baseados no tamanho do mini player
  // INSTRUCOES: Para ajustar o tamanho dos icones, edite os valores abaixo
  // - size 1 = Mini player pequeno (200x112)
  // - size 2 = Mini player medio (280x158)
  // - size 3 = Mini player grande (largura da tela)
  const getResponsiveStyles = useCallback((size: number) => {
    if (size === 1) {
      // TAMANHO 1: Mini player pequeno (200x112)
      return {
        // Botoes expandir/fechar (canto superior)
        cornerButtonTop: 6,
        cornerButtonSide: 6,
        cornerButtonSize: 22,
        cornerButtonRadius: 11,

        // Controles centrais (play, previous, next)
        centerControlsTop: 15,
        centerControlsBottom: 20,
        centerControlsGap: 16,

        // Botoes previous/next (skip)
        skipButtonSize: 28,
        skipButtonRadius: 14,

        // Botao play/pause
        playButtonSize: 36,
        playButtonRadius: 18,

        // Barra de progresso
        progressMargin: 15,
        progressHeight: 5,
        progressBottom: 10,
        indicatorSize: 14,
        indicatorRadius: 7,

        // Tamanhos dos icones SVG (AJUSTE AQUI)
        expandIconSize: 12,
        closeIconSize: 14,
        previousIconSize: 18,
        nextIconSize: 18,
        playIconSize: 25,
        pauseIconSize: 20,
      };
    } else if (size === 2) {
      // TAMANHO 2: Mini player medio (280x158)
      return {
        // Botoes expandir/fechar (canto superior)
        cornerButtonTop: 8,
        cornerButtonSide: 8,
        cornerButtonSize: 28,
        cornerButtonRadius: 14,

        // Controles centrais (play, previous, next)
        centerControlsTop: 20,
        centerControlsBottom: 25,
        centerControlsGap: 20,

        // Botoes previous/next (skip)
        skipButtonSize: 36,
        skipButtonRadius: 18,

        // Botao play/pause
        playButtonSize: 48,
        playButtonRadius: 24,

        // Barra de progresso
        progressMargin: 20,
        progressHeight: 6,
        progressBottom: 12,
        indicatorSize: 16,
        indicatorRadius: 8,

        // Tamanhos dos icones SVG (AJUSTE AQUI)
        expandIconSize: 14,
        closeIconSize: 15,
        previousIconSize: 24,
        nextIconSize: 24,
        playIconSize: 35,
        pauseIconSize: 28,
      };
    } else {
      // TAMANHO 3: Mini player grande (largura da tela)
      return {
        // Botoes expandir/fechar (canto superior)
        cornerButtonTop: 12,
        cornerButtonSide: 12,
        cornerButtonSize: 36,
        cornerButtonRadius: 18,

        // Controles centrais (play, previous, next)
        centerControlsTop: 30,
        centerControlsBottom: 35,
        centerControlsGap: 24,

        // Botoes previous/next (skip)
        skipButtonSize: 48,
        skipButtonRadius: 24,

        // Botao play/pause
        playButtonSize: 64,
        playButtonRadius: 32,

        // Barra de progresso
        progressMargin: 25,
        progressHeight: 7,
        progressBottom: 15,
        indicatorSize: 18,
        indicatorRadius: 9,

        // Tamanhos dos icones SVG (AJUSTE AQUI)
        expandIconSize: 15,
        closeIconSize: 18,
        previousIconSize: 32,
        nextIconSize: 32,
        playIconSize: 40,
        pauseIconSize: 36,
      };
    }
  }, []);

  const responsiveStyles = useMemo(() => {
    const styles = getResponsiveStyles(miniPlayerSize);
    console.log('[RESPONSIVE_STYLES] ==================== ESTILOS RESPONSIVOS ====================');
    console.log('[RESPONSIVE_STYLES] miniPlayerSize:', miniPlayerSize);
    console.log('[RESPONSIVE_STYLES] cornerButtonSize:', styles.cornerButtonSize);
    console.log('[RESPONSIVE_STYLES] skipButtonSize:', styles.skipButtonSize);
    console.log('[RESPONSIVE_STYLES] playButtonSize:', styles.playButtonSize);
    console.log('[RESPONSIVE_STYLES] centerControlsTop:', styles.centerControlsTop);
    console.log('[RESPONSIVE_STYLES] centerControlsBottom:', styles.centerControlsBottom);
    console.log('[RESPONSIVE_STYLES] ================================================================');

    // Verifica quantos elementos de controles existem no DOM
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      setTimeout(() => {
        // Busca por todos os Animated.View (divs com position fixed)
        const allFixedElements = document.querySelectorAll('[style*="position: fixed"]');
        console.log('[DOM_CHECK] ==================== INSPECAO DO DOM ====================');
        console.log('[DOM_CHECK] Total de elementos position:fixed no DOM:', allFixedElements.length);

        // Filtra apenas elementos que parecem ser do mini player (baseado em dimensões)
        const miniPlayerElements = Array.from(allFixedElements).filter((el) => {
          const rect = el.getBoundingClientRect();
          const isMiniPlayerSize = (
            (rect.width === 200 || rect.width === 280 || rect.width > 350) &&
            (rect.height === 112 || rect.height === 158 || rect.height > 200)
          );
          return isMiniPlayerSize;
        });

        console.log('[DOM_CHECK] Elementos que parecem ser mini player controls:', miniPlayerElements.length);
        miniPlayerElements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          console.log(`[DOM_CHECK] Mini Player ${index}:`, {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            zIndex: (el as HTMLElement).style.zIndex,
          });
        });

        // Conta botões de controle (procura por TouchableOpacity renderizados)
        const allButtons = document.querySelectorAll('[style*="border-radius"][style*="background"]');
        const miniPlayerButtons = Array.from(allButtons).filter((el) => {
          const rect = el.getBoundingClientRect();
          // Botões do mini player têm tamanhos entre 22px e 72px (considerando escalas)
          return rect.width >= 20 && rect.width <= 80 && rect.height >= 20 && rect.height <= 80;
        });
        console.log('[DOM_CHECK] Total de botões no DOM:', miniPlayerButtons.length);

        // Log detalhado de cada botão individual
        console.log('[DOM_CHECK] ========== DETALHAMENTO DE CADA BOTAO ==========');
        miniPlayerButtons.forEach((btn, idx) => {
          const rect = btn.getBoundingClientRect();
          const style = (btn as HTMLElement).style;
          console.log(`[DOM_CHECK] Botao ${idx}:`, {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            position: style.position,
            zIndex: style.zIndex,
            backgroundColor: style.backgroundColor,
          });
        });

        // Conta TODOS os elementos position:fixed para ver se há "fantasmas"
        const allFixed = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        console.log('[DOM_CHECK] ========== TODOS OS ELEMENTOS FIXED ==========');
        console.log('[DOM_CHECK] Total de elementos position:fixed:', allFixed.length);
        Array.from(allFixed).forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const style = (el as HTMLElement).style;
          console.log(`[DOM_CHECK] Fixed ${idx}:`, {
            tagName: el.tagName,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            zIndex: style.zIndex,
            visibility: style.visibility,
            display: style.display,
            opacity: style.opacity,
          });
        });

        console.log('[DOM_CHECK] ================================================================');
      }, 100);
    }

    return styles;
  }, [miniPlayerSize, getResponsiveStyles]);

  const { width: miniWidth, height: miniHeight } = getMiniPlayerDimensions();

  // Log de montagem/desmontagem dos controles
  useEffect(() => {
    console.log('[CONTROLS_LIFECYCLE] ========== CONTROLES MONTADOS ==========');
    console.log('[CONTROLS_LIFECYCLE] controlsKey:', controlsKey);
    console.log('[CONTROLS_LIFECYCLE] miniPlayerSize:', miniPlayerSize);
    console.log('[CONTROLS_LIFECYCLE] Dimensoes:', { miniWidth, miniHeight });

    return () => {
      console.log('[CONTROLS_LIFECYCLE] ========== CONTROLES DESMONTADOS ==========');
      console.log('[CONTROLS_LIFECYCLE] controlsKey que foi desmontado:', controlsKey);
    };
  }, [controlsKey]);

  // Log das dimensoes calculadas no render
  console.log('[RENDER_DIMENSIONS] ==================== DIMENSOES NO RENDER ====================');
  console.log('[RENDER_DIMENSIONS] miniPlayerSize:', miniPlayerSize);
  console.log('[RENDER_DIMENSIONS] miniWidth:', miniWidth);
  console.log('[RENDER_DIMENSIONS] miniHeight:', miniHeight);
  console.log('[RENDER_DIMENSIONS] controlsKey:', controlsKey);
  console.log('[RENDER_DIMENSIONS] ==================================================================');

  // Progresso a exibir (local durante seeking, do contexto quando nao seeking)
  const displayProgress = isSeeking ? localProgress : videoProgress;

  // Log de mudancas de estado criticas
  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== isActive MUDOU ====================');
    console.log('[STATE_CHANGE] isActive:', isActive);
    console.log('[STATE_CHANGE] isMinimized:', isMinimized);
  }, [isActive]);

  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== isMinimized MUDOU ====================');
    console.log('[STATE_CHANGE] isActive:', isActive);
    console.log('[STATE_CHANGE] isMinimized:', isMinimized);
    console.log('[STATE_CHANGE] expandedVideoLayout:', expandedVideoLayout);
  }, [isMinimized]);

  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== expandedVideoLayout MUDOU ====================');
    console.log('[STATE_CHANGE] expandedVideoLayout:', expandedVideoLayout);
  }, [expandedVideoLayout]);

  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== showMiniControls MUDOU ====================');
    console.log('[STATE_CHANGE] showMiniControls:', showMiniControls);
  }, [showMiniControls]);

  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== isPlaying MUDOU ====================');
    console.log('[STATE_CHANGE] isPlaying:', isPlaying);
    console.log('[STATE_CHANGE] Video ref exists:', !!videoRef.current);
    if (videoRef.current && Platform.OS === 'web') {
      console.log('[STATE_CHANGE] Video.paused:', videoRef.current.paused);
      console.log('[STATE_CHANGE] Video.currentTime:', videoRef.current.currentTime);
    }
  }, [isPlaying]);

  useEffect(() => {
    console.log('[STATE_CHANGE] ==================== miniPlayerSize MUDOU ====================');
    console.log('[STATE_CHANGE] miniPlayerSize:', miniPlayerSize);
    const dimensions = getMiniPlayerDimensions();
    console.log('[STATE_CHANGE] Novas dimensoes calculadas:', dimensions);
    console.log('[STATE_CHANGE] miniPlayerWidthRef.current:', miniPlayerWidthRef.current);
    console.log('[STATE_CHANGE] miniPlayerHeightRef.current:', miniPlayerHeightRef.current);
    console.log('[STATE_CHANGE] controlsKey (calculado automaticamente):', controlsKey);
    console.log('[STATE_CHANGE] ================================================================');
  }, [miniPlayerSize, getMiniPlayerDimensions, controlsKey]);

  // LIMPEZA MANUAL DO DOM: Remove containers antigos que React Native Web nao limpou
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (!isActive || !isMinimized) return;

    // Aguarda render completar
    const cleanupTimer = setTimeout(() => {
      console.log('[DOM_CLEANUP] ==================== LIMPEZA MANUAL DO DOM ====================');
      console.log('[DOM_CLEANUP] controlsKey atual:', controlsKey);

      // Obtem o elemento DOM do container atual via ref
      const currentContainerElement = currentContainerRef.current?._component || currentContainerRef.current;
      console.log('[DOM_CLEANUP] Container atual (ref):', currentContainerElement);

      // Busca TODOS os elementos fixed no DOM
      const allFixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      console.log('[DOM_CLEANUP] Total de elementos position:fixed encontrados:', allFixedElements.length);

      let removedCount = 0;
      let hiddenCount = 0;
      const foundContainers: any[] = [];

      allFixedElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const rect = el.getBoundingClientRect();

        // IMPORTANTE: Nao remove o elemento de video (apenas controles)
        if (htmlEl.tagName.toLowerCase() === 'video') {
          console.log('[DOM_CLEANUP] Elemento VIDEO encontrado, ignorando (nao remove)');
          return;
        }

        // Verifica se parece ser um container de mini player (por dimensões)
        const isMiniPlayerSize = (
          (rect.width === 200 || rect.width === 280 || rect.width > 350) &&
          (rect.height === 112 || rect.height === 158 || rect.height > 200)
        );

        if (!isMiniPlayerSize) return;

        // Verifica se é o container atual (comparação por referência)
        const isCurrentContainer = el === currentContainerElement;

        const containerInfo = {
          width: rect.width,
          height: rect.height,
          isCurrentContainer,
          zIndex: htmlEl.style.zIndex,
          top: rect.top,
          left: rect.left,
        };

        foundContainers.push(containerInfo);

        console.log('[DOM_CLEANUP] Container encontrado:', containerInfo);

        // Remove QUALQUER container que NAO seja o atual (comparacao por referencia)
        const shouldRemove = !isCurrentContainer;

        if (shouldRemove) {
          console.log('[DOM_CLEANUP] ❌ REMOVENDO container (nao e o atual)');

          // Oculta imediatamente
          htmlEl.style.display = 'none';
          htmlEl.style.visibility = 'hidden';
          htmlEl.style.pointerEvents = 'none';
          htmlEl.style.opacity = '0';
          hiddenCount++;

          // Remove do DOM após um delay
          setTimeout(() => {
            if (htmlEl.parentNode) {
              htmlEl.parentNode.removeChild(htmlEl);
              console.log('[DOM_CLEANUP] ✅ Container removido do DOM');
            }
          }, 100);
          removedCount++;
        } else {
          console.log('[DOM_CLEANUP] ✅ Container mantido (atual via ref)');
        }
      });

      console.log('[DOM_CLEANUP] Resumo:', {
        totalFixed: allFixedElements.length,
        containersEncontrados: foundContainers.length,
        ocultados: hiddenCount,
        marcadosParaRemocao: removedCount,
      });
      console.log('[DOM_CLEANUP] ================================================================');
    }, 150); // Aguarda 150ms para garantir que o DOM estabilizou

    return () => clearTimeout(cleanupTimer);
  }, [controlsKey, isActive, isMinimized]);


  // Log de debug no render
  console.log('[DEBUG_RENDER] ==================== GlobalMiniPlayer RENDERIZANDO ====================');
  console.log('[DEBUG_RENDER] Platform.OS:', Platform.OS);
  console.log('[DEBUG_RENDER] isActive:', isActive);
  console.log('[DEBUG_RENDER] isMinimized:', isMinimized);
  console.log('[DEBUG_RENDER] miniPlayerSize:', miniPlayerSize);
  console.log('[DEBUG_RENDER] currentLessonIndex:', currentLessonIndex);
  console.log('[DEBUG_RENDER] videoUrl:', getVideoUrl(currentLessonIndex));
  console.log('[DEBUG_RENDER] videoStyle:', videoStyle);
  console.log('[DEBUG_RENDER] showMiniControls:', showMiniControls);
  console.log('[DEBUG_RENDER] isPlaying:', isPlaying);
  console.log('[DEBUG_RENDER] Video renderizando?', Platform.OS === 'web');
  console.log('[DEBUG_RENDER] ===========================================================================');

  return (
    <>
      {/* VIDEO: SEMPRE renderizado, estilo dinamico via CSS positioning */}
      {Platform.OS === 'web' && (
        <video
          ref={videoRef}
          src={getVideoUrl(currentLessonIndex)}
          style={videoStyle}
          loop={repeatEnabled}
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onEnded={handleVideoEnded}
        />
      )}

      {/* CONTROLES DO MINI PLAYER: apenas quando minimizado */}
      {(() => {
        const shouldRenderMiniControls = isActive && isMinimized;
        console.log('[DEBUG_MINI_CONTROLS] ========================================');
        console.log('[DEBUG_MINI_CONTROLS] Renderizando controles do mini player?', {
          shouldRender: shouldRenderMiniControls,
          isActive,
          isMinimized,
          showMiniControls,
          controlsKey,
        });
        console.log('[DEBUG_MINI_CONTROLS] ========================================');
        return shouldRenderMiniControls;
      })() && (
        <Animated.View
          ref={currentContainerRef}
          key={`mini-player-controls-${controlsKey}`}
          style={(() => {
            const style = {
              position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
              top: panPosition.y, //..............Posicao Y animada (ao inves de transform)
              left: panPosition.x, //..............Posicao X animada (ao inves de transform)
              width: miniWidth,
              height: miniHeight,
              zIndex: 2147483647, //...............zIndex maximo para garantir visibilidade
              pointerEvents: 'box-none' as any,
              borderRadius: 12, //..................Bordas arredondadas do container (AJUSTE AQUI para alterar o arredondamento)
              overflow: 'hidden', //................Garante que conteudo respeite o borderRadius
            };
            console.log('[ANIMATED_VIEW_STYLE] ==================== STYLE DO ANIMATED.VIEW ====================');
            console.log('[ANIMATED_VIEW_STYLE] panPosition.x:', panPosition.x);
            console.log('[ANIMATED_VIEW_STYLE] panPosition.y:', panPosition.y);
            console.log('[ANIMATED_VIEW_STYLE] panPosition.x._value:', (panPosition.x as any)._value);
            console.log('[ANIMATED_VIEW_STYLE] panPosition.y._value:', (panPosition.y as any)._value);
            console.log('[ANIMATED_VIEW_STYLE] Style completo:', style);
            console.log('[ANIMATED_VIEW_STYLE] ================================================================');
            return style;
          })()}
          {...panResponder.panHandlers}
          onLayout={(event) => {
            console.log('[ANIMATED_VIEW_LAYOUT] ==================== LAYOUT EVENT ====================');
            console.log('[ANIMATED_VIEW_LAYOUT] Layout do Animated.View:', event.nativeEvent.layout);
            console.log('[ANIMATED_VIEW_LAYOUT] miniWidth usado no style:', miniWidth);
            console.log('[ANIMATED_VIEW_LAYOUT] miniHeight usado no style:', miniHeight);
            console.log('[ANIMATED_VIEW_LAYOUT] miniPlayerSize:', miniPlayerSize);
            console.log('[ANIMATED_VIEW_LAYOUT] controlsKey:', controlsKey);
            console.log('[ANIMATED_VIEW_LAYOUT] Ref atualizada:', !!currentContainerRef.current);
            console.log('[ANIMATED_VIEW_LAYOUT] ================================================================');
          }}
        >
          {/* Controles (visiveis quando showMiniControls = true) */}
          {(() => {
            console.log('[DEBUG_MINI_BUTTONS] ===== Renderizando botoes? =====');
            console.log('[DEBUG_MINI_BUTTONS] showMiniControls:', showMiniControls);
            console.log('[DEBUG_MINI_BUTTONS] miniPlayerSize:', miniPlayerSize);
            console.log('[DEBUG_MINI_BUTTONS] responsiveStyles:', {
              cornerButtonSize: responsiveStyles.cornerButtonSize,
              playButtonSize: responsiveStyles.playButtonSize,
            });
            return showMiniControls;
          })() && (
            <>
              {/* Botao Expandir - canto superior esquerdo */}
              <TouchableOpacity
                style={[
                  {
                    position: 'absolute' as any,
                    top: responsiveStyles.cornerButtonTop,
                    left: responsiveStyles.cornerButtonSide,
                    width: responsiveStyles.cornerButtonSize,
                    height: responsiveStyles.cornerButtonSize,
                    borderRadius: responsiveStyles.cornerButtonRadius,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center' as any,
                    alignItems: 'center' as any,
                    zIndex: 100,
                    pointerEvents: 'auto' as any,
                  },
                ]}
                onPress={() => {
                  console.log('[CLICK_TEST_MINI] Botao EXPANDIR clicado!');
                  handleExpandSize();
                }}
                activeOpacity={0.7}
              >
                <ExpandIcon color={COLORS.white} size={responsiveStyles.expandIconSize} />
              </TouchableOpacity>

              {/* Botao Fechar (X) - canto superior direito */}
              <TouchableOpacity
                style={[
                  {
                    position: 'absolute' as any,
                    top: responsiveStyles.cornerButtonTop,
                    right: responsiveStyles.cornerButtonSide,
                    width: responsiveStyles.cornerButtonSize,
                    height: responsiveStyles.cornerButtonSize,
                    borderRadius: responsiveStyles.cornerButtonRadius,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center' as any,
                    alignItems: 'center' as any,
                    zIndex: 100,
                    pointerEvents: 'auto' as any,
                  },
                ]}
                onPress={() => {
                  console.log('[CLICK_TEST_MINI] Botao FECHAR clicado!');
                  console.log('[CLOSE_BEHAVIOR] isPlayerScreenActive:', isPlayerScreenActive);
                  if (isPlayerScreenActive) {
                    // Usuario esta na tela principal do player: expande e continua tocando
                    console.log('[CLOSE_BEHAVIOR] Tela principal ativa -> expandindo player');
                    expand();
                  } else {
                    // Usuario esta em outra tela: desativa completamente
                    console.log('[CLOSE_BEHAVIOR] Tela principal NAO ativa -> desativando player');
                    deactivate();
                  }
                }}
                activeOpacity={0.7}
              >
                <CloseIcon color={COLORS.white} size={responsiveStyles.closeIconSize} />
              </TouchableOpacity>

              {/* Controles Centrais (anterior + play + proximo) */}
              <View style={[
                {
                  position: 'absolute' as any,
                  top: responsiveStyles.centerControlsTop,
                  left: 0,
                  right: 0,
                  bottom: responsiveStyles.centerControlsBottom,
                  flexDirection: 'row' as any,
                  justifyContent: 'center' as any,
                  alignItems: 'center' as any,
                  gap: responsiveStyles.centerControlsGap,
                  pointerEvents: 'box-none' as any,
                },
              ]}>
                {/* Botao Anterior */}
                <TouchableOpacity
                  style={[
                    {
                      width: responsiveStyles.skipButtonSize,
                      height: responsiveStyles.skipButtonSize,
                      borderRadius: responsiveStyles.skipButtonRadius,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      justifyContent: 'center' as any,
                      alignItems: 'center' as any,
                      pointerEvents: 'auto' as any,
                    },
                  ]}
                  onPress={() => {
                    console.log('[CLICK_TEST_MINI] Botao ANTERIOR clicado!');
                    previousLesson();
                  }}
                  disabled={currentLessonIndex === 0}
                  activeOpacity={0.7}
                >
                  <PreviousIcon color={currentLessonIndex === 0 ? 'rgba(255,255,255,0.3)' : COLORS.white} size={responsiveStyles.previousIconSize} />
                </TouchableOpacity>

                {/* Botao Play/Pause */}
                <TouchableOpacity
                  style={[
                    {
                      width: responsiveStyles.playButtonSize,
                      height: responsiveStyles.playButtonSize,
                      borderRadius: responsiveStyles.playButtonRadius,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      justifyContent: 'center' as any,
                      alignItems: 'center' as any,
                      pointerEvents: 'auto' as any,
                    },
                  ]}
                  onPress={() => {
                    console.log('[CLICK_TEST_MINI] Botao PLAY/PAUSE clicado!');
                    handlePlayPause();
                  }}
                  activeOpacity={0.7}
                >
                  {isPlaying ? (
                    <PauseIcon color={COLORS.white} size={responsiveStyles.pauseIconSize} />
                  ) : (
                    <PlayIcon color={COLORS.white} size={responsiveStyles.playIconSize} />
                  )}
                </TouchableOpacity>

                {/* Botao Proximo */}
                <TouchableOpacity
                  style={[
                    {
                      width: responsiveStyles.skipButtonSize,
                      height: responsiveStyles.skipButtonSize,
                      borderRadius: responsiveStyles.skipButtonRadius,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      justifyContent: 'center' as any,
                      alignItems: 'center' as any,
                      pointerEvents: 'auto' as any,
                    },
                  ]}
                  onPress={() => {
                    console.log('[CLICK_TEST_MINI] Botao PROXIMO clicado!');
                    nextLesson();
                  }}
                  disabled={currentLessonIndex === contents.length - 1}
                  activeOpacity={0.7}
                >
                  <NextIcon color={currentLessonIndex === contents.length - 1 ? 'rgba(255,255,255,0.3)' : COLORS.white} size={responsiveStyles.nextIconSize} />
                </TouchableOpacity>
              </View>

              {/* Barra de Progresso com Bolinha (igual ao player LOCAL) */}
              {/* Event listeners sao adicionados via useEffect para compatibilidade com React Native Web */}
              <View
                ref={progressContainerRef}
                style={{
                  position: 'absolute' as any,
                  bottom: 0,
                  left: responsiveStyles.progressMargin,
                  right: responsiveStyles.progressMargin,
                  height: 20, //..Area de toque fixa para facilitar interacao
                  zIndex: 10,
                }}
              >
                <View style={{
                  position: 'absolute' as any,
                  left: 0,
                  right: 0,
                  bottom: responsiveStyles.progressBottom,
                  height: responsiveStyles.progressHeight,
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  borderRadius: responsiveStyles.progressHeight / 2,
                }} pointerEvents="none">
                  <View style={{
                    height: '100%',
                    width: `${displayProgress}%`,
                    backgroundColor: COLORS.primary,
                    borderRadius: responsiveStyles.progressHeight / 2,
                  }} />
                </View>
                <View style={{
                  position: 'absolute' as any,
                  bottom: responsiveStyles.progressBottom - (responsiveStyles.indicatorSize / 2) + (responsiveStyles.progressHeight / 2),
                  left: `${displayProgress}%`,
                  width: responsiveStyles.indicatorSize,
                  height: responsiveStyles.indicatorSize,
                  borderRadius: responsiveStyles.indicatorRadius,
                  backgroundColor: COLORS.primary,
                  marginLeft: -(responsiveStyles.indicatorSize / 2),
                }} pointerEvents="none" />
              </View>
            </>
          )}
        </Animated.View>
      )}
    </>
  );
};

// ========================================
// ESTILOS (100% IDENTICOS AO PlayerStyles)
// ========================================

const styles = StyleSheet.create({
  // Container de Controles do Mini Player (CSS positioning - separado do video)
  miniPlayerControlsContainer: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute', //..Fixed no web, absolute no mobile
    top: 0, //........................Ponto de referencia no topo
    left: 0, //.......................Ponto de referencia na esquerda
    borderRadius: 0, //..............Sem bordas arredondadas
    zIndex: 10000, //................Acima do video (zIndex 9999)
    overflow: 'visible', //...........Permite overflow da sombra
    pointerEvents: 'box-none' as any, //..Permite cliques no video atraves do container
  },

  // Container do Mini Player (DEPRECADO - mantido para compatibilidade)
  miniPlayerContainer: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute', //..Fixed no web, absolute no mobile
    top: 0, //........................Ponto de referencia no topo
    left: 0, //.......................Ponto de referencia na esquerda
    borderRadius: 12, //.............Bordas arredondadas
    zIndex: 9999, //..................Acima de todos os elementos
    overflow: 'visible', //...........Permite overflow da sombra
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)' as any }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }),
  },

  // Video do Mini Player (preenche todo o container)
  miniPlayerVideo: {
    width: '100%', //................Largura total
    height: '100%', //...............Altura total
    borderRadius: 12, //.............Bordas arredondadas
    overflow: 'hidden', //...........Esconde overflow do video
  },

  // Botao Fechar (X) - canto SUPERIOR direito (sincronizado com PlayerStyles)
  miniPlayerCloseButton: {
    position: 'absolute', //.........Posicao absoluta
    top: 6, //......................Distancia do topo
    right: 6, //....................Distancia da direita
    width: 22, //...................Largura
    height: 22, //..................Altura
    borderRadius: 11, //.............Circular
    backgroundColor: 'rgba(0,0,0,0.5)', //..Fundo semi-transparente
    justifyContent: 'center', //....Centraliza verticalmente
    alignItems: 'center', //........Centraliza horizontalmente
    zIndex: 10, //..................Fica por cima de tudo
  },

  // Botao Expandir - canto SUPERIOR esquerdo (sincronizado com PlayerStyles)
  miniPlayerExpandButton: {
    position: 'absolute', //.........Posicao absoluta
    top: 6, //......................Distancia do topo
    left: 6, //.....................Distancia da esquerda
    width: 22, //...................Largura
    height: 22, //..................Altura
    borderRadius: 11, //.............Circular
    backgroundColor: 'rgba(0,0,0,0.5)', //..Fundo semi-transparente
    justifyContent: 'center', //....Centraliza verticalmente
    alignItems: 'center', //........Centraliza horizontalmente
    zIndex: 10, //..................Fica por cima de tudo
  },

  // Controles Centrais do Mini Player (sincronizado com PlayerStyles)
  // AJUSTE MANUAL: Altere 'top' para mover os icones verticalmente
  miniPlayerCenterControls: {
    position: 'absolute', //.........Posicao absoluta
    top: 15, //.......................AJUSTAVEL: Margem do topo (aumente para descer os icones)
    left: 0, //.....................Esquerda
    right: 0, //....................Direita
    bottom: 20, //..................Deixa espaco para barra de progresso
    flexDirection: 'row', //.........Layout horizontal
    justifyContent: 'center', //....Centraliza horizontalmente
    alignItems: 'center', //.........Centraliza verticalmente
    gap: 16, //......................Espaco entre botoes
  },

  // Botao Skip do Mini Player (anterior/proximo) - COM FUNDO (sincronizado com PlayerStyles)
  miniPlayerSkipButton: {
    width: 28, //...................Largura
    height: 28, //..................Altura
    borderRadius: 14, //.............Circular
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo semi-transparente
    justifyContent: 'center', //....Centraliza verticalmente
    alignItems: 'center', //........Centraliza horizontalmente
  },

  // Botao Play/Pause do Mini Player (central) (sincronizado com PlayerStyles)
  miniPlayerPlayButton: {
    width: 36, //...................Largura
    height: 36, //..................Altura
    borderRadius: 18, //.............Circular
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo semi-transparente
    justifyContent: 'center', //....Centraliza verticalmente
    alignItems: 'center', //........Centraliza horizontalmente
  },

  // Container da Barra de Progresso do Mini Player (sincronizado com PlayerStyles)
  miniPlayerProgressContainer: {
    position: 'absolute', //.........Posicao absoluta
    bottom: 0, //...................Na base do video
    left: 15, //....................Margem esquerda 15px
    right: 15, //...................Margem direita 15px
    height: 20, //..................Area de toque maior
    zIndex: 10, //..................Fica por cima de tudo
  },

  // Barra de Progresso do Mini Player (sincronizado com PlayerStyles)
  miniPlayerProgressBar: {
    position: 'absolute', //.........Posicao absoluta
    left: 0, //.....................Encosta na margem
    right: 0, //....................Encosta na margem
    bottom: 10, //...................Distancia do fundo
    height: 5, //...................Altura maior (era 3)
    backgroundColor: 'rgba(255,255,255,0.4)', //..Fundo mais visivel
    borderRadius: 3, //..............Cantos arredondados
  },

  // Preenchimento da Barra do Mini Player (sincronizado com PlayerStyles)
  miniPlayerProgressFill: {
    height: '100%', //...............Altura total
    backgroundColor: COLORS.primary, //..Cor azul
    borderRadius: 3, //..............Cantos arredondados
  },

  // Bolinha indicadora do Mini Player (sincronizado com PlayerStyles)
  miniPlayerProgressIndicator: {
    position: 'absolute', //.........Posicao absoluta
    bottom: 5, //...................Centralizado na barra
    width: 14, //...................Largura maior (era 10)
    height: 14, //..................Altura maior (era 10)
    borderRadius: 7, //..............Circular
    backgroundColor: COLORS.primary, //..Cor azul
    marginLeft: -7, //...............Centraliza na posicao
  },
});

export default GlobalMiniPlayer;
