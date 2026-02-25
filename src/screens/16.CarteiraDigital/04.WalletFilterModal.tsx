// React e React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Tipos e dados
import { DateFilter, DATE_FILTER_LABELS, PRODUCT_LIST, formatShortDate } from './03.WalletData';

// Interface do componente
interface WalletFilterModalProps {
  visible: boolean; //.............Visibilidade do modal
  onClose: () => void; //..........Callback de fechar
  dateFilter: DateFilter; //........Filtro ativo
  onFilterSelect: (filter: DateFilter) => void; //..Callback filtro rapido
  customStartDate: Date | null; //..Data inicio selecionada
  customEndDate: Date | null; //....Data fim selecionada
  onStartDatePress: () => void; //..Callback botao inicio
  onEndDatePress: () => void; //....Callback botao fim
  onApplyCustom: () => void; //.....Callback aplicar periodo
  isApplyDisabled: boolean; //......Botao aplicar desabilitado
  selectedProduct: string; //......Produto selecionado
  onProductSelect: (product: string) => void; //..Callback selecao de produto
}

// Icone de fechar modal
const CloseIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6L18 18" stroke="#3A3F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de seta para baixo (dropdown fechado)
const ChevronDownIcon = ({ color = '#3A3F51' }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Icone de check (item selecionado)
const CheckIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke="#1777CF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Componente do modal de filtro de data
const WalletFilterModal: React.FC<WalletFilterModalProps> = ({ visible, onClose, dateFilter, onFilterSelect, customStartDate, customEndDate, onStartDatePress, onEndDatePress, onApplyCustom, isApplyDisabled, selectedProduct, onProductSelect }) => {
  // Estado do dropdown de produtos
  const [dropdownOpen, setDropdownOpen] = useState(false); //..Controle do dropdown

  // Reseta dropdown ao abrir o modal
  useEffect(() => {
    if (visible) setDropdownOpen(false); //..Fecha dropdown ao abrir modal
  }, [visible]);

  // Label do produto selecionado
  const productLabel = selectedProduct === 'all' ? 'Todos os produtos' : selectedProduct; //..Texto visivel no dropdown

  // Handler de selecao de produto
  const handleProductSelect = (product: string) => {
    onProductSelect(product); //..Notifica o pai
    setDropdownOpen(false); //....Fecha o dropdown
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>

          {/* Header do modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por período</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Dropdown de produtos */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonOpen]} onPress={() => setDropdownOpen(!dropdownOpen)} activeOpacity={0.7}>
              <Text style={[styles.dropdownButtonText, selectedProduct !== 'all' && styles.dropdownButtonTextActive]}>{productLabel}</Text>
              <ChevronDownIcon color={dropdownOpen ? '#1777CF' : '#3A3F51'} />
            </TouchableOpacity>

            {/* Lista expandida do dropdown */}
            {dropdownOpen && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {/* Opcao: Todos os produtos */}
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleProductSelect('all')} activeOpacity={0.7}>
                  <Text style={[styles.dropdownItemText, selectedProduct === 'all' && styles.dropdownItemTextActive]}>Todos os produtos</Text>
                  {selectedProduct === 'all' && <CheckIcon />}
                </TouchableOpacity>

                {/* Opcoes: Produtos individuais */}
                {PRODUCT_LIST.map((product) => (
                  <TouchableOpacity key={product} style={styles.dropdownItem} onPress={() => handleProductSelect(product)} activeOpacity={0.7}>
                    <Text style={[styles.dropdownItemText, selectedProduct === product && styles.dropdownItemTextActive]}>{product}</Text>
                    {selectedProduct === product && <CheckIcon />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Separador apos dropdown */}
          <View style={styles.modalDivider} />

          {/* Opcoes rapidas de filtro */}
          {(['all', 'today', 'week', 'month'] as DateFilter[]).map((filter, index) => (
            <React.Fragment key={filter}>
              <TouchableOpacity style={[styles.filterOption, dateFilter === filter && styles.filterOptionActive]} onPress={() => onFilterSelect(filter)}>
                <Text style={[styles.filterOptionText, dateFilter === filter && styles.filterOptionTextActive]}>
                  {DATE_FILTER_LABELS[filter]}
                </Text>
                {dateFilter === filter && <CheckIcon />}
              </TouchableOpacity>
              {index < 3 && <View style={styles.filterDivider} />}
            </React.Fragment>
          ))}

          {/* Separador */}
          <View style={styles.modalDivider} />

          {/* Periodo personalizado com botoes de selecao de data */}
          <Text style={styles.customLabel}>Período personalizado</Text>
          <View style={styles.customDateRow}>
            <TouchableOpacity style={styles.customDateButton} onPress={onStartDatePress} activeOpacity={0.7}>
              <Text style={styles.customDateLabel}>Início</Text>
              <Text style={[styles.customDateValue, !customStartDate && styles.customDatePlaceholder]}>
                {customStartDate ? formatShortDate(customStartDate) : 'Selecionar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customDateButton} onPress={onEndDatePress} activeOpacity={0.7}>
              <Text style={styles.customDateLabel}>Fim</Text>
              <Text style={[styles.customDateValue, !customEndDate && styles.customDatePlaceholder]}>
                {customEndDate ? formatShortDate(customEndDate) : 'Selecionar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botao aplicar filtro */}
          <TouchableOpacity style={styles.applyButton} onPress={onApplyCustom} activeOpacity={0.7}>
            <Text style={styles.applyButtonText}>Aplicar filtro</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Estilos do modal de filtro
const styles = StyleSheet.create({
  // Overlay escuro do modal
  modalOverlay: {
    flex: 1, //...............Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.4)', //..Fundo escuro
    justifyContent: 'flex-end', //..Alinha embaixo
  },
  // Conteudo do modal bottom sheet
  modalContent: {
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderTopLeftRadius: 20, //....Arredondamento superior esquerdo
    borderTopRightRadius: 20, //...Arredondamento superior direito
    padding: 24, //................Espaco interno
    gap: 4, //.....................Espaco entre elementos
  },
  // Header com titulo e fechar
  modalHeader: {
    flexDirection: 'row', //......Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //......Alinha vertical
    marginBottom: 12, //..........Espaco inferior
  },
  // Titulo do modal
  modalTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginLeft: 5, //...............Respiro esquerdo
  },
  // Container do dropdown de produtos
  dropdownContainer: {
    position: 'relative', //..Referencia para lista absoluta
    zIndex: 10, //............Garante sobreposicao
    marginBottom: 4, //......Espaco inferior
  },
  // Botao do dropdown (fechado)
  dropdownButton: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    borderWidth: 1, //................Borda
    borderColor: '#D8E0F0', //........Cor da borda
    borderRadius: 10, //..............Arredondamento
    paddingHorizontal: 14, //.........Espaco lateral
    paddingVertical: 12, //...........Espaco vertical
  },
  // Botao do dropdown (aberto)
  dropdownButtonOpen: {
    borderColor: '#1777CF', //..............Borda azul
    borderBottomLeftRadius: 0, //..........Remove arredondamento inferior esquerdo
    borderBottomRightRadius: 0, //.........Remove arredondamento inferior direito
  },
  // Texto do botao do dropdown
  dropdownButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },
  // Texto do dropdown com produto ativo
  dropdownButtonTextActive: {
    color: '#1777CF', //..............Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Lista expandida do dropdown (flutuante sobre o conteudo)
  dropdownList: {
    position: 'absolute', //..........Flutua sobre o conteudo abaixo
    top: '100%', //....................Posiciona logo abaixo do botao
    left: 0, //........................Ancora a esquerda
    right: 0, //.......................Ancora a direita
    zIndex: 20, //.....................Garante sobreposicao
    maxHeight: 200, //.................Altura maxima com scroll
    borderWidth: 1, //................Borda
    borderTopWidth: 0, //.............Remove borda superior
    borderColor: '#1777CF', //........Cor azul
    borderBottomLeftRadius: 10, //....Arredondamento inferior esquerdo
    borderBottomRightRadius: 10, //...Arredondamento inferior direito
    backgroundColor: '#FCFCFC', //....Fundo branco
  },
  // Item individual do dropdown
  dropdownItem: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    paddingHorizontal: 14, //.........Espaco lateral
    paddingVertical: 11, //...........Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Separador superior
    borderTopColor: '#F0F0F5', //......Cor do separador
  },
  // Texto do item do dropdown
  dropdownItemText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#3A3F51', //............Cor do texto
  },
  // Texto do item ativo
  dropdownItemTextActive: {
    color: '#1777CF', //..............Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Opcao de filtro rapido
  filterOption: {
    flexDirection: 'row', //......Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //......Alinha vertical
    paddingVertical: 12, //.......Espaco vertical
    paddingHorizontal: 4, //......Espaco lateral
  },
  // Opcao de filtro ativa
  filterOptionActive: {
    backgroundColor: '#F0F7FF', //..Fundo azul sutil
    borderRadius: 8, //............Arredondamento
    paddingHorizontal: 8, //.......Espaco lateral
  },
  // Texto da opcao de filtro
  filterOptionText: {
    fontSize: 14, //...........Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //........Cor do texto
  },
  // Texto da opcao ativa
  filterOptionTextActive: {
    color: '#1777CF', //..Cor accent
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Divisor entre opcoes de filtro
  filterDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
    marginHorizontal: 4, //...............Margem lateral
  },
  // Divisor visual principal
  modalDivider: {
    height: 1, //..............Altura do divisor
    backgroundColor: '#D8E0F0', //..Cor do divisor
    marginVertical: 12, //.....Espaco vertical
  },
  // Label do periodo personalizado
  customLabel: {
    fontSize: 13, //...........Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //........Cor do texto
    marginBottom: 8, //........Espaco inferior
    marginLeft: 5, //..........Respiro esquerdo
  },
  // Linha dos botoes de data
  customDateRow: {
    flexDirection: 'row', //..Layout horizontal
    gap: 12, //...............Espaco entre botoes
  },
  // Botao de selecao de data
  customDateButton: {
    flex: 1, //..............Ocupa metade
    borderWidth: StyleSheet.hairlineWidth, //..Borda ultrafina
    borderColor: '#D8E0F0', //..Cor cinza padrao do sistema
    borderRadius: 8, //........Arredondamento
    paddingHorizontal: 12, //..Espaco lateral
    paddingVertical: 10, //....Espaco vertical
    alignItems: 'center', //...Centraliza horizontal
    gap: 2, //..................Espaco entre label e valor
  },
  // Label do botao de data (Inicio/Fim)
  customDateLabel: {
    fontSize: 11, //...........Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#1777CF', //........Cor azul padrao do sistema
  },
  // Valor do botao de data
  customDateValue: {
    fontSize: 14, //...........Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //........Cor do texto
  },
  // Placeholder do botao de data sem selecao
  customDatePlaceholder: {
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //..............Cor placeholder
  },
  // Botao aplicar periodo
  applyButton: {
    backgroundColor: '#1777CF', //..Cor accent
    borderRadius: 10, //...........Arredondamento
    paddingVertical: 12, //........Espaco vertical
    alignItems: 'center', //.......Centraliza
    marginTop: 12, //..............Espaco superior
  },
  // Botao aplicar desabilitado
  applyButtonDisabled: {
    backgroundColor: '#D8E0F0', //..Cor desabilitada
  },
  // Texto do botao aplicar
  applyButtonText: {
    fontSize: 14, //...........Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //........Cor branca
  },
});

// Export padrao
export default WalletFilterModal;
