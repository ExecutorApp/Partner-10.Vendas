// ========================================
// Hook useMessages
// Gerenciamento de mensagens do chat
// ========================================

// ========================================
// Imports React
// ========================================
import {                                  //......Hooks React
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useEffect,                              //......Hook de efeito
  useRef,                                 //......Hook de referencia
} from 'react';                           //......Biblioteca React

// ========================================
// Imports de Tipos
// ========================================
import {                                  //......Tipos do chat
  WhatsAppMessage,                        //......Interface mensagem
  TextContent,                            //......Conteudo texto
  LinkPreview,                            //......Preview de link
  MessageStatus,                          //......Status
  MessageType,                            //......Tipo mensagem
  ReplyInfo,                              //......Info reply
  MessageKey,                             //......Chave da mensagem
} from '../types/08.types.whatsapp';      //......Arquivo de tipos

// ========================================
// Imports de Utilitarios
// ========================================
import {                                  //......Utilitarios
  generateMessageId,                      //......Gera ID
} from '../data/08.mockMessages';         //......Arquivo utilitarios

// ========================================
// Imports de Servicos
// ========================================
import evolutionService from '../../../services/evolutionService';
import aiService from '../../../services/aiService';
import { indexedDBService } from '../../../services/indexedDBService';
import { mediaStorageService } from '../../../services/mediaStorageService';

// ========================================
// NOTA: WebSocket desabilitado
// ========================================
// Evolution API nao expoe WebSocket nativo.
// Para status em tempo real (delivered/read), seria necessario:
// 1. Configurar webhook HTTP na Evolution API
// 2. Ter backend para receber os webhooks
// 3. Usar polling ou SSE para enviar ao frontend
// Por enquanto, usamos fluxo basico: pending → sent/failed

// ========================================
// Constantes de Log
// ========================================
const DEBUG_ENABLED = false;              //......Flag de debug (desabilitar em prod)
const LOG_PREFIX = '[useMessages]';       //......Prefixo dos logs

// Wrapper de log que pode ser desabilitado
const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    debugLog(...args);
  }
};

// ========================================
// Interface de Parametros
// ========================================
interface UseMessagesParams {
  leadId: string;                         //......ID do lead
  leadPhone: string;                      //......Telefone do lead
  leadName?: string;                      //......Nome do lead (opcional)
}

// ========================================
// Interface de Retorno
// ========================================
interface UseMessagesReturn {
  messages: WhatsAppMessage[];            //......Lista de mensagens
  isLoading: boolean;                     //......Estado de loading
  isSending: boolean;                     //......Estado de envio
  replyingTo: ReplyInfo | null;           //......Reply info
  instanceName: string;                   //......Nome da instancia
  sendTextMessage: (text: string, customReplyInfo?: ReplyInfo | null) => Promise<void>;
  sendAudioMessage: (uri: string, duration: number) => Promise<void>;
  sendImageMessage: (uri: string, width: number, height: number, caption?: string, viewOnce?: boolean) => Promise<void>;
  sendDocumentMessage: (uri: string, fileName: string, size: number) => Promise<void>;
  setReplyTo: (info: ReplyInfo | null) => void;
  deleteMessage: (messageId: string) => void;
  updateMessageReaction: (messageId: string, reaction: string | null) => void;
  refreshMessages: () => void;            //......Recarrega mensagens
  retryAudioMessage: (message: WhatsAppMessage) => Promise<boolean>;
  pausePolling: () => void;               //......Pausa polling (emoji picker)
  resumePolling: () => void;              //......Retoma polling
}

// ========================================
// Interface para resultado da conversao blob
// ========================================
interface BlobConversionResult {
  base64: string;                               //......Base64 puro
  mimeType: string;                             //......Tipo MIME do arquivo
  isVideo: boolean;                             //......Se e video
  isImage: boolean;                             //......Se e imagem
  thumbnail?: string;                           //......Thumbnail base64 para videos
}

// ========================================
// Funcao auxiliar para gerar thumbnail de video
// Usa elemento video e canvas para capturar frame
// ========================================
const generateVideoThumbnail = async (blobUrl: string): Promise<string | undefined> => {
  debugLog(`${LOG_PREFIX} [THUMB] Gerando thumbnail do video...`);

  return new Promise((resolve) => {
    const video = document.createElement('video'); //............. Cria elemento video
    video.crossOrigin = 'anonymous'; //........................... Permite cross-origin
    video.muted = true; //........................................ Muda para evitar auto-play audio
    video.preload = 'metadata'; //................................ Pre-carrega metadados

    // Timeout de seguranca (5 segundos)
    const timeout = setTimeout(() => {
      debugLog(`${LOG_PREFIX} [THUMB] Timeout ao gerar thumbnail`);
      video.remove(); //........ Remove elemento
      resolve(undefined); //.... Retorna undefined
    }, 5000);

    video.onloadeddata = () => {
      debugLog(`${LOG_PREFIX} [THUMB] Video carregado, duracao: ${video.duration}s`);

      // Seek para 1 segundo ou 10% do video (o que for menor)
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime; //.... Posiciona no frame
    };

    video.onseeked = () => {
      try {
        clearTimeout(timeout); //............ Cancela timeout

        // Cria canvas com dimensoes proporcionais (max 320px)
        const canvas = document.createElement('canvas');
        const maxWidth = 320; //............. Largura maxima
        const scale = maxWidth / video.videoWidth;
        canvas.width = maxWidth;
        canvas.height = video.videoHeight * scale;

        debugLog(`${LOG_PREFIX} [THUMB] Canvas: ${canvas.width}x${canvas.height}`);

        // Desenha frame no canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Converte para base64 JPEG (qualidade 0.7)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          debugLog(`${LOG_PREFIX} [THUMB] Thumbnail gerado: ${thumbnail.length} chars`);

          video.remove(); //........ Remove elemento video
          resolve(thumbnail); //.... Retorna thumbnail
        } else {
          console.error(`${LOG_PREFIX} [THUMB] Erro ao obter contexto 2D`);
          video.remove();
          resolve(undefined);
        }
      } catch (error) {
        console.error(`${LOG_PREFIX} [THUMB] Erro ao gerar thumbnail:`, error);
        video.remove();
        resolve(undefined);
      }
    };

    video.onerror = (error) => {
      clearTimeout(timeout);
      console.error(`${LOG_PREFIX} [THUMB] Erro ao carregar video:`, error);
      video.remove();
      resolve(undefined);
    };

    video.src = blobUrl; //........ Define source do video
    video.load(); //............... Inicia carregamento
  });
};

// ========================================
// Funcao auxiliar para converter blob URL para base64
// Retorna objeto com base64 e tipo MIME
// ========================================
const blobUrlToBase64 = async (blobUrl: string): Promise<BlobConversionResult> => {
  debugLog(`${LOG_PREFIX} Convertendo blob URL para base64...`);

  try {
    // Busca o blob a partir da URL
    const response = await fetch(blobUrl);       //......Fetch do blob
    const blob = await response.blob();          //......Converte para blob

    const mimeType = blob.type || 'application/octet-stream';
    const isVideo = mimeType.startsWith('video/');
    const isImage = mimeType.startsWith('image/');

    debugLog(`${LOG_PREFIX} Blob type:`, mimeType);
    debugLog(`${LOG_PREFIX} Blob size:`, blob.size);
    debugLog(`${LOG_PREFIX} isVideo:`, isVideo);
    debugLog(`${LOG_PREFIX} isImage:`, isImage);

    // Gera thumbnail se for video (em paralelo com conversao base64)
    let thumbnailPromise: Promise<string | undefined> | undefined;
    if (isVideo) {
      debugLog(`${LOG_PREFIX} Iniciando geracao de thumbnail...`);
      thumbnailPromise = generateVideoThumbnail(blobUrl);
    }

    // Converte blob para base64
    const base64Result = await new Promise<{ base64: string }>((resolve, reject) => {
      const reader = new FileReader();           //......Leitor de arquivo

      reader.onloadend = () => {
        const dataUrl = reader.result as string; //......Resultado data URL
        // Extrai apenas o base64 puro (remove prefixo data:xxx;base64,)
        // Evolution API espera base64 puro sem prefixo
        const base64 = dataUrl.split(',')[1] || dataUrl;
        debugLog(`${LOG_PREFIX} Data URL completo length:`, dataUrl?.length);
        debugLog(`${LOG_PREFIX} Base64 puro length:`, base64?.length);
        debugLog(`${LOG_PREFIX} Base64 prefix:`, base64?.substring(0, 30));
        resolve({ base64 });
      };

      reader.onerror = (error) => {
        console.error(`${LOG_PREFIX} Erro FileReader:`, error);
        reject(error);                           //......Retorna erro
      };

      reader.readAsDataURL(blob);                //......Le como data URL
    });

    // Aguarda thumbnail se for video
    const thumbnail = thumbnailPromise ? await thumbnailPromise : undefined;
    if (thumbnail) {
      debugLog(`${LOG_PREFIX} Thumbnail gerado com sucesso: ${thumbnail.length} chars`);
    }

    return {
      base64: base64Result.base64,               //......Base64 puro
      mimeType,                                  //......Tipo MIME
      isVideo,                                   //......Se e video
      isImage,                                   //......Se e imagem
      thumbnail,                                 //......Thumbnail do video
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Erro ao converter blob:`, error);
    throw error;                                 //......Propaga erro
  }
};

// ========================================
// Funcao auxiliar para formatar numero
// ========================================
const formatPhoneNumber = (phone: string): string => {
  // Remove caracteres nao numericos
  let cleaned = phone.replace(/\D/g, '');

  // Se comeca com 55, mantem; senao, adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }

  debugLog(`${LOG_PREFIX} formatPhoneNumber:`, {
    original: phone,
    formatted: cleaned,
  });

  return cleaned;
};


// ========================================
// Hook Principal useMessages
// ========================================
export const useMessages = (params: UseMessagesParams | string): UseMessagesReturn => {
  // Suporte para chamada antiga (apenas leadId string)
  const { leadId, leadPhone, leadName } = typeof params === 'string'
    ? { leadId: params, leadPhone: '', leadName: undefined }
    : params;

  // ========================================
  // Metricas de Performance
  // ========================================
  const perfStartRef = useRef((window as any).__PERF_KANBAN_START || Date.now());
  useEffect(() => {
    const elapsed = Date.now() - perfStartRef.current;
    console.log(`[PERF] useMessages Init: ${elapsed}ms`);
  }, []);

  // ========================================
  // Estados
  // ========================================
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyInfo | null>(null);
  const [instanceName, setInstanceName] = useState<string>('');

  // ========================================
  // Funcao para salvar mensagem no contexto
  // ========================================
  const saveToContext = useCallback(async (
    sender: 'LEAD' | 'VENDEDOR',
    content: string
  ) => {
    try {
      debugLog(`${LOG_PREFIX} Salvando mensagem no contexto:`, {
        leadId: leadPhone || leadId,
        sender,
        content: content.substring(0, 50) + '...',
      });

      await aiService.saveMessageToContext(
        leadPhone || leadId,            //......Usa telefone como ID
        sender,                          //......Quem enviou
        content,                         //......Conteudo
        leadName                         //......Nome do lead
      );

      debugLog(`${LOG_PREFIX} Mensagem salva no contexto com sucesso`);
    } catch (error) {
      console.warn(`${LOG_PREFIX} Erro ao salvar no contexto:`, error);
      // Nao propaga erro - salvar contexto nao deve bloquear envio
    }
  }, [leadId, leadPhone, leadName]);

  // ========================================
  // Funcao para salvar mensagem enviada no IndexedDB
  // Persiste mensagens enviadas pelo vendedor para cache local
  // ========================================
  const saveMessageToCache = useCallback(async (message: WhatsAppMessage) => {
    if (!leadPhone) return; //..............................Sem telefone, sem cache

    const formattedPhone = formatPhoneNumber(leadPhone); //..Formata telefone

    try {
      debugLog(`${LOG_PREFIX} [CACHE_SAVE] Salvando mensagem enviada no IndexedDB...`);
      debugLog(`${LOG_PREFIX} [CACHE_SAVE] message.id:`, message.id);
      debugLog(`${LOG_PREFIX} [CACHE_SAVE] message.type:`, message.type);
      debugLog(`${LOG_PREFIX} [CACHE_SAVE] message.messageKey:`, message.messageKey);

      // Converte WhatsAppMessage para formato compativel com IndexedDB
      // O IndexedDB espera rawData no formato da API
      const rawData: any = {
        key: message.messageKey || {
          id: message.id,
          remoteJid: `${formattedPhone}@s.whatsapp.net`,
          fromMe: message.direction === 'outgoing',
        },
        id: message.id,
        messageTimestamp: Math.floor(message.timestamp.getTime() / 1000),
        pushName: message.senderName,
        message: {},
      };

      // Montar contextInfo se for reply (citacao de mensagem)
      let contextInfo: any = undefined;
      if (message.replyTo) {
        // IMPORTANTE: Salvar fromMe da mensagem citada para determinar senderName ao carregar
        const quotedFromMe = message.replyTo.messageKey?.fromMe ?? false;
        contextInfo = {
          stanzaId: message.replyTo.messageKey?.id || message.replyTo.messageId,
          participant: message.replyTo.messageKey?.remoteJid,
          quotedFromMe,                                   //................ Se mensagem citada foi enviada por nos
          quotedSenderName: message.replyTo.senderName,   //................ Nome do remetente original
          quotedMessage: {},                              //................ Mensagem citada
        };
        // Montar quotedMessage baseado no tipo do reply
        if (message.replyTo.type === 'text') {
          contextInfo.quotedMessage.conversation = message.replyTo.content;
        } else if (message.replyTo.type === 'image') {
          contextInfo.quotedMessage.imageMessage = {
            caption: message.replyTo.content || '',
            jpegThumbnail: message.replyTo.thumbnail,     //................ Thumbnail da imagem
          };
        } else if (message.replyTo.type === 'video') {
          contextInfo.quotedMessage.videoMessage = {
            caption: message.replyTo.content || '',
            jpegThumbnail: message.replyTo.thumbnail,     //................ Thumbnail do video
          };
        } else if (message.replyTo.type === 'audio') {
          contextInfo.quotedMessage.audioMessage = {};
        }
        debugLog(`${LOG_PREFIX} [CACHE_SAVE] Reply incluido, stanzaId:`, contextInfo.stanzaId);
      }

      // Montar message baseado no tipo
      if (message.type === 'text') {
        const textContent = message.content as TextContent;
        if (textContent.linkPreview) {
          rawData.message.extendedTextMessage = {
            text: textContent.text,
            matchedText: textContent.linkPreview.url,
            canonicalUrl: textContent.linkPreview.url,
            title: textContent.linkPreview.title,
            description: textContent.linkPreview.description,
            contextInfo,                                  //................ Adiciona contextInfo se reply
          };
        } else if (contextInfo) {
          // Texto simples com reply - usar extendedTextMessage para suportar contextInfo
          rawData.message.extendedTextMessage = {
            text: textContent.text,
            contextInfo,                                  //................ Adiciona contextInfo
          };
        } else {
          rawData.message.conversation = textContent.text;
        }
      } else if (message.type === 'image') {
        const imgContent = message.content as any;
        rawData.message.imageMessage = {
          url: imgContent.url,
          jpegThumbnail: imgContent.thumbnail,
          width: imgContent.width,
          height: imgContent.height,
          caption: imgContent.caption,
          contextInfo,                                    //................ Adiciona contextInfo se reply
        };
      } else if (message.type === 'video') {
        const vidContent = message.content as any;
        rawData.message.videoMessage = {
          url: vidContent.url,
          jpegThumbnail: vidContent.thumbnail,
          width: vidContent.width,
          height: vidContent.height,
          seconds: vidContent.duration,
          caption: vidContent.caption,
          mimetype: vidContent.mimeType,
          contextInfo,                                    //................ Adiciona contextInfo se reply
        };
      } else if (message.type === 'audio') {
        const audContent = message.content as any;
        rawData.message.audioMessage = {
          url: audContent.url,
          seconds: audContent.duration,
          ptt: true,
          contextInfo,                                    //................ Adiciona contextInfo se reply
        };
      }

      // Salva no IndexedDB
      await indexedDBService.saveMessages(formattedPhone, [rawData]);
      debugLog(`${LOG_PREFIX} [CACHE_SAVE] Mensagem salva no IndexedDB com sucesso`);
    } catch (error) {
      console.error(`${LOG_PREFIX} [CACHE_SAVE] Erro ao salvar no IndexedDB:`, error);
      // Nao propaga erro - salvar cache nao deve bloquear envio
    }
  }, [leadPhone]);

  // ========================================
  // Obter nome da instancia (sincrono para evitar race condition)
  // ========================================
  useEffect(() => {
    // TODO: Obter userId real do contexto de autenticacao
    const userId = 'vendedor-1';

    // Usa nome padronizado diretamente (evita race condition)
    const name = `partners_${userId}`;

    debugLog(`${LOG_PREFIX} instanceName definido:`, name);
    setInstanceName(name);
  }, []);

  // ========================================
  // Ref para controle de polling
  // ========================================
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollingPausedRef = useRef<boolean>(false); //......Flag polling pausado
  const cachedMessagesRef = useRef<WhatsAppMessage[]>([]); //......Mensagens do cache (para merge)

  // ========================================
  // Extrair reacoes das mensagens brutas da Evolution API
  // reactionMessage sao mensagens separadas com key do alvo + emoji
  // ========================================
  const extractReactionsFromRaw = useCallback((rawMessages: any[]): Map<string, string> => {
    const reactionMap = new Map<string, string>(); //......Mapa keyId → emoji
    rawMessages.forEach(msg => {
      const rm = msg?.message?.reactionMessage;    //......Campo reacao
      if (rm?.key?.id && typeof rm.text === 'string') {
        if (rm.text) {
          reactionMap.set(rm.key.id, rm.text);     //......Adicionar reacao
        } else {
          reactionMap.delete(rm.key.id);           //......Emoji vazio = remocao
        }
      }
    });
    return reactionMap;
  }, []);

  // ========================================
  // Aplicar reacoes do mapa as mensagens convertidas
  // ========================================
  const applyReactionsToMessages = useCallback((
    messages: WhatsAppMessage[],
    reactionMap: Map<string, string>,
  ): void => {
    if (reactionMap.size === 0) return;            //......Sem reacoes, pular
    messages.forEach(msg => {
      if (msg.messageKey?.id && reactionMap.has(msg.messageKey.id)) {
        msg.reaction = reactionMap.get(msg.messageKey.id); //......Aplicar emoji
      }
    });
  }, []);

  // ========================================
  // Converter mensagem da API para formato local
  // ========================================
  const convertApiMessage = useCallback((apiMsg: any): WhatsAppMessage | null => {
    try {
      // Ignorar mensagens de sistema
      if (!apiMsg.key || !apiMsg.message) {
        debugLog(`${LOG_PREFIX} [convertApiMessage] IGNORADA (sem key ou message):`, {
          hasKey: !!apiMsg.key,
          hasMessage: !!apiMsg.message,
          keyId: apiMsg?.key?.id,
          fromMe: apiMsg?.key?.fromMe,
        });
        return null;
      }

      // fromMe indica se foi enviada pelo vendedor
      const isFromMe = apiMsg.key.fromMe === true;

      // ID unico: usa SEMPRE key.id que e o identificador unico do WhatsApp
      // IMPORTANTE: Consistencia entre cache e API evita duplicacao
      const messageId = apiMsg.key.id;

      // Debug: log da mensagem sendo convertida
      const extendedText = apiMsg.message.extendedTextMessage;

      // Debug: verificar campos disponiveis para link preview
      // Detectar URL em qualquer tipo de mensagem (conversation ou extendedText)
      const rawText = apiMsg.message.conversation || extendedText?.text || '';
      const hasUrl = /https?:\/\/[^\s]+/.test(rawText);

      if (hasUrl) {
        debugLog('[LINK_PREVIEW_DEBUG] ==============================');
        debugLog('[LINK_PREVIEW_DEBUG] Mensagem com URL detectada');
        debugLog('[LINK_PREVIEW_DEBUG] ID:', messageId);
        debugLog('[LINK_PREVIEW_DEBUG] Texto:', rawText.substring(0, 80));
        debugLog('[LINK_PREVIEW_DEBUG] Tipo: ' + (apiMsg.message.conversation ? 'conversation' : 'extendedTextMessage'));
        debugLog('[LINK_PREVIEW_DEBUG] hasExtendedText:', !!extendedText);

        if (extendedText) {
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.matchedText:', extendedText.matchedText);
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.canonicalUrl:', extendedText.canonicalUrl);
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.title:', extendedText.title);
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.description:', extendedText.description);
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.jpegThumbnail:', !!extendedText.jpegThumbnail);
          debugLog('[LINK_PREVIEW_DEBUG] extendedText.previewType:', extendedText.previewType);
          debugLog('[LINK_PREVIEW_DEBUG] Todas as chaves:', Object.keys(extendedText));
        } else {
          debugLog('[LINK_PREVIEW_DEBUG] SEM extendedTextMessage - link preview NAO disponivel pela API');
        }
        debugLog('[LINK_PREVIEW_DEBUG] ==============================');
      }

      // Evolution API armazena contextInfo no nivel raiz da mensagem
      // Verificar ambos locais: nivel raiz e dentro de extendedTextMessage
      const contextInfo = apiMsg.contextInfo || extendedText?.contextInfo;

      debugLog(`${LOG_PREFIX} [convertApiMessage] Processando:`, {
        id: messageId,
        fromMe: isFromMe,
        direction: isFromMe ? 'outgoing' : 'incoming',
        hasConversation: !!apiMsg.message.conversation,
        hasExtendedText: !!extendedText,
        hasRootContextInfo: !!apiMsg.contextInfo,
        hasContextInfo: !!contextInfo,
        isReply: !!contextInfo?.quotedMessage,
        stanzaId: contextInfo?.stanzaId || null,
      });

      // ========================================
      // Detectar tipo de mensagem e extrair conteudo
      // ========================================

      // Unwrap viewOnceMessage / viewOnceMessageV2 (mensagem de visualizacao unica)
      let isViewOnceMsg = false;
      let innerMessage = apiMsg.message;
      if (apiMsg.message.viewOnceMessageV2?.message) {
        innerMessage = apiMsg.message.viewOnceMessageV2.message;
        isViewOnceMsg = true;
      } else if (apiMsg.message.viewOnceMessage?.message) {
        innerMessage = apiMsg.message.viewOnceMessage.message;
        isViewOnceMsg = true;
      }

      const videoMsg = innerMessage.videoMessage;
      const imageMsg = innerMessage.imageMessage;
      const audioMsg = apiMsg.message.audioMessage || apiMsg.message.pttMessage;

      // Extrair texto da mensagem
      let text = '';
      if (apiMsg.message.conversation) {
        text = apiMsg.message.conversation;
      } else if (extendedText?.text) {
        text = extendedText.text;
      }

      // ========================================
      // Processar mensagem de VIDEO
      // ========================================
      if (videoMsg) {
        const thumbType = videoMsg.jpegThumbnail ? typeof videoMsg.jpegThumbnail : 'undefined';
        const thumbLength = videoMsg.jpegThumbnail?.length || 0;
        const isArrayBuffer = videoMsg.jpegThumbnail instanceof ArrayBuffer;
        const isUint8Array = videoMsg.jpegThumbnail instanceof Uint8Array;
        const hasDataField = videoMsg.jpegThumbnail && typeof videoMsg.jpegThumbnail === 'object' && 'data' in videoMsg.jpegThumbnail;

        debugLog(`${LOG_PREFIX} [convertApiMessage] ========== VIDEO ==========`);
        debugLog(`${LOG_PREFIX} [VIDEO] ID:`, messageId);
        debugLog(`${LOG_PREFIX} [VIDEO] fromMe:`, isFromMe);
        debugLog(`${LOG_PREFIX} [VIDEO] pushName:`, apiMsg.pushName);
        debugLog(`${LOG_PREFIX} [VIDEO] URL:`, videoMsg.url?.substring(0, 50) || 'VAZIO');
        // Log critico: verificar se apiMsg.key existe (necessario para messageKey)
        debugLog(`${LOG_PREFIX} [VIDEO] ========== MESSAGE KEY SOURCE ==========`);
        debugLog(`${LOG_PREFIX} [VIDEO] apiMsg.key existe:`, !!apiMsg.key);
        debugLog(`${LOG_PREFIX} [VIDEO] apiMsg.key.id:`, apiMsg.key?.id);
        debugLog(`${LOG_PREFIX} [VIDEO] apiMsg.key.remoteJid:`, apiMsg.key?.remoteJid);
        debugLog(`${LOG_PREFIX} [VIDEO] apiMsg.key.fromMe:`, apiMsg.key?.fromMe);
        debugLog(`${LOG_PREFIX} [VIDEO] ==========================================`);
        debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail type:`, thumbType);
        debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail length:`, thumbLength);
        debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail isArrayBuffer:`, isArrayBuffer);
        debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail isUint8Array:`, isUint8Array);
        debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail hasDataField:`, hasDataField);
        debugLog(`${LOG_PREFIX} [VIDEO] Dimensoes:`, videoMsg.width, 'x', videoMsg.height);
        debugLog(`${LOG_PREFIX} [VIDEO] ALL videoMsg keys:`, Object.keys(videoMsg));

        // Log do valor RAW para debug
        if (videoMsg.jpegThumbnail) {
          if (typeof videoMsg.jpegThumbnail === 'string') {
            debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail RAW (string):`, videoMsg.jpegThumbnail.substring(0, 80));
          } else if (typeof videoMsg.jpegThumbnail === 'object') {
            debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail RAW (object keys):`, Object.keys(videoMsg.jpegThumbnail).slice(0, 10));
            debugLog(`${LOG_PREFIX} [VIDEO] jpegThumbnail RAW (JSON):`, JSON.stringify(videoMsg.jpegThumbnail).substring(0, 100));
          }
        }
        debugLog(`${LOG_PREFIX} [VIDEO] =================================`);

        // Extrair thumbnail em base64 (pode ser string, Buffer, Uint8Array ou ArrayBuffer)
        let thumbnailUri: string | undefined;
        if (videoMsg.jpegThumbnail) {
          try {
            if (typeof videoMsg.jpegThumbnail === 'string') {
              // Ja e string base64 - verificar se precisa de prefixo
              if (videoMsg.jpegThumbnail.startsWith('data:')) {
                thumbnailUri = videoMsg.jpegThumbnail;
              } else {
                thumbnailUri = `data:image/jpeg;base64,${videoMsg.jpegThumbnail}`;
              }
              debugLog(`${LOG_PREFIX} [VIDEO] Thumbnail ja era string base64`);
            } else if (videoMsg.jpegThumbnail instanceof ArrayBuffer) {
              // ArrayBuffer direto
              const bytes = new Uint8Array(videoMsg.jpegThumbnail);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              const base64 = btoa(binary);
              thumbnailUri = `data:image/jpeg;base64,${base64}`;
              debugLog(`${LOG_PREFIX} [VIDEO] Thumbnail convertido de ArrayBuffer para base64`);
            } else if (videoMsg.jpegThumbnail instanceof Uint8Array || ArrayBuffer.isView(videoMsg.jpegThumbnail)) {
              // E um Uint8Array ou Buffer - converter para base64
              const bytes = new Uint8Array(videoMsg.jpegThumbnail);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              const base64 = btoa(binary);
              thumbnailUri = `data:image/jpeg;base64,${base64}`;
              debugLog(`${LOG_PREFIX} [VIDEO] Thumbnail convertido de Uint8Array para base64`);
            } else if (typeof videoMsg.jpegThumbnail === 'object' && videoMsg.jpegThumbnail.data) {
              // Pode ser um objeto Buffer do Node.js com campo data
              const bytes = new Uint8Array(videoMsg.jpegThumbnail.data);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              const base64 = btoa(binary);
              thumbnailUri = `data:image/jpeg;base64,${base64}`;
              debugLog(`${LOG_PREFIX} [VIDEO] Thumbnail convertido de Buffer.data para base64`);
            } else if (typeof videoMsg.jpegThumbnail === 'object') {
              // Objeto desconhecido - tentar JSON stringify para debug
              debugLog(`${LOG_PREFIX} [VIDEO] Thumbnail objeto desconhecido:`, JSON.stringify(videoMsg.jpegThumbnail).substring(0, 100));
            }
          } catch (convError) {
            console.error(`${LOG_PREFIX} [VIDEO] Erro ao converter thumbnail:`, convError);
          }
        } else {
          debugLog(`${LOG_PREFIX} [VIDEO] SEM jpegThumbnail no videoMsg`);
        }

        debugLog(`${LOG_PREFIX} [VIDEO] thumbnailUri gerado:`, thumbnailUri ? 'SIM (' + thumbnailUri.length + ' chars)' : 'NAO');

        const videoContent = {
          url: videoMsg.url || '',              //......URL do video
          thumbnail: thumbnailUri,              //......Thumbnail base64
          width: videoMsg.width || 0,           //......Largura (0 = detectar via Image.getSize)
          height: videoMsg.height || 0,         //......Altura (0 = detectar via Image.getSize)
          duration: videoMsg.seconds || 0,      //......Duracao em segundos
          mimeType: videoMsg.mimetype || 'video/mp4',
          caption: videoMsg.caption || undefined,
        };

        // Construir messageKey - CRITICO para replies vinculados
        // IMPORTANTE: apiMsg.key DEVE existir neste ponto (verificado no inicio)
        const videoMessageKey = apiMsg.key ? {
          id: apiMsg.key.id,
          remoteJid: apiMsg.key.remoteJid,
          fromMe: isFromMe,
        } : undefined;

        // DEBUG CRITICO: Se apiMsg.key existe mas videoMessageKey nao, algo esta errado
        if (apiMsg.key && !videoMessageKey) {
          console.error(`${LOG_PREFIX} [VIDEO] BUG: apiMsg.key existe mas videoMessageKey nao foi criado!`);
        }
        // DEBUG: Verificar se os campos do key sao validos
        if (apiMsg.key) {
          debugLog(`${LOG_PREFIX} [VIDEO] KEY FIELDS CHECK:`);
          debugLog(`${LOG_PREFIX} [VIDEO]   - apiMsg.key.id type:`, typeof apiMsg.key.id);
          debugLog(`${LOG_PREFIX} [VIDEO]   - apiMsg.key.remoteJid type:`, typeof apiMsg.key.remoteJid);
          debugLog(`${LOG_PREFIX} [VIDEO]   - apiMsg.key.fromMe type:`, typeof apiMsg.key.fromMe);
        }

        debugLog(`${LOG_PREFIX} [VIDEO] ========== MESSAGE KEY RESULTADO ==========`);
        debugLog(`${LOG_PREFIX} [VIDEO] videoMessageKey construido:`, !!videoMessageKey);
        if (videoMessageKey) {
          debugLog(`${LOG_PREFIX} [VIDEO]   - id:`, videoMessageKey.id);
          debugLog(`${LOG_PREFIX} [VIDEO]   - remoteJid:`, videoMessageKey.remoteJid);
          debugLog(`${LOG_PREFIX} [VIDEO]   - fromMe:`, videoMessageKey.fromMe);
        } else {
          console.error(`${LOG_PREFIX} [VIDEO] ERRO CRITICO: messageKey NAO FOI CONSTRUIDO!`);
          console.error(`${LOG_PREFIX} [VIDEO] apiMsg.key estava:`, apiMsg.key);
        }
        debugLog(`${LOG_PREFIX} [VIDEO] =============================================`);

        const result = {
          id: messageId,
          type: 'video' as const,
          direction: isFromMe ? 'outgoing' : 'incoming',
          content: videoContent,
          timestamp: new Date((apiMsg.messageTimestamp || Date.now()) * 1000),
          status: 'delivered' as MessageStatus,
          senderId: isFromMe ? 'user-1' : leadId,
          senderName: isFromMe ? undefined : (apiMsg.pushName || undefined),
          messageKey: videoMessageKey,
          ...(isViewOnceMsg && { viewOnce: true }),
        };

        debugLog(`${LOG_PREFIX} [VIDEO] Resultado final para ID ${result.id}:`);
        debugLog(`${LOG_PREFIX} [VIDEO]   - senderName:`, result.senderName);
        debugLog(`${LOG_PREFIX} [VIDEO]   - thumbnail:`, result.content.thumbnail ? 'SIM' : 'NAO');
        debugLog(`${LOG_PREFIX} [VIDEO]   - messageKey:`, result.messageKey ? 'SIM' : 'NAO');
        if (result.messageKey) {
          debugLog(`${LOG_PREFIX} [VIDEO]   - messageKey.id:`, result.messageKey.id);
        }

        return result;
      }

      // ========================================
      // Processar mensagem de IMAGEM
      // ========================================
      if (imageMsg) {
        debugLog(`${LOG_PREFIX} [convertApiMessage] Processando IMAGEM:`, {
          id: messageId,
          hasUrl: !!imageMsg.url,
          hasThumbnail: !!imageMsg.jpegThumbnail,
          width: imageMsg.width,
          height: imageMsg.height,
          pushName: apiMsg.pushName,
        });

        // Extrair thumbnail em base64
        let thumbnailUri: string | undefined;
        if (imageMsg.jpegThumbnail) {
          thumbnailUri = typeof imageMsg.jpegThumbnail === 'string'
            ? `data:image/jpeg;base64,${imageMsg.jpegThumbnail}`
            : undefined;
        }

        const imageContent = {
          url: imageMsg.url || '',              //......URL da imagem
          thumbnail: thumbnailUri,              //......Thumbnail base64
          width: imageMsg.width || 0,           //......Largura (0 = detectar via Image.getSize)
          height: imageMsg.height || 0,         //......Altura (0 = detectar via Image.getSize)
          caption: imageMsg.caption || undefined,
        };

        // Construir messageKey - CRITICO para replies vinculados
        const imageMessageKey = apiMsg.key ? {
          id: apiMsg.key.id,
          remoteJid: apiMsg.key.remoteJid,
          fromMe: isFromMe,
        } : undefined;

        debugLog(`${LOG_PREFIX} [IMAGE] messageKey construido:`, !!imageMessageKey);
        if (!imageMessageKey) {
          console.error(`${LOG_PREFIX} [IMAGE] ERRO CRITICO: messageKey NAO FOI CONSTRUIDO!`);
        }

        return {
          id: messageId,
          type: 'image' as const,
          direction: isFromMe ? 'outgoing' : 'incoming',
          content: imageContent,
          timestamp: new Date((apiMsg.messageTimestamp || Date.now()) * 1000),
          status: 'delivered' as MessageStatus,
          senderId: isFromMe ? 'user-1' : leadId,
          senderName: isFromMe ? undefined : (apiMsg.pushName || undefined),
          messageKey: imageMessageKey,
          ...(isViewOnceMsg && { viewOnce: true }),
        };
      }

      // ========================================
      // Processar mensagem de AUDIO
      // ========================================
      if (audioMsg) {
        debugLog(`${LOG_PREFIX} [convertApiMessage] Processando AUDIO:`, {
          id: messageId,
          hasUrl: !!audioMsg.url,
          duration: audioMsg.seconds,
          pushName: apiMsg.pushName,
        });

        const audioContent = {
          url: audioMsg.url || '',              //......URL do audio
          duration: audioMsg.seconds || 0,      //......Duracao em segundos
          mimeType: audioMsg.mimetype || 'audio/ogg',
          waveform: audioMsg.waveform || undefined,
        };

        return {
          id: messageId,
          type: 'audio' as const,
          direction: isFromMe ? 'outgoing' : 'incoming',
          content: audioContent,
          timestamp: new Date((apiMsg.messageTimestamp || Date.now()) * 1000),
          status: 'delivered' as MessageStatus,
          senderId: isFromMe ? 'user-1' : leadId,
          senderName: isFromMe ? undefined : (apiMsg.pushName || undefined),
          messageKey: {
            id: apiMsg.key.id,
            remoteJid: apiMsg.key.remoteJid,
            fromMe: isFromMe,
          },
        };
      }

      // ========================================
      // Processar mensagem de TEXTO
      // ========================================
      if (!text) {
        // Detectar tipo da mensagem para log mais informativo
        const msgTypes = Object.keys(apiMsg.message || {}).filter(k => k !== 'messageContextInfo');
        debugLog(`${LOG_PREFIX} [convertApiMessage] IGNORADA (tipo nao suportado):`, {
          id: messageId,
          fromMe: isFromMe,
          direction: isFromMe ? 'outgoing' : 'incoming',
          tipos: msgTypes,
        });
        return null;
      }

      // Extrair informacoes de reply (contextInfo)
      let replyTo: ReplyInfo | undefined;
      if (contextInfo?.quotedMessage && contextInfo?.stanzaId) {
        const quotedMsg = contextInfo.quotedMessage;
        const quotedParticipant = contextInfo.participant || '';

        // Determinar se a mensagem citada foi enviada por nos
        // Prioridade: 1) Campo quotedFromMe salvo no cache, 2) Logica de participant
        let isQuotedFromMe: boolean;
        if (contextInfo.quotedFromMe !== undefined) {
          // Campo explicito salvo no cache - usar diretamente
          isQuotedFromMe = contextInfo.quotedFromMe;
        } else {
          // Fallback: verificar se participant e diferente do remoteJid do lead
          // Se participant nao contem o numero do lead, provavelmente foi enviada por nos
          isQuotedFromMe = quotedParticipant.includes(apiMsg.key.remoteJid?.split('@')[0] || '') === false;
        }

        // Determinar tipo e conteudo da mensagem citada
        // IMPORTANTE: Verificar midias PRIMEIRO, pois WhatsApp pode enviar caption junto com conversation
        let quotedType: MessageType = 'text';
        let quotedContent = '';

        if (quotedMsg.imageMessage) {
          quotedType = 'image';
          quotedContent = quotedMsg.imageMessage.caption || 'Foto';
        } else if (quotedMsg.videoMessage) {
          quotedType = 'video';
          quotedContent = quotedMsg.videoMessage.caption || 'Vídeo';
        } else if (quotedMsg.audioMessage) {
          quotedType = 'audio';
          quotedContent = 'Mensagem de áudio';
        } else if (quotedMsg.documentMessage) {
          quotedType = 'document';
          quotedContent = quotedMsg.documentMessage.fileName || 'Documento';
        } else if (quotedMsg.conversation) {
          quotedContent = quotedMsg.conversation;
        } else if (quotedMsg.extendedTextMessage?.text) {
          quotedContent = quotedMsg.extendedTextMessage.text;
        }

        // CORREÇÃO: WhatsApp às vezes não envia a estrutura de mídia no quotedMessage
        // Detectar tipo pelo conteúdo quando é texto genérico de mídia
        if (quotedType === 'text') {
          if (quotedContent === 'Foto' || quotedContent === 'Imagem') {
            quotedType = 'image';
          } else if (quotedContent === 'Vídeo' || quotedContent === 'Video') {
            quotedType = 'video';
          } else if (quotedContent === 'Áudio' || quotedContent === 'Audio' || quotedContent === 'Mensagem de áudio') {
            quotedType = 'audio';
          }
        }

        // Extrair thumbnail da mensagem citada (link preview, imagem ou video)
        // IMPORTANTE: Suporta string base64, ArrayBuffer, Uint8Array e Buffer
        let quotedThumbnail: string | undefined;
        const quotedExtended = quotedMsg.extendedTextMessage;

        // Funcao auxiliar para normalizar thumbnail (string, ArrayBuffer, Uint8Array, Buffer)
        const normalizeThumb = (thumb: any): string | undefined => {
          if (!thumb) return undefined;              //...Sem thumbnail
          try {
            if (typeof thumb === 'string') {
              // Ja e string base64 - verificar se precisa de prefixo
              if (thumb.startsWith('data:')) return thumb;
              return `data:image/jpeg;base64,${thumb}`;
            } else if (thumb instanceof ArrayBuffer) {
              // ArrayBuffer direto
              const bytes = new Uint8Array(thumb);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              return `data:image/jpeg;base64,${btoa(binary)}`;
            } else if (thumb instanceof Uint8Array || ArrayBuffer.isView(thumb)) {
              // Uint8Array ou Buffer - converter para base64
              const bytes = new Uint8Array(thumb);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              return `data:image/jpeg;base64,${btoa(binary)}`;
            } else if (typeof thumb === 'object' && thumb.data) {
              // Objeto Buffer do Node.js com campo data
              const bytes = new Uint8Array(thumb.data);
              let binary = '';
              bytes.forEach(b => binary += String.fromCharCode(b));
              return `data:image/jpeg;base64,${btoa(binary)}`;
            }
          } catch (e) {
            console.error(`${LOG_PREFIX} [REPLY_THUMB] Erro ao normalizar:`, e);
          }
          return undefined;
        };

        // Tentar extrair thumbnail na ordem: link preview, imagem, video
        if (quotedExtended?.jpegThumbnail) {
          quotedThumbnail = normalizeThumb(quotedExtended.jpegThumbnail);
          console.log(`${LOG_PREFIX} [REPLY_THUMB] Extraido de extendedText:`, !!quotedThumbnail);
        } else if (quotedMsg.imageMessage?.jpegThumbnail) {
          quotedThumbnail = normalizeThumb(quotedMsg.imageMessage.jpegThumbnail);
          console.log(`${LOG_PREFIX} [REPLY_THUMB] Extraido de imageMessage:`, !!quotedThumbnail);
        } else if (quotedMsg.videoMessage?.jpegThumbnail) {
          quotedThumbnail = normalizeThumb(quotedMsg.videoMessage.jpegThumbnail);
          console.log(`${LOG_PREFIX} [REPLY_THUMB] Extraido de videoMessage:`, !!quotedThumbnail);
        } else if (quotedMsg.videoMessage) {
          // Debug: videoMessage existe mas jpegThumbnail nao
          console.log(`${LOG_PREFIX} [REPLY_THUMB] videoMessage keys:`, Object.keys(quotedMsg.videoMessage));
          console.log(`${LOG_PREFIX} [REPLY_THUMB] videoMessage.jpegThumbnail tipo:`, typeof quotedMsg.videoMessage.jpegThumbnail);
        } else if (quotedMsg.imageMessage) {
          // Debug: imageMessage existe mas jpegThumbnail nao
          console.log(`${LOG_PREFIX} [REPLY_THUMB] imageMessage keys:`, Object.keys(quotedMsg.imageMessage));
          console.log(`${LOG_PREFIX} [REPLY_THUMB] imageMessage.jpegThumbnail tipo:`, typeof quotedMsg.imageMessage.jpegThumbnail);
        } else {
          console.log(`${LOG_PREFIX} [REPLY_THUMB] Nenhum jpegThumbnail encontrado em quotedMsg`);
          console.log(`${LOG_PREFIX} [REPLY_THUMB] quotedMsg keys:`, Object.keys(quotedMsg));
        }

        // Extrair URL do texto da mensagem citada (para busca de thumbnail)
        let quotedLinkUrl: string | undefined;
        const quotedRawText = quotedMsg.conversation || quotedExtended?.text || quotedContent;
        const quotedUrlMatch = quotedRawText.match(/https?:\/\/[^\s]+/);
        if (quotedUrlMatch) {
          quotedLinkUrl = quotedUrlMatch[0];
        }

        // Nome no formato WhatsApp: nome salvo ou +telefone ~pushName
        // Prioridade: 1) Campo quotedSenderName salvo no cache, 2) Logica baseada em isQuotedFromMe
        let quotedSenderName: string;
        if (contextInfo.quotedSenderName) {
          // Campo explicito salvo no cache - usar diretamente
          quotedSenderName = contextInfo.quotedSenderName;
        } else if (isQuotedFromMe) {
          // Mensagem citada foi enviada por nos
          quotedSenderName = 'Você';
        } else {
          // Mensagem citada foi enviada pelo lead
          const hasRealName = leadName && !/^[\d\s\+\-\(\)]+$/.test(leadName.trim());
          if (hasRealName) {
            quotedSenderName = leadName;
          } else {
            const clean = leadPhone.replace(/\D/g, '');
            const phone = clean.length === 13 && clean.startsWith('55')
              ? `+${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,9)}-${clean.slice(9)}`
              : clean.length === 12 && clean.startsWith('55')
                ? `+${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,8)}-${clean.slice(8)}`
                : leadPhone.startsWith('+') ? leadPhone : `+${leadPhone}`;
            quotedSenderName = apiMsg.pushName ? `${phone} ~${apiMsg.pushName}` : phone;
          }
        }
        // Construir messageKey para buscar midia via Evolution API
        // IMPORTANTE: remoteJid deve SEMPRE ser o JID do chat (lead), nao o participant
        // A Evolution API busca a mensagem pelo ID dentro do chat especificado
        const quotedRemoteJid = apiMsg.key?.remoteJid || '';
        const quotedMessageKey = {
          id: contextInfo.stanzaId,                       //...ID da mensagem citada
          remoteJid: quotedRemoteJid,                     //...JID do chat (lead)
          fromMe: isQuotedFromMe,                         //...Se foi enviada por nos
        };

        console.log(`${LOG_PREFIX} [REPLY] messageKey:`, {
          id: quotedMessageKey.id,
          remoteJid: quotedMessageKey.remoteJid,
          fromMe: quotedMessageKey.fromMe,
          tipo: quotedType,
        });

        replyTo = {
          messageId: contextInfo.stanzaId,
          senderName: quotedSenderName,
          content: quotedContent,
          type: quotedType,
          thumbnail: quotedThumbnail,
          linkUrl: quotedLinkUrl,
          messageKey: quotedMessageKey,                   //...Chave para buscar midia
        };
      }

      // Extrair link preview do extendedTextMessage (OG metadata do WhatsApp)
      let linkPreview: LinkPreview | undefined;
      if (extendedText?.matchedText || extendedText?.canonicalUrl) {
        const thumbnailBase64 = extendedText.jpegThumbnail;
        let thumbnailUri: string | undefined;

        // Converter thumbnail base64 para data URI
        if (thumbnailBase64) {
          thumbnailUri = typeof thumbnailBase64 === 'string'
            ? `data:image/jpeg;base64,${thumbnailBase64}`
            : undefined;
        }

        linkPreview = {
          url: extendedText.canonicalUrl || extendedText.matchedText,
          title: extendedText.title || undefined,
          description: extendedText.description || undefined,
          thumbnail: thumbnailUri,
          previewType: extendedText.previewType ?? 0,
        };

        debugLog('[LINK_PREVIEW_DEBUG] LinkPreview extraido do extendedText:', {
          url: linkPreview.url,
          hasTitle: !!linkPreview.title,
          hasDescription: !!linkPreview.description,
          hasThumbnail: !!linkPreview.thumbnail,
          previewType: linkPreview.previewType,
        });
      }

      // Fallback: se nao tem extendedTextMessage mas o texto contem URL,
      // criar linkPreview basico com apenas a URL (componente buscara metadados)
      if (!linkPreview && hasUrl) {
        const urlMatch = rawText.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          linkPreview = {
            url: urlMatch[0],
          };
          debugLog('[LINK_PREVIEW_DEBUG] LinkPreview criado via fallback (URL detectada):', linkPreview.url);
        }
      }

      const content: TextContent = { text, linkPreview };
      const timestamp = apiMsg.messageTimestamp || Date.now();

      const result: WhatsAppMessage = {
        id: messageId,
        type: 'text',
        direction: isFromMe ? 'outgoing' : 'incoming',
        content,
        timestamp: new Date(timestamp * 1000),
        status: 'delivered' as MessageStatus,
        senderId: isFromMe ? 'user-1' : leadId,
        senderName: isFromMe ? undefined : (apiMsg.pushName || undefined),
        replyTo,
        messageKey: {
          id: apiMsg.key.id,
          remoteJid: apiMsg.key.remoteJid,
          fromMe: isFromMe,
        },
      };

      debugLog(`${LOG_PREFIX} [convertApiMessage] Mensagem convertida:`, {
        id: result.id,
        direction: result.direction,
        text: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
      });

      return result;
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao converter mensagem:`, error);
      return null;
    }
  }, [leadId]);

  // ========================================
  // Ref para controle de cache carregado
  // ========================================
  const cacheLoadedRef = useRef<boolean>(false); //......Flag cache ja carregado
  const isFirstLoadRef = useRef<boolean>(true); //......Flag primeiro carregamento

  // ========================================
  // Carregar mensagens do cache (instantaneo)
  // ========================================
  const loadMessagesFromCache = useCallback(async () => {
    if (!leadPhone) return false; //......Sem telefone, sem cache

    const formattedPhone = formatPhoneNumber(leadPhone); //......Formata telefone
    const perfStart = (window as any).__PERF_KANBAN_START || Date.now();

    try {
      console.log(`[PERF] Cache IndexedDB Start: ${Date.now() - perfStart}ms`);
      const startTime = performance.now(); //......Marca inicio

      const cachedMessages = await indexedDBService.getMessages(formattedPhone); //......Busca cache

      const elapsed = Math.round(performance.now() - startTime); //......Tempo gasto
      console.log(`[PERF] Cache IndexedDB Query: ${elapsed}ms (${cachedMessages.length} msgs)`);

      if (cachedMessages.length > 0) {
        // Log de debug: verificar mensagens de video no cache
        const videoMsgs = cachedMessages.filter(m => m?.message?.videoMessage);
        if (videoMsgs.length > 0) {
          debugLog(`${LOG_PREFIX} [CACHE_DEBUG] ========== VIDEOS NO CACHE ==========`);
          debugLog(`${LOG_PREFIX} [CACHE_DEBUG] Total de videos:`, videoMsgs.length);
          videoMsgs.forEach((vm, idx) => {
            const videoMsg = vm.message?.videoMessage;
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG] Video ${idx + 1}:`);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - ID:`, vm.id || vm.key?.id);
            // CRITICO: Verificar se tem key para messageKey
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - vm.key existe:`, !!vm.key);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - vm.key.id:`, vm.key?.id);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - vm.key.remoteJid:`, vm.key?.remoteJid);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - vm.key.fromMe:`, vm.key?.fromMe);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - jpegThumbnail existe:`, !!videoMsg?.jpegThumbnail);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - jpegThumbnail tipo:`, typeof videoMsg?.jpegThumbnail);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - jpegThumbnail length:`, videoMsg?.jpegThumbnail?.length || 0);
            if (videoMsg?.jpegThumbnail && typeof videoMsg.jpegThumbnail === 'string') {
              debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - jpegThumbnail prefix:`, videoMsg.jpegThumbnail.substring(0, 50));
            }
          });
          debugLog(`${LOG_PREFIX} [CACHE_DEBUG] =====================================`);
        }

        // Converter mensagens do cache para formato local
        const convertStart = performance.now();
        const convertedMessages = cachedMessages
          .map(convertApiMessage)
          .filter((msg): msg is WhatsAppMessage => msg !== null)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        // Extrair e aplicar reacoes (reactionMessage sao msgs separadas)
        const cacheReactionMap = extractReactionsFromRaw(cachedMessages);
        applyReactionsToMessages(convertedMessages, cacheReactionMap);

        console.log(`[PERF] Cache Convert: ${Math.round(performance.now() - convertStart)}ms (${convertedMessages.length} msgs, ${cacheReactionMap.size} reactions)`);

        // Log de debug: verificar thumbnails e messageKey apos conversao
        const convertedVideos = convertedMessages.filter(m => m.type === 'video');
        if (convertedVideos.length > 0) {
          debugLog(`${LOG_PREFIX} [CACHE_DEBUG] ========== VIDEOS APOS CONVERSAO ==========`);
          convertedVideos.forEach((cv, idx) => {
            const content = cv.content as any;
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG] Video ${idx + 1}:`);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - ID:`, cv.id);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - thumbnail existe:`, !!content?.thumbnail);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - thumbnail length:`, content?.thumbnail?.length || 0);
            debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - messageKey existe:`, !!cv.messageKey);
            if (cv.messageKey) {
              debugLog(`${LOG_PREFIX} [CACHE_DEBUG]   - messageKey.id:`, cv.messageKey.id);
            }
          });
          debugLog(`${LOG_PREFIX} [CACHE_DEBUG] ==========================================`);
        }

        // DEBUG: Log antes de setar estado do cache
        debugLog(`${LOG_PREFIX} [CACHE_SET] Setando ${convertedMessages.length} mensagens do cache`);
        const cacheVideos = convertedMessages.filter(m => m.type === 'video');
        if (cacheVideos.length > 0) {
          debugLog(`${LOG_PREFIX} [CACHE_SET] Videos sendo setados:`);
          cacheVideos.forEach((cv, idx) => {
            debugLog(`${LOG_PREFIX} [CACHE_SET]   ${idx + 1}: id=${cv.id}, messageKey=${cv.messageKey ? 'SIM' : 'NAO'}`);
          });
        }

        // CRITICO: Salvar na ref para uso no merge (evita race condition)
        cachedMessagesRef.current = convertedMessages;
        debugLog(`${LOG_PREFIX} [CACHE_SET] Salvo na ref: ${cachedMessagesRef.current.length} mensagens`);

        // Atualiza estado com mensagens do cache (instantaneo)
        console.log(`[PERF] Cache setMessages Start: ${Date.now() - perfStart}ms`);
        setMessages(convertedMessages);
        console.log(`[PERF] Cache setMessages Done: ${Date.now() - perfStart}ms`);
        cacheLoadedRef.current = true; //......Marca cache carregado

        // Atualizar ultima mensagem para delta sync
        if (convertedMessages.length > 0) {
          lastMessageIdRef.current = convertedMessages[convertedMessages.length - 1].id;
        }

        return true; //......Cache encontrado
      }

      return false; //......Cache vazio
    } catch (error) {
      console.error(`${LOG_PREFIX} [CACHE] Erro ao carregar do cache:`, error);
      return false; //......Erro no cache
    }
  }, [leadPhone, convertApiMessage]);

  // ========================================
  // Carregar mensagens da API (com delta sync)
  // ========================================
  const loadMessagesFromApi = useCallback(async () => {
    if (!instanceName || !leadPhone) {
      debugLog(`${LOG_PREFIX} Aguardando instanceName/leadPhone para carregar mensagens`);
      return;
    }

    const formattedPhone = formatPhoneNumber(leadPhone); //......Formata telefone
    const isFirstLoad = isFirstLoadRef.current; //......E primeiro carregamento?

    // Primeiro carregamento: tenta cache primeiro (instantaneo)
    if (isFirstLoad && !cacheLoadedRef.current) {
      debugLog(`${LOG_PREFIX} [PERF] Primeiro carregamento - tentando cache...`);
      setIsLoading(true); //......Mostra loading

      const cacheHit = await loadMessagesFromCache(); //......Tenta cache

      if (cacheHit) {
        // Metrica de performance: cache carregado
        const elapsed = Date.now() - perfStartRef.current;
        console.log(`[PERF] Cache Load: ${elapsed}ms`);
        setIsLoading(false); //......Remove loading (cache ja exibiu)
        // Continua para buscar delta da API em background
      } else {
        debugLog(`${LOG_PREFIX} [PERF] Cache MISS - buscando da API...`);
      }

      isFirstLoadRef.current = false; //......Nao e mais primeiro load
    }

    // Verifica se cache ainda e valido (< 30 segundos)
    const isCacheValid = await indexedDBService.isMessagesCacheValid(formattedPhone);

    // Se cache valido e nao e primeiro load, pula busca da API
    if (isCacheValid && !isFirstLoad && cacheLoadedRef.current) {
      debugLog(`${LOG_PREFIX} [CACHE] Cache ainda valido, pulando API`);
      return;
    }

    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: loadMessagesFromApi (delta sync)`);
    debugLog(`${LOG_PREFIX} instanceName:`, instanceName);
    debugLog(`${LOG_PREFIX} leadPhone:`, leadPhone);
    debugLog(`${LOG_PREFIX} isFirstLoad:`, isFirstLoad);
    debugLog(`${LOG_PREFIX} ========================================`);

    // Se nao tem cache, mostra loading
    if (!cacheLoadedRef.current) {
      setIsLoading(true);
    }

    try {
      debugLog(`${LOG_PREFIX} formattedPhone:`, formattedPhone);
      debugLog(`${LOG_PREFIX} remoteJid será:`, `${formattedPhone}@s.whatsapp.net`);

      // Delta sync: busca menos mensagens se ja temos cache
      const messageLimit = cacheLoadedRef.current ? 100 : 1000; //...Delta = 100, Full = 1000
      const perfStart = (window as any).__PERF_KANBAN_START || Date.now();
      console.log(`[PERF] API Request Start: ${Date.now() - perfStart}ms (limit: ${messageLimit})`);

      const apiStartTime = performance.now();
      const apiMessages = await evolutionService.getMessages(
        instanceName,
        formattedPhone,
        messageLimit
      );

      console.log(`[PERF] API Response: ${Math.round(performance.now() - apiStartTime)}ms (${apiMessages?.length || 0} msgs)`);

      if (Array.isArray(apiMessages) && apiMessages.length > 0) {
        // Deduplicar mensagens da API usando Map (por ID interno)
        const uniqueApiMessages = new Map<string, any>();
        apiMessages.forEach(msg => {
          const id = msg.id || `${msg.key?.id}_${msg.messageTimestamp}`;
          if (!uniqueApiMessages.has(id)) {
            uniqueApiMessages.set(id, msg);
          }
        });

        debugLog(`${LOG_PREFIX} Mensagens unicas da API:`, uniqueApiMessages.size);

        // Salvar no cache IndexedDB (background)
        const rawMessages = Array.from(uniqueApiMessages.values());
        indexedDBService.saveMessages(formattedPhone, rawMessages).then(() => {
          debugLog(`${LOG_PREFIX} [CACHE] ${rawMessages.length} mensagens salvas no IndexedDB`);
        }).catch(err => {
          console.error(`${LOG_PREFIX} [CACHE] Erro ao salvar no IndexedDB:`, err);
        });

        // DEBUG: Verificar mensagens de video ANTES da conversao
        const videoRawMsgs = rawMessages.filter(m => m?.message?.videoMessage);
        if (videoRawMsgs.length > 0) {
          debugLog(`${LOG_PREFIX} [API_DEBUG] ========== VIDEOS ANTES DA CONVERSAO ==========`);
          videoRawMsgs.forEach((vm, idx) => {
            debugLog(`${LOG_PREFIX} [API_DEBUG] Video ${idx + 1}:`);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - ID:`, vm.id || vm.key?.id);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - vm.key existe:`, !!vm.key);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - vm.key.id:`, vm.key?.id);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - vm.key.remoteJid:`, vm.key?.remoteJid);
          });
          debugLog(`${LOG_PREFIX} [API_DEBUG] ================================================`);
        }

        // Extrair reacoes (reactionMessage sao mensagens separadas)
        const apiReactionMap = extractReactionsFromRaw(rawMessages);

        // Converter mensagens da API
        const convertedMessages = rawMessages
          .map(convertApiMessage)
          .filter((msg): msg is WhatsAppMessage => msg !== null)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        // Aplicar reacoes extraidas as mensagens convertidas
        applyReactionsToMessages(convertedMessages, apiReactionMap);

        // DEBUG: Verificar mensagens de video DEPOIS da conversao
        const videoConvertedMsgs = convertedMessages.filter(m => m.type === 'video');
        if (videoConvertedMsgs.length > 0) {
          debugLog(`${LOG_PREFIX} [API_DEBUG] ========== VIDEOS DEPOIS DA CONVERSAO ==========`);
          videoConvertedMsgs.forEach((vm, idx) => {
            debugLog(`${LOG_PREFIX} [API_DEBUG] Video ${idx + 1}:`);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - ID:`, vm.id);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - messageKey existe:`, !!vm.messageKey);
            debugLog(`${LOG_PREFIX} [API_DEBUG]   - messageKey.id:`, vm.messageKey?.id);
          });
          debugLog(`${LOG_PREFIX} [API_DEBUG] =================================================`);
        }

        // Contar mensagens por direcao
        const incomingCount = convertedMessages.filter(m => m.direction === 'incoming').length;
        const outgoingCount = convertedMessages.filter(m => m.direction === 'outgoing').length;
        debugLog(`${LOG_PREFIX} Mensagens convertidas: ${convertedMessages.length} (incoming: ${incomingCount}, outgoing: ${outgoingCount})`);

        // Atualizar ultima mensagem para polling
        if (convertedMessages.length > 0) {
          lastMessageIdRef.current = convertedMessages[convertedMessages.length - 1].id;
        }

        // Mesclar com mensagens locais (substituindo versoes antigas)
        setMessages(prev => {
          debugLog(`${LOG_PREFIX} Estado anterior: ${prev.length} mensagens`);

          // FIX RACE CONDITION: Se prev vazio mas temos mensagens na ref, usar ref
          let effectivePrev = prev;
          if (prev.length === 0 && cachedMessagesRef.current.length > 0) {
            debugLog(`${LOG_PREFIX} [RACE_FIX] prev vazio, usando ref com ${cachedMessagesRef.current.length} mensagens`);
            effectivePrev = cachedMessagesRef.current;
          }

          // DEBUG CRITICO: Verificar videos no prev
          const prevVideos = effectivePrev.filter(m => m.type === 'video');
          if (prevVideos.length > 0 || videoConvertedMsgs.length > 0) {
            debugLog(`${LOG_PREFIX} [MERGE_DEBUG] ========== VIDEOS NO PREV ==========`);
            debugLog(`${LOG_PREFIX} [MERGE_DEBUG] Total videos no effectivePrev: ${prevVideos.length}`);
            prevVideos.forEach((pv, idx) => {
              debugLog(`${LOG_PREFIX} [MERGE_DEBUG] Prev Video ${idx + 1}: id=${pv.id}, messageKey=${pv.messageKey ? 'SIM' : 'NAO'}`);
            });
            debugLog(`${LOG_PREFIX} [MERGE_DEBUG] Total videos novos: ${videoConvertedMsgs.length}`);
            videoConvertedMsgs.forEach((cv, idx) => {
              debugLog(`${LOG_PREFIX} [MERGE_DEBUG] Novo Video ${idx + 1}: id=${cv.id}, messageKey=${cv.messageKey ? 'SIM (' + cv.messageKey.id + ')' : 'NAO'}`);
            });
            debugLog(`${LOG_PREFIX} [MERGE_DEBUG] ===========================================`);
          }

          // Usar Map para deduplicacao perfeita (por ID)
          const messagesMap = new Map<string, WhatsAppMessage>();

          // Criar indice de messageKey.id para verificar duplicatas
          const messageKeyIndex = new Map<string, string>();

          // Adicionar mensagens existentes (usando effectivePrev)
          effectivePrev.forEach(m => {
            messagesMap.set(m.id, m);
            // Indexar pelo messageKey.id tambem
            if (m.messageKey?.id) {
              messageKeyIndex.set(m.messageKey.id, m.id);
            }
          });

          // Adicionar/atualizar mensagens (SEMPRE substitui versoes antigas)
          let newCount = 0;
          let updatedCount = 0;
          convertedMessages.forEach(m => {
            // Verificar se ja existe pelo ID - ATUALIZA com nova versao
            if (messagesMap.has(m.id)) {
              const existing = messagesMap.get(m.id)!;
              // Atualiza se a nova versao tem mais campos (thumbnail, senderName, messageKey)
              const newHasMore = (m.content as any)?.thumbnail || m.senderName;
              const existingHasMore = (existing.content as any)?.thumbnail || existing.senderName;
              // CRITICO: Tambem atualizar se nova tem messageKey e existente nao
              const newHasMessageKey = !!m.messageKey;
              const existingHasMessageKey = !!existing.messageKey;
              const shouldUpdateForMessageKey = newHasMessageKey && !existingHasMessageKey;
              if ((newHasMore && !existingHasMore) || shouldUpdateForMessageKey) {
                // MERGE INTELIGENTE: preservar messageKey e reaction da existente
                const mergedMessage: WhatsAppMessage = {
                  ...m,
                  messageKey: m.messageKey || existing.messageKey,
                  reaction: m.reaction || existing.reaction,
                };
                messagesMap.set(m.id, mergedMessage);
                updatedCount++;
                if (shouldUpdateForMessageKey) {
                  debugLog(`${LOG_PREFIX} [MERGE] Mensagem ${m.id} ATUALIZADA com messageKey`);
                } else {
                  debugLog(`${LOG_PREFIX} [MERGE] Mensagem ${m.id} ATUALIZADA com thumbnail/senderName (messageKey preservado: ${!!mergedMessage.messageKey})`);
                }
              }
              return;
            }

            // Verificar se ja existe pelo messageKey.id
            if (m.messageKey?.id && messageKeyIndex.has(m.messageKey.id)) {
              const existingId = messageKeyIndex.get(m.messageKey.id)!;
              const existing = messagesMap.get(existingId)!;
              const newThumbnail = (m.content as any)?.thumbnail;
              const existingThumbnail = (existing.content as any)?.thumbnail;
              const newHasMore = newThumbnail || m.senderName;
              const existingHasMore = existingThumbnail || existing.senderName;

              // Log detalhado para debug de merge
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] ========================================`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Encontrou match por messageKey.id: ${m.messageKey.id}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Nova msg ID: ${m.id}, Existente ID: ${existingId}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Nova msg type: ${m.type}, Existente type: ${existing.type}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Nova thumbnail: ${newThumbnail ? 'SIM (' + String(newThumbnail).length + ' chars)' : 'NAO'}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Existente thumbnail: ${existingThumbnail ? 'SIM (' + String(existingThumbnail).length + ' chars)' : 'NAO'}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] newHasMore: ${!!newHasMore}, existingHasMore: ${!!existingHasMore}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] Vai substituir? ${newHasMore && !existingHasMore ? 'SIM' : 'NAO'}`);
              debugLog(`${LOG_PREFIX} [MERGE-DEBUG] ========================================`);

              // Substituir se nova tem mais dados OU se nova tem thumbnail e existente nao
              if ((newHasMore && !existingHasMore) || (newThumbnail && !existingThumbnail)) {
                // MERGE INTELIGENTE: preservar messageKey e reaction da existente
                const mergedMessage: WhatsAppMessage = {
                  ...m,
                  messageKey: m.messageKey || existing.messageKey,
                  reaction: m.reaction || existing.reaction,
                };
                messagesMap.delete(existingId);
                messagesMap.set(m.id, mergedMessage);
                messageKeyIndex.set(m.messageKey.id, m.id);
                updatedCount++;
                debugLog(`${LOG_PREFIX} [MERGE] Mensagem ${m.id} ATUALIZADA via messageKey (thumbnail: ${!!newThumbnail}, messageKey preservado: ${!!mergedMessage.messageKey})`);
              }
              return;
            }

            newCount++;
            messagesMap.set(m.id, m);
            if (m.messageKey?.id) {
              messageKeyIndex.set(m.messageKey.id, m.id);
            }
          });

          if (newCount === 0 && updatedCount === 0) {
            debugLog(`${LOG_PREFIX} Nenhuma mensagem nova ou atualizada`);
            return prev;
          }

          debugLog(`${LOG_PREFIX} [MERGE] ${newCount} novas, ${updatedCount} atualizadas`);

          // Converter Map de volta para array e ordenar
          const merged = Array.from(messagesMap.values())
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          // Aplicar reacoes da API ao resultado final (inclui msgs existentes)
          applyReactionsToMessages(merged, apiReactionMap);

          // DEBUG CRITICO: Verificar videos no resultado final
          const mergedVideos = merged.filter(m => m.type === 'video');
          if (mergedVideos.length > 0) {
            debugLog(`${LOG_PREFIX} [MERGE_RESULT] ========== VIDEOS NO RESULTADO ==========`);
            debugLog(`${LOG_PREFIX} [MERGE_RESULT] Total videos: ${mergedVideos.length}`);
            mergedVideos.forEach((mv, idx) => {
              const hasKey = !!mv.messageKey;
              debugLog(`${LOG_PREFIX} [MERGE_RESULT] Video ${idx + 1}: id=${mv.id}, messageKey=${hasKey ? 'SIM (' + mv.messageKey!.id + ')' : 'NAO'}`);
              if (!hasKey) {
                console.error(`${LOG_PREFIX} [MERGE_RESULT] ERRO: Video ${mv.id} PERDEU messageKey!`);
              }
            });
            debugLog(`${LOG_PREFIX} [MERGE_RESULT] =============================================`);
          }

          debugLog(`${LOG_PREFIX} [DELTA] Novas: ${newCount}, Atualizadas: ${updatedCount}, Total: ${merged.length}`);

          // Atualizar ref com resultado do merge para futuras chamadas
          cachedMessagesRef.current = merged;

          return merged;
        });

        cacheLoadedRef.current = true; //......Marca cache carregado
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao carregar mensagens:`, error);
    } finally {
      setIsLoading(false);
      debugLog(`${LOG_PREFIX} FIM: loadMessagesFromApi`);
    }
  }, [instanceName, leadPhone, convertApiMessage, loadMessagesFromCache]);

  // ========================================
  // Reset refs quando troca de lead
  // ========================================
  useEffect(() => {
    debugLog(`${LOG_PREFIX} [RESET] Lead mudou para: ${leadPhone}`);
    cacheLoadedRef.current = false; //......Reseta flag de cache
    isFirstLoadRef.current = true; //......Reseta flag de primeiro load
    lastMessageIdRef.current = null; //......Reseta ultima mensagem
    cachedMessagesRef.current = []; //......Limpa ref de cache
    setMessages([]); //......Limpa mensagens antigas
  }, [leadPhone]);

  // ========================================
  // Iniciar polling de mensagens
  // ========================================
  useEffect(() => {
    // Carregar mensagens iniciais
    if (instanceName && leadPhone) {
      loadMessagesFromApi();

      // Iniciar polling (a cada 5 segundos)
      // Verifica flag pausado antes de executar
      pollingIntervalRef.current = setInterval(() => {
        if (!pollingPausedRef.current) {
          loadMessagesFromApi();
        }
      }, 5000);

      debugLog(`${LOG_PREFIX} Polling iniciado (5s)`);
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        debugLog(`${LOG_PREFIX} Polling parado`);
      }
    };
  }, [instanceName, leadPhone, loadMessagesFromApi]);

  // ========================================
  // Pausar Polling (para emoji picker)
  // ========================================
  const pausePolling = useCallback(() => {
    pollingPausedRef.current = true; //......Pausa polling
    debugLog(`${LOG_PREFIX} Polling PAUSADO (emoji picker aberto)`);
  }, []);

  // ========================================
  // Retomar Polling
  // ========================================
  const resumePolling = useCallback(() => {
    pollingPausedRef.current = false; //......Retoma polling
    debugLog(`${LOG_PREFIX} Polling RETOMADO`);
  }, []);

  // ========================================
  // Enviar Mensagem de Texto
  // Aceita customReplyInfo para replies de ImageViewer/VideoViewer
  // ========================================
  const sendTextMessage = useCallback(async (text: string, customReplyInfo?: ReplyInfo | null) => {
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: sendTextMessage`);
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} Texto:`, text);
    debugLog(`${LOG_PREFIX} leadId:`, leadId);
    debugLog(`${LOG_PREFIX} leadPhone:`, leadPhone);
    debugLog(`${LOG_PREFIX} instanceName:`, instanceName);
    debugLog(`${LOG_PREFIX} replyingTo (estado):`, JSON.stringify(replyingTo));
    debugLog(`${LOG_PREFIX} customReplyInfo (parametro):`, JSON.stringify(customReplyInfo));
    debugLog(`${LOG_PREFIX} customReplyInfo !== undefined:`, customReplyInfo !== undefined);

    // Usa customReplyInfo se fornecido, senao usa replyingTo do estado
    const effectiveReplyInfo = customReplyInfo !== undefined ? customReplyInfo : replyingTo;

    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} effectiveReplyInfo calculado:`);
    debugLog(`${LOG_PREFIX}   - valor:`, JSON.stringify(effectiveReplyInfo));
    debugLog(`${LOG_PREFIX}   - existe:`, !!effectiveReplyInfo);
    if (effectiveReplyInfo) {
      debugLog(`${LOG_PREFIX}   - messageId:`, effectiveReplyInfo.messageId);
      debugLog(`${LOG_PREFIX}   - senderName:`, effectiveReplyInfo.senderName);
      debugLog(`${LOG_PREFIX}   - content:`, effectiveReplyInfo.content);
      debugLog(`${LOG_PREFIX}   - type:`, effectiveReplyInfo.type);
      debugLog(`${LOG_PREFIX}   - messageKey:`, JSON.stringify(effectiveReplyInfo.messageKey));
      debugLog(`${LOG_PREFIX}   - thumbnail existe:`, !!effectiveReplyInfo.thumbnail);
      debugLog(`${LOG_PREFIX}   - thumbnail length:`, effectiveReplyInfo.thumbnail?.length || 0);
      if (effectiveReplyInfo.messageKey) {
        debugLog(`${LOG_PREFIX}   - messageKey.id:`, effectiveReplyInfo.messageKey.id);
        debugLog(`${LOG_PREFIX}   - messageKey.remoteJid:`, effectiveReplyInfo.messageKey.remoteJid);
        debugLog(`${LOG_PREFIX}   - messageKey.fromMe:`, effectiveReplyInfo.messageKey.fromMe);
      } else {
        console.error(`${LOG_PREFIX}   - ERRO: messageKey NAO EXISTE - reply NAO sera vinculado!`);
      }
    }
    debugLog(`${LOG_PREFIX} ========================================`);

    // Validacao do texto
    if (!text.trim()) {
      console.warn(`${LOG_PREFIX} Texto vazio, ignorando envio`);
      return;
    }

    // Validacao do telefone
    if (!leadPhone) {
      console.error(`${LOG_PREFIX} ERRO: leadPhone esta vazio!`);
      console.error(`${LOG_PREFIX} Nao e possivel enviar mensagem sem numero`);
      return;
    }

    // Validacao da instancia
    if (!instanceName) {
      console.error(`${LOG_PREFIX} ERRO: instanceName esta vazio!`);
      console.error(`${LOG_PREFIX} Nao e possivel enviar mensagem sem instancia`);
      return;
    }

    // Criar mensagem local
    const content: TextContent = {
      text: text.trim(),                  //......Texto limpo
    };

    const newMessage: WhatsAppMessage = {
      id: generateMessageId(),            //......ID unico
      type: 'text',                       //......Tipo texto
      direction: 'outgoing',              //......Enviada
      content,                            //......Conteudo
      timestamp: new Date(),              //......Data atual
      status: 'pending',                  //......Status inicial
      senderId: 'user-1',                 //......ID do usuario
      replyTo: effectiveReplyInfo || undefined,
    };

    debugLog(`${LOG_PREFIX} Mensagem criada localmente:`, {
      id: newMessage.id,
      type: newMessage.type,
      status: newMessage.status,
    });

    // Adiciona mensagem localmente (otimista)
    setMessages((prev) => [...prev, newMessage]);
    // So limpa replyingTo se nao foi customReplyInfo (evita limpar estado do InputBar)
    if (customReplyInfo === undefined) {
      setReplyingTo(null);
    }
    setIsSending(true);

    // Formatar numero para API
    const formattedPhone = formatPhoneNumber(leadPhone);

    debugLog(`${LOG_PREFIX} Preparando chamada para Evolution API:`);
    debugLog(`${LOG_PREFIX}   - instanceName: ${instanceName}`);
    debugLog(`${LOG_PREFIX}   - number: ${formattedPhone}`);
    debugLog(`${LOG_PREFIX}   - text: ${text.trim()}`);

    try {
      // Construir objeto quoted para reply vinculado na API
      let quoted: { key: { id: string; remoteJid: string; fromMe: boolean }; message?: any } | undefined;

      debugLog(`${LOG_PREFIX} ========================================`);
      debugLog(`${LOG_PREFIX} CONSTRUINDO QUOTED OBJECT:`);
      debugLog(`${LOG_PREFIX} effectiveReplyInfo existe:`, !!effectiveReplyInfo);
      debugLog(`${LOG_PREFIX} effectiveReplyInfo?.messageKey existe:`, !!effectiveReplyInfo?.messageKey);

      if (effectiveReplyInfo?.messageKey) {
        // LOG DETALHADO: Dados do messageKey original
        debugLog(`${LOG_PREFIX} ========== DADOS DO MESSAGE KEY ==========`);
        debugLog(`${LOG_PREFIX} effectiveReplyInfo.messageKey:`, JSON.stringify(effectiveReplyInfo.messageKey, null, 2));
        debugLog(`${LOG_PREFIX} effectiveReplyInfo.type:`, effectiveReplyInfo.type);
        debugLog(`${LOG_PREFIX} effectiveReplyInfo.content:`, effectiveReplyInfo.content);
        debugLog(`${LOG_PREFIX} effectiveReplyInfo.messageId:`, effectiveReplyInfo.messageId);
        debugLog(`${LOG_PREFIX} effectiveReplyInfo.senderName:`, effectiveReplyInfo.senderName);
        debugLog(`${LOG_PREFIX} ===========================================`);

        // Construir message - SIMPLIFICADO para Evolution API
        // A API parece aceitar melhor { conversation: "texto" } para todos os tipos
        // O tipo da mensagem citada e identificado pelo ID, nao pelo payload
        const contentPreview = (() => {
          switch (effectiveReplyInfo.type) {
            case 'video': return effectiveReplyInfo.content || 'Vídeo';
            case 'image': return effectiveReplyInfo.content || 'Foto';
            case 'audio': return 'Mensagem de áudio';
            case 'document': return effectiveReplyInfo.content || 'Documento';
            default: return effectiveReplyInfo.content || '';
          }
        })();

        // FORMATO SIMPLIFICADO: Usar conversation para TODOS os tipos
        // Isso garante compatibilidade maxima com a API
        const messagePayload = { conversation: contentPreview };

        debugLog(`${LOG_PREFIX} [QUOTED] messagePayload tipo original:`, effectiveReplyInfo.type);
        debugLog(`${LOG_PREFIX} [QUOTED] contentPreview:`, contentPreview);
        debugLog(`${LOG_PREFIX} [QUOTED] messagePayload:`, JSON.stringify(messagePayload));

        // FORMATO EVOLUTION API v2: Com key completo e message
        // NOTA: Para replies funcionarem, o key precisa ter remoteJid e fromMe corretos
        // Se fromMe=true, o participant deve ser nosso numero (omitir para simplicidade)
        // Se fromMe=false, o participant deve ser o remoteJid do lead
        const participant = effectiveReplyInfo.messageKey.fromMe
          ? undefined // Omitir participant quando mensagem e nossa
          : effectiveReplyInfo.messageKey.remoteJid; // Usar remoteJid do lead

        quoted = {
          key: {
            id: effectiveReplyInfo.messageKey.id,
            remoteJid: effectiveReplyInfo.messageKey.remoteJid,
            fromMe: effectiveReplyInfo.messageKey.fromMe,
            ...(participant && { participant }), // Adiciona participant se existir
          },
          message: messagePayload,
        };

        debugLog(`${LOG_PREFIX} participant calculado:`, participant || 'OMITIDO (fromMe=true)');

        debugLog(`${LOG_PREFIX} ========== QUOTED OBJECT FINAL ==========`);
        debugLog(`${LOG_PREFIX} QUOTED CONSTRUIDO COM SUCESSO:`);
        debugLog(`${LOG_PREFIX}   - quoted.key.id:`, quoted.key.id);
        debugLog(`${LOG_PREFIX}   - quoted.key.remoteJid:`, quoted.key.remoteJid);
        debugLog(`${LOG_PREFIX}   - quoted.key.fromMe:`, quoted.key.fromMe);
        debugLog(`${LOG_PREFIX}   - type:`, effectiveReplyInfo.type);
        debugLog(`${LOG_PREFIX}   - messagePayload:`, JSON.stringify(messagePayload));
        debugLog(`${LOG_PREFIX} Quoted completo:`, JSON.stringify(quoted, null, 2));
        debugLog(`${LOG_PREFIX} =========================================`);
      } else {
        console.warn(`${LOG_PREFIX} QUOTED NAO CONSTRUIDO - mensagem sera enviada SEM vinculo!`);
        if (effectiveReplyInfo) {
          console.warn(`${LOG_PREFIX}   - effectiveReplyInfo existe mas messageKey NAO`);
          console.warn(`${LOG_PREFIX}   - Isso indica que a mensagem original NAO tem messageKey`);
        }
      }
      debugLog(`${LOG_PREFIX} ========================================`);

      // Chamar Evolution API
      debugLog(`${LOG_PREFIX} Chamando evolutionService.sendText()...`);
      debugLog(`${LOG_PREFIX}   - instanceName:`, instanceName);
      debugLog(`${LOG_PREFIX}   - formattedPhone:`, formattedPhone);
      debugLog(`${LOG_PREFIX}   - text:`, text.trim());
      debugLog(`${LOG_PREFIX}   - quoted:`, quoted ? 'SIM' : 'NAO');

      const response = await evolutionService.sendText(
        instanceName,
        formattedPhone,
        text.trim(),
        quoted
      );

      debugLog(`${LOG_PREFIX} ========================================`);
      debugLog(`${LOG_PREFIX} RESPOSTA DA EVOLUTION API:`);
      debugLog(`${LOG_PREFIX} ========================================`);
      debugLog(`${LOG_PREFIX} Resposta completa:`, JSON.stringify(response, null, 2));
      debugLog(`${LOG_PREFIX} response.error:`, response.error);
      debugLog(`${LOG_PREFIX} response.key:`, JSON.stringify(response.key));
      debugLog(`${LOG_PREFIX} response.id:`, response.id);

      // Verificar se teve erro
      if (response.error) {
        console.error(`${LOG_PREFIX} ERRO na resposta da API:`, response.error);

        // Atualiza status para erro
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' as MessageStatus }
              : msg
          )
        );
      } else {
        debugLog(`${LOG_PREFIX} Mensagem enviada com sucesso!`);
        debugLog(`${LOG_PREFIX} Key da mensagem:`, response.key);
        debugLog(`${LOG_PREFIX} ID da API:`, response.id);

        // Salva messageKey para uso em reacoes
        const messageKey: MessageKey | undefined = response.key
          ? {
              id: response.key.id,
              remoteJid: response.key.remoteJid,
              fromMe: response.key.fromMe,
            }
          : undefined;

        // ID real da API (evita duplicacao no polling)
        // Usa o ID retornado pela API ou constroi a partir do key
        const apiMessageId = response.id || (response.key ? `${response.key.id}_${Math.floor(Date.now() / 1000)}` : newMessage.id);

        debugLog(`${LOG_PREFIX} Atualizando ID local ${newMessage.id} para ${apiMessageId}`);

        // Atualiza status e ID para o ID da API (evita duplicacao)
        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  id: apiMessageId,                 //......Usa ID da API
                  status: 'sent' as MessageStatus,
                  messageKey,                       //......Salva chave para reacoes
                }
              : msg
          );
          // Atualizar ref para manter consistencia
          cachedMessagesRef.current = updated;
          return updated;
        });

        debugLog(`${LOG_PREFIX} [TEXT_SENT] messageKey atualizado na mensagem ${newMessage.id}:`, messageKey);

        // Salva mensagem no IndexedDB para persistencia local
        const messageToSave: WhatsAppMessage = {
          ...newMessage,
          id: apiMessageId,
          status: 'sent' as MessageStatus,
          messageKey,
        };
        saveMessageToCache(messageToSave);

        // Salva mensagem no contexto (arquivo TXT)
        saveToContext('VENDEDOR', text.trim());
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} EXCECAO ao enviar mensagem:`, error);
      console.error(`${LOG_PREFIX} Stack:`, (error as Error).stack);

      // Atualiza status para erro
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      debugLog(`${LOG_PREFIX} ========================================`);
      debugLog(`${LOG_PREFIX} FIM: sendTextMessage`);
      debugLog(`${LOG_PREFIX} ========================================`);
    }
  }, [leadId, leadPhone, instanceName, replyingTo, saveToContext, saveMessageToCache]);

  // ========================================
  // Enviar Mensagem de Audio
  // ========================================
  const sendAudioMessage = useCallback(async (uri: string, duration: number) => {
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: sendAudioMessage`);
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} URI:`, uri);
    debugLog(`${LOG_PREFIX} Duration:`, duration);
    debugLog(`${LOG_PREFIX} leadPhone:`, leadPhone);
    debugLog(`${LOG_PREFIX} instanceName:`, instanceName);

    const newMessage: WhatsAppMessage = {
      id: generateMessageId(),            //......ID unico
      type: 'audio',                      //......Tipo audio
      direction: 'outgoing',              //......Enviada
      content: {
        url: uri,                         //......URL do audio
        duration,                         //......Duracao
        mimeType: 'audio/mpeg',           //......Tipo MIME
      },
      timestamp: new Date(),              //......Data atual
      status: 'pending',                  //......Status inicial
      senderId: 'user-1',                 //......ID do usuario
    };

    // Adiciona mensagem localmente
    setMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    // Validacoes
    if (!leadPhone || !instanceName) {
      console.error(`${LOG_PREFIX} ERRO: leadPhone ou instanceName vazio`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
      setIsSending(false);
      return;
    }

    const formattedPhone = formatPhoneNumber(leadPhone);

    try {
      // Converte blob URL para base64 puro
      debugLog(`${LOG_PREFIX} Convertendo audio para base64...`);
      let audioBase64 = uri;

      // Se for blob URL, converte para base64 puro
      if (uri.startsWith('blob:')) {
        const result = await blobUrlToBase64(uri);
        audioBase64 = result.base64;
        debugLog(`${LOG_PREFIX} Audio convertido para base64`);
      }

      debugLog(`${LOG_PREFIX} Chamando evolutionService.sendAudio()...`);

      const response = await evolutionService.sendAudio(
        instanceName,
        formattedPhone,
        audioBase64
      );

      debugLog(`${LOG_PREFIX} Resposta da API (audio):`, JSON.stringify(response, null, 2));

      if (response.error) {
        console.error(`${LOG_PREFIX} ERRO ao enviar audio:`, response.error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' as MessageStatus }
              : msg
          )
        );
      } else {
        debugLog(`${LOG_PREFIX} Audio enviado com sucesso!`);
        debugLog(`${LOG_PREFIX} messageKey:`, response.key);

        // Salva messageKey para uso em reacoes
        const messageKey: MessageKey | undefined = response.key
          ? {
              id: response.key.id,
              remoteJid: response.key.remoteJid,
              fromMe: response.key.fromMe,
            }
          : undefined;

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: 'sent' as MessageStatus,
                  messageKey,                       //......Salva chave para reacoes
                }
              : msg
          );
          // Atualizar ref para manter consistencia
          cachedMessagesRef.current = updated;
          return updated;
        });

        debugLog(`${LOG_PREFIX} [AUDIO_SENT] messageKey atualizado na mensagem ${newMessage.id}:`, messageKey);

        // Salva mensagem no IndexedDB para persistencia local
        const messageToSave: WhatsAppMessage = {
          ...newMessage,
          status: 'sent' as MessageStatus,
          messageKey,
        };
        saveMessageToCache(messageToSave);

        // Salva no contexto (arquivo TXT)
        saveToContext('VENDEDOR', `[AUDIO: ${duration}s]`);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} EXCECAO ao enviar audio:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      debugLog(`${LOG_PREFIX} FIM: sendAudioMessage`);
    }
  }, [leadPhone, instanceName, saveToContext, saveMessageToCache]);

  // ========================================
  // Retry Mensagem de Audio
  // ========================================
  const retryAudioMessage = useCallback(async (message: WhatsAppMessage): Promise<boolean> => {
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: retryAudioMessage`);
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} messageId:`, message.id);

    // Verifica se e mensagem de audio
    if (message.type !== 'audio') {
      console.error(`${LOG_PREFIX} ERRO: Mensagem nao e de audio`);
      return false;
    }

    // Extrai dados do content
    const audioContent = message.content as { url: string; duration: number };
    if (!audioContent.url || !audioContent.duration) {
      console.error(`${LOG_PREFIX} ERRO: Content invalido`);
      return false;
    }

    // Atualiza status para pending
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === message.id
          ? { ...msg, status: 'pending' as MessageStatus }
          : msg
      )
    );

    // Validacoes
    if (!leadPhone || !instanceName) {
      console.error(`${LOG_PREFIX} ERRO: leadPhone ou instanceName vazio`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
      return false;
    }

    const formattedPhone = formatPhoneNumber(leadPhone);

    try {
      // Converte blob URL para base64 puro
      debugLog(`${LOG_PREFIX} Convertendo audio para base64...`);
      let audioBase64 = audioContent.url;

      // Se for blob URL, converte para base64 puro
      if (audioContent.url.startsWith('blob:')) {
        const result = await blobUrlToBase64(audioContent.url);
        audioBase64 = result.base64;
        debugLog(`${LOG_PREFIX} Audio convertido para base64`);
      }

      debugLog(`${LOG_PREFIX} Chamando evolutionService.sendAudio() [RETRY]...`);

      const response = await evolutionService.sendAudio(
        instanceName,
        formattedPhone,
        audioBase64
      );

      debugLog(`${LOG_PREFIX} Resposta da API (audio retry):`, JSON.stringify(response, null, 2));

      if (response.error) {
        console.error(`${LOG_PREFIX} ERRO ao reenviar audio:`, response.error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, status: 'failed' as MessageStatus }
              : msg
          )
        );
        return false;
      } else {
        debugLog(`${LOG_PREFIX} Audio reenviado com sucesso!`);

        // Salva messageKey para uso em reacoes
        const messageKey: MessageKey | undefined = response.key
          ? {
              id: response.key.id,
              remoteJid: response.key.remoteJid,
              fromMe: response.key.fromMe,
            }
          : undefined;

        setMessages((prev) => {
          const updated = prev.map((msg) =>
            msg.id === message.id
              ? {
                  ...msg,
                  status: 'sent' as MessageStatus,
                  messageKey,
                }
              : msg
          );
          // Atualizar ref para manter consistencia
          cachedMessagesRef.current = updated;
          return updated;
        });

        debugLog(`${LOG_PREFIX} [AUDIO_RETRY] messageKey atualizado na mensagem ${message.id}:`, messageKey);
        return true;
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} EXCECAO ao reenviar audio:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
      return false;
    } finally {
      debugLog(`${LOG_PREFIX} FIM: retryAudioMessage`);
    }
  }, [leadPhone, instanceName]);

  // ========================================
  // Enviar Mensagem de Imagem ou Video
  // Detecta automaticamente se e video ou imagem
  // ========================================
  const sendImageMessage = useCallback(async (
    uri: string,
    width: number,
    height: number,
    caption?: string,
    viewOnce?: boolean
  ) => {
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: sendImageMessage`);
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} URI:`, uri);
    debugLog(`${LOG_PREFIX} Dimensoes:`, { width, height });
    debugLog(`${LOG_PREFIX} Caption:`, caption || '(sem legenda)');
    debugLog(`${LOG_PREFIX} ViewOnce:`, viewOnce || false);
    console.log('🔒 [VIEW_ONCE] useMessages.sendImageMessage viewOnce:', viewOnce, '(tipo:', typeof viewOnce, ')');

    // Pausar polling para evitar race condition com messageKey
    debugLog(`${LOG_PREFIX} [MEDIA_SEND] Pausando polling para evitar race condition`);
    pollingPausedRef.current = true;

    // Inicialmente assume imagem
    const newMessage: WhatsAppMessage = {
      id: generateMessageId(),            //......ID unico
      type: 'image',                      //......Tipo inicial (pode mudar para video)
      direction: 'outgoing',              //......Enviada
      content: {
        url: uri,                         //......URL da midia
        width,                            //......Largura
        height,                           //......Altura
        caption,                          //......Legenda opcional
      },
      timestamp: new Date(),              //......Data atual
      status: 'pending',                  //......Status inicial
      senderId: 'user-1',                 //......ID do usuario
      viewOnce: viewOnce || false,        //......Visualizacao unica
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    if (!leadPhone || !instanceName) {
      console.error(`${LOG_PREFIX} ERRO: leadPhone ou instanceName vazio`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
      setIsSending(false);
      return;
    }

    const formattedPhone = formatPhoneNumber(leadPhone);

    try {
      // Converter blob URL para base64 e detectar tipo de midia
      let mediaData = uri;
      let isVideo = false;
      let mimeType = 'image/jpeg';
      let videoThumbnail: string | undefined;

      console.log(`${LOG_PREFIX} ========================================`);
      console.log(`${LOG_PREFIX} PROCESSANDO URI:`);
      console.log(`${LOG_PREFIX} URI tipo:`, uri.substring(0, 50));
      console.log(`${LOG_PREFIX} URI length:`, uri.length);
      console.log(`${LOG_PREFIX} ========================================`);

      // Detectar video pela extensao do arquivo (fallback)
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.3gp', '.mkv'];
      const uriLower = uri.toLowerCase();
      const hasVideoExtension = videoExtensions.some(ext => uriLower.includes(ext));

      console.log(`${LOG_PREFIX} Tem extensao de video:`, hasVideoExtension);

      if (uri.startsWith('blob:')) {
        console.log(`${LOG_PREFIX} Detectado blob URL, convertendo e detectando tipo...`);
        const result = await blobUrlToBase64(uri);
        mediaData = result.base64;
        isVideo = result.isVideo;
        mimeType = result.mimeType;
        videoThumbnail = result.thumbnail;
        console.log(`${LOG_PREFIX} ========================================`);
        console.log(`${LOG_PREFIX} RESULTADO DA CONVERSAO BLOB:`);
        console.log(`${LOG_PREFIX} mimeType:`, mimeType);
        console.log(`${LOG_PREFIX} isVideo:`, isVideo);
        console.log(`${LOG_PREFIX} isImage:`, result.isImage);
        console.log(`${LOG_PREFIX} base64 length:`, mediaData.length);
        console.log(`${LOG_PREFIX} base64 prefix:`, mediaData.substring(0, 50));
        console.log(`${LOG_PREFIX} thumbnail:`, videoThumbnail ? `SIM (${videoThumbnail.length} chars)` : 'NAO');
        console.log(`${LOG_PREFIX} ========================================`);
      } else if (uri.startsWith('data:')) {
        // Data URL (ex: data:image/jpeg;base64,/9j/4AAQ...)
        console.log(`${LOG_PREFIX} Detectado data URL, extraindo base64...`);
        const matches = uri.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          mediaData = matches[2];
          isVideo = mimeType.startsWith('video/');
          console.log(`${LOG_PREFIX} ========================================`);
          console.log(`${LOG_PREFIX} RESULTADO DA EXTRACAO DATA URL:`);
          console.log(`${LOG_PREFIX} mimeType:`, mimeType);
          console.log(`${LOG_PREFIX} isVideo:`, isVideo);
          console.log(`${LOG_PREFIX} base64 length:`, mediaData.length);
          console.log(`${LOG_PREFIX} base64 prefix:`, mediaData.substring(0, 50));
          console.log(`${LOG_PREFIX} ========================================`);
        } else {
          console.error(`${LOG_PREFIX} ERRO: Data URL invalida, formato nao reconhecido`);
        }
      } else if (hasVideoExtension) {
        // URI nao e blob, mas tem extensao de video
        isVideo = true;
        mimeType = 'video/mp4';
        console.log(`${LOG_PREFIX} Detectado video por extensao`);
      } else {
        console.log(`${LOG_PREFIX} URI nao reconhecida, usando como esta`);
      }

      console.log(`${LOG_PREFIX} ========================================`);
      console.log(`${LOG_PREFIX} DECISAO FINAL:`);
      console.log(`${LOG_PREFIX} isVideo:`, isVideo);
      console.log(`${LOG_PREFIX} mimeType:`, mimeType);
      console.log(`${LOG_PREFIX} mediaData length:`, mediaData.length);
      console.log(`${LOG_PREFIX} mediaData prefix:`, mediaData.substring(0, 30));
      console.log(`${LOG_PREFIX} thumbnail disponivel:`, !!videoThumbnail);
      console.log(`${LOG_PREFIX} ========================================`);

      let response;

      if (isVideo) {
        // E um video - chamar sendVideo
        console.log(`${LOG_PREFIX} ========================================`);
        console.log(`${LOG_PREFIX} CHAMANDO sendVideo`);
        console.log(`${LOG_PREFIX} instanceName:`, instanceName);
        console.log(`${LOG_PREFIX} formattedPhone:`, formattedPhone);
        console.log(`${LOG_PREFIX} mimeType:`, mimeType);
        console.log(`${LOG_PREFIX} mediaData length:`, mediaData.length);
        console.log(`${LOG_PREFIX} thumbnail:`, videoThumbnail ? `SIM (${videoThumbnail.length} chars)` : 'NAO');
        console.log(`${LOG_PREFIX} ========================================`);

        // Atualiza o tipo da mensagem local para 'video' COM THUMBNAIL
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  type: 'video' as const,
                  content: {
                    ...msg.content,
                    mimeType,                       //......Adiciona mimeType ao content
                    thumbnail: videoThumbnail,      //......Thumbnail gerado localmente
                  },
                }
              : msg
          )
        );

        console.log('🔒 [VIEW_ONCE] ANTES de chamar evolutionService.sendVideo, viewOnce:', viewOnce, '(tipo:', typeof viewOnce, ')');
        response = await evolutionService.sendVideo(
          instanceName,
          formattedPhone,
          mediaData,
          mimeType,
          caption,
          viewOnce
        );

        console.log(`${LOG_PREFIX} Resposta da API (video):`, JSON.stringify(response, null, 2));
      } else {
        // E uma imagem - chamar sendImage
        console.log(`${LOG_PREFIX} ========================================`);
        console.log(`${LOG_PREFIX} CHAMANDO sendImage`);
        console.log(`${LOG_PREFIX} instanceName:`, instanceName);
        console.log(`${LOG_PREFIX} formattedPhone:`, formattedPhone);
        console.log(`${LOG_PREFIX} mediaData length:`, mediaData.length);
        console.log(`${LOG_PREFIX} caption:`, caption);
        console.log(`${LOG_PREFIX} ========================================`);

        console.log('🔒 [VIEW_ONCE] ANTES de chamar evolutionService.sendImage, viewOnce:', viewOnce, '(tipo:', typeof viewOnce, ')');
        response = await evolutionService.sendImage(
          instanceName,
          formattedPhone,
          mediaData,
          caption,
          viewOnce
        );

        console.log(`${LOG_PREFIX} Resposta da API (imagem):`, JSON.stringify(response, null, 2));
      }

      if (response.error) {
        console.error(`${LOG_PREFIX} ERRO ao enviar ${isVideo ? 'video' : 'imagem'}:`, response.error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' as MessageStatus }
              : msg
          )
        );
      } else {
        debugLog(`${LOG_PREFIX} ========================================`);
        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] ${isVideo ? 'Video' : 'Imagem'} enviado com sucesso!`);
        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] newMessage.id:`, newMessage.id);
        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] response completo:`, JSON.stringify(response, null, 2));
        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] response.key existe:`, !!response.key);
        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] response.key:`, response.key);
        debugLog(`${LOG_PREFIX} ========================================`);

        // Salva messageKey para uso em reacoes
        const messageKey: MessageKey | undefined = response.key
          ? {
              id: response.key.id,
              remoteJid: response.key.remoteJid,
              fromMe: response.key.fromMe,
            }
          : undefined;

        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] messageKey construido:`, messageKey);

        if (!messageKey) {
          console.error(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] ERRO CRITICO: messageKey NAO CONSTRUIDO!`);
          console.error(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] response.key era undefined - API nao retornou key`);
          console.error(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] Esta mensagem NAO podera ser citada em replies!`);
        }

        setMessages((prev) => {
          debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] setMessages chamado`);
          debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] prev.length:`, prev.length);
          const msgIndex = prev.findIndex((m) => m.id === newMessage.id);
          debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] Mensagem encontrada no index:`, msgIndex);
          if (msgIndex >= 0) {
            debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] Mensagem atual:`, prev[msgIndex].id, prev[msgIndex].messageKey);
          }

          const updated = prev.map((msg) =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  status: 'sent' as MessageStatus,
                  messageKey,                       //......Salva chave para reacoes
                }
              : msg
          );

          // Verificar se a atualizacao foi aplicada
          const updatedMsg = updated.find((m) => m.id === newMessage.id);
          debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] Mensagem apos update:`, updatedMsg?.id, updatedMsg?.messageKey);

          // Atualizar ref para manter consistencia
          cachedMessagesRef.current = updated;
          return updated;
        });

        debugLog(`${LOG_PREFIX} [MEDIA_SEND_SUCCESS] messageKey atualizado na mensagem ${newMessage.id}:`, messageKey);

        // Salva midia no MediaStorageService para persistencia local
        // IMPORTANTE: URL blob nao persiste apos recarregar - usar data URI
        let persistentUrl = uri; //....................................... URL original (blob ou data)
        if (uri.startsWith('blob:') && mediaData) {
          debugLog(`${LOG_PREFIX} [MEDIA_SAVE] Salvando midia no storage local...`);
          try {
            const dataUri = await mediaStorageService.saveDirectMedia(
              mediaData,                          //...................... Base64 da midia
              mimeType,                           //...................... Tipo MIME
              newMessage.id,                      //...................... ID da mensagem
              formattedPhone                      //...................... Telefone do lead
            );
            persistentUrl = dataUri;              //...................... Usa data URI persistente
            debugLog(`${LOG_PREFIX} [MEDIA_SAVE] Midia salva, URL persistente criada`);
          } catch (err) {
            console.error(`${LOG_PREFIX} [MEDIA_SAVE] Erro ao salvar midia:`, err);
            // Fallback: usa URL original (pode nao persistir)
          }
        }

        // Salva mensagem no IndexedDB para persistencia local
        const messageToSave: WhatsAppMessage = {
          ...newMessage,
          type: isVideo ? 'video' : 'image',
          status: 'sent' as MessageStatus,
          messageKey,
          content: {
            ...newMessage.content,
            url: persistentUrl,                   //...................... URL persistente (data URI)
            thumbnail: isVideo ? videoThumbnail : undefined,
            mimeType: isVideo ? mimeType : undefined,
          },
        };
        saveMessageToCache(messageToSave);

        debugLog(`${LOG_PREFIX} ========================================`);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} EXCECAO ao enviar midia:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      // Retomar polling apos 2 segundos para garantir que o estado foi atualizado
      debugLog(`${LOG_PREFIX} [MEDIA_SEND] Agendando retomada do polling em 2s`);
      setTimeout(() => {
        debugLog(`${LOG_PREFIX} [MEDIA_SEND] Retomando polling`);
        pollingPausedRef.current = false;
      }, 2000);
      debugLog(`${LOG_PREFIX} FIM: sendImageMessage`);
    }
  }, [leadPhone, instanceName, saveMessageToCache]);

  // ========================================
  // Enviar Mensagem de Documento
  // ========================================
  const sendDocumentMessage = useCallback(async (
    uri: string,
    fileName: string,
    fileSize: number
  ) => {
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} INICIO: sendDocumentMessage`);
    debugLog(`${LOG_PREFIX} ========================================`);
    debugLog(`${LOG_PREFIX} URI:`, uri);
    debugLog(`${LOG_PREFIX} FileName:`, fileName);
    debugLog(`${LOG_PREFIX} FileSize:`, fileSize);

    const newMessage: WhatsAppMessage = {
      id: generateMessageId(),            //......ID unico
      type: 'document',                   //......Tipo documento
      direction: 'outgoing',              //......Enviada
      content: {
        url: uri,                         //......URL do documento
        fileName,                         //......Nome do arquivo
        fileSize,                         //......Tamanho
        mimeType: 'application/pdf',      //......Tipo MIME
      },
      timestamp: new Date(),              //......Data atual
      status: 'pending',                  //......Status inicial
      senderId: 'user-1',                 //......ID do usuario
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsSending(true);

    if (!leadPhone || !instanceName) {
      console.error(`${LOG_PREFIX} ERRO: leadPhone ou instanceName vazio`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
      setIsSending(false);
      return;
    }

    const formattedPhone = formatPhoneNumber(leadPhone);

    try {
      debugLog(`${LOG_PREFIX} Chamando evolutionService.sendDocument()...`);

      const response = await evolutionService.sendDocument(
        instanceName,
        formattedPhone,
        uri,
        fileName
      );

      debugLog(`${LOG_PREFIX} Resposta da API (documento):`, JSON.stringify(response, null, 2));

      if (response.error) {
        console.error(`${LOG_PREFIX} ERRO ao enviar documento:`, response.error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: 'failed' as MessageStatus }
              : msg
          )
        );
      } else {
        debugLog(`${LOG_PREFIX} Documento enviado com sucesso!`);

        // Salva messageKey para uso em reacoes
        const messageKey: MessageKey | undefined = response.key
          ? {
              id: response.key.id,
              remoteJid: response.key.remoteJid,
              fromMe: response.key.fromMe,
            }
          : undefined;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, status: 'sent' as MessageStatus, messageKey }
              : msg
          )
        );

        // Salva mensagem no IndexedDB para persistencia local
        const messageToSave: WhatsAppMessage = {
          ...newMessage,
          status: 'sent' as MessageStatus,
          messageKey,
        };
        saveMessageToCache(messageToSave);
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} EXCECAO ao enviar documento:`, error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: 'failed' as MessageStatus }
            : msg
        )
      );
    } finally {
      setIsSending(false);
      debugLog(`${LOG_PREFIX} FIM: sendDocumentMessage`);
    }
  }, [leadPhone, instanceName, saveMessageToCache]);

  // ========================================
  // Definir Reply To
  // ========================================
  const setReplyTo = useCallback((info: ReplyInfo | null) => {
    debugLog(`${LOG_PREFIX} setReplyTo:`, info);
    setReplyingTo(info);                  //......Define reply
  }, []);

  // ========================================
  // Deletar Mensagem
  // ========================================
  const deleteMessage = useCallback((messageId: string) => {
    debugLog(`${LOG_PREFIX} deleteMessage:`, messageId);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              type: 'deleted' as const,
              content: { text: 'Mensagem apagada' },
            }
          : msg
      )
    );
  }, []);

  // ========================================
  // Atualizar Reacao da Mensagem
  // ========================================
  const updateMessageReaction = useCallback((
    messageId: string,
    reaction: string | null
  ) => {
    debugLog(`[🔴 REACTION_DEBUG] 2.4.1 updateMessageReaction chamado:`, { //......Log chamada
      messageId, //......ID mensagem
      reaction: reaction || '(remover)', //......Reacao nova
    });

    setMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reaction: reaction || undefined }
          : msg
      );

      const targetMessage = updated.find(m => m.id === messageId); //......Busca mensagem
      debugLog(`[🔴 REACTION_DEBUG] 2.4.2 Mensagem após atualização:`, { //......Log resultado
        found: !!targetMessage, //......Encontrou mensagem
        newReaction: targetMessage?.reaction, //......Nova reacao
      });

      return updated;
    });
  }, []);

  // ========================================
  // Recarregar Mensagens
  // ========================================
  const refreshMessages = useCallback(() => {
    debugLog(`${LOG_PREFIX} refreshMessages chamado`);
    setIsLoading(true);

    // TODO: Implementar busca de mensagens da API
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // ========================================
  // Log de estado inicial
  // ========================================
  useEffect(() => {
    debugLog(`${LOG_PREFIX} Hook inicializado com:`, {
      leadId,
      leadPhone,
      instanceName,
      messagesCount: messages.length,
    });
  }, [leadId, leadPhone, instanceName, messages.length]);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    messages,                             //......Mensagens
    isLoading,                            //......Loading
    isSending,                            //......Enviando
    replyingTo,                           //......Reply info
    instanceName,                         //......Nome da instancia
    sendTextMessage,                      //......Envia texto
    sendAudioMessage,                     //......Envia audio
    sendImageMessage,                     //......Envia imagem
    sendDocumentMessage,                  //......Envia documento
    setReplyTo,                           //......Define reply
    deleteMessage,                        //......Deleta mensagem
    updateMessageReaction,                //......Atualiza reacao
    refreshMessages,                      //......Recarrega
    retryAudioMessage,                    //......Retry audio
    pausePolling,                         //......Pausa polling
    resumePolling,                        //......Retoma polling
  };
};

// ========================================
// Export Default
// ========================================
export default useMessages;

// ========================================
// Funcao Global para Limpar Cache (Debug)
// Usar no console: window.clearChatCache()
// ========================================
if (typeof window !== 'undefined') {
  (window as any).clearChatCache = async () => {
    try {
      debugLog('[CACHE_DEBUG] Limpando cache do IndexedDB...');
      await indexedDBService.clearAll();
      debugLog('[CACHE_DEBUG] Cache limpo com sucesso!');
      debugLog('[CACHE_DEBUG] Recarregue a pagina para buscar mensagens atualizadas.');
      return 'Cache limpo! Recarregue a pagina.';
    } catch (error) {
      console.error('[CACHE_DEBUG] Erro ao limpar cache:', error);
      return 'Erro ao limpar cache: ' + error;
    }
  };

  (window as any).getCacheStats = async () => {
    try {
      const stats = await indexedDBService.getStats();
      debugLog('[CACHE_DEBUG] Estatisticas do cache:', stats);
      return stats;
    } catch (error) {
      console.error('[CACHE_DEBUG] Erro ao obter estatisticas:', error);
      return 'Erro: ' + error;
    }
  };

  // Limpa apenas mensagens de midia com URLs externas (expiradas)
  (window as any).limparMidiasAntigas = async () => {
    try {
      debugLog('[CACHE_DEBUG] Removendo midias com URLs expiradas...');
      const deleted = await indexedDBService.deleteAllExternalMedia();
      debugLog(`[CACHE_DEBUG] ${deleted} mensagens de midia removidas!`);
      debugLog('[CACHE_DEBUG] Recarregue a pagina (F5) para ver o resultado.');
      return `${deleted} midias antigas removidas! Recarregue a pagina.`;
    } catch (error) {
      console.error('[CACHE_DEBUG] Erro:', error);
      return 'Erro: ' + error;
    }
  };

  // Limpa midias de um lead especifico
  (window as any).limparMidiasDoLead = async (telefone: string) => {
    if (!telefone) {
      debugLog('[CACHE_DEBUG] Uso: limparMidiasDoLead("5517991396062")');
      return 'Informe o telefone do lead (apenas numeros)';
    }
    try {
      // Formata telefone (adiciona 55 se necessario)
      let phone = telefone.replace(/\D/g, '');
      if (!phone.startsWith('55')) phone = '55' + phone;

      debugLog(`[CACHE_DEBUG] Removendo midias do lead ${phone}...`);
      const deleted = await indexedDBService.deleteMediaMessages(phone);
      debugLog(`[CACHE_DEBUG] ${deleted} mensagens de midia removidas!`);
      debugLog('[CACHE_DEBUG] Recarregue a pagina (F5) para ver o resultado.');
      return `${deleted} midias removidas do lead ${phone}! Recarregue a pagina.`;
    } catch (error) {
      console.error('[CACHE_DEBUG] Erro:', error);
      return 'Erro: ' + error;
    }
  };

  debugLog('[useMessages] Funcoes de debug disponíveis:');
  debugLog('  - window.clearChatCache()              : Limpa todo o cache');
  debugLog('  - window.getCacheStats()               : Mostra estatisticas');
  debugLog('  - window.limparMidiasAntigas()         : Remove TODAS midias com URLs expiradas');
  debugLog('  - window.limparMidiasDoLead("551799...") : Remove midias de um lead especifico');
}
