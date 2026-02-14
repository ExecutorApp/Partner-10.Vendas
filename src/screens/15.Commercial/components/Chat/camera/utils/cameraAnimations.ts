// ========================================
// Utilitarios de Animacao da Camera
// Configuracoes de transicao e interpoladores
// ========================================

// ========================================
// Imports React Native
// ========================================
import { Animated, Easing } from 'react-native';
import { StackCardInterpolationProps, StackCardStyleInterpolator } from '@react-navigation/stack';

// ========================================
// Tipo de Especificacao de Transicao
// ========================================
interface TransitionSpec {
  animation: 'timing' | 'spring';
  config: {
    duration?: number;
    easing?: (value: number) => number;
    stiffness?: number;
    damping?: number;
    mass?: number;
    overshootClamping?: boolean;
    restDisplacementThreshold?: number;
    restSpeedThreshold?: number;
  };
}

// ========================================
// Constantes de Duracao
// ========================================
export const ANIMATION_DURATION = {
  fast: 150, //......... Animacoes rapidas
  normal: 250, //....... Animacoes normais
  slow: 350, //......... Animacoes lentas
  fadeIn: 200, //....... Fade in
  fadeOut: 150, //...... Fade out
  scale: 200, //........ Escala
  slide: 300, //........ Deslizamento
};

// ========================================
// Especificacao de Transicao Padrao
// ========================================
export const defaultTransitionSpec: TransitionSpec = {
  animation: 'timing', //................ Tipo de animacao
  config: {
    duration: ANIMATION_DURATION.normal, // Duracao
    easing: Easing.out(Easing.cubic), //.. Curva de aceleracao
  },
};

// ========================================
// Especificacao de Transicao Rapida
// ========================================
export const fastTransitionSpec: TransitionSpec = {
  animation: 'timing', //............. Tipo de animacao
  config: {
    duration: ANIMATION_DURATION.fast, // Duracao
    easing: Easing.out(Easing.quad), //.. Curva de aceleracao
  },
};

// ========================================
// Interpolador de Fade
// Transicao suave com opacidade
// ========================================
export const fadeCardStyleInterpolator: StackCardStyleInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress, //.. Opacidade baseada no progresso
  },
});

// ========================================
// Interpolador de Slide Vertical
// Transicao de baixo para cima
// ========================================
export const slideVerticalInterpolator: StackCardStyleInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1], //............. Range de entrada
          outputRange: [layouts.screen.height, 0], // De fora para dentro
        }),
      },
    ],
  },
});

// ========================================
// Interpolador de Slide com Fade
// Combinacao de deslizamento e opacidade
// ========================================
export const slideWithFadeInterpolator: StackCardStyleInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1], //.. Range de entrada
      outputRange: [0, 0.5, 1], //. Opacidade progressiva
    }),
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1], //............. Range de entrada
          outputRange: [layouts.screen.height * 0.1, 0], // Deslizamento suave
        }),
      },
    ],
  },
});

// ========================================
// Interpolador de Escala com Fade
// Zoom in com opacidade
// ========================================
export const scaleWithFadeInterpolator: StackCardStyleInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.5, 1], //.. Range de entrada
      outputRange: [0, 0.8, 1], //. Opacidade progressiva
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1], //......... Range de entrada
          outputRange: [0.9, 1], //...... De 90% para 100%
        }),
      },
    ],
  },
});

// ========================================
// Interpolador para Camera
// Slide vertical rapido
// ========================================
export const cameraScreenInterpolator: StackCardStyleInterpolator = ({ current, layouts }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.3, 1], //.. Range de entrada
      outputRange: [0, 1, 1], //... Fade rapido no inicio
    }),
    transform: [
      {
        translateY: current.progress.interpolate({
          inputRange: [0, 1], //............. Range de entrada
          outputRange: [layouts.screen.height * 0.15, 0], // Slide suave
        }),
      },
    ],
  },
});

// ========================================
// Interpolador para Preview
// Fade com escala sutil
// ========================================
export const previewScreenInterpolator: StackCardStyleInterpolator = ({ current }: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1], //.. Range de entrada
      outputRange: [0, 1], //. Opacidade linear
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [0, 1], //......... Range de entrada
          outputRange: [1.05, 1], //..... De 105% para 100%
        }),
      },
    ],
  },
});

// ========================================
// Opcoes de Transicao para Camera
// ========================================
export const cameraTransitionOptions = {
  gestureEnabled: false, //......................... Desabilita gestos
  transitionSpec: {
    open: defaultTransitionSpec, //... Especificacao de abertura
    close: fastTransitionSpec, //.... Especificacao de fechamento
  },
  cardStyleInterpolator: cameraScreenInterpolator, // Interpolador
};

// ========================================
// Opcoes de Transicao para Preview
// ========================================
export const previewTransitionOptions = {
  gestureEnabled: false, //............................ Desabilita gestos
  transitionSpec: {
    open: defaultTransitionSpec, //...... Especificacao de abertura
    close: fastTransitionSpec, //....... Especificacao de fechamento
  },
  cardStyleInterpolator: previewScreenInterpolator, // Interpolador
};

// ========================================
// Opcoes de Transicao com Fade
// ========================================
export const fadeTransitionOptions = {
  gestureEnabled: false, //...................... Desabilita gestos
  transitionSpec: {
    open: defaultTransitionSpec, //.. Especificacao de abertura
    close: fastTransitionSpec, //... Especificacao de fechamento
  },
  cardStyleInterpolator: fadeCardStyleInterpolator, // Interpolador
};

// ========================================
// Funcao para Criar Animacao de Entrada
// ========================================
export const createEnterAnimation = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  duration: number = ANIMATION_DURATION.normal
) => {
  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1, //................... Valor final
      duration, //..................... Duracao
      useNativeDriver: true, //........ Driver nativo
      easing: Easing.out(Easing.cubic), // Curva
    }),
    Animated.timing(translateY, {
      toValue: 0, //................... Valor final
      duration, //..................... Duracao
      useNativeDriver: true, //........ Driver nativo
      easing: Easing.out(Easing.cubic), // Curva
    }),
  ]);
};

// ========================================
// Funcao para Criar Animacao de Saida
// ========================================
export const createExitAnimation = (
  opacity: Animated.Value,
  translateY: Animated.Value,
  exitDistance: number = 50,
  duration: number = ANIMATION_DURATION.fast
) => {
  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 0, //.................. Valor final
      duration, //.................... Duracao
      useNativeDriver: true, //....... Driver nativo
      easing: Easing.in(Easing.quad), // Curva
    }),
    Animated.timing(translateY, {
      toValue: exitDistance, //....... Valor final
      duration, //.................... Duracao
      useNativeDriver: true, //....... Driver nativo
      easing: Easing.in(Easing.quad), // Curva
    }),
  ]);
};

// ========================================
// Funcao para Criar Animacao de Pulsar
// ========================================
export const createPulseAnimation = (scale: Animated.Value, duration: number = 1000) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1, //................ Valor maximo
        duration: duration / 2, //...... Metade da duracao
        useNativeDriver: true, //....... Driver nativo
        easing: Easing.inOut(Easing.ease), // Curva
      }),
      Animated.timing(scale, {
        toValue: 1, //.................. Valor minimo
        duration: duration / 2, //...... Metade da duracao
        useNativeDriver: true, //....... Driver nativo
        easing: Easing.inOut(Easing.ease), // Curva
      }),
    ])
  );
};

// ========================================
// Funcao para Criar Animacao de Bounce
// ========================================
export const createBounceAnimation = (scale: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(scale, {
      toValue: 0.9, //............... Escala para baixo
      duration: 100, //.............. Duracao
      useNativeDriver: true, //...... Driver nativo
      easing: Easing.out(Easing.quad), // Curva
    }),
    Animated.spring(scale, {
      toValue: 1, //................. Volta ao normal
      friction: 4, //................ Friccao
      tension: 100, //............... Tensao
      useNativeDriver: true, //...... Driver nativo
    }),
  ]);
};

// ========================================
// Export Default
// ========================================
export default {
  ANIMATION_DURATION,
  defaultTransitionSpec,
  fastTransitionSpec,
  fadeCardStyleInterpolator,
  slideVerticalInterpolator,
  slideWithFadeInterpolator,
  scaleWithFadeInterpolator,
  cameraScreenInterpolator,
  previewScreenInterpolator,
  cameraTransitionOptions,
  previewTransitionOptions,
  fadeTransitionOptions,
  createEnterAnimation,
  createExitAnimation,
  createPulseAnimation,
  createBounceAnimation,
};
