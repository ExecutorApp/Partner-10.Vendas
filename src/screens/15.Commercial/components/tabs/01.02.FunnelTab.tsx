// ========================================
// Componente FunnelTab
// Tab do funil de vendas com Kanban
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
  StyleSheet,                         //......Estilos
  useWindowDimensions,                //......Dimensoes da janela
  TouchableOpacity,                   //......Botao tocavel
  Modal,                              //......Modal
} from 'react-native';                //......Biblioteca RN
import Svg, { Path } from 'react-native-svg'; //..SVG para icones
import { useNavigation } from '@react-navigation/native';
import { ScreenNames } from '../../../../types/navigation';

// ========================================
// Imports de Hooks
// ========================================
import { useKanbanData } from '../../hooks/useKanbanData'; //..Hook dados

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanCard as KanbanCardType,       //......Interface de card
} from '../../types/commercial.types'; //......Arquivo de tipos

// ========================================
// Imports de Componentes
// ========================================
import KanbanBoard from '../kanban/02.01.KanbanBoard';
import KanbanMobileView from '../kanban/02.02.KanbanMobileView';
import CardDetailsModal from '../kanban/02.09.CardDetailsModal';
import CreatePhaseModal from '../kanban/02.07.CreatePhaseModal';
import CreateColumnModal from '../kanban/02.08.CreateColumnModal';
import WhatsAppSetup from '../Settings/10.01.WhatsAppSetup';

// ========================================
// Imports de Contexto
// ========================================
import { useKanban } from '../../contexts/KanbanContext'; //..Kanban context

// ========================================
// Constantes de Layout
// ========================================
const MOBILE_BREAKPOINT = 768;        //......Limite mobile

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  background: '#F4F4F4',              //......Fundo cinza
  white: '#FFFFFF',                   //......Branco
  textPrimary: '#3A3F51',             //......Texto escuro
  border: '#D8E0F0',                  //......Borda clara
  backdrop: 'rgba(0,0,0,0.5)',        //......Fundo modal
};

// ========================================
// Icone de Fechar
// ========================================
const CloseIcon = ({ size = 24, color = COLORS.textPrimary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Componente FunnelTab
// ========================================
const FunnelTab: React.FC = () => {
  // ========================================
  // Navegacao
  // ========================================
  const navigation = useNavigation<any>();

  // ========================================
  // Dimensoes
  // ========================================
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  // ========================================
  // Dados do Kanban
  // ========================================
  const {                             //......Dados do hook
    phases,                           //......Lista de fases
    columns,                          //......Lista de colunas
    cards,                            //......Lista de cards
    moveCard,                         //......Mover card
    toggleCardAI,                     //......Toggle IA do card
  } = useKanbanData();

  // ========================================
  // Contexto para criar fases/colunas
  // ========================================
  const {                             //......Funcoes do contexto
    addPhase,                         //......Adicionar fase
    addColumn,                        //......Adicionar coluna
    addCard,                          //......Adicionar card
    isWhatsAppConnected,              //......Status WhatsApp
    loadWhatsAppContacts,             //......Carregar contatos
  } = useKanban();

  // ========================================
  // Estados dos Modais
  // ========================================
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCreatePhase, setShowCreatePhase] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [createColumnPhaseId, setCreateColumnPhaseId] = useState<string>('');
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);

  // ========================================
  // Handlers de Card
  // ========================================

  // Handler de press no container esquerdo - Abre modal de detalhes
  const handleCardPress = useCallback((card: KanbanCardType) => {
    setSelectedCard(card);            //......Definir card
    setShowCardDetails(true);         //......Abrir modal
  }, []);

  // Handler de press no container direito - Navega para o chat
  const handleCardChatPress = useCallback((card: KanbanCardType) => {
    // Metricas de performance: marca inicio da navegacao
    (window as any).__PERF_KANBAN_START = Date.now();
    console.time('[PERF] Kanban→Chat');

    navigation.navigate(ScreenNames.LeadChatScreen, {
      leadId: card.id,                //......ID do lead
      leadName: card.leadName,        //......Nome do lead
      leadPhone: card.leadPhone || '', //....Telefone do lead
      leadPhoto: card.leadPhoto,      //......Foto do lead
    });
  }, [navigation]);

  // Handler de long press no card
  const handleCardLongPress = useCallback((card: KanbanCardType) => {
    setSelectedCard(card);            //......Definir card
    setShowCardDetails(true);         //......Abrir modal
  }, []);

  // Handler de fechar detalhes
  const handleCloseCardDetails = useCallback(() => {
    setShowCardDetails(false);        //......Fechar modal
    setSelectedCard(null);            //......Limpar card
  }, []);

  // Handler de toggle IA
  const handleToggleAI = useCallback((cardId: string, enabled: boolean) => {
    toggleCardAI(cardId, enabled);    //......Toggle IA
  }, [toggleCardAI]);

  // Handler de mover para proxima fase
  const handleMoveNext = useCallback((cardId: string) => {
    // Encontrar card e coluna atual
    const card = cards.find(c => c.id === cardId);
    if (!card) return;                //......Card nao encontrado

    const currentColumn = columns.find(c => c.id === card.columnId);
    if (!currentColumn) return;       //......Coluna nao encontrada

    // Encontrar proxima coluna na mesma fase
    const phaseColumns = columns
      .filter(c => c.phaseId === currentColumn.phaseId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = phaseColumns.findIndex(c => c.id === currentColumn.id);
    const nextColumn = phaseColumns[currentIndex + 1];

    if (nextColumn) {
      moveCard(cardId, nextColumn.id); //....Mover para proxima
    } else {
      // Buscar primeira coluna da proxima fase
      const currentPhase = phases.find(p => p.id === currentColumn.phaseId);
      if (!currentPhase) return;      //......Fase nao encontrada

      const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
      const phaseIndex = sortedPhases.findIndex(p => p.id === currentPhase.id);
      const nextPhase = sortedPhases[phaseIndex + 1];

      if (nextPhase) {
        const nextPhaseColumns = columns
          .filter(c => c.phaseId === nextPhase.id)
          .sort((a, b) => a.order - b.order);

        if (nextPhaseColumns.length > 0) {
          moveCard(cardId, nextPhaseColumns[0].id);
        }
      }
    }
  }, [cards, columns, phases, moveCard]);

  // Handler de mover para fase anterior
  const handleMovePrevious = useCallback((cardId: string) => {
    // Encontrar card e coluna atual
    const card = cards.find(c => c.id === cardId);
    if (!card) return;                //......Card nao encontrado

    const currentColumn = columns.find(c => c.id === card.columnId);
    if (!currentColumn) return;       //......Coluna nao encontrada

    // Encontrar coluna anterior na mesma fase
    const phaseColumns = columns
      .filter(c => c.phaseId === currentColumn.phaseId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = phaseColumns.findIndex(c => c.id === currentColumn.id);
    const prevColumn = phaseColumns[currentIndex - 1];

    if (prevColumn) {
      moveCard(cardId, prevColumn.id); //....Mover para anterior
    } else {
      // Buscar ultima coluna da fase anterior
      const currentPhase = phases.find(p => p.id === currentColumn.phaseId);
      if (!currentPhase) return;      //......Fase nao encontrada

      const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
      const phaseIndex = sortedPhases.findIndex(p => p.id === currentPhase.id);
      const prevPhase = sortedPhases[phaseIndex - 1];

      if (prevPhase) {
        const prevPhaseColumns = columns
          .filter(c => c.phaseId === prevPhase.id)
          .sort((a, b) => a.order - b.order);

        if (prevPhaseColumns.length > 0) {
          moveCard(cardId, prevPhaseColumns[prevPhaseColumns.length - 1].id);
        }
      }
    }
  }, [cards, columns, phases, moveCard]);

  // ========================================
  // Handlers de Fase
  // ========================================

  // Handler de abrir modal criar fase
  const handleOpenCreatePhase = useCallback(() => {
    setShowCreatePhase(true);         //......Abrir modal
  }, []);

  // Handler de fechar modal criar fase
  const handleCloseCreatePhase = useCallback(() => {
    setShowCreatePhase(false);        //......Fechar modal
  }, []);

  // Handler de criar fase
  const handleCreatePhase = useCallback((name: string, color: string) => {
    const newPhase = {
      id: `phase-${Date.now()}`,      //......ID unico
      name,                           //......Nome da fase
      color,                          //......Cor da fase
      order: phases.length,           //......Ordem
    };
    addPhase(newPhase);               //......Adicionar fase
    setShowCreatePhase(false);        //......Fechar modal
  }, [phases.length, addPhase]);

  // ========================================
  // Handlers de Coluna
  // ========================================

  // Handler de abrir modal criar coluna
  const handleOpenCreateColumn = useCallback((phaseId?: string) => {
    setCreateColumnPhaseId(phaseId || '');
    setShowCreateColumn(true);        //......Abrir modal
  }, []);

  // Handler de fechar modal criar coluna
  const handleCloseCreateColumn = useCallback(() => {
    setShowCreateColumn(false);       //......Fechar modal
    setCreateColumnPhaseId('');       //......Limpar fase
  }, []);

  // Handler de criar coluna
  const handleCreateColumn = useCallback((name: string, color: string, phaseId: string) => {
    const phaseColumns = columns.filter(c => c.phaseId === phaseId);
    const newColumn = {
      id: `column-${Date.now()}`,     //......ID unico
      phaseId,                        //......ID da fase
      name,                           //......Nome da coluna
      color,                          //......Cor da coluna
      order: phaseColumns.length,     //......Ordem
    };
    addColumn(newColumn);             //......Adicionar coluna
    setShowCreateColumn(false);       //......Fechar modal
    setCreateColumnPhaseId('');       //......Limpar fase
  }, [columns, addColumn]);

  // ========================================
  // Handler de Adicionar Card
  // ========================================
  const handleAddCard = useCallback((columnId: string) => {
    // Encontrar phase da coluna
    const column = columns.find(c => c.id === columnId);
    const phaseId = column?.phaseId || '';

    // TODO: Abrir modal de criar lead
    const newCard = {
      id: `card-${Date.now()}`,       //......ID unico
      columnId,                       //......ID da coluna
      phaseId,                        //......ID da fase
      leadName: 'Novo Lead',          //......Nome placeholder
      status: 'cold' as const,        //......Status inicial
      value: 0,                       //......Valor inicial
      aiAutomation: false,            //......IA desativada
    };
    addCard(newCard);                 //......Adicionar card
  }, [addCard, columns]);

  // ========================================
  // Handler de Adicionar Lead
  // ========================================
  const handleAddLead = useCallback(() => {
    // TODO: Abrir modal de criar lead manualmente
    console.log('Abrir modal de criar lead');
  }, []);

  // ========================================
  // Handlers de WhatsApp Setup
  // ========================================

  // Handler para abrir modal
  const handleOpenWhatsAppSetup = useCallback(() => {
    setShowWhatsAppSetup(true);       //......Abrir modal
  }, []);

  // Handler para fechar modal
  const handleCloseWhatsAppSetup = useCallback(() => {
    setShowWhatsAppSetup(false);      //......Fechar modal
  }, []);

  // Handler para mudanca de conexao
  const handleConnectionChange = useCallback((connected: boolean) => {
    // Carregar contatos quando conectar
    if (connected) {
      console.log('[FunnelTab] Conexao estabelecida, carregando contatos...');
      loadWhatsAppContacts();          //....Carregar contatos do WhatsApp
    }
  }, [loadWhatsAppContacts]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* View Desktop ou Mobile */}
      {isMobile ? (
        // View Mobile - uma coluna por vez
        <KanbanMobileView
          phases={phases}
          columns={columns}
          cards={cards}
          onCardPress={handleCardPress}
          onCardChatPress={handleCardChatPress}
          onCardLongPress={handleCardLongPress}
          onAddCard={handleAddCard}
          onAddPhase={handleOpenCreatePhase}
          onAddColumn={handleOpenCreateColumn}
          onAddLead={handleAddLead}
          isWhatsAppConnected={isWhatsAppConnected}
          onWhatsAppPress={handleOpenWhatsAppSetup}
        />
      ) : (
        // View Desktop - todas as fases lado a lado
        <KanbanBoard
          onCardPress={handleCardPress}
          onCardChatPress={handleCardChatPress}
          onAddPhase={handleOpenCreatePhase}
          onAddColumn={handleOpenCreateColumn}
        />
      )}

      {/* Modal de Detalhes do Card */}
      <CardDetailsModal
        visible={showCardDetails}
        card={selectedCard}
        onClose={handleCloseCardDetails}
        onToggleAI={handleToggleAI}
        onMoveNext={handleMoveNext}
        onMovePrevious={handleMovePrevious}
      />

      {/* Modal de Criar Fase */}
      <CreatePhaseModal
        visible={showCreatePhase}
        onClose={handleCloseCreatePhase}
        onCreate={handleCreatePhase}
      />

      {/* Modal de Criar Coluna */}
      <CreateColumnModal
        visible={showCreateColumn}
        phases={phases}
        selectedPhaseId={createColumnPhaseId}
        onClose={handleCloseCreateColumn}
        onCreate={handleCreateColumn}
      />

      {/* Modal de Configuracao WhatsApp */}
      <Modal
        visible={showWhatsAppSetup}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseWhatsAppSetup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurar WhatsApp</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseWhatsAppSetup}
              >
                <CloseIcon size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Conteudo do Modal */}
            <WhatsAppSetup
              userId="vendedor-1"
              userName="Vendedor"
              onConnectionChange={handleConnectionChange}
              onClose={handleCloseWhatsAppSetup}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default FunnelTab;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.background, //....Fundo cinza
  },

  // Overlay do modal
  modalOverlay: {
    flex: 1,                          //......Ocupa tudo
    backgroundColor: COLORS.backdrop, //......Fundo escuro
    justifyContent: 'flex-end',       //......Alinha no fundo
  },

  // Container do modal
  modalContainer: {
    backgroundColor: COLORS.white,    //......Fundo branco
    borderTopLeftRadius: 24,          //......Arredonda esquerda
    borderTopRightRadius: 24,         //......Arredonda direita
    maxHeight: '90%',                 //......Altura maxima
    minHeight: '60%',                 //......Altura minima
  },

  // Header do modal
  modalHeader: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre
    alignItems: 'center',             //......Centraliza vertical
    paddingHorizontal: 20,            //......Padding horizontal
    paddingTop: 20,                   //......Padding topo
    paddingBottom: 12,                //......Padding baixo
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor borda
  },

  // Titulo do modal
  modalTitle: {
    fontSize: 18,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte bold
    color: COLORS.textPrimary,        //......Cor escura
  },

  // Botao fechar modal
  modalCloseButton: {
    width: 40,                        //......Largura
    height: 40,                       //......Altura
    borderRadius: 20,                 //......Circular
    justifyContent: 'center',         //......Centraliza vertical
    alignItems: 'center',             //......Centraliza horizontal
  },
});
