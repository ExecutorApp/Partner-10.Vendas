// ========================================
// Hook useDashboardMetrics
// Calcula metricas do dashboard
// ========================================

// ========================================
// Imports React
// ========================================
import {
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React

// ========================================
// Imports de Contextos
// ========================================
import { useKanban } from '../contexts/KanbanContext';
import { useAIAssistant } from '../contexts/AIAssistantContext';

// ========================================
// Imports de Tipos
// ========================================
import {
  DashboardMetric,                    //......Tipo metrica
  DashboardFilters,                   //......Tipo filtros
  FunnelData,                         //......Tipo funil
  TimelineData,                       //......Tipo timeline
  BrokerPerformance,                  //......Tipo performance
  PeriodFilter,                       //......Tipo periodo
  KanbanCard,                         //......Tipo card
} from '../types/commercial.types';

// ========================================
// Tipos Locais
// ========================================

// Dados do grafico de fases
export interface PhaseChartData {
  phaseId: string;                    //......Id da fase
  phaseName: string;                  //......Nome da fase
  leadsCount: number;                 //......Quantidade de leads
  color: string;                      //......Cor da fase
  percentage: number;                 //......Porcentagem do total
}

// Retorno do hook
export interface UseDashboardMetricsReturn {
  totalLeads: number;                 //......Total de leads
  convertedLeads: number;             //......Leads convertidos
  conversionRate: number;             //......Taxa de conversao
  averageClosingTime: number;         //......Tempo medio
  metricsCards: DashboardMetric[];    //......Cards formatados
  phaseDistribution: PhaseChartData[]; //....Distribuicao por fase
  funnelData: FunnelData[];           //......Dados do funil
  timelineData: TimelineData[];       //......Dados da timeline
  brokerPerformance: BrokerPerformance[]; //..Performance corretores
  filters: DashboardFilters;          //......Filtros atuais
  applyFilters: (filters: DashboardFilters) => void;
  clearFilters: () => void;           //......Limpar filtros
  isLoading: boolean;                 //......Carregando
  error: string | null;               //......Erro
}

// ========================================
// Constantes
// ========================================

// Filtros padrao
const DEFAULT_FILTERS: DashboardFilters = {
  period: 'month',                    //......Periodo mensal
};

// ========================================
// Hook useDashboardMetrics
// ========================================
export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  // ========================================
  // Contextos
  // ========================================
  const { phases, cards } = useKanban(); //..Dados do Kanban
  const { messages } = useAIAssistant(); //..Mensagens da IA

  // ========================================
  // Estados
  // ========================================
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Funcao: Filtrar cards por periodo
  // ========================================
  const filterCardsByPeriod = useCallback((
    allCards: KanbanCard[],           //......Todos os cards
    periodFilter: PeriodFilter,       //......Filtro de periodo
  ): KanbanCard[] => {
    const now = new Date();           //......Data atual
    let startDate: Date;              //......Data inicial

    switch (periodFilter) {
      case 'today':                   //......Hoje
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':                    //......Esta semana
        const dayOfWeek = now.getDay(); //....Dia da semana
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        break;
      case 'month':                   //......Este mes
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':                 //......Este trimestre
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':                    //......Este ano
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:                        //......Padrao: todos
        return allCards;
    }

    return allCards.filter(card => {
      const cardDate = new Date(card.enteredAt);
      return cardDate >= startDate && cardDate <= now;
    });
  }, []);

  // ========================================
  // Metricas Calculadas
  // ========================================

  // Total de leads
  const totalLeads = useMemo(() => {
    const filteredCards = filterCardsByPeriod(cards, filters.period);
    return filteredCards.length;      //......Quantidade total
  }, [cards, filters.period, filterCardsByPeriod]);

  // Leads convertidos
  const convertedLeads = useMemo(() => {
    const filteredCards = filterCardsByPeriod(cards, filters.period);
    return filteredCards.filter(c => c.status === 'won').length;
  }, [cards, filters.period, filterCardsByPeriod]);

  // Taxa de conversao
  const conversionRate = useMemo(() => {
    if (totalLeads === 0) return 0;   //......Evitar divisao por zero
    return (convertedLeads / totalLeads) * 100;
  }, [totalLeads, convertedLeads]);

  // Tempo medio de fechamento
  const averageClosingTime = useMemo(() => {
    const filteredCards = filterCardsByPeriod(cards, filters.period);
    const wonCards = filteredCards.filter(c => c.status === 'won');

    if (wonCards.length === 0) return 0; //..Se nao tem convertidos

    const totalDays = wonCards.reduce((sum, card) => {
      const enteredAt = new Date(card.enteredAt);
      const now = new Date();         //......Usar data atual como proxy
      const diffTime = Math.abs(now.getTime() - enteredAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / wonCards.length);
  }, [cards, filters.period, filterCardsByPeriod]);

  // ========================================
  // Cards de Metricas Formatados
  // ========================================
  const metricsCards = useMemo((): DashboardMetric[] => {
    // Valores anteriores (mock - 20% menos)
    const prevTotal = Math.floor(totalLeads * 0.8);
    const prevConverted = Math.floor(convertedLeads * 0.8);
    const prevRate = prevTotal > 0 ? (prevConverted / prevTotal) * 100 : 0;
    const prevTime = Math.floor(averageClosingTime * 1.2);

    return [
      {
        id: '1',                       //......Id unico
        title: 'Total de Leads',      //......Titulo
        value: totalLeads,            //......Valor atual
        previousValue: prevTotal,     //......Valor anterior
        format: 'number',             //......Formato numero
        trend: totalLeads > prevTotal ? 'up' : totalLeads < prevTotal ? 'down' : 'stable',
        percentChange: prevTotal > 0
          ? ((totalLeads - prevTotal) / prevTotal) * 100
          : 0,
      },
      {
        id: '2',                       //......Id unico
        title: 'Convertidos',         //......Titulo
        value: convertedLeads,        //......Valor atual
        previousValue: prevConverted, //......Valor anterior
        format: 'number',             //......Formato numero
        trend: convertedLeads > prevConverted ? 'up' : convertedLeads < prevConverted ? 'down' : 'stable',
        percentChange: prevConverted > 0
          ? ((convertedLeads - prevConverted) / prevConverted) * 100
          : 0,
      },
      {
        id: '3',                       //......Id unico
        title: 'Taxa de Conversao',   //......Titulo
        value: conversionRate,        //......Valor atual
        previousValue: prevRate,      //......Valor anterior
        format: 'percentage',         //......Formato porcentagem
        trend: conversionRate > prevRate ? 'up' : conversionRate < prevRate ? 'down' : 'stable',
        percentChange: prevRate > 0
          ? ((conversionRate - prevRate) / prevRate) * 100
          : 0,
      },
      {
        id: '4',                       //......Id unico
        title: 'Tempo Medio',         //......Titulo
        value: averageClosingTime,    //......Valor atual
        previousValue: prevTime,      //......Valor anterior
        format: 'number',             //......Formato numero
        trend: averageClosingTime < prevTime ? 'up' : averageClosingTime > prevTime ? 'down' : 'stable',
        percentChange: prevTime > 0
          ? ((averageClosingTime - prevTime) / prevTime) * 100
          : 0,
      },
    ];
  }, [totalLeads, convertedLeads, conversionRate, averageClosingTime]);

  // ========================================
  // Distribuicao por Fase
  // ========================================
  const phaseDistribution = useMemo((): PhaseChartData[] => {
    const filteredCards = filterCardsByPeriod(cards, filters.period);
    const total = filteredCards.length || 1; //..Evitar divisao zero

    return phases.map(phase => {
      const phaseCards = filteredCards.filter(c => c.phaseId === phase.id);
      const count = phaseCards.length;

      return {
        phaseId: phase.id,            //......Id da fase
        phaseName: phase.name,        //......Nome da fase
        leadsCount: count,            //......Quantidade
        color: phase.color,           //......Cor da fase
        percentage: (count / total) * 100, //..Porcentagem
      };
    });
  }, [phases, cards, filters.period, filterCardsByPeriod]);

  // ========================================
  // Dados do Funil
  // ========================================
  const funnelData = useMemo((): FunnelData[] => {
    const filteredCards = filterCardsByPeriod(cards, filters.period);

    return phases.map((phase, index) => {
      const phaseCards = filteredCards.filter(c => c.phaseId === phase.id);
      const count = phaseCards.length;
      const prevPhaseCount = index > 0
        ? filteredCards.filter(c => c.phaseId === phases[index - 1].id).length
        : filteredCards.length;
      const rate = prevPhaseCount > 0 ? (count / prevPhaseCount) * 100 : 0;

      return {
        phaseId: phase.id,            //......Id da fase
        phaseName: phase.name,        //......Nome da fase
        leadsCount: count,            //......Quantidade
        conversionRate: rate,         //......Taxa de conversao
        averageTime: 3 + index * 2,   //......Mock: dias por fase
      };
    });
  }, [phases, cards, filters.period, filterCardsByPeriod]);

  // ========================================
  // Dados da Timeline
  // ========================================
  const timelineData = useMemo((): TimelineData[] => {
    const data: TimelineData[] = [];  //......Array de dados
    const now = new Date();           //......Data atual
    const daysToShow = filters.period === 'week' ? 7
      : filters.period === 'month' ? 30
      : 12;                           //......Quantidade de pontos

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);      //......Inicio do dia

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCards = cards.filter(card => {
        const cardDate = new Date(card.enteredAt);
        return cardDate >= date && cardDate < nextDate;
      });

      data.push({
        date,                         //......Data do ponto
        newLeads: dayCards.length,    //......Novos leads
        convertedLeads: dayCards.filter(c => c.status === 'won').length,
      });
    }

    return data;
  }, [cards, filters.period]);

  // ========================================
  // Performance por Corretor (Mock)
  // ========================================
  const brokerPerformance = useMemo((): BrokerPerformance[] => {
    return [
      {
        brokerId: 'broker-1',         //......Id do corretor
        brokerName: 'Carlos Silva',   //......Nome
        totalLeads: 45,               //......Total
        inProgress: 12,               //......Em andamento
        converted: 8,                 //......Convertidos
        conversionRate: 17.8,         //......Taxa
        averageClosingTime: 14,       //......Tempo medio
      },
      {
        brokerId: 'broker-2',         //......Id do corretor
        brokerName: 'Ana Santos',     //......Nome
        totalLeads: 38,               //......Total
        inProgress: 10,               //......Em andamento
        converted: 10,                //......Convertidos
        conversionRate: 26.3,         //......Taxa
        averageClosingTime: 11,       //......Tempo medio
      },
    ];
  }, []);

  // ========================================
  // Handlers
  // ========================================

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: DashboardFilters) => {
    setIsLoading(true);               //......Iniciar loading
    setFilters(newFilters);           //......Atualizar filtros
    setTimeout(() => setIsLoading(false), 300); //..Simular delay
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);      //......Resetar filtros
  }, []);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    totalLeads,                       //......Total de leads
    convertedLeads,                   //......Leads convertidos
    conversionRate,                   //......Taxa de conversao
    averageClosingTime,               //......Tempo medio
    metricsCards,                     //......Cards formatados
    phaseDistribution,                //......Distribuicao por fase
    funnelData,                       //......Dados do funil
    timelineData,                     //......Dados da timeline
    brokerPerformance,                //......Performance corretores
    filters,                          //......Filtros atuais
    applyFilters,                     //......Aplicar filtros
    clearFilters,                     //......Limpar filtros
    isLoading,                        //......Carregando
    error,                            //......Erro
  };
};

// ========================================
// Export Default
// ========================================
export default useDashboardMetrics;
