// ========================================
// Tab: IA Avancada
// Interface completa de automacao e sugestoes
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useState,                               //......Hook de estado
  useCallback,                            //......Hook de callback
  useMemo,                                //......Hook de memorizacao
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  ScrollView,                             //......Scroll
  TouchableOpacity,                       //......Botao tocavel
  StyleSheet,                             //......Estilos
  Dimensions,                             //......Dimensoes da tela
  RefreshControl,                         //......Refresh control
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......Componentes SVG
  Path,                                   //......Path do SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import AISettingsModal from '../ai/07.01.AISettingsModal'; //..Modal config
import SuggestionCard from '../ai/07.02.SuggestionCard'; //..Card sugestao
import AILogsList from '../ai/07.03.AILogsList'; //..Lista de logs
import PredictiveAnalysis from '../ai/07.04.PredictiveAnalysis'; //..Analise

// ========================================
// Imports de Hooks
// ========================================
import useAIAutomation from '../../hooks/useAIAutomation'; //..Hook automacao

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                     //......Azul principal
  background: '#F4F4F4',                  //......Fundo cinza claro
  backgroundAlt: '#FCFCFC',               //......Fundo branco
  textPrimary: '#3A3F51',                 //......Texto principal
  textSecondary: '#7D8592',               //......Texto secundario
  border: '#D8E0F0',                      //......Borda
  white: '#FFFFFF',                       //......Branco
  success: '#22C55E',                     //......Verde sucesso
  warning: '#F59E0B',                     //......Amarelo alerta
  danger: '#EF4444',                      //......Vermelho erro
};

// ========================================
// Constantes de Layout
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH > 768;    //......Se eh desktop

// ========================================
// Tipos de Visualizacao
// ========================================
type ViewMode = 'suggestions' | 'logs' | 'analysis';

// ========================================
// Icones SVG
// ========================================

// Icone de Configuracoes
const SettingsIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.486.486 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      fill={color}
    />
  </Svg>
);

// Icone de Sugestao
const SuggestionIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"
      fill={color}
    />
  </Svg>
);

// Icone de Log
const LogIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
      fill={color}
    />
  </Svg>
);

// Icone de Analise
const AnalysisIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Componente Principal: AITab
// ========================================
const AITab: React.FC = () => {
  // ========================================
  // Estados Locais
  // ========================================

  // Estado do modo de visualizacao
  const [viewMode, setViewMode] = useState<ViewMode>('suggestions');

  // Estado do modal de configuracoes
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  // Estado de refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ========================================
  // Hook de Automacao
  // ========================================
  const {
    settings,                             //......Configuracoes
    updateSettings,                       //......Atualizar config
    suggestions,                          //......Lista de sugestoes
    acceptSuggestion,                     //......Aceitar sugestao
    rejectSuggestion,                     //......Rejeitar sugestao
    logs,                                 //......Lista de logs
    analyses,                             //......Lista de analises
    pendingSuggestions,                   //......Sugestoes pendentes
    isProcessing,                         //......Se processando
  } = useAIAutomation();

  // ========================================
  // Handlers
  // ========================================

  // Handler para abrir configuracoes
  const handleOpenSettings = useCallback(() => {
    setSettingsVisible(true);             //......Abrir modal
  }, []);

  // Handler para fechar configuracoes
  const handleCloseSettings = useCallback(() => {
    setSettingsVisible(false);            //......Fechar modal
  }, []);

  // Handler para salvar configuracoes
  const handleSaveSettings = useCallback((newSettings: typeof settings) => {
    updateSettings(newSettings);          //......Atualizar config
    setSettingsVisible(false);            //......Fechar modal
  }, [updateSettings]);

  // Handler de refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);                  //......Inicia refresh
    setTimeout(() => {                    //......Simula delay
      setRefreshing(false);               //......Finaliza refresh
    }, 1500);
  }, []);


  // ========================================
  // Valores Computados
  // ========================================

  // Filtra sugestoes pendentes
  const pendingSuggestionsList = useMemo(() => {
    return suggestions.filter(            //......Filtra sugestoes
      (s) => !s.confirmed && !s.rejected  //......Nao confirmadas
    );
  }, [suggestions]);

  // ========================================
  // Renderizacao de Conteudo
  // ========================================

  // Renderiza conteudo baseado no modo
  const renderContent = useCallback(() => {
    switch (viewMode) {
      case 'suggestions':
        return (
          <View style={styles.contentSection}>
            {/* Titulo da Secao */}
            <Text style={styles.sectionTitle}>
              Sugestoes Pendentes ({pendingSuggestions})
            </Text>
            {/* Lista de Sugestoes */}
            {pendingSuggestionsList.length > 0 ? (
              pendingSuggestionsList.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={() => acceptSuggestion(suggestion.id)}
                  onReject={() => rejectSuggestion(suggestion.id)}
                  onEdit={() => console.log('Editar:', suggestion.id)}
                  showActions={true}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <SuggestionIcon color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>
                  Nenhuma sugestao pendente
                </Text>
              </View>
            )}
          </View>
        );

      case 'logs':
        return (
          <View style={styles.contentSection}>
            {/* Titulo da Secao */}
            <Text style={styles.sectionTitle}>
              Historico de Acoes ({logs.length})
            </Text>
            {/* Lista de Logs */}
            <AILogsList
              logs={logs}
              title="Acoes Recentes"
            />
          </View>
        );

      case 'analysis':
        return (
          <View style={styles.contentSection}>
            {/* Titulo da Secao */}
            <Text style={styles.sectionTitle}>
              Analises Preditivas ({analyses.length})
            </Text>
            {/* Lista de Analises */}
            {analyses.length > 0 ? (
              analyses.map((analysis) => (
                <PredictiveAnalysis
                  key={analysis.leadId}
                  analysis={analysis}
                  showDetails={true}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <AnalysisIcon color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>
                  Nenhuma analise disponivel
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  }, [
    viewMode,
    pendingSuggestions,
    pendingSuggestionsList,
    logs,
    analyses,
    acceptSuggestion,
    rejectSuggestion,
  ]);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Header com Titulo e Botao Config */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>IA Avancada</Text>
          {pendingSuggestions > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingSuggestions}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          activeOpacity={0.7}
        >
          <SettingsIcon color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs de Navegacao */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            viewMode === 'suggestions' && styles.tabItemActive,
          ]}
          onPress={() => setViewMode('suggestions')}
          activeOpacity={0.7}
        >
          <SuggestionIcon
            color={viewMode === 'suggestions' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabItemText,
              viewMode === 'suggestions' && styles.tabItemTextActive,
            ]}
          >
            Sugestoes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            viewMode === 'logs' && styles.tabItemActive,
          ]}
          onPress={() => setViewMode('logs')}
          activeOpacity={0.7}
        >
          <LogIcon
            color={viewMode === 'logs' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabItemText,
              viewMode === 'logs' && styles.tabItemTextActive,
            ]}
          >
            Logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            viewMode === 'analysis' && styles.tabItemActive,
          ]}
          onPress={() => setViewMode('analysis')}
          activeOpacity={0.7}
        >
          <AnalysisIcon
            color={viewMode === 'analysis' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabItemText,
              viewMode === 'analysis' && styles.tabItemTextActive,
            ]}
          >
            Analise
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteudo Principal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isProcessing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* Modal de Configuracoes */}
      <AISettingsModal
        visible={settingsVisible}
        onClose={handleCloseSettings}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default AITab;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                              //......Ocupa todo espaco
    backgroundColor: COLORS.background,   //......Cor de fundo
  },

  // Header
  header: {
    flexDirection: 'row',                 //......Layout horizontal
    justifyContent: 'space-between',      //......Espaco entre
    alignItems: 'center',                 //......Centralizar vertical
    paddingHorizontal: 16,                //......Espaco horizontal
    paddingVertical: 12,                  //......Espaco vertical
    backgroundColor: COLORS.backgroundAlt, //......Fundo branco
    borderBottomWidth: 1,                 //......Borda inferior
    borderBottomColor: COLORS.border,     //......Cor da borda
  },

  // Linha do titulo
  headerTitleRow: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centralizar vertical
    gap: 8,                               //......Espaco entre
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18,                         //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',      //......Fonte Inter SemiBold
    color: COLORS.textPrimary,            //......Cor do texto
  },

  // Badge
  badge: {
    backgroundColor: COLORS.danger,       //......Fundo vermelho
    borderRadius: 10,                     //......Arredondamento
    paddingHorizontal: 8,                 //......Espaco horizontal
    paddingVertical: 2,                   //......Espaco vertical
    minWidth: 20,                         //......Largura minima
    alignItems: 'center',                 //......Centralizar
  },

  // Texto do badge
  badgeText: {
    fontSize: 11,                         //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',      //......Fonte Inter SemiBold
    color: COLORS.white,                  //......Cor branca
  },

  // Botao de configuracoes
  settingsButton: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    borderRadius: 20,                     //......Arredondamento
    backgroundColor: COLORS.background,   //......Fundo cinza
    justifyContent: 'center',             //......Centralizar vertical
    alignItems: 'center',                 //......Centralizar horizontal
  },

  // Linha de tabs
  tabsRow: {
    flexDirection: 'row',                 //......Layout horizontal
    backgroundColor: COLORS.backgroundAlt, //......Fundo branco
    paddingHorizontal: 16,                //......Espaco horizontal
    paddingBottom: 12,                    //......Espaco inferior
    gap: 8,                               //......Espaco entre tabs
  },

  // Item de tab
  tabItem: {
    flex: 1,                              //......Dividir espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centralizar vertical
    justifyContent: 'center',             //......Centralizar horizontal
    gap: 6,                               //......Espaco entre icone e texto
    paddingVertical: 10,                  //......Espaco vertical
    borderRadius: 8,                      //......Arredondamento
    backgroundColor: COLORS.background,   //......Fundo cinza
  },

  // Item de tab ativo
  tabItemActive: {
    backgroundColor: '#E8F2FC',           //......Fundo azul claro
  },

  // Texto do item de tab
  tabItemText: {
    fontSize: 12,                         //......Tamanho da fonte
    fontFamily: 'Inter_500Medium',        //......Fonte Inter Medium
    color: COLORS.textSecondary,          //......Cor do texto
  },

  // Texto do item de tab ativo
  tabItemTextActive: {
    color: COLORS.primary,                //......Cor azul
    fontFamily: 'Inter_600SemiBold',      //......Fonte Inter SemiBold
  },

  // ScrollView
  scrollView: {
    flex: 1,                              //......Ocupa espaco restante
  },

  // Conteudo do scroll
  scrollContent: {
    paddingHorizontal: 16,                //......Espaco horizontal
    paddingVertical: 12,                  //......Espaco vertical
    paddingBottom: 100,                   //......Espaco para FAB
  },

  // Secao de conteudo
  contentSection: {
    gap: 12,                              //......Espaco entre itens
  },

  // Titulo da secao
  sectionTitle: {
    fontSize: 14,                         //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',      //......Fonte Inter SemiBold
    color: COLORS.textPrimary,            //......Cor do texto
    marginBottom: 4,                      //......Margem inferior
  },

  // Estado vazio
  emptyState: {
    alignItems: 'center',                 //......Centralizar horizontal
    justifyContent: 'center',             //......Centralizar vertical
    paddingVertical: 40,                  //......Espaco vertical
    gap: 12,                              //......Espaco entre icone e texto
  },

  // Texto do estado vazio
  emptyText: {
    fontSize: 14,                         //......Tamanho da fonte
    fontFamily: 'Inter_400Regular',       //......Fonte Inter Regular
    color: COLORS.textSecondary,          //......Cor do texto
  },
});
