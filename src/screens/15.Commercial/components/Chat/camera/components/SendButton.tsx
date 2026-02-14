// ========================================
// Componente SendButton
// Botao de envio com estado de loading
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useRef, useEffect } from 'react';
import { Pressable, StyleSheet, Animated, Easing, ActivityIndicator, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors, CameraStyles } from '../utils/cameraConstants';

// ========================================
// Interface de Props
// ========================================
interface SendButtonProps {
  onPress: () => void; //.... Handler de press
  loading?: boolean; //...... Estado de loading
  disabled?: boolean; //..... Desabilitado
  size?: number; //.......... Tamanho do botao
}

// ========================================
// Icone de Enviar (seta apontando para direita)
// Mesmo icone usado no InputBar do chat
// ========================================
const SendIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M17.4876 8.9668L3.96467 2.3624C3.79927 2.2791 3.61527 2.241 3.43087 2.2518C3.24637 2.2626 3.06797 2.322 2.91327 2.424C2.70467 2.5572 2.53397 2.7429 2.41777 2.9628C2.30157 3.1828 2.24397 3.4295 2.25047 3.6787V16.849C2.24537 17.0914 2.30057 17.3312 2.41107 17.5464C2.52147 17.7616 2.68377 17.9453 2.88277 18.0806C3.05567 18.1922 3.25667 18.251 3.46187 18.25C3.62507 18.2483 3.78607 18.2116 3.93417 18.1422L17.4876 11.5378C17.7226 11.4191 17.9191 11.2351 18.0541 11.0073C18.1891 10.7796 18.2569 10.5177 18.2495 10.2523C18.2569 9.987 18.1891 9.725 18.0541 9.4973C17.9191 9.2696 17.7226 9.0855 17.4876 8.9668Z"
      fill={color}
      stroke={color}
      strokeWidth={0.3}
    />
  </Svg>
);

// ========================================
// Componente Principal SendButton
// ========================================
const SendButton: React.FC<SendButtonProps> = ({ onPress, loading = false, disabled = false, size = 48 }) => {
  // ========================================
  // Animacoes
  // ========================================
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // Animacao de Press
  // ========================================
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9, //............. Escala reduzida
      duration: 100, //............ Duracao
      useNativeDriver: true, //.... Driver nativo
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, //............... Escala normal
      friction: 4, //.............. Friccao
      tension: 100, //............. Tensao
      useNativeDriver: true, //.... Driver nativo
    }).start();
  };

  // ========================================
  // Animacao de Loading
  // ========================================
  useEffect(() => {
    if (loading) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1, //........................ Valor final
          duration: 1000, //................... Duracao
          easing: Easing.linear, //............ Curva linear
          useNativeDriver: true, //............ Driver nativo
        })
      );
      spin.start();
      Animated.timing(opacityAnim, {
        toValue: 0.7, //............. Opacidade reduzida
        duration: 200, //............ Duracao
        useNativeDriver: true, //.... Driver nativo
      }).start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
      Animated.timing(opacityAnim, {
        toValue: 1, //............... Opacidade total
        duration: 200, //............ Duracao
        useNativeDriver: true, //.... Driver nativo
      }).start();
    }
  }, [loading, rotateAnim, opacityAnim]);

  // ========================================
  // Interpolacao de Rotacao
  // ========================================
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1], //........ Range de entrada
    outputRange: ['0deg', '360deg'], // Range de saida
  });

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.button,
          { width: size, height: size, borderRadius: 8, opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          disabled && styles.buttonDisabled,
        ]}
      >
        {loading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size="small" color={CameraColors.textWhite} />
          </Animated.View>
        ) : (
          <SendIcon color={CameraColors.textWhite} />
        )}
      </Animated.View>
    </Pressable>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Botao
  button: {
    backgroundColor: CameraColors.primary, // Cor primaria
    justifyContent: 'center', //........... Centraliza vertical
    alignItems: 'center', //............... Centraliza horizontal
    ...CameraStyles.shadowDefault, //...... Sombra padrao
  },

  // Botao desabilitado
  buttonDisabled: {
    backgroundColor: CameraColors.textSecondary, // Cor cinza
  },
});

// ========================================
// Export
// ========================================
export default SendButton;
