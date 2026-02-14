// ========================================
// Hook: useAIAutomation
// Gerencia automacao, sugestoes, logs e analise preditiva
// ========================================

// Importacoes do React
import { useState, useCallback, useMemo } from 'react'; //......Hooks do React

// Importacao de tipos
import {                                //......Tipos de automacao
  AIFullSettings,                       //......Configuracoes completas
  AISettings,                           //......Configuracoes gerais
  AIAutoReplyRules,                     //......Regras de auto reply
  AINotifications,                      //......Notificacoes
  AISuggestion,                         //......Sugestao da IA
  SuggestionType,                       //......Tipo de sugestao
  ActionType,                           //......Tipo de acao
  AILog,                                //......Log de acao
  AILogActionType,                      //......Tipo de log
  PredictiveAnalysis,                   //......Analise preditiva
  LeadTemperature,                      //......Temperatura do lead
  LeadAIConfig,                         //......Config por lead
  AutomationRule,                       //......Regra de automacao
  AutomationTrigger,                    //......Gatilho de automacao
} from '../types/ai.types';             //......Arquivo de tipos

// ========================================
// Interface: Retorno do Hook
// ========================================

// Interface de retorno do hook
interface UseAIAutomationReturn {
  settings: AIFullSettings;                           //...........Configuracoes
  updateSettings: (newSettings: Partial<AIFullSettings>) => void;
  suggestions: AISuggestion[];                        //...........Lista de sugestoes
  addSuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => void;
  acceptSuggestion: (id: string) => void;             //...........Aceitar sugestao
  rejectSuggestion: (id: string) => void;             //...........Rejeitar sugestao
  editSuggestion: (id: string, message: string) => void;
  logs: AILog[];                                      //...........Lista de logs
  addLog: (log: Omit<AILog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;                              //...........Limpar logs
  analyses: PredictiveAnalysis[];                     //...........Analises
  getAnalysis: (leadId: string) => PredictiveAnalysis | null;
  refreshAnalysis: (leadId: string) => void;          //...........Atualizar analise
  leadConfigs: LeadAIConfig[];                        //...........Config por lead
  updateLeadConfig: (leadId: string, config: Partial<LeadAIConfig>) => void;
  rules: AutomationRule[];                            //...........Regras
  addRule: (rule: Omit<AutomationRule, 'id' | 'createdAt'>) => void;
  toggleRule: (id: string) => void;                   //...........Ativar/desativar
  deleteRule: (id: string) => void;                   //...........Deletar regra
  isProcessing: boolean;                              //...........Se esta processando
  pendingSuggestions: number;                         //...........Sugestoes pendentes
}

// ========================================
// Constantes: Configuracoes Padrao
// ========================================

// Configuracoes padrao da IA
const DEFAULT_SETTINGS: AIFullSettings = {
  settings: {                                 //......Configuracoes gerais
    responseFormat: 'audio',                  //......Formato de resposta
    autoSuggestions: true,                    //......Sugestoes automaticas
    voiceEnabled: true,                       //......Voz habilitada
    voiceSpeed: 1.0,                          //......Velocidade da voz
    voiceName: 'alloy',                       //......Nome da voz
    contextAutoCapture: true,                 //......Captura automatica
    notifyOnSuggestion: true,                 //......Notificar sugestoes
  },
  autoReplyEnabled: false,                    //......Resposta auto desativada
  autoReplyRules: {                           //......Regras de auto reply
    basicQuestionsOnly: true,                 //......Apenas perguntas basicas
    maxMessagesPerDay: 10,                    //......Maximo por dia
    businessHoursOnly: true,                  //......Horario comercial
    requireHumanApproval: true,               //......Requer aprovacao
    blockedTopics: ['preco', 'desconto'],     //......Topicos bloqueados
  },
  notifications: {                            //......Notificacoes
    notifyOnAutoReply: true,                  //......Notificar auto reply
    notifyOnComplexQuestion: true,            //......Notificar complexa
    notifyOnNegativeSentiment: true,          //......Notificar negativo
    notifyOnHumanRequest: true,               //......Notificar humano
  },
};

// ========================================
// Dados Mock: Sugestoes Iniciais
// ========================================

// Sugestoes mock iniciais
const MOCK_SUGGESTIONS: AISuggestion[] = [
  {
    id: 'sug-001',                            //......Identificador
    type: 'action',                           //......Tipo acao
    title: 'Mover lead para Negociacao',      //......Titulo
    description: 'Lead demonstrou interesse. Recomendo mover para fase de negociacao.',
    priority: 5,                              //......Prioridade alta
    actionType: 'move_card',                  //......Mover card
    actionPayload: { phaseId: 'negociacao' }, //......Payload
    confirmed: false,                         //......Nao confirmado
    rejected: false,                          //......Nao rejeitado
    createdAt: new Date(),                    //......Data criacao
  },
  {
    id: 'sug-002',                            //......Identificador
    type: 'message',                          //......Tipo mensagem
    title: 'Enviar follow-up',                //......Titulo
    description: 'Lead sem interacao ha 3 dias. Sugiro enviar mensagem de follow-up.',
    priority: 4,                              //......Prioridade media-alta
    actionType: 'send_message',               //......Enviar mensagem
    actionPayload: { template: 'follow_up' }, //......Payload
    confirmed: false,                         //......Nao confirmado
    rejected: false,                          //......Nao rejeitado
    createdAt: new Date(Date.now() - 3600000),//......1 hora atras
  },
  {
    id: 'sug-003',                            //......Identificador
    type: 'insight',                          //......Tipo insight
    title: 'Alta probabilidade de conversao', //......Titulo
    description: 'Este lead tem 85% de chance de fechar. Priorize o atendimento.',
    priority: 5,                              //......Prioridade alta
    confirmed: false,                         //......Nao confirmado
    rejected: false,                          //......Nao rejeitado
    createdAt: new Date(Date.now() - 7200000),//......2 horas atras
  },
];

// ========================================
// Dados Mock: Logs Iniciais
// ========================================

// Logs mock iniciais
const MOCK_LOGS: AILog[] = [
  {
    id: 'log-001',                            //......Identificador
    actionType: 'suggestion_sent',            //......Sugestao enviada
    leadId: 'lead-001',                       //......Lead associado
    leadName: 'Maria Silva',                  //......Nome do lead
    description: 'Sugestao de follow-up enviada',
    wasAutomatic: true,                       //......Foi automatico
    timestamp: new Date(),                    //......Data e hora
  },
  {
    id: 'log-002',                            //......Identificador
    actionType: 'lead_analyzed',              //......Lead analisado
    leadId: 'lead-002',                       //......Lead associado
    leadName: 'Joao Pereira',                 //......Nome do lead
    description: 'Analise preditiva atualizada',
    wasAutomatic: true,                       //......Foi automatico
    timestamp: new Date(Date.now() - 1800000),//......30 min atras
  },
  {
    id: 'log-003',                            //......Identificador
    actionType: 'auto_reply',                 //......Resposta automatica
    leadId: 'lead-003',                       //......Lead associado
    leadName: 'Ana Costa',                    //......Nome do lead
    description: 'Respondido pergunta sobre horario de funcionamento',
    wasAutomatic: true,                       //......Foi automatico
    timestamp: new Date(Date.now() - 3600000),//......1 hora atras
  },
  {
    id: 'log-004',                            //......Identificador
    actionType: 'suggestion_accepted',        //......Sugestao aceita
    leadId: 'lead-001',                       //......Lead associado
    leadName: 'Maria Silva',                  //......Nome do lead
    description: 'Usuario aceitou sugestao de mover para negociacao',
    wasAutomatic: false,                      //......Manual
    userId: 'user-001',                       //......Usuario
    timestamp: new Date(Date.now() - 5400000),//......1.5 horas atras
  },
];

// ========================================
// Dados Mock: Analises Preditivas
// ========================================

// Analises mock iniciais
const MOCK_ANALYSES: PredictiveAnalysis[] = [
  {
    leadId: 'lead-001',                       //......Id do lead
    conversionProbability: 85,                //......85% chance
    temperature: 'hot',                       //......Lead quente
    riskLevel: 'low',                         //......Risco baixo
    suggestedActions: [                       //......Acoes sugeridas
      'Agendar reuniao de fechamento',
      'Enviar proposta comercial',
    ],
    insights: [                               //......Insights
      'Lead engajado nas ultimas 24h',
      'Demonstrou interesse em premium',
    ],
    factorsPositive: [                        //......Fatores positivos
      'Responde rapidamente',
      'Orcamento compativel',
      'Necessidade urgente',
    ],
    factorsNegative: [                        //......Fatores negativos
      'Ja avaliou concorrente',
    ],
    lastAnalyzed: new Date(),                 //......Ultima analise
  },
  {
    leadId: 'lead-002',                       //......Id do lead
    conversionProbability: 45,                //......45% chance
    temperature: 'warm',                      //......Lead morno
    riskLevel: 'medium',                      //......Risco medio
    suggestedActions: [                       //......Acoes sugeridas
      'Enviar material educativo',
      'Fazer follow-up em 2 dias',
    ],
    insights: [                               //......Insights
      'Lead em fase de avaliacao',
      'Pode precisar de mais informacoes',
    ],
    factorsPositive: [                        //......Fatores positivos
      'Perfil de cliente ideal',
      'Interesse demonstrado',
    ],
    factorsNegative: [                        //......Fatores negativos
      'Resposta lenta',
      'Ainda comparando opcoes',
    ],
    lastAnalyzed: new Date(Date.now() - 86400000),
  },
];

// ========================================
// Dados Mock: Regras de Automacao
// ========================================

// Regras mock iniciais
const MOCK_RULES: AutomationRule[] = [
  {
    id: 'rule-001',                           //......Identificador
    name: 'Follow-up automatico',             //......Nome da regra
    description: 'Sugere follow-up quando lead fica inativo por 3 dias',
    trigger: 'lead_inactive',                 //......Gatilho
    conditions: [                             //......Condicoes
      { field: 'daysInactive', operator: 'greater', value: 3 },
    ],
    actions: [                                //......Acoes
      { type: 'send_message', params: { template: 'follow_up' } },
    ],
    isActive: true,                           //......Ativa
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: 'rule-002',                           //......Identificador
    name: 'Alerta lead quente',               //......Nome da regra
    description: 'Notifica quando lead atinge temperatura quente',
    trigger: 'value_threshold',               //......Gatilho
    conditions: [                             //......Condicoes
      { field: 'temperature', operator: 'equals', value: 'hot' },
    ],
    actions: [                                //......Acoes
      { type: 'follow_up', params: { notify: true } },
    ],
    isActive: true,                           //......Ativa
    createdAt: new Date(Date.now() - 259200000),
  },
];

// ========================================
// Hook Principal: useAIAutomation
// ========================================

// Hook de automacao da IA
export const useAIAutomation = (): UseAIAutomationReturn => {
  // ========================================
  // Estados do Hook
  // ========================================

  // Estado das configuracoes
  const [settings, setSettings] = useState<AIFullSettings>(DEFAULT_SETTINGS);

  // Estado das sugestoes
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(MOCK_SUGGESTIONS);

  // Estado dos logs
  const [logs, setLogs] = useState<AILog[]>(MOCK_LOGS);

  // Estado das analises
  const [analyses, setAnalyses] = useState<PredictiveAnalysis[]>(MOCK_ANALYSES);

  // Estado das configs por lead
  const [leadConfigs, setLeadConfigs] = useState<LeadAIConfig[]>([]);

  // Estado das regras
  const [rules, setRules] = useState<AutomationRule[]>(MOCK_RULES);

  // Estado de processamento
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // ========================================
  // Funcoes: Configuracoes
  // ========================================

  // Atualiza configuracoes
  const updateSettings = useCallback((newSettings: Partial<AIFullSettings>) => {
    setSettings((prev) => ({              //......Atualiza estado
      ...prev,                            //......Mantem anteriores
      ...newSettings,                     //......Aplica novos
      settings: {                         //......Merge settings
        ...prev.settings,                 //......Settings anteriores
        ...(newSettings.settings || {}),  //......Novos settings
      },
      autoReplyRules: {                   //......Merge rules
        ...prev.autoReplyRules,           //......Rules anteriores
        ...(newSettings.autoReplyRules || {}),
      },
      notifications: {                    //......Merge notifications
        ...prev.notifications,            //......Notifications anteriores
        ...(newSettings.notifications || {}),
      },
    }));
  }, []);

  // ========================================
  // Funcoes: Sugestoes
  // ========================================

  // Adiciona nova sugestao
  const addSuggestion = useCallback((
    suggestion: Omit<AISuggestion, 'id' | 'createdAt'>
  ) => {
    const newSuggestion: AISuggestion = {   //......Nova sugestao
      ...suggestion,                        //......Dados recebidos
      id: `sug-${Date.now()}`,              //......Gera id unico
      createdAt: new Date(),                //......Data atual
    };
    setSuggestions((prev) => [newSuggestion, ...prev]);
  }, []);

  // Aceita sugestao
  const acceptSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>                //......Atualiza lista
      prev.map((s) =>                       //......Mapeia sugestoes
        s.id === id                         //......Se for a sugestao
          ? { ...s, confirmed: true }       //......Marca confirmada
          : s                               //......Mantem igual
      )
    );
    // Adiciona log da acao
    const suggestion = suggestions.find((s) => s.id === id);
    if (suggestion) {                       //......Se encontrou
      addLog({                              //......Adiciona log
        actionType: 'suggestion_accepted',  //......Tipo
        description: `Sugestao aceita: ${suggestion.title}`,
        wasAutomatic: false,                //......Manual
      });
    }
  }, [suggestions]);

  // Rejeita sugestao
  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>                //......Atualiza lista
      prev.map((s) =>                       //......Mapeia sugestoes
        s.id === id                         //......Se for a sugestao
          ? { ...s, rejected: true }        //......Marca rejeitada
          : s                               //......Mantem igual
      )
    );
    // Adiciona log da acao
    const suggestion = suggestions.find((s) => s.id === id);
    if (suggestion) {                       //......Se encontrou
      addLog({                              //......Adiciona log
        actionType: 'suggestion_rejected',  //......Tipo
        description: `Sugestao rejeitada: ${suggestion.title}`,
        wasAutomatic: false,                //......Manual
      });
    }
  }, [suggestions]);

  // Edita sugestao (mensagem)
  const editSuggestion = useCallback((id: string, message: string) => {
    setSuggestions((prev) =>                //......Atualiza lista
      prev.map((s) =>                       //......Mapeia sugestoes
        s.id === id                         //......Se for a sugestao
          ? {                               //......Atualiza sugestao
              ...s,                         //......Mantem dados
              description: message,         //......Nova descricao
              actionPayload: {              //......Atualiza payload
                ...s.actionPayload,         //......Payload anterior
                editedMessage: message,     //......Mensagem editada
              },
            }
          : s                               //......Mantem igual
      )
    );
  }, []);

  // ========================================
  // Funcoes: Logs
  // ========================================

  // Adiciona novo log
  const addLog = useCallback((log: Omit<AILog, 'id' | 'timestamp'>) => {
    const newLog: AILog = {                 //......Novo log
      ...log,                               //......Dados recebidos
      id: `log-${Date.now()}`,              //......Gera id unico
      timestamp: new Date(),                //......Data atual
    };
    setLogs((prev) => [newLog, ...prev]);   //......Adiciona no inicio
  }, []);

  // Limpa todos os logs
  const clearLogs = useCallback(() => {
    setLogs([]);                            //......Limpa array
  }, []);

  // ========================================
  // Funcoes: Analises Preditivas
  // ========================================

  // Busca analise de um lead
  const getAnalysis = useCallback((leadId: string): PredictiveAnalysis | null => {
    return analyses.find((a) => a.leadId === leadId) || null;
  }, [analyses]);

  // Atualiza analise de um lead (mock)
  const refreshAnalysis = useCallback((leadId: string) => {
    setIsProcessing(true);                  //......Inicia processamento
    // Simula chamada de API
    setTimeout(() => {                      //......Timeout simulado
      setAnalyses((prev) => {               //......Atualiza analises
        const existing = prev.find((a) => a.leadId === leadId);
        if (existing) {                     //......Se existe
          return prev.map((a) =>            //......Atualiza
            a.leadId === leadId
              ? { ...a, lastAnalyzed: new Date() }
              : a
          );
        }
        // Cria nova analise mock
        const newAnalysis: PredictiveAnalysis = {
          leadId,                           //......Id do lead
          conversionProbability: Math.floor(Math.random() * 100),
          temperature: ['hot', 'warm', 'cold', 'frozen'][
            Math.floor(Math.random() * 4)
          ] as LeadTemperature,
          riskLevel: ['low', 'medium', 'high'][
            Math.floor(Math.random() * 3)
          ] as 'low' | 'medium' | 'high',
          suggestedActions: ['Fazer follow-up', 'Enviar proposta'],
          insights: ['Lead em avaliacao'],  //......Insights
          factorsPositive: ['Interesse demonstrado'],
          factorsNegative: ['Resposta lenta'],
          lastAnalyzed: new Date(),         //......Data atual
        };
        return [...prev, newAnalysis];      //......Adiciona nova
      });
      // Adiciona log
      addLog({                              //......Log da acao
        actionType: 'lead_analyzed',        //......Tipo
        leadId,                             //......Lead
        description: 'Analise preditiva atualizada',
        wasAutomatic: true,                 //......Automatico
      });
      setIsProcessing(false);               //......Finaliza
    }, 1500);                               //......1.5 segundos
  }, [addLog]);

  // ========================================
  // Funcoes: Configuracoes por Lead
  // ========================================

  // Atualiza config de um lead
  const updateLeadConfig = useCallback((
    leadId: string,
    config: Partial<LeadAIConfig>
  ) => {
    setLeadConfigs((prev) => {              //......Atualiza lista
      const existing = prev.find((c) => c.leadId === leadId);
      if (existing) {                       //......Se existe
        return prev.map((c) =>              //......Atualiza
          c.leadId === leadId
            ? { ...c, ...config }           //......Merge config
            : c
        );
      }
      // Cria nova config
      const newConfig: LeadAIConfig = {
        leadId,                             //......Id do lead
        aiEnabled: true,                    //......IA habilitada
        autoReplyEnabled: false,            //......Auto reply desativado
        priority: 'normal',                 //......Prioridade normal
        blockedActions: [],                 //......Sem acoes bloqueadas
        notifyOnActivity: true,             //......Notificar atividade
        ...config,                          //......Override com config
      };
      return [...prev, newConfig];          //......Adiciona nova
    });
  }, []);

  // ========================================
  // Funcoes: Regras de Automacao
  // ========================================

  // Adiciona nova regra
  const addRule = useCallback((
    rule: Omit<AutomationRule, 'id' | 'createdAt'>
  ) => {
    const newRule: AutomationRule = {       //......Nova regra
      ...rule,                              //......Dados recebidos
      id: `rule-${Date.now()}`,             //......Gera id unico
      createdAt: new Date(),                //......Data atual
    };
    setRules((prev) => [...prev, newRule]); //......Adiciona
  }, []);

  // Ativa/desativa regra
  const toggleRule = useCallback((id: string) => {
    setRules((prev) =>                      //......Atualiza lista
      prev.map((r) =>                       //......Mapeia regras
        r.id === id                         //......Se for a regra
          ? { ...r, isActive: !r.isActive } //......Inverte estado
          : r                               //......Mantem igual
      )
    );
  }, []);

  // Deleta regra
  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ========================================
  // Valores Computados
  // ========================================

  // Conta sugestoes pendentes
  const pendingSuggestions = useMemo(() => {
    return suggestions.filter(             //......Filtra sugestoes
      (s) => !s.confirmed && !s.rejected   //......Nao confirmadas/rejeitadas
    ).length;
  }, [suggestions]);

  // ========================================
  // Retorno do Hook
  // ========================================

  // Retorna funcoes e estados
  return {
    settings,                               //......Configuracoes
    updateSettings,                         //......Atualizar config
    suggestions,                            //......Lista de sugestoes
    addSuggestion,                          //......Adicionar sugestao
    acceptSuggestion,                       //......Aceitar sugestao
    rejectSuggestion,                       //......Rejeitar sugestao
    editSuggestion,                         //......Editar sugestao
    logs,                                   //......Lista de logs
    addLog,                                 //......Adicionar log
    clearLogs,                              //......Limpar logs
    analyses,                               //......Lista de analises
    getAnalysis,                            //......Buscar analise
    refreshAnalysis,                        //......Atualizar analise
    leadConfigs,                            //......Configs por lead
    updateLeadConfig,                       //......Atualizar config lead
    rules,                                  //......Lista de regras
    addRule,                                //......Adicionar regra
    toggleRule,                             //......Ativar/desativar
    deleteRule,                             //......Deletar regra
    isProcessing,                           //......Estado processamento
    pendingSuggestions,                     //......Pendentes
  };
};

// ========================================
// Export Padrao
// ========================================

// Export do hook
export default useAIAutomation;             //......Export padrao
