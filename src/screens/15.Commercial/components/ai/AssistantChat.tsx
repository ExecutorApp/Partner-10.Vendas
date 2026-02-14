// ========================================
// Componente AssistantChat
// Interface completa do chat com IA
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useCallback,                        //......Hook de callback
  useRef,                             //......Hook de referencia
  useEffect,                          //......Hook de efeito
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  FlatList,                           //......Lista otimizada
  StyleSheet,                         //......Estilos
  KeyboardAvoidingView,               //......Evitar teclado
  Platform,                           //......Plataforma
  ListRenderItem,                     //......Tipo render item
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG

// ========================================
// Imports de Componentes
// ========================================
import ChatMessage from './ChatMessage'; //..Bolha de mensagem
import ChatInput from './ChatInput';     //..Input de texto
import VoicePlayer from './VoicePlayer'; //..Player TTS com ondas

// ========================================
// Imports de Services
// ========================================
import aiService from '../../services/aiService';

// ========================================
// Imports de Tipos
// ========================================
import { AIMessage } from '../../types/ai.types';

// ========================================
// Constantes de Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                 //......Azul principal
  background: '#FCFCFC',              //......Fundo branco
  backgroundAlt: '#F4F4F4',           //......Fundo cinza
  textPrimary: '#3A3F51',             //......Texto principal
  textSecondary: '#7D8592',           //......Texto secundario
  border: '#D8E0F0',                  //......Borda
  white: '#FFFFFF',                   //......Branco
  danger: '#EF4444',                  //......Vermelho erro
};

// ========================================
// Icones SVG
// ========================================

// Icone de IA
const AIIcon = ({ color = COLORS.primary }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Componente AssistantChat
// ========================================
const AssistantChat: React.FC = () => {
  // ========================================
  // Estados
  // ========================================
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);

  // ========================================
  // Refs
  // ========================================
  const flatListRef = useRef<FlatList>(null);

  // ========================================
  // Efeitos
  // ========================================

  // Mensagem inicial da IA
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome',                   //......Id fixo
      role: 'assistant',               //......Papel assistente
      content: 'Olá! Sou seu assistente de vendas. Como posso ajudar você hoje?',
      timestamp: new Date(),           //......Data atual
      confirmed: true,                 //......Confirmada
      isFromAI: true,                  //......Vem da IA
    };
    setMessages([welcomeMessage]);     //......Definir mensagem inicial
  }, []);

  // ========================================
  // Funcoes Auxiliares
  // ========================================

  // Adicionar mensagem ao historico
  const addMessage = useCallback((
    content: string,                   //......Conteudo
    isFromUser: boolean,               //......Se eh do usuario
    audioUri?: string,                 //......URI do audio
  ) => {
    const newMessage: AIMessage = {
      id: `msg-${Date.now()}`,         //......Id unico
      role: isFromUser ? 'user' : 'assistant',
      content,                         //......Conteudo
      audioUri,                        //......Audio TTS
      timestamp: new Date(),           //......Data atual
      confirmed: true,                 //......Confirmada
      isFromAI: !isFromUser,           //......Se vem da IA
    };

    setMessages(prev => [...prev, newMessage]);
  }, []);

  // ========================================
  // Handlers
  // ========================================

  // Handler de enviar mensagem
  const handleSend = useCallback(async (text: string) => {
    try {
      setError(null);                  //......Limpar erro
      setIsLoading(true);              //......Iniciar loading

      // Adicionar mensagem do usuario
      addMessage(text, true);          //......Adicionar ao historico

      // Preparar historico para API
      const apiMessages = messages
        .filter(m => m.id !== 'welcome') //..Ignorar welcome
        .map(m => ({
          role: m.role,                //......Papel
          content: m.content,          //......Conteudo
        }));

      // Adicionar mensagem atual
      apiMessages.push({
        role: 'user' as const,         //......Papel usuario
        content: text,                 //......Conteudo
      });

      // Chamar API
      const response = await aiService.sendChatMessage(apiMessages);

      // Adicionar resposta da IA
      addMessage(
        response.message,              //......Mensagem
        false,                         //......Nao eh do usuario
        response.audioUrl,             //......Audio TTS
      );

      // Tocar audio automaticamente
      if (response.audioUrl) {
        setCurrentAudioUri(response.audioUrl);
      }

    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erro ao enviar mensagem';
      setError(errorMessage);          //......Definir erro
    } finally {
      setIsLoading(false);             //......Finalizar loading
    }
  }, [messages, addMessage]);

  // Handler de audio completado
  const handleAudioComplete = useCallback(() => {
    setCurrentAudioUri(null);          //......Limpar audio atual
  }, []);

  // Handler de limpar erro
  const handleDismissError = useCallback(() => {
    setError(null);                    //......Limpar erro
  }, []);

  // ========================================
  // Render Item da Lista
  // ========================================
  const renderItem: ListRenderItem<AIMessage> = useCallback(({ item, index }) => {
    // Verificar se deve mostrar avatar
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.role !== item.role;

    return (
      <ChatMessage
        message={item}
        showAvatar={showAvatar}
      />
    );
  }, [messages]);

  // Key extractor
  const keyExtractor = useCallback((item: AIMessage) => item.id, []);

  // ========================================
  // Render
  // ========================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header do Chat */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <AIIcon color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Assistente IA</Text>
          <Text style={styles.headerSubtitle}>
            {isLoading ? 'Digitando...' : 'Online'}
          </Text>
        </View>
      </View>

      {/* Banner de Erro */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Text
            style={styles.errorDismiss}
            onPress={handleDismissError}
          >
            Fechar
          </Text>
        </View>
      )}

      {/* Player de Audio Atual */}
      {currentAudioUri && (
        <View style={styles.audioBar}>
          <VoicePlayer
            uri={currentAudioUri}
            autoPlay={true}
            size="small"
            color="primary"
            onComplete={handleAudioComplete}
          />
        </View>
      )}

      {/* Lista de Mensagens */}
      <FlatList
        ref={flatListRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AIIcon color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>
              Inicie uma conversa com a IA
            </Text>
          </View>
        }
      />

      {/* Input de Mensagem */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        placeholder="Digite sua mensagem..."
      />
    </KeyboardAvoidingView>
  );
};

// ========================================
// Export Default
// ========================================
export default AssistantChat;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                          //......Ocupar todo espaco
    backgroundColor: COLORS.background, //....Fundo branco
  },

  // Header do chat
  header: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 12,              //......Espaco vertical
    backgroundColor: COLORS.white,    //......Fundo branco
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Avatar do header
  headerAvatar: {
    width: 40,                        //......Largura
    height: 40,                       //......Altura
    borderRadius: 20,                 //......Arredondamento
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    marginRight: 12,                  //......Margem direita
  },

  // Info do header
  headerInfo: {
    flex: 1,                          //......Ocupar espaco
  },

  // Titulo do header
  headerTitle: {
    fontSize: 16,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.textPrimary,        //......Cor texto
  },

  // Subtitulo do header
  headerSubtitle: {
    fontSize: 12,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 2,                     //......Margem superior
  },

  // Banner de erro
  errorBanner: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    justifyContent: 'space-between',  //......Espaco entre itens
    backgroundColor: COLORS.danger,   //......Fundo vermelho
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 10,              //......Espaco vertical
  },

  // Texto do erro
  errorText: {
    flex: 1,                          //......Ocupar espaco
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.white,              //......Cor branca
  },

  // Botao fechar erro
  errorDismiss: {
    fontSize: 13,                     //......Tamanho fonte
    fontFamily: 'Inter_600SemiBold',  //......Fonte Inter SemiBold
    color: COLORS.white,              //......Cor branca
    marginLeft: 12,                   //......Margem esquerda
  },

  // Barra de audio
  audioBar: {
    paddingHorizontal: 16,            //......Espaco horizontal
    paddingVertical: 10,              //......Espaco vertical
    backgroundColor: COLORS.backgroundAlt, //..Fundo cinza
    borderBottomWidth: 1,             //......Borda inferior
    borderBottomColor: COLORS.border, //......Cor da borda
  },

  // Lista de mensagens
  messagesList: {
    flex: 1,                          //......Ocupar espaco
  },

  // Conteudo das mensagens
  messagesContent: {
    paddingVertical: 16,              //......Espaco vertical
  },

  // Estado vazio
  emptyState: {
    flex: 1,                          //......Ocupar espaco
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
    paddingVertical: 60,              //......Espaco vertical
  },

  // Texto vazio
  emptyText: {
    fontSize: 14,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
    color: COLORS.textSecondary,      //......Cor secundaria
    marginTop: 12,                    //......Margem superior
  },
});
