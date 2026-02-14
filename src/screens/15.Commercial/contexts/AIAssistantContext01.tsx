// ========================================
// Contexto da IA Assistente
// Arquivo 01 - Provider e Hooks
// ========================================

// ========================================
// REGRAS CRITICAS DA IA
// ========================================
// 1. IA NUNCA envia mensagens automaticamente
// 2. TODAS respostas em AUDIO (TTS)
// 3. Modal lateral 40% para sugestoes
// 4. Contexto manual requer confirmacao
// 5. FAB sempre visivel
// ========================================

// ========================================
// Imports
// ========================================
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';

// ========================================
// Imports de Services
// ========================================
import aiService from '../services/aiService';

// ========================================
// Imports de Tipos
// ========================================
import {
  AIMessage,
  ManualContext,
  AISuggestion,
  AISettings,
  AIModalState,
  AudioPlayerState,
  LeadContext,
} from '../types/ai.types';

import {
  AIResponse,
  AISuggestion as ModalSuggestion,
} from '../components/ai/AssistantResponseModal';

// ========================================
// Imports de Constantes
// ========================================
import {
  DEFAULT_SETTINGS,
  INITIAL_MODAL_STATE,
  INITIAL_PLAYER_STATE,
  AIAssistantContextValue,
} from './AIAssistantContext02';

// ========================================
// Contexto
// ========================================
const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

// ========================================
// Interface de Props
// ========================================
interface AIAssistantProviderProps {
  children: ReactNode;
}

// ========================================
// Provider
// ========================================
export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({
  children,
}) => {
  // Estados
  const [modalState, setModalState] = useState<AIModalState>(INITIAL_MODAL_STATE);
  const [isFabExpanded, setFabExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [manualContexts, setManualContexts] = useState<ManualContext[]>([]);
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [playerState, setPlayerState] = useState<AudioPlayerState>(INITIAL_PLAYER_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLeadContext, setCurrentLeadContext] = useState<LeadContext | null>(null);
  const audioRef = useRef<any>(null);
  const [responseModalVisible, setResponseModalVisible] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);

  // Handlers do Modal
  const openSuggestionModal = useCallback((suggestion: AISuggestion) => {
    setModalState({ state: 'suggestion', suggestion, isEditing: false, editedMessage: suggestion.description });
  }, []);

  const closeSuggestionModal = useCallback(() => {
    setModalState(INITIAL_MODAL_STATE);
  }, []);

  const openContextModal = useCallback(() => {
    setModalState({ state: 'context', suggestion: undefined, isEditing: false, editedMessage: '' });
  }, []);

  const openSettingsModal = useCallback(() => {
    setModalState({ state: 'settings', suggestion: undefined, isEditing: false, editedMessage: '' });
  }, []);

  // Handlers do FAB
  const toggleFab = useCallback(() => {
    setFabExpanded(prev => !prev);
  }, []);

  // Handlers de Mensagens
  const addMessage = useCallback((content: string, isFromUser: boolean) => {
    const newMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: isFromUser ? 'user' : 'assistant',
      content,
      timestamp: new Date(),
      confirmed: true,
      isFromAI: !isFromUser,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Handlers de Sugestoes
  const addSuggestion = useCallback((suggestion: Omit<AISuggestion, 'id' | 'createdAt'>) => {
    const newSuggestion: AISuggestion = { ...suggestion, id: `sug-${Date.now()}`, createdAt: new Date() };
    setSuggestions(prev => [...prev, newSuggestion]);
    openSuggestionModal(newSuggestion);
  }, [openSuggestionModal]);

  const confirmSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(sug => sug.id === id ? { ...sug, confirmed: true, rejected: false } : sug));
  }, []);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(sug => sug.id === id ? { ...sug, confirmed: false, rejected: true } : sug));
    closeSuggestionModal();
  }, [closeSuggestionModal]);

  const editSuggestion = useCallback((id: string, newContent: string) => {
    setModalState(prev => ({ ...prev, isEditing: true, editedMessage: newContent }));
  }, []);

  // Handler de Envio (NUNCA automatico)
  const sendEditedMessage = useCallback(() => {
    if (!modalState.suggestion) return;
    addMessage(modalState.editedMessage, true);
    confirmSuggestion(modalState.suggestion.id);
    closeSuggestionModal();
  }, [modalState, addMessage, confirmSuggestion, closeSuggestionModal]);

  // Handlers de Contexto Manual
  const addManualContext = useCallback(async (content: string, type: 'text' | 'file' | 'audio') => {
    setIsLoading(true);
    try {
      const leadId = currentLeadContext?.leadId || 'lead-default';
      const response = await aiService.addManualContext(type, content, leadId);
      const newContext: ManualContext = {
        id: response.contextId,
        leadId,
        type,
        content,
        aiSummary: response.summary,
        audioSummaryUri: response.audioUrl,
        confirmed: false,
        createdAt: new Date(),
        createdBy: 'user-1',
      };
      setManualContexts(prev => [...prev, newContext]);
      openContextModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar contexto');
    } finally {
      setIsLoading(false);
    }
  }, [currentLeadContext, openContextModal]);

  const confirmContext = useCallback(async (id: string) => {
    try {
      await aiService.confirmContext(id, true);
      setManualContexts(prev => prev.map(ctx => ctx.id === id ? { ...ctx, confirmed: true } : ctx));
      closeSuggestionModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar contexto');
    }
  }, [closeSuggestionModal]);

  // Handlers de Configuracoes
  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Handlers de Audio
  const playAudio = useCallback(async (uri: string) => {
    try {
      setPlayerState(prev => ({ ...prev, state: 'loading', currentUri: uri }));
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlayerState(prev => ({ ...prev, state: 'playing' }));
    } catch (err) {
      setPlayerState(prev => ({ ...prev, state: 'error' }));
    }
  }, []);

  const pauseAudio = useCallback(() => {
    setPlayerState(prev => ({ ...prev, state: 'paused' }));
  }, []);

  const stopAudio = useCallback(() => {
    setPlayerState(INITIAL_PLAYER_STATE);
  }, []);

  // Handler de Lead Context
  const setLeadContext = useCallback((context: LeadContext | null) => {
    setCurrentLeadContext(context);
  }, []);

  // Handlers do Modal de Resposta
  const showResponseModal = useCallback((response: AIResponse) => {
    setCurrentResponse(response);
    setResponseModalVisible(true);
  }, []);

  const hideResponseModal = useCallback(() => {
    setResponseModalVisible(false);
    setCurrentResponse(null);
  }, []);

  const handleResponseConfirm = useCallback(() => {
    if (currentResponse?.contextId) confirmContext(currentResponse.contextId);
    hideResponseModal();
  }, [currentResponse, confirmContext, hideResponseModal]);

  const handleResponseReject = useCallback(() => {
    hideResponseModal();
  }, [hideResponseModal]);

  const handleSuggestionSelect = useCallback((suggestion: ModalSuggestion) => {
    console.log('Sugestao selecionada:', suggestion);
    hideResponseModal();
  }, [hideResponseModal]);

  // Valor do Contexto
  const value = useMemo<AIAssistantContextValue>(() => ({
    modalState, openSuggestionModal, closeSuggestionModal, openContextModal, openSettingsModal,
    isFabExpanded, toggleFab, messages, addMessage,
    suggestions, addSuggestion, confirmSuggestion, rejectSuggestion, editSuggestion,
    manualContexts, addManualContext, confirmContext,
    settings, updateSettings, playerState, playAudio, pauseAudio, stopAudio,
    isLoading, error, currentLeadContext, setLeadContext, sendEditedMessage,
    responseModalVisible, currentResponse, showResponseModal, hideResponseModal,
    handleResponseConfirm, handleResponseReject, handleSuggestionSelect,
  }), [modalState, openSuggestionModal, closeSuggestionModal, openContextModal, openSettingsModal,
    isFabExpanded, toggleFab, messages, addMessage, suggestions, addSuggestion, confirmSuggestion,
    rejectSuggestion, editSuggestion, manualContexts, addManualContext, confirmContext, settings,
    updateSettings, playerState, playAudio, pauseAudio, stopAudio, isLoading, error,
    currentLeadContext, setLeadContext, sendEditedMessage, responseModalVisible, currentResponse,
    showResponseModal, hideResponseModal, handleResponseConfirm, handleResponseReject, handleSuggestionSelect]);

  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
};

// ========================================
// Hook de Uso
// ========================================
export const useAIAssistant = (): AIAssistantContextValue => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant deve ser usado dentro de AIAssistantProvider');
  }
  return context;
};

// ========================================
// Export Default
// ========================================
export default AIAssistantProvider;
