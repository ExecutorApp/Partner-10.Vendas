// React e React Native
import React, { useEffect, useRef, useMemo } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

// Bibliotecas externas
import Svg, { Rect, Path } from 'react-native-svg';
import Lottie from 'lottie-react';

// Dados da animacao Lottie
import calculatorAnimation from './assets/calculator-empty.json';

// Interface do modal de aguardando aprovacao
interface AwaitingModalProps {
  visible: boolean; //..Controla visibilidade
  onClose: () => void; //..Callback ao fechar
}

// Interface do modal de aprovado
interface ApprovedModalProps {
  visible: boolean; //..Controla visibilidade
  onClose: () => void; //..Callback ao fechar
}

// Dimensoes fixas dos modais (iguais para ambos conforme Figma)
const MODAL_WIDTH = 300; //..Largura fixa
const MODAL_HEIGHT = 295; //..Altura fixa

// Configuracao da animacao de confete (3 ondas consecutivas)
const CONFETTI_PER_WAVE = 40; //..Particulas por onda
const CONFETTI_WAVES = 3; //......Numero de ondas
const CONFETTI_TOTAL = CONFETTI_PER_WAVE * CONFETTI_WAVES; //..Total de particulas
const WAVE_DELAY = 2000; //......Atraso entre ondas em ms
const SCREEN_WIDTH = Dimensions.get('window').width; //..Largura da tela
const SCREEN_HEIGHT = Dimensions.get('window').height; //..Altura da tela
const CONFETTI_COLORS = ['#1777CF', '#FFD700', '#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4']; //..Cores variadas

// Componente do icone de aguardando (raios giratorios + calculadora branca)
// Mesmo padrao do PaymentFlow-CreditCard-AwaitingApproval com calculadora no centro
const AwaitingIcon: React.FC = () => {
  // Animacoes de rotacao e pulso
  const spin = useRef(new Animated.Value(0)).current; //..Valor de rotacao
  const pulse = useRef(new Animated.Value(0)).current; //..Valor de pulso

  // Inicia animacoes em loop
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start(); //..Rotacao continua

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start(); //..Pulso continuo
  }, [spin, pulse]);

  // Interpolacoes das animacoes
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }); //..Rotacao completa
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }); //..Escala de pulso
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }); //..Opacidade de pulso

  // Gera 16 raios radiantes com tamanhos e opacidades variados
  const rays = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16; //..Angulo do raio
    const len = 18 + ((i % 4) * 3); //..Comprimento variado
    const alpha = 0.35 + ((i % 4) * 0.12); //..Opacidade variada
    return <Rect key={`ray-${i}`} x={84} y={8} width={2} height={len} rx={1} fill="#1777CF" opacity={alpha} transform={`rotate(${angle} 85 85)`} />;
  });

  return (
    <View style={styles.iconWrap}>
      {/* Raios giratorios com pulso */}
      <Animated.View style={[styles.raysWrap, { transform: [{ rotate }, { scale }], opacity }]}>
        <Svg width={170} height={170} viewBox="0 0 170 170" fill="none">{rays}</Svg>
      </Animated.View>

      {/* Centro com circulo azul e calculadora branca */}
      <View style={styles.centerCircle}>
        {/* @ts-ignore - filter e propriedade CSS valida em web */}
        <View style={[styles.calculatorWrap, { filter: 'brightness(0) invert(1)' } as any]}>
          <Lottie animationData={calculatorAnimation} loop={true} autoplay={true} style={styles.calculatorLottie} />
        </View>
      </View>
    </View>
  );
};

// Modal de aguardando aprovacao
// Mesmo padrao do PaymentFlow-CreditCard-AwaitingApproval
const AnticipateAwaitingModal: React.FC<AwaitingModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={() => {}}>
        <Text style={styles.awaitingText}>Aguardando aprovação...</Text>
        <AwaitingIcon />
      </Pressable>
    </Pressable>
  </Modal>
);

// Componente de animacao de confete (3 ondas consecutivas)
// Particulas coloridas caindo do topo da tela com oscilacao e rotacao
const ConfettiAnimation: React.FC<{ active: boolean }> = ({ active }) => {
  // Dados aleatorios de cada confete com onda atribuida (memoizado)
  const pieces = useMemo(() => Array.from({ length: CONFETTI_TOTAL }).map((_, i) => {
    const wave = Math.floor(i / CONFETTI_PER_WAVE); //..Indice da onda (0, 1 ou 2)
    const baseDelay = wave * WAVE_DELAY; //..............Atraso base da onda
    return {
      x: Math.random() * SCREEN_WIDTH, //..Posicao horizontal aleatoria
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], //..Cor ciclica
      size: 6 + Math.random() * 6, //......Tamanho entre 6 e 12
      delay: baseDelay + Math.random() * 1500, //..Atraso da onda + variacao
      duration: 2500 + Math.random() * 2000, //....Duracao entre 2500 e 4500ms
      sway: 20 + Math.random() * 40, //.....Amplitude de oscilacao
      rotation: 360 + Math.random() * 720, //..Rotacao total variada
    };
  }), []);

  // Valores de animacao para cada confete
  const anims = useRef(pieces.map(() => new Animated.Value(0))).current; //..Array de valores animados

  // Inicia animacoes quando ativo
  useEffect(() => {
    if (!active) return; //..Nao ativo, ignora

    anims.forEach((anim, i) => {
      anim.setValue(0); //..Reseta valor
      Animated.timing(anim, {
        toValue: 1, //....................Valor final
        duration: pieces[i].duration, //..Duracao individual
        delay: pieces[i].delay, //........Atraso com onda
        easing: Easing.linear, //........Easing linear
        useNativeDriver: true, //........Driver nativo
      }).start();
    });

    // Cleanup ao desmontar
    return () => {
      anims.forEach(anim => anim.stopAnimation()); //..Para animacoes
    };
  }, [active, anims, pieces]);

  if (!active) return null; //..Nao renderiza se inativo

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {pieces.map((piece, i) => {
        // Interpolacoes de movimento
        const translateY = anims[i].interpolate({ inputRange: [0, 1], outputRange: [-20, SCREEN_HEIGHT + 20] }); //..Queda vertical
        const translateX = anims[i].interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, piece.sway, 0, -piece.sway, 0] }); //..Oscilacao
        const pieceRotate = anims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.rotation}deg`] }); //..Rotacao
        const pieceOpacity = anims[i].interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }); //..Fade in/out

        return (
          <Animated.View
            key={`confetti-${i}`}
            style={{
              position: 'absolute' as const, //..Posicao absoluta
              left: piece.x, //..................Posicao horizontal
              top: 0, //..........................Inicia no topo
              width: piece.size, //..............Largura da particula
              height: piece.size * 0.6, //......Altura da particula
              backgroundColor: piece.color, //..Cor da particula
              borderRadius: piece.size * 0.15, //..Arredondamento leve
              transform: [{ translateY }, { translateX }, { rotate: pieceRotate }], //..Transformacoes combinadas
              opacity: pieceOpacity, //..........Opacidade animada
            }}
          />
        );
      })}
    </View>
  );
};

// Icone de aprovado (check branco em circulo azul com anel)
// Mesmo padrao do PaymentFlow-Pix-Approved com dimensoes do Figma
const ApprovedIcon: React.FC = () => (
  <View style={styles.approvedIconOuter}>
    <View style={styles.approvedIconInner}>
      <Svg width={40} height={28} viewBox="0 0 40 28" fill="none">
        <Path d="M2.333 14L14 25.667L37.333 2.333" stroke="#FCFCFC" strokeWidth={4.667} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  </View>
);

// Modal de aprovado com confete
// Exibe titulo "APROVADO!", subtitulo, botao fechar e animacao de confete
const AnticipateApprovedModal: React.FC<ApprovedModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={() => {}}>
      {/* Animacao de confete sobre toda a tela */}
      <ConfettiAnimation active={visible} />

      {/* Card do modal de aprovado */}
      <Pressable style={styles.cardApproved} onPress={() => {}}>
        {/* Icone de check */}
        <ApprovedIcon />

        {/* Textos centralizados */}
        <View style={styles.approvedTextBox}>
          <Text style={styles.approvedTitle}>APROVADO!</Text>
          <Text style={styles.approvedSubtitle}>Pagamento realizado{'\n'}com sucesso.</Text>
        </View>

        {/* Botao fechar */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>Fechar</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

// Estilos dos modais de aprovacao
const styles = StyleSheet.create({
  // Overlay escuro do modal
  overlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.35)', //..Fundo escuro sutil
    alignItems: 'center', //...Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
    padding: 20, //............Margem lateral
  },

  // === Modal de aguardando ===

  // Card do modal de aguardando
  card: {
    width: MODAL_WIDTH, //............Largura fixa
    height: MODAL_HEIGHT, //..........Altura fixa
    paddingHorizontal: 15, //........Espaco lateral
    paddingTop: 26, //...............Espaco superior
    paddingBottom: 26, //............Espaco inferior
    borderRadius: 18, //..............Arredondamento
    backgroundColor: '#FCFCFC', //....Fundo branco
    alignItems: 'center', //..........Centraliza horizontal
    justifyContent: 'flex-start', //..Alinha ao topo
    gap: 25, //......................Espaco entre elementos
  },
  // Texto de aguardando aprovacao
  awaitingText: {
    color: '#7D8592', //...............Cor secundaria
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    textAlign: 'center', //............Centralizado
  },

  // === Icone de aguardando (raios + calculadora) ===

  // Container principal do icone animado
  iconWrap: {
    width: 200, //..............Largura fixa
    height: 200, //.............Altura fixa
    borderRadius: 100, //.......Circular
    alignItems: 'center', //...Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
  },
  // Container dos raios giratorios
  raysWrap: {
    position: 'absolute', //..Posicao absoluta
    top: 0, //................Ancora no topo
    left: 0, //...............Ancora a esquerda
    width: 200, //............Largura total
    height: 200, //...........Altura total
    alignItems: 'center', //..Centraliza
    justifyContent: 'center', //..Centraliza
  },
  // Circulo azul central (grande para destaque)
  centerCircle: {
    width: 96, //..............Largura do circulo
    height: 96, //.............Altura do circulo
    borderRadius: 48, //.......Circular
    backgroundColor: '#1777CF', //..Fundo azul accent
    alignItems: 'center', //......Centraliza
    justifyContent: 'center', //..Centraliza
    overflow: 'hidden', //........Recorta overflow
  },
  // Container da calculadora Lottie
  calculatorWrap: {
    width: 72, //..............Largura da calculadora
    height: 72, //.............Altura da calculadora
    alignItems: 'center', //..Centraliza
    justifyContent: 'center', //..Centraliza
  },
  // Animacao Lottie da calculadora
  calculatorLottie: {
    width: 72, //..Largura da animacao
    height: 72, //..Altura da animacao
  },

  // === Modal de aprovado ===

  // Card do modal de aprovado
  cardApproved: {
    width: MODAL_WIDTH, //............Largura fixa
    height: MODAL_HEIGHT, //..........Altura fixa
    paddingHorizontal: 15, //........Espaco lateral
    paddingTop: 30, //...............Espaco superior
    paddingBottom: 20, //............Espaco inferior
    borderRadius: 18, //..............Arredondamento
    backgroundColor: '#FCFCFC', //....Fundo branco
    alignItems: 'center', //..........Centraliza horizontal
    justifyContent: 'flex-start', //..Alinha ao topo
    gap: 25, //......................Espaco entre elementos
    zIndex: 10, //....................Acima do confete
  },
  // Container externo do icone de aprovado
  approvedIconOuter: {
    width: 80, //..............Largura fixa
    height: 80, //.............Altura fixa
    borderRadius: 40, //.......Circular
    backgroundColor: '#F4F4F4', //..Fundo cinza sutil
    alignItems: 'center', //......Centraliza
    justifyContent: 'center', //..Centraliza
  },
  // Circulo azul interno com anel
  approvedIconInner: {
    width: 70, //..............Largura interna
    height: 70, //.............Altura interna
    borderRadius: 35, //.......Circular
    backgroundColor: '#1777CF', //..Fundo azul accent
    borderWidth: 6, //...........Largura do anel
    borderColor: '#EFF4FF', //...Cor do anel azul claro
    alignItems: 'center', //....Centraliza
    justifyContent: 'center', //..Centraliza
  },
  // Container dos textos de aprovado
  approvedTextBox: {
    alignItems: 'center', //..Centraliza textos
    gap: 10, //...............Espaco entre titulo e subtitulo
  },
  // Titulo "APROVADO!"
  approvedTitle: {
    color: '#3A3F51', //...............Cor do texto
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    textAlign: 'center', //............Centralizado
  },
  // Subtitulo de confirmacao
  approvedSubtitle: {
    color: '#7D8592', //...............Cor secundaria
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    textAlign: 'center', //............Centralizado
    lineHeight: 21, //..................Altura da linha
  },
  // Botao fechar
  closeButton: {
    width: 270, //..............Largura fixa
    height: 40, //.............Altura fixa
    borderRadius: 10, //.......Arredondamento
    backgroundColor: '#1777CF', //..Fundo azul accent
    alignItems: 'center', //......Centraliza
    justifyContent: 'center', //..Centraliza
  },
  // Texto do botao fechar
  closeButtonText: {
    color: '#FCFCFC', //...............Cor branca
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    textAlign: 'center', //............Centralizado
  },

  // === Animacao de confete ===

  // Container do confete (tela inteira, acima do overlay)
  confettiContainer: {
    position: 'absolute', //..Posicao absoluta
    top: 0, //................Ancora no topo
    left: 0, //...............Ancora a esquerda
    right: 0, //..............Ancora a direita
    bottom: 0, //.............Ancora embaixo
    zIndex: 20, //..............Acima de tudo
  },
});

// Exports nomeados
export { AnticipateAwaitingModal, AnticipateApprovedModal };
