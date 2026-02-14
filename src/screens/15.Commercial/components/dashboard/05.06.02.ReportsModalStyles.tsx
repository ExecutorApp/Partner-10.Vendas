// ========================================
// Estilos do ReportsModal
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
  success: '#22C55E',                 //......Verde
  danger: '#EF4444',                  //......Vermelho
  overlay: 'rgba(0,0,0,0.5)',         //......Overlay escuro
};

// ========================================
// Constantes de Layout
// ========================================
export const DESKTOP_BREAKPOINT = 768; //......Breakpoint desktop

// ========================================
// Estilos
// ========================================
export const styles = StyleSheet.create({
  // Overlay
  overlay: {
    flex: 1,                          //......Ocupar tela
    justifyContent: 'flex-end',       //......Alinhar embaixo
  },

  // Background do overlay
  overlayBackground: {
    ...StyleSheet.absoluteFillObject, //......Preencher tudo
    backgroundColor: COLORS.overlay,  //......Cor escura
  },

  // Container do modal
  modalContainer: {
    backgroundColor: COLORS.background, //....Fundo branco
    borderTopLeftRadius: 20,          //......Arredondamento
    borderTopRightRadius: 20,         //......Arredondamento
    paddingBottom: 24,                //......Espaco inferior
  },

  // Modal desktop
  modalDesktop: {
    position: 'absolute',             //......Posicao absoluta
    right: 0,                         //......Direita
    top: 0,                           //......Topo
    bottom: 0,                        //......Baixo
    width: '40%',                     //......40% da tela
    borderRadius: 0,                  //......Sem arredondamento
    borderTopLeftRadius: 0,           //......Sem arredondamento
    borderTopRightRadius: 0,          //......Sem arredondamento
  },

  // Modal mobile
  modalMobile: {
    maxHeight: '80%',                 //......80% da altura
  },

  // Handle de arrastar
  dragHandle: {
    width: 40,                        //......Largura
    height: 4,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor cinza
    borderRadius: 2,                  //......Arredondamento
    alignSelf: 'center',              //......Centralizar
    marginTop: 12,                    //......Margem superior
    marginBottom: 8,                  //......Margem inferior
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingVertical: 16,              //......Espaco vertical
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Conteudo
  content: {
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingTop: 16,                   //......Espaco superior
  },

  // Secao
  section: {
    marginBottom: 24,                 //......Margem inferior
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 12,                 //......Margem inferior
  },

  // Container de chips
  chipsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 8,                           //......Espaco entre
  },

  // Chip
  chip: {
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    borderRadius: 20,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Chip selecionado
  chipSelected: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderColor: COLORS.primary,      //......Borda azul
  },

  // Texto do chip
  chipText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Texto chip selecionado
  chipTextSelected: {
    color: '#FFFFFF',                 //......Cor branca
  },

  // Container de exportacao
  exportContainer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
  },

  // Botao exportar
  exportButton: {
    flex: 1,                          //......Ocupar espaco
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    gap: 8,                           //......Espaco entre
    paddingVertical: 12,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
  },

  // Botao PDF
  exportButtonPDF: {
    backgroundColor: COLORS.danger + '10', //..Fundo vermelho claro
    borderColor: COLORS.danger + '30', //......Borda vermelha
  },

  // Botao Excel
  exportButtonExcel: {
    backgroundColor: COLORS.success + '10', //..Fundo verde claro
    borderColor: COLORS.success + '30', //......Borda verde
  },

  // Texto botao exportar
  exportButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
  },

  // Texto PDF
  exportTextPDF: {
    color: COLORS.danger,             //......Cor vermelha
  },

  // Texto Excel
  exportTextExcel: {
    color: COLORS.success,            //......Cor verde
  },

  // Footer
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao limpar
  clearButton: {
    flex: 1,                          //......Ocupar espaco
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Texto botao limpar
  clearButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Botao aplicar
  applyButton: {
    flex: 2,                          //......Ocupar mais espaco
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    backgroundColor: COLORS.primary,  //......Fundo azul
  },

  // Texto botao aplicar
  applyButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: '#FFFFFF',                 //......Cor branca
  },
});
