// ========================================
// Componente PhaseChart
// Grafico de distribuicao por fase
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN

// ========================================
// Imports de Tipos
// ========================================
import { PhaseChartData } from '../../hooks/useDashboardMetrics';

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
};

// ========================================
// Constantes de Layout
// ========================================
const MAX_BAR_WIDTH = 300;            //......Largura maxima da barra
const BAR_HEIGHT = 32;                //......Altura da barra

// ========================================
// Interface de Props
// ========================================
interface PhaseChartProps {
  data: PhaseChartData[];             //......Dados do grafico
  onPhasePress?: (phaseId: string) => void; //..Callback ao clicar
  title?: string;                     //......Titulo do grafico
}

// ========================================
// Componente PhaseBar Individual
// ========================================
interface PhaseBarProps {
  phase: PhaseChartData;              //......Dados da fase
  maxPercentage: number;              //......Porcentagem maxima
  onPress?: () => void;               //......Callback ao clicar
}

const PhaseBar: React.FC<PhaseBarProps> = ({
  phase,                              //......Dados da fase
  maxPercentage,                      //......Porcentagem maxima
  onPress,                            //......Callback ao clicar
}) => {
  // ========================================
  // Largura da Barra
  // ========================================
  const barWidth = useMemo((): `${number}%` => {
    if (maxPercentage === 0) return '0%'; //..Evitar divisao zero
    const normalized = phase.percentage / maxPercentage;
    return `${normalized * 100}%`;    //......Porcentagem da barra
  }, [phase.percentage, maxPercentage]);

  // ========================================
  // Render
  // ========================================
  return (
    <TouchableOpacity
      style={styles.barContainer}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Label da Fase */}
      <View style={styles.barLabelContainer}>
        <Text style={styles.barLabel} numberOfLines={1}>
          {phase.phaseName}
        </Text>
        <Text style={styles.barValue}>
          {phase.leadsCount} ({phase.percentage.toFixed(1)}%)
        </Text>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: barWidth,
              backgroundColor: phase.color || COLORS.primary,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

// ========================================
// Componente PhaseChart
// ========================================
const PhaseChart: React.FC<PhaseChartProps> = ({
  data,                               //......Dados do grafico
  onPhasePress,                       //......Callback ao clicar
  title = 'Distribuicao por Fase',    //......Titulo padrao
}) => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width } = useWindowDimensions();

  // ========================================
  // Porcentagem Maxima
  // ========================================
  const maxPercentage = useMemo(() => {
    if (data.length === 0) return 100; //....Valor padrao
    return Math.max(...data.map(d => d.percentage));
  }, [data]);

  // ========================================
  // Total de Leads
  // ========================================
  const totalLeads = useMemo(() => {
    return data.reduce((sum, d) => sum + d.leadsCount, 0);
  }, [data]);

  // ========================================
  // Handler de Clique
  // ========================================
  const handlePhasePress = useCallback((phaseId: string) => {
    onPhasePress?.(phaseId);          //......Chamar callback
  }, [onPhasePress]);

  // ========================================
  // Empty State
  // ========================================
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum dado disponivel
          </Text>
        </View>
      </View>
    );
  }

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Total: {totalLeads} leads
        </Text>
      </View>

      {/* Barras */}
      <View style={styles.barsContainer}>
        {data.map(phase => (
          <PhaseBar
            key={phase.phaseId}
            phase={phase}
            maxPercentage={maxPercentage}
            onPress={onPhasePress ? () => handlePhasePress(phase.phaseId) : undefined}
          />
        ))}
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        {data.map(phase => (
          <View key={phase.phaseId} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: phase.color || COLORS.primary },
              ]}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {phase.phaseName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default PhaseChart;

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

  // Container das barras
  barsContainer: {
    gap: 12,                          //......Espaco entre barras
  },

  // Container de cada barra
  barContainer: {
    gap: 4,                           //......Espaco entre label e barra
  },

  // Container do label
  barLabelContainer: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centralizar vertical
  },

  // Label da barra
  barLabel: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
    flex: 1,                          //......Ocupar espaco
  },

  // Valor da barra
  barValue: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginLeft: 8,                    //......Margem esquerda
  },

  // Track da barra
  barTrack: {
    height: BAR_HEIGHT,               //......Altura
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 6,                  //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
  },

  // Preenchimento da barra
  barFill: {
    height: '100%',                   //......Altura total
    borderRadius: 6,                  //......Arredondamento
  },

  // Legenda
  legend: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 12,                          //......Espaco entre
    marginTop: 16,                    //......Margem superior
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Item da legenda
  legendItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre
  },

  // Ponto da legenda
  legendDot: {
    width: 8,                         //......Largura
    height: 8,                        //......Altura
    borderRadius: 4,                  //......Arredondamento
  },

  // Texto da legenda
  legendText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',             //......Centralizar horizontal
    justifyContent: 'center',         //......Centralizar vertical
    paddingVertical: 40,              //......Espaco vertical
  },

  // Texto estado vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },
});
