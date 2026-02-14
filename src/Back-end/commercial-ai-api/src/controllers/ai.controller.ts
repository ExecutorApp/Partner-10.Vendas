// ========================================
// Controller de IA
// Gerencia requisicoes da API
// ========================================

import { Request, Response } from 'express';
import {
  ChatRequest,
  ManualContextRequest,
  ConfirmContextRequest,
  SuggestionsRequest,
  SuggestionActionRequest,
  ChatResponse,
  ContextResponse,
  ConfirmResponse,
  TranscribeResponse,
  SuggestionsResponse,
  SuggestionActionResponse,
  AISuggestion,
  ErrorResponse,
} from '../types/api.types';
import openaiService from '../services/openai.service';
import contextService from '../services/context.service';
import path from 'path';
import fs from 'fs';

// ========================================
// Diretorio de Audios
// ========================================

// Diretorio para armazenar audios gerados
const AUDIO_DIR = path.join(__dirname, '../../audio');

// Criar diretorio se nao existir
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// ========================================
// Controller: Chat
// ========================================

/**
 * POST /api/ai/chat
 * Enviar mensagem para IA e receber resposta com audio
 */
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { messages, leadContext, manualContext } = req.body as ChatRequest;

    // Validar mensagens
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O campo messages é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Obter contextos anteriores do lead
    let fullContext = manualContext || '';
    if (leadContext?.leadId) {
      const storedContexts = contextService.buildContextString(leadContext.leadId);
      if (storedContexts) {
        fullContext = `${storedContexts}\n\n${fullContext}`;
      }
    }

    // Gerar resposta da IA
    const responseText = await openaiService.generateChatResponse(
      messages,
      leadContext,
      fullContext
    );

    // Gerar audio TTS
    let audioUrl: string | undefined;
    try {
      const audioBuffer = await openaiService.generateTTS(responseText);
      const audioFilename = `response-${Date.now()}.mp3`;
      const audioPath = path.join(AUDIO_DIR, audioFilename);

      // Salvar audio
      fs.writeFileSync(audioPath, audioBuffer);

      // Gerar URL
      audioUrl = `/audio/${audioFilename}`;
    } catch (ttsError) {
      console.error('Erro ao gerar TTS:', ttsError);
      // Continuar sem audio
    }

    // Gerar sugestoes
    const suggestions = extractSuggestions(responseText);

    // Retornar resposta
    res.json({
      message: responseText,
      audioUrl,
      suggestions,
    } as ChatResponse);

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao processar mensagem',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Contexto Manual
// ========================================

/**
 * POST /api/ai/context/manual
 * Adicionar contexto manual (IA resume e pede confirmacao)
 */
export async function addManualContext(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { type, content, leadId } = req.body as ManualContextRequest;

    // Validar dados
    if (!content || !leadId) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Os campos content e leadId são obrigatórios',
      } as ErrorResponse);
      return;
    }

    // Gerar resumo da IA
    const summary = await openaiService.summarizeContext(content);

    // Gerar audio do resumo
    let audioUrl: string | undefined;
    try {
      const audioBuffer = await openaiService.generateTTS(summary);
      const audioFilename = `summary-${Date.now()}.mp3`;
      const audioPath = path.join(AUDIO_DIR, audioFilename);

      // Salvar audio
      fs.writeFileSync(audioPath, audioBuffer);

      // Gerar URL
      audioUrl = `/audio/${audioFilename}`;
    } catch (ttsError) {
      console.error('Erro ao gerar TTS do resumo:', ttsError);
    }

    // Criar contexto (aguardando confirmacao)
    const context = contextService.createContext(
      leadId,
      type,
      content,
      summary,
      audioUrl
    );

    // Retornar resposta
    // IMPORTANTE: requiresConfirmation = true (regra critica)
    res.json({
      contextId: context.id,
      summary: context.summary,
      audioUrl: context.audioUrl,
      requiresConfirmation: true,
    } as ContextResponse);

  } catch (error) {
    console.error('Erro ao adicionar contexto:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao processar contexto',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Confirmar Contexto
// ========================================

/**
 * POST /api/ai/context/confirm
 * Confirmar que o resumo da IA esta correto
 */
export async function confirmContextHandler(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { contextId, confirmed } = req.body as ConfirmContextRequest;

    // Validar dados
    if (!contextId) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O campo contextId é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Verificar se contexto existe
    const context = contextService.getContext(contextId);
    if (!context) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Contexto não encontrado',
      } as ErrorResponse);
      return;
    }

    // Confirmar ou rejeitar
    if (confirmed) {
      contextService.confirmContext(contextId);
    }

    // Retornar resposta
    res.json({
      saved: confirmed,
      message: confirmed
        ? 'Contexto salvo com sucesso'
        : 'Contexto descartado',
    } as ConfirmResponse);

  } catch (error) {
    console.error('Erro ao confirmar contexto:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao confirmar contexto',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Transcrever Audio
// ========================================

/**
 * POST /api/ai/transcribe
 * Transcrever audio para texto (Whisper)
 */
export async function transcribe(req: Request, res: Response): Promise<void> {
  try {
    // Verificar se tem arquivo
    if (!req.file) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Arquivo de áudio é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Transcrever audio
    const text = await openaiService.transcribeAudio(
      req.file.buffer,
      req.file.originalname
    );

    // Retornar resposta
    res.json({
      text,
      language: 'pt',
    } as TranscribeResponse);

  } catch (error) {
    console.error('Erro ao transcrever:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao transcrever áudio',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Gerar Sugestoes
// ========================================

/**
 * POST /api/ai/suggestions
 * Gerar sugestoes contextuais para um lead
 */
export async function getSuggestions(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { leadId, leadContext, recentInteractions } = req.body as SuggestionsRequest;

    // Validar dados
    if (!leadId) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O campo leadId é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Gerar sugestoes baseadas no contexto (mock por enquanto)
    const suggestions: AISuggestion[] = [];

    // Obter contextos do lead
    const storedContext = contextService.buildContextString(leadId);

    // Se tem contexto, gerar sugestoes mais inteligentes
    if (leadContext || storedContext) {
      // Sugestao de acao
      suggestions.push({
        id: `sug-${Date.now()}-1`,
        type: 'action',
        title: 'Mover para próxima fase',
        description: 'Com base nas interações recentes, este lead está pronto para avançar no funil.',
        priority: 5,
        actionType: 'move_card',
        actionPayload: { targetPhase: 'negociacao' },
        createdAt: new Date().toISOString(),
      });

      // Sugestao de mensagem
      suggestions.push({
        id: `sug-${Date.now()}-2`,
        type: 'message',
        title: 'Enviar follow-up personalizado',
        description: 'Sugiro enviar uma mensagem de follow-up mencionando os pontos discutidos anteriormente.',
        priority: 4,
        actionType: 'send_message',
        actionPayload: { template: 'follow_up_personalizado' },
        createdAt: new Date().toISOString(),
      });
    }

    // Sempre adicionar insight generico
    suggestions.push({
      id: `sug-${Date.now()}-3`,
      type: 'insight',
      title: 'Análise de engajamento',
      description: 'Este lead tem respondido rapidamente às mensagens, indicando alto interesse.',
      priority: 3,
      createdAt: new Date().toISOString(),
    });

    // Retornar resposta
    res.json({
      suggestions,
      totalCount: suggestions.length,
      generatedAt: new Date().toISOString(),
    } as SuggestionsResponse);

  } catch (error) {
    console.error('Erro ao gerar sugestoes:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao gerar sugestões',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Acao em Sugestao
// ========================================

/**
 * POST /api/ai/suggestions/action
 * Aceitar, rejeitar ou editar uma sugestao
 */
export async function suggestionAction(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { suggestionId, action, editedMessage } = req.body as SuggestionActionRequest;

    // Validar dados
    if (!suggestionId || !action) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Os campos suggestionId e action são obrigatórios',
      } as ErrorResponse);
      return;
    }

    // Processar acao
    let message = '';
    let executedAction;

    switch (action) {
      case 'accept':
        message = 'Sugestão aceita com sucesso';
        // Aqui executaria a acao sugerida
        executedAction = {
          type: 'move_card' as const,
          result: 'Lead movido para a próxima fase',
        };
        break;

      case 'reject':
        message = 'Sugestão rejeitada';
        break;

      case 'edit':
        if (!editedMessage) {
          res.status(400).json({
            error: 'INVALID_REQUEST',
            message: 'O campo editedMessage é obrigatório para ação edit',
          } as ErrorResponse);
          return;
        }
        message = 'Sugestão editada e enviada';
        executedAction = {
          type: 'send_message' as const,
          result: 'Mensagem editada enviada ao lead',
        };
        break;
    }

    // Retornar resposta
    res.json({
      success: true,
      message,
      executedAction,
    } as SuggestionActionResponse);

  } catch (error) {
    console.error('Erro ao processar acao:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao processar ação na sugestão',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Salvar Mensagem no Contexto
// ========================================

/**
 * POST /api/ai/context/message
 * Salvar mensagem no arquivo de contexto do lead
 */
export async function saveMessageToContext(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { leadId, sender, content, leadName } = req.body;

    // Validar dados
    if (!leadId || !sender || !content) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Os campos leadId, sender e content são obrigatórios',
      } as ErrorResponse);
      return;
    }

    // Validar sender
    if (sender !== 'LEAD' && sender !== 'VENDEDOR') {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O campo sender deve ser LEAD ou VENDEDOR',
      } as ErrorResponse);
      return;
    }

    // Salvar mensagem no contexto
    contextService.addMessageToContext(leadId, sender, content, leadName);

    // Retornar resposta
    res.json({
      success: true,
      message: 'Mensagem salva no contexto',
    });

  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao salvar mensagem no contexto',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Ler Contexto do Lead
// ========================================

/**
 * GET /api/ai/context/:leadId
 * Ler contexto de um lead
 */
export async function getLeadContext(req: Request, res: Response): Promise<void> {
  try {
    // Obter leadId
    const { leadId } = req.params;

    // Validar dados
    if (!leadId) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O parâmetro leadId é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Ler contexto
    const context = contextService.readContext(leadId);

    // Retornar resposta
    res.json({
      leadId,
      context,
      hasContext: context.length > 0,
    });

  } catch (error) {
    console.error('Erro ao ler contexto:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao ler contexto do lead',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Melhorar Mensagem
// ========================================

/**
 * POST /api/ai/improve
 * Melhorar mensagem usando prompt da Lola + contexto do lead
 */
export async function improveMessage(req: Request, res: Response): Promise<void> {
  try {
    // Obter dados do request
    const { leadId, message, promptName } = req.body;

    // Validar dados
    if (!leadId || !message) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Os campos leadId e message são obrigatórios',
      } as ErrorResponse);
      return;
    }

    // Melhorar mensagem
    const improvedMessage = await openaiService.improveMessage(
      leadId,
      message,
      promptName || 'lola-transcription'
    );

    // Retornar resposta
    res.json({
      original: message,
      improved: improvedMessage,
    });

  } catch (error) {
    console.error('Erro ao melhorar mensagem:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao melhorar mensagem',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Listar Contextos
// ========================================

/**
 * GET /api/ai/contexts
 * Listar todos os leads com contexto
 */
export async function listContexts(req: Request, res: Response): Promise<void> {
  try {
    // Listar contextos
    const contexts = contextService.listContexts();

    // Retornar resposta
    res.json({
      contexts,
      totalCount: contexts.length,
    });

  } catch (error) {
    console.error('Erro ao listar contextos:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao listar contextos',
    } as ErrorResponse);
  }
}

// ========================================
// Controller: Limpar Contexto
// ========================================

/**
 * DELETE /api/ai/context/:leadId
 * Limpar contexto de um lead
 */
export async function clearLeadContext(req: Request, res: Response): Promise<void> {
  try {
    // Obter leadId
    const { leadId } = req.params;

    // Validar dados
    if (!leadId) {
      res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'O parâmetro leadId é obrigatório',
      } as ErrorResponse);
      return;
    }

    // Limpar contexto
    const cleared = contextService.clearContext(leadId);

    // Retornar resposta
    res.json({
      success: cleared,
      message: cleared ? 'Contexto removido' : 'Contexto não encontrado',
    });

  } catch (error) {
    console.error('Erro ao limpar contexto:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao limpar contexto',
    } as ErrorResponse);
  }
}

// ========================================
// Funcoes Auxiliares
// ========================================

/**
 * Extrair sugestoes da resposta
 */
function extractSuggestions(text: string): string[] {
  const suggestions: string[] = [];

  // Padroes de sugestao
  const patterns = [
    /sugiro\s+([^.!?]+)/gi,
    /recomendo\s+([^.!?]+)/gi,
    /próximo passo[s]?:\s*([^.!?]+)/gi,
  ];

  // Extrair sugestoes
  patterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        suggestions.push(match[1].trim());
      }
    }
  });

  // Limitar a 3 sugestoes
  return suggestions.slice(0, 3);
}

// ========================================
// Export
// ========================================

export default {
  chat,
  addManualContext,
  confirmContext: confirmContextHandler,
  transcribe,
  getSuggestions,
  suggestionAction,
  saveMessageToContext,
  getLeadContext,
  improveMessage,
  listContexts,
  clearLeadContext,
};
