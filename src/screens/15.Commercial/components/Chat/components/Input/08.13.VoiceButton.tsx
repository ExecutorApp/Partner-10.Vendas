// ========================================
// Componente VoiceButton
// Botao para gravar audio
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React from 'react';                //......React core
import {                                  //......Componentes RN
  StyleSheet,                             //......Estilos
  Pressable,                              //......Toque
  View,                                   //......Container
} from 'react-native';                    //......Biblioteca RN
import Svg, {                             //......SVG core
  Path,                                   //......Path SVG
  Rect,                                   //......Retangulo SVG
} from 'react-native-svg';                //......Biblioteca SVG

// ========================================
// Imports de Cores
// ========================================
import { ChatColors } from '../../styles/08.ChatColors';

// ========================================
// Interface de Props
// ========================================
interface VoiceButtonProps {
  onPressIn: () => void;                  //......Handler press in
  onPressOut: () => void;                 //......Handler press out
  isRecording?: boolean;                  //......Se esta gravando
  disabled?: boolean;                     //......Desabilitado
  size?: number;                          //......Tamanho do icone
}

// ========================================
// Componente Icone Microfone
// ========================================
const MicIcon: React.FC<{ color: string; size: number }> = ({
  color,                                  //......Cor
  size,                                   //......Tamanho
}) => (
  <Svg                                    //......SVG container
    width={size}                          //......Largura
    height={size}                         //......Altura
    viewBox="0 0 24 24"                   //......ViewBox
    fill="none"                           //......Sem preenchimento
  >
    {/* Corpo do microfone */}
    <Rect                                 //......Retangulo mic
      x="9"                               //......Posicao X
      y="2"                               //......Posicao Y
      width="6"                           //......Largura
      height="11"                         //......Altura
      rx="3"                              //......Raio borda
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
    />
    {/* Base do microfone */}
    <Path                                 //......Linha base
      d="M12 18.75V22"                    //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    {/* Suporte */}
    <Path                                 //......Suporte horizontal
      d="M8 22H16"                        //......Desenho
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
    {/* Curva captacao */}
    <Path                                 //......Curva de captacao
      d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10"
      stroke={color}                      //......Cor
      strokeWidth={1.5}                   //......Espessura
      strokeLinecap="round"               //......Ponta arredondada
    />
  </Svg>
);

// ========================================
// Componente Principal VoiceButton
// ========================================
const VoiceButton: React.FC<VoiceButtonProps> = ({
  onPressIn,                              //......Handler in
  onPressOut,                             //......Handler out
  isRecording = false,                    //......Padrao nao gravando
  disabled = false,                       //......Padrao habilitado
  size = 24,                              //......Tamanho padrao
}) => {
  // ========================================
  // Determinar cor do botao
  // ========================================
  const getButtonColor = (): string => {
    if (disabled) {
      return ChatColors.inputPlaceholder; //......Cinza
    }
    if (isRecording) {
      return ChatColors.white;            //......Branco gravando
    }
    return ChatColors.voiceButton;        //......Azul normal
  };

  // ========================================
  // Determinar cor de fundo
  // ========================================
  const getBackgroundColor = (): string => {
    if (isRecording) {
      return ChatColors.recording;        //......Vermelho gravando
    }
    return ChatColors.voiceButton;        //......Azul normal
  };

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,                    //......Estilo base
        {
          backgroundColor: getBackgroundColor(),
        },
        pressed && !isRecording && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
      onPressIn={onPressIn}               //......Handler in
      onPressOut={onPressOut}             //......Handler out
      disabled={disabled}                 //......Estado
      hitSlop={8}                         //......Area de toque
    >
      {/* Indicador de Gravacao */}
      {isRecording && (
        <View style={styles.recordingRing} />
      )}

      {/* Icone */}
      <MicIcon
        color={isRecording ? ChatColors.white : ChatColors.white}
        size={size}                       //......Tamanho
      />
    </Pressable>
  );
};

// ========================================
// Export Default
// ========================================
export default VoiceButton;

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Botao base
  button: {
    width: 48,                            //......Largura
    height: 48,                           //......Altura
    justifyContent: 'center',             //......Centraliza vertical
    alignItems: 'center',                 //......Centraliza horizontal
    borderRadius: 24,                     //......Circular
  },

  // Botao pressionado
  buttonPressed: {
    opacity: 0.8,                         //......Opacidade reduzida
    transform: [{ scale: 0.95 }],         //......Escala menor
  },

  // Botao desabilitado
  buttonDisabled: {
    opacity: 0.4,                         //......Opacidade baixa
    backgroundColor: ChatColors.inputPlaceholder,
  },

  // Anel de gravacao
  recordingRing: {
    position: 'absolute',                 //......Posicao absoluta
    width: 56,                            //......Largura
    height: 56,                           //......Altura
    borderRadius: 28,                     //......Circular
    borderWidth: 3,                       //......Borda
    borderColor: 'rgba(239, 68, 68, 0.3)', //....Vermelho sutil
  },
});
