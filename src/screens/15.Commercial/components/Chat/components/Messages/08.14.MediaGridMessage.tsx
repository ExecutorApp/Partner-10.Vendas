// ========================================
// Componente MediaGridMessage
// Grid de midias agrupadas estilo WhatsApp
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  memo,                                   //......Memoizacao
  useMemo,                                //......Hook de memo
  useCallback,                            //......Hook de callback
  useState,                               //......Hook de estado
  useRef,                                 //......Hook de referencia
  useEffect,                              //......Hook de efeito
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  Image,                                  //......Imagem
  Pressable,                              //......Pressable
  StyleSheet,                             //......Estilos
  Dimensions,                             //......Dimensoes da tela
  Platform,                               //......Plataforma
} from 'react-native';                    //......Biblioteca RN
import { Ionicons } from '@expo/vector-icons';

// ========================================
// Imports de Tipos
// ========================================
import {
  MediaGroupData,                         //......Dados do grupo
  MediaGroupItem,                         //......Item do grupo
  WhatsAppMessage,                        //......Mensagem
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
} from '../../types/08.types.whatsapp';
import { MessageStatus as StatusType } from '../../types/08.types.whatsapp';
import { TimestampStyle } from '../../10.00.LeadLolaSwipeContainer';

// ========================================
// Imports de Componentes
// ========================================
import MessageStatus from './08.08.MessageStatus';

// ========================================
// Imports de Servicos (cache + Evolution API)
// ========================================
import { evolutionService } from '../../../../services/evolutionService';
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Semaforo de concorrencia (module-level)
// Limita chamadas simultaneas a Evolution API
// ========================================
const MAX_CONCURRENT_API = 2;             //......Maximo chamadas simultaneas
let activeCalls = 0;                       //......Chamadas ativas
const apiQueue: Array<() => void> = [];    //......Fila de espera

const acquireSlot = (): Promise<void> => { //......Adquirir vaga
  if (activeCalls < MAX_CONCURRENT_API) {
    activeCalls++;
    return Promise.resolve();
  }
  return new Promise<void>(resolve => apiQueue.push(resolve));
};

const releaseSlot = () => {                //......Liberar vaga
  const next = apiQueue.shift();
  if (next) {
    next();                                //......Proximo da fila entra
  } else {
    activeCalls--;                         //......Reduz contador
  }
};

// ========================================
// Constantes de Layout
// ========================================
const GRID_GAP = 2;                       //......Gap entre celulas (px)
const WRAPPER_PADDING = 3;                //......Padding do wrapper (borda visual)
const BORDER_RADIUS = 12;                 //......Raio externo do wrapper
const WIDTH_PERCENTAGE = 0.72;            //......72% da largura do chat (igual ImageMessage)

// ========================================
// Interface de Props
// ========================================
interface MediaGridMessageProps {
  group: MediaGroupData;                  //......Dados do grupo de midias
  onImagePress?: (imageUrl: string, message?: WhatsAppMessage) => void;
  onVideoPress?: (videoUrl: string, message?: WhatsAppMessage) => void;
  onGroupPress?: (group: MediaGroupData) => void; //......Abre galeria do grupo
  onLongPress?: () => void;               //......Handler long press (menu contexto)
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  instanceName?: string;                  //......Nome instancia Evolution
}

// ========================================
// Funcao auxiliar: formatar duracao (MM:SS)
// ========================================
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ========================================
// Interface GridCell Props
// ========================================
interface GridCellProps {
  item: MediaGroupItem;                   //......Item de midia
  index: number;                          //......Indice no grid
  width: number;                          //......Largura do cell
  height: number;                         //......Altura do cell
  totalItems: number;                     //......Total de itens no grupo
  isOutgoing: boolean;                    //......Outgoing ou incoming
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  instanceName?: string;                  //......Nome instancia Evolution
  onPress: (resolvedUri: string) => void;  //......Handler de press (com URI resolvida)
  onLongPress?: () => void;               //......Handler long press
}

// ========================================
// Sub-componente GridCell
// Celula individual com carregamento e timestamp
// ========================================
const GridCell = memo<GridCellProps>(({
  item,
  index,
  width,
  height,
  totalItems,
  isOutgoing,
  timestampStyle,
  instanceName,
  onPress,
  onLongPress,
}) => {
  const content = item.message.content as ImageContent | VideoContent;
  const thumbnailUri = content.thumbnail;
  const mainUri = content.url;
  const messageKey = item.message.messageKey;
  const isVideo = item.type === 'video';
  const duration = isVideo ? (content as VideoContent).duration : undefined;
  const isLastWithMore = index === 3 && totalItems > 4;
  const extraCount = totalItems - 3;
  const showStatus = isOutgoing && !isLastWithMore;

  // ========================================
  // Estado de carregamento da imagem
  // ========================================
  const [imageUri, setImageUri] = useState(thumbnailUri || mainUri);
  const stepRef = useRef(0);              //......0=initial, 1=thumb, 2=cache, 3=api, 4=done

  // ========================================
  // Carregamento proativo: cache -> Evolution API (com semaforo)
  // Nao testa URL HTTP (expira e causa falsos positivos)
  // ========================================
  useEffect(() => {
    if (!mainUri?.startsWith('http')) return;

    let cancelled = false;               //......Flag de cancelamento

    (async () => {
      // Passo 1: Verificar cache local (sem semaforo, e rapido)
      try {
        const cached = await mediaStorageService.getMedia(mainUri);
        if (cached && cached.length > 1000 && !cancelled) {
          // Cache com MIME invalido = precisa re-download via API
          if (cached.startsWith('data:application/octet-stream') ||
              (!cached.startsWith('data:image/') && cached.startsWith('data:'))) {
            // Ignorar cache corrompido, continuar para API
          } else {
            setImageUri(cached);          //......Usar imagem do cache (MIME valido)
            stepRef.current = 3;          //......Pular fallbacks
            return;
          }
        }
      } catch {}

      // Passo 2: Buscar via Evolution API (com semaforo de concorrencia)
      if (messageKey && instanceName && !cancelled) {
        await acquireSlot();             //......Aguardar vaga na fila
        if (cancelled) { releaseSlot(); return; }

        try {
          const media = await evolutionService.getBase64FromMediaMessage(
            instanceName,
            messageKey,
          );
          if (media?.base64 && !cancelled) {
            let mimeType = media.mimeType || 'image/jpeg';
            if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
              mimeType = 'image/jpeg';   //......Forcar mimeType valido
            }
            let b64 = media.base64;
            if (b64.startsWith('data:')) {
              const ci = b64.indexOf(',');
              if (ci !== -1) b64 = b64.substring(ci + 1);
            }
            const dataUri = `data:${mimeType};base64,${b64}`;
            mediaStorageService.saveMedia(mainUri, dataUri, mimeType).catch(() => {});
            if (!cancelled) {
              setImageUri(dataUri);       //......Substituir thumbnail por HD
              stepRef.current = 3;        //......Marcar como resolvido
            }
          }
        } catch {}
        releaseSlot();                   //......Liberar vaga
      }
    })();

    return () => { cancelled = true; };  //......Limpar ao desmontar
  }, [mainUri, messageKey, instanceName]);

  // ========================================
  // Handler de erro com fallback chain
  // Cache local -> Evolution API
  // ========================================
  const handleImageError = useCallback(async () => {
    // Passo 1: Tentar thumbnail se estava usando URL
    if (stepRef.current < 1 && thumbnailUri && imageUri !== thumbnailUri) {
      stepRef.current = 1;
      setImageUri(thumbnailUri);
      return;
    }

    // Passo 2: Tentar cache local (ignora MIME invalido)
    if (stepRef.current < 2 && mainUri?.startsWith('http')) {
      stepRef.current = 2;
      try {
        const cached = await mediaStorageService.getMedia(mainUri);
        if (cached && cached.length > 1000 && cached.startsWith('data:image/')) {
          setImageUri(cached);            //......Cache com MIME valido
          return;
        }
      } catch {}
    }

    // Passo 3: Tentar Evolution API
    if (stepRef.current < 3 && messageKey && instanceName) {
      stepRef.current = 3;
      try {
        const media = await evolutionService.getBase64FromMediaMessage(
          instanceName,
          messageKey,
        );
        if (media?.base64) {
          let mimeType = media.mimeType || 'image/jpeg';
          if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
            mimeType = 'image/jpeg';
          }
          let b64 = media.base64;
          if (b64.startsWith('data:')) {
            const ci = b64.indexOf(',');
            if (ci !== -1) b64 = b64.substring(ci + 1);
          }
          const dataUri = `data:${mimeType};base64,${b64}`;
          mediaStorageService.saveMedia(mainUri, dataUri, mimeType).catch(() => {});
          setImageUri(dataUri);
          return;
        }
      } catch {}
    }

    // Todas as tentativas falharam
    stepRef.current = 4;
  }, [imageUri, thumbnailUri, mainUri, messageKey, instanceName]);

  // ========================================
  // Formatar hora individual da celula
  // ========================================
  const cellTime = useMemo(() =>
    item.message.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  [item.message.timestamp]);

  // ========================================
  // Estilo do timestamp conforme direcao
  // ========================================
  const timeContainerStyle = isOutgoing
    ? (timestampStyle === 'container' ? styles.cellTimeContainer : styles.cellTimeContainerGradient)
    : styles.cellTimeContainerIncoming;

  const timeTextStyle = isOutgoing
    ? (timestampStyle === 'container' ? styles.cellTimeText : styles.cellTimeTextDark)
    : styles.cellTimeTextIncoming;

  // ========================================
  // Render da Celula
  // ========================================
  return (
    <Pressable
      style={[styles.cell, { width, height }]}
      onPress={() => onPress(imageUri || mainUri || thumbnailUri || '')}
      onLongPress={() => onLongPress?.()}
      delayLongPress={400}
    >
      {/* Imagem/Thumbnail com fallback (blur na celula +N) */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.cellImage,
            isLastWithMore && Platform.OS === 'web' && {
              filter: 'blur(3px)',
              transform: [{ scale: 1.05 }],
            } as any,
          ]}
          resizeMode="cover"
          onError={handleImageError}
          blurRadius={isLastWithMore ? 3 : 0}
        />
      ) : null}

      {/* Icone play para videos */}
      {isVideo && !isLastWithMore && (
        <View style={styles.videoPlayIcon}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
        </View>
      )}

      {/* Badge de duracao para videos */}
      {isVideo && duration && duration > 0 && !isLastWithMore && (
        <View style={styles.videoDurationBadge}>
          <Text style={styles.videoDurationText}>
            {formatDuration(duration)}
          </Text>
        </View>
      )}

      {/* Overlay "+N" no 4o cell */}
      {isLastWithMore && (
        <View style={styles.moreOverlay}>
          <Text style={styles.moreText}>+{extraCount}</Text>
        </View>
      )}

      {/* Timestamp individual da celula (oculto no cell +N) */}
      {!isLastWithMore && (
        <View style={timeContainerStyle}>
          <Text style={timeTextStyle}>{cellTime}</Text>
          {showStatus && item.message.status && (
            <View style={styles.checkWrapper}>
              <MessageStatus
                status={item.message.status}
                isOutgoing={true}
                size={11}
                iconColor="#667781"
              />
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
});

// ========================================
// Componente Principal
// ========================================
const MediaGridMessage = memo<MediaGridMessageProps>(({
  group,
  onImagePress,
  onVideoPress,
  onGroupPress,
  onLongPress,
  timestampStyle,
  instanceName,
}) => {
  const isOutgoing = group.direction === 'outgoing';
  const totalItems = group.items.length;

  // ========================================
  // Resumo de Reacoes (emojis unicos + total)
  // ========================================
  const reactionSummary = useMemo(() => {
    const reactions: string[] = [];
    for (const item of group.items) {
      if (item.message.reaction) {
        reactions.push(item.message.reaction);
      }
    }
    if (reactions.length === 0) return null;
    // Emojis unicos mantendo ordem de aparicao
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const r of reactions) {
      if (!seen.has(r)) {
        seen.add(r);
        unique.push(r);
      }
    }
    return { emojis: unique, total: reactions.length };
  }, [group.items]);

  // Ref para callbacks (evita stale closures com FlatList memo)
  const onGroupPressRef = useRef(onGroupPress);
  onGroupPressRef.current = onGroupPress;
  const onImagePressRef = useRef(onImagePress);
  onImagePressRef.current = onImagePress;
  const onVideoPressRef = useRef(onVideoPress);
  onVideoPressRef.current = onVideoPress;

  // ========================================
  // Calculos de Dimensao
  // ========================================
  const { innerWidth, cellSize } = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const chatWidth = screenWidth - 24;
    const cw = Math.floor(chatWidth * WIDTH_PERCENTAGE);
    const iw = cw - (WRAPPER_PADDING * 2);
    const cs = Math.floor((iw - GRID_GAP) / 2);
    return { innerWidth: iw, cellSize: cs };
  }, []);

  // ========================================
  // Handler de tap em celula
  // Se onGroupPress existe, abre galeria ao inves do viewer individual
  // ========================================
  const handleCellPress = useCallback((item: MediaGroupItem, resolvedUri: string) => {
    if (onGroupPressRef.current) {
      onGroupPressRef.current(group);
      return;
    }
    if (item.type === 'image') {
      onImagePressRef.current?.(resolvedUri, item.message);
    } else {
      onVideoPressRef.current?.(resolvedUri, item.message);
    }
  }, [group]);

  // ========================================
  // Renderiza celula via GridCell
  // ========================================
  const renderCell = (
    item: MediaGroupItem,
    index: number,
    w: number,
    h: number,
  ) => {
    return (
      <GridCell
        key={item.message.id}
        item={item}
        index={index}
        width={w}
        height={h}
        totalItems={totalItems}
        isOutgoing={isOutgoing}
        timestampStyle={timestampStyle}
        instanceName={instanceName}
        onPress={(resolvedUri: string) => handleCellPress(item, resolvedUri)}
        onLongPress={onLongPress}
      />
    );
  };

  // ========================================
  // Renderiza grid conforme quantidade
  // ========================================
  const renderGrid = () => {
    // 2 itens: lado a lado
    if (totalItems === 2) {
      return (
        <View style={styles.row}>
          {renderCell(group.items[0], 0, cellSize, cellSize)}
          {renderCell(group.items[1], 1, cellSize, cellSize)}
        </View>
      );
    }

    // 3 itens: 1 wide no topo + 2 embaixo
    if (totalItems === 3) {
      return (
        <>
          {renderCell(group.items[0], 0, innerWidth, cellSize)}
          <View style={{ height: GRID_GAP }} />
          <View style={styles.row}>
            {renderCell(group.items[1], 1, cellSize, cellSize)}
            {renderCell(group.items[2], 2, cellSize, cellSize)}
          </View>
        </>
      );
    }

    // 4+ itens: grade 2x2
    return (
      <>
        <View style={styles.row}>
          {renderCell(group.items[0], 0, cellSize, cellSize)}
          {renderCell(group.items[1], 1, cellSize, cellSize)}
        </View>
        <View style={{ height: GRID_GAP }} />
        <View style={styles.row}>
          {renderCell(group.items[2], 2, cellSize, cellSize)}
          {renderCell(group.items[3], 3, cellSize, cellSize)}
        </View>
      </>
    );
  };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={[
      styles.wrapper,
      isOutgoing ? styles.wrapperOutgoing : styles.wrapperIncoming,
      reactionSummary && styles.wrapperWithReaction,
    ]}>
      {/* Container do Grid */}
      <View style={[styles.gridContainer, { width: innerWidth }]}>
        {renderGrid()}
      </View>

      {/* Resumo de Reacoes (flutuante, igual badge dos outros cards) */}
      {reactionSummary && (
        <View style={styles.reactionBar}>
          {reactionSummary.emojis.map((emoji, i) => (
            <Text key={i} style={styles.reactionEmoji}>{emoji}</Text>
          ))}
          <Text style={styles.reactionCount}>{reactionSummary.total}</Text>
        </View>
      )}
    </View>
  );
});

// ========================================
// Export Default
// ========================================
export default MediaGridMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Wrapper externo (posicao relativa para reacao flutuante)
  wrapper: {
    position: 'relative',                 //......Posicao relativa
    overflow: 'visible',                  //......Permite reacao flutuante fora dos limites
  },

  // Margem inferior quando tem reacao (igual ImageMessage/VideoMessage)
  wrapperWithReaction: {
    marginBottom: 25,                     //......Margem inferior para reacao
  },

  // Wrapper outgoing (borda visual azul clara)
  wrapperOutgoing: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#C8E4FF',
    padding: WRAPPER_PADDING,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 3px rgba(0,0,0,0.18)' } as any
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.18,
          shadowRadius: 3,
          elevation: 2,
        }),
  },

  // Wrapper incoming (borda visual branca)
  wrapperIncoming: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    padding: WRAPPER_PADDING,
  },

  // Container do grid (clip do conteudo)
  gridContainer: {
    borderRadius: BORDER_RADIUS - WRAPPER_PADDING,
    overflow: 'hidden',
  },

  // Linha do grid (2 celulas lado a lado)
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },

  // Celula individual
  cell: {
    overflow: 'hidden',                   //......Corta overflow
    backgroundColor: '#EDEFF3',           //......Fundo fallback enquanto carrega
    ...(Platform.OS === 'web'
      ? { userSelect: 'none', WebkitUserDrag: 'none' } as any
      : {}),
  },

  // Imagem que preenche a celula
  cellImage: {
    position: 'absolute',                //......Preenche a celula
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
    ...(Platform.OS === 'web'
      ? { pointerEvents: 'none' } as any
      : {}),
  },

  // Icone play para videos (centralizado no cell)
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -14,
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },

  // Badge de duracao do video (inferior esquerdo do cell)
  videoDurationBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    zIndex: 5,
  },

  // Texto da duracao
  videoDurationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 12,
  },

  // Overlay "+N" escuro no 4o cell
  moreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Texto "+N"
  moreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
  },

  // ========================================
  // Timestamp por Celula (outgoing - container)
  // ========================================
  cellTimeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingTop: 4,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 5,
    backgroundColor: 'rgba(252, 252, 252, 0.8)',
    borderTopLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  // ========================================
  // Timestamp por Celula (outgoing - gradient)
  // ========================================
  cellTimeContainerGradient: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingTop: 4,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 5,
    backgroundColor: 'rgba(224, 240, 255, 0.85)',
    borderTopLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  // ========================================
  // Timestamp por Celula (incoming)
  // ========================================
  cellTimeContainerIncoming: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingTop: 4,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Texto do tempo outgoing (container)
  cellTimeText: {
    color: '#3A3F51',
    fontSize: 11,
    fontFamily: 'Inter_300Light',
    lineHeight: 11,
  },

  // Texto do tempo outgoing (gradient)
  cellTimeTextDark: {
    color: '#667781',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 11,
  },

  // Texto do tempo incoming
  cellTimeTextIncoming: {
    color: '#667781',
    fontSize: 11,
    fontFamily: 'Inter_300Light',
    lineHeight: 11,
  },

  // Wrapper do check
  checkWrapper: {
    marginTop: -2,
  },

  // ========================================
  // Barra de Resumo de Reacoes
  // ========================================

  // Container da barra de reacoes (flutuante, igual reactionBadge dos outros cards)
  reactionBar: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -20,                          //......Abaixo do container (igual ImageMessage)
    right: 10,                            //......Alinha direita (igual ImageMessage)
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',           //......Fundo branco (igual ImageMessage)
    borderRadius: 8,                      //......Bordas arredondadas
    paddingHorizontal: 6,                 //......Padding horizontal
    paddingVertical: 2,                   //......Padding vertical
    gap: 2,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.2)' } as any
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        }),
    zIndex: 10,                           //......Camada superior
  },

  // Emoji individual na barra
  reactionEmoji: {
    fontSize: 16,                         //......Mesmo tamanho dos outros cards
  },

  // Contagem total
  reactionCount: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#667781',
    marginLeft: 2,
  },
});
