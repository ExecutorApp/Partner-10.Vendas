// ========================================
// Hook useChannelData
// Gerencia dados dos canais de entrada
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
// Imports de Tipos
// ========================================
import {
  ChannelEntry,                       //......Tipo entrada canal
  ChannelType,                        //......Tipo de canal
  Channel,                            //......Tipo canal listagem
  PeriodFilter,                       //......Tipo periodo
} from '../types/commercial.types';

// ========================================
// Imports de Filtros
// ========================================
import { ChannelFiltersState } from '../components/channel/06.03.ChannelFilters';

// ========================================
// Interface de Retorno
// ========================================
export interface UseChannelDataReturn {
  entries: ChannelEntry[];            //......Lista de entradas
  filteredEntries: ChannelEntry[];    //......Entradas filtradas
  channels: Channel[];                //......Canais agrupados
  leadNames: Record<string, string>;  //......Mapa de nomes
  filters: ChannelFiltersState;       //......Filtros atuais
  setFilters: (filters: ChannelFiltersState) => void;
  addEntry: (entry: Omit<ChannelEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, data: Partial<ChannelEntry>) => void;
  deleteEntry: (id: string) => void;  //......Deletar entrada
  refresh: () => void;                //......Atualizar dados
  isLoading: boolean;                 //......Carregando
  error: string | null;               //......Erro
}

// ========================================
// Dados Mock
// ========================================
const MOCK_ENTRIES: ChannelEntry[] = [
  {
    id: 'entry-1',                    //......Id unico
    leadId: 'lead-1',                 //......Id do lead
    channelType: 'social_media',      //......Tipo do canal
    channelDetails: {
      platform: 'instagram',          //......Plataforma
      utmSource: 'instagram',         //......UTM source
      utmCampaign: 'lancamento_2025', //......UTM campaign
    },
    entryDate: new Date('2025-01-28'), //....Data entrada
    entryTime: '14:35',               //......Hora entrada
    firstInteraction: 'Comentou no post de lancamento',
    device: 'iPhone 14',              //......Dispositivo
    createdAt: new Date('2025-01-28'), //....Data criacao
    createdBy: 'system',              //......Criado por
  },
  {
    id: 'entry-2',                    //......Id unico
    leadId: 'lead-2',                 //......Id do lead
    channelType: 'landing_page',      //......Tipo do canal
    channelDetails: {
      landingPageName: 'Apartamento Vila Nova',
      utmSource: 'google',            //......UTM source
      utmMedium: 'cpc',               //......UTM medium
      utmCampaign: 'vila_nova_jan25', //......UTM campaign
    },
    entryDate: new Date('2025-01-27'), //....Data entrada
    entryTime: '10:20',               //......Hora entrada
    firstInteraction: 'Preencheu formulario de interesse',
    device: 'Desktop Windows',        //......Dispositivo
    ipAddress: '189.45.xxx.xxx',      //......IP mascarado
    createdAt: new Date('2025-01-27'), //....Data criacao
    createdBy: 'system',              //......Criado por
  },
  {
    id: 'entry-3',                    //......Id unico
    leadId: 'lead-3',                 //......Id do lead
    channelType: 'referral',          //......Tipo do canal
    channelDetails: {
      referralSource: 'Cliente: Maria Silva',
    },
    entryDate: new Date('2025-01-26'), //....Data entrada
    entryTime: '16:45',               //......Hora entrada
    firstInteraction: 'Indicado pela cliente Maria Silva',
    createdAt: new Date('2025-01-26'), //....Data criacao
    createdBy: 'corretor-1',          //......Criado por
  },
  {
    id: 'entry-4',                    //......Id unico
    leadId: 'lead-4',                 //......Id do lead
    channelType: 'social_media',      //......Tipo do canal
    channelDetails: {
      platform: 'facebook',           //......Plataforma
      utmSource: 'facebook',          //......UTM source
      utmCampaign: 'remarketing',     //......UTM campaign
    },
    entryDate: new Date('2025-01-25'), //....Data entrada
    entryTime: '09:15',               //......Hora entrada
    firstInteraction: 'Clicou em anuncio de remarketing',
    device: 'Samsung Galaxy S23',     //......Dispositivo
    createdAt: new Date('2025-01-25'), //....Data criacao
    createdBy: 'system',              //......Criado por
  },
  {
    id: 'entry-5',                    //......Id unico
    leadId: 'lead-5',                 //......Id do lead
    channelType: 'direct',            //......Tipo do canal
    channelDetails: {},               //......Sem detalhes
    entryDate: new Date('2025-01-24'), //....Data entrada
    entryTime: '11:30',               //......Hora entrada
    firstInteraction: 'Ligou para o escritorio',
    createdAt: new Date('2025-01-24'), //....Data criacao
    createdBy: 'recepcionista',       //......Criado por
  },
];

// ========================================
// Mapa de Nomes Mock
// ========================================
const MOCK_LEAD_NAMES: Record<string, string> = {
  'lead-1': 'Joao Pedro Oliveira',    //......Nome lead 1
  'lead-2': 'Carla Mendes',           //......Nome lead 2
  'lead-3': 'Roberto Santos',         //......Nome lead 3
  'lead-4': 'Ana Paula Costa',        //......Nome lead 4
  'lead-5': 'Fernando Lima',          //......Nome lead 5
};

// ========================================
// Filtros Padrao
// ========================================
const DEFAULT_FILTERS: ChannelFiltersState = {
  searchText: '',                     //......Sem busca
  channelType: null,                  //......Todos os tipos
  period: 'month',                    //......Ultimo mes
};

// ========================================
// Hook useChannelData
// ========================================
export const useChannelData = (): UseChannelDataReturn => {
  // ========================================
  // Estados
  // ========================================
  const [entries, setEntries] = useState<ChannelEntry[]>(MOCK_ENTRIES);
  const [filters, setFilters] = useState<ChannelFiltersState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // Mapa de Nomes
  // ========================================
  const leadNames = useMemo(() => MOCK_LEAD_NAMES, []);

  // ========================================
  // Filtrar por Periodo
  // ========================================
  const filterByPeriod = useCallback((
    allEntries: ChannelEntry[],       //......Todas entradas
    period: PeriodFilter,             //......Periodo
  ): ChannelEntry[] => {
    const now = new Date();           //......Data atual
    let startDate: Date;              //......Data inicial

    switch (period) {
      case 'today':                   //......Hoje
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':                    //......Esta semana
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':                   //......Este mes
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':                 //......Este trimestre
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':                    //......Este ano
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:                        //......Padrao: todos
        return allEntries;
    }

    return allEntries.filter(entry => {
      const entryDate = new Date(entry.entryDate);
      return entryDate >= startDate && entryDate <= now;
    });
  }, []);

  // ========================================
  // Entradas Filtradas
  // ========================================
  const filteredEntries = useMemo(() => {
    let result = [...entries];        //......Copiar array

    // Filtrar por tipo de canal
    if (filters.channelType) {
      result = result.filter(e => e.channelType === filters.channelType);
    }

    // Filtrar por periodo
    result = filterByPeriod(result, filters.period);

    // Filtrar por busca
    if (filters.searchText.trim()) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(entry => {
        const leadName = leadNames[entry.leadId]?.toLowerCase() || '';
        const channelName = entry.channelType.toLowerCase();
        const platform = entry.channelDetails.platform?.toLowerCase() || '';
        return (
          leadName.includes(search) ||
          channelName.includes(search) ||
          platform.includes(search)
        );
      });
    }

    // Ordenar por data (mais recente primeiro)
    result.sort((a, b) =>
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );

    return result;
  }, [entries, filters, leadNames, filterByPeriod]);

  // ========================================
  // Canais Agrupados
  // ========================================
  const channels = useMemo((): Channel[] => {
    const channelMap = new Map<ChannelType, Channel>();

    // Definir canais base
    const baseChannels: Record<ChannelType, Omit<Channel, 'leadsCount' | 'conversionRate'>> = {
      social_media: { id: 'social_media', type: 'social_media', name: 'Redes Sociais', icon: 'share', color: '#E4405F' },
      landing_page: { id: 'landing_page', type: 'landing_page', name: 'Landing Pages', icon: 'web', color: '#22C55E' },
      referral: { id: 'referral', type: 'referral', name: 'Indicacoes', icon: 'people', color: '#F59E0B' },
      direct: { id: 'direct', type: 'direct', name: 'Contato Direto', icon: 'phone', color: '#1777CF' },
      other: { id: 'other', type: 'other', name: 'Outros', icon: 'more', color: '#7D8592' },
    };

    // Contar leads por canal
    entries.forEach(entry => {
      const base = baseChannels[entry.channelType];
      if (!channelMap.has(entry.channelType)) {
        channelMap.set(entry.channelType, {
          ...base,
          leadsCount: 0,              //......Contador inicial
          conversionRate: 0,          //......Taxa inicial
        });
      }
      const channel = channelMap.get(entry.channelType)!;
      channel.leadsCount += 1;        //......Incrementar
    });

    // Calcular taxa de conversao (mock: 15-30%)
    channelMap.forEach(channel => {
      channel.conversionRate = 15 + Math.random() * 15;
    });

    return Array.from(channelMap.values());
  }, [entries]);

  // ========================================
  // Adicionar Entrada
  // ========================================
  const addEntry = useCallback((
    data: Omit<ChannelEntry, 'id' | 'createdAt'>
  ) => {
    const newEntry: ChannelEntry = {
      ...data,
      id: `entry-${Date.now()}`,      //......Id unico
      createdAt: new Date(),          //......Data criacao
    };
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  // ========================================
  // Atualizar Entrada
  // ========================================
  const updateEntry = useCallback((
    id: string,                       //......Id da entrada
    data: Partial<ChannelEntry>       //......Dados parciais
  ) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, ...data } : entry
      )
    );
  }, []);

  // ========================================
  // Deletar Entrada
  // ========================================
  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  // ========================================
  // Atualizar Dados
  // ========================================
  const refresh = useCallback(() => {
    setIsLoading(true);               //......Iniciar loading
    // Simular refresh
    setTimeout(() => {
      setIsLoading(false);            //......Parar loading
    }, 500);
  }, []);

  // ========================================
  // Retorno do Hook
  // ========================================
  return {
    entries,                          //......Lista de entradas
    filteredEntries,                  //......Entradas filtradas
    channels,                         //......Canais agrupados
    leadNames,                        //......Mapa de nomes
    filters,                          //......Filtros atuais
    setFilters,                       //......Atualizar filtros
    addEntry,                         //......Adicionar entrada
    updateEntry,                      //......Atualizar entrada
    deleteEntry,                      //......Deletar entrada
    refresh,                          //......Atualizar dados
    isLoading,                        //......Carregando
    error,                            //......Erro
  };
};

// ========================================
// Export Default
// ========================================
export default useChannelData;
