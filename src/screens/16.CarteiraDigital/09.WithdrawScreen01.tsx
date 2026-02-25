// React e React Native
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Bibliotecas externas
import { useNavigation } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';

// Tipos e dados
import { WITHDRAW_MESSAGES, MIN_WITHDRAW_AMOUNT } from './11.WithdrawData';
import { formatCurrency } from './03.WalletData';

// Hooks
import useWithdrawForm from './12.useWithdrawForm';

// Componentes
import Header from '../5.Side Menu/2.Header';
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen';
import WithdrawDestination from './10.WithdrawScreen02';
import { WalletBalanceIcon } from './08.WalletMenuIcons';
import { WithdrawConfirmModal, WithdrawAwaitingModal, WithdrawSuccessModal } from './24.WithdrawApprovalModals';
import WithdrawHistoryModal, { WithdrawHistoryItem, INITIAL_WITHDRAW_HISTORY } from './31.WithdrawHistoryModal';

// Tela principal de resgate de saldo
// Header com voltar, saldo, input monetario e conta destino
const WithdrawScreen = () => {
  // Navegacao e menu lateral
  const navigation = useNavigation(); //..Hook de navegacao
  const [sideMenuVisible, setSideMenuVisible] = useState(false); //..Controle do menu lateral

  // Saldo dinamico (atualiza apos cada resgate)
  const [balance, setBalance] = useState(4235.50); //..Saldo disponivel para resgate

  // Historico de resgates (atualiza apos cada resgate)
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawHistoryItem[]>(INITIAL_WITHDRAW_HISTORY);

  // Estados dos modais de aprovacao de resgate
  const [confirmVisible, setConfirmVisible] = useState(false); //..Modal de confirmacao
  const [awaitingVisible, setAwaitingVisible] = useState(false); //..Modal de aguardando
  const [successVisible, setSuccessVisible] = useState(false); //..Modal de sucesso
  const approvalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //..Timer da transicao

  // Ref para dados do resgate pendente (capturados ao clicar Resgatar)
  const pendingWithdrawRef = useRef<{ amount: number; bankName: string } | null>(null);

  // Estado do modal de historico
  const [historyVisible, setHistoryVisible] = useState(false); //..Modal de historico

  // Hook do formulario
  const {
    rawInput, amount, handleValueChange,
    savedAccounts, selectedAccountId, handleSelectAccount, showNewForm, handleToggleNewForm,
    transferMethod, handleTransferMethodChange, newAccountData, handleNewAccountChange,
    handleConfirmNewAccount, handleUpdateAccount, handleDeleteAccount, valueError, isFormValid,
  } = useWithdrawForm(balance);

  // Animacao de respiracao do card de saldo
  const pulseAnim = useRef(new Animated.Value(0)).current; //..Valor animado

  // Loop de animacao
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // Opacidade interpolada do overlay
  const overlayOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }); //..Interpolacao

  // Handler de abrir modal de confirmacao de resgate
  // Captura dados do resgate antes de abrir o modal
  const handleResgatar = useCallback(() => {
    const selectedAccount = savedAccounts.find(a => a.id === selectedAccountId);
    pendingWithdrawRef.current = {
      amount, //..Valor do resgate
      bankName: selectedAccount?.bankName || 'Conta', //..Nome do banco destino
    };
    setConfirmVisible(true); //..Abre modal de confirmacao
  }, [amount, savedAccounts, selectedAccountId]);

  // Handler de confirmar resgate (abre fluxo de aprovacao)
  const handleConfirmWithdraw = useCallback(() => {
    setConfirmVisible(false); //..Fecha confirmacao
    setAwaitingVisible(true); //..Abre modal de aguardando
    approvalTimerRef.current = setTimeout(() => {
      setAwaitingVisible(false); //..Fecha aguardando
      setSuccessVisible(true); //....Abre sucesso
    }, 5000); //..Transicao apos 5 segundos
  }, []);

  // Handler de fechar modal de aguardando
  const handleCloseAwaiting = useCallback(() => {
    if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current); //..Cancela timer
    setAwaitingVisible(false); //..Fecha modal
  }, []);

  // Handler de fechar modal de sucesso
  // Desconta saldo, registra no historico e zera o input
  const handleCloseSuccess = useCallback(() => {
    const pending = pendingWithdrawRef.current;
    if (pending) {
      const newBalance = balance - pending.amount; //..Novo saldo
      const today = new Date().toISOString().split('T')[0]; //..Data YYYY-MM-DD

      // Registra no historico (mais recente primeiro)
      const newItem: WithdrawHistoryItem = {
        id: Date.now().toString(), //..ID unico
        date: today, //................Data do resgate
        amount: pending.amount, //......Valor resgatado
        status: 'approved', //..........Status aprovado
        bankName: pending.bankName, //..Banco destino
        balanceBefore: balance, //......Saldo antes
        balanceAfter: newBalance, //....Saldo depois
      };

      setWithdrawHistory(prev => [newItem, ...prev]); //..Adiciona ao topo
      setBalance(newBalance); //..Atualiza saldo
      pendingWithdrawRef.current = null; //..Limpa dados pendentes
    }

    setSuccessVisible(false); //..Fecha modal
    handleValueChange(''); //......Zera o input
  }, [balance, handleValueChange]);

  // Cleanup do timer ao desmontar
  useEffect(() => {
    return () => {
      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current); //..Cancela timer
    };
  }, []);

  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null; //..Aguarda fontes

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header com voltar e titulo */}
      <Header
        title="Resgatar Saldo"
        notificationCount={0}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
        hideActions={true}
        hideMenu={true}
        backButtonColor="#1777CF"
        extraActions={
          <TouchableOpacity onPress={() => setHistoryVisible(true)} activeOpacity={0.7} style={styles.historyButton}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path d="M15 10.25c-3.171 0-5.75 2.58-5.75 5.75s2.579 5.75 5.75 5.75 5.75-2.58 5.75-5.75-2.579-5.75-5.75-5.75zm1.955 6.5H15a.75.75 0 0 1-.75-.75v-2.035a.75.75 0 0 1 1.5 0v1.285h1.205a.75.75 0 0 1 0 1.5zM16 2.25H6C4.48 2.25 3.25 3.48 3.25 5v13c0 1.52 1.23 2.75 2.75 2.75h3.54A7.146 7.146 0 0 1 7.75 16c0-4 3.25-7.25 7.25-7.25 1.38 0 2.66.38 3.75 1.06V5c0-1.52-1.23-2.75-2.75-2.75zm-8 10.5H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1c.41 0 .75.34.75.75s-.34.75-.75.75zm3-3H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75zm4-3H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h8c.41 0 .75.34.75.75s-.34.75-.75.75z" fill="#7D8592" />
            </Svg>
          </TouchableOpacity>
        }
      />

      {/* Divisoria padrao abaixo do header */}
      <View style={styles.headerDivider} />

      {/* Conteudo rolavel */}
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Secao 1: Saldo disponivel com degrade azul */}
          <View style={styles.balanceSection}>
            <LinearGradient
              colors={['#0D3B73', '#1565B8', '#0D3B73']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[StyleSheet.absoluteFill, styles.animatedOverlay, { opacity: overlayOpacity }]} />
            <View style={styles.balanceIconBox}>
              <WalletBalanceIcon color="#FFFFFF" />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo disponível para resgate</Text>
              <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
            </View>
          </View>

          {/* Secao 2: Valor do resgate */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Quanto você quer resgatar?</Text>

            {/* Input monetario grande */}
            <View style={[styles.amountInputContainer, valueError && styles.amountInputError]}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0,00"
                placeholderTextColor="#91929E"
                value={rawInput}
                onChangeText={handleValueChange}
                keyboardType="numeric"
                maxLength={15}
                underlineColorAndroid="transparent"
              />
              {/* Botao limpar campo (X fino, posicao absoluta) */}
              {rawInput.length > 0 && (
                <Text onPress={() => handleValueChange('')} style={{ position: 'absolute', right: 16, fontSize: 20, fontFamily: 'Inter_400Regular', color: '#B0B5BE' }}>×</Text>
              )}
            </View>

            {/* Mensagem de erro */}
            {valueError && (
              <Text style={styles.errorText}>{WITHDRAW_MESSAGES[valueError]}</Text>
            )}

            {/* Texto auxiliar */}
            <Text style={styles.helperText}>Valor mínimo de resgate: R$ {MIN_WITHDRAW_AMOUNT},00</Text>
          </View>

          {/* Secao 3: Conta destino */}
          <View style={styles.destinationSection}>
            <WithdrawDestination
              savedAccounts={savedAccounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={handleSelectAccount}
              showNewForm={showNewForm}
              onToggleNewForm={handleToggleNewForm}
              transferMethod={transferMethod}
              onTransferMethodChange={handleTransferMethodChange}
              newAccountData={newAccountData}
              onNewAccountChange={handleNewAccountChange}
              onConfirmNewAccount={handleConfirmNewAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botao fixo no rodape */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleResgatar}
          disabled={!isFormValid}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Resgatar</Text>
        </TouchableOpacity>
      </View>

      {/* Modais de aprovacao de resgate */}
      <WithdrawConfirmModal visible={confirmVisible} onConfirm={handleConfirmWithdraw} onCancel={() => setConfirmVisible(false)} />
      <WithdrawAwaitingModal visible={awaitingVisible} onClose={handleCloseAwaiting} />
      <WithdrawSuccessModal visible={successVisible} onClose={handleCloseSuccess} />

      {/* Modal de historico de resgates */}
      <WithdrawHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} history={withdrawHistory} />

      {/* Menu lateral do sistema */}
      <SideMenuScreen isVisible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </SafeAreaView>
  );
};

// Estilos da tela de resgate
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Flex auxiliar
  flex1: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Divisoria padrao abaixo do header
  headerDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
  },
  // ScrollView
  scrollView: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1, //............Expande para preencher a tela
    paddingHorizontal: 16, //..Padding lateral
    paddingBottom: 10, //.......Respiro inferior ate o footer
  },

  // === Secao 1: Saldo disponivel ===

  // Container do saldo com degrade (layout horizontal)
  balanceSection: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    borderRadius: 12, //...........Arredondamento
    padding: 16, //................Espaco interno
    gap: 14, //....................Espaco entre icone e textos
    marginTop: 16, //..............Espaco superior
    marginBottom: 24, //...........Espaco inferior
    overflow: 'hidden', //........Esconde overflow do gradient
  },
  // Overlay animado de respiracao
  animatedOverlay: {
    backgroundColor: 'rgba(255,255,255,0.15)', //..Brilho branco sutil
  },
  // Container do icone no card de saldo
  balanceIconBox: {
    width: 44, //..............Largura fixa
    height: 44, //.............Altura fixa
    borderRadius: 12, //.......Arredondamento
    backgroundColor: 'rgba(255,255,255,0.12)', //..Fundo branco sutil
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Textos do saldo (label + valor)
  balanceInfo: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Label do saldo
  balanceLabel: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: 'rgba(255,255,255,0.7)', //..Branco translucido
    marginBottom: 2, //............Espaco inferior
  },
  // Valor do saldo
  balanceValue: {
    fontSize: 22, //...............Tamanho destacado
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FFFFFF', //............Cor branca
    letterSpacing: -0.5, //........Espacamento
  },

  // === Secao 2: Valor do resgate ===

  // Container do valor
  amountSection: {
    marginBottom: 24, //..Espaco inferior
  },
  // Titulo da secao
  sectionTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 12, //...........Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Container do input monetario
  amountInputContainer: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    borderWidth: 1, //............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    borderRadius: 12, //..........Arredondamento
    paddingHorizontal: 16, //....Espaco lateral
    paddingVertical: 12, //.......Espaco vertical
    gap: 6, //.....................Espaco entre prefix e input
  },
  // Input com erro
  amountInputError: {
    borderColor: '#EF4444', //..Borda vermelha
  },
  // Prefixo R$
  currencyPrefix: {
    fontSize: 22, //...............Tamanho destacado
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#91929E', //............Cor placeholder
  },
  // Input do valor
  amountInput: {
    flex: 1, //....................Ocupa espaco disponivel
    fontSize: 22, //...............Tamanho destacado
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    padding: 0, //................Remove padding padrao
    outlineStyle: 'none', //.......Remove borda de foco
  },
  // Texto de erro
  errorText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#EF4444', //............Cor vermelha
    marginTop: 8, //...............Espaco superior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Texto auxiliar
  helperText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginTop: 10, //..............Espaco superior
    marginLeft: 5, //..............Respiro esquerdo
  },

  // === Secao 3: Conta destino ===

  // Container da conta destino
  destinationSection: {
    flex: 1, //............Preenche espaco restante da tela
    marginBottom: 16, //..Espaco inferior
  },

  // === Botao fixo no rodape ===

  // Barra inferior
  bottomBar: {
    paddingHorizontal: 16, //..Espaco lateral
    paddingVertical: 12, //....Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Linha superior
    borderTopColor: '#D8E0F0', //..Cor da linha
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Botao continuar
  continueButton: {
    backgroundColor: '#1777CF', //..Cor accent
    borderRadius: 12, //...........Arredondamento
    paddingVertical: 14, //........Espaco vertical
    alignItems: 'center', //.......Centraliza
  },
  // Botao desabilitado
  continueButtonDisabled: {
    backgroundColor: '#D8E0F0', //..Cor cinza
  },
  // Texto do botao
  continueButtonText: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FCFCFC', //............Cor branca
  },

  // === Botao de historico no header ===

  // Container do botao de historico (extrema direita do header, 10px da borda)
  historyButton: {
    width: 38, //...........Largura fixa
    height: 38, //..........Altura fixa
    alignItems: 'center', //..Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
    borderWidth: 1, //..........Borda visivel
    borderColor: '#D8E0F0', //..Cor cinza clara padrao
    borderRadius: 10, //........Cantos arredondados
    marginLeft: 'auto', //....Empurra para extrema direita
    marginRight: 15, //........10px de respiro da borda direita ← AJUSTE AQUI
  },
});

// Export padrao
export default WithdrawScreen;
