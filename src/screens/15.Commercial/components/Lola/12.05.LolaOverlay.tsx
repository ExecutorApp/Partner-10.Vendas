// ========================================
// Componente: Overlay da Lola
// Fundo escurecido para estado float_g
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  Animated,                               //......Animacoes
  TouchableWithoutFeedback,               //......Toque sem feedback
  StyleSheet,                             //......Estilos
} from 'react-native';

// ========================================
// Imports de Contexto
// ========================================
import { useLolaAvatar } from '../../contexts/LolaAvatarContext';

// ========================================
// Componente
// ========================================
const LolaOverlay: React.FC = () => {
  // ========================================
  // Contexto
  // ========================================
  const { opacityAnim, minimize } = useLolaAvatar();

  // ========================================
  // Render
  // ========================================
  return (
    <TouchableWithoutFeedback onPress={minimize}>
      <Animated.View
        style={[
          styles.overlay,
          { opacity: opacityAnim },
        ]}
      />
    </TouchableWithoutFeedback>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    position: 'absolute',                 //......Posicao absoluta
    top: 0,                               //......Topo
    left: 0,                              //......Esquerda
    right: 0,                             //......Direita
    bottom: 0,                            //......Fundo
    backgroundColor: '#000000',           //......Fundo preto
    zIndex: 998,                          //......Abaixo do avatar
  },
});

// ========================================
// Export
// ========================================
export default LolaOverlay;
