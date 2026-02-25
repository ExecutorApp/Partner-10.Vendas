// React e React Native
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Image } from 'react-native';

// Bibliotecas externas
import Svg, { Path, Circle } from 'react-native-svg';

// Tipos e dados
import { Transaction, InstallmentDetail, getClientInstallments, formatCurrency } from './03.WalletData';
import { FullInstallment } from './18.AnticipateData';

// Componentes
import InstallmentReceiptModal from './24.InstallmentReceiptModal';

// Placeholder de avatar do cliente
const DEFAULT_AVATAR = require('../../../assets/AvatarPlaceholder02.png');

// Interface do componente
interface WalletClientPaymentModalProps {
  visible: boolean; //.........Visibilidade do modal
  transaction: Transaction | null; //..Transacao selecionada
  onClose: () => void; //......Callback de fechar
}

// Icone de check circular verde (parcela paga)
const PaidIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#22C55E" />
    <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de relogio circular amarelo (parcela pendente)
const PendingIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#F59E0B" />
    <Path d="M12 7V12L15 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de alerta circular vermelho (parcela atrasada)
const OverdueIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill="#EF4444" />
    <Path d="M12 8V12M12 16H12.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Retorna o icone adequado para o status da parcela
const getStatusIcon = (status: InstallmentDetail['status']) => {
  if (status === 'paid') return <PaidIcon />; //..Check verde
  if (status === 'overdue') return <OverdueIcon />; //..Alerta vermelho
  return <PendingIcon />; //..Relogio amarelo
};

// Formata data da parcela para DD/MM/YYYY
const formatInstallmentDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T12:00:00'); //..Cria objeto de data
  const dd = String(d.getDate()).padStart(2, '0'); //..Dia com zero
  const mm = String(d.getMonth() + 1).padStart(2, '0'); //..Mes com zero
  const yyyy = d.getFullYear(); //..Ano completo
  return `${dd}/${mm}/${yyyy}`; //..Formato brasileiro
};

// Modal de pagamentos do cliente
// Bottom sheet com lista de parcelas pagas e pendentes
const WalletClientPaymentModal: React.FC<WalletClientPaymentModalProps> = ({ visible, transaction, onClose }) => {
  // Estado do modal de comprovante
  const [receiptData, setReceiptData] = useState<FullInstallment | null>(null); //..Parcela do comprovante

  // Handler de abrir comprovante de parcela paga
  const handleOpenReceipt = useCallback((inst: InstallmentDetail) => {
    if (inst.status !== 'paid' || !transaction) return; //..Somente parcelas pagas
    const converted: FullInstallment = {
      installment: inst.number, //..........Numero da parcela
      totalInstallments: inst.total, //.....Total de parcelas
      productName: transaction.productName, //..Nome do produto
      amount: inst.value, //................Valor da parcela
      dueDate: inst.date, //................Data da parcela
      status: 'paid', //....................Status pago
    };
    setReceiptData(converted); //..Abre comprovante
  }, [transaction]);

  // Handler de fechar comprovante
  const handleCloseReceipt = useCallback(() => {
    setReceiptData(null); //..Fecha comprovante
  }, []);

  if (!transaction) return null; //..Retorna nulo se nao ha transacao

  // Gera lista de todas as parcelas
  const installments = getClientInstallments(transaction); //..Lista completa de parcelas

  // Calcula totais por status
  const paidInstallments = installments.filter(i => i.status === 'paid'); //..Parcelas pagas
  const unpaidInstallments = installments.filter(i => i.status !== 'paid'); //..Parcelas nao pagas
  const totalPaid = paidInstallments.reduce((sum, i) => sum + i.value, 0); //..Valor total pago
  const totalPending = unpaidInstallments.reduce((sum, i) => sum + i.value, 0); //..Valor total pendente

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>

          {/* Handle bar visual de arraste */}
          <View style={styles.handleBar} />

          {/* Header do cliente: avatar, nome e produto */}
          <View style={styles.clientHeader}>
            <Image
              source={transaction.clientPhoto ? { uri: transaction.clientPhoto } : DEFAULT_AVATAR}
              style={styles.clientAvatar}
              resizeMode="cover"
            />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{transaction.clientName}</Text>
              <Text style={styles.productName}>{transaction.productName}</Text>
            </View>
          </View>

          {/* Divisor horizontal */}
          <View style={styles.divider} />

          {/* Titulo da secao de parcelas */}
          <Text style={styles.sectionTitle}>Parcelas ({paidInstallments.length}/{installments.length} pagas)</Text>

          {/* Lista rolavel de parcelas */}
          <ScrollView style={styles.installmentList} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
            {installments.map((inst) => (
              <TouchableOpacity
                key={inst.number}
                style={styles.installmentRow}
                onPress={() => handleOpenReceipt(inst)}
                activeOpacity={inst.status === 'paid' ? 0.7 : 1}
                disabled={inst.status !== 'paid'}
              >
                {/* Icone de status da parcela */}
                {getStatusIcon(inst.status)}

                {/* Info da parcela */}
                <View style={styles.installmentInfo}>
                  <Text style={styles.installmentLabel}>Parcela {inst.number}/{inst.total}</Text>
                  <Text style={styles.installmentDate}>{formatInstallmentDate(inst.date)}</Text>
                </View>

                {/* Valor da parcela */}
                <Text style={[styles.installmentValue, inst.status === 'paid' && styles.installmentValuePaid]}>
                  {formatCurrency(inst.value)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divisor horizontal */}
          <View style={styles.divider} />

          {/* Resumo de valores */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Recebido</Text>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>{formatCurrency(totalPaid)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>A Receber</Text>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{formatCurrency(totalPending)}</Text>
            </View>
          </View>

          {/* Botao de fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>

      {/* Modal de comprovante da parcela paga */}
      <InstallmentReceiptModal
        visible={receiptData !== null}
        onClose={handleCloseReceipt}
        installment={receiptData}
        clientName={transaction.clientName}
      />
    </Modal>
  );
};

// Estilos do modal de pagamentos
const styles = StyleSheet.create({
  // Overlay escuro do modal
  modalOverlay: {
    flex: 1, //...............Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'flex-end', //..........Alinha embaixo
  },
  // Conteudo do bottom sheet
  modalContent: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderTopLeftRadius: 20, //....Arredondamento superior esquerdo
    borderTopRightRadius: 20, //...Arredondamento superior direito
    paddingHorizontal: 24, //......Espaco lateral
    paddingTop: 12, //............Espaco superior
    paddingBottom: 32, //.........Espaco inferior generoso
    maxHeight: '75%', //..........Limita altura maxima
  },
  // Handle bar de arraste no topo
  handleBar: {
    width: 40, //..............Largura da barra
    height: 4, //.............Altura da barra
    backgroundColor: '#D8E0F0', //..Cor cinza
    borderRadius: 2, //........Arredondamento
    alignSelf: 'center', //....Centraliza horizontal
    marginBottom: 16, //.......Espaco inferior
  },
  // Header com avatar e info do cliente
  clientHeader: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 14, //...............Espaco entre avatar e info
    marginBottom: 16, //......Espaco inferior
  },
  // Avatar do cliente
  clientAvatar: {
    width: 48, //.............Largura da foto
    height: 48, //............Altura da foto
    borderRadius: 10, //......Cantos arredondados
    backgroundColor: '#F4F4F4', //..Cor fallback
  },
  // Info do cliente (nome e produto)
  clientInfo: {
    flex: 1, //..Ocupa espaco disponivel
    gap: 3, //...Espaco entre nome e produto
  },
  // Nome do cliente
  clientName: {
    fontSize: 16, //.................Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //..............Cor do texto
  },
  // Nome do produto
  productName: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#7D8592', //...........Cor secundaria
  },
  // Divisor horizontal
  divider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
    marginVertical: 12, //................Espaco vertical
  },
  // Titulo da secao de parcelas
  sectionTitle: {
    fontSize: 14, //.................Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //..............Cor do texto
    marginBottom: 8, //...............Espaco inferior
  },
  // Lista de parcelas com scroll
  installmentList: {
    maxHeight: 280, //..Altura maxima da lista
  },
  // Linha individual de parcela
  installmentRow: {
    flexDirection: 'row', //..........Layout horizontal
    alignItems: 'center', //..........Alinha vertical
    paddingVertical: 10, //...........Espaco vertical
    gap: 12, //......................Espaco entre elementos
    borderBottomWidth: StyleSheet.hairlineWidth, //..Separador inferior
    borderBottomColor: '#F0F0F5', //..Cor do separador
  },
  // Info da parcela (label e data)
  installmentInfo: {
    flex: 1, //..Ocupa espaco disponivel
    gap: 2, //...Espaco entre label e data
  },
  // Label da parcela
  installmentLabel: {
    fontSize: 14, //.................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //..............Cor do texto
  },
  // Data da parcela
  installmentDate: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //...........Cor terciaria
  },
  // Valor da parcela
  installmentValue: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
  },
  // Valor da parcela paga (destaque verde)
  installmentValuePaid: {
    color: '#22C55E', //..Cor verde para pago
  },
  // Secao de resumo de valores
  summarySection: {
    gap: 8, //..Espaco entre linhas do resumo
  },
  // Linha do resumo
  summaryRow: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre label e valor
    alignItems: 'center', //..........Alinha vertical
  },
  // Label do resumo
  summaryLabel: {
    fontSize: 14, //.................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#7D8592', //..............Cor secundaria
  },
  // Valor do resumo
  summaryValue: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
  },
  // Botao de fechar
  closeButton: {
    backgroundColor: '#1777CF', //..Cor accent
    borderRadius: 12, //............Arredondamento
    paddingVertical: 14, //.........Espaco vertical
    alignItems: 'center', //........Centraliza texto
    marginTop: 16, //...............Espaco superior
  },
  // Texto do botao de fechar
  closeButtonText: {
    fontSize: 15, //.................Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FFFFFF', //..............Cor branca
  },
});

// Export padrao
export default WalletClientPaymentModal;
