// ========================================
// Componente ImageMessage
// Mensagem de imagem seguindo padrao WhatsApp
// Container branco padronizado para horario e check
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  memo,                                   //......Memoizacao
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useEffect,                              //......Hook de efeito
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  Image,                                  //......Imagem
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  ActivityIndicator,                      //......Loading
  useWindowDimensions,                    //......Dimensoes da tela
  Platform,                               //......Plataforma
} from 'react-native';                    //......Biblioteca RN

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Tipos
// ========================================
import { ImageContent, MessageStatus as MessageStatusType, MessageKey } from '../../types/08.types.whatsapp';

// ========================================
// Imports de Servicos Evolution API
// ========================================
import { evolutionService } from '../../../../services/evolutionService';

// ========================================
// Imports de Componentes
// ========================================
import MessageStatus from './08.08.MessageStatus';

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
interface ImageMessageProps {
  content: ImageContent;                  //......Conteudo da imagem
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

// Porcentagem da largura do chat para imagem (72% conforme WhatsApp oficial)
const WIDTH_PERCENTAGE = 0.72;            //......72% da largura do chat

// Porcentagem maxima da altura da tela (75% conforme WhatsApp oficial)
const MAX_HEIGHT_PERCENTAGE = 0.75;       //......75% da altura da tela

// Largura minima da imagem
const MIN_WIDTH = 150;                    //......Largura minima

// Altura minima da imagem
const MIN_HEIGHT = 100;                   //......Altura minima

// Configuracoes de borda
const BORDER_RADIUS = 12;                 //......Raio das bordas

// ========================================
// Componente Principal ImageMessage (Memoizado)
// ========================================
const ImageMessage = memo<ImageMessageProps>(({
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
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [mainImageReady, setMainImageReady] = useState(false); // Imagem principal carregada
  const [usingFallback, setUsingFallback] = useState(false); //......Usando thumbnail fallback
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [triedLocalCache, setTriedLocalCache] = useState(false);
  const [triedEvolutionApi, setTriedEvolutionApi] = useState(false);
  const [cacheLoadFailed, setCacheLoadFailed] = useState(false); //.. Cache carregou mas falhou
  const [loadingHDImage, setLoadingHDImage] = useState(false); //.... Carregando imagem HD em background

  // ========================================
  // Calcular dimensoes do container de chat
  // ========================================
  const chatWidth = screenWidth - 24;     //......Largura util do chat

  // ========================================
  // Calcular largura maxima da imagem
  // ========================================
  const maxImageWidth = Math.max(
    chatWidth * WIDTH_PERCENTAGE,         //......70% da largura do chat
    MIN_WIDTH                             //......Minimo 150px
  );

  // ========================================
  // Calcular altura maxima da imagem
  // Proporcao 1.15: baseado no WhatsApp oficial
  // - Portrait 0.75 fica com ~86% da largura do landscape
  // - Portrait 0.56 fica com ~64% da largura do landscape
  // ========================================
  const maxHeightFromViewport = screenHeight * MAX_HEIGHT_PERCENTAGE;
  const maxHeightFromRatio = maxImageWidth * 1.15; //.Proporcao 1.15
  const maxImageHeight = Math.max(
    Math.min(maxHeightFromViewport, maxHeightFromRatio),
    MIN_HEIGHT                            //......Minimo 100px
  );

  // ========================================
  // Detectar aspect ratio da imagem
  // IMPORTANTE: Priorizar dimensoes do content quando disponiveis
  // Thumbnails do WhatsApp podem ser quadrados/distorcidos (ex: 72x72)
  // ========================================
  useEffect(() => {
    // Se tem dimensoes do content, usar (mais confiavel que thumbnail)
    if (hasContentDimensions) {
      const contentRatio = content.width / content.height;
      console.log('[ImageMessage] Usando dimensoes do CONTENT:', content.width, 'x', content.height, '=', contentRatio.toFixed(3));
      setAspectRatio(contentRatio);
      return;
    }

    // Se NAO tem dimensoes do content, detectar via thumbnail/url
    const imageUri = content.thumbnail || localImageUrl || content.url;
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          if (height > 0) {
            const newRatio = width / height;
            console.log('[ImageMessage] Detectado via Image.getSize:', width, 'x', height, '=', newRatio.toFixed(3));
            setAspectRatio(newRatio);
          }
        },
        (error) => {
          console.log('[ImageMessage] Image.getSize ERRO:', error);
        }
      );
    }
  }, [content.width, content.height, content.thumbnail, content.url, localImageUrl, hasContentDimensions]);

  // ========================================
  // Calcular largura minima (30% do chat)
  // ========================================
  const minBubbleWidth = chatWidth * 0.30;

  // ========================================
  // Calcular dimensoes finais da imagem (Padrao WhatsApp 2026)
  // Algoritmo oficial:
  // - LANDSCAPE/SQUARE (ratio >= 1): prioriza largura maxima
  // - PORTRAIT (ratio < 1): largura FIXA, altura proporcional
  // - Imagem NUNCA e cortada, sempre exibida inteira
  // ========================================
  const calculateDimensions = useCallback(() => {
    let bubbleWidth: number;
    let bubbleHeight: number;

    // Largura FIXA para portraits (85% da maxWidth)
    // AJUSTE-LARGURA-PORTRAIT: Altere este valor para ajustar largura das imagens verticais
    const PORTRAIT_WIDTH_RATIO = 0.85;

    if (aspectRatio >= 1.0) {
      // LANDSCAPE ou QUADRADO: prioriza largura maxima
      bubbleWidth = maxImageWidth;
      bubbleHeight = maxImageWidth / aspectRatio;

      // Clamp: se altura exceder o maximo
      if (bubbleHeight > maxImageHeight) {
        bubbleHeight = maxImageHeight;
        bubbleWidth = maxImageHeight * aspectRatio;
      }
    } else {
      // PORTRAIT: largura FIXA para todos os portraits
      bubbleWidth = maxImageWidth * PORTRAIT_WIDTH_RATIO;
      bubbleHeight = bubbleWidth / aspectRatio;

      // DEBUG: Log para verificar calculo proporcional
      console.log(`[ImageMessage] PORTRAIT - ratio=${aspectRatio.toFixed(3)} | largura=${bubbleWidth.toFixed(0)}px | altura=${bubbleHeight.toFixed(0)}px | maxH=${maxImageHeight.toFixed(0)}px`);

      // Clamp: se altura exceder o maximo
      if (bubbleHeight > maxImageHeight) {
        console.log(`[ImageMessage] CLAMP altura: ${bubbleHeight.toFixed(0)}px -> ${maxImageHeight.toFixed(0)}px`);
        bubbleHeight = maxImageHeight;
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
  }, [maxImageWidth, maxImageHeight, aspectRatio]);

  const dimensions = calculateDimensions();

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
  // Handler de Load - Imagem principal carregou
  // ========================================
  const handleLoad = useCallback(() => {
    console.log('[ImageMessage] SUCESSO - Imagem carregou! URL:', (localImageUrl || content.url)?.substring(0, 50) + '...');
    setIsLoading(false); //................... Remove loading
    setMainImageReady(true); //............... Marca imagem principal pronta
  }, [localImageUrl, content.url]);

  // ========================================
  // Efeito: Carregar imagem HD em background quando usando thumbnail
  // Mostra thumbnail imediatamente, depois substitui pela imagem HD
  // ========================================
  useEffect(() => {
    // Se esta usando thumbnail E ainda nao tentou Evolution API
    if (usingFallback && !loadingHDImage && !triedEvolutionApi && messageKey && instanceName) {
      console.log('[ImageMessage] Iniciando download HD em background...');
      setLoadingHDImage(true);

      // Buscar imagem HD via Evolution API
      (async () => {
        try {
          // Primeiro verificar cache local
          const cachedUrl = await mediaStorageService.getMedia(content.url);
          if (cachedUrl && cachedUrl.startsWith('data:image/')) {
            const commaIdx = cachedUrl.indexOf(',');
            const base64Length = commaIdx > 0 ? cachedUrl.length - commaIdx - 1 : 0;
            if (base64Length > 10000) { // Cache valido > 10KB
              console.log('[ImageMessage] HD do cache:', base64Length, 'chars');
              setLocalImageUrl(cachedUrl);
              setUsingFallback(false);
              setTriedEvolutionApi(true);
              return;
            }
          }

          // Se nao tem cache, buscar via Evolution API
          console.log('[ImageMessage] Buscando HD via Evolution API...');
          const apiStart = Date.now();
          const mediaData = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
          console.log('[ImageMessage] Evolution API HD respondeu em ' + (Date.now() - apiStart) + 'ms');

          if (mediaData && mediaData.base64) {
            let mimeType = mediaData.mimeType || 'image/jpeg';
            if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
              mimeType = 'image/jpeg';
            }

            let base64Data = mediaData.base64;
            if (base64Data.startsWith('data:')) {
              const commaIndex = base64Data.indexOf(',');
              if (commaIndex !== -1) {
                base64Data = base64Data.substring(commaIndex + 1);
              }
            }

            const dataUri = `data:${mimeType};base64,${base64Data}`;
            console.log('[ImageMessage] HD pronto! Tamanho:', dataUri.length, 'chars');

            // Salvar no cache
            mediaStorageService.saveMedia(content.url, dataUri, mimeType).catch(() => {});

            // Substituir thumbnail pela imagem HD
            setLocalImageUrl(dataUri);
            setUsingFallback(false);
            setTriedEvolutionApi(true);
          } else {
            console.log('[ImageMessage] Evolution API retornou vazio para HD');
            setTriedEvolutionApi(true);
          }
        } catch (err) {
          console.error('[ImageMessage] Erro ao buscar HD:', err);
          setTriedEvolutionApi(true);
        }
      })();
    }
  }, [usingFallback, loadingHDImage, triedEvolutionApi, messageKey, instanceName, content.url]);

  // ========================================
  // Handler de Erro - Tenta fallback, cache local e Evolution API
  // URLs do WhatsApp (mmg.whatsapp.net) expiram apos algumas horas
  // ========================================
  const handleError = useCallback(async () => {
    const startTime = Date.now(); //.............. Tempo inicial para medir performance
    console.log('[ImageMessage] ========== ERRO ==========');
    console.log('[ImageMessage] Timestamp:', new Date().toISOString());
    console.log('[ImageMessage] URL tentada:', (localImageUrl || content.url)?.substring(0, 80) + '...');
    console.log('[ImageMessage] Thumbnail:', !!content.thumbnail, '| Fallback:', usingFallback);
    console.log('[ImageMessage] Estados: cache=' + triedLocalCache + ', api=' + triedEvolutionApi + ', cacheFailed=' + cacheLoadFailed);
    console.log('[ImageMessage] Evolution: key=' + !!messageKey + ', instance=' + instanceName);

    // Passo 1: Tentar thumbnail como fallback
    if (!usingFallback && content.thumbnail && content.thumbnail !== content.url) {
      console.log('[ImageMessage] Passo 1: Thumbnail fallback (+' + (Date.now() - startTime) + 'ms)');
      setUsingFallback(true);
      setIsLoading(true);
      return;
    }

    // Se estamos usando cache local e ele falhou, pular para Evolution API
    if (localImageUrl && !cacheLoadFailed) {
      console.log('[ImageMessage] Cache local foi carregado mas falhou ao exibir');
      setCacheLoadFailed(true);
      setLocalImageUrl(null);
      // Continua para Evolution API abaixo
    }

    // Passo 2: Tentar cache local se URL for externa (e cache nao falhou antes)
    if (!triedLocalCache && !cacheLoadFailed && content.url?.startsWith('http')) {
      console.log('[ImageMessage] Passo 2: Cache local... (+' + (Date.now() - startTime) + 'ms)');
      setTriedLocalCache(true);

      try {
        const cachedUrl = await mediaStorageService.getMedia(content.url);
        if (cachedUrl) {
          // Verificar se o cache tem mimeType válido para imagem
          if (cachedUrl.startsWith('data:application/octet-stream') ||
              (!cachedUrl.startsWith('data:image/') && cachedUrl.startsWith('data:'))) {
            console.log('[ImageMessage] Cache local tem mimeType inválido, ignorando...');
            // Não usar cache corrompido, continuar para Evolution API
          } else {
            // Validacao extra: base64 muito pequeno = dados corrompidos
            // Uma imagem minimamente valida tem pelo menos 1KB de dados
            const commaIdx = cachedUrl.indexOf(',');
            const base64Length = commaIdx > 0 ? cachedUrl.length - commaIdx - 1 : 0;
            if (base64Length < 1000) {
              console.log('[ImageMessage] Cache local muito pequeno (' + base64Length + ' chars), ignorando...');
              // Cache corrompido, continuar para Evolution API
            } else {
              console.log('[ImageMessage] Cache local valido! Tamanho:', base64Length, 'chars');
              setLocalImageUrl(cachedUrl);
              setUsingFallback(false);
              setIsLoading(true);
              return;
            }
          }
        } else {
          console.log('[ImageMessage] Cache local NAO encontrado');
        }
      } catch (cacheError) {
        console.error('[ImageMessage] Erro ao buscar cache:', cacheError);
      }
    }

    // Passo 3: Tentar Evolution API se tem messageKey e instanceName
    if (!triedEvolutionApi && messageKey && instanceName) {
      console.log('[ImageMessage] Passo 3: Evolution API... (+' + (Date.now() - startTime) + 'ms)');
      setTriedEvolutionApi(true);
      setIsLoading(true);

      try {
        const apiStart = Date.now();
        const mediaData = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
        console.log('[ImageMessage] Evolution API respondeu em ' + (Date.now() - apiStart) + 'ms');

        if (mediaData && mediaData.base64) {
          console.log('[ImageMessage] Base64:', mediaData.base64.length, 'chars, mimeType:', mediaData.mimeType);

          // CORREÇÃO: Forçar image/jpeg se mimeType for genérico
          let mimeType = mediaData.mimeType || 'image/jpeg';
          if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
            console.log('[ImageMessage] mimeType corrigido:', mimeType, '->', 'image/jpeg');
            mimeType = 'image/jpeg';
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
          console.log('[ImageMessage] DataURI pronto, salvando cache... (+' + (Date.now() - startTime) + 'ms)');

          // Salva no cache
          mediaStorageService.saveMedia(content.url, dataUri, mimeType).catch(err => {
            console.error('[ImageMessage] Erro ao salvar cache:', err);
          });

          setLocalImageUrl(dataUri);
          setUsingFallback(false);
          setHasError(false);
          console.log('[ImageMessage] SUCESSO via Evolution API! Total: ' + (Date.now() - startTime) + 'ms');
          return;
        }
        console.log('[ImageMessage] Evolution API retornou VAZIO');
      } catch (apiError) {
        console.error('[ImageMessage] Evolution API ERRO:', apiError);
      }
    } else {
      console.log('[ImageMessage] Evolution API BLOQUEADA - key=' + !!messageKey + ', instance=' + !!instanceName);
    }

    console.log('[ImageMessage] FALHOU - Todas tentativas esgotadas (+' + (Date.now() - startTime) + 'ms)');
    setIsLoading(false);
    setHasError(true);
  }, [usingFallback, content.thumbnail, content.url, triedLocalCache, triedEvolutionApi, messageKey, instanceName, localImageUrl, cacheLoadFailed]);

  // ========================================
  // Render de Erro
  // ========================================
  if (hasError) {
    return (
      <View style={[styles.wrapper, isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming]}>
        <View
          style={[
            styles.container,
            styles.errorContainer,
            {
              width: dimensions.width - 6,
              height: dimensions.height - 6,
              backgroundColor: isOutgoing ? ChatColors.chatBackground : '#FFFFFF',
            },
          ]}
        >
          <Text style={styles.errorText}>
            Erro ao carregar imagem
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
      {/* Container da Imagem */}
      <Pressable
        style={[
          styles.container,
          {
            width: dimensions.width - 6,
            height: dimensions.height - 6,
          },
        ]}
        onPress={onPress}
        onLongPress={() => onLongPress?.(0)}  //......Posicao Y capturada no pai
      >
        {/* Thumbnail como background (exibicao instantanea) */}
        {hasThumbnail && !mainImageReady && (
          <Image
            source={{ uri: content.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Imagem principal - Carrega por cima do thumbnail */}
        <Image
          source={{ uri: localImageUrl || (usingFallback ? content.thumbnail : (content.url || content.thumbnail)) }}
          style={[styles.image, !mainImageReady && hasThumbnail && styles.imageHidden]}
          resizeMode="cover"
          onLoad={handleLoad}
          onError={handleError}
        />

        {/* Loading - Apenas se NAO tem thumbnail */}
        {isLoading && !hasThumbnail && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={isOutgoing ? ChatColors.white : ChatColors.voiceButton}
            />
          </View>
        )}

        {/* Container padronizado de Horario + Status */}
        <View style={
          isOutgoing
            ? (timestampStyle === 'container' ? styles.timeContainer : styles.timeContainerGradient)
            : styles.timeContainerIncoming
        }>
          {/* Hora */}
          <Text style={
            isOutgoing
              ? (timestampStyle === 'container' ? styles.timeText : styles.timeTextDark)
              : styles.timeTextIncoming
          }>
            {formattedTime}
          </Text>

          {/* Status (checks) - apenas outgoing */}
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
export default ImageMessage;

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

  // Container principal da imagem
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
  },

  // Texto de erro
  errorText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 12,                         //......Tamanho fonte
    color: ChatColors.timestamp,          //......Cor cinza
    textAlign: 'center',                  //......Alinhamento centro
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
    backgroundColor: ChatColors.divider,  //......Fundo
    zIndex: 1,                            //......Acima da imagem
  },

  // Imagem que preenche o container
  image: {
    position: 'absolute',                 //......Posicao absoluta para empilhar
    top: 0,                               //......Alinha topo
    left: 0,                              //......Alinha esquerda
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
  },

  // Imagem oculta enquanto carrega (evita flickering)
  imageHidden: {
    opacity: 0,                           //......Invisivel enquanto carrega
  },

  // Container padronizado de Horario + Status (canto inferior direito)
  // AJUSTE MANUAL: Altere paddingTop/paddingBottom para centralizar verticalmente
  // AJUSTE-GAP-CONTAINER: Altere gap para mudar espaco entre hora e check
  // AJUSTE-MARGEM-DIREITA-CHECK: Altere paddingRight para mudar margem direita do check
  timeContainer: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Encosta na borda do container
    right: 0,                             //......Encosta na borda do container
    paddingTop: 6,                        //......AJUSTE: Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: 'rgba(252, 252, 252, 0.8)', //..Fundo branco 80%
    borderTopLeftRadius: 12,              //......Arredonda canto superior esquerdo
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......AJUSTE: Espaco entre hora e check (padrao: 2)
  },

  // Container de Horario para incoming (fundo branco solido, sem check)
  timeContainerIncoming: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Encosta na borda do container
    right: 0,                             //......Encosta na borda do container
    paddingTop: 6,                        //......Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 7,                      //......Padding direito
    backgroundColor: '#FFFFFF',           //......Fundo branco solido
    borderTopLeftRadius: 8,               //......Curvatura menor para preencher o canto
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
  },

  // Texto do tempo incoming (cinza padrao do sistema)
  timeTextIncoming: {
    color: '#667781',                     //......Cinza padrao do sistema
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
    lineHeight: 12,                       //......Altura linha = tamanho fonte
  },

  // Texto do tempo (preto sobre fundo branco)
  // AJUSTE MANUAL: Altere lineHeight para alinhar verticalmente
  timeText: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
    lineHeight: 12,                       //......AJUSTE: Altura linha = tamanho fonte
  },

  // Texto do tempo branco (modo transparente - outgoing)
  timeTextWhite: {
    color: '#FFFFFF',                     //......Cor branca
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
    lineHeight: 12,                       //......AJUSTE: Altura linha = tamanho fonte
  },

  // Texto do tempo escuro (Tema 3 - sobre fundo azul claro)
  timeTextDark: {
    color: '#667781',                     //......Cor cinza medio (igual checks)
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_400Regular',       //......Fonte regular (mais visivel)
    lineHeight: 12,                       //......AJUSTE: Altura linha = tamanho fonte
  },

  // Texto do tempo preto (modo transparente - incoming)
  timeTextBlack: {
    color: '#3A3F51',                     //......Cor preta
    fontSize: 12,                         //......Tamanho fonte
    fontFamily: 'Inter_300Light',         //......Fonte light padronizada
    lineHeight: 12,                       //......AJUSTE: Altura linha = tamanho fonte
  },

  // Container AZUL de Horario + Status (modo transparente para imagens)
  // Modo 1 e 2: Fundo azul solido
  // AJUSTE-GAP-TRANSPARENTE: Altere gap para mudar espaco entre hora e check
  // AJUSTE-MARGEM-DIREITA-CHECK-TRANSPARENTE: Altere paddingRight para mudar margem direita do check
  timeContainerBlue: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Encosta na borda do container
    right: 0,                             //......Encosta na borda do container
    paddingTop: 6,                        //......AJUSTE: Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: '#1777CF',           //......Fundo AZUL
    borderTopLeftRadius: 12,              //......Arredonda canto superior esquerdo
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......AJUSTE: Espaco entre hora e check (padrao: 2)
  },

  // Container de Horario + Status (Tema 3 - azul claro)
  // Mesmo formato do container azul, apenas cor de fundo diferente
  timeContainerGradient: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 0,                            //......Encosta na borda do container
    right: 0,                             //......Encosta na borda do container
    paddingTop: 6,                        //......AJUSTE: Padding superior
    paddingBottom: 4,                     //......Padding inferior
    paddingLeft: 10,                      //......Padding esquerdo
    paddingRight: 6,                      //......Padding direito
    backgroundColor: '#E0F0FF',           //......Fundo azul claro (igual cards tema 3)
    borderTopLeftRadius: 12,              //......Arredonda canto superior esquerdo
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'center',             //......Centraliza horizontal
    gap: 2,                               //......AJUSTE: Espaco entre hora e check (padrao: 2)
  },

  // Wrapper do icone de check para ajuste vertical independente
  // AJUSTE MANUAL: Altere marginTop para subir/descer o icone
  checkWrapper: {
    marginTop: -2,                        //......AJUSTE: Negativo = sobe | Positivo = desce
  },

  // Badge de Reacao no canto inferior direito
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
