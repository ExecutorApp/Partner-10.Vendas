// ========================================
// Componente EmojiButton
// Botao para abrir seletor de emojis
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
  Circle,                                 //......Circulo SVG
  Path,                                   //......Path SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Interface de Props
// ========================================
interface EmojiButtonProps {
  onPress: () => void;                    //......Handler press
  disabled?: boolean;                     //......Desabilitado
  size?: number;                          //......Tamanho do icone
}

// ========================================
// Componente Icone Emoji
// ========================================
const EmojiIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor
  size,                                   //......Tamanho
}) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    {/* Circulo da cara */}
    <Circle                               //......Circulo
      cx="12"                             //......Centro X
      cy="12"                             //......Centro Y
      r="10"                              //......Raio
      stroke={color}                      //......Cor borda
      strokeWidth={1.5}                   //......Espessura
    />
    {/* Olho esquerdo */}
    <Circle                               //......Olho esquerdo
      cx="8.5"                            //......Centro X
      cy="9.5"                            //......Centro Y
      r="1.5"                             //......Raio
      fill={color}                        //......Preenchimento
    />
    {/* Olho direito */}
    <Circle                               //......Olho direito
      cx="15.5"                           //......Centro X
      cy="9.5"                            //......Centro Y
      r="1.5"                             //......Raio
      fill={color}                        //......Preenchimento
    />
    {/* Sorriso */}
    <Path                                 //......Boca sorridente
      d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14"
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Componente Principal EmojiButton
// ========================================
const EmojiButton: React.FC<EmojiButtonProps> = ({
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
      <EmojiIcon
        color={disabled ? ChatColors.inputPlaceholder : ChatColors.emojiButton}
        size={size}                       //......Tamanho
      />
    </Pressable>
  );
};

// ========================================
// Export Default
// ========================================
export default EmojiButton;

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
