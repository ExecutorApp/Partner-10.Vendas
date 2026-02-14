// ========================================
// Estilos do CreateColumnModal
// Arquivo 02 - StyleSheet separado
// ========================================

// ========================================
// Imports
// ========================================
import { StyleSheet } from 'react-native';

// ========================================
// Constantes de Cores
// ========================================
export const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
  danger: '#EF4444',                  //......Vermelho erro
  overlay: 'rgba(0, 0, 0, 0.5)',      //......Overlay escuro
};

// ========================================
// Cores Predefinidas para Colunas
// ========================================
export const COLUMN_COLORS = [
  '#1777CF',                          //......Azul principal
  '#22C55E',                          //......Verde
  '#F59E0B',                          //......Amarelo
  '#EF4444',                          //......Vermelho
  '#8B5CF6',                          //......Roxo
  '#EC4899',                          //......Rosa
  '#06B6D4',                          //......Ciano
  '#84CC16',                          //......Lima
];

// ========================================
// Estilos
// ========================================
export const styles = StyleSheet.create({
  // Evitar teclado
  keyboardAvoid: {
    flex: 1,                          //......Ocupar todo espaco
  },

  // Overlay do modal
  overlay: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.overlay,  //......Fundo escuro
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    padding: 20,                      //......Espaco interno
  },

  // Container do modal
  container: {
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 16,                 //......Arredondamento
    width: '100%',                    //......Largura total
    maxWidth: 400,                    //......Largura maxima
    maxHeight: '85%',                 //......Altura maxima
  },

  // Header do modal
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre itens
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingTop: 20,                   //......Espaco superior
    paddingBottom: 16,                //......Espaco inferior
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Titulo do modal
  title: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Botao fechar
  closeButton: {
    width: 36,                        //......Largura
    height: 36,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    borderRadius: 18,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Conteudo scrollavel
  content: {
    flex: 1,                          //......Ocupar espaco
  },

  // Container do conteudo
  contentContainer: {
    padding: 20,                      //......Espaco interno
  },

  // Campo de formulario
  field: {
    marginBottom: 20,                 //......Margem inferior
  },

  // Label do campo
  label: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 8,                  //......Margem inferior
  },

  // Dropdown
  dropdown: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre itens
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 10,                 //......Arredondamento
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    borderWidth: 1,                   //......Largura borda
    borderColor: 'transparent',       //......Borda transparente
  },

  // Valor do dropdown
  dropdownValue: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 10,                          //......Espaco entre itens
  },

  // Texto do dropdown
  dropdownText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Placeholder do dropdown
  dropdownPlaceholder: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Lista do dropdown
  dropdownList: {
    position: 'absolute',             //......Posicao absoluta
    top: '100%',                      //......Abaixo do dropdown
    left: 0,                          //......Alinhado a esquerda
    right: 0,                         //......Alinhado a direita
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 10,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
    marginTop: 4,                     //......Margem superior
    shadowColor: '#000',              //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //..Offset sombra
    shadowOpacity: 0.1,               //......Opacidade sombra
    shadowRadius: 4,                  //......Raio sombra
    elevation: 4,                     //......Elevacao Android
  },

  // Item do dropdown
  dropdownItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    gap: 10,                          //......Espaco entre itens
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor borda inferior
  },

  // Item ativo do dropdown
  dropdownItemActive: {
    backgroundColor: 'rgba(23, 119, 207, 0.05)', //..Fundo azul claro
  },

  // Texto do item
  dropdownItemText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Texto ativo do item
  dropdownItemTextActive: {
    color: COLORS.primary,            //......Cor azul
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Dot de cor da fase
  phaseColorDot: {
    width: 10,                        //......Largura
    height: 10,                       //......Altura
    borderRadius: 5,                  //......Arredondamento
  },

  // Input de texto
  input: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 10,                 //......Arredondamento
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
    borderWidth: 1,                   //......Largura borda
    borderColor: 'transparent',       //......Borda transparente
  },

  // Input com erro
  inputError: {
    borderColor: COLORS.danger,       //......Borda vermelha
  },

  // Grid de cores
  colorsGrid: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 12,                          //......Espaco entre cores
  },

  // Opcao de cor
  colorOption: {
    width: 44,                        //......Largura
    height: 44,                       //......Altura
    borderRadius: 22,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Cor selecionada
  colorOptionSelected: {
    borderWidth: 3,                   //......Largura borda
    borderColor: COLORS.white,        //......Borda branca
    shadowColor: '#000',              //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //..Offset sombra
    shadowOpacity: 0.2,               //......Opacidade sombra
    shadowRadius: 4,                  //......Raio sombra
    elevation: 4,                     //......Elevacao Android
  },

  // Container de preview
  previewContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    padding: 16,                      //......Espaco interno
    borderRadius: 10,                 //......Arredondamento
    gap: 12,                          //......Espaco entre itens
  },

  // Indicador do preview
  previewIndicator: {
    width: 4,                         //......Largura
    height: 24,                       //......Altura
    borderRadius: 2,                  //......Arredondamento
  },

  // Texto do preview
  previewText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Texto de erro
  errorText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.danger,             //......Cor vermelha
    textAlign: 'center',              //......Texto centralizado
  },

  // Footer com botoes
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre botoes
    padding: 20,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao generico
  button: {
    flex: 1,                          //......Ocupar espaco igual
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao cancelar
  cancelButton: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Texto do botao cancelar
  cancelButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao criar
  createButton: {
    backgroundColor: COLORS.primary,  //......Fundo azul
  },

  // Texto do botao criar
  createButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});
