// ========================================
// Componente MessageOptions
// Menu de contexto WhatsApp (long press)
// Fundo borrado + barra de reacoes +
// preview da mensagem + opcoes completas
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useCallback,                            //......Hook de callback
  useMemo,                                //......Hook de memo
  useState,                               //......Hook de estado
  useEffect,                              //......Hook de efeito
  useRef,                                 //......Hook de referencia
  memo,                                   //......Memoizacao
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  Modal,                                  //......Modal nativo
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  Platform,                               //......Plataforma
  Image,                                  //......Imagem
  Dimensions,                             //......Dimensoes da tela
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  WhatsAppMessage,                        //......Tipo mensagem
  TextContent,                            //......Conteudo texto
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
  AudioContent,                           //......Conteudo audio
  MediaGroupData,                         //......Dados grupo de midias
} from '../../types/08.types.whatsapp';

// ========================================
// Imports de Temas
// ========================================
import { useTheme } from '../../styles/themes/ThemeContext';

// ========================================
// Imports de Componentes
// ========================================
import AudioMessage from '../Messages/08.05.AudioMessage';
import MessageBubble from '../Messages/08.03.MessageBubble';
import TextMessage from '../Messages/08.04.TextMessage';
import MediaGridMessage from '../Messages/08.14.MediaGridMessage';

// ========================================
// Imports de Servicos (cache + Evolution API)
// ========================================
import { evolutionService } from '../../../../services/evolutionService';
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Emojis de Reacao Rapida (mesmo padrao ImageViewer/VideoViewer)
// ========================================
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// ========================================
// Captura global da posicao Y do ponteiro (module-level, sem depender de Platform)
// ========================================
let _lastPointerY = 0;                                   //......Ultima posicao Y capturada
if (typeof window !== 'undefined') {                      //......Verifica se esta no browser
  window.addEventListener('pointerdown', (e) => { _lastPointerY = e.clientY; }, true);
  window.addEventListener('mousedown', (e) => { _lastPointerY = e.clientY; }, true);
  window.addEventListener('touchstart', (e: any) => {     //......Touch fallback
    _lastPointerY = e.touches?.[0]?.clientY ?? 0;
  }, true);
}

// ========================================
// Dimensoes da Tela
// ========================================
const SCREEN_WIDTH = Dimensions.get('window').width;   //......Largura da tela
const SCREEN_HEIGHT = Dimensions.get('window').height;  //......Altura da tela
const CHAT_WIDTH = SCREEN_WIDTH - 24;                      //......Largura util do chat (mesmo calculo do ImageMessage)
const PREVIEW_MAX_WIDTH = Math.round(CHAT_WIDTH * 0.72);   //......Mesma largura da imagem no chat
const BUBBLE_MAX_W = Math.round(CHAT_WIDTH * 0.80);       //......Largura da bolha no chat (80% do container)
const CARD_RADIUS = 8;                                  //......Cantos levemente arredondados (padrao quadrado)
const VERTICAL_PADDING = 15;                            //......Margem max topo/fundo
const OPTION_ROW_H = 48;                                //......Altura estimada por opcao
const REACTION_BAR_H = 56;                              //......Altura estimada barra reacoes
const GAP = 10;                                          //......Espaco entre blocos

// ========================================
// Normalizacao de Emoji (remove variation selectors para comparacao)
// ========================================
const normalizeEmoji = (e: string) => e.replace(/\uFE0F/g, '');

// ========================================
// Cores do Menu (tema claro)
// ========================================
const ICON_COLOR = '#54656F';
const DELETE_COLOR = '#E53935';
const OPTIONS_BG = '#FFFFFF';
const OPTION_TEXT = '#111B21';
const SEPARATOR_COLOR = '#E5E7EB';

// ========================================
// Interface de Props
// ========================================
interface MessageOptionsProps {
  visible: boolean;                       //......Visibilidade
  message: WhatsAppMessage | null;        //......Mensagem selecionada
  instanceName?: string;                  //......Instancia Evolution API
  pressY?: number;                        //......Posicao Y do long press
  onClose: () => void;                    //......Handler fechar
  onReply: () => void;                    //......Handler responder
  onCopy: () => void;                     //......Handler copiar
  onForward: () => void;                  //......Handler encaminhar
  onDelete: () => void;                   //......Handler excluir
  onReaction?: (emoji: string | null) => void;  //......Handler reacao
  currentReaction?: string | null;        //......Reacao atual da mensagem
  onTranscribe?: () => void;             //......Handler transcrever audio
  isMediaGroup?: boolean;                 //......Modo galeria (opcoes simplificadas)
  mediaGroupData?: MediaGroupData | null; //......Dados do grupo para preview
}

// ========================================
// Icone de Responder (seta curvada para esquerda)
// ========================================
const ReplyIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 17L4 12L9 7"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M20 18V15C20 13.9391 19.5786 12.9217 18.8284 12.1716C18.0783 11.4214 17.0609 11 16 11H4"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Encaminhar (seta para direita)
// ========================================
const ForwardIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 7L20 12L15 17"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M4 18V15C4 13.9391 4.42143 12.9217 5.17157 12.1716C5.92172 11.4214 6.93913 11 8 11H20"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Copiar
// ========================================
const CopyIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Dados (info circle)
// ========================================
const InfoIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke={color} strokeWidth={2}
    />
    <Path d="M12 16V12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 8H12.01" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Icone de Favoritar (estrela)
// ========================================
const StarIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color} strokeWidth={2} strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Fixar (pin/alfinete)
// ========================================
const PinIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 17V22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path
      d="M5 17H19V15L15 11V5C15 4.44772 14.5523 4 14 4H10C9.44772 4 9 4.44772 9 5V11L5 15V17Z"
      stroke={color} strokeWidth={2} strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Excluir (lixeira)
// ========================================
const DeleteIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path d="M10 11V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M14 11V17" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Icone de Mais (+) para picker completo
// ========================================
const PlusIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12H19"
      stroke="#54656F" strokeWidth={2.5} strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Play (para preview de video)
// ========================================
const PlayIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M8 5V19L19 12L8 5Z" fill="#FFFFFF" />
  </Svg>
);

// ========================================
// Icone de Mais Opcoes (tres pontos verticais)
// ========================================
const MoreDotsIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V5.01M12 12V12.01M12 19V19.01"
      stroke={color} strokeWidth={3} strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Icone de Transcrever (balao com linhas de texto)
// ========================================
const TranscribeIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path d="M8 8H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M8 12H13" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Configuracao dos Itens do Menu
// ========================================
const MESSAGE_OPTIONS = [
  { id: 'transcribe', label: 'Transcrever', icon: TranscribeIcon },
  { id: 'reply',    label: 'Responder',  icon: ReplyIcon },
  { id: 'forward',  label: 'Encaminhar', icon: ForwardIcon },
  { id: 'copy',     label: 'Copiar',     icon: CopyIcon },
  { id: 'info',     label: 'Dados',      icon: InfoIcon },
  { id: 'favorite', label: 'Favoritar',  icon: StarIcon },
  { id: 'pin',      label: 'Fixar',      icon: PinIcon },
  { id: 'delete',   label: 'Apagar',     icon: DeleteIcon },
];

// ========================================
// Sub-componente PreviewImage
// Carrega imagem HD do cache/API (URL HTTP expira)
// ========================================
interface PreviewImageProps {
  url?: string;                           //......URL HTTP (chave do cache)
  thumbnail?: string;                     //......Thumbnail base64 (fallback)
  messageKey?: any;                       //......MessageKey para Evolution API
  instanceName?: string;                  //......Instancia Evolution
  width: number;                          //......Largura de exibicao
  height: number;                         //......Altura de exibicao
}

const PreviewImage = memo<PreviewImageProps>(({
  url,
  thumbnail,
  messageKey,
  instanceName,
  width,
  height,
}) => {
  const [uri, setUri] = useState<string | null>(thumbnail || null);

  // Buscar imagem HD: cache -> Evolution API -> thumbnail fallback
  useEffect(() => {
    if (!url?.startsWith('http')) return;  //......Sem URL valida
    let cancelled = false;                 //......Flag de cancelamento

    (async () => {
      // Passo 1: Verificar cache local (mediaStorageService)
      try {
        const cached = await mediaStorageService.getMedia(url);
        if (cached && cached.length > 1000 && !cancelled) {
          if (!cached.startsWith('data:application/octet-stream')) {
            setUri(cached);                //......Usar imagem HD do cache
            return;
          }
        }
      } catch {}

      // Passo 2: Buscar via Evolution API
      if (messageKey && instanceName && !cancelled) {
        try {
          const media = await evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
          if (media?.base64 && !cancelled) {
            let mimeType = media.mimeType || 'image/jpeg';
            if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
              mimeType = 'image/jpeg';     //......Forcar MIME valido
            }
            let b64 = media.base64;
            if (b64.startsWith('data:')) {
              const ci = b64.indexOf(',');
              if (ci !== -1) b64 = b64.substring(ci + 1);
            }
            const dataUri = `data:${mimeType};base64,${b64}`;
            mediaStorageService.saveMedia(url, dataUri, mimeType).catch(() => {});
            if (!cancelled) {
              setUri(dataUri);             //......Usar imagem HD da API
              return;
            }
          }
        } catch {}
      }
    })();

    return () => { cancelled = true; };    //......Cancelar ao desmontar
  }, [url, messageKey, instanceName]);

  // Render: imagem ou placeholder
  if (!uri) {
    return (
      <View style={{
        width,
        height,
        borderRadius: CARD_RADIUS - 3,    //......Bordas internas (card - padding)
        backgroundColor: '#E0E0E0',       //......Fundo placeholder
      }} />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius: CARD_RADIUS - 3 }}
      resizeMode="cover"
    />
  );
});

// ========================================
// Helper: Formata horario (HH:MM)
// ========================================
const formatTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

// ========================================
// Componente Principal MessageOptions
// ========================================
const MessageOptions: React.FC<MessageOptionsProps> = ({
  visible,                                //......Visibilidade
  message,                                //......Mensagem
  instanceName,                           //......Instancia Evolution
  pressY = 0,                             //......Posicao Y do long press
  onClose,                                //......Handler fechar
  onReply,                                //......Handler responder
  onCopy,                                 //......Handler copiar
  onForward,                              //......Handler encaminhar
  onDelete,                               //......Handler excluir
  onReaction,                             //......Handler reacao
  currentReaction,                        //......Reacao atual
  onTranscribe,                           //......Handler transcrever
  isMediaGroup = false,                   //......Modo galeria
  mediaGroupData,                         //......Dados grupo para preview
}) => {
  // ========================================
  // Contexto do Tema (cores da bolha)
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Estado de paginacao de opcoes
  // ========================================
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Ref para onTranscribe (evita stale closure no useCallback)
  const onTranscribeRef = useRef(onTranscribe);  //......Ref atualizada a cada render
  useEffect(() => {
    onTranscribeRef.current = onTranscribe;      //......Sincroniza ref com prop
  }, [onTranscribe]);

  // Resetar pagina ao mudar mensagem
  useEffect(() => {
    setShowMoreOptions(false);                //......Volta para pagina 1
  }, [message?.id]);

  // ========================================
  // Dados derivados da mensagem
  // ========================================
  const isOutgoing = message?.direction === 'outgoing';
  const canCopy = message?.type !== 'audio';          //......Copiar para texto, imagem e video

  // Posicao: metade superior → alinha no topo, metade inferior → alinha embaixo
  // Usa _lastPointerY (module-level) como fonte primaria, pressY como fallback
  const effectiveY = _lastPointerY || (pressY ?? 0);     //......Y efetivo
  const screenH = typeof window !== 'undefined' ? window.innerHeight : SCREEN_HEIGHT;
  const alignBottom = effectiveY > screenH / 2;           //......Bolha na metade inferior
  // ========================================
  // Handler de Selecao de Opcao
  // ========================================
  const handleSelect = useCallback((id: string) => {
    switch (id) {
      case 'transcribe':                  //......Transcrever audio
        if (onTranscribeRef.current) {
          onTranscribeRef.current();      //......Usa ref para evitar stale closure
        }
        return;                           //......Nao chamar onClose (evita race condition)
      case 'reply':                       //......Responder
        onReply();
        break;
      case 'copy':                        //......Copiar
        onCopy();
        break;
      case 'forward':                     //......Encaminhar
        onForward();
        break;
      case 'delete':                      //......Excluir
        onDelete();
        break;
      case 'info':                        //......Dados (placeholder)
      case 'favorite':                    //......Favoritar (placeholder)
      case 'pin':                         //......Fixar (placeholder)
        console.log(`[MessageOptions] ${id} selecionado`);
        break;
    }
    onClose();                            //......Fecha menu
  }, [onClose, onReply, onCopy, onForward, onDelete]);

  // ========================================
  // Handler de Selecao de Reacao
  // ========================================
  const handleSelectReaction = useCallback((emoji: string) => {
    const isSame = currentReaction && normalizeEmoji(currentReaction) === normalizeEmoji(emoji);
    const newReaction = isSame ? null : emoji; //......Toggle: remove se igual
    onReaction?.(newReaction);
    onClose();                            //......Fecha menu apos reacao
  }, [currentReaction, onReaction, onClose]);

  // ========================================
  // Dimensoes do Preview (replica calculo EXATO do ImageMessage)
  // ========================================
  const previewDims = useMemo(() => {
    if (!message) return { w: PREVIEW_MAX_WIDTH, h: PREVIEW_MAX_WIDTH };
    if (message.type === 'image' || message.type === 'video') {
      const content = message.content as ImageContent | VideoContent;

      // Constantes identicas ao ImageMessage
      const maxImageWidth = Math.max(CHAT_WIDTH * 0.72, 150);
      const maxHViewport = SCREEN_HEIGHT * 0.75;        //......75% da tela
      const maxHRatio = maxImageWidth * 1.15;            //......Proporcao 1.15
      const maxImageHeight = Math.max(Math.min(maxHViewport, maxHRatio), 100);

      // Aspect ratio (identico ao ImageMessage)
      let aspectRatio = 0.75;                            //......Padrao portrait 3:4
      if (content.width > 0 && content.height > 0) {
        aspectRatio = content.width / content.height;
      }

      // Calculo identico ao calculateDimensions do ImageMessage
      let bw: number;                                    //......Bubble width
      let bh: number;                                    //......Bubble height
      const PORTRAIT_WIDTH = 0.85;                       //......85% para portraits

      if (aspectRatio >= 1.0) {
        bw = maxImageWidth;                              //......Landscape: largura maxima
        bh = maxImageWidth / aspectRatio;                //......Altura proporcional
        if (bh > maxImageHeight) {
          bh = maxImageHeight;                           //......Clamp altura
          bw = maxImageHeight * aspectRatio;             //......Ajusta largura
        }
      } else {
        bw = maxImageWidth * PORTRAIT_WIDTH;             //......Portrait: 85% da largura
        bh = bw / aspectRatio;                           //......Altura proporcional
        if (bh > maxImageHeight) bh = maxImageHeight;   //......Clamp altura
      }

      if (bw < 150) bw = 150;                           //......Minimo largura
      if (bh < 100) bh = 100;                           //......Minimo altura

      // Inner = bubble - 6 (wrapper padding:3 de cada lado, igual ImageMessage)
      let w = Math.round(bw) - 6;                       //......Largura visivel da imagem
      let h = Math.round(bh) - 6;                       //......Altura visivel da imagem

      // Limitar altura ao espaco disponivel no modal
      const maxModalH = SCREEN_HEIGHT - (VERTICAL_PADDING * 2) - REACTION_BAR_H - (GAP * 2) - (3 * OPTION_ROW_H) - 6;
      if (h > maxModalH) h = Math.max(94, maxModalH);   //......Minimo 94px (100-6)

      return { w, h };
    }
    return { w: PREVIEW_MAX_WIDTH, h: 0 };
  }, [message]);

  // Larguras independentes por card
  const imageCardW = previewDims.w + 6;              //......Largura do card de imagem (igual chat)
  const menuCardW = PREVIEW_MAX_WIDTH + 6;           //......Largura fixa para reacoes e opcoes

  // ========================================
  // Paginacao de Opcoes (quando nao cabem na tela)
  // ========================================
  const isAudio = message?.type === 'audio';             //......Tipo audio
  const filteredOptions = MESSAGE_OPTIONS.filter(opt => {
    if (opt.id === 'copy' && !canCopy) return false;     //......Copiar so para texto/imagem/video
    if (opt.id === 'transcribe' && !isAudio) return false; //......Transcrever so para audio
    return true;
  });

  const { visibleOptions, needsMore } = useMemo(() => {
    const imageH = previewDims.h > 0 ? previewDims.h + 6 : 0;
    const usedH = (VERTICAL_PADDING * 2) + REACTION_BAR_H + (GAP * 2) + imageH;
    const availH = SCREEN_HEIGHT - usedH;    //......Espaco para opcoes
    const maxRows = Math.max(2, Math.floor(availH / OPTION_ROW_H));
    const all = filteredOptions;
    if (all.length <= maxRows) {
      return { visibleOptions: all, needsMore: false };
    }
    if (!showMoreOptions) {
      return { visibleOptions: all.slice(0, maxRows - 1), needsMore: true };
    }
    return { visibleOptions: all.slice(maxRows - 1), needsMore: true };
  }, [filteredOptions, previewDims.h, showMoreOptions]);

  // ========================================
  // Render do Preview da Mensagem
  // ========================================
  const renderPreview = () => {
    if (!message) return null;

    switch (message.type) {
      // Imagem: mostra em tamanho real (cache HD → API → thumbnail)
      case 'image': {
        const content = message.content as ImageContent;
        return (
          <View style={[styles.previewCard, isOutgoing ? styles.previewOutgoing : styles.previewIncoming, { width: imageCardW }]}>
            <PreviewImage
              url={content.url}
              thumbnail={content.thumbnail}
              messageKey={message.messageKey}
              instanceName={instanceName}
              width={previewDims.w}
              height={previewDims.h}
            />
            {/* Timestamp overlay */}
            <View style={styles.previewTimeOverlay}>
              <Text style={styles.previewTimeText}>{formatTime(message.timestamp)}</Text>
            </View>
          </View>
        );
      }

      // Video: mostra thumbnail em tamanho real (cache HD → thumbnail)
      case 'video': {
        const content = message.content as VideoContent;
        return (
          <View style={[styles.previewCard, isOutgoing ? styles.previewOutgoing : styles.previewIncoming, { width: imageCardW }]}>
            <PreviewImage
              url={content.url}
              thumbnail={content.thumbnail}
              messageKey={message.messageKey}
              instanceName={instanceName}
              width={previewDims.w}
              height={previewDims.h}
            />
            {/* Play icon overlay */}
            <View style={styles.videoPlayOverlay}>
              <View style={styles.videoPlayBtn}>
                <PlayIcon />
              </View>
            </View>
            {/* Timestamp overlay */}
            <View style={styles.previewTimeOverlay}>
              <Text style={styles.previewTimeText}>{formatTime(message.timestamp)}</Text>
            </View>
          </View>
        );
      }

      // Texto: usa MessageBubble + TextMessage real (identico ao chat)
      case 'text': {
        const content = message.content as TextContent;
        return (
          <View style={{ marginBottom: GAP, width: CHAT_WIDTH }}>
            <MessageBubble
              direction={message.direction}            //......Direcao
              status={message.status}                  //......Status (check marks)
              timestamp={message.timestamp}            //......Hora
              replyTo={message.replyTo}                //......Reply com thumbnail
              isTextMessage={true}                     //......E texto
              instanceName={instanceName}              //......Instancia Evolution (thumb HD)
            >
              <TextMessage
                content={content}                      //......Conteudo texto
                isOutgoing={isOutgoing ?? false}        //......Direcao
              />
            </MessageBubble>
          </View>
        );
      }

      // Audio: renderiza componente real AudioMessage (identico ao chat)
      case 'audio': {
        const content = message.content as AudioContent;
        const bubbleBg = isOutgoing ? colors.outgoingBubble : colors.incomingBubble;
        return (
          <View style={[
            styles.audioBubblePreview,
            isOutgoing
              ? { backgroundColor: bubbleBg, borderWidth: 0 }
              : { backgroundColor: bubbleBg, borderColor: colors.incomingBorder, borderWidth: 0.5 },
            { width: BUBBLE_MAX_W },
          ]}>
            <AudioMessage
              content={content}
              isOutgoing={isOutgoing}
              timestamp={message.timestamp}
              status={message.status}
              timestampStyle="transparent"
            />
          </View>
        );
      }

      default:
        return null;
    }
  };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}                   //......Visibilidade
      transparent                         //......Fundo transparente
      animationType="fade"                //......Animacao fade
      onRequestClose={onClose}            //......Handler fechar
    >
      {/* Overlay borrado - toque fecha */}
      <Pressable
        style={styles.overlay}
        onPress={onClose}                 //......Handler fechar
      >
        {/* Spacer flexivel - empurra menu para baixo quando bolha esta na parte inferior */}
        {alignBottom && <View style={{ flex: 1 }} />}

        {/* Container alinhado ao lado da bolha (direita=outgoing, esquerda=incoming) */}
        <View
          style={[
            styles.menuContainer,
            isOutgoing
              ? { alignSelf: 'flex-end', alignItems: 'flex-end', marginRight: 12 }
              : { alignSelf: 'flex-start', alignItems: 'flex-start', marginLeft: 12 },
          ]}
        >
          {/* Barra de Reacoes Rapidas (oculta para galeria) */}
          {onReaction && !isMediaGroup && (
            <View style={[styles.reactionsBar, { width: menuCardW }]}>
              {REACTION_EMOJIS.map((emoji, index) => (
                <Pressable
                  key={`reaction-${index}`}
                  style={({ pressed }) => [
                    styles.reactionBtn,
                    currentReaction && normalizeEmoji(currentReaction) === normalizeEmoji(emoji) && styles.reactionBtnSelected,
                    pressed && styles.reactionBtnPressed,
                  ]}
                  onPress={() => handleSelectReaction(emoji)}
                >
                  <Text style={styles.reactionText}>{emoji}</Text>
                </Pressable>
              ))}

              {/* Botao Mais (+) */}
              <Pressable
                style={({ pressed }) => [
                  styles.reactionBtn,
                  pressed && styles.reactionBtnPressed,
                ]}
                onPress={() => {
                  // TODO: Abrir picker completo de emojis
                  onClose();
                }}
              >
                <PlusIcon />
              </Pressable>
            </View>
          )}

          {/* Preview da Mensagem ou Grid de Galeria */}
          {isMediaGroup && mediaGroupData ? (
            <View style={{ position: 'relative', marginBottom: GAP }}>
              <MediaGridMessage
                group={mediaGroupData}
                timestampStyle="transparent"
                instanceName={instanceName}
              />
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={onClose}
              />
            </View>
          ) : !isMediaGroup ? (
            <View style={{ position: 'relative' }}>
              {renderPreview()}
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={onClose}
              />
            </View>
          ) : null}

          {/* Card de Opcoes (tema claro) */}
          <View style={[styles.optionsCard, { width: menuCardW }]}>
            {/* Modo galeria: apenas Encaminhar tudo + Apagar tudo */}
            {isMediaGroup ? (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.optionRow,
                    styles.optionSeparator,
                    pressed && styles.optionRowPressed,
                  ]}
                  onPress={() => { onForward(); onClose(); }}
                >
                  <Text style={styles.optionLabel}>Encaminhar tudo</Text>
                  <ForwardIcon color={ICON_COLOR} size={20} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && styles.optionRowPressed,
                  ]}
                  onPress={() => { onDelete(); onClose(); }}
                >
                  <Text style={[styles.optionLabel, styles.deleteLabel]}>Apagar tudo</Text>
                  <DeleteIcon color={DELETE_COLOR} size={20} />
                </Pressable>
              </>
            ) : (
              <>
                {visibleOptions.map((option) => {
                  const isDelete = option.id === 'delete';
                  const IconComponent = option.icon;

                  return (
                    <Pressable
                      key={option.id}
                      style={({ pressed }) => [
                        styles.optionRow,
                        styles.optionSeparator,
                        pressed && styles.optionRowPressed,
                      ]}
                      onPress={() => handleSelect(option.id)}
                    >
                      <Text style={[styles.optionLabel, isDelete && styles.deleteLabel]}>
                        {option.label}
                      </Text>
                      <IconComponent color={isDelete ? DELETE_COLOR : ICON_COLOR} size={20} />
                    </Pressable>
                  );
                })}

                {/* Botao Mais / Voltar (quando opcoes nao cabem) */}
                {needsMore && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionRow,
                      pressed && styles.optionRowPressed,
                    ]}
                    onPress={() => setShowMoreOptions(!showMoreOptions)}
                  >
                    <Text style={styles.optionLabel}>
                      {showMoreOptions ? 'Voltar' : 'Mais'}
                    </Text>
                    <MoreDotsIcon color={ICON_COLOR} size={20} />
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// ========================================
// Export Default
// ========================================
export default MessageOptions;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // ========================================
  // Overlay borrado fullscreen
  // ========================================
  overlay: {
    flex: 1,                              //......Ocupa espaco total
    backgroundColor: 'rgba(0,0,0,0.7)',   //......Fundo escuro
    paddingTop: VERTICAL_PADDING,         //......15px margem superior
    paddingBottom: VERTICAL_PADDING,      //......15px margem inferior
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        } as any
      : {}),
  },

  // Container do menu (reacoes + preview + opcoes)
  menuContainer: {
    // alignItems definido inline (flex-end ou flex-start conforme direcao)
  },

  // ========================================
  // Barra de Reacoes Rapidas
  // ========================================
  reactionsBar: {
    flexDirection: 'row',                 //......Layout horizontal
    backgroundColor: '#FFFFFF',           //......Fundo branco
    borderRadius: CARD_RADIUS,            //......Cantos levemente arredondados (padrao quadrado)
    paddingHorizontal: 6,                 //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    justifyContent: 'space-between',      //......Distribui igual
    marginBottom: GAP,                    //......Espaco ate preview
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.12)' } as any
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 2,
        }),
  },

  // Botao de reacao individual
  reactionBtn: {
    width: 36,                            //......Largura (cabe no card)
    height: 36,                           //......Altura
    borderRadius: 18,                     //......Circulo
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao de reacao selecionado (maior + destaque azul)
  reactionBtnSelected: {
    backgroundColor: 'rgba(23, 119, 207, 0.2)',
    transform: [{ scale: 1.15 }],         //......Escala levemente maior
  },

  // Botao de reacao pressionado
  reactionBtnPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },

  // Texto do emoji
  reactionText: {
    fontSize: 24,                         //......Tamanho do emoji (cabe em 36px btn)
  },

  // ========================================
  // Preview da Mensagem
  // ========================================

  // Card de preview para imagem/video (padding como borda = anti-aliasing fix)
  previewCard: {
    borderRadius: CARD_RADIUS,            //......Cantos levemente arredondados (padrao quadrado)
    marginBottom: GAP,                    //......Espaco ate opcoes
    position: 'relative',                 //......Para overlay de timestamp
    padding: 3,                           //......Padding como borda visual
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

  // Borda de preview outgoing (azul claro = igual bolha ImageMessage)
  previewOutgoing: {
    backgroundColor: '#C8E4FF',           //......Azul claro (igual ImageMessage outgoing)
  },

  // Borda de preview incoming (branco = igual bolha ImageMessage)
  previewIncoming: {
    backgroundColor: '#FFFFFF',           //......Branco (igual ImageMessage incoming)
  },

  // Overlay de timestamp (canto inferior direito)
  previewTimeOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: 6,                            //......Margem inferior
    right: 8,                             //......Margem direita
    backgroundColor: 'rgba(0,0,0,0.5)',   //......Fundo semi-transparente
    borderRadius: 4,                      //......Bordas arredondadas
    paddingHorizontal: 6,                 //......Padding horizontal
    paddingVertical: 2,                   //......Padding vertical
  },

  // Texto do timestamp no overlay
  previewTimeText: {
    color: '#FFFFFF',                     //......Branco
    fontSize: 11,                         //......Tamanho pequeno
    fontFamily: 'Inter_400Regular',       //......Fonte regular
  },

  // Preview de texto (bubble)
  textPreview: {
    borderRadius: CARD_RADIUS,            //......Cantos levemente arredondados (padrao quadrado)
    paddingHorizontal: 14,                //......Padding horizontal
    paddingVertical: 10,                  //......Padding vertical
    marginBottom: GAP,                    //......Espaco ate opcoes
  },

  // Bubble outgoing (azul = igual bolha do chat)
  textPreviewOutgoing: {
    backgroundColor: '#D9ECFF',           //......Azul claro (fundo bolha outgoing)
  },

  // Bubble incoming (branco = igual bolha do chat)
  textPreviewIncoming: {
    backgroundColor: '#FFFFFF',           //......Branco (fundo bolha incoming)
  },

  // Texto do conteudo
  textPreviewContent: {
    fontSize: 15,                         //......Tamanho do texto
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    lineHeight: 20,                       //......Altura da linha
  },

  // Timestamp do texto
  textPreviewTime: {
    fontSize: 11,                         //......Tamanho pequeno
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    textAlign: 'right',                   //......Alinha direita
    marginTop: 4,                         //......Espaco superior
  },

  // Preview de audio (identico ao MessageBubble do chat)
  audioBubblePreview: {
    paddingVertical: 6,                   //......Mesmo padding do MessageBubble
    paddingHorizontal: 8,                 //......Mesmo padding do MessageBubble
    borderRadius: 8,                      //......Mesmo raio do MessageBubble
    overflow: 'visible',                  //......Permite timestamp absoluto
    marginBottom: GAP,                    //......Espaco ate opcoes
  },

  // Overlay de play no video
  videoPlayOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Preenche
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Botao de play do video
  videoPlayBtn: {
    width: 44,                            //......Largura
    height: 44,                           //......Altura
    borderRadius: 22,                     //......Circulo
    backgroundColor: 'rgba(0,0,0,0.5)',   //......Fundo semi-transparente
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
  },

  // ========================================
  // Card de Opcoes (tema claro)
  // ========================================
  optionsCard: {
    backgroundColor: OPTIONS_BG,          //......Fundo branco
    borderRadius: CARD_RADIUS,            //......Cantos levemente arredondados (padrao quadrado)
    overflow: 'hidden',                   //......Corta overflow
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 10px rgba(0,0,0,0.15)' } as any
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 5,
        }),
  },

  // Linha de opcao
  optionRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    justifyContent: 'space-between',      //......Label esquerda, icone direita
    paddingVertical: 14,                  //......Padding vertical
    paddingHorizontal: 20,                //......Padding horizontal
  },

  // Separador entre opcoes
  optionSeparator: {
    borderBottomWidth: 0.5,               //......Borda fina
    borderBottomColor: SEPARATOR_COLOR,   //......Cor sutil
  },

  // Opcao pressionada
  optionRowPressed: {
    backgroundColor: '#F5F6F6',
  },

  // Label da opcao
  optionLabel: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 16,                         //......Tamanho fonte
    color: OPTION_TEXT,                   //......Cor clara
  },

  // Label de delete (vermelho)
  deleteLabel: {
    color: DELETE_COLOR,                  //......Vermelho
  },
});
