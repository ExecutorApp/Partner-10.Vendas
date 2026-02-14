# API de IA Assistente - Commercial

Backend para o modulo Commercial com integracao OpenAI.

## Instalacao

```bash
npm install
```

## Configuracao

1. Copie `.env.example` para `.env`
2. Preencha sua chave da OpenAI

## Executar

```bash
# Desenvolvimento
npm run dev

# Producao
npm run build
npm start
```

## Rotas

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /api/ai/chat | Enviar mensagem para IA |
| POST | /api/ai/context/manual | Adicionar contexto manual |
| POST | /api/ai/context/confirm | Confirmar contexto |
| POST | /api/ai/transcribe | Transcrever audio |

## Principios da IA

1. IA NUNCA envia mensagens automaticamente
2. TODAS respostas em AUDIO (TTS)
3. Contexto manual requer confirmacao
