// ========================================
// Tela LeadChatScreen
// Interface de chat WhatsApp Clone
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useEffect,                              //......Hook de efeito
  useMemo,                                //......Hook de memo
  useRef,                                 //......Hook de ref
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
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
} from 'react-native';                    //......Biblioteca RN
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from './styles/08.ChatColors';

// ========================================
// Imports de Tipos
// ========================================
import {                                  //......Tipos do chat
  ChatInfo,                               //......Info do chat
  WhatsAppMessage,                        //......Interface mensagem
  TextContent,                            //......Conteudo texto
  ImageContent,                           //......Conteudo imagem
  VideoContent,                           //......Conteudo video
  ReplyInfo,                              //......Info reply
  MediaGroupData,                         //......Dados grupo de midias
  MediaGroupItem,                        //......Item de grupo de midias
} from './types/08.types.whatsapp';       //......Arquivo de tipos

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
import InputBar from './components/Input/08.10.InputBar';
import RecordingBar from './components/Input/08.14.RecordingBar';
import EmojiPicker from './components/Modals/08.15.EmojiPicker';
import AttachmentMenu from './components/Modals/08.16.AttachmentMenu';
import ImageViewer from './components/Modals/08.17.ImageViewer';
import MessageOptions from './components/Modals/08.18.MessageOptions';
import ShareModal from './components/Modals/08.19.ShareModal';
import MediaGalleryModal from './components/Modals/08.21.MediaGalleryModal';

// ========================================
// Imports de Camera Web
// ========================================
import WebCameraModal, { WebCapturedMedia } from './camera/WebCameraModal';
import PhotoEditorScreen from './camera/PhotoEditorScreen';

// ========================================
// Imports de Hooks
// ========================================
import { useMessages } from './hooks/08.useMessages';
import { useVoiceRecorder } from './hooks/08.useVoiceRecorder';

// ========================================
// Imports de Servicos
// ========================================
import { evolutionService } from '../../services/evolutionService';

// ========================================
// Imports de Assets
// ========================================
import chatBackgroundImage from './assets/chat-background.png';
import { chatBackgroundBase64 } from './assets/chatBackgroundBase64';

// ========================================
// Tipos de Navegacao
// ========================================
type LeadChatRouteParams = {
  LeadChatScreen: {
    leadId: string;                       //......ID do lead
    leadName: string;                     //......Nome do lead
    leadPhone: string;                    //......Telefone do lead
    leadPhoto?: string;                   //......Foto do lead
  };
};

// ========================================
// Componente Principal LeadChatScreen
// ========================================
const LeadChatScreen: React.FC = () => {
  // ========================================
  // Navegacao e Rota
  // ========================================
  const navigation = useNavigation();     //......Navegacao
  const route = useRoute<RouteProp<LeadChatRouteParams, 'LeadChatScreen'>>();
  const { leadId, leadName, leadPhone, leadPhoto } = route.params || {
    leadId: 'lead-1',                     //......Default
    leadName: 'Lead',                     //......Default
    leadPhone: '',                        //......Default
  };

  // ========================================
  // Hook de Mensagens
  // ========================================
  const {
    messages,                             //......Lista mensagens
    replyingTo,                           //......Reply info
    isSending,                            //......Estado de envio
    instanceName,                         //......Nome da instancia
    sendTextMessage,                      //......Envia texto
    sendAudioMessage,                     //......Envia audio
    sendImageMessage,                     //......Envia imagem
    setReplyTo,                           //......Define reply
    deleteMessage,                        //......Deleta mensagem
    updateMessageReaction,                //......Atualiza reacao
    retryAudioMessage,                    //......Retry audio
  } = useMessages({ leadId, leadPhone, leadName });

  // ========================================
  // Hook de Gravacao
  // ========================================
  const {
    isRecording,                          //......Se esta gravando
    recordingDuration,                    //......Duracao gravacao
    recordingUri,                         //......URI do audio
    startRecording,                       //......Inicia gravacao
    stopRecording,                        //......Para gravacao
    cancelRecording,                      //......Cancela gravacao
  } = useVoiceRecorder();

  // ========================================
  // Estados dos Modais
  // ========================================
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [viewerImage, setViewerImage] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaGalleryGroup, setMediaGalleryGroup] = useState<MediaGroupData | null>(null);
  const returnToGalleryRef = useRef(false);

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
  // Estados da Camera Web
  // ========================================
  const [showWebCamera, setShowWebCamera] = useState(false);
  const [showWebPhotoPreview, setShowWebPhotoPreview] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<WebCapturedMedia | null>(null);

  // ========================================
  // Info do Chat
  // ========================================
  const [chatInfo] = useState<ChatInfo>({
    leadId,                               //......ID do lead
    leadName,                             //......Nome do lead
    leadPhone,                            //......Telefone
    leadPhoto,                            //......Foto
    isOnline: false,                      //......Status offline inicial
    lastSeen: new Date(),                 //......Ultima vez visto
    isTyping: false,                      //......Nao esta digitando
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
  // Handler de Voltar
  // ========================================
  const handleBack = useCallback(() => {
    navigation.goBack();                  //......Volta
  }, [navigation]);

  // ========================================
  // Handler de Perfil
  // ========================================
  const handleProfile = useCallback(() => {
    // TODO: Navegar para perfil do lead
    console.log('Abrir perfil do lead');
  }, []);

  // ========================================
  // Handler de Menu
  // ========================================
  const handleMenu = useCallback(() => {
    // TODO: Abrir menu do chat
    console.log('Abrir menu do chat');
  }, []);

  // ========================================
  // Handler de Enviar Mensagem
  // ========================================
  const handleSendMessage = useCallback((text: string) => {
    sendTextMessage(text);                //......Envia texto
  }, [sendTextMessage]);

  // ========================================
  // Handler de Enviar Audio (do InputBar)
  // ========================================
  const handleSendAudio = useCallback((durationSec: number, uri?: string | null) => {
    console.log('[LeadChatScreen] handleSendAudio chamado:', { durationSec, uri });

    // Valida se tem URI do audio
    if (!uri) {
      console.warn('[LeadChatScreen] URI do audio esta vazio');
      return;
    }

    // Chama sendAudioMessage do hook
    sendAudioMessage(uri, durationSec);   //......Envia audio
  }, [sendAudioMessage]);

  // ========================================
  // Handlers de Voz
  // ========================================
  const handleVoiceStart = useCallback(() => {
    startRecording();                     //......Inicia gravacao
  }, [startRecording]);

  const handleVoiceEnd = useCallback(() => {
    // Nao faz nada - gravacao continua
    // Usuario deve usar os botoes da RecordingBar
  }, []);

  const handleRecordingCancel = useCallback(() => {
    cancelRecording();                    //......Cancela gravacao
  }, [cancelRecording]);

  const handleRecordingSend = useCallback(() => {
    stopRecording();                      //......Para e envia
  }, [stopRecording]);

  // ========================================
  // Handler de Emoji
  // ========================================
  const handleEmojiPress = useCallback(() => {
    setShowEmojiPicker(true);             //......Abre picker
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    // TODO: Inserir emoji no input
    console.log('Emoji selecionado:', emoji);
  }, []);

  // ========================================
  // Handler de Anexo
  // ========================================
  const handleAttachPress = useCallback(() => {
    setShowAttachMenu((prev) => !prev);   //......Toggle menu
  }, []);

  const handleCloseAttachMenu = useCallback(() => {
    setShowAttachMenu(false);             //......Fecha menu
  }, []);

  const handleSelectCamera = useCallback(async () => {
    console.log('📷 [LeadChatScreen] handleSelectCamera iniciado');
    console.log('📷 [LeadChatScreen] Plataforma detectada:', Platform.OS);

    // Fecha o menu de anexos
    setShowAttachMenu(false);
    console.log('📷 [LeadChatScreen] Menu de anexos fechado');

    // Detecta plataforma
    if (Platform.OS === 'web') {
      // WEB: Abre modal com webcam
      console.log('📷 [LeadChatScreen] Abrindo WebCameraModal...');
      setShowWebCamera(true);
      return;
    }

    // MOBILE: Usa expo-image-picker
    console.log('📷 [LeadChatScreen] Solicitando permissao da camera...');
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    console.log('📷 [LeadChatScreen] Permissao camera:', permissionResult.granted);

    if (!permissionResult.granted) {
      console.warn('📷 [LeadChatScreen] Permissao da camera NEGADA');
      Alert.alert(
        'Permissao Necessaria',
        'Precisamos de acesso a camera para tirar fotos.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Abre a camera nativa
    console.log('📷 [LeadChatScreen] Abrindo camera nativa...');
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],             //......Apenas imagens
        allowsEditing: false,               //......Sem edicao
        quality: 0.8,                       //......Qualidade 80%
      });

      console.log('📷 [LeadChatScreen] Resultado camera:', result);

      // Verifica se usuario capturou imagem
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('📷 [LeadChatScreen] Foto capturada, abrindo preview...');

        // Abre preview em vez de enviar direto
        setCapturedPhoto({
          uri: asset.uri,
          width: asset.width || 0,
          height: asset.height || 0,
        });
        setShowWebPhotoPreview(true);
      } else {
        console.log('📷 [LeadChatScreen] Captura cancelada pelo usuario');
      }
    } catch (error) {
      console.error('📷 [LeadChatScreen] ERRO ao abrir camera:', error);
      Alert.alert('Erro', 'Nao foi possivel abrir a camera. Tente novamente.');
    }
  }, []);

  // ========================================
  // Handler: Foto Capturada pela Webcam
  // ========================================
  const handleWebCameraCapture = useCallback((media: WebCapturedMedia) => {
    console.log('🔴 [EDITOR_DEBUG] handleWebCameraCapture chamado - midia:', media);
    console.log('🔴 [EDITOR_DEBUG] Abrindo PhotoEditorScreen...');

    // Fecha camera e abre preview
    setShowWebCamera(false);
    setCapturedPhoto(media);
    setShowWebPhotoPreview(true);
  }, []);

  // ========================================
  // Handler: Fechar Camera Web
  // ========================================
  const handleWebCameraClose = useCallback(() => {
    console.log('📷 [LeadChatScreen] Fechando webcam...');
    setShowWebCamera(false);
  }, []);

  // ========================================
  // Handler: Enviar Midias do Editor
  // Recebe array de midias processadas (fotos com dimensoes corretas + videos)
  // ========================================
  const handleWebPhotoSend = useCallback(async (items: { uri: string; type: 'photo' | 'video'; width: number; height: number; caption?: string; viewOnce?: boolean }[]) => {
    console.log('📷 [LeadChatScreen] ========================================');
    console.log('📷 [LeadChatScreen] handleWebPhotoSend - itens:', items.length);
    console.log('📷 [LeadChatScreen] ========================================');

    // Fechar modal imediatamente para feedback rapido
    setShowWebPhotoPreview(false);
    setCapturedPhoto(null);

    // Enviar cada item sequencialmente (evita sobrecarga de API)
    for (const item of items) {
      console.log('📷 [LeadChatScreen] Enviando:', item.type, item.width, 'x', item.height);
      console.log('🔒 [VIEW_ONCE] LeadChatScreen item.viewOnce:', item.viewOnce, '(tipo:', typeof item.viewOnce, ')');
      await sendImageMessage(item.uri, item.width, item.height, item.caption, item.viewOnce);
    }

    console.log('📷 [LeadChatScreen] ========================================');
    console.log('📷 [LeadChatScreen] FIM: handleWebPhotoSend');
    console.log('📷 [LeadChatScreen] ========================================');
  }, [sendImageMessage]);

  // ========================================
  // Handler: Fechar Preview
  // ========================================
  const handleWebPhotoPreviewClose = useCallback(() => {
    console.log('📷 [LeadChatScreen] Fechando preview, voltando para camera...');
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
    console.log('📷 [LeadChatScreen] Abrindo camera do editor para mais fotos...');
    // Por enquanto, fecha o editor e abre a camera
    // TODO: No futuro, implementar carrossel de multiplas midias
    setShowWebPhotoPreview(false);
    setCapturedPhoto(null);
    if (Platform.OS === 'web') {
      setShowWebCamera(true);
    }
  }, []);

  const handleSelectGallery = useCallback(async () => {
    console.log('[LeadChatScreen] Abrindo galeria de fotos...');

    // Solicita permissao para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      console.warn('[LeadChatScreen] Permissao negada para acessar galeria');
      return;
    }

    // Abre a galeria de fotos
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],             //......Apenas imagens
      allowsEditing: false,               //......Sem edicao
      quality: 0.8,                        //......Qualidade 80%
      allowsMultipleSelection: false,     //......Uma imagem por vez
    });

    console.log('[LeadChatScreen] Resultado ImagePicker:', result);

    // Verifica se usuario selecionou imagem
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      console.log('[LeadChatScreen] Imagem selecionada:', {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });

      // Envia imagem via sendImageMessage
      sendImageMessage(asset.uri, asset.width || 0, asset.height || 0);
    }
  }, [sendImageMessage]);

  const handleSelectDocument = useCallback(() => {
    // TODO: Abrir documentos
    console.log('Abrir documentos');
  }, []);

  const handleSelectContact = useCallback(() => {
    // TODO: Selecionar contato
    console.log('Selecionar contato');
  }, []);

  const handleSelectLocation = useCallback(() => {
    // TODO: Selecionar localizacao
    console.log('Selecionar localizacao');
  }, []);

  // ========================================
  // Handler de Long Press na Mensagem
  // ========================================
  const handleMessageLongPress = useCallback((message: WhatsAppMessage) => {
    setSelectedMessage(message);          //......Seleciona mensagem
    setShowMessageOptions(true);          //......Abre opcoes
  }, []);

  // ========================================
  // Handler de Abrir Imagem no Viewer
  // ========================================
  const handleImagePress = useCallback((imageUrl: string, message?: WhatsAppMessage) => {
    console.log('[LeadChatScreen] Abrindo imagem no viewer:', imageUrl);
    setViewerImage(imageUrl);             //......Define imagem
    setSelectedMessage(message || null);  //......Salva mensagem para acoes
    // Fecha galeria antes de abrir viewer (evita modal atras)
    if (showMediaGallery) {
      setShowMediaGallery(false);
      returnToGalleryRef.current = true;
    }
    setShowImageViewer(true);             //......Abre viewer
  }, [showMediaGallery]);

  // ========================================
  // Handler de Abrir Galeria de Grupo de Midias
  // ========================================
  const handleMediaGroupPress = useCallback((group: MediaGroupData) => {
    setMediaGalleryGroup(group);          //......Define grupo
    setShowMediaGallery(true);            //......Abre galeria
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
  // Handler de Download Imagem
  // ========================================
  const handleImageDownload = useCallback(async () => {
    if (!viewerImage) return;

    console.log('[LeadChatScreen] Iniciando download da imagem:', viewerImage);

    try {
      if (Platform.OS === 'web') {
        // Download para Web
        // Gera nome unico para o arquivo
        const timestamp = Date.now();
        const fileName = `imagem_${timestamp}.jpg`;

        // Se for blob URL ou data URL, faz download direto
        if (viewerImage.startsWith('blob:') || viewerImage.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = viewerImage;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Se for URL externa, faz fetch primeiro
          const response = await fetch(viewerImage);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Libera a URL do blob
          URL.revokeObjectURL(blobUrl);
        }

        console.log('[LeadChatScreen] Download concluido (Web)');
      } else {
        // Download para Mobile (iOS/Android)
        const timestamp = Date.now();
        const fileName = `imagem_${timestamp}.jpg`;
        const fileUri = FileSystem.documentDirectory + fileName;

        // Faz download do arquivo
        const downloadResult = await FileSystem.downloadAsync(
          viewerImage,
          fileUri
        );

        console.log('[LeadChatScreen] Arquivo baixado para:', downloadResult.uri);

        // Verifica se sharing esta disponivel
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
          // Abre dialogo para salvar/compartilhar
          await Sharing.shareAsync(downloadResult.uri);
          console.log('[LeadChatScreen] Download concluido (Mobile)');
        } else {
          console.log('[LeadChatScreen] Arquivo salvo em:', downloadResult.uri);
        }
      }
    } catch (error) {
      console.error('[LeadChatScreen] Erro ao baixar imagem:', error);
    }
  }, [viewerImage]);

  // ========================================
  // Handler de Compartilhar Imagem
  // ========================================
  const handleImageShare = useCallback(() => {
    console.log('[LeadChatScreen] Abrindo modal de compartilhar:', viewerImage);
    setShowShareModal(true);              //......Abre modal share
  }, [viewerImage]);

  // ========================================
  // Handler de Encaminhar para Contatos
  // ========================================
  const handleShareForward = useCallback(async (contactIds: string[], message: string) => {
    const isUrlShare = !!shareUrl;        //......Se e compartilhamento de URL
    console.log('[LeadChatScreen] Encaminhar para contatos:', contactIds);
    console.log('[LeadChatScreen] Modo:', isUrlShare ? 'URL' : 'Imagem');
    console.log('[LeadChatScreen] Instance:', instanceName);

    // Fecha modais primeiro para feedback visual
    setShowShareModal(false);             //......Fecha modal share
    setShowImageViewer(false);            //......Fecha viewer
    setSelectedMessage(null);             //......Limpa selecao

    // Verificacoes
    if (!instanceName) {
      console.error('[LeadChatScreen] Erro: instanceName nao definido');
      setShareUrl('');                    //......Limpa URL
      return;
    }

    // Extrai numero de telefone do contactId
    const extractPhone = (contactId: string): string => {
      if (contactId.startsWith('whatsapp_')) {
        const jidMatch = contactId.match(/whatsapp_(\d+)@/);
        return jidMatch ? jidMatch[1] : '';
      } else if (contactId.startsWith('phone_')) {
        const parts = contactId.split('_');
        return parts.length >= 2 ? parts[1] : '';
      }
      return '';
    };

    try {
      if (isUrlShare) {
        // Compartilhar URL como mensagem de texto
        const textToSend = message ? `${shareUrl}\n\n${message}` : shareUrl;

        for (const contactId of contactIds) {
          const phoneNumber = extractPhone(contactId);
          if (!phoneNumber) continue;     //......Pula sem numero

          console.log('[LeadChatScreen] Enviando URL para:', phoneNumber);
          const result = await evolutionService.sendText(
            instanceName,
            phoneNumber,
            textToSend
          );

          if (result.error) {
            console.error('[LeadChatScreen] Erro ao enviar para', phoneNumber, ':', result.error);
          } else {
            console.log('[LeadChatScreen] URL enviada para:', phoneNumber);
          }
        }
        setShareUrl('');                  //......Limpa URL apos envio
      } else {
        // Compartilhar imagem (fluxo original)
        if (!viewerImage) {
          console.error('[LeadChatScreen] Erro: viewerImage nao definido');
          return;
        }

        let imageData = viewerImage;
        if (viewerImage.startsWith('blob:')) {
          console.log('[LeadChatScreen] Convertendo blob URL para base64...');
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
          if (!phoneNumber) continue;     //......Pula sem numero

          console.log('[LeadChatScreen] Enviando imagem para:', phoneNumber);
          const result = await evolutionService.sendImage(
            instanceName,
            phoneNumber,
            imageData,
            message || undefined          //......Caption
          );

          if (result.error) {
            console.error('[LeadChatScreen] Erro ao enviar para', phoneNumber, ':', result.error);
          } else {
            console.log('[LeadChatScreen] Imagem enviada para:', phoneNumber);
          }
        }
      }

      console.log('[LeadChatScreen] Encaminhamento concluido');
    } catch (error) {
      console.error('[LeadChatScreen] Erro no encaminhamento:', error);
      setShareUrl('');                    //......Limpa URL em caso de erro
    }
  }, [viewerImage, shareUrl, instanceName]);

  // ========================================
  // Handler de Responder Imagem (comportamento antigo)
  // ========================================
  const handleImageReply = useCallback(() => {
    if (!selectedMessage) return;

    // Extrai thumbnail da imagem
    const imgContent = selectedMessage.content as ImageContent;
    const thumbnail = imgContent.thumbnail || imgContent.url;

    // Criar reply info para imagem
    const replyInfo: ReplyInfo = {
      messageId: selectedMessage.id,      //......ID da mensagem
      senderName: selectedMessage.senderName || 'Você',
      content: '',                         //......Sem texto
      type: 'image',                       //......Tipo imagem
      thumbnail,                          //......Thumbnail para preview visual
    };

    setReplyTo(replyInfo);                //......Define reply
    setShowImageViewer(false);            //......Fecha viewer
    setSelectedMessage(null);             //......Limpa selecao
  }, [selectedMessage, setReplyTo]);

  // ========================================
  // Handler de Enviar Resposta do ImageViewer
  // ========================================
  const handleImageViewerSendReply = useCallback(async (text: string) => {
    if (!text.trim() || !instanceName || !leadPhone) {
      console.log('[LeadChatScreen] Dados insuficientes para envio');
      return;
    }

    console.log('[LeadChatScreen] Enviando resposta do ImageViewer:', text);

    try {
      // Formata numero para envio
      let phoneNumber = leadPhone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55') && phoneNumber.length <= 11) {
        phoneNumber = '55' + phoneNumber;
      }

      // Envia texto via Evolution API
      const result = await evolutionService.sendText(
        instanceName,                     //......Nome da instancia
        phoneNumber,                      //......Numero destino
        text.trim()                       //......Texto da mensagem
      );

      console.log('[LeadChatScreen] Resposta enviada com sucesso:', result);

    } catch (error) {
      console.error('[LeadChatScreen] Erro ao enviar resposta:', error);
      throw error;
    }
  }, [instanceName, leadPhone]);

  // ========================================
  // Handler de Excluir Imagem
  // ========================================
  const handleImageDelete = useCallback(() => {
    if (!selectedMessage) return;

    deleteMessage(selectedMessage.id);    //......Deleta mensagem
    setShowImageViewer(false);            //......Fecha viewer
    setSelectedMessage(null);             //......Limpa selecao
  }, [selectedMessage, deleteMessage]);

  // ========================================
  // Handler de Reacao na Imagem
  // ========================================
  const handleImageReaction = useCallback(async (
    reaction: string | null,
    previousEmoji?: string
  ) => {
    console.group('[🔴 REACTION_DEBUG] 2. Handler de Reação Iniciado'); //......Inicia grupo

    console.log('[🔴 REACTION_DEBUG] 2.1 Parâmetros recebidos:'); //......Titulo parametros
    console.table({ //......Tabela parametros
      'Nova Reação': reaction || '(remover)', //......Nova reacao
      'Reação Anterior': previousEmoji || '(nenhuma)', //......Reacao anterior
      'Modo': reaction ? 'ADICIONAR' : 'REMOVER', //......Modo de operacao
    });

    if (!selectedMessage) {
      console.error('[🔴 REACTION_DEBUG] ❌ ERRO: selectedMessage não existe'); //......Erro mensagem
      console.groupEnd(); //......Fecha grupo
      return;
    }

    console.log('[🔴 REACTION_DEBUG] 2.2 Mensagem selecionada:', { //......Info mensagem
      id: selectedMessage.id, //......ID mensagem
      hasMessageKey: !!selectedMessage.messageKey, //......Tem chave
      messageKey: selectedMessage.messageKey, //......Chave completa
    });

    if (!selectedMessage.messageKey) {
      console.error('[🔴 REACTION_DEBUG] ❌ ERRO CRÍTICO: messageKey não existe na mensagem'); //......Erro critico
      console.log('[🔴 REACTION_DEBUG] 💡 Esta mensagem não pode receber reações'); //......Dica
      console.groupEnd(); //......Fecha grupo
      return;
    }

    console.log('[🔴 REACTION_DEBUG] 2.3 MessageKey válida encontrada:', selectedMessage.messageKey); //......Chave valida

    // Atualiza localmente primeiro
    console.log('[🔴 REACTION_DEBUG] 2.4 Atualizando estado local...'); //......Iniciando update
    updateMessageReaction(selectedMessage.id, reaction);
    console.log('[🔴 REACTION_DEBUG] ✅ Estado local atualizado'); //......Sucesso update

    // Envia para API
    if (instanceName) {
      try {
        const emojiToSend = reaction ?? '';

        console.group('[🔴 REACTION_DEBUG] 3. Enviando para Evolution API'); //......Grupo API
        console.log('[🔴 REACTION_DEBUG] 3.1 Request payload:'); //......Titulo payload
        console.table({ //......Tabela payload
          'Instance': instanceName, //......Nome instancia
          'Message ID': selectedMessage.messageKey.id, //......ID mensagem
          'Remote JID': selectedMessage.messageKey.remoteJid, //......JID destinatario
          'From Me': selectedMessage.messageKey.fromMe, //......De mim
          'Emoji': emojiToSend || '(vazio = remover)', //......Emoji enviado
        });

        const result = await evolutionService.sendReaction(
          instanceName,
          selectedMessage.messageKey,
          emojiToSend
        );

        console.log('[🔴 REACTION_DEBUG] 3.2 Resposta da API recebida'); //......Recebeu resposta
        console.log('[🔴 REACTION_DEBUG] 3.3 Result completo:', result); //......Resultado completo

        if (result.error) {
          console.error('[🔴 REACTION_DEBUG] ❌ ERRO na resposta da API:', result.error); //......Erro API
        } else {
          console.log('[🔴 REACTION_DEBUG] ✅ Reação enviada com sucesso!'); //......Sucesso API
        }
        console.groupEnd(); //......Fecha grupo API

      } catch (error) {
        console.error('[🔴 REACTION_DEBUG] ❌ EXCEÇÃO ao enviar reação:', error); //......Excecao
        console.groupEnd(); //......Fecha grupo API
      }
    } else {
      console.error('[🔴 REACTION_DEBUG] ❌ ERRO: instanceName não existe'); //......Erro instance
    }

    console.groupEnd(); //......Fecha grupo principal
  }, [selectedMessage, updateMessageReaction, instanceName]);

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

    // Criar reply info
    const replyInfo: ReplyInfo = {
      messageId: selectedMessage.id,      //......ID da mensagem
      senderName: selectedMessage.senderName || 'Você',
      content: selectedMessage.type === 'text'
        ? (selectedMessage.content as TextContent).text
        : '',
      type: selectedMessage.type,         //......Tipo
      thumbnail,                          //......Thumbnail para preview visual
    };

    setReplyTo(replyInfo);                //......Define reply
    setShowMessageOptions(false);         //......Fecha opcoes
    setSelectedMessage(null);             //......Limpa selecao
  }, [selectedMessage, setReplyTo]);

  // ========================================
  // Handler de Copiar
  // ========================================
  const handleCopy = useCallback(() => {
    if (!selectedMessage || selectedMessage.type !== 'text') return;

    const content = selectedMessage.content as TextContent;
    Clipboard.setString(content.text);    //......Copia texto
    setShowMessageOptions(false);         //......Fecha opcoes
    setSelectedMessage(null);             //......Limpa selecao
  }, [selectedMessage]);

  // ========================================
  // Handler de Encaminhar Link (botao forward do Instagram)
  // ========================================
  const handleLinkForwardPress = useCallback((url: string) => {
    setShareUrl(url);                     //......Guarda URL para envio
    setShowShareModal(true);              //......Abre modal share
  }, []);

  // ========================================
  // Handler de Encaminhar
  // ========================================
  const handleForward = useCallback(() => {
    // TODO: Implementar encaminhar
    console.log('Encaminhar mensagem');
    setShowMessageOptions(false);         //......Fecha opcoes
    setSelectedMessage(null);             //......Limpa selecao
  }, []);

  // ========================================
  // Handler de Excluir
  // ========================================
  const handleDelete = useCallback(() => {
    if (!selectedMessage) return;

    deleteMessage(selectedMessage.id);    //......Deleta mensagem
    setShowMessageOptions(false);         //......Fecha opcoes
    setSelectedMessage(null);             //......Limpa selecao
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
  // Handler de Cancelar Reply
  // ========================================
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);                     //......Limpa reply
  }, [setReplyTo]);

  // ========================================
  // DEBUG: Log inicial
  // ========================================
  useEffect(() => {
    console.log('[LeadChatScreen] MONTADO');
    console.log('[LeadChatScreen] Platform:', Platform.OS);
    console.log('[LeadChatScreen] messages count:', messages.length);
  }, [messages.length]);

  // ========================================
  // DEBUG: Handlers de Layout
  // ========================================
  const handleSafeAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('[LeadChatScreen] ScreenContainer layout:', { x, y, width, height });
    console.log('[LeadChatScreen] Viewport height:', Dimensions.get('window').height);
  }, []);

  const handleMessagesAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('[LeadChatScreen] MessagesWrapper layout:', { x, y, width, height });
  }, []);

  const handleInputContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    console.log('[LeadChatScreen] InputWrapper layout:', { x, y, width, height });
    console.log('[LeadChatScreen] Input bottom position:', y + height);
  }, []);

  // ========================================
  // Render Principal
  // ========================================
  // Log antes do render
  console.log('[LeadChatScreen] RENDER - isRecording:', isRecording);

  return (
    <View
      style={styles.screenContainer}
      onLayout={handleSafeAreaLayout}     //......Debug layout
    >
      {/* Imagem de Fundo - Camada Fixa Absoluta */}
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

      {/* Header Fixo no Topo */}
      <View style={styles.headerWrapper}>
        <ChatHeader
          chatInfo={chatInfo}             //......Info do chat
          onBackPress={handleBack}        //......Handler voltar
          onProfilePress={handleProfile}  //......Handler perfil
          onMenuPress={handleMenu}        //......Handler menu
        />
      </View>

      {/* Area de Mensagens - Flex 1 com Overflow Scroll */}
      <View
        testID="messages-wrapper"
        style={styles.messagesWrapper}
        onLayout={handleMessagesAreaLayout}
      >
        {/* Lista de Mensagens */}
        <View style={styles.messagesContent}>
          <MessageList
            messages={messages}           //......Mensagens
            onMessageLongPress={handleMessageLongPress}
            onImagePress={handleImagePress}
            onMediaGroupPress={handleMediaGroupPress}
            onAudioRetry={retryAudioMessage}
            onForwardPress={handleLinkForwardPress}
            instanceName={instanceName}   //......Instancia Evolution
          />
        </View>
      </View>

      {/* Input Fixo no Bottom - Altura Auto */}
      <View
        style={styles.inputWrapper}
        onLayout={handleInputContainerLayout}
      >
        {console.log('[LeadChatScreen] Renderizando InputContainer')}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.keyboardAvoiding}
        >
          {/* Input ou RecordingBar */}
          {isRecording ? (
            <RecordingBar
              duration={recordingDuration}
              onCancel={handleRecordingCancel}
              onSend={handleRecordingSend}
            />
          ) : (
            <InputBar
              onSendMessage={handleSendMessage}
              onVoiceStart={handleVoiceStart}
              onVoiceEnd={handleVoiceEnd}
              onEmojiPress={handleEmojiPress}
              onAttachPress={handleAttachPress}
              replyingTo={replyingTo}     //......Reply info
              onCancelReply={handleCancelReply}
              onSendAudio={handleSendAudio}
            />
          )}

          {/* Painel de Anexos (inline, abaixo do input) */}
          <AttachmentMenu
            visible={showAttachMenu}      //......Visibilidade
            onClose={() => setShowAttachMenu(false)}
            onSelectCamera={handleSelectCamera}
            onSelectGallery={handleSelectGallery}
            onSelectDocument={handleSelectDocument}
            onSelectContact={handleSelectContact}
            onSelectLocation={handleSelectLocation}
            onSelectEmoji={handleEmojiPress}
          />
        </KeyboardAvoidingView>
      </View>

      {/* Overlay para fechar AttachmentMenu ao tocar fora */}
      {showAttachMenu && (
        <Pressable
          style={styles.attachMenuOverlay}
          onPress={handleCloseAttachMenu}
        />
      )}

      {/* Modais */}
      <EmojiPicker
        visible={showEmojiPicker}         //......Visibilidade
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}      //......Handler selecionar
      />

      <MediaGalleryModal
        visible={showMediaGallery}        //......Visibilidade
        group={mediaGalleryGroup}         //......Grupo de midias
        instanceName={instanceName}       //......Instancia Evolution
        onClose={() => {
          setShowMediaGallery(false);
          setMediaGalleryGroup(null);
        }}
        onImagePress={handleImagePress}   //......Abre viewer individual
        onDeleteMessages={handleGalleryDeleteMessages}
        onShareSelected={handleGalleryShareSelected}
      />

      <ImageViewer
        visible={showImageViewer}         //......Visibilidade
        imageUrl={viewerImage}            //......URL da imagem
        instanceName={instanceName}       //......Nome da instancia
        remoteJid={leadPhone}             //......Telefone do lead
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
        onDownload={handleImageDownload}  //......Handler download
        onShare={handleImageShare}        //......Handler compartilhar
        onReply={handleImageReply}        //......Handler responder
        onDelete={handleImageDelete}      //......Handler excluir
        onReaction={handleImageReaction}  //......Handler reacao
        onSendReply={handleImageViewerSendReply}
      />

      <MessageOptions
        visible={showMessageOptions}      //......Visibilidade
        message={selectedMessage}         //......Mensagem
        onClose={() => {
          setShowMessageOptions(false);
          setSelectedMessage(null);
        }}
        onReply={handleReply}             //......Handler reply
        onCopy={handleCopy}               //......Handler copiar
        onForward={handleForward}         //......Handler encaminhar
        onDelete={handleDelete}           //......Handler excluir
        onReaction={handleMessageReaction}
        currentReaction={selectedMessage?.reaction || null}
      />

      <ShareModal
        visible={showShareModal}          //......Visibilidade
        imageUrl={viewerImage}            //......URL da imagem
        instanceName={instanceName}       //......Nome da instancia
        onClose={() => { setShowShareModal(false); setShareUrl(''); }}
        onForward={handleShareForward}    //......Handler encaminhar
      />

      {/* Modais Camera Web */}
      {console.log('🔴 [EDITOR_DEBUG] Renderizando modais - showWebPhotoPreview:', showWebPhotoPreview)}
      <WebCameraModal
        visible={showWebCamera}           //......Visibilidade
        onClose={handleWebCameraClose}    //......Handler fechar
        onCapture={handleWebCameraCapture}  //......Handler captura
      />

      <PhotoEditorScreen
        key={capturedPhoto?.uri || 'no-photo'}  //......Key para forcar remontagem
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
  );
};

// ========================================
// Export Default
// ========================================
export default LeadChatScreen;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal da tela
  screenContainer: {
    flex: 1,                              //......Ocupa todo espaco
    display: 'flex',                      //......Display flex
    flexDirection: 'column',              //......Direcao vertical
    height: '100%',                       //......Altura total
    maxHeight: '100vh',                   //......Altura maxima viewport
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
    minHeight: 0,                         //......Permite encolher abaixo conteudo
    position: 'relative',                 //......Posicao relativa
    zIndex: 1,                            //......Acima do fundo
    backgroundColor: 'transparent',       //......Fundo transparente
  },

  // Estilo da imagem de fundo (camada fixa)
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

  // Overlay transparente para fechar AttachmentMenu
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
