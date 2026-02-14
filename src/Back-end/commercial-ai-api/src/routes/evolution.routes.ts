// ========================================
// Rotas Evolution API (Webhooks)
// Recebe eventos do WhatsApp
// ========================================

// ========================================
// Imports
// ========================================
import { Router, Request, Response } from 'express';
import evolutionService, { FormattedMessage } from '../services/evolution.service';

// ========================================
// Router
// ========================================
const router = Router();

// ========================================
// Storage em Memoria (Substituir por DB)
// ========================================
const messagesStore: Map<string, FormattedMessage[]> = new Map();
const connectionsStore: Map<string, string> = new Map();
const presenceStore: Map<string, any> = new Map();

// ========================================
// Callbacks de Eventos (Socket.io)
// ========================================
type EventCallback = (instanceName: string, data: any) => void;

const eventCallbacks: {
  onMessage?: EventCallback;                     //......Callback mensagem
  onMessageUpdate?: EventCallback;               //......Callback atualizacao
  onPresence?: EventCallback;                    //......Callback presenca
  onConnection?: EventCallback;                  //......Callback conexao
} = {};

// Registrar callback
export const registerCallback = (
  event: keyof typeof eventCallbacks,
  callback: EventCallback
) => {
  eventCallbacks[event] = callback;
};

// ========================================
// Webhook Principal
// ========================================
router.post('/webhook/:instanceName', async (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;         //......Nome da instancia
    const event = req.body;                      //......Dados do evento

    console.log(`[Evolution] Evento recebido: ${event.event} (${instanceName})`);

    // Processar baseado no tipo de evento
    switch (event.event) {
      case 'messages.upsert':
        await handleMessageReceived(instanceName, event.data);
        break;

      case 'messages.update':
        await handleMessageUpdate(instanceName, event.data);
        break;

      case 'messages.delete':
        await handleMessageDelete(instanceName, event.data);
        break;

      case 'presence.update':
        await handlePresenceUpdate(instanceName, event.data);
        break;

      case 'connection.update':
        await handleConnectionUpdate(instanceName, event.data);
        break;

      case 'qrcode.updated':
        await handleQRCodeUpdate(instanceName, event.data);
        break;

      case 'call':
        await handleCall(instanceName, event.data);
        break;

      default:
        console.log(`[Evolution] Evento nao tratado: ${event.event}`);
    }

    res.json({ success: true });                 //......Resposta OK
  } catch (error) {
    console.error('[Evolution] Erro no webhook:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========================================
// Handler: Mensagem Recebida
// ========================================
async function handleMessageReceived(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    const key = data.key;                        //......Chave da mensagem
    const messageData = data.message;            //......Dados da mensagem

    // Formatar mensagem
    const formattedMessage = evolutionService.formatMessage(key, messageData);

    // Armazenar mensagem
    const chatKey = `${instanceName}:${formattedMessage.from}`;
    const messages = messagesStore.get(chatKey) || [];
    messages.push(formattedMessage);
    messagesStore.set(chatKey, messages);

    console.log(`[Evolution] Mensagem recebida: ${formattedMessage.type}`);

    // Notificar via callback
    if (eventCallbacks.onMessage) {
      eventCallbacks.onMessage(instanceName, formattedMessage);
    }
  } catch (error) {
    console.error('[Evolution] Erro ao processar mensagem:', error);
  }
}

// ========================================
// Handler: Atualizacao de Mensagem
// ========================================
async function handleMessageUpdate(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    const update = data;                         //......Dados da atualizacao
    const status = evolutionService.mapMessageStatus(update.status);

    console.log(`[Evolution] Mensagem atualizada: ${update.key?.id} -> ${status}`);

    // Notificar via callback
    if (eventCallbacks.onMessageUpdate) {
      eventCallbacks.onMessageUpdate(instanceName, {
        messageId: update.key?.id,
        status: status,
      });
    }
  } catch (error) {
    console.error('[Evolution] Erro ao atualizar mensagem:', error);
  }
}

// ========================================
// Handler: Mensagem Deletada
// ========================================
async function handleMessageDelete(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    console.log(`[Evolution] Mensagem deletada: ${data.key?.id}`);

    // Notificar via callback
    if (eventCallbacks.onMessageUpdate) {
      eventCallbacks.onMessageUpdate(instanceName, {
        messageId: data.key?.id,
        status: 'DELETED',
      });
    }
  } catch (error) {
    console.error('[Evolution] Erro ao deletar mensagem:', error);
  }
}

// ========================================
// Handler: Atualizacao de Presenca
// ========================================
async function handlePresenceUpdate(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    const jid = data.id;                         //......JID do contato
    const presences = data.presences || {};      //......Presencas

    // Pegar primeira presenca
    const presence = Object.values(presences)[0] as any;
    const mappedPresence = evolutionService.mapPresence(
      presence?.lastKnownPresence || 'unavailable'
    );

    console.log(`[Evolution] Presenca: ${jid} -> ${mappedPresence}`);

    // Armazenar presenca
    presenceStore.set(`${instanceName}:${jid}`, {
      presence: mappedPresence,
      timestamp: new Date(),
    });

    // Notificar via callback
    if (eventCallbacks.onPresence) {
      eventCallbacks.onPresence(instanceName, {
        from: jid,
        presence: mappedPresence,
      });
    }
  } catch (error) {
    console.error('[Evolution] Erro ao atualizar presenca:', error);
  }
}

// ========================================
// Handler: Atualizacao de Conexao
// ========================================
async function handleConnectionUpdate(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    const state = data.state;                    //......Estado da conexao

    console.log(`[Evolution] Conexao: ${instanceName} -> ${state}`);

    // Armazenar estado
    connectionsStore.set(instanceName, state);

    // Notificar via callback
    if (eventCallbacks.onConnection) {
      eventCallbacks.onConnection(instanceName, {
        status: state,
      });
    }
  } catch (error) {
    console.error('[Evolution] Erro ao atualizar conexao:', error);
  }
}

// ========================================
// Handler: QR Code Atualizado
// ========================================
async function handleQRCodeUpdate(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    console.log(`[Evolution] QR Code atualizado: ${instanceName}`);

    // Notificar via callback
    if (eventCallbacks.onConnection) {
      eventCallbacks.onConnection(instanceName, {
        status: 'qrcode',
        qrcode: data.qrcode,
      });
    }
  } catch (error) {
    console.error('[Evolution] Erro ao atualizar QR Code:', error);
  }
}

// ========================================
// Handler: Chamada
// ========================================
async function handleCall(
  instanceName: string,
  data: any
): Promise<void> {
  try {
    console.log(`[Evolution] Chamada: ${data.from} -> ${data.status}`);

    // Notificar via callback se necessario
  } catch (error) {
    console.error('[Evolution] Erro ao processar chamada:', error);
  }
}

// ========================================
// Rota: Obter Mensagens
// ========================================
router.get('/messages/:instanceName/:number', (req: Request, res: Response) => {
  try {
    const { instanceName, number } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const jid = evolutionService.formatJid(number);
    const chatKey = `${instanceName}:${jid}`;
    const messages = messagesStore.get(chatKey) || [];

    // Retornar ultimas N mensagens
    const result = messages.slice(-limit);

    res.json({
      success: true,
      messages: result,
      total: result.length,
    });
  } catch (error) {
    console.error('[Evolution] Erro ao obter mensagens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========================================
// Rota: Obter Status da Conexao
// ========================================
router.get('/status/:instanceName', (req: Request, res: Response) => {
  try {
    const { instanceName } = req.params;
    const status = connectionsStore.get(instanceName) || 'unknown';

    res.json({
      success: true,
      instanceName: instanceName,
      status: status,
    });
  } catch (error) {
    console.error('[Evolution] Erro ao obter status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========================================
// Rota: Obter Presenca
// ========================================
router.get('/presence/:instanceName/:number', (req: Request, res: Response) => {
  try {
    const { instanceName, number } = req.params;
    const jid = evolutionService.formatJid(number);
    const key = `${instanceName}:${jid}`;
    const presence = presenceStore.get(key) || { presence: 'unknown' };

    res.json({
      success: true,
      ...presence,
    });
  } catch (error) {
    console.error('[Evolution] Erro ao obter presenca:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

// ========================================
// Export
// ========================================
export default router;
