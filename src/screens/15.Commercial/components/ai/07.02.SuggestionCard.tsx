// ========================================
// Componente SuggestionCard
// Card de sugestao da IA com quick actions
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  AISuggestion,                       //......Tipo sugestao
  SuggestionType,                     //......Tipo de sugestao
  ActionType,                         //......Tipo de acao
} from '../../types/ai.types';

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
  success: '#22C55E',                 //......Verde
  warning: '#F59E0B',                 //......Amarelo
  danger: '#EF4444',                  //......Vermelho
};

// ========================================
// Icones SVG
// ========================================

// Icone de IA
const AIIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={COLORS.primary} />
    <Path d="M8 12h8M12 8v8" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de check
const CheckIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={COLORS.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de X
const RejectIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.danger} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de editar
const EditIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de mensagem
const MessageIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={COLORS.primary} strokeWidth={2} />
  </Svg>
);

// Icone de acao
const ActionIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={COLORS.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de insight
const InsightIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={COLORS.success} strokeWidth={2} />
    <Path d="M12 16v.01M12 12a2 2 0 10-2-2" stroke={COLORS.success} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface SuggestionCardProps {
  suggestion: AISuggestion;           //......Dados da sugestao
  onAccept?: () => void;              //......Callback aceitar
  onReject?: () => void;              //......Callback rejeitar
  onEdit?: () => void;                //......Callback editar
  showActions?: boolean;              //......Mostrar acoes
  compact?: boolean;                  //......Layout compacto
}

// ========================================
// Funcao para obter icone do tipo
// ========================================
const getTypeIcon = (type: SuggestionType) => {
  switch (type) {
    case 'message': return MessageIcon;
    case 'action': return ActionIcon;
    case 'insight': return InsightIcon;
    default: return MessageIcon;
  }
};

// ========================================
// Funcao para obter cor do tipo
// ========================================
const getTypeColor = (type: SuggestionType): string => {
  switch (type) {
    case 'message': return COLORS.primary;
    case 'action': return COLORS.warning;
    case 'insight': return COLORS.success;
    default: return COLORS.primary;
  }
};

// ========================================
// Funcao para obter label da acao
// ========================================
const getActionLabel = (actionType?: ActionType): string => {
  if (!actionType) return '';
  const labels: Record<ActionType, string> = {
    move_card: 'Mover Lead',
    send_message: 'Enviar Mensagem',
    schedule: 'Agendar',
    call: 'Ligar',
    email: 'Enviar Email',
    follow_up: 'Follow-up',
  };
  return labels[actionType] || '';
};

// ========================================
// Funcao para obter label da prioridade
// ========================================
const getPriorityLabel = (priority: number): string => {
  if (priority >= 4) return 'Urgente';
  if (priority >= 3) return 'Alta';
  if (priority >= 2) return 'Media';
  return 'Baixa';
};

// ========================================
// Funcao para obter cor da prioridade
// ========================================
const getPriorityColor = (priority: number): string => {
  if (priority >= 4) return COLORS.danger;
  if (priority >= 3) return COLORS.warning;
  return COLORS.textSecondary;
};

// ========================================
// Componente SuggestionCard
// ========================================
const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,                         //......Dados da sugestao
  onAccept,                           //......Callback aceitar
  onReject,                           //......Callback rejeitar
  onEdit,                             //......Callback editar
  showActions = true,                 //......Mostrar acoes
  compact = false,                    //......Layout compacto
}) => {
  // ========================================
  // Dados Formatados
  // ========================================
  const TypeIcon = useMemo(() => getTypeIcon(suggestion.type), [suggestion.type]);
  const typeColor = useMemo(() => getTypeColor(suggestion.type), [suggestion.type]);
  const actionLabel = useMemo(() => getActionLabel(suggestion.actionType), [suggestion.actionType]);
  const priorityLabel = useMemo(() => getPriorityLabel(suggestion.priority), [suggestion.priority]);
  const priorityColor = useMemo(() => getPriorityColor(suggestion.priority), [suggestion.priority]);

  // ========================================
  // Formatacao de Tempo
  // ========================================
  const timeAgo = useMemo(() => {
    const now = new Date();
    const created = new Date(suggestion.createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000 / 60);

    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  }, [suggestion.createdAt]);

  // ========================================
  // Handlers
  // ========================================
  const handleAccept = useCallback(() => {
    onAccept?.();                     //......Chamar callback
  }, [onAccept]);

  const handleReject = useCallback(() => {
    onReject?.();                     //......Chamar callback
  }, [onReject]);

  const handleEdit = useCallback(() => {
    onEdit?.();                       //......Chamar callback
  }, [onEdit]);

  // ========================================
  // Status do Card
  // ========================================
  const isProcessed = suggestion.confirmed || suggestion.rejected;

  // ========================================
  // Render
  // ========================================
  return (
    <View style={[
      styles.container,
      compact && styles.containerCompact,
      isProcessed && styles.containerProcessed,
    ]}>
      {/* Indicador de Cor */}
      <View style={[styles.colorIndicator, { backgroundColor: typeColor }]} />

      {/* Header */}
      <View style={styles.header}>
        {/* Icone e Badge */}
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
            <TypeIcon />
          </View>
          {suggestion.priority >= 3 && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {priorityLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Tempo e IA Badge */}
        <View style={styles.headerRight}>
          <View style={styles.aiBadge}>
            <AIIcon />
          </View>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
      </View>

      {/* Conteudo */}
      <View style={styles.content}>
        <Text style={styles.title}>{suggestion.title}</Text>
        {!compact && (
          <Text style={styles.description} numberOfLines={3}>
            {suggestion.description}
          </Text>
        )}

        {/* Acao Sugerida */}
        {actionLabel && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </View>
        )}
      </View>

      {/* Acoes */}
      {showActions && !isProcessed && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <RejectIcon />
            {!compact && <Text style={styles.rejectButtonText}>Rejeitar</Text>}
          </TouchableOpacity>

          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <EditIcon />
              {!compact && <Text style={styles.editButtonText}>Editar</Text>}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <CheckIcon />
            {!compact && <Text style={styles.acceptButtonText}>Aceitar</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Status Processado */}
      {isProcessed && (
        <View style={styles.processedStatus}>
          <Text style={[
            styles.processedText,
            { color: suggestion.confirmed ? COLORS.success : COLORS.danger },
          ]}>
            {suggestion.confirmed ? 'Aceita' : 'Rejeitada'}
          </Text>
        </View>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default SuggestionCard;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 12,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    overflow: 'hidden',               //......Esconder overflow
  },

  // Container compacto
  containerCompact: {
    padding: 12,                      //......Padding menor
  },

  // Container processado
  containerProcessed: {
    opacity: 0.7,                     //......Opacidade reduzida
  },

  // Indicador de cor
  colorIndicator: {
    position: 'absolute',             //......Posicao absoluta
    left: 0,                          //......Esquerda
    top: 0,                           //......Topo
    bottom: 0,                        //......Baixo
    width: 4,                         //......Largura
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingTop: 16,                   //......Espaco superior
    paddingLeft: 20,                  //......Espaco esquerda
  },

  // Header esquerda
  headerLeft: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre
  },

  // Header direita
  headerRight: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre
  },

  // Container icone
  iconContainer: {
    width: 32,                        //......Largura
    height: 32,                       //......Altura
    borderRadius: 16,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Badge prioridade
  priorityBadge: {
    paddingHorizontal: 8,             //......Espaco horizontal
    paddingVertical: 2,               //......Espaco vertical
    borderRadius: 10,                 //......Arredondamento
  },

  // Texto prioridade
  priorityText: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Badge IA
  aiBadge: {
    width: 24,                        //......Largura
    height: 24,                       //......Altura
  },

  // Texto tempo
  timeText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Conteudo
  content: {
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    paddingLeft: 20,                  //......Espaco esquerda
    gap: 4,                           //......Espaco entre
  },

  // Titulo
  title: {
    fontSize: 15,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Descricao
  description: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 18,                   //......Altura linha
  },

  // Badge acao
  actionBadge: {
    alignSelf: 'flex-start',          //......Alinhar inicio
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    paddingHorizontal: 10,            //......Espaco horizontal
    paddingVertical: 4,               //......Espaco vertical
    borderRadius: 12,                 //......Arredondamento
    marginTop: 4,                     //......Margem superior
  },

  // Texto acao
  actionText: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Acoes
  actions: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 8,                           //......Espaco entre
    padding: 16,                      //......Espaco interno
    paddingLeft: 20,                  //......Espaco esquerda
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Botao acao
  actionButton: {
    flex: 1,                          //......Ocupar espaco
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    gap: 6,                           //......Espaco entre
    paddingVertical: 10,              //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
  },

  // Botao rejeitar
  rejectButton: {
    borderColor: COLORS.danger + '30', //......Borda vermelha
    backgroundColor: COLORS.danger + '10',
  },

  // Texto rejeitar
  rejectButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.danger,             //......Cor vermelha
  },

  // Botao editar
  editButton: {
    borderColor: COLORS.border,       //......Borda cinza
    backgroundColor: COLORS.background, //....Fundo branco
  },

  // Texto editar
  editButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
  },

  // Botao aceitar
  acceptButton: {
    borderColor: COLORS.success + '30', //......Borda verde
    backgroundColor: COLORS.success + '10',
  },

  // Texto aceitar
  acceptButtonText: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.success,            //......Cor verde
  },

  // Status processado
  processedStatus: {
    padding: 12,                      //......Espaco interno
    alignItems: 'center',             //......Centralizar horizontal
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Texto processado
  processedText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
  },
});
