// ========================================
// Estilos do ChannelModal
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
  warning: '#F59E0B',                 //......Amarelo
  danger: '#EF4444',                  //......Vermelho
  overlay: 'rgba(0,0,0,0.5)',         //......Overlay escuro
  instagram: '#E4405F',               //......Rosa Instagram
  facebook: '#1877F2',                //......Azul Facebook
  linkedin: '#0A66C2',                //......Azul LinkedIn
  whatsapp: '#25D366',                //......Verde WhatsApp
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
  },

  // Modal desktop
  modalDesktop: {
    position: 'absolute',             //......Posicao absoluta
    right: 0,                         //......Direita
    top: 0,                           //......Topo
    bottom: 0,                        //......Baixo
    width: '45%',                     //......45% da tela
    borderRadius: 0,                  //......Sem arredondamento
  },

  // Modal mobile
  modalMobile: {
    maxHeight: '90%',                 //......90% da altura
  },

  // Handle de arrastar
  dragHandle: {
    width: 40,                        //......Largura
    height: 4,                        //......Altura
    backgroundColor: COLORS.border,   //......Cor cinza
    borderRadius: 2,                  //......Arredondamento
    alignSelf: 'center',              //......Centralizar
    marginTop: 12,                    //......Margem superior
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'flex-start',         //......Alinhar topo
    padding: 20,                      //......Espaco interno
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Header esquerda
  headerLeft: {
    flex: 1,                          //......Ocupar espaco
    gap: 8,                           //......Espaco entre
  },

  // Badge do header
  headerBadge: {
    alignSelf: 'flex-start',          //......Alinhar inicio
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    borderRadius: 12,                 //......Arredondamento
  },

  // Texto do badge
  headerBadgeText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Nome do lead no header
  headerLeadName: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Conteudo
  content: {
    flex: 1,                          //......Ocupar espaco
    padding: 20,                      //......Espaco interno
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 12,                 //......Margem inferior
    marginTop: 20,                    //......Margem superior
  },

  // Card de info
  infoCard: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 12,                 //......Arredondamento
    padding: 16,                      //......Espaco interno
    gap: 12,                          //......Espaco entre
  },

  // Linha de info
  infoRow: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
  },

  // Label da info
  infoLabel: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Valor da info
  infoValue: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
    textAlign: 'right',               //......Alinhado direita
    flex: 1,                          //......Ocupar espaco
    marginLeft: 12,                   //......Margem esquerda
  },

  // Timeline
  timeline: {
    gap: 0,                           //......Sem espaco
  },

  // Item da timeline
  timelineItem: {
    flexDirection: 'row',             //......Layout horizontal
    position: 'relative',             //......Posicao relativa
    paddingBottom: 20,                //......Espaco inferior
  },

  // Linha da timeline
  timelineLine: {
    position: 'absolute',             //......Posicao absoluta
    left: 7,                          //......Esquerda
    top: 20,                          //......Topo
    bottom: 0,                        //......Baixo
    width: 2,                         //......Largura
    backgroundColor: COLORS.border,   //......Cor da borda
  },

  // Ponto da timeline
  timelinePoint: {
    width: 16,                        //......Largura
    height: 16,                       //......Altura
    borderRadius: 8,                  //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    marginRight: 12,                  //......Margem direita
  },

  // Ponto ativo
  timelinePointActive: {
    backgroundColor: COLORS.primary + '20', //..Fundo azul claro
  },

  // Conteudo da timeline
  timelineContent: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo da timeline
  timelineTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 2,                  //......Margem inferior
  },

  // Descricao da timeline
  timelineDescription: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginBottom: 2,                  //......Margem inferior
  },

  // Data da timeline
  timelineDate: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Espacador inferior
  bottomSpacer: {
    height: 20,                       //......Altura
  },

  // Footer
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre
    padding: 20,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao footer
  footerButton: {
    flex: 1,                          //......Ocupar espaco
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    gap: 8,                           //......Espaco entre
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Botao primario
  footerButtonPrimary: {
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderColor: COLORS.primary,      //......Borda azul
  },

  // Texto botao
  footerButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Texto botao primario
  footerButtonTextPrimary: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: '#FFFFFF',                 //......Cor branca
  },
});
