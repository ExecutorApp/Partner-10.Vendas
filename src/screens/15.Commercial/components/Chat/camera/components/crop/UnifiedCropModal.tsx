// ========================================
// Componente UnifiedCropModal
// Modal unificado de crop e transformacao
// Imagem original com 8 pontos de controle
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, Modal, Pressable, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

// ========================================
// Imports de Tipos
// ========================================
import { CropSettings, DEFAULT_CROP_SETTINGS } from '../../types/camera';

// ========================================
// Tipos Exportados
// ========================================
export interface CropTransformResult {
  croppedImageUri: string;                  //......URI da imagem cortada (base64)
  newWidth: number;                         //......Nova largura
  newHeight: number;                        //......Nova altura
  rotation: number;                         //......Rotacao aplicada
  fineAngle: number;                        //......Angulo fino aplicado
  flipH: boolean;                           //......Flip H aplicado
  flipV: boolean;                           //......Flip V aplicado
}

// ========================================
// Tipo de Resultado Nao-Destrutivo
// Retorna settings e opcionalmente imagem processada (para rotacao 90)
// ========================================
export interface CropSettingsResult {
  settings: CropSettings;                   //......Configuracoes de crop
  processedImageUri?: string;               //......Imagem rotacionada 90 (opcional)
  processedWidth?: number;                  //......Nova largura apos rotacao
  processedHeight?: number;                 //......Nova altura apos rotacao
}

// ========================================
// Tipos
// ========================================
interface UnifiedCropModalProps {
  visible: boolean;                         //......Modal visivel
  imageUri: string;                         //......URI da imagem ORIGINAL
  imageWidth: number;                       //......Largura original
  imageHeight: number;                      //......Altura original
  existingSettings: CropSettings | null;    //......Settings atuais (null = novo crop)
  onClose: () => void;                      //......Fechar sem aplicar
  onApply: (result: CropSettingsResult) => void;  //......Aplicar settings (nao-destrutivo)
}

interface AspectRatio {
  id: string;                               //......ID do ratio
  label: string;                            //......Label exibido
  value: number | null;                     //......Valor do ratio (null = livre)
}

interface CropRect {
  x: number;                                //......X relativo ao container
  y: number;                                //......Y relativo ao container
  width: number;                            //......Largura do crop
  height: number;                           //......Altura do crop
}

type HandleType = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom' | 'left' | 'right' | 'move';

// ========================================
// Constantes
// ========================================
const ASPECT_RATIOS: AspectRatio[] = [
  { id: 'free', label: 'Livre', value: null },
];

const HANDLE_SIZE = 10;                     //......Tamanho do handle (slim)
const HANDLE_HIT_AREA = 44;                 //......Area de toque do handle
const MIN_CROP_SIZE = 50;                   //......Tamanho minimo do crop
const SLIDER_MIN = -45;                     //......Angulo minimo do slider
const SLIDER_MAX = 45;                      //......Angulo maximo do slider
const ACTIVE_COLOR = '#1777CF';             //......Cor azul ativa

// ========================================
// Icone Rotacionar (90 graus por clique)
// ========================================
const RotateIcon: React.FC<{ active?: boolean }> = memo(({ active }) => (
  <Svg width={28} height={28} viewBox="0 0 612.005 612.006" fill="none">
    <Path
      d="M305.934 516.253c-96.313 0-177.413-64.681-202.395-152.909h62.158c5.906-5.734 9.002-13.494 3.096-19.229l-71.791-72.517c-5.906-5.734-15.482-5.734-21.388 0L4.302 344.115c-8.468 9.939-2.81 13.494 3.096 19.229h56.978C90.313 472.865 188.366 554.48 305.934 554.48c89.433 0 167.626-47.325 211.454-118.104l-35.991-14.373c-37.692 56.768-102.162 94.25-175.463 94.25zm299.797-248.478h-54.34c-18.444-119.04-121.143-210.25-245.457-210.25-95.874 0-178.923 54.264-220.438 133.624l35.628 14.24c35.686-65.312 105.068-109.636 184.81-109.636 103.137 0 188.804 74.18 206.81 172.022h-65.293c-5.905 5.734-11.563 9.29-3.096 19.229l71.312 72.518c5.906 5.733 15.482 5.733 21.389 0l71.791-72.518c5.887-5.734 2.79-13.494-3.116-19.229z"
      fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}
    />
  </Svg>
));

// ========================================
// Icone Espelhar Horizontal
// ========================================
const FlipHIcon: React.FC<{ active?: boolean }> = memo(({ active }) => (
  <Svg width={28} height={28} viewBox="0 0 48 48" fill="none">
    <Path d="M38.6 13.9H9.4c-.6 0-1-.4-1-1s.4-1 1-1h29.3c.6 0 1 .4 1 1s-.5 1-1.1 1z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
    <Path d="M28.4 24.1c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l9.5-9.5-9.5-9.5c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l10.2 10.2c.4.4.4 1 0 1.4L29.1 23.8c-.2.2-.5.3-.7.3zM38.6 36.1H9.4c-.6 0-1-.4-1-1s.4-1 1-1h29.3c.6 0 1 .4 1 1s-.5 1-1.1 1z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
    <Path d="M19.6 46.4c-.3 0-.5-.1-.7-.3L8.7 35.8c-.4-.4-.4-1 0-1.4l10.2-10.2c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-9.5 9.5 9.5 9.5c.4.4.4 1 0 1.4-.2.3-.4.4-.7.4z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
  </Svg>
));

// ========================================
// Icone Espelhar Vertical
// ========================================
const FlipVIcon: React.FC<{ active?: boolean }> = memo(({ active }) => (
  <View style={{ transform: [{ rotate: '90deg' }] }}>
    <Svg width={28} height={28} viewBox="0 0 48 48" fill="none">
      <Path d="M38.6 13.9H9.4c-.6 0-1-.4-1-1s.4-1 1-1h29.3c.6 0 1 .4 1 1s-.5 1-1.1 1z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
      <Path d="M28.4 24.1c-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l9.5-9.5-9.5-9.5c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l10.2 10.2c.4.4.4 1 0 1.4L29.1 23.8c-.2.2-.5.3-.7.3zM38.6 36.1H9.4c-.6 0-1-.4-1-1s.4-1 1-1h29.3c.6 0 1 .4 1 1s-.5 1-1.1 1z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
      <Path d="M19.6 46.4c-.3 0-.5-.1-.7-.3L8.7 35.8c-.4-.4-.4-1 0-1.4l10.2-10.2c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-9.5 9.5 9.5 9.5c.4.4.4 1 0 1.4-.2.3-.4.4-.7.4z" fill={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
    </Svg>
  </View>
));

// ========================================
// Componente Principal UnifiedCropModal
// ========================================
const UnifiedCropModal: React.FC<UnifiedCropModalProps> = memo(({
  visible,
  imageUri,
  imageWidth,
  imageHeight,
  existingSettings,
  onClose,
  onApply,
}) => {
  // ========================================
  // Refs
  // ========================================
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);


  // ========================================
  // Estados de Transformacao (Temporarios)
  // Inicializados com valores padrao, atualizados via useEffect quando existingSettings
  // ========================================
  const [tempRotation, setTempRotation] = useState(0);
  const [tempFineAngle, setTempFineAngle] = useState(0);
  const [tempFlipH, setTempFlipH] = useState(false);
  const [tempFlipV, setTempFlipV] = useState(false);

  // ========================================
  // Estados do Container e Imagem
  // ========================================
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageBounds, setImageBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processedImageUri, setProcessedImageUri] = useState(imageUri);  //......Imagem processada (com rotacoes 90 aplicadas)
  const [totalRotation90, setTotalRotation90] = useState(0);             //......Acumulador de rotacoes 90 aplicadas

  // ========================================
  // Estados do Crop
  // ========================================
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedRatio, setSelectedRatio] = useState<string>('free');

  // ========================================
  // Estados dos Inputs de Dimensao (pixels reais)
  // ========================================
  const [inputWidth, setInputWidth] = useState('');
  const [inputHeight, setInputHeight] = useState('');
  const isInputFocused = useRef(false);

  // ========================================
  // Estado de Escala (Auto-Zoom)
  // ========================================
  const [imageScale, setImageScale] = useState(1);

  // ========================================
  // Estados de Gesture
  // ========================================
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalRect, setOriginalRect] = useState<CropRect | null>(null);

  // ========================================
  // Sincronizar estados quando modal abre (NAO-DESTRUTIVO)
  // Recebe imagem ORIGINAL + existingSettings
  // Se ha rotation90 anterior, re-rotaciona via canvas para restaurar orientacao
  // ========================================
  useEffect(() => {
    if (visible) {
      setImageLoaded(false);

      // Verificar se ha transformacoes anteriores para restaurar
      const hasExistingTransforms = existingSettings && (
        existingSettings.rotation90 !== 0 ||
        existingSettings.cropRect.width < 0.99 ||
        existingSettings.cropRect.height < 0.99 ||
        existingSettings.fineAngle !== 0 ||
        existingSettings.flipH ||
        existingSettings.flipV
      );

      if (hasExistingTransforms && existingSettings) {
        console.log('📷 [UnifiedCropModal] Restaurando settings anteriores (NAO-DESTRUTIVO):', existingSettings);

        // Restaurar estados de transformacao
        setTotalRotation90(existingSettings.rotation90);
        setTempRotation(0);                              //......Rotacao 90 ja aplicada via canvas, CSS rotation fica em 0
        setTempFineAngle(existingSettings.fineAngle);
        setTempFlipH(existingSettings.flipH);
        setTempFlipV(existingSettings.flipV);
        setSelectedRatio(existingSettings.aspectRatio || 'free');
        setImageScale(existingSettings.imageScale);

        // Se ha rotacao 90 anterior, re-rotacionar imagem original via canvas
        if (existingSettings.rotation90 !== 0 && Platform.OS === 'web') {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const angle = existingSettings.rotation90;
            const canvas = document.createElement('canvas');
            const srcW = img.naturalWidth || img.width;
            const srcH = img.naturalHeight || img.height;

            // Para 90/270, trocar dimensoes
            if (angle === 90 || angle === 270) {
              canvas.width = srcH;
              canvas.height = srcW;
            } else {
              canvas.width = srcW;
              canvas.height = srcH;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle * Math.PI / 180);
            ctx.drawImage(img, -srcW / 2, -srcH / 2);

            const rotatedUri = canvas.toDataURL('image/jpeg', 0.95);
            setProcessedImageUri(rotatedUri);
            console.log('📷 [UnifiedCropModal] Imagem re-rotacionada', angle, '° para restaurar orientacao:', canvas.width, 'x', canvas.height);
          };
          img.src = imageUri;
        } else {
          // Sem rotacao 90 - usar imagem original
          setProcessedImageUri(imageUri);
        }
      } else {
        // Sem transformacoes anteriores - comecar do zero
        console.log('📷 [UnifiedCropModal] Iniciando do zero (sem settings)');
        setProcessedImageUri(imageUri);
        setTempRotation(0);
        setTotalRotation90(0);
        setTempFineAngle(0);
        setTempFlipH(false);
        setTempFlipV(false);
        setSelectedRatio('free');
        setImageScale(1);
      }
    }
  }, [visible, imageUri, existingSettings]);

  // ========================================
  // Calcular Tamanho do Container
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    const timer = setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, [visible]);

  // ========================================
  // Carregar Imagem (usa processedImageUri)
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || !processedImageUri) return;

    setImageLoaded(false);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = processedImageUri;
  }, [processedImageUri, visible]);

  // ========================================
  // Calcular Bounds da Imagem e Crop Inicial
  // Imagem mantem proporcao e ocupa o maximo do container
  // Crop inicial = tamanho total da imagem (sem crop) ou restaurado de existingSettings
  // ========================================
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || containerSize.width === 0) return;

    const img = imageRef.current;
    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = img.width / img.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageAspect > containerAspect) {
      // Imagem mais larga - limita pela largura
      drawWidth = containerSize.width;
      drawHeight = containerSize.width / imageAspect;
      offsetX = 0;
      offsetY = (containerSize.height - drawHeight) / 2;
    } else {
      // Imagem mais alta - limita pela altura
      drawHeight = containerSize.height;
      drawWidth = containerSize.height * imageAspect;
      offsetX = (containerSize.width - drawWidth) / 2;
      offsetY = 0;
    }

    const bounds = { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight };
    setImageBounds(bounds);

    // Se ha existingSettings com crop (verificar width E height), restaurar area de crop
    if (existingSettings && (existingSettings.cropRect.width < 0.99 || existingSettings.cropRect.height < 0.99 || existingSettings.cropRect.x > 0.01 || existingSettings.cropRect.y > 0.01)) {
      // Converter coordenadas relativas (0-1) para pixels
      const cropX = offsetX + existingSettings.cropRect.x * drawWidth;
      const cropY = offsetY + existingSettings.cropRect.y * drawHeight;
      const cropW = existingSettings.cropRect.width * drawWidth;
      const cropH = existingSettings.cropRect.height * drawHeight;

      console.log('📷 [UnifiedCropModal] Restaurando cropRect de settings:', {
        relative: existingSettings.cropRect,
        pixels: { x: cropX, y: cropY, width: cropW, height: cropH },
      });

      setCropRect({ x: cropX, y: cropY, width: cropW, height: cropH });
      setImageScale(existingSettings.imageScale);
    } else {
      // Crop inicial = imagem inteira (sem crop)
      setCropRect({
        x: offsetX,
        y: offsetY,
        width: drawWidth,
        height: drawHeight,
      });
      // Resetar escala quando imagem carrega
      setImageScale(1);
    }
  }, [imageLoaded, containerSize, existingSettings]);

  // ========================================
  // Calcular Zoom Minimo para Preencher Crop
  // Quando a imagem rotaciona, precisa de mais zoom para cobrir os cantos vazios
  // Formula: Para cada canto do crop, verificar se esta dentro da imagem rotacionada
  // O zoom necessario e o maximo entre os 4 cantos
  // ========================================
  const calculateMinScale = useCallback((angleInDegrees: number, cropW: number, cropH: number, imgW: number, imgH: number): number => {
    if (cropW === 0 || cropH === 0 || imgW === 0 || imgH === 0) return 1;
    if (angleInDegrees === 0) return 1;

    const angleRad = Math.abs(angleInDegrees * Math.PI / 180);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Para que os 4 cantos do crop estejam dentro da imagem rotacionada:
    // Aplicamos rotacao inversa ao canto e verificamos se cabe na imagem
    // Canto (+cropW/2, +cropH/2) apos rotacao inversa:
    //   x' = cropW/2 * cos + cropH/2 * sin
    //   y' = cropH/2 * cos - cropW/2 * sin (ou +, depende do canto)
    // Para estar dentro da imagem escalada por S:
    //   |x'| <= S * imgW/2  e  |y'| <= S * imgH/2
    // Entao: S >= |x'| * 2 / imgW  e  S >= |y'| * 2 / imgH

    // Testando os 4 cantos, o pior caso e:
    const scaleX = (cropW * cos + cropH * sin) / imgW;
    const scaleY = (cropH * cos + cropW * sin) / imgH;

    const minScale = Math.max(scaleX, scaleY);

    // Garantir minimo de 1 (nunca diminuir) e maximo de 3
    return Math.max(1, Math.min(3, minScale));
  }, []);

  // ========================================
  // Auto-Zoom quando Angulo Muda
  // Recalcula escala para preencher o crop sem areas vazias
  // So aplica quando ha rotacao real (angulo diferente de 0)
  // ========================================
  useEffect(() => {
    if (!imageLoaded || imageBounds.width === 0 || cropRect.width === 0) return;

    const totalAngle = tempRotation + tempFineAngle;

    // Se nao ha rotacao, manter escala 1 (sem auto-zoom)
    if (totalAngle === 0) {
      setImageScale(1);
      return;
    }

    // Calcular escala minima para preencher crop com imagem rotacionada
    const minScale = calculateMinScale(
      totalAngle,
      cropRect.width,
      cropRect.height,
      imageBounds.width,
      imageBounds.height
    );

    setImageScale(minScale);
  }, [tempRotation, tempFineAngle, cropRect.width, cropRect.height, imageBounds.width, imageBounds.height, imageLoaded, calculateMinScale]);

  // ========================================
  // Revalidar Posicao do Crop quando Rotacao Muda
  // Move crop para o centro se posicao atual ficou invalida
  // ========================================
  useEffect(() => {
    if (!imageLoaded || imageBounds.width === 0) return;

    const totalAngle = tempRotation + tempFineAngle;
    if (totalAngle === 0) return;

    // Usar setCropRect com callback para acessar valor atual
    setCropRect(prev => {
      if (prev.width === 0) return prev;

      // Calcular escala para o crop atual
      const minScale = calculateMinScale(
        totalAngle,
        prev.width,
        prev.height,
        imageBounds.width,
        imageBounds.height
      );

      // Verificar cada canto
      const corners = [
        { x: prev.x, y: prev.y },
        { x: prev.x + prev.width, y: prev.y },
        { x: prev.x, y: prev.y + prev.height },
        { x: prev.x + prev.width, y: prev.y + prev.height },
      ];

      const cx = imageBounds.x + imageBounds.width / 2;
      const cy = imageBounds.y + imageBounds.height / 2;
      const angleRad = -totalAngle * Math.PI / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const halfW = imageBounds.width / 2;
      const halfH = imageBounds.height / 2;

      const allValid = corners.every(corner => {
        const rx = corner.x - cx;
        const ry = corner.y - cy;
        const rotX = rx * cos - ry * sin;
        const rotY = rx * sin + ry * cos;
        const unscaledX = rotX / minScale;
        const unscaledY = rotY / minScale;
        return Math.abs(unscaledX) <= halfW && Math.abs(unscaledY) <= halfH;
      });

      if (allValid) return prev;

      // Mover crop para o centro
      return {
        x: cx - prev.width / 2,
        y: cy - prev.height / 2,
        width: prev.width,
        height: prev.height,
      };
    });
  }, [tempRotation, tempFineAngle, imageBounds, imageLoaded, calculateMinScale]);

  // ========================================
  // Verificar se Ponto esta dentro da Imagem Rotacionada
  // Considera rotacao e escala aplicadas
  // ========================================
  const isPointInsideRotatedImage = useCallback((px: number, py: number, scale: number): boolean => {
    // Centro da imagem
    const cx = imageBounds.x + imageBounds.width / 2;
    const cy = imageBounds.y + imageBounds.height / 2;

    // Ponto relativo ao centro
    const rx = px - cx;
    const ry = py - cy;

    // Rotacao total (inversa para transformar o ponto de volta)
    const totalAngle = tempRotation + tempFineAngle;
    const angleRad = -totalAngle * Math.PI / 180;

    // Rotacionar ponto no sentido inverso
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const rotX = rx * cos - ry * sin;
    const rotY = rx * sin + ry * cos;

    // Dividir pela escala para obter coordenadas na imagem original
    const unscaledX = rotX / scale;
    const unscaledY = rotY / scale;

    // Verificar se esta dentro dos bounds originais (metade da largura/altura)
    const halfW = imageBounds.width / 2;
    const halfH = imageBounds.height / 2;

    return Math.abs(unscaledX) <= halfW && Math.abs(unscaledY) <= halfH;
  }, [imageBounds, tempRotation, tempFineAngle]);

  // ========================================
  // Verificar se Crop Rect esta Completamente dentro da Imagem Rotacionada
  // Verifica os 4 cantos do crop
  // ========================================
  const isCropRectValidForRotation = useCallback((rect: CropRect, scale: number): boolean => {
    // Os 4 cantos do crop
    const corners = [
      { x: rect.x, y: rect.y },                           //......Canto superior esquerdo
      { x: rect.x + rect.width, y: rect.y },              //......Canto superior direito
      { x: rect.x, y: rect.y + rect.height },             //......Canto inferior esquerdo
      { x: rect.x + rect.width, y: rect.y + rect.height }, //......Canto inferior direito
    ];

    // Todos os cantos devem estar dentro da imagem rotacionada
    return corners.every(c => isPointInsideRotatedImage(c.x, c.y, scale));
  }, [isPointInsideRotatedImage]);

  // ========================================
  // Clampar Crop dentro dos Bounds (considerando rotacao)
  // ========================================
  const clampCropRect = useCallback((rect: CropRect): CropRect => {
    let { x, y, width, height } = rect;

    // Garantir tamanho minimo
    width = Math.max(MIN_CROP_SIZE, width);
    height = Math.max(MIN_CROP_SIZE, height);

    // Limitar ao bounds da imagem
    width = Math.min(width, imageBounds.width);
    height = Math.min(height, imageBounds.height);

    // Limitar posicao inicial
    x = Math.max(imageBounds.x, Math.min(x, imageBounds.x + imageBounds.width - width));
    y = Math.max(imageBounds.y, Math.min(y, imageBounds.y + imageBounds.height - height));

    // Se nao ha rotacao, retornar como esta
    const totalAngle = tempRotation + tempFineAngle;
    if (totalAngle === 0) {
      return { x, y, width, height };
    }

    // Calcular escala minima para o crop proposto
    const minScale = calculateMinScale(totalAngle, width, height, imageBounds.width, imageBounds.height);

    // Verificar se crop atual esta valido para a rotacao
    if (isCropRectValidForRotation({ x, y, width, height }, minScale)) {
      return { x, y, width, height };
    }

    // Se nao esta valido, mover crop em direcao ao centro
    // Calcular centro da imagem e centro do crop
    const imageCenterX = imageBounds.x + imageBounds.width / 2;
    const imageCenterY = imageBounds.y + imageBounds.height / 2;
    const cropCenterX = x + width / 2;
    const cropCenterY = y + height / 2;

    // Calcular offset maximo permitido
    // Para imagem rotacionada, o crop so pode estar deslocado ate onde todos os cantos ficam dentro
    // Usar busca binaria para encontrar posicao valida mais proxima do desejado
    const offsetX = cropCenterX - imageCenterX;
    const offsetY = cropCenterY - imageCenterY;

    // Se offset e zero (centralizado), ja deveria estar valido
    if (offsetX === 0 && offsetY === 0) {
      return { x, y, width, height };
    }

    // Buscar fator de reducao do offset ate ficar valido
    let factor = 1.0;
    for (let i = 0; i < 20; i++) {
      const newX = imageCenterX + offsetX * factor - width / 2;
      const newY = imageCenterY + offsetY * factor - height / 2;
      const testRect = { x: newX, y: newY, width, height };

      if (isCropRectValidForRotation(testRect, minScale)) {
        return testRect;
      }

      factor *= 0.85;
    }

    // Fallback: centralizar crop
    return {
      x: imageCenterX - width / 2,
      y: imageCenterY - height / 2,
      width,
      height,
    };
  }, [imageBounds, tempRotation, tempFineAngle, calculateMinScale, isCropRectValidForRotation]);

  // ========================================
  // Aplicar Aspect Ratio
  // ========================================
  const applyAspectRatio = useCallback((ratioValue: number | null) => {
    if (ratioValue === null) return;

    setCropRect(prev => {
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;

      let newWidth = prev.width;
      let newHeight = prev.width / ratioValue;

      // Se altura excede bounds, calcular a partir da altura
      if (newHeight > imageBounds.height) {
        newHeight = imageBounds.height;
        newWidth = newHeight * ratioValue;
      }

      // Se largura excede bounds
      if (newWidth > imageBounds.width) {
        newWidth = imageBounds.width;
        newHeight = newWidth / ratioValue;
      }

      return clampCropRect({
        x: centerX - newWidth / 2,
        y: centerY - newHeight / 2,
        width: newWidth,
        height: newHeight,
      });
    });
  }, [imageBounds, clampCropRect]);

  // ========================================
  // Handler: Selecionar Aspect Ratio
  // ========================================
  const handleSelectRatio = useCallback((ratio: AspectRatio) => {
    setSelectedRatio(ratio.id);
    if (ratio.value !== null) {
      applyAspectRatio(ratio.value);
    }
  }, [applyAspectRatio]);

  // ========================================
  // Dimensoes Reais do Crop (pixels da imagem original)
  // ========================================
  const realCropWidth = useMemo(() => {
    if (imageBounds.width === 0) return 0;
    return Math.round((cropRect.width / imageBounds.width) * imageWidth);
  }, [cropRect.width, imageBounds.width, imageWidth]);

  const realCropHeight = useMemo(() => {
    if (imageBounds.height === 0) return 0;
    return Math.round((cropRect.height / imageBounds.height) * imageHeight);
  }, [cropRect.height, imageBounds.height, imageHeight]);

  // Sincronizar inputs com crop rect (apenas quando nao editando)
  useEffect(() => {
    if (!isInputFocused.current && realCropWidth > 0) {
      setInputWidth(String(realCropWidth));
    }
  }, [realCropWidth]);

  useEffect(() => {
    if (!isInputFocused.current && realCropHeight > 0) {
      setInputHeight(String(realCropHeight));
    }
  }, [realCropHeight]);

  // ========================================
  // Handler: Aplicar Dimensao por Pixel (input do usuario)
  // ========================================
  const applyPixelDimension = useCallback((targetW: number, targetH: number) => {
    if (imageBounds.width === 0 || imageBounds.height === 0) return;

    // Clampar aos limites da imagem original
    const clampedW = Math.max(MIN_CROP_SIZE, Math.min(targetW, imageWidth));
    const clampedH = Math.max(MIN_CROP_SIZE, Math.min(targetH, imageHeight));

    // Converter para pixels do container
    const containerCropW = (clampedW / imageWidth) * imageBounds.width;
    const containerCropH = (clampedH / imageHeight) * imageBounds.height;

    setCropRect(prev => {
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;

      return clampCropRect({
        x: centerX - containerCropW / 2,
        y: centerY - containerCropH / 2,
        width: containerCropW,
        height: containerCropH,
      });
    });
  }, [imageBounds, imageWidth, imageHeight, clampCropRect]);

  // ========================================
  // Handlers de Input (Largura / Altura)
  // ========================================
  const handleWidthSubmit = useCallback(() => {
    isInputFocused.current = false;
    const val = parseInt(inputWidth, 10);
    if (!isNaN(val) && val > 0) {
      applyPixelDimension(val, realCropHeight);
    } else {
      setInputWidth(String(realCropWidth));
    }
  }, [inputWidth, realCropHeight, realCropWidth, applyPixelDimension]);

  const handleHeightSubmit = useCallback(() => {
    isInputFocused.current = false;
    const val = parseInt(inputHeight, 10);
    if (!isNaN(val) && val > 0) {
      applyPixelDimension(realCropWidth, val);
    } else {
      setInputHeight(String(realCropHeight));
    }
  }, [inputHeight, realCropWidth, realCropHeight, applyPixelDimension]);

  const handleWidthStep = useCallback((delta: number) => {
    const current = realCropWidth;
    const next = Math.max(MIN_CROP_SIZE, Math.min(current + delta, imageWidth));
    applyPixelDimension(next, realCropHeight);
  }, [realCropWidth, realCropHeight, imageWidth, applyPixelDimension]);

  const handleHeightStep = useCallback((delta: number) => {
    const current = realCropHeight;
    const next = Math.max(MIN_CROP_SIZE, Math.min(current + delta, imageHeight));
    applyPixelDimension(realCropWidth, next);
  }, [realCropWidth, realCropHeight, imageHeight, applyPixelDimension]);

  // ========================================
  // Obter Posicao do Evento
  // ========================================
  const getEventPosition = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // ========================================
  // Detectar Handle no Ponto
  // ========================================
  const detectHandle = useCallback((pos: { x: number; y: number }): HandleType | null => {
    const { x, y, width, height } = cropRect;
    const halfHit = HANDLE_HIT_AREA / 2;

    // Cantos (prioridade)
    if (Math.abs(pos.x - x) < halfHit && Math.abs(pos.y - y) < halfHit) return 'topLeft';
    if (Math.abs(pos.x - (x + width)) < halfHit && Math.abs(pos.y - y) < halfHit) return 'topRight';
    if (Math.abs(pos.x - x) < halfHit && Math.abs(pos.y - (y + height)) < halfHit) return 'bottomLeft';
    if (Math.abs(pos.x - (x + width)) < halfHit && Math.abs(pos.y - (y + height)) < halfHit) return 'bottomRight';

    // Meios dos lados
    if (Math.abs(pos.y - y) < halfHit && pos.x > x + halfHit && pos.x < x + width - halfHit) return 'top';
    if (Math.abs(pos.y - (y + height)) < halfHit && pos.x > x + halfHit && pos.x < x + width - halfHit) return 'bottom';
    if (Math.abs(pos.x - x) < halfHit && pos.y > y + halfHit && pos.y < y + height - halfHit) return 'left';
    if (Math.abs(pos.x - (x + width)) < halfHit && pos.y > y + halfHit && pos.y < y + height - halfHit) return 'right';

    // Dentro da area de crop (move)
    if (pos.x > x && pos.x < x + width && pos.y > y && pos.y < y + height) return 'move';

    return null;
  }, [cropRect]);

  // ========================================
  // Aplicar Drag ao Crop
  // Retorna null se movimento for invalido (bloqueado)
  // ========================================
  const applyDrag = useCallback((handle: HandleType, delta: { x: number; y: number }, original: CropRect, currentCrop: CropRect): CropRect => {
    let { x, y, width, height } = original;
    const ratio = ASPECT_RATIOS.find(r => r.id === selectedRatio);
    const aspectValue = ratio?.value;

    switch (handle) {
      case 'move':
        x += delta.x;
        y += delta.y;
        break;

      case 'topLeft':
        x += delta.x;
        y += delta.y;
        width -= delta.x;
        height -= delta.y;
        if (aspectValue) {
          const newHeight = width / aspectValue;
          y = original.y + original.height - newHeight;
          height = newHeight;
        }
        break;

      case 'topRight':
        y += delta.y;
        width += delta.x;
        height -= delta.y;
        if (aspectValue) {
          height = width / aspectValue;
          y = original.y + original.height - height;
        }
        break;

      case 'bottomLeft':
        x += delta.x;
        width -= delta.x;
        height += delta.y;
        if (aspectValue) {
          height = width / aspectValue;
        }
        break;

      case 'bottomRight':
        width += delta.x;
        height += delta.y;
        if (aspectValue) {
          height = width / aspectValue;
        }
        break;

      case 'top':
        y += delta.y;
        height -= delta.y;
        if (aspectValue) {
          const newWidth = height * aspectValue;
          x = original.x + (original.width - newWidth) / 2;
          width = newWidth;
        }
        break;

      case 'bottom':
        height += delta.y;
        if (aspectValue) {
          const newWidth = height * aspectValue;
          x = original.x + (original.width - newWidth) / 2;
          width = newWidth;
        }
        break;

      case 'left':
        x += delta.x;
        width -= delta.x;
        if (aspectValue) {
          const newHeight = width / aspectValue;
          y = original.y + (original.height - newHeight) / 2;
          height = newHeight;
        }
        break;

      case 'right':
        width += delta.x;
        if (aspectValue) {
          const newHeight = width / aspectValue;
          y = original.y + (original.height - newHeight) / 2;
          height = newHeight;
        }
        break;
    }

    // Garantir tamanho minimo
    width = Math.max(MIN_CROP_SIZE, width);
    height = Math.max(MIN_CROP_SIZE, height);

    // Limitar ao bounds da imagem
    width = Math.min(width, imageBounds.width);
    height = Math.min(height, imageBounds.height);

    // Limitar posicao inicial aos bounds
    x = Math.max(imageBounds.x, Math.min(x, imageBounds.x + imageBounds.width - width));
    y = Math.max(imageBounds.y, Math.min(y, imageBounds.y + imageBounds.height - height));

    const proposedRect = { x, y, width, height };

    // Se nao ha rotacao, retorna normalmente
    const totalAngle = tempRotation + tempFineAngle;
    if (totalAngle === 0) {
      return proposedRect;
    }

    // Calcular escala minima para o crop proposto
    const minScale = calculateMinScale(totalAngle, width, height, imageBounds.width, imageBounds.height);

    // Verificar se a nova posicao e valida para a rotacao
    if (isCropRectValidForRotation(proposedRect, minScale)) {
      return proposedRect;
    }

    // Se nao e valido e estamos movendo (nao redimensionando), bloquear movimento
    if (handle === 'move') {
      // Tentar encontrar a posicao mais proxima valida
      const imageCenterX = imageBounds.x + imageBounds.width / 2;
      const imageCenterY = imageBounds.y + imageBounds.height / 2;
      const proposedCenterX = x + width / 2;
      const proposedCenterY = y + height / 2;
      const currentCenterX = currentCrop.x + currentCrop.width / 2;
      const currentCenterY = currentCrop.y + currentCrop.height / 2;

      // Calcular direcao do movimento
      const moveX = proposedCenterX - currentCenterX;
      const moveY = proposedCenterY - currentCenterY;

      // Buscar a posicao maxima valida nessa direcao
      for (let t = 0.9; t >= 0; t -= 0.1) {
        const testX = currentCrop.x + moveX * t;
        const testY = currentCrop.y + moveY * t;
        const testRect = { x: testX, y: testY, width: currentCrop.width, height: currentCrop.height };

        if (isCropRectValidForRotation(testRect, minScale)) {
          return testRect;
        }
      }

      // Se nenhuma posicao valida, manter atual
      return currentCrop;
    }

    // Para redimensionamento, tentar ajustar para posicao centralizada
    const imageCenterX = imageBounds.x + imageBounds.width / 2;
    const imageCenterY = imageBounds.y + imageBounds.height / 2;

    const centeredRect = {
      x: imageCenterX - width / 2,
      y: imageCenterY - height / 2,
      width,
      height,
    };

    if (isCropRectValidForRotation(centeredRect, minScale)) {
      return centeredRect;
    }

    // Fallback: manter crop atual
    return currentCrop;
  }, [selectedRatio, imageBounds, tempRotation, tempFineAngle, calculateMinScale, isCropRectValidForRotation]);

  // ========================================
  // Event Handlers para Drag
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current || !visible) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      const pos = getEventPosition(e);
      const handle = detectHandle(pos);

      if (handle) {
        e.preventDefault();
        setIsDragging(true);
        setActiveHandle(handle);
        setDragStart(pos);
        setOriginalRect({ ...cropRect });
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !activeHandle || !originalRect) return;

      e.preventDefault();
      const pos = getEventPosition(e);
      const delta = { x: pos.x - dragStart.x, y: pos.y - dragStart.y };
      const newRect = applyDrag(activeHandle, delta, originalRect, cropRect);
      setCropRect(newRect);
    };

    const handleEnd = () => {
      setIsDragging(false);
      setActiveHandle(null);
      setOriginalRect(null);
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('touchstart', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [visible, getEventPosition, detectHandle, isDragging, activeHandle, dragStart, originalRect, cropRect, applyDrag]);

  // ========================================
  // Handler: Rotacionar 90 graus
  // Processa imagem via canvas e cria nova versao rotacionada
  // Imagem rotaciona completamente sem corte
  // ========================================
  const handleRotate90 = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    // Criar canvas com dimensoes trocadas (width <-> height)
    const canvas = document.createElement('canvas');
    canvas.width = img.height;
    canvas.height = img.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mover origem para centro e rotacionar 90 graus
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Exportar como nova imagem
    const newImageUri = canvas.toDataURL('image/jpeg', 0.95);

    // Atualizar estados
    setProcessedImageUri(newImageUri);
    setTotalRotation90(prev => (prev + 90) % 360);
    setImageLoaded(false);                        //......Forcar recarga da imagem
    setTempFineAngle(0);                          //......Resetar angulo fino
    setTempFlipH(false);                          //......Resetar flip H
    setTempFlipV(false);                          //......Resetar flip V
    setImageScale(1);                             //......Resetar escala
    setSelectedRatio('free');                     //......Resetar ratio

    console.log('📷 [UnifiedCropModal] Imagem rotacionada 90°, novas dimensoes:', canvas.width, 'x', canvas.height);
  }, []);

  // ========================================
  // Handler: Toggle Flip H
  // ========================================
  const handleFlipH = useCallback(() => {
    setTempFlipH((prev: boolean) => !prev);
  }, []);

  // ========================================
  // Handler: Toggle Flip V
  // ========================================
  const handleFlipV = useCallback(() => {
    setTempFlipV((prev: boolean) => !prev);
  }, []);

  // ========================================
  // Handler: Slider Mudou
  // ========================================
  const handleSliderChange = useCallback((value: number) => {
    setTempFineAngle(Math.round(value * 10) / 10);
  }, []);

  // ========================================
  // Handler: Resetar Tudo
  // Reseta todas as transformacoes da sessao atual
  // ========================================
  const handleReset = useCallback(() => {
    console.log('📷 [UnifiedCropModal] Resetando transformacoes');

    // Resetar transformacoes (mantem a imagem atual, so reseta fineAngle, flip, crop)
    setTempFineAngle(0);
    setTempFlipH(false);
    setTempFlipV(false);
    setSelectedRatio('free');
    setImageScale(1);

    // Resetar crop para imagem inteira
    setCropRect({
      x: imageBounds.x,
      y: imageBounds.y,
      width: imageBounds.width,
      height: imageBounds.height,
    });
  }, [imageBounds]);

  // ========================================
  // Handler: Aplicar (NAO-DESTRUTIVO)
  // Retorna APENAS settings - NAO processa imagem
  // Processamento ocorre APENAS no momento do envio
  // ========================================
  const handleApply = useCallback(() => {
    if (imageBounds.width === 0 || cropRect.width === 0) return;

    // Converter cropRect de pixels para coordenadas relativas (0-1)
    const relativeRect = {
      x: (cropRect.x - imageBounds.x) / imageBounds.width,
      y: (cropRect.y - imageBounds.y) / imageBounds.height,
      width: cropRect.width / imageBounds.width,
      height: cropRect.height / imageBounds.height,
    };

    // Clampar valores entre 0 e 1
    relativeRect.x = Math.max(0, Math.min(1, relativeRect.x));
    relativeRect.y = Math.max(0, Math.min(1, relativeRect.y));
    relativeRect.width = Math.max(0.1, Math.min(1 - relativeRect.x, relativeRect.width));
    relativeRect.height = Math.max(0.1, Math.min(1 - relativeRect.y, relativeRect.height));

    // Rotacao total (totalRotation90 ja inclui valor anterior se houver)
    const totalRotation = totalRotation90 % 360;

    const settings: CropSettings = {
      cropRect: relativeRect,
      rotation90: totalRotation,
      fineAngle: tempFineAngle,
      flipH: tempFlipH,
      flipV: tempFlipV,
      aspectRatio: selectedRatio === 'free' ? null : selectedRatio,
      imageScale: imageScale,
    };

    console.log('📷 [UnifiedCropModal] Aplicando settings (NAO-DESTRUTIVO):', settings);
    console.log('📷 [UnifiedCropModal] Rotacao total:', totalRotation);
    console.log('📷 [UnifiedCropModal] Crop relativo:', relativeRect);

    // NAO-DESTRUTIVO: Retorna APENAS settings
    // Imagem original NUNCA e alterada aqui
    // Processamento ocorre no PhotoEditorScreen apenas no momento do ENVIO
    onApply({ settings });
  }, [imageBounds, cropRect, totalRotation90, tempFineAngle, tempFlipH, tempFlipV, selectedRatio, imageScale, onApply]);

  // ========================================
  // Formatar Angulo para Exibicao
  // ========================================
  const formatAngle = useCallback((angle: number): string => {
    if (angle === 0) return '0°';
    if (angle > 0) return `+${angle.toFixed(1)}°`;
    return `${angle.toFixed(1)}°`;
  }, []);

  // ========================================
  // Render: Mascara Escurecida
  // ========================================
  const renderMask = () => {
    if (!imageLoaded || cropRect.width === 0) return null;

    return (
      <>
        {/* Topo */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: cropRect.y, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
        {/* Esquerda */}
        <div style={{ position: 'absolute', top: cropRect.y, left: 0, width: cropRect.x, height: cropRect.height, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
        {/* Direita */}
        <div style={{ position: 'absolute', top: cropRect.y, left: cropRect.x + cropRect.width, right: 0, height: cropRect.height, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
        {/* Fundo */}
        <div style={{ position: 'absolute', top: cropRect.y + cropRect.height, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
      </>
    );
  };

  // ========================================
  // Render: Grid Rule-of-Thirds
  // ========================================
  const renderGrid = () => {
    const { x, y, width, height } = cropRect;
    if (width === 0) return null;

    return (
      <div style={{ position: 'absolute', left: x, top: y, width, height, pointerEvents: 'none' }}>
        {/* Linhas horizontais */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '33.33%', height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '66.66%', height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        {/* Linhas verticais */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.33%', width: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66.66%', width: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        {/* Borda */}
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #FFFFFF' }} />
      </div>
    );
  };

  // ========================================
  // Render: 8 Handles de Controle
  // ========================================
  const renderHandles = () => {
    const { x, y, width, height } = cropRect;
    if (width === 0) return null;

    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      backgroundColor: '#FFFFFF',
      borderRadius: HANDLE_SIZE / 2,
      border: '1.5px solid #1777CF',
      transform: 'translate(-50%, -50%)',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
    };

    return (
      <>
        {/* 4 Cantos */}
        <div style={{ ...handleStyle, left: x, top: y, cursor: 'nwse-resize' }} />
        <div style={{ ...handleStyle, left: x + width, top: y, cursor: 'nesw-resize' }} />
        <div style={{ ...handleStyle, left: x, top: y + height, cursor: 'nesw-resize' }} />
        <div style={{ ...handleStyle, left: x + width, top: y + height, cursor: 'nwse-resize' }} />

        {/* 4 Meios dos Lados */}
        <div style={{ ...handleStyle, left: x + width / 2, top: y, cursor: 'ns-resize' }} />
        <div style={{ ...handleStyle, left: x + width / 2, top: y + height, cursor: 'ns-resize' }} />
        <div style={{ ...handleStyle, left: x, top: y + height / 2, cursor: 'ew-resize' }} />
        <div style={{ ...handleStyle, left: x + width, top: y + height / 2, cursor: 'ew-resize' }} />
      </>
    );
  };

  // ========================================
  // Cursor baseado no handle ativo
  // ========================================
  const getCursor = (): string => {
    if (!activeHandle) return 'default';
    switch (activeHandle) {
      case 'topLeft':
      case 'bottomRight':
        return 'nwse-resize';
      case 'topRight':
      case 'bottomLeft':
        return 'nesw-resize';
      case 'top':
      case 'bottom':
        return 'ns-resize';
      case 'left':
      case 'right':
        return 'ew-resize';
      case 'move':
        return 'move';
      default:
        return 'default';
    }
  };

  // ========================================
  // Render: Nao Web
  // ========================================
  if (Platform.OS !== 'web') {
    return null;
  }

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header: OK e Reset */}
        <View style={styles.header}>
          <Pressable style={styles.okButton} onPress={handleApply}>
            <Text style={styles.okButtonText}>OK</Text>
          </Pressable>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Resetar</Text>
          </Pressable>
        </View>

        {/* Area de Crop com Imagem */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: getCursor(),
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {/* Imagem com Transformacoes (rotacoes 90 ja aplicadas na imagem) */}
          {imageLoaded && (
            <img
              src={processedImageUri}
              style={{
                position: 'absolute',
                left: imageBounds.x,
                top: imageBounds.y,
                width: imageBounds.width,
                height: imageBounds.height,
                pointerEvents: 'none',
                transform: `scale(${imageScale}) rotate(${tempFineAngle}deg) scaleX(${tempFlipH ? -1 : 1}) scaleY(${tempFlipV ? -1 : 1})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
              alt=""
              draggable={false}
            />
          )}

          {/* Mascara Escurecida */}
          {renderMask()}

          {/* Grid Rule-of-Thirds */}
          {renderGrid()}

          {/* 8 Handles de Controle */}
          {renderHandles()}
        </div>

        {/* Dimensoes em Pixels */}
        <View style={styles.dimensionBar}>
          {/* Input Largura */}
          <View style={styles.dimGroup}>
            <Text style={styles.dimLabel}>L</Text>
            <View style={styles.dimInputBox}>
              <TextInput
                style={styles.dimInput}
                value={inputWidth}
                onChangeText={setInputWidth}
                onFocus={() => { isInputFocused.current = true; }}
                onBlur={handleWidthSubmit}
                onSubmitEditing={handleWidthSubmit}
                keyboardType="number-pad"
                selectTextOnFocus
                maxLength={5}
              />
              <Text style={styles.dimUnit}>px</Text>
            </View>
            <Pressable style={styles.dimStepBtn} onPress={() => handleWidthStep(-10)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M7 10l5 5 5-5z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
            <Pressable style={styles.dimStepBtn} onPress={() => handleWidthStep(10)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M7 14l5-5 5 5z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
          </View>

          {/* Separador */}
          <Text style={styles.dimSeparator}>x</Text>

          {/* Input Altura */}
          <View style={styles.dimGroup}>
            <Text style={styles.dimLabel}>A</Text>
            <View style={styles.dimInputBox}>
              <TextInput
                style={styles.dimInput}
                value={inputHeight}
                onChangeText={setInputHeight}
                onFocus={() => { isInputFocused.current = true; }}
                onBlur={handleHeightSubmit}
                onSubmitEditing={handleHeightSubmit}
                keyboardType="number-pad"
                selectTextOnFocus
                maxLength={5}
              />
              <Text style={styles.dimUnit}>px</Text>
            </View>
            <Pressable style={styles.dimStepBtn} onPress={() => handleHeightStep(-10)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M7 10l5 5 5-5z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
            <Pressable style={styles.dimStepBtn} onPress={() => handleHeightStep(10)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M7 14l5-5 5 5z" fill="#FFFFFF" />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* Slider de Angulo Fino */}
        <View style={styles.sliderContainer}>
          <Text style={styles.angleLabel}>{formatAngle(tempFineAngle)}</Text>

          {/* Container do Slider com Marca Central */}
          <View style={styles.sliderWrapper}>
            {/* Marca Central (0 graus) */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: 'rgba(255,255,255,0.5)',
              transform: 'translateX(-50%)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />

            {/* Marcacoes */}
            <View style={styles.sliderMarks} pointerEvents="none">
              <Text style={styles.markText}>-45°</Text>
              <Text style={styles.markText}>0°</Text>
              <Text style={styles.markText}>+45°</Text>
            </View>

          {/* Slider HTML */}
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={0.5}
            value={tempFineAngle}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="crop-angle-slider"
            style={{
              width: '100%',
              height: 32,
              cursor: 'pointer',
              background: 'transparent',
            } as React.CSSProperties}
          />
          <style>{`
            .crop-angle-slider {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
            }
            .crop-angle-slider::-webkit-slider-runnable-track {
              height: 4px;
              border-radius: 2px;
              background: linear-gradient(to right,
                rgba(255,255,255,0.3) 0%,
                rgba(255,255,255,0.3) 50%,
                rgba(255,255,255,0.3) 100%);
            }
            .crop-angle-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              background: #FFFFFF;
              border-radius: 50%;
              cursor: grab;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              margin-top: -8px;
            }
            .crop-angle-slider::-webkit-slider-thumb:active {
              cursor: grabbing;
              transform: scale(1.1);
            }
            .crop-angle-slider::-moz-range-track {
              height: 4px;
              border-radius: 2px;
              background: rgba(255,255,255,0.3);
            }
            .crop-angle-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: #FFFFFF;
              border-radius: 50%;
              cursor: grab;
              border: none;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            }
            .crop-angle-slider::-moz-range-thumb:active {
              cursor: grabbing;
            }
          `}</style>
          </View>
        </View>

        {/* Footer: Ferramentas */}
        <View style={styles.footer}>
          <Pressable style={styles.toolButton} onPress={handleRotate90}>
            <RotateIcon />
            <Text style={styles.toolButtonText}>Rotacionar</Text>
          </Pressable>

          <Pressable style={[styles.toolButton, tempFlipH && styles.toolButtonActive]} onPress={handleFlipH}>
            <FlipHIcon active={tempFlipH} />
            <Text style={[styles.toolButtonText, tempFlipH && styles.toolButtonTextActive]}>Espelhar H</Text>
          </Pressable>

          <Pressable style={[styles.toolButton, tempFlipV && styles.toolButtonActive]} onPress={handleFlipV}>
            <FlipVIcon active={tempFlipV} />
            <Text style={[styles.toolButtonText, tempFlipV && styles.toolButtonTextActive]}>Espelhar V</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: '#000000',             //......Fundo preto
  },

  // Header
  header: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espacar entre
    alignItems: 'center',                   //......Centraliza vertical
    paddingHorizontal: 16,                  //......Padding lateral
    paddingTop: 20,                         //......10px do topo
    paddingBottom: 12,                      //......Padding inferior
  },

  // Botao OK
  okButton: {
    paddingHorizontal: 20,                  //......Padding horizontal
    paddingVertical: 10,                    //......Padding vertical
    backgroundColor: '#FFFFFF',             //......Fundo branco
    borderRadius: 8,                        //......Bordas arredondadas
  },

  // Texto do botao OK
  okButtonText: {
    fontSize: 16,                           //......Tamanho fonte
    fontWeight: '600',                      //......Semi-bold
    color: '#000000',                       //......Texto preto
  },

  // Botao Reset
  resetButton: {
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingVertical: 8,                     //......Padding vertical
    backgroundColor: 'rgba(255,255,255,0.15)',  //......Fundo sutil
    borderRadius: 8,                        //......Bordas arredondadas
  },

  // Texto do botao Reset
  resetButtonText: {
    fontSize: 14,                           //......Tamanho fonte
    fontWeight: '500',                      //......Medium weight
    color: '#FFFFFF',                       //......Texto branco
  },

  // Barra de Dimensoes em Pixels
  dimensionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },

  // Grupo: Label + InputBox + BotaoDown + BotaoUp
  dimGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Label "L" ou "A"
  dimLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    width: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Caixa do input (numero + px)
  dimInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 36,
    paddingHorizontal: 6,
  },

  // Input numerico
  dimInput: {
    width: 54,
    height: 36,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 2,
    // @ts-ignore - Remove borda de foco no web
    outlineStyle: 'none',
    outlineWidth: 0,
    borderWidth: 0,
  },

  // Sufixo "px" fixo
  dimUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    marginLeft: -2,
    letterSpacing: 0.3,
  },

  // Botao de step (down ou up) - lado a lado, mesma altura do input
  dimStepBtn: {
    width: 32,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Separador "x"
  dimSeparator: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.3)',
  },

  // Container do slider
  sliderContainer: {
    paddingHorizontal: 20,                  //......Padding lateral
    paddingVertical: 8,                     //......Padding vertical
  },

  // Wrapper do slider com marca central
  sliderWrapper: {
    position: 'relative',                   //......Posicao relativa
  },

  // Label do angulo
  angleLabel: {
    color: '#FFFFFF',                       //......Texto branco
    fontSize: 18,                           //......Tamanho fonte
    fontWeight: '600',                      //......Semi-bold
    textAlign: 'center',                    //......Centralizado
    marginBottom: 4,                        //......Espaco inferior
  },

  // Marcacoes do slider
  sliderMarks: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espaco entre
    paddingHorizontal: 4,                   //......Padding lateral
    marginBottom: 4,                        //......Espaco inferior
  },

  // Texto das marcacoes
  markText: {
    color: 'rgba(255,255,255,0.5)',         //......Texto cinza claro
    fontSize: 11,                           //......Tamanho pequeno
  },

  // Footer
  footer: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-evenly',         //......Espaco uniforme
    alignItems: 'center',                   //......Centraliza vertical
    paddingVertical: 16,                    //......Padding vertical
    paddingBottom: 30,                      //......Safe area
    backgroundColor: 'rgba(0,0,0,0.6)',     //......Fundo semi-transparente
  },

  // Botao de ferramenta
  toolButton: {
    alignItems: 'center',                   //......Centraliza horizontal
    padding: 12,                            //......Padding
    borderRadius: 12,                       //......Bordas arredondadas
    minWidth: 80,                           //......Largura minima
  },

  // Botao de ferramenta ativo
  toolButtonActive: {
    backgroundColor: 'rgba(23,119,207,0.35)',  //......Fundo azul
  },

  // Texto do botao
  toolButtonText: {
    color: 'rgba(255,255,255,0.7)',         //......Texto cinza claro
    fontSize: 11,                           //......Tamanho pequeno
    fontWeight: '500',                      //......Medium
    marginTop: 6,                           //......Espaco superior
  },

  // Texto do botao ativo
  toolButtonTextActive: {
    color: '#FFFFFF',                       //......Texto branco
  },
});

// ========================================
// Export
// ========================================
export default UnifiedCropModal;
