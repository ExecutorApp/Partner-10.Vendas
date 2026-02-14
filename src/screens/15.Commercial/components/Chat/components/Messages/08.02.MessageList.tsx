// ========================================
// Componente MessageList
// Lista de mensagens do chat
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useRef,                                 //......Hook de ref
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useMemo,                                //......Hook de memo
  useEffect,                              //......Hook de efeito
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  FlatList,                               //......Lista performatica
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  ListRenderItem,                         //......Tipo render item
  LayoutChangeEvent,                      //......Evento de layout
  NativeSyntheticEvent,                   //......Evento sintetico
  NativeScrollEvent,                      //......Evento de scroll
  Platform,                               //......Plataforma
  Pressable,                              //......Toque
  Animated,                               //......Animacoes
} from 'react-native';                    //......Biblioteca RN

// ========================================
// Imports de Icones SVG
// ========================================
import Svg, { Path, Circle, Line } from 'react-native-svg';

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Componentes
// ========================================
import MessageBubble from './08.03.MessageBubble';
import TextMessage from './08.04.TextMessage';
import AudioMessage from './08.05.AudioMessage';
import ImageMessage from './08.06.ImageMessage';
import VideoMessage from './08.11.VideoMessage';
import DocumentMessage from './08.07.DocumentMessage';
import DateDivider from './08.09.DateDivider';
import DeletedMessage from './08.10.DeletedMessage';
import MediaGridMessage from './08.14.MediaGridMessage';

// ========================================
// Imports de Funcoes de Data
// ========================================
import { formatMessageDate } from '../../data/08.mockMessages';
import SwipeableMessage from './08.13.SwipeableMessage';

// ========================================
// Imports de Tipos
// ========================================
import {                                  //......Tipos
  WhatsAppMessage,                        //......Interface mensagem
  TextContent,                            //......Conteudo texto
  AudioContent,                           //......Conteudo audio
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
  DocumentContent,                        //......Conteudo documento
  MediaGroupData,                         //......Dados grupo de midias
  MediaGroupItem,                         //......Item grupo de midias
} from '../../types/08.types.whatsapp';   //......Arquivo de tipos

// ========================================
// Imports de Tipo TimestampStyle
// ========================================
import { TimestampStyle } from '../../10.00.LeadLolaSwipeContainer';

// ========================================
// Interface de Props
// ========================================
// Dados de transcricao por mensagem
interface TranscriptionData {
  text: string;                           //......Texto transcrito
  isLoading: boolean;                     //......Em processo
}

interface MessageListProps {
  messages: WhatsAppMessage[];            //......Lista de mensagens
  onMessageLongPress?: (message: WhatsAppMessage, pageY: number) => void;
  onReplyPress?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  onImagePress?: (imageUrl: string, message?: WhatsAppMessage) => void;
  onVideoPress?: (videoUrl: string, message?: WhatsAppMessage) => void;
  onAudioRetry?: (message: WhatsAppMessage) => Promise<boolean>;
  onForwardPress?: (url: string) => void; //......Handler encaminhar URL
  onSwipeReply?: (message: WhatsAppMessage) => void;
  onMediaGroupPress?: (group: MediaGroupData) => void; //......Handler abrir galeria do grupo
  onMediaGroupLongPress?: (group: MediaGroupData) => void; //......Handler long press galeria
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  instanceName?: string;                  //......Nome instancia Evolution
  transcriptions?: Record<string, TranscriptionData>; //......Transcricoes por messageId
}

// ========================================
// Constantes de Espacamento
// AJUSTE-ESPACAMENTO: Altere os valores para ajustar espacamento entre mensagens
// ========================================
const SPACING_SAME_SENDER = 6;            //......Espacamento mesmo remetente (6px)
const SPACING_DIFFERENT_SENDER = 15;      //......Espacamento remetente diferente (15px)
const GROUPING_THRESHOLD = 60;            //......Threshold de agrupamento de midia (60 segundos)

// ========================================
// Interface de Item com Divider
// ========================================
interface ListItem {
  type: 'message' | 'divider' | 'mediaGroup'; //......Tipo do item
  data: WhatsAppMessage | Date | MediaGroupData; //......Dados
  id: string;                             //......ID unico
  spacing: number;                        //......Espacamento pre-calculado (marginBottom)
}

// ========================================
// Verifica se midia tem URL invalida (expirada ou corrompida)
// Retorna true APENAS se nao tem URL nem thumbnail
// URLs externas sao permitidas pois o componente usa thumbnail como fallback
// ========================================
const hasInvalidMediaUrl = (message: WhatsAppMessage): boolean => {
  // Verifica se eh mensagem de midia
  if (message.type !== 'image' && message.type !== 'video') {
    return false; //................................. Nao eh midia
  }

  const content = message.content as any; //........ Cast generico

  // Se tem thumbnail, SEMPRE permite (thumbnail serve como fallback)
  if (content?.thumbnail) {
    return false; //................................. Tem fallback
  }

  // Sem thumbnail - verifica se URL e valida
  if (!content?.url) {
    return true; //................................. Sem URL nem thumbnail = invalida
  }

  const url = content.url as string; //............. URL da midia

  // blob: URLs sao midias locais durante upload (OK)
  if (url.startsWith('blob:')) {
    return false; //..... Midia em upload
  }

  // Se URL comeca com data: verifica se tem MIME type valido
  if (url.startsWith('data:')) {
    // Mídias corrompidas têm MIME type genérico (download falhou)
    if (url.startsWith('data:application/octet-stream')) {
      return true; //....... Dados corrompidos
    }
    // MIME type válido (image/jpeg, video/mp4, etc)
    return false; //..... Midia local valida
  }

  // URL externa (http) - permitir pois componente tenta carregar e usa fallback
  if (url.startsWith('http')) {
    return false; //..... Permite, componente trata erro
  }

  // URL vazia ou formato desconhecido sem thumbnail
  return true; //................................. Padrao: invalida
};

// ========================================
// Funcao para agrupar por data
// ========================================
const groupMessagesByDate = (messages: WhatsAppMessage[]): ListItem[] => {
  const items: ListItem[] = [];           //......Lista de itens
  let lastDate: string | null = null;     //......Ultima data

  // DEDUP: Garantir que nao ha mensagens duplicadas por ID
  const uniqueMap = new Map<string, WhatsAppMessage>();
  messages.forEach(msg => {
    // Se ja existe, manter a versao mais completa (com thumbnail)
    const existing = uniqueMap.get(msg.id);
    if (!existing) {
      uniqueMap.set(msg.id, msg);
    } else {
      // Manter versao com mais dados (thumbnail, messageKey)
      const newHasThumbnail = !!(msg.content as any)?.thumbnail;
      const existingHasThumbnail = !!(existing.content as any)?.thumbnail;
      const newHasMessageKey = !!msg.messageKey;
      const existingHasMessageKey = !!existing.messageKey;
      if ((newHasThumbnail && !existingHasThumbnail) || (newHasMessageKey && !existingHasMessageKey)) {
        uniqueMap.set(msg.id, msg);
      }
    }
  });
  const dedupedMessages = Array.from(uniqueMap.values());

  // Filtrar midias com URLs invalidas (expiradas ou corrompidas)
  const filtered = dedupedMessages.filter(msg => !hasInvalidMediaUrl(msg));

  // Ordenar por timestamp
  const sorted = [...filtered].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // ========================================
  // Agrupamento de midias consecutivas (album WhatsApp)
  // ========================================
  let currentMediaGroup: WhatsAppMessage[] = [];
  let lastMediaTimestamp = 0;
  let lastMediaSenderId = '';
  let lastMediaDirection = '';

  // Verifica se mensagem pode ser agrupada
  const isGroupableMedia = (msg: WhatsAppMessage): boolean => {
    if (msg.type !== 'image' && msg.type !== 'video') return false;
    if (msg.viewOnce) return false;
    const content = msg.content as any;
    if (content?.caption) return false;
    return true;
  };

  // Flush do grupo de midias acumulado
  const flushMediaGroup = () => {
    if (currentMediaGroup.length === 0) return;

    if (currentMediaGroup.length === 1) {
      // Grupo de 1: emite como mensagem individual
      const msg = currentMediaGroup[0];
      items.push({
        type: 'message',
        data: msg,
        id: msg.id,
        spacing: SPACING_SAME_SENDER,
      });
    } else {
      // Grupo de 2+: emite como mediaGroup
      const groupItems: MediaGroupItem[] = currentMediaGroup.map(msg => ({
        message: msg,
        type: msg.type as 'image' | 'video',
      }));
      const lastMsg = currentMediaGroup[currentMediaGroup.length - 1];
      const groupData: MediaGroupData = {
        id: `mediagroup-${currentMediaGroup[0].id}`,
        items: groupItems,
        direction: lastMsg.direction,
        lastTimestamp: lastMsg.timestamp,
        lastStatus: lastMsg.status,
        senderId: lastMsg.senderId,
      };
      items.push({
        type: 'mediaGroup',
        data: groupData,
        id: groupData.id,
        spacing: SPACING_SAME_SENDER,
      });
    }
    currentMediaGroup = [];
  };

  sorted.forEach((message) => {
    const dateStr = message.timestamp.toDateString();

    // Adicionar divider se data mudou
    if (dateStr !== lastDate) {
      flushMediaGroup();                  //......Flush antes do divider
      items.push({
        type: 'divider',                  //......Tipo divider
        data: message.timestamp,          //......Data do divider
        id: `divider-${dateStr}`,         //......ID unico
        spacing: 0,                       //......Sem espacamento para dividers
      });
      lastDate = dateStr;                 //......Atualiza ultima
    }

    // Verificar se eh midia agrupavel
    if (isGroupableMedia(message)) {
      const msgTime = message.timestamp.getTime();

      if (
        currentMediaGroup.length > 0 &&
        message.senderId === lastMediaSenderId &&
        message.direction === lastMediaDirection &&
        (msgTime - lastMediaTimestamp) <= GROUPING_THRESHOLD * 1000
      ) {
        // Adiciona ao grupo existente
        currentMediaGroup.push(message);
        lastMediaTimestamp = msgTime;
      } else {
        // Flush grupo anterior e inicia novo
        flushMediaGroup();
        currentMediaGroup = [message];
        lastMediaTimestamp = msgTime;
        lastMediaSenderId = message.senderId;
        lastMediaDirection = message.direction;
      }
    } else {
      // Nao e midia agrupavel: flush e emite individualmente
      flushMediaGroup();
      items.push({
        type: 'message',
        data: message,
        id: message.id,
        spacing: SPACING_SAME_SENDER,
      });
    }
  });

  // Flush final
  flushMediaGroup();

  return items;                           //......Retorna lista
};

// ========================================
// Type Guard para TextContent
// ========================================
const isTextContent = (content: unknown): content is TextContent => {
  return (
    typeof content === 'object' &&
    content !== null &&
    'text' in content &&
    typeof (content as TextContent).text === 'string'
  );
};

// ========================================
// Type Guard para AudioContent
// ========================================
const isAudioContent = (content: unknown): content is AudioContent => {
  return (
    typeof content === 'object' &&
    content !== null &&
    'duration' in content &&
    typeof (content as AudioContent).duration === 'number'
  );
};

// ========================================
// Type Guard para ImageContent
// Imagem nao tem mimeType (diferente de video)
// ========================================
const isImageContent = (content: unknown): content is ImageContent => {
  return (
    typeof content === 'object' &&
    content !== null &&
    'url' in content &&
    'width' in content &&
    'height' in content &&
    !('mimeType' in content) &&           //......Nao tem mimeType (diferencia de video)
    !('fileName' in content)              //......Nao e documento
  );
};

// ========================================
// Type Guard para VideoContent
// Video sempre tem mimeType quando enviado
// ========================================
const isVideoContent = (content: unknown): content is VideoContent => {
  return (
    typeof content === 'object' &&
    content !== null &&
    'url' in content &&
    'width' in content &&
    'height' in content &&
    'mimeType' in content &&              //......Tem mimeType (video)
    !('fileName' in content)              //......Nao e documento
  );
};

// ========================================
// Type Guard para DocumentContent
// ========================================
const isDocumentContent = (content: unknown): content is DocumentContent => {
  return (
    typeof content === 'object' &&
    content !== null &&
    'fileName' in content &&
    'fileSize' in content
  );
};

// ========================================
// Componente Principal MessageList
// ========================================
const MessageList: React.FC<MessageListProps> = ({
  messages,                               //......Lista mensagens
  onMessageLongPress,                     //......Long press handler
  onReplyPress,                           //......Reply press handler
  onScrollToMessage,                      //......Scroll to handler
  onImagePress,                           //......Image press handler
  onVideoPress,                           //......Video press handler
  onAudioRetry,                           //......Audio retry handler
  onForwardPress,                         //......Forward press handler
  onSwipeReply,                           //......Swipe reply handler
  onMediaGroupPress,                      //......Media group press handler
  onMediaGroupLongPress,                  //......Media group long press handler
  timestampStyle = 'container',           //......Estilo do timestamp
  instanceName,                           //......Nome instancia Evolution
  transcriptions,                         //......Transcricoes por messageId
}) => {
  // ========================================
  // Refs
  // ========================================
  const flatListRef = useRef<FlatList>(null);
  const isNearBottom = useRef(true);       //......Controle de auto-scroll
  const isInitialLoad = useRef(true);      //......Flag primeiro carregamento
  const lastContentHeight = useRef(0);     //......Ultima altura do conteudo
  const highlightedIdRef = useRef<string | null>(null);
  // ========================================
  // State de highlight para scroll ao reply
  // ========================================
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // ========================================
  // State e animacao do botao scroll-to-bottom
  // ========================================
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;

  // ========================================
  // State e animacao do header sticky de data
  // ========================================
  const [stickyDate, setStickyDate] = useState<string | null>(null);
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  const stickyDateRef = useRef<string | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);

  // ========================================
  // Viewability para rastrear data visivel no topo
  // IMPORTANTE: Deve ser ref estavel (nao pode mudar apos mount)
  // ========================================
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 10,  //......Item visivel com 10% na tela
      },
      onViewableItemsChanged: ({ viewableItems: items }: any) => {
        if (!items || items.length === 0) return;

        // Em lista invertida: item com maior index = visualmente mais no topo
        let topIndex = -1;
        let topDate: Date | null = null;

        for (const item of items) {
          if (item.index != null && item.index > topIndex) {
            topIndex = item.index;
            const listItem = item.item as ListItem;
            if (listItem.type === 'divider') {
              topDate = listItem.data as Date;
            } else if (listItem.type === 'message') {
              topDate = (listItem.data as WhatsAppMessage).timestamp;
            } else if (listItem.type === 'mediaGroup') {
              topDate = (listItem.data as MediaGroupData).lastTimestamp;
            }
          }
        }

        if (topDate) {
          stickyDateRef.current = formatMessageDate(topDate);
        }
      },
    },
  ]);

  // ========================================
  // Montagem do componente
  // ========================================
  useEffect(() => {
    const perfStart = (window as any).__PERF_KANBAN_START;
    if (perfStart) {
      console.log(`[PERF] MessageList Mount: ${Date.now() - perfStart}ms`);
    }
    return () => {
      // Limpar timer do sticky header ao desmontar
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // ========================================
  // Verificar duplicatas (apenas em dev)
  // ========================================
  useEffect(() => {
    // Verificar duplicatas silenciosamente
    const ids = messages.map(m => m.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.error('[MessageList] ERRO: IDs duplicados detectados');
    }
  }, [messages]);

  // ========================================
  // Handler de Layout
  // ========================================
  const handleFlatListLayout = useCallback((_event: LayoutChangeEvent) => {
    // Layout disponivel para uso futuro
  }, []);

  // ========================================
  // Handler de ContentSizeChange (para debug)
  // Com inverted={true}, nao precisa de scroll manual
  // ========================================
  const handleContentSizeChange = useCallback((w: number, h: number) => {
    // Evita log desnecessario se altura nao mudou
    if (h === lastContentHeight.current) return;
    lastContentHeight.current = h;         //......Atualiza altura
    // Lista invertida: scroll automatico para o final (topo invertido)
  }, []);

  // ========================================
  // Animacao do botao scroll-to-bottom
  // ========================================
  useEffect(() => {
    Animated.timing(scrollButtonOpacity, {
      toValue: showScrollButton ? 1 : 0,  //......Fade in/out
      duration: 200,                       //......Duracao da animacao
      useNativeDriver: true,               //......Driver nativo
    }).start();
  }, [showScrollButton]);

  // ========================================
  // Handler de Scroll
  // Rastreia posicao para controlar botao scroll-to-bottom
  // Com inverted={true}, "fundo" é o topo (offset 0)
  // ========================================
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    // Com lista invertida, "fundo" é quando offset está perto de 0
    const nearBottom = contentOffset.y < 100;        //......Threshold de 100px
    isNearBottom.current = nearBottom;               //......Atualiza ref
    setShowScrollButton(!nearBottom);                //......Mostra botao quando longe do fundo

    // ========================================
    // Sticky Date Header - Mostra/esconde durante scroll
    // ========================================
    // Nao mostrar quando perto do fundo (posicao inicial do chat)
    if (nearBottom) {
      if (isScrollingRef.current) {
        isScrollingRef.current = false;
        Animated.timing(stickyHeaderOpacity, {
          toValue: 0,                              //......Esconde header
          duration: 200,                           //......Fade out rapido
          useNativeDriver: true,
        }).start();
      }
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
      return;
    }

    // Atualizar data do header sticky
    const currentDate = stickyDateRef.current;
    if (currentDate) {
      setStickyDate(currentDate);

      // Fade in se nao estava scrollando
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        Animated.timing(stickyHeaderOpacity, {
          toValue: 1,                              //......Mostra header
          duration: 200,                           //......Fade in rapido
          useNativeDriver: true,
        }).start();
      }
    }

    // Reset timer de fade-out (esconde apos parar de scrollar)
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      Animated.timing(stickyHeaderOpacity, {
        toValue: 0,                                //......Fade out
        duration: 300,                             //......Fade out suave
        useNativeDriver: true,
      }).start();
    }, 1500);                                      //......1.5s apos parar de scrollar
  }, []);

  // ========================================
  // Agrupar mensagens por data e inverter para lista invertida
  // ========================================
  const listItems = useMemo(() => {
    const perfStart = (window as any).__PERF_KANBAN_START;
    const startGroup = performance.now();
    const grouped = groupMessagesByDate(messages);
    // Inverter para lista invertida (mais recentes primeiro)
    const result = grouped.reverse();

    // ========================================
    // Pre-computar spacing para cada item
    // Em lista invertida: index+1 = mensagem acima (mais antiga)
    // marginBottom cria espaco ACIMA do item no FlatList invertido
    // ========================================
    for (let i = 0; i < result.length; i++) {
      if (result[i].type === 'divider') {
        result[i].spacing = 0;            //......Dividers sem spacing proprio
        continue;
      }

      // Extrair direction do item atual (message ou mediaGroup)
      let currentDirection: string;
      if (result[i].type === 'mediaGroup') {
        currentDirection = (result[i].data as MediaGroupData).direction;
      } else {
        currentDirection = (result[i].data as WhatsAppMessage).direction;
      }

      let spacing = SPACING_SAME_SENDER;  //......Padrao: mesmo remetente

      // Buscar proxima mensagem acima (pular dividers)
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].type === 'divider') continue;

        let aboveDirection: string;
        if (result[j].type === 'mediaGroup') {
          aboveDirection = (result[j].data as MediaGroupData).direction;
        } else {
          aboveDirection = (result[j].data as WhatsAppMessage).direction;
        }

        if (aboveDirection !== currentDirection) {
          spacing = SPACING_DIFFERENT_SENDER;
        }
        break;
      }
      result[i].spacing = spacing;
    }

    if (perfStart && messages.length > 0) {
      console.log(`[PERF] MessageList GroupMessages: ${Math.round(performance.now() - startGroup)}ms (${result.length} items)`);
    }
    return result;
  }, [messages]);

  // Atualizar ref para acesso estavel no renderItem
  highlightedIdRef.current = highlightedMessageId;

  // ========================================
  // Handler de Long Press
  // ========================================
  const handleLongPress = useCallback((message: WhatsAppMessage, pageY: number) => {
    onMessageLongPress?.(message, pageY); //......Chama callback com posicao
  }, [onMessageLongPress]);

  // ========================================
  // Handler de Reply Press
  // Scroll automatico ate a mensagem citada com highlight temporario
  // ========================================
  const handleReplyPress = useCallback((messageId: string) => {
    // Buscar por messageKey.id (WhatsApp key) pois replyTo.messageId vem do stanzaId
    const targetIndex = listItems.findIndex((item) => {
      if (item.type === 'message') {
        const msg = item.data as WhatsAppMessage;
        return msg.messageKey?.id === messageId;
      }
      if (item.type === 'mediaGroup') {
        const group = item.data as MediaGroupData;
        return group.items.some(gi => gi.message.messageKey?.id === messageId);
      }
      return false;
    });

    if (targetIndex !== -1 && flatListRef.current) {
      // Extrair ID para highlight (pode ser message ou mediaGroup)
      const targetItem = listItems[targetIndex];
      let highlightId: string;
      if (targetItem.type === 'mediaGroup') {
        const group = targetItem.data as MediaGroupData;
        const found = group.items.find(gi => gi.message.messageKey?.id === messageId);
        highlightId = found ? found.message.id : group.id;
      } else {
        highlightId = (targetItem.data as WhatsAppMessage).id;
      }

      try {
        flatListRef.current.scrollToIndex({
          index: targetIndex,              //......Indice da mensagem alvo
          animated: true,                  //......Scroll suave
          viewPosition: 0.3,              //......Posiciona a 30% do topo
        });
      } catch (error) {
        console.error('[MessageList] Erro no scrollToIndex:', error);
      }

      // Highlight temporario na mensagem alvo (usar ID interno)
      // 6s = 5s pulsacao + 0.4s fade out + buffer
      setHighlightedMessageId(highlightId);
      setTimeout(() => setHighlightedMessageId(null), 6000);
    }

    onReplyPress?.(messageId);           //......Chama callback externo
  }, [onReplyPress, listItems]);

  // ========================================
  // Handler de Image Press
  // ========================================
  const handleImagePress = useCallback((imageUrl: string, message?: WhatsAppMessage) => {
    onImagePress?.(imageUrl, message);    //......Chama callback
  }, [onImagePress]);

  // ========================================
  // Handler de Video Press
  // ========================================
  const handleVideoPress = useCallback((videoUrl: string, message?: WhatsAppMessage) => {
    onVideoPress?.(videoUrl, message);    //......Chama callback
  }, [onVideoPress]);

  // ========================================
  // CellRendererComponent - Aplica spacing no nivel do cell do FlatList
  // Mais confiavel que marginBottom dentro do renderItem, pois
  // o FlatList gerencia o posicionamento dos cells diretamente
  // ========================================
  const CellRenderer = useCallback(({ children, item, style, ...props }: any) => {
    const cellItem = item as ListItem | undefined;
    const spacing = cellItem?.spacing || 0;
    return (
      <View style={[style, spacing > 0 && { marginBottom: spacing }]} {...props}>
        {children}
      </View>
    );
  }, []);

  // ========================================
  // Render Item
  // ========================================
  const renderItem: ListRenderItem<ListItem> = useCallback(({ item, index }) => {
    // Render Divider
    if (item.type === 'divider') {
      return (
        <DateDivider
          date={item.data as Date}        //......Data do divider
        />
      );
    }

    // Render Media Group (album de midias agrupadas)
    if (item.type === 'mediaGroup') {
      const groupData = item.data as MediaGroupData;
      const isGroupOutgoing = groupData.direction === 'outgoing';
      const firstContent = groupData.items[0].message.content as any;
      const firstUrl = firstContent.thumbnail || firstContent.url;

      return (
        <SwipeableMessage onSwipeReply={() => {
          const lastMsg = groupData.items[groupData.items.length - 1].message;
          onSwipeReply?.(lastMsg);
        }}>
          <View
            style={[
              styles.imageContainer,
              isGroupOutgoing ? styles.imageContainerOutgoing : styles.imageContainerIncoming,
            ]}
          >
            {/* Botao compartilhar (esquerda para outgoing) */}
            {isGroupOutgoing && onForwardPress && (
              <Pressable
                style={styles.videoForwardButton}
                onPress={() => onForwardPress(firstUrl)}
                hitSlop={8}
              >
                <Svg width={14} height={12} viewBox="0 0 24 20">
                  <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
                </Svg>
              </Pressable>
            )}

            <MediaGridMessage
              group={groupData}
              onImagePress={handleImagePress}
              onVideoPress={handleVideoPress}
              onGroupPress={onMediaGroupPress}
              onLongPress={() => onMediaGroupLongPress?.(groupData)}
              timestampStyle={timestampStyle}
              instanceName={instanceName}
            />

            {/* Botao compartilhar (direita para incoming) */}
            {!isGroupOutgoing && onForwardPress && (
              <Pressable
                style={styles.videoForwardButton}
                onPress={() => onForwardPress(firstUrl)}
                hitSlop={8}
              >
                <Svg width={14} height={12} viewBox="0 0 24 20">
                  <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
                </Svg>
              </Pressable>
            )}
          </View>
        </SwipeableMessage>
      );
    }

    // Render Message
    const message = item.data as WhatsAppMessage;
    const isOutgoing = message.direction === 'outgoing';

    // View Once: renderizar como bolha compacta (igual WhatsApp)
    if (message.viewOnce && (message.type === 'image' || message.type === 'video')) {
      const isPhoto = message.type === 'image';
      const viewOnceLabel = isPhoto ? 'Foto' : 'Vídeo';
      return (
        <SwipeableMessage onSwipeReply={() => onSwipeReply?.(message)}>
            <MessageBubble
              direction={message.direction}
              status={message.status}
              timestamp={message.timestamp}
              replyTo={message.replyTo}
              instanceName={instanceName}
              onLongPress={(pageY?: number) => handleLongPress(message, pageY ?? 0)}
              onReplyPress={() => {
                if (message.replyTo) {
                  handleReplyPress(message.replyTo.messageId);
                }
              }}
            >
              <View style={styles.viewOnceBubble}>
                {/* Icone oficial WhatsApp view-once: circulo metade solido metade tracejado com "1" */}
                <View style={{ width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    {/* Metade esquerda: solida */}
                    <Path d="M12 2.5 A9.5 9.5 0 0 0 12 21.5" stroke="#000000" strokeWidth={2} fill="none" strokeLinecap="round" />
                    {/* Metade direita: tracejada */}
                    <Path d="M12 2.5 A9.5 9.5 0 0 1 12 21.5" stroke="#000000" strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray="3 3" />
                    {/* Numero "1" no centro */}
                    <Line x1="12" y1="7.5" x2="12" y2="16.5" stroke="#000000" strokeWidth={2.2} strokeLinecap="round" />
                    <Line x1="10" y1="10" x2="12" y2="7.5" stroke="#000000" strokeWidth={1.8} strokeLinecap="round" />
                  </Svg>
                </View>
                <Text style={styles.viewOnceText}>
                  {viewOnceLabel}
                </Text>
              </View>
            </MessageBubble>
        </SwipeableMessage>
      );
    }

    // Imagens renderizadas diretamente sem MessageBubble
    if (message.type === 'image' && isImageContent(message.content)) {
      const imageUrl = message.content.thumbnail || message.content.url;
      return (
        <SwipeableMessage onSwipeReply={() => onSwipeReply?.(message)}>
          <View
            style={[
              styles.imageContainer,        //......Container da imagem
              isOutgoing ? styles.imageContainerOutgoing : styles.imageContainerIncoming,
            ]}
          >
            {/* Botao compartilhar (esquerda para outgoing) */}
            {isOutgoing && onForwardPress && (
              <Pressable
                style={styles.videoForwardButton}
                onPress={() => onForwardPress(imageUrl)}
                hitSlop={8}
              >
                <Svg width={14} height={12} viewBox="0 0 24 20">
                  <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
                </Svg>
              </Pressable>
            )}

            <ImageMessage
              content={message.content}     //......Conteudo
              isOutgoing={isOutgoing}       //......Direcao
              timestamp={message.timestamp} //......Hora de envio
              status={message.status}       //......Status da mensagem
              reaction={message.reaction}   //......Reacao (emoji)
              timestampStyle={timestampStyle}
              onPress={() => handleImagePress(imageUrl, message)}
              onLongPress={(pageY?: number) => handleLongPress(message, pageY ?? 0)}
              messageKey={message.messageKey}
              instanceName={instanceName}
            />

            {/* Botao compartilhar (direita para incoming) */}
            {!isOutgoing && onForwardPress && (
              <Pressable
                style={styles.videoForwardButton}
                onPress={() => onForwardPress(imageUrl)}
                hitSlop={8}
              >
                <Svg width={14} height={12} viewBox="0 0 24 20">
                  <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
                </Svg>
              </Pressable>
            )}
          </View>
        </SwipeableMessage>
      );
    }

    // Videos renderizados diretamente sem MessageBubble
    if (message.type === 'video' && isVideoContent(message.content)) {
      const videoUrl = message.content.url;
      return (
        <SwipeableMessage onSwipeReply={() => onSwipeReply?.(message)}>
        <View
          style={[
            styles.imageContainer,        //......Container do video (mesmo estilo de imagem)
            isOutgoing ? styles.imageContainerOutgoing : styles.imageContainerIncoming,
          ]}
        >
          {/* Botao compartilhar (esquerda para outgoing) */}
          {isOutgoing && onForwardPress && (
            <Pressable
              style={styles.videoForwardButton}
              onPress={() => onForwardPress(videoUrl)}
              hitSlop={8}
            >
              <Svg width={14} height={12} viewBox="0 0 24 20">
                <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
          )}

          <VideoMessage
            content={message.content}     //......Conteudo
            isOutgoing={isOutgoing}       //......Direcao
            timestamp={message.timestamp} //......Hora de envio
            status={message.status}       //......Status da mensagem
            reaction={message.reaction}   //......Reacao (emoji)
            timestampStyle={timestampStyle}
            onPress={() => handleVideoPress(videoUrl, message)}
            onLongPress={(pageY?: number) => handleLongPress(message, pageY ?? 0)}
            messageKey={message.messageKey}
            instanceName={instanceName}
          />

          {/* Botao compartilhar (direita para incoming) */}
          {!isOutgoing && onForwardPress && (
            <Pressable
              style={styles.videoForwardButton}
              onPress={() => onForwardPress(videoUrl)}
              hitSlop={8}
            >
              <Svg width={14} height={12} viewBox="0 0 24 20">
                <Path d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
          )}
        </View>
        </SwipeableMessage>
      );
    }

    // Renderizar conteudo por tipo
    const renderContent = () => {
      switch (message.type) {
        case 'text':                      //......Mensagem texto
          if (isTextContent(message.content)) {
            return (
              <TextMessage
                content={message.content} //......Conteudo
                isOutgoing={isOutgoing}
              />
            );
          }
          return null;

        case 'audio':                     //......Mensagem audio
          if (isAudioContent(message.content)) {
            const msgTranscription = message.id ? transcriptions?.[message.id] : undefined;
            return (
              <AudioMessage
                content={message.content} //......Conteudo
                isOutgoing={isOutgoing}
                timestamp={message.timestamp}
                status={message.status}
                timestampStyle={timestampStyle}
                onRetry={onAudioRetry ? () => onAudioRetry(message) : undefined}
                messageKey={message.messageKey}
                instanceName={instanceName}
                transcription={msgTranscription?.text}
                isTranscribing={msgTranscription?.isLoading}
              />
            );
          }
          return null;

        case 'document':                  //......Mensagem documento
          if (isDocumentContent(message.content)) {
            return (
              <DocumentMessage
                content={message.content} //......Conteudo
                isOutgoing={isOutgoing}
              />
            );
          }
          return null;

        case 'deleted':                   //......Mensagem apagada
          return (
            <DeletedMessage
              isOutgoing={isOutgoing}     //......Direcao
            />
          );

        default:                          //......Padrao
          return null;
      }
    };

    // Detectar link preview para ajustar largura do conteudo
    const hasLinkPreview = message.type === 'text' && isTextContent(message.content) && !!message.content.linkPreview;

    return (
      <SwipeableMessage onSwipeReply={() => onSwipeReply?.(message)}>
        <MessageBubble
          direction={message.direction}     //......Direcao
          status={message.status}           //......Status
          timestamp={message.timestamp}     //......Timestamp
          replyTo={message.replyTo}         //......Reply info
          senderName={message.senderName}   //......Nome remetente
          highlighted={message.id === highlightedIdRef.current}
          forceMaxWidth={message.type === 'audio'}
          hideFooter={message.type === 'audio'}
          contentFixedWidth={hasLinkPreview ? 190 : undefined}
          timestampStyle={timestampStyle}
          showForwardButton={hasLinkPreview}
          forwardUrl={hasLinkPreview ? (message.content as TextContent).linkPreview?.url : undefined}
          onForwardPress={onForwardPress}
          instanceName={instanceName}       //......Instancia Evolution
          reaction={message.reaction}      //......Reacao emoji
          onLongPress={(pageY?: number) => handleLongPress(message, pageY ?? 0)}
          onReplyPress={() => {
            if (message.replyTo) {
              handleReplyPress(message.replyTo.messageId);
            }
          }}
        >
          {renderContent()}
        </MessageBubble>
      </SwipeableMessage>
    );
  }, [handleLongPress, handleReplyPress, handleImagePress, handleVideoPress, onAudioRetry, onForwardPress, onSwipeReply, onMediaGroupPress, onMediaGroupLongPress, timestampStyle, instanceName, transcriptions]);

  // ========================================
  // Key Extractor
  // ========================================
  const keyExtractor = useCallback((item: ListItem) => {
    return item.id;                       //......Retorna ID
  }, []);

  // ========================================
  // Scroll to End (com inverted, offset 0 é o final)
  // ========================================
  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToOffset({
      offset: 0,                          //......Com inverted, 0 é o final
      animated: true,                     //......Scroll suave
    });
  }, []);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}                   //......Referencia
        style={styles.container}            //......Estilo container
        data={listItems}                    //......Dados (invertidos)
        renderItem={renderItem}             //......Render item
        keyExtractor={keyExtractor}         //......Key extractor
        CellRendererComponent={CellRenderer} //......Spacing no nivel do cell
        extraData={highlightedMessageId}    //......Forca re-render no highlight
        contentContainerStyle={styles.listContent}
        inverted={true}                     //......Lista invertida (abre no final)
        showsVerticalScrollIndicator={true} //......Mostra indicador
        initialNumToRender={15}             //......Render inicial otimizado
        maxToRenderPerBatch={8}             //......Max por batch otimizado
        windowSize={7}                      //......Janela menor para performance
        updateCellsBatchingPeriod={50}      //......Batching mais rapido
        removeClippedSubviews={Platform.OS !== 'web'} //..Remove views fora da tela (desabilitado na web para evitar cache stale)
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}             //......Rastreia posicao scroll
        scrollEventThrottle={100}           //......Intervalo evento scroll
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        keyboardShouldPersistTaps="handled" //......Taps com teclado
        keyboardDismissMode="on-drag"       //......Fecha teclado ao arrastar
        overScrollMode="always"             //......Permite over scroll
        onLayout={handleFlatListLayout}     //......Debug layout
        nestedScrollEnabled={true}          //......Permite scroll aninhado
        onScrollToIndexFailed={(info) => {
          // Fallback: scroll estimado + retry
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,                //......Scroll estimado
          });
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,           //......Retry scroll exato
              animated: true,              //......Scroll suave
              viewPosition: 0.3,           //......Posiciona a 30% do topo
            });
          }, 300);
        }}
      />

      {/* Header sticky de data flutuante (estilo WhatsApp) */}
      {stickyDate && (
        <Animated.View
          style={[
            styles.stickyDateContainer,
            { opacity: stickyHeaderOpacity },
          ]}
          pointerEvents="none"
        >
          <View style={styles.stickyDateBadge}>
            <Text style={styles.stickyDateText}>{stickyDate}</Text>
          </View>
        </Animated.View>
      )}

      {/* Botao flutuante scroll-to-bottom (estilo WhatsApp) */}
      {showScrollButton && (
        <Animated.View
          style={[
            styles.scrollToBottomButton,
            { opacity: scrollButtonOpacity },
          ]}
          pointerEvents={showScrollButton ? 'auto' : 'none'}
        >
          <Pressable
            onPress={scrollToEnd}
            style={styles.scrollToBottomPressable}
            hitSlop={8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9L12 15L18 9"
                stroke="#8696A0"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default MessageList;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Wrapper que envolve FlatList e botao flutuante
  wrapper: {
    flex: 1,                              //......Ocupa todo espaco
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    position: 'relative' as any,          //......Referencia para posicionamento absoluto
  },

  // Container principal (FlatList)
  container: {
    flex: 1,                              //......Ocupa todo espaco
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    backgroundColor: 'transparent',       //......Fundo transparente para mostrar imagem
    ...(Platform.OS === 'web' ? {
      position: 'absolute' as any,        //......Posicao absoluta na web
      top: 0,                             //......Topo
      left: 0,                            //......Esquerda
      right: 0,                           //......Direita
      bottom: 0,                          //......Fundo
      width: '100%',                      //......FIX: Largura 100% do pai
      maxWidth: '100%',                   //......FIX: Limita largura maxima
      overflow: 'auto' as any,            //......Scroll na web
    } : {}),
  },

  // Conteudo da lista
  listContent: {
    paddingVertical: 8,                   //......Padding vertical
    paddingHorizontal: 8,                 //......Padding horizontal
    ...(Platform.OS === 'web' ? {
      flexGrow: 0,                        //......Nao cresce na web
    } : {}),
  },

  // Container da imagem (sem MessageBubble)
  // marginBottom aplicado dinamicamente via renderItem (lista invertida)
  imageContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    paddingHorizontal: 12,                //......Padding horizontal
  },

  // Container imagem incoming (esquerda)
  imageContainerIncoming: {
    justifyContent: 'flex-start',         //......Alinha esquerda
  },

  // Container imagem outgoing (direita)
  imageContainerOutgoing: {
    justifyContent: 'flex-end',           //......Alinha direita
  },

  // Botao de compartilhar video (circulo com seta)
  videoForwardButton: {
    width: 28,                            //......Largura do botao
    height: 28,                           //......Altura do botao
    borderRadius: 14,                     //......Circulo perfeito
    backgroundColor: 'rgba(0,0,0,0.35)',  //......Fundo escuro translucido
    justifyContent: 'center',             //......Centraliza icone vertical
    alignItems: 'center',                 //......Centraliza icone horizontal
    alignSelf: 'center',                  //......Centraliza vertical com o video
    marginHorizontal: 6,                  //......Espaco lateral do video
  },

  // Header sticky de data (flutuante no topo, estilo WhatsApp)
  stickyDateContainer: {
    position: 'absolute',                 //......Flutuante sobre a lista
    top: 8,                               //......Distancia do topo
    left: 0,                              //......Borda esquerda
    right: 0,                             //......Borda direita
    alignItems: 'center',                 //......Centraliza horizontalmente
    zIndex: 50,                           //......Acima da lista, abaixo de modais
  },

  // Badge da data sticky (mesmo visual do DateDivider)
  stickyDateBadge: {
    backgroundColor: '#FFFFFF',           //......Fundo branco
    paddingHorizontal: 12,                //......Padding horizontal
    paddingVertical: 6,                   //......Padding vertical
    borderRadius: 8,                      //......Bordas arredondadas
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.15)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        }),
  },

  // Texto da data sticky
  stickyDateText: {
    fontFamily: 'Inter_500Medium',        //......Fonte media (igual DateDivider)
    fontSize: 12,                         //......Tamanho fonte
    color: '#7D8592',                     //......Cor cinza (igual DateDivider)
    textAlign: 'center',                  //......Centralizado
  },

  // Botao flutuante scroll-to-bottom (estilo WhatsApp)
  scrollToBottomButton: {
    position: 'absolute',                 //......Posicao absoluta sobre a lista
    bottom: 16,                           //......Distancia do fundo
    right: 12,                            //......Distancia da direita
    zIndex: 20,                           //......Acima da lista
  },

  // Area tocavel do botao scroll-to-bottom
  scrollToBottomPressable: {
    width: 40,                            //......Largura do botao
    height: 40,                           //......Altura do botao
    borderRadius: 20,                     //......Circulo perfeito
    backgroundColor: '#FFFFFF',           //......Fundo branco
    justifyContent: 'center',             //......Centraliza icone vertical
    alignItems: 'center',                 //......Centraliza icone horizontal
    elevation: 4,                         //......Sombra Android
    shadowColor: '#000000',               //......Cor sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,                   //......Opacidade sombra
    shadowRadius: 4,                      //......Raio sombra
  },

  // View Once: bolha compacta estilo WhatsApp
  viewOnceBubble: {
    flexDirection: 'row',               //......Layout horizontal
    alignItems: 'center',               //......Centraliza vertical
    gap: 6,                             //......Espaco entre icone e texto
    paddingVertical: 2,                 //......Padding vertical
    paddingHorizontal: 2,              //......Padding horizontal
    minWidth: 62,                       //......Largura minima fixa (alinha todas as bolhas)
  },
  viewOnceText: {
    fontSize: 14,                       //......Tamanho fonte
    lineHeight: 16,                     //......Altura linha = icone (16px)
    fontFamily: 'Inter_400Regular',     //......Fonte regular
    color: '#000000',                   //......Preto padrao do sistema
    minWidth: 38,                       //......Largura fixa para "Foto" e "Vídeo" alinharem
  },
});
