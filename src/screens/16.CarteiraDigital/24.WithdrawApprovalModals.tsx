// React e React Native
import React, { useEffect, useRef, useMemo } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

// Bibliotecas externas
import Svg, { Rect, Path } from 'react-native-svg';

// Icone do banco (reutilizado do sistema)
import { BankIcon } from './08.WalletMenuIcons';

// Interface do modal de confirmacao
interface ConfirmModalProps {
  visible: boolean; //..Controla visibilidade
  onConfirm: () => void; //..Callback ao confirmar
  onCancel: () => void; //..Callback ao cancelar
}

// Interface do modal de aguardando
interface AwaitingModalProps {
  visible: boolean; //..Controla visibilidade
  onClose: () => void; //..Callback ao fechar
}

// Interface do modal de sucesso
interface SuccessModalProps {
  visible: boolean; //..Controla visibilidade
  onClose: () => void; //..Callback ao fechar
}

// Dimensoes fixas dos modais (mesmo padrao do sistema)
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


// Componente do icone de aguardando (raios giratorios + banco no centro)
// Mesmo padrao do AnticipateApprovalModals com banco no lugar da calculadora
const WithdrawAwaitingIcon: React.FC = () => {
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

      {/* Centro com circulo azul e icone de banco branco */}
      <View style={styles.centerCircle}>
        <View style={{ transform: [{ scale: 2.0 }] }}>
          <BankIcon color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
};


// Modal de confirmacao de resgate
// Pergunta ao usuario se deseja resgatar antes de prosseguir
const WithdrawConfirmModal: React.FC<ConfirmModalProps> = ({ visible, onConfirm, onCancel }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={styles.overlay} onPress={onCancel}>
      <Pressable style={styles.confirmCard} onPress={() => {}}>
        {/* Icone de banco no topo */}
        <View style={styles.confirmIconBox}>
          <View style={{ transform: [{ scale: 1.8 }] }}>
            <BankIcon color="#1777CF" />
          </View>
        </View>

        {/* Texto de confirmacao */}
        <View style={styles.confirmTextBox}>
          <Text style={styles.confirmTitle}>Confirmar resgate</Text>
          <Text style={styles.confirmSubtitle}>Deseja realmente resgatar{'\n'}este valor?</Text>
        </View>

        {/* Botoes de acao */}
        <View style={styles.confirmButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Não</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yesButton} onPress={onConfirm} activeOpacity={0.7}>
            <Text style={styles.yesButtonText}>Sim</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);


// Modal de aguardando resgate
// Mesmo padrao do AnticipateAwaitingModal com banco no centro
const WithdrawAwaitingModal: React.FC<AwaitingModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={() => {}}>
      <Pressable style={styles.card} onPress={() => {}}>
        <Text style={styles.awaitingText}>Processando resgate...</Text>
        <WithdrawAwaitingIcon />
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
// Mesmo padrao do AnticipateApprovalModals
const ApprovedIcon: React.FC = () => (
  <View style={styles.approvedIconOuter}>
    <View style={styles.approvedIconInner}>
      <Svg width={40} height={28} viewBox="0 0 40 28" fill="none">
        <Path d="M2.333 14L14 25.667L37.333 2.333" stroke="#FCFCFC" strokeWidth={4.667} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  </View>
);


// Modal de sucesso com confete
// Exibe titulo, subtitulo, botao fechar e animacao de confete
const WithdrawSuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={() => {}}>
      {/* Animacao de confete sobre toda a tela */}
      <ConfettiAnimation active={visible} />

      {/* Card do modal de sucesso */}
      <Pressable style={styles.cardApproved} onPress={() => {}}>
        {/* Icone de check */}
        <ApprovedIcon />

        {/* Textos centralizados */}
        <View style={styles.approvedTextBox}>
          <Text style={styles.approvedTitle}>RESGATE APROVADO!</Text>
          <Text style={styles.approvedSubtitle}>Resgate realizado{'\n'}com sucesso.</Text>
        </View>

        {/* Botao fechar */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.closeButtonText}>Fechar</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);


// Estilos dos modais de resgate
const styles = StyleSheet.create({
  // Overlay escuro do modal
  overlay: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.35)', //..Fundo escuro sutil
    alignItems: 'center', //...Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
    padding: 20, //............Margem lateral
  },

  // === Modal de confirmacao ===

  // Card do modal de confirmacao
  confirmCard: {
    width: MODAL_WIDTH, //............Largura fixa
    paddingHorizontal: 15, //........Espaco lateral
    paddingTop: 28, //...............Espaco superior
    paddingBottom: 20, //............Espaco inferior
    borderRadius: 18, //..............Arredondamento
    backgroundColor: '#FCFCFC', //....Fundo branco
    alignItems: 'center', //..........Centraliza horizontal
    gap: 20, //......................Espaco entre elementos
  },
  // Icone do banco no topo do modal de confirmacao (quadrado com cantos arredondados)
  confirmIconBox: {
    width: 80, //..............Largura fixa
    height: 80, //.............Altura fixa
    borderRadius: 16, //.......Cantos levemente arredondados
    backgroundColor: '#F4F4F5', //..Fundo cinza sutil
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Container dos textos de confirmacao
  confirmTextBox: {
    alignItems: 'center', //..Centraliza textos
    gap: 8, //................Espaco entre titulo e subtitulo
  },
  // Titulo do modal de confirmacao
  confirmTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    textAlign: 'center', //........Centralizado
  },
  // Subtitulo do modal de confirmacao
  confirmSubtitle: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#7D8592', //............Cor secundaria
    textAlign: 'center', //........Centralizado
    lineHeight: 21, //..............Altura da linha
  },
  // Container dos botoes de confirmacao
  confirmButtons: {
    flexDirection: 'row', //..Layout horizontal
    gap: 12, //................Espaco entre botoes
    alignSelf: 'stretch', //..Largura total
  },
  // Botao cancelar (Nao)
  cancelButton: {
    flex: 1, //....................Metade da largura
    height: 40, //.................Altura fixa
    borderRadius: 10, //...........Arredondamento
    backgroundColor: '#F4F4F5', //..Fundo cinza
    alignItems: 'center', //.......Centraliza
    justifyContent: 'center', //...Centraliza
  },
  // Texto do botao cancelar
  cancelButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Botao confirmar (Sim)
  yesButton: {
    flex: 1, //....................Metade da largura
    height: 40, //.................Altura fixa
    borderRadius: 10, //...........Arredondamento
    backgroundColor: '#1777CF', //..Fundo azul
    alignItems: 'center', //.......Centraliza
    justifyContent: 'center', //...Centraliza
  },
  // Texto do botao confirmar
  yesButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
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
  // Texto de aguardando
  awaitingText: {
    color: '#7D8592', //...............Cor secundaria
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    textAlign: 'center', //............Centralizado
  },

  // === Icone de aguardando (raios + banco) ===

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
  // Circulo azul central
  centerCircle: {
    width: 96, //..............Largura do circulo
    height: 96, //.............Altura do circulo
    borderRadius: 48, //.......Circular
    backgroundColor: '#1777CF', //..Fundo azul accent
    alignItems: 'center', //......Centraliza
    justifyContent: 'center', //..Centraliza
  },

  // === Modal de sucesso ===

  // Card do modal de sucesso
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
  // Container dos textos de sucesso
  approvedTextBox: {
    alignItems: 'center', //..Centraliza textos
    gap: 10, //...............Espaco entre titulo e subtitulo
  },
  // Titulo de sucesso
  approvedTitle: {
    color: '#3A3F51', //...............Cor do texto
    fontSize: 14, //....................Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    textAlign: 'center', //............Centralizado
  },
  // Subtitulo de sucesso
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
export { WithdrawConfirmModal, WithdrawAwaitingModal, WithdrawSuccessModal };
