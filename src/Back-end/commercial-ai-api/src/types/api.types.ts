// ========================================
// Tipos da API de IA
// ========================================

// ========================================
// Tipos de Request
// ========================================

// Mensagem do chat
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Contexto do lead
export interface LeadContextRequest {
  leadId: string;
  name: string;
  phase: string;
  column: string;
  lastInteraction: string;
  channelEntry?: {
    type: string;
    platform?: string;
    date: string;
  };
}

// Request do chat
export interface ChatRequest {
  messages: ChatMessage[];
  leadContext?: LeadContextRequest;
  manualContext?: string;
}

// Request de contexto manual
export interface ManualContextRequest {
  type: 'text' | 'file' | 'audio';
  content: string;
  leadId: string;
}

// Request de confirmacao
export interface ConfirmContextRequest {
  contextId: string;
  confirmed: boolean;
}

// ========================================
// Tipos de Response
// ========================================

// Response do chat
export interface ChatResponse {
  message: string;
  audioUrl?: string;
  suggestions?: string[];
}

// Response de contexto
export interface ContextResponse {
  contextId: string;
  summary: string;
  audioUrl?: string;
  requiresConfirmation: boolean;
}

// Response de confirmacao
export interface ConfirmResponse {
  saved: boolean;
  message: string;
}

// Response de transcricao
export interface TranscribeResponse {
  text: string;
  duration?: number;
  language?: string;
}

// Response de erro
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
}

// ========================================
// Tipos de Sugestoes
// ========================================

// Tipo de sugestao
export type SuggestionType = 'action' | 'message' | 'insight';

// Tipo de acao
export type ActionType =
  | 'move_card'
  | 'send_message'
  | 'schedule'
  | 'call'
  | 'email'
  | 'follow_up';

// Sugestao da IA
export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  audioUrl?: string;
  actionType?: ActionType;
  actionPayload?: Record<string, unknown>;
  priority: number;
  createdAt: string;
}

// Request de sugestoes
export interface SuggestionsRequest {
  leadId: string;
  leadContext?: LeadContextRequest;
  recentInteractions?: number;
}

// Response de sugestoes
export interface SuggestionsResponse {
  suggestions: AISuggestion[];
  totalCount: number;
  generatedAt: string;
}

// Request de aceitar/rejeitar sugestao
export interface SuggestionActionRequest {
  suggestionId: string;
  action: 'accept' | 'reject' | 'edit';
  editedMessage?: string;
}

// Response de acao em sugestao
export interface SuggestionActionResponse {
  success: boolean;
  message: string;
  executedAction?: {
    type: ActionType;
    result: string;
  };
}
