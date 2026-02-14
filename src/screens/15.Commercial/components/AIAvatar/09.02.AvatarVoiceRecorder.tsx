// ========================================
// Componente Gravador de Voz do Avatar
// Grava audio para enviar para a Lola
// ========================================

// ========================================
// Imports
// ========================================
import React, {                                   //......React core
  useState,                                       //......Hook de estado
  useRef,                                         //......Hook de referencia
  useEffect,                                      //......Hook de efeito
} from 'react';
import {                                          //......Componentes RN
  View,                                           //......Container
  TouchableOpacity,                               //......Botao tocavel
  Text,                                           //......Texto
  Animated,                                       //......Animacao
} from 'react-native';
import { Audio } from 'expo-av';                  //......Audio Expo
import Svg, { Path } from 'react-native-svg';    //......SVG
import { recorderStyles as styles, COLORS } from './styles/09.AIAvatarStyles';

// ========================================
// Icone de Microfone
// ========================================
const MicIcon = ({ color = '#FFFFFF', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
      fill={color}
    />
    <Path
      d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17Z"
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
// Icone de Fechar
// ========================================
const CloseIcon = ({ color = '#EF4444', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface AvatarVoiceRecorderProps {
  onSend: (audioUri: string) => void;             //......Callback ao enviar
  disabled?: boolean;                             //......Se esta desabilitado
}

// ========================================
// Componente Principal
// ========================================
const AvatarVoiceRecorder: React.FC<AvatarVoiceRecorderProps> = ({
  onSend,
  disabled = false,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // ========================================
  // Refs
  // ========================================
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // Efeito: Animacao de Pulso
  // ========================================
  useEffect(() => {
    if (isRecording) {
      // Iniciar animacao de pulso
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,                        //......Escala maior
            duration: 600,                        //......Duracao
            useNativeDriver: true,                //......Driver nativo
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,                         //......Escala normal
            duration: 600,                        //......Duracao
            useNativeDriver: true,                //......Driver nativo
          }),
        ])
      );

      animation.start();

      return () => {
        animation.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isRecording, pulseAnim]);

  // ========================================
  // Iniciar Gravacao
  // ========================================
  const startRecording = async () => {
    try {
      // Solicitar permissao
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        console.warn('[VoiceRecorder] Permissao negada');
        return;
      }

      // Configurar audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,                  //......Permitir gravacao iOS
        playsInSilentModeIOS: true,                //......Tocar em modo silencioso
      });

      // Criar gravacao
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordTime(0);

      // Iniciar contador de tempo
      intervalRef.current = setInterval(() => {
        setRecordTime(prev => prev + 0.1);
      }, 100);

      console.log('[VoiceRecorder] Gravacao iniciada');
    } catch (error) {
      console.error('[VoiceRecorder] Erro ao iniciar:', error);
    }
  };

  // ========================================
  // Parar e Enviar
  // ========================================
  const stopAndSend = async () => {
    if (!recording) return;

    try {
      // Parar contador
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Parar gravacao
      await recording.stopAndUnloadAsync();

      // Obter URI
      const uri = recording.getURI();

      // Resetar estados
      setRecording(null);
      setIsRecording(false);
      setRecordTime(0);

      // Enviar se tiver URI
      if (uri) {
        console.log('[VoiceRecorder] Enviando audio:', uri);
        onSend(uri);
      }
    } catch (error) {
      console.error('[VoiceRecorder] Erro ao parar:', error);
    }
  };

  // ========================================
  // Cancelar Gravacao
  // ========================================
  const cancelRecording = async () => {
    if (!recording) return;

    try {
      // Parar contador
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Parar e descartar gravacao
      await recording.stopAndUnloadAsync();

      // Resetar estados
      setRecording(null);
      setIsRecording(false);
      setRecordTime(0);

      console.log('[VoiceRecorder] Gravacao cancelada');
    } catch (error) {
      console.error('[VoiceRecorder] Erro ao cancelar:', error);
    }
  };

  // ========================================
  // Formatar Tempo
  // ========================================
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================
  // Render: Estado Idle
  // ========================================
  if (!isRecording) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.micButton, disabled && styles.disabled]}
          onPress={startRecording}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <MicIcon color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>
    );
  }

  // ========================================
  // Render: Estado Gravando
  // ========================================
  return (
    <View style={styles.recordingContainer}>
      {/* Botao Cancelar */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={cancelRecording}
        activeOpacity={0.7}
      >
        <CloseIcon color={COLORS.danger} size={16} />
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>

      {/* Indicador de Gravacao */}
      <View style={styles.recordingIndicator}>
        <Animated.View
          style={[
            styles.recordingDot,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={styles.recordingTime}>
          {formatTime(recordTime)}
        </Text>
      </View>

      {/* Botao Enviar */}
      <TouchableOpacity
        style={styles.micButton}
        onPress={stopAndSend}
        activeOpacity={0.7}
      >
        <SendIcon color="#FFFFFF" size={18} />
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Export
// ========================================
export default AvatarVoiceRecorder;
