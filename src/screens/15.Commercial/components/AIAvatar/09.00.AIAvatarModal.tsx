// ========================================
// Modal do Avatar IA Lola
// Tela principal de conversa com a Lola
// ========================================

// ========================================
// Imports React
// ========================================
import React, {                                   //......React core
  useState,                                       //......Hook de estado
  useEffect,                                      //......Hook de efeito
  useRef,                                         //......Hook de referencia
  useCallback,                                    //......Hook de callback
} from 'react';

// ========================================
// Imports React Native
// ========================================
import {                                          //......Componentes RN
  View,                                           //......Container
  Modal,                                          //......Modal
  TouchableOpacity,                               //......Botao tocavel
  TextInput,                                      //......Input de texto
  ScrollView,                                     //......Scroll
  Text,                                           //......Texto
  Alert,                                          //......Alerta
} from 'react-native';
import { Audio } from 'expo-av';                  //......Audio Expo
import Svg, { Path } from 'react-native-svg';    //......SVG

// ========================================
// Imports de Componentes
// ========================================
import LolaAvatar from './09.01.LolaAvatar';
import AvatarVoiceRecorder from './09.02.AvatarVoiceRecorder';
import AvatarChatBubbles, { AvatarMessage } from './09.03.AvatarChatBubbles';
import QuickSuggestions from './09.04.QuickSuggestions';

// ========================================
// Imports de Services
// ========================================
import aiService from '../../services/aiService';
import lipSyncService, { LipSyncCue } from '../../services/lipSyncService';

// ========================================
// Imports de Estilos
// ========================================
import { styles, COLORS } from './styles/09.AIAvatarStyles';

// ========================================
// Icone de Fechar
// ========================================
const CloseIcon = ({ color = '#FFFFFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill={color}
    />
  </Svg>
);

// ========================================
// SVG Header Background - Fundo com canto arredondado
// ========================================
const HeaderBackground = ({ width, height, radius = 16, color = '#1777CF' }: { width: number; height: number; radius?: number; color?: string }) => (
  <Svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{ position: 'absolute', top: 0, left: 0 }}
  >
    <Path
      d={`M0 0 L${width - radius} 0 Q${width} 0 ${width} ${radius} L${width} ${height} L0 ${height} Z`}
      fill={color}
    />
  </Svg>
);

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
// Interface de Contexto do Lead
// ========================================
interface LeadContext {
  leadId: string;                                 //......ID do lead
  name: string;                                   //......Nome do lead
  phone?: string;                                 //......Telefone
  phase?: string;                                 //......Fase atual
  lastInteraction?: Date;                         //......Ultima interacao
  channel?: string;                               //......Canal de entrada
}

// ========================================
// Interface de Props
// ========================================
interface AIAvatarModalProps {
  visible: boolean;                               //......Visibilidade
  onClose: () => void;                            //......Callback ao fechar
  leadContext: LeadContext;                       //......Contexto do lead
}

// ========================================
// Componente Principal
// ========================================
const AIAvatarModal: React.FC<AIAvatarModalProps> = ({
  visible,
  onClose,
  leadContext,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [messages, setMessages] = useState<AvatarMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [headerSize, setHeaderSize] = useState({ width: 0, height: 0 });

  // Estados de Lip Sync
  const [lipSyncData, setLipSyncData] = useState<LipSyncCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // ========================================
  // Refs
  // ========================================
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ========================================
  // Mensagem de Boas-Vindas
  // ========================================
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Olá! Sou a Lola, sua assistente de vendas. Como posso ajudar com ${leadContext.name}?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    }
  }, [visible, leadContext.name, messages.length]);

  // ========================================
  // Limpar ao Fechar
  // ========================================
  useEffect(() => {
    if (!visible) {
      // Parar audio
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Limpar interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Resetar estados de audio
      setIsTalking(false);
      setIsListening(false);
      setCurrentTime(0);
      setLipSyncData([]);
    }
  }, [visible]);

  // ========================================
  // Falar Mensagem com Lip Sync
  // ========================================
  const speakMessage = useCallback(async (text: string) => {
    try {
      console.log('[AIAvatar] Gerando audio TTS...');

      // Gerar audio com TTS
      const response = await aiService.chat({
        messages: [
          { role: 'system', content: 'Voce e Lola, assistente de vendas.' },
          { role: 'user', content: text },
        ],
        leadContext: {
          leadId: leadContext.leadId,
          name: leadContext.name,
          phase: leadContext.phase || 'Novo',
          column: 'default',
          lastInteraction: leadContext.lastInteraction?.toISOString() || new Date().toISOString(),
        },
      });

      // Verificar se tem audio
      if (!response.audioUrl) {
        console.warn('[AIAvatar] Sem audio na resposta');
        return;
      }

      console.log('[AIAvatar] Analisando lip sync...');

      // Analisar lip sync (pode falhar se Rhubarb nao estiver instalado)
      let lipSync: LipSyncCue[] = [];
      try {
        lipSync = await lipSyncService.analyzeLipSync(response.audioUrl);
        setLipSyncData(lipSync);
      } catch (lipSyncError) {
        console.warn('[AIAvatar] Lip sync indisponivel:', lipSyncError);
        // Continuar sem lip sync
      }

      console.log('[AIAvatar] Reproduzindo audio...');

      // Reproduzir audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: response.audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsTalking(true);

      // Atualizar tempo a cada 50ms
      intervalRef.current = setInterval(async () => {
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              setCurrentTime(status.positionMillis / 1000);
            }
          } catch (err) {
            // Ignorar erros de status
          }
        }
      }, 50);

      // Quando terminar
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setIsTalking(false);
          setCurrentTime(0);
          setLipSyncData([]);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error('[AIAvatar] Erro ao falar:', error);
      setIsTalking(false);
    }
  }, [leadContext]);

  // ========================================
  // Enviar Mensagem
  // ========================================
  const handleSendMessage = useCallback(async (
    content: string,
    isVoice = false
  ) => {
    if ((!content.trim() && !isVoice) || isProcessing) return;

    setIsProcessing(true);

    try {
      let userText = content;

      // Se for audio, transcrever
      if (isVoice) {
        setIsListening(true);
        console.log('[AIAvatar] Transcrevendo audio...');

        try {
          userText = await aiService.transcribe(content);
        } catch (transcribeError) {
          console.error('[AIAvatar] Erro ao transcrever:', transcribeError);
          Alert.alert('Erro', 'Falha ao transcrever audio');
          setIsListening(false);
          setIsProcessing(false);
          return;
        }

        setIsListening(false);
      }

      // Adicionar mensagem do usuario
      const userMessage: AvatarMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');

      // Scroll para baixo
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      console.log('[AIAvatar] Processando com IA...');

      // Processar com IA
      const response = await aiService.chat({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })).concat([{ role: 'user', content: userText }]),
        leadContext: {
          leadId: leadContext.leadId,
          name: leadContext.name,
          phase: leadContext.phase || 'Novo',
          column: 'default',
          lastInteraction: leadContext.lastInteraction?.toISOString() || new Date().toISOString(),
        },
      });

      // Adicionar resposta da IA
      const aiMessage: AvatarMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Scroll para baixo
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Falar resposta se tiver audio
      if (response.audioUrl) {
        await speakWithAudio(response.audioUrl);
      }
    } catch (error) {
      console.error('[AIAvatar] Erro ao processar:', error);
      Alert.alert('Erro', 'Falha ao processar sua mensagem');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, messages, leadContext, speakMessage]);

  // ========================================
  // Falar com Audio Pre-Gerado
  // ========================================
  const speakWithAudio = async (audioUrl: string) => {
    try {
      // Analisar lip sync
      let lipSync: LipSyncCue[] = [];
      try {
        lipSync = await lipSyncService.analyzeLipSync(audioUrl);
        setLipSyncData(lipSync);
      } catch (lipSyncError) {
        console.warn('[AIAvatar] Lip sync indisponivel');
      }

      // Reproduzir audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsTalking(true);

      // Atualizar tempo
      intervalRef.current = setInterval(async () => {
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              setCurrentTime(status.positionMillis / 1000);
            }
          } catch (err) {
            // Ignorar
          }
        }
      }, 50);

      // Quando terminar
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setIsTalking(false);
          setCurrentTime(0);
          setLipSyncData([]);

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error('[AIAvatar] Erro ao reproduzir:', error);
      setIsTalking(false);
    }
  };

  // ========================================
  // Handler: Enviar Texto
  // ========================================
  const handleSendText = () => {
    handleSendMessage(inputText, false);
  };

  // ========================================
  // Handler: Enviar Voz
  // ========================================
  const handleSendVoice = (audioUri: string) => {
    handleSendMessage(audioUri, true);
  };

  // ========================================
  // Handler: Sugestao Rapida
  // ========================================
  const handleQuickSuggestion = (text: string) => {
    handleSendMessage(text, false);
  };

  // ========================================
  // Obter Texto de Status
  // ========================================
  const getStatusText = () => {
    if (isListening) return 'Ouvindo...';
    if (isProcessing) return 'Processando...';
    if (isTalking) return 'Falando...';
    return 'Pronta para ajudar';
  };

  // ========================================
  // Render
  // ========================================
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay - Cobre toda tela (fica ATRAS do modalContent) */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Conteudo do Modal - Fica POR CIMA do overlay */}
        <View style={styles.modalContent}>
          {/* Header Azul */}
          <View
            style={styles.header}
            onLayout={(e) => setHeaderSize({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            })}
          >
            {/* Fundo SVG com canto arredondado */}
            {headerSize.width > 0 && (
              <HeaderBackground
                width={headerSize.width}
                height={headerSize.height}
                radius={16}
                color={COLORS.primary}
              />
            )}

            {/* Titulo */}
            <Text style={styles.headerTitle}>Lola - IA</Text>

            {/* Botao Fechar */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <CloseIcon color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* Avatar Container */}
          <View style={styles.avatarContainer}>
            <LolaAvatar
              isListening={isListening}
              isTalking={isTalking}
              lipSyncData={lipSyncData}
              currentTime={currentTime}
              size="large"
            />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>

          {/* Chat Container */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
          >
            <AvatarChatBubbles messages={messages} />
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBackground} />
            <QuickSuggestions
              onSelect={handleQuickSuggestion}
              disabled={isProcessing}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Digite ou grave sua pergunta..."
                placeholderTextColor={COLORS.textPlaceholder}
                multiline
                maxLength={500}
                editable={!isProcessing}
              />
              {inputText.trim() ? (
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    isProcessing && styles.buttonDisabled,
                  ]}
                  onPress={handleSendText}
                  disabled={isProcessing}
                >
                  <SendIcon color="#FFFFFF" size={20} />
                </TouchableOpacity>
              ) : (
                <AvatarVoiceRecorder
                  onSend={handleSendVoice}
                  disabled={isProcessing}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========================================
// Export
// ========================================
export default AIAvatarModal;
