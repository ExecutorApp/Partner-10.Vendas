// ========================================
// Estilos do CardDetailsModal
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
  success: '#22C55E',                 //......Verde sucesso
  warning: '#F59E0B',                 //......Amarelo aviso
  danger: '#EF4444',                  //......Vermelho perigo
  overlay: 'rgba(0, 0, 0, 0.5)',      //......Overlay escuro
};

// ========================================
// Estilos
// ========================================
export const styles = StyleSheet.create({
  // Overlay do modal
  overlay: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.overlay,  //......Fundo escuro
    justifyContent: 'flex-end',       //......Alinhar embaixo
  },

  // Container do modal
  container: {
    backgroundColor: COLORS.white,    //......Fundo branco
    borderTopLeftRadius: 20,          //......Arredondamento superior esquerdo
    borderTopRightRadius: 20,         //......Arredondamento superior direito
    maxHeight: '90%',                 //......Altura maxima
  },

  // Header do modal
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'flex-start',         //......Alinhar no topo
    justifyContent: 'space-between',  //......Espaco entre itens
    paddingHorizontal: 20,            //......Espaco horizontal
    paddingTop: 20,                   //......Espaco superior
    paddingBottom: 16,                //......Espaco inferior
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Info do header
  headerInfo: {
    flex: 1,                          //......Ocupar espaco
    marginRight: 12,                  //......Margem direita
  },

  // Titulo do modal
  title: {
    fontSize: 20,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 8,                  //......Margem inferior
  },

  // Badge de status
  statusBadge: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    alignSelf: 'flex-start',          //......Largura do conteudo
    paddingHorizontal: 10,            //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    borderRadius: 12,                 //......Arredondamento
    gap: 6,                           //......Espaco entre itens
  },

  // Dot do status
  statusDot: {
    width: 6,                         //......Largura
    height: 6,                        //......Altura
    borderRadius: 3,                  //......Arredondamento
  },

  // Texto do status
  statusText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Botao fechar
  closeButton: {
    width: 40,                        //......Largura
    height: 40,                       //......Altura
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    borderRadius: 20,                 //......Arredondamento
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

  // Secao de valor
  valueSection: {
    backgroundColor: COLORS.primary + '10', //..Fundo azul claro
    padding: 16,                      //......Espaco interno
    borderRadius: 12,                 //......Arredondamento
    marginBottom: 20,                 //......Margem inferior
  },

  // Label do valor
  valueLabel: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
    marginBottom: 4,                  //......Margem inferior
  },

  // Texto do valor
  valueText: {
    fontSize: 28,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.primary,            //......Cor azul
  },

  // Secao generica
  section: {
    marginBottom: 20,                 //......Margem inferior
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 12,                 //......Margem inferior
  },

  // Linha de informacao
  infoRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 12,                          //......Espaco entre itens
    marginBottom: 12,                 //......Margem inferior
  },

  // Texto da informacao
  infoText: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Container de tags
  tagsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 8,                           //......Espaco entre tags
  },

  // Tag individual
  tag: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 6,               //......Espaco vertical
    borderRadius: 16,                 //......Arredondamento
  },

  // Texto da tag
  tagText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Box de notas
  notesBox: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    padding: 12,                      //......Espaco interno
    borderRadius: 8,                  //......Arredondamento
  },

  // Texto das notas
  notesText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 20,                   //......Altura da linha
  },

  // Timeline container
  timeline: {
    paddingLeft: 4,                   //......Espaco esquerdo
  },

  // Item da timeline
  timelineItem: {
    flexDirection: 'row',             //......Layout horizontal
    marginBottom: 16,                 //......Margem inferior
  },

  // Lado esquerdo da timeline
  timelineLeft: {
    alignItems: 'center',             //......Centralizar horizontal
    marginRight: 12,                  //......Margem direita
  },

  // Linha da timeline
  timelineLine: {
    width: 2,                         //......Largura
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.border,   //......Cor da linha
    marginTop: 4,                     //......Margem superior
  },

  // Conteudo da timeline
  timelineContent: {
    flex: 1,                          //......Ocupar espaco
    paddingBottom: 8,                 //......Espaco inferior
  },

  // Acao da timeline
  timelineAction: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor texto
    marginBottom: 4,                  //......Margem inferior
  },

  // Data da timeline
  timelineDate: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Linha do toggle IA
  aiToggleRow: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre itens
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    padding: 16,                      //......Espaco interno
    borderRadius: 12,                 //......Arredondamento
  },

  // Info do toggle
  aiToggleInfo: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 12,                          //......Espaco entre itens
    flex: 1,                          //......Ocupar espaco
  },

  // Container de texto do toggle
  aiToggleTextContainer: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo do toggle
  aiToggleTitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Subtitulo do toggle
  aiToggleSubtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Footer com botoes
  footer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre botoes
    padding: 20,                      //......Espaco interno
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao de acao
  actionButton: {
    flex: 1,                          //......Ocupar espaco igual
    paddingVertical: 14,              //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Botao primario
  primaryButton: {
    backgroundColor: COLORS.primary,  //......Fundo azul
  },

  // Texto do botao primario
  primaryButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },

  // Botao secundario
  secondaryButton: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // Texto do botao secundario
  secondaryButtonText: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textSecondary,      //......Cor secundaria
  },
});

// ========================================
// Constantes de Status
// ========================================
import { LeadStatus } from '../../types/commercial.types';

// Cores por Status
export const STATUS_COLORS: Record<LeadStatus, string> = {
  hot: COLORS.danger,                 //......Vermelho para hot
  warm: COLORS.warning,               //......Amarelo para warm
  cold: COLORS.primary,               //......Azul para cold
  won: COLORS.success,                //......Verde para won
  lost: COLORS.textSecondary,         //......Cinza para lost
};

// Labels por Status
export const STATUS_LABELS: Record<LeadStatus, string> = {
  hot: 'Quente',                      //......Label hot
  warm: 'Morno',                      //......Label warm
  cold: 'Frio',                       //......Label cold
  won: 'Ganho',                       //......Label won
  lost: 'Perdido',                    //......Label lost
};
