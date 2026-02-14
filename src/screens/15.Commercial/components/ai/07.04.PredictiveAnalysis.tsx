// ========================================
// Componente PredictiveAnalysis
// Card de analise preditiva do lead
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
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
  PredictiveAnalysis as PredictiveAnalysisType,
  LeadTemperature,                    //......Tipo temperatura
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
  hot: '#EF4444',                     //......Vermelho quente
  warm: '#F59E0B',                    //......Amarelo morno
  cold: '#1777CF',                    //......Azul frio
  frozen: '#7D8592',                  //......Cinza congelado
};

// ========================================
// Icones SVG
// ========================================

// Icone de fogo (quente)
const FireIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2c.55 0 1 .45 1 1v.94c.22.11.42.26.59.43l.95.95c.17.17.32.37.43.59h.94c.55 0 1 .45 1 1s-.45 1-1 1h-.94c-.11.22-.26.42-.43.59l-.95.95c-.17.17-.37.32-.59.43v.94c0 .55-.45 1-1 1s-1-.45-1-1v-.94c-.22-.11-.42-.26-.59-.43l-.95-.95c-.17-.17-.32-.37-.43-.59h-.94c-.55 0-1-.45-1-1s.45-1 1-1h.94c.11-.22.26-.42.43-.59l.95-.95c.17-.17.37-.32.59-.43V3c0-.55.45-1 1-1zm0 8c-3.31 0-6 2.69-6 6 0 2.21 1.79 4 4 4s4-1.79 4-4c0-3.31-2.69-6-6-6z" fill={COLORS.hot} />
  </Svg>
);

// Icone de sol (morno)
const SunIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={4} stroke={COLORS.warm} strokeWidth={2} />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke={COLORS.warm} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de floco (frio)
const SnowflakeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M12 2l4 4M12 2L8 6M12 22l4-4M12 22l-4-4M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" stroke={COLORS.cold} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Icone de gelo (congelado)
const IceIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={COLORS.frozen} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de check
const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={COLORS.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de alerta
const AlertIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke={COLORS.danger} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface PredictiveAnalysisProps {
  analysis: PredictiveAnalysisType;   //......Dados da analise
  showDetails?: boolean;              //......Mostrar detalhes
  compact?: boolean;                  //......Layout compacto
}

// ========================================
// Funcao para obter cor da temperatura
// ========================================
const getTemperatureColor = (temp: LeadTemperature): string => {
  switch (temp) {
    case 'hot': return COLORS.hot;
    case 'warm': return COLORS.warm;
    case 'cold': return COLORS.cold;
    case 'frozen': return COLORS.frozen;
    default: return COLORS.textSecondary;
  }
};

// ========================================
// Funcao para obter label da temperatura
// ========================================
const getTemperatureLabel = (temp: LeadTemperature): string => {
  switch (temp) {
    case 'hot': return 'Quente';
    case 'warm': return 'Morno';
    case 'cold': return 'Frio';
    case 'frozen': return 'Congelado';
    default: return 'Desconhecido';
  }
};

// ========================================
// Funcao para obter icone da temperatura
// ========================================
const getTemperatureIcon = (temp: LeadTemperature) => {
  switch (temp) {
    case 'hot': return FireIcon;
    case 'warm': return SunIcon;
    case 'cold': return SnowflakeIcon;
    case 'frozen': return IceIcon;
    default: return IceIcon;
  }
};

// ========================================
// Funcao para obter cor do risco
// ========================================
const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low': return COLORS.success;
    case 'medium': return COLORS.warning;
    case 'high': return COLORS.danger;
    default: return COLORS.textSecondary;
  }
};

// ========================================
// Funcao para obter label do risco
// ========================================
const getRiskLabel = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low': return 'Baixo';
    case 'medium': return 'Medio';
    case 'high': return 'Alto';
    default: return 'Desconhecido';
  }
};

// ========================================
// Componente ProgressBar
// ========================================
interface ProgressBarProps {
  value: number;                      //......Valor 0-100
  color: string;                      //......Cor da barra
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,                              //......Valor 0-100
  color,                              //......Cor da barra
}) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color },
        ]}
      />
    </View>
    <Text style={[styles.progressValue, { color }]}>{value.toFixed(0)}%</Text>
  </View>
);

// ========================================
// Componente PredictiveAnalysis
// ========================================
const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({
  analysis,                           //......Dados da analise
  showDetails = true,                 //......Mostrar detalhes
  compact = false,                    //......Layout compacto
}) => {
  // ========================================
  // Dados Formatados
  // ========================================
  const tempColor = useMemo(() => getTemperatureColor(analysis.temperature), [analysis.temperature]);
  const tempLabel = useMemo(() => getTemperatureLabel(analysis.temperature), [analysis.temperature]);
  const TempIcon = useMemo(() => getTemperatureIcon(analysis.temperature), [analysis.temperature]);
  const riskColor = useMemo(() => getRiskColor(analysis.riskLevel), [analysis.riskLevel]);
  const riskLabel = useMemo(() => getRiskLabel(analysis.riskLevel), [analysis.riskLevel]);

  const lastAnalyzed = useMemo(() => {
    const date = new Date(analysis.lastAnalyzed);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff}min atras`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atras`;
    return `${Math.floor(diff / 1440)}d atras`;
  }, [analysis.lastAnalyzed]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analise Preditiva</Text>
        <Text style={styles.lastUpdated}>Atualizado {lastAnalyzed}</Text>
      </View>

      {/* Probabilidade e Temperatura */}
      <View style={styles.mainMetrics}>
        {/* Probabilidade de Conversao */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Probabilidade de Conversao</Text>
          <ProgressBar
            value={analysis.conversionProbability}
            color={analysis.conversionProbability >= 60 ? COLORS.success : analysis.conversionProbability >= 30 ? COLORS.warning : COLORS.danger}
          />
        </View>

        {/* Temperatura e Risco */}
        <View style={styles.badges}>
          {/* Temperatura */}
          <View style={[styles.badge, { backgroundColor: tempColor + '15' }]}>
            <TempIcon />
            <Text style={[styles.badgeText, { color: tempColor }]}>{tempLabel}</Text>
          </View>

          {/* Risco */}
          <View style={[styles.badge, { backgroundColor: riskColor + '15' }]}>
            <Text style={[styles.badgeText, { color: riskColor }]}>Risco {riskLabel}</Text>
          </View>
        </View>
      </View>

      {/* Detalhes */}
      {showDetails && !compact && (
        <>
          {/* Fatores Positivos */}
          {analysis.factorsPositive.length > 0 && (
            <View style={styles.factorsSection}>
              <Text style={styles.factorsTitle}>Fatores Positivos</Text>
              {analysis.factorsPositive.map((factor, index) => (
                <View key={`pos-${index}`} style={styles.factorItem}>
                  <CheckIcon />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Fatores Negativos */}
          {analysis.factorsNegative.length > 0 && (
            <View style={styles.factorsSection}>
              <Text style={styles.factorsTitle}>Pontos de Atencao</Text>
              {analysis.factorsNegative.map((factor, index) => (
                <View key={`neg-${index}`} style={styles.factorItem}>
                  <AlertIcon />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <View style={styles.insightsSection}>
              <Text style={styles.insightsTitle}>Insights da IA</Text>
              {analysis.insights.map((insight, index) => (
                <Text key={`insight-${index}`} style={styles.insightText}>
                  • {insight}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default PredictiveAnalysis;

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

  // Container compacto
  containerCompact: {
    padding: 12,                      //......Padding menor
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

  // Ultima atualizacao
  lastUpdated: {
    fontSize: 11,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Metricas principais
  mainMetrics: {
    gap: 16,                          //......Espaco entre
  },

  // Metrica
  metric: {
    gap: 8,                           //......Espaco entre
  },

  // Label metrica
  metricLabel: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Container progress
  progressContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 12,                          //......Espaco entre
  },

  // Track progress
  progressTrack: {
    flex: 1,                          //......Ocupar espaco
    height: 8,                        //......Altura
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 4,                  //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
  },

  // Fill progress
  progressFill: {
    height: '100%',                   //......Altura total
    borderRadius: 4,                  //......Arredondamento
  },

  // Valor progress
  progressValue: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    minWidth: 45,                     //......Largura minima
    textAlign: 'right',               //......Alinhado direita
  },

  // Badges
  badges: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 8,                           //......Espaco entre
  },

  // Badge
  badge: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre
    paddingHorizontal: 10,            //......Espaco horizontal
    paddingVertical: 6,               //......Espaco vertical
    borderRadius: 16,                 //......Arredondamento
  },

  // Texto badge
  badgeText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Secao fatores
  factorsSection: {
    marginTop: 16,                    //......Margem superior
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
    gap: 8,                           //......Espaco entre
  },

  // Titulo fatores
  factorsTitle: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 4,                  //......Margem inferior
  },

  // Item fator
  factorItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'flex-start',         //......Alinhar topo
    gap: 8,                           //......Espaco entre
  },

  // Texto fator
  factorText: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 16,                   //......Altura linha
  },

  // Secao insights
  insightsSection: {
    marginTop: 16,                    //......Margem superior
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
    gap: 4,                           //......Espaco entre
  },

  // Titulo insights
  insightsTitle: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 4,                  //......Margem inferior
  },

  // Texto insight
  insightText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    lineHeight: 18,                   //......Altura linha
  },
});
