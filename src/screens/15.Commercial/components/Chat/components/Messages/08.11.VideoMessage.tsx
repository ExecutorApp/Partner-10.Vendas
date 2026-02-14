// ========================================
// Componente VideoMessage
// Mensagem de video seguindo padrao WhatsApp
// Usa HTML5 video na web e expo-av no mobile
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  memo,                                   //......Memoizacao
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useRef,                                 //......Hook de referencia
  useEffect,                              //......Hook de efeito
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  ActivityIndicator,                      //......Loading
  useWindowDimensions,                    //......Dimensoes da tela
  Platform,                               //......Plataforma
  Image,                                  //......Imagem (fallback thumbnail)
} from 'react-native';                    //......Biblioteca RN

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Tipos
// ========================================
import { VideoContent, MessageStatus as MessageStatusType, MessageKey } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Servicos Evolution API
// ========================================
import { evolutionService } from '../../../../services/evolutionService';

// ========================================
// Imports de Componentes
// ========================================
import MessageStatus from './08.08.MessageStatus';

// ========================================
// Imports de Icones
// ========================================
import { Ionicons } from '@expo/vector-icons';

// ========================================
// Imports de Tipo TimestampStyle
// ========================================
import { TimestampStyle } from '../../10.00.LeadLolaSwipeContainer';

// ========================================
// Imports de Servicos
// ========================================
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Interface de Props
// ========================================
interface VideoMessageProps {
  content: VideoContent;                  //......Conteudo do video
  isOutgoing: boolean;                    //......Se e enviada
  timestamp?: Date;                       //......Hora de envio
  status?: MessageStatusType;             //......Status da mensagem
  reaction?: string;                      //......Reacao (emoji)
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  onPress?: () => void;                   //......Handler press
  onLongPress?: (pageY?: number) => void;  //......Handler long press (com posicao Y)
  messageKey?: MessageKey;                //......Chave para Evolution API
  instanceName?: string;                  //......Nome da instancia Evolution
}

// ========================================
// Constantes de Layout (Padrao WhatsApp 2026)
// ========================================

// Porcentagem da largura do chat para video (72% conforme WhatsApp oficial)
const WIDTH_PERCENTAGE = 0.72;            //......72% da largura do chat

// Porcentagem maxima da altura da tela (75% conforme WhatsApp oficial)
const MAX_HEIGHT_PERCENTAGE = 0.75;       //......75% da altura da tela

// Largura minima do video
const MIN_WIDTH = 150;                    //......Largura minima

// Altura minima do video
const MIN_HEIGHT = 100;                   //......Altura minima

// Configuracoes de borda
const BORDER_RADIUS = 12;                 //......Raio das bordas

// ========================================
// Componente Principal VideoMessage (Memoizado)
// ========================================
const VideoMessage = memo<VideoMessageProps>(({
  content,                                //......Conteudo
  isOutgoing,                             //......Direcao
  timestamp,                              //......Hora
  status,                                 //......Status
  reaction,                               //......Reacao
  timestampStyle = 'container',           //......Estilo do timestamp
  onPress,                                //......Handler
  onLongPress,                            //......Handler long press
  messageKey,                             //......Chave Evolution API
  instanceName,                           //......Instancia Evolution
}) => {
  // (posicao Y capturada pelo listener global lastPointerY)

  // ========================================
  // Log de inicializacao para debug
  // ========================================
  useEffect(() => {
    console.log('[VideoMessage] MOUNT - URL:', content.url?.substring(0, 60) + '...');
    console.log('[VideoMessage] MOUNT - Thumb:', !!content.thumbnail, '| Key:', !!messageKey, '| Instance:', instanceName);
  }, []);

  // ========================================
  // Dimensoes da Tela
  // ========================================
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // ========================================
  // Estados - Loading false se tem thumbnail (evita flickering)
  // ========================================
  const hasThumbnail = !!content.thumbnail; //................. Tem thumbnail disponivel
  const hasContentDimensions = content.width > 0 && content.height > 0;
  const initialAspectRatio = hasContentDimensions
    ? content.width / content.height //........................ Usa dimensoes do content
    : 0.75; //.................................................. Padrao portrait 3:4

  const [isLoading, setIsLoading] = useState(!hasThumbnail); // Loading apenas se nao tem thumb
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(content.duration || 0);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [triedLocalCache, setTriedLocalCache] = useState(false);
  const [triedEvolutionApi, setTriedEvolutionApi] = useState(false);
  const [cacheLoadFailed, setCacheLoadFailed] = useState(false); //.. Cache carregou mas falhou
  const [videoReady, setVideoReady] = useState(false); //...... Video pronto para exibir
  const [loadingHDVideo, setLoadingHDVideo] = useState(false); //.... Carregando video HD em background
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio); //.. Aspect ratio dinamico
  const videoRef = useRef<HTMLVideoElement>(null);

  // ========================================
  // Calcular dimensoes do container de chat
  // ========================================
  const chatWidth = screenWidth - 24;     //......Largura util do chat

  // ========================================
  // Calcular largura maxima do video
  // ========================================
  const maxVideoWidth = Math.max(
    chatWidth * WIDTH_PERCENTAGE,         //......70% da largura do chat
    MIN_WIDTH                             //......Minimo 150px
  );

  // ========================================
  // Calcular altura maxima do video
  // Proporcao 1.15: baseado no WhatsApp oficial
  // - Portrait 0.75 fica com ~86% da largura do landscape
  // - Portrait 0.56 fica com ~64% da largura do landscape
  // ========================================
  const maxHeightFromViewport = screenHeight * MAX_HEIGHT_PERCENTAGE;
  const maxHeightFromRatio = maxVideoWidth * 1.15; //.Proporcao 1.15
  const maxVideoHeight = Math.max(
    Math.min(maxHeightFromViewport, maxHeightFromRatio),
    MIN_HEIGHT                            //......Minimo 100px
  );

  // ========================================
  // Detectar aspect ratio do video
  // Video geralmente NAO tem dimensoes no content, detectar via thumbnail
  // ========================================
  useEffect(() => {
    // Se tem dimensoes do content, usar (mais confiavel)
    if (hasContentDimensions) {
      const contentRatio = content.width / content.height;
      setAspectRatio(contentRatio);
      return;
    }

    // Se NAO tem dimensoes do content, detectar via thumbnail
    const imageUri = content.thumbnail;
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          if (height > 0) {
            const newRatio = width / height;
            setAspectRatio(newRatio);
          }
        },
        (error) => {
          console.log('[VideoMessage] Image.getSize ERRO:', error);
        }
      );
    }
  }, [content.width, content.height, content.thumbnail, hasContentDimensions]);

  // ========================================
  // Calcular largura minima (30% do chat)
  // ========================================
  const minBubbleWidth = chatWidth * 0.30;

  // ========================================
  // Calcular dimensoes finais do video (Padrao WhatsApp 2026)
  // Algoritmo oficial:
  // - LANDSCAPE/SQUARE (ratio >= 1): prioriza largura maxima
  // - PORTRAIT (ratio < 1): largura FIXA para todos os portraits
  // - Video NUNCA e cortado, sempre exibido inteiro
  // ========================================
  const calculateDimensions = useCallback(() => {
    let bubbleWidth: number;
    let bubbleHeight: number;

    // Largura FIXA para portraits (85% da maxWidth)
    // AJUSTE-LARGURA-PORTRAIT: Altere este valor para ajustar largura dos videos verticais
    const PORTRAIT_WIDTH_RATIO = 0.85;

    if (aspectRatio >= 1.0) {
      // LANDSCAPE ou QUADRADO: prioriza largura maxima
      bubbleWidth = maxVideoWidth;
      bubbleHeight = maxVideoWidth / aspectRatio;

      // Clamp: se altura exceder o maximo
      if (bubbleHeight > maxVideoHeight) {
        bubbleHeight = maxVideoHeight;
        bubbleWidth = maxVideoHeight * aspectRatio;
      }
    } else {
      // PORTRAIT: largura FIXA para todos os portraits
      bubbleWidth = maxVideoWidth * PORTRAIT_WIDTH_RATIO;
      bubbleHeight = bubbleWidth / aspectRatio;

      // DEBUG: Log para verificar calculo proporcional
      console.log(`[VideoMessage] PORTRAIT - ratio=${aspectRatio.toFixed(3)} | largura=${bubbleWidth.toFixed(0)}px | altura=${bubbleHeight.toFixed(0)}px | maxH=${maxVideoHeight.toFixed(0)}px`);

      // Clamp: se altura exceder o maximo
      if (bubbleHeight > maxVideoHeight) {
        console.log(`[VideoMessage] CLAMP altura: ${bubbleHeight.toFixed(0)}px -> ${maxVideoHeight.toFixed(0)}px`);
        bubbleHeight = maxVideoHeight;
      }
    }

    // Garantias finais de minimos absolutos
    if (bubbleWidth < MIN_WIDTH) {
      bubbleWidth = MIN_WIDTH;
    }
    if (bubbleHeight < MIN_HEIGHT) {
      bubbleHeight = MIN_HEIGHT;
    }

    return {
      width: Math.round(bubbleWidth),     //......Largura final arredondada
      height: Math.round(bubbleHeight),   //......Altura final arredondada
    };
  }, [maxVideoWidth, maxVideoHeight, aspectRatio]);

  const dimensions = calculateDimensions();

  // ========================================
  // Formatar duracao do video (MM:SS)
  // ========================================
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);   //......Minutos
    const secs = Math.floor(seconds % 60);   //......Segundos
    return `${mins}:${secs.toString().padStart(2, '0')}`; //......Formato M:SS
  }, []);

  // ========================================
  // Handler de Metadata carregada (captura duracao)
  // ========================================
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoRef.current.duration) {
      const dur = videoRef.current.duration; //......Duracao em segundos
      if (dur && isFinite(dur) && dur > 0) {
        setVideoDuration(dur);               //......Atualiza estado
      }
    }
  }, []);

  // ========================================
  // Formatar hora
  // ========================================
  const formattedTime = timestamp
    ? timestamp.toLocaleTimeString('pt-BR', {
        hour: '2-digit',                  //......Hora 2 digitos
        minute: '2-digit',                //......Minuto 2 digitos
      })
    : '';

  // ========================================
  // Handler de Load - Video carregou
  // ========================================
  const handleLoad = useCallback(() => {
    console.log('[VideoMessage] SUCESSO - Video carregou! URL:', (localVideoUrl || content.url)?.substring(0, 50) + '...');
    setIsLoading(false); //................... Remove loading
    setVideoReady(true); //................... Marca video pronto
  }, [localVideoUrl, content.url]);

  // ========================================
  // Efeito: Carregar video HD em background automaticamente
  // Nao espera erro - inicia download assim que tem messageKey
  // ========================================
  useEffect(() => {
    // Se ainda nao tentou Evolution API E tem os dados necessarios
    if (!loadingHDVideo && !triedEvolutionApi && !localVideoUrl && messageKey && instanceName && content.url?.startsWith('http')) {
      console.log('[VideoMessage] Iniciando download HD em background...');
      setLoadingHDVideo(true);

      // Buscar video HD via Evolution API
      (async () => {
        try {
          // Primeiro verificar cache local
          const cachedUrl = await mediaStorageService.getMedia(content.url);
          if (cachedUrl && cachedUrl.startsWith('data:video/')) {
            const commaIdx = cachedUrl.indexOf(',');
            const base64Length = commaIdx > 0 ? cachedUrl.length - commaIdx - 1 : 0;
            if (base64Length > 50000) { // Cache valido > 50KB
              console.log('[VideoMessage] HD do cache:', base64Length, 'chars');
              setLocalVideoUrl(cachedUrl);
              setTriedEvolutionApi(true);
              return;
            }
          }

          // Se nao tem cache, buscar via Evolution API
          console.log('[VideoMessage] Buscando HD via Evolution API...');
          const apiStart = Date.now();
          const mediaData = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
          console.log('[VideoMessage] Evolution API HD respondeu em ' + (Date.now() - apiStart) + 'ms');

          if (mediaData && mediaData.base64) {
            let mimeType = mediaData.mimeType || 'video/mp4';
            if (mimeType === 'application/octet-stream' || !mimeType.startsWith('video/')) {
              mimeType = 'video/mp4';
            }

            let base64Data = mediaData.base64;
            if (base64Data.startsWith('data:')) {
              const commaIndex = base64Data.indexOf(',');
              if (commaIndex !== -1) {
                base64Data = base64Data.substring(commaIndex + 1);
              }
            }

            const dataUri = `data:${mimeType};base64,${base64Data}`;
            console.log('[VideoMessage] HD pronto! Tamanho:', dataUri.length, 'chars');

            // Salvar no cache
            mediaStorageService.saveMedia(content.url, dataUri, mimeType).catch(() => {});

            // Substituir thumbnail pelo video HD
            setLocalVideoUrl(dataUri);
            setTriedEvolutionApi(true);
          } else {
            console.log('[VideoMessage] Evolution API retornou vazio para HD');
            setTriedEvolutionApi(true);
          }
        } catch (err) {
          console.error('[VideoMessage] Erro ao buscar HD:', err);
          setTriedEvolutionApi(true);
        }
      })();
    }
  }, [loadingHDVideo, triedEvolutionApi, localVideoUrl, messageKey, instanceName, content.url]);

  // ========================================
  // Handler de Erro - Tenta cache local e Evolution API
  // URLs do WhatsApp (mmg.whatsapp.net) expiram apos algumas horas
  // ========================================
  const handleError = useCallback(async (e: any) => {
    const startTime = Date.now(); //.............. Tempo inicial para medir performance
    // Log detalhado do erro para diagnostico
    const videoElement = e?.target as HTMLVideoElement | undefined;
    const mediaError = videoElement?.error;
    const currentSrc = localVideoUrl || content.url;

    console.log('[VideoMessage] ========== ERRO ==========');
    console.log('[VideoMessage] Timestamp:', new Date().toISOString());
    console.log('[VideoMessage] URL tentada:', currentSrc?.substring(0, 80) + '...');
    console.log('[VideoMessage] URL original:', content.url?.substring(0, 80) + '...');
    console.log('[VideoMessage] Thumbnail:', !!content.thumbnail);
    console.log('[VideoMessage] Estados: cache=' + triedLocalCache + ', api=' + triedEvolutionApi + ', cacheFailed=' + cacheLoadFailed);
    console.log('[VideoMessage] Evolution: key=' + !!messageKey + ', instance=' + instanceName);

    if (mediaError) {
      const errorCodes: Record<number, string> = {
        1: 'ABORTED',
        2: 'NETWORK (URL expirada?)',
        3: 'DECODE',
        4: 'SRC_NOT_SUPPORTED',
      };
      console.log('[VideoMessage] MediaError:', mediaError.code, '-', errorCodes[mediaError.code] || 'Desconhecido');
    }

    // Se estamos usando cache local e ele falhou, pular para Evolution API
    if (localVideoUrl && !cacheLoadFailed) {
      console.log('[VideoMessage] Cache local foi carregado mas falhou ao reproduzir');
      setCacheLoadFailed(true);
      setLocalVideoUrl(null);
      // Continua para Evolution API abaixo
    }

    // Passo 1: Tentar cache local se URL for externa (e cache nao falhou antes)
    if (!triedLocalCache && !cacheLoadFailed && content.url?.startsWith('http')) {
      console.log('[VideoMessage] Passo 1: Tentando cache local...');
      setTriedLocalCache(true);

      try {
        const cachedUrl = await mediaStorageService.getMedia(content.url);
        if (cachedUrl) {
          // Verificar se o cache tem mimeType válido para vídeo
          if (cachedUrl.startsWith('data:application/octet-stream') ||
              (!cachedUrl.startsWith('data:video/') && cachedUrl.startsWith('data:'))) {
            console.log('[VideoMessage] Cache local tem mimeType inválido, ignorando...');
            // Não usar cache corrompido, continuar para Evolution API
          } else {
            // Validacao extra: base64 muito pequeno = dados corrompidos
            // Um video minimamente valido tem pelo menos 10KB de dados
            const commaIdx = cachedUrl.indexOf(',');
            const base64Length = commaIdx > 0 ? cachedUrl.length - commaIdx - 1 : 0;
            if (base64Length < 10000) {
              console.log('[VideoMessage] Cache local muito pequeno (' + base64Length + ' chars), ignorando...');
              // Cache corrompido, continuar para Evolution API
            } else {
              console.log('[VideoMessage] Cache local valido! Tamanho:', base64Length, 'chars');
              setLocalVideoUrl(cachedUrl);
              setIsLoading(true);
              return;
            }
          }
        } else {
          console.log('[VideoMessage] Cache local NAO encontrado');
        }
      } catch (cacheError) {
        console.error('[VideoMessage] Erro ao buscar cache:', cacheError);
      }
    }

    // Passo 2: Tentar Evolution API se tem messageKey e instanceName
    if (!triedEvolutionApi && messageKey && instanceName) {
      console.log('[VideoMessage] Passo 2: Evolution API... (+' + (Date.now() - startTime) + 'ms)');
      setTriedEvolutionApi(true);
      setIsLoading(true);

      try {
        const apiStart = Date.now();
        const mediaData = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
        console.log('[VideoMessage] Evolution API respondeu em ' + (Date.now() - apiStart) + 'ms');

        if (mediaData && mediaData.base64) {
          console.log('[VideoMessage] Base64:', mediaData.base64.length, 'chars, mimeType:', mediaData.mimeType);

          // CORREÇÃO: Forçar video/mp4 se mimeType for genérico
          let mimeType = mediaData.mimeType || 'video/mp4';
          if (mimeType === 'application/octet-stream' || !mimeType.startsWith('video/')) {
            console.log('[VideoMessage] mimeType corrigido:', mimeType, '->', 'video/mp4');
            mimeType = 'video/mp4';
          }

          // Remove prefixo data: existente se houver
          let base64Data = mediaData.base64;
          if (base64Data.startsWith('data:')) {
            const commaIndex = base64Data.indexOf(',');
            if (commaIndex !== -1) {
              base64Data = base64Data.substring(commaIndex + 1);
            }
          }

          const dataUri = `data:${mimeType};base64,${base64Data}`;
          console.log('[VideoMessage] DataURI pronto, salvando cache... (+' + (Date.now() - startTime) + 'ms)');

          // Salva no cache
          mediaStorageService.saveMedia(content.url, dataUri, mimeType).catch(err => {
            console.error('[VideoMessage] Erro ao salvar cache:', err);
          });

          setLocalVideoUrl(dataUri);
          setHasError(false);
          console.log('[VideoMessage] SUCESSO via Evolution API! Total: ' + (Date.now() - startTime) + 'ms');
          return;
        }
        console.log('[VideoMessage] Evolution API retornou VAZIO');
      } catch (apiError) {
        console.error('[VideoMessage] Evolution API ERRO:', apiError);
      }
    } else {
      console.log('[VideoMessage] Evolution API BLOQUEADA - key=' + !!messageKey + ', instance=' + !!instanceName);
    }

    console.log('[VideoMessage] FALHOU - Todas tentativas esgotadas (+' + (Date.now() - startTime) + 'ms)');
    setIsLoading(false);
    setHasError(true);
  }, [content.url, content.thumbnail, triedLocalCache, triedEvolutionApi, messageKey, instanceName, localVideoUrl, cacheLoadFailed]);

  // ========================================
  // Handler de Play/Pause
  // ========================================
  const handlePlayPause = useCallback(async () => {
    // handlePlayPause
    if (Platform.OS === 'web' && videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('[VideoMessage] Erro ao play/pause:', error);
      }
    }
  }, [isPlaying]);

  // ========================================
  // Render de Erro - Mostra thumbnail se disponivel
  // URLs do WhatsApp (mmg.whatsapp.net) expiram apos algumas horas
  // ========================================
  if (hasError) {
    // Se tem thumbnail, mostra como fallback
    if (content.thumbnail) {
      return (
        <View style={[styles.wrapper, isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming, reaction && styles.wrapperWithReaction]}>
          <Pressable
            style={[
              styles.container,
              {
                width: dimensions.width - 6,
                height: dimensions.height - 6,
              },
            ]}
            onPress={onPress}
            onLongPress={() => {
              onLongPress?.(0);                        //......Posicao Y capturada no pai
            }}
          >
            {/* Thumbnail como fallback */}
            <Image
              source={{ uri: content.thumbnail }}
              style={[styles.thumbnailFallback, { borderRadius: 0 }]}
              resizeMode="cover"
            />

            {/* Overlay escuro indicando erro */}
            <View style={styles.errorOverlay} pointerEvents="none" />

            {/* Botao Play com icone de erro */}
            <View style={styles.playOverlay} pointerEvents="none">
              <View style={styles.playButton}>
                <Ionicons
                  name="play"
                  size={24}
                  color="#3A3F51"
                />
              </View>
            </View>

            {/* Badge de duracao do video */}
            {videoDuration > 0 && (
              <View style={styles.durationBadge} pointerEvents="none">
                <Text style={styles.durationText}>
                  {formatDuration(videoDuration)}
                </Text>
              </View>
            )}

            {/* Container de Horario + Status */}
            <View
              style={
                timestampStyle === 'container'
                  ? styles.timeContainer
                  : styles.timeContainerGradient
              }
              pointerEvents="none"
            >
              <Text style={
                timestampStyle === 'container'
                  ? styles.timeText
                  : styles.timeTextDark
              }>
                {formattedTime}
              </Text>
              {isOutgoing && status && (
                <View style={styles.checkWrapper}>
                  <MessageStatus
                    status={status}
                    isOutgoing={true}
                    size={11}
                    iconColor="#667781"
                  />
                </View>
              )}
            </View>
          </Pressable>

          {/* Badge de Reacao */}
          {reaction && (
            <View style={styles.reactionBadge}>
              <Text style={styles.reactionText}>{reaction}</Text>
            </View>
          )}
        </View>
      );
    }

    // Sem thumbnail - mostra erro padrao
    return (
      <View style={[styles.wrapper, isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming]}>
        <View
          style={[
            styles.container,
            styles.errorContainer,
            {
              width: dimensions.width - 6,
              height: dimensions.height - 6,
              backgroundColor: ChatColors.chatBackground,
            },
          ]}
        >
          <Ionicons
            name="videocam-off"
            size={32}
            color={ChatColors.timestamp}
          />
          <Text style={styles.errorText}>
            Erro ao carregar video
          </Text>
        </View>
      </View>
    );
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={[styles.wrapper, isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming, reaction && styles.wrapperWithReaction]}>
      {/* Container do Video */}
      <Pressable
        style={[
          styles.container,
          {
            width: dimensions.width - 6,
            height: dimensions.height - 6,
          },
        ]}
        onPress={onPress}
        onLongPress={() => {
          onLongPress?.(0);                        //......Posicao Y capturada no pai
        }}
      >
        {/* Thumbnail como background (exibicao instantanea) */}
        {hasThumbnail && !videoReady && (
          <Image
            source={{ uri: content.thumbnail }}
            style={[styles.thumbnailBackground, { borderRadius: 0 }]}
            resizeMode="cover"
          />
        )}

        {/* Video - Usando HTML5 video para Web */}
        {/* Usa URL do cache local se disponivel, senao usa URL original */}
        {Platform.OS === 'web' ? (
          <video
            ref={videoRef}
            src={localVideoUrl || content.url}
            style={{
              position: 'absolute',       //......Posicao absoluta
              top: 0,                     //......Alinha topo
              left: 0,                    //......Alinha esquerda
              width: '100%',              //......Largura total
              height: '100%',             //......Altura total
              objectFit: 'cover',         //......Preenche o container
              borderRadius: 0,
              pointerEvents: 'none',      //......Nao captura cliques
              opacity: videoReady ? 1 : 0, //......Oculto ate carregar
            }}
            controls={false}
            playsInline
            preload="auto"
            onLoadedData={handleLoad}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleLoad}
            onError={handleError}
            onPlay={() => {
              setIsPlaying(true);
            }}
            onPause={() => {
              setIsPlaying(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
            }}
          />
        ) : (
          // Mobile: Placeholder - implementar expo-av se necessario
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={32} color="#FFFFFF" />
          </View>
        )}

        {/* Loading - Apenas se NAO tem thumbnail */}
        {isLoading && !hasThumbnail && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={isOutgoing ? ChatColors.white : ChatColors.voiceButton}
            />
          </View>
        )}

        {/* Botao Play (quando nao esta tocando) - Abre o VideoViewer */}
        {!isPlaying && !isLoading && (
          <Pressable
            style={styles.playOverlay}
            onPress={() => {
              // Play button pressed
              if (onPress) {
                onPress();
              }
            }}
            onLongPress={() => {
              onLongPress?.(0);                        //......Posicao Y capturada no pai
            }}
          >
            <View style={styles.playButton}>
              <Ionicons
                name="play"
                size={24}
                color="#3A3F51"
              />
            </View>
          </Pressable>
        )}

        {/* Badge de duracao do video (canto inferior esquerdo) */}
        {videoDuration > 0 && !isPlaying && !isLoading && (
          <View style={styles.durationBadge} pointerEvents="none">
            <Text style={styles.durationText}>
              {formatDuration(videoDuration)}
            </Text>
          </View>
        )}

        {/* Container padronizado de Horario + Status (canto inferior direito) */}
        <View
          style={
            timestampStyle === 'container'
              ? styles.timeContainer
              : styles.timeContainerGradient
          }
          pointerEvents="none"
        >
          {/* Hora */}
          <Text style={
            timestampStyle === 'container'
              ? styles.timeText
              : styles.timeTextDark
          }>
            {formattedTime}
          </Text>

          {/* Status (checks) - apenas outgoing (padrao WhatsApp) */}
          {isOutgoing && status && (
            <View style={styles.checkWrapper}>
              <MessageStatus
                status={status}
                isOutgoing={true}
                size={11}                 //......Tamanho do check
                iconColor="#667781"
              />
            </View>
          )}
        </View>
      </Pressable>

      {/* Badge de Reacao fora do container */}
      {reaction && (
        <View style={styles.reactionBadge}>
          <Text style={styles.reactionText}>{reaction}</Text>
        </View>
      )}
    </View>
  );
}, (prev, next) => {
  // Comparacao customizada para evitar re-renders
  const sameTimestamp = prev.timestamp?.getTime() === next.timestamp?.getTime();
  const sameMessageKey = prev.messageKey?.id === next.messageKey?.id;
  return prev.content.url === next.content.url &&
         prev.isOutgoing === next.isOutgoing &&
         prev.status === next.status &&
         prev.reaction === next.reaction &&
         prev.timestampStyle === next.timestampStyle &&
         prev.instanceName === next.instanceName &&
         sameTimestamp &&
         sameMessageKey;
});

// ========================================
// Export Default
// ========================================
export default VideoMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Wrapper externo para badge de reacao
  wrapper: {
    position: 'relative',                 //......Posicao relativa
  },

  // Wrapper outgoing com padding como borda visual (elimina anti-aliasing)
  wrapperOutgoing: {
    borderRadius: BORDER_RADIUS,          //......Raio externo da borda visual
    backgroundColor: '#C8E4FF',           //......Cor da borda visual
    padding: 3,                           //......Largura da borda visual (substitui borderWidth)
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.18)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 3,
          elevation: 2,
        }),
  },

  // Wrapper incoming com padding como borda visual
  wrapperIncoming: {
    borderRadius: BORDER_RADIUS,          //......Raio externo da borda visual
    backgroundColor: '#FFFFFF',           //......Cor da borda visual (branca)
    padding: 3,                           //......Largura da borda visual (substitui borderWidth)
  },

  // Wrapper com margem extra quando tem reacao
  wrapperWithReaction: {
    marginBottom: 25,                     //......Margem inferior para reacao
  },

  // Container principal do video
  container: {
    borderRadius: BORDER_RADIUS - 3,      //......Raio interno (9) alinhado ao wrapper
    position: 'relative',                 //......Posicao relativa
    overflow: 'hidden',                   //......Clip do conteudo
  },

  // Container de erro
  errorContainer: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    backgroundColor: ChatColors.chatBackground,
    gap: 8,                               //......Espaco entre icone e texto
  },

  // Texto de erro
  errorText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 12,                         //......Tamanho fonte
    color: ChatColors.timestamp,          //......Cor cinza
    textAlign: 'center',                  //......Alinhamento centro
  },

  // Thumbnail como background (exibicao instantanea)
  thumbnailBackground: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    right: 0,                             //......Alinha direita
    bottom: 0,                            //......Alinha baixo
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
  },

  // Thumbnail como fallback quando URL expira
  thumbnailFallback: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    right: 0,                             //......Alinha direita
    bottom: 0,                            //......Alinha baixo
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
  },

  // Overlay escuro quando video falha (sobre thumbnail)
  errorOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    right: 0,                             //......Alinha direita
    bottom: 0,                            //......Alinha baixo
    backgroundColor: 'rgba(0, 0, 0, 0.15)', //....Fundo escuro leve
    zIndex: 2,                            //......Acima do thumbnail
  },

  // Container de loading
  loadingContainer: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    right: 0,                             //......Alinha direita
    bottom: 0,                            //......Alinha baixo
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    backgroundColor: 'rgba(237, 239, 243, 0.8)', //..Fundo cinza claro
    zIndex: 1,                            //......Acima do video
  },

  // Placeholder para mobile
  videoPlaceholder: {
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
    backgroundColor: '#EDEFF3',           //......Fundo cinza claro
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Badge de duracao do video (inferior esquerdo)
  durationBadge: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 6,                            //......Distancia do fundo
    left: 6,                              //......Distancia da esquerda
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    backgroundColor: 'rgba(0, 0, 0, 0.5)', //....Fundo escuro semitransparente
    borderRadius: 5,                      //......Bordas arredondadas
    paddingHorizontal: 7,                 //......Padding horizontal
    paddingVertical: 4,                   //......Padding vertical
    zIndex: 5,                            //......Acima do video
  },

  // Texto da duracao do video
  durationText: {
    fontFamily: 'Inter_500Medium',        //......Fonte medium
    fontSize: 12,                         //......Tamanho fonte
    color: '#FFFFFF',                     //......Cor branca
    lineHeight: 14,                       //......Altura linha
  },

  // Overlay do botao play - Sem fundo escuro
  playOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    right: 0,                             //......Alinha direita
    bottom: 0,                            //......Alinha baixo
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    zIndex: 10,                           //......Acima de outros elementos
  },

  // Botao play circular - Fundo branco, icone preto
  playButton: {
    width: 50,                            //......Largura do botao
    height: 50,                           //......Altura do botao
    borderRadius: 25,                     //......Circular
    backgroundColor: '#FFFFFF',           //......Fundo branco
    justifyContent: 'center',             //......Centraliza icone
    alignItems: 'center',                 //......Centraliza icone
    paddingLeft: 3,                       //......Ajuste visual do icone play
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }),
  },

  // Container padronizado de Horario + Status
  timeContainer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0.6,                            //......AJUSTE: Subir = aumentar | Descer = diminuir
    right: 0,                             //......AJUSTE: Esquerda = aumentar | Direita = diminuir
    paddingTop: 6,                        //......Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: 'rgba(252, 252, 252, 0.8)',
    borderTopLeftRadius: 12,              //......Arredonda canto
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......Espaco entre hora e check
  },

  // Texto do tempo (preto sobre fundo branco)
  timeText: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light
    lineHeight: 12,                       //......Altura linha
  },

  // Texto do tempo branco (modo transparente)
  timeTextWhite: {
    color: '#FFFFFF',                     //......Cor branca
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light
    lineHeight: 12,                       //......Altura linha
  },

  // Texto do tempo escuro (Tema 3 - sobre fundo azul claro)
  timeTextDark: {
    color: '#667781',                     //......Cor cinza medio (igual checks)
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular (mais visivel)
    lineHeight: 12,                       //......Altura linha
  },

  // Container AZUL de Horario + Status (Tema 1 e 2)
  timeContainerBlue: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0.6,                          //......AJUSTE: Subir = aumentar | Descer = diminuir
    right: 0,                             //......AJUSTE: Esquerda = aumentar | Direita = diminuir
    paddingTop: 6,                        //......Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: '#1777CF',           //......Fundo AZUL
    borderTopLeftRadius: 12,              //......Arredonda canto
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......Espaco entre hora e check
  },

  // Container de Horario + Status (Tema 3 - azul claro)
  // Mesmo formato do container azul, apenas cor de fundo diferente
  timeContainerGradient: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -0.4,                         //......AJUSTE: Subir = aumentar | Descer = diminuir
    right: 0,                             //......AJUSTE: Esquerda = aumentar | Direita = diminuir
    paddingTop: 6,                        //......Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: '#E0F0FF',           //......Fundo azul claro (igual cards tema 3)
    borderTopLeftRadius: 12,              //......Arredonda canto
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......Espaco entre hora e check
  },

  // Wrapper do icone de check
  checkWrapper: {
    marginTop: -2,                        //......Ajuste vertical
  },

  // Badge de Reacao
  reactionBadge: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -20,                          //......Abaixo do container
    right: 10,                            //......Alinha direita
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderRadius: 8,                      //......Bordas arredondadas
    paddingHorizontal: 6,                 //......Padding horizontal
    paddingVertical: 2,                   //......Padding vertical
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        }),
    zIndex: 10,                           //......Camada superior
  },

  // Texto do Emoji de Reacao
  reactionText: {
    fontSize: 16,                         //......Tamanho emoji
  },
});
