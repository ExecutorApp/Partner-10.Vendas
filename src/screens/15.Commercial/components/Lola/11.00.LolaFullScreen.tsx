// ========================================
// Tela Completa da Lola
// Tela de conversa com a assistente Lola
// ========================================

// ========================================
// Imports React
// ========================================
import React, {
  useState,                               //......Hook de estado
  useEffect,                              //......Hook de efeito
  useRef,                                 //......Hook de referencia
  useCallback,                            //......Hook de callback
} from 'react';

// ========================================
// Imports React Native
// ========================================
import {
  View,                                   //......Container
  TouchableOpacity,                       //......Botao tocavel
  TextInput,                              //......Input de texto
  ScrollView,                             //......Scroll
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Dimensions,                             //......Dimensoes
  KeyboardAvoidingView,                   //......Evita teclado
  Platform,                               //......Plataforma
} from 'react-native';
import { Audio } from 'expo-av';          //......Audio Expo
import Svg, { Path } from 'react-native-svg'; //...SVG

// ========================================
// Imports de Componentes
// ========================================
import LolaAvatar from '../AIAvatar/09.01.LolaAvatar';
import AvatarVoiceRecorder from '../AIAvatar/09.02.AvatarVoiceRecorder';
import AvatarChatBubbles, { AvatarMessage } from '../AIAvatar/09.03.AvatarChatBubbles';
import QuickSuggestions from '../AIAvatar/09.04.QuickSuggestions';

// ========================================
// Imports de Services
// ========================================
import aiService from '../../services/aiService';
import lipSyncService, { LipSyncCue } from '../../services/lipSyncService';

// ========================================
// Imports de Hooks
// ========================================
import { useLeadLola } from '../../contexts/LeadLolaContext';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================================
// Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                     //......Azul primario
  background: '#F5F7FA',                  //......Fundo cinza claro
  white: '#FFFFFF',                       //......Branco
  text: '#333333',                        //......Texto escuro
  textLight: '#666666',                   //......Texto claro
  border: '#E8ECF4',                      //......Borda
  inputBg: '#FFFFFF',                     //......Fundo input
};

// ========================================
// Icone de Enviar
// ========================================
const SendIcon = ({ color = '#FFFFFF', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Icone de Voltar
// ========================================
const BackIcon = ({ color = '#FFFFFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Contexto do Lead
// ========================================
interface LeadContext {
  leadId: string;                         //......ID do lead
  name: string;                           //......Nome do lead
  phone?: string;                         //......Telefone
  phase?: string;                         //......Fase atual
  lastInteraction?: Date;                 //......Ultima interacao
  channel?: string;                       //......Canal de entrada
}

// ========================================
// Interface de Props
// ========================================
interface LolaFullScreenProps {
  leadContext: LeadContext;               //......Contexto do lead
}

// ========================================
// Componente Principal
// ========================================
const LolaFullScreen: React.FC<LolaFullScreenProps> = ({
  leadContext,
}) => {
  // ========================================
  // Contexto de Navegacao
  // ========================================
  const { goToLead } = useLeadLola();

  // ========================================
  // Estados
  // ========================================
  const [messages, setMessages] = useState<AvatarMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // Estados de Lip Sync
  const [lipSyncData, setLipSyncData] = useState<LipSyncCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // ========================================
  // Refs
  // ========================================
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ========================================
  // Mensagem de Boas-Vindas
  // ========================================
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Ola! Sou a Lola, sua assistente de vendas. Como posso ajudar com ${leadContext.name}?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [leadContext.name, messages.length]);

  // ========================================
  // Cleanup
  // ========================================
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ========================================
  // Handler de Gravacao
  // ========================================
  const handleRecordingComplete = useCallback(async (audioUri: string) => {
    setIsProcessing(true);
    setIsListening(false);

    try {
      // Transcrever audio
      const transcription = await aiService.transcribeAudio(audioUri, 'audio.m4a');

      // Adicionar mensagem do usuario
      const userMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: transcription.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Scroll para baixo
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Enviar para IA
      await sendToAI(transcription.text);
    } catch (error) {
      console.error('Erro ao processar audio:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // ========================================
  // Enviar para IA
  // ========================================
  const sendToAI = useCallback(async (text: string) => {
    setIsProcessing(true);

    try {
      // Preparar contexto
      const chatMessages = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      chatMessages.push({ role: 'user', content: text });

      // Enviar para API
      const response = await aiService.sendChatMessage(
        chatMessages,
        {
          leadId: leadContext.leadId,
          name: leadContext.name,
          phase: leadContext.phase || 'Prospeccao',
          column: 'Contato Inicial',
          lastInteraction: leadContext.lastInteraction?.toISOString() || new Date().toISOString(),
        }
      );

      // Adicionar resposta
      const aiMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Scroll para baixo
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Tocar audio se disponivel
      if (response.audioUrl) {
        await playAudioWithLipSync(response.audioUrl, response.message);
      }
    } catch (error) {
      console.error('Erro ao enviar para IA:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, leadContext]);

  // ========================================
  // Tocar Audio com Lip Sync
  // ========================================
  const playAudioWithLipSync = useCallback(async (audioUrl: string, text: string) => {
    try {
      setIsTalking(true);

      // Gerar lip sync
      const cues = lipSyncService.analyzeLipSync(text, 150);
      setLipSyncData(cues);
      setCurrentTime(0);

      // Carregar audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Atualizar tempo
      intervalRef.current = setInterval(async () => {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);

            if (!status.isPlaying) {
              clearInterval(intervalRef.current!);
              setIsTalking(false);
              setLipSyncData([]);
            }
          }
        }
      }, 50);

      // Callback ao terminar
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsTalking(false);
          setLipSyncData([]);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao tocar audio:', error);
      setIsTalking(false);
    }
  }, []);

  // ========================================
  // Handler de Enviar Texto
  // ========================================
  const handleSendText = useCallback(async () => {
    if (!inputText.trim() || isProcessing) return;

    const text = inputText.trim();
    setInputText('');

    // Adicionar mensagem do usuario
    const userMessage: AvatarMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Scroll para baixo
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Enviar para IA
    await sendToAI(text);
  }, [inputText, isProcessing, sendToAI]);

  // ========================================
  // Handler de Sugestao
  // ========================================
  const handleSuggestionSelect = useCallback(async (suggestion: string) => {
    // Adicionar mensagem do usuario
    const userMessage: AvatarMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Scroll para baixo
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Enviar para IA
    await sendToAI(suggestion);
  }, [sendToAI]);

  // ========================================
  // Render
  // ========================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Botao Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToLead}
        >
          <BackIcon color={COLORS.white} size={24} />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <LolaAvatar
            isListening={isListening}
            isTalking={isTalking}
            lipSyncData={lipSyncData}
            currentTime={currentTime}
            size="normal"
          />
        </View>

        {/* Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Lola</Text>
          <Text style={styles.headerSubtitle}>
            {isProcessing ? 'Processando...' : isTalking ? 'Falando...' : 'Assistente de vendas'}
          </Text>
        </View>
      </View>

      {/* Mensagens */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <AvatarChatBubbles messages={messages} />
      </ScrollView>

      {/* Sugestoes Rapidas */}
      <QuickSuggestions
        onSelect={handleSuggestionSelect}
        leadName={leadContext.name}
      />

      {/* Gravador de Voz */}
      <AvatarVoiceRecorder
        onRecordingComplete={handleRecordingComplete}
        onRecordingStart={() => setIsListening(true)}
        onRecordingCancel={() => setIsListening(false)}
        isDisabled={isProcessing || isTalking}
      />

      {/* Input de Texto */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={500}
          editable={!isProcessing && !isTalking}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendText}
          disabled={!inputText.trim() || isProcessing}
        >
          <SendIcon
            color={inputText.trim() && !isProcessing ? COLORS.white : COLORS.textLight}
            size={20}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,                              //......Ocupa tudo
    backgroundColor: COLORS.background,   //......Fundo cinza
    width: SCREEN_WIDTH,                  //......Largura da tela
  },

  // Header
  header: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Alinha centro
    backgroundColor: COLORS.primary,      //......Fundo azul
    paddingTop: 50,                       //......Padding topo
    paddingBottom: 16,                    //......Padding baixo
    paddingHorizontal: 16,                //......Padding horizontal
  },

  // Botao voltar
  backButton: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
  },

  // Container do avatar
  avatarContainer: {
    marginLeft: 8,                        //......Margem esquerda
  },

  // Info do header
  headerInfo: {
    marginLeft: 12,                       //......Margem esquerda
    flex: 1,                              //......Ocupa espaco
  },

  // Titulo do header
  headerTitle: {
    fontSize: 18,                         //......Tamanho fonte
    fontWeight: '600',                    //......Peso fonte
    color: COLORS.white,                  //......Cor branca
  },

  // Subtitulo do header
  headerSubtitle: {
    fontSize: 14,                         //......Tamanho fonte
    color: 'rgba(255,255,255,0.8)',       //......Cor branca translucida
    marginTop: 2,                         //......Margem topo
  },

  // Container de mensagens
  messagesContainer: {
    flex: 1,                              //......Ocupa espaco
  },

  // Conteudo das mensagens
  messagesContent: {
    padding: 16,                          //......Padding
    paddingBottom: 8,                     //......Padding baixo
  },

  // Container do input
  inputContainer: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'flex-end',               //......Alinha baixo
    padding: 12,                          //......Padding
    backgroundColor: COLORS.white,        //......Fundo branco
    borderTopWidth: 1,                    //......Borda topo
    borderTopColor: COLORS.border,        //......Cor da borda
  },

  // Input de texto
  textInput: {
    flex: 1,                              //......Ocupa espaco
    minHeight: 40,                        //......Altura minima
    maxHeight: 100,                       //......Altura maxima
    backgroundColor: COLORS.inputBg,      //......Fundo
    borderRadius: 20,                     //......Arredondamento
    paddingHorizontal: 16,                //......Padding horizontal
    paddingVertical: 10,                  //......Padding vertical
    fontSize: 16,                         //......Tamanho fonte
    color: COLORS.text,                   //......Cor texto
    borderWidth: 1,                       //......Borda
    borderColor: COLORS.border,           //......Cor borda
  },

  // Botao enviar
  sendButton: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    borderRadius: 20,                     //......Arredondamento
    backgroundColor: COLORS.primary,      //......Fundo azul
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    marginLeft: 8,                        //......Margem esquerda
  },

  // Botao enviar desabilitado
  sendButtonDisabled: {
    backgroundColor: COLORS.border,       //......Fundo cinza
  },
});

// ========================================
// Export
// ========================================
export default LolaFullScreen;
