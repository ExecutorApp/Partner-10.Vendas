// React e React Native
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, StyleSheet } from 'react-native';

// Bibliotecas externas
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

// Tipos e dados
import { Receivable, FullInstallment, InstallmentStatus, formatCurrency, groupReceivablesByProduct, generateProductInstallments } from './18.AnticipateData';

// Componentes
import { CheckCircleIcon, EmptyCircleIcon, ChevronDownIcon } from './08.WalletMenuIcons';
import InstallmentReceiptModal from './24.InstallmentReceiptModal';

// Placeholder de avatar do cliente
const DEFAULT_AVATAR = require('../../../assets/AvatarPlaceholder02.png');

// Interface do componente (somente consulta, sem selecao)
interface AnticipateClientModalProps {
  visible: boolean; //..............Visibilidade do modal
  onClose: () => void; //...........Callback de fechar
  clientName: string; //............Nome do cliente
  clientPhoto?: string; //..........Uri da foto do cliente
  receivables: Receivable[]; //....Recebiveis do cliente
}

// Cores por status da parcela
const STATUS_COLORS: Record<InstallmentStatus, string> = {
  paid: '#1B883C', //....Verde padrao do sistema
  pending: '#3A3F51', //..Cinza escuro para a vencer
  overdue: '#E53935', //..Vermelho para atrasada
};

// Formata numero com minimo de 2 digitos
const pad2 = (n: number): string => String(n).padStart(2, '0'); //..Minimo 2 digitos

// Modal de consulta de parcelas do cliente
// Exibe TODAS as parcelas do produto com status (paga, a vencer, atrasada)
const AnticipateClientModal: React.FC<AnticipateClientModalProps> = ({
  visible, onClose, clientName, clientPhoto, receivables,
}) => {
  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Produto selecionado no dropdown (null = primeiro da lista)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null); //..Produto ativo
  const [dropdownOpen, setDropdownOpen] = useState(false); //..Estado do dropdown

  // Estado do modal de comprovante
  const [receiptInstallment, setReceiptInstallment] = useState<FullInstallment | null>(null); //..Parcela do comprovante

  // Gera todas as parcelas agrupadas por produto
  const productGroups = useMemo(() => {
    const grouped = groupReceivablesByProduct(receivables); //..Agrupa por produto
    const result: { productName: string; installments: FullInstallment[] }[] = [];
    grouped.forEach((productReceivables, productName) => {
      result.push({ productName, installments: generateProductInstallments(productReceivables) }); //..Gera todas
    });
    return result; //..Retorna grupos
  }, [receivables]);

  // Lista de nomes de produtos disponiveis
  const productNames = useMemo(() => productGroups.map(g => g.productName), [productGroups]); //..Nomes

  // Produto atualmente selecionado (fallback para o primeiro)
  const activeProduct = selectedProduct || productNames[0] || ''; //..Produto ativo

  // Grupo filtrado pelo produto selecionado
  const activeGroup = useMemo(() => {
    return productGroups.find(g => g.productName === activeProduct); //..Busca grupo
  }, [productGroups, activeProduct]);

  // Parcelas do produto ativo
  const activeInstallments = activeGroup?.installments || []; //..Parcelas filtradas

  // Contagens por status do produto ativo
  const totalCount = activeInstallments.length; //..Total de parcelas
  const paidCount = activeInstallments.filter(i => i.status === 'paid').length; //..Pagas
  const pendingCount = activeInstallments.filter(i => i.status === 'pending').length; //..A vencer
  const overdueCount = activeInstallments.filter(i => i.status === 'overdue').length; //..Atrasadas

  // Handler de abrir comprovante de parcela paga
  const handleOpenReceipt = useCallback((item: FullInstallment) => {
    if (item.status === 'paid') setReceiptInstallment(item); //..Abre comprovante
  }, []);

  // Handler de fechar comprovante
  const handleCloseReceipt = useCallback(() => {
    setReceiptInstallment(null); //..Fecha comprovante
  }, []);

  // Aguarda fontes (apos todos os hooks)
  if (!fontsLoaded) return null;

  // Renderiza icone de status da parcela
  const renderStatusIcon = (status: InstallmentStatus) => {
    if (status === 'paid') return <CheckCircleIcon color="#1B883C" />; //..Check verde
    if (status === 'overdue') return <EmptyCircleIcon color="#E53935" />; //..Circulo vermelho
    return <EmptyCircleIcon color="#3A3F51" />; //..Circulo cinza escuro
  };

  // Formata data da parcela no formato DD/MM/AA
  const getStatusText = (item: FullInstallment): string => {
    const [year, month, day] = item.dueDate.split('-'); //..Separa componentes
    return `${day}/${month}/${year.slice(2)}`; //..Formato DD/MM/AA
  };

  // Handler de selecionar produto no dropdown
  const handleSelectProduct = (name: string) => {
    setSelectedProduct(name); //..Atualiza produto
    setDropdownOpen(false); //....Fecha dropdown
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* Card central do modal (fullscreen com 10px de margem) */}
        <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={() => setDropdownOpen(false)}>

          {/* Botao fechar (X) no canto superior direito */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {/* Cabecalho do cliente */}
          <View style={styles.clientHeader}>
            <Image source={clientPhoto ? { uri: clientPhoto } : DEFAULT_AVATAR} style={styles.clientAvatar} />
            <Text style={styles.clientName}>{clientName}</Text>
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
              <Text style={[styles.counterValue, styles.counterValuePaid]}>{pad2(paidCount)}</Text>
              <Text style={styles.counterLabel}>Pagas</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.counterSeparator} />

            {/* A vencer */}
            <View style={styles.counterItem}>
              <Text style={[styles.counterValue, styles.counterValuePending]}>{pad2(pendingCount)}</Text>
              <Text style={styles.counterLabel}>A vencer</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.counterSeparator} />

            {/* Vencidas */}
            <View style={styles.counterItem}>
              <Text style={[styles.counterValue, styles.counterValueOverdue]}>{pad2(overdueCount)}</Text>
              <Text style={styles.counterLabel}>Vencidas</Text>
            </View>
          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Dropdown de selecao de produto */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>{activeProduct}</Text>
              <ChevronDownIcon color="#7D8592" />
            </TouchableOpacity>

            {/* Lista de opcoes do dropdown */}
            {dropdownOpen && productNames.length > 1 && (
              <View style={styles.dropdownList}>
                {productNames.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.dropdownItem, name === activeProduct && styles.dropdownItemActive]}
                    onPress={() => handleSelectProduct(name)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, name === activeProduct && styles.dropdownItemTextActive]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Lista de parcelas com scroll (somente consulta) */}
          <ScrollView
            style={styles.parcelsScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {activeInstallments.map((item, index) => (
              <View key={`${item.productName}-${item.installment}`}>
                {/* Linha da parcela (clicavel se paga) */}
                <TouchableOpacity
                  style={styles.parcelRow}
                  onPress={() => handleOpenReceipt(item)}
                  activeOpacity={item.status === 'paid' ? 0.7 : 1}
                  disabled={item.status !== 'paid'}
                >
                  {/* Icone de status */}
                  <View style={styles.checkboxContainer}>
                    {renderStatusIcon(item.status)}
                  </View>

                  {/* Informacoes da parcela */}
                  <View style={styles.parcelInfo}>
                    <Text style={styles.parcelLabel}>
                      Parcela {item.installment}/{item.totalInstallments}
                    </Text>
                    <Text style={[styles.parcelDetail, item.status === 'overdue' && styles.parcelDetailOverdue]}>
                      {getStatusText(item)}
                    </Text>
                  </View>

                  {/* Valor com cor do status */}
                  <Text style={[styles.parcelAmount, { color: STATUS_COLORS[item.status] }]}>
                    {formatCurrency(item.amount)}
                  </Text>
                </TouchableOpacity>

                {/* Divisoria entre parcelas (exceto ultima) */}
                {index < activeInstallments.length - 1 && (
                  <View style={styles.parcelDivider} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Rodape com botao fechar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.doneButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>

      {/* Modal de comprovante da parcela paga */}
      <InstallmentReceiptModal
        visible={receiptInstallment !== null}
        onClose={handleCloseReceipt}
        installment={receiptInstallment}
        clientName={clientName}
      />
    </Modal>
  );
};

// Estilos do modal de consulta do cliente
const styles = StyleSheet.create({
  // Overlay escuro de fundo (10px de margem em todos os lados)
  overlay: {
    flex: 1, //.......................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.5)', //..Fundo escuro
    justifyContent: 'center', //.....Centraliza vertical
    alignItems: 'center', //.........Centraliza horizontal
    padding: 10, //..................Margem de 10px em todos os lados
  },
  // Card central do modal (ocupa todo o espaco disponivel)
  modalCard: {
    width: '100%', //..............Largura total do overlay
    flex: 1, //....................Ocupa toda a altura disponivel
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 16, //...........Arredondamento
    padding: 20, //................Espaco interno
    paddingBottom: 0, //...........Sem padding inferior (footer cuida)
  },
  // Botao fechar (X)
  closeButton: {
    position: 'absolute', //..Posicao absoluta
    top: 12, //.................Posicao superior
    right: 16, //...............Posicao direita
    zIndex: 10, //..............Acima do conteudo
    width: 32, //...............Largura fixa
    height: 32, //..............Altura fixa
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Texto do botao fechar
  closeButtonText: {
    fontSize: 24, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },

  // === Cabecalho do cliente ===

  // Container do cabecalho
  clientHeader: {
    alignItems: 'center', //..Centraliza horizontal
    paddingTop: 8, //..........Espaco superior
    paddingBottom: 12, //.....Espaco inferior
  },
  // Avatar do cliente (grande)
  clientAvatar: {
    width: 64, //..............Largura fixa
    height: 64, //.............Altura fixa
    borderRadius: 32, //......Circular
    backgroundColor: '#E8ECF2', //..Cor de fundo placeholder
    marginBottom: 12, //.......Espaco inferior
  },
  // Nome do cliente
  clientName: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
  },

  // === Container de contadores ===

  // Container horizontal dos 4 contadores
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
  // Valor do contador (pagas - verde)
  counterValuePaid: {
    color: '#1B883C', //..Verde padrao do sistema
  },
  // Valor do contador (a vencer - cinza escuro)
  counterValuePending: {
    color: '#3A3F51', //..Cinza escuro
  },
  // Valor do contador (vencidas - vermelho)
  counterValueOverdue: {
    color: '#E53935', //..Vermelho
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

  // === Divisor ===

  // Linha divisoria principal
  divider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
    marginBottom: 16, //..................Espaco inferior
  },

  // === Dropdown de produto ===

  // Wrapper do dropdown (posicao relativa para lista absoluta)
  dropdownWrapper: {
    marginBottom: 12, //..Espaco inferior
    zIndex: 20, //.........Acima do scroll
  },
  // Botao do dropdown (fundo branco)
  dropdownButton: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    justifyContent: 'space-between', //..Espaco entre
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 8, //............Arredondamento
    borderWidth: 1, //.............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    paddingHorizontal: 12, //....Espaco horizontal
    paddingVertical: 10, //.......Espaco vertical
  },
  // Texto do botao dropdown (peso normal)
  dropdownButtonText: {
    flex: 1, //.......................Ocupa espaco disponivel
    fontSize: 14, //..................Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium (peso normal)
    color: '#3A3F51', //..............Cor do texto
    marginRight: 8, //................Espaco antes do icone
  },
  // Lista de opcoes do dropdown
  dropdownList: {
    position: 'absolute', //..Posicao absoluta
    top: '100%', //............Abaixo do botao
    left: 0, //................Alinhado a esquerda
    right: 0, //...............Alinhado a direita
    marginTop: 4, //...........Espaco acima
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 8, //............Arredondamento
    borderWidth: 1, //.............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    overflow: 'hidden', //........Esconde overflow
    elevation: 4, //..............Sombra android
    shadowColor: '#000', //.......Cor da sombra ios
    shadowOffset: { width: 0, height: 2 }, //..Offset da sombra
    shadowOpacity: 0.15, //.......Opacidade da sombra
    shadowRadius: 6, //...........Raio da sombra
  },
  // Item do dropdown
  dropdownItem: {
    paddingHorizontal: 12, //..Espaco horizontal
    paddingVertical: 10, //....Espaco vertical
  },
  // Item ativo do dropdown
  dropdownItemActive: {
    backgroundColor: 'rgba(23,119,207,0.08)', //..Fundo azul sutil
  },
  // Texto do item do dropdown
  dropdownItemText: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Texto do item ativo
  dropdownItemTextActive: {
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#1777CF', //.............Cor azul accent
  },

  // === Lista de parcelas ===

  // Container do scroll de parcelas
  parcelsScroll: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Linha de parcela (todas ativas, sem opacidade)
  parcelRow: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    paddingVertical: 10, //........Espaco vertical
    gap: 10, //....................Espaco entre elementos
  },
  // Divisoria entre parcelas
  parcelDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
  },
  // Container do icone de status
  checkboxContainer: {
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
  // Detalhe da parcela (status + data)
  parcelDetail: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Detalhe de parcela atrasada
  parcelDetailOverdue: {
    color: '#E53935', //..Cor vermelha
  },
  // Valor da parcela
  parcelAmount: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
  },

  // === Rodape ===

  // Container do rodape
  footer: {
    paddingVertical: 16, //...........Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Linha superior
    borderTopColor: '#D8E0F0', //......Cor da linha
    marginTop: 8, //...................Espaco superior
  },
  // Botao fechar
  doneButton: {
    backgroundColor: '#1777CF', //..Cor accent
    borderRadius: 8, //............Arredondamento
    paddingVertical: 10, //.......Espaco vertical
    alignItems: 'center', //......Centraliza
  },
  // Texto do botao fechar
  doneButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
  },
});

// Export padrao
export default AnticipateClientModal;
