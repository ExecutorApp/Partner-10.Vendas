// ========================================
// Componente Bolhas de Chat do Avatar
// Exibe historico de conversa com a Lola
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                        //......React core
import {                                          //......Componentes RN
  View,                                           //......Container
  Text,                                           //......Texto
} from 'react-native';
import { bubbleStyles as styles } from './styles/09.AIAvatarStyles';

// ========================================
// Interface de Mensagem
// ========================================
export interface AvatarMessage {
  id: string;                                     //......ID unico
  role: 'user' | 'assistant';                     //......Papel na conversa
  content: string;                                //......Conteudo da mensagem
  timestamp: Date;                                //......Timestamp
}

// ========================================
// Interface de Props do Componente
// ========================================
interface AvatarChatBubblesProps {
  messages: AvatarMessage[];                      //......Lista de mensagens
}

// ========================================
// Interface de Props da Bolha Individual
// ========================================
interface BubbleProps {
  message: AvatarMessage;                         //......Mensagem
}

// ========================================
// Componente: Bolha Individual
// ========================================
const ChatBubble: React.FC<BubbleProps> = ({ message }) => {
  // Verificar se e mensagem do usuario
  const isUser = message.role === 'user';

  // Formatar hora
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Bolha da Mensagem */}
      <View style={isUser ? styles.userBubble : styles.aiBubble}>
        <Text style={isUser ? styles.userText : styles.aiText}>
          {message.content}
        </Text>
      </View>

      {/* Timestamp */}
      <Text
        style={[
          styles.timestamp,
          isUser && styles.timestampUser,
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
};

// ========================================
// Componente Principal
// ========================================
const AvatarChatBubbles: React.FC<AvatarChatBubblesProps> = ({ messages }) => {
  // ========================================
  // Render: Lista Vazia
  // ========================================
  if (messages.length === 0) {
    return null;
  }

  // ========================================
  // Render: Lista de Mensagens
  // ========================================
  return (
    <View>
      {messages.map(message => (
        <ChatBubble key={message.id} message={message} />
      ))}
    </View>
  );
};

// ========================================
// Export
// ========================================
export default AvatarChatBubbles;
