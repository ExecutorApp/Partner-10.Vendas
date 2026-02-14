// ========================================
// Contexto do Kanban
// Gerencia fases, colunas e cards
// ========================================

// ========================================
// Imports
// ========================================
import React, {                       //......React core
  createContext,                      //......Criar contexto
  useContext,                         //......Hook de contexto
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
  useEffect,                          //......Hook de efeito
  ReactNode,                          //......Tipo de children
} from 'react';                       //......Biblioteca React

// ========================================
// Imports de Servicos WhatsApp
// ========================================
import { evolutionService } from '../services/evolutionService';
import instanceManager from '../services/instanceManager';

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanPhase,                        //......Interface de fase
  KanbanColumn,                       //......Interface de coluna
  KanbanCard,                         //......Interface de card
  CardHistory,                        //......Interface de historico
  LeadStatus,                         //......Tipo de status
} from '../types/commercial.types';   //......Arquivo de tipos

// ========================================
// Tipos do Contexto
// ========================================

// Interface do valor do contexto
interface KanbanContextValue {
  // Estado das fases
  phases: KanbanPhase[];              //......Lista de fases
  selectedPhaseId: string | null;     //......Fase selecionada
  selectPhase: (id: string | null) => void; //..Selecionar fase

  // Estado dos cards
  cards: KanbanCard[];                //......Lista de cards

  // Estado das colunas (mobile)
  selectedColumnId: string | null;    //......Coluna selecionada
  selectColumn: (id: string | null) => void; //..Selecionar coluna

  // Estado do card selecionado
  selectedCard: KanbanCard | null;    //......Card selecionado
  selectCard: (card: KanbanCard | null) => void; //..Selecionar card

  // Acoes de cards
  moveCard: (cardId: string, toColumnId: string) => void;
  moveCardToPhase: (cardId: string, toPhaseId: string) => void;
  updateCardStatus: (cardId: string, status: LeadStatus) => void;
  addNoteToCard: (cardId: string, note: string) => void;
  toggleAIAutomation: (cardId: string) => void;

  // Acoes de fases e colunas
  addPhase: (phase: { id: string; name: string; color: string; order: number }) => void;
  addColumn: (column: { id: string; phaseId: string; name: string; color: string; order: number }) => void;
  addCard: (card: Partial<KanbanCard>) => void; //..Adicionar card
  reorderPhases: (fromIndex: number, toIndex: number) => void;
  reorderColumns: (phaseId: string, fromIndex: number, toIndex: number) => void;

  // Utilitarios
  getColumnCards: (columnId: string) => KanbanCard[];
  getPhaseStats: (phaseId: string) => { total: number; value: number };

  // Estado de UI
  isCardModalOpen: boolean;           //......Modal de card aberto
  setCardModalOpen: (open: boolean) => void; //..Abrir/fechar modal

  // WhatsApp
  isWhatsAppConnected: boolean;       //......WhatsApp conectado
  isLoadingWhatsAppContacts: boolean; //......Carregando contatos
  loadWhatsAppContacts: () => Promise<void>; //..Carregar contatos
}

// ========================================
// Dados Mock
// ========================================

// Gerar data de dias atras
const daysAgo = (days: number): Date => {
  const date = new Date();            //......Data atual
  date.setDate(date.getDate() - days); //......Subtrair dias
  return date;                        //......Retornar data
};

// Cards iniciais vazios (dados reais virao do WhatsApp)
const INITIAL_CARDS: KanbanCard[] = [];

// Colunas mock para desenvolvimento
const MOCK_COLUMNS: KanbanColumn[] = [
  {                                   //......Coluna 1
    id: 'col-1',                      //......Id da coluna
    phaseId: 'phase-1',               //......Id da fase
    name: 'Novos',                    //......Nome da coluna
    status: 'new',                    //......Status
    color: '#1777CF',                 //......Cor azul
    order: 0,                         //......Ordem
    cards: [],                        //......Cards
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
  {                                   //......Coluna 2
    id: 'col-2',                      //......Id da coluna
    phaseId: 'phase-1',               //......Id da fase
    name: 'Em Análise',               //......Nome da coluna
    status: 'analyzing',              //......Status
    color: '#F59E0B',                 //......Cor amarela
    order: 1,                         //......Ordem
    cards: [],                        //......Cards
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
  {                                   //......Coluna 3
    id: 'col-3',                      //......Id da coluna
    phaseId: 'phase-2',               //......Id da fase
    name: 'Proposta',                 //......Nome da coluna
    status: 'proposal',               //......Status
    color: '#22C55E',                 //......Cor verde
    order: 0,                         //......Ordem
    cards: [],                        //......Cards
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
  {                                   //......Coluna 4
    id: 'col-4',                      //......Id da coluna
    phaseId: 'phase-2',               //......Id da fase
    name: 'Negociação',               //......Nome da coluna
    status: 'negotiation',            //......Status
    color: '#8B5CF6',                 //......Cor roxa
    order: 1,                         //......Ordem
    cards: [],                        //......Cards
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
];

// Fases mock para desenvolvimento
const MOCK_PHASES: KanbanPhase[] = [
  {                                   //......Fase 1
    id: 'phase-1',                    //......Id da fase
    name: 'Qualificação',             //......Nome da fase
    order: 0,                         //......Ordem
    color: '#1777CF',                 //......Cor azul
    columns: MOCK_COLUMNS.filter(     //......Filtrar colunas
      c => c.phaseId === 'phase-1'    //......Da fase 1
    ),
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
  {                                   //......Fase 2
    id: 'phase-2',                    //......Id da fase
    name: 'Negociação',               //......Nome da fase
    order: 1,                         //......Ordem
    color: '#22C55E',                 //......Cor verde
    columns: MOCK_COLUMNS.filter(     //......Filtrar colunas
      c => c.phaseId === 'phase-2'    //......Da fase 2
    ),
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
  {                                   //......Fase 3
    id: 'phase-3',                    //......Id da fase
    name: 'Fechamento',               //......Nome da fase
    order: 2,                         //......Ordem
    color: '#F59E0B',                 //......Cor amarela
    columns: [],                      //......Colunas vazias
    createdAt: new Date(),            //......Data criacao
    createdBy: 'user-1',              //......Criado por
  },
];

// ========================================
// Contexto
// ========================================

// Criar contexto com valor inicial null
const KanbanContext = createContext<KanbanContextValue | null>(null);

// ========================================
// Provider
// ========================================

// Interface de props do provider
interface KanbanProviderProps {
  children: ReactNode;                //......Elementos filhos
}

// Componente provider do contexto
export const KanbanProvider: React.FC<KanbanProviderProps> = ({
  children,                           //......Elementos filhos
}) => {
  // ========================================
  // Estados
  // ========================================

  // Estado das fases
  const [phases, setPhases] = useState<KanbanPhase[]>(MOCK_PHASES);

  // Estado dos cards
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);

  // Estado da fase selecionada
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>('phase-1');

  // Estado da coluna selecionada (mobile)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>('col-1');

  // Estado do card selecionado
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);

  // Estado do modal de card
  const [isCardModalOpen, setCardModalOpen] = useState<boolean>(false);

  // Estado do WhatsApp
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState<boolean>(false);
  const [isLoadingWhatsAppContacts, setIsLoadingWhatsAppContacts] = useState<boolean>(false);

  // ID do usuario (mock por enquanto)
  const currentUserId = 'vendedor-1';

  // ========================================
  // Verificar Conexao WhatsApp ao Montar
  // ========================================
  useEffect(() => {
    checkWhatsAppConnection();
  }, []);

  // Verificar se WhatsApp esta conectado
  const checkWhatsAppConnection = async () => {
    try {
      console.log('[KanbanContext] Verificando conexao WhatsApp...');
      const connected = await instanceManager.isConnected(currentUserId);
      console.log('[KanbanContext] WhatsApp conectado:', connected);
      setIsWhatsAppConnected(connected);

      // Se conectado, carregar contatos automaticamente
      if (connected) {
        loadWhatsAppContacts();
      }
    } catch (error) {
      console.error('[KanbanContext] Erro ao verificar WhatsApp:', error);
    }
  };

  // Converter contato WhatsApp em KanbanCard
  const convertContactToCard = useCallback((contact: any, index: number): KanbanCard => {
    // Extrair numero do telefone do remoteJid (ex: "5517991870378@s.whatsapp.net")
    const jid = contact.remoteJid || contact.id || '';
    const phone = jid.split('@')[0] || '';

    // Nome do contato vem do pushName
    const contactName = contact.pushName || phone || 'Contato Desconhecido';

    return {
      id: `whatsapp-${phone}-${index}`,
      leadId: `lead-whatsapp-${phone}`,
      leadName: contactName,                 //......Nome do contato
      leadPhone: phone,                      //......Telefone do lead
      leadPhoto: contact.profilePicUrl || contact.profilePictureUrl || undefined,
      columnId: 'col-1',                     //......Primeira coluna (Novos)
      phaseId: 'phase-1',                    //......Primeira fase
      status: 'cold' as LeadStatus,          //......Status frio
      value: 0,                              //......Valor zero
      enteredAt: new Date(),                 //......Data atual
      movedBy: 'whatsapp',                   //......Origem WhatsApp
      lastInteraction: new Date(),           //......Interacao recente
      history: [],                           //......Sem historico
      notes: [],                             //......Sem notas
      tags: ['whatsapp'],                    //......Tag WhatsApp
      aiAutomation: false,                   //......IA desativada
      phoneNumber: phone,                    //......Numero WhatsApp
      isWhatsAppContact: true,               //......Flag de WhatsApp
      whatsAppJid: jid,                      //......JID completo
    } as KanbanCard;
  }, []);

  // Carregar contatos do WhatsApp progressivamente
  const loadWhatsAppContacts = useCallback(async () => {
    // Inicio medicao de performance
    const perfStart = performance.now();
    console.log('[PERF] loadWhatsAppContacts - START (Progressivo)');

    try {
      setIsLoadingWhatsAppContacts(true);

      const instanceName = `partners_${currentUserId}`;
      let totalCardIndex = 0;

      // Callback para processar cada batch
      const handleBatch = (contacts: any[], batchNumber: number, totalLoaded: number) => {
        const batchStart = performance.now();

        // Filtrar apenas contatos individuais (ignorar grupos @g.us)
        const individualContacts = contacts.filter((chat: any) => {
          const jid = chat.remoteJid || chat.id || '';
          return jid && !jid.includes('@g.us');
        });

        // Converter contatos em cards
        const newCards = individualContacts.map((contact, i) => {
          const card = convertContactToCard(contact, totalCardIndex + i);
          return card;
        });

        totalCardIndex += individualContacts.length;

        console.log(`[PERF] Batch ${batchNumber} processado - ${newCards.length} cards em ${(performance.now() - batchStart).toFixed(0)}ms`);

        // Atualizar cards acumulando com batches anteriores
        setCards(prev => {
          // Se for primeiro batch, substituir
          if (batchNumber === 1) {
            return newCards;
          }
          // Senao, acumular
          return [...prev, ...newCards];
        });
      };

      // Carregar progressivamente
      const { totalContacts, batches } = await evolutionService.fetchChatsProgressive(
        instanceName,
        handleBatch
      );

      console.log(`[PERF] TOTAL loadWhatsAppContacts - ${totalContacts} contatos em ${batches} batches em ${(performance.now() - perfStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('[PERF] ERRO loadWhatsAppContacts:', error);
    } finally {
      setIsLoadingWhatsAppContacts(false);
    }
  }, [currentUserId, convertContactToCard]);

  // ========================================
  // Handlers de Selecao
  // ========================================

  // Handler para selecionar fase
  const selectPhase = useCallback((id: string | null) => {
    setSelectedPhaseId(id);           //......Atualizar fase
    // Selecionar primeira coluna da fase
    if (id) {
      const phase = phases.find(p => p.id === id);
      if (phase && phase.columns.length > 0) {
        setSelectedColumnId(phase.columns[0].id);
      }
    }
  }, [phases]);

  // Handler para selecionar coluna
  const selectColumn = useCallback((id: string | null) => {
    setSelectedColumnId(id);          //......Atualizar coluna
  }, []);

  // Handler para selecionar card
  const selectCard = useCallback((card: KanbanCard | null) => {
    setSelectedCard(card);            //......Atualizar card
    setCardModalOpen(!!card);         //......Abrir modal se tiver card
  }, []);

  // ========================================
  // Handlers de Cards
  // ========================================

  // Handler para mover card entre colunas
  const moveCard = useCallback((cardId: string, toColumnId: string) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;

      // Criar historico
      const historyEntry: CardHistory = {
        id: `hist-${Date.now()}`,     //......Id do historico
        cardId: card.id,              //......Id do card
        fromColumn: card.columnId,    //......Coluna origem
        toColumn: toColumnId,         //......Coluna destino
        movedBy: 'user-1',            //......Movido por
        movedAt: new Date(),          //......Data
      };

      return {
        ...card,                      //......Manter dados
        columnId: toColumnId,         //......Nova coluna
        history: [...card.history, historyEntry], //..Adicionar historico
      };
    }));
  }, []);

  // Handler para mover card para outra fase
  const moveCardToPhase = useCallback((cardId: string, toPhaseId: string) => {
    // Encontrar primeira coluna da fase destino
    const targetPhase = phases.find(p => p.id === toPhaseId);
    if (!targetPhase || targetPhase.columns.length === 0) return;

    const firstColumnId = targetPhase.columns[0].id;

    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;

      // Criar historico
      const historyEntry: CardHistory = {
        id: `hist-${Date.now()}`,     //......Id do historico
        cardId: card.id,              //......Id do card
        fromColumn: card.columnId,    //......Coluna origem
        toColumn: firstColumnId,      //......Coluna destino
        fromPhase: card.phaseId,      //......Fase origem
        toPhase: toPhaseId,           //......Fase destino
        movedBy: 'user-1',            //......Movido por
        movedAt: new Date(),          //......Data
      };

      return {
        ...card,                      //......Manter dados
        columnId: firstColumnId,      //......Nova coluna
        phaseId: toPhaseId,           //......Nova fase
        history: [...card.history, historyEntry], //..Adicionar historico
      };
    }));
  }, [phases]);

  // Handler para atualizar status do card
  const updateCardStatus = useCallback((cardId: string, status: LeadStatus) => {
    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, status } : card
    ));
  }, []);

  // Handler para adicionar nota ao card
  const addNoteToCard = useCallback((cardId: string, note: string) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, notes: [...card.notes, note] }
        : card
    ));
  }, []);

  // Handler para toggle IA automatica
  const toggleAIAutomation = useCallback((cardId: string) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, aiAutomation: !card.aiAutomation }
        : card
    ));
  }, []);

  // ========================================
  // Handlers de Fases e Colunas
  // ========================================

  // Handler para adicionar fase
  const addPhase = useCallback((phase: { id: string; name: string; color: string; order: number }) => {
    const newPhase: KanbanPhase = {
      id: phase.id,                   //......Id da fase
      name: phase.name,               //......Nome da fase
      order: phase.order,             //......Ordem
      color: phase.color,             //......Cor da fase
      columns: [],                    //......Colunas vazias
      createdAt: new Date(),          //......Data criacao
      createdBy: 'user-1',            //......Criado por
    };
    setPhases(prev => [...prev, newPhase]);
  }, []);

  // Handler para adicionar coluna
  const addColumn = useCallback((column: { id: string; phaseId: string; name: string; color: string; order: number }) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id !== column.phaseId) return phase;

      const newColumn: KanbanColumn = {
        id: column.id,                //......Id da coluna
        phaseId: column.phaseId,      //......Id da fase
        name: column.name,            //......Nome da coluna
        status: column.name.toLowerCase(), //..Status
        color: column.color,          //......Cor da coluna
        order: column.order,          //......Ordem
        cards: [],                    //......Cards vazios
        createdAt: new Date(),        //......Data criacao
        createdBy: 'user-1',          //......Criado por
      };

      return {
        ...phase,                     //......Manter dados
        columns: [...phase.columns, newColumn], //..Adicionar coluna
      };
    }));
  }, []);

  // Handler para adicionar card
  const addCard = useCallback((cardData: Partial<KanbanCard>) => {
    const newCard: KanbanCard = {
      id: cardData.id || `card-${Date.now()}`,
      leadId: cardData.leadId || `lead-${Date.now()}`,
      leadName: cardData.leadName || 'Novo Lead',
      leadPhoto: cardData.leadPhoto,
      columnId: cardData.columnId || '',
      phaseId: cardData.phaseId || '',
      status: cardData.status || 'cold',
      value: cardData.value || 0,
      enteredAt: cardData.enteredAt || new Date(),
      movedBy: cardData.movedBy || 'user-1',
      lastInteraction: cardData.lastInteraction || new Date(),
      history: cardData.history || [],
      notes: cardData.notes || [],
      tags: cardData.tags || [],
      aiAutomation: cardData.aiAutomation || false,
    };
    setCards(prev => [...prev, newCard]);
  }, []);

  // Handler para reordenar fases
  const reorderPhases = useCallback((fromIndex: number, toIndex: number) => {
    setPhases(prev => {
      const result = [...prev];       //......Copiar array
      const [removed] = result.splice(fromIndex, 1); //..Remover
      result.splice(toIndex, 0, removed); //..Inserir
      return result.map((phase, index) => ({
        ...phase,                     //......Manter dados
        order: index,                 //......Atualizar ordem
      }));
    });
  }, []);

  // Handler para reordenar colunas
  const reorderColumns = useCallback((
    phaseId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;

      const columns = [...phase.columns]; //......Copiar array
      const [removed] = columns.splice(fromIndex, 1); //..Remover
      columns.splice(toIndex, 0, removed); //..Inserir

      return {
        ...phase,                     //......Manter dados
        columns: columns.map((col, index) => ({
          ...col,                     //......Manter dados
          order: index,               //......Atualizar ordem
        })),
      };
    }));
  }, []);

  // ========================================
  // Cache de Cards por Coluna (O(1) lookup)
  // ========================================

  // Map de cards agrupados por columnId
  const cardsByColumnMap = useMemo(() => {
    const perfStart = performance.now();
    const map = new Map<string, KanbanCard[]>();

    // Agrupar cards por coluna
    cards.forEach(card => {
      const columnId = card.columnId;
      if (!map.has(columnId)) {
        map.set(columnId, []);         //......Inicializar array
      }
      map.get(columnId)!.push(card);   //......Adicionar ao array
    });

    console.log(`[PERF] cardsByColumnMap criado - ${(performance.now() - perfStart).toFixed(1)}ms - ${cards.length} cards em ${map.size} colunas`);
    return map;
  }, [cards]);

  // ========================================
  // Utilitarios
  // ========================================

  // Obter cards de uma coluna (O(1) com cache)
  const getColumnCards = useCallback((columnId: string): KanbanCard[] => {
    return cardsByColumnMap.get(columnId) || [];
  }, [cardsByColumnMap]);

  // Obter estatisticas de uma fase
  const getPhaseStats = useCallback((phaseId: string): { total: number; value: number } => {
    const phaseCards = cards.filter(card => card.phaseId === phaseId);
    return {
      total: phaseCards.length,       //......Total de cards
      value: phaseCards.reduce((sum, card) => sum + card.value, 0), //..Valor total
    };
  }, [cards]);

  // ========================================
  // Valor do Contexto
  // ========================================

  // Memorizar valor do contexto
  const value = useMemo<KanbanContextValue>(() => ({
    // Estado das fases
    phases,                           //......Lista de fases
    selectedPhaseId,                  //......Fase selecionada
    selectPhase,                      //......Selecionar fase

    // Estado dos cards
    cards,                            //......Lista de cards

    // Estado das colunas
    selectedColumnId,                 //......Coluna selecionada
    selectColumn,                     //......Selecionar coluna

    // Estado do card
    selectedCard,                     //......Card selecionado
    selectCard,                       //......Selecionar card

    // Acoes de cards
    moveCard,                         //......Mover card
    moveCardToPhase,                  //......Mover para fase
    updateCardStatus,                 //......Atualizar status
    addNoteToCard,                    //......Adicionar nota
    toggleAIAutomation,               //......Toggle IA

    // Acoes de fases e colunas
    addPhase,                         //......Adicionar fase
    addColumn,                        //......Adicionar coluna
    addCard,                          //......Adicionar card
    reorderPhases,                    //......Reordenar fases
    reorderColumns,                   //......Reordenar colunas

    // Utilitarios
    getColumnCards,                   //......Obter cards
    getPhaseStats,                    //......Obter estatisticas

    // Estado de UI
    isCardModalOpen,                  //......Modal aberto
    setCardModalOpen,                 //......Abrir/fechar modal

    // WhatsApp
    isWhatsAppConnected,              //......WhatsApp conectado
    isLoadingWhatsAppContacts,        //......Carregando contatos
    loadWhatsAppContacts,             //......Carregar contatos
  }), [
    phases,                           //......Dependencia fases
    cards,                            //......Dependencia cards
    selectedPhaseId,                  //......Dependencia fase selecionada
    selectPhase,                      //......Dependencia selecionar fase
    selectedColumnId,                 //......Dependencia coluna
    selectColumn,                     //......Dependencia selecionar coluna
    selectedCard,                     //......Dependencia card
    selectCard,                       //......Dependencia selecionar card
    moveCard,                         //......Dependencia mover
    moveCardToPhase,                  //......Dependencia mover fase
    updateCardStatus,                 //......Dependencia status
    addNoteToCard,                    //......Dependencia nota
    toggleAIAutomation,               //......Dependencia IA
    addPhase,                         //......Dependencia adicionar fase
    addColumn,                        //......Dependencia adicionar coluna
    addCard,                          //......Dependencia adicionar card
    reorderPhases,                    //......Dependencia reordenar
    reorderColumns,                   //......Dependencia reordenar
    getColumnCards,                   //......Dependencia obter
    getPhaseStats,                    //......Dependencia estatisticas
    isCardModalOpen,                  //......Dependencia modal
    isWhatsAppConnected,              //......Dependencia WhatsApp
    isLoadingWhatsAppContacts,        //......Dependencia loading
    loadWhatsAppContacts,             //......Dependencia carregar
  ]);

  // ========================================
  // Render
  // ========================================

  // Retornar provider com children
  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};

// ========================================
// Hook de Uso
// ========================================

// Hook para usar o contexto kanban
export const useKanban = (): KanbanContextValue => {
  // Obter contexto
  const context = useContext(KanbanContext);

  // Verificar se esta dentro do provider
  if (!context) {
    throw new Error(
      'useKanban deve ser usado dentro de KanbanProvider'
    );
  }

  // Retornar contexto
  return context;
};

// ========================================
// Export Default
// ========================================

export default KanbanProvider;
