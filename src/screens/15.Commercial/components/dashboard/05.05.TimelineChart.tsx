// ========================================
// Componente TimelineChart
// Grafico de linha temporal de leads
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
  useState,                           //......Hook de estado
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  useWindowDimensions,                //......Dimensoes
  ScrollView,                         //......Scroll horizontal
} from 'react-native';                //......Biblioteca RN
import { LineChart } from 'react-native-chart-kit';

// ========================================
// Imports de Tipos
// ========================================
import { TimelineData } from '../../types/commercial.types';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  success: '#22C55E',                 //......Verde sucesso
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
};

// ========================================
// Constantes de Layout
// ========================================
const CHART_HEIGHT = 220;             //......Altura do grafico
const CHART_PADDING = 16;             //......Padding do grafico

// ========================================
// Tipos de Periodo
// ========================================
type PeriodType = 'week' | 'month' | 'quarter';

// ========================================
// Interface de Props
// ========================================
interface TimelineChartProps {
  data: TimelineData[];               //......Dados da timeline
  showLegend?: boolean;               //......Mostrar legenda
  title?: string;                     //......Titulo do grafico
  onPeriodChange?: (period: PeriodType) => void;
}

// ========================================
// Componente PeriodSelector
// ========================================
interface PeriodSelectorProps {
  selected: PeriodType;               //......Periodo selecionado
  onSelect: (period: PeriodType) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selected,                           //......Periodo selecionado
  onSelect,                           //......Callback selecao
}) => {
  // ========================================
  // Opcoes de Periodo
  // ========================================
  const periods: { value: PeriodType; label: string }[] = [
    { value: 'week', label: '7 dias' },
    { value: 'month', label: '30 dias' },
    { value: 'quarter', label: '90 dias' },
  ];

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.periodContainer}>
      {periods.map(period => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            selected === period.value && styles.periodButtonActive,
          ]}
          onPress={() => onSelect(period.value)}
        >
          <Text
            style={[
              styles.periodText,
              selected === period.value && styles.periodTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ========================================
// Componente TimelineChart
// ========================================
const TimelineChart: React.FC<TimelineChartProps> = ({
  data,                               //......Dados da timeline
  showLegend = true,                  //......Mostrar legenda
  title = 'Evolucao Temporal',        //......Titulo padrao
  onPeriodChange,                     //......Callback periodo
}) => {
  // ========================================
  // Estados
  // ========================================
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

  // ========================================
  // Dimensoes
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 64, 600);

  // ========================================
  // Handler de Periodo
  // ========================================
  const handlePeriodChange = useCallback((period: PeriodType) => {
    setSelectedPeriod(period);        //......Atualizar estado
    onPeriodChange?.(period);         //......Chamar callback
  }, [onPeriodChange]);

  // ========================================
  // Dados Formatados
  // ========================================
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return {
        labels: [''],                 //......Labels vazios
        datasets: [
          { data: [0], color: () => COLORS.primary },
          { data: [0], color: () => COLORS.success },
        ],
      };
    }

    // Limitar dados baseado no periodo
    const limit = selectedPeriod === 'week' ? 7
      : selectedPeriod === 'month' ? 30
      : 90;

    const slicedData = data.slice(-limit);

    // Formatar labels de data
    const labels = slicedData.map((item, index) => {
      const date = new Date(item.date);
      // Mostrar apenas alguns labels
      if (slicedData.length > 10) {
        if (index % Math.ceil(slicedData.length / 6) !== 0) {
          return '';                  //......Ocultar labels
        }
      }
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    // Dados das linhas
    const newLeadsData = slicedData.map(item => item.newLeads || 0);
    const convertedData = slicedData.map(item => item.convertedLeads || 0);

    return {
      labels,                         //......Labels formatados
      datasets: [
        {
          data: newLeadsData,         //......Novos leads
          color: (opacity = 1) => `rgba(23, 119, 207, ${opacity})`,
          strokeWidth: 2,             //......Espessura linha
        },
        {
          data: convertedData,        //......Convertidos
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,             //......Espessura linha
        },
      ],
      legend: showLegend ? ['Novos Leads', 'Convertidos'] : [],
    };
  }, [data, selectedPeriod, showLegend]);

  // ========================================
  // Configuracao do Grafico
  // ========================================
  const chartConfig = useMemo(() => ({
    backgroundColor: COLORS.background,
    backgroundGradientFrom: COLORS.background,
    backgroundGradientTo: COLORS.background,
    decimalPlaces: 0,                 //......Sem decimais
    color: (opacity = 1) => `rgba(23, 119, 207, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    style: {
      borderRadius: 12,               //......Arredondamento
    },
    propsForDots: {
      r: '4',                         //......Raio do ponto
      strokeWidth: '2',               //......Borda do ponto
      stroke: COLORS.primary,         //......Cor borda
    },
    propsForBackgroundLines: {
      strokeDasharray: '',            //......Linhas solidas
      stroke: COLORS.border,          //......Cor linhas
      strokeWidth: 1,                 //......Espessura
    },
  }), []);

  // ========================================
  // Totais do Periodo
  // ========================================
  const periodTotals = useMemo(() => {
    const limit = selectedPeriod === 'week' ? 7
      : selectedPeriod === 'month' ? 30
      : 90;

    const slicedData = data.slice(-limit);

    const totalNew = slicedData.reduce((sum, item) => sum + (item.newLeads || 0), 0);
    const totalConverted = slicedData.reduce((sum, item) => sum + (item.convertedLeads || 0), 0);

    return { totalNew, totalConverted };
  }, [data, selectedPeriod]);

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
        <PeriodSelector
          selected={selectedPeriod}
          onSelect={handlePeriodChange}
        />
      </View>

      {/* Totais */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalItem}>
          <View style={[styles.totalDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.totalLabel}>Novos:</Text>
          <Text style={styles.totalValue}>{periodTotals.totalNew}</Text>
        </View>
        <View style={styles.totalItem}>
          <View style={[styles.totalDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.totalLabel}>Convertidos:</Text>
          <Text style={styles.totalValue}>{periodTotals.totalConverted}</Text>
        </View>
      </View>

      {/* Grafico */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartScroll}
      >
        <LineChart
          data={chartData}
          width={chartWidth}
          height={CHART_HEIGHT}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
        />
      </ScrollView>

      {/* Legenda */}
      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Novos Leads</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Convertidos</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default TimelineChart;

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
    flexWrap: 'wrap',                 //......Quebrar linha
    gap: 12,                          //......Espaco entre
  },

  // Titulo
  title: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Container de periodo
  periodContainer: {
    flexDirection: 'row',             //......Layout horizontal
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderRadius: 8,                  //......Arredondamento
    padding: 4,                       //......Espaco interno
  },

  // Botao de periodo
  periodButton: {
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 6,               //......Espaco vertical
    borderRadius: 6,                  //......Arredondamento
  },

  // Botao periodo ativo
  periodButtonActive: {
    backgroundColor: COLORS.background, //....Fundo branco
  },

  // Texto periodo
  periodText: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Texto periodo ativo
  periodTextActive: {
    color: COLORS.primary,            //......Cor primaria
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Container de totais
  totalsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 24,                          //......Espaco entre
    marginBottom: 16,                 //......Margem inferior
  },

  // Item total
  totalItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre
  },

  // Ponto do total
  totalDot: {
    width: 8,                         //......Largura
    height: 8,                        //......Altura
    borderRadius: 4,                  //......Arredondamento
  },

  // Label do total
  totalLabel: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Valor do total
  totalValue: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Scroll do grafico
  chartScroll: {
    marginHorizontal: -16,            //......Compensar padding
  },

  // Grafico
  chart: {
    marginVertical: 8,                //......Margem vertical
    borderRadius: 12,                 //......Arredondamento
  },

  // Legenda
  legend: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'center',         //......Centralizar horizontal
    gap: 24,                          //......Espaco entre
    marginTop: 16,                    //......Margem superior
    paddingTop: 16,                   //......Espaco superior
    borderTopWidth: 1,                //......Borda superior
    borderTopColor: COLORS.border,    //......Cor da borda
  },

  // Item da legenda
  legendItem: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre
  },

  // Linha da legenda
  legendLine: {
    width: 20,                        //......Largura
    height: 3,                        //......Altura
    borderRadius: 2,                  //......Arredondamento
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
