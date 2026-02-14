// ========================================
// Construtor de Contexto para IA
// Funcoes para montar payloads de contexto
// ========================================

// ========================================
// Tipos de Contexto
// ========================================

// Tipo de entrada de contexto
export type ContextType = 'text' | 'audio' | 'file';

// Payload de contexto
export interface ContextPayload {
  type: ContextType; //....................Tipo do contexto
  content: string; //......................Conteudo textual
  metadata: ContextMetadata; //............Metadados adicionais
  leadId?: string; //......................Id do lead associado
  timestamp: Date; //......................Data de criacao
}

// Metadados do contexto
export interface ContextMetadata {
  source: string; //......................Origem do contexto
  fileName?: string; //....................Nome do arquivo
  fileSize?: number; //....................Tamanho do arquivo
  duration?: number; //....................Duracao em ms (audio)
  mimeType?: string; //....................Tipo MIME
  transcription?: string; //...............Transcricao (audio)
  audioUri?: string; //....................URI do audio original
}

// ========================================
// Funcao: Construir contexto de texto
// ========================================
export const buildTextContext = (
  text: string, //........................Texto do contexto
  leadId?: string, //.....................Id do lead
): ContextPayload => {
  return {
    type: 'text', //......................Tipo texto
    content: text.trim(), //..............Conteudo limpo
    metadata: {
      source: 'manual_input', //..........Origem manual
    },
    leadId, //.............................Id do lead
    timestamp: new Date(), //..............Data atual
  };
};

// ========================================
// Funcao: Construir contexto de audio
// ========================================
export const buildAudioContext = (
  audioUri: string, //....................URI do audio
  transcription: string, //...............Texto transcrito
  duration?: number, //....................Duracao em ms
): ContextPayload => {
  return {
    type: 'audio', //.....................Tipo audio
    content: transcription.trim(), //......Transcricao como conteudo
    metadata: {
      source: 'voice_recording', //.......Origem gravacao
      transcription, //...................Transcricao original
      audioUri, //.........................URI do audio
      duration, //..........................Duracao
      mimeType: 'audio/m4a', //............Tipo MIME padrao
    },
    timestamp: new Date(), //..............Data atual
  };
};

// ========================================
// Funcao: Construir contexto de arquivo
// ========================================
export const buildFileContext = (
  fileUri: string, //.....................URI do arquivo
  fileName: string, //....................Nome do arquivo
  content: string, //.....................Conteudo extraido
  fileSize?: number, //...................Tamanho em bytes
  mimeType?: string, //....................Tipo MIME
): ContextPayload => {
  return {
    type: 'file', //......................Tipo arquivo
    content: content.trim(), //............Conteudo extraido
    metadata: {
      source: 'file_upload', //............Origem upload
      fileName, //..........................Nome do arquivo
      fileSize, //..........................Tamanho
      mimeType: mimeType || 'application/octet-stream', //..Tipo
    },
    timestamp: new Date(), //..............Data atual
  };
};

// ========================================
// Funcao: Mesclar multiplos contextos
// ========================================
export const mergeContexts = (
  contexts: ContextPayload[], //.........Array de contextos
): ContextPayload => {
  if (contexts.length === 0) { //........Se array vazio
    return buildTextContext(''); //.....Retornar vazio
  }

  if (contexts.length === 1) { //........Se apenas um
    return contexts[0]; //...............Retornar ele
  }

  const mergedContent = contexts
    .map((ctx, index) => { //.............Mapear contextos
      const prefix = `[${ctx.type.toUpperCase()} ${index + 1}]`; //..Prefixo
      return `${prefix}\n${ctx.content}`; //..Conteudo com prefixo
    })
    .join('\n\n'); //.....................Juntar com quebras

  const leadId = contexts.find(c => c.leadId)?.leadId; //..Primeiro leadId

  return {
    type: 'text', //......................Tipo mesclado eh texto
    content: mergedContent, //............Conteudo mesclado
    metadata: {
      source: 'merged_contexts', //.......Origem mesclado
    },
    leadId, //.............................Id do lead
    timestamp: new Date(), //..............Data atual
  };
};

// ========================================
// Funcao: Validar contexto
// ========================================
export const validateContext = (
  context: ContextPayload, //.............Contexto a validar
): { valid: boolean; error?: string } => {
  if (!context.content || context.content.trim().length === 0) {
    return { //............................Conteudo vazio
      valid: false, //.....................Invalido
      error: 'Contexto vazio', //..........Mensagem de erro
    };
  }

  if (context.content.length > 10000) { //..Limite de caracteres
    return {
      valid: false, //.....................Invalido
      error: 'Contexto muito longo (max 10000 caracteres)', //..Erro
    };
  }

  return { valid: true }; //...............Valido
};

// ========================================
// Funcao: Formatar contexto para API
// ========================================
export const formatContextForApi = (
  context: ContextPayload, //.............Contexto a formatar
): { type: string; content: string; leadId?: string } => {
  return {
    type: context.type, //.................Tipo
    content: context.content, //...........Conteudo
    leadId: context.leadId, //..............Id do lead
  };
};

// ========================================
// Funcao: Extrair resumo do contexto
// ========================================
export const extractContextSummary = (
  context: ContextPayload, //.............Contexto
  maxLength: number = 100, //.............Tamanho maximo
): string => {
  const content = context.content; //......Conteudo
  if (content.length <= maxLength) { //....Se menor que limite
    return content; //.....................Retornar completo
  }
  return content.substring(0, maxLength - 3) + '...'; //..Truncar
};
