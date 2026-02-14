// ========================================
// Constantes da Camera
// Design system completo para o modulo de camera
// ========================================

// ========================================
// Paleta de Cores do Sistema
// ========================================
export const CameraColors = {
  // Cores Primarias
  primary: '#1777CF',                       //......Azul accent (botoes, links, destaques)

  // Mensagens
  messageSentOuter: '#E0F0FF',              //......Fundo bolha enviada
  messageSentInner: '#F0F8FF',              //......Fundo reply dentro da bolha
  messageReceived: '#FFFFFF',               //......Fundo bolha recebida

  // Fundos
  chatBackground: '#FAF8F5',                //......Bege Snow Warm
  patternDetails: '#D4CDC4',                //......Bege escuro (doodles)
  overlayDark: 'rgba(0,0,0,0.5)',           //......Overlay de modais
  overlayLight: 'rgba(0,0,0,0.3)',          //......Overlay leve

  // Textos
  textPrimary: '#111827',                   //......Preto
  textSecondary: '#667781',                 //......Cinza
  textWhite: '#FFFFFF',                     //......Branco

  // Checks
  checkGray: '#667781',                     //......Check cinza
  checkBlue: '#53BDEB',                     //......Check azul (lido)

  // Header
  headerBackground: '#FFFFFF',              //......Fundo branco
  headerShadow: 'rgba(0,0,0,0.08)',         //......Sombra sutil

  // Camera especificos
  cameraBackground: '#000000',              //......Fundo preto da camera
  captureButton: 'rgba(255,255,255,0.3)',   //......Botao captura semi-transparente
  captureButtonBorder: '#FFFFFF',           //......Borda branca
  captureButtonInner: '#FFFFFF',            //......Circulo interno branco
  recordingRed: '#FF3B30',                  //......Vermelho gravacao
  flashYellow: '#FFD60A',                   //......Amarelo flash ativo

  // Input
  inputBackground: '#F4F4F4',               //......Fundo cinza claro
  inputBorder: '#E0E0E0',                   //......Borda cinza
  inputPlaceholder: '#9E9E9E',              //......Placeholder cinza
};

// ========================================
// Constantes de Estilo
// ========================================
export const CameraStyles = {
  // Border Radius
  borderRadiusButton: 6,                    //......Botoes quadrados
  borderRadiusCard: 8,                      //......Cards
  borderRadiusInput: 20,                    //......Input arredondado
  borderRadiusCircle: 50,                   //......Circular (botao enviar)

  // Tamanhos de botao
  captureButtonSize: 72,                    //......Botao de captura grande
  captureButtonInnerSize: 60,               //......Circulo interno
  controlButtonSize: 44,                    //......Botoes de controle
  iconSize: 24,                             //......Icones padrao
  iconSizeLarge: 32,                        //......Icones grandes

  // Sombras
  shadowDefault: {
    shadowColor: '#000',                    //......Cor da sombra
    shadowOffset: { width: 0, height: 1 },  //......Offset
    shadowOpacity: 0.08,                    //......Opacidade
    shadowRadius: 3,                        //......Raio
    elevation: 2,                           //......Elevacao Android
  },

  shadowStrong: {
    shadowColor: '#000',                    //......Cor da sombra
    shadowOffset: { width: 0, height: 2 },  //......Offset
    shadowOpacity: 0.15,                    //......Opacidade
    shadowRadius: 8,                        //......Raio
    elevation: 5,                           //......Elevacao Android
  },
};

// ========================================
// Constantes de Camera
// ========================================
export const CameraConfig = {
  // Qualidade
  photoQuality: 0.8,                        //......Qualidade da foto (0-1)
  photoQualityHD: 1.0,                      //......Qualidade HD

  // Duracao de video
  videoMaxDuration: 60,                     //......Maximo 60 segundos
  videoNoteMaxDuration: 60,                 //......Video note maximo 60s

  // Animacoes
  animationDuration: 200,                   //......Duracao padrao (ms)
  animationDurationFast: 100,               //......Duracao rapida (ms)
  animationDurationSlow: 300,               //......Duracao lenta (ms)

  // Zoom
  zoomLevels: [0.5, 1, 2],                  //......Niveis de zoom
  defaultZoom: 1,                           //......Zoom padrao

  // Flash
  flashModes: ['auto', 'on', 'off'] as const,  //......Modos de flash
  defaultFlashMode: 'auto' as const,           //......Flash padrao
};

// ========================================
// Icones (codigos unicode para SVG)
// ========================================
export const CameraIcons = {
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  flashAuto: 'M3 2v12h3v9l7-12H9l4-9H3zm16 0h-2l-3.2 9h1.9l.7-2h3.2l.7 2h1.9L19 2zm-2.15 5.65L18 4l1.15 3.65h-2.3z',
  flashOn: 'M7 2v11h3v9l7-12h-4l4-8z',
  flashOff: 'M3.27 3L2 4.27l5 5V13h3v9l3.58-6.14L17.73 20 19 18.73 3.27 3zM17 10h-4l4-8H7v2.18l8.46 8.46L17 10z',
  flip: 'M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3zm10-3c0-3.31-2.69-6-6-6V1L9.5 4.5 13 8V5c2.76 0 5 2.24 5 5h2zm-8 8v2c-2.76 0-5-2.24-5-5H4c0 3.31 2.69 6 6 6v2l3.5-3.5L10 13z',
  camera: 'M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
  gallery: 'M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z',
  send: 'M2.01 21L23 12 2.01 3 2 10l15 2-15 2z',
  viewOnce: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
};
