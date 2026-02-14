// ========================================
// Componente AttachButton
// Botao para abrir menu de anexos
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';                //......React core
import {                                  //......Componentes RN
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Interface de Props
// ========================================
interface AttachButtonProps {
  onPress: () => void;                    //......Handler press
  disabled?: boolean;                     //......Desabilitado
  size?: number;                          //......Tamanho do icone
}

// ========================================
// Componente Icone Attach (Clip)
// ========================================
const AttachIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor
  size,                                   //......Tamanho
}) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    <Path                                 //......Clip de papel
      d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59718 21.9983 8.005 21.9983C6.41282 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00166 17.5872 2.00166 15.995C2.00166 14.4028 2.63416 12.8758 3.76 11.75L12.33 3.18C13.0806 2.42975 14.0991 2.00739 15.16 2.00739C16.2209 2.00739 17.2394 2.42975 17.99 3.18C18.7403 3.93063 19.1626 4.94913 19.1626 6.01C19.1626 7.07087 18.7403 8.08937 17.99 8.84L9.41 17.41C9.03472 17.7853 8.52573 17.9961 7.995 17.9961C7.46427 17.9961 6.95528 17.7853 6.58 17.41C6.20472 17.0347 5.99389 16.5257 5.99389 15.995C5.99389 15.4643 6.20472 14.9553 6.58 14.58L15.07 6.1"
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
      strokeLinejoin="round"              //......Junção arredondada
    />
  </Svg>
);

// ========================================
// Componente Principal AttachButton
// ========================================
const AttachButton: React.FC<AttachButtonProps> = ({
  onPress,                                //......Handler
  disabled = false,                       //......Padrao habilitado
  size = 24,                              //......Tamanho padrao
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,                    //......Estilo base
        pressed && styles.buttonPressed,  //......Estilo pressionado
        disabled && styles.buttonDisabled, //......Estilo desabilitado
      ]}
      onPress={onPress}                   //......Handler
      disabled={disabled}                 //......Estado
      hitSlop={8}                         //......Area de toque
    >
      <AttachIcon
        color={disabled ? ChatColors.inputPlaceholder : ChatColors.attachButton}
        size={size}                       //......Tamanho
      />
    </Pressable>
  );
};

// ========================================
// Export Default
// ========================================
export default AttachButton;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Botao base
  button: {
    width: 40,                            //......Largura
    height: 40,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    borderRadius: 20,                     //......Circular
  },

  // Botao pressionado
  buttonPressed: {
    opacity: 0.6,                         //......Opacidade reduzida
    backgroundColor: 'rgba(0,0,0,0.05)',  //......Fundo sutil
  },

  // Botao desabilitado
  buttonDisabled: {
    opacity: 0.4,                         //......Opacidade baixa
  },
});
