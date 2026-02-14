// ========================================
// Constantes do Editor de Fotos
// Design system para edicao de imagens estilo WhatsApp
// ========================================

// ========================================
// Cores do Editor
// ========================================
export const EditorColors = {
  // Fundo
  background: '#000000',                    //......Fundo preto
  overlay: 'rgba(0,0,0,0.5)',               //......Overlay escuro

  // Toolbar
  toolbarBg: 'transparent',                 //......Toolbar transparente
  buttonBg: '#303030',                      //......Fundo botao chumbo solido (estilo WhatsApp)
  buttonActive: '#1777CF',                  //......Botao ativo azul
  buttonIcon: '#FFFFFF',                    //......Icone branco

  // Input
  inputBg: '#F5F5F5',                       //......Fundo input cinza
  inputText: '#111827',                     //......Texto preto
  inputPlaceholder: '#667781',              //......Placeholder cinza
  inputBorder: 'rgba(0,0,0,0.1)',           //......Borda sutil

  // Enviar
  sendButton: '#1777CF',                    //......Botao enviar azul
  sendIcon: '#FFFFFF',                      //......Icone enviar branco

  // View Once
  viewOnceActive: '#1777CF',                //......Ativo azul
  viewOnceInactive: 'rgba(255,255,255,0.5)', //......Inativo cinza

  // Texto
  textWhite: '#FFFFFF',                     //......Texto branco
  textGray: '#667781',                      //......Texto cinza

  // HD Badge
  hdActive: '#1777CF',                      //......HD ativo azul
  hdInactive: '#FFFFFF',                    //......HD inativo branco 100%
};

// ========================================
// Paleta de Cores para Desenho (10 cores)
// ========================================
export const DrawingColors = [
  '#FFFFFF',                                //......Branco
  '#000000',                                //......Preto
  '#FF9500',                                //......Laranja
  '#FFCC00',                                //......Amarelo
  '#34C759',                                //......Verde
  '#007AFF',                                //......Azul
  '#AF52DE',                                //......Roxo
  '#FF2D55',                                //......Rosa
  '#5856D6',                                //......Indigo
  '#A2845E',                                //......Marrom
];

// ========================================
// Espessuras de Linha (2/6/12 padrao)
// ========================================
export const StrokeWidths = [2, 6, 12];
export const DrawingStrokeWidths = StrokeWidths;

// ========================================
// Estilos do Editor
// ========================================
export const EditorStyles = {
  // Border Radius
  buttonRadius: 22,                         //......Botoes circulares
  inputRadius: 6,                           //......Input levemente arredondado
  toolbarRadius: 8,                         //......Toolbar arredondada

  // Tamanhos
  toolbarButtonSize: 40,                    //......Tamanho botao toolbar
  closeButtonSize: 40,                      //......Tamanho botao fechar
  sendButtonSize: 44,                       //......Tamanho botao enviar
  iconSize: 24,                             //......Tamanho icone padrao
  iconSizeSmall: 20,                        //......Tamanho icone pequeno

  // Espacamentos
  toolbarGap: 16,                           //......Gap entre botoes toolbar
  headerPadding: 16,                        //......Padding do header
  footerPadding: 16,                        //......Padding do footer
  inputHeight: 44,                          //......Altura do input

  // Sombras
  shadowDefault: {
    shadowColor: '#000',                    //......Cor da sombra
    shadowOffset: { width: 0, height: 2 },  //......Offset
    shadowOpacity: 0.15,                    //......Opacidade
    shadowRadius: 8,                        //......Raio
    elevation: 5,                           //......Elevacao Android
  },
};

// ========================================
// Modos do Editor
// ========================================
export type EditorMode = 'none' | 'drawing' | 'text' | 'crop' | 'stickers';

// ========================================
// Paths SVG dos Icones
// ========================================
export const EditorIcons: Record<string, IconData> = {
  // Fechar (X)
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',

  // Crop (moldura de recorte)
  crop: 'M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z',

  // Emoji (carinha sorridente)
  emoji: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',

  // Texto (Aa)
  text: 'M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z',

  // Pincel (lapis com viewBox customizado)
  pencil: {
    path: 'M370.59 250.973c-5.524 0-10 4.476-10 10v88.789c-.02 16.562-13.438 29.984-30 30H50c-16.563-.016-29.98-13.438-30-30V89.172c.02-16.559 13.438-29.98 30-30h88.79c5.523 0 10-4.477 10-10 0-5.52-4.477-10-10-10H50c-27.602.031-49.969 22.398-50 50v260.594c.031 27.601 22.398 49.968 50 50h280.59c27.601-.032 49.969-22.399 50-50v-88.793c0-5.524-4.477-10-10-10zm0 0M376.629 13.441c-17.574-17.574-46.067-17.574-63.64 0L134.581 191.848a9.997 9.997 0 0 0-2.566 4.402l-23.461 84.7a9.997 9.997 0 0 0 12.304 12.308l84.7-23.465a9.997 9.997 0 0 0 4.402-2.566l178.402-178.41c17.547-17.587 17.547-46.055 0-63.641zM156.37 198.348 302.383 52.332l47.09 47.09-146.016 146.016zm-9.406 18.875 37.62 37.625-52.038 14.418zM374.223 74.676 363.617 85.28l-47.094-47.094 10.61-10.605c9.762-9.762 25.59-9.762 35.351 0l11.739 11.734c9.746 9.774 9.746 25.59 0 35.36zm0 0',
    viewBox: '0 0 401.523 401',
  },

  // Enviar (seta)
  send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',

  // Desfazer (seta voltar)
  undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',

  // View Once (olho com 1)
  viewOnce: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
};

// ========================================
// Configuracoes de Qualidade
// ========================================
export const QualityConfig = {
  normal: {
    compress: 0.8,                          //......Compressao 80%
    format: 'jpeg',                         //......Formato JPEG
  },
  hd: {
    compress: 1.0,                          //......Sem compressao
    format: 'png',                          //......Formato PNG
  },
};

// ========================================
// Animacoes
// ========================================
export const EditorAnimations = {
  duration: {
    fast: 150,                              //......Animacao rapida
    normal: 250,                            //......Animacao normal
    slow: 350,                              //......Animacao lenta
  },
};

// ========================================
// Tipo para Icone com ViewBox Customizado
// ========================================
export type IconData = string | { path: string; viewBox: string };

// ========================================
// Icones das Categorias de Desenho
// ========================================
export const CategoryIcons: Record<string, IconData> = {
  // Formas (quadrado arredondado)
  shape: {
    path: 'M7.5 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z',
    viewBox: '0 0 25 24',
  },

  // Seta
  arrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z',

  // Marcador (caneta marca-texto)
  highlighter: {
    path: 'M77.925 485.586a8.533 8.533 0 0 0 6.059-2.475 96.342 96.342 0 0 1 69.035-25.6 140.448 140.448 0 0 1 29.44 3.072c10.169 8.198 24.879 7.426 34.133-1.792l12.032-12.117 276.907-320c8.198-10.169 7.426-24.879-1.792-34.133l-79.616-81.152c-9.491-9.528-24.737-10.087-34.901-1.28L72.293 289.575l-12.544 12.459a25.6 25.6 0 0 0-7.424 18.091 25.6 25.6 0 0 0 5.717 16.555c2.304 10.496 12.117 64-22.357 98.475a8.534 8.534 0 0 0-1.536 9.045L2.49 475.687a8.533 8.533 0 0 0 2.219 13.653l34.133 17.067a8.535 8.535 0 0 0 3.84.939h273.067c4.713 0 8.533-3.82 8.533-8.533s-3.82-8.533-8.533-8.533H67.002l7.083-5.717a8.564 8.564 0 0 0 3.84 1.023zM400.4 22.994a8.533 8.533 0 0 1 11.605.512l80.384 80.384a8.535 8.535 0 0 1 .683 11.435l-271.19 312.917-131.498-131.84L400.4 22.994zM41.573 488.743l-18.603-9.301 22.613-22.699L61.541 472.7l-19.968 16.043zM54.97 441.98l-1.451-1.451c37.888-44.971 21.333-107.776 20.565-110.507v.171a8.544 8.544 0 0 0-2.133-3.669 8.535 8.535 0 0 1-2.56-6.144 8.533 8.533 0 0 1 2.475-6.059l5.973-6.059 132.864 132.523-6.059 6.059a8.533 8.533 0 0 1-12.068.049l-.049-.049a8.533 8.533 0 0 0-3.84-2.219 149.527 149.527 0 0 0-35.755-4.096 114.257 114.257 0 0 0-74.837 24.747L54.97 441.98z',
    viewBox: '0 0 511.201 511.201',
  },

  // Blur (circulo com desfoque)
  blur: 'M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3 .5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm15 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 10c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm8 .5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3 8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-4-12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 8.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z',

  // Desenho livre (lapis)
  freedraw: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',

  // Texto (Aa)
  text: 'M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z',
};

// ========================================
// Labels das Categorias
// ========================================
export const CategoryLabels = {
  shape: 'Formas',                          //......Formas geometricas
  arrow: 'Setas',                           //......Setas direcionais
  highlighter: 'Marcador',                  //......Marca-texto
  blur: 'Blur',                             //......Desfoque
  freedraw: 'Livre',                        //......Desenho livre
  text: 'Texto',                            //......Texto
};

// ========================================
// Espessuras do Marcador (mais grossas)
// ========================================
export const HighlighterStrokeWidths = [15, 25, 40];

// ========================================
// Espessuras do Blur (tamanho do pincel)
// ========================================
export const BlurStrokeWidths = [30, 50, 70];

// ========================================
// Intensidades do Blur
// ========================================
export const BlurIntensities = [5, 10, 15, 20];

// ========================================
// Tamanhos de Fonte do Texto
// ========================================
export const TextFontSizes = [16, 24, 32, 48, 64];

// ========================================
// Icones de Subtipos
// ========================================
export const SubtypeIcons = {
  // Formas
  circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
  rectangle: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
  triangle: 'M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z',

  // Setas
  singleArrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z',
  doubleArrow: 'M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z',

  // Blur (gota d'agua para blur suave)
  blurMode: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z',
  pixelateMode: 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z',

  // Preenchimento
  filled: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  outline: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',

  // Lixeira (excluir forma selecionada)
  trash: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',

  // Vassoura (limpar toda a tela) - viewBox 512x512
  broom: {
    path: 'M424.736 374.27c0-28.83-23.45-52.29-52.28-52.29h-71.51v-45c0-8.28-6.72-15-15-15h-15V15c0-8.28-6.72-15-15-15s-15 6.72-15 15v246.98h-15c-8.28 0-15 6.72-15 15v45h-71.51c-28.83 0-52.28 23.46-52.28 52.29v6.9h337.58zM64.986 488.23c-7.03 9.74.2 23.77 12.17 23.77h50.83V411.17h-41.26c-3.09 49.94-21.58 76.83-21.74 77.06zM157.986 411.17h45.31V512h-45.31zM233.296 411.17h45.3V512h-45.3zM308.596 411.17h45.31V512h-45.31zM446.956 488.3c-.2-.29-18.7-27.19-21.79-77.13h-41.26V512h50.83c5.64 0 10.82-3.12 13.38-8.13 2.57-5.01 2.14-11-1.16-15.57z',
    viewBox: '0 0 512 512',
  },

  // Texto - estilos de fundo
  textNone: 'M5 4v3h5.5v12h3V7H19V4H5z',
  textOutline: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM11 7h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z',
  textSolid: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm6 2h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z',

  // Texto - tamanho
  textSmall: 'M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z',
  textLarge: 'M9 4v3h5v12h2V7h5V4H9z',

  // Texto - negrito
  textBold: 'M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z',

  // Adicionar texto (plus)
  addText: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',

  // Aumentar fonte (plus em circulo)
  fontIncrease: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',

  // Diminuir fonte (minus)
  fontDecrease: 'M19 13H5v-2h14v2z',
};
