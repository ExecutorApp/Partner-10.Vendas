// ========================================
// Tela de Edicao de Fotos
// Editor estilo WhatsApp com modal de edicao separado
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import { View, Image, Pressable, Text, TextInput, StyleSheet, Modal, Platform, KeyboardAvoidingView, SafeAreaView, Animated, Dimensions } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { EditorColors, EditorStyles, EditorIcons, EditorMode, DrawingStrokeWidths, HighlighterStrokeWidths, BlurStrokeWidths } from './utils/editorConstants';

// ========================================
// Imports de Componentes
// ========================================
import EditToolbar from './components/EditToolbar';
import WebEditorCanvas from './components/WebEditorCanvas';
import DrawingCategoryBar from './components/drawing/DrawingCategoryBar';
import DrawingOptionsPanel from './components/drawing/DrawingOptionsPanel';
import TextInputModal from './components/drawing/TextInputModal';
import EmojiStickerPanel from './components/stickers/EmojiStickerPanel';
import DiscardModal from './components/DiscardModal';
import CaptionInput from './components/CaptionInput';
import CameraModal, { CapturedMedia } from './components/CameraModal';
import MediaCarousel from './components/MediaCarousel';
import VideoEditorPanel from './components/VideoEditorPanel';
import UnifiedCropModal, { CropSettingsResult } from './components/crop/UnifiedCropModal';

// ========================================
// Imports de Hooks
// ========================================
import { useDrawingElements } from './hooks/useDrawingElements';

// ========================================
// Imports de Tipos
// ========================================
import { DrawingCategory, CategoryOptionsState, DEFAULT_CATEGORY_OPTIONS, AnyDrawElement, TextElement, ShapeElement, BlurElement, StickerElement, Point2D } from './types/editorTypes';
import { generateElementId } from './hooks/useDrawingElements';
import { MediaItem, CropSettings, DEFAULT_CROP_SETTINGS } from './types/camera';

// ========================================
// Tipos
// ========================================
interface PhotoEditorScreenProps {
  visible: boolean;                         //......Modal visivel
  photoUri: string;                         //......URI da foto/video
  photoWidth: number;                       //......Largura da foto/video
  photoHeight: number;                      //......Altura da foto/video
  initialMediaType?: 'photo' | 'video';     //......Tipo de midia inicial
  initialDuration?: number;                 //......Duracao do video (ms)
  initialThumbnail?: string;                //......Thumbnail do video
  initialFileSize?: number;                 //......Tamanho do video (bytes)
  leadName: string;                         //......Nome do lead
  onClose: () => void;                      //......Callback fechar
  onSend: (items: { uri: string; type: 'photo' | 'video'; width: number; height: number; caption?: string; viewOnce?: boolean }[]) => void;  //......Callback enviar multiplas midias
  onOpenCamera?: () => void;                //......Callback abrir camera para mais fotos
}

// ========================================
// Icone Lixeira (para excluir sticker selecionado)
// ========================================
const TrashIcon: React.FC = memo(() => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

// ========================================
// Componente CroppedImagePreview (NAO-DESTRUTIVO)
// Aplica crop visualmente via CSS (overflow: hidden + transforms)
// Imagem original NUNCA e alterada
// ========================================
interface CroppedImagePreviewProps {
  imageUri: string;                         //......URI da imagem original
  imageWidth: number;                       //......Largura original
  imageHeight: number;                      //......Altura original
  cropSettings: CropSettings;               //......Settings de crop
}

const CroppedImagePreview: React.FC<CroppedImagePreviewProps> = memo(({
  imageUri,
  imageWidth,
  imageHeight,
  cropSettings,
}) => {
  // Medir o container externo (que ocupa todo o espaco disponivel)
  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });

  const handleAreaLayout = useCallback((e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setAreaSize(prev => {
      if (prev.width === width && prev.height === height) return prev;
      return { width, height };
    });
  }, []);

  // Detectar se ha crop aplicado
  const hasCrop = cropSettings.cropRect.width < 0.99 ||
                  cropSettings.cropRect.height < 0.99 ||
                  cropSettings.cropRect.x > 0.01 ||
                  cropSettings.cropRect.y > 0.01;

  // Detectar se ha transformacoes
  const hasTransform = cropSettings.fineAngle !== 0 ||
                       cropSettings.flipH ||
                       cropSettings.flipV ||
                       cropSettings.rotation90 !== 0;

  // Se nao ha crop nem transformacao, renderizar imagem simples
  if (!hasCrop && !hasTransform) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="contain"
      />
    );
  }

  // Converter crop rect do espaco da imagem rotacionada para espaco da imagem original
  // O modal de crop trabalha com imagem fisicamente rotacionada, entao as coordenadas
  // do crop sao relativas a imagem rotacionada. Para renderizar com CSS rotation
  // sobre a imagem original, precisamos converter.
  const rot = cropSettings.rotation90 % 360;
  let origRelX: number, origRelY: number, origRelW: number, origRelH: number;

  if (rot === 90) {
    // 90° horario: rotated(x,y) → original(y, 1-x-w)
    origRelX = cropSettings.cropRect.y;
    origRelY = 1 - cropSettings.cropRect.x - cropSettings.cropRect.width;
    origRelW = cropSettings.cropRect.height;
    origRelH = cropSettings.cropRect.width;
  } else if (rot === 180) {
    origRelX = 1 - cropSettings.cropRect.x - cropSettings.cropRect.width;
    origRelY = 1 - cropSettings.cropRect.y - cropSettings.cropRect.height;
    origRelW = cropSettings.cropRect.width;
    origRelH = cropSettings.cropRect.height;
  } else if (rot === 270) {
    origRelX = 1 - cropSettings.cropRect.y - cropSettings.cropRect.height;
    origRelY = cropSettings.cropRect.x;
    origRelW = cropSettings.cropRect.height;
    origRelH = cropSettings.cropRect.width;
  } else {
    // 0° - sem conversao
    origRelX = cropSettings.cropRect.x;
    origRelY = cropSettings.cropRect.y;
    origRelW = cropSettings.cropRect.width;
    origRelH = cropSettings.cropRect.height;
  }

  // Dimensoes do crop em pixels na imagem original
  const cropX = origRelX * imageWidth;
  const cropY = origRelY * imageHeight;
  const cropW = origRelW * imageWidth;
  const cropH = origRelH * imageHeight;

  // Dimensoes visiveis apos rotacao 90 (crop area rotacionada)
  const isRotated90 = rot === 90 || rot === 270;
  const visibleW = isRotated90 ? cropH : cropW;
  const visibleH = isRotated90 ? cropW : cropH;

  // Area disponivel medida pelo onLayout
  const aw = areaSize.width;
  const ah = areaSize.height;

  // Calcular dimensoes explicitas do container interno (fit dentro do area)
  let boxW = 0;
  let boxH = 0;
  if (aw > 0 && ah > 0 && visibleW > 0 && visibleH > 0) {
    const displayAspect = visibleW / visibleH;
    const areaAspect = aw / ah;
    if (displayAspect > areaAspect) {
      // Limitado pela largura
      boxW = aw;
      boxH = aw / displayAspect;
    } else {
      // Limitado pela altura
      boxH = ah;
      boxW = ah * displayAspect;
    }
  }

  // Escala para encaixar a area do crop (pos-rotacao) no box
  const scale = visibleW > 0 && boxW > 0 ? boxW / visibleW : 0;

  // Dimensoes da imagem completa escalada
  const imgW = imageWidth * scale;
  const imgH = imageHeight * scale;

  // Centro do crop em coordenadas escaladas
  const cropCenterScaledX = (cropX + cropW / 2) * scale;
  const cropCenterScaledY = (cropY + cropH / 2) * scale;

  // Posicionar imagem para que o centro do crop fique no centro do box
  const imgLeft = boxW / 2 - cropCenterScaledX;
  const imgTop = boxH / 2 - cropCenterScaledY;

  // Transform origin no centro do crop (porcentagem da imagem)
  const originXPct = imageWidth > 0 ? ((cropX + cropW / 2) / imageWidth) * 100 : 50;
  const originYPct = imageHeight > 0 ? ((cropY + cropH / 2) / imageHeight) * 100 : 50;

  // Construir transforms
  const totalRotation = cropSettings.rotation90 + cropSettings.fineAngle;
  const transforms: any[] = [];
  if (totalRotation !== 0) transforms.push({ rotate: `${totalRotation}deg` });
  if (cropSettings.flipH) transforms.push({ scaleX: -1 });
  if (cropSettings.flipV) transforms.push({ scaleY: -1 });
  if (cropSettings.imageScale !== 1) transforms.push({ scale: cropSettings.imageScale });

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}
      onLayout={handleAreaLayout}
    >
      {boxW > 0 && boxH > 0 && (
        <View style={{ width: boxW, height: boxH, overflow: 'hidden' }}>
          <Image
            key={`${imageUri}_${totalRotation}_${cropSettings.flipH}_${cropSettings.flipV}`}
            source={{ uri: imageUri }}
            style={{
              position: 'absolute',
              width: imgW,
              height: imgH,
              left: imgLeft,
              top: imgTop,
              // @ts-ignore
              transformOrigin: `${originXPct}% ${originYPct}%`,
              transform: transforms.length > 0 ? transforms : undefined,
            }}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
});

// ========================================
// Funcao utilitaria para formatar tempo em ms
// ========================================
const formatTrimTime = (ms: number): string => {
  if (!ms || !isFinite(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ========================================
// Funcao utilitaria para obter dimensoes reais da imagem (EXIF-corrigidas)
// Na web, o browser ja aplica rotacao EXIF ao carregar
// ========================================
const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = uri;
  });
};

// ========================================
// Funcao utilitaria para calcular auto-crop
// Faz a imagem preencher a area visivel da tela
// ========================================
const computeAutoCropSettings = (realW: number, realH: number): CropSettings => {
  if (realW > 0 && realH > 0) {
    const { width: screenW, height: screenH } = Dimensions.get('window');
    const displayW = screenW;
    const displayH = screenH - 105; // imageArea tem bottom: 105
    const displayAspect = displayW / displayH;
    const photoAspect = realW / realH;
    if (Math.abs(photoAspect - displayAspect) > 0.01) {
      if (photoAspect > displayAspect) {
        // Foto mais larga que a tela - cortar lados
        const cropWidth = displayAspect / photoAspect;
        return {
          ...DEFAULT_CROP_SETTINGS,
          cropRect: { x: (1 - cropWidth) / 2, y: 0, width: cropWidth, height: 1 },
        };
      } else {
        // Foto mais alta que a tela - cortar topo/base
        const cropHeight = photoAspect / displayAspect;
        return {
          ...DEFAULT_CROP_SETTINGS,
          cropRect: { x: 0, y: (1 - cropHeight) / 2, width: 1, height: cropHeight },
        };
      }
    }
  }
  return DEFAULT_CROP_SETTINGS;
};

// ========================================
// Componente Principal PhotoEditorScreen
// ========================================
const PhotoEditorScreen: React.FC<PhotoEditorScreenProps> = ({
  visible,
  photoUri,
  photoWidth,
  photoHeight,
  initialMediaType,
  initialDuration,
  initialThumbnail,
  initialFileSize,
  leadName,
  onClose,
  onSend,
  onOpenCamera,
}) => {
  console.log('🔴 [EDITOR_DEBUG] PhotoEditorScreen RENDER - visible:', visible, 'photoUri:', photoUri?.substring(0, 50));

  // ========================================
  // Estados do Editor
  // ========================================
  const [activeMode, setActiveMode] = useState<EditorMode>('none');
  const [isHD, setIsHD] = useState(false);
  const [viewOnce, setViewOnce] = useState(false);

  // ========================================
  // Estados de Multiplas Midias
  // ========================================
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);

  // ========================================
  // Estados de Video (trim, audio)
  // ========================================
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(0);
  const [videoAudioEnabled, setVideoAudioEnabled] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPositionMs, setVideoPositionMs] = useState(0);
  const [isDraggingTrim, setIsDraggingTrim] = useState(false);
  const htmlVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<View>(null);
  const trimStartRef = useRef(0);
  const trimEndRef = useRef(0);
  trimStartRef.current = videoTrimStart;
  trimEndRef.current = videoTrimEnd;

  // ========================================
  // Detectar se midia atual e video
  // ========================================
  const currentMedia = mediaItems[currentMediaIndex];
  const isCurrentVideo = currentMedia?.type === 'video';

  // ========================================
  // Estado da Imagem ORIGINAL (NUNCA muda apos ser definida)
  // Usada para passar ao modal de crop (permite voltar atras)
  // ========================================
  const [originalPhotoUri, setOriginalPhotoUri] = useState(photoUri);
  const [originalPhotoWidth, setOriginalPhotoWidth] = useState(photoWidth);
  const [originalPhotoHeight, setOriginalPhotoHeight] = useState(photoHeight);

  // ========================================
  // Estado da Imagem Atual (pode mudar apos crop - para exibicao)
  // ========================================
  const [currentPhotoUri, setCurrentPhotoUri] = useState(photoUri);
  const [currentPhotoWidth, setCurrentPhotoWidth] = useState(photoWidth);
  const [currentPhotoHeight, setCurrentPhotoHeight] = useState(photoHeight);

  // Log de dimensoes da imagem
  console.log('📐 [PhotoEditorScreen] Image ORIGINAL:', { width: originalPhotoWidth, height: originalPhotoHeight });
  console.log('📐 [PhotoEditorScreen] Image CURRENT:', { width: currentPhotoWidth, height: currentPhotoHeight });

  // ========================================
  // Estado do Modal de Edicao
  // ========================================
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  // ========================================
  // Estados da Legenda
  // ========================================
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  // ========================================
  // Estado do Modal de Descartar
  // ========================================
  const [discardModalVisible, setDiscardModalVisible] = useState(false);

  // ========================================
  // Estado da Altura do Footer (para posicionar lixeira)
  // ========================================
  const [footerHeight, setFooterHeight] = useState(124);

  // ========================================
  // Estados de Desenho
  // ========================================
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(DrawingStrokeWidths[1]);
  const { elements, addElement, updateElement, deleteElement, undo, clear, canUndo, hasElements } = useDrawingElements();

  // ========================================
  // Estados de Transformacao da Imagem (legado - manter para compatibilidade)
  // ========================================
  const [rotation, setRotation] = useState(0);      //......Rotacao (0, 90, 180, 270)
  const [fineAngle, setFineAngle] = useState(0);    //......Ajuste fino (-45 a +45)
  const [flipH, setFlipH] = useState(false);        //......Espelhado horizontal
  const [flipV, setFlipV] = useState(false);        //......Espelhado vertical
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);  //......Modal unificado crop

  // ========================================
  // Estado de Crop Nao-Destrutivo
  // Imagem original NUNCA muda, apenas as configuracoes de crop
  // ========================================
  const [cropSettings, setCropSettings] = useState<CropSettings>(DEFAULT_CROP_SETTINGS);

  // ========================================
  // Sincronizar estado com props quando mudarem
  // IMPORTANTE: Limpar TODOS os estados de edicao quando uma nova midia e carregada
  // ========================================
  useEffect(() => {
    const isVideo = initialMediaType === 'video';
    console.log('📷 [PhotoEditorScreen] Nova midia carregada - tipo:', isVideo ? 'video' : 'photo', '- limpando estados de edicao');

    // Definir imagem ORIGINAL provisoriamente (pode ser corrigida pelo Image loader)
    setOriginalPhotoUri(photoUri);
    setOriginalPhotoWidth(photoWidth);
    setOriginalPhotoHeight(photoHeight);

    // Definir imagem atual (para exibicao)
    setCurrentPhotoUri(photoUri);
    setCurrentPhotoWidth(photoWidth);
    setCurrentPhotoHeight(photoHeight);

    // Inicializar array de midias com a midia inicial (foto ou video)
    const initialMedia: MediaItem = isVideo ? {
      id: `video_${Date.now()}`,
      uri: photoUri,
      type: 'video',
      width: photoWidth,
      height: photoHeight,
      caption: '',
      duration: initialDuration,
      thumbnail: initialThumbnail,
      fileSize: initialFileSize,
      audioEnabled: true,
    } : {
      id: `photo_${Date.now()}`,
      uri: photoUri,
      type: 'photo',
      width: photoWidth,
      height: photoHeight,
      caption: '',
      elements: [],
      viewOnce: false,
    };
    setMediaItems([initialMedia]);
    setCurrentMediaIndex(0);

    // Limpar TODOS os estados de edicao para comecar do zero
    setCaption('');
    setIsSending(false);
    setDiscardModalVisible(false);
    setActiveMode('none');
    setIsHD(false);
    setViewOnce(false);
    setSelectedColor('#FFFFFF');
    setIsEditingModalOpen(false);
    setSelectedElementId(null);
    setModalImageBounds(null);
    setCameraModalVisible(false);
    setRotation(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setIsCropModalOpen(false);

    // Para videos, nao precisamos detectar EXIF nem fazer auto-crop
    if (isVideo) {
      setCropSettings(DEFAULT_CROP_SETTINGS);
      clear();
      return;
    }

    // Na web, detectar dimensoes reais da imagem (considerando EXIF/orientacao)
    // Isso garante que as dimensoes usadas para crop correspondam ao que o navegador renderiza
    if (Platform.OS === 'web' && photoUri) {
      const img = new window.Image();
      img.onload = () => {
        const realW = img.naturalWidth;
        const realH = img.naturalHeight;
        console.log('📷 [PhotoEditorScreen] Dimensoes reais da imagem:', realW, 'x', realH, '(camera reportou:', photoWidth, 'x', photoHeight, ')');

        // Se as dimensoes reais diferem das reportadas (EXIF rotation), corrigir
        if (realW !== photoWidth || realH !== photoHeight) {
          console.log('📷 [PhotoEditorScreen] EXIF detectado! Corrigindo dimensoes para', realW, 'x', realH);
          setOriginalPhotoWidth(realW);
          setOriginalPhotoHeight(realH);
          setCurrentPhotoWidth(realW);
          setCurrentPhotoHeight(realH);
        }

        // Auto-crop com dimensoes reais
        setCropSettings(computeAutoCropSettings(realW, realH));
      };
      img.onerror = () => {
        console.warn('📷 [PhotoEditorScreen] Erro ao carregar imagem, usando dimensoes da camera');
        setCropSettings(computeAutoCropSettings(photoWidth, photoHeight));
      };
      img.src = photoUri;
    } else {
      // Plataforma nativa - usar dimensoes reportadas pela camera
      setCropSettings(computeAutoCropSettings(photoWidth, photoHeight));
    }

    clear();
  }, [photoUri, photoWidth, photoHeight, initialMediaType, initialDuration, initialThumbnail, initialFileSize, clear]);

  // ========================================
  // Debug: Monitorar Mudancas nos Elementos
  // ========================================
  useEffect(() => {
    console.log('🟢 [PhotoEditorScreen] ELEMENTOS MUDARAM:', elements.length);
    console.log('🟢 [PhotoEditorScreen] IDs:', elements.map(e => `${e.category}:${e.id.substring(0, 10)}`));
  }, [elements]);

  // ========================================
  // Estado de Selecao de Elementos
  // ========================================
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // ========================================
  // Animacao do Botao Lixeira Flutuante
  // ========================================
  const trashOpacity = useRef(new Animated.Value(0)).current;

  // ========================================
  // Efeito: Animar Lixeira Quando Sticker Selecionado
  // ========================================
  useEffect(() => {
    const isSticker = selectedElementId && elements.find(e => e.id === selectedElementId)?.category === 'sticker';
    Animated.timing(trashOpacity, {
      toValue: isSticker ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedElementId, elements, trashOpacity]);

  // ========================================
  // Estados das Categorias de Desenho
  // ========================================
  const [activeCategory, setActiveCategory] = useState<DrawingCategory>('freedraw');
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptionsState>(DEFAULT_CATEGORY_OPTIONS);

  // ========================================
  // Estados do Modal de Texto
  // ========================================
  const [textModalVisible, setTextModalVisible] = useState(false);

  // ========================================
  // Estado dos Limites da Imagem
  // ========================================
  const [imageBounds, setImageBounds] = useState({ x: 0, y: 0, width: 400, height: 600 });

  // ========================================
  // Bounds do Modal (para persistencia de posicao)
  // ========================================
  const [modalImageBounds, setModalImageBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // ========================================
  // Funcao de Export do Canvas
  // ========================================
  const [exportCanvasFn, setExportCanvasFn] = useState<(() => Promise<string>) | null>(null);

  // ========================================
  // Handler: Limites da Imagem Mudaram
  // Salva os bounds para uso no overlay
  // ========================================
  const handleImageBoundsChange = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    setImageBounds(bounds);
    // Sempre salvar como modalImageBounds quando no modal de edicao
    setModalImageBounds(bounds);
    console.log('📷 [PhotoEditorScreen] Image bounds atualizado:', bounds);
  }, []);

  // ========================================
  // Handler: Receber Funcao de Export do Canvas
  // ========================================
  const handleExportCanvas = useCallback((exportFn: () => Promise<string>) => {
    setExportCanvasFn(() => exportFn);
  }, []);

  // ========================================
  // Funcao: Aplicar Crop na Imagem (Canvas)
  // Usada no momento do envio para aplicar crop definitivo
  // Processa: rotation90, fineAngle, flipH, flipV, crop
  // ========================================
  const applyCropToImage = useCallback(async (
    imageUri: string,
    imgWidth: number,
    imgHeight: number,
    settings: CropSettings
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calcular dimensoes da area de crop na imagem original
        const cropX = settings.cropRect.x * imgWidth;
        const cropY = settings.cropRect.y * imgHeight;
        const cropW = settings.cropRect.width * imgWidth;
        const cropH = settings.cropRect.height * imgHeight;

        // Rotacao total em graus
        const totalRotation = settings.rotation90 + settings.fineAngle;
        const rotationRad = (totalRotation * Math.PI) / 180;

        // Calcular dimensoes finais considerando rotacao
        // Se rotacao e 90 ou 270, trocar largura/altura
        let outputW = cropW;
        let outputH = cropH;
        if (settings.rotation90 === 90 || settings.rotation90 === 270) {
          outputW = cropH;
          outputH = cropW;
        }

        // Se ha fineAngle, expandir para nao cortar cantos
        if (settings.fineAngle !== 0) {
          const fineRad = Math.abs(settings.fineAngle * Math.PI / 180);
          const cos = Math.cos(fineRad);
          const sin = Math.sin(fineRad);
          const expandedW = Math.ceil(outputW * cos + outputH * sin);
          const expandedH = Math.ceil(outputH * cos + outputW * sin);
          outputW = expandedW;
          outputH = expandedH;
        }

        // Criar canvas com dimensoes finais
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(outputW);
        canvas.height = Math.round(outputH);
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('Canvas context failed'); return; }

        // Fundo preto para bordas se houver rotacao
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mover origem para centro do canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Aplicar rotacao total
        ctx.rotate(rotationRad);

        // Aplicar flips
        ctx.scale(
          settings.flipH ? -1 : 1,
          settings.flipV ? -1 : 1
        );

        // Aplicar escala (imageScale)
        ctx.scale(settings.imageScale, settings.imageScale);

        // Desenhar area cortada centralizada
        ctx.drawImage(
          img,
          cropX, cropY, cropW, cropH,
          -cropW / 2, -cropH / 2, cropW, cropH
        );

        console.log('📷 [applyCropToImage] Processado:', {
          input: { width: imgWidth, height: imgHeight },
          crop: { x: cropX, y: cropY, w: cropW, h: cropH },
          rotation: { r90: settings.rotation90, fine: settings.fineAngle, total: totalRotation },
          flip: { h: settings.flipH, v: settings.flipV },
          output: { width: canvas.width, height: canvas.height },
        });

        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => reject('Failed to load image');
      img.src = imageUri;
    });
  }, []);

  // ========================================
  // Handler: Enviar Foto
  // Se houver crop ou elementos, renderiza imagem final antes de enviar
  // ========================================
  const handleSend = useCallback(async () => {
    if (isSending) return;
    console.log('📷 [PhotoEditorScreen] ========================================');
    console.log('📷 [PhotoEditorScreen] INICIO: handleSend - Processando', mediaItems.length, 'itens');
    console.log('🔒 [VIEW_ONCE] Estado viewOnce no handleSend:', viewOnce, '(tipo:', typeof viewOnce, ')');
    console.log('📷 [PhotoEditorScreen] ========================================');
    setIsSending(true);

    // Salvar edicoes da midia atual no array
    const allItems = [...mediaItems];
    if (allItems[currentMediaIndex]) {
      allItems[currentMediaIndex] = {
        ...allItems[currentMediaIndex],
        caption,
        elements: [...elements],
        viewOnce,
        rotation,
        fineAngle,
        flipH,
        flipV,
        trimStart: videoTrimStart,
        trimEnd: videoTrimEnd,
        audioEnabled: videoAudioEnabled,
      };
    }

    // Processar TODAS as midias
    const processedItems: { uri: string; type: 'photo' | 'video'; width: number; height: number; caption?: string; viewOnce?: boolean }[] = [];

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      console.log('📷 [PhotoEditorScreen] Processando item', i, ':', item.type, item.width, 'x', item.height);

      if (item.type === 'video') {
        // Video: enviar como esta (sendImageMessage detecta video automaticamente)
        processedItems.push({
          uri: item.uri,
          type: 'video',
          width: item.width,
          height: item.height,
          caption: item.caption,
          viewOnce: item.viewOnce,
        });
        continue;
      }

      // === FOTO: processar crop/elementos e obter dimensoes corretas ===
      let finalUri = item.uri;

      if (Platform.OS === 'web') {
        // Obter dimensoes reais (EXIF-corrigidas pelo browser)
        const realDims = await getImageDimensions(item.uri);
        const realW = realDims.width || item.width;
        const realH = realDims.height || item.height;
        console.log('📷 [PhotoEditorScreen] Item', i, 'dimensoes reais:', realW, 'x', realH);

        if (i === currentMediaIndex) {
          // Item ATUAL: usar cropSettings e elementos do estado corrente
          if (hasElements && exportCanvasFn) {
            try {
              console.log('📷 [PhotoEditorScreen] Item', i, '- Exportando canvas com elementos...');
              finalUri = await exportCanvasFn();
            } catch (e) {
              console.error('📷 [PhotoEditorScreen] Erro ao exportar canvas:', e);
            }
          } else {
            // Verificar crop/transform no cropSettings atual
            const hasCrop = cropSettings.cropRect.width < 0.99 ||
                            cropSettings.cropRect.height < 0.99 ||
                            cropSettings.cropRect.x > 0.01 ||
                            cropSettings.cropRect.y > 0.01;
            const hasTransform = cropSettings.rotation90 !== 0 ||
                                 cropSettings.fineAngle !== 0 ||
                                 cropSettings.flipH ||
                                 cropSettings.flipV;
            if (hasCrop || hasTransform) {
              try {
                console.log('📷 [PhotoEditorScreen] Item', i, '- Aplicando crop/transform...');
                finalUri = await applyCropToImage(originalPhotoUri, originalPhotoWidth, originalPhotoHeight, cropSettings);
              } catch (e) {
                console.error('📷 [PhotoEditorScreen] Erro ao aplicar crop:', e);
              }
            }
          }
        } else {
          // Item NAO-ATUAL: aplicar auto-crop (preencher tela)
          const autoCrop = computeAutoCropSettings(realW, realH);
          const hasAutoCrop = autoCrop.cropRect.width < 0.99 ||
                              autoCrop.cropRect.height < 0.99 ||
                              autoCrop.cropRect.x > 0.01 ||
                              autoCrop.cropRect.y > 0.01;
          if (hasAutoCrop) {
            try {
              console.log('📷 [PhotoEditorScreen] Item', i, '- Aplicando auto-crop...');
              finalUri = await applyCropToImage(item.uri, realW, realH, autoCrop);
            } catch (e) {
              console.error('📷 [PhotoEditorScreen] Erro ao aplicar auto-crop:', e);
            }
          }
        }

        // Obter dimensoes FINAIS da imagem processada (sempre corretas)
        const finalDims = await getImageDimensions(finalUri);
        const finalW = finalDims.width || realW;
        const finalH = finalDims.height || realH;
        console.log('📷 [PhotoEditorScreen] Item', i, 'dimensoes finais:', finalW, 'x', finalH);

        processedItems.push({
          uri: finalUri,
          type: 'photo',
          width: finalW,
          height: finalH,
          caption: item.caption,
          viewOnce: item.viewOnce,
        });
      } else {
        // Plataforma nativa: usar dimensoes reportadas
        processedItems.push({
          uri: item.uri,
          type: 'photo',
          width: item.width,
          height: item.height,
          caption: item.caption,
          viewOnce: item.viewOnce,
        });
      }
    }

    console.log('📷 [PhotoEditorScreen] Enviando', processedItems.length, 'itens processados');
    console.log('🔒 [VIEW_ONCE] processedItems viewOnce:', processedItems.map((it, idx) => `item[${idx}].viewOnce=${it.viewOnce} (tipo: ${typeof it.viewOnce})`));
    onSend(processedItems);

    // Limpar TODOS os estados de edicao apos enviar
    setCaption('');
    setIsSending(false);
    setActiveMode('none');
    setIsHD(false);
    setViewOnce(false);
    setSelectedColor('#FFFFFF');
    setIsEditingModalOpen(false);
    setSelectedElementId(null);
    setModalImageBounds(null);
    setMediaItems([]);
    setCurrentMediaIndex(0);
    setCameraModalVisible(false);
    setRotation(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setIsCropModalOpen(false);
    setCropSettings(DEFAULT_CROP_SETTINGS);
    clear();

    console.log('📷 [PhotoEditorScreen] ========================================');
    console.log('📷 [PhotoEditorScreen] FIM: handleSend');
    console.log('📷 [PhotoEditorScreen] ========================================');
  }, [isSending, caption, isHD, viewOnce, onSend, hasElements, exportCanvasFn, clear, mediaItems, currentMediaIndex, elements, fineAngle, rotation, flipH, flipV, cropSettings, originalPhotoUri, originalPhotoWidth, originalPhotoHeight, applyCropToImage, videoTrimStart, videoTrimEnd, videoAudioEnabled]);

  // ========================================
  // Detectar se houve alteracoes (incluindo crop)
  // NAO-DESTRUTIVO: Todas transformacoes contam como mudancas
  // ========================================
  const hasCropChanges = cropSettings.cropRect.width < 0.99 ||
                         cropSettings.cropRect.height < 0.99 ||
                         cropSettings.cropRect.x > 0.01 ||
                         cropSettings.cropRect.y > 0.01 ||
                         cropSettings.rotation90 !== 0 ||
                         cropSettings.fineAngle !== 0 ||
                         cropSettings.flipH ||
                         cropSettings.flipV;
  const hasChanges = hasElements || caption.trim().length > 0 || hasCropChanges;

  // ========================================
  // Handler: Confirmar Descarte
  // NOTA: Definido antes de handleCloseAttempt que depende dele
  // ========================================
  const handleDiscardConfirm = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Descarte confirmado - fechando editor...');
    setDiscardModalVisible(false);
    setCaption('');
    setIsSending(false);
    setActiveMode('none');
    setIsHD(false);
    setViewOnce(false);
    setSelectedColor('#FFFFFF');
    setIsEditingModalOpen(false);
    setSelectedElementId(null);
    setMediaItems([]);
    setCurrentMediaIndex(0);
    setCameraModalVisible(false);
    clear();
    onClose();
  }, [onClose, clear]);

  // ========================================
  // Handler: Tentar Fechar (verifica alteracoes)
  // ========================================
  const handleCloseAttempt = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Tentando fechar - hasChanges:', hasChanges);
    if (hasChanges) {
      setDiscardModalVisible(true);
    } else {
      handleDiscardConfirm();
    }
  }, [hasChanges, handleDiscardConfirm]);

  // ========================================
  // Handler: Cancelar Descarte
  // ========================================
  const handleDiscardCancel = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Descarte cancelado');
    setDiscardModalVisible(false);
  }, []);

  // ========================================
  // Handler: Mudanca de Cor
  // Se forma selecionada: edita a forma
  // Se nenhuma selecionada: configura para proxima
  // ========================================
  const handleColorChange = useCallback((color: string) => {
    console.log('📷 [PhotoEditorScreen] Cor selecionada:', color);
    setSelectedColor(color);

    // Se ha forma selecionada, atualizar a cor dela
    if (selectedElementId) {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && (selectedElement.category === 'shape' || selectedElement.category === 'arrow' || selectedElement.category === 'freedraw' || selectedElement.category === 'highlighter' || selectedElement.category === 'text')) {
        const updatedElement = { ...selectedElement, color };
        updateElement(updatedElement, true);
      }
    }
  }, [selectedElementId, elements, updateElement]);

  // ========================================
  // Handler: Elemento Completo
  // ========================================
  const handleElementComplete = useCallback((element: AnyDrawElement) => {
    console.log('📷 [PhotoEditorScreen] Elemento completo:', element.category);
    addElement(element);
  }, [addElement]);

  // ========================================
  // Handler: Elemento Atualizado (mover/redimensionar)
  // addToHistory=false durante o arraste, true no final
  // ========================================
  const handleElementUpdate = useCallback((element: AnyDrawElement, addToHistory?: boolean) => {
    updateElement(element, addToHistory);
  }, [updateElement]);

  // ========================================
  // Handler: Selecionar Elemento
  // ========================================
  const handleSelectElement = useCallback((elementId: string | null) => {
    console.log('📷 [PhotoEditorScreen] Elemento selecionado:', elementId);
    setSelectedElementId(elementId);
  }, []);

  // ========================================
  // Handler: Desfazer Desenho
  // ========================================
  const handleUndo = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Desfazendo desenho...');
    undo();
  }, [undo]);

  // ========================================
  // Handler: Excluir Forma Selecionada
  // ========================================
  const handleDeleteSelected = useCallback(() => {
    if (selectedElementId) {
      console.log('📷 [PhotoEditorScreen] Excluindo forma selecionada:', selectedElementId);
      deleteElement(selectedElementId);
      setSelectedElementId(null);
    }
  }, [selectedElementId, deleteElement]);

  // ========================================
  // Handler: Limpar Todos os Desenhos
  // ========================================
  const handleClearAll = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Limpando todos os desenhos...');
    clear();
    setSelectedElementId(null);
  }, [clear]);

  // ========================================
  // Handler: Mudanca de Categoria
  // ========================================
  const handleCategoryChange = useCallback((category: DrawingCategory) => {
    console.log('📷 [PhotoEditorScreen] Categoria selecionada:', category);
    setActiveCategory(category);

    // Ajustar espessura e cor padrao por categoria
    switch (category) {
      case 'highlighter':
        setCurrentStrokeWidth(HighlighterStrokeWidths[1]);
        setSelectedColor('#FFCC00');
        break;
      case 'blur':
        setCurrentStrokeWidth(BlurStrokeWidths[1]);
        break;
      case 'freedraw':
      case 'shape':
      case 'arrow':
        setCurrentStrokeWidth(DrawingStrokeWidths[1]);
        break;
      default:
        break;
    }
  }, []);

  // ========================================
  // Handler: Mudanca de Opcoes
  // Se forma selecionada: edita a forma
  // Se nenhuma selecionada: configura para proxima
  // ========================================
  const handleOptionsChange = useCallback(<K extends DrawingCategory>(
    category: K,
    options: CategoryOptionsState[K]
  ) => {
    console.log('📷 [PhotoEditorScreen] Opcoes alteradas:', category, options);
    setCategoryOptions(prev => ({
      ...prev,
      [category]: options,
    }));

    // Se ha forma selecionada e a categoria eh shape, atualizar tipo/preenchimento
    if (selectedElementId && category === 'shape') {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.category === 'shape') {
        const shapeOptions = options as CategoryOptionsState['shape'];
        const updatedElement: ShapeElement = {
          ...(selectedElement as ShapeElement),
          shapeType: shapeOptions.shapeType,
          filled: shapeOptions.filled,
        };
        updateElement(updatedElement, true);
      }
    }

    // Se ha blur selecionado e a categoria eh blur, atualizar blurType em tempo real
    if (selectedElementId && category === 'blur') {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.category === 'blur') {
        const blurOptions = options as CategoryOptionsState['blur'];
        const updatedElement: BlurElement = {
          ...(selectedElement as BlurElement),
          blurType: blurOptions.blurType,
        };
        updateElement(updatedElement, true);
      }
    }

    // Se ha texto selecionado e a categoria eh text, atualizar fontSize/bold/fontFamily/uppercase em tempo real
    if (selectedElementId && category === 'text') {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.category === 'text') {
        const textOptions = options as CategoryOptionsState['text'];
        const updatedElement: TextElement = {
          ...(selectedElement as TextElement),
          fontSize: textOptions.fontSize,
          fontFamily: textOptions.fontFamily,
          bold: textOptions.bold,
          uppercase: textOptions.uppercase,
        };
        updateElement(updatedElement, true);
      }
    }
  }, [selectedElementId, elements, updateElement]);

  // ========================================
  // Handler: Mudanca de Espessura
  // Se forma selecionada: edita a forma
  // Se nenhuma selecionada: configura para proxima
  // ========================================
  const handleStrokeWidthChange = useCallback((width: number) => {
    console.log('📷 [PhotoEditorScreen] Espessura alterada:', width);
    setCurrentStrokeWidth(width);

    // Se ha forma selecionada, atualizar a espessura dela
    if (selectedElementId) {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && (selectedElement.category === 'shape' || selectedElement.category === 'arrow' || selectedElement.category === 'freedraw' || selectedElement.category === 'highlighter' || selectedElement.category === 'blur')) {
        const updatedElement = { ...selectedElement, strokeWidth: width };
        updateElement(updatedElement, true);
      }
    }
  }, [selectedElementId, elements, updateElement]);

  // ========================================
  // Handler: Toggle HD
  // ========================================
  const handleToggleHD = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Toggle HD:', !isHD);
    setIsHD(prev => !prev);
  }, [isHD]);

  // ========================================
  // Handler: Abrir Modal Unificado de Crop
  // ========================================
  const handleOpenCropModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Abrindo modal unificado de crop');
    setIsCropModalOpen(true);
  }, []);

  // ========================================
  // Handler: Fechar Modal de Crop (cancelar)
  // ========================================
  const handleCloseCropModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Fechando modal de crop (cancelado)');
    setIsCropModalOpen(false);
  }, []);

  // ========================================
  // Handler: Aplicar Resultado do Crop (NAO-DESTRUTIVO)
  // Apenas salva settings - NAO processa imagem
  // Imagem original NUNCA e alterada
  // Preview e aplicado via CSS na tela principal
  // ========================================
  const handleApplyCrop = useCallback((result: CropSettingsResult) => {
    console.log('🔍 [handleApplyCrop] ========== CROP APLICADO ==========');
    console.log('🔍 [handleApplyCrop] result.settings:', JSON.stringify(result.settings, null, 2));
    console.log('🔍 [handleApplyCrop] result.processedImageUri:', result.processedImageUri ? 'SIM (tem)' : 'NAO');
    console.log('🔍 [handleApplyCrop] result.processedWidth:', result.processedWidth);
    console.log('🔍 [handleApplyCrop] result.processedHeight:', result.processedHeight);

    // Verificar se foi reset (todos settings zerados)
    const isReset = result.settings.rotation90 === 0 &&
                    result.settings.fineAngle === 0 &&
                    !result.settings.flipH &&
                    !result.settings.flipV &&
                    result.settings.cropRect.width >= 0.99 &&
                    result.settings.cropRect.height >= 0.99;

    console.log('🔍 [handleApplyCrop] isReset:', isReset);

    if (isReset) {
      console.log('🔍 [handleApplyCrop] >>> RESET detectado - zerando settings para DEFAULT');
      setCropSettings(DEFAULT_CROP_SETTINGS);
    } else {
      console.log('🔍 [handleApplyCrop] >>> Salvando crop settings');
      setCropSettings(result.settings);
    }

    // Fechar modal
    console.log('🔍 [handleApplyCrop] Fechando modal de crop');
    setIsCropModalOpen(false);

    // Limpar elementos de desenho (posicoes invalidadas pelo crop)
    console.log('🔍 [handleApplyCrop] Limpando elementos e modalImageBounds');
    clear();
    setModalImageBounds(null);
    console.log('🔍 [handleApplyCrop] ========== FIM ==========');
  }, [clear]);

  // ========================================
  // Handler: Mudar Modo (abre modal de edicao se drawing)
  // ========================================
  const handleModeChange = useCallback((mode: EditorMode) => {
    console.log('📷 [PhotoEditorScreen] Mudando modo para:', mode);
    setActiveMode(mode);

    // Abrir modal de edicao quando modo for drawing
    if (mode === 'drawing') {
      setIsEditingModalOpen(true);
    }
  }, []);

  // ========================================
  // Handler: Fechar Modal de Edicao (botao OK)
  // ========================================
  const handleCloseEditingModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Fechando modal de edicao, modalImageBounds:', modalImageBounds);
    setIsEditingModalOpen(false);
    setActiveMode('none');
    setSelectedElementId(null);
  }, [modalImageBounds]);

  // ========================================
  // Handler: Toggle View Once
  // ========================================
  const handleToggleViewOnce = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Toggle View Once:', !viewOnce);
    setViewOnce(prev => !prev);
  }, [viewOnce]);

  // ========================================
  // Handler: Altura do Footer Mudou
  // Usado para posicionar botao lixeira flutuante
  // ========================================
  const handleFooterHeightChange = useCallback((height: number) => {
    setFooterHeight(height);
  }, []);

  // ========================================
  // Handler: Abrir Modal de Texto
  // ========================================
  const handleOpenTextModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Abrindo modal de texto...');
    setTextModalVisible(true);
  }, []);

  // ========================================
  // Handler: Fechar Modal de Texto
  // ========================================
  const handleCloseTextModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Fechando modal de texto...');
    setTextModalVisible(false);
  }, []);

  // ========================================
  // Handler: Confirmar Texto
  // ========================================
  const handleConfirmText = useCallback((text: string, fontFamily: string, uppercase: boolean) => {
    console.log('📷 [PhotoEditorScreen] Texto confirmado:', text, 'Fonte:', fontFamily, 'Maiusculo:', uppercase);

    // Posicao inicial do texto no centro da imagem
    const textPosition: Point2D = {
      x: imageBounds.x + imageBounds.width / 2,
      y: imageBounds.y + imageBounds.height / 3,
    };

    const textElement: TextElement = {
      id: generateElementId(),
      category: 'text',
      text: text,
      fontSize: categoryOptions.text.fontSize,
      fontFamily: fontFamily,
      bold: categoryOptions.text.bold,
      uppercase: uppercase,
      style: categoryOptions.text.style,
      color: selectedColor,
      strokeWidth: 0,
      opacity: 1,
      position: textPosition,
      rotation: 0,
      timestamp: Date.now(),
    };

    addElement(textElement);
    setTextModalVisible(false);
  }, [imageBounds, categoryOptions.text, selectedColor, addElement]);

  // ========================================
  // Handler: Selecionar Emoji (insere no canvas)
  // ========================================
  const handleSelectEmoji = useCallback((emoji: string) => {
    console.log('🎯 [PhotoEditorScreen] handleSelectEmoji CHAMADO');
    console.log('🎯 [PhotoEditorScreen] Emoji:', emoji);

    // Offset aleatorio para nao empilhar elementos
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    // Posicao inicial do emoji no centro da imagem com offset
    const emojiPosition: Point2D = {
      x: imageBounds.x + imageBounds.width / 2 + offsetX,
      y: imageBounds.y + imageBounds.height / 2 + offsetY,
    };

    const elementId = generateElementId();
    const emojiElement: StickerElement = {
      id: elementId,
      category: 'sticker',
      stickerId: `emoji_${Date.now()}`,
      emoji: emoji,
      position: emojiPosition,
      scale: 1.2,
      rotation: 0,
      color: '#000000',
      strokeWidth: 0,
      opacity: 1,
      timestamp: Date.now(),
    };

    addElement(emojiElement);
    setActiveMode('none');
    // Selecionar o elemento para manipulacao direta na tela principal
    setSelectedElementId(elementId);
  }, [imageBounds, addElement]);

  // ========================================
  // Handler: Selecionar Sticker (insere no canvas)
  // Recebe URL da imagem (local ou remota)
  // ========================================
  const handleSelectSticker = useCallback((stickerUrl: string) => {
    console.log('🎯 [PhotoEditorScreen] handleSelectSticker CHAMADO');
    console.log('🎯 [PhotoEditorScreen] Sticker URL:', stickerUrl);

    // Offset aleatorio para nao empilhar elementos
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;

    // Posicao inicial do sticker no centro da imagem com offset
    const stickerPosition: Point2D = {
      x: imageBounds.x + imageBounds.width / 2 + offsetX,
      y: imageBounds.y + imageBounds.height / 2 + offsetY,
    };

    const elementId = generateElementId();
    const stickerElement: StickerElement = {
      id: elementId,
      category: 'sticker',
      stickerId: `sticker_${Date.now()}`,
      emoji: stickerUrl,
      position: stickerPosition,
      scale: 1.8,
      rotation: 0,
      color: '#000000',
      strokeWidth: 0,
      opacity: 1,
      timestamp: Date.now(),
    };

    // Adicionar imediatamente - o canvas carrega a imagem de forma assincrona
    addElement(stickerElement);
    setActiveMode('none');
    // Selecionar o elemento para manipulacao direta na tela principal
    setSelectedElementId(elementId);
  }, [imageBounds, addElement]);

  // ========================================
  // Handler: Fechar Painel de Stickers
  // ========================================
  const handleCloseStickerPanel = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Fechando painel de stickers...');
    setActiveMode('none');
  }, []);

  // ========================================
  // Handler: Salvar Edicoes da Midia Atual
  // ========================================
  const saveCurrentMediaEdits = useCallback(() => {
    if (mediaItems.length === 0) return;
    console.log('📷 [PhotoEditorScreen] Salvando edicoes da midia:', currentMediaIndex);
    setMediaItems(prev => {
      const updated = [...prev];
      if (updated[currentMediaIndex]) {
        updated[currentMediaIndex] = {
          ...updated[currentMediaIndex],
          caption,
          elements: [...elements],
          viewOnce,
          rotation,
          fineAngle,
          flipH,
          flipV,
          trimStart: videoTrimStart,
          trimEnd: videoTrimEnd,
          audioEnabled: videoAudioEnabled,
        };
      }
      return updated;
    });
  }, [mediaItems, currentMediaIndex, caption, elements, viewOnce, rotation, fineAngle, flipH, flipV, videoTrimStart, videoTrimEnd, videoAudioEnabled]);

  // ========================================
  // Handler: Carregar Edicoes da Midia
  // ========================================
  const loadMediaEdits = useCallback((index: number) => {
    const media = mediaItems[index];
    if (!media) return;
    console.log('📷 [PhotoEditorScreen] Carregando edicoes da midia:', index, 'tipo:', media.type, 'uri:', media.uri?.substring(0, 50));
    // Atualizar URI e dimensoes ORIGINAIS (usadas pelo CroppedImagePreview e WebEditorCanvas)
    setOriginalPhotoUri(media.uri);
    setOriginalPhotoWidth(media.width);
    setOriginalPhotoHeight(media.height);
    // Atualizar URI e dimensoes atuais
    setCurrentPhotoUri(media.uri);
    setCurrentPhotoWidth(media.width);
    setCurrentPhotoHeight(media.height);
    // Aplicar auto-crop para fotos (preencher tela) ou DEFAULT para videos
    if (media.type === 'photo') {
      setCropSettings(computeAutoCropSettings(media.width, media.height));
    } else {
      setCropSettings(DEFAULT_CROP_SETTINGS);
    }
    setModalImageBounds(null);
    setCaption(media.caption || '');
    setViewOnce(media.viewOnce || false);
    setRotation(media.rotation || 0);
    setFineAngle(media.fineAngle || 0);
    setFlipH(media.flipH || false);
    setFlipV(media.flipV || false);
    // Carregar estado de video
    setVideoTrimStart(media.trimStart || 0);
    setVideoTrimEnd(media.trimEnd || media.duration || 0);
    setVideoAudioEnabled(media.audioEnabled !== false);
    // Parar playback ao trocar de midia
    setIsVideoPlaying(false);
    setVideoPositionMs(0);
    if (htmlVideoRef.current) htmlVideoRef.current.pause();
    clear();
    if (media.elements && media.elements.length > 0) {
      media.elements.forEach((el: AnyDrawElement) => addElement(el));
    }
  }, [mediaItems, clear, addElement]);

  // ========================================
  // Handler: Abrir Modal da Camera
  // ========================================
  const handleOpenCameraModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Abrindo modal da camera');
    // Pausar video ao abrir camera
    if (isVideoPlaying && htmlVideoRef.current) {
      htmlVideoRef.current.pause();
      setIsVideoPlaying(false);
    }
    saveCurrentMediaEdits();
    setCameraModalVisible(true);
  }, [saveCurrentMediaEdits, isVideoPlaying]);

  // ========================================
  // Handler: Fechar Modal da Camera
  // ========================================
  const handleCloseCameraModal = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Fechando modal da camera');
    setCameraModalVisible(false);
  }, []);

  // ========================================
  // Handler: Receber Capturas do Modal
  // ========================================
  const handleCameraCapture = useCallback((captures: CapturedMedia[]) => {
    console.log('📷 [PhotoEditorScreen] Recebendo capturas:', captures.length);
    setCameraModalVisible(false);

    if (captures.length === 0) return;

    const newItems: MediaItem[] = captures.map(capture => ({
      id: capture.id,
      uri: capture.uri,
      type: capture.type,
      width: capture.width,
      height: capture.height,
      duration: capture.duration,
      thumbnail: capture.thumbnail,
      fileSize: capture.fileSize,
      caption: '',
      elements: [],
      viewOnce: false,
      trimStart: 0,
      trimEnd: capture.duration || 0,
      audioEnabled: true,
    }));

    setMediaItems(prev => {
      const updated = [...prev, ...newItems];
      const newIndex = updated.length - 1;
      setCurrentMediaIndex(newIndex);
      // Carregar edicoes da ultima midia adicionada
      const lastMedia = updated[newIndex];
      if (lastMedia) {
        // Atualizar URI e dimensoes ORIGINAIS (usadas pelo CroppedImagePreview e WebEditorCanvas)
        setOriginalPhotoUri(lastMedia.uri);
        setOriginalPhotoWidth(lastMedia.width);
        setOriginalPhotoHeight(lastMedia.height);
        // Atualizar URI e dimensoes atuais
        setCurrentPhotoUri(lastMedia.uri);
        setCurrentPhotoWidth(lastMedia.width);
        setCurrentPhotoHeight(lastMedia.height);
        // Aplicar auto-crop para fotos (preencher tela) ou DEFAULT para videos
        if (lastMedia.type === 'photo') {
          setCropSettings(computeAutoCropSettings(lastMedia.width, lastMedia.height));
        } else {
          setCropSettings(DEFAULT_CROP_SETTINGS);
        }
        setModalImageBounds(null);
        setRotation(0);
        setFineAngle(0);
        setFlipH(false);
        setFlipV(false);
        setCaption(lastMedia.caption || '');
        setViewOnce(lastMedia.viewOnce || false);
        // Carregar estado de video se aplicavel
        setVideoTrimStart(lastMedia.trimStart || 0);
        setVideoTrimEnd(lastMedia.trimEnd || lastMedia.duration || 0);
        setVideoAudioEnabled(lastMedia.audioEnabled !== false);
        clear();
      }
      return updated;
    });
  }, [clear]);

  // ========================================
  // Handler: Selecionar Midia no Carrossel
  // ========================================
  const handleSelectMedia = useCallback((index: number) => {
    console.log('📷 [PhotoEditorScreen] Selecionando midia:', index);
    saveCurrentMediaEdits();
    setCurrentMediaIndex(index);
    loadMediaEdits(index);
  }, [saveCurrentMediaEdits, loadMediaEdits]);

  // ========================================
  // Handler: Remover Midia do Carrossel
  // ========================================
  const handleRemoveMedia = useCallback((index: number) => {
    console.log('📷 [PhotoEditorScreen] Removendo midia:', index);
    setMediaItems(prev => {
      const updated = [...prev];
      updated.splice(index, 1);

      if (updated.length === 0) {
        handleDiscardConfirm();
        return [];
      }

      return updated;
    });

    if (currentMediaIndex >= index && currentMediaIndex > 0) {
      const newIndex = currentMediaIndex - 1;
      setCurrentMediaIndex(newIndex);
      loadMediaEdits(newIndex);
    } else if (currentMediaIndex === index) {
      loadMediaEdits(Math.max(0, index - 1));
    }
  }, [currentMediaIndex, loadMediaEdits, handleDiscardConfirm]);

  // ========================================
  // Handler: Adicionar Mais Midias
  // ========================================
  const handleAddMore = useCallback(() => {
    console.log('📷 [PhotoEditorScreen] Adicionar mais midias');
    handleOpenCameraModal();
  }, [handleOpenCameraModal]);

  // ========================================
  // Handler: Mudanca de Trim do Video
  // ========================================
  const handleVideoTrimChange = useCallback((start: number, end: number) => {
    setVideoTrimStart(start);
    setVideoTrimEnd(end);
  }, []);

  // ========================================
  // Handler: Toggle Audio do Video
  // ========================================
  const handleVideoAudioToggle = useCallback(() => {
    setVideoAudioEnabled(prev => !prev);
  }, []);

  // ========================================
  // Handler: Estado de Arraste do Trim
  // ========================================
  const handleTrimDragStateChange = useCallback((dragging: boolean) => {
    setIsDraggingTrim(dragging);
  }, []);

  // ========================================
  // Handler: Play/Pause do Video (HTML5 nativo)
  // ========================================
  const handleVideoPlayPause = useCallback(() => {
    const video = htmlVideoRef.current;
    if (!video) return;
    if (isVideoPlaying) {
      video.pause();
      setIsVideoPlaying(false);
    } else {
      // Se chegou ao fim do trim, volta ao inicio
      const posMs = video.currentTime * 1000;
      if (trimEndRef.current > 0 && posMs >= trimEndRef.current - 200) {
        video.currentTime = trimStartRef.current / 1000;
        setVideoPositionMs(trimStartRef.current);
      }
      video.play().catch(err => console.error('[Video] Play failed:', err));
      setIsVideoPlaying(true);
    }
  }, [isVideoPlaying]);

  // ========================================
  // Effect: Criar/gerenciar elemento HTML5 <video>
  // ========================================
  useEffect(() => {
    if (!isCurrentVideo || Platform.OS !== 'web') {
      // Cleanup se nao e video
      if (htmlVideoRef.current) {
        htmlVideoRef.current.pause();
        htmlVideoRef.current.src = '';
        htmlVideoRef.current = null;
      }
      return;
    }

    const videoUri = currentMedia?.uri;
    if (!videoUri) return;

    // Obter no DOM do container View
    const containerNode = (videoContainerRef.current as unknown) as HTMLDivElement;
    if (!containerNode) return;

    // Remover video existente
    if (htmlVideoRef.current) {
      htmlVideoRef.current.pause();
      htmlVideoRef.current.remove();
      htmlVideoRef.current = null;
    }

    // Criar elemento <video> HTML5 nativo
    const video = document.createElement('video');
    video.src = videoUri;
    video.playsInline = true;
    video.preload = 'auto';
    video.muted = !videoAudioEnabled;
    if (currentMedia?.thumbnail) video.poster = currentMedia.thumbnail;
    Object.assign(video.style, {
      position: 'absolute',
      top: '0', left: '0', width: '100%', height: '100%',
      objectFit: 'cover',
    });

    // Eventos de playback
    video.ontimeupdate = () => {
      const posMs = video.currentTime * 1000;
      setVideoPositionMs(posMs);
      // Verificar trimEnd
      if (trimEndRef.current > 0 && posMs >= trimEndRef.current) {
        video.pause();
        video.currentTime = trimStartRef.current / 1000;
        setIsVideoPlaying(false);
        setVideoPositionMs(trimStartRef.current);
      }
    };

    video.onended = () => {
      video.currentTime = trimStartRef.current / 1000;
      setIsVideoPlaying(false);
      setVideoPositionMs(trimStartRef.current);
    };

    containerNode.appendChild(video);
    htmlVideoRef.current = video;
    setIsVideoPlaying(false);
    setVideoPositionMs(0);

    return () => {
      video.ontimeupdate = null;
      video.onended = null;
      video.pause();
      video.src = '';
      if (containerNode.contains(video)) containerNode.removeChild(video);
      if (htmlVideoRef.current === video) htmlVideoRef.current = null;
    };
  }, [isCurrentVideo, currentMedia?.uri]);

  // ========================================
  // Effect: Sincronizar estado de audio com <video>
  // ========================================
  useEffect(() => {
    if (htmlVideoRef.current) {
      htmlVideoRef.current.muted = !videoAudioEnabled;
    }
  }, [videoAudioEnabled]);

  // ========================================
  // Render: Nao Web
  // ========================================
  if (Platform.OS !== 'web') {
    console.log('🔴 [EDITOR_DEBUG] Platform is NOT web, returning null');
    return null;
  }

  console.log('🔴 [EDITOR_DEBUG] Platform is web, rendering Modal with EditToolbar');

  // ========================================
  // Render: Modal Principal (Visualizacao)
  // ========================================
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleCloseAttempt}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        onLayout={(e) => console.log('📐 [PhotoEditorScreen] container:', { width: Math.round(e.nativeEvent.layout.width), height: Math.round(e.nativeEvent.layout.height) })}
      >
        {/* Area da Midia - foto ou video (ambos preenchem imageArea) */}
        {isCurrentVideo ? (
          /* ======================================== */
          /* MODO VIDEO: Video com play/pause (preenche tela como foto) */
          /* ======================================== */
          <View style={styles.imageArea}>
            {/* Container do video HTML5 nativo (object-fit: cover) */}
            <View ref={videoContainerRef} style={styles.videoFullArea} />
            {/* Overlay de toque para play/pause */}
            <Pressable style={styles.videoTapOverlay} onPress={handleVideoPlayPause}>
              {/* Botao Play centralizado (aparece quando pausado) - estilo WhatsApp */}
              {!isVideoPlaying && (
                <View style={styles.playButtonCircle}>
                  <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                    <Path d="M8 5v14l11-7z" fill="#4E4E4E" />
                  </Svg>
                </View>
              )}
            </Pressable>
          </View>
        ) : (
          /* ======================================== */
          /* MODO FOTO: Imagem com crop/desenhos */
          /* ======================================== */
          <View
            style={styles.imageArea}
            onLayout={(e) => console.log('📐 [PhotoEditorScreen] imageArea:', { width: Math.round(e.nativeEvent.layout.width), height: Math.round(e.nativeEvent.layout.height) })}
          >
            {/* Imagem base com crop aplicado via CSS (NAO-DESTRUTIVO) */}
            {(() => {
              console.log('🔍 [PhotoEditorScreen] RENDER imageArea - hasElements:', hasElements, 'visible:', visible);
              return null;
            })()}
            {!hasElements && (
              <CroppedImagePreview
                imageUri={originalPhotoUri}
                imageWidth={originalPhotoWidth}
                imageHeight={originalPhotoHeight}
                cropSettings={cropSettings}
              />
            )}

            {/* Overlay com desenhos aplicados (se houver) */}
            {hasElements && (
              <View style={styles.drawingsOverlay}>
                <WebEditorCanvas
                  imageUri={originalPhotoUri}
                  imageWidth={originalPhotoWidth}
                  imageHeight={originalPhotoHeight}
                  elements={elements}
                  activeCategory={'sticker'}
                  categoryOptions={categoryOptions}
                  currentColor={selectedColor}
                  currentStrokeWidth={currentStrokeWidth}
                  isDrawingMode={activeMode === 'none'}
                  stickerInteractionOnly={true}
                  fixedImageBounds={modalImageBounds}
                  selectedElementId={selectedElementId}
                  rotation={cropSettings.fineAngle}
                  flipH={cropSettings.flipH}
                  flipV={cropSettings.flipV}
                  onElementComplete={handleElementComplete}
                  onElementUpdate={handleElementUpdate}
                  onSelectElement={handleSelectElement}
                  onExportCanvas={handleExportCanvas}
                  onImageBoundsChange={handleImageBoundsChange}
                />
              </View>
            )}
          </View>
        )}

        {/* Header com Toolbar - OVERLAY flutuante */}
        {/* Para video: X + HD + trim bar + audio */}
        {/* Para foto: toolbar completa */}
        {isCurrentVideo ? (
          <View style={styles.headerOverlay}>
            {/* Linha 1: X (esquerda) + HD (direita) - mesmo estilo da EditToolbar */}
            <View style={styles.videoToolbarRow}>
              <Pressable style={styles.videoToolbarButton} onPress={handleCloseAttempt}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d={EditorIcons.close as string} fill={EditorColors.buttonIcon} />
                </Svg>
              </Pressable>
              {isDraggingTrim && (
                <View style={styles.trimTimeContainer}>
                  <Text style={styles.trimTimeContainerText}>
                    {formatTrimTime(videoTrimStart)} - {formatTrimTime(videoTrimEnd)}
                  </Text>
                </View>
              )}
              <Pressable style={styles.videoToolbarButton} onPress={handleToggleHD}>
                <Svg width={28} height={20} viewBox="0 0 28 20" fill="none">
                  <Rect x={1} y={1} width={26} height={18} rx={4} stroke={isHD ? EditorColors.hdActive : EditorColors.hdInactive} strokeWidth={2} fill="transparent" />
                  <G>
                    <Path d="M6 14V6h1.5v3.2h3V6H12v8h-1.5v-3.3h-3V14H6z" fill={isHD ? EditorColors.hdActive : EditorColors.hdInactive} />
                    <Path d="M14 14V6h2.8c.9 0 1.6.1 2.1.4.5.2.9.6 1.2 1.1.3.5.4 1 .4 1.7v1.6c0 .7-.1 1.2-.4 1.7-.3.5-.7.8-1.2 1.1-.5.2-1.2.4-2.1.4H14zm1.5-1.3h1.3c.6 0 1-.1 1.3-.3.3-.2.5-.4.6-.7.1-.3.2-.7.2-1.2V9.2c0-.5-.1-.9-.2-1.2-.1-.3-.3-.5-.6-.7-.3-.2-.7-.3-1.3-.3h-1.3v5.7z" fill={isHD ? EditorColors.hdActive : EditorColors.hdInactive} />
                  </G>
                </Svg>
              </Pressable>
            </View>

            {/* Linha 2: Trim bar + Audio controls */}
            <VideoEditorPanel
              videoUri={currentPhotoUri}
              duration={currentMedia?.duration || 0}
              trimStart={videoTrimStart}
              trimEnd={videoTrimEnd}
              audioEnabled={videoAudioEnabled}
              fileSize={currentMedia?.fileSize}
              currentPosition={videoPositionMs}
              isPlaying={isVideoPlaying}
              onTrimChange={handleVideoTrimChange}
              onAudioToggle={handleVideoAudioToggle}
              onDragStateChange={handleTrimDragStateChange}
            />
          </View>
        ) : (
          <View
            style={styles.headerOverlay}
            onLayout={(e) => console.log('📐 [PhotoEditorScreen] headerOverlay:', { width: Math.round(e.nativeEvent.layout.width), height: Math.round(e.nativeEvent.layout.height) })}
          >
            <EditToolbar
              activeMode={activeMode}
              isHD={isHD}
              onModeChange={handleModeChange}
              onToggleHD={handleToggleHD}
              onClose={handleCloseAttempt}
              onOpenCropModal={handleOpenCropModal}
            />
          </View>
        )}

        {/* Botao Lixeira Flutuante (aparece quando sticker selecionado - apenas fotos) */}
        {!isCurrentVideo && selectedElementId && (
          <Animated.View style={[styles.trashFloatingButton, { opacity: trashOpacity }]}>
            <Pressable onPress={handleDeleteSelected} style={styles.trashButtonInner}>
              <TrashIcon />
            </Pressable>
          </Animated.View>
        )}

        {/* Carrossel de Midias (aparece com 2+ midias) */}
        {mediaItems.length >= 2 && (
          <View style={styles.carouselContainer}>
            <MediaCarousel
              items={mediaItems}
              selectedIndex={currentMediaIndex}
              onSelectItem={handleSelectMedia}
              onRemoveItem={handleRemoveMedia}
              onAddMore={handleAddMore}
              maxItems={30}
            />
          </View>
        )}

        {/* Footer com Legenda e Enviar */}
        <View
          style={styles.footerContainer}
          onLayout={(e) => console.log('📐 [PhotoEditorScreen] footerContainer:', { width: Math.round(e.nativeEvent.layout.width), height: Math.round(e.nativeEvent.layout.height) })}
        >
          <CaptionInput
            value={caption}
            onChangeText={setCaption}
            onSend={handleSend}
            recipientName={leadName}
            viewOnce={viewOnce}
            onToggleViewOnce={handleToggleViewOnce}
            isSending={isSending}
            showCameraButton={true}
            onOpenCamera={handleOpenCameraModal}
            onHeightChange={handleFooterHeightChange}
          />
        </View>

        {/* Modal de Descartar */}
        <DiscardModal
          visible={discardModalVisible}
          onCancel={handleDiscardCancel}
          onDiscard={handleDiscardConfirm}
        />

        {/* Painel de Emojis e Figurinhas */}
        <EmojiStickerPanel
          visible={activeMode === 'stickers'}
          onSelectEmoji={handleSelectEmoji}
          onSelectSticker={handleSelectSticker}
          onClose={handleCloseStickerPanel}
        />

      </KeyboardAvoidingView>

      {/* ======================================== */}
      {/* MODAL DE EDICAO (Fullscreen) */}
      {/* ======================================== */}
      <Modal
        visible={isEditingModalOpen}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseEditingModal}
      >
        <View style={styles.editModalContainer}>
          {/* Canvas de Desenho (Fullscreen) */}
          {/* NAO-DESTRUTIVO: Usa imagem ORIGINAL, transforms aplicados no export */}
          <View style={styles.editCanvasFullscreen}>
            <WebEditorCanvas
              imageUri={originalPhotoUri}
              imageWidth={originalPhotoWidth}
              imageHeight={originalPhotoHeight}
              elements={elements}
              activeCategory={activeCategory}
              categoryOptions={categoryOptions}
              currentColor={selectedColor}
              currentStrokeWidth={currentStrokeWidth}
              isDrawingMode={true}
              selectedElementId={selectedElementId}
              rotation={cropSettings.fineAngle}
              flipH={cropSettings.flipH}
              flipV={cropSettings.flipV}
              onElementComplete={handleElementComplete}
              onElementUpdate={handleElementUpdate}
              onSelectElement={handleSelectElement}
              onImageBoundsChange={handleImageBoundsChange}
            />
          </View>

          {/* Botao OK (overlay no topo esquerdo) */}
          <Pressable style={styles.okButton} onPress={handleCloseEditingModal}>
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>

          {/* Painel Vertical de Opcoes (overlay no topo direito) */}
          <View style={styles.editPanelOverlay}>
            <DrawingOptionsPanel
              activeCategory={activeCategory}
              options={categoryOptions}
              selectedColor={selectedColor}
              selectedStrokeWidth={currentStrokeWidth}
              selectedElementId={selectedElementId}
              canUndo={canUndo}
              canClear={hasElements}
              onOptionsChange={handleOptionsChange}
              onColorChange={handleColorChange}
              onStrokeWidthChange={handleStrokeWidthChange}
              onUndo={handleUndo}
              onDeleteSelected={handleDeleteSelected}
              onClearAll={handleClearAll}
              onAddText={handleOpenTextModal}
            />
          </View>

          {/* Footer: Carrossel de Categorias */}
          <View style={styles.editModalFooter}>
            <DrawingCategoryBar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </View>

          {/* Modal de Input de Texto */}
          <TextInputModal
            visible={textModalVisible}
            onConfirm={handleConfirmText}
            onCancel={handleCloseTextModal}
          />
        </View>
      </Modal>

      {/* Modal da Camera para Multiplas Midias */}
      <CameraModal
        visible={cameraModalVisible}
        onClose={handleCloseCameraModal}
        onCapture={handleCameraCapture}
        capturedCount={mediaItems.length}
        lastThumbnail={mediaItems.length > 0 ? (mediaItems[mediaItems.length - 1].thumbnail || mediaItems[mediaItems.length - 1].uri) : undefined}
      />

      {/* Modal Unificado de Crop + Transform (Nao-Destrutivo) */}
      {/* SEMPRE passa imagem ORIGINAL para permitir voltar atras */}
      <UnifiedCropModal
        visible={isCropModalOpen}
        imageUri={originalPhotoUri}
        imageWidth={originalPhotoWidth}
        imageHeight={originalPhotoHeight}
        existingSettings={cropSettings}
        onClose={handleCloseCropModal}
        onApply={handleApplyCrop}
      />
    </Modal>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // ========================================
  // TELA DE VISUALIZACAO
  // ========================================

  // Container principal
  container: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: EditorColors.background,  //......Fundo preto
  },

  // Header overlay - flutua sobre a imagem (transparente)
  // Cada botao tem seu proprio fundo circular escuro
  headerOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: -20,                                //......10px do topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    zIndex: 10,                             //......Camada superior
    backgroundColor: 'transparent',         //......Sem fundo (transparente)
  },

  // Area da imagem - do topo ate metade do footer
  // Imagem passa por tras da METADE superior do campo de input
  imageArea: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo da tela
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 105,                             //......Para na metade do footer (~120px / 2)
  },

  // Video preenche area como imagem (posicao absoluta)
  videoFullArea: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Fundo
  },

  // Overlay transparente para capturar toque (play/pause)
  videoTapOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Fundo
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    zIndex: 5,                              //......Acima do video
  },

  // Circulo do botao play (estilo WhatsApp - branco solido com icone cinza)
  playButtonCircle: {
    width: 72,                              //......Largura (WhatsApp style)
    height: 72,                             //......Altura (WhatsApp style)
    borderRadius: 36,                       //......Circular
    backgroundColor: '#FFFFFF',             //......Fundo branco solido 100%
    justifyContent: 'center',              //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
    paddingLeft: 6,                         //......Compensa visual do triangulo
  },

  // Linha de toolbar para video (X esquerda + HD direita)
  videoToolbarRow: {
    flexDirection: 'row',                   //......Layout horizontal
    alignItems: 'center',                   //......Centraliza vertical
    justifyContent: 'space-between',        //......X a esquerda, HD a direita
    paddingHorizontal: EditorStyles.headerPadding,  //......Mesmo padding da EditToolbar
    paddingTop: 40,                         //......Mesmo padding da EditToolbar
    paddingBottom: 12,                      //......Mesmo padding da EditToolbar
  },

  // Botao da toolbar de video (mesmo estilo da EditToolbar)
  videoToolbarButton: {
    width: EditorStyles.closeButtonSize,    //......40px - mesmo tamanho
    height: EditorStyles.closeButtonSize,   //......40px - mesmo tamanho
    borderRadius: EditorStyles.buttonRadius,  //......22px - circular
    backgroundColor: EditorColors.buttonBg, //......#303030 - mesmo fundo
    justifyContent: 'center',               //......Centraliza vertical
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Container do tempo de trim (entre X e HD, fundo chumbo)
  trimTimeContainer: {
    backgroundColor: '#303030',             //......Fundo chumbo padrao
    borderRadius: 20,                       //......Cantos arredondados (pill)
    paddingHorizontal: 14,                  //......Padding horizontal
    paddingVertical: 6,                     //......Padding vertical
  },

  // Texto do tempo de trim
  trimTimeContainerText: {
    fontSize: 13,                           //......Tamanho fonte
    color: '#FFFFFF',                       //......Branco
    fontFamily: 'monospace',                //......Monospace para alinhamento
    fontWeight: '500',                      //......Medium
  },

  // Imagem (preenche todo container com posicao absoluta)
  image: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Fundo
  },

  // Overlay de desenhos aplicados
  drawingsOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 0,                              //......Fundo
  },

  // Container do carrossel - overlay flutuante acima do footer
  carouselContainer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 135,                            //......10px acima do campo de input (footer=20 + captionInput~124)
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    zIndex: 10,                             //......Camada superior
    backgroundColor: 'transparent',         //......Sem fundo (transparente)
  },

  // Footer container - overlay flutuante sobre a imagem
  // Imagem passa por tras, input flutua por cima
  footerContainer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 20,                             //......10px do fundo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    zIndex: 10,                             //......Camada superior
    backgroundColor: 'transparent',         //......Sem fundo (transparente)
  },

  // Botao lixeira flutuante
  // Posicionado 10px abaixo do botao de editar
  trashFloatingButton: {
    position: 'absolute',                   //......Posicao absoluta
    top: 85,                                //......10px abaixo do botao editar
    right: 20,                              //......Alinhado a direita
    zIndex: 50,                             //......Acima de tudo
  },

  // Container interno do botao lixeira
  trashButtonInner: {
    backgroundColor: 'rgba(0,0,0,0.6)',     //......Fundo escuro semitransparente
    borderRadius: 8,                        //......Cantos levemente arredondados
    width: 44,                              //......Largura quadrada
    height: 44,                             //......Altura quadrada
    justifyContent: 'center',               //......Centraliza icone
    alignItems: 'center',                   //......Centraliza icone
    borderWidth: 1,                         //......Borda sutil
    borderColor: 'rgba(255,255,255,0.2)',   //......Cor da borda
  },

  // ========================================
  // MODAL DE EDICAO
  // ========================================

  // Container do modal de edicao
  editModalContainer: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: EditorColors.background,  //......Fundo preto
  },

  // Canvas fullscreen
  editCanvasFullscreen: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    bottom: 80,                             //......Espaco para footer
  },

  // Botao OK (overlay)
  okButton: {
    position: 'absolute',                   //......Posicao absoluta
    top: 16,                                //......16px do topo
    left: 16,                               //......16px da esquerda
    paddingHorizontal: 20,                  //......Padding horizontal
    paddingVertical: 10,                    //......Padding vertical
    backgroundColor: '#FFFFFF',             //......Fundo branco
    borderRadius: 8,                        //......Bordas arredondadas
    zIndex: 20,                             //......Camada superior
  },

  // Texto do botao OK
  okButtonText: {
    fontSize: 16,                           //......Tamanho fonte
    fontWeight: '600',                      //......Semi-bold
    color: '#000000',                       //......Preto
  },

  // Painel de opcoes (overlay)
  editPanelOverlay: {
    position: 'absolute',                   //......Posicao absoluta
    top: 10,                                //......10px do topo
    right: 0,                               //......Direita
    bottom: 80,                             //......Espaco para footer
    zIndex: 15,                             //......Camada acima do canvas
  },

  // Footer do modal de edicao
  editModalFooter: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 0,                              //......Fundo da tela
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    paddingBottom: 20,                      //......Padding inferior
  },
});

// ========================================
// Export
// ========================================
export default PhotoEditorScreen;
