// ========================================
// Rotas da API de IA
// ========================================

import { Router } from 'express';
import multer from 'multer';
import aiController from '../controllers/ai.controller';

// ========================================
// Configuracao do Router
// ========================================

// Criar router
const router = Router();

// ========================================
// Configuracao do Multer
// ========================================

// Configurar multer para upload de audio
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (req, file, cb) => {
    // Aceitar arquivos de audio e tipos genericos (web pode enviar sem tipo)
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/aac',
      'application/octet-stream', // Tipo generico
    ];

    // Aceitar se tipo esta na lista ou se nome termina com extensao de audio
    const audioExtensions = ['.mp3', '.m4a', '.wav', '.webm', '.ogg', '.aac', '.mp4'];
    const hasAudioExtension = audioExtensions.some(ext =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (allowedMimes.includes(file.mimetype) || hasAudioExtension) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  },
});

// ========================================
// Rotas
// ========================================

/**
 * POST /api/ai/chat
 * Enviar mensagem para IA e receber resposta com audio
 *
 * Body:
 * {
 *   messages: [{ role: 'user', content: '...' }],
 *   leadContext?: { leadId, name, phase, column, ... },
 *   manualContext?: '...'
 * }
 *
 * Response:
 * {
 *   message: '...',
 *   audioUrl: '/audio/response-xxx.mp3',
 *   suggestions: ['...', '...']
 * }
 */
router.post('/chat', aiController.chat);

/**
 * POST /api/ai/context/manual
 * Adicionar contexto manual (IA resume e pede confirmacao)
 *
 * Body:
 * {
 *   type: 'text' | 'file' | 'audio',
 *   content: '...',
 *   leadId: '...'
 * }
 *
 * Response:
 * {
 *   contextId: '...',
 *   summary: '...',
 *   audioUrl: '/audio/summary-xxx.mp3',
 *   requiresConfirmation: true
 * }
 */
router.post('/context/manual', aiController.addManualContext);

/**
 * POST /api/ai/context/confirm
 * Confirmar que o resumo da IA esta correto
 *
 * Body:
 * {
 *   contextId: '...',
 *   confirmed: true | false
 * }
 *
 * Response:
 * {
 *   saved: true,
 *   message: '...'
 * }
 */
router.post('/context/confirm', aiController.confirmContext);

/**
 * POST /api/ai/transcribe
 * Transcrever audio para texto (Whisper)
 *
 * Body: FormData with audio file
 *
 * Response:
 * {
 *   text: '...',
 *   language: 'pt'
 * }
 */
router.post('/transcribe', upload.single('audio'), aiController.transcribe);

/**
 * POST /api/ai/suggestions
 * Gerar sugestoes contextuais para um lead
 *
 * Body:
 * {
 *   leadId: '...',
 *   leadContext?: { ... },
 *   recentInteractions?: 5
 * }
 *
 * Response:
 * {
 *   suggestions: [{ id, type, title, description, priority, ... }],
 *   totalCount: 3,
 *   generatedAt: '...'
 * }
 */
router.post('/suggestions', aiController.getSuggestions);

/**
 * POST /api/ai/suggestions/action
 * Aceitar, rejeitar ou editar uma sugestao
 *
 * Body:
 * {
 *   suggestionId: '...',
 *   action: 'accept' | 'reject' | 'edit',
 *   editedMessage?: '...'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: '...',
 *   executedAction?: { type, result }
 * }
 */
router.post('/suggestions/action', aiController.suggestionAction);

/**
 * POST /api/ai/context/message
 * Salvar mensagem no arquivo de contexto do lead
 *
 * Body:
 * {
 *   leadId: '...',
 *   sender: 'LEAD' | 'VENDEDOR',
 *   content: '...',
 *   leadName?: '...'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: '...'
 * }
 */
router.post('/context/message', aiController.saveMessageToContext);

/**
 * GET /api/ai/context/:leadId
 * Ler contexto de um lead
 *
 * Response:
 * {
 *   leadId: '...',
 *   context: '...',
 *   hasContext: true
 * }
 */
router.get('/context/:leadId', aiController.getLeadContext);

/**
 * DELETE /api/ai/context/:leadId
 * Limpar contexto de um lead
 *
 * Response:
 * {
 *   success: true,
 *   message: '...'
 * }
 */
router.delete('/context/:leadId', aiController.clearLeadContext);

/**
 * GET /api/ai/contexts
 * Listar todos os leads com contexto
 *
 * Response:
 * {
 *   contexts: ['leadId1', 'leadId2', ...],
 *   totalCount: 5
 * }
 */
router.get('/contexts', aiController.listContexts);

/**
 * POST /api/ai/improve
 * Melhorar mensagem usando prompt da Lola + contexto do lead
 *
 * Body:
 * {
 *   leadId: '...',
 *   message: '...',
 *   promptName?: 'lola-transcription'
 * }
 *
 * Response:
 * {
 *   original: '...',
 *   improved: '...'
 * }
 */
router.post('/improve', aiController.improveMessage);

// ========================================
// Export
// ========================================

export default router;
