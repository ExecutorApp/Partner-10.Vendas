// ========================================
// Tela Principal do Modulo Commercial
// Sistema de vendas com IA Assistente
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  SafeAreaView,                       //......Area segura
  StatusBar,                          //......Barra de status
  Dimensions,                         //......Dimensoes da tela
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Contextos
// ========================================
import {                              //......Contexto Commercial
  CommercialProvider,                 //......Provider Commercial
  useCommercial,                      //......Hook Commercial
  CommercialTab,                      //......Tipo de tab
} from './contexts/CommercialContext'; //......Arquivo de contexto
import {                              //......Contexto Kanban
  KanbanProvider,                     //......Provider Kanban
} from './contexts/KanbanContext';    //......Arquivo de contexto
import {                              //......Contexto IA
  AIAssistantProvider,                //......Provider IA
  useAIAssistant,                     //......Hook IA
} from './contexts/AIAssistantContext'; //......Arquivo de contexto

// ========================================
// Imports de Componentes
// ========================================
import AssistantChat from './components/ai/AssistantChat'; //..Chat IA
import ChannelTab from './components/tabs/01.01.ChannelTab'; //..Tab Canal
import FunnelTab from './components/tabs/01.02.FunnelTab'; //..Tab Funil
import DashboardTab from './components/tabs/01.03.DashboardTab'; //..Tab Dashboard
import AITab from './components/tabs/01.04.AITab'; //..Tab IA Avancada
import Header from '../5.Side Menu/2.Header'; //..Header padrao
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen'; //..Menu lateral

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#F4F4F4',              //......Fundo cinza claro
  backgroundAlt: '#FCFCFC',           //......Fundo branco
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  textPlaceholder: '#91929E',         //......Placeholder
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
  success: '#22C55E',                 //......Verde sucesso
  warning: '#F59E0B',                 //......Amarelo alerta
  danger: '#EF4444',                  //......Vermelho erro
};

// ========================================
// Constantes de Layout
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_HEIGHT = 48;                //......Altura da tab
const FAB_SIZE = 56;                  //......Tamanho do FAB
const FAB_MARGIN = 16;                //......Margem do FAB

// ========================================
// Icones SVG
// ========================================

// Icone de Canal
const ChannelIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      fill={color}
    />
  </Svg>
);

// Icone de Funil
const FunnelIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 4h18v2H3V4zm2 4h14v2H5V8zm2 4h10v2H7v-2zm2 4h6v2H9v-2zm2 4h2v2h-2v-2z"
      fill={color}
    />
  </Svg>
);

// Icone de Dashboard
const DashboardIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      fill={color}
    />
  </Svg>
);

// Icone de Chat
const ChatIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
      fill={color}
    />
  </Svg>
);

// Icone de IA (Tab)
const AITabIcon = ({ color = COLORS.textSecondary }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"
      fill={color}
    />
  </Svg>
);

// Icone de IA (Robot)
const AIIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props da Tab
// ========================================
interface TabButtonProps {
  id: CommercialTab;                  //......Id da tab
  label: string;                      //......Label da tab
  icon: React.FC<{ color?: string }>; //......Icone da tab
  isActive: boolean;                  //......Se esta ativa
  onPress: () => void;                //......Callback de press
}

// ========================================
// Componente TabButton
// ========================================
const TabButton: React.FC<TabButtonProps> = ({
  id,                                 //......Id da tab
  label,                              //......Label da tab
  icon: Icon,                         //......Icone da tab
  isActive,                           //......Se esta ativa
  onPress,                            //......Callback de press
}) => {
  // Memorizar cor do icone
  const iconColor = useMemo(() => (
    isActive ? COLORS.primary : COLORS.textSecondary
  ), [isActive]);

  // Memorizar cor do texto
  const textColor = useMemo(() => (
    isActive ? COLORS.primary : COLORS.textSecondary
  ), [isActive]);

  // Retornar botao da tab
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon color={iconColor} />
      <Text
        style={[
          styles.tabLabel,
          { color: textColor },
          isActive && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
};

// ========================================
// Componente FAB da IA
// ========================================
const AIFab: React.FC = () => {
  // Obter contexto da IA
  const { toggleFab, isFabExpanded } = useAIAssistant();

  // Retornar FAB
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        isFabExpanded && styles.fabExpanded,
      ]}
      onPress={toggleFab}
      activeOpacity={0.8}
    >
      <AIIcon color={COLORS.white} />
      {isFabExpanded && (
        <Text style={styles.fabText}>IA</Text>
      )}
    </TouchableOpacity>
  );
};

// ========================================
// Componente Placeholder de Tab
// ========================================
const TabPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderSubtitle}>
      Componente em desenvolvimento
    </Text>
  </View>
);

// ========================================
// Componente Principal (Conteudo)
// ========================================
const CommercialScreenContent: React.FC = () => {
  // Obter contexto commercial
  const { activeTab, setActiveTab } = useCommercial();

  // Obter contexto da IA
  const { modalState } = useAIAssistant();

  // Estado do menu lateral
  const [sideMenuVisible, setSideMenuVisible] = useState(false);

  // Abre menu lateral
  const openSideMenu = useCallback(() => {
    setSideMenuVisible(true);         //......Exibe menu lateral
  }, []);

  // Fecha menu lateral
  const closeSideMenu = useCallback(() => {
    setSideMenuVisible(false);        //......Oculta menu lateral
  }, []);

  // Handler para mudar tab
  const handleTabPress = useCallback((tab: CommercialTab) => {
    setActiveTab(tab);                //......Mudar tab ativa
  }, [setActiveTab]);

  // Configuracao das tabs
  const tabs = useMemo(() => [
    { id: 'canal' as CommercialTab, label: 'Canal', icon: ChannelIcon },
    { id: 'funil' as CommercialTab, label: 'Funil', icon: FunnelIcon },
    { id: 'dashboard' as CommercialTab, label: 'Dash', icon: DashboardIcon },
    { id: 'ia' as CommercialTab, label: 'IA', icon: AITabIcon },
    { id: 'chat' as CommercialTab, label: 'Chat', icon: ChatIcon },
  ], []);

  // Renderizar conteudo da tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'canal':
        return <ChannelTab />;
      case 'funil':
        return <FunnelTab />;
      case 'dashboard':
        return <DashboardTab />;
      case 'chat':
        return <AssistantChat />;
      case 'ia':
        return <AITab />;
      default:
        return null;
    }
  }, [activeTab]);

  // Retornar tela
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundAlt}
      />

      {/* Header Padrao do Sistema */}
      <Header
        title="Comercial"
        onMenuPress={openSideMenu}
        notificationCount={0}
      />

      {/* Divisoria do Header */}
      <View style={styles.headerDivider} />

      {/* Header com Tabs */}
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onPress={() => handleTabPress(tab.id)}
            />
          ))}
        </View>
      </View>

      {/* Conteudo da Tab Ativa */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* FAB da IA - Sempre visivel */}
      <AIFab />

      {/* Modal de Sugestoes (40% lateral) */}
      {modalState?.state === 'suggestion' && modalState.suggestion && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <AIIcon color={COLORS.primary} />
              <Text style={styles.modalTitle}>
                Sugestão da IA
              </Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {modalState.suggestion.description}
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonSecondary}>
                <Text style={styles.modalButtonSecondaryText}>
                  Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryText}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Menu Lateral */}
      <SideMenuScreen
        isVisible={sideMenuVisible}
        onClose={closeSideMenu}
      />
    </SafeAreaView>
  );
};

// ========================================
// Componente Principal (Wrapper)
// ========================================
const CommercialScreen: React.FC = () => {
  // Retornar tela com providers
  return (
    <CommercialProvider>
      <KanbanProvider>
        <AIAssistantProvider>
          <CommercialScreenContent />
        </AIAssistantProvider>
      </KanbanProvider>
    </CommercialProvider>
  );
};

// ========================================
// Export Default
// ========================================
export default CommercialScreen;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupa todo espaco
    backgroundColor: COLORS.background, //....Cor de fundo
  },

  // Divisoria do header
  headerDivider: {
    height: 1,                        //......Altura da divisoria
    backgroundColor: COLORS.border,   //......Cor da borda
  },

  // Header com tabs
  header: {
    backgroundColor: COLORS.backgroundAlt, //..Fundo branco
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Container das tabs
  tabsContainer: {
    flexDirection: 'row',             //......Layout horizontal
    height: TAB_HEIGHT,               //......Altura fixa
    alignItems: 'center',             //......Centralizar vertical
  },

  // Botao da tab
  tabButton: {
    flex: 1,                          //......Dividir espaco
    height: '100%',                   //......Altura total
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'center',         //......Centralizar horizontal
    gap: 6,                           //......Espaco entre icone e texto
    position: 'relative',             //......Posicao relativa
  },

  // Label da tab
  tabLabel: {
    fontSize: 12,                     //......Tamanho da fonte
    fontFamily: 'Inter_500Medium',    //......Fonte Inter Medium
  },

  // Label da tab ativa
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
  },

  // Indicador da tab ativa
  tabIndicator: {
    position: 'absolute',             //......Posicao absoluta
    bottom: 0,                        //......No fundo
    left: '25%',                      //......Margem esquerda
    right: '25%',                     //......Margem direita
    height: 2,                        //......Altura do indicador
    backgroundColor: COLORS.primary,  //......Cor azul
    borderRadius: 1,                  //......Arredondamento
  },

  // Conteudo da tab
  content: {
    flex: 1,                          //......Ocupa espaco restante
    backgroundColor: COLORS.background, //....Cor de fundo
  },

  // Container do placeholder
  placeholderContainer: {
    flex: 1,                          //......Ocupa todo espaco
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    padding: 20,                      //......Espaco interno
  },

  // Titulo do placeholder
  placeholderTitle: {
    fontSize: 20,                     //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor do texto
    marginBottom: 8,                  //......Margem inferior
  },

  // Subtitulo do placeholder
  placeholderSubtitle: {
    fontSize: 14,                     //......Tamanho da fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor do texto
  },

  // FAB da IA
  fab: {
    position: 'absolute',             //......Posicao absoluta
    right: FAB_MARGIN,                //......Margem direita
    bottom: FAB_MARGIN,               //......Margem inferior
    width: FAB_SIZE,                  //......Largura
    height: FAB_SIZE,                 //......Altura
    borderRadius: FAB_SIZE / 2,       //......Arredondamento
    backgroundColor: COLORS.primary,  //......Cor azul
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    elevation: 5,                     //......Sombra Android
    shadowColor: '#000',              //......Cor da sombra
    shadowOffset: {                   //......Offset da sombra
      width: 0,                       //......Sem offset horizontal
      height: 2,                      //......Offset vertical
    },
    shadowOpacity: 0.25,              //......Opacidade da sombra
    shadowRadius: 3.84,               //......Raio da sombra
  },

  // FAB expandido
  fabExpanded: {
    width: 'auto',                    //......Largura automatica
    paddingHorizontal: 20,            //......Espaco horizontal
    flexDirection: 'row',             //......Layout horizontal
    gap: 8,                           //......Espaco entre icone e texto
  },

  // Texto do FAB
  fabText: {
    fontSize: 14,                     //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },

  // Overlay do modal
  modalOverlay: {
    position: 'absolute',             //......Posicao absoluta
    top: 0,                           //......No topo
    right: 0,                         //......Na direita
    bottom: 0,                        //......No fundo
    left: 0,                          //......Na esquerda
    flexDirection: 'row',             //......Layout horizontal
  },

  // Backdrop do modal
  modalBackdrop: {
    flex: 0.6,                        //......60% da largura
    backgroundColor: 'rgba(0,0,0,0.3)', //....Fundo escuro
  },

  // Container do modal (40%)
  modalContainer: {
    flex: 0.4,                        //......40% da largura
    backgroundColor: COLORS.backgroundAlt, //..Fundo branco
    borderLeftWidth: 1,               //......Borda esquerda
    borderLeftColor: COLORS.border,   //......Cor da borda
    padding: 16,                      //......Espaco interno
  },

  // Header do modal
  modalHeader: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 8,                           //......Espaco entre itens
    marginBottom: 16,                 //......Margem inferior
  },

  // Titulo do modal
  modalTitle: {
    fontSize: 16,                     //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor do texto
  },

  // Conteudo do modal
  modalContent: {
    flex: 1,                          //......Ocupa espaco restante
  },

  // Texto do modal
  modalText: {
    fontSize: 14,                     //......Tamanho da fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor do texto
    lineHeight: 20,                   //......Altura da linha
  },

  // Acoes do modal
  modalActions: {
    flexDirection: 'row',             //......Layout horizontal
    gap: 12,                          //......Espaco entre botoes
    marginTop: 16,                    //......Margem superior
  },

  // Botao secundario do modal
  modalButtonSecondary: {
    flex: 1,                          //......Dividir espaco
    height: 44,                       //......Altura
    borderRadius: 8,                  //......Arredondamento
    borderWidth: 1,                   //......Largura da borda
    borderColor: COLORS.border,       //......Cor da borda
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto do botao secundario
  modalButtonSecondaryText: {
    fontSize: 14,                     //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor do texto
  },

  // Botao primario do modal
  modalButtonPrimary: {
    flex: 1,                          //......Dividir espaco
    height: 44,                       //......Altura
    borderRadius: 8,                  //......Arredondamento
    backgroundColor: COLORS.primary,  //......Cor azul
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Texto do botao primario
  modalButtonPrimaryText: {
    fontSize: 14,                     //......Tamanho da fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
  },
});
