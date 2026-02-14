// ========================================
// Service de IA
// Comunicacao HTTP com o backend
// ========================================

// ========================================
// Imports
// ========================================
import { Platform } from 'react-native'; //..Plataforma RN

// ========================================
// Tipos do Service
// ========================================

// Mensagem do chat
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'; //..Papel na conversa
  content: string;                       //..Conteudo da mensagem
}

// Contexto do lead para API
interface LeadContextPayload {
  leadId: string;                        //..Id do lead
  name: string;                          //..Nome do lead
  phase: string;                         //..Fase atual
  column: string;                        //..Coluna atual
  lastInteraction: string;               //..Ultima interacao ISO
  channelEntry?: {                       //..Canal de entrada
    type: string;                        //..Tipo do canal
    platform?: string;                   //..Plataforma
    date: string;                        //..Data ISO
  };
}

// Payload do chat
interface ChatPayload {
  messages: ChatMessage[];               //..Historico de mensagens
  leadContext?: LeadContextPayload;      //..Contexto do lead
  manualContext?: string;                //..Contexto manual
}

// Response do chat
interface ChatResponse {
  message: string;                       //..Mensagem da IA
  audioUrl?: string;                     //..URL do audio TTS
  suggestions?: string[];                //..Sugestoes extraidas
}

// Payload de contexto manual
interface ManualContextPayload {
  type: 'text' | 'file' | 'audio';       //..Tipo de contexto
  content: string;                       //..Conteudo original
  leadId: string;                        //..Id do lead
}

// Response de contexto
interface ContextResponse {
  contextId: string;                     //..Id do contexto criado
  summary: string;                       //..Resumo da IA
  audioUrl?: string;                     //..Audio do resumo
  requiresConfirmation: boolean;         //..Requer confirmacao
}

// Payload de confirmacao
interface ConfirmPayload {
  contextId: string;                     //..Id do contexto
  confirmed: boolean;                    //..Se foi confirmado
}

// Response de confirmacao
interface ConfirmResponse {
  saved: boolean;                        //..Se foi salvo
  message: string;                       //..Mensagem de retorno
}

// Response de transcricao
interface TranscribeResponse {
  text: string;                          //..Texto transcrito
  duration?: number;                     //..Duracao do audio
  language?: string;                     //..Idioma detectado
}

// Response de health
interface HealthResponse {
  status: string;                        //..Status do servidor
  timestamp: string;                     //..Timestamp ISO
  version: string;                       //..Versao da API
}

// Response de erro
interface ErrorResponse {
  error: string;                         //..Codigo do erro
  message: string;                       //..Mensagem do erro
}

// ========================================
// Constantes
// ========================================

// URL base da API (ajustar para device fisico)
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3002';       //..Emulador Android
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:3002';      //..Simulador iOS
  }
  return 'http://localhost:3002';        //..Web/Desktop
};

const API_BASE_URL = getBaseUrl();       //..URL base calculada

// Endpoints da API
const ENDPOINTS = {
  CHAT: '/api/ai/chat',                  //..Endpoint de chat
  MANUAL_CONTEXT: '/api/ai/context/manual', //..Contexto manual
  CONFIRM_CONTEXT: '/api/ai/context/confirm', //..Confirmar contexto
  SAVE_MESSAGE: '/api/ai/context/message', //..Salvar mensagem
  GET_CONTEXT: '/api/ai/context',        //..Ler contexto (+ /:leadId)
  LIST_CONTEXTS: '/api/ai/contexts',     //..Listar contextos
  IMPROVE: '/api/ai/improve',            //..Melhorar mensagem
  TRANSCRIBE: '/api/ai/transcribe',      //..Transcrever audio
  HEALTH: '/health',                     //..Health check
};

// Timeout padrao em ms
const DEFAULT_TIMEOUT = 30000;           //..30 segundos

// ========================================
// Circuit Breaker (evita erros CORS repetitivos quando o backend nao esta rodando)
// Usa fetch no-cors para probe silencioso (sem erros no console)
// ========================================
let _serviceAvailable: boolean | null = null; //..null = desconhecido
let _lastProbeTime = 0;                  //......Timestamp do ultimo probe
const PROBE_INTERVAL = 120000;           //......Recheck a cada 2 minutos

const probeService = async (): Promise<boolean> => {
  const now = Date.now();                //......Timestamp atual
  if (_serviceAvailable !== null && (now - _lastProbeTime) < PROBE_INTERVAL) {
    return _serviceAvailable;            //......Usar cache
  }
  _lastProbeTime = now;                  //......Atualizar timestamp
  try {
    await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`, {
      mode: 'no-cors',                   //......Sem erro CORS no console
      method: 'HEAD',                    //......Request leve
    });
    _serviceAvailable = true;            //......Servico respondeu
  } catch {
    _serviceAvailable = false;           //......Servico indisponivel
  }
  return _serviceAvailable;             //......Retornar resultado
};

// ========================================
// Funcoes Auxiliares
// ========================================

// Funcao para fazer requisicao com timeout
const fetchWithTimeout = async (
  url: string,                           //..URL da requisicao
  options: RequestInit,                  //..Opcoes do fetch
  timeout: number = DEFAULT_TIMEOUT,     //..Timeout em ms
): Promise<Response> => {
  const controller = new AbortController(); //..Controller de abort
  const timeoutId = setTimeout(          //..Timer do timeout
    () => controller.abort(),            //..Abortar requisicao
    timeout,                             //..Tempo limite
  );

  try {
    const response = await fetch(url, {  //..Executar fetch
      ...options,                        //..Opcoes originais
      signal: controller.signal,         //..Signal de abort
    });
    return response;                     //..Retornar response
  } finally {
    clearTimeout(timeoutId);             //..Limpar timer
  }
};

// Funcao para tratar erros da API
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'Erro desconhecido'; //..Mensagem padrao
  try {
    const errorData: ErrorResponse = await response.json();
    errorMessage = errorData.message || errorData.error;
  } catch {
    errorMessage = `Erro HTTP ${response.status}`;
  }
  throw new Error(errorMessage);         //..Lancar erro
};

// ========================================
// Funcoes do Service
// ========================================

// Enviar mensagem para o chat
export const sendChatMessage = async (
  messages: ChatMessage[],               //..Historico de mensagens
  leadContext?: LeadContextPayload,      //..Contexto do lead
  manualContext?: string,                //..Contexto manual
): Promise<ChatResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.CHAT}`;
  const payload: ChatPayload = {
    messages,                            //..Mensagens do chat
    leadContext,                         //..Contexto do lead
    manualContext,                       //..Contexto manual
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    headers: {
      'Content-Type': 'application/json', //..Tipo JSON
    },
    body: JSON.stringify(payload),       //..Corpo da requisicao
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  const data: ChatResponse = await response.json();

  // Ajustar URL do audio para URL completa
  if (data.audioUrl) {
    data.audioUrl = `${API_BASE_URL}${data.audioUrl}`;
  }

  return data;                           //..Retornar dados
};

// Adicionar contexto manual
export const addManualContext = async (
  type: 'text' | 'file' | 'audio',       //..Tipo de contexto
  content: string,                       //..Conteudo original
  leadId: string,                        //..Id do lead
): Promise<ContextResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.MANUAL_CONTEXT}`;
  const payload: ManualContextPayload = {
    type,                                //..Tipo de entrada
    content,                             //..Conteudo
    leadId,                              //..Id do lead
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    headers: {
      'Content-Type': 'application/json', //..Tipo JSON
    },
    body: JSON.stringify(payload),       //..Corpo da requisicao
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  const data: ContextResponse = await response.json();

  // Ajustar URL do audio para URL completa
  if (data.audioUrl) {
    data.audioUrl = `${API_BASE_URL}${data.audioUrl}`;
  }

  return data;                           //..Retornar dados
};

// Confirmar contexto manual
export const confirmContext = async (
  contextId: string,                     //..Id do contexto
  confirmed: boolean,                    //..Se foi confirmado
): Promise<ConfirmResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.CONFIRM_CONTEXT}`;
  const payload: ConfirmPayload = {
    contextId,                           //..Id do contexto
    confirmed,                           //..Confirmacao
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    headers: {
      'Content-Type': 'application/json', //..Tipo JSON
    },
    body: JSON.stringify(payload),       //..Corpo da requisicao
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// Decodifica base64 para Uint8Array binario (evita corrupcao do fetch)
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryStr = atob(base64);        //..Decodifica base64
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);  //..Byte a byte
  }
  return bytes;
};

// Detecta formato de audio pelos magic bytes do header
const detectAudioFilename = (bytes: Uint8Array): string => {
  if (bytes.length < 12) return 'audio.ogg'; //..Buffer muito pequeno
  const h = bytes;                       //..Header bytes
  if (h[0] === 0x4F && h[1] === 0x67 && h[2] === 0x67 && h[3] === 0x53) return 'audio.ogg';
  if (h[0] === 0x1A && h[1] === 0x45 && h[2] === 0xDF && h[3] === 0xA3) return 'audio.webm';
  if (h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46) return 'audio.wav';
  if (h[0] === 0x49 && h[1] === 0x44 && h[2] === 0x33) return 'audio.mp3';
  if (h[0] === 0xFF && (h[1] & 0xE0) === 0xE0) return 'audio.mp3';
  if (h[4] === 0x66 && h[5] === 0x74 && h[6] === 0x79 && h[7] === 0x70) return 'audio.m4a';
  if (h[0] === 0x66 && h[1] === 0x4C && h[2] === 0x61 && h[3] === 0x43) return 'audio.flac';
  return 'audio.ogg';                    //..Fallback OGG
};

// Transcrever audio
export const transcribeAudio = async (
  audioUri: string,                      //..URI do arquivo de audio
  filename: string = 'audio.ogg',        //..Nome do arquivo
): Promise<TranscribeResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.TRANSCRIBE}`;

  // Criar form data para upload
  const formData = new FormData();       //..Form data

  // Tratamento diferente para Web vs Native
  if (Platform.OS === 'web') {
    let audioBlob: Blob;                 //..Blob do audio
    let detectedName = filename;         //..Nome detectado

    if (audioUri.startsWith('data:')) {
      // Data URI: decodifica base64 manualmente (evita corrupcao)
      // fetch() de data URIs com MIME complexo (audio/ogg; codecs=opus)
      // pode corromper dados binarios ao interpretar como texto
      const commaIdx = audioUri.indexOf(',');
      const b64 = audioUri.substring(commaIdx + 1);
      const bytes = base64ToUint8Array(b64);
      detectedName = detectAudioFilename(bytes);
      audioBlob = new Blob([bytes], { type: 'application/octet-stream' });
    } else {
      // Blob URL ou HTTP: fetch normal
      const audioResponse = await fetch(audioUri);
      audioBlob = await audioResponse.blob();
      // Detectar formato do blob
      const headerBuf = await audioBlob.slice(0, 12).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuf);
      detectedName = detectAudioFilename(headerBytes);
    }

    formData.append('audio', audioBlob, detectedName);
  } else {
    // Native: Usar objeto com uri/type/name
    formData.append('audio', {
      uri: audioUri,                     //..URI do arquivo
      type: 'audio/m4a',                 //..Tipo do audio
      name: filename,                    //..Nome do arquivo
    } as unknown as Blob);
  }

  // NAO definir Content-Type manualmente
  // O fetch gera automaticamente com boundary correto
  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    body: formData,                      //..Form data
  }, 60000);                             //..Timeout maior para upload

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// ========================================
// Funcoes de Contexto em Arquivo TXT
// ========================================

// Tipo de remetente
type MessageSender = 'LEAD' | 'VENDEDOR';

// Response de salvar mensagem
interface SaveMessageResponse {
  success: boolean;                      //..Se foi salvo
  message: string;                       //..Mensagem de retorno
}

// Response de ler contexto
interface GetContextResponse {
  leadId: string;                        //..Id do lead
  context: string;                       //..Contexto completo
  hasContext: boolean;                   //..Se tem contexto
}

// Response de listar contextos
interface ListContextsResponse {
  contexts: string[];                    //..Lista de leadIds
  totalCount: number;                    //..Total de contextos
}

// Response de melhorar mensagem
interface ImproveResponse {
  original: string;                      //..Mensagem original
  improved: string;                      //..Mensagem melhorada
}

// Salvar mensagem no contexto do lead
export const saveMessageToContext = async (
  leadId: string,                        //..Id do lead
  sender: MessageSender,                 //..Quem enviou (LEAD/VENDEDOR)
  content: string,                       //..Conteudo da mensagem
  leadName?: string,                     //..Nome do lead (opcional)
): Promise<SaveMessageResponse> => {
  // Circuit breaker: pular se servico indisponivel
  const available = await probeService(); //..Verificar disponibilidade
  if (!available) {
    return { success: false, message: 'Servico de IA indisponivel' };
  }

  const url = `${API_BASE_URL}${ENDPOINTS.SAVE_MESSAGE}`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    headers: {
      'Content-Type': 'application/json', //..Tipo JSON
    },
    body: JSON.stringify({               //..Corpo da requisicao
      leadId,                            //..Id do lead
      sender,                            //..Remetente
      content,                           //..Conteudo
      leadName,                          //..Nome do lead
    }),
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// Ler contexto de um lead
export const getLeadContext = async (
  leadId: string,                        //..Id do lead
): Promise<GetContextResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.GET_CONTEXT}/${leadId}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',                       //..Metodo GET
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// Listar todos os leads com contexto
export const listContexts = async (): Promise<ListContextsResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.LIST_CONTEXTS}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',                       //..Metodo GET
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// Limpar contexto de um lead
export const clearLeadContext = async (
  leadId: string,                        //..Id do lead
): Promise<SaveMessageResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.GET_CONTEXT}/${leadId}`;

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',                    //..Metodo DELETE
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// Melhorar mensagem com prompt Lola + contexto
export const improveMessage = async (
  leadId: string,                        //..Id do lead
  message: string,                       //..Mensagem original
  promptName?: string,                   //..Nome do prompt (opcional)
): Promise<ImproveResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.IMPROVE}`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',                      //..Metodo POST
    headers: {
      'Content-Type': 'application/json', //..Tipo JSON
    },
    body: JSON.stringify({               //..Corpo da requisicao
      leadId,                            //..Id do lead
      message,                           //..Mensagem original
      promptName,                        //..Nome do prompt
    }),
  });

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// ========================================
// Health Check
// ========================================

// Health check
export const healthCheck = async (): Promise<HealthResponse> => {
  const url = `${API_BASE_URL}${ENDPOINTS.HEALTH}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',                       //..Metodo GET
  }, 5000);                              //..Timeout curto

  if (!response.ok) {
    await handleApiError(response);      //..Tratar erro
  }

  return response.json();                //..Retornar dados
};

// ========================================
// Export do Service
// ========================================
const aiService = {
  sendChatMessage,                       //..Enviar mensagem
  addManualContext,                      //..Adicionar contexto
  confirmContext,                        //..Confirmar contexto
  transcribeAudio,                       //..Transcrever audio
  healthCheck,                           //..Health check
  saveMessageToContext,                  //..Salvar mensagem no contexto
  getLeadContext,                        //..Ler contexto do lead
  listContexts,                          //..Listar contextos
  clearLeadContext,                      //..Limpar contexto
  improveMessage,                        //..Melhorar mensagem com IA
  API_BASE_URL,                          //..URL base exportada
};

export default aiService;
