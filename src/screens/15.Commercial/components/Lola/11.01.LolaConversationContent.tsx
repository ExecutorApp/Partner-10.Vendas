// ========================================
// Conteudo da Conversa com Lola
// Apenas area de mensagens (sem header/input)
// ========================================

// ========================================
// Imports React
// ========================================
import React, {
  useState,                               //......Hook de estado
  useRef,                                 //......Hook de referencia
} from 'react';

// ========================================
// Imports React Native
// ========================================
import {
  View,                                   //......Container
  ScrollView,                             //......Scroll
  StyleSheet,                             //......Estilos
  Platform,                               //......Plataforma
} from 'react-native';

// ========================================
// Imports de Componentes
// ========================================
import AvatarChatBubbles, { AvatarMessage } from '../AIAvatar/09.03.AvatarChatBubbles';

// ========================================
// Interface de Props
// ========================================
interface LolaConversationContentProps {
  leadId: string;                         //......ID do lead
  leadName: string;                       //......Nome do lead
  leadPhone?: string;                     //......Telefone
  onSendMessage?: (text: string) => void; //......Handler enviar mensagem
}

// ========================================
// Componente Principal
// ========================================
const LolaConversationContent: React.FC<LolaConversationContentProps> = ({
  leadId,
  leadName,
  leadPhone,
  onSendMessage,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [messages, setMessages] = useState<AvatarMessage[]>([]);

  // ========================================
  // Refs
  // ========================================
  const scrollViewRef = useRef<ScrollView>(null);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Mensagens (fundo vem do container pai) */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <AvatarChatBubbles messages={messages} />
      </ScrollView>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal (fundo transparente - vem do pai)
  container: {
    flex: 1,                              //......Ocupa tudo
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    backgroundColor: 'transparent',       //......Fundo transparente
    ...(Platform.OS === 'web' ? {
      position: 'relative' as any,        //......Posicao relativa na web
      width: '100%',                      //......FIX: Largura 100% do pai
      maxWidth: '100%',                   //......FIX: Limita largura maxima
      height: '100%',                     //......Altura 100% na web
      maxHeight: '100%',                  //......Limita altura maxima na web
      overflow: 'hidden',                 //......Esconde overflow na web
    } : {}),
  },

  // Container de mensagens
  messagesContainer: {
    flex: 1,                              //......Ocupa espaco
    minHeight: 0,                         //......FIX: Permite flex shrink na web
    ...(Platform.OS === 'web' ? {
      position: 'absolute' as any,        //......Posicao absoluta na web
      top: 0,                             //......Topo
      left: 0,                            //......Esquerda
      right: 0,                           //......Direita
      bottom: 0,                          //......Fundo
      width: '100%',                      //......FIX: Largura 100% do pai
      maxWidth: '100%',                   //......FIX: Limita largura maxima
      overflow: 'auto' as any,            //......Scroll na web
    } : {}),
  },

  // Conteudo das mensagens
  messagesContent: {
    padding: 16,                          //......Padding
    paddingBottom: 8,                     //......Padding baixo
    ...(Platform.OS === 'web' ? {
      flexGrow: 0,                        //......Nao cresce na web
    } : {}),
  },
});

// ========================================
// Export
// ========================================
export default LolaConversationContent;
