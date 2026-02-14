// ========================================
// Componente: Botao da Lola no Header
// Estado header (45px) no header do chat
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  TouchableOpacity,                       //......Botao tocavel
  Image,                                  //......Imagem
  StyleSheet,                             //......Estilos
  View,                                   //......Container
} from 'react-native';

// ========================================
// Imports de Contexto
// ========================================
import { useLolaAvatar } from '../../contexts/LolaAvatarContext';

// ========================================
// Imports de Assets
// ========================================
const lolaRestImage = require('../../../../assets/lola-visemes/lola-rest.png');

// ========================================
// Cores
// ========================================
const COLORS = {
  primary: '#1777CF',                     //......Azul primario
  white: '#FFFFFF',                       //......Branco
  black: '#000000',                       //......Preto
};

// ========================================
// Componente
// ========================================
const LolaHeaderButton: React.FC = () => {
  // ========================================
  // Contexto
  // ========================================
  const { state, handleTap } = useLolaAvatar();

  // ========================================
  // Se nao esta no estado header, nao renderiza
  // ========================================
  if (state !== 'header') {
    return null;
  }

  // ========================================
  // Render
  // ========================================
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <Image
          source={lolaRestImage}
          style={styles.avatar}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container
  container: {
    position: 'absolute',                 //......Posicao absoluta
    right: 60,                            //......Distancia da direita
    top: '50%',                           //......Centro vertical
    marginTop: -22,                       //......Ajuste para centralizar
    zIndex: 100,                          //......Acima do header
  },

  // Botao
  button: {
    width: 45,                            //......Largura
    height: 45,                           //......Altura
    borderRadius: 22.5,                   //......Circular
    backgroundColor: COLORS.white,        //......Fundo branco
    justifyContent: 'center',             //......Centraliza
    alignItems: 'center',                 //......Centraliza
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset da sombra
    shadowOpacity: 0.15,                  //......Opacidade da sombra
    shadowRadius: 4,                      //......Raio da sombra
    elevation: 4,                         //......Elevacao Android
    borderWidth: 2,                       //......Borda
    borderColor: COLORS.primary,          //......Cor da borda
    overflow: 'hidden',                   //......Esconde overflow
  },

  // Avatar
  avatar: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    borderRadius: 20,                     //......Circular
  },
});

// ========================================
// Export
// ========================================
export default LolaHeaderButton;
