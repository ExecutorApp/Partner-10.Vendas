// Modal de detalhe do cliente na conciliacao
// Exibe todas as parcelas do cliente com contadores por status

// React e React Native
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path, Circle } from 'react-native-svg';

// Tipos e dados
import { ReconciliationOrder, InstallmentDisplayStatus, FullInstallment, formatCurrency, formatFullShortDate, generateAllInstallments } from './26.ReconciliationData';

// Placeholder de avatar do cliente
const DEFAULT_AVATAR = require('../../../assets/AvatarPlaceholder02.png');

// Interface do componente
interface ReconciliationDetailModalProps {
  visible: boolean; //....................Visibilidade do modal
  order: ReconciliationOrder | null; //..Pedido que abriu o modal
  allOrders: ReconciliationOrder[]; //...Lista completa para navegacao
  onClose: () => void; //................Callback de fechar
  onNavigate: (order: ReconciliationOrder) => void; //..Callback de navegacao
}

// Icone de check circular para pago
const CheckCircleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={9} stroke="#1B883C" strokeWidth={2} />
    <Path d="M6 10L9 13L14 7" stroke="#1B883C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de circulo vazio para pendente
const EmptyCircleIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={9} stroke={color} strokeWidth={2} />
  </Svg>
);

// Seta de navegacao esquerda slim
const NavArrowLeft = () => (
  <Svg width={10} height={16} viewBox="0 0 10 16" fill="none">
    <Path d="M8.5 1L1.5 8L8.5 15" stroke="#1777CF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Seta de navegacao direita slim
const NavArrowRight = () => (
  <Svg width={10} height={16} viewBox="0 0 10 16" fill="none">
    <Path d="M1.5 1L8.5 8L1.5 15" stroke="#1777CF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de alerta para faltante
const AlertCircleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={9} stroke="#EF4444" strokeWidth={2} />
    <Path d="M10 6V11" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" />
    <Circle cx={10} cy={14} r={1} fill="#EF4444" />
  </Svg>
);

// Formata numero com minimo de 2 digitos
const pad2 = (n: number): string => String(n).padStart(2, '0'); //..Minimo 2 digitos

// Modal de detalhe do cliente na conciliacao
const ReconciliationDetailModal: React.FC<ReconciliationDetailModalProps> = ({ visible, order, allOrders, onClose, onNavigate }) => {
  if (!order) return null; //..Sem pedido nao renderiza

  // Indice do pedido atual na lista para navegacao
  const currentIndex = useMemo(() => allOrders.findIndex(o => o.id === order.id), [order.id, allOrders]);
  const canGoPrev = currentIndex > 0; //............Pode ir para anterior
  const canGoNext = currentIndex < allOrders.length - 1; //..Pode ir para proximo

  // Todas as parcelas do plano (passadas, atual e futuras)
  const allInstallments = useMemo(() => generateAllInstallments(order), [order]);

  // Contadores por status
  const totalCount = allInstallments.length; //..Total de parcelas
  const paidCount = allInstallments.filter(o => o.status === 'paid').length; //..Pagas
  const pendingCount = allInstallments.filter(o => o.status === 'pending').length; //..Pendentes
  const missingCount = allInstallments.filter(o => o.status === 'missing').length; //..Faltantes

  // Renderiza icone por status
  const renderStatusIcon = (status: InstallmentDisplayStatus) => {
    if (status === 'paid') return <CheckCircleIcon />; //..Check verde
    if (status === 'missing') return <AlertCircleIcon />; //..Alerta vermelho
    return <EmptyCircleIcon color="#F59E0B" />; //..Circulo amarelo pendente
  };

  // Data formatada da parcela (DD/MM/AA)
  const getDateLabel = (item: FullInstallment): string => {
    return item.date ? formatFullShortDate(item.date) : ''; //..Data completa ou vazio
  };

  // Valor exibido por status
  const getDisplayValue = (item: FullInstallment): { text: string; color: string } => {
    if (item.status === 'paid') return { text: formatCurrency(item.commissionValue), color: '#1B883C' }; //..Verde
    if (item.status === 'pending') return { text: formatCurrency(item.commissionValue), color: '#F59E0B' }; //..Amarelo
    const missing = item.commissionValue - item.receivedAmount; //..Valor faltante
    return { text: formatCurrency(missing), color: '#EF4444' }; //..Vermelho
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* Card central do modal */}
        <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={() => {}}>

          {/* Botao fechar (X) no canto superior direito */}
          <TouchableOpacity style={styles.closeX} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeXText}>×</Text>
          </TouchableOpacity>

          {/* Cabecalho do cliente com setas de navegacao */}
          <View style={styles.clientHeader}>
            {/* Linha com setas e avatar */}
            <View style={styles.navRow}>
              <TouchableOpacity style={[styles.navArrow, !canGoPrev && styles.navArrowDisabled]} onPress={() => canGoPrev && onNavigate(allOrders[currentIndex - 1])} activeOpacity={0.7}>
                <NavArrowLeft />
              </TouchableOpacity>
              <Image source={order.clientPhoto ? { uri: order.clientPhoto } : DEFAULT_AVATAR} style={styles.clientAvatar} />
              <TouchableOpacity style={[styles.navArrow, !canGoNext && styles.navArrowDisabled]} onPress={() => canGoNext && onNavigate(allOrders[currentIndex + 1])} activeOpacity={0.7}>
                <NavArrowRight />
              </TouchableOpacity>
            </View>
            <Text style={styles.clientName}>{order.clientName}</Text>
            <Text style={styles.productInfo}>{order.productName}</Text>
          </View>

          {/* Container de contadores por status */}
          <View style={styles.countersContainer}>
            {/* Total */}
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{pad2(totalCount)}</Text>
              <Text style={styles.counterLabel}>Total</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.counterSeparator} />

            {/* Pagas */}
            <View style={styles.counterItem}>
              <Text style={[styles.counterValue, { color: '#1B883C' }]}>{pad2(paidCount)}</Text>
              <Text style={styles.counterLabel}>Pagas</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.counterSeparator} />

            {/* Pendentes */}
            <View style={styles.counterItem}>
              <Text style={[styles.counterValue, { color: '#F59E0B' }]}>{pad2(pendingCount)}</Text>
              <Text style={styles.counterLabel}>Pendentes</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.counterSeparator} />

            {/* Faltantes */}
            <View style={styles.counterItem}>
              <Text style={[styles.counterValue, { color: '#EF4444' }]}>{pad2(missingCount)}</Text>
              <Text style={styles.counterLabel}>Faltantes</Text>
            </View>
          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Lista de parcelas com scroll */}
          <ScrollView style={styles.parcelsScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
            {allInstallments.map((item, index) => {
              const displayValue = getDisplayValue(item); //..Valor e cor
              const isActive = item.isCurrent; //..............Parcela do mes atual
              return (
                <View key={`inst-${item.installment}`}>
                  {/* Linha da parcela */}
                  <View style={[styles.parcelRow, isActive && styles.parcelRowActive]}>
                    {/* Icone de status */}
                    <View style={styles.iconContainer}>
                      {renderStatusIcon(item.status)}
                    </View>

                    {/* Informacoes da parcela */}
                    <View style={styles.parcelInfo}>
                      <Text style={styles.parcelLabel}>Parcela {item.installment}/{item.totalInstallments}</Text>
                      <Text style={[styles.parcelDetail, item.status === 'missing' && styles.parcelDetailMissing]}>
                        {getDateLabel(item)}
                      </Text>
                    </View>

                    {/* Valor com cor do status */}
                    <Text style={[styles.parcelAmount, { color: displayValue.color }]}>{displayValue.text}</Text>
                  </View>

                  {/* Divisoria entre parcelas */}
                  {index < allInstallments.length - 1 && <View style={styles.parcelDivider} />}
                </View>
              );
            })}
          </ScrollView>

          {/* Rodape com botao fechar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Estilos do modal de detalhe
const styles = StyleSheet.create({
  // Overlay escuro de fundo
  overlay: {
    flex: 1, //.......................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.5)', //..Fundo escuro
    justifyContent: 'center', //.....Centraliza vertical
    alignItems: 'center', //.........Centraliza horizontal
    padding: 10, //..................Margem de 10px
  },
  // Card central do modal
  modalCard: {
    width: '100%', //..............Largura total
    flex: 1, //....................Ocupa altura disponivel
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 16, //...........Arredondamento
    padding: 20, //................Espaco interno
    paddingBottom: 0, //...........Footer cuida do padding
  },
  // Botao fechar (X)
  closeX: {
    position: 'absolute', //..Posicao absoluta
    top: 12, //.................Posicao superior
    right: 16, //...............Posicao direita
    zIndex: 10, //..............Acima do conteudo
    width: 32, //...............Largura fixa
    height: 32, //..............Altura fixa
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Texto do botao fechar (X)
  closeXText: {
    fontSize: 24, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Container do cabecalho do cliente
  clientHeader: {
    alignItems: 'center', //..Centraliza horizontal
    paddingTop: 8, //..........Espaco superior
    paddingBottom: 12, //.....Espaco inferior
  },
  // Linha com setas e avatar
  navRow: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    justifyContent: 'center', //..Centraliza horizontal
    gap: 20, //...................Espaco entre elementos
    marginBottom: 12, //..........Espaco inferior
  },
  // Botao de seta de navegacao
  navArrow: {
    width: 36, //................Largura fixa
    height: 36, //...............Altura fixa
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Seta desabilitada
  navArrowDisabled: {
    opacity: 0.25, //..Opacidade reduzida
  },
  // Avatar do cliente
  clientAvatar: {
    width: 64, //..............Largura fixa
    height: 64, //.............Altura fixa
    borderRadius: 32, //......Circular
    backgroundColor: '#E8ECF2', //..Cor de fundo placeholder
  },
  // Nome do cliente
  clientName: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
  },
  // Produto do cliente
  productInfo: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginTop: 2, //...............Espaco superior
  },
  // Container dos contadores
  countersContainer: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Alinha vertical
    justifyContent: 'center', //......Centraliza horizontal
    backgroundColor: '#F5F6FA', //....Fundo cinza claro
    borderRadius: 10, //..............Arredondamento
    paddingVertical: 10, //...........Espaco vertical
    paddingHorizontal: 8, //.........Espaco horizontal
    marginBottom: 16, //..............Espaco inferior
  },
  // Item individual do contador
  counterItem: {
    flex: 1, //..............Largura igual entre itens
    alignItems: 'center', //..Centraliza horizontal
  },
  // Valor numerico do contador
  counterValue: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor padrao
    marginBottom: 2, //............Espaco inferior
  },
  // Label do contador
  counterLabel: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Separador vertical entre contadores
  counterSeparator: {
    width: StyleSheet.hairlineWidth, //..Largura ultrafina
    height: 28, //.......................Altura do separador
    backgroundColor: '#D8E0F0', //......Cor da divisoria
  },
  // Divisor horizontal
  divider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
    marginBottom: 8, //..................Espaco inferior
  },
  // Container do scroll de parcelas
  parcelsScroll: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Linha da parcela
  parcelRow: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    paddingVertical: 10, //........Espaco vertical
    paddingHorizontal: 4, //......Espaco lateral
    gap: 10, //....................Espaco entre elementos
    borderRadius: 8, //............Arredondamento
  },
  // Linha da parcela ativa (a que o usuario clicou)
  parcelRowActive: {
    backgroundColor: 'rgba(23,119,207,0.06)', //..Fundo azul sutil
  },
  // Divisoria entre parcelas
  parcelDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
  },
  // Container do icone de status
  iconContainer: {
    width: 20, //...Largura fixa
    height: 20, //..Altura fixa
  },
  // Informacoes da parcela
  parcelInfo: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Label da parcela (numero)
  parcelLabel: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 1, //............Espaco inferior
  },
  // Detalhe da parcela (status + dia)
  parcelDetail: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Detalhe de parcela faltante
  parcelDetailMissing: {
    color: '#EF4444', //..Cor vermelha
  },
  // Valor da parcela
  parcelAmount: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
  },
  // Container do rodape
  footer: {
    paddingVertical: 16, //...........Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Linha superior
    borderTopColor: '#D8E0F0', //......Cor da linha
    marginTop: 8, //...................Espaco superior
  },
  // Botao fechar azul
  closeButton: {
    backgroundColor: '#1777CF', //..Fundo azul accent
    borderRadius: 8, //............Arredondamento
    paddingVertical: 12, //.......Espaco vertical
    alignItems: 'center', //......Centraliza
  },
  // Texto do botao fechar
  closeButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
  },
});

// Export padrao
export default ReconciliationDetailModal;
