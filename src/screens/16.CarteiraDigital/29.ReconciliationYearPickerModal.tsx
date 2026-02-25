// Modal seletor de ano para tela de Conciliacao
// Exibe grid de anos de 2000 ate o ano atual

// React e React Native
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Interface do componente
interface ReconciliationYearPickerProps {
  visible: boolean; //..........Visibilidade do modal
  onClose: () => void; //......Callback de fechar
  onSelect: (year: number) => void; //..Callback de selecao
  selectedYear: number; //......Ano atualmente selecionado
}

// Lista fixa de anos disponiveis (2000 ate ano atual)
const YEAR_LIST = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => 2000 + i);

// Icone de fechar o modal
const CloseIcon = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51" />
  </Svg>
);

// Componente principal do seletor de ano
const ReconciliationYearPickerModal: React.FC<ReconciliationYearPickerProps> = ({ visible, onClose, onSelect, selectedYear }) => {
  // Referencia do ScrollView para scroll automatico
  const scrollRef = useRef<ScrollView>(null); //..Ref do scroll

  // Ano atual para destaque
  const currentYear = new Date().getFullYear(); //..Ano corrente

  // Scroll automatico para o ano selecionado ao abrir
  useEffect(() => {
    if (visible && scrollRef.current) {
      const yearIndex = selectedYear - 2000; //..Indice do ano na lista
      const row = Math.floor(yearIndex / 3); //...Linha do ano no grid
      const scrollY = Math.max(0, row * 52 - 80); //..Posicao com offset
      setTimeout(() => scrollRef.current?.scrollTo({ y: scrollY, animated: false }), 50);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <View style={styles.overlay} />

      {/* Wrapper centralizado */}
      <View style={styles.modalWrapper}>
        <View style={styles.modalCard}>
          {/* Header do modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Selecionar ano</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Grid de anos */}
          <ScrollView ref={scrollRef} style={styles.yearsScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.yearsScrollContent}>
            <View style={styles.yearsGrid}>
              {YEAR_LIST.map((y) => {
                const isCurrent = y === currentYear; //..Ano atual
                const isSelected = y === selectedYear; //..Ano selecionado
                return (
                  <TouchableOpacity key={y} style={[styles.yearCell, isSelected && styles.yearCellSelected]} onPress={() => onSelect(y)} activeOpacity={0.7}>
                    <Text style={[styles.yearCellText, isSelected && styles.yearCellTextSelected]}>{y}</Text>
                    {isCurrent && <View style={styles.currentDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Estilos do modal de selecao de ano
const styles = StyleSheet.create({
  // Overlay escuro de fundo
  overlay: {
    flex: 1, //......................Ocupa tela
    backgroundColor: 'rgba(0,0,0,0.3)', //..Fundo escuro
  },
  // Wrapper centralizado na tela
  modalWrapper: {
    position: 'absolute', //..Posicao absoluta
    left: 0, //.................Ancora esquerda
    right: 0, //................Ancora direita
    top: 0, //..................Ancora topo
    bottom: 0, //...............Ancora base
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
  },
  // Card do modal centralizado
  modalCard: {
    width: 340, //..............Largura fixa
    height: 400, //.............Altura fixa
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //........Bordas arredondadas
    overflow: 'hidden', //......Esconde overflow
  },
  // Header com titulo e fechar
  header: {
    flexDirection: 'row', //........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //........Centraliza vertical
    paddingHorizontal: 16, //......Margem horizontal
    paddingVertical: 14, //........Margem vertical
    borderBottomWidth: 1, //........Borda inferior
    borderBottomColor: '#D8E0F0', //..Cor da borda
  },
  // Titulo do header
  headerTitle: {
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    fontSize: 16, //..............Tamanho da fonte
    color: '#3A3F51', //..........Cor do texto
  },
  // Botao de fechar
  closeButton: {
    width: 35, //................Largura
    height: 35, //...............Altura
    borderRadius: 8, //..........Bordas arredondadas
    backgroundColor: '#F4F4F4', //..Fundo cinza
    justifyContent: 'center', //..Centraliza
    alignItems: 'center', //......Centraliza
  },
  // ScrollView de anos
  yearsScroll: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Conteudo do ScrollView
  yearsScrollContent: {
    paddingVertical: 12, //..Espaco vertical
  },
  // Grid de anos em 3 colunas
  yearsGrid: {
    flexDirection: 'row', //........Layout horizontal
    flexWrap: 'wrap', //............Quebra linha
    justifyContent: 'space-evenly', //..Espaco uniforme
    paddingHorizontal: 8, //........Margem horizontal
  },
  // Celula individual do ano
  yearCell: {
    width: 88, //................Largura da celula
    height: 44, //................Altura da celula
    marginVertical: 4, //........Margem vertical
    borderRadius: 8, //..........Bordas arredondadas
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderWidth: StyleSheet.hairlineWidth, //..Borda ultrafina
    borderColor: '#D8E0F0', //....Cor da borda
    justifyContent: 'center', //..Centraliza
    alignItems: 'center', //......Centraliza
  },
  // Celula do ano selecionado
  yearCellSelected: {
    backgroundColor: '#1777CF', //..Fundo azul
    borderColor: '#1777CF', //......Borda azul
  },
  // Texto da celula do ano
  yearCellText: {
    fontFamily: 'Inter_500Medium', //..Fonte media
    fontSize: 14, //..............Tamanho
    color: '#3A3F51', //..........Cor do texto
  },
  // Texto da celula do ano selecionado
  yearCellTextSelected: {
    color: '#FCFCFC', //..........Cor branca
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Bolinha indicadora do ano atual
  currentDot: {
    position: 'absolute', //..Posicao absoluta
    top: -4, //................Posicao superior
    right: -4, //.............Posicao direita
    width: 10, //..............Largura
    height: 10, //.............Altura
    borderRadius: 99, //......Circular
    backgroundColor: '#1777CF', //..Cor azul
    zIndex: 3, //..............Camada superior
  },
});

// Export padrao
export default ReconciliationYearPickerModal;
