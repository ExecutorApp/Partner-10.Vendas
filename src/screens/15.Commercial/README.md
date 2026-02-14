# Módulo Commercial - Tela de Vendas com IA Assistente

## Visão Geral

Este módulo implementa a tela Commercial com sistema de IA Assistente integrado.
A IA auxilia corretores no gerenciamento de leads através de um funil de vendas (Kanban).

---

## Funcionalidades Principais

### 1. Canal de Entrada
- Registro de origem do lead
- Tipos: Rede Social, Landing Page, Indicação, Direct, Outros
- Histórico completo de entrada

### 2. Funil de Vendas (Kanban)
- Estrutura: FASES > COLUNAS > CARDS
- Drag and drop entre colunas
- Mobile: uma coluna por vez

### 3. Dashboard
- Métricas de conversão
- Gráficos de desempenho
- Relatórios exportáveis

### 4. IA Assistente
- Sugestões contextuais
- Respostas em ÁUDIO (TTS)
- Contexto manual com confirmação
- Modal lateral para aprovação

---

## Estrutura de Arquivos

```
15.Commercial/
├── README.md                    # Este arquivo
├── types/
│   ├── commercial.types.ts      # Tipos: Kanban, Canal, Dashboard
│   └── ai.types.ts              # Tipos: IA, Contexto, Settings
├── contexts/
│   ├── CommercialContext.tsx    # Contexto principal
│   ├── AIAssistantContext.tsx   # Contexto da IA
│   └── KanbanContext.tsx        # Contexto do Kanban
├── components/
│   ├── tabs/                    # Abas da tela
│   ├── kanban/                  # Componentes do Kanban
│   ├── ai/                      # Componentes da IA
│   ├── channel/                 # Componentes de Canal
│   └── dashboard/               # Componentes do Dashboard
└── 00.CommercialScreen.tsx      # Tela principal
```

---

## Princípios da IA

### Regras Absolutas

1. **IA NUNCA envia mensagens automaticamente**
2. **TODAS respostas em ÁUDIO (TTS)**
3. **Modal lateral 40% para sugestões**
4. **Contexto manual requer confirmação**
5. **FAB sempre visível**

---

## Cores Utilizadas

| Uso | Cor |
|-----|-----|
| Accent/Botões | #1777CF |
| Background | #FCFCFC |
| Background Alt | #F4F4F4 |
| Text Primary | #3A3F51 |
| Text Secondary | #7D8592 |
| Border | #D8E0F0 |
| Success | #22C55E |
| Warning | #F59E0B |
| Danger | #EF4444 |

---

## Como Usar

### Importar a Tela

```typescript
import CommercialScreen from './screens/15.Commercial/00.CommercialScreen';
```

### Navegar para a Tela

```typescript
navigation.navigate('CommercialHome');
```

---

## Dependências

- expo-speech (TTS)
- expo-av (áudio)
- react-native-gesture-handler
- react-native-reanimated
- react-native-svg

---

## Backend

O backend está em `src/Back-end/commercial-ai-api/`.
Consulte o README do backend para instruções de configuração.

---

## Integração

Consulte o arquivo `GuiaTelaCommercial.md` na raiz do projeto para instruções completas de integração.
