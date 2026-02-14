// Componente MessageBubble
// Container da bolha de mensagem com botao de encaminhar

// React e React Native
import React, { memo, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Platform } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Tipos
import { MessageDirection, MessageStatus as StatusType, ReplyInfo } from '../../types/08.types.whatsapp';

// Componentes
import MessageStatus from './08.08.MessageStatus';

// Servicos
import evolutionService from '../../../../services/evolutionService';

// Estilos e Temas
import { ChatColors } from '../../styles/08.ChatColors';
import { useTheme } from '../../styles/themes/ThemeContext';

// Funcoes
import { formatMessageTime } from '../../data/08.mockMessages';

// Interface de Props do MessageBubble
interface MessageBubbleProps {
  direction: MessageDirection;             //...Incoming ou outgoing
  status: StatusType;                      //...Status da mensagem
  timestamp: Date;                         //...Data hora
  replyTo?: ReplyInfo;                     //...Reply info
  senderName?: string;                     //...Nome do remetente
  showSenderName?: boolean;                //...Mostrar nome
  onLongPress?: (pageY?: number) => void;   //...Long press handler (com posicao Y)
  onReplyPress?: () => void;               //...Press no reply
  children: React.ReactNode;               //...Conteudo da mensagem
  isTextMessage?: boolean;                 //...Se e mensagem de texto
  forceMaxWidth?: boolean;                 //...Forca largura maxima (audio)
  hideFooter?: boolean;                    //...Esconde footer (audio)
  highlighted?: boolean;                   //...Destaque ao scroll para reply
  contentFixedWidth?: number;              //...Largura fixa para link preview
  timestampStyle?: string;                 //...Estilo do timestamp
  showForwardButton?: boolean;             //...Mostrar botao encaminhar
  forwardUrl?: string;                     //...URL para compartilhar
  onForwardPress?: (url: string) => void;  //...Handler encaminhar URL
  instanceName?: string;                   //...Instancia Evolution para buscar thumb
  reaction?: string;                       //...Emoji de reacao na mensagem
}

// Icone de encaminhar (compartilhar original do sistema)
const ForwardIcon: React.FC = () => (
  <Svg width={14} height={12} viewBox="0 0 24 20">
    <Path
      d="M13.9996 5.00365V0.752138C13.9987 0.604446 14.0416 0.459812 14.1229 0.336474C14.2041 0.213135 14.3201 0.116614 14.4561 0.0590801C14.5922 0.00154609 14.7422 -0.0144249 14.8873 0.0131808C15.0324 0.0407865 15.1661 0.110733 15.2715 0.214201L23.7712 8.46325C23.8436 8.53293 23.9011 8.61648 23.9404 8.70891C23.9797 8.80134 24 8.90075 24 9.00118C24 9.10162 23.9797 9.20103 23.9404 9.29346C23.9011 9.38589 23.8436 9.46944 23.7712 9.53912L15.2715 17.7882C15.0545 17.9981 14.7325 18.0571 14.4575 17.9411C14.3219 17.8835 14.2062 17.7873 14.1247 17.6645C14.0433 17.5417 13.9998 17.3976 13.9996 17.2502V13.0007H12.5816C7.94575 13.0007 3.67188 15.5204 1.42896 19.572L1.40796 19.61C1.32801 19.7561 1.20169 19.8715 1.04891 19.9379C0.89613 20.0042 0.72559 20.0179 0.564198 19.9766C0.402803 19.9354 0.259743 19.8415 0.157583 19.71C0.0554237 19.5784 -1.90735e-05 19.4166 0 19.25C0 11.4769 6.2568 5.13763 13.9996 5.00365Z"
      fill="#FFFFFF"             //...Cor branca
    />
  </Svg>
);

// Icone de video (camera de video oficial WhatsApp)
const VideoIcon: React.FC<{ color?: string }> = ({ color = '#FFFFFF' }) => (
  <Svg width={14} height={12} viewBox="0 0 462 266">
    <Path
      d="M256.152 0H50C22.398.031.031 22.398 0 50v165.95c.031 27.6 22.398 49.968 50 50h206.152c27.602-.032 49.97-22.4 50-50V50c-.03-27.602-22.398-49.969-50-50zM456.957 26.035a10.01 10.01 0 0 0-10.043.074L336.352 91.391a10.002 10.002 0 0 0-4.915 8.613v60.305c0 3.09 1.426 6.007 3.868 7.902l110.562 85.836A10 10 0 0 0 462 246.145V34.719c0-3.59-1.926-6.903-5.043-8.684z"
      fill={color}               //...Cor do icone
    />
  </Svg>
);

// Icone de camera (foto oficial WhatsApp)
const CameraIcon: React.FC<{ color?: string }> = ({ color = '#FFFFFF' }) => (
  <Svg width={14} height={12} viewBox="0 0 24 24">
    <Path
      d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Zm0 6a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Zm8.25-8.25h-3.074l-.884-1.326A1.5 1.5 0 0 0 15.043 4.5H8.957a1.5 1.5 0 0 0-1.249.674L6.824 6.5H3.75A2.25 2.25 0 0 0 1.5 8.75v9a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25Zm.75 11.25a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-9a.75.75 0 0 1 .75-.75h3.75l1.125-1.688a.25.25 0 0 1 .208-.062h6.334a.25.25 0 0 1 .208.112L16.5 8.25h3.75a.75.75 0 0 1 .75.75v9Z"
      fill={color}               //...Cor do icone
    />
  </Svg>
);

// Interface do ReplyPreview
interface ReplyPreviewProps {
  replyTo: ReplyInfo;       //...Info do reply
  isOutgoing: boolean;      //...Se e enviada
  onPress?: () => void;     //...Handler press
  instanceName?: string;    //...Instancia Evolution para buscar thumb
}

// Cache de thumbnails de reply (persiste entre remounts)
const REPLY_THUMB_CACHE_PREFIX = 'reply_thumb_';

// CACHE EM MEMÓRIA - persiste entre remounts do componente
const MEMORY_THUMB_CACHE = new Map<string, string>();

// Limpar caches invalidos na inicializacao (executa uma vez)
const cleanInvalidReplyThumbCaches = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(REPLY_THUMB_CACHE_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Remover se thumb nao e valido
            if (!parsed.thumb || typeof parsed.thumb !== 'string' || parsed.thumb.length < 100 || !parsed.thumb.startsWith('data:')) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key); // JSON invalido
          }
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch { /* Erro ao limpar caches */ }
};

// Executar limpeza uma vez
cleanInvalidReplyThumbCaches();

// Busca thumbnail do cache
const getReplyThumbCache = (messageId: string): string | null => {
  try {
    const cached = localStorage.getItem(REPLY_THUMB_CACHE_PREFIX + messageId);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache valido por 24 horas
      if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        // Validar que thumb e uma string base64 valida (minimo 100 chars)
        if (parsed.thumb && typeof parsed.thumb === 'string' && parsed.thumb.length > 100 && parsed.thumb.startsWith('data:')) {
          return parsed.thumb;
        }
        // Cache invalido - remover
        localStorage.removeItem(REPLY_THUMB_CACHE_PREFIX + messageId);
        return null;
      }
      localStorage.removeItem(REPLY_THUMB_CACHE_PREFIX + messageId);
    }
  } catch { /* Cache indisponivel */ }
  return null;
};

// Salva thumbnail no cache
const saveReplyThumbCache = (messageId: string, thumb: string) => {
  try {
    localStorage.setItem(REPLY_THUMB_CACHE_PREFIX + messageId, JSON.stringify({
      ts: Date.now(),
      thumb: thumb,
    }));
  } catch { /* Cache cheio */ }
};

// Componente ReplyPreview (Memoizado)
// Preview da mensagem citada dentro do bubble (com thumbnail lateral estilo WhatsApp)
const ReplyPreview = memo<ReplyPreviewProps>(({ replyTo, isOutgoing, onPress, instanceName }) => {
  // Cache em memoria (mais rapido que localStorage)
  const memCached = MEMORY_THUMB_CACHE.get(replyTo.messageId);
  const localCached = getReplyThumbCache(replyTo.messageId);

  // Prioridade: cache HD (memoria/local) > thumbnail blurry do WhatsApp
  const initialThumb = memCached || localCached || replyTo.thumbnail || null;
  const hasHdCache = !!memCached || !!localCached; //...Tem cache HD

  // Estado da thumbnail (API base64 ou buscada do cache/Microlink)
  const [thumbUri, setThumbUri] = useState<string | null>(initialThumb);
  const [triedEvolutionApi, setTriedEvolutionApi] = useState(hasHdCache);

  // Salvar no cache em memoria quando thumbUri mudar
  useEffect(() => {
    if (thumbUri && thumbUri.startsWith('data:') && thumbUri !== replyTo.thumbnail) {
      MEMORY_THUMB_CACHE.set(replyTo.messageId, thumbUri);
    }
  }, [thumbUri, replyTo.messageId, replyTo.thumbnail]);

  // Sincronizar thumbUri quando replyTo.thumbnail mudar (prop externa)
  useEffect(() => {
    if (replyTo.thumbnail && !thumbUri) {
      setThumbUri(replyTo.thumbnail);
    }
  }, [replyTo.thumbnail, thumbUri]);

  // Buscar thumbnail HD via Evolution API (mesmo quando thumb blurry existe)
  useEffect(() => {
    // Busca HD para imagens/videos que ainda nao tem cache HD
    const isMedia = replyTo.type === 'image' || replyTo.type === 'video';
    if (!isMedia || triedEvolutionApi || !replyTo.messageKey || !instanceName) return;

    setTriedEvolutionApi(true);            //...Marcar como tentado

    // Buscar midia via Evolution API
    (async () => {
      try {
        const mediaData = await evolutionService.getBase64FromMediaMessage(instanceName, replyTo.messageKey!);
        if (mediaData && mediaData.base64) {
          let mimeType = mediaData.mimeType || (replyTo.type === 'video' ? 'video/mp4' : 'image/jpeg');
          if (mimeType === 'application/octet-stream') {
            mimeType = replyTo.type === 'video' ? 'video/mp4' : 'image/jpeg';
          }

          let base64Data = mediaData.base64;
          if (base64Data.startsWith('data:')) {
            const commaIndex = base64Data.indexOf(',');
            if (commaIndex !== -1) base64Data = base64Data.substring(commaIndex + 1);
          }

          // Para imagens, usar diretamente como thumbnail HD
          if (replyTo.type === 'image') {
            const dataUri = `data:image/jpeg;base64,${base64Data}`;
            setThumbUri(dataUri);          //...Substituir blurry por HD
            MEMORY_THUMB_CACHE.set(replyTo.messageId, dataUri);
            saveReplyThumbCache(replyTo.messageId, dataUri);
          } else if (replyTo.type === 'video' && Platform.OS === 'web') {
            // Para videos, gerar thumbnail do primeiro frame via Canvas
            const videoDataUri = `data:${mimeType};base64,${base64Data}`;
            try {
              let resolved = false;        //...Flag anti re-entrancia
              const video = document.createElement('video');
              video.muted = true;          //...Mudo para autoplay
              video.preload = 'auto';      //...Carregar dados
              video.playsInline = true;    //...Inline

              const done = (thumb: string | null) => {
                if (resolved) return;      //...Ja resolvido
                resolved = true;           //...Marcar
                clearTimeout(timeoutId);   //...Cancelar timeout
                video.onloadeddata = null; //...Remover listeners
                video.onseeked = null;     //...Remover listeners
                video.onerror = null;      //...Remover listeners
                if (thumb) {
                  setThumbUri(thumb);      //...Usar frame extraido
                  MEMORY_THUMB_CACHE.set(replyTo.messageId, thumb);
                  saveReplyThumbCache(replyTo.messageId, thumb);
                }
                video.removeAttribute('src');
                video.load();              //...Reset element
              };

              const timeoutId = setTimeout(() => done(null), 8000);

              video.onloadeddata = () => { //...Primeiro frame disponivel
                video.currentTime = Math.min(1, video.duration * 0.1);
              };

              video.onseeked = () => {     //...Frame no tempo
                try {
                  const canvas = document.createElement('canvas');
                  const scale = 100 / video.videoWidth;
                  canvas.width = 100;      //...Largura thumbnail
                  canvas.height = video.videoHeight * scale;
                  const ctx = canvas.getContext('2d');
                  if (ctx && video.videoWidth > 0) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    done(canvas.toDataURL('image/jpeg', 0.7));
                  } else {
                    done(null);            //...Falha no canvas
                  }
                } catch {
                  done(null);              //...Erro no canvas
                }
              };

              video.onerror = () => done(null);
              video.src = videoDataUri;    //...Iniciar carregamento
            } catch { /* Erro ao gerar thumbnail */ }
          }
        }
      } catch { /* Erro na Evolution API */ }
    })();
  }, [replyTo.type, replyTo.messageKey, replyTo.messageId, instanceName, triedEvolutionApi]);

  // Buscar thumbnail quando linkUrl existe mas thumbnail nao veio da API
  useEffect(() => {
    if (replyTo.thumbnail || thumbUri || !replyTo.linkUrl) return; //...Ja tem thumb ou sem URL

    // Tentar cache localStorage (mesmo formato do LinkPreviewCard)
    try {
      let hash = 0;                                    //...Hash inicial
      for (let i = 0; i < replyTo.linkUrl.length; i++) {
        hash = ((hash << 5) - hash) + replyTo.linkUrl.charCodeAt(i);
        hash |= 0;                                    //...Inteiro 32-bit
      }
      const key = `lp_${Math.abs(hash).toString(36)}`; //...Chave do cache
      const stored = localStorage.getItem(key);         //...Busca cache
      if (stored) {
        const parsed = JSON.parse(stored);              //...Parseia cache
        if (parsed.data?.thumbnail) {
          setThumbUri(parsed.data.thumbnail);           //...Usa cache
          return;
        }
      }
    } catch { /* Cache indisponivel */ }

    // Fallback: buscar via Microlink API
    const fetchThumb = async () => {
      try {
        const encoded = encodeURIComponent(replyTo.linkUrl!);
        const resp = await fetch(`https://api.microlink.io/?url=${encoded}`);
        const json = await resp.json();                //...Parseia resposta
        if (json.status === 'success' && json.data?.image?.url) {
          setThumbUri(json.data.image.url);            //...Usa imagem OG
        }
      } catch { /* Falha silenciosa */ }
    };
    fetchThumb();
  }, [replyTo.thumbnail, replyTo.linkUrl, thumbUri]);

  // Cores do reply baseado na direcao
  const bgColor = isOutgoing ? '#F0F8FF' : '#F0F0F0';          //...Azul muito claro outgoing, cinza incoming
  const barColor = '#1777CF';                                   //...Azul principal
  const textColor = '#1F2C34';                                  //...Texto escuro
  const senderColor = '#1777CF';                                //...Azul principal
  const thumbBgColor = isOutgoing ? '#0D47A1' : '#D0D0D0';     //...Azul escuro outgoing, cinza incoming   

  // Texto do conteudo baseado no tipo
  const contentText = replyTo.type === 'image' ? ' Foto'
    : replyTo.type === 'video' ? ' Vídeo'
    : replyTo.type === 'audio' ? '🎤 Áudio'
    : replyTo.type === 'document' ? '📄 Documento'
    : replyTo.content;                                                                           //...Texto ou tipo

  // Verificar se precisa de espaco para thumbnail
  const needsThumbSpace = thumbUri || replyTo.type === 'image' || replyTo.type === 'video';      //...Tem thumb

  // WEB: Usar elementos HTML nativos (Pressable nao funciona corretamente)
  if (Platform.OS === 'web') {
    const hasThumb = replyTo.type === 'image' || replyTo.type === 'video';

    // Icone de camera SVG
    const CameraSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48" fill={textColor}>
        <path d="M42 12h-6.93a2 2 0 0 1-1.664-.891l-2.219-3.328A4 4 0 0 0 27.859 6h-7.718a4 4 0 0 0-3.328 1.781l-2.219 3.328A2 2 0 0 1 12.93 12H12v-1a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1H6a4 4 0 0 0-4 4v21a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4V16a4 4 0 0 0-4-4zM24 37a11.5 11.5 0 1 1 11.5-11.5A11.5 11.5 0 0 1 24 37z"/>
        <path d="M24 18a7.5 7.5 0 1 0 7.5 7.5A7.5 7.5 0 0 0 24 18zm0 12a4.505 4.505 0 0 1-4.5-4.5 1 1 0 0 1 2 0A2.5 2.5 0 0 0 24 28a1 1 0 0 1 0 2z"/>
      </svg>
    );

    // Icone de video SVG
    const VideoSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 462 266" fill={textColor}>
        <path d="M256.152 0H50C22.398.031.031 22.398 0 50v165.95c.031 27.6 22.398 49.968 50 50h206.152c27.602-.032 49.97-22.4 50-50V50c-.03-27.602-22.398-49.969-50-50zM456.957 26.035a10.01 10.01 0 0 0-10.043.074L336.352 91.391a10.002 10.002 0 0 0-4.915 8.613v60.305c0 3.09 1.426 6.007 3.868 7.902l110.562 85.836A10 10 0 0 0 462 246.145V34.719c0-3.59-1.926-6.903-5.043-8.684zm0 0"/>
      </svg>
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: bgColor,
          borderRadius: 6,
          marginBottom: 2,
          marginTop: -3.5,
          marginLeft: -5,
          marginRight: -5,
          cursor: 'pointer',
          height: 60,
          overflow: 'hidden',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
        onClick={onPress}
      >
        {/* Barra lateral */}
        <div
          style={{
            width: 4.5,
            backgroundColor: barColor,
            flexShrink: 0,
          }}
        />

        {/* Conteudo */}
        <div
          style={{
            flex: 1,
            padding: '4px 12px 4px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: senderColor,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {replyTo.senderName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {replyTo.type === 'image' && CameraSvg}
            {replyTo.type === 'video' && VideoSvg}
            <span
              style={{
                fontSize: 13,
                color: textColor,
                fontFamily: 'Inter_400Regular',
              }}
            >
              {contentText}
            </span>
          </div>
        </div>

        {/* Thumbnail para imagem/video */}
        {hasThumb && (
          <div
            style={{
              width: 50,
              height: '100%',
              backgroundColor: thumbBgColor,
              flexShrink: 0,
              overflow: 'hidden',
              marginRight: 0,
            }}
          >
            {thumbUri && (
              <img src={thumbUri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        )}
      </div>
    );
  }

  // NATIVE: Usar componentes React Native
  return (
    <Pressable
      style={[
        styles.replyContainer,                                       //...Estilo base
        isOutgoing ? styles.replyOutgoing : styles.replyIncoming,    //...Cor direcional
      ]}
      onPress={onPress}                                              //...Handler
    >
      {/* Barra Lateral */}
      <View style={[styles.replyBar, isOutgoing && styles.replyBarOutgoing]} />

      {/* Conteudo do Reply */}
      <View style={[styles.replyContent, needsThumbSpace && { paddingRight: 60 }]}>
        {/* Nome do Remetente */}
        <Text
          style={[styles.replySender, isOutgoing && styles.replySenderOutgoing]}
          numberOfLines={1}
        >
          {replyTo.senderName}
        </Text>

        {/* Preview do Conteudo com icone SVG */}
        <View style={styles.replyTextRow}>
          {replyTo.type === 'image' && <CameraIcon color={textColor} />}
          {replyTo.type === 'video' && <VideoIcon color={textColor} />}
          <Text
            style={[styles.replyText, isOutgoing && styles.replyTextOutgoing]}
            numberOfLines={2}
          >
            {contentText}
          </Text>
        </View>
      </View>

      {/* Thumbnail */}
      {needsThumbSpace && (
        <View style={styles.replyThumbnailWrapper}>
          {thumbUri ? (
            <Image source={{ uri: thumbUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={styles.replyThumbnailPlaceholder} />
          )}
        </View>
      )}
    </Pressable>
  );
});

// Componente Principal MessageBubble (Memoizado)
const MessageBubble = memo<MessageBubbleProps>(({
  direction,                               //...Direcao
  status,                                  //...Status
  timestamp,                               //...Data hora
  replyTo,                                 //...Reply opcional
  senderName,                              //...Nome remetente
  showSenderName = false,                  //...Mostrar nome
  onLongPress,                             //...Long press
  onReplyPress,                            //...Press reply
  children,                                //...Conteudo
  isTextMessage = true,                    //...E texto por padrao
  forceMaxWidth = false,                   //...Forca largura maxima
  hideFooter = false,                      //...Esconde footer
  highlighted = false,                     //...Destaque reply
  contentFixedWidth,                       //...Largura fixa
  timestampStyle,                          //...Estilo timestamp
  showForwardButton = false,               //...Botao encaminhar
  forwardUrl,                              //...URL compartilhar
  onForwardPress,                          //...Handler encaminhar
  instanceName,                            //...Instancia Evolution
  reaction,                                //...Reacao emoji
}) => {
  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // (posicao Y capturada pelo listener global lastPointerY)

  // Calcular direcao
  const isOutgoing = direction === 'outgoing'; //...Se e enviada
  const formattedTime = formatMessageTime(timestamp); //...Hora formatada

  // Handler para compartilhar URL via modal interno
  const handleForward = () => {
    if (!forwardUrl) return;                   //...Sem URL
    if (onForwardPress) {
      onForwardPress(forwardUrl);              //...Abre modal share
    }
  };

  // Botao de encaminhar (renderizado fora do bubble)
  const forwardButton = showForwardButton && forwardUrl ? (
    <Pressable
      style={styles.forwardButton}       //...Estilo botao
      onPress={handleForward}            //...Handler compartilhar
      hitSlop={8}                        //...Area de toque extra
    >
      <ForwardIcon />
    </Pressable>
  ) : null;

  // Render Principal
  return (
    <View
      style={[
        styles.container,                                                    //...Container base
        isOutgoing ? styles.containerOutgoing : styles.containerIncoming,    //...Alinhamento
        reaction ? { marginBottom: 25 } : undefined,                        //...Espaco para badge reacao
      ]}
    >
      {/* Botao encaminhar (esquerda para outgoing) */}
      {isOutgoing && forwardButton}

      {/* Bolha */}
      <Pressable
        style={[
          styles.bubble,                                                     //...Bolha base
          isOutgoing ? styles.bubbleOutgoing : styles.bubbleIncoming,        //...Estilo base
          {
            backgroundColor: isOutgoing ? colors.outgoingBubble : colors.incomingBubble,
            borderColor: isOutgoing ? colors.outgoingBorder : colors.incomingBorder,
          },
          forceMaxWidth && { width: '80%' },                                 //...Largura forcada
          contentFixedWidth ? { maxWidth: contentFixedWidth + 20, borderWidth: 0 } : undefined,
          highlighted && styles.bubbleHighlighted,                           //...Destaque
        ]}
        onLongPress={() => onLongPress?.(0)}   //...Posicao Y capturada no pai
      >
        {/* Nome do Remetente (Grupo) */}
        {showSenderName && senderName && !isOutgoing && (
          <Text style={styles.senderName}>
            {senderName}
          </Text>
        )}

        {/* Reply Preview */}
        {replyTo && (
          <ReplyPreview
            replyTo={replyTo}            //...Info reply
            isOutgoing={isOutgoing}      //...Direcao
            onPress={onReplyPress}       //...Handler
            instanceName={instanceName}  //...Instancia Evolution
          />
        )}

        {/* Container Interno com FlexWrap para Horario Inteligente */}
        <View style={styles.innerWrapper}>
          {/* Conteudo da Mensagem */}
          <View style={styles.contentContainer}>
            {children}
          </View>

          {/* Spacer: Cria espaco minimo e empurra footer para direita */}
          {!hideFooter && <View style={styles.footerSpacer} />}

          {/* Footer: Container padronizado com Hora + Status */}
          {!hideFooter && (
            <View style={[
              styles.footer,
              { borderColor: isOutgoing ? 'transparent' : '#D0D0D0' },
              isOutgoing && styles.footerOutgoing,
              contentFixedWidth ? styles.footerLinkPreview : undefined,
            ]}>
              {/* Hora */}
              <Text style={[
                styles.timestamp,
                { color: isOutgoing ? colors.timestampOutgoing : colors.timestamp },
                { fontFamily: 'Inter_400Regular' },
              ]}>
                {formattedTime}
              </Text>

              {/* Status (apenas outgoing) */}
              {isOutgoing && (
                <View style={styles.checkWrapper}>
                  <MessageStatus
                    status={status}            //...Status
                    isOutgoing={isOutgoing}    //...Direcao
                    size={11}                  //...Tamanho padronizado
                    iconColor={colors.timestamp}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Badge de Reacao (posicao absoluta relativa a bolha) */}
        {reaction && (
          <View style={styles.reactionBadge}>
            <Text style={styles.reactionText}>{reaction}</Text>
          </View>
        )}
      </Pressable>

      {/* Botao encaminhar (direita para incoming) */}
      {!isOutgoing && forwardButton}
    </View>
  );
});

// Export default
export default MessageBubble;

// Estilos do componente MessageBubble
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                 //...Layout horizontal
    paddingHorizontal: 12,                //...Padding horizontal
    overflow: 'visible',                  //...Permite conteudo alem dos limites
    alignItems: 'flex-end',               //...Alinha botao na base do bubble
  },

  // Container mensagem recebida
  containerIncoming: {
    justifyContent: 'flex-start',         //...Alinha esquerda
  },

  // Container mensagem enviada
  containerOutgoing: {
    justifyContent: 'flex-end',           //...Alinha direita
  },

  // Bolha base
  bubble: {
    maxWidth: '80%',                      //...Largura maxima
    minWidth: 80,                         //...Largura minima
    paddingVertical: 6,                   //...Padding vertical
    paddingHorizontal: 8,                 //...Padding horizontal
    borderRadius: 8,                      //...Arredondamento uniforme
    overflow: 'visible',                  //...Permite conteudo alem dos limites
  },

  // Bolha mensagem recebida
  bubbleIncoming: {
    backgroundColor: ChatColors.incomingBubble, //...Cor fundo incoming
    borderColor: '#E0E0E0',                     //...Borda cinza suave
    borderWidth: 0.5,                            //...Borda ultrafina
    shadowColor: '#000',                         //...Sombra sutil
    shadowOffset: { width: 0, height: 1 },      //...Offset sombra
    shadowOpacity: 0.08,                         //...Opacidade leve
    shadowRadius: 1,                             //...Raio sombra
    elevation: 1,                                //...Elevacao Android
  },

  // Bolha mensagem enviada
  bubbleOutgoing: {
    backgroundColor: ChatColors.outgoingBubble, //...Cor fundo outgoing
    borderWidth: 0,                              //...Sem borda (WhatsApp oficial)
    shadowColor: '#000',                         //...Sombra para destaque
    shadowOffset: { width: 0, height: 1 },      //...Offset sombra
    shadowOpacity: 0.18,                         //...Opacidade moderada
    shadowRadius: 3,                             //...Raio difuso
    elevation: 2,                                //...Elevacao Android
  },

  // Bolha destacada (scroll para reply)
  bubbleHighlighted: {
    backgroundColor: 'rgba(23,119,207,0.2)', //...Destaque azul claro
  },

  // Nome do remetente
  senderName: {
    fontFamily: 'Inter_600SemiBold',      //...Fonte semi bold
    fontSize: 13,                         //...Tamanho fonte
    color: ChatColors.link,               //...Cor azul
    marginBottom: 4,                      //...Margem inferior
  },

  // Wrapper interno com flexWrap
  innerWrapper: {
    flexDirection: 'row',                 //...Layout horizontal
    flexWrap: 'wrap',                     //...Permite quebra
    alignItems: 'flex-end',               //...Alinha na base
    overflow: 'visible',                  //...Permite conteudo alem dos limites
  },

  // Container do conteudo
  contentContainer: {
    flexShrink: 1,                        //...Permite encolher
    overflow: 'visible',                  //...Permite conteudo alem dos limites
  },

  // Spacer entre conteudo e footer
  footerSpacer: {
    flexGrow: 1,                          //...Empurra footer para direita
    minWidth: 25,                         //...Espaco minimo de 25px
  },

  // Footer: Container com hora e status
  footer: {
    minHeight: 20,                        //...Altura minima do container
    paddingHorizontal: 10,                //...Padding horizontal
    paddingTop: 2,                        //...Padding superior
    backgroundColor: 'rgba(252, 252, 252, 0.5)', //...Fundo branco translucido
    borderTopLeftRadius: 12,              //...Arredonda canto superior esquerdo
    borderBottomRightRadius: 6,           //...Arredonda igual ao bubble
    flexDirection: 'row',                 //...Layout horizontal
    alignItems: 'center',                 //...Centraliza vertical
    justifyContent: 'center',             //...Centraliza horizontal
    gap: 2,                               //...Espaco entre hora e check
    marginLeft: 'auto',                   //...Empurra para extrema direita
    marginTop: 4,                         //...Distancia do conteudo
    marginRight: -10,                     //...Estende alem da borda do bubble
    marginBottom: 0,                     //...Encaixe na borda inferior
    borderRightWidth: 1,                  //...Borda direita continua do bubble
    borderBottomWidth: 0,                 //...Sem borda inferior
  },

  // Footer transparente para mensagens outgoing (sem fundo branco)
  footerOutgoing: {
    backgroundColor: 'transparent',       //...Sem fundo branco
    borderRightWidth: 0,                  //...Sem borda direita
    borderBottomWidth: 0,                 //...Sem borda inferior
    marginRight: -12,                      //...Ajuste margem sem borda
    marginBottom: 0,                      //...Ajuste margem sem borda
    paddingBottom: 0,                     //...Espaco abaixo do check
  },

  // Footer dos cards Instagram (posicao independente dos cards de mensagem)
  footerLinkPreview: {
    marginTop: -1,     
    marginBottom: 4,                     //...Ajuste vertical timestamp Instagram
  },

  // Timestamp
  timestamp: {
    fontFamily: 'Inter_300Light',         //...Fonte light padronizada
    fontSize: 12,                         //...Tamanho fonte
    lineHeight: 12,                       //...Altura linha
    color: '#3A3F51',                     //...Cor preta
    fontVariant: ['tabular-nums'],        //...Digitos com largura fixa (alinha timestamps)
  },

  // Timestamp outgoing (posicao vertical independente)
  timestampOutgoing: {
    color: '#FFFFFF',                     //...Cor branca
    marginBottom: -3,                      //...Ajuste vertical do horario
  },

  // Wrapper do check icon (posicao vertical independente)
  checkWrapper: {
    marginTop: -2,                        //...Ajuste vertical padronizado
  },

  // Botao de encaminhar (circulo com seta)
  forwardButton: {
    width: 28,                            //...Largura do botao
    height: 28,                           //...Altura do botao
    borderRadius: 14,                     //...Circulo perfeito
    backgroundColor: 'rgba(0,0,0,0.35)',  //...Fundo escuro translucido
    justifyContent: 'center',             //...Centraliza icone vertical
    alignItems: 'center',                 //...Centraliza icone horizontal
    alignSelf: 'center',                  //...Centraliza vertical com o card
    marginHorizontal: 10,                 //...10px de espaco do card
  },

  // Badge de Reacao no canto inferior direito
  reactionBadge: {
    position: 'absolute',                   //...Posicao absoluta
    bottom: -20,                            //...Abaixo da bolha (igual ImageMessage)
    right: 10,                              //...Alinha direita (igual ImageMessage)
    backgroundColor: '#FFFFFF',             //...Fundo branco
    borderRadius: 8,                        //...Bordas arredondadas
    paddingHorizontal: 6,                   //...Padding horizontal
    paddingVertical: 2,                     //...Padding vertical
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)' }
      : {
          shadowColor: '#000',              //...Sombra nativa
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,               //...Opacidade sombra
          shadowRadius: 2,                  //...Raio sombra
          elevation: 3,                     //...Elevacao Android
        }),
    zIndex: 10,                             //...Camada superior
  },

  // Texto do Emoji de Reacao
  reactionText: {
    fontSize: 16,                           //...Tamanho emoji
  },

  // Container do reply
  replyContainer: {
    flexDirection: 'row',                 //...Layout horizontal
    borderRadius: 8,                      //...Borda arredondada
    marginBottom: 8,                      //...Margem inferior
    overflow: 'visible',                  //...DEBUG: Nao cortar overflow
    minHeight: 65,                        //...Altura minima para thumbnail visivel
    position: 'relative',                 //...Contexto para posicionamento
  },

  // Reply mensagem recebida
  replyIncoming: {
    backgroundColor: ChatColors.replyBackground, //...Cor fundo reply
  },

  // Reply mensagem enviada (fundo azul escuro para destaque)
  replyOutgoing: {
    backgroundColor: 'rgba(0,0,0,0.2)',       //...Escurece o azul do bubble
  },

  // Barra lateral do reply
  replyBar: {
    width: 4,                             //...Largura barra
    backgroundColor: ChatColors.replyBorder, //...Cor borda reply
  },

  // Barra lateral do reply em outgoing (azul claro destaque)
  replyBarOutgoing: {
    backgroundColor: '#A0D2F0',           //...Azul claro da familia primaria
  },

  // Conteudo do reply
  replyContent: {
    flexShrink: 1,                        //...Encolhe se necessario
    flexGrow: 1,                          //...Cresce para ocupar espaco
    padding: 8,                           //...Padding interno
    justifyContent: 'center',             //...Alinha verticalmente no centro
    minWidth: 0,                          //...Permite encolher abaixo do conteudo
  },

  // Nome remetente reply
  replySender: {
    fontFamily: 'Inter_600SemiBold',      //...Fonte bold
    fontSize: 13,                         //...Tamanho fonte (+1px)
    color: ChatColors.replyBorder,        //...Cor azul
    marginBottom: 2,                      //...Margem inferior
  },

  // Nome remetente reply outgoing
  replySenderOutgoing: {
    color: '#A0D2F0',                     //...Azul claro da familia primaria
  },

  // Row com icone e texto do reply
  replyTextRow: {
    flexDirection: 'row',                 //...Layout horizontal
    alignItems: 'center',                 //...Alinha verticalmente
    gap: 2,                               //...Espaco entre icone e texto
  },

  // Texto do reply
  replyText: {
    fontFamily: 'Inter_300Light',         //...Fonte light padronizada
    fontSize: 12,                         //...Tamanho fonte
    color: ChatColors.replyText,          //...Cor texto
  },

  // Texto reply outgoing
  replyTextOutgoing: {
    color: '#FFFFFF',                     //...Branco total
  },

  // Wrapper do thumbnail (container flexbox no final do row)
  replyThumbnailWrapper: {
    width: 55,                            //...Largura fixa
    minHeight: 65,                        //...Altura minima
    alignSelf: 'stretch',                 //...Estica para altura do container
    borderTopRightRadius: 6,              //...Arredondamento superior direito
    borderBottomRightRadius: 6,           //...Arredondamento inferior direito
    overflow: 'hidden',                   //...Corta imagem nas bordas
    backgroundColor: '#E0E0E0',           //...Fundo enquanto carrega
  },

  // Placeholder do thumbnail (quando nao tem imagem)
  replyThumbnailPlaceholder: {
    width: '100%',                        //...Largura total
    height: '100%',                       //...Altura total
    backgroundColor: '#D0D0D0',           //...Fundo cinza placeholder
  },
});
