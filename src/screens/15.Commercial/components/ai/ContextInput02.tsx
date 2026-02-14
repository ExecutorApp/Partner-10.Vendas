// ========================================
// Estilos do ContextInput
// Arquivo 02 - StyleSheet separado
// ========================================

// ========================================
// Imports
// ========================================
import { StyleSheet } from 'react-native';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
};

// ========================================
// Estilos
// ========================================
export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.background, //....Fundo branco
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Titulo
  title: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Botao fechar
  closeButton: {
    padding: 4,                       //......Espaco interno
  },

  // Container das tabs
  tabsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Tab individual
  tab: {
    flex: 1,                          //......Ocupar espaco igual
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    paddingVertical: 12,              //......Espaco vertical
    gap: 6,                           //......Espaco entre
  },

  // Tab ativa
  tabActive: {
    borderBottomWidth: 2,             //......Borda inferior
    borderBottomColor: COLORS.primary, //....Cor azul
  },

  // Label da tab
  tabLabel: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Label da tab ativa
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.primary,            //......Cor azul
  },

  // ScrollView
  scrollView: {
    flex: 1,                          //......Ocupar espaco
  },

  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1,                      //......Crescer
  },

  // Container do conteudo
  contentContainer: {
    flex: 1,                          //......Ocupar espaco
    padding: 16,                      //......Espaco interno
  },

  // Input de texto
  textInput: {
    flex: 1,                          //......Ocupar espaco
    minHeight: 150,                   //......Altura minima
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 12,                      //......Espaco interno
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Contador de caracteres
  charCount: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    textAlign: 'right',               //......Alinhado direita
    marginTop: 8,                     //......Margem superior
  },

  // Botao selecionar arquivo
  selectFileButton: {
    alignItems: 'center',             //......Centralizar
    justifyContent: 'center',         //......Centralizar
    paddingVertical: 40,              //......Espaco vertical
    borderWidth: 2,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    borderStyle: 'dashed',            //......Estilo tracejado
    borderRadius: 12,                 //......Arredondamento
  },

  // Texto selecionar arquivo
  selectFileText: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.primary,            //......Cor azul
    marginTop: 8,                     //......Margem superior
  },

  // Hint selecionar arquivo
  selectFileHint: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
  },

  // Preview do arquivo
  filePreview: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 12,                      //......Espaco interno
  },

  // Info do arquivo
  fileInfo: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    flex: 1,                          //......Ocupar espaco
  },

  // Detalhes do arquivo
  fileDetails: {
    marginLeft: 12,                   //......Margem esquerda
    flex: 1,                          //......Ocupar espaco
  },

  // Nome do arquivo
  fileName: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Tamanho do arquivo
  fileSize: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Botao remover
  removeButton: {
    padding: 8,                       //......Espaco interno
  },

  // Preview do audio
  audioPreview: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 12,                      //......Espaco interno
  },

  // Info do audio
  audioInfo: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    flex: 1,                          //......Ocupar espaco
  },

  // Detalhes do audio
  audioDetails: {
    marginLeft: 12,                   //......Margem esquerda
    flex: 1,                          //......Ocupar espaco
  },

  // Label do audio
  audioLabel: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Texto da transcricao
  transcriptionText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
  },

  // Botao enviar
  submitButton: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    marginHorizontal: 16,             //......Margem horizontal
    marginVertical: 12,               //......Margem vertical
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 12,                 //......Arredondamento
    alignItems: 'center',             //......Centralizar
  },

  // Botao enviar desabilitado
  submitButtonDisabled: {
    backgroundColor: COLORS.border,   //......Fundo cinza
  },

  // Texto botao enviar
  submitButtonText: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});

// ========================================
// Export de Cores
// ========================================
export { COLORS };
