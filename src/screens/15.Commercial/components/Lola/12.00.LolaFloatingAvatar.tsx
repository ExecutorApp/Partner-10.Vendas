// ========================================
// Componente: Avatar Flutuante da Lola
// Circulo flutuante com 3 tamanhos (P, M, G)
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  TouchableOpacity,                       //......Botao tocavel
  Animated,                               //......Animacoes
  StyleSheet,                             //......Estilos
  Image,                                  //......Imagem
} from 'react-native';

// ========================================
// Imports de Contexto
// ========================================
import { useLolaAvatar } from '../../contexts/LolaAvatarContext';

// ========================================
// Imagem da Lola
// ========================================
const lolaRestImage = require('../../../../assets/lola-visemes/lola-rest.png');

// ========================================
// Cores
// ========================================
const COLORS = {
  white: '#FFFFFF',                       //......Branco
  black: '#000000',                       //......Preto
  border: '#E0E0E0',                      //......Borda cinza
};

// ========================================
// Componente
// ========================================
const LolaFloatingAvatar: React.FC = () => {
  // ========================================
  // Contexto
  // ========================================
  const {
    state,
    config,
    panPosition,
    panResponder,
    handleTap,
  } = useLolaAvatar();

  // ========================================
  // Se esta no estado header, nao renderiza
  // ========================================
  if (state === 'header') {
    return null;
  }

  // ========================================
  // Calcular tamanho da imagem interna
  // A imagem deve ser menor que o circulo
  // para mostrar rosto + peito da Lola
  // ========================================
  const imageSize = config.size * 1.4;    //......Imagem 40% maior que circulo

  // ========================================
  // Render
  // ========================================
  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: panPosition.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Avatar Circular */}
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.9}
        style={[
          styles.avatarContainer,
          {
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
          },
        ]}
      >
        {/* Imagem da Lola */}
        <Image
          source={lolaRestImage}
          style={{
            width: imageSize,             //......Largura da imagem
            height: imageSize,            //......Altura da imagem
            marginTop: imageSize * 0.15,  //......Desloca para baixo (mostra rosto + peito)
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container flutuante
  floatingContainer: {
    position: 'absolute',                 //......Posicao absoluta
    zIndex: 999,                          //......Acima de tudo
    alignItems: 'center',                 //......Centraliza
  },

  // Container do avatar
  avatarContainer: {
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    backgroundColor: COLORS.white,        //......Fundo branco
    borderWidth: 2,                       //......Borda
    borderColor: COLORS.border,           //......Cor da borda
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 4 }, //....Offset da sombra
    shadowOpacity: 0.25,                  //......Opacidade da sombra
    shadowRadius: 8,                      //......Raio da sombra
    elevation: 10,                        //......Elevacao Android
    overflow: 'hidden',                   //......Esconde overflow (circulo perfeito)
  },
});

// ========================================
// Export
// ========================================
export default LolaFloatingAvatar;
