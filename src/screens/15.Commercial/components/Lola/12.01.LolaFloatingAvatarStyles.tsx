// ========================================
// Estilos do Avatar Flutuante Lola
// Estilos para todos os estados
// ========================================

// ========================================
// Imports
// ========================================
import { StyleSheet, Dimensions } from 'react-native';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ========================================
// Cores
// ========================================
export const COLORS = {
  primary: '#1777CF',                     //......Azul primario
  secondary: '#4A90D9',                   //......Azul secundario
  background: '#F5F7FA',                  //......Fundo cinza claro
  white: '#FFFFFF',                       //......Branco
  black: '#000000',                       //......Preto
  text: '#333333',                        //......Texto escuro
  textLight: '#666666',                   //......Texto claro
  border: '#E8ECF4',                      //......Borda
  overlay: 'rgba(0, 0, 0, 0.5)',          //......Overlay escurecido
  shadow: 'rgba(0, 0, 0, 0.15)',          //......Sombra
  bubbleBg: '#FFFFFF',                    //......Fundo da bolha
  quickActionBg: 'rgba(255, 255, 255, 0.9)', //...Fundo acoes rapidas
};

// ========================================
// Estilos do Avatar Flutuante
// ========================================
export const floatingStyles = StyleSheet.create({
  // Container do overlay
  overlayContainer: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: COLORS.overlay,      //......Cor do overlay
    zIndex: 998,                          //......Abaixo do avatar
  },

  // Container flutuante base
  floatingContainer: {
    position: 'absolute',                 //......Posicao absoluta
    zIndex: 999,                          //......Acima de tudo
    alignItems: 'center',                 //......Centraliza
    justifyContent: 'center',             //......Centraliza
  },

  // Posicao: inferior direito (float_p)
  positionBottomRight: {
    bottom: 100,                          //......Distancia do fundo
    right: 16,                            //......Distancia da direita
  },

  // Posicao: inferior centro (float_m)
  positionBottomCenter: {
    bottom: 100,                          //......Distancia do fundo
    left: (SCREEN_WIDTH - 150) / 2,       //......Centraliza
  },

  // Posicao: centro (float_g)
  positionCenter: {
    top: (SCREEN_HEIGHT - 250) / 2,       //......Centraliza vertical
    left: (SCREEN_WIDTH - 250) / 2,       //......Centraliza horizontal
  },

  // Container do avatar
  avatarContainer: {
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    borderRadius: 100,                    //......Circular
    backgroundColor: COLORS.white,        //......Fundo branco
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 4 }, //....Offset da sombra
    shadowOpacity: 0.2,                   //......Opacidade da sombra
    shadowRadius: 8,                      //......Raio da sombra
    elevation: 8,                         //......Elevacao Android
  },

  // Botao minimizar
  minimizeButton: {
    position: 'absolute',                 //......Posicao absoluta
    top: -5,                              //......Acima do avatar
    right: -5,                            //......Direita do avatar
    width: 24,                            //......Largura
    height: 24,                           //......Altura
    borderRadius: 12,                     //......Circular
    backgroundColor: COLORS.white,        //......Fundo branco
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset da sombra
    shadowOpacity: 0.15,                  //......Opacidade da sombra
    shadowRadius: 4,                      //......Raio da sombra
    elevation: 4,                         //......Elevacao Android
  },

  // Icone minimizar
  minimizeIcon: {
    fontSize: 14,                         //......Tamanho da fonte
    color: COLORS.text,                   //......Cor do texto
    fontWeight: 'bold',                   //......Peso da fonte
  },
});

// ========================================
// Estilos da Bolha de Chat
// ========================================
export const bubbleStyles = StyleSheet.create({
  // Container da bolha
  bubbleContainer: {
    position: 'absolute',                 //......Posicao absoluta
    top: -80,                             //......Acima do avatar
    left: -100,                           //......Esquerda do avatar
    width: 200,                           //......Largura
    backgroundColor: COLORS.bubbleBg,     //......Fundo branco
    borderRadius: 16,                     //......Arredondamento
    padding: 12,                          //......Padding
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset da sombra
    shadowOpacity: 0.15,                  //......Opacidade da sombra
    shadowRadius: 4,                      //......Raio da sombra
    elevation: 4,                         //......Elevacao Android
  },

  // Seta da bolha
  bubbleArrow: {
    position: 'absolute',                 //......Posicao absoluta
    bottom: -8,                           //......Abaixo da bolha
    right: 40,                            //......Direita
    width: 0,                             //......Largura zero
    height: 0,                            //......Altura zero
    borderLeftWidth: 8,                   //......Borda esquerda
    borderRightWidth: 8,                  //......Borda direita
    borderTopWidth: 8,                    //......Borda topo
    borderLeftColor: 'transparent',       //......Transparente
    borderRightColor: 'transparent',      //......Transparente
    borderTopColor: COLORS.bubbleBg,      //......Cor da bolha
  },

  // Texto da bolha
  bubbleText: {
    fontSize: 14,                         //......Tamanho da fonte
    color: COLORS.text,                   //......Cor do texto
    lineHeight: 20,                       //......Altura da linha
  },
});

// ========================================
// Estilos das Acoes Rapidas
// ========================================
export const quickActionsStyles = StyleSheet.create({
  // Container das acoes
  actionsContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    marginTop: 16,                        //......Margem topo
    gap: 12,                              //......Espaco entre botoes
  },

  // Botao de acao
  actionButton: {
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 8,                   //......Padding vertical
    borderRadius: 20,                     //......Arredondamento
    backgroundColor: COLORS.quickActionBg, //....Fundo
    borderWidth: 1,                       //......Borda
    borderColor: COLORS.border,           //......Cor da borda
  },

  // Texto do botao
  actionText: {
    fontSize: 12,                         //......Tamanho da fonte
    color: COLORS.text,                   //......Cor do texto
    fontWeight: '500',                    //......Peso da fonte
  },

  // Botao primario
  primaryButton: {
    backgroundColor: COLORS.primary,      //......Fundo azul
    borderColor: COLORS.primary,          //......Borda azul
  },

  // Texto primario
  primaryText: {
    color: COLORS.white,                  //......Cor branca
  },
});

// ========================================
// Estilos do Header Button
// ========================================
export const headerStyles = StyleSheet.create({
  // Container do botao no header
  headerButtonContainer: {
    position: 'absolute',                 //......Posicao absoluta
    right: 60,                            //......Distancia da direita
    top: '50%',                           //......Centro vertical
    marginTop: -22,                       //......Ajuste para centralizar
    zIndex: 100,                          //......Acima do header
  },

  // Botao do header
  headerButton: {
    width: 45,                            //......Largura
    height: 45,                           //......Altura
    borderRadius: 22.5,                   //......Circular
    backgroundColor: COLORS.white,        //......Fundo branco
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset da sombra
    shadowOpacity: 0.15,                  //......Opacidade da sombra
    shadowRadius: 4,                      //......Raio da sombra
    elevation: 4,                         //......Elevacao Android
    borderWidth: 2,                       //......Borda
    borderColor: COLORS.primary,          //......Cor da borda
  },

  // Avatar dentro do botao
  headerAvatar: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    borderRadius: 20,                     //......Circular
  },
});

// ========================================
// Export Default
// ========================================
export default {
  COLORS,
  floatingStyles,
  bubbleStyles,
  quickActionsStyles,
  headerStyles,
};
