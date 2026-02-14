// ========================================
// Componente MetricsCards
// Cards de metricas do dashboard
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
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Tipos
// ========================================
import { DashboardMetric, MetricTrend } from '../../types/commercial.types';

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
  danger: '#EF4444',                  //......Vermelho
  warning: '#F59E0B',                 //......Amarelo
};

// ========================================
// Constantes de Layout
// ========================================
const DESKTOP_BREAKPOINT = 768;       //......Breakpoint desktop

// ========================================
// Icones SVG
// ========================================

// Icone Seta para cima
const TrendUpIcon = ({ color = COLORS.success }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 14l5-5 5 5H7z"
      fill={color}
    />
  </Svg>
);

// Icone Seta para baixo
const TrendDownIcon = ({ color = COLORS.danger }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 10l5 5 5-5H7z"
      fill={color}
    />
  </Svg>
);

// Icone Seta estavel
const TrendStableIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12h16"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface MetricsCardsProps {
  metrics: DashboardMetric[];         //......Array de metricas
  onCardPress?: (metricId: string) => void; //..Callback ao clicar
}

// ========================================
// Componente MetricCard Individual
// ========================================
interface MetricCardProps {
  metric: DashboardMetric;            //......Dados da metrica
  onPress?: () => void;               //......Callback ao clicar
  isCompact?: boolean;                //......Layout compacto
}

const MetricCard: React.FC<MetricCardProps> = ({
  metric,                             //......Dados da metrica
  onPress,                            //......Callback ao clicar
  isCompact = false,                  //......Layout compacto
}) => {
  // ========================================
  // Formatacao do Valor
  // ========================================
  const formattedValue = useMemo(() => {
    switch (metric.format) {
      case 'currency':                //......Formato moeda
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(metric.value);
      case 'percentage':              //......Formato porcentagem
        return `${metric.value.toFixed(1)}%`;
      default:                        //......Formato numero
        return metric.value.toLocaleString('pt-BR');
    }
  }, [metric.value, metric.format]);

  // ========================================
  // Cor da Tendencia
  // ========================================
  const trendColor = useMemo(() => {
    switch (metric.trend) {
      case 'up':                      //......Subindo
        return metric.title === 'Tempo Medio' ? COLORS.danger : COLORS.success;
      case 'down':                    //......Descendo
        return metric.title === 'Tempo Medio' ? COLORS.success : COLORS.danger;
      default:                        //......Estavel
        return COLORS.textSecondary;
    }
  }, [metric.trend, metric.title]);

  // ========================================
  // Icone da Tendencia
  // ========================================
  const TrendIcon = useMemo(() => {
    switch (metric.trend) {
      case 'up':                      //......Subindo
        return () => <TrendUpIcon color={trendColor} />;
      case 'down':                    //......Descendo
        return () => <TrendDownIcon color={trendColor} />;
      default:                        //......Estavel
        return () => <TrendStableIcon color={trendColor} />;
    }
  }, [metric.trend, trendColor]);

  // ========================================
  // Render
  // ========================================
  return (
    <TouchableOpacity
      style={[styles.card, isCompact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Titulo */}
      <Text style={styles.cardTitle}>{metric.title}</Text>

      {/* Valor */}
      <Text style={[styles.cardValue, isCompact && styles.cardValueCompact]}>
        {formattedValue}
      </Text>

      {/* Rodape com Tendencia */}
      <View style={styles.cardFooter}>
        <TrendIcon />
        {metric.percentChange !== undefined && (
          <Text style={[styles.changeText, { color: trendColor }]}>
            {metric.percentChange >= 0 ? '+' : ''}
            {metric.percentChange.toFixed(1)}%
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ========================================
// Componente MetricsCards
// ========================================
const MetricsCards: React.FC<MetricsCardsProps> = ({
  metrics,                            //......Array de metricas
  onCardPress,                        //......Callback ao clicar
}) => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width } = useWindowDimensions();
  const isDesktop = width > DESKTOP_BREAKPOINT;

  // ========================================
  // Handler de Clique
  // ========================================
  const handleCardPress = useCallback((metricId: string) => {
    onCardPress?.(metricId);          //......Chamar callback
  }, [onCardPress]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {metrics.map(metric => (
        <MetricCard
          key={metric.id}
          metric={metric}
          onPress={onCardPress ? () => handleCardPress(metric.id) : undefined}
          isCompact={!isDesktop}
        />
      ))}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default MetricsCards;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 12,                          //......Espaco entre cards
    padding: 16,                      //......Espaco interno
  },

  // Container desktop
  containerDesktop: {
    flexWrap: 'nowrap',               //......Nao quebrar linha
  },

  // Card individual
  card: {
    flex: 1,                          //......Ocupar espaco
    minWidth: '45%',                  //......Largura minima mobile
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 12,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    padding: 16,                      //......Espaco interno
  },

  // Card compacto
  cardCompact: {
    padding: 12,                      //......Espaco menor
  },

  // Titulo do card
  cardTitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginBottom: 8,                  //......Margem inferior
  },

  // Valor do card
  cardValue: {
    fontSize: 28,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 8,                  //......Margem inferior
  },

  // Valor compacto
  cardValueCompact: {
    fontSize: 22,                     //......Tamanho menor
  },

  // Rodape do card
  cardFooter: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 4,                           //......Espaco entre
  },

  // Texto de variacao
  changeText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
  },
});
