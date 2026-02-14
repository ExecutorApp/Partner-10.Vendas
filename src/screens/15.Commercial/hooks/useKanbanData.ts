// ========================================
// Hook useKanbanData
// Gerenciamento de dados do Kanban
// ========================================

// ========================================
// Imports React
// ========================================
import {                              //......Hooks React
  useMemo,                            //......Hook de memorizacao
  useCallback,                        //......Hook de callback
} from 'react';                       //......Biblioteca React

// ========================================
// Imports de Contexto
// ========================================
import { useKanban } from '../contexts/KanbanContext'; //..Context Kanban

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  KanbanPhase,                        //......Interface de fase
  KanbanColumn,                       //......Interface de coluna
  KanbanCard,                         //......Interface de card
  LeadStatus,                         //......Tipo de status
} from '../types/commercial.types';   //......Arquivo de tipos

// ========================================
// Interface de Retorno do Hook
// ========================================
interface UseKanbanDataReturn {
  phases: KanbanPhase[];              //......Lista de fases
  columns: KanbanColumn[];            //......Lista de colunas
  cards: KanbanCard[];                //......Lista de cards
  getColumnsByPhase: (phaseId: string) => KanbanColumn[];
  getCardsByColumn: (columnId: string) => KanbanCard[];
  getCardsByPhase: (phaseId: string) => KanbanCard[];
  getPhaseStats: (phaseId: string) => PhaseStats;
  getTotalStats: () => TotalStats;
  moveCard: (cardId: string, targetColumnId: string) => void;
  updateCardStatus: (cardId: string, status: LeadStatus) => void;
  toggleCardAI: (cardId: string, enabled: boolean) => void;
}

// ========================================
// Interface de Estatisticas de Fase
// ========================================
interface PhaseStats {
  cardsCount: number;                 //......Contagem de cards
  totalValue: number;                 //......Valor total
  formattedValue: string;             //......Valor formatado
  hotLeads: number;                   //......Leads quentes
  warmLeads: number;                  //......Leads mornos
  coldLeads: number;                  //......Leads frios
}

// ========================================
// Interface de Estatisticas Totais
// ========================================
interface TotalStats {
  totalCards: number;                 //......Total de cards
  totalValue: number;                 //......Valor total
  formattedValue: string;             //......Valor formatado
  byStatus: Record<LeadStatus, number>; //..Contagem por status
  conversionRate: number;             //......Taxa de conversao
}

// ========================================
// Hook useKanbanData
// ========================================
export const useKanbanData = (): UseKanbanDataReturn => {
  // ========================================
  // Contexto
  // ========================================
  const {                             //......Dados do contexto
    phases,                           //......Lista de fases
    cards,                            //......Lista de cards
    moveCard: moveCardInContext,      //......Mover card no contexto
    updateCardStatus: updateStatusInContext, //..Atualizar status no contexto
    toggleAIAutomation,               //......Toggle IA no contexto
  } = useKanban();

  // ========================================
  // Derivar colunas das fases
  // ========================================
  const columns = useMemo((): KanbanColumn[] => {
    return phases.flatMap(phase => phase.columns || []);
  }, [phases]);

  // ========================================
  // Memos
  // ========================================

  // Mapa de colunas por fase
  const columnsByPhaseMap = useMemo(() => {
    const map = new Map<string, KanbanColumn[]>();
    phases.forEach(phase => {         //......Para cada fase
      const phaseColumns = columns.filter(c => c.phaseId === phase.id);
      map.set(phase.id, phaseColumns); //....Mapear colunas
    });
    return map;
  }, [phases, columns]);

  // Mapa de cards por coluna
  const cardsByColumnMap = useMemo(() => {
    const map = new Map<string, KanbanCard[]>();
    columns.forEach(column => {       //......Para cada coluna
      const columnCards = cards.filter(c => c.columnId === column.id);
      map.set(column.id, columnCards); //....Mapear cards
    });
    return map;
  }, [columns, cards]);

  // ========================================
  // Funcoes de Consulta
  // ========================================

  // Obter colunas por fase
  const getColumnsByPhase = useCallback((phaseId: string): KanbanColumn[] => {
    return columnsByPhaseMap.get(phaseId) || [];
  }, [columnsByPhaseMap]);

  // Obter cards por coluna
  const getCardsByColumn = useCallback((columnId: string): KanbanCard[] => {
    return cardsByColumnMap.get(columnId) || [];
  }, [cardsByColumnMap]);

  // Obter cards por fase
  const getCardsByPhase = useCallback((phaseId: string): KanbanCard[] => {
    const phaseColumns = getColumnsByPhase(phaseId);
    const columnIds = phaseColumns.map(c => c.id);
    return cards.filter(card => columnIds.includes(card.columnId));
  }, [cards, getColumnsByPhase]);

  // Obter estatisticas da fase
  const getPhaseStats = useCallback((phaseId: string): PhaseStats => {
    const phaseCards = getCardsByPhase(phaseId);
    const totalValue = phaseCards.reduce((sum, card) => sum + card.value, 0);

    return {
      cardsCount: phaseCards.length,  //......Contagem
      totalValue,                     //......Valor total
      formattedValue: totalValue.toLocaleString('pt-BR', {
        style: 'currency',            //......Estilo moeda
        currency: 'BRL',              //......Moeda BRL
      }),
      hotLeads: phaseCards.filter(c => c.status === 'hot').length,
      warmLeads: phaseCards.filter(c => c.status === 'warm').length,
      coldLeads: phaseCards.filter(c => c.status === 'cold').length,
    };
  }, [getCardsByPhase]);

  // Obter estatisticas totais
  const getTotalStats = useCallback((): TotalStats => {
    const totalValue = cards.reduce((sum, card) => sum + card.value, 0);

    // Contar por status
    const byStatus: Record<LeadStatus, number> = {
      hot: cards.filter(c => c.status === 'hot').length,
      warm: cards.filter(c => c.status === 'warm').length,
      cold: cards.filter(c => c.status === 'cold').length,
      won: cards.filter(c => c.status === 'won').length,
      lost: cards.filter(c => c.status === 'lost').length,
    };

    // Calcular taxa de conversao
    const totalClosed = byStatus.won + byStatus.lost;
    const conversionRate = totalClosed > 0
      ? (byStatus.won / totalClosed) * 100
      : 0;

    return {
      totalCards: cards.length,       //......Total de cards
      totalValue,                     //......Valor total
      formattedValue: totalValue.toLocaleString('pt-BR', {
        style: 'currency',            //......Estilo moeda
        currency: 'BRL',              //......Moeda BRL
      }),
      byStatus,                       //......Por status
      conversionRate,                 //......Taxa de conversao
    };
  }, [cards]);

  // ========================================
  // Funcoes de Mutacao
  // ========================================

  // Mover card para coluna
  const moveCard = useCallback((cardId: string, targetColumnId: string) => {
    moveCardInContext(cardId, targetColumnId);
  }, [moveCardInContext]);

  // Atualizar status do card
  const updateCardStatus = useCallback((cardId: string, status: LeadStatus) => {
    updateStatusInContext(cardId, status); //......Atualizar status
  }, [updateStatusInContext]);

  // Toggle IA do card
  const toggleCardAI = useCallback((cardId: string, _enabled: boolean) => {
    toggleAIAutomation(cardId);       //......Toggle IA no contexto
  }, [toggleAIAutomation]);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    phases,                           //......Lista de fases
    columns,                          //......Lista de colunas
    cards,                            //......Lista de cards
    getColumnsByPhase,                //......Funcao colunas por fase
    getCardsByColumn,                 //......Funcao cards por coluna
    getCardsByPhase,                  //......Funcao cards por fase
    getPhaseStats,                    //......Funcao stats fase
    getTotalStats,                    //......Funcao stats total
    moveCard,                         //......Funcao mover card
    updateCardStatus,                 //......Funcao atualizar status
    toggleCardAI,                     //......Funcao toggle IA
  };
};

// ========================================
// Export Default
// ========================================
export default useKanbanData;
