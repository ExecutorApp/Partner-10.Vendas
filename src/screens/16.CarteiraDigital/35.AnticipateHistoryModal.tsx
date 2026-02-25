// React e React Native
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

// Bibliotecas externas
import Svg, { Path } from 'react-native-svg';

// Dados
import { formatCurrency } from './03.WalletData';

// Modal de comprovante de antecipacao
import AnticipateReceiptModal from './36.AnticipateReceiptModal';

// Interface de item do historico de antecipacao
export interface AnticipateHistoryItem {
  id: string; //..............Identificador unico
  date: string; //............Data no formato YYYY-MM-DD
  amount: number; //..........Valor bruto antecipado
  netAmount: number; //.......Valor liquido recebido
  receivableCount: number; //..Quantidade de recebiveis
  status: 'approved' | 'pending' | 'rejected'; //..Status
  bankName: string; //.........Nome do banco destino
  balanceBefore: number; //....Saldo antes da antecipacao
  balanceAfter: number; //.....Saldo depois da antecipacao
}

// Interface do modal
interface AnticipateHistoryModalProps {
  visible: boolean; //..Controla visibilidade
  onClose: () => void; //..Callback de fechar
  history: AnticipateHistoryItem[]; //..Historico dinamico (recebido via props)
}

// Dados mock iniciais de historico de antecipacao (exportado para uso como estado inicial)
// Saldo corrente: cada antecipacao aprovada reduz o saldo progressivamente
// Rejeitados: saldo inalterado (balanceBefore === balanceAfter)
export const INITIAL_ANTICIPATE_HISTORY: AnticipateHistoryItem[] = [
  { id: 'a1', date: '2026-02-24', amount: 980.00, netAmount: 952.35, receivableCount: 3, status: 'approved', bankName: 'Nubank', balanceBefore: 4585.00, balanceAfter: 3605.00 },
  { id: 'a2', date: '2026-02-18', amount: 700.00, netAmount: 676.50, receivableCount: 2, status: 'approved', bankName: 'Bradesco', balanceBefore: 5285.00, balanceAfter: 4585.00 },
  { id: 'a3', date: '2026-02-12', amount: 1350.00, netAmount: 1306.25, receivableCount: 4, status: 'approved', bankName: 'Nubank', balanceBefore: 6635.00, balanceAfter: 5285.00 },
  { id: 'a4', date: '2026-02-08', amount: 420.00, netAmount: 408.10, receivableCount: 1, status: 'pending', bankName: 'Itaú', balanceBefore: 6635.00, balanceAfter: 6215.00 },
  { id: 'a5', date: '2026-01-25', amount: 1540.00, netAmount: 1490.25, receivableCount: 5, status: 'approved', bankName: 'Nubank', balanceBefore: 8175.00, balanceAfter: 6635.00 },
  { id: 'a6', date: '2026-01-12', amount: 890.00, netAmount: 864.20, receivableCount: 3, status: 'rejected', bankName: 'Bradesco', balanceBefore: 8175.00, balanceAfter: 8175.00 },
];

// Configuracao visual por status
const STATUS_CONFIG = {
  approved: { label: 'Aprovado', color: '#1B883C', bgColor: 'rgba(27,136,60,0.08)' },
  pending: { label: 'Pendente', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)' },
  rejected: { label: 'Recusado', color: '#EF4444', bgColor: 'rgba(239,68,68,0.08)' },
} as const;

// Formata data YYYY-MM-DD para DD/MM/YY (dois digitos)
const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-'); //..Separa partes
  return `${day}/${month}/${year.slice(2)}`; //..Formato DD/MM/YY
};

// Icone de check verde (antecipacao aprovada)
const ApprovedStatusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#1B883C" />
    <Path d="M8 12.5L10.5 15L16 9.5" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de relogio amarelo (antecipacao pendente)
const PendingStatusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#F59E0B" />
    <Path d="M12 7V12L15 14" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone de X vermelho (antecipacao recusada)
const RejectedStatusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#EF4444" />
    <Path d="M15 9L9 15M9 9L15 15" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Retorna icone pelo status
const getStatusIcon = (status: AnticipateHistoryItem['status']) => {
  if (status === 'approved') return <ApprovedStatusIcon />;
  if (status === 'pending') return <PendingStatusIcon />;
  return <RejectedStatusIcon />;
};

// Seta pequena para saldo corrente (antes → depois)
const BalanceArrowIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#B0B5BE" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Modal de historico de antecipacoes
// Bottom sheet com lista de antecipacoes, datas, valores, status e saldo corrente
const AnticipateHistoryModal: React.FC<AnticipateHistoryModalProps> = ({ visible, onClose, history }) => {
  // ID do item expandido (mostra mensagem para pendentes/recusados)
  const [expandedId, setExpandedId] = useState<string | null>(null); //..Item expandido
  // Item selecionado para comprovante (aprovados abrem modal de receipt)
  const [receiptItem, setReceiptItem] = useState<AnticipateHistoryItem | null>(null); //..Item do comprovante

  // Handler de clique no card
  const handleCardPress = useCallback((item: AnticipateHistoryItem) => {
    if (item.status === 'approved') {
      setReceiptItem(item); //..Abre modal de comprovante
    } else {
      setExpandedId(prev => prev === item.id ? null : item.id); //..Alterna expansao
    }
  }, []);

  // Fecha e reseta estado
  const handleClose = useCallback(() => {
    setExpandedId(null); //..Recolhe item
    onClose(); //..............Fecha modal
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>

          {/* Handle bar de arraste */}
          <View style={styles.handleBar} />

          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Histórico de Antecipações</Text>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Lista rolavel de antecipacoes */}
          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
            {history.map((item) => {
              const config = STATUS_CONFIG[item.status]; //..Config do status
              const isExpanded = expandedId === item.id; //..Item expandido

              return (
                <View key={item.id}>
                  {/* Linha principal do item (3 zonas: icone + info + valor) */}
                  <TouchableOpacity
                    style={[styles.historyRow, isExpanded && styles.historyRowExpanded]}
                    onPress={() => handleCardPress(item)}
                    activeOpacity={0.7}
                  >
                    {/* ZONA ESQUERDA: Icone de status */}
                    <View style={styles.statusIconWrap}>
                      {getStatusIcon(item.status)}
                    </View>

                    {/* ZONA CENTRO: Banco, data + contagem e saldo corrente */}
                    <View style={styles.historyInfo}>
                      {/* Nome do banco */}
                      <Text style={styles.bankName} numberOfLines={1}>{item.bankName}</Text>

                      {/* Data DD/MM/YY + quantidade de recebiveis */}
                      <Text style={styles.historyDate}>{formatDate(item.date)} • {item.receivableCount} recebíve{item.receivableCount === 1 ? 'l' : 'is'}</Text>

                      {/* Saldo corrente (antes → depois) */}
                      {item.status === 'rejected' ? (
                        <Text style={styles.balanceText}>Saldo inalterado</Text>
                      ) : (
                        <View style={styles.balanceRow}>
                          <Text style={styles.balanceText}>{formatCurrency(item.balanceBefore)}</Text>
                          <BalanceArrowIcon />
                          <Text style={styles.balanceText}>{formatCurrency(item.balanceAfter)}</Text>
                          {item.status === 'pending' && (
                            <Text style={styles.balancePrevisto}>(previsto)</Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* ZONA DIREITA: Valor + badge */}
                    <View style={styles.historyRight}>
                      {/* Valor bruto com sinal negativo */}
                      <Text style={styles.historyAmount}>- {formatCurrency(item.amount)}</Text>

                      {/* Badge de status */}
                      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Mensagem para itens pendentes/recusados (expandidos) */}
                  {isExpanded && item.status !== 'approved' && (
                    <View style={styles.noActionsRow}>
                      <Text style={styles.noActionsText}>
                        {item.status === 'pending'
                          ? 'Comprovante disponível após aprovação.'
                          : 'Antecipação recusada. Sem comprovante disponível.'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Botao de fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>

      {/* Modal de comprovante de antecipacao (abre ao clicar em item aprovado) */}
      <AnticipateReceiptModal
        visible={receiptItem !== null}
        onClose={() => setReceiptItem(null)}
        item={receiptItem}
      />
    </Modal>
  );
};


// Estilos do modal de historico
const styles = StyleSheet.create({
  // Overlay escuro alinhado embaixo (bottom sheet)
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
  // Titulo do modal
  modalTitle: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 12, //...........Espaco inferior
  },
  // Divisor horizontal
  divider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor cinza
    marginBottom: 8, //..................Espaco inferior
  },
  // Lista rolavel de historico
  historyList: {
    marginBottom: 16, //..Espaco inferior
  },

  // === Linha do historico ===

  // Linha principal do item (3 zonas horizontais)
  historyRow: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'flex-start', //..Alinha ao topo
    paddingVertical: 12, //........Espaco vertical
    paddingHorizontal: 4, //......Espaco lateral
    gap: 10, //....................Espaco entre zonas
    borderBottomWidth: StyleSheet.hairlineWidth, //..Linha inferior
    borderBottomColor: '#F0F1F5', //..Cor da linha
  },
  // Linha expandida (fundo sutil)
  historyRowExpanded: {
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul sutil
    borderBottomWidth: 0, //..Remove linha quando expandido
  },
  // Container do icone de status (alinhado ao topo)
  statusIconWrap: {
    marginTop: 2, //..Alinha com baseline do nome do banco
  },

  // === Zona centro: info ===

  // Container de info (banco, data, saldo)
  historyInfo: {
    flex: 1, //..Ocupa espaco disponivel
    gap: 2, //...Espaco entre linhas
  },
  // Nome do banco
  bankName: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor primaria
  },
  // Data da antecipacao (DD/MM/YY + contagem)
  historyDate: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Linha de saldo corrente (antes → depois)
  balanceRow: {
    flexDirection: 'row', //..Layout horizontal
    alignItems: 'center', //..Alinha vertical
    gap: 4, //................Espaco entre elementos
    marginTop: 2, //..........Respiro superior
  },
  // Texto do saldo (valores antes/depois)
  balanceText: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#B0B5BE', //............Cor quaternaria (sutil)
  },
  // Texto "(previsto)" para pendentes
  balancePrevisto: {
    fontSize: 10, //...............Tamanho menor
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#B0B5BE', //............Cor quaternaria
    fontStyle: 'italic', //........Italico
  },

  // === Zona direita: valor + badge ===

  // Container direito
  historyRight: {
    alignItems: 'flex-end', //..Alinha a direita
    gap: 4, //....................Espaco entre elementos
  },
  // Valor da antecipacao (com sinal negativo)
  historyAmount: {
    fontSize: 15, //...............Tamanho destacado
    fontFamily: 'Inter_400Regular', //..Fonte regular (peso normal)
    color: '#3A3F51', //............Cor primaria
  },
  // Badge de status
  statusBadge: {
    paddingHorizontal: 12, //..Espaco lateral (maior)
    paddingVertical: 4, //......Espaco vertical (maior)
    borderRadius: 6, //........Arredondamento
  },
  // Texto do badge de status
  statusBadgeText: {
    fontSize: 12, //...............Tamanho da fonte (maior)
    fontFamily: 'Inter_400Regular', //..Fonte regular (peso normal)
  },

  // Mensagem para itens sem acao
  noActionsRow: {
    paddingVertical: 10, //........Espaco vertical
    paddingHorizontal: 12, //......Espaco lateral
    backgroundColor: 'rgba(23,119,207,0.03)', //..Fundo azul sutil
    borderBottomWidth: StyleSheet.hairlineWidth, //..Linha inferior
    borderBottomColor: '#F0F1F5', //..Cor da linha
  },
  // Texto da mensagem sem acao
  noActionsText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    textAlign: 'center', //........Centralizado
  },

  // === Botao fechar ===

  // Botao de fechar
  closeButton: {
    backgroundColor: '#1777CF', //..Fundo azul accent
    borderRadius: 12, //............Arredondamento
    paddingVertical: 14, //........Espaco vertical
    alignItems: 'center', //.......Centraliza
  },
  // Texto do botao fechar
  closeButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
  },
});

// Export padrao
export default AnticipateHistoryModal;
