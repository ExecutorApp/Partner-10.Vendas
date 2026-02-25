// Tela principal de Conciliacao
// Layout em 3 colunas separadas com fundo colorido (Modelo 05)

// React e React Native
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';

// Bibliotecas externas
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Tipos e dados
import { RootStackParamList } from '../../types/navigation';
import { MONTH_NAMES, getOrdersByMonth, calculateSummary, formatCurrency, formatDayOnly, getMissingAmount, ReconciliationOrder } from './26.ReconciliationData';

// Componentes
import Header from '../5.Side Menu/2.Header';
import SideMenuScreen from '../5.Side Menu/1.SideMenuScreen';
import ReconciliationDetailModal from './28.ReconciliationDetailModal';
import ReconciliationYearPickerModal from './29.ReconciliationYearPickerModal';

// Icone de seta esquerda para navegacao de mes
const ArrowLeftIcon = () => (
  <Svg width={7} height={10} viewBox="0 0 7 10" fill="none">
    <Path d="M6.18333 1.175L2.35833 5L6.18333 8.825L5 10L0 5L5 0L6.18333 1.175Z" fill="#1777CF" />
  </Svg>
);

// Icone de seta direita para navegacao de mes
const ArrowRightIcon = () => (
  <Svg width={7} height={10} viewBox="0 0 7 10" fill="none">
    <Path d="M0 1.175L3.825 5L0 8.825L1.18333 10L6.18333 5L1.18333 0L0 1.175Z" fill="#1777CF" />
  </Svg>
);

// Componente principal da tela de conciliacao
const ReconciliationScreen = () => {
  // Navegacao e dimensoes
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>(); //..Hook de navegacao
  const { height: windowHeight } = useWindowDimensions(); //..Altura da viewport

  // Estados principais
  const [selectedMonth, setSelectedMonth] = useState(1); //.......Mes selecionado
  const [selectedYear, setSelectedYear] = useState(2026); //......Ano selecionado
  const [selectedOrder, setSelectedOrder] = useState<ReconciliationOrder | null>(null); //..Pedido do modal
  const [modalVisible, setModalVisible] = useState(false); //..........Visibilidade do modal de detalhe
  const [yearPickerVisible, setYearPickerVisible] = useState(false); //..Visibilidade do seletor de ano
  const [sideMenuVisible, setSideMenuVisible] = useState(false); //.......Controle do menu lateral

  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Pedidos filtrados pelo mes e ano selecionados
  const filteredOrders = useMemo(() => getOrdersByMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  // Resumo calculado das comissoes filtradas
  const summary = useMemo(() => calculateSummary(filteredOrders), [filteredOrders]);

  // Handler de voltar
  const handleGoBack = useCallback(() => {
    navigation.goBack(); //..Volta para tela anterior
  }, [navigation]);

  // Navegar para mes anterior
  const goPrevMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1); //..Volta um ano
        return 11; //..Dezembro
      }
      return prev - 1; //..Mes anterior
    });
  }, []);

  // Navegar para proximo mes
  const goNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1); //..Avanca um ano
        return 0; //..Janeiro
      }
      return prev + 1; //..Proximo mes
    });
  }, []);

  // Handler de selecao de ano no picker
  const handleYearSelect = useCallback((year: number) => {
    setSelectedYear(year); //..Atualiza ano
    setYearPickerVisible(false); //..Fecha picker
  }, []);

  // Handler de abrir modal de detalhe
  const handleOpenDetail = useCallback((order: ReconciliationOrder) => {
    setSelectedOrder(order); //..Define pedido selecionado
    setModalVisible(true); //....Abre modal
  }, []);

  // Handler de fechar modal de detalhe
  const handleCloseDetail = useCallback(() => {
    setModalVisible(false); //..Fecha modal
    setSelectedOrder(null); //..Limpa pedido
  }, []);

  // Handler de navegacao entre clientes no modal
  const handleNavigateOrder = useCallback((newOrder: ReconciliationOrder) => {
    setSelectedOrder(newOrder); //..Troca para o pedido selecionado
  }, []);

  // Aguarda fontes
  if (!fontsLoaded) return null; //..Aguarda fontes

  return (
    <SafeAreaView style={[styles.container, { maxHeight: windowHeight }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFCFC" />

      {/* Header com botao voltar */}
      <Header
        title="Conciliação"
        notificationCount={0}
        onMenuPress={() => {}}
        showBackButton={true}
        onBackPress={handleGoBack}
        hideActions={true}
        hideMenu={true}
        backButtonColor="#1777CF"
      />

      {/* Divisoria padrao abaixo do header */}
      <View style={styles.headerDivider} />

      {/* Navegacao de mes com setas — fixo */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navButton} onPress={goPrevMonth} activeOpacity={0.7}>
          <ArrowLeftIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCenter} onPress={() => setYearPickerVisible(true)} activeOpacity={0.7}>
          <Text style={styles.navText}>{MONTH_NAMES[selectedMonth]} - {selectedYear}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goNextMonth} activeOpacity={0.7}>
          <ArrowRightIcon />
        </TouchableOpacity>
      </View>

      {/* Container externo que envolve titulos e planilha */}
      <View style={styles.tableContainer}>
        {/* Header das 3 colunas com fundo colorido */}
        <View style={styles.tableHeader}>
          {/* Header A Receber */}
          <View style={[styles.headerCell, { backgroundColor: '#1777CF' }]}>
            <Text style={styles.headerText}>A Receber</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerCount}>{summary.expectedCount} pagamentos</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerTotal}>{formatCurrency(summary.expectedValue)}</Text>
          </View>
          {/* Header Recebido */}
          <View style={[styles.headerCell, { backgroundColor: '#1B883C' }]}>
            <Text style={styles.headerText}>Recebido</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerCount}>{summary.receivedCount} pagamentos</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerTotal}>{formatCurrency(summary.receivedValue)}</Text>
          </View>
          {/* Header Faltando */}
          <View style={[styles.headerCell, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.headerText}>Faltando</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerCount}>{summary.missingCount} pagamentos</Text>
            <View style={styles.headerDividerLine} />
            <Text style={styles.headerTotal}>{formatCurrency(summary.missingValue)}</Text>
          </View>
        </View>

        {/* Area da planilha com scroll vertical */}
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.columnsRow}>
            {/* Coluna A Receber (tint azul) */}
            <View style={[styles.column, styles.columnBlue]}>
              {filteredOrders.map((order, index) => {
                const isEven = index % 2 === 0; //..Zebra par
                return (
                  <TouchableOpacity key={order.id} style={[styles.cell, isEven && styles.cellEvenBlue]} onPress={() => handleOpenDetail(order)} activeOpacity={0.7}>
                    <Text style={styles.cellDay}>{formatDayOnly(order.date)}</Text>
                    <Text style={[styles.cellValue, { color: '#1777CF' }]}>{formatCurrency(order.commissionValue)}</Text>
                  </TouchableOpacity>
                );
              })}
              {/* Linhas vazias para preencher espaco restante */}
              {Array.from({ length: 30 }).map((_, i) => (
                <View key={`eb-${i}`} style={[styles.cell, (filteredOrders.length + i) % 2 === 0 && styles.cellEvenBlue]} />
              ))}
            </View>

            {/* Coluna Recebido (tint verde) */}
            <View style={[styles.column, styles.columnGreen]}>
              {filteredOrders.map((order, index) => {
                const isEven = index % 2 === 0; //..Zebra par
                return (
                  <TouchableOpacity key={order.id} style={[styles.cell, isEven && styles.cellEvenGreen]} onPress={() => handleOpenDetail(order)} activeOpacity={0.7}>
                    {order.receivedAmount > 0 ? (
                      <>
                        <Text style={styles.cellDay}>{formatDayOnly(order.date)}</Text>
                        <Text style={[styles.cellValue, { color: '#1B883C' }]}>{formatCurrency(order.receivedAmount)}</Text>
                      </>
                    ) : (
                      <Text style={[styles.cellDash, styles.cellDashGreen]}>-----</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Linhas vazias para preencher espaco restante */}
              {Array.from({ length: 30 }).map((_, i) => (
                <View key={`eg-${i}`} style={[styles.cell, (filteredOrders.length + i) % 2 === 0 && styles.cellEvenGreen]} />
              ))}
            </View>

            {/* Coluna Faltando (tint vermelho) */}
            <View style={[styles.column, styles.columnRed]}>
              {filteredOrders.map((order, index) => {
                const missing = getMissingAmount(order); //..Valor faltante
                const isEven = index % 2 === 0; //..........Zebra par
                return (
                  <TouchableOpacity key={order.id} style={[styles.cell, isEven && styles.cellEvenRed]} onPress={() => handleOpenDetail(order)} activeOpacity={0.7}>
                    {missing > 0 ? (
                      <>
                        <Text style={styles.cellDay}>{formatDayOnly(order.date)}</Text>
                        <Text style={[styles.cellValue, { color: '#EF4444' }]}>{formatCurrency(missing)}</Text>
                      </>
                    ) : (
                      <Text style={[styles.cellDash, styles.cellDashRed]}>-----</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Linhas vazias para preencher espaco restante */}
              {Array.from({ length: 30 }).map((_, i) => (
                <View key={`er-${i}`} style={[styles.cell, (filteredOrders.length + i) % 2 === 0 && styles.cellEvenRed]} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modal seletor de ano */}
      <ReconciliationYearPickerModal
        visible={yearPickerVisible}
        onClose={() => setYearPickerVisible(false)}
        onSelect={handleYearSelect}
        selectedYear={selectedYear}
      />

      {/* Modal de detalhe do cliente */}
      <ReconciliationDetailModal
        visible={modalVisible}
        order={selectedOrder}
        allOrders={filteredOrders}
        onClose={handleCloseDetail}
        onNavigate={handleNavigateOrder}
      />

      {/* Menu lateral do sistema */}
      <SideMenuScreen isVisible={sideMenuVisible} onClose={() => setSideMenuVisible(false)} />
    </SafeAreaView>
  );
};

// Estilos da tela de conciliacao
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
  // Navegacao de mes com setas
  dateNav: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Centraliza vertical
    justifyContent: 'center', //..Centraliza horizontal
    paddingHorizontal: 15, //.....Margem lateral de 15px
    marginTop: 12, //.............Espaco superior
    marginBottom: 12, //..........Espaco inferior
    gap: 6, //....................Espaco entre elementos
  },
  // Botao de seta de navegacao
  navButton: {
    width: 38, //................Largura fixa
    height: 38, //...............Altura aumentada
    borderRadius: 4, //..........Cantos arredondados
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderWidth: 1, //...........Borda fina
    borderColor: '#D8E0F0', //...Cor da borda
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Centro clicavel da navegacao de mes
  navCenter: {
    flex: 1, //...................Ocupa espaco disponivel
    height: 38, //................Mesma altura dos botoes
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 4, //..........Cantos arredondados
    borderWidth: 1, //...........Borda fina
    borderColor: '#D8E0F0', //...Cor da borda
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Texto do mes e ano
  navText: {
    fontFamily: 'Inter_500Medium', //..Fonte media
    fontSize: 14, //.................Tamanho da fonte
    color: '#3A3F51', //..............Cor do texto
  },
  // Container externo que envolve titulos e planilha
  tableContainer: {
    flex: 1, //..................Ocupa todo espaco restante
    marginHorizontal: 15, //.....Margem lateral de 15px
    marginBottom: 10, //........Respiro inferior de 10px
    overflow: 'hidden', //......Oculta tudo que ultrapassa
  },
  // Header das 3 colunas
  tableHeader: {
    flexDirection: 'row', //..Layout horizontal
    gap: 6, //................Espaco entre colunas
    marginBottom: 8, //.......Margem de respiro
  },
  // Celula do header com fundo colorido
  headerCell: {
    flex: 1, //................Ocupa espaco igual
    paddingVertical: 8, //.....Espaco vertical
    paddingHorizontal: 6, //...Espaco lateral
    alignItems: 'center', //...Centraliza
    borderRadius: 4, //........Cantos arredondados
  },
  // Texto do titulo do header
  headerText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FFFFFF', //...........Cor branca
  },
  // Linha divisoria dentro do header
  headerDividerLine: {
    width: '80%', //..............Largura relativa
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: 'rgba(255,255,255,0.3)', //..Branco semi transparente
    marginVertical: 4, //..Espaco vertical
  },
  // Contagem de pagamentos do header
  headerCount: {
    fontSize: 11, //...............Tamanho da fonte aumentado
    fontFamily: 'Inter_500Medium', //..Fonte media
    color: 'rgba(255,255,255,0.85)', //..Branco semi transparente
  },
  // Valor total do header
  headerTotal: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#FFFFFF', //...........Cor branca
  },
  // Area de scroll da planilha
  scrollArea: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Container das 3 colunas da planilha
  columnsRow: {
    flexDirection: 'row', //..Layout horizontal
    gap: 6, //................Mesmo gap do header
  },
  // Coluna base
  column: {
    flex: 1, //................Ocupa espaco igual
    borderWidth: 1, //.........Borda em todos os lados
    borderRadius: 4, //........Cantos arredondados
    overflow: 'hidden', //......Recorta conteudo
  },
  // Coluna azul (A Receber)
  columnBlue: {
    borderColor: 'rgba(23,119,207,0.25)', //..Borda azul leve
  },
  // Coluna verde (Recebido)
  columnGreen: {
    borderColor: 'rgba(27,136,60,0.25)', //..Borda verde leve
  },
  // Coluna vermelha (Faltando)
  columnRed: {
    borderColor: 'rgba(239,68,68,0.25)', //..Borda vermelha leve
  },
  // Celula da linha
  cell: {
    height: 48, //...............Altura fixa para alinhamento
    paddingHorizontal: 6, //....Espaco lateral
    alignItems: 'center', //.....Centraliza
    justifyContent: 'center', //..Centraliza vertical
    borderBottomWidth: 1, //....Borda inferior
    borderBottomColor: 'rgba(0,0,0,0.06)', //..Borda sutil
  },
  // Zebra azul
  cellEvenBlue: {
    backgroundColor: 'rgba(23,119,207,0.04)', //..Tint azul
  },
  // Zebra verde
  cellEvenGreen: {
    backgroundColor: 'rgba(27,136,60,0.04)', //..Tint verde
  },
  // Zebra vermelha
  cellEvenRed: {
    backgroundColor: 'rgba(239,68,68,0.04)', //..Tint vermelho
  },
  // Valor na celula
  cellValue: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
  },
  // Dia na celula (acima do valor)
  cellDay: {
    fontSize: 10, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte media
    color: '#5A6070', //...........Cinza escuro visivel
    marginBottom: 1, //............Espaco inferior
  },
  // Traco vazio base
  cellDash: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    letterSpacing: 2, //...........Espaco entre caracteres
  },
  // Traco verde para coluna recebido
  cellDashGreen: {
    color: 'rgba(27,136,60,0.3)', //..Verde com transparencia
  },
  // Traco vermelho para coluna faltando
  cellDashRed: {
    color: 'rgba(239,68,68,0.3)', //..Vermelho com transparencia
  },
});

// Export padrao
export default ReconciliationScreen;
