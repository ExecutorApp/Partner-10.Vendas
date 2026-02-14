// ========================================
// Componente DashboardOverview
// Layout principal do dashboard
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useCallback,                        //......Hook de callback
  useState,                           //......Hook de estado
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ScrollView,                         //......Scroll
  useWindowDimensions,                //......Dimensoes
  Alert,                              //......Alertas
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import MetricsCards from './05.02.MetricsCards';
import PhaseChart from './05.03.PhaseChart';
import ConversionFunnel from './05.04.ConversionFunnel';
import TimelineChart from './05.05.TimelineChart';
import ReportsModal from './05.06.ReportsModal';
import ConversationHistory from './05.07.ConversationHistory';

// ========================================
// Imports de Hooks
// ========================================
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

// ========================================
// Imports de Contextos
// ========================================
import { useAIAssistant } from '../../contexts/AIAssistantContext';

// ========================================
// Imports de Tipos
// ========================================
import { DashboardFilters } from '../../types/commercial.types';

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
const DESKTOP_BREAKPOINT = 768;       //......Breakpoint desktop

// ========================================
// Icones SVG
// ========================================

// Icone de filtro
const FilterIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6h16M6 12h12M8 18h8"      //......Linhas horizontais
      stroke={COLORS.primary}         //......Cor azul
      strokeWidth={2}                 //......Espessura
      strokeLinecap="round"           //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Componente SectionHeader
// ========================================
interface SectionHeaderProps {
  title: string;                      //......Titulo da secao
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,                              //......Titulo da secao
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ========================================
// Componente DashboardOverview
// ========================================
const DashboardOverview: React.FC = () => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth > DESKTOP_BREAKPOINT;

  // ========================================
  // Estados
  // ========================================
  const [showReportsModal, setShowReportsModal] = useState(false);

  // ========================================
  // Hooks
  // ========================================
  const {
    metricsCards,                     //......Cards de metricas
    phaseDistribution,                //......Distribuicao por fase
    funnelData,                       //......Dados do funil
    timelineData,                     //......Dados da timeline
    filters,                          //......Filtros atuais
    applyFilters,                     //......Aplicar filtros
    isLoading,                        //......Estado de loading
  } = useDashboardMetrics();

  const { messages } = useAIAssistant(); //..Mensagens da IA

  // ========================================
  // Handlers
  // ========================================

  // Abrir modal de relatorios
  const handleOpenReports = useCallback(() => {
    setShowReportsModal(true);        //......Abrir modal
  }, []);

  // Fechar modal de relatorios
  const handleCloseReports = useCallback(() => {
    setShowReportsModal(false);       //......Fechar modal
  }, []);

  // Aplicar filtros
  const handleApplyFilters = useCallback((newFilters: DashboardFilters) => {
    applyFilters(newFilters);         //......Aplicar filtros
  }, [applyFilters]);

  // Exportar relatorio
  const handleExport = useCallback((format: 'pdf' | 'excel') => {
    Alert.alert(
      'Exportacao',                   //......Titulo
      `Relatorio ${format.toUpperCase()} sera gerado em breve.`,
      [{ text: 'OK' }]                //......Botao OK
    );
  }, []);

  // Click em card de metrica
  const handleMetricPress = useCallback((metricId: string) => {
    console.log('Metric pressed:', metricId);
  }, []);

  // Click em fase
  const handlePhasePress = useCallback((phaseId: string) => {
    console.log('Phase pressed:', phaseId);
  }, []);

  // Click em conversa
  const handleConversationPress = useCallback((id: string) => {
    console.log('Conversation pressed:', id);
  }, []);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Visao geral do funil comercial
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleOpenReports}
          >
            <FilterIcon />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>

        {/* Metricas */}
        <MetricsCards
          metrics={metricsCards}
          onCardPress={handleMetricPress}
        />

        {/* Grid de Graficos */}
        <View style={[
          styles.chartsGrid,
          isDesktop && styles.chartsGridDesktop,
        ]}>
          {/* Distribuicao por Fase */}
          <View style={[
            styles.chartContainer,
            isDesktop && styles.chartContainerHalf,
          ]}>
            <PhaseChart
              data={phaseDistribution}
              onPhasePress={handlePhasePress}
              title="Distribuicao por Fase"
            />
          </View>

          {/* Funil de Conversao */}
          <View style={[
            styles.chartContainer,
            isDesktop && styles.chartContainerHalf,
          ]}>
            <ConversionFunnel
              data={funnelData}
              showPercentages={true}
              title="Funil de Conversao"
            />
          </View>
        </View>

        {/* Timeline */}
        <SectionHeader title="Evolucao Temporal" />
        <View style={styles.chartContainer}>
          <TimelineChart
            data={timelineData}
            showLegend={true}
            title="Leads ao Longo do Tempo"
          />
        </View>

        {/* Historico de Conversas */}
        <SectionHeader title="Interacoes com IA" />
        <View style={styles.chartContainer}>
          <ConversationHistory
            messages={messages}
            onConversationPress={handleConversationPress}
            maxItems={5}
            showSearch={true}
            title="Ultimas Conversas"
          />
        </View>

        {/* Espacamento final */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Relatorios */}
      <ReportsModal
        visible={showReportsModal}
        onClose={handleCloseReports}
        onApply={handleApplyFilters}
        onExport={handleExport}
        currentFilters={filters}
      />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default DashboardOverview;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar espaco
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
  },

  // ScrollView
  scrollView: {
    flex: 1,                          //......Ocupar espaco
  },

  // Conteudo do scroll
  scrollContent: {
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingTop: 16,                   //......Espaco superior
  },

  // Header
  header: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'flex-start',         //......Alinhar no topo
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo do header
  headerTitle: {
    fontSize: 24,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Subtitulo do header
  headerSubtitle: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 4,                     //......Margem superior
  },

  // Botao de filtro
  filterButton: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre
    paddingHorizontal: 12,            //......Espaco horizontal
    paddingVertical: 8,               //......Espaco vertical
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
  },

  // Texto do botao de filtro
  filterButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.primary,            //......Cor primaria
  },

  // Grid de graficos
  chartsGrid: {
    gap: 16,                          //......Espaco entre
    marginTop: 16,                    //......Margem superior
  },

  // Grid desktop
  chartsGridDesktop: {
    flexDirection: 'row',             //......Layout horizontal
  },

  // Container de grafico
  chartContainer: {
    marginBottom: 16,                 //......Margem inferior
  },

  // Container grafico metade
  chartContainerHalf: {
    flex: 1,                          //......Ocupar espaco
  },

  // Header da secao
  sectionHeader: {
    marginTop: 8,                     //......Margem superior
    marginBottom: 12,                 //......Margem inferior
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Espacador inferior
  bottomSpacer: {
    height: 100,                      //......Altura
  },
});
