// ========================================
// Tipos do Chat WhatsApp Clone
// Interfaces e tipos para mensagens
// ========================================

// ========================================
// Tipos Base
// ========================================

// Tipo de mensagem
export type MessageType =
  | 'text'                            //......Mensagem de texto
  | 'audio'                           //......Mensagem de audio
  | 'image'                           //......Mensagem de imagem
  | 'video'                           //......Mensagem de video
  | 'document'                        //......Mensagem de documento
  | 'deleted';                        //......Mensagem deletada

// Status da mensagem
export type MessageStatus =
  | 'pending'                         //......Enviando
  | 'sent'                            //......Enviada um check
  | 'delivered'                       //......Entregue dois checks
  | 'read'                            //......Lida dois checks azul
  | 'failed';                         //......Falhou

// Direcao da mensagem
export type MessageDirection =
  | 'incoming'                        //......Recebida
  | 'outgoing';                       //......Enviada

// ========================================
// Interfaces de Conteudo
// ========================================

// Dados de preview de link (OG metadata do WhatsApp)
export interface LinkPreview {
  url: string;                        //......URL do link
  title?: string;                     //......Titulo OG da pagina
  description?: string;               //......Descricao OG da pagina
  thumbnail?: string;                 //......Thumbnail base64 ou URL
  siteName?: string;                  //......Nome do site
  previewType?: number;               //......Tipo: 0 = padrao, 1 = video
}

// Conteudo de texto
export interface TextContent {
  text: string;                       //......Texto da mensagem
  linkPreview?: LinkPreview;          //......Preview de link opcional
}

// Conteudo de audio
export interface AudioContent {
  url: string;                        //......URL do audio
  duration: number;                   //......Duracao em segundos
  waveform?: number[];                //......Forma de onda
  mimeType?: string;                  //......Tipo MIME
}

// Conteudo de imagem
export interface ImageContent {
  url: string;                        //......URL da imagem
  thumbnail?: string;                 //......URL da miniatura
  width: number;                      //......Largura em pixels
  height: number;                     //......Altura em pixels
  caption?: string;                   //......Legenda opcional
}

// Conteudo de video
export interface VideoContent {
  url: string;                        //......URL do video
  thumbnail?: string;                 //......URL da miniatura
  width: number;                      //......Largura em pixels
  height: number;                     //......Altura em pixels
  duration?: number;                  //......Duracao em segundos
  mimeType?: string;                  //......Tipo MIME do video
  caption?: string;                   //......Legenda opcional
}

// Conteudo de documento
export interface DocumentContent {
  url: string;                        //......URL do documento
  fileName: string;                   //......Nome do arquivo
  fileSize: number;                   //......Tamanho em bytes
  mimeType: string;                   //......Tipo MIME
  thumbnail?: string;                 //......Miniatura opcional
}

// Union de conteudos
export type MessageContent =
  | TextContent                       //......Conteudo texto
  | AudioContent                      //......Conteudo audio
  | ImageContent                      //......Conteudo imagem
  | VideoContent                      //......Conteudo video
  | DocumentContent;                  //......Conteudo documento

// ========================================
// Interface de Resposta (Reply)
// ========================================
export interface ReplyInfo {
  messageId: string;                  //......ID da mensagem original
  senderName: string;                 //......Nome do remetente
  content: string;                    //......Preview do conteudo
  type: MessageType;                  //......Tipo da mensagem
  thumbnail?: string;                 //......Thumbnail video/imagem/link preview
  linkUrl?: string;                   //......URL do link na mensagem citada
  messageKey?: MessageKey;            //......Chave da mensagem para quoted reply
}

// ========================================
// Interface da Chave de Mensagem (Evolution API)
// ========================================
export interface MessageKey {
  id: string;                         //......ID da mensagem na API
  remoteJid: string;                  //......JID do destinatario
  fromMe: boolean;                    //......Se foi enviada por mim
}

// ========================================
// Interface Principal de Mensagem
// ========================================
export interface WhatsAppMessage {
  id: string;                         //......ID unico da mensagem
  type: MessageType;                  //......Tipo da mensagem
  direction: MessageDirection;        //......Direcao incoming/outgoing
  content: MessageContent;            //......Conteudo da mensagem
  timestamp: Date;                    //......Data e hora
  status: MessageStatus;              //......Status de entrega
  senderId: string;                   //......ID do remetente
  senderName?: string;                //......Nome do remetente
  senderAvatar?: string;              //......Avatar do remetente
  replyTo?: ReplyInfo;                //......Resposta a outra mensagem
  edited?: boolean;                   //......Foi editada
  deletedAt?: Date;                   //......Data de exclusao
  reaction?: string;                  //......Reacao (emoji)
  messageKey?: MessageKey;            //......Chave da mensagem (Evolution API)
  viewOnce?: boolean;                 //......Mensagem de visualizacao unica
}

// ========================================
// Interfaces de Grupo de Midia (Album)
// ========================================

// Item individual dentro de um grupo de midias
export interface MediaGroupItem {
  message: WhatsAppMessage;           //......Mensagem original
  type: 'image' | 'video';           //......Tipo de midia
}

// Dados do grupo de midias (album WhatsApp)
export interface MediaGroupData {
  id: string;                         //......ID unico do grupo
  items: MediaGroupItem[];            //......Lista de midias no grupo
  direction: MessageDirection;        //......Direcao do grupo
  lastTimestamp: Date;                //......Timestamp da ultima mensagem
  lastStatus: MessageStatus;          //......Status da ultima mensagem
  senderId: string;                   //......ID do remetente
}

// ========================================
// Interface de Info do Chat
// ========================================
export interface ChatInfo {
  leadId: string;                     //......ID do lead
  leadName: string;                   //......Nome do lead
  leadPhone: string;                  //......Telefone do lead
  leadPhoto?: string;                 //......Foto do lead
  isOnline: boolean;                  //......Esta online
  lastSeen?: Date;                    //......Ultimo acesso
  isTyping: boolean;                  //......Esta digitando
}

// ========================================
// Interface de Parametros de Navegacao
// ========================================
export interface LeadChatScreenParams {
  leadId: string;                     //......ID do lead
  leadName: string;                   //......Nome do lead
  leadPhone: string;                  //......Telefone do lead
  leadPhoto?: string;                 //......Foto do lead
}

// ========================================
// Type Guards
// ========================================

// Verifica se e conteudo de texto
export const isTextContent = (
  content: MessageContent
): content is TextContent => {
  return 'text' in content;           //......Verifica prop text
};

// Verifica se e conteudo de audio
export const isAudioContent = (
  content: MessageContent
): content is AudioContent => {
  return 'duration' in content && 'url' in content;
};

// Verifica se e conteudo de imagem
// Imagem nao tem mimeType nem duration do video
export const isImageContent = (
  content: MessageContent
): content is ImageContent => {
  return (
    'width' in content &&
    'height' in content &&
    !('mimeType' in content) &&           //......Nao tem mimeType (diferencia de video)
    !('fileName' in content)              //......Nao e documento
  );
};

// Verifica se e conteudo de video
// Video sempre tem mimeType quando enviado
export const isVideoContent = (
  content: MessageContent
): content is VideoContent => {
  return (
    'width' in content &&
    'height' in content &&
    'mimeType' in content &&              //......Tem mimeType (video)
    !('fileName' in content)              //......Nao e documento
  );
};

// Verifica se e conteudo de documento
export const isDocumentContent = (
  content: MessageContent
): content is DocumentContent => {
  return 'fileName' in content && 'fileSize' in content;
};
