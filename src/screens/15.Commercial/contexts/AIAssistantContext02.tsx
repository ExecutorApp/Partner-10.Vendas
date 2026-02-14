// ========================================
// AIAssistantContext - Tipos e Constantes
// Arquivo 02 - Separado para reduzir linhas
// ========================================

// ========================================
// Imports de Tipos
// ========================================
import {
  AIMessage,                          //......Interface de mensagem
  ManualContext,                      //......Interface de contexto
  AISuggestion,                       //......Interface de sugestao
  AISettings,                         //......Interface de config
  AIModalState,                       //......Interface de modal
  AudioPlayerState,                   //......Interface de player
  LeadContext,                        //......Interface de lead
} from '../types/ai.types';           //......Arquivo de tipos

import {
  AIResponse,                         //......Tipo resposta IA
  AISuggestion as ModalSuggestion,    //......Tipo sugestao modal
} from '../components/ai/AssistantResponseModal';

// ========================================
// Constantes da IA
// ========================================

// Regras absolutas da IA
export const AI_RULES = {
  NEVER_AUTO_SEND: true,              //......Nunca envia automatico
  ALWAYS_AUDIO_RESPONSE: true,        //......Sempre responde em audio
  REQUIRE_MANUAL_CONFIRMATION: true,  //......Contexto requer confirmacao
  MODAL_WIDTH_PERCENT: 40,            //......Largura do modal 40%
  FAB_ALWAYS_VISIBLE: true,           //......FAB sempre visivel
};

// Configuracoes padrao
export const DEFAULT_SETTINGS: AISettings = {
  responseFormat: 'audio',            //......Formato audio
  autoSuggestions: true,              //......Sugestoes automaticas
  voiceEnabled: true,                 //......Voz habilitada
  voiceSpeed: 1.0,                    //......Velocidade 1.0x
  voiceName: 'nova',                  //......Voz Nova
  contextAutoCapture: false,          //......Captura manual
  notifyOnSuggestion: true,           //......Notificar sugestoes
};

// Estado inicial do modal
export const INITIAL_MODAL_STATE: AIModalState = {
  state: 'closed',                    //......Modal fechado
  suggestion: undefined,              //......Sem sugestao
  isEditing: false,                   //......Nao editando
  editedMessage: '',                  //......Mensagem vazia
};

// Estado inicial do player
export const INITIAL_PLAYER_STATE: AudioPlayerState = {
  state: 'idle',                      //......Player parado
  currentUri: undefined,              //......Sem audio
  duration: 0,                        //......Duracao zero
  position: 0,                        //......Posicao zero
  progress: 0,                        //......Progresso zero
};

// ========================================
// Interface do Contexto
// ========================================
export interface AIAssistantContextValue {
  // Estado do modal
  modalState: AIModalState;           //......Estado do modal
  openSuggestionModal: (suggestion: AISuggestion) => void;
  closeSuggestionModal: () => void;   //......Fechar modal
  openContextModal: () => void;       //......Abrir contexto
  openSettingsModal: () => void;      //......Abrir config

  // Estado do FAB
  isFabExpanded: boolean;             //......FAB expandido
  toggleFab: () => void;              //......Toggle FAB

  // Estado das mensagens
  messages: AIMessage[];              //......Historico
  addMessage: (content: string, isFromUser: boolean) => void;

  // Estado das sugestoes
  suggestions: AISuggestion[];        //......Sugestoes ativas
  addSuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => void;
  confirmSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  editSuggestion: (id: string, newContent: string) => void;

  // Estado do contexto manual
  manualContexts: ManualContext[];    //......Contextos manuais
  addManualContext: (content: string, type: 'text' | 'file' | 'audio') => Promise<void>;
  confirmContext: (id: string) => void;

  // Estado das configuracoes
  settings: AISettings;               //......Configuracoes
  updateSettings: (settings: Partial<AISettings>) => void;

  // Estado do player de audio
  playerState: AudioPlayerState;      //......Estado do player
  playAudio: (uri: string) => Promise<void>;
  pauseAudio: () => void;             //......Pausar audio
  stopAudio: () => void;              //......Parar audio

  // Estado de carregamento
  isLoading: boolean;                 //......Carregando
  error: string | null;               //......Erro

  // Contexto do lead atual
  currentLeadContext: LeadContext | null;
  setLeadContext: (context: LeadContext | null) => void;

  // Enviar mensagem editada (NUNCA automatico)
  sendEditedMessage: () => void;      //......Enviar editada

  // Estado do modal de resposta
  responseModalVisible: boolean;      //......Modal visivel
  currentResponse: AIResponse | null; //......Resposta atual
  showResponseModal: (response: AIResponse) => void;
  hideResponseModal: () => void;      //......Esconder modal
  handleResponseConfirm: () => void;  //......Confirmar resposta
  handleResponseReject: () => void;   //......Rejeitar resposta
  handleSuggestionSelect: (suggestion: ModalSuggestion) => void;
}
