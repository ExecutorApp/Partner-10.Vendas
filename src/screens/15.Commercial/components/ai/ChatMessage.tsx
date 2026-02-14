// ========================================
// Componente ChatMessage
// Bolha de mensagem no chat
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useMemo,                            //......Hook de memorizacao
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  StyleSheet,                         //......Estilos
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import AudioPlayer from './AudioPlayer'; //..Player de audio

// ========================================
// Imports de Tipos
// ========================================
import { AIMessage } from '../../types/ai.types'; //..Tipo mensagem

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  white: '#FFFFFF',                   //......Branco
};

// ========================================
// Icones SVG
// ========================================

// Icone de IA
const AIIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface ChatMessageProps {
  message: AIMessage;                 //......Dados da mensagem
  showAvatar?: boolean;               //......Mostrar avatar
}

// ========================================
// Componente ChatMessage
// ========================================
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,                            //......Dados da mensagem
  showAvatar = true,                  //......Mostrar avatar padrao
}) => {
  // ========================================
  // Memos
  // ========================================

  // Verificar se eh mensagem do usuario
  const isUser = useMemo(() => {
    return message.role === 'user' || !message.isFromAI;
  }, [message.role, message.isFromAI]);

  // Formatar hora da mensagem
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',                //......Hora com 2 digitos
      minute: '2-digit',              //......Minuto com 2 digitos
    });
  }, [message.timestamp]);

  // ========================================
  // Render - Mensagem do Usuario
  // ========================================
  if (isUser) {
    return (
      <View style={styles.userContainer}>
        {/* Conteudo da Mensagem */}
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
          <Text style={styles.userTime}>{formattedTime}</Text>
        </View>
      </View>
    );
  }

  // ========================================
  // Render - Mensagem da IA
  // ========================================
  return (
    <View style={styles.aiContainer}>
      {/* Avatar da IA */}
      {showAvatar && (
        <View style={styles.aiAvatar}>
          <AIIcon color={COLORS.primary} />
        </View>
      )}

      {/* Conteudo da Mensagem */}
      <View style={[styles.aiBubble, !showAvatar && styles.aiBubbleNoAvatar]}>
        {/* Texto da Mensagem */}
        <Text style={styles.aiText}>{message.content}</Text>

        {/* Player de Audio se tiver */}
        {message.audioUri && (
          <View style={styles.audioContainer}>
            <AudioPlayer
              uri={message.audioUri}
              size="small"
              color="primary"
              autoPlay={false}
            />
          </View>
        )}

        {/* Hora da Mensagem */}
        <Text style={styles.aiTime}>{formattedTime}</Text>
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default ChatMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container do usuario
  userContainer: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'flex-end',       //......Alinhar a direita
    marginBottom: 12,                 //......Margem inferior
    paddingHorizontal: 16,            //......Espaco horizontal
  },

  // Bolha do usuario
  userBubble: {
    maxWidth: '80%',                  //......Largura maxima
    backgroundColor: COLORS.primary,  //......Fundo azul
    borderTopLeftRadius: 16,          //......Arredondamento
    borderTopRightRadius: 16,         //......Arredondamento
    borderBottomLeftRadius: 16,       //......Arredondamento
    borderBottomRightRadius: 4,       //......Arredondamento menor
    paddingHorizontal: 14,            //......Espaco horizontal
    paddingTop: 10,                   //......Espaco superior
    paddingBottom: 6,                 //......Espaco inferior
  },

  // Texto do usuario
  userText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.white,              //......Cor branca
    lineHeight: 20,                   //......Altura da linha
  },

  // Hora do usuario
  userTime: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: 'rgba(255,255,255,0.7)',   //......Branco transparente
    textAlign: 'right',               //......Alinhado a direita
    marginTop: 4,                     //......Margem superior
  },

  // Container da IA
  aiContainer: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'flex-start',         //......Alinhar no topo
    marginBottom: 12,                 //......Margem inferior
    paddingHorizontal: 16,            //......Espaco horizontal
  },

  // Avatar da IA
  aiAvatar: {
    width: 28,                        //......Largura
    height: 28,                       //......Altura
    borderRadius: 14,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    marginRight: 8,                   //......Margem direita
  },

  // Bolha da IA
  aiBubble: {
    maxWidth: '80%',                  //......Largura maxima
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderTopLeftRadius: 4,           //......Arredondamento menor
    borderTopRightRadius: 16,         //......Arredondamento
    borderBottomLeftRadius: 16,       //......Arredondamento
    borderBottomRightRadius: 16,      //......Arredondamento
    paddingHorizontal: 14,            //......Espaco horizontal
    paddingTop: 10,                   //......Espaco superior
    paddingBottom: 6,                 //......Espaco inferior
  },

  // Bolha sem avatar
  aiBubbleNoAvatar: {
    marginLeft: 36,                   //......Margem para alinhar
  },

  // Texto da IA
  aiText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textPrimary,        //......Cor texto
    lineHeight: 20,                   //......Altura da linha
  },

  // Container do audio
  audioContainer: {
    marginTop: 8,                     //......Margem superior
    marginBottom: 4,                  //......Margem inferior
  },

  // Hora da IA
  aiTime: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    textAlign: 'right',               //......Alinhado a direita
    marginTop: 4,                     //......Margem superior
  },
});
