// ========================================
// Servico Evolution API (Backend)
// Processamento de webhooks e mensagens
// ========================================

// ========================================
// Interfaces
// ========================================

// Chave da mensagem
interface MessageKey {
  id: string;                                    //......ID da mensagem
  remoteJid: string;                             //......JID remoto
  fromMe: boolean;                               //......Se e do usuario
  messageTimestamp?: string;                     //......Timestamp
}

// Dados da mensagem
interface MessageData {
  conversation?: string;                         //......Texto simples
  extendedTextMessage?: {                        //......Texto estendido
    text: string;                                //......Texto
  };
  imageMessage?: {                               //......Imagem
    url: string;                                 //......URL
    caption?: string;                            //......Legenda
    mimetype: string;                            //......Tipo MIME
  };
  audioMessage?: {                               //......Audio
    url: string;                                 //......URL
    seconds: number;                             //......Duracao
    mimetype: string;                            //......Tipo MIME
  };
  videoMessage?: {                               //......Video
    url: string;                                 //......URL
    caption?: string;                            //......Legenda
    seconds: number;                             //......Duracao
    mimetype: string;                            //......Tipo MIME
  };
  documentMessage?: {                            //......Documento
    url: string;                                 //......URL
    fileName: string;                            //......Nome do arquivo
    mimetype: string;                            //......Tipo MIME
  };
  locationMessage?: {                            //......Localizacao
    degreesLatitude: number;                     //......Latitude
    degreesLongitude: number;                    //......Longitude
    name?: string;                               //......Nome
    address?: string;                            //......Endereco
  };
  contactMessage?: {                             //......Contato
    displayName: string;                         //......Nome
    vcard: string;                               //......VCard
  };
  stickerMessage?: {                             //......Sticker
    url: string;                                 //......URL
    mimetype: string;                            //......Tipo MIME
  };
}

// Mensagem formatada
export interface FormattedMessage {
  id: string;                                    //......ID da mensagem
  from: string;                                  //......Remetente
  fromMe: boolean;                               //......Se e do usuario
  timestamp: Date;                               //......Data/hora
  type: string;                                  //......Tipo da mensagem
  content: any;                                  //......Conteudo
  key: MessageKey;                               //......Chave original
}

// ========================================
// Servico Evolution
// ========================================
export const evolutionService = {
  // ========================================
  // Determinar Tipo da Mensagem
  // ========================================
  getMessageType(messageData: MessageData): string {
    if (messageData.conversation || messageData.extendedTextMessage) {
      return 'text';                             //......Texto
    }
    if (messageData.imageMessage) {
      return 'image';                            //......Imagem
    }
    if (messageData.videoMessage) {
      return 'video';                            //......Video
    }
    if (messageData.audioMessage) {
      return 'audio';                            //......Audio
    }
    if (messageData.documentMessage) {
      return 'document';                         //......Documento
    }
    if (messageData.locationMessage) {
      return 'location';                         //......Localizacao
    }
    if (messageData.contactMessage) {
      return 'contact';                          //......Contato
    }
    if (messageData.stickerMessage) {
      return 'sticker';                          //......Sticker
    }
    return 'unknown';                            //......Desconhecido
  },

  // ========================================
  // Extrair Conteudo da Mensagem
  // ========================================
  getMessageContent(messageData: MessageData, type: string): any {
    switch (type) {
      case 'text':
        return {
          text: messageData.conversation ||
                messageData.extendedTextMessage?.text || '',
        };

      case 'image':
        return {
          url: messageData.imageMessage?.url,
          caption: messageData.imageMessage?.caption,
          mimetype: messageData.imageMessage?.mimetype,
        };

      case 'audio':
        return {
          url: messageData.audioMessage?.url,
          duration: messageData.audioMessage?.seconds,
          mimetype: messageData.audioMessage?.mimetype,
        };

      case 'video':
        return {
          url: messageData.videoMessage?.url,
          caption: messageData.videoMessage?.caption,
          duration: messageData.videoMessage?.seconds,
          mimetype: messageData.videoMessage?.mimetype,
        };

      case 'document':
        return {
          url: messageData.documentMessage?.url,
          fileName: messageData.documentMessage?.fileName,
          mimetype: messageData.documentMessage?.mimetype,
        };

      case 'location':
        return {
          latitude: messageData.locationMessage?.degreesLatitude,
          longitude: messageData.locationMessage?.degreesLongitude,
          name: messageData.locationMessage?.name,
          address: messageData.locationMessage?.address,
        };

      case 'contact':
        return {
          displayName: messageData.contactMessage?.displayName,
          vcard: messageData.contactMessage?.vcard,
        };

      case 'sticker':
        return {
          url: messageData.stickerMessage?.url,
          mimetype: messageData.stickerMessage?.mimetype,
        };

      default:
        return {};                               //......Vazio
    }
  },

  // ========================================
  // Formatar Mensagem Recebida
  // ========================================
  formatMessage(key: MessageKey, messageData: MessageData): FormattedMessage {
    const type = this.getMessageType(messageData);
    const content = this.getMessageContent(messageData, type);
    const timestamp = key.messageTimestamp
      ? new Date(parseInt(key.messageTimestamp) * 1000)
      : new Date();

    return {
      id: key.id,                                //......ID da mensagem
      from: key.remoteJid,                       //......Remetente
      fromMe: key.fromMe,                        //......Se e do usuario
      timestamp: timestamp,                      //......Data/hora
      type: type,                                //......Tipo
      content: content,                          //......Conteudo
      key: key,                                  //......Chave original
    };
  },

  // ========================================
  // Extrair Numero do JID
  // ========================================
  extractNumber(jid: string): string {
    if (!jid) return '';                         //......JID vazio
    return jid.split('@')[0] || '';              //......Retorna numero
  },

  // ========================================
  // Formatar Numero para JID
  // ========================================
  formatJid(number: string): string {
    const cleanNumber = number.replace(/\D/g, '');
    return `${cleanNumber}@s.whatsapp.net`;      //......Retorna JID
  },

  // ========================================
  // Mapear Status da Mensagem
  // ========================================
  mapMessageStatus(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'ERROR',                                //......Erro
      1: 'PENDING',                              //......Pendente
      2: 'SENT',                                 //......Enviada
      3: 'DELIVERED',                            //......Entregue
      4: 'READ',                                 //......Lida
      5: 'PLAYED',                               //......Reproduzida
    };
    return statusMap[status] || 'UNKNOWN';       //......Desconhecido
  },

  // ========================================
  // Mapear Presenca
  // ========================================
  mapPresence(presence: string): string {
    const presenceMap: Record<string, string> = {
      available: 'online',                       //......Online
      unavailable: 'offline',                    //......Offline
      composing: 'typing',                       //......Digitando
      recording: 'recording',                    //......Gravando
      paused: 'paused',                          //......Pausado
    };
    return presenceMap[presence] || 'unknown';   //......Desconhecido
  },
};

// ========================================
// Export Default
// ========================================
export default evolutionService;
