// ========================================
// Componente RecordingBar
// Barra de gravacao de audio estilo WhatsApp
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, {                           //......React core
  useEffect,                              //......Hook de efeito
  useCallback,                            //......Hook de callback
  useMemo,                                //......Hook de memo
  useState,                               //......Hook de estado
} from 'react';                           //......Biblioteca React
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  Animated,                               //......Animacoes
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Imports de Componentes
// ========================================
import AudioWaveBars from '../../../../../../components/audio/AudioWaveBars';

// ========================================
// Interface de Props
// ========================================
interface RecordingBarProps {
  duration: number;                       //......Duracao em segundos
  onCancel: () => void;                   //......Handler cancelar
  onSend: () => void;                     //......Handler enviar
  waveHeights?: number[];                 //......Alturas das ondas
}

// ========================================
// Icone de Lixeira
// ========================================
const TrashIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Icone de Enviar
// ========================================
const SendIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ========================================
// Componente de Indicador Pulsante
// ========================================
const PulsingIndicator: React.FC = () => {
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,                   //......Escala maior
          duration: 500,                  //......Duracao
          useNativeDriver: true,          //......Native driver
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,                     //......Escala normal
          duration: 500,                  //......Duracao
          useNativeDriver: true,          //......Native driver
        }),
      ])
    );

    animation.start();                    //......Inicia animacao

    return () => {
      animation.stop();                   //......Para ao desmontar
    };
  }, [pulseAnim]);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[
          styles.pulseRing,               //......Estilo anel
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <View style={styles.pulseCenter} />
    </View>
  );
};

// ========================================
// Funcao para formatar duracao
// ========================================
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ========================================
// Componente Principal RecordingBar
// ========================================
const RecordingBar: React.FC<RecordingBarProps> = ({
  duration,                               //......Duracao
  onCancel,                               //......Handler cancelar
  onSend,                                 //......Handler enviar
  waveHeights = [],                       //......Alturas das ondas
}) => {
  // ========================================
  // Estado para ondas progressivas
  // ========================================
  const [progressHeights, setProgressHeights] = useState<number[]>([]);
  const MAX_BARS = 20;                    //......Maximo de barras

  // ========================================
  // Gerar ondas progressivas
  // ========================================
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressHeights((prev) => {
        if (prev.length >= MAX_BARS) {
          // Rotacionar para manter animacao
          const [, ...rest] = prev;
          const newHeight = Math.floor(Math.random() * 24) + 6;
          return [...rest, newHeight];
        }
        // Adicionar nova barra
        const newHeight = Math.floor(Math.random() * 24) + 6;
        return [...prev, newHeight];
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Botao Cancelar */}
      <Pressable
        style={styles.cancelButton}       //......Estilo botao
        onPress={onCancel}                //......Handler
        hitSlop={12}                      //......Area de toque
      >
        <TrashIcon
          color={ChatColors.error}        //......Cor vermelha
          size={24}                       //......Tamanho
        />
      </Pressable>

      {/* Area Central */}
      <View style={styles.centerArea}>
        {/* Indicador Pulsante */}
        <PulsingIndicator />

        {/* Ondas Animadas usando AudioWaveBars */}
        <View style={styles.wavesContainer}>
          <AudioWaveBars
            active                        //......Ativo
            animate                       //......Animando
            speedMs={80}                  //......Velocidade
            progressHeights={progressHeights}
            maxBars={MAX_BARS}            //......Max barras
            tailDots={2}                  //......Pontos no final
            ghostCount={1}                //......Fantasma
          />
        </View>

        {/* Duracao */}
        <Text style={styles.durationText}>
          {formatDuration(duration)}
        </Text>
      </View>

      {/* Botao Enviar */}
      <Pressable
        style={styles.sendButton}         //......Estilo botao
        onPress={onSend}                  //......Handler
        hitSlop={12}                      //......Area de toque
      >
        <SendIcon
          color={ChatColors.white}        //......Cor branca
          size={20}                       //......Tamanho
        />
      </Pressable>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default RecordingBar;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    backgroundColor: ChatColors.inputBackground,
    borderTopWidth: 1,                    //......Borda superior
    borderTopColor: ChatColors.inputBorder,
    paddingHorizontal: 12,                //......Padding horizontal
    paddingVertical: 12,                  //......Padding vertical
    gap: 12,                              //......Espaco entre
  },

  // Botao cancelar
  cancelButton: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 24,                     //......Circular
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Area central
  centerArea: {
    flex: 1,                              //......Ocupa espaco
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 12,                              //......Espaco entre
  },

  // Container do pulso
  pulseContainer: {
    width: 24,                            //......Largura
    height: 24,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },

  // Anel do pulso
  pulseRing: {
    position: 'absolute',                 //......Posicao absoluta
    width: 20,                            //......Largura
    height: 20,                           //......Altura
    borderRadius: 10,                     //......Circular
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },

  // Centro do pulso
  pulseCenter: {
    width: 12,                            //......Largura
    height: 12,                           //......Altura
    borderRadius: 6,                      //......Circular
    backgroundColor: ChatColors.recording,
  },

  // Container das ondas
  wavesContainer: {
    flex: 1,                              //......Ocupa espaco
    height: 32,                           //......Altura fixa
    justifyContent: 'center',             //......Centraliza vertical
  },

  // Texto da duracao
  durationText: {
    fontFamily: 'Inter_600SemiBold',      //......Fonte bold
    fontSize: 16,                         //......Tamanho fonte
    color: ChatColors.recording,          //......Vermelho
    minWidth: 45,                         //......Largura minima
    textAlign: 'right',                   //......Alinhamento direita
  },

  // Botao enviar
  sendButton: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    borderRadius: 24,                     //......Circular
    backgroundColor: ChatColors.sendButton,
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});
