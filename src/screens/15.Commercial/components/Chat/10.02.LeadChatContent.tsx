// ========================================
// Conteudo do Chat Lead
// Versao do chat que recebe props
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useEffect,                              //......Hook de efeito
  useRef,                                 //......Hook de ref
} from 'react';
import {
  View,                                   //......Container basico
  StyleSheet,                             //......Estilos
  KeyboardAvoidingView,                   //......Evitar teclado
  Platform,                               //......Plataforma
  Clipboard,                              //......Area de transferencia
  LayoutChangeEvent,                      //......Evento de layout
  Dimensions,                             //......Dimensoes da tela
  Image,                                  //......Imagem
  Pressable,                              //......Pressionavel
  Alert,                                  //......Alertas nativos
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from './styles/08.ChatColors';
import { useTheme } from './styles/themes/ThemeContext';

// ========================================
// Imports de Tipos
// ========================================
import {
  ChatInfo,                               //......Info do chat
  WhatsAppMessage,                        //......Interface mensagem
  TextContent,                            //......Conteudo texto
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
  DocumentContent,                        //......Conteudo documento
  AudioContent,                           //......Conteudo audio
  ReplyInfo,                              //......Info reply
  MediaGroupData,                         //......Dados grupo de midias
  MediaGroupItem,                        //......Item de grupo de midias
} from './types/08.types.whatsapp';

// ========================================
// Imports de Utilitarios
// ========================================
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ========================================
// Imports de Componentes
// ========================================
import ChatHeader from './components/Header/08.01.ChatHeader';
import MessageList from './components/Messages/08.02.MessageList';
import InputBar, { InputBarRef } from './components/Input/08.10.InputBar';
import RecordingBar from './components/Input/08.14.RecordingBar';
import EmojiPicker from './components/Modals/08.15.EmojiPicker';
import AttachmentMenu from './components/Modals/08.16.AttachmentMenu';
import ImageViewer from './components/Modals/08.17.ImageViewer';
import MessageOptions from './components/Modals/08.18.MessageOptions';
import ShareModal from './components/Modals/08.19.ShareModal';
import VideoViewer from './components/Modals/08.18.VideoViewer';
import MediaGalleryModal from './components/Modals/08.21.MediaGalleryModal';
import TranscriptionModal from './components/Modals/08.20.TranscriptionModal';

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
// Imports de Assets
// ========================================
import chatBackgroundImage from './assets/chat-background.png';
import { chatBackgroundBase64 } from './assets/chatBackgroundBase64';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================================
// Interface de Props
// ========================================
interface LeadChatContentProps {
  leadId: string;                         //......ID do lead
  leadName: string;                       //......Nome do lead
  leadPhone: string;                      //......Telefone do lead
  leadPhoto?: string;                     //......Foto do lead
}

// ========================================
// Componente Principal
// ========================================
const LeadChatContent: React.FC<LeadChatContentProps> = ({
  leadId,
  leadName,
  leadPhone,
  leadPhoto,
}) => {
  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Navegacao
  // ========================================
  const navigation = useNavigation();

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
  // Estados dos Modais
  // ========================================
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showVideoViewer, setShowVideoViewer] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [pressY, setPressY] = useState(0);   //......Posicao Y do long press
  const lastPointerYRef = useRef(0);         //......Ultima posicao Y do ponteiro (global)
  const [viewerImage, setViewerImage] = useState<string>('');
  const [viewerVideo, setViewerVideo] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>(''); //......URL para compartilhar
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const returnToGalleryRef = useRef(false);
  const [mediaGalleryGroup, setMediaGalleryGroup] = useState<MediaGroupData | null>(null);
  const [mediaGroupForOptions, setMediaGroupForOptions] = useState<MediaGroupData | null>(null);

  // Estados de Transcricao de Audio (modal legado)
  const [showTranscription, setShowTranscription] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Mapa de transcricoes inline (por messageId)
  const [transcriptions, setTranscriptions] = useState<Record<string, { text: string; isLoading: boolean }>>({});

  // ========================================
  // Captura global da posicao Y do ponteiro (web)
  // Usa pointerdown + mousedown + touchstart para maxima compatibilidade
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web') return;        //......So web
    const handler = (e: any) => {             //......Handler global
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      lastPointerYRef.current = y;            //......Armazena Y
    };
    window.addEventListener('pointerdown', handler, true);  //......Pointer events
    window.addEventListener('mousedown', handler, true);    //......Mouse fallback
    window.addEventListener('touchstart', handler, true);   //......Touch fallback
    return () => {
      window.removeEventListener('pointerdown', handler, true);
      window.removeEventListener('mousedown', handler, true);
      window.removeEventListener('touchstart', handler, true);
    };
  }, []);

  // ========================================
  // Sincronizar mediaGalleryGroup com mensagens atualizadas
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
  // Handler de Perfil
  // ========================================
  const handleProfile = useCallback(() => {
    console.log('Abrir perfil do lead');
  }, []);

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

  // Handler da Camera
  // Navega para a tela de camera customizada
  const handleSelectCamera = useCallback(() => {
    console.log('📷 [LeadChatContent] handleSelectCamera chamado');
    console.log('📷 [LeadChatContent] leadId:', leadId);
    console.log('📷 [LeadChatContent] leadName:', leadName);
    console.log('📷 [LeadChatContent] leadPhone:', leadPhone);

    // Fechar menu de anexos
    console.log('📷 [LeadChatContent] Fechando menu de anexos...');
    setShowAttachMenu(false);

    // Navegar para a tela de camera
    console.log('📷 [LeadChatContent] Navegando para CameraScreen...');
    try {
      navigation.navigate('CameraScreen' as any, {
        leadId,                               //......ID do lead
        leadName,                             //......Nome do lead
        leadPhone,                            //......Telefone do lead
      });
      console.log('📷 [LeadChatContent] navigation.navigate executado com sucesso');
    } catch (error) {
      console.log('📷 [LeadChatContent] ERRO na navegação:', error);
    }
  }, [navigation, leadId, leadName, leadPhone]);

  // Handler do Video Note
  // Navega para a tela de gravacao de video note circular
  const handleSelectVideoNote = useCallback(() => {
    // Fechar menu de anexos
    setShowAttachMenu(false);

    // Navegar para a tela de video note
    navigation.navigate('VideoNoteRecordScreen' as any, {
      leadId,                               //......ID do lead
      leadName,                             //......Nome do lead
      leadPhone,                            //......Telefone do lead
    });
  }, [navigation, leadId, leadName, leadPhone]);

  // Handler da Galeria
  // Navega para a tela de selecao multipla de galeria
  const handleSelectGallery = useCallback(() => {
    // Fechar menu de anexos
    setShowAttachMenu(false);

    // Navegar para a tela de selecao de galeria
    navigation.navigate('GallerySelectScreen' as any, {
      leadId,                               //......ID do lead
      leadName,                             //......Nome do lead
      leadPhone,                            //......Telefone do lead
      mediaType: 'all',                     //......Todos os tipos de midia
    });
  }, [navigation, leadId, leadName, leadPhone]);

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
  const handleMessageLongPress = useCallback((message: WhatsAppMessage, _pageY: number) => {
    setSelectedMessage(message);
    const y = Platform.OS === 'web' ? lastPointerYRef.current : _pageY;
    setPressY(y);                          //......Salva posicao Y (do ref global no web)
    setShowMessageOptions(true);
  }, []);

  // ========================================
  // Handler de Abrir Imagem no Viewer
  // ========================================
  const handleImagePress = useCallback((imageUrl: string, message?: WhatsAppMessage) => {
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
    setPressY(Platform.OS === 'web' ? lastPointerYRef.current : 0);
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
    console.log('[LeadChatContent] handleVideoPress chamado, videoUrl:', videoUrl);
    console.log('[LeadChatContent] message:', message?.id);
    setViewerVideo(videoUrl);
    setSelectedMessage(message || null);
    // Fecha galeria antes de abrir viewer (evita modal atras)
    if (showMediaGallery) {
      setShowMediaGallery(false);
      returnToGalleryRef.current = true;
    }
    setShowVideoViewer(true);
    console.log('[LeadChatContent] showVideoViewer setado para true');
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
  // ========================================
  const handleImageViewerSendReply = useCallback(async (text: string) => {
    if (!text.trim() || !instanceName || !leadPhone) return;

    try {
      let phoneNumber = leadPhone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55') && phoneNumber.length <= 11) {
        phoneNumber = '55' + phoneNumber;
      }
      await evolutionService.sendText(instanceName, phoneNumber, text.trim());
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      throw error;
    }
  }, [instanceName, leadPhone]);

  // ========================================
  // Handler de Enviar Resposta do VideoViewer
  // ========================================
  const handleVideoViewerSendReply = useCallback(async (text?: string) => {
    if (!text?.trim() || !instanceName || !leadPhone) return;

    try {
      let phoneNumber = leadPhone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55') && phoneNumber.length <= 11) {
        phoneNumber = '55' + phoneNumber;
      }
      await evolutionService.sendText(instanceName, phoneNumber, text.trim());
      // Fecha o viewer apos enviar
      setShowVideoViewer(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Erro ao enviar resposta do video:', error);
    }
  }, [instanceName, leadPhone]);

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
    console.log('Compartilhar video');
  }, []);

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
    if (!selectedMessage) return;
    if (selectedMessage.type === 'text') {
      const content = selectedMessage.content as TextContent;
      Clipboard.setString(content.text);       //......Copia texto para clipboard
    }
    // Imagem/video: opcao exibida mas copia nao implementada ainda
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
      setShowMessageOptions(false);       //......Fecha menu mesmo assim
      setSelectedMessage(null);           //......Limpa selecao
      return;
    }

    // Captura dados sincronicamente antes de qualquer await
    const msgId = selectedMessage.id || `temp_${Date.now()}`;
    const content = selectedMessage.content as AudioContent;
    const msgKey = selectedMessage.messageKey;
    const instName = instanceName;        //......Captura instancia local

    // Fecha menu e limpa selecao
    setShowMessageOptions(false);
    setSelectedMessage(null);             //......Limpa selecao apos capturar dados

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
            let b64 = media.base64;        //......Base64 bruto
            if (b64.startsWith('data:')) {
              const ci = b64.indexOf(','); //......Indice virgula
              if (ci !== -1) b64 = b64.substring(ci + 1);
            }
            audioUri = `data:${mimeType};base64,${b64}`;
          }
        } catch {}
      }

      // Prioridade 2: Data URI ou Blob URL ja disponivel
      if (!audioUri && content.url && (content.url.startsWith('data:') || content.url.startsWith('blob:'))) {
        audioUri = content.url;            //......URI local
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
      const text = response.text || '';    //......Texto transcrito

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

  // Handler fechar transcricao
  const closeTranscription = useCallback(() => {
    setShowTranscription(false);
    setTranscriptionText('');
    setTranscriptionError(null);
    setIsTranscribing(false);
  }, []);

  // Handler enviar texto transcrito
  const sendTranscriptionText = useCallback((text: string) => {
    if (!text.trim()) return;
    closeTranscription();
    sendTextMessage(text.trim());
  }, [closeTranscription, sendTextMessage]);

  // ========================================
  // Handler de Cancelar Reply
  // ========================================
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, [setReplyTo]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.screenContainer}>
      {/* Imagem de Fundo */}
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
          Tema 1 (Azul): Branco 30%
          Tema 2 (WhatsApp): Bege 92%
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
          ref={(el) => {
            if (el) {
              console.warn('[OVERLAY DIV] Renderizado!');
              console.warn('[OVERLAY DIV] backgroundColor:', colors.overlayColor);
              console.warn('[OVERLAY DIV] opacity:', colors.overlayOpacity);
            }
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

      {/* Header */}
      <View style={styles.headerWrapper}>
        <ChatHeader
          chatInfo={chatInfo}
          onBackPress={handleBack}
          onProfilePress={handleProfile}
          onMenuPress={handleMenu}
        />
      </View>

      {/* Area de Mensagens */}
      <View style={styles.messagesWrapper}>
        <View style={styles.messagesContent}>
          <MessageList
            messages={messages}
            onMessageLongPress={handleMessageLongPress}
            onImagePress={handleImagePress}
            onVideoPress={handleVideoPress}
            onAudioRetry={retryAudioMessage}
            onForwardPress={handleLinkForwardPress}
            onSwipeReply={handleSwipeReply}
            onMediaGroupPress={handleMediaGroupPress}
            onMediaGroupLongPress={handleMediaGroupLongPress}
            instanceName={instanceName}
            transcriptions={transcriptions}
          />
        </View>
      </View>

      {/* Input */}
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
              onSendMessage={handleSendMessage}
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
            onSelectVideoNote={handleSelectVideoNote}
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
        onReply={handleImageReply}
        onDelete={handleImageDelete}
        onReaction={handleImageReaction}
        onSendReply={handleImageViewerSendReply}
      />

      <VideoViewer
        visible={showVideoViewer}
        videoUrl={viewerVideo}
        instanceName={instanceName}
        messageKey={selectedMessage?.messageKey}
        senderName={selectedMessage?.senderName}
        timestamp={selectedMessage?.timestamp}
        currentReaction={selectedMessage?.reaction}
        leadName={leadName}
        leadPhone={leadPhone}
        leadPushName={selectedMessage?.senderName}
        thumbnailUrl={selectedMessage?.type === 'video' ? (selectedMessage?.content as any)?.thumbnail : undefined}
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
        onReply={handleVideoViewerSendReply}
        onDelete={handleVideoDelete}
        onReaction={handleVideoReaction}
      />

      <MessageOptions
        visible={showMessageOptions}
        message={selectedMessage}
        instanceName={instanceName}
        pressY={pressY}
        isMediaGroup={!!mediaGroupForOptions}
        onClose={() => {
          setShowMessageOptions(false);
          setSelectedMessage(null);
          setMediaGroupForOptions(null);
        }}
        onReply={handleReply}
        onCopy={handleCopy}
        onForward={handleForward}
        onDelete={() => {
          if (mediaGroupForOptions) {
            const ids = mediaGroupForOptions.items.map(i => i.message.id).filter(Boolean) as string[];
            ids.forEach(id => deleteMessage(id));
          } else {
            handleDelete();
          }
        }}
        onReaction={handleMessageReaction}
        currentReaction={selectedMessage?.reaction || null}
        onTranscribe={handleTranscribe}
      />

      {/* Modal de Transcricao de Audio */}
      <TranscriptionModal
        visible={showTranscription}
        onClose={closeTranscription}
        onSend={sendTranscriptionText}
        onCancel={closeTranscription}
        isLoading={isTranscribing}
        initialText={transcriptionText}
        error={transcriptionError}
      />

      <ShareModal
        visible={showShareModal}
        imageUrl={viewerImage}
        instanceName={instanceName}
        onClose={() => { setShowShareModal(false); setShareUrl(''); }}
        onForward={handleShareForward}
      />
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  screenContainer: {
    flex: 1,                              //......Ocupa todo espaco
    display: 'flex',                      //......Display flex
    flexDirection: 'column',              //......Direcao vertical
    height: '100%',                       //......Altura total
    width: SCREEN_WIDTH,                  //......Largura da tela
    backgroundColor: ChatColors.chatBackground,
  },

  // Wrapper do header
  headerWrapper: {
    flexShrink: 0,                        //......Nao encolhe
    flexGrow: 0,                          //......Nao cresce
    zIndex: 2,                            //......Acima do fundo
  },

  // Wrapper das mensagens
  messagesWrapper: {
    flex: 1,                              //......Ocupa espaco restante
    minHeight: 0,                         //......Permite encolher
    position: 'relative',                 //......Posicao relativa
    zIndex: 1,                            //......Acima do fundo
    backgroundColor: 'transparent',       //......Fundo transparente
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
    opacity: 0.3,                         //......AJUSTE: 30% de opacidade
    zIndex: 1,                            //......Acima do background
    pointerEvents: 'none',                //......Nao captura toques
  },

  // Conteudo das mensagens
  messagesContent: {
    flex: 1,                              //......Ocupa espaco
    backgroundColor: 'transparent',       //......Fundo transparente
  },

  // Wrapper do input
  inputWrapper: {
    flexShrink: 0,                        //......Nao encolhe
    flexGrow: 0,                          //......Nao cresce
    backgroundColor: ChatColors.inputBackground,
    zIndex: 20,                           //......Acima do overlay
  },

  // KeyboardAvoidingView
  keyboardAvoiding: {
    width: '100%',                        //......Largura total
  },

  // Overlay
  attachMenuOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: 'transparent',       //......Fundo transparente
    zIndex: 10,                           //......Acima do conteudo
  },
});

// ========================================
// Export
// ========================================
export default LeadChatContent;
