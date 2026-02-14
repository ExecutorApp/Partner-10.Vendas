// ========================================
// Componente DeletedMessage
// Mensagem apagada com icone
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';                //......React core
import {                                  //......Componentes RN
  View,                                   //......Container basico
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Circle,                                 //......Circle SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Interface de Props
// ========================================
interface DeletedMessageProps {
  isOutgoing: boolean;                    //......Se e enviada
}

// ========================================
// Icone de Mensagem Apagada (circulo com barra)
// ========================================
const DeletedIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={9}
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M6 18L18 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// ========================================
// Componente Principal DeletedMessage
// ========================================
const DeletedMessage: React.FC<DeletedMessageProps> = ({
  isOutgoing,                             //......Direcao
}) => {
  // Cor do icone e texto
  const textColor = isOutgoing
    ? 'rgba(255, 255, 255, 0.7)'          //......Branco com opacidade
    : '#9CA3AF';                          //......Cinza

  // ========================================
  // Render Principal
  // ========================================
  return (
    <View style={styles.container}>
      {/* Icone */}
      <DeletedIcon color={textColor} />

      {/* Texto */}
      <Text
        style={[
          styles.text,
          { color: textColor },
        ]}
      >
        Mensagem apagada
      </Text>
    </View>
  );
};

// ========================================
// Export Default
// ========================================
export default DeletedMessage;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flexDirection: 'row',                 //......Layout horizontal
    alignItems: 'center',                 //......Centraliza vertical
    gap: 6,                               //......Espaco entre icone e texto
    paddingVertical: 2,                   //......Padding vertical
  },

  // Texto da mensagem
  text: {
    fontFamily: 'Inter_400Regular',       //......Fonte regular
    fontSize: 14,                         //......Tamanho fonte
    fontStyle: 'italic',                  //......Italico
  },
});
