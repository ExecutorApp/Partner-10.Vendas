// ========================================
// WebEditorCanvas - Parte 1
// Funcoes de renderizacao para o Canvas
// ========================================

// ========================================
// Imports de Tipos
// ========================================
import { BlurElement, TextElement, StickerElement, Point2D } from '../types/editorTypes';

// ========================================
// Renderizar Forma
// ========================================
export const renderShape = (ctx: CanvasRenderingContext2D, start: Point2D, end: Point2D, shapeType: string, filled: boolean, color: string, strokeWidth: number, opacity: number): void => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity;

  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  switch (shapeType) {
    case 'rectangle':
      if (filled) {
        ctx.fillRect(x, y, width, height);
      } else {
        ctx.strokeRect(x, y, width, height);
      }
      break;

    case 'circle': {
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radiusX = width / 2;
      const radiusY = height / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
      break;
    }

    case 'triangle': {
      const topX = (start.x + end.x) / 2;
      const topY = Math.min(start.y, end.y);
      const bottomY = Math.max(start.y, end.y);
      const leftX = Math.min(start.x, end.x);
      const rightX = Math.max(start.x, end.x);

      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(rightX, bottomY);
      ctx.lineTo(leftX, bottomY);
      ctx.closePath();
      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
};

// ========================================
// Renderizar Seta (sempre simples com uma ponta)
// ========================================
export const renderArrow = (ctx: CanvasRenderingContext2D, start: Point2D, end: Point2D, _arrowType: string, color: string, strokeWidth: number, opacity: number): void => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.globalAlpha = opacity;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const headLength = Math.max(15, strokeWidth * 3);
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  // Linha principal
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Cabeca da seta no fim
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
  ctx.stroke();

  ctx.restore();
};

// ========================================
// Renderizar Texto
// ========================================
export const renderText = (ctx: CanvasRenderingContext2D, element: TextElement): void => {
  ctx.save();

  const { text, fontSize, fontFamily, bold, uppercase, style, color, position, rotation } = element;

  // Aplicar transformacao de case
  const displayText = uppercase ? text.toUpperCase() : text;

  // Configurar fonte com fontFamily
  const fontWeight = bold ? 'bold' : 'normal';
  const fontName = fontFamily || 'Arial';
  ctx.font = `${fontWeight} ${fontSize}px "${fontName}", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Medir texto para background
  const metrics = ctx.measureText(displayText);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;
  const padding = 8;

  // Aplicar rotacao (position e o centro do texto)
  ctx.translate(position.x, position.y);
  ctx.rotate((rotation * Math.PI) / 180);

  // Renderizar baseado no estilo
  switch (style) {
    case 'solid': {
      // Fundo colorido com texto branco (centralizado)
      ctx.fillStyle = color;
      ctx.fillRect(-textWidth / 2 - padding, -textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(displayText, 0, 0);
      break;
    }

    case 'outline': {
      // Texto com borda preta
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(displayText, 0, 0);
      ctx.fillStyle = color;
      ctx.fillText(displayText, 0, 0);
      break;
    }

    case 'none':
    default: {
      // Texto simples
      ctx.fillStyle = color;
      ctx.fillText(displayText, 0, 0);
      break;
    }
  }

  ctx.restore();
};

// ========================================
// Renderizar Blur/Pixelizar
// imageBounds opcional para usar bounds especificos
// ========================================
export const renderBlur = (ctx: CanvasRenderingContext2D, element: BlurElement, imageRef: HTMLImageElement | null, canvasSize: { width: number; height: number }, imageBounds?: { x: number; y: number; width: number; height: number }): void => {
  if (element.points.length < 2) return;
  if (!imageRef) return;

  // Calcular bounds da regiao com a espessura do traco
  const halfStroke = element.strokeWidth / 2;
  const bounds = element.points.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x - halfStroke),
      minY: Math.min(acc.minY, point.y - halfStroke),
      maxX: Math.max(acc.maxX, point.x + halfStroke),
      maxY: Math.max(acc.maxY, point.y + halfStroke),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const regionWidth = bounds.maxX - bounds.minX;
  const regionHeight = bounds.maxY - bounds.minY;

  if (regionWidth <= 0 || regionHeight <= 0) return;

  // Usar bounds fornecidos ou calcular do canvasSize
  let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

  if (imageBounds && imageBounds.width > 0 && imageBounds.height > 0) {
    // Usar bounds fornecidos
    offsetX = imageBounds.x;
    offsetY = imageBounds.y;
    drawWidth = imageBounds.width;
    drawHeight = imageBounds.height;
  } else {
    // Calcular posicao da imagem no canvas
    const containerAspect = canvasSize.width / canvasSize.height;
    const imageAspect = imageRef.width / imageRef.height;

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
  }

  // Criar canvas para mascara do traco (fundo transparente)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = canvasSize.width;
  maskCanvas.height = canvasSize.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return;

  // Desenhar o traco como mascara (branco opaco sobre fundo transparente)
  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  maskCtx.strokeStyle = '#FFFFFF';
  maskCtx.lineWidth = element.strokeWidth;
  maskCtx.lineCap = 'round';
  maskCtx.lineJoin = 'round';
  maskCtx.beginPath();
  maskCtx.moveTo(element.points[0].x, element.points[0].y);
  for (let i = 1; i < element.points.length; i++) {
    maskCtx.lineTo(element.points[i].x, element.points[i].y);
  }
  maskCtx.stroke();

  // Criar canvas para imagem borrada/pixelizada
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = canvasSize.width;
  blurCanvas.height = canvasSize.height;
  const blurCtx = blurCanvas.getContext('2d');
  if (!blurCtx) return;

  if (element.blurType === 'blur') {
    // Aplicar blur na imagem inteira
    blurCtx.filter = `blur(${element.intensity}px)`;
    blurCtx.drawImage(imageRef, offsetX, offsetY, drawWidth, drawHeight);
    blurCtx.filter = 'none';
  } else {
    // Pixelizar a regiao
    const pixelSize = Math.max(4, element.intensity);
    const smallWidth = Math.max(1, Math.ceil(canvasSize.width / pixelSize));
    const smallHeight = Math.max(1, Math.ceil(canvasSize.height / pixelSize));

    // Canvas temporario pequeno
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = smallWidth;
    tempCanvas.height = smallHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(imageRef, offsetX / (canvasSize.width / smallWidth), offsetY / (canvasSize.height / smallHeight), drawWidth / (canvasSize.width / smallWidth), drawHeight / (canvasSize.height / smallHeight));
      blurCtx.imageSmoothingEnabled = false;
      blurCtx.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, canvasSize.width, canvasSize.height);
      blurCtx.imageSmoothingEnabled = true;
    }
  }

  // Aplicar mascara usando composicao
  blurCtx.globalCompositeOperation = 'destination-in';
  blurCtx.drawImage(maskCanvas, 0, 0);
  blurCtx.globalCompositeOperation = 'source-over';

  // Desenhar resultado no canvas principal
  ctx.drawImage(blurCanvas, 0, 0);
};

// ========================================
// Cache de Imagens para Stickers
// ========================================
const stickerImageCache = new Map<string, HTMLImageElement>();
const loadingStickers = new Set<string>();
let onStickerLoadCallback: (() => void) | null = null;

// ========================================
// Registrar Callback de Carregamento
// ========================================
export const setStickerLoadCallback = (callback: (() => void) | null): void => {
  onStickerLoadCallback = callback;
};

// ========================================
// Carregar Imagem de Sticker
// ========================================
const loadStickerImage = (url: string): HTMLImageElement | null => {
  if (stickerImageCache.has(url)) {
    return stickerImageCache.get(url) || null;
  }

  if (!loadingStickers.has(url)) {
    loadingStickers.add(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('🖼️ [loadStickerImage] Imagem carregada:', url.substring(0, 50));
      stickerImageCache.set(url, img);
      loadingStickers.delete(url);
      // Dispara callback para redesenhar o canvas
      if (onStickerLoadCallback) {
        onStickerLoadCallback();
      }
    };
    img.onerror = (err) => {
      console.error('🖼️ [loadStickerImage] Erro ao carregar:', url.substring(0, 50), err);
      loadingStickers.delete(url);
    };
    img.src = url;
  }

  return null;
};

// ========================================
// Verificar se e uma URL de Imagem
// ========================================
const isImageUrl = (str: string): boolean => {
  if (!str) return false;
  // URLs comecam com protocolos ou caminhos
  if (str.startsWith('http://') || str.startsWith('https://')) return true;
  if (str.startsWith('/static/') || str.startsWith('/assets/')) return true;
  if (str.startsWith('blob:') || str.startsWith('data:')) return true;
  if (str.startsWith('file://')) return true;
  // Assets de bundler (metro/webpack) podem comecar com /
  if (str.startsWith('/') && str.length > 10) return true;
  // Verifica extensao de imagem em qualquer posicao
  if (/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(str)) return true;
  // Contem Tickers ou assets no path (assets locais)
  if (str.includes('Tickers') || str.includes('assets')) return true;
  // Emojis unicode sao strings curtas (1-8 caracteres)
  if (str.length <= 8) return false;
  // Se tem mais de 8 chars e nao parece emoji, pode ser URL
  return str.includes('/') || str.includes('.');
};

// ========================================
// Renderizar Sticker (Imagem PNG ou Emoji)
// ========================================
export const renderSticker = (ctx: CanvasRenderingContext2D, element: StickerElement): void => {
  console.log('🖼️ [renderSticker] CHAMADO - ID:', element.id?.substring(0, 15));
  ctx.save();

  const { emoji, position, scale, rotation } = element;
  const baseSize = 64;
  const size = baseSize * scale;

  console.log('🖼️ [renderSticker] Position:', JSON.stringify(position), 'Size:', size);

  // Aplicar transformacoes
  ctx.translate(position.x, position.y);
  ctx.rotate((rotation * Math.PI) / 180);

  // Verificar se emoji e uma URL de imagem
  const isImage = isImageUrl(emoji);
  console.log('🖼️ [renderSticker] emoji:', emoji?.substring(0, 50), 'isImageUrl:', isImage);

  if (isImage) {
    const img = loadStickerImage(emoji);
    console.log('🖼️ [renderSticker] Img loaded:', !!img, 'complete:', img?.complete, 'width:', img?.naturalWidth);
    if (img && img.complete && img.naturalWidth > 0) {
      // Desenhar imagem centralizada
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      console.log('🖼️ [renderSticker] IMAGEM DESENHADA!');
    } else {
      // Placeholder enquanto carrega
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      console.log('🖼️ [renderSticker] Placeholder desenhado (carregando...)');
    }
  } else {
    // Emoji Unicode
    ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji || '?', 0, 0);
    console.log('🖼️ [renderSticker] EMOJI DESENHADO:', emoji);
  }

  ctx.restore();
};
