// React e React Native
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Bibliotecas externas
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Lottie from 'lottie-react';

// Tipos e dados
import { formatCurrency, ANTICIPATION_RATE } from './18.AnticipateData';

// Dados da animacao Lottie
import calculatorAnimation from './assets/calculator-empty.json';

// Interface do componente
interface AnticipateSimulatorProps {
  hasSelection: boolean; //..Tem parcelas selecionadas
  grossAmount: number; //....Valor bruto selecionado
  averageTerm: number; //....Prazo medio em dias
  totalDiscount: number; //..Desconto total
  netAmount: number; //.......Valor liquido a receber
}

// Componente do simulador de antecipacao
// Card com calculo em tempo real ou estado vazio padrao do sistema
const AnticipateSimulator: React.FC<AnticipateSimulatorProps> = ({
  hasSelection, grossAmount, averageTerm, totalDiscount, netAmount,
}) => {
  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null; //..Aguarda fontes

  // Estado vazio: nenhuma parcela selecionada
  if (!hasSelection) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          {/* Container do icone animado com borda padrao do sistema */}
          <View style={styles.emptyIconBox}>
            <Lottie animationData={calculatorAnimation} loop={true} autoplay={true} style={styles.emptyLottie} />
          </View>

          {/* Titulo do estado vazio */}
          <Text style={styles.emptyTitle}>Nenhuma simulação ativa</Text>

          {/* Descricao do estado vazio */}
          <Text style={styles.emptyDescription}>
            Selecione os recebíveis na aba anterior{'\n'}para visualizar a simulação
          </Text>
        </View>
      </View>
    );
  }

  // Estado com selecao: card do simulador
  return (
    <View style={styles.container}>
      {/* Titulo da secao */}
      <Text style={styles.sectionTitle}>Simulação de Antecipação</Text>

      {/* Card do simulador */}
      <View style={styles.simulatorCard}>
        {/* Linha: Valor bruto selecionado */}
        <View style={styles.simulatorRow}>
          <Text style={styles.simulatorLabel}>Valor bruto selecionado</Text>
          <Text style={styles.simulatorValue}>{formatCurrency(grossAmount)}</Text>
        </View>

        {/* Divisor entre linhas */}
        <View style={styles.rowDivider} />

        {/* Linha: Prazo medio */}
        <View style={styles.simulatorRow}>
          <Text style={styles.simulatorLabel}>Prazo médio</Text>
          <Text style={styles.simulatorValueSecondary}>{averageTerm} dias</Text>
        </View>

        {/* Divisor entre linhas */}
        <View style={styles.rowDivider} />

        {/* Linha: Taxa de antecipacao */}
        <View style={styles.simulatorRow}>
          <Text style={styles.simulatorLabel}>Taxa de antecipação</Text>
          <Text style={styles.simulatorValueSecondary}>{(ANTICIPATION_RATE * 100).toFixed(1)}% a.m.</Text>
        </View>

        {/* Divisor principal antes do resultado */}
        <View style={styles.simulatorDivider} />

        {/* Linha: Desconto (vermelho) */}
        <View style={styles.simulatorRow}>
          <Text style={styles.simulatorLabel}>Desconto</Text>
          <Text style={styles.discountValue}>- {formatCurrency(totalDiscount)}</Text>
        </View>

        {/* Divisor entre linhas */}
        <View style={styles.rowDivider} />

        {/* Linha destaque: Voce recebe (verde) */}
        <View style={styles.simulatorRowHighlight}>
          <Text style={styles.netLabel}>Você recebe</Text>
          <Text style={styles.netValue}>{formatCurrency(netAmount)}</Text>
        </View>
      </View>
    </View>
  );
};

// Estilos do simulador de antecipacao
const styles = StyleSheet.create({
  // === Estado vazio (padrao do sistema) ===

  // Card externo com borda padrao (preenche toda a area)
  emptyCard: {
    flex: 1, //....................Ocupa toda a altura disponivel
    borderWidth: 1, //..............Borda padrao
    borderColor: '#D8E0F0', //......Cor da borda
    borderRadius: 12, //............Arredondamento padrao
    backgroundColor: '#FCFCFC', //..Fundo branco
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //.......Centraliza horizontal
  },
  // Conteudo centralizado do estado vazio
  emptyContent: {
    alignItems: 'center', //..Centraliza horizontal
    paddingHorizontal: 32, //..Margem lateral
  },
  // Container do icone animado (quadrado com cantos arredondados e borda)
  emptyIconBox: {
    width: 88, //..............Largura fixa
    height: 88, //.............Altura fixa
    borderRadius: 18, //.......Cantos levemente arredondados
    borderWidth: 1, //..........Borda padrao
    borderColor: '#D8E0F0', //..Cor da borda
    backgroundColor: '#FCFCFC', //..Fundo branco
    justifyContent: 'center', //...Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    marginBottom: 16, //.........Espaco inferior
    overflow: 'hidden', //........Esconde overflow da animacao
  },
  // Animacao Lottie do icone vazio
  emptyLottie: {
    width: 72, //..Largura da animacao
    height: 72, //..Altura da animacao
  },
  // Titulo do estado vazio
  emptyTitle: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 6, //............Espaco inferior
    textAlign: 'center', //........Centralizado
  },
  // Descricao do estado vazio
  emptyDescription: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    textAlign: 'center', //........Centralizado
    lineHeight: 20, //.............Altura da linha
  },

  // === Estado com selecao ===

  // Container principal
  container: {
    flex: 1, //..Ocupa espaco disponivel
  },
  // Titulo da secao
  sectionTitle: {
    fontSize: 17, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 14, //...........Espaco inferior
    marginLeft: 5, //..............Respiro esquerdo
  },
  // Card do simulador
  simulatorCard: {
    borderWidth: 1, //..............Borda
    borderColor: '#D8E0F0', //......Cor da borda
    borderRadius: 14, //............Arredondamento
    paddingHorizontal: 18, //.......Espaco horizontal interno
    paddingVertical: 6, //.........Espaco vertical interno
    backgroundColor: '#FCFCFC', //..Fundo branco
  },
  // Linha do simulador (label + valor)
  simulatorRow: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    paddingVertical: 13, //...........Espaco vertical
  },
  // Divisor sutil entre linhas
  rowDivider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#E8ECF4', //........Cor sutil da divisoria
  },
  // Label do simulador
  simulatorLabel: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#7D8592', //............Cor secundaria
  },
  // Valor principal (bruto)
  simulatorValue: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Valor secundario (prazo, taxa)
  simulatorValueSecondary: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#7D8592', //............Cor secundaria
  },
  // Divisor principal antes do resultado
  simulatorDivider: {
    height: 1, //.....................Linha visivel
    backgroundColor: '#D8E0F0', //....Cor da divisoria
    marginVertical: 2, //.............Espaco vertical
  },
  // Valor do desconto (vermelho)
  discountValue: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#EF4444', //............Cor vermelha
  },
  // Linha destaque (voce recebe)
  simulatorRowHighlight: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    paddingVertical: 14, //...........Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Borda superior
    borderTopColor: '#E8ECF4', //....................Cor da borda
  },
  // Label do valor liquido
  netLabel: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
  },
  // Valor liquido (verde)
  netValue: {
    fontSize: 18, //...............Tamanho destacado
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#22C55E', //............Cor verde
  },
});

// Export padrao
export default AnticipateSimulator;
