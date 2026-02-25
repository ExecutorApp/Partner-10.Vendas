// React e React Native
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, SafeAreaView, StatusBar, Animated } from 'react-native';

// Bibliotecas externas
import { useNavigation } from '@react-navigation/native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

// Tipos e dados
import { Receivable, formatDueDate, formatCurrency, groupReceivablesByClient } from './18.AnticipateData';

// Hooks
import useAnticipateForm from './19.useAnticipateForm';

// Componentes
import Header from '../5.Side Menu/2.Header';
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen';
import AnticipateSimulator from './21.AnticipateScreen02';
import AnticipateClientModal from './22.AnticipateClientModal';
import WithdrawDestination from './10.WithdrawScreen02';
import { CheckCircleIcon, EmptyCircleIcon, BankIcon } from './08.WalletMenuIcons';
import { AnticipateAwaitingModal, AnticipateApprovedModal } from './23.AnticipateApprovalModals';
import AnticipateHistoryModal, { AnticipateHistoryItem, INITIAL_ANTICIPATE_HISTORY } from './35.AnticipateHistoryModal';


// Placeholder de avatar do cliente
const DEFAULT_AVATAR = require('../../../assets/AvatarPlaceholder02.png');

// Labels das abas de navegacao
const TAB_LABELS = ['Recebíveis', 'Simulação', 'Destino']; //..Tres abas

// Tela principal de antecipacao de recebiveis
// Header, saldo, tab bar com 3 abas e rodape
const AnticipateScreen = () => {
  // Navegacao e menu lateral
  const navigation = useNavigation(); //..Hook de navegacao
  const [sideMenuVisible, setSideMenuVisible] = useState(false); //..Controle do menu lateral

  // IDs de recebiveis ja antecipados (desaparecem da lista)
  const [anticipatedIds, setAnticipatedIds] = useState<Set<string>>(new Set());

  // Historico de antecipacoes (atualiza apos cada antecipacao)
  const [anticipateHistory, setAnticipateHistory] = useState<AnticipateHistoryItem[]>(INITIAL_ANTICIPATE_HISTORY);

  // Estado do modal de historico
  const [historyVisible, setHistoryVisible] = useState(false); //..Modal de historico

  // Hook do formulario (filtra recebiveis ja antecipados)
  const {
    receivables, selectedIds, handleToggleReceivable, handleSelectAll, handleDeselectAll, isAllSelected, hasSelection,
    grossAmount, totalDiscount, netAmount, averageTerm,
    savedAccounts, selectedAccountId, handleSelectAccount, showNewForm, handleToggleNewForm,
    transferMethod, handleTransferMethodChange, newAccountData, handleNewAccountChange,
    handleConfirmNewAccount, handleUpdateAccount, handleDeleteAccount, isFormValid,
  } = useAnticipateForm(anticipatedIds);

  // Total disponivel para antecipacao (calculado dos recebiveis restantes)
  const totalAvailable = receivables.reduce((sum: number, r: Receivable) => sum + r.amount, 0); //..Soma dinamica

  // Aba ativa (0=Recebiveis, 1=Simulacao, 2=Destino)
  const [activeTab, setActiveTab] = useState(0); //..Indice da aba

  // Estado do modal de detalhes do cliente
  const [modalClient, setModalClient] = useState<string | null>(null); //..Nome do cliente no modal

  // Estados dos modais de aprovacao
  const [awaitingVisible, setAwaitingVisible] = useState(false); //..Modal de aguardando
  const [approvedVisible, setApprovedVisible] = useState(false); //..Modal de aprovado
  const approvalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); //..Timer da transicao

  // Ref para dados da antecipacao pendente (capturados ao clicar Solicitar)
  const pendingAnticipationRef = useRef<{
    selectedIdsList: string[];
    grossAmount: number;
    netAmount: number;
    receivableCount: number;
    bankName: string;
  } | null>(null);

  // Mapa de recebiveis agrupados por cliente
  const clientGroupsMap = groupReceivablesByClient(receivables); //..Agrupamento

  // Handler de abrir modal do cliente
  const handleOpenClientModal = useCallback((clientName: string) => {
    setModalClient(clientName); //..Abre modal
  }, []);

  // Handler de fechar modal do cliente
  const handleCloseClientModal = useCallback(() => {
    setModalClient(null); //..Fecha modal
  }, []);

  // Handler de solicitar antecipacao (abre fluxo de aprovacao)
  // Captura dados da antecipacao antes de abrir o modal
  const handleRequestAnticipation = useCallback(() => {
    const selectedAccount = savedAccounts.find(a => a.id === selectedAccountId);
    pendingAnticipationRef.current = {
      selectedIdsList: Array.from(selectedIds), //..IDs selecionados
      grossAmount, //..Valor bruto
      netAmount, //....Valor liquido
      receivableCount: selectedIds.size, //..Quantidade de recebiveis
      bankName: selectedAccount?.bankName || 'Conta', //..Nome do banco destino
    };
    setAwaitingVisible(true); //..Abre modal de aguardando
    approvalTimerRef.current = setTimeout(() => {
      setAwaitingVisible(false); //..Fecha aguardando
      setApprovedVisible(true); //...Abre aprovado
    }, 5000); //..Transicao apos 5 segundos
  }, [savedAccounts, selectedAccountId, selectedIds, grossAmount, netAmount]);

  // Handler de fechar modal de aguardando
  const handleCloseAwaiting = useCallback(() => {
    if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current); //..Cancela timer
    setAwaitingVisible(false); //..Fecha modal
  }, []);

  // Handler de fechar modal de aprovado
  // Registra antecipacao no historico, marca recebiveis como antecipados e limpa selecao
  const handleCloseApproved = useCallback(() => {
    const pending = pendingAnticipationRef.current;
    if (pending) {
      const currentTotal = totalAvailable; //..Total atual
      const newTotal = currentTotal - pending.grossAmount; //..Novo total
      const today = new Date().toISOString().split('T')[0]; //..Data YYYY-MM-DD

      // Registra no historico (mais recente primeiro)
      const newItem: AnticipateHistoryItem = {
        id: Date.now().toString(), //..ID unico
        date: today, //................Data da antecipacao
        amount: pending.grossAmount, //..Valor bruto antecipado
        netAmount: pending.netAmount, //..Valor liquido recebido
        receivableCount: pending.receivableCount, //..Quantidade de recebiveis
        status: 'approved', //..........Status aprovado
        bankName: pending.bankName, //..Banco destino
        balanceBefore: currentTotal, //..Saldo antes
        balanceAfter: newTotal, //......Saldo depois
      };

      setAnticipateHistory(prev => [newItem, ...prev]); //..Adiciona ao topo

      // Marca recebiveis como antecipados (desaparecem da lista)
      setAnticipatedIds(prev => {
        const next = new Set(prev);
        pending.selectedIdsList.forEach(id => next.add(id));
        return next;
      });

      pendingAnticipationRef.current = null; //..Limpa dados pendentes
    }

    setApprovedVisible(false); //..Fecha modal
    handleDeselectAll(); //..........Limpa selecao
  }, [totalAvailable, handleDeselectAll]);

  // Cleanup do timer ao desmontar
  useEffect(() => {
    return () => {
      if (approvalTimerRef.current) clearTimeout(approvalTimerRef.current); //..Cancela timer
    };
  }, []);

  // Dados do cliente no modal
  const modalReceivables = modalClient ? (clientGroupsMap.get(modalClient) || []) : []; //..Recebiveis
  const modalPhoto = modalReceivables.length > 0 ? modalReceivables[0].clientPhoto : undefined; //..Foto

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

  // Renderiza card de recebivel individual
  const renderReceivableCard = (item: Receivable) => {
    const isSelected = selectedIds.has(item.id); //..Verifica selecao

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.receivableCard, isSelected && styles.receivableCardSelected]}
        onPress={() => handleOpenClientModal(item.clientName)}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleToggleReceivable(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSelected
            ? <CheckCircleIcon color="#1777CF" />
            : <EmptyCircleIcon color="#D8E0F0" />
          }
        </TouchableOpacity>

        {/* Avatar do cliente */}
        <Image source={item.clientPhoto ? { uri: item.clientPhoto } : DEFAULT_AVATAR} style={styles.avatar} />

        {/* Textos centrais: nome + data de vencimento */}
        <View style={styles.receivableInfo}>
          <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
          <Text style={styles.dueDate}>Vence em {formatDueDate(item.dueDate)}</Text>
        </View>

        {/* Valor a direita */}
        <Text style={styles.receivableAmount}>{formatCurrency(item.amount)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header com voltar, titulo e icone de historico */}
      <Header
        title="Antecipar Recebíveis"
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

      {/* Card de saldo fixo acima das abas */}
      <View style={styles.balanceWrapper}>
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={['#0D3B73', '#1565B8', '#0D3B73']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View style={[StyleSheet.absoluteFill, styles.animatedOverlay, { opacity: overlayOpacity }]} />
          <View style={styles.balanceIconBox}>
            <BankIcon color="#FFFFFF" />
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Total disponível para antecipação</Text>
            <Text style={styles.balanceValue}>{formatCurrency(totalAvailable)}</Text>
          </View>
        </View>
      </View>

      {/* Tab bar com 3 abas (controle segmentado) */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {TAB_LABELS.map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[styles.tabItem, activeTab === index && styles.tabItemActive]}
              onPress={() => setActiveTab(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Header fixo da aba de recebiveis (fora do scroll) */}
      {activeTab === 0 && (
        <View style={styles.selectHeaderFixed}>
          <Text style={styles.sectionTitle}>Selecionar Recebíveis</Text>
          <TouchableOpacity
            style={[styles.selectAllButton, isAllSelected && styles.selectAllButtonActive]}
            onPress={isAllSelected ? handleDeselectAll : handleSelectAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectAllButtonText, isAllSelected && styles.selectAllButtonTextActive]}>
              {isAllSelected ? 'Desmarcar todas' : 'Selecionar todas'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conteudo da aba ativa */}
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Aba 0: Selecionar Recebiveis (somente cards) */}
          {activeTab === 0 && (
            <View style={styles.selectSection}>
              {receivables.map(renderReceivableCard)}
            </View>
          )}

          {/* Aba 1: Simulacao de Antecipacao */}
          {activeTab === 1 && (
            <View style={styles.simulatorSection}>
              <AnticipateSimulator
                hasSelection={hasSelection}
                grossAmount={grossAmount}
                averageTerm={averageTerm}
                totalDiscount={totalDiscount}
                netAmount={netAmount}
              />
            </View>
          )}

          {/* Aba 2: Conta de Destino */}
          {activeTab === 2 && (
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
                onUpdateAccount={handleUpdateAccount}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Botao fixo no rodape */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleRequestAnticipation}
          disabled={!isFormValid}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Solicitar Antecipação</Text>
        </TouchableOpacity>
      </View>

      {/* Modais de aprovacao de antecipacao */}
      <AnticipateAwaitingModal visible={awaitingVisible} onClose={handleCloseAwaiting} />
      <AnticipateApprovedModal visible={approvedVisible} onClose={handleCloseApproved} />

      {/* Modal de detalhes do cliente */}
      <AnticipateClientModal
        visible={modalClient !== null}
        onClose={handleCloseClientModal}
        clientName={modalClient || ''}
        clientPhoto={modalPhoto}
        receivables={modalReceivables}
      />

      {/* Modal de historico de antecipacoes */}
      <AnticipateHistoryModal visible={historyVisible} onClose={() => setHistoryVisible(false)} history={anticipateHistory} />

      {/* Menu lateral do sistema */}
      <SideMenuScreen isVisible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </SafeAreaView>
  );
};

// Estilos da tela de antecipacao
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Divisoria padrao abaixo do header
  headerDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
  },

  // === Card de saldo (fixo acima das abas) ===

  // Wrapper externo do card de saldo
  balanceWrapper: {
    paddingHorizontal: 16, //..Margem lateral
    paddingTop: 16, //..........Espaco superior
  },
  // Container do saldo com degrade (layout horizontal)
  balanceSection: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    borderRadius: 12, //...........Arredondamento
    padding: 16, //................Espaco interno
    gap: 14, //....................Espaco entre icone e textos
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
    overflow: 'hidden', //........Esconde overflow da animacao
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

  // === Tab bar (controle segmentado) ===

  // Wrapper externo da tab bar
  tabBarWrapper: {
    paddingHorizontal: 16, //..Margem lateral
    paddingTop: 12, //..........Espaco superior
    paddingBottom: 12, //.......Espaco inferior
  },
  // Container da tab bar
  tabBar: {
    flexDirection: 'row', //..........Layout horizontal
    borderRadius: 8, //...............Arredondamento
    borderWidth: 1, //................Borda
    borderColor: '#D8E0F0', //........Cor da borda
    backgroundColor: '#F5F6FA', //....Fundo cinza claro
    padding: 4, //....................Respiro interno para aba ativa
  },
  // Item da tab (inativo)
  tabItem: {
    flex: 1, //...............Largura igual entre abas
    paddingVertical: 12, //...Espaco vertical
    alignItems: 'center', //..Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
  },
  // Item da tab (ativo)
  tabItemActive: {
    backgroundColor: '#1777CF', //..Fundo azul accent
    borderRadius: 7, //............Arredondamento interno
  },
  // Texto da tab (inativo)
  tabText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#7D8592', //............Cor secundaria
  },
  // Texto da tab (ativo)
  tabTextActive: {
    color: '#FFFFFF', //..Cor branca
  },

  // === Conteudo rolavel ===

  // Wrapper do conteudo com referencia de posicao
  contentWrapper: {
    flex: 1, //..............Ocupa espaco disponivel
    position: 'relative', //..Referencia para posicionamento absoluto
  },
  // ScrollView com posicao absoluta para garantir scroll no web
  scrollView: {
    position: 'absolute', //..Posicao absoluta para bounds explicitos
    top: 0, //................Ancora no topo
    left: 0, //...............Ancora a esquerda
    right: 0, //..............Ancora a direita
    bottom: 0, //..............Ancora embaixo
  },
  // Conteudo do scroll
  scrollContent: {
    flexGrow: 1, //.............Permite expandir para preencher altura
    paddingHorizontal: 16, //..Padding lateral
    paddingTop: 4, //..........Respiro superior
    paddingBottom: 10, //.......Respiro inferior ate o footer
  },

  // === Aba 0: Selecionar recebiveis ===

  // Header fixo da secao (fora do scroll, titulo + botao)
  selectHeaderFixed: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    paddingHorizontal: 16, //.........Margem lateral
    paddingBottom: 10, //..............Espaco inferior de respiro
  },
  // Container da secao (somente cards)
  selectSection: {
    marginBottom: 16, //..Espaco inferior
  },
  // Titulo da secao
  sectionTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Botao selecionar todas (inativo, quadrado com cantos leves)
  selectAllButton: {
    paddingHorizontal: 14, //..Espaco horizontal
    paddingVertical: 8, //.....Espaco vertical
    borderRadius: 6, //.........Arredondamento leve
    borderWidth: 1, //..........Borda
    borderColor: '#D8E0F0', //..Cor da borda
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Botao selecionar todas (ativo)
  selectAllButtonActive: {
    borderColor: '#1777CF', //......Borda azul
    backgroundColor: 'rgba(23,119,207,0.08)', //..Fundo azul sutil
  },
  // Texto do botao (inativo)
  selectAllButtonText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#7D8592', //............Cor secundaria
  },
  // Texto do botao (ativo)
  selectAllButtonTextActive: {
    color: '#1777CF', //..Cor azul
  },

  // === Cards de recebiveis ===

  // Card de recebivel (normal)
  receivableCard: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //..........Arredondamento
    padding: 12, //...............Espaco interno
    marginBottom: 6, //...........Espaco inferior
    gap: 10, //....................Espaco entre elementos
    borderWidth: 1, //.............Borda
    borderColor: '#D8E0F0', //....Cor da borda
  },
  // Card de recebivel (selecionado)
  receivableCardSelected: {
    borderColor: '#D8E0F0', //..................Borda cinza padrao
    backgroundColor: 'rgba(23,119,207,0.04)', //..Fundo azul sutil
  },
  // Container do checkbox
  checkboxContainer: {
    width: 20, //...Largura fixa
    height: 20, //..Altura fixa
  },
  // Avatar do cliente
  avatar: {
    width: 42, //..............Largura fixa
    height: 42, //.............Altura fixa
    borderRadius: 8, //........Arredondamento
    backgroundColor: '#E8ECF2', //..Cor de fundo placeholder
  },
  // Textos centrais do card
  receivableInfo: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Nome do cliente
  clientName: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 2, //............Espaco inferior
  },
  // Data de vencimento
  dueDate: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Valor do recebivel (peso normal, nao negrito)
  receivableAmount: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
  },

  // === Aba 1: Simulador ===

  // Container do simulador (flex para estado vazio preencher a tela)
  simulatorSection: {
    flex: 1, //.............Preenche altura disponivel
    marginBottom: 10, //...Respiro inferior
  },

  // === Aba 2: Conta destino ===

  // Container da conta destino (flex para preencher a tela)
  destinationSection: {
    flex: 1, //.............Preenche altura disponivel
    marginBottom: 10, //...Respiro inferior
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
  // Botao solicitar antecipacao
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

  // Container do botao de historico (extrema direita do header)
  historyButton: {
    width: 38, //...........Largura fixa
    height: 38, //..........Altura fixa
    alignItems: 'center', //..Centraliza horizontal
    justifyContent: 'center', //..Centraliza vertical
    borderWidth: 1, //..........Borda visivel
    borderColor: '#D8E0F0', //..Cor cinza clara padrao
    borderRadius: 10, //........Cantos arredondados
    marginLeft: 'auto', //....Empurra para extrema direita
    marginRight: 15, //........Respiro da borda direita
  },
});

// Export padrao
export default AnticipateScreen;
