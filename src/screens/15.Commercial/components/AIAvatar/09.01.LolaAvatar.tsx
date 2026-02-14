// ========================================
// Componente Lola Avatar
// Avatar animado com sincronizacao labial
// ========================================

// ========================================
// Imports
// ========================================
import React, {                                   //......React core
  useState,                                       //......Hook de estado
  useEffect,                                      //......Hook de efeito
  useRef,                                         //......Hook de referencia
} from 'react';
import {                                          //......Componentes RN
  View,                                           //......Container
  Image,                                          //......Imagem
  Animated,                                       //......Animacao
} from 'react-native';
import type { LipSyncCue } from '../../services/lipSyncService';
import { avatarStyles as styles } from './styles/09.AIAvatarStyles';

// ========================================
// Mapeamento de Visemes para Imagens
// ========================================
const VISEME_IMAGES: Record<string, any> = {
  rest: require('../../../../assets/lola-visemes/lola-rest.png'),
  ai: require('../../../../assets/lola-visemes/lola-ai.png'),
  e: require('../../../../assets/lola-visemes/lola-e.png'),
  o: require('../../../../assets/lola-visemes/lola-o.png'),
  u: require('../../../../assets/lola-visemes/lola-u.png'),
  mbp: require('../../../../assets/lola-visemes/lola-mbp.png'),
  fv: require('../../../../assets/lola-visemes/lola-fv.png'),
  ltdn: require('../../../../assets/lola-visemes/lola-ltdn.png'),
  szc: require('../../../../assets/lola-visemes/lola-szc.png'),
  chj: require('../../../../assets/lola-visemes/lola-chj.png'),
  r: require('../../../../assets/lola-visemes/lola-r.png'),
  closed: require('../../../../assets/lola-visemes/lola-closed.png'),
};

// ========================================
// Interface de Props
// ========================================
interface LolaAvatarProps {
  isListening: boolean;                           //......Se esta ouvindo usuario
  isTalking: boolean;                             //......Se esta falando
  lipSyncData: LipSyncCue[];                     //......Dados de sincronizacao
  currentTime: number;                            //......Tempo atual do audio
  size?: 'normal' | 'large';                      //......Tamanho do avatar
}

// ========================================
// Componente Principal
// ========================================
const LolaAvatar: React.FC<LolaAvatarProps> = ({
  isListening,
  isTalking,
  lipSyncData,
  currentTime,
  size = 'normal',
}) => {
  // ========================================
  // Estados
  // ========================================
  const [currentViseme, setCurrentViseme] = useState('rest');

  // ========================================
  // Refs de Animacao
  // ========================================
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // Efeito: Atualizar Viseme
  // ========================================
  useEffect(() => {
    if (isTalking && lipSyncData.length > 0) {
      // Encontrar viseme para o tempo atual
      const cue = lipSyncData.find(
        c => currentTime >= c.start && currentTime < c.end
      );

      // Definir viseme ou 'rest' como padrao
      const newViseme = cue ? cue.viseme : 'rest';

      // Atualizar apenas se diferente
      if (newViseme !== currentViseme) {
        setCurrentViseme(newViseme);
      }
    } else if (isListening) {
      // Quando esta ouvindo, mostrar 'closed' (atenta)
      setCurrentViseme('closed');
    } else {
      // Estado padrao
      setCurrentViseme('rest');
    }
  }, [isTalking, isListening, lipSyncData, currentTime, currentViseme]);

  // ========================================
  // Efeito: Animacao de Pulso (Ouvindo)
  // ========================================
  useEffect(() => {
    if (isListening) {
      // Iniciar animacao de pulso
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,                        //......Escala maior
            duration: 800,                        //......Duracao
            useNativeDriver: true,                //......Driver nativo
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,                         //......Escala normal
            duration: 800,                        //......Duracao
            useNativeDriver: true,                //......Driver nativo
          }),
        ])
      );

      pulseAnimation.start();

      // Cleanup
      return () => {
        pulseAnimation.stop();
        scaleAnim.setValue(1);
      };
    } else {
      // Resetar escala
      scaleAnim.setValue(1);
    }
  }, [isListening, scaleAnim]);

  // ========================================
  // Efeito: Animacao de Fade (Falando)
  // ========================================
  useEffect(() => {
    if (isTalking) {
      // Pequena animacao de fade para transicao suave
      Animated.timing(opacityAnim, {
        toValue: 0.95,                            //......Opacidade menor
        duration: 50,                             //......Duracao curta
        useNativeDriver: true,                    //......Driver nativo
      }).start(() => {
        Animated.timing(opacityAnim, {
          toValue: 1,                             //......Opacidade total
          duration: 50,                           //......Duracao curta
          useNativeDriver: true,                  //......Driver nativo
        }).start();
      });
    }
  }, [currentViseme, isTalking, opacityAnim]);

  // ========================================
  // Obter Imagem do Viseme
  // ========================================
  const getVisemeImage = () => {
    return VISEME_IMAGES[currentViseme] || VISEME_IMAGES.rest;
  };

  // ========================================
  // Obter Estilo de Tamanho
  // ========================================
  const getSizeStyle = () => {
    if (size === 'large') {
      return styles.avatarLarge;
    }
    return styles.avatarImage;
  };

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <Image
          source={getVisemeImage()}
          style={getSizeStyle()}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

// ========================================
// Export
// ========================================
export default LolaAvatar;
