// React e React Native
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, RefreshControl, TextInput, Image, Animated } from 'react-native';

// Bibliotecas externas
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';
import Lottie from 'lottie-react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Dados das animacoes Lottie
import walletCardAnimation from './assets/wallet-card-white.json';

// Tipos e dados
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import { MOCK_TRANSACTIONS, Transaction, formatCurrency, groupByDate, matchesDateFilter, getStatusColor } from './03.WalletData';

// Hooks
import useWalletFilters from './06.useWalletFilters';

// Componentes
import Header from '../5.Side Menu/2.Header';
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen';
import BottomMenu from '../5.Side Menu/3.BottomMenu';
import WalletDatePickerModal from './02.WalletDatePickerModal';
import WalletFilterModal from './04.WalletFilterModal';

import WalletMenuModal from './07.WalletMenuModal';
import WalletClientPaymentModal from './30.WalletClientPaymentModal';
import { EyeOpenIcon, EyeClosedIcon, HeaderMenuIcon, SearchIcon, FilterIcon } from './05.WalletIcons';

// Constantes
import { Layout } from '../../constants/theme';

// Placeholder de avatar do cliente
const DEFAULT_AVATAR = require('../../../assets/AvatarPlaceholder02.png');

// Componente principal
const WalletHomeScreen = () => {
  // Navegacao
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); //..Hook de navegacao

  // Animacao de respiracao do card
  const pulseAnim = useRef(new Animated.Value(0)).current; //..Valor animado do pulso

  // Efeito de loop da animacao
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }), //..Sobe opacidade
        Animated.timing(pulseAnim, { toValue: 0, duration: 2500, useNativeDriver: true }), //..Desce opacidade
      ])
    ).start();
  }, [pulseAnim]);

  // Opacidade interpolada do overlay
  const overlayOpacity = pulseAnim.interpolate({
    inputRange: [0, 1], //........Faixa de entrada
    outputRange: [0, 0.4], //......Faixa de saida
  });

  // Estados principais
  const [sideMenuVisible, setSideMenuVisible] = useState(false); //..Controle do menu lateral
  const [balanceType, setBalanceType] = useState<'available' | 'receivable'>('available'); //..Tipo de saldo
  const [isBalanceVisible, setIsBalanceVisible] = useState(true); //..Visibilidade do saldo
  const [refreshing, setRefreshing] = useState(false); //..Estado de refresh
  const [searchText, setSearchText] = useState(''); //..Texto de pesquisa

  // Estado do modo de teste e menu
  const [menuModalVisible, setMenuModalVisible] = useState(false); //..Modal do menu do card
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); //..Transacao selecionada para modal
  const [selectedProduct, setSelectedProduct] = useState('all'); //..Filtro de produto selecionado

  // Hook de filtros de data
  const { showFilterModal, dateFilter, customStartDate, customEndDate, showDatePicker, handleFilterSelect, handleDateSelect, handleApplyCustom, handleOpenFilterModal, handleCloseFilterModal, handleStartDatePress, handleEndDatePress, handleCloseDatePicker, isFilterActive, filterChipLabel, isApplyDisabled, selectedPickerDate, minPickerDate, pickerTitle } = useWalletFilters();

  // Valores mock
  const availableBalance = 4235.50; //..Saldo disponivel
  const receivableBalance = 12750.00; //..Saldo a receber
  const pendingCount = 3; //..Quantidade de pendentes

  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Handler de refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true); //..Inicia refresh
    setTimeout(() => setRefreshing(false), 1500); //..Simula carregamento
  }, []);

  // Handler de alternancia do tipo de saldo
  const toggleBalanceType = () => setBalanceType(prev => prev === 'available' ? 'receivable' : 'available'); //..Alterna tipo

  // Saldo conforme toggle
  const currentBalance = balanceType === 'available' ? availableBalance : receivableBalance; //..Saldo atual

  // Transacoes filtradas por pesquisa, tipo de saldo e data
  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
    const matchesSearch = t.clientName.toLowerCase().includes(searchText.toLowerCase()) || t.productName.toLowerCase().includes(searchText.toLowerCase()); //..Filtro pesquisa
    const matchesType = balanceType === 'available' ? t.status === 'received' : (t.status === 'pending' || t.status === 'overdue'); //..Filtro tipo
    const matchesDate = matchesDateFilter(t.date, dateFilter, customStartDate, customEndDate); //..Filtro data
    const matchesProduct = selectedProduct === 'all' || t.productName === selectedProduct; //..Filtro produto
    return matchesSearch && matchesType && matchesDate && matchesProduct; //..Todos os filtros
  });

  // Transacoes agrupadas
  const groupedTransactions = groupByDate(filteredTransactions); //..Agrupa por data

  // Verificacao combinada de filtro ativo (produto ou data)
  const isAnyFilterActive = selectedProduct !== 'all' || dateFilter !== 'all'; //..Qualquer filtro ativo

  // Label combinada para o chip de filtro (Produto - Data)
  const filterChipText = (() => {
    const productPart = selectedProduct === 'all' ? 'Todos' : (selectedProduct.length > 20 ? selectedProduct.slice(0, 17) + '...' : selectedProduct); //..Trunca produto longo
    return `${productPart} - ${filterChipLabel}`; //..Combina produto e data
  })();

  if (!fontsLoaded) return null; //..Aguarda fontes

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header com titulo padrao */}
      <Header
        title="Carteira Digital"
        notificationCount={pendingCount}
        onMenuPress={() => setSideMenuVisible(true)}
        showBackButton={false}
      />

      {/* Divisoria padrao abaixo do header */}
      <View style={styles.headerDivider} />

      {/* Area de conteudo com menu inferior */}
      <View style={styles.content}>
        <>
        {/* Secao fixa: card de saldo, titulo e pesquisa */}
        <View style={styles.fixedSection}>
          {/* Card de saldo animado V5 */}
          <View style={styles.balanceCard}>

            {/* Overlay animado com efeito de respiracao */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.animatedOverlay, { opacity: overlayOpacity }]} />

            {/* Secao superior: titulo, olho e menu */}
            <View style={styles.cardTopSection}>
              <View style={styles.cardRowLeft}>
                <View style={styles.walletLottieBox}>
                  <Lottie animationData={walletCardAnimation} loop={true} autoplay={true} style={styles.walletLottie} />
                </View>
                <Text style={styles.cardTitleText}>Meu Saldo</Text>
              </View>
              <View style={styles.cardIconRow}>
                <View style={styles.cardIconBox}>
                  <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    {isBalanceVisible ? <EyeOpenIcon color="#FFFFFF" /> : <EyeClosedIcon color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>
                <View style={styles.cardIconBox}>
                  <TouchableOpacity onPress={() => setMenuModalVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <HeaderMenuIcon color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Divisor entre secao superior e central */}
            <View style={styles.cardDivider} />

            {/* Secao central: valor do saldo */}
            <View style={styles.cardMiddleSection}>
              <Text style={styles.balanceValue}>
                {isBalanceVisible ? formatCurrency(currentBalance) : 'R$ ••••••'}
              </Text>
            </View>

            {/* Divisor entre secao central e inferior */}
            <View style={styles.cardDivider} />

            {/* Secao inferior: toggle unico alternavel */}
            <View style={styles.cardBottomSection}>
              <TouchableOpacity style={styles.toggleBar} onPress={toggleBalanceType} activeOpacity={0.7}>
                <View style={[styles.toggleSegment, balanceType === 'available' && styles.segmentActive]}>
                  <Text style={[styles.segmentText, { color: balanceType === 'available' ? '#0D3B73' : 'rgba(255,255,255,0.55)' }, balanceType === 'available' && styles.segmentTextBold]}>
                    Disponível
                  </Text>
                </View>
                <View style={[styles.toggleSegment, balanceType === 'receivable' && styles.segmentActive]}>
                  <Text style={[styles.segmentText, { color: balanceType === 'receivable' ? '#0D3B73' : 'rgba(255,255,255,0.55)' }, balanceType === 'receivable' && styles.segmentTextBold]}>
                    A Receber
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Titulo do historico com filtro ativo */}
          <View style={styles.historyRow}>
            <Text style={styles.historyTitle}>Histórico</Text>
            {isAnyFilterActive && (
              <TouchableOpacity style={styles.filterBadge} onPress={() => { handleFilterSelect('all'); setSelectedProduct('all'); }} activeOpacity={0.7}>
                <Text style={styles.filterBadgeText} numberOfLines={1}>{filterChipText}</Text>
                <Svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6L18 18" stroke="#1777CF" strokeWidth="2.5" strokeLinecap="round"/>
                </Svg>
              </TouchableOpacity>
            )}
          </View>

          {/* Barra de pesquisa com botao de filtro */}
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por cliente ou produto..."
              placeholderTextColor="#91929E"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={handleOpenFilterModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FilterIcon color={isFilterActive ? '#1777CF' : '#7D8592'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Secao rolavel: transacoes */}
        <View style={styles.scrollableArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1777CF" colors={['#1777CF']} />}
        >
          {/* Lista de transacoes agrupadas */}
          {Object.keys(groupedTransactions).length === 0 ? (
            // Estado vazio
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
              <Text style={styles.emptySubtitle}>
                {balanceType === 'available' ? 'Nenhum pagamento recebido ainda' : 'Nenhum pagamento pendente no momento'}
              </Text>
            </View>
          ) : (
            Object.entries(groupedTransactions).map(([dateLabel, transactions]) => (
              <View key={dateLabel}>
                {/* Label de data */}
                <Text style={styles.dateLabel}>{dateLabel}</Text>

                {/* Itens de transacao */}
                {transactions.map((transaction) => (
                  <TouchableOpacity key={transaction.id} style={styles.transactionItem} activeOpacity={0.7} onPress={() => setSelectedTransaction(transaction)}>
                    {/* Avatar com indicador de status */}
                    <View style={styles.avatarContainer}>
                      <Image
                        source={transaction.clientPhoto ? { uri: transaction.clientPhoto } : DEFAULT_AVATAR}
                        style={styles.clientPhoto}
                        resizeMode="cover"
                      />
                      {/* Bolinha de status no canto inferior direito do avatar */}
                      <View style={[styles.avatarStatusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
                    </View>

                    {/* Informacoes da transacao */}
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionName} numberOfLines={1}>{transaction.clientName}</Text>
                      <Text style={styles.transactionDetail} numberOfLines={1}>
                        {transaction.productName} • {transaction.installment}/{transaction.totalInstallments}
                      </Text>
                    </View>

                    {/* Valor da comissao */}
                    <Text style={styles.commissionValue}>
                      {isBalanceVisible ? formatCurrency(transaction.commissionValue) : '••••'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
        </View>
        </>

        {/* Menu inferior */}
        <BottomMenu activeScreen="Wallet" />
      </View>

      {/* Modal de filtro de data */}
      <WalletFilterModal
        visible={showFilterModal}
        onClose={handleCloseFilterModal}
        dateFilter={dateFilter}
        onFilterSelect={handleFilterSelect}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onStartDatePress={handleStartDatePress}
        onEndDatePress={handleEndDatePress}
        onApplyCustom={handleApplyCustom}
        isApplyDisabled={isApplyDisabled}
        selectedProduct={selectedProduct}
        onProductSelect={setSelectedProduct}
      />

      {/* Modal de selecao de mes */}
      <WalletDatePickerModal
        visible={showDatePicker}
        onClose={handleCloseDatePicker}
        onSelect={handleDateSelect}
        selectedDate={selectedPickerDate}
        minDate={minPickerDate}
        title={pickerTitle}
      />

      {/* Modal de pagamentos do cliente */}
      <WalletClientPaymentModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Modal de menu do card de saldo */}
      <WalletMenuModal
        visible={menuModalVisible}
        onClose={() => setMenuModalVisible(false)}
        onWithdraw={() => { setMenuModalVisible(false); navigation.navigate(ScreenNames.WalletWithdraw); }}
        onAnticipate={() => { setMenuModalVisible(false); navigation.navigate(ScreenNames.WalletAnticipate); }}
        onReconciliation={() => { setMenuModalVisible(false); navigation.navigate(ScreenNames.WalletReconciliation); }}
      />

      {/* Menu lateral do sistema */}
      <SideMenuScreen isVisible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </SafeAreaView>
  );
};

// Estilos da tela
const styles = StyleSheet.create({
  // Container principal da tela
  container: {
    flex: 1, //.................Ocupa toda a tela
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Divisoria padrao abaixo do header
  headerDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria padrao
  },
  // Area de conteudo com menu inferior
  content: {
    flex: 1, //..............Ocupa espaco disponivel
    position: 'relative', //..Referencia para posicionamento absoluto
  },
  // ScrollView com posicao absoluta para garantir scroll no web
  scrollView: {
    position: 'absolute', //..Posicao absoluta para bounds explicitos
    top: 0, //................Ancora no topo
    left: 0, //.................Ancora a esquerda
    right: 0, //................Ancora a direita
    bottom: 0, //...............Ancora embaixo
  },
  // Conteudo interno do scroll
  scrollContent: {
    paddingHorizontal: 16, //..Padding lateral
    paddingBottom: Layout.bottomMenuHeight + 20, //..Espaco para menu inferior
  },
  // Secao fixa: card, titulo e pesquisa
  fixedSection: {
    paddingHorizontal: 16, //..Padding lateral igual ao scroll
    backgroundColor: '#FCFCFC', //..Fundo igual a tela
  },
  // Area rolavel das transacoes
  scrollableArea: {
    flex: 1, //..............Ocupa espaco restante
    position: 'relative', //..Referencia para scroll absoluto
    overflow: 'hidden', //....Oculta cards antes da borda superior
  },
  // Card de saldo animado V5
  balanceCard: {
    backgroundColor: '#0D3B73', //..Azul profundo escuro
    borderRadius: 16, //............Arredondamento
    overflow: 'hidden', //.........Garante clip do overlay
    marginTop: 8, //................Espaco superior
  },
  // Overlay animado de respiracao
  animatedOverlay: {
    backgroundColor: '#1777CF', //..Cor do brilho azul
    borderRadius: 16, //............Arredondamento igual ao card
  },
  // Secao superior com titulo e icones
  cardTopSection: {
    flexDirection: 'row', //.......Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //......Alinha vertical
    paddingHorizontal: 24, //......Espaco lateral
    paddingVertical: 16, //........Espaco vertical
  },
  // Linha alinhada a esquerda
  cardRowLeft: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 10, //...............Espaco entre icone e titulo
  },
  // Container da animacao Lottie da carteira
  walletLottieBox: {
    width: 22, //..............Largura do container
    height: 22, //.............Altura do container
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    overflow: 'hidden', //........Recorta excedente
  },
  // Animacao Lottie da carteira
  walletLottie: {
    width: 22, //..Largura da animacao
    height: 22, //..Altura da animacao
  },
  // Titulo do card
  cardTitleText: {
    fontSize: 16, //.................Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FFFFFF', //..............Cor branca sobre fundo escuro
    marginTop: 5, //..................Desce titulo independente do icone
  },
  // Linha de icones a direita
  cardIconRow: {
    flexDirection: 'row', //..Layout horizontal
    gap: 8, //................Espaco entre containers
  },
  // Container individual de icone
  cardIconBox: {
    width: 36, //..............Largura fixa
    height: 36, //.............Altura fixa
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    borderRadius: 8, //...........Arredondamento
    backgroundColor: 'rgba(255,255,255,0.12)', //..Fundo translucido
  },
  // Divisor horizontal entre secoes
  cardDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: 'rgba(255,255,255,0.12)', //..Divisoria translucida
    marginHorizontal: 24, //..............Respiro lateral
  },
  // Secao central com saldo
  cardMiddleSection: {
    paddingHorizontal: 24, //..Espaco lateral
    paddingVertical: 20, //....Espaco vertical generoso
    alignItems: 'center', //..Centraliza o valor
  },
  // Valor do saldo
  balanceValue: {
    fontSize: 36, //.................Tamanho grande
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FFFFFF', //..............Cor branca sobre fundo escuro
    letterSpacing: -1, //............Espacamento negativo
  },
  // Secao inferior com toggle
  cardBottomSection: {
    paddingHorizontal: 20, //..Espaco lateral
    paddingVertical: 12, //....Espaco vertical
  },
  // Container externo do toggle
  toggleBar: {
    flexDirection: 'row', //......Layout horizontal
    backgroundColor: 'rgba(255,255,255,0.10)', //..Fundo translucido
    borderRadius: 10, //..........Arredondamento
    padding: 3, //................Espaco interno
  },
  // Segmento individual do toggle
  toggleSegment: {
    flex: 1, //................Ocupa metade
    paddingVertical: 8, //....Espaco vertical
    alignItems: 'center', //..Centraliza texto
    borderRadius: 8, //........Arredondamento
  },
  // Segmento ativo do toggle
  segmentActive: {
    backgroundColor: '#FFFFFF', //..Fundo branco ativo
  },
  // Texto base do segmento
  segmentText: {
    fontSize: 13, //.................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
  },
  // Texto bold para segmento ativo
  segmentTextBold: {
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Linha do titulo do historico com filtro
  historyRow: {
    flexDirection: 'row', //........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //........Alinha vertical
    marginTop: 24, //.............Espaco superior
    marginBottom: 8, //...........Espaco inferior
  },
  // Titulo do historico
  historyTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginLeft: 5, //.............Respiro esquerdo
  },
  // Badge do filtro ativo ao lado do titulo
  filterBadge: {
    flexDirection: 'row', //........Layout horizontal
    alignItems: 'center', //........Alinha vertical
    backgroundColor: 'rgba(23, 119, 207, 0.06)', //..Azul 3% padrao
    borderRadius: 6, //..............Cantos levemente arredondados
    paddingHorizontal: 8, //........Espaco lateral
    paddingVertical: 4, //..........Espaco vertical
    gap: 6, //......................Espaco entre texto e icone
    marginRight: 5, //..............Respiro direito
  },
  // Texto do badge de filtro
  filterBadgeText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#1777CF', //............Cor accent
  },
  // Container de pesquisa com botao de filtro
  searchContainer: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Alinha vertical
    backgroundColor: '#FCFCFC', //....Fundo branco
    borderRadius: 10, //..............Arredondamento
    paddingHorizontal: 12, //..........Espaco lateral
    paddingVertical: 10, //...........Espaco vertical
    marginBottom: 15, //..............Espaco inferior minimo
    borderWidth: 1, //................Borda
    borderColor: '#D8E0F0', //........Cor da borda
    gap: 8, //........................Espaco entre elementos
  },
  // Input de pesquisa
  searchInput: {
    flex: 1, //....................Ocupa espaco disponivel
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //...........Cor do texto
    padding: 0, //................Remove padding padrao
    outlineStyle: 'none', //.......Remove borda de foco
  },
  // Label de data
  dateLabel: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#91929E', //.............Cor terciaria
    marginTop: 0, //................Espaco superior
    marginBottom: 8, //.............Espaco inferior
    marginLeft: 5, //...............Respiro esquerdo
  },
  // Item de transacao minimalista
  transactionItem: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //..........Arredondamento
    padding: 12, //................Espaco interno
    marginBottom: 6, //.............Espaco inferior
    gap: 12, //.....................Espaco entre elementos
    borderWidth: 1, //..............Borda de separacao
    borderColor: '#D8E0F0', //......Cor da borda padrao
  },
  // Container do avatar com indicador
  avatarContainer: {
    position: 'relative', //..Referencia para dot absoluto
  },
  // Foto do cliente quadrada com cantos arredondados
  clientPhoto: {
    width: 42, //..........Largura da foto
    height: 42, //.........Altura da foto
    borderRadius: 8, //....Cantos levemente arredondados
    backgroundColor: '#F4F4F4', //..Cor de fundo fallback
  },
  // Bolinha de status no canto inferior direito do avatar
  avatarStatusDot: {
    position: 'absolute', //..Posicao absoluta sobre o avatar
    bottom: -2, //............Posicao inferior
    right: -2, //.............Posicao direita
    width: 12, //.............Largura do indicador
    height: 12, //............Altura do indicador
    borderRadius: 6, //.......Arredondamento circular
    borderWidth: 2, //........Borda branca de recorte
    borderColor: '#FCFCFC', //..Cor da borda igual ao fundo
  },
  // Informacoes da transacao
  transactionInfo: {
    flex: 1, //............Ocupa espaco disponivel
    gap: 3, //..............Espaco entre linhas
  },
  // Nome do cliente
  transactionName: {
    fontSize: 14, //...........Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //........Cor do texto
  },
  // Detalhe da transacao
  transactionDetail: {
    fontSize: 12, //...........Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //........Cor terciaria
  },
  // Valor da comissao
  commissionValue: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
  },
  // Estado vazio
  emptyState: {
    alignItems: 'center', //..Centraliza
    paddingVertical: 48, //...Espaco vertical
    gap: 8, //................Espaco entre elementos
  },
  // Titulo do estado vazio
  emptyTitle: {
    fontSize: 15, //...........Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //........Cor do texto
    textAlign: 'center', //....Centraliza texto
  },
  // Subtitulo do estado vazio
  emptySubtitle: {
    fontSize: 13, //...........Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //........Cor terciaria
    textAlign: 'center', //....Centraliza texto
    paddingHorizontal: 32, //..Padding lateral
  },
});

// Export padrao
export default WalletHomeScreen;
