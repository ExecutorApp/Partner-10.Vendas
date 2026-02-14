// ========================================
// Estilos do KanbanMobileView
// Arquivo 02 - StyleSheet separado
// ========================================

// ========================================
// Imports
// ========================================
import { StyleSheet, Dimensions } from 'react-native';

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
};

// ========================================
// Constantes de Layout
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; //..Limite para swipe

// ========================================
// Estilos
// ========================================
export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Barra de acoes
  actionsBar: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centraliza vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
  },

  // Botao WhatsApp
  whatsappButton: {
    height: 40,                       //......Altura fixa
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centraliza vertical
    gap: 8,                           //......Espaco entre itens
    paddingHorizontal: 12,            //......Padding horizontal
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
  },

  // Texto WhatsApp
  whatsappText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte media
    color: COLORS.textSecondary,      //......Cor cinza
  },

  // Texto WhatsApp conectado
  whatsappTextConnected: {
    color: '#22C55E',                 //......Verde
  },

  // Botao Adicionar
  addButton: {
    width: 40,                        //......Largura fixa
    height: 40,                       //......Altura fixa
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderRadius: 8,                  //......Arredondamento
  },

  // Ponto conectado
  statusDotConnected: {
    width: 8,                         //......Largura
    height: 8,                        //......Altura
    borderRadius: 4,                  //......Circular
    backgroundColor: '#22C55E',       //......Verde
  },

  // Seletor de fase
  phaseSelector: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    gap: 4,                           //......Espaco entre itens
    zIndex: 10,                       //......Nivel de empilhamento
  },

  // Botao de seta de navegacao
  navArrowButton: {
    width: 32,                        //......Largura fixa
    height: 40,                       //......Altura fixa
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
  },

  // Botao do seletor
  phaseSelectorButton: {
    flex: 1,                          //......Ocupar espaco
    height: 40,                       //......Altura fixa
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.white,    //......Fundo branco
    paddingHorizontal: 12,            //......Espaco horizontal
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
    gap: 6,                           //......Espaco entre itens
  },

  // Texto de contagem (numero grande)
  countText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte bold
    color: COLORS.primary,            //......Cor azul
  },

  // Texto de posicao grande
  positionTextLarge: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte media
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Dot de cor da fase
  phaseColorDot: {
    width: 10,                        //......Largura
    height: 10,                       //......Altura
    borderRadius: 5,                  //......Arredondamento
  },

  // Texto do seletor
  phaseSelectorText: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Dropdown de fases
  phaseDropdown: {
    position: 'absolute',             //......Posicao absoluta
    top: '100%',                      //......Abaixo do botao
    left: 16,                         //......Margem esquerda
    right: 16,                        //......Margem direita
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 8,                  //......Arredondamento
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
  phaseDropdownItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    gap: 8,                           //......Espaco entre itens
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor borda inferior
  },

  // Item ativo do dropdown
  phaseDropdownItemActive: {
    backgroundColor: 'rgba(23, 119, 207, 0.05)', //..Fundo azul claro
  },

  // Texto do dropdown
  phaseDropdownText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Texto ativo do dropdown
  phaseDropdownTextActive: {
    color: COLORS.primary,            //......Cor azul
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Navegacao de colunas
  columnNavigation: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    gap: 4,                           //......Espaco entre itens
  },

  // Info da coluna
  columnInfo: {
    flex: 1,                          //......Ocupar espaco
    height: 40,                       //......Altura fixa
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.white,    //......Fundo branco
    paddingHorizontal: 12,            //......Espaco horizontal
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
    gap: 6,                           //......Espaco entre itens
  },

  // Nome da coluna
  columnName: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Container de busca
  searchContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    marginHorizontal: 16,             //......Margem horizontal
    marginTop: 8,                     //......Margem superior
    paddingHorizontal: 12,            //......Espaco horizontal
    height: 40,                       //......Altura fixa
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor da borda
    gap: 8,                           //......Espaco entre itens
  },

  // Input de busca
  searchInput: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textPrimary,        //......Cor texto
    paddingVertical: 0,               //......Sem padding vertical
    outlineStyle: 'none',             //......Remove borda de foco web
  } as any,

  // Area de cards (container externo)
  cardsArea: {
    flex: 1,                          //......Ocupar espaco
    marginHorizontal: 16,             //......Margem horizontal
    marginTop: 8,                     //......Margem superior
    minHeight: 0,                     //......Fix para flexbox scroll
  },

  // Conteudo da lista (FlatList/ScrollView)
  cardsListContent: {
    paddingBottom: 16,                //......Espaco inferior
    flexGrow: 1,                      //......Permitir crescimento
  },

  // Estado vazio
  emptyState: {
    paddingVertical: 60,              //......Espaco vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto vazio
  emptyText: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Subtexto vazio
  emptySubtext: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 8,                     //......Margem superior
    opacity: 0.7,                     //......Opacidade
  },

  // Overlay do modal
  modalOverlay: {
    flex: 1,                          //......Ocupar tudo
    backgroundColor: 'rgba(0,0,0,0.5)', //...Fundo escuro
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    padding: 24,                      //......Padding
  },

  // Container do modal de acoes
  actionsModalContainer: {
    width: '100%',                    //......Largura total
    maxWidth: 320,                    //......Largura maxima
    backgroundColor: COLORS.white,    //......Fundo branco
    borderRadius: 16,                 //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
  },

  // Header do modal de acoes
  actionsModalHeader: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 20,            //......Padding horizontal
    paddingVertical: 16,              //......Padding vertical
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor borda
  },

  // Titulo do modal de acoes
  actionsModalTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte bold
    color: COLORS.textPrimary,        //......Cor escura
  },

  // Botao fechar modal
  actionsModalClose: {
    width: 32,                        //......Largura
    height: 32,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Opcoes do modal
  actionsModalOptions: {
    padding: 12,                      //......Padding
  },

  // Opcao individual
  actionsModalOption: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    padding: 12,                      //......Padding
    borderRadius: 12,                 //......Arredondamento
    gap: 12,                          //......Espaco entre
  },

  // Container do icone
  actionsModalIconContainer: {
    width: 44,                        //......Largura
    height: 44,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    backgroundColor: 'rgba(23, 119, 207, 0.1)', //..Fundo azul claro
    borderRadius: 10,                 //......Arredondamento
  },

  // Container texto da opcao
  actionsModalOptionText: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo da opcao
  actionsModalOptionTitle: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte bold
    color: COLORS.textPrimary,        //......Cor escura
  },

  // Descricao da opcao
  actionsModalOptionDesc: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },
});
