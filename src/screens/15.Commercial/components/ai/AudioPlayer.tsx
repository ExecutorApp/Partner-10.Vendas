// ========================================
// Componente AudioPlayer
// Player de audio para respostas TTS
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                       //......React core
  useState,                           //......Hook de estado
  useEffect,                          //......Hook de efeito
  useCallback,                        //......Hook de callback
  useRef,                             //......Hook de referencia
} from 'react';                       //......Biblioteca React
import {                              //......Componentes RN
  View,                               //......Container basico
  Text,                               //......Texto
  TouchableOpacity,                   //......Botao tocavel
  StyleSheet,                         //......Estilos
  Animated,                           //......Animacoes
} from 'react-native';                //......Biblioteca RN
import Svg, {                         //......Componentes SVG
  Path,                               //......Path do SVG
} from 'react-native-svg';            //......Biblioteca SVG
import { Audio, AVPlaybackStatus } from 'expo-av'; //..Audio do Expo

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

// Icone de Play
const PlayIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 5v14l11-7z"
      fill={color}
    />
  </Svg>
);

// Icone de Pause
const PauseIcon = ({ color = COLORS.white }: { color?: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
      fill={color}
    />
  </Svg>
);

// ========================================
// Interface de Props
// ========================================
interface AudioPlayerProps {
  uri: string;                        //......URI do audio
  autoPlay?: boolean;                 //......Iniciar automatico
  size?: 'small' | 'medium';          //......Tamanho do player
  color?: 'primary' | 'white';        //......Cor do tema
  onComplete?: () => void;            //......Callback ao terminar
  onError?: (error: Error) => void;   //......Callback de erro
}

// ========================================
// Componente AudioPlayer
// ========================================
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  uri,                                //......URI do audio
  autoPlay = false,                   //......Iniciar automatico
  size = 'medium',                    //......Tamanho padrao
  color = 'primary',                  //......Cor padrao
  onComplete,                         //......Callback ao terminar
  onError,                            //......Callback de erro
}) => {
  // ========================================
  // Estados
  // ========================================
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // ========================================
  // Refs
  // ========================================
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ========================================
  // Cores baseadas no tema
  // ========================================
  const buttonBgColor = color === 'primary' ? COLORS.primary : COLORS.white;
  const buttonIconColor = color === 'primary' ? COLORS.white : COLORS.primary;
  const progressBgColor = color === 'primary' ? COLORS.backgroundAlt : 'rgba(255,255,255,0.3)';
  const progressFillColor = color === 'primary' ? COLORS.primary : COLORS.white;
  const textColor = color === 'primary' ? COLORS.textSecondary : COLORS.white;

  // ========================================
  // Tamanhos baseados no size
  // ========================================
  const buttonSize = size === 'small' ? 28 : 36;
  const progressHeight = size === 'small' ? 3 : 4;

  // ========================================
  // Cleanup do audio ao desmontar
  // ========================================
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync(); //..Descarregar audio
      }
    };
  }, []);

  // ========================================
  // AutoPlay quando uri mudar
  // ========================================
  useEffect(() => {
    if (autoPlay && uri) {
      handlePlay();                    //......Iniciar automatico
    }
  }, [uri, autoPlay]);

  // ========================================
  // Formatar tempo em mm:ss
  // ========================================
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // ========================================
  // Handler de Play
  // ========================================
  const handlePlay = useCallback(async () => {
    try {
      setIsLoading(true);              //......Iniciar loading

      // Descarregar audio anterior se existir
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configurar modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,    //......Tocar em silencioso
        staysActiveInBackground: false, //....Nao tocar em background
      });

      // Carregar novo audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },                       //......URI do audio
        { shouldPlay: true },          //......Iniciar tocando
        onPlaybackStatusUpdate,        //......Callback de status
      );

      soundRef.current = sound;        //......Salvar referencia
      setIsPlaying(true);              //......Marcar como tocando
      setIsLoading(false);             //......Finalizar loading

    } catch (error) {
      setIsLoading(false);             //......Finalizar loading
      setIsPlaying(false);             //......Marcar como parado
      if (onError) {
        onError(error as Error);       //......Chamar callback
      }
    }
  }, [uri, onError]);

  // ========================================
  // Handler de Pause
  // ========================================
  const handlePause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);             //......Marcar como pausado
    }
  }, []);

  // ========================================
  // Handler de Resume
  // ========================================
  const handleResume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);              //......Marcar como tocando
    }
  }, []);

  // ========================================
  // Callback de Status do Playback
  // ========================================
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;      //......Ignorar se nao carregado

    // Atualizar duracao
    if (status.durationMillis) {
      setDuration(status.durationMillis);
    }

    // Atualizar progresso
    if (status.positionMillis && status.durationMillis) {
      const currentProgress = status.positionMillis / status.durationMillis;
      setProgress(currentProgress);    //......Atualizar estado
      progressAnim.setValue(currentProgress); //..Atualizar animacao
    }

    // Verificar se terminou
    if (status.didJustFinish) {
      setIsPlaying(false);             //......Marcar como parado
      setProgress(0);                  //......Resetar progresso
      progressAnim.setValue(0);        //......Resetar animacao
      if (onComplete) {
        onComplete();                  //......Chamar callback
      }
    }
  }, [onComplete, progressAnim]);

  // ========================================
  // Handler de Toggle Play/Pause
  // ========================================
  const handleToggle = useCallback(() => {
    if (isLoading) return;             //......Ignorar se loading

    if (isPlaying) {
      handlePause();                   //......Pausar
    } else if (progress > 0) {
      handleResume();                  //......Resumir
    } else {
      handlePlay();                    //......Iniciar
    }
  }, [isLoading, isPlaying, progress, handlePause, handleResume, handlePlay]);

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      {/* Botao Play/Pause */}
      <TouchableOpacity
        style={[
          styles.playButton,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: buttonBgColor,
          },
        ]}
        onPress={handleToggle}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isLoading ? (
          // Loading indicator
          <View style={styles.loadingDot} />
        ) : isPlaying ? (
          // Icone Pause
          <PauseIcon color={buttonIconColor} />
        ) : (
          // Icone Play
          <PlayIcon color={buttonIconColor} />
        )}
      </TouchableOpacity>

      {/* Barra de Progresso */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBackground,
            {
              height: progressHeight,
              backgroundColor: progressBgColor,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                height: progressHeight,
                backgroundColor: progressFillColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Tempo */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: textColor }]}>
            {formatTime(duration * progress)}
          </Text>
          <Text style={[styles.timeText, { color: textColor }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default AudioPlayer;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',             //......Layout horizontal
    alignItems: 'center',             //......Centralizar vertical
    gap: 10,                          //......Espaco entre itens
  },

  // Botao play/pause
  playButton: {
    borderRadius: 18,                 //......Arredondamento
    justifyContent: 'center',         //......Centralizar vertical
    alignItems: 'center',             //......Centralizar horizontal
  },

  // Indicador de loading
  loadingDot: {
    width: 8,                         //......Largura
    height: 8,                        //......Altura
    borderRadius: 4,                  //......Arredondamento
    backgroundColor: COLORS.white,    //......Cor branca
    opacity: 0.7,                     //......Opacidade
  },

  // Container do progresso
  progressContainer: {
    flex: 1,                          //......Ocupar espaco
  },

  // Fundo da barra de progresso
  progressBackground: {
    borderRadius: 2,                  //......Arredondamento
    overflow: 'hidden',               //......Esconder overflow
  },

  // Preenchimento da barra
  progressFill: {
    borderRadius: 2,                  //......Arredondamento
  },

  // Container do tempo
  timeContainer: {
    flexDirection: 'row',             //......Layout horizontal
    justifyContent: 'space-between',  //......Espaco entre itens
    marginTop: 4,                     //......Margem superior
  },

  // Texto do tempo
  timeText: {
    fontSize: 10,                     //......Tamanho fonte
    fontFamily: 'Inter_400Regular',   //......Fonte Inter Regular
  },
});
