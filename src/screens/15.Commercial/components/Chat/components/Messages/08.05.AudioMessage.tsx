// ========================================
// Componente AudioMessage
// Mensagem de audio com player estilo WhatsApp
// Com avatar, velocidade e waveform
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de ref
  useEffect,                              //......Hook de efeito
  useMemo,                                //......Hook de memo
  memo,                                   //......Memoizacao
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  TouchableOpacity,                       //......Toque
  Pressable,                              //......Pressable
  Image,                                  //......Imagem
  Dimensions,                             //......Dimensoes da tela
  ActivityIndicator,                      //......Indicador de carregamento
  Platform,                               //......Plataforma
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Retangulo SVG
} from 'react-native-svg';                //......Biblioteca SVG
import { Audio } from 'expo-av';          //......Audio Expo

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';
import { useTheme } from '../../styles/themes/ThemeContext';

// ========================================
// Imports de Tipos
// ========================================
import { AudioContent, MessageKey } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Servicos (cache + Evolution API)
// ========================================
import { evolutionService } from '../../../../services/evolutionService';
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Imports de Funcoes
// ========================================
import { formatAudioDuration } from '../../data/08.mockMessages';

// ========================================
// Imports de Tipos Adicionais
// ========================================
import { MessageStatus as StatusType } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Componentes
// ========================================
import MessageStatus from './08.08.MessageStatus';

// ========================================
// Imports de Tipo TimestampStyle
// ========================================
import { TimestampStyle } from '../../10.00.LeadLolaSwipeContainer';

// ========================================
// Interface de Props
// ========================================
interface AudioMessageProps {
  content: AudioContent;                  //......Conteudo do audio
  isOutgoing: boolean;                    //......Se e enviada
  timestamp?: Date;                       //......Hora de envio
  status?: StatusType;                    //......Status da mensagem
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  onRetry?: () => Promise<boolean>;       //......Callback de retry (retorna true se sucesso)
  messageKey?: MessageKey;                //......Chave para Evolution API
  instanceName?: string;                  //......Nome da instancia Evolution
  transcription?: string;                 //......Texto da transcricao
  isTranscribing?: boolean;               //......Em processo de transcricao
}

// ========================================
// Tipos de Velocidade
// ========================================
type PlaybackSpeed = 1 | 1.5 | 2;

// ========================================
// Constantes de Configuracao
// ========================================

// Alturas das barras de onda de audio (padrao base ciclico)
const WAVE_HEIGHTS_PATTERN = [
  3, 3.5, 4, 3, 10, 8, 9, 18, 18, 14,
  11, 8, 18, 14, 10, 7, 11, 15, 18, 14,
  11, 14, 18, 14, 10, 7, 6, 4, 4, 4,
  11, 14, 18, 14, 10, 7, 11, 15,
];

// Largura de cada barra em pixels
const BAR_WIDTH = 1.5;

// Espaco entre barras em pixels
const BAR_GAP = 2;

// Margem direita da waveform (antes da borda do container)
// Ajuste este valor para controlar o espaco entre as barras e a borda
const WAVE_RIGHT_MARGIN = 20;

// ========================================
// Calcula largura do waveContainer baseado na tela
// ========================================
const calculateInitialWaveWidth = (): number => {
  const screenWidth = Dimensions.get('window').width;
  // Padding horizontal do container de mensagens
  const messageAreaPadding = 24;
  // Largura da area de mensagens
  const messageAreaWidth = screenWidth - messageAreaPadding;
  // Largura da bolha (80% da area)
  const bubbleWidth = messageAreaWidth * 0.8;
  // Padding interno da bolha
  const bubblePadding = 16;
  // Largura do conteudo da bolha
  const bubbleContentWidth = bubbleWidth - bubblePadding;
  // Avatar (45px) + gap (15px)
  const leftColWidth = 60;
  // Botao play (24px) + gap (10px)
  const playButtonWidth = 34;
  // Largura do waveContainer
  const waveWidth = bubbleContentWidth - leftColWidth - playButtonWidth;
  return Math.max(0, waveWidth);
};

// ========================================
// Componente Principal AudioMessage
// ========================================
const AudioMessage: React.FC<AudioMessageProps> = ({
  content,                                //......Conteudo
  isOutgoing,                             //......Direcao
  timestamp,                              //......Hora de envio
  status,                                 //......Status da mensagem
  timestampStyle = 'container',           //......Estilo do timestamp
  onRetry,                                //......Callback de retry
  messageKey,                             //......Chave Evolution API
  instanceName,                           //......Instancia Evolution
  transcription,                          //......Texto transcrito
  isTranscribing = false,                 //......Transcrevendo
}) => {
  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Estados do Componente
  // ========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [progress, setProgress] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ========================================
  // Estados de Retry
  // ========================================
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  // ========================================
  // Refs para Controle de Audio
  // ========================================
  const soundRef = useRef<Audio.Sound | null>(null);
  const speedHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const waveContainerWidthRef = useRef(0);
  const seekRectRef = useRef<{ left: number; width: number } | null>(null);
  const waveAreaRef = useRef<View | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // ========================================
  // String do horario formatada (reutilizada no spacer e timestamp)
  // ========================================
  const timeStr = timestamp
    ? timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Flag: transcricao com texto presente (exibe timestamp inline)
  const hasTranscriptionText = !!(transcription && !isTranscribing);

  // ========================================
  // Duracao em milissegundos
  // ========================================
  const durationMs = content.duration * 1000;

  // ========================================
  // Largura da area de ondas (calculada via Dimensions)
  // ========================================
  const waveAreaWidth = useMemo(() => calculateInitialWaveWidth(), []);

  // ========================================
  // Calcula numero de barras baseado na largura disponivel
  // ========================================
  const waveBarCount = useMemo(() => {
    if (waveAreaWidth <= 0) return 0;
    // Subtrai margem direita (10px aplicada via marginRight no estilo)
    const availableWidth = waveAreaWidth - WAVE_RIGHT_MARGIN;
    // Numero de barras que cabem
    const count = Math.floor((availableWidth + BAR_GAP) / (BAR_WIDTH + BAR_GAP));
    return Math.max(0, count);
  }, [waveAreaWidth]);

  // ========================================
  // Gera alturas das barras ciclicamente
  // ========================================
  const waveHeights = useMemo(() => {
    const heights: number[] = [];
    for (let i = 0; i < waveBarCount; i++) {
      heights.push(WAVE_HEIGHTS_PATTERN[i % WAVE_HEIGHTS_PATTERN.length]);
    }
    return heights;
  }, [waveBarCount]);

  // ========================================
  // Efeito de Limpeza ao Desmontar
  // ========================================
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = '';
        webAudioRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;   //......Libera Blob URL
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (speedHideTimerRef.current) {
        clearTimeout(speedHideTimerRef.current);
        speedHideTimerRef.current = null;
      }
    };
  }, []);

  // ========================================
  // Callback de Status do Audio
  // ========================================
  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (!status.isLoaded) return;

    // Atualiza progresso
    if (status.durationMillis && status.positionMillis !== undefined) {
      const newProgress = status.positionMillis / status.durationMillis;
      setProgress(newProgress);
      setCurrentTimeMs(status.positionMillis);
    }

    // Atualiza estado de reproducao
    setIsPlaying(status.isPlaying);

    // Quando termina de tocar
    if (status.didJustFinish) {
      setProgress(0);
      setCurrentTimeMs(0);
      setIsPlaying(false);
    }
  }, []);

  // ========================================
  // Converte base64 puro em Blob URL (mais confiavel que data URI)
  // ========================================
  const base64ToBlobUrl = useCallback((base64: string, mimeType: string): string => {
    const byteChars = atob(base64);        //......Decodifica base64
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    // Libera Blob URL anterior se existir
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = blobUrl;          //......Salva para cleanup
    return blobUrl;
  }, []);

  // ========================================
  // Resolve URI do audio (cache → Evolution API → URL direta)
  // URLs do WhatsApp expiram, entao tenta cache e API primeiro
  // ========================================
  const resolveAudioUri = useCallback(async (): Promise<string | null> => {
    const url = content.url;               //......URL original do audio
    if (!url) return null;                 //......Sem URL

    // Blob URLs ja sao playaveis diretamente
    if (url.startsWith('blob:')) {
      console.log('[AudioMessage] Blob URL, usando diretamente');
      return url;
    }

    // Data URIs: converter para Blob URL (mais confiavel para Audio)
    if (url.startsWith('data:')) {
      console.log('[AudioMessage] Data URI, convertendo para Blob URL');
      try {
        const commaIdx = url.indexOf(','); //......Indice da virgula
        const meta = url.substring(5, commaIdx);
        const mime = meta.split(';')[0];   //......Extrai MIME type
        const b64 = url.substring(commaIdx + 1);
        return base64ToBlobUrl(b64, mime); //......Blob URL
      } catch {
        return url;                        //......Fallback data URI
      }
    }

    console.log('[AudioMessage] Resolvendo audio, key:', !!messageKey, 'instance:', instanceName);

    // Passo 1: Verificar cache local
    try {
      const cached = await mediaStorageService.getMedia(url);
      if (cached && typeof cached === 'string' && cached.length > 1000) {
        console.log('[AudioMessage] Passo 1: Audio do cache, tamanho:', cached.length);
        try {
          const commaIdx = cached.indexOf(',');
          const meta = cached.substring(5, commaIdx);
          const mime = meta.split(';')[0]; //......MIME do cache
          const b64 = cached.substring(commaIdx + 1);
          return base64ToBlobUrl(b64, mime);
        } catch {
          return cached;                   //......Fallback data URI
        }
      }
    } catch {} //..............................Ignora erro de cache

    // Passo 2: Buscar via Evolution API
    if (messageKey && instanceName) {
      try {
        console.log('[AudioMessage] Passo 2: Buscando via Evolution API...');
        const media = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
        if (media?.base64) {
          let mimeType = media.mimeType || content.mimeType || 'audio/ogg';
          // Corrigir MIME invalidos (API pode retornar octet-stream)
          if (mimeType === 'application/octet-stream') mimeType = 'audio/ogg; codecs=opus';
          let b64 = media.base64;          //......Base64 do audio
          if (b64.startsWith('data:')) {
            const ci = b64.indexOf(',');   //......Indice da virgula
            if (ci !== -1) b64 = b64.substring(ci + 1);
          }
          console.log('[AudioMessage] Passo 2: Audio da API, mime:', mimeType, 'b64 len:', b64.length);
          // Salvar no cache para proxima vez (como data URI)
          const dataUri = `data:${mimeType};base64,${b64}`;
          mediaStorageService.saveMedia(url, dataUri, mimeType).catch(() => {});
          // Converter para Blob URL (mais confiavel que data URI no Audio)
          return base64ToBlobUrl(b64, mimeType);
        }
        console.log('[AudioMessage] Passo 2: API retornou vazio');
      } catch (err) {
        console.warn('[AudioMessage] Passo 2: Erro Evolution API:', err);
      }
    }

    // Passo 3: Tentar URL HTTP direta (pode falhar se expirada)
    console.log('[AudioMessage] Passo 3: Usando URL HTTP direta (pode expirar)');
    return url;
  }, [content.url, content.mimeType, messageKey, instanceName, base64ToBlobUrl]);

  // ========================================
  // Tenta carregar audio no elemento HTML com timeout
  // ========================================
  const tryLoadAudioElement = useCallback((audioUri: string): Promise<HTMLAudioElement> => {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new window.Audio();    //......Cria elemento audio
      const timeout = setTimeout(() => {
        audio.removeAttribute('src');      //......Limpa src ao falhar
        reject(new Error('Timeout'));      //......Timeout 15s
      }, 15000);
      audio.addEventListener('canplaythrough', () => {
        clearTimeout(timeout);             //......Cancela timeout
        resolve(audio);                    //......Audio pronto
      }, { once: true });
      audio.addEventListener('error', () => {
        clearTimeout(timeout);             //......Cancela timeout
        const errCode = audio.error?.code; //......Codigo do erro
        const errMsg = audio.error?.message || 'desconhecido';
        audio.removeAttribute('src');      //......Limpa src ao falhar
        reject(new Error(`Audio error ${errCode}: ${errMsg}`));
      }, { once: true });
      audio.src = audioUri;                //......Inicia carregamento
      audio.preload = 'auto';             //......Pre-carrega dados
    });
  }, []);

  // ========================================
  // Carrega Audio (aguarda audio pronto para tocar)
  // ========================================
  const loadSound = useCallback(async () => {
    if (isLoaded || !content.url) return;

    if (Platform.OS === 'web') {
      try {
        const audioUri = await resolveAudioUri();
        if (!audioUri) return;             //......Sem URI disponivel
        console.log('[AudioMessage] URI resolvida, tipo:', audioUri.substring(0, 30));

        let audio: HTMLAudioElement;       //......Elemento audio final

        try {
          // Primeira tentativa com URI resolvida
          audio = await tryLoadAudioElement(audioUri);
        } catch (firstErr) {
          console.warn('[AudioMessage] Primeira tentativa falhou:', firstErr);

          // Se veio da API/cache e falhou, tenta com MIME type alternativo
          if (messageKey && instanceName && !audioUri.startsWith('http')) {
            console.log('[AudioMessage] Tentando com MIME alternativo (audio/mp4)...');
            try {
              const media = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
              if (media?.base64) {
                let b64 = media.base64;    //......Base64 bruto
                if (b64.startsWith('data:')) {
                  const ci = b64.indexOf(',');
                  if (ci !== -1) b64 = b64.substring(ci + 1);
                }
                // Tenta audio/mp4 (formato alternativo WhatsApp)
                const altBlobUrl = base64ToBlobUrl(b64, 'audio/mp4');
                audio = await tryLoadAudioElement(altBlobUrl);
                console.log('[AudioMessage] Sucesso com audio/mp4');
              } else {
                throw new Error('API vazia no retry');
              }
            } catch (altErr) {
              console.warn('[AudioMessage] MIME alternativo falhou:', altErr);
              // Ultima tentativa: URL HTTP direta
              console.log('[AudioMessage] Tentando URL HTTP direta...');
              audio = await tryLoadAudioElement(content.url!);
            }
          } else {
            throw firstErr;                //......Re-lanca erro
          }
        }

        audio.addEventListener('ended', () => {
          setProgress(0);                  //......Reset progresso
          setCurrentTimeMs(0);             //......Reset tempo
          setIsPlaying(false);             //......Para reproducao
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;   //......Limpa animacao
          }
        });
        webAudioRef.current = audio;       //......Salva referencia
        setIsLoaded(true);                 //......Marca como carregado
        console.log('[AudioMessage] Audio carregado e pronto para tocar');
      } catch (error) {
        console.error('[AudioMessage] Erro ao carregar audio web:', error);
      }
      return;
    }

    try {
      const audioUri = await resolveAudioUri();
      if (!audioUri) return;               //......Sem URI disponivel

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },                 //......URI resolvida
        { shouldPlay: false },             //......Nao tocar automatico
        onPlaybackStatusUpdate             //......Callback de status
      );
      soundRef.current = sound;            //......Salva referencia
      setIsLoaded(true);                   //......Marca como carregado
    } catch (error) {
      console.error('[AudioMessage] Erro ao carregar audio:', error);
    }
  }, [content.url, isLoaded, onPlaybackStatusUpdate, resolveAudioUri, tryLoadAudioElement, messageKey, instanceName, base64ToBlobUrl]);

  // ========================================
  // Formata tempo em mm:ss
  // ========================================
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // ========================================
  // Loop de Progresso (Web - requestAnimationFrame)
  // ========================================
  const startProgressLoop = useCallback(() => {
    const update = () => {
      const audio = webAudioRef.current;
      if (audio && !audio.paused && audio.duration > 0 && !isSeekingRef.current) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTimeMs(audio.currentTime * 1000);
        animFrameRef.current = requestAnimationFrame(update);
      }
    };
    animFrameRef.current = requestAnimationFrame(update);
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // ========================================
  // Inicia timer para esconder velocidade
  // ========================================
  const startSpeedHideTimer = useCallback(() => {
    if (speedHideTimerRef.current) {
      clearTimeout(speedHideTimerRef.current);
    }
    speedHideTimerRef.current = setTimeout(() => {
      setShowSpeedControl(false);
      speedHideTimerRef.current = null;
    }, 3000);
  }, []);

  // ========================================
  // Mostra velocidade e inicia timer
  // ========================================
  const showSpeedAndStartTimer = useCallback(() => {
    setShowSpeedControl(true);
    startSpeedHideTimer();
  }, [startSpeedHideTimer]);

  // ========================================
  // Toggle Play/Pause
  // ========================================
  const togglePlayback = useCallback(async () => {
    showSpeedAndStartTimer();

    try {
      // Carrega audio se ainda nao carregado
      if (!isLoaded) {
        await loadSound();
      }

      // Web: HTML5 Audio
      if (Platform.OS === 'web') {
        const audio = webAudioRef.current;
        if (!audio) {
          console.warn('[AudioMessage] Web audio nao disponivel');
          return;
        }

        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
          stopProgressLoop();
        } else {
          audio.playbackRate = playbackSpeed;
          if (audio.duration > 0 && audio.currentTime >= audio.duration - 0.1) {
            audio.currentTime = 0;
            setProgress(0);
            setCurrentTimeMs(0);
          }
          await audio.play();
          setIsPlaying(true);
          startProgressLoop();
        }
        return;
      }

      // Native: expo-av
      if (!soundRef.current) {
        console.warn('[AudioMessage] Sound nao disponivel');
        return;
      }

      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.setRateAsync(playbackSpeed, true);
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.positionMillis >= status.durationMillis! - 100) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('[AudioMessage] Erro ao toggle playback:', error);
    }
  }, [isPlaying, playbackSpeed, isLoaded, loadSound, showSpeedAndStartTimer, startProgressLoop, stopProgressLoop]);

  // ========================================
  // Cicla Velocidade: 1x → 1.5x → 2x → 1x
  // ========================================
  const cycleSpeed = useCallback(async () => {
    if (!showSpeedControl) {
      showSpeedAndStartTimer();
      return;
    }

    let newSpeed: PlaybackSpeed;
    if (playbackSpeed === 1) {
      newSpeed = 1.5;
    } else if (playbackSpeed === 1.5) {
      newSpeed = 2;
    } else {
      newSpeed = 1;
    }
    setPlaybackSpeed(newSpeed);
    startSpeedHideTimer();

    // Aplica velocidade ao audio se estiver tocando
    if (Platform.OS === 'web') {
      if (webAudioRef.current && isPlaying) {
        webAudioRef.current.playbackRate = newSpeed;
      }
    } else if (soundRef.current && isPlaying) {
      try {
        await soundRef.current.setRateAsync(newSpeed, true);
      } catch (error) {
        console.error('[AudioMessage] Erro ao mudar velocidade:', error);
      }
    }
  }, [showSpeedControl, playbackSpeed, isPlaying, startSpeedHideTimer, showSpeedAndStartTimer]);

  // ========================================
  // Formata texto da velocidade
  // ========================================
  const getSpeedText = useCallback((): string => {
    if (playbackSpeed === 1) return '1x';
    if (playbackSpeed === 1.5) return '1,5x';
    return '2x';
  }, [playbackSpeed]);

  // ========================================
  // Handler de Retry
  // ========================================
  const handleRetry = useCallback(async () => {
    // So permite retry se status for failed e callback existir
    if (status !== 'failed' || !onRetry) return;

    // Reseta estado de falha e inicia retry
    setRetryFailed(false);
    setIsRetrying(true);

    try {
      // Chama callback de retry
      const success = await onRetry();

      if (!success) {
        // Retry falhou
        setRetryFailed(true);
      }
      // Se sucesso, a mensagem sera atualizada pelo pai
    } catch (error) {
      console.error('[AudioMessage] Erro no retry:', error);
      setRetryFailed(true);
    } finally {
      setIsRetrying(false);
    }
  }, [status, onRetry]);

  // ========================================
  // Seek por Toque/Arraste na Waveform
  // ========================================
  const seekToPosition = useCallback((locationX: number) => {
    const containerWidth = waveContainerWidthRef.current;
    if (containerWidth <= 0) return;

    const newProgress = Math.max(0, Math.min(1, locationX / containerWidth));
    setProgress(newProgress);

    if (Platform.OS === 'web') {
      const audio = webAudioRef.current;
      if (audio && audio.duration > 0) {
        audio.currentTime = newProgress * audio.duration;
        setCurrentTimeMs(audio.currentTime * 1000);
      } else {
        setCurrentTimeMs(newProgress * durationMs);
      }
    } else if (soundRef.current) {
      const newPositionMs = newProgress * durationMs;
      soundRef.current.setPositionAsync(newPositionMs);
      setCurrentTimeMs(newPositionMs);
    }
  }, [durationMs]);

  // ========================================
  // Calcula largura total da waveform
  // ========================================
  const waveformWidth = waveBarCount > 0
    ? (waveBarCount * BAR_WIDTH) + ((waveBarCount - 1) * BAR_GAP)
    : 0;

  // ========================================
  // Calcula Posicao do Marcador
  // ========================================
  const markerPosition = progress * Math.max(0, waveformWidth - 13);

  // ========================================
  // Determina Texto de Tempo a Exibir
  // ========================================
  const displayTime = isPlaying || currentTimeMs > 0
    ? formatTime(currentTimeMs)
    : formatAudioDuration(content.duration);

  // ========================================
  // Fonte da Imagem do Avatar
  // ========================================
  const avatarSource = isOutgoing
    ? require('../../../../../../../assets/02-Foto.png')
    : require('../../../../../../../assets/01-Foto.png');

  // ========================================
  // Renderiza Ondas de Audio
  // ========================================
  const renderWaveform = () => {
    if (waveHeights.length === 0) return null;

    return (
      <View style={styles.waveRow}>
        {/* Marcador de Progresso */}
        <View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              left: Math.max(0, Math.min(markerPosition, waveformWidth - 13)),
              backgroundColor: '#1777CF',
            },
          ]}
        />
        {/* Barras de Onda */}
        {waveHeights.map((height, i) => {
          const barProgress = i / waveHeights.length;
          const isPlayed = barProgress <= progress;
          const color = isPlayed
            ? '#7D8592'
            : 'rgba(125,133,146,0.4)';
          return (
            <View
              key={i}                       //......Chave unica
              style={[
                styles.bar,                 //......Estilo base
                {
                  height: Math.max(3, height),
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Coluna esquerda: Avatar ou Container de Velocidade */}
        <View style={styles.leftCol}>
          {showSpeedControl ? (
            <TouchableOpacity
              onPress={cycleSpeed}
              style={[
                styles.speedContainer,
                isOutgoing ? styles.speedContainerUser : styles.speedContainerContact,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.speedText,
                  isOutgoing ? styles.speedTextUser : styles.speedTextContact,
                ]}
              >
                {getSpeedText()}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={cycleSpeed} activeOpacity={0.7}>
              <Image source={avatarSource} style={styles.avatarRect} />
            </TouchableOpacity>
          )}
        </View>

        {/* Coluna direita: Controles e Ondas */}
        <View style={styles.rightCol}>
          <View style={styles.rightTop}>
            {/* Botao Play/Pause */}
            <TouchableOpacity
              onPress={togglePlayback}
              activeOpacity={0.7}
              style={styles.playButton}
            >
              {isPlaying ? (
                <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                  <Rect
                    x={3}
                    y={2}
                    width={4}
                    height={14}
                    rx={1}
                    fill={isOutgoing ? '#1777CF' : '#3A3F51'}
                  />
                  <Rect
                    x={11}
                    y={2}
                    width={4}
                    height={14}
                    rx={1}
                    fill={isOutgoing ? '#1777CF' : '#3A3F51'}
                  />
                </Svg>
              ) : (
                <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                  <Path
                    d="M16.3409 7.86187L2.97916 0.176171C2.77851 0.0607592 2.55091 0 2.31922 0C2.08753 0 1.85993 0.0607592 1.65928 0.176171C1.4588 0.291678 1.29235 0.457692 1.17663 0.657549C1.06091 0.857406 0.999994 1.08407 1 1.3148V16.6859C0.999935 16.8585 1.03401 17.0294 1.10029 17.1889C1.16657 17.3484 1.26374 17.4933 1.38625 17.6153C1.50877 17.7373 1.65423 17.8341 1.81431 17.9001C1.97439 17.9662 2.14597 18.0001 2.31922 18C2.55075 18.0002 2.77822 17.9394 2.97866 17.824L16.3404 10.1385C16.541 10.0232 16.7075 9.85727 16.8233 9.65747C16.9391 9.45768 17 9.23104 17 9.00033C17.0002 8.76961 16.9394 8.54289 16.8237 8.34303C16.708 8.14316 16.5415 7.9772 16.3409 7.86187Z"
                    fill={isOutgoing ? '#1777CF' : '#3A3F51'}
                  />
                </Svg>
              )}
            </TouchableOpacity>

            {/* Area de Ondas (com seek por toque/arraste) */}
            <View
              style={styles.waveContainer}
              onLayout={(e) => { waveContainerWidthRef.current = e.nativeEvent.layout.width; }}
            >
              <View
                ref={waveAreaRef}
                style={styles.waveAreaTouchable}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderTerminationRequest={() => false}
                onResponderGrant={(evt) => {
                  isSeekingRef.current = true;
                  // Armazena posicao absoluta do container para calcular drag
                  if (Platform.OS === 'web' && waveAreaRef.current) {
                    const el = waveAreaRef.current as unknown as HTMLElement;
                    if (el.getBoundingClientRect) {
                      const rect = el.getBoundingClientRect();
                      seekRectRef.current = { left: rect.left, width: rect.width };
                    }
                  }
                  seekToPosition(evt.nativeEvent.locationX);
                }}
                onResponderMove={(evt) => {
                  if (Platform.OS === 'web' && seekRectRef.current) {
                    // Usa pageX - posicao absoluta para calculo preciso durante drag
                    const localX = evt.nativeEvent.pageX - seekRectRef.current.left;
                    seekToPosition(localX);
                  } else {
                    seekToPosition(evt.nativeEvent.locationX);
                  }
                }}
                onResponderRelease={() => {
                  isSeekingRef.current = false;
                  seekRectRef.current = null;
                  if (Platform.OS === 'web' && webAudioRef.current && !webAudioRef.current.paused) {
                    startProgressLoop();
                  }
                }}
              >
                {renderWaveform()}
              </View>
            </View>
          </View>

          {/* Linha inferior: Tempo do Audio */}
          <View style={styles.rightBottom}>
            {/* Tempo do audio */}
            <Text style={isOutgoing ? styles.timeTextLight : styles.timeTextDark}>
              {displayTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Area de Transcricao (inline, estilo WhatsApp) */}
      {(isTranscribing || transcription) && (
        <View style={styles.transcriptionArea}>
          {/* Divisoria fina */}
          <View style={[
            styles.transcriptionDivider,
            { backgroundColor: isOutgoing ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.06)' },
          ]} />

          {/* Estado: Transcrevendo... */}
          {isTranscribing && !transcription && (
            <View style={styles.transcribingRow}>
              <ActivityIndicator
                size="small"            //......Spinner pequeno
                color={isOutgoing ? '#1777CF' : '#7D8592'}
              />
              <Text style={[
                styles.transcribingText,
                { color: isOutgoing ? '#3A3F51' : '#7D8592' },
              ]}>
                Transcrevendo em português...
              </Text>
            </View>
          )}

          {/* Texto da transcricao ou erro */}
          {transcription && transcription.startsWith('Erro') ? (
            <Text style={[
              styles.transcribingText,
              { color: '#E53935' },       //......Vermelho para erro
            ]}>
              {transcription}
            </Text>
          ) : transcription ? (
            <View style={styles.transcriptionTextWrapper}>
              <Text style={[
                styles.transcriptionText,
                { color: isOutgoing ? '#111B21' : '#111B21' },
              ]}>
                {`"${transcription}"`}
                {/* Spacer invisivel - reserva espaco para timestamp */}
                {timestamp && (
                  <Text style={styles.transcriptionSpacer}>
                    {`\u00A0\u00A0\u00A0${timeStr}${isOutgoing && status ? '\u00A0✓✓' : ''}\u00A0\u00A0\u00A0`}
                  </Text>
                )}
              </Text>
              {/* Timestamp real posicionado no canto inferior direito */}
              {timestamp && (
                <Pressable
                  style={styles.transcriptionTimestamp}
                  onPress={status === 'failed' ? handleRetry : undefined}
                  disabled={status !== 'failed' || isRetrying}
                >
                  <Text style={[
                    styles.timestampText,
                    { color: '#667781', fontFamily: 'Inter_400Regular' },
                  ]}>
                    {timeStr}
                  </Text>
                  {isOutgoing && status && (
                    <MessageStatus
                      status={isRetrying ? 'pending' : status}
                      isOutgoing={isOutgoing}
                      size={11}              //......Tamanho do check
                      iconColor={'#667781'}
                    />
                  )}
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      )}

      {/* Container padronizado: Hora de envio + Status (posicao absoluta) */}
      {/* So mostra quando NAO tem transcricao com texto (timestamp fica inline) */}
      {timestamp && !hasTranscriptionText && (
        <Pressable
          style={[
            timestampStyle === 'container' ? styles.timestampContainer : styles.timestampContainerTransparent,
            timestampStyle === 'container' && {
              borderColor: isOutgoing ? '#1777CF' : '#D8D8D8',
              borderRightWidth: isOutgoing ? 2 : 1,
              borderBottomWidth: isOutgoing ? 2 : 1,
            },
          ]}
          onPress={status === 'failed' ? handleRetry : undefined}
          disabled={status !== 'failed' || isRetrying}
        >
          <Text style={[
            timestampStyle === 'container'
              ? styles.timestampText
              : (isOutgoing ? styles.timestampTextWhite : styles.timestampTextBlack),
            timestampStyle === 'container' && { color: isOutgoing ? '#667781' : colors.timestamp, fontFamily: 'Inter_400Regular' },
          ]}>
            {timeStr}
          </Text>
          {/* Status check */}
          {isOutgoing && status && (
            <MessageStatus
              status={isRetrying ? 'pending' : status}
              isOutgoing={isOutgoing}
              size={11}                   //......Tamanho do check
              iconColor={'#667781'}
            />
          )}
        </Pressable>
      )}

      {/* Area de Retry (abaixo do card de audio) */}
      {status === 'failed' && (isRetrying || retryFailed) && (
        <View style={styles.retryContainer}>
          {isRetrying ? (
            <>
              <ActivityIndicator size="small" color="#7D8592" />
              <Text style={styles.retryText}>Tentando enviar novamente...</Text>
            </>
          ) : retryFailed ? (
            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryFailedText}>
                Não foi possível enviar. Toque para tentar novamente.
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default memo(AudioMessage);

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    width: '100%',                        //......Ocupa todo espaco do MessageBubble (80% da tela)
    minWidth: 200,                        //......Largura minima
    overflow: 'visible',                  //......Permite conteudo alem dos limites
  },

  // Linha principal
  row: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-start',             //......Alinha no topo
    gap: 15,                              //......Espaco entre colunas
    width: '100%',                        //......Ocupa largura total
    overflow: 'visible',                  //......Permite conteudo alem dos limites
  },

  // Coluna esquerda (avatar/velocidade)
  leftCol: {
    paddingBottom: 5,                     //......Padding inferior
  },

  // Avatar retangular
  avatarRect: {
    width: 45,                            //......Largura
    height: 45,                           //......Altura
    borderRadius: 10,                     //......Bordas arredondadas
  },

  // Container de velocidade
  speedContainer: {
    width: 45,                            //......Largura
    height: 45,                           //......Altura
    borderRadius: 10,                     //......Bordas arredondadas
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Velocidade usuario (outgoing)
  speedContainerUser: {
    backgroundColor: '#1777CF',
  },

  // Velocidade contato (incoming)
  speedContainerContact: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // Texto de velocidade
  speedText: {
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular
  },

  // Texto velocidade usuario
  speedTextUser: {
    color: '#FFFFFF',                     //......Cor branca
  },

  // Texto velocidade contato
  speedTextContact: {
    color: '#7D8592',                     //......Cor cinza
  },

  // Coluna direita (player)
  rightCol: {
    flex: 1,                              //......Ocupa espaco restante
    width: '100%',                        //......Ocupa largura total
    overflow: 'visible',                  //......Permite conteudo alem dos limites
  },

  // Parte superior direita
  rightTop: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 10,                              //......Espaco entre
    paddingTop: 8,                        //......Padding superior
    width: '100%',                        //......Ocupa largura total
  },

  // Botao play/pause
  playButton: {
    width: 24,                            //......Largura
    height: 24,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Container das ondas
  waveContainer: {
    flex: 1,                              //......Ocupa espaco
    height: 24,                           //......Altura fixa
    overflow: 'visible',                  //......Permite overflow
  },

  // Area tocavel das ondas
  waveAreaTouchable: {
    flex: 1,                              //......Ocupa espaco
    width: '100%',                        //......Ocupa largura total
    justifyContent: 'center',             //......Centraliza vertical
    overflow: 'visible',                  //......Permite overflow
  },

  // Linha das ondas
  waveRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 2,                               //......Espaco entre barras
    position: 'relative',                 //......Posicao relativa
    height: 18,                           //......Altura fixa
    overflow: 'visible',                  //......Permite overflow
  },

  // Barra individual da onda
  bar: {
    width: 1.5,                           //......Largura da barra
    borderRadius: 0.5,                    //......Bordas arredondadas
  },

  // Marcador de progresso (dot)
  dot: {
    position: 'absolute',                 //......Posicao absoluta
    top: 2.5,                             //......Posicao vertical (centralizado em 18px)
    width: 13,                            //......Largura
    height: 13,                           //......Altura
    borderRadius: 6.5,                    //......Circular
    zIndex: 100,                          //......Acima das barras
    elevation: 5,                         //......Elevacao Android
  },

  // Parte inferior direita (tempo do audio)
  rightBottom: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'flex-start',         //......Alinha esquerda
    marginTop: 5,                         //......Margem superior
    paddingLeft: 35,                      //......Padding esquerdo
  },

  // Texto tempo claro (outgoing)
  timeTextLight: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light
  },

  // Texto tempo escuro (incoming)
  timeTextDark: {
    color: '#91929E',                     //......Cor cinza
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light
  },

  // ========================================
  // AJUSTE-AUDIO-CONTAINER (Modo Container Branco)
  // ========================================
  // Container branco padronizado do timestamp de envio (posicao absoluta)
  //
  // AJUSTE-AUDIO-VERTICAL: Altere "bottom" para subir/descer o container
  //   - Valor mais NEGATIVO = desce o container (ex: -10, -12, -15)
  //   - Valor menos NEGATIVO = sobe o container (ex: -6, -4, -2)
  //   - Valor ZERO = container na borda inferior do card
  //
  // AJUSTE-AUDIO-HORIZONTAL: Altere "right" para mover esquerda/direita
  //   - Valor mais NEGATIVO = move para DIREITA (ex: -16, -18, -20)
  //   - Valor menos NEGATIVO = move para ESQUERDA (ex: -12, -10, -8)
  //   - Valor ZERO = container na borda direita do card
  //
  // AJUSTE-AUDIO-GAP: Altere "gap" para espaco entre hora e check
  // AJUSTE-AUDIO-MARGEM-CHECK: Altere "paddingRight" para margem do check
  // ========================================
  timestampContainer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -8,                           //......AJUSTE-AUDIO-VERTICAL: Subir/descer
    right: -14,                           //......AJUSTE-AUDIO-HORIZONTAL: Esquerda/direita
    height: 20,                           //......Altura do container
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 5,                      //......AJUSTE-AUDIO-MARGEM-CHECK: Margem direita do check
    paddingTop: 2,                        //......Padding superior
    paddingBottom: 0,                     //......Padding inferior
    backgroundColor: 'rgba(252, 252, 252, 0.5)', //..Fundo branco 50%
    borderTopLeftRadius: 12,              //......Arredonda superior esquerdo
    borderBottomRightRadius: 6,           //......Arredonda inferior direito
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......AJUSTE-AUDIO-GAP: Espaco hora/check (padrao: 2)
  },

  // Texto do timestamp (preto sobre fundo branco)
  timestampText: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
  },

  // Texto do timestamp branco (modo transparente - outgoing)
  timestampTextWhite: {
    color: '#667781',                     //......Cor cinza padrao
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
  },

  // Texto do timestamp preto (modo transparente - incoming)
  timestampTextBlack: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
  },

  // ========================================
  // AJUSTE-AUDIO-CONTAINER-TRANSPARENTE (Modo Transparente)
  // ========================================
  // Container transparente do timestamp (sem fundo branco)
  //
  // AJUSTE-AUDIO-VERTICAL-TRANSP: Altere "bottom" para subir/descer
  //   - Valor mais NEGATIVO = desce (ex: -10, -12, -15)
  //   - Valor menos NEGATIVO = sobe (ex: -6, -4, -2)
  //   - Valor ZERO = na borda inferior do card
  //
  // AJUSTE-AUDIO-HORIZONTAL-TRANSP: Altere "right" para esquerda/direita
  //   - Valor mais NEGATIVO = move para DIREITA (ex: -12, -14, -16)
  //   - Valor menos NEGATIVO = move para ESQUERDA (ex: -6, -4, -2)
  //   - Valor ZERO = na borda direita do card
  //
  // AJUSTE-AUDIO-GAP-TRANSP: Altere "gap" para espaco entre hora e check
  // AJUSTE-AUDIO-MARGEM-CHECK-TRANSP: Altere "paddingRight" para margem do check
  // ========================================
  timestampContainerTransparent: {
    position: 'absolute' as const,        //......Posicao absoluta
    bottom: -0,                           //......AJUSTE-AUDIO-VERTICAL-TRANSP: Subir/descer
    right: -2,                            //......AJUSTE-AUDIO-HORIZONTAL-TRANSP: Esquerda/direita
    flexDirection: 'row' as const,        //......Layout horizontal
    alignItems: 'center' as const,        //......Centraliza vertical
    justifyContent: 'center' as const,    //......Centraliza horizontal
    gap: 2,                               //......AJUSTE-AUDIO-GAP-TRANSP: Espaco hora/check
    paddingLeft: 4,                       //......Padding esquerdo
    paddingRight: 0,                      //......AJUSTE-AUDIO-MARGEM-CHECK-TRANSP: Margem do check
  },

  // Container de Retry (abaixo do card de audio)
  retryContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'flex-end',           //......Alinha direita
    gap: 8,                               //......Espaco entre elementos
    marginTop: 4,                         //......Margem superior
    paddingRight: 4,                      //......Padding direito
  },

  // Texto de retry (tentando enviar)
  retryText: {
    color: '#7D8592',                     //......Cor cinza
    fontSize: 11,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontStyle: 'italic',                  //......Italico
  },

  // Botao de retry
  retryButton: {
    paddingVertical: 4,                   //......Padding vertical
    paddingHorizontal: 8,                 //......Padding horizontal
  },

  // Texto de retry falhou
  retryFailedText: {
    color: '#E53935',                     //......Cor vermelha
    fontSize: 11,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular
  },

  // Area de transcricao (abaixo do player)
  transcriptionArea: {
    marginTop: 2,                         //......Espaco acima
    paddingHorizontal: 4,                 //......Padding lateral
  },

  // Divisoria fina entre player e transcricao
  transcriptionDivider: {
    height: 0.5,                          //......Linha fina
    marginBottom: 8,                      //......Espaco abaixo
    marginHorizontal: 2,                  //......Margem lateral
  },

  // Linha do estado transcrevendo (spinner + texto)
  transcribingRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 8,                               //......Espaco entre spinner e texto
    paddingBottom: 4,                     //......Padding inferior
  },

  // Texto "Transcrevendo em português..."
  transcribingText: {
    fontSize: 13,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontStyle: 'italic',                  //......Italico
  },

  // Texto da transcricao finalizada
  transcriptionText: {
    fontSize: 14,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    lineHeight: 20,                       //......Altura da linha
    paddingBottom: 4,                     //......Padding inferior
  },

  // Wrapper relativo para transcricao + timestamp inline
  transcriptionTextWrapper: {
    position: 'relative' as const,        //......Referencia para timestamp absoluto
  },

  // Spacer invisivel (reserva espaco para timestamp no final do texto)
  transcriptionSpacer: {
    opacity: 0,                           //......Invisivel
    fontSize: 12,                         //......Mesmo tamanho do timestamp
    fontFamily: 'Inter_400Regular',       //......Mesma fonte
  },

  // Timestamp posicionado no canto inferior direito da transcricao
  transcriptionTimestamp: {
    position: 'absolute' as const,        //......Posicao absoluta
    bottom: 4,                            //......Alinhado com paddingBottom do texto
    right: 0,                             //......Direita do container
    flexDirection: 'row' as const,        //......Layout horizontal
    alignItems: 'center' as const,        //......Centraliza vertical
    gap: 2,                               //......Espaco hora/check
  },
});
