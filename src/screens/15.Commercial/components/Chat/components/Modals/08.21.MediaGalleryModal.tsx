// ========================================
// Componente MediaGalleryModal
// Galeria vertical de midias agrupadas (estilo WhatsApp)
// Com modo de selecao para compartilhar/excluir
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ========================================
// Imports de Tipos
// ========================================
import {
  MediaGroupData,
  MediaGroupItem,
  WhatsAppMessage,
  ImageContent,
  VideoContent,
} from '../../types/08.types.whatsapp';

// ========================================
// Imports de Componentes
// ========================================
import MessageStatus from '../Messages/08.08.MessageStatus';

// ========================================
// Imports de Servicos (cache + Evolution API)
// ========================================
import { evolutionService } from '../../../../services/evolutionService';
import { mediaStorageService } from '../../../../services/mediaStorageService';

// ========================================
// Constantes
// ========================================
const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_GAP = 8;                      //......Gap entre imagens (WhatsApp padrao)
const MAX_CONCURRENT_API = 2;             //......Maximo de chamadas API simultaneas

// ========================================
// Funcao auxiliar: formatar duracao (M:SS)
// ========================================
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);  //......Minutos
  const secs = Math.floor(seconds % 60);  //......Segundos
  return `${mins}:${secs.toString().padStart(2, '0')}`; //..Formato M:SS
};

// ========================================
// Extrair frame HD de video via Canvas (web only)
// Converte data URI em blob, carrega em video, captura frame
// ========================================
const extractVideoFrame = (videoDataUri: string): Promise<string | null> => {
  if (Platform.OS !== 'web') return Promise.resolve(null);
  return new Promise((resolve) => {
    let blobUrl: string | null = null;     //......URL blob para revogar depois
    let resolved = false;                  //......Flag anti re-entrancia
    const video = document.createElement('video');
    video.preload = 'auto';               //......Carrega dados completos
    video.muted = true;                    //......Mudo para autoplay
    video.playsInline = true;              //......Inline no mobile
    // Funcao centralizada de cleanup (evita loop infinito no onerror)
    const done = (result: string | null) => {
      if (resolved) return;                //......Ja resolvido, ignorar
      resolved = true;                     //......Marcar como resolvido
      clearTimeout(timeout);               //......Cancelar timeout
      video.onloadeddata = null;           //......Remover listeners
      video.onseeked = null;               //......Remover listeners
      video.onerror = null;                //......Remover listeners
      if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
      video.removeAttribute('src');        //......Limpar sem triggerar onerror
      video.load();                        //......Resetar video element
      resolve(result);                     //......Resolver promise
    };
    const timeout = setTimeout(() => {     //......Timeout de 15s
      done(null);
    }, 15000);
    video.onloadeddata = () => {           //......Primeiro frame disponivel
      video.currentTime = Math.min(1, video.duration * 0.1);
    };
    video.onseeked = () => {               //......Frame no tempo solicitado
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;   //......Largura real do video
        canvas.height = video.videoHeight; //......Altura real do video
        const ctx = canvas.getContext('2d');
        if (ctx && video.videoWidth > 0) {
          ctx.drawImage(video, 0, 0);      //......Desenhar frame no canvas
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          done(dataUrl);                   //......Retornar thumbnail HD
        } else {
          done(null);                      //......Ctx null ou dims zero
        }
      } catch {
        done(null);                        //......Erro no canvas
      }
    };
    video.onerror = () => {                //......Erro ao carregar video
      done(null);                          //......Cleanup sem loop
    };
    // Criar blob a partir do data URI
    if (videoDataUri.startsWith('data:')) {
      try {
        const commaIdx = videoDataUri.indexOf(',');
        if (commaIdx === -1) { done(null); return; }
        const header = videoDataUri.substring(0, commaIdx);
        let mime = header.match(/:(.*?);/)?.[1] || 'video/mp4';
        // Corrigir MIME invalidos (cache pode ter salvo como image ou octet-stream)
        if (mime === 'application/octet-stream') mime = 'video/mp4';
        if (mime.startsWith('image/')) mime = 'video/mp4';
        const b64 = videoDataUri.substring(commaIdx + 1);
        const bstr = atob(b64);            //......Decodificar base64
        const arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) arr[i] = bstr.charCodeAt(i);
        const blob = new Blob([arr], { type: mime });
        blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;               //......Iniciar carregamento
      } catch {
        done(null);                        //......Erro na conversao blob
      }
    } else {
      video.src = videoDataUri;            //......URL direta
    }
  });
};

// ========================================
// Semaforo de concorrencia (module-level)
// Limita chamadas simultaneas a Evolution API
// ========================================
let activeCalls = 0;                       //......Chamadas ativas no momento
const apiQueue: Array<() => void> = [];    //......Fila de espera

const acquireSlot = (label: string): Promise<void> => {
  if (activeCalls < MAX_CONCURRENT_API) {
    activeCalls++;                         //......Incrementa contador
    return Promise.resolve();
  }
  return new Promise<void>(resolve => apiQueue.push(resolve));
};

const releaseSlot = (label: string) => {
  const next = apiQueue.shift();           //......Proximo da fila
  if (next) {
    next();                                //......Transfere vaga
  } else {
    activeCalls--;                         //......Libera vaga
  }
};

// ========================================
// Interface de Props do Modal
// ========================================
interface MediaGalleryModalProps {
  visible: boolean;                        //......Visibilidade do modal
  group: MediaGroupData | null;            //......Dados do grupo de midias
  instanceName?: string;                   //......Nome instancia Evolution
  onClose: () => void;                     //......Fechar modal
  onImagePress: (imageUrl: string, message?: WhatsAppMessage) => void;
  onVideoPress?: (videoUrl: string, message?: WhatsAppMessage) => void;
  onDeleteMessages?: (messageIds: string[]) => void;
  onShareSelected?: (items: MediaGroupItem[]) => void;
}

// ========================================
// Interface GalleryImage Props
// ========================================
interface GalleryImageProps {
  item: MediaGroupItem;                    //......Item de midia
  instanceName?: string;                   //......Instancia Evolution
  isOutgoing: boolean;                     //......Outgoing
  isSelectionMode: boolean;                //......Modo selecao ativo
  isSelected: boolean;                     //......Item selecionado
  onPress: (resolvedUri: string, message: WhatsAppMessage) => void;
  onToggleSelect: (messageId: string) => void;
}

// ========================================
// Sub-componente GalleryImage
// Imagem individual com carregamento, timestamp e checkbox
// ========================================
const GalleryImage = memo<GalleryImageProps>(({
  item,
  instanceName,
  isOutgoing,
  isSelectionMode,
  isSelected,
  onPress,
  onToggleSelect,
}) => {
  const content = item.message.content as ImageContent | VideoContent;
  const thumbnailUri = content.thumbnail;  //......Base64 thumbnail (pode ser null)
  const mainUri = content.url;             //......URL HTTP (pode expirar)
  const messageKey = item.message.messageKey;
  const isVideo = item.type === 'video';   //......Tipo video
  const videoDuration = isVideo ? (content as VideoContent).duration : 0;

  // ========================================
  // Estado: NUNCA usar URL HTTP como estado inicial
  // Prioriza thumbnail (base64 local), null se nao tiver
  // ========================================
  const hasThumbnail = !!(thumbnailUri && thumbnailUri.length > 20);
  const [imageUri, setImageUri] = useState<string | null>(
    hasThumbnail ? thumbnailUri : null,  //......Evita URL expirada
  );
  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // Carregamento proativo em 3 passos:
  // Imagem: 1) Cache  2) Evolution API  3) URL HTTP
  // Video: 1) Cache video  2) Evolution API  -> extrair frame HD via Canvas
  // ========================================
  useEffect(() => {
    if (!mainUri?.startsWith('http')) {
      if (isVideo) setIsLoading(false);    //......Video sem URL usa thumbnail
      return;
    }

    let cancelled = false;                 //......Flag de cancelamento

    (async () => {
      // ============ VIDEO: extrair thumbnail HD do video ============
      if (isVideo) {
        let videoDataUri: string | null = null;
        let fromCache = false;             //......Indica se dados vieram do cache

        // Passo 1: Verificar cache local (pode ter video salvo)
        try {
          const cachePromise = mediaStorageService.getMedia(mainUri);
          const cacheTimeout = new Promise<null>((r) => setTimeout(() => r(null), 3000));
          const cached = await Promise.race([cachePromise, cacheTimeout]);
          if (cached && typeof cached === 'string' && cached.length > 10000 && !cancelled) {
            videoDataUri = cached;          //......Video encontrado no cache
            fromCache = true;              //......Marcar origem
          }
        } catch {}

        // Passo 2: Tentar extrair frame do cache (se disponivel)
        if (videoDataUri && !cancelled && Platform.OS === 'web') {
          const frame = await extractVideoFrame(videoDataUri);
          if (frame && !cancelled) {
            setImageUri(frame);            //......Thumbnail HD extraida do cache
            setIsLoading(false);           //......Ocultar loading
            return;
          }
          // Cache corrompido/incompativel — invalidar e tentar API
          videoDataUri = null;             //......Descartar dados do cache
          fromCache = false;               //......Permitir extracao da API
        }

        // Passo 3: Buscar video via Evolution API (cache falhou ou nao existia)
        if (!videoDataUri && messageKey && instanceName && !cancelled) {
          const label = `gallery-vid-${item.message.id?.slice(-6) || '?'}`;
          await acquireSlot(label);        //......Aguardar vaga na fila
          if (cancelled) { releaseSlot(label); return; }
          try {
            const apiPromise = evolutionService.getBase64FromMediaMessage(instanceName, messageKey);
            const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 30000));
            const media = await Promise.race([apiPromise, timeoutPromise]);
            if (media?.base64 && !cancelled) {
              let mimeType = media.mimeType || 'video/mp4';
              let b64 = media.base64;      //......Base64 do video
              if (b64.startsWith('data:')) {
                const ci = b64.indexOf(',');
                if (ci !== -1) b64 = b64.substring(ci + 1);
              }
              videoDataUri = `data:${mimeType};base64,${b64}`;
              mediaStorageService.saveMedia(mainUri, videoDataUri, mimeType).catch(() => {});
            }
          } catch {}
          releaseSlot(label);              //......Liberar vaga
        }

        // Passo 4: Extrair frame HD dos dados da API
        if (videoDataUri && !fromCache && !cancelled && Platform.OS === 'web') {
          const frame = await extractVideoFrame(videoDataUri);
          if (frame && !cancelled) {
            setImageUri(frame);            //......Thumbnail HD extraida da API
            setIsLoading(false);           //......Ocultar loading
            return;
          }
        }

        // Fallback: manter thumbnail original
        if (!cancelled) setIsLoading(false);
        return;
      }

      // ============ IMAGEM: fluxo existente ============
      // Passo 1: Verificar cache local (com timeout de 3s)
      try {
        const cachePromise = mediaStorageService.getMedia(mainUri);
        const cacheTimeout = new Promise<null>((r) => setTimeout(() => r(null), 3000));
        const cached = await Promise.race([cachePromise, cacheTimeout]);
        if (cached && typeof cached === 'string' && cached.length > 1000 && !cancelled) {
          // Cache com MIME invalido = dados corrompidos, precisa re-download
          if (cached.startsWith('data:application/octet-stream') ||
              (!cached.startsWith('data:image/') && cached.startsWith('data:'))) {
            // MIME invalido, pular para API
          } else {
            setImageUri(cached);           //......Usar imagem do cache (MIME valido)
            setIsLoading(false);           //......Ocultar loading
            return;
          }
        }
      } catch {}

      // Passo 2: Buscar via Evolution API (com semaforo de concorrencia)
      if (messageKey && instanceName && !cancelled) {
        const label = `gallery-${item.message.id?.slice(-6) || '?'}`;
        await acquireSlot(label);          //......Aguardar vaga na fila
        if (cancelled) { releaseSlot(label); return; }

        try {
          const apiPromise = evolutionService.getBase64FromMediaMessage(
            instanceName,
            messageKey,
          );
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), 30000),
          );
          const media = await Promise.race([apiPromise, timeoutPromise]);

          if (media?.base64 && !cancelled) {
            let mimeType = media.mimeType || 'image/jpeg';
            if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
              mimeType = 'image/jpeg';     //......Forcar mimeType valido
            }
            let b64 = media.base64;
            if (b64.startsWith('data:')) {
              const ci = b64.indexOf(',');
              if (ci !== -1) b64 = b64.substring(ci + 1);
            }
            const dataUri = `data:${mimeType};base64,${b64}`;
            mediaStorageService.saveMedia(mainUri, dataUri, mimeType).catch(() => {});
            if (!cancelled) {
              setImageUri(dataUri);         //......Substituir por HD
              setIsLoading(false);          //......Ocultar loading
            }
            releaseSlot(label);            //......Liberar vaga
            return;
          }
        } catch {}
        releaseSlot(label);                //......Liberar vaga (erro/timeout)
      }

      // Passo 3: Ultimo recurso - tentar URL HTTP (browser cache)
      if (mainUri && !cancelled) {
        setImageUri(mainUri);              //......Tentar URL (browser cache)
        return;
      }

      // Todas tentativas falharam
      if (!cancelled) setIsLoading(false);
    })().catch(() => {});

    return () => { cancelled = true; };    //......Cancelar ao desmontar
  }, [mainUri, messageKey, instanceName, isVideo]);

  // ========================================
  // Handler de load da imagem (sucesso)
  // ========================================
  const handleImageLoad = useCallback(() => {
    setIsLoading(false);                   //......Imagem carregou com sucesso
  }, []);

  // ========================================
  // Handler de erro: voltar para thumbnail e parar loading
  // ========================================
  const handleImageError = useCallback(() => {
    setIsLoading(false);                   //......Parar spinner
    if (hasThumbnail && imageUri !== thumbnailUri) {
      setImageUri(thumbnailUri);           //......Voltar para thumbnail
    }
  }, [hasThumbnail, thumbnailUri, imageUri]);

  // ========================================
  // Calcular dimensoes de exibicao
  // ========================================
  const displayHeight = useMemo(() => {
    const aspectRatio = content.width > 0 && content.height > 0
      ? content.width / content.height     //......Proporcao real
      : 4 / 3;                            //......Padrao 4:3
    return Math.round(SCREEN_WIDTH / aspectRatio);
  }, [content.width, content.height]);

  // ========================================
  // Formatar hora individual
  // ========================================
  const cellTime = useMemo(() =>
    item.message.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  [item.message.timestamp]);

  // ========================================
  // Handler de press (abre viewer ou toggle selecao)
  // ========================================
  const handlePress = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelect(item.message.id);
    } else {
      onPress(imageUri || mainUri || thumbnailUri || '', item.message);
    }
  }, [isSelectionMode, onToggleSelect, item.message, onPress, imageUri, mainUri, thumbnailUri]);

  // ========================================
  // Render
  // ========================================
  return (
    <Pressable
      style={{ marginBottom: IMAGE_GAP }}
      onPress={handlePress}
    >
      {/* Thumbnail (fundo enquanto HD carrega) */}
      {hasThumbnail && (
        <Image
          source={{ uri: thumbnailUri }}
          style={[
            { width: SCREEN_WIDTH, height: displayHeight, position: 'absolute' },
          ]}
          resizeMode="cover"
          blurRadius={Platform.OS !== 'web' ? 1 : 0}
        />
      )}

      {/* Imagem HD (renderiza por cima do thumbnail) */}
      {imageUri && imageUri !== thumbnailUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: SCREEN_WIDTH, height: displayHeight }}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <View style={{ width: SCREEN_WIDTH, height: displayHeight }} />
      )}

      {/* Indicador de carregamento (sobre thumbnail ou fundo escuro) */}
      {isLoading && (
        <View style={styles.galleryLoadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {/* Botao play para videos (estilo WhatsApp: fundo branco, icone preto) */}
      {isVideo && !isLoading && (
        <View style={styles.videoPlayIcon}>
          <Ionicons name="play" size={28} color="#3A3F51" />
        </View>
      )}

      {/* Badge de duracao do video (inferior esquerdo) */}
      {isVideo && videoDuration > 0 && !isLoading && (
        <View style={styles.videoDurationBadge}>
          <Ionicons name="videocam" size={14} color="#FFFFFF" />
          <Text style={styles.videoDurationText}>
            {formatDuration(videoDuration)}
          </Text>
        </View>
      )}

      {/* Checkbox de selecao */}
      {isSelectionMode && (
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected,
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      )}

      {/* Reacao (emoji — sobe se video com duracao para nao sobrepor badge) */}
      {item.message.reaction && (
        <View style={[
          styles.reactionBadge,
          isVideo && videoDuration > 0 && { bottom: IMAGE_GAP + 34 },
        ]}>
          <Text style={styles.reactionText}>{item.message.reaction}</Text>
        </View>
      )}

      {/* Timestamp overlay */}
      <View style={styles.imageTimeContainer}>
        <Text style={styles.imageTimeText}>{cellTime}</Text>
        {isOutgoing && item.message.status && (
          <MessageStatus
            status={item.message.status}
            isOutgoing={true}
            size={12}
            iconColor="#FFFFFF"
          />
        )}
      </View>
    </Pressable>
  );
});

// ========================================
// Componente Principal
// ========================================
const MediaGalleryModal = memo<MediaGalleryModalProps>(({
  visible,
  group,
  instanceName,
  onClose,
  onImagePress,
  onVideoPress,
  onDeleteMessages,
  onShareSelected,
}) => {
  // ========================================
  // Estados do modo de selecao
  // ========================================
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ========================================
  // Reset ao fechar/abrir ou trocar grupo
  // ========================================
  useEffect(() => {
    if (!visible) {
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      setShowMenu(false);
      setShowDeleteConfirm(false);
    }
  }, [visible]);

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setShowMenu(false);
    setShowDeleteConfirm(false);
  }, [group]);

  // ========================================
  // Dados derivados (seguros com group null)
  // ========================================
  const isOutgoing = group?.direction === 'outgoing';
  const senderName = isOutgoing
    ? 'Você'
    : (group?.items[0]?.message.senderName || 'Contato');
  const itemCount = group?.items.length ?? 0;

  // ========================================
  // Handler de press em imagem da galeria
  // ========================================
  const handleItemPress = useCallback((resolvedUri: string, message: WhatsAppMessage) => {
    if (message.type === 'video') {
      onVideoPress?.(resolvedUri, message);
    } else {
      onImagePress(resolvedUri, message);
    }
  }, [onImagePress, onVideoPress]);

  // ========================================
  // Toggle selecao de um item
  // ========================================
  const handleToggleSelect = useCallback((messageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }, []);

  // ========================================
  // Selecionar/desmarcar todos
  // ========================================
  const handleSelectAll = useCallback(() => {
    if (!group) return;
    if (selectedIds.size === group.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(group.items.map(i => i.message.id)));
    }
  }, [group, selectedIds.size]);

  // ========================================
  // Sair do modo selecao
  // ========================================
  const handleExitSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  // ========================================
  // Entrar no modo selecao (via menu)
  // ========================================
  const handleEnterSelection = useCallback(() => {
    setShowMenu(false);
    setIsSelectionMode(true);
  }, []);

  // ========================================
  // Toggle menu dropdown
  // ========================================
  const handleToggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  // ========================================
  // Fechar menu dropdown
  // ========================================
  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  // ========================================
  // Compartilhar selecionados
  // ========================================
  const handleShareSelected = useCallback(() => {
    if (!group || selectedIds.size === 0) return;
    const items = group.items.filter(i => selectedIds.has(i.message.id));
    onShareSelected?.(items);
  }, [group, selectedIds, onShareSelected]);

  // ========================================
  // Abrir confirmacao de exclusao
  // ========================================
  const handleDeletePress = useCallback(() => {
    if (selectedIds.size > 0) {
      setShowDeleteConfirm(true);
    }
  }, [selectedIds.size]);

  // ========================================
  // Confirmar exclusao
  // ========================================
  const handleConfirmDelete = useCallback(() => {
    if (selectedIds.size > 0) {
      onDeleteMessages?.(Array.from(selectedIds));
    }
    setShowDeleteConfirm(false);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, [selectedIds, onDeleteMessages]);

  // ========================================
  // Cancelar exclusao
  // ========================================
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // ========================================
  // Render item do FlatList
  // ========================================
  const renderItem = useCallback(({ item }: { item: MediaGroupItem }) => (
    <GalleryImage
      item={item}
      instanceName={instanceName}
      isOutgoing={isOutgoing}
      isSelectionMode={isSelectionMode}
      isSelected={selectedIds.has(item.message.id)}
      onPress={handleItemPress}
      onToggleSelect={handleToggleSelect}
    />
  ), [instanceName, isOutgoing, isSelectionMode, selectedIds, handleItemPress, handleToggleSelect]);

  // ========================================
  // Key extractor
  // ========================================
  const keyExtractor = useCallback((item: MediaGroupItem) =>
    item.message.id,
  []);

  // ========================================
  // Early return (apos todos os hooks)
  // ========================================
  if (!visible || !group) return null;

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* ============================== */}
        {/* Header */}
        {/* ============================== */}
        <View style={styles.header}>
          {/* Centro: Info do remetente (absoluto para ficar sempre centralizado) */}
          <View style={styles.headerInfoAbsolute}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {senderName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </Text>
          </View>

          {/* Lado esquerdo: Back ou Tudo */}
          {isSelectionMode ? (
            <Pressable style={styles.headerSelectAllButton} onPress={handleSelectAll} hitSlop={12}>
              <Text style={styles.headerTextButtonLabel}>
                {selectedIds.size === itemCount ? 'Desmarcar Tudo' : 'Tudo'}
              </Text>
            </Pressable>
          ) : (
            <Pressable style={styles.backButton} onPress={onClose} hitSlop={12}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Spacer central */}
          <View style={styles.headerSpacer} />

          {/* Lado direito: Menu ou OK */}
          {isSelectionMode ? (
            <Pressable style={styles.headerTextButton} onPress={handleExitSelection} hitSlop={12}>
              <Text style={styles.headerTextButtonLabelBold}>OK</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.menuButton} onPress={handleToggleMenu} hitSlop={12}>
              <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        {/* ============================== */}
        {/* Menu Dropdown (3 pontinhos) */}
        {/* ============================== */}
        {showMenu && (
          <>
            {/* Overlay para fechar ao tocar fora */}
            <Pressable style={styles.menuOverlay} onPress={handleCloseMenu} />

            {/* Dropdown */}
            <View style={styles.menuDropdown}>
              <Pressable style={styles.menuItem} onPress={handleEnterSelection}>
                <Ionicons name="checkbox-outline" size={20} color="#FFFFFF" />
                <Text style={styles.menuItemText}>Selecionar</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ============================== */}
        {/* Lista de imagens */}
        {/* ============================== */}
        <FlatList
          data={group.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          extraData={selectedIds}
        />

        {/* ============================== */}
        {/* Footer */}
        {/* ============================== */}
        {isSelectionMode ? (
          <View style={styles.footerSelection}>
            <Pressable
              style={[styles.footerButton, selectedIds.size === 0 && styles.footerButtonDisabled]}
              onPress={handleShareSelected}
              hitSlop={8}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={selectedIds.size > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.35)'}
              />
            </Pressable>

            <Text style={styles.selectionCountText}>
              Item selecionado: {selectedIds.size}
            </Text>

            <Pressable
              style={[styles.footerButton, selectedIds.size === 0 && styles.footerButtonDisabled]}
              onPress={handleDeletePress}
              hitSlop={8}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={selectedIds.size > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.35)'}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.footer}>
            <Pressable style={styles.footerButton} hitSlop={8}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </Pressable>

            <Pressable style={styles.footerReplyButton} hitSlop={8}>
              <Ionicons name="arrow-undo-outline" size={18} color="#FFFFFF" />
              <Text style={styles.footerReplyText}>Responder</Text>
            </Pressable>

            <Pressable style={styles.footerButton} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* ============================== */}
        {/* Modal de Confirmacao de Exclusao */}
        {/* ============================== */}
        <Modal
          visible={showDeleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.deleteOverlay}>
            <View style={styles.deleteCard}>
              <Text style={styles.deleteTitle}>
                Apagar {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'itens'}?
              </Text>
              <Text style={styles.deleteSubtitle}>
                Esta ação não pode ser desfeita.
              </Text>

              <View style={styles.deleteButtons}>
                <Pressable style={styles.deleteCancelButton} onPress={handleCancelDelete}>
                  <Text style={styles.deleteCancelText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.deleteConfirmButton} onPress={handleConfirmDelete}>
                  <Text style={styles.deleteConfirmText}>Apagar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
});

// ========================================
// Export
// ========================================
export default MediaGalleryModal;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal (fundo preto)
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 12 : 48,
    paddingBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },

  // Botao voltar
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Botao texto do header (OK)
  headerTextButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Botao Tudo / Desmarcar Tudo (largura flexivel)
  headerSelectAllButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  // Label do botao texto
  headerTextButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },

  // Label bold do botao texto (OK)
  headerTextButtonLabelBold: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },

  // Spacer central (empurra botao direito para a borda)
  headerSpacer: {
    flex: 1,
  },

  // Info do header (nome + contagem) - centralizado absolutamente
  headerInfoAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },

  // Titulo (nome do remetente)
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },

  // Subtitulo (contagem de itens)
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },

  // Botao menu
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Overlay do menu (fecha ao tocar fora)
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },

  // Dropdown do menu
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 56 : 92,
    right: 8,
    backgroundColor: '#303030',
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 30,
    minWidth: 160,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }),
  },

  // Item do menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  // Texto do item do menu
  menuItemText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },

  // Lista de imagens
  list: {
    flex: 1,
  },

  // Content da lista
  listContent: {
    paddingTop: IMAGE_GAP,
  },

  // Placeholder de imagem
  imagePlaceholder: {
    backgroundColor: '#1A1A1A',
  },

  // Overlay de carregamento (sobre thumbnail ou fundo)
  galleryLoadingOverlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Cobre toda a celula
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',             //......Centraliza spinner
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',   //......Overlay semi-transparente
  },

  // Botao play para videos (estilo WhatsApp: fundo branco, grande)
  videoPlayIcon: {
    position: 'absolute',               //......Posicao absoluta
    top: '50%',                          //......Centralizado verticalmente
    left: '50%',                         //......Centralizado horizontalmente
    marginTop: -30,                      //......Ajuste metade da altura (60/2)
    marginLeft: -30,                     //......Ajuste metade da largura (60/2)
    width: 60,                           //......Largura do botao
    height: 60,                          //......Altura do botao
    borderRadius: 30,                    //......Circular
    backgroundColor: '#FFFFFF',          //......Fundo branco (WhatsApp)
    justifyContent: 'center',            //......Centraliza icone
    alignItems: 'center',               //......Centraliza icone
    paddingLeft: 3,                      //......Ajuste visual do icone play
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

  // Badge de duracao do video (inferior esquerdo)
  videoDurationBadge: {
    position: 'absolute',               //......Posicao absoluta
    bottom: IMAGE_GAP + 8,              //......Distancia do fundo
    left: 12,                            //......Distancia da esquerda
    flexDirection: 'row',                //......Layout horizontal
    alignItems: 'center',               //......Alinha verticalmente
    gap: 4,                              //......Espaco entre icone e texto
    backgroundColor: 'rgba(0,0,0,0.45)', //......Fundo escuro semitransparente
    borderRadius: 6,                     //......Bordas arredondadas
    paddingHorizontal: 7,               //......Padding horizontal
    paddingVertical: 3,                  //......Padding vertical
  },

  // Texto da duracao do video
  videoDurationText: {
    fontFamily: 'Inter_500Medium',       //......Fonte medium
    fontSize: 12,                        //......Tamanho fonte
    color: '#FFFFFF',                    //......Cor branca
    lineHeight: 14,                      //......Altura linha
  },

  // Checkbox de selecao
  checkbox: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Checkbox selecionado
  checkboxSelected: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },

  // Container do timestamp por imagem
  imageTimeContainer: {
    position: 'absolute',
    bottom: IMAGE_GAP + 8,
    right: 12,
    paddingTop: 4,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  // Texto do timestamp
  imageTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 14,
  },

  // Badge de reacao (canto inferior esquerdo)
  reactionBadge: {
    position: 'absolute',
    bottom: IMAGE_GAP + 8,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  // Texto do emoji de reacao
  reactionText: {
    fontSize: 16,
  },

  // Footer (modo normal)
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'web' ? 12 : 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // Footer (modo selecao - icones a 10px da borda)
  footerSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'web' ? 12 : 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // Botao do footer
  footerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Botao footer desabilitado
  footerButtonDisabled: {
    opacity: 0.5,
  },

  // Texto contador de selecao
  selectionCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  // Botao responder do footer
  footerReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Texto do botao responder
  footerReplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  // ========================================
  // Estilos do Modal de Confirmacao de Exclusao
  // ========================================

  // Overlay escuro
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card do modal
  deleteCard: {
    backgroundColor: '#303030',
    borderRadius: 16,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },

  // Titulo do modal
  deleteTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Subtitulo do modal
  deleteSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },

  // Container dos botoes
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },

  // Botao cancelar
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },

  // Texto cancelar
  deleteCancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },

  // Botao confirmar exclusao
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },

  // Texto confirmar exclusao
  deleteConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
