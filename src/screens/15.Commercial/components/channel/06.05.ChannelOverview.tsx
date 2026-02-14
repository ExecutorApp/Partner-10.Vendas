// ========================================
// Componente ChannelOverview
// Layout principal do canal de entrada
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  ScrollView,                         //......Scroll
  useWindowDimensions,                //......Dimensoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import ChannelFilters from './06.03.ChannelFilters';
import ChannelList from './06.04.ChannelList';
import ChannelModal from './06.02.ChannelModal';

// ========================================
// Imports de Hooks
// ========================================
import { useChannelData } from '../../hooks/useChannelData';

// ========================================
// Imports de Tipos
// ========================================
import { ChannelEntry, Channel } from '../../types/commercial.types';

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
};

// ========================================
// Constantes de Layout
// ========================================
const DESKTOP_BREAKPOINT = 768;       //......Breakpoint desktop

// ========================================
// Icones SVG
// ========================================

// Icone de adicionar
const AddIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Componente ChannelSummaryCard
// ========================================
interface ChannelSummaryCardProps {
  channel: Channel;                   //......Dados do canal
  onPress?: () => void;               //......Callback ao clicar
}

const ChannelSummaryCard: React.FC<ChannelSummaryCardProps> = ({
  channel,                            //......Dados do canal
  onPress,                            //......Callback ao clicar
}) => (
  <TouchableOpacity
    style={styles.summaryCard}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.summaryIndicator, { backgroundColor: channel.color }]} />
    <View style={styles.summaryContent}>
      <Text style={styles.summaryName}>{channel.name}</Text>
      <Text style={styles.summaryCount}>{channel.leadsCount} leads</Text>
    </View>
    <View style={styles.summaryRate}>
      <Text style={styles.summaryRateValue}>
        {channel.conversionRate.toFixed(1)}%
      </Text>
      <Text style={styles.summaryRateLabel}>conversao</Text>
    </View>
  </TouchableOpacity>
);

// ========================================
// Componente ChannelOverview
// ========================================
const ChannelOverview: React.FC = () => {
  // ========================================
  // Dimensoes
  // ========================================
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth > DESKTOP_BREAKPOINT;

  // ========================================
  // Estados
  // ========================================
  const [selectedEntry, setSelectedEntry] = useState<ChannelEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ========================================
  // Dados do Hook
  // ========================================
  const {
    filteredEntries,                  //......Entradas filtradas
    channels,                         //......Canais agrupados
    leadNames,                        //......Mapa de nomes
    filters,                          //......Filtros atuais
    setFilters,                       //......Atualizar filtros
    refresh,                          //......Atualizar dados
    isLoading,                        //......Carregando
  } = useChannelData();

  // ========================================
  // Handlers
  // ========================================

  // Handler de press em entrada
  const handleEntryPress = useCallback((entry: ChannelEntry) => {
    setSelectedEntry(entry);          //......Selecionar entrada
    setShowModal(true);               //......Abrir modal
  }, []);

  // Handler de editar entrada
  const handleEntryEdit = useCallback((entry: ChannelEntry) => {
    setSelectedEntry(entry);          //......Selecionar entrada
    setShowModal(true);               //......Abrir modal
  }, []);

  // Handler de fechar modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);              //......Fechar modal
    setSelectedEntry(null);           //......Limpar selecao
  }, []);

  // Handler de adicionar entrada
  const handleAddEntry = useCallback(() => {
    // TODO: Implementar modal de criacao
    console.log('Adicionar entrada');
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
            <Text style={styles.headerTitle}>Canal de Entrada</Text>
            <Text style={styles.headerSubtitle}>
              Gerencie as origens dos seus leads
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddEntry}
          >
            <AddIcon />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo por Canal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo por Canal</Text>
          <View style={[
            styles.summaryGrid,
            isDesktop && styles.summaryGridDesktop,
          ]}>
            {channels.map(channel => (
              <ChannelSummaryCard
                key={channel.id}
                channel={channel}
              />
            ))}
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.section}>
          <ChannelFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filteredEntries.length}
          />
        </View>

        {/* Lista de Entradas */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Entradas Recentes</Text>
          <ChannelList
            entries={filteredEntries}
            leadNames={leadNames}
            onEntryPress={handleEntryPress}
            onEntryEdit={handleEntryEdit}
            isLoading={isLoading}
            onRefresh={refresh}
          />
        </View>

        {/* Espacador */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Detalhes */}
      <ChannelModal
        visible={showModal}
        entry={selectedEntry}
        leadName={selectedEntry ? leadNames[selectedEntry.leadId] : undefined}
        onClose={handleCloseModal}
        onEdit={handleCloseModal}
      />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChannelOverview;

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
    alignItems: 'flex-start',         //......Alinhar topo
    marginBottom: 20,                 //......Margem inferior
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

  // Botao adicionar
  addButton: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 6,                           //......Espaco entre
    paddingHorizontal: 14,            //......Espaco horizontal
    paddingVertical: 10,              //......Espaco vertical
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderRadius: 8,                  //......Arredondamento
  },

  // Texto botao adicionar
  addButtonText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: '#FFFFFF',                 //......Cor branca
  },

  // Secao
  section: {
    marginBottom: 20,                 //......Margem inferior
  },

  // Secao de lista
  listSection: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor primaria
    marginBottom: 12,                 //......Margem inferior
  },

  // Grid de resumo
  summaryGrid: {
    gap: 12,                          //......Espaco entre
  },

  // Grid desktop
  summaryGridDesktop: {
    flexDirection: 'row',             //......Layout horizontal
    flexWrap: 'wrap',                 //......Quebrar linha
  },

  // Card de resumo
  summaryCard: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    backgroundColor: COLORS.background, //....Fundo branco
    borderRadius: 12,                 //......Arredondamento
    borderWidth: 1,                   //......Largura borda
    borderColor: COLORS.border,       //......Cor borda
    padding: 16,                      //......Espaco interno
    gap: 12,                          //......Espaco entre
  },

  // Indicador de cor
  summaryIndicator: {
    width: 4,                         //......Largura
    height: 40,                       //......Altura
    borderRadius: 2,                  //......Arredondamento
  },

  // Conteudo do resumo
  summaryContent: {
    flex: 1,                          //......Ocupar espaco
    gap: 2,                           //......Espaco entre
  },

  // Nome do canal
  summaryName: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
    color: COLORS.textPrimary,        //......Cor primaria
  },

  // Contagem do resumo
  summaryCount: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Taxa do resumo
  summaryRate: {
    alignItems: 'flex-end',           //......Alinhar direita
    gap: 2,                           //......Espaco entre
  },

  // Valor da taxa
  summaryRateValue: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_700Bold',      //......Fonte Inter Bold
    color: COLORS.success,            //......Cor verde
  },

  // Label da taxa
  summaryRateLabel: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
  },

  // Espacador inferior
  bottomSpacer: {
    height: 100,                      //......Altura
  },
});
