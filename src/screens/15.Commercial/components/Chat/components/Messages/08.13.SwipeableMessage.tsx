// ========================================
// Componente SwipeableMessage
// Wrapper com gesto de swipe para reply
// ========================================

// React e React Native
import React, { useRef } from 'react';
import { Animated, PanResponder, View, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// ========================================
// Constantes de Swipe
// ========================================
const SWIPE_THRESHOLD = 60;               //......Distancia minima para ativar reply
const MAX_SWIPE = 80;                     //......Translacao maxima permitida

// ========================================
// Interface de Props
// ========================================
interface SwipeableMessageProps {
  onSwipeReply: () => void;               //......Callback ao completar swipe
  enabled?: boolean;                      //......Habilita ou desabilita swipe
  children: React.ReactNode;              //......Conteudo da mensagem
}

// ========================================
// Icone de Reply (seta curvada)
// ========================================
const ReplyIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 9V5L3 12L10 19V14.9C15 14.9 18.5 16.5 21 20C20 15 17 10 10 9Z"
      fill="#7D8592"
    />
  </Svg>
);

// ========================================
// Componente Principal
// ========================================
const SwipeableMessage: React.FC<SwipeableMessageProps> = ({
  onSwipeReply,
  enabled = true,
  children,
}) => {
  // ========================================
  // Refs e Animated Values
  // ========================================
  const translateX = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const onSwipeReplyRef = useRef(onSwipeReply);
  onSwipeReplyRef.current = onSwipeReply;

  // ========================================
  // PanResponder para Swipe Horizontal Direito
  // Captura apenas swipes da esquerda para direita
  // ========================================
  const panResponder = useRef(
    PanResponder.create({
      // Captura swipes horizontais para a direita
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (!enabled) return false;       //......Desabilitado
        return dx > 10 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },

      // Captura com prioridade sobre o pai
      onMoveShouldSetPanResponderCapture: (_, { dx, dy }) => {
        if (!enabled) return false;       //......Desabilitado
        return dx > 15 && Math.abs(dx) > Math.abs(dy) * 2;
      },

      // Nao permite que o pai tome o gesto
      onPanResponderTerminationRequest: () => false,

      // Anima a mensagem durante o swipe
      onPanResponderMove: (_, { dx }) => {
        if (dx > 0) {
          const capped = Math.min(dx, MAX_SWIPE);
          translateX.setValue(capped);     //......Move mensagem
          iconScale.setValue(Math.min(1, capped / SWIPE_THRESHOLD));
        }
      },

      // Verifica threshold ao soltar o dedo
      onPanResponderRelease: (_, { dx }) => {
        if (dx >= SWIPE_THRESHOLD) {
          onSwipeReplyRef.current();      //......Dispara reply
        }
        // Retorna para posicao original
        Animated.spring(translateX, {
          toValue: 0,                     //......Posicao original
          useNativeDriver: true,          //......Driver nativo
          tension: 40,                    //......Tensao da mola
          friction: 7,                    //......Friccao da mola
        }).start();
        Animated.timing(iconScale, {
          toValue: 0,                     //......Esconde icone
          duration: 200,                  //......Duracao fade out
          useNativeDriver: true,          //......Driver nativo
        }).start();
      },

      // Cancela animacao se gesto interrompido
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,                     //......Posicao original
          useNativeDriver: true,          //......Driver nativo
        }).start();
        Animated.timing(iconScale, {
          toValue: 0,                     //......Esconde icone
          duration: 150,                  //......Duracao fade out
          useNativeDriver: true,          //......Driver nativo
        }).start();
      },
    })
  ).current;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.wrapper}>
      {/* Icone de Reply (aparece atras da mensagem durante swipe) */}
      <Animated.View
        style={[
          styles.replyIconContainer,
          {
            opacity: iconScale,           //......Opacidade animada
            transform: [{ scale: iconScale }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.replyIconCircle}>
          <ReplyIcon />
        </View>
      </Animated.View>

      {/* Conteudo da Mensagem (animado horizontalmente) */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Wrapper do swipeable
  wrapper: {
    position: 'relative',                 //......Posicao relativa
    overflow: 'visible',                  //......Permite overflow do icone
  },

  // Container do icone de reply
  replyIconContainer: {
    position: 'absolute',                 //......Posicao absoluta
    left: 8,                              //......Margem esquerda
    top: 0,                               //......Topo
    bottom: 0,                            //......Fundo
    justifyContent: 'center',             //......Centraliza vertical
    zIndex: -1,                           //......Atras da mensagem
  },

  // Circulo do icone de reply
  replyIconCircle: {
    width: 32,                            //......Largura
    height: 32,                           //......Altura
    borderRadius: 16,                     //......Circulo perfeito
    backgroundColor: '#E8ECF4',           //......Fundo cinza claro
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
  },
});

// ========================================
// Export
// ========================================
export default SwipeableMessage;
