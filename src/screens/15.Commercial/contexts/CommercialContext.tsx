// ========================================
// Contexto Principal do Modulo Commercial
// Gerencia tabs, canais e dashboard
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
  ReactNode,                          //......Tipo de children
} from 'react';                       //......Biblioteca React

// ========================================
// Imports de Tipos
// ========================================
import {                              //......Tipos do commercial
  Channel,                            //......Interface de canal
  ChannelType,                        //......Tipo de canal
  DashboardMetric,                    //......Interface de metrica
  DashboardPeriod,                    //......Interface de periodo
  DashboardFilters,                   //......Interface de filtros
  PeriodFilter,                       //......Tipo de periodo
} from '../types/commercial.types';   //......Arquivo de tipos

// ========================================
// Tipos do Contexto
// ========================================

// Tipo de tab ativa
export type CommercialTab =
  | 'canal'           //.......................Tab de canal
  | 'funil'           //.......................Tab de funil
  | 'dashboard'       //.......................Tab de dashboard
  | 'chat'            //.......................Tab de chat
  | 'ia';             //.......................Tab de IA avancada

// Interface do valor do contexto
interface CommercialContextValue {
  // Estado das tabs
  activeTab: CommercialTab;           //......Tab ativa
  setActiveTab: (tab: CommercialTab) => void; //..Mudar tab

  // Estado dos canais
  channels: Channel[];                //......Lista de canais
  selectedChannelId: string | null;   //......Canal selecionado
  selectChannel: (id: string | null) => void; //..Selecionar canal

  // Estado do dashboard
  metrics: DashboardMetric[];         //......Lista de metricas
  selectedPeriod: DashboardPeriod;    //......Periodo selecionado
  filters: DashboardFilters;          //......Filtros ativos
  setPeriod: (period: DashboardPeriod) => void; //..Mudar periodo
  setFilters: (filters: DashboardFilters) => void; //..Mudar filtros

  // Estado de carregamento
  isLoading: boolean;                 //......Carregando dados
  error: string | null;               //......Erro atual

  // Acoes
  refreshData: () => Promise<void>;   //......Atualizar dados
  clearError: () => void;             //......Limpar erro
}

// ========================================
// Constantes
// ========================================

// Canais mock para desenvolvimento
const MOCK_CHANNELS: Channel[] = [
  {                                   //......Canal Instagram
    id: '1',                          //......Id do canal
    type: 'social_media',             //......Tipo rede social
    name: 'Instagram',                //......Nome do canal
    icon: 'instagram',                //......Icone do canal
    color: '#E1306C',                 //......Cor do Instagram
    leadsCount: 45,                   //......Quantidade de leads
    conversionRate: 12.5,             //......Taxa de conversao
  },
  {                                   //......Canal WhatsApp
    id: '2',                          //......Id do canal
    type: 'direct',                   //......Tipo direto
    name: 'WhatsApp',                 //......Nome do canal
    icon: 'whatsapp',                 //......Icone do canal
    color: '#25D366',                 //......Cor do WhatsApp
    leadsCount: 78,                   //......Quantidade de leads
    conversionRate: 18.3,             //......Taxa de conversao
  },
  {                                   //......Canal Landing Page
    id: '3',                          //......Id do canal
    type: 'landing_page',             //......Tipo landing page
    name: 'Site',                     //......Nome do canal
    icon: 'globe',                    //......Icone do canal
    color: '#1777CF',                 //......Cor azul
    leadsCount: 32,                   //......Quantidade de leads
    conversionRate: 8.7,              //......Taxa de conversao
  },
  {                                   //......Canal Indicacao
    id: '4',                          //......Id do canal
    type: 'referral',                 //......Tipo indicacao
    name: 'Indicação',                //......Nome do canal
    icon: 'users',                    //......Icone do canal
    color: '#22C55E',                 //......Cor verde
    leadsCount: 23,                   //......Quantidade de leads
    conversionRate: 25.0,             //......Taxa de conversao
  },
];

// Metricas mock para desenvolvimento
const MOCK_METRICS: DashboardMetric[] = [
  {                                   //......Metrica total leads
    id: '1',                          //......Id da metrica
    title: 'Total de Leads',          //......Titulo
    value: 178,                       //......Valor atual
    previousValue: 156,               //......Valor anterior
    format: 'number',                 //......Formato numero
    trend: 'up',                      //......Tendencia subindo
    percentChange: 14.1,              //......Variacao percentual
  },
  {                                   //......Metrica convertidos
    id: '2',                          //......Id da metrica
    title: 'Convertidos',             //......Titulo
    value: 28,                        //......Valor atual
    previousValue: 22,                //......Valor anterior
    format: 'number',                 //......Formato numero
    trend: 'up',                      //......Tendencia subindo
    percentChange: 27.3,              //......Variacao percentual
  },
  {                                   //......Metrica taxa conversao
    id: '3',                          //......Id da metrica
    title: 'Taxa de Conversão',       //......Titulo
    value: 15.7,                      //......Valor atual
    previousValue: 14.1,              //......Valor anterior
    format: 'percentage',             //......Formato percentual
    trend: 'up',                      //......Tendencia subindo
    percentChange: 11.3,              //......Variacao percentual
  },
  {                                   //......Metrica tempo medio
    id: '4',                          //......Id da metrica
    title: 'Tempo Médio',             //......Titulo
    value: 12,                        //......Valor atual
    previousValue: 15,                //......Valor anterior
    format: 'number',                 //......Formato numero
    trend: 'down',                    //......Tendencia descendo
    percentChange: -20.0,             //......Variacao percentual
  },
];

// Periodo padrao
const DEFAULT_PERIOD: DashboardPeriod = {
  label: 'Este mês',                  //......Label do periodo
  startDate: new Date(                //......Data inicio
    new Date().getFullYear(),         //......Ano atual
    new Date().getMonth(),            //......Mes atual
    1                                 //......Dia 1
  ),
  endDate: new Date(),                //......Data fim hoje
};

// Filtros padrao
const DEFAULT_FILTERS: DashboardFilters = {
  period: 'month',                    //......Periodo mes
};

// ========================================
// Contexto
// ========================================

// Criar contexto com valor inicial null
const CommercialContext = createContext<CommercialContextValue | null>(null);

// ========================================
// Provider
// ========================================

// Interface de props do provider
interface CommercialProviderProps {
  children: ReactNode;                //......Elementos filhos
}

// Componente provider do contexto
export const CommercialProvider: React.FC<CommercialProviderProps> = ({
  children,                           //......Elementos filhos
}) => {
  // ========================================
  // Estados
  // ========================================

  // Estado da tab ativa
  const [activeTab, setActiveTab] = useState<CommercialTab>('funil');

  // Estado dos canais
  const [channels] = useState<Channel[]>(MOCK_CHANNELS);

  // Estado do canal selecionado
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Estado das metricas
  const [metrics] = useState<DashboardMetric[]>(MOCK_METRICS);

  // Estado do periodo selecionado
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>(DEFAULT_PERIOD);

  // Estado dos filtros
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Handlers
  // ========================================

  // Handler para selecionar canal
  const selectChannel = useCallback((id: string | null) => {
    setSelectedChannelId(id);         //......Atualizar canal selecionado
  }, []);

  // Handler para mudar periodo
  const setPeriod = useCallback((period: DashboardPeriod) => {
    setSelectedPeriod(period);        //......Atualizar periodo
  }, []);

  // Handler para atualizar dados
  const refreshData = useCallback(async () => {
    setIsLoading(true);               //......Iniciar carregamento
    setError(null);                   //......Limpar erro

    try {
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dados seriam atualizados aqui

    } catch (err) {
      // Definir mensagem de erro
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);            //......Finalizar carregamento
    }
  }, []);

  // Handler para limpar erro
  const clearError = useCallback(() => {
    setError(null);                   //......Limpar erro
  }, []);

  // ========================================
  // Valor do Contexto
  // ========================================

  // Memorizar valor do contexto
  const value = useMemo<CommercialContextValue>(() => ({
    // Estado das tabs
    activeTab,                        //......Tab ativa
    setActiveTab,                     //......Mudar tab

    // Estado dos canais
    channels,                         //......Lista de canais
    selectedChannelId,                //......Canal selecionado
    selectChannel,                    //......Selecionar canal

    // Estado do dashboard
    metrics,                          //......Lista de metricas
    selectedPeriod,                   //......Periodo selecionado
    filters,                          //......Filtros ativos
    setPeriod,                        //......Mudar periodo
    setFilters,                       //......Mudar filtros

    // Estado de carregamento
    isLoading,                        //......Carregando dados
    error,                            //......Erro atual

    // Acoes
    refreshData,                      //......Atualizar dados
    clearError,                       //......Limpar erro
  }), [
    activeTab,                        //......Dependencia tab
    channels,                         //......Dependencia canais
    selectedChannelId,                //......Dependencia canal selecionado
    selectChannel,                    //......Dependencia selecionar
    metrics,                          //......Dependencia metricas
    selectedPeriod,                   //......Dependencia periodo
    filters,                          //......Dependencia filtros
    setPeriod,                        //......Dependencia mudar periodo
    isLoading,                        //......Dependencia carregamento
    error,                            //......Dependencia erro
    refreshData,                      //......Dependencia atualizar
    clearError,                       //......Dependencia limpar erro
  ]);

  // ========================================
  // Render
  // ========================================

  // Retornar provider com children
  return (
    <CommercialContext.Provider value={value}>
      {children}
    </CommercialContext.Provider>
  );
};

// ========================================
// Hook de Uso
// ========================================

// Hook para usar o contexto commercial
export const useCommercial = (): CommercialContextValue => {
  // Obter contexto
  const context = useContext(CommercialContext);

  // Verificar se esta dentro do provider
  if (!context) {
    throw new Error(
      'useCommercial deve ser usado dentro de CommercialProvider'
    );
  }

  // Retornar contexto
  return context;
};

// ========================================
// Export Default
// ========================================

export default CommercialProvider;
