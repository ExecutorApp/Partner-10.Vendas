// ========================================
// Servico de Contexto e Prompts
// ========================================

// Imports
import fs from 'fs';                      //......Modulo de arquivos
import path from 'path';                  //......Modulo de caminhos

// ========================================
// Configuracao de Caminhos
// ========================================

// Caminho da pasta de prompts
const PROMPTS_DIR = path.join(__dirname, '../../prompts');

// Caminho da pasta de contextos
const CONTEXTS_DIR = path.join(__dirname, '../../contexts');

// ========================================
// Tipos
// ========================================

// Tipo de remetente da mensagem
type MessageSender = 'LEAD' | 'VENDEDOR';

// Interface de mensagem
interface ChatMessage {
  timestamp: string;                      //......Data e hora
  sender: MessageSender;                  //......Quem enviou
  content: string;                        //......Conteudo
}

// ========================================
// Funcoes de Prompt
// ========================================

// Ler prompt de arquivo
const readPrompt = (promptName: string): string => {
  try {
    // Montar caminho do arquivo
    const promptPath = path.join(PROMPTS_DIR, `${promptName}.prompt.txt`);

    // Verificar se arquivo existe
    if (!fs.existsSync(promptPath)) {
      console.error(`Prompt nao encontrado: ${promptPath}`);
      return '';
    }

    // Ler e retornar conteudo
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Erro ao ler prompt:', error);
    return '';
  }
};

// Substituir variaveis no prompt
const formatPrompt = (
  promptTemplate: string,
  variables: Record<string, string>
): string => {
  let formatted = promptTemplate;

  // Substituir cada variavel
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
  });

  return formatted;
};

// ========================================
// Funcoes de Contexto
// ========================================

// Garantir que pasta de contextos existe
const ensureContextsDir = (): void => {
  if (!fs.existsSync(CONTEXTS_DIR)) {
    fs.mkdirSync(CONTEXTS_DIR, { recursive: true });
  }
};

// Obter caminho do arquivo de contexto do lead
const getContextPath = (leadId: string): string => {
  // Sanitizar leadId para nome de arquivo seguro
  const safeLeadId = leadId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join(CONTEXTS_DIR, `${safeLeadId}.txt`);
};

// Ler contexto de um lead
const readContext = (leadId: string): string => {
  try {
    ensureContextsDir();
    const contextPath = getContextPath(leadId);

    // Se arquivo nao existe retorna vazio
    if (!fs.existsSync(contextPath)) {
      return '';
    }

    // Ler e retornar conteudo
    return fs.readFileSync(contextPath, 'utf-8');
  } catch (error) {
    console.error('Erro ao ler contexto:', error);
    return '';
  }
};

// Formatar timestamp
const formatTimestamp = (): string => {
  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} ${time}`;
};

// Criar cabecalho do contexto para novo lead
const createContextHeader = (leadId: string, leadName?: string): string => {
  const timestamp = formatTimestamp();
  const name = leadName || 'Lead';

  return `=== LEAD: ${name} ===
ID/Telefone: ${leadId}
Inicio: ${timestamp}

--- HISTORICO ---

`;
};

// Formatar mensagem para contexto
const formatMessage = (sender: MessageSender, content: string): string => {
  const timestamp = formatTimestamp();
  return `[${timestamp}] ${sender}:
${content}

`;
};

// Adicionar mensagem ao contexto
const addMessageToContext = (
  leadId: string,
  sender: MessageSender,
  content: string,
  leadName?: string
): void => {
  try {
    ensureContextsDir();
    const contextPath = getContextPath(leadId);

    // Verificar se arquivo ja existe
    let currentContext = '';
    if (fs.existsSync(contextPath)) {
      currentContext = fs.readFileSync(contextPath, 'utf-8');
    } else {
      // Criar cabecalho para novo lead
      currentContext = createContextHeader(leadId, leadName);
    }

    // Formatar nova mensagem
    const formattedMessage = formatMessage(sender, content);

    // Concatenar e salvar
    const updatedContext = currentContext + formattedMessage;
    fs.writeFileSync(contextPath, updatedContext, 'utf-8');

    console.log(`Contexto atualizado para lead: ${leadId}`);
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao contexto:', error);
  }
};

// Obter ultimas N mensagens do contexto
const getRecentContext = (leadId: string, maxLines: number = 50): string => {
  const fullContext = readContext(leadId);

  if (!fullContext) {
    return 'Nenhum historico de conversa disponivel.';
  }

  // Pegar ultimas linhas para nao sobrecarregar o prompt
  const lines = fullContext.split('\n');
  if (lines.length > maxLines) {
    const recentLines = lines.slice(-maxLines);
    return '...(historico anterior omitido)\n\n' + recentLines.join('\n');
  }

  return fullContext;
};

// Limpar contexto de um lead
const clearContext = (leadId: string): boolean => {
  try {
    const contextPath = getContextPath(leadId);

    if (fs.existsSync(contextPath)) {
      fs.unlinkSync(contextPath);
      console.log(`Contexto removido para lead: ${leadId}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao limpar contexto:', error);
    return false;
  }
};

// Listar todos os leads com contexto
const listContexts = (): string[] => {
  try {
    ensureContextsDir();
    const files = fs.readdirSync(CONTEXTS_DIR);

    // Filtrar apenas arquivos .txt e remover extensao
    return files
      .filter((file) => file.endsWith('.txt'))
      .map((file) => file.replace('.txt', ''));
  } catch (error) {
    console.error('Erro ao listar contextos:', error);
    return [];
  }
};

// ========================================
// Funcao Principal: Preparar Prompt com Contexto
// ========================================

// Preparar prompt completo para IA
const preparePromptWithContext = (
  promptName: string,
  leadId: string,
  message: string
): string => {
  // Ler template do prompt
  const promptTemplate = readPrompt(promptName);

  if (!promptTemplate) {
    // Fallback se prompt nao existe
    return `Melhore esta mensagem de forma profissional:\n\n${message}`;
  }

  // Obter contexto recente do lead
  const context = getRecentContext(leadId);

  // Formatar prompt com variaveis
  const formattedPrompt = formatPrompt(promptTemplate, {
    context,
    message,
  });

  return formattedPrompt;
};

// ========================================
// Export
// ========================================

export const contextService = {
  // Prompts
  readPrompt,                             //......Ler prompt de arquivo
  formatPrompt,                           //......Formatar prompt com variaveis

  // Contextos
  readContext,                            //......Ler contexto de lead
  addMessageToContext,                    //......Adicionar mensagem ao contexto
  getRecentContext,                       //......Obter contexto recente
  clearContext,                           //......Limpar contexto de lead
  listContexts,                           //......Listar leads com contexto

  // Principal
  preparePromptWithContext,               //......Preparar prompt completo
};

export default contextService;
