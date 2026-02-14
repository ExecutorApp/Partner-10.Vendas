// ========================================
// Contexto do Avatar Lola
// Maquina de estados para 4 estados visuais
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
  PanResponderInstance,                   //......Tipo do responder
} from 'react-native';

// ========================================
// Constantes
// ========================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Posicao inicial do avatar flutuante
// 10px abaixo do header, 10px da borda direita
const HEADER_HEIGHT = 75;                 //......Altura aproximada do header
const INITIAL_PADDING = 10;               //......Padding de 10px
const INITIAL_AVATAR_SIZE = 60;           //......Tamanho do avatar P

// Posicao inicial (canto superior direito, abaixo do header)
const INITIAL_POSITION = {
  x: SCREEN_WIDTH - INITIAL_AVATAR_SIZE - INITIAL_PADDING,
  y: HEADER_HEIGHT + INITIAL_PADDING,
};

// ========================================
// Tipos
// ========================================

// Estados do avatar
export type LolaAvatarState = 'header' | 'float_p' | 'float_m' | 'float_g';

// Posicao do avatar
type AvatarPosition = 'header' | 'bottom-right' | 'bottom-center' | 'center';

// Configuracao de cada estado
export interface LolaStateConfig {
  size: number;                           //......Tamanho em pixels
  position: AvatarPosition;               //......Posicao na tela
  draggable: boolean;                     //......Se pode arrastar
  showChatBubble: boolean;                //......Se mostra bolha de chat
  showOverlay: boolean;                   //......Se escurece fundo
  showQuickActions: boolean;              //......Botoes rapidos
}

// Interface do valor do contexto
interface LolaAvatarContextValue {
  state: LolaAvatarState;                 //......Estado atual
  config: LolaStateConfig;                //......Configuracao atual
  position: { x: number; y: number };     //......Posicao para float_p
  panPosition: Animated.ValueXY;          //......Posicao animada
  scaleAnim: Animated.Value;              //......Animacao de escala
  opacityAnim: Animated.Value;            //......Animacao de opacidade
  panResponder: PanResponderInstance;     //......Responder de gestos
  handleTap: () => void;                  //......Handler de tap
  minimize: () => void;                   //......Minimizar para header
  transitionTo: (newState: LolaAvatarState) => void;
  isListening: boolean;                   //......Se Lola esta ouvindo
  isTalking: boolean;                     //......Se Lola esta falando
  setIsListening: (value: boolean) => void;
  setIsTalking: (value: boolean) => void;
}

// Interface de props do provider
interface LolaAvatarProviderProps {
  children: ReactNode;                    //......Filhos do provider
}

// ========================================
// Configuracoes dos Estados
// ========================================
export const LOLA_STATE_CONFIGS: Record<LolaAvatarState, LolaStateConfig> = {
  header: {
    size: 45,                             //......45px no header
    position: 'header',                   //......Posicao no header
    draggable: false,                     //......Nao arrasta
    showChatBubble: false,                //......Sem bolha
    showOverlay: false,                   //......Sem overlay
    showQuickActions: false,              //......Sem acoes
  },
  float_p: {
    size: 60,                             //......60px flutuante pequeno
    position: 'bottom-right',             //......Canto inferior direito
    draggable: true,                      //......Pode arrastar
    showChatBubble: false,                //......Sem bolha
    showOverlay: false,                   //......Sem overlay
    showQuickActions: false,              //......Sem acoes
  },
  float_m: {
    size: 120,                            //......120px flutuante medio
    position: 'bottom-right',             //......Canto inferior direito
    draggable: true,                      //......Pode arrastar
    showChatBubble: false,                //......Sem bolha
    showOverlay: false,                   //......Sem overlay
    showQuickActions: false,              //......Sem acoes
  },
  float_g: {
    size: 200,                            //......200px flutuante grande
    position: 'bottom-right',             //......Canto inferior direito
    draggable: true,                      //......Pode arrastar
    showChatBubble: false,                //......Sem bolha
    showOverlay: false,                   //......Sem overlay
    showQuickActions: false,              //......Sem acoes
  },
};

// ========================================
// Contexto
// ========================================
const LolaAvatarContext = createContext<LolaAvatarContextValue | null>(null);

// ========================================
// Provider
// ========================================
export const LolaAvatarProvider: React.FC<LolaAvatarProviderProps> = ({
  children,
}) => {
  // ========================================
  // Estados
  // ========================================
  const [state, setState] = useState<LolaAvatarState>('header');
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // ========================================
  // Animacoes
  // ========================================
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const panPosition = useRef(new Animated.ValueXY(INITIAL_POSITION)).current;

  // ========================================
  // Configuracao Atual
  // ========================================
  const config = LOLA_STATE_CONFIGS[state];

  // ========================================
  // Transicao Animada
  // ========================================
  const transitionTo = useCallback((newState: LolaAvatarState) => {
    const newConfig = LOLA_STATE_CONFIGS[newState];

    // Se esta saindo do header para float_p, resetar posicao
    if (state === 'header' && newState === 'float_p') {
      // Calcular nova posicao com o tamanho correto
      const newX = SCREEN_WIDTH - newConfig.size - INITIAL_PADDING;
      const newY = HEADER_HEIGHT + INITIAL_PADDING;

      // Resetar posicao para canto superior direito
      panPosition.setValue({ x: newX, y: newY });
      setPosition({ x: newX, y: newY });
    }

    // Sequencia de animacao
    Animated.parallel([
      // Scale
      Animated.spring(scaleAnim, {
        toValue: 1,                       //......Volta para 1
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      // Opacity do overlay
      Animated.timing(opacityAnim, {
        toValue: newConfig.showOverlay ? 0.5 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState(newState);
    });
  }, [state, scaleAnim, opacityAnim, panPosition]);

  // ========================================
  // Handler de Tap
  // ========================================
  const handleTap = useCallback(() => {
    const transitions: Record<LolaAvatarState, LolaAvatarState> = {
      header: 'float_p',                  //......Header -> Pequeno
      float_p: 'float_m',                 //......Pequeno -> Medio
      float_m: 'float_g',                 //......Medio -> Grande
      float_g: 'header',                  //......Grande -> Header (ciclo completo)
    };
    transitionTo(transitions[state]);
  }, [state, transitionTo]);

  // ========================================
  // Minimizar
  // ========================================
  const minimize = useCallback(() => {
    transitionTo('header');
  }, [transitionTo]);

  // ========================================
  // Ref para estado atual (para panResponder)
  // ========================================
  const stateRef = useRef(state);
  stateRef.current = state;

  // ========================================
  // Snap para Cantos
  // ========================================
  const snapToNearestCorner = useCallback(() => {
    const padding = INITIAL_PADDING;
    const currentSize = LOLA_STATE_CONFIGS[stateRef.current].size;
    const inputHeight = 60;               //......Altura aproximada do input

    // Cantos disponiveis (considera header e input)
    const corners = [
      { x: padding, y: HEADER_HEIGHT + padding },                              //......Superior esquerdo
      { x: SCREEN_WIDTH - currentSize - padding, y: HEADER_HEIGHT + padding }, //......Superior direito
      { x: padding, y: SCREEN_HEIGHT - currentSize - inputHeight - padding },  //......Inferior esquerdo
      { x: SCREEN_WIDTH - currentSize - padding, y: SCREEN_HEIGHT - currentSize - inputHeight - padding },
    ];

    // Posicao atual
    const currentX = (panPosition.x as any)._value || position.x;
    const currentY = (panPosition.y as any)._value || position.y;

    // Encontrar canto mais proximo
    let nearestCorner = corners[1];       //......Default: superior direito
    let minDistance = Infinity;

    corners.forEach(corner => {
      const distance = Math.sqrt(
        Math.pow(currentX - corner.x, 2) +
        Math.pow(currentY - corner.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCorner = corner;
      }
    });

    // Animar para o canto
    Animated.spring(panPosition, {
      toValue: nearestCorner,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();

    setPosition(nearestCorner);
  }, [panPosition, position]);

  // ========================================
  // PanResponder para todos estados flutuantes
  // ========================================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Permite arrastar em todos os estados flutuantes
        return stateRef.current !== 'header';
      },
      onPanResponderGrant: () => {
        panPosition.setOffset({
          x: (panPosition.x as any)._value,
          y: (panPosition.y as any)._value,
        });
        panPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panPosition.x, dy: panPosition.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        panPosition.flattenOffset();
        snapToNearestCorner();
      },
    })
  ).current;

  // ========================================
  // Valor do Contexto
  // ========================================
  const value = useMemo<LolaAvatarContextValue>(() => ({
    state,                                //......Estado atual
    config,                               //......Configuracao atual
    position,                             //......Posicao do avatar
    panPosition,                          //......Posicao animada
    scaleAnim,                            //......Animacao de escala
    opacityAnim,                          //......Animacao de opacidade
    panResponder,                         //......Responder de gestos
    handleTap,                            //......Handler de tap
    minimize,                             //......Minimizar
    transitionTo,                         //......Transicao
    isListening,                          //......Se esta ouvindo
    isTalking,                            //......Se esta falando
    setIsListening,                       //......Define ouvindo
    setIsTalking,                         //......Define falando
  }), [
    state,
    config,
    position,
    panPosition,
    scaleAnim,
    opacityAnim,
    panResponder,
    handleTap,
    minimize,
    transitionTo,
    isListening,
    isTalking,
  ]);

  // ========================================
  // Render
  // ========================================
  return (
    <LolaAvatarContext.Provider value={value}>
      {children}
    </LolaAvatarContext.Provider>
  );
};

// ========================================
// Hook de Uso
// ========================================
export const useLolaAvatar = (): LolaAvatarContextValue => {
  const context = useContext(LolaAvatarContext);
  if (!context) {
    throw new Error('useLolaAvatar deve ser usado dentro de LolaAvatarProvider');
  }
  return context;
};

// ========================================
// Export Default
// ========================================
export default LolaAvatarProvider;
