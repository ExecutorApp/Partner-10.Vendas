// ========================================
// Tipos do Editor de Fotos
// Interfaces para todas as categorias de desenho
// ========================================

// ========================================
// Categorias de Desenho
// ========================================
export type DrawingCategory = 'shape' | 'arrow' | 'highlighter' | 'blur' | 'freedraw' | 'text' | 'sticker';

// ========================================
// Subtipos por Categoria
// ========================================
export type ShapeType = 'circle' | 'rectangle' | 'triangle';
export type ArrowType = 'single' | 'double';
export type BlurType = 'blur' | 'pixelate';
export type TextStyle = 'none' | 'outline' | 'solid';

// ========================================
// Ponto 2D
// ========================================
export interface Point2D {
  x: number;                              //......Coordenada X
  y: number;                              //......Coordenada Y
}

// ========================================
// Elemento Base (compartilhado)
// ========================================
export interface DrawElement {
  id: string;                             //......ID unico do elemento
  category: DrawingCategory;              //......Categoria do elemento
  color: string;                          //......Cor principal (hex)
  strokeWidth: number;                    //......Espessura do traco
  opacity: number;                        //......Opacidade (0-1)
  timestamp: number;                      //......Timestamp de criacao
}

// ========================================
// Forma Geometrica (circulo, quadrado, triangulo)
// ========================================
export interface ShapeElement extends DrawElement {
  category: 'shape';                      //......Categoria fixa
  shapeType: ShapeType;                   //......Tipo da forma
  filled: boolean;                        //......Preenchido ou apenas borda
  startPoint: Point2D;                    //......Ponto inicial (arraste)
  endPoint: Point2D;                      //......Ponto final (arraste)
}

// ========================================
// Seta
// ========================================
export interface ArrowElement extends DrawElement {
  category: 'arrow';                      //......Categoria fixa
  arrowType: ArrowType;                   //......Simples ou dupla
  startPoint: Point2D;                    //......Ponto de origem
  endPoint: Point2D;                      //......Ponto de destino
}

// ========================================
// Marcador (Highlighter)
// ========================================
export interface HighlighterElement extends DrawElement {
  category: 'highlighter';                //......Categoria fixa
  points: Point2D[];                      //......Pontos do traco
}

// ========================================
// Blur / Pixelizar
// ========================================
export interface BlurElement extends DrawElement {
  category: 'blur';                       //......Categoria fixa
  blurType: BlurType;                     //......Blur ou pixelate
  points: Point2D[];                      //......Regiao pintada
  intensity: number;                      //......Intensidade do efeito
}

// ========================================
// Desenho Livre
// ========================================
export interface FreedrawElement extends DrawElement {
  category: 'freedraw';                   //......Categoria fixa
  points: Point2D[];                      //......Pontos do traco
}

// ========================================
// Texto
// ========================================
export interface TextElement extends DrawElement {
  category: 'text';                       //......Categoria fixa
  text: string;                           //......Conteudo do texto
  fontSize: number;                       //......Tamanho da fonte
  fontFamily: string;                     //......Familia da fonte
  bold: boolean;                          //......Negrito
  uppercase: boolean;                     //......Texto em maiusculo
  style: TextStyle;                       //......Estilo do fundo
  position: Point2D;                      //......Posicao do texto
  rotation: number;                       //......Rotacao em graus
}

// ========================================
// Sticker (Emoji)
// ========================================
export interface StickerElement extends DrawElement {
  category: 'sticker';                    //......Categoria fixa
  stickerId: string;                      //......ID do sticker
  emoji: string;                          //......Emoji Unicode
  position: Point2D;                      //......Posicao do sticker
  scale: number;                          //......Escala do sticker
  rotation: number;                       //......Rotacao em graus
}

// ========================================
// Union Type (qualquer elemento)
// ========================================
export type AnyDrawElement =
  | ShapeElement
  | ArrowElement
  | HighlighterElement
  | BlurElement
  | FreedrawElement
  | TextElement
  | StickerElement;

// ========================================
// Opcoes por Categoria
// ========================================
export interface ShapeOptions {
  shapeType: ShapeType;                   //......Tipo selecionado
  filled: boolean;                        //......Preenchido
}

export interface ArrowOptions {
  arrowType: ArrowType;                   //......Tipo selecionado
}

export interface HighlighterOptions {
  opacity: number;                        //......Opacidade (0.2-0.6)
}

export interface BlurOptions {
  blurType: BlurType;                     //......Tipo selecionado
  intensity: number;                      //......Intensidade
}

export interface FreedrawOptions {
  // Apenas cor e espessura (compartilhados)
}

export interface TextOptions {
  fontSize: number;                       //......Tamanho da fonte
  fontFamily: string;                     //......Familia da fonte
  bold: boolean;                          //......Negrito
  uppercase: boolean;                     //......Texto em maiusculo
  style: TextStyle;                       //......Estilo do fundo
}

// ========================================
// Estado do Painel de Opcoes
// ========================================
export interface CategoryOptionsState {
  shape: ShapeOptions;                    //......Opcoes de formas
  arrow: ArrowOptions;                    //......Opcoes de setas
  highlighter: HighlighterOptions;        //......Opcoes de marcador
  blur: BlurOptions;                      //......Opcoes de blur
  freedraw: FreedrawOptions;              //......Opcoes de desenho livre
  text: TextOptions;                      //......Opcoes de texto
}

// ========================================
// Props do Canvas
// ========================================
export interface DrawingCanvasProps {
  imageUri: string;                       //......URI da imagem
  imageWidth: number;                     //......Largura original
  imageHeight: number;                    //......Altura original
  elements: AnyDrawElement[];             //......Elementos para renderizar
  activeCategory: DrawingCategory;        //......Categoria ativa
  categoryOptions: CategoryOptionsState;  //......Opcoes da categoria
  currentColor: string;                   //......Cor atual
  currentStrokeWidth: number;             //......Espessura atual
  onElementComplete: (element: AnyDrawElement) => void;  //......Callback elemento completo
}

// ========================================
// Props da Barra de Categorias
// ========================================
export interface DrawingCategoryBarProps {
  activeCategory: DrawingCategory;        //......Categoria ativa
  onCategoryChange: (category: DrawingCategory) => void;  //......Handler mudanca
}

// ========================================
// Props do Painel de Opcoes
// ========================================
export interface DrawingOptionsPanelProps {
  activeCategory: DrawingCategory;        //......Categoria ativa
  options: CategoryOptionsState;          //......Estado das opcoes
  selectedColor: string;                  //......Cor selecionada
  selectedStrokeWidth: number;            //......Espessura selecionada
  selectedElementId?: string | null;      //......ID do elemento selecionado
  canUndo: boolean;                       //......Pode desfazer
  canClear: boolean;                      //......Pode limpar
  onOptionsChange: <K extends DrawingCategory>(
    category: K,
    options: CategoryOptionsState[K]
  ) => void;                              //......Handler opcoes
  onColorChange: (color: string) => void; //......Handler cor
  onStrokeWidthChange: (width: number) => void;  //......Handler espessura
  onUndo: () => void;                     //......Handler desfazer
  onDeleteSelected: () => void;           //......Handler excluir selecionado
  onClearAll: () => void;                 //......Handler limpar tudo
  onAddText?: () => void;                 //......Handler adicionar texto
}

// ========================================
// Valores Padrao das Opcoes
// ========================================
export const DEFAULT_CATEGORY_OPTIONS: CategoryOptionsState = {
  shape: {
    shapeType: 'circle',                  //......Circulo como padrao
    filled: false,                        //......Apenas borda
  },
  arrow: {
    arrowType: 'single',                  //......Seta simples
  },
  highlighter: {
    opacity: 0.4,                         //......40% opacidade
  },
  blur: {
    blurType: 'blur',                     //......Blur como padrao
    intensity: 10,                        //......Intensidade media
  },
  freedraw: {},
  text: {
    fontSize: 24,                         //......Tamanho medio
    fontFamily: 'Arial',                  //......Fonte padrao
    bold: false,                          //......Sem negrito
    uppercase: false,                     //......Minusculo padrao
    style: 'none',                        //......Sem fundo
  },
};
