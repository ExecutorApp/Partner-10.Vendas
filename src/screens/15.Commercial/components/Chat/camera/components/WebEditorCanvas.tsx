// ========================================
// Componente WebEditorCanvas - Parte 2
// Canvas de desenho para web com selecao e redimensionamento
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';

// ========================================
// Imports de Tipos
// ========================================
import { DrawingCategory, AnyDrawElement, FreedrawElement, HighlighterElement, ShapeElement, ArrowElement, TextElement, BlurElement, StickerElement, CategoryOptionsState, Point2D } from '../types/editorTypes';
import { generateElementId } from '../hooks/useDrawingElements';

// ========================================
// Imports de Funcoes de Renderizacao
// ========================================
import { renderShape, renderArrow, renderText, renderBlur, renderSticker, setStickerLoadCallback } from './WebEditorCanvas01';

// ========================================
// Constantes de Interacao
// ========================================
const HANDLE_SIZE = 12;                     //......Tamanho do handle
const HANDLE_HIT_AREA = 20;                 //......Area de clique do handle
const SELECTION_PADDING = 4;                //......Padding da selecao

// ========================================
// Tipos de Handle para Formas (8 pontos: 4 cantos + 4 meios)
// ========================================
type HandlePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom' | 'left' | 'right';

// ========================================
// Tipos de Handle para Setas (2 pontos: inicio e fim)
// ========================================
type ArrowHandlePosition = 'start' | 'end';

// ========================================
// Tipos de Modo de Interacao
// ========================================
type InteractionMode = 'draw' | 'select' | 'move' | 'resize';

// ========================================
// Tipos
// ========================================
interface WebEditorCanvasProps {
  imageUri: string;                         //......URI da imagem
  imageWidth: number;                       //......Largura original
  imageHeight: number;                      //......Altura original
  elements: AnyDrawElement[];               //......Elementos para renderizar
  activeCategory: DrawingCategory;          //......Categoria ativa
  categoryOptions: CategoryOptionsState;    //......Opcoes da categoria
  currentColor: string;                     //......Cor atual
  currentStrokeWidth: number;               //......Espessura atual
  isDrawingMode: boolean;                   //......Modo desenho ativo
  stickerInteractionOnly?: boolean;         //......Apenas interacao com stickers
  selectedElementId?: string | null;        //......ID do elemento selecionado
  fixedImageBounds?: { x: number; y: number; width: number; height: number } | null;  //......Bounds fixos para overlay
  rotation?: number;                        //......Rotacao em graus (0, 90, 180, 270)
  flipH?: boolean;                          //......Espelhado horizontal
  flipV?: boolean;                          //......Espelhado vertical
  onElementComplete: (element: AnyDrawElement) => void;  //......Callback elemento completo
  onElementUpdate?: (element: AnyDrawElement, addToHistory?: boolean) => void;  //......Callback elemento atualizado
  onSelectElement?: (elementId: string | null) => void;  //......Callback selecionar elemento
  onImageBoundsChange?: (bounds: { x: number; y: number; width: number; height: number }) => void;  //......Callback limites da imagem
  onExportCanvas?: (exportFn: () => Promise<string>) => void;  //......Callback para expor funcao de export
}

// ========================================
// Interface BoundingBox
// ========================================
interface BoundingBox {
  x: number;                                //......X do canto superior esquerdo
  y: number;                                //......Y do canto superior esquerdo
  width: number;                            //......Largura
  height: number;                           //......Altura
}

// ========================================
// Componente Principal WebEditorCanvas
// ========================================
const WebEditorCanvas: React.FC<WebEditorCanvasProps> = memo(({
  imageUri,
  imageWidth,
  imageHeight,
  elements,
  activeCategory,
  categoryOptions,
  currentColor,
  currentStrokeWidth,
  isDrawingMode,
  stickerInteractionOnly = false,
  selectedElementId,
  fixedImageBounds,
  rotation = 0,
  flipH = false,
  flipV = false,
  onElementComplete,
  onElementUpdate,
  onSelectElement,
  onImageBoundsChange,
  onExportCanvas,
}) => {
  // ========================================
  // Refs
  // ========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<Point2D[]>([]);
  const startPointRef = useRef<Point2D | null>(null);
  const endPointRef = useRef<Point2D | null>(null);

  // ========================================
  // Estado do Canvas
  // ========================================
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // ========================================
  // Limites da Imagem no Canvas
  // ========================================
  const [imageBounds, setImageBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // ========================================
  // Estado de Interacao
  // ========================================
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('draw');
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null);
  const [activeArrowHandle, setActiveArrowHandle] = useState<ArrowHandlePosition | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point2D | null>(null);
  const [originalElement, setOriginalElement] = useState<AnyDrawElement | null>(null);

  // ========================================
  // Calcular Tamanho do Canvas
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ========================================
  // Carregar Imagem
  // ========================================
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = (e) => {
      console.error('🎨 [WebEditorCanvas] Image load error:', e);
    };
    img.src = imageUri;
  }, [imageUri]);

  // ========================================
  // Calcular Limites da Imagem
  // Se fixedImageBounds fornecido, usar em vez de calcular
  // ========================================
  useEffect(() => {
    // Se fixedImageBounds fornecido, usar diretamente
    if (fixedImageBounds) {
      setImageBounds(fixedImageBounds);
      return;
    }

    if (!imageLoaded || !imageRef.current || canvasSize.width === 0) return;

    const img = imageRef.current;
    const containerAspect = canvasSize.width / canvasSize.height;
    const imageAspect = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageAspect > containerAspect) {
      drawWidth = canvasSize.width;
      drawHeight = canvasSize.width / imageAspect;
      offsetX = 0;
      offsetY = (canvasSize.height - drawHeight) / 2;
    } else {
      drawHeight = canvasSize.height;
      drawWidth = canvasSize.height * imageAspect;
      offsetX = (canvasSize.width - drawWidth) / 2;
      offsetY = 0;
    }

    const newBounds = { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight };
    setImageBounds(newBounds);
    onImageBoundsChange?.(newBounds);
  }, [imageLoaded, canvasSize, onImageBoundsChange, fixedImageBounds]);

  // ========================================
  // Funcao Clamp: Restringe ponto aos limites da imagem
  // Padding opcional para considerar espessura do traco
  // ========================================
  const clampPoint = useCallback((point: Point2D, padding: number = 0): Point2D => {
    return {
      x: Math.max(imageBounds.x + padding, Math.min(point.x, imageBounds.x + imageBounds.width - padding)),
      y: Math.max(imageBounds.y + padding, Math.min(point.y, imageBounds.y + imageBounds.height - padding)),
    };
  }, [imageBounds]);

  // ========================================
  // Verificar se ponto esta dentro da imagem
  // ========================================
  const isPointInImage = useCallback((point: Point2D): boolean => {
    return (
      point.x >= imageBounds.x &&
      point.x <= imageBounds.x + imageBounds.width &&
      point.y >= imageBounds.y &&
      point.y <= imageBounds.y + imageBounds.height
    );
  }, [imageBounds]);

  // ========================================
  // Obter BoundingBox de um Elemento
  // ========================================
  const getBoundingBox = useCallback((element: AnyDrawElement): BoundingBox | null => {
    switch (element.category) {
      case 'shape': {
        const shape = element as ShapeElement;
        const x = Math.min(shape.startPoint.x, shape.endPoint.x);
        const y = Math.min(shape.startPoint.y, shape.endPoint.y);
        const width = Math.abs(shape.endPoint.x - shape.startPoint.x);
        const height = Math.abs(shape.endPoint.y - shape.startPoint.y);
        return { x, y, width, height };
      }
      case 'arrow': {
        const arrow = element as ArrowElement;
        const x = Math.min(arrow.startPoint.x, arrow.endPoint.x);
        const y = Math.min(arrow.startPoint.y, arrow.endPoint.y);
        const width = Math.abs(arrow.endPoint.x - arrow.startPoint.x);
        const height = Math.abs(arrow.endPoint.y - arrow.startPoint.y);
        return { x, y, width, height };
      }
      case 'text': {
        const text = element as TextElement;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return null;
        const fontName = text.fontFamily || 'Arial';
        ctx.font = `${text.bold ? 'bold' : 'normal'} ${text.fontSize}px "${fontName}", sans-serif`;
        const displayText = text.uppercase ? text.text.toUpperCase() : text.text;
        const metrics = ctx.measureText(displayText);
        const textWidth = metrics.width;
        const textHeight = text.fontSize * 1.2;
        // Position e o centro do texto, calcula x,y como canto superior esquerdo
        return {
          x: text.position.x - textWidth / 2,
          y: text.position.y - textHeight / 2,
          width: textWidth,
          height: textHeight,
        };
      }
      case 'blur': {
        const blur = element as BlurElement;
        if (blur.points.length < 2) return null;
        const halfStroke = blur.strokeWidth / 2;
        const bounds = blur.points.reduce(
          (acc, point) => ({
            minX: Math.min(acc.minX, point.x - halfStroke),
            minY: Math.min(acc.minY, point.y - halfStroke),
            maxX: Math.max(acc.maxX, point.x + halfStroke),
            maxY: Math.max(acc.maxY, point.y + halfStroke),
          }),
          { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        );
        return { x: bounds.minX, y: bounds.minY, width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };
      }
      case 'sticker': {
        const sticker = element as StickerElement;
        const baseSize = 64 * sticker.scale;
        return {
          x: sticker.position.x - baseSize / 2,
          y: sticker.position.y - baseSize / 2,
          width: baseSize,
          height: baseSize,
        };
      }
      default:
        return null;
    }
  }, []);

  // ========================================
  // Hit Test: Verifica se ponto esta em um elemento
  // ========================================
  const hitTestElement = useCallback((point: Point2D, element: AnyDrawElement): boolean => {
    const bbox = getBoundingBox(element);
    if (!bbox) return false;

    const padding = element.strokeWidth / 2 + SELECTION_PADDING;
    return (
      point.x >= bbox.x - padding &&
      point.x <= bbox.x + bbox.width + padding &&
      point.y >= bbox.y - padding &&
      point.y <= bbox.y + bbox.height + padding
    );
  }, [getBoundingBox]);

  // ========================================
  // Hit Test: Verifica se ponto esta em um handle (8 pontos)
  // ========================================
  const hitTestHandle = useCallback((point: Point2D, bbox: BoundingBox): HandlePosition | null => {
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    const handles: { pos: HandlePosition; x: number; y: number }[] = [
      // 4 cantos
      { pos: 'topLeft', x: bbox.x, y: bbox.y },
      { pos: 'topRight', x: bbox.x + bbox.width, y: bbox.y },
      { pos: 'bottomLeft', x: bbox.x, y: bbox.y + bbox.height },
      { pos: 'bottomRight', x: bbox.x + bbox.width, y: bbox.y + bbox.height },
      // 4 meios
      { pos: 'top', x: centerX, y: bbox.y },
      { pos: 'bottom', x: centerX, y: bbox.y + bbox.height },
      { pos: 'left', x: bbox.x, y: centerY },
      { pos: 'right', x: bbox.x + bbox.width, y: centerY },
    ];

    for (const handle of handles) {
      const dx = point.x - handle.x;
      const dy = point.y - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_HIT_AREA) {
        return handle.pos;
      }
    }
    return null;
  }, []);

  // ========================================
  // Hit Test: Verifica se ponto esta em um handle de seta (2 pontos)
  // ========================================
  const hitTestArrowHandle = useCallback((point: Point2D, arrow: ArrowElement): ArrowHandlePosition | null => {
    const handles: { pos: ArrowHandlePosition; x: number; y: number }[] = [
      { pos: 'start', x: arrow.startPoint.x, y: arrow.startPoint.y },
      { pos: 'end', x: arrow.endPoint.x, y: arrow.endPoint.y },
    ];

    for (const handle of handles) {
      const dx = point.x - handle.x;
      const dy = point.y - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_HIT_AREA) {
        return handle.pos;
      }
    }
    return null;
  }, []);

  // ========================================
  // Encontrar elemento no ponto
  // ========================================
  const findElementAtPoint = useCallback((point: Point2D): AnyDrawElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if ((element.category === 'shape' || element.category === 'arrow' || element.category === 'text' || element.category === 'blur' || element.category === 'sticker') && hitTestElement(point, element)) {
        return element;
      }
    }
    return null;
  }, [elements, hitTestElement]);

  // ========================================
  // Renderizar Handles de Selecao
  // hideHandles: true para texto (apenas borda tracejada)
  // cornersOnly: true para stickers (apenas 4 cantos)
  // ========================================
  const renderSelectionHandles = useCallback((ctx: CanvasRenderingContext2D, element: AnyDrawElement, hideHandles: boolean = false, cornersOnly: boolean = false) => {
    const bbox = getBoundingBox(element);
    if (!bbox) return;

    ctx.save();

    // Desenhar borda de selecao
    ctx.strokeStyle = '#1777CF';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bbox.x - SELECTION_PADDING, bbox.y - SELECTION_PADDING, bbox.width + SELECTION_PADDING * 2, bbox.height + SELECTION_PADDING * 2);
    ctx.setLineDash([]);

    // Nao desenhar handles para texto (apenas borda tracejada)
    if (hideHandles) {
      ctx.restore();
      return;
    }

    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    // Handles para desenhar
    let handles: { x: number; y: number }[];

    if (cornersOnly) {
      // Apenas 4 cantos para stickers (redimensionamento proporcional)
      handles = [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x, y: bbox.y + bbox.height },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
      ];
    } else {
      // 8 handles: 4 cantos + 4 meios para formas
      handles = [
        { x: bbox.x, y: bbox.y },
        { x: bbox.x + bbox.width, y: bbox.y },
        { x: bbox.x, y: bbox.y + bbox.height },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height },
        { x: centerX, y: bbox.y },
        { x: centerX, y: bbox.y + bbox.height },
        { x: bbox.x, y: centerY },
        { x: bbox.x + bbox.width, y: centerY },
      ];
    }

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#1777CF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }, [getBoundingBox]);

  // ========================================
  // Renderizar Handles de Seta (2 pontos: inicio e fim)
  // ========================================
  const renderArrowSelectionHandles = useCallback((ctx: CanvasRenderingContext2D, arrow: ArrowElement) => {
    ctx.save();

    // Desenhar os 2 handles: inicio e fim
    const handles = [
      { x: arrow.startPoint.x, y: arrow.startPoint.y },
      { x: arrow.endPoint.x, y: arrow.endPoint.y },
    ];

    handles.forEach((handle) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#1777CF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }, []);

  // ========================================
  // Renderizar Elemento no Canvas
  // imageBounds opcional para blur usar bounds especificos
  // ========================================
  const renderElement = useCallback((ctx: CanvasRenderingContext2D, element: AnyDrawElement, elementImageBounds?: { x: number; y: number; width: number; height: number }) => {
    switch (element.category) {
      case 'freedraw':
      case 'highlighter': {
        const pathElement = element as FreedrawElement | HighlighterElement;
        if (pathElement.points.length < 2) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pathElement.points[0].x, pathElement.points[0].y);

        for (let i = 1; i < pathElement.points.length; i++) {
          ctx.lineTo(pathElement.points[i].x, pathElement.points[i].y);
        }

        ctx.strokeStyle = pathElement.color;
        ctx.lineWidth = pathElement.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = pathElement.opacity;
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'shape': {
        const shapeElement = element as ShapeElement;
        renderShape(ctx, shapeElement.startPoint, shapeElement.endPoint, shapeElement.shapeType, shapeElement.filled, shapeElement.color, shapeElement.strokeWidth, shapeElement.opacity);
        break;
      }

      case 'arrow': {
        const arrowElement = element as ArrowElement;
        renderArrow(ctx, arrowElement.startPoint, arrowElement.endPoint, arrowElement.arrowType, arrowElement.color, arrowElement.strokeWidth, arrowElement.opacity);
        break;
      }

      case 'blur': {
        const blurElement = element as BlurElement;
        renderBlur(ctx, blurElement, imageRef.current, canvasSize, elementImageBounds);
        break;
      }

      case 'text': {
        const textElement = element as TextElement;
        renderText(ctx, textElement);
        break;
      }

      case 'sticker': {
        const stickerElement = element as StickerElement;
        renderSticker(ctx, stickerElement);
        break;
      }
    }
  }, [canvasSize]);

  // ========================================
  // Calcular Bounds Atuais do Container
  // ========================================
  const calculateCurrentBounds = useCallback(() => {
    const img = imageRef.current;
    if (!img || canvasSize.width === 0 || canvasSize.height === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const containerAspect = canvasSize.width / canvasSize.height;
    const imageAspect = img.width / img.height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imageAspect > containerAspect) {
      drawWidth = canvasSize.width;
      drawHeight = canvasSize.width / imageAspect;
      offsetX = 0;
      offsetY = (canvasSize.height - drawHeight) / 2;
    } else {
      drawHeight = canvasSize.height;
      drawWidth = canvasSize.height * imageAspect;
      offsetX = (canvasSize.width - drawWidth) / 2;
      offsetY = 0;
    }

    return { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight };
  }, [canvasSize]);

  // ========================================
  // Transformar Elemento de Bounds Origem para Destino
  // ========================================
  const transformElement = useCallback((element: AnyDrawElement, fromBounds: { x: number; y: number; width: number; height: number }, toBounds: { x: number; y: number; width: number; height: number }): AnyDrawElement => {
    // Calcular escala e offset
    const scaleX = toBounds.width / fromBounds.width;
    const scaleY = toBounds.height / fromBounds.height;

    // Transformar ponto de um sistema para outro
    const transformPoint = (p: Point2D): Point2D => ({
      x: toBounds.x + (p.x - fromBounds.x) * scaleX,
      y: toBounds.y + (p.y - fromBounds.y) * scaleY,
    });

    // Fator de escala para espessuras
    const scaleFactor = Math.min(scaleX, scaleY);

    switch (element.category) {
      case 'shape': {
        const shape = element as ShapeElement;
        return { ...shape, startPoint: transformPoint(shape.startPoint), endPoint: transformPoint(shape.endPoint), strokeWidth: shape.strokeWidth * scaleFactor };
      }
      case 'arrow': {
        const arrow = element as ArrowElement;
        return { ...arrow, startPoint: transformPoint(arrow.startPoint), endPoint: transformPoint(arrow.endPoint), strokeWidth: arrow.strokeWidth * scaleFactor };
      }
      case 'text': {
        const text = element as TextElement;
        return { ...text, position: transformPoint(text.position), fontSize: text.fontSize * scaleFactor };
      }
      case 'blur': {
        const blur = element as BlurElement;
        return { ...blur, points: blur.points.map(transformPoint), strokeWidth: blur.strokeWidth * scaleFactor, intensity: blur.intensity * scaleFactor };
      }
      case 'highlighter': {
        const highlighter = element as HighlighterElement;
        return { ...highlighter, points: highlighter.points.map(transformPoint), strokeWidth: highlighter.strokeWidth * scaleFactor };
      }
      case 'freedraw': {
        const freedraw = element as FreedrawElement;
        return { ...freedraw, points: freedraw.points.map(transformPoint), strokeWidth: freedraw.strokeWidth * scaleFactor };
      }
      case 'sticker': {
        const sticker = element as StickerElement;
        return { ...sticker, position: transformPoint(sticker.position), scale: sticker.scale * scaleFactor };
      }
      default:
        return element;
    }
  }, []);

  // ========================================
  // Desenhar Canvas
  // Transforma elementos se fixedImageBounds fornecido
  // Aplica clipping para ocultar partes fora da imagem
  // Aplica rotacao e espelhamento se especificado
  // ========================================
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcular bounds atuais do container
    const currentBounds = calculateCurrentBounds();
    if (currentBounds.width <= 0 || currentBounds.height <= 0) return;

    // ========================================
    // Aplicar transformacoes (rotacao + espelhamento)
    // ========================================
    ctx.save();

    // Mover origem para centro da imagem
    const centerX = currentBounds.x + currentBounds.width / 2;
    const centerY = currentBounds.y + currentBounds.height / 2;
    ctx.translate(centerX, centerY);

    // Aplicar rotacao
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    // Aplicar espelhamentos
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Voltar origem para desenhar
    ctx.translate(-centerX, -centerY);

    // Desenhar imagem na posicao correta para o container atual
    ctx.drawImage(img, currentBounds.x, currentBounds.y, currentBounds.width, currentBounds.height);

    // Verificar se precisa transformar elementos (overlay com fixedImageBounds)
    const needsTransform = fixedImageBounds && fixedImageBounds.width > 0 && fixedImageBounds.height > 0;

    // Debug log
    if (elements.length > 0) {
      console.log('🎨 [WebEditorCanvas] drawCanvas:', {
        canvasSize,
        currentBounds,
        fixedImageBounds,
        needsTransform,
        elementsCount: elements.length,
      });
    }

    // Armazenar elementos transformados para renderizar handles depois
    const displayElements: { original: AnyDrawElement; display: AnyDrawElement }[] = [];

    // ========================================
    // CLIPPING: Aplicar mascara na area da imagem
    // Elementos fora da imagem serao ocultados
    // ========================================
    ctx.save();
    ctx.beginPath();
    ctx.rect(currentBounds.x, currentBounds.y, currentBounds.width, currentBounds.height);
    ctx.clip();

    // Renderizar elementos dentro do clipping
    elements.forEach((element) => {
      // Transformar elemento se necessario (do sistema do modal para o sistema do overlay)
      const displayElement = needsTransform ? transformElement(element, fixedImageBounds, currentBounds) : element;
      displayElements.push({ original: element, display: displayElement });

      // Passar currentBounds para blur usar posicao correta da imagem
      renderElement(ctx, displayElement, currentBounds);
    });

    // Preview do elemento atual (dentro do clipping)
    const start = startPointRef.current;
    const end = endPointRef.current;

    if (activeCategory === 'shape' && start && end && interactionMode === 'draw') {
      renderShape(ctx, start, end, categoryOptions.shape.shapeType, categoryOptions.shape.filled, currentColor, currentStrokeWidth, 1);
    } else if (activeCategory === 'arrow' && start && end && interactionMode === 'draw') {
      renderArrow(ctx, start, end, categoryOptions.arrow.arrowType, currentColor, currentStrokeWidth, 1);
    } else if (interactionMode === 'draw') {
      const currentPoints = currentPointsRef.current;
      if (currentPoints.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

        for (let i = 1; i < currentPoints.length; i++) {
          ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }

        // Blur usa cor vermelha semi-transparente para preview
        if (activeCategory === 'blur') {
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        } else {
          ctx.strokeStyle = currentColor;
        }

        ctx.lineWidth = currentStrokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (activeCategory === 'highlighter') {
          ctx.globalAlpha = categoryOptions.highlighter.opacity;
        }

        ctx.stroke();
      }
    }

    // Restaurar contexto (remover clipping)
    ctx.restore();

    // Restaurar contexto (remover transformacoes)
    ctx.restore();

    // ========================================
    // Renderizar handles de selecao FORA das transformacoes
    // Para que sejam visiveis e clicaveis sem distorcao
    // ========================================
    displayElements.forEach(({ original, display }) => {
      if (original.id === selectedElementId) {
        // Setas usam 2 handles, formas usam 8 handles, stickers usam 4 cantos, texto sem handles
        if (display.category === 'arrow') {
          renderArrowSelectionHandles(ctx, display as ArrowElement);
        } else if (display.category === 'text') {
          renderSelectionHandles(ctx, display, true, false);
        } else if (display.category === 'sticker') {
          renderSelectionHandles(ctx, display, false, true);
        } else {
          renderSelectionHandles(ctx, display, false, false);
        }
      }
    });
  }, [canvasSize, elements, currentColor, currentStrokeWidth, activeCategory, categoryOptions, renderElement, selectedElementId, renderSelectionHandles, renderArrowSelectionHandles, interactionMode, calculateCurrentBounds, transformElement, fixedImageBounds, rotation, flipH, flipV]);

  // ========================================
  // Redesenhar quando necessario
  // ========================================
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, canvasSize, elements, drawCanvas, selectedElementId]);

  // ========================================
  // Registrar Callback para Redraw quando Sticker Carregar
  // ========================================
  useEffect(() => {
    setStickerLoadCallback(() => {
      console.log('🖼️ [WebEditorCanvas] Sticker carregou, redesenhando...');
      drawCanvas();
    });
    return () => {
      setStickerLoadCallback(null);
    };
  }, [drawCanvas]);

  // ========================================
  // Obter Posicao do Evento (React)
  // ========================================
  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // ========================================
  // Obter Posicao do Evento (Nativo)
  // ========================================
  const getNativeEventPosition = useCallback((e: MouseEvent | TouchEvent): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
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
  // Refs para valores atuais nos listeners
  // ========================================
  const isDrawingModeRef = useRef(isDrawingMode);
  const stickerInteractionOnlyRef = useRef(stickerInteractionOnly);
  const activeCategoryRef = useRef(activeCategory);
  const currentColorRef = useRef(currentColor);
  const currentStrokeWidthRef = useRef(currentStrokeWidth);
  const categoryOptionsRef = useRef(categoryOptions);
  const onElementCompleteRef = useRef(onElementComplete);
  const onElementUpdateRef = useRef(onElementUpdate);
  const onSelectElementRef = useRef(onSelectElement);
  const drawCanvasRef = useRef(drawCanvas);
  const selectedElementIdRef = useRef(selectedElementId);
  const elementsRef = useRef(elements);
  const interactionModeRef = useRef(interactionMode);
  const activeArrowHandleRef = useRef(activeArrowHandle);
  const clampPointRef = useRef(clampPoint);
  const isPointInImageRef = useRef(isPointInImage);
  const imageBoundsRef = useRef(imageBounds);

  useEffect(() => { isDrawingModeRef.current = isDrawingMode; }, [isDrawingMode]);
  useEffect(() => { stickerInteractionOnlyRef.current = stickerInteractionOnly; }, [stickerInteractionOnly]);
  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);
  useEffect(() => { currentColorRef.current = currentColor; }, [currentColor]);
  useEffect(() => { currentStrokeWidthRef.current = currentStrokeWidth; }, [currentStrokeWidth]);
  useEffect(() => { categoryOptionsRef.current = categoryOptions; }, [categoryOptions]);
  useEffect(() => { onElementCompleteRef.current = onElementComplete; }, [onElementComplete]);
  useEffect(() => { onElementUpdateRef.current = onElementUpdate; }, [onElementUpdate]);
  useEffect(() => { onSelectElementRef.current = onSelectElement; }, [onSelectElement]);
  useEffect(() => { drawCanvasRef.current = drawCanvas; }, [drawCanvas]);
  useEffect(() => { selectedElementIdRef.current = selectedElementId; }, [selectedElementId]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { interactionModeRef.current = interactionMode; }, [interactionMode]);
  useEffect(() => { activeArrowHandleRef.current = activeArrowHandle; }, [activeArrowHandle]);
  useEffect(() => { clampPointRef.current = clampPoint; }, [clampPoint]);
  useEffect(() => { isPointInImageRef.current = isPointInImage; }, [isPointInImage]);
  useEffect(() => { imageBoundsRef.current = imageBounds; }, [imageBounds]);

  // ========================================
  // Criar Elemento Baseado na Categoria
  // ========================================
  const createElementFromPoints = useCallback((): AnyDrawElement | null => {
    const category = activeCategoryRef.current;
    const color = currentColorRef.current;
    const strokeWidth = currentStrokeWidthRef.current;
    const options = categoryOptionsRef.current;

    const baseElement = { id: generateElementId(), color, strokeWidth, timestamp: Date.now() };

    switch (category) {
      case 'freedraw': {
        const points = currentPointsRef.current;
        if (points.length < 2) return null;
        return { ...baseElement, category: 'freedraw', opacity: 1, points: [...points] } as FreedrawElement;
      }
      case 'highlighter': {
        const points = currentPointsRef.current;
        if (points.length < 2) return null;
        return { ...baseElement, category: 'highlighter', opacity: options.highlighter.opacity, points: [...points] } as HighlighterElement;
      }
      case 'shape': {
        const start = startPointRef.current;
        const end = endPointRef.current;
        if (!start || !end) return null;
        return { ...baseElement, category: 'shape', opacity: 1, shapeType: options.shape.shapeType, filled: options.shape.filled, startPoint: { ...start }, endPoint: { ...end } } as ShapeElement;
      }
      case 'arrow': {
        const start = startPointRef.current;
        const end = endPointRef.current;
        if (!start || !end) return null;
        return { ...baseElement, category: 'arrow', opacity: 1, arrowType: options.arrow.arrowType, startPoint: { ...start }, endPoint: { ...end } } as ArrowElement;
      }
      case 'blur': {
        const points = currentPointsRef.current;
        if (points.length < 2) return null;
        return { ...baseElement, category: 'blur', opacity: 1, blurType: options.blur.blurType, intensity: options.blur.intensity, points: [...points] } as BlurElement;
      }
      default: {
        const points = currentPointsRef.current;
        if (points.length < 2) return null;
        return { ...baseElement, category: 'freedraw', opacity: 1, points: [...points] } as FreedrawElement;
      }
    }
  }, []);

  // ========================================
  // Verificar se categoria usa dois pontos
  // ========================================
  const usesTwoPoints = useCallback((category: DrawingCategory): boolean => {
    return category === 'shape' || category === 'arrow';
  }, []);

  // ========================================
  // Aplicar redimensionamento a um elemento (8 handles)
  // Recebe bounds para clampar pontos dentro da imagem considerando strokeWidth
  // ========================================
  const applyResize = useCallback((element: AnyDrawElement, handle: HandlePosition, delta: Point2D, bounds: { x: number; y: number; width: number; height: number }): AnyDrawElement => {
    // Padding baseado na espessura do traco
    const strokePadding = element.strokeWidth / 2;

    // Funcao auxiliar para clampar ponto dentro dos bounds com padding
    const clampToBounds = (point: Point2D): Point2D => ({
      x: Math.max(bounds.x + strokePadding, Math.min(point.x, bounds.x + bounds.width - strokePadding)),
      y: Math.max(bounds.y + strokePadding, Math.min(point.y, bounds.y + bounds.height - strokePadding)),
    });

    if (element.category === 'shape') {
      const shape = { ...(element as ShapeElement) };
      let newStart = { ...shape.startPoint };
      let newEnd = { ...shape.endPoint };

      switch (handle) {
        // Cantos (redimensionam em ambos os eixos)
        case 'topLeft':
          newStart.x = Math.min(newStart.x + delta.x, newEnd.x - 10);
          newStart.y = Math.min(newStart.y + delta.y, newEnd.y - 10);
          break;
        case 'topRight':
          newEnd.x = Math.max(newEnd.x + delta.x, newStart.x + 10);
          newStart.y = Math.min(newStart.y + delta.y, newEnd.y - 10);
          break;
        case 'bottomLeft':
          newStart.x = Math.min(newStart.x + delta.x, newEnd.x - 10);
          newEnd.y = Math.max(newEnd.y + delta.y, newStart.y + 10);
          break;
        case 'bottomRight':
          newEnd.x = Math.max(newEnd.x + delta.x, newStart.x + 10);
          newEnd.y = Math.max(newEnd.y + delta.y, newStart.y + 10);
          break;
        // Meios (redimensionam em um eixo apenas)
        case 'top':
          newStart.y = Math.min(newStart.y + delta.y, newEnd.y - 10);
          break;
        case 'bottom':
          newEnd.y = Math.max(newEnd.y + delta.y, newStart.y + 10);
          break;
        case 'left':
          newStart.x = Math.min(newStart.x + delta.x, newEnd.x - 10);
          break;
        case 'right':
          newEnd.x = Math.max(newEnd.x + delta.x, newStart.x + 10);
          break;
      }

      // Clampar pontos dentro dos bounds
      shape.startPoint = clampToBounds(newStart);
      shape.endPoint = clampToBounds(newEnd);
      return shape;
    }

    if (element.category === 'arrow') {
      const arrow = { ...(element as ArrowElement) };
      let newStart = { ...arrow.startPoint };
      let newEnd = { ...arrow.endPoint };

      switch (handle) {
        // Cantos
        case 'topLeft':
          newStart.x += delta.x;
          newStart.y += delta.y;
          break;
        case 'topRight':
          newEnd.x += delta.x;
          newStart.y += delta.y;
          break;
        case 'bottomLeft':
          newStart.x += delta.x;
          newEnd.y += delta.y;
          break;
        case 'bottomRight':
          newEnd.x += delta.x;
          newEnd.y += delta.y;
          break;
        // Meios (redimensionam em um eixo apenas)
        case 'top':
          newStart.y += delta.y;
          break;
        case 'bottom':
          newEnd.y += delta.y;
          break;
        case 'left':
          newStart.x += delta.x;
          break;
        case 'right':
          newEnd.x += delta.x;
          break;
      }

      // Clampar pontos dentro dos bounds
      arrow.startPoint = clampToBounds(newStart);
      arrow.endPoint = clampToBounds(newEnd);
      return arrow;
    }

    if (element.category === 'blur') {
      const blur = { ...(element as BlurElement) };
      if (blur.points.length < 2) return blur;

      // Calcular bounding box original dos pontos
      const halfStroke = blur.strokeWidth / 2;
      const oldBounds = blur.points.reduce(
        (acc, p) => ({
          minX: Math.min(acc.minX, p.x - halfStroke),
          minY: Math.min(acc.minY, p.y - halfStroke),
          maxX: Math.max(acc.maxX, p.x + halfStroke),
          maxY: Math.max(acc.maxY, p.y + halfStroke),
        }),
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      // Calcular novo bounding box baseado no handle arrastado
      let newMinX = oldBounds.minX;
      let newMinY = oldBounds.minY;
      let newMaxX = oldBounds.maxX;
      let newMaxY = oldBounds.maxY;

      switch (handle) {
        case 'topLeft':
          newMinX = Math.min(newMinX + delta.x, newMaxX - 10);
          newMinY = Math.min(newMinY + delta.y, newMaxY - 10);
          break;
        case 'topRight':
          newMaxX = Math.max(newMaxX + delta.x, newMinX + 10);
          newMinY = Math.min(newMinY + delta.y, newMaxY - 10);
          break;
        case 'bottomLeft':
          newMinX = Math.min(newMinX + delta.x, newMaxX - 10);
          newMaxY = Math.max(newMaxY + delta.y, newMinY + 10);
          break;
        case 'bottomRight':
          newMaxX = Math.max(newMaxX + delta.x, newMinX + 10);
          newMaxY = Math.max(newMaxY + delta.y, newMinY + 10);
          break;
        case 'top':
          newMinY = Math.min(newMinY + delta.y, newMaxY - 10);
          break;
        case 'bottom':
          newMaxY = Math.max(newMaxY + delta.y, newMinY + 10);
          break;
        case 'left':
          newMinX = Math.min(newMinX + delta.x, newMaxX - 10);
          break;
        case 'right':
          newMaxX = Math.max(newMaxX + delta.x, newMinX + 10);
          break;
      }

      // Clampar bounds dentro da imagem considerando strokePadding
      newMinX = Math.max(bounds.x + strokePadding, newMinX);
      newMinY = Math.max(bounds.y + strokePadding, newMinY);
      newMaxX = Math.min(bounds.x + bounds.width - strokePadding, newMaxX);
      newMaxY = Math.min(bounds.y + bounds.height - strokePadding, newMaxY);

      // Calcular fatores de escala
      const oldWidth = oldBounds.maxX - oldBounds.minX;
      const oldHeight = oldBounds.maxY - oldBounds.minY;
      const newWidth = newMaxX - newMinX;
      const newHeight = newMaxY - newMinY;
      const scaleX = oldWidth > 0 ? newWidth / oldWidth : 1;
      const scaleY = oldHeight > 0 ? newHeight / oldHeight : 1;

      // Escalar todos os pontos proporcionalmente
      blur.points = blur.points.map(p => ({
        x: newMinX + halfStroke + (p.x - halfStroke - oldBounds.minX) * scaleX,
        y: newMinY + halfStroke + (p.y - halfStroke - oldBounds.minY) * scaleY,
      }));

      return blur;
    }

    // Sticker: Redimensionamento PROPORCIONAL pelos cantos
    if (element.category === 'sticker') {
      const sticker = { ...(element as StickerElement) };
      const baseSize = 64 * sticker.scale;
      const centerX = sticker.position.x;
      const centerY = sticker.position.y;

      // Calcular bbox atual
      const currentMinX = centerX - baseSize / 2;
      const currentMinY = centerY - baseSize / 2;
      const currentMaxX = centerX + baseSize / 2;
      const currentMaxY = centerY + baseSize / 2;

      // Calcular novo tamanho baseado no handle arrastado
      let newMinX = currentMinX;
      let newMinY = currentMinY;
      let newMaxX = currentMaxX;
      let newMaxY = currentMaxY;

      // Determinar ponto ancora (oposto ao handle arrastado)
      let anchorX = centerX;
      let anchorY = centerY;

      switch (handle) {
        case 'topLeft':
          anchorX = currentMaxX;
          anchorY = currentMaxY;
          newMinX = Math.min(currentMinX + delta.x, currentMaxX - 30);
          newMinY = Math.min(currentMinY + delta.y, currentMaxY - 30);
          break;
        case 'topRight':
          anchorX = currentMinX;
          anchorY = currentMaxY;
          newMaxX = Math.max(currentMaxX + delta.x, currentMinX + 30);
          newMinY = Math.min(currentMinY + delta.y, currentMaxY - 30);
          break;
        case 'bottomLeft':
          anchorX = currentMaxX;
          anchorY = currentMinY;
          newMinX = Math.min(currentMinX + delta.x, currentMaxX - 30);
          newMaxY = Math.max(currentMaxY + delta.y, currentMinY + 30);
          break;
        case 'bottomRight':
          anchorX = currentMinX;
          anchorY = currentMinY;
          newMaxX = Math.max(currentMaxX + delta.x, currentMinX + 30);
          newMaxY = Math.max(currentMaxY + delta.y, currentMinY + 30);
          break;
        default:
          return sticker;
      }

      // Calcular novo tamanho mantendo proporcao
      const newWidth = newMaxX - newMinX;
      const newHeight = newMaxY - newMinY;
      const newSize = Math.max(30, Math.max(newWidth, newHeight));

      // Calcular nova escala
      const newScale = newSize / 64;

      // Calcular nova posicao (centro) baseado na ancora
      let newCenterX = centerX;
      let newCenterY = centerY;

      switch (handle) {
        case 'topLeft':
          newCenterX = anchorX - newSize / 2;
          newCenterY = anchorY - newSize / 2;
          break;
        case 'topRight':
          newCenterX = anchorX + newSize / 2;
          newCenterY = anchorY - newSize / 2;
          break;
        case 'bottomLeft':
          newCenterX = anchorX - newSize / 2;
          newCenterY = anchorY + newSize / 2;
          break;
        case 'bottomRight':
          newCenterX = anchorX + newSize / 2;
          newCenterY = anchorY + newSize / 2;
          break;
      }

      // Clampar posicao dentro dos bounds
      const halfNewSize = newSize / 2;
      newCenterX = Math.max(bounds.x + halfNewSize, Math.min(newCenterX, bounds.x + bounds.width - halfNewSize));
      newCenterY = Math.max(bounds.y + halfNewSize, Math.min(newCenterY, bounds.y + bounds.height - halfNewSize));

      sticker.position = { x: newCenterX, y: newCenterY };
      sticker.scale = newScale;

      return sticker;
    }

    return element;
  }, []);

  // ========================================
  // Aplicar redimensionamento a uma seta (2 handles)
  // ========================================
  const applyArrowResize = useCallback((arrow: ArrowElement, handle: ArrowHandlePosition, newPos: Point2D): ArrowElement => {
    const updatedArrow = { ...arrow };

    if (handle === 'start') {
      updatedArrow.startPoint = { ...newPos };
    } else if (handle === 'end') {
      updatedArrow.endPoint = { ...newPos };
    }

    return updatedArrow;
  }, []);

  // ========================================
  // Aplicar movimento a um elemento
  // Recebe delta e limita aos bounds da imagem considerando strokeWidth
  // ========================================
  const applyMove = useCallback((element: AnyDrawElement, delta: Point2D, bounds: { x: number; y: number; width: number; height: number }): AnyDrawElement => {
    // Padding baseado na espessura do traco
    const strokePadding = element.strokeWidth / 2;

    // Bounds ajustados com padding
    const paddedBounds = {
      x: bounds.x + strokePadding,
      y: bounds.y + strokePadding,
      width: bounds.width - strokePadding * 2,
      height: bounds.height - strokePadding * 2,
    };

    // Funcao auxiliar para clampar delta para manter pontos dentro dos bounds
    const clampDelta = (points: Point2D[], d: Point2D): Point2D => {
      let maxDeltaX = d.x;
      let maxDeltaY = d.y;

      // Encontrar min/max dos pontos
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));

      // Limitar delta em X
      if (d.x > 0) {
        maxDeltaX = Math.min(d.x, paddedBounds.x + paddedBounds.width - maxX);
      } else if (d.x < 0) {
        maxDeltaX = Math.max(d.x, paddedBounds.x - minX);
      }

      // Limitar delta em Y
      if (d.y > 0) {
        maxDeltaY = Math.min(d.y, paddedBounds.y + paddedBounds.height - maxY);
      } else if (d.y < 0) {
        maxDeltaY = Math.max(d.y, paddedBounds.y - minY);
      }

      return { x: maxDeltaX, y: maxDeltaY };
    };

    if (element.category === 'shape') {
      const shape = { ...(element as ShapeElement) };
      const constrainedDelta = clampDelta([shape.startPoint, shape.endPoint], delta);
      shape.startPoint = { x: shape.startPoint.x + constrainedDelta.x, y: shape.startPoint.y + constrainedDelta.y };
      shape.endPoint = { x: shape.endPoint.x + constrainedDelta.x, y: shape.endPoint.y + constrainedDelta.y };
      return shape;
    }

    if (element.category === 'arrow') {
      const arrow = { ...(element as ArrowElement) };
      const constrainedDelta = clampDelta([arrow.startPoint, arrow.endPoint], delta);
      arrow.startPoint = { x: arrow.startPoint.x + constrainedDelta.x, y: arrow.startPoint.y + constrainedDelta.y };
      arrow.endPoint = { x: arrow.endPoint.x + constrainedDelta.x, y: arrow.endPoint.y + constrainedDelta.y };
      return arrow;
    }

    if (element.category === 'text') {
      const text = { ...(element as TextElement) };
      const constrainedDelta = clampDelta([text.position], delta);
      text.position = { x: text.position.x + constrainedDelta.x, y: text.position.y + constrainedDelta.y };
      return text;
    }

    if (element.category === 'blur') {
      const blur = { ...(element as BlurElement) };
      const constrainedDelta = clampDelta(blur.points, delta);
      blur.points = blur.points.map(p => ({ x: p.x + constrainedDelta.x, y: p.y + constrainedDelta.y }));
      return blur;
    }

    if (element.category === 'sticker') {
      const sticker = { ...(element as StickerElement) };
      const constrainedDelta = clampDelta([sticker.position], delta);
      sticker.position = { x: sticker.position.x + constrainedDelta.x, y: sticker.position.y + constrainedDelta.y };
      return sticker;
    }

    return element;
  }, []);

  // ========================================
  // Event Listeners Nativos (passive: false)
  // ========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || Platform.OS !== 'web') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isDrawingModeRef.current) return;
      e.preventDefault();

      const pos = getNativeEventPosition(e);

      // Verificar se clicou em um elemento selecionado
      if (selectedElementIdRef.current) {
        const selectedElement = elementsRef.current.find(el => el.id === selectedElementIdRef.current);
        if (selectedElement) {
          // Setas tem comportamento diferente: apenas 2 handles
          if (selectedElement.category === 'arrow') {
            const arrow = selectedElement as ArrowElement;
            const arrowHandle = hitTestArrowHandle(pos, arrow);
            if (arrowHandle) {
              setInteractionMode('resize');
              setActiveArrowHandle(arrowHandle);
              setActiveHandle(null);
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }

            // Se clicou na seta mas nao no handle, move a seta inteira
            if (hitTestElement(pos, selectedElement)) {
              setInteractionMode('move');
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }
          } else if (selectedElement.category === 'text') {
            // Texto nao tem handles, apenas move
            if (hitTestElement(pos, selectedElement)) {
              setInteractionMode('move');
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }
          } else if (selectedElement.category === 'sticker') {
            // Stickers usam apenas 4 handles nos cantos (proporcional)
            const bbox = getBoundingBox(selectedElement);
            if (bbox) {
              const handle = hitTestHandle(pos, bbox);
              // Apenas cantos sao validos para stickers
              if (handle === 'topLeft' || handle === 'topRight' || handle === 'bottomLeft' || handle === 'bottomRight') {
                setInteractionMode('resize');
                setActiveHandle(handle);
                setActiveArrowHandle(null);
                setDragStartPoint(pos);
                setOriginalElement(selectedElement);
                return;
              }

              if (hitTestElement(pos, selectedElement)) {
                setInteractionMode('move');
                setDragStartPoint(pos);
                setOriginalElement(selectedElement);
                return;
              }
            }
          } else {
            // Formas e blur usam 8 handles
            const bbox = getBoundingBox(selectedElement);
            if (bbox) {
              const handle = hitTestHandle(pos, bbox);
              if (handle) {
                setInteractionMode('resize');
                setActiveHandle(handle);
                setActiveArrowHandle(null);
                setDragStartPoint(pos);
                setOriginalElement(selectedElement);
                return;
              }

              if (hitTestElement(pos, selectedElement)) {
                setInteractionMode('move');
                setDragStartPoint(pos);
                setOriginalElement(selectedElement);
                return;
              }
            }
          }
        }
      }

      // Verificar se clicou em algum elemento
      const clickedElement = findElementAtPoint(pos);
      if (clickedElement) {
        onSelectElementRef.current?.(clickedElement.id);
        return;
      }

      // Bloquear desenho fora da area da imagem
      if (!isPointInImageRef.current(pos)) {
        onSelectElementRef.current?.(null);
        return;
      }

      // Se stickerInteractionOnly, apenas desselecionar - NAO inicia novo desenho
      if (stickerInteractionOnlyRef.current) {
        onSelectElementRef.current?.(null);
        return;
      }

      // Desselecionar e iniciar novo desenho (ponto clampado com padding do strokeWidth)
      onSelectElementRef.current?.(null);
      setInteractionMode('draw');
      isDrawingRef.current = true;

      const strokePadding = currentStrokeWidthRef.current / 2;
      const clampedPos = clampPointRef.current(pos, strokePadding);
      if (usesTwoPoints(activeCategoryRef.current)) {
        startPointRef.current = clampedPos;
        endPointRef.current = clampedPos;
      } else {
        currentPointsRef.current = [clampedPos];
      }
      drawCanvasRef.current();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawingModeRef.current) return;
      e.preventDefault();

      const pos = getNativeEventPosition(e);
      const strokePadding = currentStrokeWidthRef.current / 2;
      const clampedPos = clampPointRef.current(pos, strokePadding);

      // Resize de seta (2 handles) - clampado aos limites da imagem
      if (interactionModeRef.current === 'resize' && originalElement?.category === 'arrow' && activeArrowHandleRef.current) {
        const updatedElement = applyArrowResize(originalElement as ArrowElement, activeArrowHandleRef.current, clampedPos);
        onElementUpdateRef.current?.(updatedElement);
        setOriginalElement(updatedElement);
        return;
      }

      // Resize de forma (8 handles) - clampado aos limites da imagem
      if (interactionModeRef.current === 'resize' && dragStartPoint && originalElement && activeHandle) {
        const delta = { x: clampedPos.x - dragStartPoint.x, y: clampedPos.y - dragStartPoint.y };
        const updatedElement = applyResize(originalElement, activeHandle, delta, imageBoundsRef.current);
        onElementUpdateRef.current?.(updatedElement);
        setDragStartPoint(clampedPos);
        setOriginalElement(updatedElement);
        return;
      }

      // Move - clampado aos limites da imagem
      if (interactionModeRef.current === 'move' && dragStartPoint && originalElement) {
        const delta = { x: clampedPos.x - dragStartPoint.x, y: clampedPos.y - dragStartPoint.y };
        const updatedElement = applyMove(originalElement, delta, imageBoundsRef.current);
        onElementUpdateRef.current?.(updatedElement);
        setDragStartPoint(clampedPos);
        setOriginalElement(updatedElement);
        return;
      }

      if (!isDrawingRef.current) return;

      // Desenho - clampado aos limites da imagem com padding do strokeWidth
      if (usesTwoPoints(activeCategoryRef.current)) {
        endPointRef.current = clampedPos;
      } else {
        currentPointsRef.current.push(clampedPos);
      }
      drawCanvasRef.current();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDrawingModeRef.current) return;
      e.preventDefault();

      if (interactionModeRef.current === 'resize' || interactionModeRef.current === 'move') {
        // Adicionar ao historico no final do arraste
        if (originalElement) {
          onElementUpdateRef.current?.(originalElement, true);
        }
        setInteractionMode('draw');
        setActiveHandle(null);
        setActiveArrowHandle(null);
        setDragStartPoint(null);
        setOriginalElement(null);
        return;
      }

      if (!isDrawingRef.current) return;

      isDrawingRef.current = false;
      const element = createElementFromPoints();
      if (element) {
        onElementCompleteRef.current(element);
      }

      currentPointsRef.current = [];
      startPointRef.current = null;
      endPointRef.current = null;
      drawCanvasRef.current();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [getNativeEventPosition, createElementFromPoints, usesTwoPoints, getBoundingBox, hitTestHandle, hitTestArrowHandle, hitTestElement, findElementAtPoint, applyResize, applyArrowResize, applyMove, dragStartPoint, originalElement, activeHandle, activeArrowHandle]);

  // ========================================
  // Handlers de Mouse
  // ========================================
  const handleMouseStart = useCallback((e: React.MouseEvent) => {
    if (!isDrawingMode) return;

    const pos = getEventPosition(e);

    // Verificar se clicou em um elemento selecionado
    if (selectedElementId) {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement) {
        // Setas tem comportamento diferente: apenas 2 handles
        if (selectedElement.category === 'arrow') {
          const arrow = selectedElement as ArrowElement;
          const arrowHandle = hitTestArrowHandle(pos, arrow);
          if (arrowHandle) {
            setInteractionMode('resize');
            setActiveArrowHandle(arrowHandle);
            setActiveHandle(null);
            setDragStartPoint(pos);
            setOriginalElement(selectedElement);
            return;
          }

          // Se clicou na seta mas nao no handle, move a seta inteira
          if (hitTestElement(pos, selectedElement)) {
            setInteractionMode('move');
            setDragStartPoint(pos);
            setOriginalElement(selectedElement);
            return;
          }
        } else if (selectedElement.category === 'text') {
          // Texto nao tem handles, apenas move
          if (hitTestElement(pos, selectedElement)) {
            setInteractionMode('move');
            setDragStartPoint(pos);
            setOriginalElement(selectedElement);
            return;
          }
        } else if (selectedElement.category === 'sticker') {
          // Stickers usam apenas 4 handles nos cantos (proporcional)
          const bbox = getBoundingBox(selectedElement);
          if (bbox) {
            const handle = hitTestHandle(pos, bbox);
            // Apenas cantos sao validos para stickers
            if (handle === 'topLeft' || handle === 'topRight' || handle === 'bottomLeft' || handle === 'bottomRight') {
              setInteractionMode('resize');
              setActiveHandle(handle);
              setActiveArrowHandle(null);
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }

            if (hitTestElement(pos, selectedElement)) {
              setInteractionMode('move');
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }
          }
        } else {
          // Formas e blur usam 8 handles
          const bbox = getBoundingBox(selectedElement);
          if (bbox) {
            const handle = hitTestHandle(pos, bbox);
            if (handle) {
              setInteractionMode('resize');
              setActiveHandle(handle);
              setActiveArrowHandle(null);
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }

            if (hitTestElement(pos, selectedElement)) {
              setInteractionMode('move');
              setDragStartPoint(pos);
              setOriginalElement(selectedElement);
              return;
            }
          }
        }
      }
    }

    // Verificar se clicou em algum elemento
    const clickedElement = findElementAtPoint(pos);
    if (clickedElement) {
      onSelectElement?.(clickedElement.id);
      return;
    }

    // Bloquear desenho fora da area da imagem
    if (!isPointInImage(pos)) {
      onSelectElement?.(null);
      return;
    }

    // Se stickerInteractionOnly, apenas desselecionar - NAO inicia novo desenho
    if (stickerInteractionOnly) {
      onSelectElement?.(null);
      return;
    }

    // Desselecionar e iniciar novo desenho (ponto clampado com padding do strokeWidth)
    onSelectElement?.(null);
    setInteractionMode('draw');
    isDrawingRef.current = true;

    const strokePadding = currentStrokeWidth / 2;
    const clampedPos = clampPoint(pos, strokePadding);
    if (usesTwoPoints(activeCategory)) {
      startPointRef.current = clampedPos;
      endPointRef.current = clampedPos;
    } else {
      currentPointsRef.current = [clampedPos];
    }
    drawCanvas();
  }, [isDrawingMode, getEventPosition, drawCanvas, activeCategory, usesTwoPoints, selectedElementId, elements, getBoundingBox, hitTestHandle, hitTestArrowHandle, hitTestElement, findElementAtPoint, onSelectElement, isPointInImage, clampPoint, currentStrokeWidth, stickerInteractionOnly]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawingMode) return;

    const pos = getEventPosition(e);
    const strokePadding = currentStrokeWidth / 2;
    const clampedPos = clampPoint(pos, strokePadding);

    // Resize de seta (2 handles) - clampado aos limites da imagem
    if (interactionMode === 'resize' && originalElement?.category === 'arrow' && activeArrowHandle) {
      const updatedElement = applyArrowResize(originalElement as ArrowElement, activeArrowHandle, clampedPos);
      onElementUpdate?.(updatedElement);
      setOriginalElement(updatedElement);
      return;
    }

    // Resize de forma (8 handles) - clampado aos limites da imagem
    if (interactionMode === 'resize' && dragStartPoint && originalElement && activeHandle) {
      const delta = { x: clampedPos.x - dragStartPoint.x, y: clampedPos.y - dragStartPoint.y };
      const updatedElement = applyResize(originalElement, activeHandle, delta, imageBounds);
      onElementUpdate?.(updatedElement);
      setDragStartPoint(clampedPos);
      setOriginalElement(updatedElement);
      return;
    }

    // Move - clampado aos limites da imagem
    if (interactionMode === 'move' && dragStartPoint && originalElement) {
      const delta = { x: clampedPos.x - dragStartPoint.x, y: clampedPos.y - dragStartPoint.y };
      const updatedElement = applyMove(originalElement, delta, imageBounds);
      onElementUpdate?.(updatedElement);
      setDragStartPoint(clampedPos);
      setOriginalElement(updatedElement);
      return;
    }

    if (!isDrawingRef.current) return;

    // Desenho - clampado aos limites da imagem com padding do strokeWidth
    if (usesTwoPoints(activeCategory)) {
      endPointRef.current = clampedPos;
    } else {
      currentPointsRef.current.push(clampedPos);
    }
    drawCanvas();
  }, [isDrawingMode, getEventPosition, drawCanvas, activeCategory, usesTwoPoints, interactionMode, dragStartPoint, originalElement, activeHandle, activeArrowHandle, applyResize, applyArrowResize, applyMove, onElementUpdate, clampPoint, imageBounds, currentStrokeWidth]);

  const handleMouseEnd = useCallback((e: React.MouseEvent) => {
    if (!isDrawingMode) return;

    if (interactionMode === 'resize' || interactionMode === 'move') {
      // Adicionar ao historico no final do arraste
      if (originalElement) {
        onElementUpdate?.(originalElement, true);
      }
      setInteractionMode('draw');
      setActiveHandle(null);
      setActiveArrowHandle(null);
      setDragStartPoint(null);
      setOriginalElement(null);
      return;
    }

    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;
    const element = createElementFromPoints();
    if (element) {
      onElementComplete(element);
    }

    currentPointsRef.current = [];
    startPointRef.current = null;
    endPointRef.current = null;
    drawCanvas();
  }, [isDrawingMode, onElementComplete, onElementUpdate, createElementFromPoints, drawCanvas, interactionMode, originalElement]);

  // ========================================
  // Cursor baseado no estado
  // ========================================
  const getCursor = useCallback((): string => {
    if (!isDrawingMode) return 'default';
    if (interactionMode === 'move') return 'move';
    if (interactionMode === 'resize') {
      // Setas usam cursor de ponteiro para os 2 handles
      if (activeArrowHandle) {
        return 'pointer';
      }
      // Formas usam cursores direcionais para os 8 handles
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
      }
    }
    return 'crosshair';
  }, [isDrawingMode, interactionMode, activeHandle, activeArrowHandle]);

  // ========================================
  // Escalar Coordenadas de Elemento
  // Converte do canvas para resolucao original
  // ========================================
  const scaleElementCoordinates = useCallback((element: AnyDrawElement, scaleX: number, scaleY: number, bounds: { x: number; y: number; width: number; height: number }): AnyDrawElement => {
    // Funcao auxiliar para escalar ponto
    const scalePoint = (p: Point2D): Point2D => ({
      x: (p.x - bounds.x) * scaleX,
      y: (p.y - bounds.y) * scaleY,
    });

    // Fator de escala para espessuras e tamanhos
    const scaleFactor = Math.max(scaleX, scaleY);

    switch (element.category) {
      case 'shape': {
        const shape = element as ShapeElement;
        return {
          ...shape,
          startPoint: scalePoint(shape.startPoint),
          endPoint: scalePoint(shape.endPoint),
          strokeWidth: shape.strokeWidth * scaleFactor,
        };
      }

      case 'arrow': {
        const arrow = element as ArrowElement;
        return {
          ...arrow,
          startPoint: scalePoint(arrow.startPoint),
          endPoint: scalePoint(arrow.endPoint),
          strokeWidth: arrow.strokeWidth * scaleFactor,
        };
      }

      case 'text': {
        const text = element as TextElement;
        return {
          ...text,
          position: scalePoint(text.position),
          fontSize: text.fontSize * scaleFactor,
        };
      }

      case 'blur': {
        const blur = element as BlurElement;
        return {
          ...blur,
          points: blur.points.map(scalePoint),
          strokeWidth: blur.strokeWidth * scaleFactor,
          intensity: blur.intensity * scaleFactor,
        };
      }

      case 'highlighter': {
        const highlighter = element as HighlighterElement;
        return {
          ...highlighter,
          points: highlighter.points.map(scalePoint),
          strokeWidth: highlighter.strokeWidth * scaleFactor,
        };
      }

      case 'freedraw': {
        const freedraw = element as FreedrawElement;
        return {
          ...freedraw,
          points: freedraw.points.map(scalePoint),
          strokeWidth: freedraw.strokeWidth * scaleFactor,
        };
      }

      case 'sticker': {
        const sticker = element as StickerElement;
        return {
          ...sticker,
          position: scalePoint(sticker.position),
          scale: sticker.scale * scaleFactor,
        };
      }

      default:
        return element;
    }
  }, []);

  // ========================================
  // Exportar Canvas como Imagem Final
  // Renderiza na resolucao original com elementos escalados
  // Aplica rotacao e espelhamento se especificado
  // ========================================
  const exportCanvas = useCallback(async (): Promise<string> => {
    const img = imageRef.current;
    if (!img) {
      console.error('🎨 [WebEditorCanvas] exportCanvas: imagem nao carregada');
      return imageUri;
    }

    // Criar canvas offscreen - ajustar dimensoes se rotacao e 90 ou 270
    const offscreenCanvas = document.createElement('canvas');
    const isRotated90or270 = rotation === 90 || rotation === 270;
    offscreenCanvas.width = isRotated90or270 ? img.height : img.width;
    offscreenCanvas.height = isRotated90or270 ? img.width : img.height;
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      console.error('🎨 [WebEditorCanvas] exportCanvas: contexto nao disponivel');
      return imageUri;
    }

    // ========================================
    // Aplicar transformacoes (rotacao + espelhamento)
    // ========================================
    ctx.save();

    // Mover origem para centro do canvas
    ctx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);

    // Aplicar rotacao
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    // Aplicar espelhamentos
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Voltar origem para desenhar imagem centrada
    ctx.translate(-img.width / 2, -img.height / 2);

    // Desenhar imagem original
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Calcular fatores de escala
    const scaleX = img.width / imageBounds.width;
    const scaleY = img.height / imageBounds.height;

    console.log('🎨 [WebEditorCanvas] exportCanvas:', {
      imageSize: { width: img.width, height: img.height },
      outputSize: { width: offscreenCanvas.width, height: offscreenCanvas.height },
      bounds: imageBounds,
      scale: { x: scaleX, y: scaleY },
      elementsCount: elements.length,
      rotation,
      flipH,
      flipV,
    });

    // Bounds da imagem original (para escalar elementos)
    const exportBounds = { x: 0, y: 0, width: img.width, height: img.height };

    // Renderizar cada elemento com coordenadas escaladas (dentro das transformacoes)
    elements.forEach(element => {
      const scaledElement = scaleElementCoordinates(element, scaleX, scaleY, imageBounds);
      renderElement(ctx, scaledElement, exportBounds);
    });

    // Restaurar contexto
    ctx.restore();

    // Exportar como data URL JPEG
    const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.92);
    console.log('🎨 [WebEditorCanvas] ========================================');
    console.log('🎨 [WebEditorCanvas] EXPORT CONCLUIDO');
    console.log('🎨 [WebEditorCanvas] dataUrl tipo:', dataUrl.substring(0, 50));
    console.log('🎨 [WebEditorCanvas] dataUrl length:', dataUrl.length);
    console.log('🎨 [WebEditorCanvas] ========================================');

    return dataUrl;
  }, [imageUri, imageBounds, elements, scaleElementCoordinates, renderElement, rotation, flipH, flipV]);

  // ========================================
  // Registrar Funcao de Export via Callback
  // ========================================
  useEffect(() => {
    if (onExportCanvas && imageLoaded) {
      onExportCanvas(exportCanvas);
    }
  }, [onExportCanvas, exportCanvas, imageLoaded]);

  // ========================================
  // Render: Nao Web
  // ========================================
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>
    );
  }

  // ========================================
  // Render: Web
  // ========================================
  return (
    <div ref={containerRef} style={{ flex: 1, width: '100%', height: '100%', position: 'relative', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ width: '100%', height: '100%', cursor: getCursor() }}
        onMouseDown={handleMouseStart}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      />
    </div>
  );
});

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,                                //......Ocupa tudo
  },
  image: {
    flex: 1,                                //......Ocupa tudo
    width: '100%',                          //......Largura total
    height: '100%',                         //......Altura total
  },
});

// ========================================
// Export
// ========================================
export default WebEditorCanvas;
