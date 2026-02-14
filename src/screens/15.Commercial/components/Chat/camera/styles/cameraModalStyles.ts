// ========================================
// Estilos do CameraModal
// ========================================

// ========================================
// Imports React Native
// ========================================
import { StyleSheet } from 'react-native';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles } from '../utils/cameraConstants';

// ========================================
// Constantes de Layout
// ========================================
export const FOCUS_SIZE = 70;             //......Tamanho do indicador de foco

// ========================================
// Estilos
// ========================================
export const cameraModalStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: CameraColors.cameraBackground,
  },

  // Container da camera
  cameraContainer: {
    flex: 1,                                //......Ocupa espaco disponivel
  },

  // Camera
  camera: {
    flex: 1,                                //......Ocupa espaco disponivel
  },

  // Header animado
  headerAnimated: {
    position: 'absolute',                   //......Posicao absoluta
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    zIndex: 10,                             //......Acima de outros elementos
  },

  // Header
  header: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espacamento entre elementos
    alignItems: 'center',                   //......Centraliza verticalmente
    paddingHorizontal: 16,                  //......Padding horizontal
    paddingTop: 8,                          //......Padding superior
  },

  // Botao do header
  headerButton: {
    width: 44,                              //......Largura fixa
    height: 44,                             //......Altura fixa
    borderRadius: CameraStyles.borderRadiusButton,
    backgroundColor: CameraColors.overlayLight,
    justifyContent: 'center',               //......Centraliza horizontal
    alignItems: 'center',                   //......Centraliza vertical
  },

  // Espacador do header
  headerSpacer: {
    flex: 1,                                //......Ocupa espaco disponivel
  },

  // Container do zoom
  zoomContainer: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 200,                            //......200px do fundo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    alignItems: 'center',                   //......Centraliza horizontal
  },

  // Botao de zoom
  zoomButton: {
    width: 48,                              //......Largura
    height: 48,                             //......Altura
    borderRadius: 24,                       //......Circular
    backgroundColor: CameraColors.overlayLight,
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    borderWidth: 1,                         //......Borda
    borderColor: 'rgba(255,255,255,0.3)',   //......Cor da borda
  },

  // Texto do zoom
  zoomButtonText: {
    fontSize: 12,                           //......Tamanho da fonte
    fontWeight: '600',                      //......Semi-bold
    color: CameraColors.textWhite,          //......Branco
  },

  // Indicador de foco
  focusIndicator: {
    position: 'absolute',                   //......Posicao absoluta
    width: FOCUS_SIZE,                      //......Largura do indicador
    height: FOCUS_SIZE,                     //......Altura do indicador
    zIndex: 100,                            //......Acima de tudo
  },

  // Canto do foco
  focusCorner: {
    position: 'absolute',                   //......Posicao absoluta
    width: 20,                              //......Largura do canto
    height: 20,                             //......Altura do canto
    borderColor: CameraColors.flashYellow,  //......Cor amarela
    borderWidth: 2,                         //......Espessura da borda
  },

  // Canto superior esquerdo
  focusCornerTL: {
    top: 0,                                 //......Topo
    left: 0,                                //......Esquerda
    borderRightWidth: 0,                    //......Sem borda direita
    borderBottomWidth: 0,                   //......Sem borda inferior
  },

  // Canto superior direito
  focusCornerTR: {
    top: 0,                                 //......Topo
    right: 0,                               //......Direita
    borderLeftWidth: 0,                     //......Sem borda esquerda
    borderBottomWidth: 0,                   //......Sem borda inferior
  },

  // Canto inferior esquerdo
  focusCornerBL: {
    bottom: 0,                              //......Fundo
    left: 0,                                //......Esquerda
    borderRightWidth: 0,                    //......Sem borda direita
    borderTopWidth: 0,                      //......Sem borda superior
  },

  // Canto inferior direito
  focusCornerBR: {
    bottom: 0,                              //......Fundo
    right: 0,                               //......Direita
    borderLeftWidth: 0,                     //......Sem borda esquerda
    borderTopWidth: 0,                      //......Sem borda superior
  },

  // Indicador de gravacao
  recordingIndicator: {
    position: 'absolute',                   //......Posicao absoluta
    top: 100,                               //......100px do topo
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    gap: 8,                                 //......Espaco entre elementos
  },

  // Ponto vermelho pulsante
  recordingDot: {
    width: 12,                              //......Largura
    height: 12,                             //......Altura
    borderRadius: 6,                        //......Circular
    backgroundColor: CameraColors.recordingRed,
  },

  // Tempo de gravacao
  recordingTime: {
    fontSize: 16,                           //......Tamanho da fonte
    fontWeight: '600',                      //......Semi-bold
    color: CameraColors.textWhite,          //......Branco
  },

  // Controls
  controls: {
    position: 'absolute',                   //......Posicao absoluta
    bottom: 20,                             //......20px do fundo da CameraView
    left: 0,                                //......Esquerda
    right: 0,                               //......Direita
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'space-between',        //......Espacamento entre elementos
    alignItems: 'center',                   //......Centraliza
    paddingHorizontal: 40,                  //......Padding horizontal
  },

  // Espacador dos controles
  controlSpacer: {
    width: 60,                              //......Largura fixa
    alignItems: 'center',                   //......Centraliza
  },

  // Botao de captura
  captureButton: {
    width: CameraStyles.captureButtonSize,
    height: CameraStyles.captureButtonSize,
    borderRadius: CameraStyles.captureButtonSize / 2,
    borderWidth: 4,                         //......Borda
    borderColor: CameraColors.captureButtonBorder,
    backgroundColor: CameraColors.captureButton,
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
  },

  // Botao de captura gravando
  captureButtonRecording: {
    borderColor: CameraColors.recordingRed, //......Borda vermelha
  },

  // Botao de captura desabilitado
  captureButtonDisabled: {
    opacity: 0.5,                           //......Opacidade reduzida
  },

  // Interior do botao de captura
  captureButtonInner: {
    width: CameraStyles.captureButtonInnerSize,
    height: CameraStyles.captureButtonInnerSize,
    borderRadius: CameraStyles.captureButtonInnerSize / 2,
    backgroundColor: CameraColors.captureButtonInner,
  },

  // Interior gravando
  captureButtonInnerRecording: {
    width: 28,                              //......Largura menor
    height: 28,                             //......Altura menor
    borderRadius: 6,                        //......Quadrado arredondado
    backgroundColor: CameraColors.recordingRed,
  },

  // Botao de flip
  flipButton: {
    width: 50,                              //......Largura
    height: 50,                             //......Altura
    borderRadius: 25,                       //......Circular
    backgroundColor: CameraColors.overlayLight,
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
  },

  // Container da miniatura
  thumbnailContainer: {
    width: 50,                              //......Largura
    height: 50,                             //......Altura
    borderRadius: 8,                        //......Cantos arredondados
    overflow: 'hidden',                     //......Esconde overflow
    borderWidth: 2,                         //......Borda
    borderColor: CameraColors.textWhite,    //......Branca
  },

  // Imagem da miniatura
  thumbnailImage: {
    width: '100%',                          //......Largura total
    height: '100%',                         //......Altura total
  },

  // Badge de contador
  thumbnailBadge: {
    position: 'absolute',                   //......Posicao absoluta
    top: -4,                                //......Acima
    right: -4,                              //......Direita
    backgroundColor: CameraColors.primary,  //......Azul
    borderRadius: 10,                       //......Circular
    minWidth: 20,                           //......Largura minima
    height: 20,                             //......Altura
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    paddingHorizontal: 4,                   //......Padding
  },

  // Texto do badge
  thumbnailBadgeText: {
    fontSize: 10,                           //......Tamanho da fonte
    fontWeight: '600',                      //......Semi-bold
    color: CameraColors.textWhite,          //......Branco
  },

  // Container de permissao
  permissionContainer: {
    flex: 1,                                //......Ocupa tela toda
    backgroundColor: CameraColors.cameraBackground,
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza
    padding: 20,                            //......Padding
  },

  // Texto de permissao
  permissionText: {
    fontSize: 16,                           //......Tamanho da fonte
    color: CameraColors.textWhite,          //......Branco
    textAlign: 'center',                    //......Centraliza
    marginBottom: 24,                       //......Margem inferior
  },

  // Botao de permissao
  permissionButton: {
    paddingHorizontal: 24,                  //......Padding horizontal
    paddingVertical: 12,                    //......Padding vertical
    borderRadius: CameraStyles.borderRadiusButton,
    backgroundColor: CameraColors.primary,  //......Azul
  },

  // Texto do botao de permissao
  permissionButtonText: {
    fontSize: 16,                           //......Tamanho da fonte
    color: CameraColors.textWhite,          //......Branco
    fontWeight: '600',                      //......Semi-bold
  },

  // Footer com tabs de modo
  footer: {
    flexDirection: 'row',                   //......Layout horizontal
    justifyContent: 'center',               //......Centraliza
    alignItems: 'center',                   //......Centraliza vertical
    gap: 24,                                //......Espaco entre tabs
    paddingVertical: 20,                    //......Padding vertical
    backgroundColor: CameraColors.cameraBackground,
  },

  // Texto do modo
  modeText: {
    fontSize: 12,                           //......Tamanho da fonte
    fontWeight: '700',                      //......Bold
    color: CameraColors.textWhite,          //......Branco
    letterSpacing: 1,                       //......Espacamento entre letras
    textTransform: 'uppercase',             //......Maiusculas
  },

  // Texto do modo ativo
  modeTextActive: {
    color: '#53BDEB',                       //......Azul WhatsApp
  },

  // Botao de captura modo video
  captureButtonVideo: {
    borderColor: CameraColors.recordingRed, //......Borda vermelha
  },

  // Interior do botao modo video
  captureButtonInnerVideo: {
    backgroundColor: CameraColors.recordingRed,
  },
});
