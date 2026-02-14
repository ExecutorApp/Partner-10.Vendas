// ========================================
// Componente LoadingOverlay
// Overlay de carregamento animado
// ========================================

// ========================================
// Imports React e React Native
// ========================================
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';

// ========================================
// Imports de Constantes
// ========================================
import { CameraColors } from '../utils/cameraConstants';

// ========================================
// Interface de Props
// ========================================
interface LoadingOverlayProps {
  visible: boolean; //.......... Visibilidade
  message?: string; //.......... Mensagem opcional
  progress?: number; //......... Progresso (0-100)
  showProgress?: boolean; //.... Mostrar barra de progresso
}

// ========================================
// Componente Principal LoadingOverlay
// ========================================
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message, progress, showProgress = false }) => {
  // ========================================
  // Animacoes
  // ========================================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ========================================
  // Animacao de Entrada/Saida
  // ========================================
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, //................. Opacidade total
          duration: 200, //.............. Duracao
          useNativeDriver: true, //...... Driver nativo
        }),
        Animated.spring(scaleAnim, {
          toValue: 1, //................. Escala normal
          friction: 6, //................ Friccao
          tension: 100, //............... Tensao
          useNativeDriver: true, //...... Driver nativo
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0, //................. Opacidade zero
          duration: 150, //.............. Duracao
          useNativeDriver: true, //...... Driver nativo
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8, //............... Escala reduzida
          duration: 150, //.............. Duracao
          useNativeDriver: true, //...... Driver nativo
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  // ========================================
  // Animacao de Pulsar
  // ========================================
  useEffect(() => {
    if (visible) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05, //............... Escala aumentada
            duration: 800, //............... Duracao
            easing: Easing.inOut(Easing.ease), // Curva
            useNativeDriver: true, //....... Driver nativo
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, //.................. Escala normal
            duration: 800, //............... Duracao
            easing: Easing.inOut(Easing.ease), // Curva
            useNativeDriver: true, //....... Driver nativo
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [visible, pulseAnim]);

  // ========================================
  // Nao renderizar se nao visivel
  // ========================================
  if (!visible) return null;

  // ========================================
  // Render Principal
  // ========================================
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Indicador de Loading Animado */}
        <Animated.View style={[styles.loaderContainer, { transform: [{ scale: pulseAnim }] }]}>
          <ActivityIndicator size="large" color={CameraColors.primary} />
        </Animated.View>

        {/* Mensagem */}
        {message && <Text style={styles.message}>{message}</Text>}

        {/* Barra de Progresso */}
        {showProgress && progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    ...StyleSheet.absoluteFillObject, //.. Preenche toda a tela
    backgroundColor: 'rgba(0,0,0,0.7)', //. Fundo semi-transparente
    justifyContent: 'center', //........... Centraliza vertical
    alignItems: 'center', //............... Centraliza horizontal
    zIndex: 1000, //...................... Acima de tudo
  },

  // Conteudo do loading
  content: {
    backgroundColor: CameraColors.overlayDark, // Fundo escuro
    borderRadius: 16, //.................. Borda arredondada
    padding: 24, //....................... Padding interno
    alignItems: 'center', //.............. Centraliza horizontal
    minWidth: 150, //..................... Largura minima
    maxWidth: 250, //..................... Largura maxima
  },

  // Container do loader
  loaderContainer: {
    marginBottom: 12, //.. Margem inferior
  },

  // Mensagem
  message: {
    fontSize: 14, //..................... Tamanho fonte
    color: CameraColors.textWhite, //.... Cor branca
    textAlign: 'center', //.............. Centraliza texto
    marginTop: 8, //..................... Margem superior
  },

  // Container do progresso
  progressContainer: {
    width: '100%', //........... Largura total
    marginTop: 16, //........... Margem superior
    alignItems: 'center', //.... Centraliza horizontal
  },

  // Fundo da barra de progresso
  progressBackground: {
    width: '100%', //......................... Largura total
    height: 4, //............................ Altura
    backgroundColor: 'rgba(255,255,255,0.2)', // Fundo semi-transparente
    borderRadius: 2, //...................... Borda arredondada
    overflow: 'hidden', //................... Esconde overflow
  },

  // Barra de progresso
  progressBar: {
    height: '100%', //..................... Altura total
    backgroundColor: CameraColors.primary, // Cor primaria
    borderRadius: 2, //.................... Borda arredondada
  },

  // Texto do progresso
  progressText: {
    fontSize: 12, //..................... Tamanho fonte
    color: CameraColors.textSecondary, // Cor secundaria
    marginTop: 4, //..................... Margem superior
  },
});

// ========================================
// Export
// ========================================
export default LoadingOverlay;
