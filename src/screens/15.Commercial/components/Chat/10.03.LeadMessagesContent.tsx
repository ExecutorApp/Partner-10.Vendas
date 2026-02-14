// ========================================
// Conteudo de Mensagens do Lead
// Apenas area de mensagens (sem header/input)
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';
import {
  View,                                   //......Container basico
  StyleSheet,                             //......Estilos
  Platform,                               //......Plataforma
} from 'react-native';

// ========================================
// Imports de Componentes
// ========================================
import MessageList from './components/Messages/08.02.MessageList';

// ========================================
// Imports de Tipos
// ========================================
import { WhatsAppMessage, MediaGroupData } from './types/08.types.whatsapp';
import { TimestampStyle } from './10.00.LeadLolaSwipeContainer';

// ========================================
// Interface de Props
// ========================================
export interface LeadMessagesContentProps {
  messages: WhatsAppMessage[];            //......Lista de mensagens
  onMessageLongPress: (message: WhatsAppMessage) => void;
  onImagePress: (imageUrl: string, message?: WhatsAppMessage) => void;
  onVideoPress: (videoUrl: string, message?: WhatsAppMessage) => void;
  onAudioRetry: (message: WhatsAppMessage) => Promise<boolean>;
  onForwardPress?: (url: string) => void; //......Handler encaminhar link
  onSwipeReply?: (message: WhatsAppMessage) => void;
  onMediaGroupPress?: (group: MediaGroupData) => void; //......Handler abrir galeria do grupo
  onMediaGroupLongPress?: (group: MediaGroupData) => void; //......Handler long press galeria
  timestampStyle?: TimestampStyle;        //......Estilo do timestamp
  instanceName?: string;                  //......Nome instancia Evolution
  transcriptions?: Record<string, { text: string; isLoading: boolean }>; //......Mapa de transcricoes
}

// ========================================
// Componente Principal
// ========================================
const LeadMessagesContent: React.FC<LeadMessagesContentProps> = ({
  messages,
  onMessageLongPress,
  onImagePress,
  onVideoPress,
  onAudioRetry,
  onForwardPress,
  onSwipeReply,
  onMediaGroupPress,
  onMediaGroupLongPress,
  timestampStyle = 'container',
  instanceName,
  transcriptions,
}) => {
  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Lista de Mensagens (fundo vem do container pai) */}
      <MessageList
        messages={messages}
        onMessageLongPress={onMessageLongPress}
        onImagePress={onImagePress}
        onVideoPress={onVideoPress}
        onAudioRetry={onAudioRetry}
        onForwardPress={onForwardPress}
        onSwipeReply={onSwipeReply}
        onMediaGroupPress={onMediaGroupPress}
        onMediaGroupLongPress={onMediaGroupLongPress}
        timestampStyle={timestampStyle}
        instanceName={instanceName}
        transcriptions={transcriptions}
      />
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal (fundo transparente - vem do pai)
  container: {
    flex: 1,                              //......Ocupa todo espaco
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
});

// ========================================
// Export
// ========================================
export default LeadMessagesContent;
