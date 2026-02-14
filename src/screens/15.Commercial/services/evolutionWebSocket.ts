// ========================================
// Servico WebSocket Evolution API
// Conexao em tempo real para eventos
// ========================================

// ========================================
// Configuracao
// ========================================
const EVOLUTION_WS_URL = 'ws://localhost:8082';

// ========================================
// Tipos de Eventos
// ========================================
export type AckStatus = 0 | 1 | 2 | 3;     //......0=erro, 1=servidor, 2=entregue, 3=lido

// ========================================
// Interface de Evento de ACK
// ========================================
export interface MessageAckEvent {
  key: {                                   //......Chave da mensagem
    id: string;                            //......ID da mensagem
    remoteJid: string;                     //......JID remoto
    fromMe: boolean;                       //......Se e do usuario
  };
  ack: AckStatus;                          //......Status do ACK
  timestamp?: number;                      //......Timestamp do evento
}

// ========================================
// Interface de Evento de Mensagem
// ========================================
export interface MessageReceivedEvent {
  key: {                                   //......Chave da mensagem
    id: string;                            //......ID da mensagem
    remoteJid: string;                     //......JID remoto
    fromMe: boolean;                       //......Se e do usuario
  };
  message: any;                            //......Dados da mensagem
  messageType: string;                     //......Tipo da mensagem
  pushName?: string;                       //......Nome do remetente
  timestamp: number;                       //......Timestamp
}

// ========================================
// Tipos de Callback
// ========================================
type AckCallback = (event: MessageAckEvent) => void;
type MessageCallback = (event: MessageReceivedEvent) => void;
type ConnectionCallback = (connected: boolean) => void;

// ========================================
// Classe EvolutionWebSocket
// ========================================
class EvolutionWebSocket {
  // ========================================
  // Propriedades Privadas
  // ========================================
  private socket: WebSocket | null = null;
  private instanceName: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  // ========================================
  // Callbacks
  // ========================================
  private ackCallbacks: AckCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];

  // ========================================
  // Conectar ao WebSocket
  // ========================================
  connect(instanceName: string): void {
    console.log('[EvolutionWS] Conectando...', instanceName);

    // Evita conexoes duplicadas
    if (this.isConnecting) {
      console.log('[EvolutionWS] Ja esta conectando, ignorando');
      return;
    }

    // Desconecta se ja tiver conexao
    if (this.socket) {
      this.disconnect();
    }

    this.instanceName = instanceName;
    this.isConnecting = true;

    try {
      // URL do WebSocket da Evolution API
      const wsUrl = `${EVOLUTION_WS_URL}/${instanceName}`;
      console.log('[EvolutionWS] URL:', wsUrl);

      this.socket = new WebSocket(wsUrl);

      // ========================================
      // Handler de Abertura
      // ========================================
      this.socket.onopen = () => {
        console.log('[EvolutionWS] Conectado!');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
      };

      // ========================================
      // Handler de Mensagem
      // ========================================
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[EvolutionWS] Evento recebido:', data.event);

          // Processa eventos de ACK
          if (data.event === 'messages.update' || data.event === 'message.ack') {
            this.handleAckEvent(data.data);
          }

          // Processa eventos de mensagem recebida
          if (data.event === 'messages.upsert' || data.event === 'message') {
            this.handleMessageEvent(data.data);
          }
        } catch (error) {
          console.error('[EvolutionWS] Erro ao parsear evento:', error);
        }
      };

      // ========================================
      // Handler de Erro
      // ========================================
      this.socket.onerror = (error) => {
        console.error('[EvolutionWS] Erro:', error);
        this.isConnecting = false;
      };

      // ========================================
      // Handler de Fechamento
      // ========================================
      this.socket.onclose = (event) => {
        console.log('[EvolutionWS] Desconectado:', event.code, event.reason);
        this.isConnecting = false;
        this.notifyConnection(false);

        // Tenta reconectar se nao foi fechamento intencional
        if (event.code !== 1000 && this.instanceName) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[EvolutionWS] Erro ao criar WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // ========================================
  // Agendar Reconexao
  // ========================================
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[EvolutionWS] Maximo de tentativas atingido');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`[EvolutionWS] Reconectando em ${delay}ms (tentativa ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.instanceName) {
        this.connect(this.instanceName);
      }
    }, delay);
  }

  // ========================================
  // Desconectar
  // ========================================
  disconnect(): void {
    console.log('[EvolutionWS] Desconectando...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Desconexao intencional');
      this.socket = null;
    }

    this.instanceName = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  // ========================================
  // Processar Evento de ACK
  // ========================================
  private handleAckEvent(data: any): void {
    console.log('[EvolutionWS] ACK recebido:', JSON.stringify(data, null, 2));

    // Formato pode variar, tenta extrair key e ack
    let ackEvent: MessageAckEvent | null = null;

    // Formato 1: Array de updates
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.key && item.update?.status !== undefined) {
          ackEvent = {
            key: item.key,
            ack: item.update.status as AckStatus,
            timestamp: Date.now(),
          };
          this.notifyAck(ackEvent);
        }
      });
      return;
    }

    // Formato 2: Objeto direto com key e ack
    if (data.key && data.ack !== undefined) {
      ackEvent = {
        key: data.key,
        ack: data.ack as AckStatus,
        timestamp: Date.now(),
      };
      this.notifyAck(ackEvent);
      return;
    }

    // Formato 3: Objeto com update.status
    if (data.key && data.update?.status !== undefined) {
      ackEvent = {
        key: data.key,
        ack: data.update.status as AckStatus,
        timestamp: Date.now(),
      };
      this.notifyAck(ackEvent);
      return;
    }
  }

  // ========================================
  // Processar Evento de Mensagem
  // ========================================
  private handleMessageEvent(data: any): void {
    console.log('[EvolutionWS] Mensagem recebida:', JSON.stringify(data, null, 2));

    // Formato pode variar
    if (data.key && data.message) {
      const messageEvent: MessageReceivedEvent = {
        key: data.key,
        message: data.message,
        messageType: data.messageType || 'unknown',
        pushName: data.pushName,
        timestamp: data.messageTimestamp || Date.now(),
      };
      this.notifyMessage(messageEvent);
    }
  }

  // ========================================
  // Notificar Callbacks de ACK
  // ========================================
  private notifyAck(event: MessageAckEvent): void {
    console.log('[EvolutionWS] Notificando ACK:', event.key.id, 'status:', event.ack);
    this.ackCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('[EvolutionWS] Erro em callback ACK:', error);
      }
    });
  }

  // ========================================
  // Notificar Callbacks de Mensagem
  // ========================================
  private notifyMessage(event: MessageReceivedEvent): void {
    console.log('[EvolutionWS] Notificando mensagem:', event.key.id);
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('[EvolutionWS] Erro em callback mensagem:', error);
      }
    });
  }

  // ========================================
  // Notificar Callbacks de Conexao
  // ========================================
  private notifyConnection(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('[EvolutionWS] Erro em callback conexao:', error);
      }
    });
  }

  // ========================================
  // Registrar Callback de ACK
  // ========================================
  onAck(callback: AckCallback): () => void {
    this.ackCallbacks.push(callback);
    // Retorna funcao para remover callback
    return () => {
      this.ackCallbacks = this.ackCallbacks.filter((cb) => cb !== callback);
    };
  }

  // ========================================
  // Registrar Callback de Mensagem
  // ========================================
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    // Retorna funcao para remover callback
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  // ========================================
  // Registrar Callback de Conexao
  // ========================================
  onConnection(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    // Retorna funcao para remover callback
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((cb) => cb !== callback);
    };
  }

  // ========================================
  // Verificar se esta Conectado
  // ========================================
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// ========================================
// Instancia Singleton
// ========================================
export const evolutionWebSocket = new EvolutionWebSocket();

// ========================================
// Export Default
// ========================================
export default evolutionWebSocket;
