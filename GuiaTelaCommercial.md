# Guia de Integração - Tela Commercial + IA Assistente

**Desenvolvido em:** Partner-10.Vendas - Copia
**Para integrar em:** Partner-10.Vendas
**Versão:** 2.0
**Data:** 2026-01-30
**Status:** FASE 8 CONCLUÍDA - Todos os módulos implementados

---

## RESUMO DO PROJETO

| FASE | Status | Arquivos |
|------|--------|----------|
| FASE 1: Fundação | ✅ CONCLUÍDA | Estrutura base |
| FASE 2: Kanban | ✅ CONCLUÍDA | 12 componentes |
| FASE 3: IA Básica | ✅ CONCLUÍDA | 8 componentes |
| FASE 4: Voz/Contexto | ✅ CONCLUÍDA | 6 componentes |
| FASE 5: Dashboard | ✅ CONCLUÍDA | 8 componentes |
| FASE 6: Canal Entrada | ✅ CONCLUÍDA | 6 componentes |
| FASE 7: IA Avançada | ✅ CONCLUÍDA | 5 componentes |
| FASE 8: Finalização | ✅ CONCLUÍDA | 7 arquivos divididos |

**Total: 59 arquivos | ~21.000 linhas de código**

---

## ANTES DE COMEÇAR

### Arquivos para Copiar Manualmente

```
DE: Partner-10.Vendas - Copia
PARA: Partner-10.Vendas

1. src/screens/15.Commercial/     → src/screens/15.Commercial/
2. src/Back-end/                  → src/Back-end/
3. GuiaTelaCommercial.md          → GuiaTelaCommercial.md (raiz)
```

---

## CORES IDENTIFICADAS NO PROJETO

### Cores Principais (src/constants/theme.ts)

| Variável | Cor | Uso |
|----------|-----|-----|
| primary | #021632 | Cor primária escura |
| accent | #1777CF | Botões de ação, destaque, IA |
| background | #FCFCFC | Fundo principal |
| backgroundAlt | #F4F4F4 | Fundo alternativo |
| textPrimary | #3A3F51 | Texto principal |
| textSecondary | #7D8592 | Texto secundário |
| textPlaceholder | #91929E | Placeholders |
| border | #D8E0F0 | Bordas |
| white | #FFFFFF | Cards, modais |

### Cores de Status

| Tipo | Cor | Uso |
|------|-----|-----|
| success | #22C55E | Status positivo, leads ganhos |
| warning | #F59E0B | Alertas, leads mornos |
| danger | #EF4444 | Erros, leads quentes |
| successBg | #DCFCE7 | Background sucesso |
| dangerBg | #FDEAEA | Background erro |

### Cores de Redes Sociais

| Rede | Cor |
|------|-----|
| Instagram | #E4405F |
| Facebook | #1877F2 |
| WhatsApp | #25D366 |
| LinkedIn | #0A66C2 |
| TikTok | #000000 |
| Twitter | #1DA1F2 |
| Telegram | #0088CC |

### Cores de Status de Lead

| Status | Cor | Label |
|--------|-----|-------|
| hot | #EF4444 | Quente |
| warm | #F59E0B | Morno |
| cold | #1777CF | Frio |
| won | #22C55E | Ganho |
| lost | #7D8592 | Perdido |

---

## BIBLIOTECAS NECESSÁRIAS

### Frontend (React Native / Expo)

```bash
# Áudio (gravação, playback, TTS)
npx expo install expo-av

# Seleção de arquivos
npx expo install expo-document-picker

# Gráficos do dashboard
npx expo install react-native-chart-kit

# Já devem estar instalados:
# - react-native-gesture-handler
# - react-native-reanimated
# - react-native-svg
```

### Backend (Node.js)

```bash
cd src/Back-end/commercial-ai-api

# Dependências de produção
npm install express cors dotenv openai multer

# Dependências de desenvolvimento
npm install -D typescript @types/node @types/express @types/cors @types/multer ts-node nodemon
```

---

## ESTRUTURA DE ARQUIVOS COMPLETA

```
src/screens/15.Commercial/
├── 00.CommercialScreen.tsx                    # Tela principal (583 linhas)
├── README.md                                  # Documentação do módulo
│
├── types/
│   ├── commercial.types.ts                    # Tipos: Kanban, Canal, Dashboard
│   └── ai.types.ts                            # Tipos: IA, Contexto, Settings
│
├── contexts/
│   ├── CommercialContext.tsx                  # Re-export → CommercialContext01
│   ├── AIAssistantContext.tsx                 # Re-export → AIAssistantContext01
│   ├── AIAssistantContext01.tsx               # Contexto da IA (Provider)
│   ├── AIAssistantContext02.tsx               # Tipos e constantes
│   └── KanbanContext.tsx                      # Contexto do Kanban
│
├── hooks/
│   ├── useKanbanData.ts                       # Hook de dados Kanban
│   ├── useVoicePlayer.ts                      # Hook de reprodução TTS
│   └── useDashboardMetrics.ts                 # Hook de métricas
│
├── services/
│   └── aiService.ts                           # Service HTTP para API
│
├── utils/
│   ├── audioUtils.ts                          # Utilitários de áudio
│   └── contextBuilder.ts                      # Construtor de contexto
│
├── components/
│   ├── tabs/
│   │   ├── 01.01.ChannelTab.tsx               # Tab de canal
│   │   ├── 01.02.FunnelTab.tsx                # Tab de funil
│   │   ├── 01.03.DashboardTab.tsx             # Tab de dashboard
│   │   └── 01.04.AITab.tsx                    # Tab de IA
│   │
│   ├── kanban/
│   │   ├── 02.01.KanbanBoard.tsx              # Board desktop
│   │   ├── 02.02.KanbanMobileView.tsx         # Re-export → 02.02.01
│   │   ├── 02.02.01.KanbanMobileView.tsx      # View mobile
│   │   ├── 02.02.02.KanbanMobileViewStyles.tsx # Estilos mobile
│   │   ├── 02.03.KanbanColumn.tsx             # Coluna
│   │   ├── 02.04.KanbanCard.tsx               # Card do lead
│   │   ├── 02.05.KanbanPhaseHeader.tsx        # Header da fase
│   │   ├── 02.06.PhaseManager.tsx             # Gerenciador de fases
│   │   ├── 02.07.CreatePhaseModal.tsx         # Modal criar fase
│   │   ├── 02.08.CreateColumnModal.tsx        # Re-export → 02.08.01
│   │   ├── 02.08.01.CreateColumnModal.tsx     # Modal criar coluna
│   │   ├── 02.08.02.CreateColumnModalStyles.tsx # Estilos modal coluna
│   │   ├── 02.09.CardDetailsModal.tsx         # Re-export → 02.09.01
│   │   ├── 02.09.01.CardDetailsModal.tsx      # Modal detalhes card
│   │   └── 02.09.02.CardDetailsModalStyles.tsx # Estilos detalhes
│   │
│   ├── ai/
│   │   ├── AssistantChat.tsx                  # Interface do chat
│   │   ├── ChatMessage.tsx                    # Bolha de mensagem
│   │   ├── ChatInput.tsx                      # Input de texto
│   │   ├── AudioPlayer.tsx                    # Player de áudio
│   │   ├── VoicePlayer.tsx                    # Player com ondas
│   │   ├── VoiceRecorder.tsx                  # Gravador de áudio
│   │   ├── ContextInput.tsx                   # Re-export → ContextInput01
│   │   ├── ContextInput01.tsx                 # Interface de contexto
│   │   ├── ContextInput02.tsx                 # Estilos do contexto
│   │   ├── AssistantResponseModal.tsx         # Modal lateral
│   │   ├── 07.01.AISettingsModal.tsx          # Modal configurações
│   │   └── 07.02.SuggestionCard.tsx           # Card de sugestão
│   │
│   ├── channel/
│   │   ├── 06.01.ChannelEntryCard.tsx         # Card de entrada
│   │   ├── 06.02.ChannelModal.tsx             # Re-export → 06.02.01
│   │   ├── 06.02.01.ChannelModal.tsx          # Modal do canal
│   │   └── 06.02.02.ChannelModalStyles.tsx    # Estilos do modal
│   │
│   └── dashboard/
│       ├── 05.01.DashboardOverview.tsx        # Layout principal
│       ├── 05.02.MetricsCards.tsx             # Cards de métricas
│       ├── 05.03.PhaseChart.tsx               # Gráfico por fase
│       ├── 05.04.ConversionFunnel.tsx         # Funil de conversão
│       ├── 05.05.TimelineChart.tsx            # Gráfico temporal
│       ├── 05.06.ReportsModal.tsx             # Re-export → 05.06.01
│       ├── 05.06.01.ReportsModal.tsx          # Modal de relatórios
│       ├── 05.06.02.ReportsModalStyles.tsx    # Estilos do modal
│       └── 05.07.ConversationHistory.tsx      # Histórico conversas

src/Back-end/commercial-ai-api/
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts                               # Entry point
    ├── routes/ai.routes.ts                    # Rotas da API
    ├── controllers/ai.controller.ts           # Controllers
    ├── services/
    │   ├── openai.service.ts                  # Serviço OpenAI
    │   └── context.service.ts                 # Serviço de contexto
    └── types/api.types.ts                     # Tipos da API
```

---

## ARQUIVOS DIVIDIDOS (FASE 8)

Os seguintes arquivos foram divididos por ultrapassarem 600 linhas:

| Arquivo Original | Linhas | Arquivo 01 (Componente) | Arquivo 02 (Estilos) |
|-----------------|--------|------------------------|---------------------|
| ContextInput.tsx | 734 | ContextInput01.tsx | ContextInput02.tsx |
| 02.09.CardDetailsModal.tsx | 741 | 02.09.01.CardDetailsModal.tsx | 02.09.02.CardDetailsModalStyles.tsx |
| 02.02.KanbanMobileView.tsx | 686 | 02.02.01.KanbanMobileView.tsx | 02.02.02.KanbanMobileViewStyles.tsx |
| 02.08.CreateColumnModal.tsx | 669 | 02.08.01.CreateColumnModal.tsx | 02.08.02.CreateColumnModalStyles.tsx |
| 06.02.ChannelModal.tsx | 682 | 06.02.01.ChannelModal.tsx | 06.02.02.ChannelModalStyles.tsx |
| AIAssistantContext.tsx | 651 | AIAssistantContext01.tsx | AIAssistantContext02.tsx |
| 05.06.ReportsModal.tsx | 610 | 05.06.01.ReportsModal.tsx | 05.06.02.ReportsModalStyles.tsx |

**Estratégia de Divisão:**
- Arquivo 01: Imports, Tipos locais, Componente, Handlers, JSX
- Arquivo 02: StyleSheet, COLORS, Constantes exportáveis
- Arquivo Original: Re-export para manter compatibilidade

---

## INTEGRAÇÕES OBRIGATÓRIAS

### 1. Tipos de Navegação

**Arquivo:** `src/types/navigation.ts`

```typescript
// Em RootStackParamList, adicionar:
CommercialHome: undefined;

// Em ScreenNames, adicionar:
CommercialHome: 'CommercialHome' as const,
```

### 2. Navegador Principal

**Arquivo:** `src/navigation/AppNavigator.tsx`

```typescript
// Import
import CommercialScreen from '../screens/15.Commercial/00.CommercialScreen';

// Screen
<Stack.Screen
  name={ScreenNames.CommercialHome}
  options={{ headerShown: false }}
>
  {() => <CommercialScreen />}
</Stack.Screen>
```

### 3. Menu Lateral (Opcional)

**Arquivo:** `src/screens/5.Side Menu/1.SideMenuScreen.tsx`

```typescript
// Adicionar item no menuItems:
{
  id: 'commercial',
  label: 'Commercial',
  icon: CommercialIcon,
  screen: ScreenNames.CommercialHome,
},
```

---

## CONFIGURAÇÃO DO BACKEND

### Arquivo .env

```env
# OpenAI
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-4
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova
OPENAI_WHISPER_MODEL=whisper-1

# Server
PORT=3001
NODE_ENV=development
```

### Iniciar o Backend

```bash
cd src/Back-end/commercial-ai-api
npm install
npm run dev
```

---

## ROTAS DA API

### POST /api/ai/chat

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "Olá" }],
  "leadContext": { "leadId": "123", "name": "João" }
}
```

**Response:**
```json
{
  "message": "Resposta da IA...",
  "audioUrl": "http://localhost:3001/audio/response.mp3",
  "suggestions": ["Sugestão 1", "Sugestão 2"]
}
```

### POST /api/ai/context/manual

**Request:**
```json
{
  "type": "text",
  "content": "Contexto manual...",
  "leadId": "123"
}
```

**Response:**
```json
{
  "contextId": "ctx-456",
  "summary": "Resumo da IA...",
  "audioUrl": "http://localhost:3001/audio/summary.mp3",
  "requiresConfirmation": true
}
```

### POST /api/ai/context/confirm

### POST /api/ai/transcribe

---

## PRINCÍPIOS CRÍTICOS DA IA

1. **IA NUNCA envia mensagens automaticamente**
2. **TODAS respostas em ÁUDIO (TTS)**
3. **Modal lateral 40% (desktop) / bottom-up (mobile)**
4. **Contexto manual requer confirmação**
5. **FAB sempre visível em todas as tabs**

---

## CHECKLIST DE TESTES

### Backend
- [ ] npm run dev inicia na porta 3001
- [ ] GET /health retorna status ok
- [ ] POST /api/ai/chat retorna message + audioUrl

### Frontend - Kanban
- [ ] Board desktop renderiza fases lado a lado
- [ ] Mobile mostra uma coluna por vez
- [ ] Swipe funciona no mobile
- [ ] Cards mostram info do lead
- [ ] CardDetailsModal abre ao clicar

### Frontend - Chat IA
- [ ] Tab Chat renderiza AssistantChat
- [ ] Mensagens aparecem no histórico
- [ ] Áudio TTS reproduz automaticamente
- [ ] VoicePlayer com 40 barras anima

### Frontend - Dashboard
- [ ] 4 cards de métricas renderizam
- [ ] Gráficos interativos funcionam
- [ ] Histórico de conversas carrega

### Frontend - Canal
- [ ] Cards de entrada renderizam
- [ ] Modal de detalhes abre
- [ ] Cores de redes sociais corretas

---

## TROUBLESHOOTING

### Erro: "expo-av não encontrado"
```bash
npx expo install expo-av
npx expo start --clear
```

### Erro: "Screen CommercialHome não existe"
1. Import no AppNavigator.tsx
2. Screen registrada no Stack.Navigator
3. Tipo adicionado no navigation.ts

### Erro: "Backend não responde"
```bash
cd src/Back-end/commercial-ai-api
npm run dev
# Verificar porta: lsof -i :3001
```

### Erro: "Áudio não reproduz"
```json
// app.json
{
  "expo": {
    "plugins": [
      ["expo-av", { "microphonePermission": "Permitir gravação" }]
    ]
  }
}
```

---

## ESTATÍSTICAS FINAIS

| Métrica | Valor |
|---------|-------|
| Total de arquivos TypeScript/TSX | 52 |
| Total de arquivos Backend | 7 |
| Total de arquivos divididos | 7 |
| Linhas de código estimadas | ~21.000 |
| Componentes React | 35 |
| Hooks customizados | 3 |
| Contextos React | 3 |
| Rotas de API | 4 |

---

## INTEGRAÇÃO EVOLUTION API (WhatsApp)

### O que é Evolution API?

- API REST completa para WhatsApp
- 100% gratuita e open source
- Funciona via WhatsApp Web Protocol
- Suporta TODAS as funcionalidades do WhatsApp
- Multi-instâncias (vários números/vendedores)
- Webhooks em tempo real

**Repositório:** https://github.com/EvolutionAPI/evolution-api
**Documentação:** https://doc.evolution-api.com

### Arquitetura

```
[App React Native] → [Backend Node.js] → [Evolution API] → [WhatsApp Real]
```

### Arquivos Criados

```
src/screens/15.Commercial/services/
├── evolutionService.ts          # Serviço principal Evolution API
├── instanceManager.ts           # Gerenciador multi-vendedor
├── uploadService.ts             # Upload de mídias (S3)
└── index.ts                     # Exports dos serviços

src/screens/15.Commercial/components/Settings/
├── 10.01.WhatsAppSetup.tsx      # Tela de configuração WhatsApp
└── index.ts                     # Export do componente

src/Back-end/commercial-ai-api/src/
├── services/evolution.service.ts # Serviço backend Evolution
├── routes/evolution.routes.ts    # Rotas de webhook
└── scripts/setupEvolution.js     # Script de configuração
```

### Setup da Evolution API

#### 1. Instalar Evolution API (Docker)

```bash
# Criar docker-compose.yml
version: '3'
services:
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=https://seu-dominio.com
      - AUTHENTICATION_API_KEY=sua-chave-secreta
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://user:pass@postgres:5432/evolution
    volumes:
      - evolution_instances:/evolution/instances

# Iniciar
docker-compose up -d
```

#### 2. Configurar Variáveis de Ambiente

```env
# .env do backend
EVOLUTION_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-evolution-aqui
BACKEND_URL=http://localhost:3001
```

#### 3. Configurar Webhooks

```bash
cd src/Back-end/commercial-ai-api
node scripts/setupEvolution.js
```

#### 4. Conectar WhatsApp (Cada Vendedor)

1. Acessar "Configurações > WhatsApp"
2. Clicar em "Gerar QR Code"
3. Escanear no WhatsApp do celular
4. Aguardar conexão

### Funcionalidades Disponíveis

| Funcionalidade | Status |
|----------------|--------|
| Enviar/receber texto | ✅ |
| Enviar/receber áudio | ✅ |
| Enviar/receber imagem | ✅ |
| Enviar/receber vídeo | ✅ |
| Enviar/receber documento | ✅ |
| Enviar localização | ✅ |
| Enviar contato | ✅ |
| Reagir mensagens | ✅ |
| Editar mensagens | ✅ |
| Deletar mensagens | ✅ |
| Status de leitura (✓✓) | ✅ |
| Typing indicator | ✅ |
| Presence (online/offline) | ✅ |
| Multi-instâncias | ✅ |
| Webhooks tempo real | ✅ |

### Uso dos Serviços

```typescript
// Importar serviços
import { evolutionService, instanceManager } from '../services';

// Verificar conexão
const connected = await instanceManager.isConnected(userId);

// Enviar mensagem de texto
await evolutionService.sendText(instanceName, '5511999999999', 'Olá!');

// Enviar áudio
await evolutionService.sendAudio(instanceName, '5511999999999', audioUrl);

// Enviar imagem
await evolutionService.sendImage(instanceName, '5511999999999', imageUrl, 'Legenda');

// Atualizar presença (digitando)
await evolutionService.updatePresence(instanceName, '5511999999999', 'composing');
```

### Custos Estimados

| Item | Custo Mensal |
|------|--------------|
| Evolution API | R$ 0 (open source) |
| VPS (DigitalOcean/AWS) | R$ 50-150 |
| S3 (mídias) | ~R$ 10 |
| **Total** | **~R$ 60-160** |

**Comparação:** API Oficial WhatsApp Business = R$ 600-3.000/mês

---

**Documentação gerada em:** 2026-01-30
**Versão do projeto:** 2.0
