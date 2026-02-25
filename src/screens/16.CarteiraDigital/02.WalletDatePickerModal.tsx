// React e React Native
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Interface do componente
interface WalletDatePickerModalProps {
  visible: boolean; //..........Visibilidade do modal
  onClose: () => void; //......Callback de fechar
  onSelect: (date: Date) => void; //..Callback de selecao
  selectedDate?: Date | null; //..Data selecionada
  minDate?: Date | null; //.......Data minima permitida
  title?: string; //...............Titulo do modal
}

// Nomes completos dos meses
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Dias da semana
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Lista fixa de anos disponiveis (2000 ate ano atual)
const YEAR_LIST = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => 2000 + i);

// Icone de seta esquerda
const ArrowLeftIcon = () => (
  <Svg width={7} height={10} viewBox="0 0 7 10" fill="none">
    <Path d="M6.18333 1.175L2.35833 5L6.18333 8.825L5 10L0 5L5 0L6.18333 1.175Z" fill="#3A3F51"/>
  </Svg>
);

// Icone de seta direita
const ArrowRightIcon = () => (
  <Svg width={7} height={10} viewBox="0 0 7 10" fill="none">
    <Path d="M0 1.175L3.825 5L0 8.825L1.18333 10L6.18333 5L1.18333 0L0 1.175Z" fill="#3A3F51"/>
  </Svg>
);

// Icone de fechar
const ModalCloseIcon = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

// Componente principal do seletor de data
const WalletDatePickerModal: React.FC<WalletDatePickerModalProps> = ({ visible, onClose, onSelect, selectedDate, minDate, title = 'Selecionar data' }) => {
  // Estado do mes exibido no calendario
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estado que controla se mostra anos ou dias
  const [showYears, setShowYears] = useState(false);

  // Referencia do ScrollView de anos para scroll automatico
  const yearsScrollRef = useRef<ScrollView>(null);

  // Navega para o mes da data selecionada ao abrir
  useEffect(() => {
    if (visible) {
      setShowYears(false); //..Sempre abre na view de dias
      if (selectedDate) {
        setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)); //..Navega ao mes da data
      } else {
        setCurrentDate(new Date()); //..Mes atual
      }
    }
  }, [visible]);

  // Scroll automatico para o ano atual ao abrir view de anos
  useEffect(() => {
    if (showYears && yearsScrollRef.current) {
      const yearIndex = year - 2000; //..Indice do ano na lista
      const row = Math.floor(yearIndex / 3); //..Linha do ano
      const scrollY = Math.max(0, row * 52 - 80); //..Posicao com offset
      setTimeout(() => yearsScrollRef.current?.scrollTo({ y: scrollY, animated: false }), 50);
    }
  }, [showYears]);

  // Data de hoje
  const today = new Date(); //..Referencia para destaque

  // Data minima normalizada para inicio do dia
  const minDateStart = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null; //..Inicio do dia minimo

  // Dados do mes exibido
  const year = currentDate.getFullYear(); //..Ano
  const month = currentDate.getMonth(); //...Mes

  // Construcao do grid do calendario de dias
  const firstDay = new Date(year, month, 1).getDay(); //..Dia da semana do primeiro dia
  const daysInMonth = new Date(year, month + 1, 0).getDate(); //..Total de dias no mes
  const daysInPrevMonth = new Date(year, month, 0).getDate(); //..Dias do mes anterior

  // Celulas do calendario (42 para 6 semanas fixas)
  const cells: { label: number; inMonth: boolean; date: Date }[] = [];

  // Dias do mes anterior
  for (let i = 0; i < firstDay; i++) {
    const num = daysInPrevMonth - firstDay + 1 + i; //..Numero do dia
    cells.push({ label: num, inMonth: false, date: new Date(year, month - 1, num) });
  }

  // Dias do mes atual
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ label: i, inMonth: true, date: new Date(year, month, i) });
  }

  // Dias do proximo mes para completar grid
  for (let i = 1; cells.length < 42; i++) {
    cells.push({ label: i, inMonth: false, date: new Date(year, month + 1, i) });
  }

  // Navegacao do mes anterior
  const goPrevMonth = () => {
    const d = new Date(currentDate); //..Copia data
    d.setMonth(d.getMonth() - 1); //....Volta um mes
    setCurrentDate(d); //..Atualiza
  };

  // Navegacao do proximo mes
  const goNextMonth = () => {
    const d = new Date(currentDate); //..Copia data
    d.setMonth(d.getMonth() + 1); //....Avanca um mes
    setCurrentDate(d); //..Atualiza
  };

  // Handler de selecao de ano no grid de anos
  const handleYearSelect = (selectedYear: number) => {
    const d = new Date(currentDate); //..Copia data
    d.setFullYear(selectedYear); //......Define o ano
    setCurrentDate(d); //..Atualiza
    setShowYears(false); //..Volta para view de dias
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <View style={styles.overlay} />

      {/* Wrapper centralizado */}
      <View style={styles.modalWrapper}>
        <View style={styles.modalCard}>
          {/* Header do modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ModalCloseIcon />
            </TouchableOpacity>
          </View>

          {/* Area de conteudo com altura fixa */}
          <View style={styles.contentArea}>
            {/* Navegacao do mes - sempre visivel */}
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navButton} onPress={goPrevMonth}>
                <ArrowLeftIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navCenter} onPress={() => setShowYears(!showYears)} activeOpacity={0.7}>
                <Text style={styles.navText}>{`${MONTH_NAMES[month]} - ${year}`}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goNextMonth}>
                <ArrowRightIcon />
              </TouchableOpacity>
            </View>

            {/* Grid de anos - lista fixa 2000 ate ano atual */}
            {showYears && (
              <ScrollView ref={yearsScrollRef} style={styles.yearsScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.yearsScrollContent}>
                <View style={styles.yearsGrid}>
                  {YEAR_LIST.map((y) => {
                    const isCurrentYear = y === today.getFullYear(); //..Ano atual
                    const isSelectedYear = y === year; //..Ano exibido no calendario
                    const isDisabled = minDateStart ? y < minDateStart.getFullYear() : false; //..Ano anterior ao minimo
                    return (
                      <TouchableOpacity key={y} style={[styles.yearCell, isSelectedYear && styles.yearCellSelected, isDisabled && styles.cellDisabled]} onPress={() => !isDisabled && handleYearSelect(y)} activeOpacity={isDisabled ? 1 : 0.7}>
                        <Text style={[styles.yearCellText, isSelectedYear && styles.yearCellTextSelected, isDisabled && styles.cellDisabledText]}>{y}</Text>
                        {isCurrentYear && !isDisabled && <View style={styles.todayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Grid de dias do calendario */}
            {!showYears && (
              <>
                {/* Dias da semana */}
                <View style={styles.weekRow}>
                  {WEEK_DAYS.map((name) => (
                    <View key={name} style={styles.weekCell}>
                      <Text style={styles.weekLabel}>{name}</Text>
                    </View>
                  ))}
                </View>

                {/* Grid de dias */}
                <View style={styles.daysGrid}>
                  {cells.map((c, idx) => {
                    const isSelected = selectedDate && c.inMonth &&
                      c.date.getDate() === selectedDate.getDate() &&
                      c.date.getMonth() === selectedDate.getMonth() &&
                      c.date.getFullYear() === selectedDate.getFullYear(); //..Verifica selecao
                    const isToday = c.date.getDate() === today.getDate() &&
                      c.date.getMonth() === today.getMonth() &&
                      c.date.getFullYear() === today.getFullYear(); //..Verifica se e hoje
                    const cellDate = new Date(c.date.getFullYear(), c.date.getMonth(), c.date.getDate()); //..Data normalizada
                    const isDisabled = c.inMonth && minDateStart ? cellDate < minDateStart : false; //..Anterior ao minimo

                    return (
                      <TouchableOpacity
                        key={`d-${idx}`}
                        style={[styles.dayCell, !c.inMonth && styles.dayCellOut, isSelected && styles.dayCellSelected, isDisabled && styles.cellDisabled]}
                        onPress={() => !isDisabled && onSelect(c.date)}
                        activeOpacity={isDisabled ? 1 : 0.7}
                      >
                        <Text style={[styles.dayText, !c.inMonth && styles.dayTextOut, isSelected && styles.dayTextSelected, isDisabled && styles.cellDisabledText]}>
                          {String(c.label).padStart(2, '0')}
                        </Text>
                        {isToday && !isDisabled && <View style={styles.todayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Estilos do modal de calendario
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
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //........Bordas arredondadas
    overflow: 'hidden', //......Esconde overflow
  },
  // Area de conteudo com altura fixa entre views
  contentArea: {
    height: 330, //..Altura constante para dias e anos
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
  // Navegacao com setas e centro clicavel
  monthNav: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Centraliza
    justifyContent: 'center', //..Centraliza
    paddingHorizontal: 16, //....Margem horizontal
    marginTop: 12, //............Margem superior
    marginBottom: 10, //..........Margem inferior
    gap: 10, //...................Espaco entre elementos
  },
  // Botao de navegacao lateral
  navButton: {
    width: 30, //................Largura
    height: 30, //...............Altura
    borderRadius: 4, //..........Bordas
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderWidth: 1, //............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    justifyContent: 'center', //..Centraliza
    alignItems: 'center', //......Centraliza
  },
  // Centro clicavel da navegacao
  navCenter: {
    flex: 1, //...................Ocupa espaco
    height: 32, //................Altura
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 4, //..........Bordas
    borderWidth: 1, //............Borda
    borderColor: '#D8E0F0', //....Cor da borda
    justifyContent: 'center', //..Centraliza
    alignItems: 'center', //......Centraliza
  },
  // Texto da navegacao central
  navText: {
    fontFamily: 'Inter_500Medium', //..Fonte media
    fontSize: 14, //..............Tamanho
    color: '#3A3F51', //..........Cor do texto
  },
  // ScrollView de anos ocupa espaco restante
  yearsScroll: {
    flex: 1, //..Ocupa espaco disponivel abaixo do nav
  },
  // Conteudo do ScrollView de anos
  yearsScrollContent: {
    paddingBottom: 16, //..Espaco inferior
  },
  // Grid de anos 3 colunas
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
  // Linha dos dias da semana
  weekRow: {
    flexDirection: 'row', //......Layout horizontal
    justifyContent: 'center', //..Centraliza
    paddingHorizontal: 16, //....Margem horizontal
    marginBottom: 6, //..........Margem inferior
  },
  // Celula do dia da semana
  weekCell: {
    width: 44, //................Largura
    alignItems: 'center', //......Centraliza
  },
  // Label do dia da semana
  weekLabel: {
    fontFamily: 'Inter_500Medium', //..Fonte media
    fontSize: 12, //..............Tamanho
    color: '#7D8592', //..........Cor secundaria
  },
  // Grid de dias do calendario
  daysGrid: {
    flexDirection: 'row', //......Layout horizontal
    flexWrap: 'wrap', //..........Quebra linha
    justifyContent: 'center', //..Centraliza
    paddingHorizontal: 16, //....Margem horizontal
    marginBottom: 16, //..........Margem inferior
  },
  // Celula do dia
  dayCell: {
    width: 40, //................Largura
    height: 34, //...............Altura
    marginHorizontal: 2, //......Margem horizontal
    marginVertical: 2, //........Margem vertical
    justifyContent: 'center', //..Centraliza
    alignItems: 'center', //......Centraliza
    borderRadius: 4, //..........Bordas arredondadas
    borderWidth: StyleSheet.hairlineWidth, //..Borda fina
    borderColor: '#D8E0F0', //....Cor da borda
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Celula fora do mes atual
  dayCellOut: {
    backgroundColor: 'transparent', //..Sem fundo
    borderWidth: 0, //..............Sem borda
  },
  // Celula selecionada
  dayCellSelected: {
    backgroundColor: '#1777CF', //..Fundo azul
    borderColor: '#1777CF', //......Borda azul
  },
  // Texto do dia
  dayText: {
    fontFamily: 'Inter_400Regular', //..Fonte regular
    fontSize: 14, //..............Tamanho
    color: '#3A3F51', //..........Cor do texto
  },
  // Texto do dia fora do mes
  dayTextOut: {
    color: '#7D8592', //..........Cor secundaria
    opacity: 0.4, //..............Transparencia
  },
  // Texto do dia selecionado
  dayTextSelected: {
    color: '#FCFCFC', //..........Cor branca
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
  },
  // Celula desabilitada (data anterior ao minimo)
  cellDisabled: {
    backgroundColor: '#F4F4F4', //..Fundo cinza claro
    borderColor: '#F4F4F4', //......Borda cinza
    opacity: 0.5, //................Transparencia reduzida
  },
  // Texto da celula desabilitada
  cellDisabledText: {
    color: '#7D8592', //..Cor secundaria
  },
  // Bolinha indicadora do dia ou ano atual
  todayDot: {
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
export default WalletDatePickerModal;
