// ========================================
// Contexto de Navegacao Lead <-> Lola
// Gerencia swipe entre telas
// ========================================

// ========================================
// Imports
// ========================================
import React, {
  createContext,                          //......Cria contexto
  useContext,                             //......Hook de contexto
  useState,                               //......Estado local
  useCallback,                            //......Callback memoizado
  useMemo,                                //......Valor memoizado
  useRef,                                 //......Referencia
  ReactNode,                              //......Tipo de children
} from 'react';
import {
  Animated,                               //......Animacoes
  Dimensions,                             //......Dimensoes da tela
  PanResponder,                           //......Gestos
  PanResponderGestureState,               //......Tipo do gesto
  PanResponderInstance,                   //......Tipo do responder
} from 'react-native';

// ========================================
// Constantes
// ========================================
const SCREEN_WIDTH = Dimensions.get('window').width; //......Largura da tela
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; //...............30% da tela
const VELOCITY_THRESHOLD = 500; //...........................Velocidade minima

// ========================================
// Tipos
// ========================================

// Tipo da tela ativa
type ActiveScreen = 'lead' | 'lola';

// Interface do valor do contexto
interface LeadLolaContextValue {
  activeScreen: ActiveScreen;             //......Tela ativa atual
  translateX: Animated.Value;             //......Valor de translacao
  panResponder: PanResponderInstance;     //......Responder de gestos
  goToLead: () => void;                   //......Navega para Lead
  goToLola: () => void;                   //......Navega para Lola
  toggleScreen: () => void;               //......Alterna entre telas
  isAnimating: boolean;                   //......Se esta animando
}

// Interface de props do provider
interface LeadLolaProviderProps {
  children: ReactNode;                    //......Filhos do provider
}

// ========================================
// Contexto
// ========================================
const LeadLolaContext = createContext<LeadLolaContextValue | null>(null);

// ========================================
// Provider
// ========================================
export const LeadLolaProvider: React.FC<LeadLolaProviderProps> = ({
  children,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('lead');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const translateX = useRef(new Animated.Value(0)).current;

  // ========================================
  // Funcao de Animacao
  // ========================================
  const animateTo = useCallback((screen: ActiveScreen) => {
    const toValue = screen === 'lead' ? 0 : -SCREEN_WIDTH;

    // Atualiza tela IMEDIATAMENTE (antes da animacao)
    setActiveScreen(screen);              //......Troca header instantanea
    setIsAnimating(true);

    Animated.spring(translateX, {
      toValue,                            //......Valor final
      useNativeDriver: true,              //......Usa driver nativo
      friction: 8,                        //......Friccao da mola
      tension: 40,                        //......Tensao da mola
    }).start(() => {
      setIsAnimating(false);              //......Finaliza animacao
    });
  }, [translateX]);

  // ========================================
  // Handlers de Navegacao
  // ========================================
  const goToLead = useCallback(() => {
    if (activeScreen !== 'lead' && !isAnimating) {
      animateTo('lead');
    }
  }, [activeScreen, isAnimating, animateTo]);

  const goToLola = useCallback(() => {
    if (activeScreen !== 'lola' && !isAnimating) {
      animateTo('lola');
    }
  }, [activeScreen, isAnimating, animateTo]);

  // ========================================
  // Toggle Screen
  // ========================================
  const toggleScreen = useCallback(() => {
    if (isAnimating) return;
    if (activeScreen === 'lead') {
      animateTo('lola');
    } else {
      animateTo('lead');
    }
  }, [activeScreen, isAnimating, animateTo]);

  // ========================================
  // Ref para activeScreen atual
  // ========================================
  const activeScreenRef = useRef(activeScreen);
  activeScreenRef.current = activeScreen;

  // ========================================
  // PanResponder - Swipe automatico
  // ========================================
  const panResponder = useRef(
    PanResponder.create({
      // Determina se deve capturar o gesto
      onMoveShouldSetPanResponder: (_, gesture: PanResponderGestureState) => {
        // So captura se movimento horizontal > 20px e maior que vertical
        return Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 2;
      },

      // NAO permite arrastar - swipe eh instantaneo
      onPanResponderMove: () => {
        // Nao faz nada - nao permite arrastar no meio
      },

      // Ao soltar - detecta direcao e completa automaticamente
      onPanResponderRelease: (_, gesture: PanResponderGestureState) => {
        // Verifica se foi um swipe valido (velocidade ou distancia)
        const isValidSwipe = Math.abs(gesture.vx) > 0.3 || Math.abs(gesture.dx) > 50;

        if (!isValidSwipe) return;

        // Determina direcao do swipe
        const isSwipeLeft = gesture.dx < 0 || gesture.vx < -0.3;
        const isSwipeRight = gesture.dx > 0 || gesture.vx > 0.3;

        // Usa ref para pegar estado atual
        const currentScreen = activeScreenRef.current;

        // Se esta no Lead e swipou para esquerda -> vai para Lola
        if (currentScreen === 'lead' && isSwipeLeft) {
          animateTo('lola');
        }
        // Se esta na Lola e swipou para direita -> vai para Lead
        else if (currentScreen === 'lola' && isSwipeRight) {
          animateTo('lead');
        }
      },
    })
  ).current;

  // ========================================
  // Valor do Contexto
  // ========================================
  const value = useMemo<LeadLolaContextValue>(() => ({
    activeScreen,                         //......Tela ativa
    translateX,                           //......Valor de translacao
    panResponder,                         //......Responder de gestos
    goToLead,                             //......Navega para Lead
    goToLola,                             //......Navega para Lola
    toggleScreen,                         //......Alterna entre telas
    isAnimating,                          //......Se esta animando
  }), [
    activeScreen,
    translateX,
    panResponder,
    goToLead,
    goToLola,
    toggleScreen,
    isAnimating,
  ]);

  // ========================================
  // Render
  // ========================================
  return (
    <LeadLolaContext.Provider value={value}>
      {children}
    </LeadLolaContext.Provider>
  );
};

// ========================================
// Hook de Uso
// ========================================
export const useLeadLola = (): LeadLolaContextValue => {
  const context = useContext(LeadLolaContext);
  if (!context) {
    throw new Error('useLeadLola deve ser usado dentro de LeadLolaProvider');
  }
  return context;
};

// ========================================
// Export Default
// ========================================
export default LeadLolaProvider;
