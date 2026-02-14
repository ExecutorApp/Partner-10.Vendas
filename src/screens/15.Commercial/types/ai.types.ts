// ========================================
// Tipos do Modulo IA Assistente
// Mensagens, Contexto e Configuracoes
// ========================================

// ========================================
// Tipos: Mensagens da IA
// ========================================

// Tipo de papel na conversa
export type MessageRole =
  | 'user'            //.......................Mensagem do usuario
  | 'assistant'       //.......................Mensagem da IA
  | 'system';         //.......................Mensagem do sistema

// Tipo de formato de resposta
export type ResponseFormat =
  | 'audio'           //.......................Resposta em audio
  | 'text';           //.......................Resposta em texto

// Interface de mensagem da IA
export interface AIMessage {
  id: string;                         //......Identificador unico
  role: MessageRole;                  //......Papel na conversa
  content: string;                    //......Conteudo da mensagem
  audioUri?: string;                  //......Uri do audio TTS
  timestamp: Date;                    //......Data e hora
  confirmed: boolean;                 //......Se foi confirmada
  isFromAI: boolean;                  //......Se veio da IA
}

// ========================================
// Tipos: Contexto Manual
// ========================================

// Tipo de entrada de contexto manual
export type ManualContextType =
  | 'text'            //.......................Texto digitado
  | 'file'            //.......................Arquivo enviado
  | 'audio';          //.......................Audio gravado

// Interface de contexto manual
export interface ManualContext {
  id: string;                         //......Identificador unico
  leadId: string;                     //......Id do lead associado
  type: ManualContextType;            //......Tipo de entrada
  content: string;                    //......Conteudo original
  transcription?: string;             //......Transcricao do audio
  aiSummary: string;                  //......Resumo da IA
  audioSummaryUri?: string;           //......Audio do resumo
  confirmed: boolean;                 //......Se foi confirmado
  createdAt: Date;                    //......Data de criacao
  createdBy: string;                  //......Criado por
}

// ========================================
// Tipos: Sugestoes da IA
// ========================================

// Tipo de sugestao
export type SuggestionType =
  | 'action'          //.......................Acao sugerida
  | 'message'         //.......................Mensagem sugerida
  | 'insight';        //.......................Insight sobre o lead

// Tipo de acao sugerida
export type ActionType =
  | 'move_card'       //.......................Mover card no Kanban
  | 'send_message'    //.......................Enviar mensagem
  | 'schedule'        //.......................Agendar compromisso
  | 'call'            //.......................Fazer ligacao
  | 'email'           //.......................Enviar email
  | 'follow_up';      //.......................Fazer follow-up

// Interface de sugestao da IA
export interface AISuggestion {
  id: string;                         //......Identificador unico
  type: SuggestionType;               //......Tipo de sugestao
  title: string;                      //......Titulo da sugestao
  description: string;                //......Descricao detalhada
  audioUri?: string;                  //......Audio da sugestao
  actionType?: ActionType;            //......Tipo de acao
  actionPayload?: Record<string, unknown>; //..Dados da acao
  priority: number;                   //......Prioridade 1-5
  confirmed: boolean;                 //......Se foi confirmada
  rejected: boolean;                  //......Se foi rejeitada
  createdAt: Date;                    //......Data de criacao
}

// ========================================
// Tipos: Configuracoes da IA
// ========================================

// Interface de configuracoes da IA
export interface AISettings {
  responseFormat: ResponseFormat;     //......Formato de resposta
  autoSuggestions: boolean;           //......Sugestoes automaticas
  voiceEnabled: boolean;              //......Voz habilitada
  voiceSpeed: number;                 //......Velocidade da voz 0.5-2.0
  voiceName: string;                  //......Nome da voz TTS
  contextAutoCapture: boolean;        //......Captura automatica
  notifyOnSuggestion: boolean;        //......Notificar sugestoes
}

// Interface de regras de automacao
export interface AIAutoReplyRules {
  basicQuestionsOnly: boolean;        //......Apenas perguntas basicas
  maxMessagesPerDay: number;          //......Maximo mensagens por dia
  businessHoursOnly: boolean;         //......Apenas horario comercial
  requireHumanApproval: boolean;      //......Requer aprovacao humana
  blockedTopics: string[];            //......Topicos bloqueados
}

// Interface de notificacoes da IA
export interface AINotifications {
  notifyOnAutoReply: boolean;         //......Notificar resposta auto
  notifyOnComplexQuestion: boolean;   //......Notificar pergunta complexa
  notifyOnNegativeSentiment: boolean; //......Notificar sentimento negativo
  notifyOnHumanRequest: boolean;      //......Notificar pedido de humano
}

// Interface completa de configuracoes
export interface AIFullSettings {
  settings: AISettings;               //......Configuracoes gerais
  autoReplyEnabled: boolean;          //......Resposta automatica ativa
  autoReplyRules: AIAutoReplyRules;   //......Regras de automacao
  notifications: AINotifications;     //......Configuracoes de notificacao
}

// ========================================
// Tipos: Contexto do Lead para IA
// ========================================

// Interface de contexto do lead
export interface LeadContext {
  leadId: string;                     //......Id do lead
  leadName: string;                   //......Nome do lead
  leadPhoto?: string;                 //......Foto do lead
  phase: string;                      //......Fase atual
  column: string;                     //......Coluna atual
  status: string;                     //......Status do lead
  value: number;                      //......Valor estimado
  lastInteraction: Date;              //......Ultima interacao
  daysSinceLastInteraction: number;   //......Dias sem interacao
  channelEntry: {                     //......Dados do canal
    type: string;                     //......Tipo do canal
    platform?: string;                //......Plataforma
    date: Date;                       //......Data de entrada
  };
  notes: string[];                    //......Anotacoes
  tags: string[];                     //......Tags
  history: {                          //......Historico resumido
    totalMoves: number;               //......Total de movimentacoes
    daysInFunnel: number;             //......Dias no funil
  };
}

// ========================================
// Tipos: Respostas da API
// ========================================

// Interface de resposta do chat
export interface AIChatResponse {
  message: AIMessage;                 //......Mensagem de resposta
  suggestions?: AISuggestion[];       //......Sugestoes geradas
  audioUri?: string;                  //......Uri do audio TTS
  tokensUsed: number;                 //......Tokens consumidos
}

// Interface de resposta de contexto
export interface AIContextResponse {
  contextId: string;                  //......Id do contexto criado
  summary: string;                    //......Resumo da IA
  audioUri?: string;                  //......Audio do resumo
  requiresConfirmation: boolean;      //......Requer confirmacao
}

// Interface de resposta de confirmacao
export interface AIConfirmResponse {
  saved: boolean;                     //......Se foi salvo
  message: string;                    //......Mensagem de retorno
}

// Interface de resposta de transcricao
export interface AITranscribeResponse {
  text: string;                       //......Texto transcrito
  duration: number;                   //......Duracao do audio
  language: string;                   //......Idioma detectado
}

// ========================================
// Tipos: Estado do Modal
// ========================================

// Tipo de estado do modal
export type ModalState =
  | 'closed'          //.......................Modal fechado
  | 'suggestion'      //.......................Mostrando sugestao
  | 'context'         //.......................Entrada de contexto
  | 'settings';       //.......................Configuracoes

// Interface de estado do modal
export interface AIModalState {
  state: ModalState;                  //......Estado atual
  suggestion?: AISuggestion;          //......Sugestao ativa
  isEditing: boolean;                 //......Editando mensagem
  editedMessage: string;              //......Mensagem editada
}

// ========================================
// Tipos: Player de Audio
// ========================================

// Tipo de estado do player
export type PlayerState =
  | 'idle'            //.......................Parado
  | 'loading'         //.......................Carregando
  | 'playing'         //.......................Tocando
  | 'paused'          //.......................Pausado
  | 'error';          //.......................Erro

// Interface de estado do player
export interface AudioPlayerState {
  state: PlayerState;                 //......Estado atual
  currentUri?: string;                //......Uri do audio atual
  duration: number;                   //......Duracao total
  position: number;                   //......Posicao atual
  progress: number;                   //......Progresso 0-1
}

// ========================================
// Tipos: Logs de Automacao da IA
// ========================================

// Tipo de acao de log
export type AILogActionType =
  | 'auto_reply'        //.......................Resposta automatica
  | 'suggestion_sent'   //.......................Sugestao enviada
  | 'suggestion_accepted' //.....................Sugestao aceita
  | 'suggestion_rejected' //.....................Sugestao rejeitada
  | 'context_captured'  //.......................Contexto capturado
  | 'lead_analyzed'     //.......................Lead analisado
  | 'alert_triggered'   //.......................Alerta disparado
  | 'status_changed';   //.......................Status alterado

// Interface de log da IA
export interface AILog {
  id: string;                         //......Identificador unico
  actionType: AILogActionType;        //......Tipo de acao
  leadId?: string;                    //......Id do lead
  leadName?: string;                  //......Nome do lead
  description: string;                //......Descricao da acao
  details?: Record<string, unknown>;  //......Detalhes adicionais
  wasAutomatic: boolean;              //......Se foi automatico
  timestamp: Date;                    //......Data e hora
  userId?: string;                    //......Usuario que executou
}

// ========================================
// Tipos: Analise Preditiva
// ========================================

// Tipo de temperatura do lead
export type LeadTemperature =
  | 'hot'               //.......................Lead quente
  | 'warm'              //.......................Lead morno
  | 'cold'              //.......................Lead frio
  | 'frozen';           //.......................Lead congelado

// Interface de analise preditiva
export interface PredictiveAnalysis {
  leadId: string;                     //......Id do lead
  conversionProbability: number;      //......Probabilidade 0-100
  temperature: LeadTemperature;       //......Temperatura do lead
  riskLevel: 'low' | 'medium' | 'high'; //....Nivel de risco
  suggestedActions: string[];         //......Acoes sugeridas
  insights: string[];                 //......Insights
  factorsPositive: string[];          //......Fatores positivos
  factorsNegative: string[];          //......Fatores negativos
  lastAnalyzed: Date;                 //......Ultima analise
}

// ========================================
// Tipos: Configuracoes por Lead
// ========================================

// Interface de config por lead
export interface LeadAIConfig {
  leadId: string;                     //......Id do lead
  aiEnabled: boolean;                 //......IA habilitada
  autoReplyEnabled: boolean;          //......Resposta auto habilitada
  priority: 'high' | 'normal' | 'low'; //....Prioridade
  customInstructions?: string;        //......Instrucoes customizadas
  blockedActions: ActionType[];       //......Acoes bloqueadas
  notifyOnActivity: boolean;          //......Notificar atividade
}

// ========================================
// Tipos: Regras de Automacao
// ========================================

// Interface de regra de automacao
export interface AutomationRule {
  id: string;                         //......Identificador unico
  name: string;                       //......Nome da regra
  description: string;                //......Descricao
  trigger: AutomationTrigger;         //......Gatilho
  conditions: AutomationCondition[];  //......Condicoes
  actions: AutomationAction[];        //......Acoes
  isActive: boolean;                  //......Se esta ativa
  createdAt: Date;                    //......Data de criacao
}

// Tipo de gatilho
export type AutomationTrigger =
  | 'lead_inactive'     //.......................Lead inativo
  | 'new_message'       //.......................Nova mensagem
  | 'phase_changed'     //.......................Fase alterada
  | 'time_based'        //.......................Baseado em tempo
  | 'value_threshold';  //.......................Limite de valor

// Interface de condicao
export interface AutomationCondition {
  field: string;                      //......Campo a verificar
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: string | number;             //......Valor esperado
}

// Interface de acao de automacao
export interface AutomationAction {
  type: ActionType;                   //......Tipo de acao
  params: Record<string, unknown>;    //......Parametros
}
