// ========================================
// Componente TextMessage
// Mensagem de texto simples
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { memo } from 'react';      //......React core
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Linking,                                //......Abrir links
} from 'react-native';                    //......Biblioteca RN

// ========================================
// Imports de Cores e Temas
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';
import { useTheme } from '../../styles/themes/ThemeContext';

// ========================================
// Imports de Componentes
// ========================================
import LinkPreviewCard from './08.12.LinkPreviewCard';

// ========================================
// Imports de Tipos
// ========================================
import { TextContent } from '../../types/08.types.whatsapp';

// ========================================
// Interface de Props
// ========================================
interface TextMessageProps {
  content: TextContent;                   //......Conteudo do texto
  isOutgoing: boolean;                    //......Se e enviada
}

// ========================================
// Regex para detectar URLs
// ========================================
const URL_REGEX = /(https?:\/\/[^\s]+)/g; //......Regex URL

// ========================================
// Regex para detectar telefones
// ========================================
const PHONE_REGEX = /(\+?[\d\s\-()]{10,})/g;

// ========================================
// Componente Principal TextMessage (Memoizado)
// ========================================
const TextMessage = memo<TextMessageProps>(({
  content,                                //......Conteudo
  isOutgoing,                             //......Direcao
}) => {
  // ========================================
  // Contexto do Tema
  // ========================================
  const { colors } = useTheme();

  // ========================================
  // Handler para abrir URL
  // ========================================
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);                 //......Abre no navegador
  };

  // ========================================
  // Handler para ligar
  // ========================================
  const handlePhonePress = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanPhone}`); //......Abre discador
  };

  // ========================================
  // Renderizar texto com links
  // ========================================
  const renderTextWithLinks = (text: string) => {
    // Dividir texto em partes
    const parts = text.split(URL_REGEX);  //......Separa por URL

    return parts.map((part, index) => {
      // Verifica se e URL
      if (URL_REGEX.test(part)) {
        return (
          <Text                           //......Texto link
            key={index}                   //......Chave unica
            style={[
              styles.linkText,            //......Estilo link
              { color: isOutgoing ? colors.linkOutgoing : colors.link },
            ]}
            onPress={() => handleLinkPress(part)}
          >
            {part}
          </Text>
        );
      }

      // Texto normal
      return (
        <Text                             //......Texto normal
          key={index}                     //......Chave unica
          style={[
            styles.messageText,           //......Estilo base
            { color: isOutgoing ? colors.outgoingText : colors.incomingText },
          ]}
        >
          {part}
        </Text>
      );
    });
  };

  // ========================================
  // Texto sem URL quando card esta presente
  // ========================================
  const displayText = content.linkPreview
    ? content.text.replace(/https?:\/\/[^\s]+/g, '').trim() //...Remove URLs do texto
    : content.text;                                          //...Texto original

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Card de Preview do Link */}
      {content.linkPreview && (
        <LinkPreviewCard
          linkPreview={content.linkPreview} //......Dados do preview
          isOutgoing={isOutgoing}           //......Direcao
        />
      )}

      {/* Texto da Mensagem (oculta URL quando card presente) */}
      {displayText.length > 0 && (
        <Text style={styles.textWrapper}>
          {renderTextWithLinks(displayText)}
        </Text>
      )}
    </View>
  );
}, (prev, next) => {
  // Comparacao customizada para evitar re-renders
  return prev.content.text === next.content.text &&
         prev.content.linkPreview?.url === next.content.linkPreview?.url &&
         prev.isOutgoing === next.isOutgoing;
});

// ========================================
// Export Default
// ========================================
export default TextMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexShrink: 1,                        //......Permite encolher
    paddingLeft: 0,                       //......Margem esquerda do texto
  },

  // Wrapper do texto
  textWrapper: {
    flexWrap: 'wrap',                     //......Quebra linha
    flexShrink: 1,                        //......Permite encolher
  },

  // Texto da mensagem base
  messageText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 15,                         //......Tamanho fonte
    lineHeight: 20,                       //......Altura linha
  },

  // Texto mensagem enviada
  outgoingText: {
    color: ChatColors.outgoingText,       //......Branco
  },

  // Texto mensagem recebida
  incomingText: {
    color: ChatColors.incomingText,       //......Cinza escuro
  },

  // Texto de link
  linkText: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 15,                         //......Tamanho fonte
    lineHeight: 20,                       //......Altura linha
    color: ChatColors.link,               //......Cor do link
    textDecorationLine: 'underline',      //......Sublinhado
  },

  // Link em mensagem enviada
  linkTextOutgoing: {
    color: ChatColors.linkOutgoing,       //......Link claro
  },
});
