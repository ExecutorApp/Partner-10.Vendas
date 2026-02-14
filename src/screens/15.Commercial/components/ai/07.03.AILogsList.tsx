// ========================================
// Componente AILogsList
// Lista de logs de acoes da IA
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
  FlatList,                           //......Lista otimizada
  StyleSheet,                         //......Estilos
  ListRenderItem,                     //......Tipo renderizador
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
  Circle,                             //......Circulo SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import {
  AILog,                              //......Tipo log
  AILogActionType,                    //......Tipo acao
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
// Icones SVG por Tipo
// ========================================

// Icone de resposta automatica
const AutoReplyIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={COLORS.primary} strokeWidth={2} />
  </Svg>
);

// Icone de sugestao
const SuggestionIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke={COLORS.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de check
const AcceptedIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={COLORS.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de X
const RejectedIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={COLORS.danger} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de contexto
const ContextIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={COLORS.primary} strokeWidth={2} />
    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de analise
const AnalysisIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M21.21 15.89A10 10 0 118 2.83" stroke={COLORS.success} strokeWidth={2} />
    <Path d="M22 12A10 10 0 0012 2v10z" stroke={COLORS.success} strokeWidth={2} />
  </Svg>
);

// Icone de alerta
const AlertIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke={COLORS.warning} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de status
const StatusIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={COLORS.primary} strokeWidth={2} />
    <Path d="M12 6v6l4 2" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface AILogsListProps {
  logs: AILog[];                      //......Lista de logs
  maxItems?: number;                  //......Maximo de items
  title?: string;                     //......Titulo
}

// ========================================
// Funcao para obter icone
// ========================================
const getActionIcon = (type: AILogActionType) => {
  switch (type) {
    case 'auto_reply': return AutoReplyIcon;
    case 'suggestion_sent': return SuggestionIcon;
    case 'suggestion_accepted': return AcceptedIcon;
    case 'suggestion_rejected': return RejectedIcon;
    case 'context_captured': return ContextIcon;
    case 'lead_analyzed': return AnalysisIcon;
    case 'alert_triggered': return AlertIcon;
    case 'status_changed': return StatusIcon;
    default: return StatusIcon;
  }
};

// ========================================
// Funcao para obter cor
// ========================================
const getActionColor = (type: AILogActionType): string => {
  switch (type) {
    case 'auto_reply': return COLORS.primary;
    case 'suggestion_sent': return COLORS.warning;
    case 'suggestion_accepted': return COLORS.success;
    case 'suggestion_rejected': return COLORS.danger;
    case 'context_captured': return COLORS.primary;
    case 'lead_analyzed': return COLORS.success;
    case 'alert_triggered': return COLORS.warning;
    case 'status_changed': return COLORS.primary;
    default: return COLORS.textSecondary;
  }
};

// ========================================
// Funcao para obter label
// ========================================
const getActionLabel = (type: AILogActionType): string => {
  const labels: Record<AILogActionType, string> = {
    auto_reply: 'Resposta Automatica',
    suggestion_sent: 'Sugestao Enviada',
    suggestion_accepted: 'Sugestao Aceita',
    suggestion_rejected: 'Sugestao Rejeitada',
    context_captured: 'Contexto Capturado',
    lead_analyzed: 'Lead Analisado',
    alert_triggered: 'Alerta Disparado',
    status_changed: 'Status Alterado',
  };
  return labels[type] || type;
};

// ========================================
// Componente LogItem
// ========================================
interface LogItemProps {
  log: AILog;                         //......Dados do log
  isLast: boolean;                    //......Se e o ultimo
}

const LogItem: React.FC<LogItemProps> = ({
  log,                                //......Dados do log
  isLast,                             //......Se e o ultimo
}) => {
  // ========================================
  // Dados Formatados
  // ========================================
  const Icon = useMemo(() => getActionIcon(log.actionType), [log.actionType]);
  const color = useMemo(() => getActionColor(log.actionType), [log.actionType]);
  const label = useMemo(() => getActionLabel(log.actionType), [log.actionType]);

  const formattedTime = useMemo(() => {
    const date = new Date(log.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [log.timestamp]);

  const formattedDate = useMemo(() => {
    const date = new Date(log.timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }, [log.timestamp]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.logItem}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: color + '20' }]}>
          <Icon />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Conteudo */}
      <View style={styles.logContent}>
        {/* Header */}
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={styles.logLabel}>{label}</Text>
            {log.wasAutomatic && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>Auto</Text>
              </View>
            )}
          </View>
          <Text style={styles.logTime}>{formattedTime}</Text>
        </View>

        {/* Descricao */}
        <Text style={styles.logDescription} numberOfLines={2}>
          {log.description}
        </Text>

        {/* Lead Info */}
        {log.leadName && (
          <Text style={styles.logLead}>Lead: {log.leadName}</Text>
        )}

        {/* Data */}
        <Text style={styles.logDate}>{formattedDate}</Text>
      </View>
    </View>
  );
};

// ========================================
// Componente AILogsList
// ========================================
const AILogsList: React.FC<AILogsListProps> = ({
  logs,                               //......Lista de logs
  maxItems,                           //......Maximo de items
  title = 'Historico de Acoes',       //......Titulo padrao
}) => {
  // ========================================
  // Logs Limitados
  // ========================================
  const displayLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  }, [logs, maxItems]);

  // ========================================
  // Render Item
  // ========================================
  const renderItem: ListRenderItem<AILog> = useCallback(({ item, index }) => (
    <LogItem
      log={item}
      isLast={index === displayLogs.length - 1}
    />
  ), [displayLogs.length]);

  // ========================================
  // Key Extractor
  // ========================================
  const keyExtractor = useCallback((item: AILog) => item.id, []);

  // ========================================
  // Empty Component
  // ========================================
  const EmptyComponent = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Nenhuma acao registrada</Text>
    </View>
  ), []);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {displayLogs.length} registro{displayLogs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        data={displayLogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={EmptyComponent}
        scrollEnabled={false}
        style={styles.list}
      />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default AILogsList;

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
    padding: 16,                      //......Espaco interno
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo
  title: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Subtitulo
  subtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Lista
  list: {
    flex: 1,                          //......Ocupar espaco
  },

  // Item do log
  logItem: {
    flexDirection: 'row',             //......Layout horizontal
  },

  // Timeline
  timeline: {
    width: 32,                        //......Largura
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Ponto timeline
  timelineDot: {
    width: 28,                        //......Largura
    height: 28,                       //......Altura
    borderRadius: 14,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Linha timeline
  timelineLine: {
    width: 2,                         //......Largura
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.border,   //......Cor da borda
    marginVertical: 4,                //......Margem vertical
  },

  // Conteudo do log
  logContent: {
    flex: 1,                          //......Ocupar espaco
    paddingBottom: 20,                //......Espaco inferior
    paddingLeft: 12,                  //......Espaco esquerda
  },

  // Header do log
  logHeader: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
    marginBottom: 4,                  //......Margem inferior
  },

  // Header esquerda
  logHeaderLeft: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre
  },

  // Label do log
  logLabel: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Badge automatico
  autoBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 6,             //......Espaco horizontal
    paddingVertical: 1,               //......Espaco vertical
    borderRadius: 8,                  //......Arredondamento
  },

  // Texto badge auto
  autoBadgeText: {
    fontSize: 9,                      //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.primary,            //......Cor azul
  },

  // Tempo do log
  logTime: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Descricao do log
  logDescription: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 16,                   //......Altura linha
  },

  // Lead do log
  logLead: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor azul
    marginTop: 4,                     //......Margem superior
  },

  // Data do log
  logDate: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 40,              //......Espaco vertical
  },

  // Texto vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },
});
