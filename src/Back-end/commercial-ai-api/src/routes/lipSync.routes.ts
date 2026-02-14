// ========================================
// Rotas de Sincronizacao Labial
// Endpoint para processar audio com Rhubarb
// ========================================

import { Router, Request, Response } from 'express'; //......Express
import multer from 'multer';                          //......Upload de arquivos
import fs from 'fs';                                  //......Sistema de arquivos
import path from 'path';                              //......Caminhos
import lipSyncService from '../services/lipSync.service';

// ========================================
// Configuracao do Router
// ========================================
const router = Router();                             //......Router Express

// ========================================
// Configuracao do Multer
// ========================================

// Diretorio temporario
const tempDir = path.join(__dirname, '../../temp');  //......Pasta temp

// Criar diretorio se nao existir
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configuracao de storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);                               //......Destino
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();                    //......Timestamp
    const ext = path.extname(file.originalname);     //......Extensao
    cb(null, `audio-${timestamp}${ext}`);            //......Nome unico
  },
});

// Instancia do multer
const upload = multer({
  storage,                                           //......Storage config
  limits: { fileSize: 10 * 1024 * 1024 },           //......Max 10MB
  fileFilter: (req, file, cb) => {
    // Aceitar apenas audio
    const allowedTypes = [
      'audio/mpeg',                                  //......MP3
      'audio/mp3',                                   //......MP3 alt
      'audio/wav',                                   //......WAV
      'audio/ogg',                                   //......OGG
      'audio/webm',                                  //......WebM
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);                                //......Aceitar
    } else {
      cb(new Error('Tipo de arquivo nao suportado'));//......Rejeitar
    }
  },
});

// ========================================
// POST /api/lipsync/analyze
// Analisa audio e retorna timing de visemes
// ========================================
router.post(
  '/analyze',
  upload.single('audio'),
  async (req: Request, res: Response) => {
    let audioPath: string | null = null;

    try {
      // Verificar se arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo de audio e obrigatorio',
        });
      }

      audioPath = req.file.path;                     //......Caminho do arquivo

      console.log('[LipSync] Recebido arquivo:', audioPath);

      // Processar com Rhubarb
      const result = await lipSyncService.processAudio(audioPath);

      // Limpar arquivo temporario
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      // Retornar resultado
      res.json(result);
    } catch (error: any) {
      console.error('[LipSync] Erro na rota:', error);

      // Limpar arquivo temporario em caso de erro
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar sincronizacao labial',
      });
    }
  }
);

// ========================================
// POST /api/lipsync/analyze-url
// Analisa audio a partir de URL
// ========================================
router.post('/analyze-url', async (req: Request, res: Response) => {
  let audioPath: string | null = null;

  try {
    const { audioUrl } = req.body;                   //......URL do audio

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        error: 'audioUrl e obrigatorio',
      });
    }

    console.log('[LipSync] Baixando audio:', audioUrl);

    // Baixar audio
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error('Falha ao baixar audio');
    }

    const arrayBuffer = await response.arrayBuffer();//......Buffer do audio
    const buffer = Buffer.from(arrayBuffer);         //......Converter para Buffer

    // Salvar arquivo temporario
    const timestamp = Date.now();                    //......Timestamp
    audioPath = path.join(tempDir, `audio-${timestamp}.mp3`);
    fs.writeFileSync(audioPath, buffer);             //......Salvar arquivo

    console.log('[LipSync] Audio salvo:', audioPath);

    // Processar com Rhubarb
    const result = await lipSyncService.processAudio(audioPath);

    // Limpar arquivo temporario
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    // Retornar resultado
    res.json(result);
  } catch (error: any) {
    console.error('[LipSync] Erro na rota:', error);

    // Limpar arquivo temporario em caso de erro
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar sincronizacao labial',
    });
  }
});

// ========================================
// GET /api/lipsync/health
// Health check do servico
// ========================================
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',                                    //......Status OK
    service: 'lip-sync',                             //......Nome do servico
    timestamp: new Date().toISOString(),             //......Timestamp
  });
});

// ========================================
// Export
// ========================================
export default router;
