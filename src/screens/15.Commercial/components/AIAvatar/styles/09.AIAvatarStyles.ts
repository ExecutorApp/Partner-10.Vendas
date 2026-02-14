// ========================================
// Estilos do Avatar IA Lola
// Estilos para o modal e componentes
// ========================================

import { StyleSheet, Dimensions } from 'react-native';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.65;         //......65% da largura

// ========================================
// Cores
// ========================================
export const COLORS = {
  primary: '#1777CF',                             //......Azul principal
  primaryDark: '#1260A8',                         //......Azul escuro
  background: '#FCFCFC',                          //......Fundo branco
  backgroundAlt: '#F4F4F4',                       //......Fundo cinza
  textPrimary: '#3A3F51',                         //......Texto escuro
  textSecondary: '#7D8592',                       //......Texto cinza
  textPlaceholder: '#91929E',                     //......Placeholder
  border: '#D8E0F0',                              //......Borda clara
  white: '#FFFFFF',                               //......Branco
  overlay: 'rgba(0, 0, 0, 0.5)',                  //......Overlay escuro
  danger: '#EF4444',                              //......Vermelho
  success: '#22C55E',                             //......Verde
};

// ========================================
// Estilos Principais
// ========================================
export const styles = StyleSheet.create({
  // Container do modal
  modalContainer: {
    flex: 1,                                      //......Ocupa toda tela
    flexDirection: 'row',                         //......Layout horizontal
  },

  // Overlay (cobre toda a tela atras do modal)
  overlay: {
    position: 'absolute',                         //......Posicao absoluta
    top: 0,                                       //......Topo
    left: 0,                                      //......Esquerda
    right: 0,                                     //......Direita
    bottom: 0,                                    //......Fundo
    backgroundColor: COLORS.overlay,              //......Fundo escuro semi-transparente
  },

  // Patch canto superior direito - cobre o azul que aparece no canto arredondado
  cornerPatchTop: {
    position: 'absolute',                         //......Posicao absoluta
    top: 0,                                       //......Topo da tela
    left: MODAL_WIDTH - 16,                       //......Posicao do canto do modal
    width: 16,                                    //......Largura igual ao radius
    height: 16,                                   //......Altura igual ao radius
    backgroundColor: '#000000',                   //......Preto solido para cobrir
    borderBottomLeftRadius: 16,                   //......Curva para acompanhar o modalContent
    zIndex: 0,                                    //......Atras do modalContent
  },

  // Patch canto inferior direito - cobre o azul que aparece no canto arredondado
  cornerPatchBottom: {
    position: 'absolute',                         //......Posicao absoluta
    bottom: 0,                                    //......Base da tela
    left: MODAL_WIDTH - 16,                       //......Posicao do canto do modal
    width: 16,                                    //......Largura igual ao radius
    height: 16,                                   //......Altura igual ao radius
    backgroundColor: '#000000',                   //......Preto solido para cobrir
    borderTopLeftRadius: 16,                      //......Curva para acompanhar o modalContent
    zIndex: 0,                                    //......Atras do modalContent
  },

  // Conteudo do modal (esquerda) - Container principal
  modalContent: {
    width: MODAL_WIDTH,                           //......65% da largura
    height: '100%',                               //......Altura total
    backgroundColor: COLORS.background,           //......Fundo branco
    borderTopRightRadius: 16,                     //......Borda arredondada superior direita
    borderBottomRightRadius: 16,                  //......Borda arredondada inferior direita
    overflow: 'hidden',                           //......Clipar conteudo filho
  },

  // Header do modal
  header: {
    flexDirection: 'row',                         //......Layout horizontal
    justifyContent: 'space-between',              //......Espaco entre
    alignItems: 'center',                         //......Centralizar vertical
    paddingHorizontal: 16,                        //......Padding horizontal
    paddingVertical: 12,                          //......Padding vertical
    backgroundColor: 'transparent',               //......Fundo transparente (SVG desenha)
    position: 'relative',                         //......Para posicionar SVG
  },

  // Titulo do header
  headerTitle: {
    fontSize: 16,                                 //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',              //......Fonte bold
    color: COLORS.white,                          //......Cor branca
    zIndex: 1,                                    //......Acima do SVG
  },

  // Botao fechar
  closeButton: {
    width: 32,                                    //......Largura
    height: 32,                                   //......Altura
    justifyContent: 'center',                     //......Centralizar vertical
    alignItems: 'center',                         //......Centralizar horizontal
    zIndex: 1,                                    //......Acima do SVG
  },

  // Container do avatar (50% superior)
  avatarContainer: {
    height: SCREEN_HEIGHT * 0.4,                  //......40% da altura
    justifyContent: 'center',                     //......Centralizar vertical
    alignItems: 'center',                         //......Centralizar horizontal
    backgroundColor: COLORS.backgroundAlt,        //......Fundo cinza
    paddingVertical: 16,                          //......Padding vertical
    zIndex: 1,                                    //......Acima do fundo modal
  },

  // Texto de status
  statusText: {
    fontSize: 14,                                 //......Tamanho fonte
    fontFamily: 'Inter_500Medium',                //......Fonte media
    color: COLORS.textSecondary,                  //......Cor cinza
    marginTop: 8,                                 //......Margem superior
  },

  // Container do chat (30% meio)
  chatContainer: {
    flex: 1,                                      //......Ocupa espaco restante
    backgroundColor: COLORS.background,           //......Fundo branco
    zIndex: 1,                                    //......Acima do fundo modal
  },

  // Conteudo do chat
  chatContent: {
    paddingHorizontal: 16,                        //......Padding horizontal
    paddingVertical: 12,                          //......Padding vertical
  },

  // Container do input (20% inferior)
  inputContainer: {
    paddingHorizontal: 16,                        //......Padding horizontal
    paddingVertical: 12,                          //......Padding vertical
    borderTopWidth: 1,                            //......Borda superior
    borderTopColor: COLORS.border,                //......Cor da borda
    backgroundColor: 'transparent',               //......Fundo transparente
    zIndex: 1,                                    //......Acima do fundo modal
    position: 'relative',                         //......Posicao relativa para filhos absolutos
  },

  // Fundo do input (resolve bug do RN Web)
  inputBackground: {
    position: 'absolute',                         //......Posicao absoluta
    top: 0,                                       //......Topo
    left: 0,                                      //......Esquerda
    right: 0,                                     //......Direita
    bottom: 0,                                    //......Fundo
    backgroundColor: COLORS.background,           //......Fundo branco
    borderBottomRightRadius: 16,                  //......Borda arredondada inferior direita
    zIndex: 0,                                    //......Fica atras do conteudo
  },

  // Linha do input
  inputRow: {
    flexDirection: 'row',                         //......Layout horizontal
    alignItems: 'flex-end',                       //......Alinhar no fundo
    gap: 8,                                       //......Espaco entre
    zIndex: 1,                                    //......Acima do fundo
  },

  // Input de texto
  textInput: {
    flex: 1,                                      //......Ocupa espaco
    minHeight: 40,                                //......Altura minima
    maxHeight: 100,                               //......Altura maxima
    paddingHorizontal: 12,                        //......Padding horizontal
    paddingVertical: 10,                          //......Padding vertical
    fontSize: 14,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.textPrimary,                    //......Cor do texto
    backgroundColor: COLORS.backgroundAlt,        //......Fundo cinza
    borderRadius: 20,                             //......Borda arredondada
    borderWidth: 0,                               //......Sem borda
  },

  // Botao de enviar
  sendButton: {
    width: 40,                                    //......Largura
    height: 40,                                   //......Altura
    borderRadius: 20,                             //......Circular
    backgroundColor: COLORS.primary,              //......Fundo azul
    justifyContent: 'center',                     //......Centralizar vertical
    alignItems: 'center',                         //......Centralizar horizontal
  },

  // Botao desabilitado
  buttonDisabled: {
    opacity: 0.5,                                 //......Opacidade
  },
});

// ========================================
// Estilos do Avatar
// ========================================
export const avatarStyles = StyleSheet.create({
  // Container do avatar
  container: {
    width: '100%',                                //......Largura total
    height: '100%',                               //......Altura total
    justifyContent: 'center',                     //......Centralizar vertical
    alignItems: 'center',                         //......Centralizar horizontal
  },

  // Imagem do avatar
  avatarImage: {
    width: 200,                                   //......Largura imagem
    height: 200,                                  //......Altura imagem
  },

  // Container do avatar grande
  avatarLarge: {
    width: 250,                                   //......Largura maior
    height: 250,                                  //......Altura maior
  },
});

// ========================================
// Estilos do Gravador de Voz
// ========================================
export const recorderStyles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                         //......Layout horizontal
    alignItems: 'center',                         //......Centralizar vertical
  },

  // Botao de microfone
  micButton: {
    width: 40,                                    //......Largura
    height: 40,                                   //......Altura
    borderRadius: 20,                             //......Circular
    backgroundColor: COLORS.primary,              //......Fundo azul
    justifyContent: 'center',                     //......Centralizar vertical
    alignItems: 'center',                         //......Centralizar horizontal
  },

  // Botao desabilitado
  disabled: {
    opacity: 0.5,                                 //......Opacidade
  },

  // Container de gravacao
  recordingContainer: {
    flexDirection: 'row',                         //......Layout horizontal
    alignItems: 'center',                         //......Centralizar vertical
    flex: 1,                                      //......Ocupa espaco
    gap: 8,                                       //......Espaco entre
  },

  // Botao cancelar
  cancelButton: {
    flexDirection: 'row',                         //......Layout horizontal
    alignItems: 'center',                         //......Centralizar vertical
    gap: 4,                                       //......Espaco entre
  },

  // Texto cancelar
  cancelText: {
    fontSize: 12,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.danger,                         //......Cor vermelha
  },

  // Indicador de gravacao
  recordingIndicator: {
    flexDirection: 'row',                         //......Layout horizontal
    alignItems: 'center',                         //......Centralizar vertical
    gap: 8,                                       //......Espaco entre
  },

  // Ponto vermelho
  recordingDot: {
    width: 8,                                     //......Largura
    height: 8,                                    //......Altura
    borderRadius: 4,                              //......Circular
    backgroundColor: COLORS.danger,               //......Cor vermelha
  },

  // Tempo de gravacao
  recordingTime: {
    fontSize: 14,                                 //......Tamanho fonte
    fontFamily: 'Inter_500Medium',                //......Fonte media
    color: COLORS.textPrimary,                    //......Cor escura
  },
});

// ========================================
// Estilos das Bolhas de Chat
// ========================================
export const bubbleStyles = StyleSheet.create({
  // Container da bolha
  container: {
    marginBottom: 12,                             //......Margem inferior
    maxWidth: '85%',                              //......Largura maxima
  },

  // Bolha do usuario (direita)
  userBubble: {
    alignSelf: 'flex-end',                        //......Alinhar direita
    backgroundColor: COLORS.primary,              //......Fundo azul
    borderRadius: 16,                             //......Borda arredondada
    borderBottomRightRadius: 4,                   //......Canto inferior direito
    paddingHorizontal: 12,                        //......Padding horizontal
    paddingVertical: 8,                           //......Padding vertical
  },

  // Bolha da IA (esquerda)
  aiBubble: {
    alignSelf: 'flex-start',                      //......Alinhar esquerda
    backgroundColor: COLORS.backgroundAlt,        //......Fundo cinza
    borderRadius: 16,                             //......Borda arredondada
    borderBottomLeftRadius: 4,                    //......Canto inferior esquerdo
    paddingHorizontal: 12,                        //......Padding horizontal
    paddingVertical: 8,                           //......Padding vertical
  },

  // Texto do usuario
  userText: {
    fontSize: 14,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.white,                          //......Cor branca
    lineHeight: 20,                               //......Altura da linha
  },

  // Texto da IA
  aiText: {
    fontSize: 14,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.textPrimary,                    //......Cor escura
    lineHeight: 20,                               //......Altura da linha
  },

  // Timestamp
  timestamp: {
    fontSize: 10,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.textSecondary,                  //......Cor cinza
    marginTop: 4,                                 //......Margem superior
  },

  // Timestamp usuario
  timestampUser: {
    textAlign: 'right',                           //......Alinhar direita
    color: 'rgba(255, 255, 255, 0.7)',            //......Branco transparente
  },
});

// ========================================
// Estilos das Sugestoes Rapidas
// ========================================
export const suggestionStyles = StyleSheet.create({
  // Container das sugestoes
  container: {
    marginBottom: 12,                             //......Margem inferior
  },

  // ScrollView horizontal
  scrollContent: {
    paddingRight: 16,                             //......Padding direito
  },

  // Chip de sugestao
  chip: {
    paddingHorizontal: 12,                        //......Padding horizontal
    paddingVertical: 8,                           //......Padding vertical
    backgroundColor: COLORS.backgroundAlt,        //......Fundo cinza
    borderRadius: 16,                             //......Borda arredondada
    marginRight: 8,                               //......Margem direita
    borderWidth: 1,                               //......Largura borda
    borderColor: COLORS.border,                   //......Cor da borda
  },

  // Chip pressionado
  chipPressed: {
    backgroundColor: COLORS.primary,              //......Fundo azul
    borderColor: COLORS.primary,                  //......Borda azul
  },

  // Texto do chip
  chipText: {
    fontSize: 12,                                 //......Tamanho fonte
    fontFamily: 'Inter_400Regular',               //......Fonte regular
    color: COLORS.textPrimary,                    //......Cor escura
  },

  // Texto do chip pressionado
  chipTextPressed: {
    color: COLORS.white,                          //......Cor branca
  },
});
