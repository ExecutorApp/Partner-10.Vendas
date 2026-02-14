// ========================================
// Cores do Chat
// Paleta de cores definitiva do sistema
// ========================================

// ========================================
// Interface ThemeColors
// ========================================
export interface ThemeColors {
  // ========================================
  // Header
  // ========================================
  headerBackground: string;               //......Fundo do header
  headerText: string;                     //......Texto do header
  headerIcon: string;                     //......Icones do header
  headerBorder: string;                   //......Borda inferior do header

  // ========================================
  // Background/Overlay
  // ========================================
  chatBackground: string;                 //......Fundo base do chat
  overlayColor: string;                   //......Cor do overlay sobre imagem
  overlayOpacity: number;                 //......Opacidade do overlay (0-1)

  // ========================================
  // Bolhas de Mensagem
  // ========================================
  incomingBubble: string;                 //......Fundo bolha recebida
  outgoingBubble: string;                 //......Fundo bolha enviada
  incomingText: string;                   //......Texto bolha recebida
  outgoingText: string;                   //......Texto bolha enviada
  incomingBorder: string;                 //......Borda bolha recebida
  outgoingBorder: string;                 //......Borda bolha enviada

  // ========================================
  // Input Bar
  // ========================================
  inputBackground: string;                //......Fundo da barra de input
  inputFieldBackground: string;           //......Fundo do campo de texto
  inputText: string;                      //......Texto digitado
  inputPlaceholder: string;               //......Placeholder
  inputBorder: string;                    //......Borda do input

  // ========================================
  // Botoes
  // ========================================
  sendButton: string;                     //......Botao enviar
  attachButton: string;                   //......Botao anexo
  emojiButton: string;                    //......Botao emoji
  voiceButton: string;                    //......Botao voz

  // ========================================
  // Status de Leitura
  // ========================================
  checkSent: string;                      //......Check enviado
  checkDelivered: string;                 //......Check entregue
  checkRead: string;                      //......Check lido

  // ========================================
  // Timestamp
  // ========================================
  timestamp: string;                      //......Hora da mensagem
  timestampOutgoing: string;              //......Hora em bolha enviada

  // ========================================
  // Reply Preview
  // ========================================
  replyIncomingBg: string;                //......Fundo reply incoming
  replyOutgoingBg: string;                //......Fundo reply outgoing
  replyIncomingBar: string;               //......Barra reply incoming
  replyOutgoingBar: string;               //......Barra reply outgoing
  replyIncomingText: string;              //......Texto reply incoming
  replyOutgoingText: string;              //......Texto reply outgoing
  replyIncomingSender: string;            //......Nome sender incoming
  replyOutgoingSender: string;            //......Nome sender outgoing

  // ========================================
  // Links
  // ========================================
  link: string;                           //......Link em msg recebida
  linkOutgoing: string;                   //......Link em msg enviada

  // ========================================
  // Data Badge
  // ========================================
  dateBadge: string;                      //......Fundo badge data
  dateBadgeText: string;                  //......Texto badge data

  // ========================================
  // Auxiliares
  // ========================================
  divider: string;                        //......Divisor
  shadow: string;                         //......Sombra
}

// ========================================
// ChatColors - Paleta Definitiva
// Layout Premium com azul sofisticado
// ========================================
export const ChatColors: ThemeColors = {
  // ========================================
  // Header - BRANCO
  // ========================================
  headerBackground: '#FFFFFF',            //......Branco
  headerText: '#1F2C34',                  //......Escuro
  headerIcon: '#54656F',                  //......Cinza escuro
  headerBorder: '#E9EDEF',                //......Borda cinza clara

  // ========================================
  // Background/Overlay - SEM OVERLAY
  // ========================================
  chatBackground: 'transparent',          //......Sem cor de fundo
  overlayColor: 'transparent',            //......Sem overlay
  overlayOpacity: 0,                      //......0% - apenas imagem de fundo

  // ========================================
  // Bolhas de Mensagem
  // ========================================
  incomingBubble: '#FFFFFF',              //......Branco puro
  outgoingBubble: '#E0F0FF',              //......Azul bem claro elegante
  incomingText: '#1F2C34',                //......Escuro
  outgoingText: '#1F2C34',                //......Escuro
  incomingBorder: '#E2E2E2',              //......Cinza claro
  outgoingBorder: '#C8E4FF',              //......Azul claro borda

  // ========================================
  // Input Bar
  // ========================================
  inputBackground: '#F0F2F5',             //......Cinza muito claro
  inputFieldBackground: '#FFFFFF',        //......Branco
  inputText: '#1F2C34',                   //......Escuro
  inputPlaceholder: '#8696A0',            //......Cinza medio
  inputBorder: '#E9EDEF',                 //......Borda cinza

  // ========================================
  // Botoes
  // ========================================
  sendButton: '#00A884',                  //......Verde WhatsApp
  attachButton: '#54656F',                //......Cinza escuro
  emojiButton: '#54656F',                 //......Cinza escuro
  voiceButton: '#54656F',                 //......Cinza escuro

  // ========================================
  // Status de Leitura
  // ========================================
  checkSent: '#8696A0',                   //......Cinza
  checkDelivered: '#8696A0',              //......Cinza
  checkRead: '#53BDEB',                   //......Azul claro

  // ========================================
  // Timestamp
  // ========================================
  timestamp: '#667781',                   //......Cinza medio
  timestampOutgoing: '#667781',           //......Cinza (nao branco)

  // ========================================
  // Reply Preview
  // ========================================
  replyIncomingBg: '#F0F0F0',             //......Cinza muito claro
  replyOutgoingBg: '#F0F8FF',             //......Azul muito claro para reply
  replyIncomingBar: '#1777CF',            //......Azul principal
  replyOutgoingBar: '#1777CF',            //......Azul principal
  replyIncomingText: '#1F2C34',           //......Escuro
  replyOutgoingText: '#1F2C34',           //......Escuro
  replyIncomingSender: '#1777CF',         //......Azul principal
  replyOutgoingSender: '#1777CF',         //......Azul principal

  // ========================================
  // Links
  // ========================================
  link: '#027EB5',                        //......Azul link
  linkOutgoing: '#027EB5',                //......Azul link

  // ========================================
  // Data Badge
  // ========================================
  dateBadge: '#FFFFFF',                   //......Branco
  dateBadgeText: '#54656F',               //......Cinza escuro

  // ========================================
  // Auxiliares
  // ========================================
  divider: '#E9EDEF',                     //......Cinza claro
  shadow: 'rgba(0,0,0,0.08)',             //......Sombra suave
};
