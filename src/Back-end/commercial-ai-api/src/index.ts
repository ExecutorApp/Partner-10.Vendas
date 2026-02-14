// ========================================
// Entry Point do Backend IA
// ========================================

// Configuracao do Ambiente
// Carregar variaveis de ambiente ANTES de qualquer import
import dotenv from 'dotenv';
dotenv.config();

// Imports
import express from 'express';
import cors from 'cors';
import path from 'path';
import aiRoutes from './routes/ai.routes';
import lipSyncRoutes from './routes/lipSync.routes';
import evolutionRoutes from './routes/evolution.routes';

// ========================================
// Configuracao do Express
// ========================================

// Criar aplicacao
const app = express();

// Porta do servidor
const PORT = process.env.PORT || 3001;

// ========================================
// Middlewares
// ========================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON parser
app.use(express.json({ limit: '10mb' }));

// URL encoded parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos de audio estaticos
app.use('/audio', express.static(path.join(__dirname, '../audio')));

// ========================================
// Rotas
// ========================================

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Rotas de IA
app.use('/api/ai', aiRoutes);

// Rotas de Lip Sync
app.use('/api/lipsync', lipSyncRoutes);

// Rotas de Evolution API (Webhooks WhatsApp)
app.use('/api/evolution', evolutionRoutes);

// ========================================
// Error Handler
// ========================================

// Handler de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: err.message || 'Erro interno do servidor',
  });
});

// ========================================
// Iniciar Servidor
// ========================================

// Verificar chave da OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error('ERRO: OPENAI_API_KEY não configurada');
  console.error('Configure a variável de ambiente ou crie um arquivo .env');
  process.exit(1);
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Commercial AI API');
  console.log('========================================');
  console.log(`  Servidor rodando na porta ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  API IA: http://localhost:${PORT}/api/ai`);
  console.log(`  Lip Sync: http://localhost:${PORT}/api/lipsync`);
  console.log(`  Evolution: http://localhost:${PORT}/api/evolution`);
  console.log('========================================');
});

// ========================================
// Export
// ========================================

export default app;
