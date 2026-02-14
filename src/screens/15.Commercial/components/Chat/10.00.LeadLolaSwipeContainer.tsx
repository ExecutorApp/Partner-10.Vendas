// ========================================
// Container de Swipe Lead <-> Lola
// Header e input fixos, apenas conteudo swipa
// ========================================

// ========================================
// Imports React
// ========================================
import React, {
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useEffect,                              //......Hook de efeito
  useMemo,                                //......Valor memoizado
  useRef,                                 //......Hook de ref
} from 'react';

// ========================================
// Imports React Native
// ========================================
import {
  View,                                   //......Container
  Animated,                               //......Animacoes
  StyleSheet,                             //......Estilos
  Dimensions,                             //......Dimensoes
  KeyboardAvoidingView,                   //......Evitar teclado
  Platform,                               //......Plataforma
  Image,                                  //......Imagem
  Pressable,                              //......Pressionavel
  Clipboard,                              //......Area de transferencia
  Text,                                   //......Texto
  Alert,                                  //......Alerta
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ========================================
// Imports de Componentes Header e Input
// ========================================
import ChatHeader from './components/Header/08.01.ChatHeader';
import InputBar, { InputBarRef } from './components/Input/08.10.InputBar';
import RecordingBar from './components/Input/08.14.RecordingBar';

// ========================================
// Imports de Componentes de Conteudo
// ========================================
import LeadMessagesContent from './10.03.LeadMessagesContent';
import LolaConversationContent from '../Lola/11.01.LolaConversationContent';

// ========================================
// Imports de Modais
// ========================================
import EmojiPicker from './components/Modals/08.15.EmojiPicker';
import AttachmentMenu from './components/Modals/08.16.AttachmentMenu';
import ImageViewer from './components/Modals/08.17.ImageViewer';
import VideoViewer from './components/Modals/08.18.VideoViewer';
import MessageOptions from './components/Modals/08.18.MessageOptions';
import ShareModal from './components/Modals/08.19.ShareModal';
import MediaGalleryModal from './components/Modals/08.21.MediaGalleryModal';

// ========================================
// Imports de Camera Web
// ========================================
import WebCameraModal, { WebCapturedMedia } from './camera/WebCameraModal';
import PhotoEditorScreen from './camera/PhotoEditorScreen';

// ========================================
// Imports de Contexto
// ========================================
import { LeadLolaProvider, useLeadLola } from '../../contexts/LeadLolaContext';
import { LolaAvatarProvider } from '../../contexts/LolaAvatarContext';
import { ThemeProvider, useTheme } from './styles/themes/ThemeContext';

// ========================================
// Imports de Hooks
// ========================================
import { useMessages } from './hooks/08.useMessages';
import { useVoiceRecorder } from './hooks/08.useVoiceRecorder';

// ========================================
// Imports de Servicos
// ========================================
import { evolutionService } from '../../services/evolutionService';
import { mediaStorageService } from '../../services/mediaStorageService';
import aiService from '../../services/aiService';

// ========================================
// Imports de Tipos
// ========================================
import {
  ChatInfo,                               //......Info do chat
  WhatsAppMessage,                        //......Interface mensagem
  TextContent,                            //......Conteudo texto
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
  AudioContent,                           //......Conteudo audio
  DocumentContent,                        //......Conteudo documento
  ReplyInfo,                              //......Info reply
  MediaGroupData,                         //......Dados grupo de midias
  MediaGroupItem,                        //......Item de grupo de midias
} from './types/08.types.whatsapp';

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from './styles/08.ChatColors';

// ========================================
// Imports de Componentes Lola
// ========================================
import LolaFloatingAvatar from '../Lola/12.00.LolaFloatingAvatar';

// ========================================
// Imports de Assets
// ========================================
import chatBackgroundImage from './assets/chat-background.png';
import { chatBackgroundBase64 } from './assets/chatBackgroundBase64';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================================
// Tipo do Estilo de Timestamp
// ========================================
export type TimestampStyle = 'container' | 'transparent';

// ========================================
// Tipos de Navegacao
// ========================================
type LeadChatRouteParams = {
  LeadChatScreen: {
    leadId: string;                       //......ID do lead
    leadName: string;                     //......Nome do lead
    leadPhone: string;                    //......Telefone do lead
    leadPhoto?: string;                   //......Foto do lead
    pendingPhoto?: {                      //......Foto pendente da camera
      uri: string;                        //......URI da foto
      width: number;                      //......Largura
      height: number;                     //......Altura
      caption?: string;                   //......Legenda opcional
      viewOnce?: boolean;                 //......Visualizacao unica
    };
  };
};

// ========================================
// Componente Interno com Swipe
// ========================================
const SwipeContent: React.FC<{
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadPhoto?: string;
  pendingPhoto?: {
    uri: string;
    width: number;
    height: number;
    caption?: string;
    viewOnce?: boolean;
  };
}> = ({ leadId, leadName, leadPhone, leadPhoto, pendingPhoto }) => {
  // Log de performance: inicio do componente
  const perfStart = (window as any).__PERF_KANBAN_START;
  if (perfStart) {
    console.log(`[PERF] SwipeContent Render Start: ${Date.now() - perfStart}ms`);
  }

  // ========================================
  // Navegacao
  // ========================================
  const navigation = useNavigation();

  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Contexto de Navegacao Swipe
  // ========================================
  const { translateX, panResponder, activeScreen, toggleScreen } = useLeadLola();

  // ========================================
  // Hook de Mensagens
  // ========================================
  const {
    messages,
    replyingTo,
    isSending,
    instanceName,
    sendTextMessage,
    sendAudioMessage,
    sendImageMessage,
    setReplyTo,
    deleteMessage,
    updateMessageReaction,
    retryAudioMessage,
    pausePolling,
    resumePolling,
  } = useMessages({ leadId, leadPhone, leadName });

  // Log de performance: apos useMessages
  if (perfStart) {
    console.log(`[PERF] useMessages Hook Done: ${Date.now() - perfStart}ms`);
  }

  // ========================================
  // Hook de Gravacao
  // ========================================
  const {
    isRecording,
    recordingDuration,
    recordingUri,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  // ========================================
  // Ref do InputBar
  // ========================================
  const inputBarRef = useRef<InputBarRef>(null);

  // ========================================
  // Processar Foto Pendente da Camera
  // ========================================
  useEffect(() => {
    if (pendingPhoto) {
      console.log('[SwipeContent] Processando foto pendente:', pendingPhoto.uri);
      // Enviar a foto
      sendImageMessage(pendingPhoto.uri, pendingPhoto.width, pendingPhoto.height);
    }
  }, [pendingPhoto, sendImageMessage]);

  // ========================================
  // Estados dos Modais
  // ========================================
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showVideoViewer, setShowVideoViewer] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [viewerImage, setViewerImage] = useState<string>('');
  const [viewerVideo, setViewerVideo] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>(''); //......URL para compartilhar
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaGalleryGroup, setMediaGalleryGroup] = useState<MediaGroupData | null>(null);
  const [mediaGroupForOptions, setMediaGroupForOptions] = useState<MediaGroupData | null>(null);
  const returnToGalleryRef = useRef(false);

  // Mapa de transcricoes inline (por messageId)
  const [transcriptions, setTranscriptions] = useState<Record<string, { text: string; isLoading: boolean }>>({});

  // ========================================
  // Sincronizar mediaGalleryGroup com mensagens atualizadas
  // (reacoes, status, etc. podem mudar enquanto a galeria esta aberta)
  // ========================================
  useEffect(() => {
    if (!mediaGalleryGroup) return;
    const updatedItems = mediaGalleryGroup.items.map(item => {
      const currentMsg = messages.find(m => m.id === item.message.id);
      return currentMsg && currentMsg !== item.message
        ? { ...item, message: currentMsg }
        : item;
    });
    const hasChanges = updatedItems.some((item, i) => item !== mediaGalleryGroup.items[i]);
    if (hasChanges) {
      setMediaGalleryGroup(prev => prev ? { ...prev, items: updatedItems } : null);
    }
  }, [messages, mediaGalleryGroup]);

  // ========================================
  // Estados da Camera Web
  // ========================================
  const [showWebCamera, setShowWebCamera] = useState(false);
  const [showWebPhotoPreview, setShowWebPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<WebCapturedMedia | null>(null);

  // ========================================
  // Estilo do Timestamp (Fixo: Transparente/Azul)
  // ========================================
  const timestampStyle: TimestampStyle = 'transparent'; //......Estilo fixo transparente

  // ========================================
  // Obter pushName do lead da ultima mensagem incoming
  // Usado para exibir nome do WhatsApp no reply preview
  // ========================================
  const leadPushNameFromMessages = useMemo(() => {
    // Busca a ultima mensagem incoming que tenha senderName
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.direction === 'incoming' && msg.senderName) {
        return msg.senderName;
      }
    }
    return undefined;
  }, [messages]);

  // ========================================
  // Metricas de Performance: Log do mount
  // ========================================
  useEffect(() => {
    const start = (window as any).__PERF_KANBAN_START;
    if (start) {
      console.log(`[PERF] Screen Mount: ${Date.now() - start}ms`);
    }
  }, []);

  // ========================================
  // Metricas de Performance: First Render (quando mensagens carregam)
  // ========================================
  const firstRenderLogged = useRef(false);
  useEffect(() => {
    if (messages.length > 0 && !firstRenderLogged.current) {
      firstRenderLogged.current = true;
      const start = (window as any).__PERF_KANBAN_START;
      if (start) {
        const elapsed = Date.now() - start;
        console.log(`[PERF] First Render: ${elapsed}ms`);
        console.timeEnd('[PERF] Kanban→Chat');
        // Limpa a variavel global
        delete (window as any).__PERF_KANBAN_START;
      }
    }
  }, [messages]);

  // ========================================
  // Info do Chat
  // ========================================
  const [chatInfo] = useState<ChatInfo>({
    leadId,
    leadName,
    leadPhone,
    leadPhoto,
    isOnline: false,
    lastSeen: new Date(),
    isTyping: false,
  });

  // ========================================
  // Contexto do Lead para Lola
  // ========================================
  const leadContext = useMemo(() => ({
    leadId,
    name: leadName,
    phone: leadPhone,
    phase: 'Prospeccao',
    lastInteraction: new Date(),
    channel: 'WhatsApp',
  }), [leadId, leadName, leadPhone]);

  // ========================================
  // Enviar audio quando gravacao termina
  // ========================================
  useEffect(() => {
    if (recordingUri && recordingDuration > 0) {
      sendAudioMessage(recordingUri, recordingDuration);
    }
  }, [recordingUri, recordingDuration, sendAudioMessage]);

  // ========================================
  // Pausar polling quando emoji picker abrir
  // Evita processamento pesado durante scroll
  // ========================================
  useEffect(() => {
    if (showEmojiPicker) {
      pausePolling();  //......Pausa polling
    } else {
      resumePolling(); //......Retoma polling
    }
  }, [showEmojiPicker, pausePolling, resumePolling]);

  // ========================================
  // Handler de Voltar
  // ========================================
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ========================================
  // Handler de Perfil (Toggle Tela)
  // ========================================
  const handleProfile = useCallback(() => {
    toggleScreen();
  }, [toggleScreen]);

  // ========================================
  // Handler de Menu
  // ========================================
  const handleMenu = useCallback(() => {
    console.log('Abrir menu do chat');
  }, []);

  // ========================================
  // Handler de Enviar Mensagem
  // ========================================
  const handleSendMessage = useCallback((text: string) => {
    sendTextMessage(text);
  }, [sendTextMessage]);

  // ========================================
  // Handler de Enviar Audio
  // ========================================
  const handleSendAudio = useCallback((durationSec: number, uri?: string | null) => {
    if (!uri) return;
    sendAudioMessage(uri, durationSec);
  }, [sendAudioMessage]);

  // ========================================
  // Handlers de Voz
  // ========================================
  const handleVoiceStart = useCallback(() => {
    startRecording();
  }, [startRecording]);

  const handleVoiceEnd = useCallback(() => {
    // Nao faz nada
  }, []);

  const handleRecordingCancel = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  const handleRecordingSend = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // ========================================
  // Handler de Emoji
  // ========================================
  const handleEmojiPress = useCallback(() => {
    setShowEmojiPicker(true);
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    inputBarRef.current?.insertText(emoji);
  }, []);

  // ========================================
  // Handler de Anexo
  // ========================================
  const handleAttachPress = useCallback(() => {
    setShowAttachMenu((prev) => !prev);
  }, []);

  const handleCloseAttachMenu = useCallback(() => {
    setShowAttachMenu(false);
  }, []);

  const handleSelectCamera = useCallback(async () => {
    console.log('📷 [LeadLolaSwipeContainer] handleSelectCamera iniciado');
    console.log('📷 [LeadLolaSwipeContainer] Plataforma detectada:', Platform.OS);

    // Fecha o menu de anexos
    setShowAttachMenu(false);
    console.log('📷 [LeadLolaSwipeContainer] Menu de anexos fechado');

    // Detecta plataforma
    if (Platform.OS === 'web') {
      // WEB: Abre modal com webcam
      console.log('📷 [LeadLolaSwipeContainer] Abrindo WebCameraModal...');
      setShowWebCamera(true);
      return;
    }

    // MOBILE: Usa expo-image-picker
    console.log('📷 [LeadLolaSwipeContainer] Solicitando permissao da camera...');
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    console.log('📷 [LeadLolaSwipeContainer] Permissao camera:', permissionResult.granted);

    if (!permissionResult.granted) {
      console.warn('📷 [LeadLolaSwipeContainer] Permissao da camera NEGADA');
      Alert.alert(
        'Permissao Necessaria',
        'Precisamos de acesso a camera para tirar fotos.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Abre a camera nativa
    console.log('📷 [LeadLolaSwipeContainer] Abrindo camera nativa...');
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],             //......Apenas imagens
        allowsEditing: false,               //......Sem edicao
        quality: 0.8,                       //......Qualidade 80%
      });

      console.log('📷 [LeadLolaSwipeContainer] Resultado camera:', result);

      // Verifica se usuario capturou imagem
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('📷 [LeadLolaSwipeContainer] Foto capturada, abrindo preview...');

        // Abre preview em vez de enviar direto
        setCapturedPhoto({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
        });
        setShowWebPhotoPreview(true);
      } else {
        console.log('📷 [LeadLolaSwipeContainer] Captura cancelada pelo usuario');
      }
    } catch (error) {
      console.error('📷 [LeadLolaSwipeContainer] ERRO ao abrir camera:', error);
      Alert.alert('Erro', 'Nao foi possivel abrir a camera. Tente novamente.');
    }
  }, []);

  // ========================================
  // Handler: Foto Capturada pela Webcam
  // ========================================
  const handleWebCameraCapture = useCallback((media: WebCapturedMedia) => {
    console.log('📷 [LeadLolaSwipeContainer] Midia capturada pela webcam:', media);
    console.log('📷 [LeadLolaSwipeContainer] Abrindo preview...');

    // Fecha camera e abre preview
    setShowWebCamera(false);
    setCapturedPhoto(media);
    setShowWebPhotoPreview(true);
  }, []);

  // ========================================
  // Handler: Fechar Camera Web
  // ========================================
  const handleWebCameraClose = useCallback(() => {
    console.log('📷 [LeadLolaSwipeContainer] Fechando webcam...');
    setShowWebCamera(false);
  }, []);

  // ========================================
  // Handler: Enviar Midias do Editor
  // Recebe array de midias processadas (fotos com dimensoes corretas + videos)
  // ========================================
  const handleWebPhotoSend = useCallback(async (items: { uri: string; type: 'photo' | 'video'; width: number; height: number; caption?: string; viewOnce?: boolean }[]) => {
    console.log('📷 [LeadLolaSwipeContainer] Enviando', items.length, 'midias');

    // Fechar modal imediatamente
    setShowWebPhotoPreview(false);
    setCapturedPhoto(null);

    // Enviar cada item sequencialmente
    for (const item of items) {
      console.log('📷 [LeadLolaSwipeContainer] Enviando:', item.type, item.width, 'x', item.height);
      console.log('🔒 [VIEW_ONCE] LeadLolaSwipeContainer item.viewOnce:', item.viewOnce, '(tipo:', typeof item.viewOnce, ')');
      await sendImageMessage(item.uri, item.width, item.height, item.caption, item.viewOnce);
    }

    console.log('📷 [LeadLolaSwipeContainer] Todas as midias enviadas!');
  }, [sendImageMessage]);

  // ========================================
  // Handler: Fechar Preview
  // ========================================
  const handleWebPhotoPreviewClose = useCallback(() => {
    console.log('📷 [LeadLolaSwipeContainer] Fechando preview, voltando para camera...');
    setShowWebPhotoPreview(false);
    setCapturedPhoto(null);

    // Reabre a camera para tirar outra foto
    if (Platform.OS === 'web') {
      setShowWebCamera(true);
    }
  }, []);

  // ========================================
  // Handler: Abrir Camera do Editor
  // Permite tirar mais fotos sem perder a atual
  // ========================================
  const handleOpenCameraFromEditor = useCallback(() => {
    console.log('📷 [LeadLolaSwipeContainer] Abrindo camera do editor para mais fotos...');
    setShowWebPhotoPreview(false);
    setCapturedPhoto(null);
    if (Platform.OS === 'web') {
      setShowWebCamera(true);
    }
  }, []);

  const handleSelectGallery = useCallback(async () => {
    console.log('[handleSelectGallery] ========================================');
    console.log('[handleSelectGallery] INICIO: Abrindo galeria');
    console.log('[handleSelectGallery] ========================================');

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[handleSelectGallery] Permissao:', permissionResult.granted);

    if (!permissionResult.granted) {
      console.log('[handleSelectGallery] Permissao NEGADA');
      return;
    }

    // Permite selecionar IMAGENS e VIDEOS
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],           //......Imagens e videos
      allowsEditing: false,                       //......Sem edicao
      quality: 0.8,                               //......Qualidade 80%
      allowsMultipleSelection: false,             //......Selecao unica
    });

    console.log('[handleSelectGallery] Resultado canceled:', result.canceled);
    console.log('[handleSelectGallery] Assets count:', result.assets?.length || 0);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      console.log('[handleSelectGallery] ========================================');
      console.log('[handleSelectGallery] ASSET SELECIONADO:');
      console.log('[handleSelectGallery] URI:', asset.uri);
      console.log('[handleSelectGallery] Type:', asset.type);
      console.log('[handleSelectGallery] MimeType:', asset.mimeType);
      console.log('[handleSelectGallery] Width:', asset.width);
      console.log('[handleSelectGallery] Height:', asset.height);
      console.log('[handleSelectGallery] Duration:', asset.duration);
      console.log('[handleSelectGallery] FileSize:', asset.fileSize);
      console.log('[handleSelectGallery] ========================================');

      console.log('[handleSelectGallery] Chamando sendImageMessage...');
      sendImageMessage(asset.uri, asset.width || 0, asset.height || 0);
    } else {
      console.log('[handleSelectGallery] Selecao cancelada ou sem assets');
    }

    console.log('[handleSelectGallery] FIM');
  }, [sendImageMessage]);

  const handleSelectDocument = useCallback(() => {
    console.log('Abrir documentos');
  }, []);

  const handleSelectContact = useCallback(() => {
    console.log('Selecionar contato');
  }, []);

  const handleSelectLocation = useCallback(() => {
    console.log('Selecionar localizacao');
  }, []);

  // ========================================
  // Handler de Long Press na Mensagem
  // ========================================
  const handleMessageLongPress = useCallback((message: WhatsAppMessage) => {
    setSelectedMessage(message);
    setShowMessageOptions(true);
  }, []);

  // ========================================
  // Handler de Abrir Imagem no Viewer
  // ========================================
  const handleImagePress = useCallback((imageUrl: string, message?: WhatsAppMessage) => {
    console.log('[SwipeContent] ========== IMAGE PRESS ==========');
    console.log('[SwipeContent] imageUrl:', imageUrl?.substring(0, 50));
    console.log('[SwipeContent] message?.id:', message?.id);
    console.log('[SwipeContent] message?.type:', message?.type);

    // Log critico: messageKey para replies
    console.log('[SwipeContent] ========== MESSAGE KEY DEBUG (IMAGE) ==========');
    console.log('[SwipeContent] message?.messageKey existe:', !!message?.messageKey);
    console.log('[SwipeContent] message?.messageKey:', JSON.stringify(message?.messageKey));
    if (!message?.messageKey) {
      console.error('[SwipeContent] ERRO: messageKey NAO EXISTE nesta imagem!');
    }
    console.log('[SwipeContent] ================================================');

    setViewerImage(imageUrl);
    setSelectedMessage(message || null);
    // Fecha galeria antes de abrir viewer (evita modal atras)
    if (showMediaGallery) {
      setShowMediaGallery(false);
      returnToGalleryRef.current = true;
    }
    setShowImageViewer(true);
  }, [showMediaGallery]);

  // ========================================
  // Handler de Abrir Galeria de Grupo de Midias
  // ========================================
  const handleMediaGroupPress = useCallback((group: MediaGroupData) => {
    setMediaGalleryGroup(group);          //......Define grupo
    setShowMediaGallery(true);            //......Abre galeria
  }, []);

  // ========================================
  // Handler de Long Press na Galeria de Midias
  // ========================================
  const handleMediaGroupLongPress = useCallback((group: MediaGroupData) => {
    setMediaGroupForOptions(group);       //......Salva grupo para opcoes
    setSelectedMessage(group.items[0].message); //......Primeira msg para direcao
    setShowMessageOptions(true);          //......Abre menu de opcoes
  }, []);

  // ========================================
  // Handler de Deletar Mensagens da Galeria
  // ========================================
  const handleGalleryDeleteMessages = useCallback((messageIds: string[]) => {
    messageIds.forEach(id => deleteMessage(id));
    if (mediaGalleryGroup && messageIds.length >= mediaGalleryGroup.items.length) {
      setShowMediaGallery(false);
      setMediaGalleryGroup(null);
    }
  }, [deleteMessage, mediaGalleryGroup]);

  // ========================================
  // Handler de Compartilhar da Galeria
  // ========================================
  const handleGalleryShareSelected = useCallback((items: MediaGroupItem[]) => {
    const firstItem = items[0];
    if (firstItem) {
      const content = firstItem.message.content as ImageContent | VideoContent;
      setViewerImage(content.url || content.thumbnail || '');
    }
    setShowShareModal(true);
  }, []);

  // ========================================
  // Handler de Abrir Video no Viewer
  // ========================================
  const handleVideoPress = useCallback((videoUrl: string, message?: WhatsAppMessage) => {
    console.log('[SwipeContent] ========== VIDEO PRESS ==========');
    console.log('[SwipeContent] videoUrl:', videoUrl?.substring(0, 50));
    console.log('[SwipeContent] message?.id:', message?.id);
    console.log('[SwipeContent] message?.type:', message?.type);
    console.log('[SwipeContent] message?.direction:', message?.direction);
    console.log('[SwipeContent] message?.senderName:', message?.senderName);

    // Log critico: messageKey para replies
    console.log('[SwipeContent] ========== MESSAGE KEY DEBUG ==========');
    console.log('[SwipeContent] message?.messageKey existe:', !!message?.messageKey);
    console.log('[SwipeContent] message?.messageKey:', JSON.stringify(message?.messageKey));
    if (message?.messageKey) {
      console.log('[SwipeContent]   - messageKey.id:', message.messageKey.id);
      console.log('[SwipeContent]   - messageKey.remoteJid:', message.messageKey.remoteJid);
      console.log('[SwipeContent]   - messageKey.fromMe:', message.messageKey.fromMe);
    } else {
      console.error('[SwipeContent] ERRO: messageKey NAO EXISTE nesta mensagem!');
      console.error('[SwipeContent] Replies a este video NAO serao vinculados!');
    }
    console.log('[SwipeContent] ========================================');

    // Log detalhado do content
    const content = message?.content as any;
    console.log('[SwipeContent] ========== THUMBNAIL DEBUG ==========');
    console.log('[SwipeContent] content existe:', !!content);
    console.log('[SwipeContent] content.thumbnail existe:', !!content?.thumbnail);
    console.log('[SwipeContent] content.thumbnail tipo:', typeof content?.thumbnail);
    console.log('[SwipeContent] content.thumbnail length:', content?.thumbnail?.length || 0);
    console.log('[SwipeContent] content.thumbnail prefix:', content?.thumbnail?.substring(0, 50) || 'VAZIO');
    console.log('[SwipeContent] Todas as chaves do content:', content ? Object.keys(content) : []);
    console.log('[SwipeContent] =====================================');

    setViewerVideo(videoUrl);
    setSelectedMessage(message || null);
    // Fecha galeria antes de abrir viewer (evita modal atras)
    if (showMediaGallery) {
      setShowMediaGallery(false);
      returnToGalleryRef.current = true;
    }
    setShowVideoViewer(true);
  }, [showMediaGallery]);

  // ========================================
  // Handler de Download Imagem
  // ========================================
  const handleImageDownload = useCallback(async () => {
    if (!viewerImage) return;

    try {
      if (Platform.OS === 'web') {
        const timestamp = Date.now();
        const fileName = `imagem_${timestamp}.jpg`;

        if (viewerImage.startsWith('blob:') || viewerImage.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = viewerImage;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const response = await fetch(viewerImage);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }
      } else {
        const timestamp = Date.now();
        const fileName = `imagem_${timestamp}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;
        const downloadResult = await FileSystem.downloadAsync(viewerImage, fileUri);
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      }
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  }, [viewerImage]);

  // ========================================
  // Handler de Compartilhar Imagem
  // ========================================
  const handleImageShare = useCallback(() => {
    setShowShareModal(true);
  }, []);

  // ========================================
  // Handler de Encaminhar para Contatos
  // Suporta URL (texto) e imagem
  // ========================================
  const handleShareForward = useCallback(async (contactIds: string[], message: string) => {
    setShowShareModal(false);  //......Fecha modal
    setShowImageViewer(false); //......Fecha viewer
    setSelectedMessage(null);  //......Limpa mensagem selecionada

    if (!instanceName) return; //......Precisa da instancia

    // Funcao auxiliar para extrair telefone do contactId
    const extractPhone = (contactId: string): string => {
      if (contactId.startsWith('whatsapp_')) {
        const jidMatch = contactId.match(/whatsapp_(\d+)@/);
        if (jidMatch) return jidMatch[1];
      } else if (contactId.startsWith('phone_')) {
        const parts = contactId.split('_');
        if (parts.length >= 2) return parts[1];
      }
      return '';
    };

    try {
      // Modo URL: envia texto com o link
      if (shareUrl) {
        const textToSend = message ? `${shareUrl}\n${message}` : shareUrl;
        for (const contactId of contactIds) {
          const phoneNumber = extractPhone(contactId);
          if (!phoneNumber) continue;
          await evolutionService.sendText(instanceName, phoneNumber, textToSend);
        }
        setShareUrl(''); //......Limpa URL apos envio
        return;
      }

      // Modo imagem: envia imagem com legenda
      if (!viewerImage) return;
      let imageData = viewerImage;
      if (viewerImage.startsWith('blob:')) {
        const response = await fetch(viewerImage);
        const blob = await response.blob();
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const pureBase64 = base64.split(',')[1] || base64;
            resolve(pureBase64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      for (const contactId of contactIds) {
        const phoneNumber = extractPhone(contactId);
        if (!phoneNumber) continue;
        await evolutionService.sendImage(instanceName, phoneNumber, imageData, message || undefined);
      }
    } catch (error) {
      console.error('Erro no encaminhamento:', error);
    }
  }, [viewerImage, shareUrl, instanceName]);

  // ========================================
  // Handler de Responder Imagem
  // ========================================
  const handleImageReply = useCallback(() => {
    if (!selectedMessage) return;
    // Extrai thumbnail da imagem
    const imgContent = selectedMessage.content as ImageContent;
    const thumbnail = imgContent.thumbnail || imgContent.url;
    const replyInfo: ReplyInfo = {
      messageId: selectedMessage.id,
      senderName: selectedMessage.senderName || 'Voce',
      content: '',
      type: 'image',
      thumbnail,                          //......Thumbnail para preview visual
    };
    setReplyTo(replyInfo);
    setShowImageViewer(false);
    setSelectedMessage(null);
  }, [selectedMessage, setReplyTo]);

  // ========================================
  // Handler de Enviar Resposta do ImageViewer
  // Envia mensagem vinculada (quoted) a imagem original
  // Usa sendTextMessage para adicionar ao estado local
  // ========================================
  const handleImageViewerSendReply = useCallback(async (text: string) => {
    console.log('[ImageReply] ========================================');
    console.log('[ImageReply] INICIO: handleImageViewerSendReply chamado');
    console.log('[ImageReply] ========================================');
    console.log('[ImageReply] text:', text);
    console.log('[ImageReply] text.trim():', text?.trim());
    console.log('[ImageReply] selectedMessage existe:', !!selectedMessage);

    if (!text.trim() || !selectedMessage) {
      console.log('[ImageReply] Condicao NAO atendida - saindo');
      return;
    }

    if (selectedMessage) {
      console.log('[ImageReply] selectedMessage.id:', selectedMessage.id);
      console.log('[ImageReply] selectedMessage.type:', selectedMessage.type);
      console.log('[ImageReply] selectedMessage.direction:', selectedMessage.direction);
      console.log('[ImageReply] selectedMessage.messageKey:', JSON.stringify(selectedMessage.messageKey));
    }

    // Cria ReplyInfo para vincular a mensagem a imagem
    // Extrai thumbnail da imagem
    const imgContent = selectedMessage.content as ImageContent;
    const thumbnail = imgContent.thumbnail || imgContent.url;
    const replyInfo: ReplyInfo = {
      messageId: selectedMessage.id,
      senderName: selectedMessage.direction === 'outgoing' ? 'Você' : (selectedMessage.senderName || 'Contato'),
      content: 'Foto',
      type: 'image',
      messageKey: selectedMessage.messageKey,
      thumbnail,                          //......Thumbnail para preview visual
    };

    console.log('[ImageReply] ========================================');
    console.log('[ImageReply] ReplyInfo criado:');
    console.log('[ImageReply]   - messageId:', replyInfo.messageId);
    console.log('[ImageReply]   - senderName:', replyInfo.senderName);
    console.log('[ImageReply]   - messageKey:', JSON.stringify(replyInfo.messageKey));
    console.log('[ImageReply] ========================================');

    if (!replyInfo.messageKey) {
      console.error('[ImageReply] ERRO CRITICO: messageKey NAO EXISTE no replyInfo!');
    }

    // Usa sendTextMessage que adiciona ao estado local e envia para API
    await sendTextMessage(text.trim(), replyInfo);

    console.log('[ImageReply] sendTextMessage retornou');
    console.log('[ImageReply] ========================================');
    console.log('[ImageReply] FIM: handleImageViewerSendReply (sucesso)');
    console.log('[ImageReply] ========================================');
  }, [selectedMessage, sendTextMessage]);

  // ========================================
  // Handler de Excluir Imagem
  // ========================================
  const handleImageDelete = useCallback(() => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id);
    setShowImageViewer(false);
    setSelectedMessage(null);
  }, [selectedMessage, deleteMessage]);

  // ========================================
  // Handler de Reacao na Imagem
  // ========================================
  const handleImageReaction = useCallback(async (
    reaction: string | null,
    previousEmoji?: string
  ) => {
    if (!selectedMessage) return;
    updateMessageReaction(selectedMessage.id, reaction);

    if (selectedMessage.messageKey && instanceName) {
      try {
        const emojiToSend = reaction ?? '';
        await evolutionService.sendReaction(instanceName, selectedMessage.messageKey, emojiToSend);
      } catch (error) {
        console.error('Erro ao enviar reacao:', error);
      }
    }
  }, [selectedMessage, updateMessageReaction, instanceName]);

  // ========================================
  // Handler de Download Video
  // ========================================
  const handleVideoDownload = useCallback(async () => {
    if (!viewerVideo) return;

    try {
      if (Platform.OS === 'web') {
        const timestamp = Date.now();
        const fileName = `video_${timestamp}.mp4`;

        if (viewerVideo.startsWith('blob:') || viewerVideo.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = viewerVideo;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const response = await fetch(viewerVideo);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }
      } else {
        const timestamp = Date.now();
        const fileName = `video_${timestamp}.mp4`;
        const fileUri = FileSystem.documentDirectory + fileName;
        const downloadResult = await FileSystem.downloadAsync(viewerVideo, fileUri);
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      }
    } catch (error) {
      console.error('Erro ao baixar video:', error);
    }
  }, [viewerVideo]);

  // ========================================
  // Handler de Compartilhar Video
  // ========================================
  const handleVideoShare = useCallback(() => {
    setShowVideoViewer(false);
    setTimeout(() => {
      setShowShareModal(true);
    }, 300);
  }, []);

  // ========================================
  // Handler de Responder Video (com texto do modal)
  // Envia mensagem vinculada (quoted) ao video original
  // Usa sendTextMessage para adicionar ao estado local
  // ========================================
  const handleVideoReply = useCallback(async (text?: string) => {
    console.log('[VideoReply] ========================================');
    console.log('[VideoReply] INICIO: handleVideoReply chamado');
    console.log('[VideoReply] ========================================');
    console.log('[VideoReply] text:', text);
    console.log('[VideoReply] text?.trim():', text?.trim());
    console.log('[VideoReply] text?.trim().length:', text?.trim()?.length);
    console.log('[VideoReply] selectedMessage existe:', !!selectedMessage);

    if (selectedMessage) {
      console.log('[VideoReply] selectedMessage.id:', selectedMessage.id);
      console.log('[VideoReply] selectedMessage.type:', selectedMessage.type);
      console.log('[VideoReply] selectedMessage.direction:', selectedMessage.direction);
      console.log('[VideoReply] selectedMessage.senderName:', selectedMessage.senderName);
      console.log('[VideoReply] selectedMessage.messageKey:', JSON.stringify(selectedMessage.messageKey));
      console.log('[VideoReply] messageKey?.id:', selectedMessage.messageKey?.id);
      console.log('[VideoReply] messageKey?.remoteJid:', selectedMessage.messageKey?.remoteJid);
      console.log('[VideoReply] messageKey?.fromMe:', selectedMessage.messageKey?.fromMe);
    } else {
      console.log('[VideoReply] ERRO: selectedMessage e NULL/UNDEFINED!');
    }

    // Se recebeu texto, envia a mensagem (VideoViewer permanece aberto)
    if (text?.trim() && selectedMessage) {
      // Cria ReplyInfo para vincular a mensagem ao video
      // Extrai thumbnail do conteudo do video
      const videoContent = selectedMessage.content as VideoContent;
      const replyInfo: ReplyInfo = {
        messageId: selectedMessage.id,
        senderName: selectedMessage.direction === 'outgoing' ? 'Você' : (selectedMessage.senderName || 'Contato'),
        content: 'Vídeo',
        type: 'video',
        messageKey: selectedMessage.messageKey,
        thumbnail: videoContent?.thumbnail,  //......Thumbnail do video para preview
      };

      console.log('[VideoReply] ========================================');
      console.log('[VideoReply] ReplyInfo criado:');
      console.log('[VideoReply]   - messageId:', replyInfo.messageId);
      console.log('[VideoReply]   - senderName:', replyInfo.senderName);
      console.log('[VideoReply]   - content:', replyInfo.content);
      console.log('[VideoReply]   - type:', replyInfo.type);
      console.log('[VideoReply]   - messageKey:', JSON.stringify(replyInfo.messageKey));
      console.log('[VideoReply]   - thumbnail existe:', !!replyInfo.thumbnail);
      console.log('[VideoReply]   - thumbnail length:', replyInfo.thumbnail?.length || 0);
      console.log('[VideoReply]   - thumbnail prefix:', replyInfo.thumbnail?.substring(0, 50) || 'VAZIO');
      console.log('[VideoReply] ========================================');

      if (!replyInfo.messageKey) {
        console.error('[VideoReply] ERRO CRITICO: messageKey NAO EXISTE no replyInfo!');
        console.error('[VideoReply] A mensagem sera enviada SEM vinculo (quoted)!');
      }

      console.log('[VideoReply] Chamando sendTextMessage com texto e replyInfo...');

      // Usa sendTextMessage que adiciona ao estado local e envia para API
      await sendTextMessage(text.trim(), replyInfo);

      console.log('[VideoReply] sendTextMessage retornou');
      console.log('[VideoReply] ========================================');
      console.log('[VideoReply] FIM: handleVideoReply (sucesso)');
      console.log('[VideoReply] ========================================');
      return;
    }

    // Sem texto ou sem selectedMessage = nao faz nada
    console.log('[VideoReply] Condicao NAO atendida:');
    console.log('[VideoReply]   - text?.trim() e falsy:', !text?.trim());
    console.log('[VideoReply]   - selectedMessage e falsy:', !selectedMessage);
    console.log('[VideoReply] ========================================');
    console.log('[VideoReply] FIM: handleVideoReply (ignorado)');
    console.log('[VideoReply] ========================================');
  }, [selectedMessage, sendTextMessage]);

  // ========================================
  // Handler de Excluir Video
  // ========================================
  const handleVideoDelete = useCallback(() => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id);
    setShowVideoViewer(false);
    setSelectedMessage(null);
  }, [selectedMessage, deleteMessage]);

  // ========================================
  // Handler de Reacao no Video
  // ========================================
  const handleVideoReaction = useCallback(async (reaction: string | null) => {
    if (!selectedMessage) return;
    updateMessageReaction(selectedMessage.id, reaction);

    if (selectedMessage.messageKey && instanceName) {
      try {
        const emojiToSend = reaction ?? '';
        await evolutionService.sendReaction(instanceName, selectedMessage.messageKey, emojiToSend);
      } catch (error) {
        console.error('Erro ao enviar reacao:', error);
      }
    }
  }, [selectedMessage, updateMessageReaction, instanceName]);

  // ========================================
  // Handler de Encaminhar Link via ShareModal
  // ========================================
  const handleLinkForwardPress = useCallback((url: string) => {
    setShareUrl(url);           //......Guarda URL para envio
    setShowShareModal(true);    //......Abre modal de compartilhamento
  }, []);

  // ========================================
  // Handler de Swipe Reply
  // Cria ReplyInfo a partir da mensagem e ativa reply
  // ========================================
  const handleSwipeReply = useCallback((message: WhatsAppMessage) => {
    let previewText = '';                 //......Preview do conteudo
    switch (message.type) {
      case 'text':                        //......Texto
        previewText = (message.content as TextContent).text;
        break;
      case 'audio':                       //......Audio
        previewText = 'Mensagem de áudio';
        break;
      case 'image':                       //......Imagem
        previewText = 'Foto';
        break;
      case 'video':                       //......Video
        previewText = 'Vídeo';
        break;
      case 'document':                    //......Documento
        previewText = (message.content as DocumentContent).fileName || 'Documento';
        break;
      default:                            //......Padrao
        previewText = 'Mensagem';
    }
    // Nome no formato WhatsApp: nome salvo ou +telefone ~pushName
    let senderName = 'Você';             //......Padrao outgoing
    if (message.direction !== 'outgoing') {
      const isNameSaved = leadName && !/^[\d\s\+\-\(\)]+$/.test(leadName.trim());
      if (isNameSaved) {
        senderName = leadName;            //......Nome salvo na agenda
      } else {
        const clean = leadPhone.replace(/\D/g, '');
        const phone = clean.length === 13 && clean.startsWith('55')
          ? `+${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,9)}-${clean.slice(9)}`
          : clean.length === 12 && clean.startsWith('55')
            ? `+${clean.slice(0,2)} ${clean.slice(2,4)} ${clean.slice(4,8)}-${clean.slice(8)}`
            : leadPhone.startsWith('+') ? leadPhone : `+${leadPhone}`;
        const pushName = message.senderName && message.senderName !== 'Contato' ? message.senderName : undefined;
        senderName = pushName ? `${phone} ~${pushName}` : phone;
      }
    }
    // Extrai thumbnail para video/imagem
    let thumbnail: string | undefined;    //......Thumbnail para preview
    if (message.type === 'video') {
      thumbnail = (message.content as VideoContent).thumbnail;
    } else if (message.type === 'image') {
      const imgContent = message.content as ImageContent;
      thumbnail = imgContent.thumbnail || imgContent.url;
    }
    const replyInfo: ReplyInfo = {
      messageId: message.id,              //......ID da mensagem
      senderName,                         //......Nome formatado
      content: previewText.substring(0, 100),
      type: message.type,                 //......Tipo da mensagem
      messageKey: message.messageKey,     //......Chave para quoted reply na API
      thumbnail,                          //......Thumbnail para preview visual
    };
    setReplyTo(replyInfo);                //......Ativa reply no input
  }, [setReplyTo, leadName, leadPhone]);

  // ========================================
  // Handler de Reply
  // ========================================
  const handleReply = useCallback(() => {
    if (!selectedMessage) return;
    // Extrai thumbnail para video/imagem
    let thumbnail: string | undefined;    //......Thumbnail para preview
    if (selectedMessage.type === 'video') {
      thumbnail = (selectedMessage.content as VideoContent).thumbnail;
    } else if (selectedMessage.type === 'image') {
      const imgContent = selectedMessage.content as ImageContent;
      thumbnail = imgContent.thumbnail || imgContent.url;
    }
    const replyInfo: ReplyInfo = {
      messageId: selectedMessage.id,
      senderName: selectedMessage.senderName || 'Voce',
      content: selectedMessage.type === 'text' ? (selectedMessage.content as TextContent).text : '',
      type: selectedMessage.type,
      messageKey: selectedMessage.messageKey,
      thumbnail,                          //......Thumbnail para preview visual
    };
    setReplyTo(replyInfo);
    setShowMessageOptions(false);
    setSelectedMessage(null);
  }, [selectedMessage, setReplyTo]);

  // ========================================
  // Handler de Copiar
  // ========================================
  const handleCopy = useCallback(() => {
    if (!selectedMessage || selectedMessage.type !== 'text') return;
    const content = selectedMessage.content as TextContent;
    Clipboard.setString(content.text);
    setShowMessageOptions(false);
    setSelectedMessage(null);
  }, [selectedMessage]);

  // ========================================
  // Handler de Encaminhar
  // ========================================
  const handleForward = useCallback(() => {
    console.log('Encaminhar mensagem');
    setShowMessageOptions(false);
    setSelectedMessage(null);
  }, []);

  // ========================================
  // Handler de Excluir
  // ========================================
  const handleDelete = useCallback(() => {
    if (!selectedMessage) return;
    deleteMessage(selectedMessage.id);
    setShowMessageOptions(false);
    setSelectedMessage(null);
  }, [selectedMessage, deleteMessage]);

  // ========================================
  // Handler de Reacao no Menu de Opcoes
  // ========================================
  const handleMessageReaction = useCallback(async (reaction: string | null) => {
    if (!selectedMessage) return;
    updateMessageReaction(selectedMessage.id, reaction);

    if (selectedMessage.messageKey && instanceName) {
      try {
        const emojiToSend = reaction ?? '';
        await evolutionService.sendReaction(instanceName, selectedMessage.messageKey, emojiToSend);
      } catch (error) {
        console.error('Erro ao enviar reacao:', error);
      }
    }
  }, [selectedMessage, updateMessageReaction, instanceName]);

  // ========================================
  // Handler de Transcrever Audio (inline na bolha)
  // ========================================
  const handleTranscribe = useCallback(async () => {
    if (!selectedMessage || selectedMessage.type !== 'audio') {
      setShowMessageOptions(false);       //......Fecha menu
      setSelectedMessage(null);           //......Limpa selecao
      return;
    }

    // Captura dados sincronicamente antes de qualquer await
    const msgId = selectedMessage.id || `temp_${Date.now()}`;
    const content = selectedMessage.content as AudioContent;
    const msgKey = selectedMessage.messageKey;
    const instName = instanceName;        //......Captura instancia local

    // Fecha menu e limpa selecao
    setShowMessageOptions(false);         //......Fecha menu
    setSelectedMessage(null);             //......Limpa selecao

    // Marca como transcrevendo (mostra spinner na bolha)
    setTranscriptions(prev => ({
      ...prev,
      [msgId]: { text: '', isLoading: true },
    }));

    try {
      // Passo 1: Obter audio descriptografado
      // Evolution API retorna audio decodificado; cache pode ter dados criptografados do CDN
      let audioUri: string | null = null;

      // Prioridade 1: Evolution API (retorna audio descriptografado)
      if (msgKey && instName) {
        try {
          const media = await evolutionService.getBase64FromMediaMessage(instName, msgKey);
          if (media?.base64) {
            let mimeType = media.mimeType || 'audio/ogg';
            let b64 = media.base64;       //......Base64 bruto
            if (b64.startsWith('data:')) {
              const ci = b64.indexOf(',');
              if (ci !== -1) b64 = b64.substring(ci + 1);
            }
            audioUri = `data:${mimeType};base64,${b64}`;
          }
        } catch {}
      }

      // Prioridade 2: Data URI ou Blob URL ja disponivel
      if (!audioUri && content.url && (content.url.startsWith('data:') || content.url.startsWith('blob:'))) {
        audioUri = content.url;           //......URI local
      }

      if (!audioUri) {
        setTranscriptions(prev => ({
          ...prev,
          [msgId]: { text: 'Erro: não foi possível obter o áudio.', isLoading: false },
        }));
        return;
      }

      // Passo 2: Enviar para API de transcricao
      const response = await aiService.transcribeAudio(audioUri, 'audio.ogg');
      const text = response.text || '';   //......Texto transcrito

      setTranscriptions(prev => ({
        ...prev,
        [msgId]: { text, isLoading: false },
      }));
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setTranscriptions(prev => ({
        ...prev,
        [msgId]: { text: `Erro ao transcrever: ${errMsg}`, isLoading: false },
      }));
    }
  }, [selectedMessage, instanceName]);

  // ========================================
  // Handler de Cancelar Reply
  // ========================================
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, [setReplyTo]);

  // ========================================
  // Handler de Envio da Lola
  // ========================================
  const handleLolaSendMessage = useCallback((text: string) => {
    // TODO: Implementar envio de mensagem na conversa com Lola
    console.log('Mensagem para Lola:', text);
  }, []);

  // ========================================
  // Render
  // ========================================
  return (
    <LolaAvatarProvider>
      <View style={styles.container}>
        {/* Imagem de Fundo (diferente por tema) */}
        {/* Tema 1: chat-background02.png | Tema 2/3: chat-background.png */}
        {Platform.OS === 'web' ? (
          <img
            src={chatBackgroundBase64}
            alt="background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <Image
            source={chatBackgroundImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )}

        {/* ========================================
            Camada de Opacidade (dinamica por tema)
            ========================================
            Tema 1 (Azul): Branco com 30% opacidade
            Tema 2/3 (WhatsApp): Bege com 92-100% opacidade
            ======================================== */}
        {Platform.OS === 'web' ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: colors.overlayColor,
              opacity: colors.overlayOpacity,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <View style={[
            styles.whiteOverlay,
            {
              backgroundColor: colors.overlayColor,
              opacity: colors.overlayOpacity,
            },
          ]} />
        )}

        {/* Header Fixo Compartilhado */}
        <View style={styles.headerWrapper}>
          <ChatHeader
            chatInfo={chatInfo}
            activeScreen={activeScreen}
            onBackPress={handleBack}
            onProfilePress={handleProfile}
            onMenuPress={handleMenu}
          />
        </View>

        {/* Area de Swipe (Apenas Conteudo) */}
        <View
          style={styles.swipeWrapper}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            console.log('[SwipeContainer] swipeWrapper layout:', { width, height });
          }}
        >
          <Animated.View
            style={[
              styles.swipeContainer,
              {
                transform: [{ translateX }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Conteudo Lead (Mensagens) */}
            <View
              style={styles.screen}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                console.log('[SwipeContainer] screen Lead layout:', { width, height });
              }}
            >
              <LeadMessagesContent
                messages={messages}
                onMessageLongPress={handleMessageLongPress}
                onImagePress={handleImagePress}
                onVideoPress={handleVideoPress}
                onAudioRetry={retryAudioMessage}
                onForwardPress={handleLinkForwardPress}
                onSwipeReply={handleSwipeReply}
                onMediaGroupPress={handleMediaGroupPress}
                onMediaGroupLongPress={handleMediaGroupLongPress}
                timestampStyle={timestampStyle}
                instanceName={instanceName}
                transcriptions={transcriptions}
              />
            </View>

            {/* Conteudo Lola (Conversa IA) */}
            <View style={styles.screen}>
              <LolaConversationContent
                leadId={leadId}
                leadName={leadName}
                leadPhone={leadPhone}
                onSendMessage={handleLolaSendMessage}
              />
            </View>
          </Animated.View>
        </View>

        {/* Input Fixo Compartilhado */}
        <View style={styles.inputWrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardAvoiding}
          >
            {isRecording ? (
              <RecordingBar
                duration={recordingDuration}
                onCancel={handleRecordingCancel}
                onSend={handleRecordingSend}
              />
            ) : (
              <InputBar
                ref={inputBarRef}
                onSendMessage={activeScreen === 'lead' ? handleSendMessage : handleLolaSendMessage}
                onVoiceStart={handleVoiceStart}
                onVoiceEnd={handleVoiceEnd}
                onEmojiPress={handleEmojiPress}
                onAttachPress={handleAttachPress}
                replyingTo={replyingTo}
                onCancelReply={handleCancelReply}
                onSendAudio={handleSendAudio}
              />
            )}

            <AttachmentMenu
              visible={showAttachMenu}
              onClose={() => setShowAttachMenu(false)}
              onSelectCamera={handleSelectCamera}
              onSelectGallery={handleSelectGallery}
              onSelectDocument={handleSelectDocument}
              onSelectContact={handleSelectContact}
              onSelectLocation={handleSelectLocation}
              onSelectEmoji={handleEmojiPress}
            />
          </KeyboardAvoidingView>

          {/* Emoji Picker como painel abaixo do input */}
          <EmojiPicker
            visible={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onSelect={handleEmojiSelect}
          />
        </View>

        {/* Overlay para fechar AttachmentMenu */}
        {showAttachMenu && (
          <Pressable
            style={styles.attachMenuOverlay}
            onPress={handleCloseAttachMenu}
          />
        )}

        {/* Overlay para fechar EmojiPicker */}
        {showEmojiPicker && (
          <Pressable
            style={styles.emojiPickerOverlay}
            onPress={() => setShowEmojiPicker(false)}
          />
        )}

        {/* Avatar Flutuante da Lola */}
        <LolaFloatingAvatar />

        {/* Modais */}
        <MediaGalleryModal
          visible={showMediaGallery}
          group={mediaGalleryGroup}
          instanceName={instanceName}
          onClose={() => {
            setShowMediaGallery(false);
            setMediaGalleryGroup(null);
          }}
          onImagePress={handleImagePress}
          onVideoPress={handleVideoPress}
          onDeleteMessages={handleGalleryDeleteMessages}
          onShareSelected={handleGalleryShareSelected}
        />

        <ImageViewer
          visible={showImageViewer}
          imageUrl={viewerImage}
          instanceName={instanceName}
          remoteJid={leadPhone}
          messageKey={selectedMessage?.messageKey}
          currentReaction={selectedMessage?.reaction || null}
          leadName={leadName}
          leadPhone={leadPhone}
          leadPushName={leadPushNameFromMessages}
          isOutgoing={selectedMessage?.direction === 'outgoing'}
          onClose={() => {
            setShowImageViewer(false);
            setSelectedMessage(null);
            // Volta para galeria se veio dela
            if (returnToGalleryRef.current) {
              returnToGalleryRef.current = false;
              setShowMediaGallery(true);
            }
          }}
          onDownload={handleImageDownload}
          onShare={handleImageShare}
          onReply={handleImageViewerSendReply}
          onDelete={handleImageDelete}
          onReaction={handleImageReaction}
        />

        <VideoViewer
          visible={showVideoViewer}
          videoUrl={viewerVideo}
          instanceName={instanceName}
          messageKey={selectedMessage?.messageKey}
          currentReaction={selectedMessage?.reaction || null}
          leadName={leadName}
          leadPhone={leadPhone}
          leadPushName={leadPushNameFromMessages}
          thumbnailUrl={selectedMessage?.type === 'video' ? (selectedMessage?.content as any)?.thumbnail : undefined}
          isOutgoing={selectedMessage?.direction === 'outgoing'}
          onClose={() => {
            setShowVideoViewer(false);
            setSelectedMessage(null);
            // Volta para galeria se veio dela
            if (returnToGalleryRef.current) {
              returnToGalleryRef.current = false;
              setShowMediaGallery(true);
            }
          }}
          onDownload={handleVideoDownload}
          onShare={handleVideoShare}
          onReply={handleVideoReply}
          onDelete={handleVideoDelete}
          onReaction={handleVideoReaction}
        />

        <MessageOptions
          visible={showMessageOptions}
          message={selectedMessage}
          instanceName={instanceName}
          onClose={() => {
            setShowMessageOptions(false);
            setSelectedMessage(null);
            setMediaGroupForOptions(null);
          }}
          onReply={handleReply}
          onCopy={handleCopy}
          onForward={handleForward}
          onDelete={handleDelete}
          onReaction={handleMessageReaction}
          currentReaction={selectedMessage?.reaction || null}
          onTranscribe={handleTranscribe}
          isMediaGroup={!!mediaGroupForOptions}
          mediaGroupData={mediaGroupForOptions}
        />

        <ShareModal
          visible={showShareModal}
          imageUrl={viewerImage}
          instanceName={instanceName}
          onClose={() => { setShowShareModal(false); setShareUrl(''); }}
          onForward={handleShareForward}
        />

        {/* Modais Camera Web */}
        <WebCameraModal
          visible={showWebCamera}           //......Visibilidade
          onClose={handleWebCameraClose}    //......Handler fechar
          onCapture={handleWebCameraCapture}  //......Handler captura
        />

        <PhotoEditorScreen
          visible={showWebPhotoPreview}     //......Visibilidade
          photoUri={capturedPhoto?.uri || ''}  //......URI da foto
          photoWidth={capturedPhoto?.width || 0}  //......Largura
          photoHeight={capturedPhoto?.height || 0}  //......Altura
          initialMediaType={capturedPhoto?.type}  //......Tipo de midia (photo/video)
          initialDuration={capturedPhoto?.duration}  //......Duracao do video (ms)
          initialThumbnail={capturedPhoto?.thumbnail}  //......Thumbnail do video
          initialFileSize={capturedPhoto?.fileSize}  //......Tamanho do video
          leadName={leadName}               //......Nome do lead
          onClose={handleWebPhotoPreviewClose}  //......Handler fechar
          onSend={handleWebPhotoSend}       //......Handler enviar
          onOpenCamera={handleOpenCameraFromEditor}  //......Handler camera
        />
      </View>
    </LolaAvatarProvider>
  );
};

// ========================================
// Componente Principal com Provider
// ========================================
const LeadLolaSwipeContainer: React.FC = () => {
  // ========================================
  // Rota
  // ========================================
  const route = useRoute<RouteProp<LeadChatRouteParams, 'LeadChatScreen'>>();
  const { leadId, leadName, leadPhone, leadPhoto, pendingPhoto } = route.params;

  // ========================================
  // Render - ThemeProvider envolve tudo
  // ========================================
  return (
    <ThemeProvider>
      <LeadLolaProvider>
        <SwipeContent
          leadId={leadId}
          leadName={leadName}
          leadPhone={leadPhone}
          leadPhoto={leadPhoto}
          pendingPhoto={pendingPhoto}
        />
      </LeadLolaProvider>
    </ThemeProvider>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                              //......Ocupa tudo
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    backgroundColor: ChatColors.chatBackground,
    ...(Platform.OS === 'web' ? {
      height: '100%',                     //......Altura 100% na web
      maxHeight: '100%',                  //......Limita altura maxima na web
      display: 'flex' as any,             //......Display flex na web
      flexDirection: 'column' as any,     //......Direcao coluna na web
    } : {}),
  },

  // Imagem de fundo
  backgroundImage: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    width: '100%',                        //......Largura total
    height: '100%',                       //......Altura total
    zIndex: 0,                            //......Atras de tudo
  },

  // Camada de opacidade branca sobre o fundo
  // ========================================
  // AJUSTE MANUAL: Altere 'opacity' para clarear/escurecer
  // opacity: 0.1 = Quase transparente
  // opacity: 0.3 = Recomendado (30% branco)
  // opacity: 0.5 = Mais claro
  // opacity: 0.7 = Bem claro
  // ========================================
  whiteOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: '#FFFFFF',           //......Cor branca
    opacity: 0.5,                         //......AJUSTE: 30% de opacidade
    zIndex: 1,                            //......Acima do background
    pointerEvents: 'none',                //......Nao captura toques
  },

  // Wrapper do header
  headerWrapper: {
    flexShrink: 0,                        //......Nao encolhe
    flexGrow: 0,                          //......Nao cresce
    zIndex: 10,                           //......Acima de tudo
  },

  // Wrapper da area de swipe
  swipeWrapper: {
    flex: 1,                              //......Ocupa espaco restante
    overflow: 'hidden',                   //......Esconde overflow
    zIndex: 1,                            //......Abaixo do header
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    ...(Platform.OS === 'web' ? {
      height: '100%',                     //......Altura 100% na web
      maxHeight: '100%',                  //......Limita altura maxima na web
      position: 'relative' as any,        //......Posicao relativa na web
    } : {}),
  },

  // Container do swipe
  swipeContainer: {
    flex: 1,                              //......Ocupa altura do wrapper
    flexDirection: 'row',                 //......Layout horizontal
    width: SCREEN_WIDTH * 2,              //......Largura = 2 telas
    ...(Platform.OS === 'web' ? {
      height: '100%',                     //......Altura 100% na web
      maxHeight: '100%',                  //......Limita altura maxima na web
    } : {}),
  },

  // Tela individual
  screen: {
    width: SCREEN_WIDTH,                  //......Largura da tela
    maxWidth: SCREEN_WIDTH,               //......FIX: Limita largura maxima
    flex: 1,                              //......Ocupa altura disponivel
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    overflow: 'hidden',                   //......Esconde overflow
    ...(Platform.OS === 'web' ? {
      position: 'relative' as any,        //......Posicao relativa na web
      height: '100%',                     //......Altura 100% na web
      maxHeight: '100%',                  //......Limita altura maxima na web
    } : {}),
  },

  // Wrapper do input
  inputWrapper: {
    flexShrink: 0,                        //......Nao encolhe
    flexGrow: 0,                          //......Nao cresce
    backgroundColor: ChatColors.inputBackground,
    zIndex: 20,                           //......Acima de tudo
  },

  // KeyboardAvoidingView
  keyboardAvoiding: {
    width: '100%',                        //......Largura total
  },

  // Overlay para AttachmentMenu
  attachMenuOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'transparent',       //......Fundo transparente
    zIndex: 15,                           //......Acima do conteudo
  },

  // Overlay para EmojiPicker
  emojiPickerOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'transparent',       //......Fundo transparente
    zIndex: 10,                           //......Abaixo do picker
  },
});

// ========================================
// Export
// ========================================
export default LeadLolaSwipeContainer;
