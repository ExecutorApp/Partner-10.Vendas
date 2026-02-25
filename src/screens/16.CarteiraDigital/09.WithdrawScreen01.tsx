// React e React Native
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Animated } from 'react-native';

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

// Saldo disponivel (mock)
const AVAILABLE_BALANCE = 4235.50; //..Saldo para resgate

// Tela principal de resgate de saldo
// Header com voltar, saldo, input monetario e conta destino
const WithdrawScreen = () => {
  // Navegacao e menu lateral
  const navigation = useNavigation(); //..Hook de navegacao
  const [sideMenuVisible, setSideMenuVisible] = useState(false); //..Controle do menu lateral

  // Hook do formulario
  const {
    rawInput, amount, handleValueChange,
    savedAccounts, selectedAccountId, handleSelectAccount, showNewForm, handleToggleNewForm,
    transferMethod, handleTransferMethodChange, newAccountData, handleNewAccountChange,
    handleConfirmNewAccount, handleDeleteAccount, valueError, isFormValid,
  } = useWithdrawForm(AVAILABLE_BALANCE);

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
        onMenuPress={() => setSideMenuVisible(true)}
        hideActions={true}
        backButtonColor="#1777CF"
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
              <Text style={styles.balanceValue}>{formatCurrency(AVAILABLE_BALANCE)}</Text>
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
              onDeleteAccount={handleDeleteAccount}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botao fixo no rodape */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={() => {}}
          disabled={!isFormValid}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>

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
});

// Export padrao
export default WithdrawScreen;
