// Modal de comprovante de resgate
// Espelha 24.InstallmentReceiptModal.tsx adaptado para resgates
// Layout identico: check icon, dados, valor em destaque, download e WhatsApp

// React e React Native
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';

// Bibliotecas externas
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Svg, { Path, Circle } from 'react-native-svg';

// Tipos e dados
import { WithdrawHistoryItem } from './31.WithdrawHistoryModal';
import { formatCurrency } from './03.WalletData';
import { handleDownloadWithdrawReceipt, handleShareWithdrawWhatsApp, generateWithdrawTransactionId, generateWithdrawAuthCode } from './33.WithdrawReceiptCapture';

// Formata data YYYY-MM-DD para DD/MM/YYYY (formato completo para comprovante)
const formatReceiptDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-'); //..Separa partes
  return `${day}/${month}/${year}`; //..Formato DD/MM/YYYY
};

// Icone de check grande para o cabecalho
const ReceiptCheckIcon: React.FC = () => (
  <View style={styles.checkIconWrap}>
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill="#1B883C" />
      <Path d="M8 12.5L10.5 15L16 9.5" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

// Icone de download
const DownloadIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="#FCFCFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Icone do WhatsApp
const WhatsAppIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#FCFCFC" />
    <Path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#FCFCFC" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Interface do modal de comprovante de resgate
interface WithdrawReceiptModalProps {
  visible: boolean; //..........Visibilidade do modal
  onClose: () => void; //.......Callback de fechar
  item: WithdrawHistoryItem | null; //..Item selecionado
}

// Modal de comprovante de resgate
// Exibe dados do resgate aprovado com opcoes de download e compartilhamento
const WithdrawReceiptModal: React.FC<WithdrawReceiptModalProps> = ({
  visible, onClose, item,
}) => {
  // Carregamento de fontes
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  // Estado de loading dos botoes
  const [downloading, setDownloading] = useState(false); //..Baixando
  const [sharing, setSharing] = useState(false); //..........Compartilhando

  // Aguarda fontes e item
  if (!fontsLoaded || !item) return null;

  // Dados formatados do comprovante
  const formattedDate = formatReceiptDate(item.date); //..Data do resgate
  const formattedAmount = formatCurrency(item.amount); //..Valor formatado
  const formattedBalanceBefore = formatCurrency(item.balanceBefore); //..Saldo antes
  const formattedBalanceAfter = formatCurrency(item.balanceAfter); //..Saldo depois
  const transactionId = generateWithdrawTransactionId(item); //..Id da transacao
  const authCode = generateWithdrawAuthCode(item); //..Codigo autenticacao

  // Handler de download com loading
  const onDownload = async () => {
    if (Platform.OS !== 'web') return; //..Somente web
    setDownloading(true); //..Ativa loading
    try {
      await handleDownloadWithdrawReceipt(item); //..Baixa PNG
    } finally {
      setDownloading(false); //..Desativa loading
    }
  };

  // Handler de compartilhar com loading
  const onShare = async () => {
    if (Platform.OS !== 'web') return; //..Somente web
    setSharing(true); //..Ativa loading
    try {
      await handleShareWithdrawWhatsApp(item); //..Compartilha PNG
    } finally {
      setSharing(false); //..Desativa loading
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Overlay escuro */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* Card do comprovante */}
        <TouchableOpacity style={styles.receiptCard} activeOpacity={1} onPress={() => {}}>

          {/* Botao fechar (X) */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Icone de check */}
            <ReceiptCheckIcon />

            {/* Titulo do comprovante */}
            <Text style={styles.receiptTitle}>Comprovante de Resgate</Text>
            <Text style={styles.receiptSubtitle}>{item.bankName}</Text>

            {/* Id da transacao */}
            <Text style={styles.transactionId}>#{transactionId}</Text>

            {/* Divisor */}
            <View style={styles.divider} />

            {/* Dados do comprovante */}
            <View style={styles.dataSection}>
              {/* Banco destino */}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Banco destino</Text>
                <Text style={styles.dataValue}>{item.bankName}</Text>
              </View>

              {/* Data do resgate */}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Data do resgate</Text>
                <Text style={styles.dataValue}>{formattedDate}</Text>
              </View>

              {/* Saldo anterior */}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Saldo anterior</Text>
                <Text style={styles.dataValue}>{formattedBalanceBefore}</Text>
              </View>

              {/* Saldo atual */}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Saldo atual</Text>
                <Text style={styles.dataValue}>{formattedBalanceAfter}</Text>
              </View>

              {/* Divisor antes do valor */}
              <View style={styles.divider} />

              {/* Valor resgatado (destacado) */}
              <View style={styles.valueHighlight}>
                <Text style={styles.valueLabel}>Valor resgatado</Text>
                <Text style={styles.valueAmount}>{formattedAmount}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Resgate aprovado</Text>
                </View>
              </View>

              {/* Divisor apos valor */}
              <View style={styles.divider} />

              {/* Autenticacao */}
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Autenticação</Text>
                <Text style={styles.dataValue}>{authCode}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Rodape com botoes */}
          <View style={styles.footer}>
            {/* Botao de download como PNG */}
            <TouchableOpacity
              style={[styles.downloadButton, downloading && styles.buttonLoading]}
              onPress={onDownload}
              activeOpacity={0.7}
              disabled={downloading || sharing}
            >
              {downloading
                ? <ActivityIndicator size="small" color="#FCFCFC" />
                : <><DownloadIcon /><Text style={styles.downloadButtonText}>Baixar Comprovante</Text></>
              }
            </TouchableOpacity>

            {/* Botao de compartilhar no WhatsApp */}
            <TouchableOpacity
              style={[styles.whatsappButton, sharing && styles.buttonLoading]}
              onPress={onShare}
              activeOpacity={0.7}
              disabled={downloading || sharing}
            >
              {sharing
                ? <ActivityIndicator size="small" color="#FCFCFC" />
                : <><WhatsAppIcon /><Text style={styles.whatsappButtonText}>Enviar pelo WhatsApp</Text></>
              }
            </TouchableOpacity>

            {/* Botao fechar */}
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeFooterButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Estilos do modal de comprovante (identicos ao 24.InstallmentReceiptModal)
const styles = StyleSheet.create({
  // Overlay escuro de fundo
  overlay: {
    flex: 1, //.......................Ocupa toda a tela
    backgroundColor: 'rgba(0,0,0,0.5)', //..Fundo escuro
    justifyContent: 'center', //.....Centraliza vertical
    alignItems: 'center', //.........Centraliza horizontal
    padding: 24, //..................Margem lateral
  },
  // Card do comprovante
  receiptCard: {
    width: '100%', //..............Largura total
    maxHeight: '85%', //...........Altura maxima
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 16, //...........Arredondamento
    padding: 24, //................Espaco interno
    paddingBottom: 0, //...........Footer cuida do padding inferior
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
  // Conteudo do scroll
  scrollContent: {
    alignItems: 'center', //..Centraliza horizontal
    paddingTop: 8, //..........Espaco superior
  },

  // === Cabecalho do comprovante ===

  // Wrapper do icone de check
  checkIconWrap: {
    width: 64, //..............Largura fixa
    height: 64, //.............Altura fixa
    borderRadius: 32, //......Circular
    backgroundColor: 'rgba(27,136,60,0.12)', //..Fundo verde sutil
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    marginBottom: 12, //..........Espaco inferior
  },
  // Titulo do comprovante
  receiptTitle: {
    fontSize: 18, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 4, //............Espaco inferior
    textAlign: 'center', //........Centralizado
  },
  // Subtitulo (nome do banco)
  receiptSubtitle: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginBottom: 2, //............Espaco inferior
  },
  // Id da transacao
  transactionId: {
    fontSize: 11, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#B0B5BE', //............Cor terciaria clara
    marginBottom: 12, //...........Espaco inferior
  },

  // === Dados do comprovante ===

  // Linha divisoria
  divider: {
    height: StyleSheet.hairlineWidth, //..Linha ultrafina
    backgroundColor: '#D8E0F0', //........Cor da divisoria
    alignSelf: 'stretch', //..............Largura total
    marginVertical: 12, //................Espaco vertical
  },
  // Secao de dados
  dataSection: {
    alignSelf: 'stretch', //..Largura total
  },
  // Linha de dado (label + valor)
  dataRow: {
    flexDirection: 'row', //..........Layout horizontal
    justifyContent: 'space-between', //..Espaco entre
    alignItems: 'center', //..........Alinha vertical
    paddingVertical: 7, //............Espaco vertical
  },
  // Label do dado
  dataLabel: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
  },
  // Valor do dado
  dataValue: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_500Medium', //..Fonte medium
    color: '#3A3F51', //............Cor do texto
  },

  // === Valor em destaque ===

  // Container do valor resgatado
  valueHighlight: {
    backgroundColor: 'rgba(27,136,60,0.06)', //..Fundo verde muito sutil
    borderRadius: 10, //.........................Arredondamento
    padding: 16, //..............................Espaco interno
    alignItems: 'center', //.....................Centraliza horizontal
    marginVertical: 4, //........................Espaco vertical
  },
  // Label do valor
  valueLabel: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#91929E', //............Cor terciaria
    marginBottom: 4, //............Espaco inferior
  },
  // Valor monetario em destaque
  valueAmount: {
    fontSize: 24, //...............Tamanho grande
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#1B883C', //............Verde padrao do sistema
    marginBottom: 8, //............Espaco inferior
    letterSpacing: -0.5, //........Espacamento negativo
  },
  // Badge de status confirmado
  statusBadge: {
    backgroundColor: 'rgba(27,136,60,0.15)', //..Fundo verde sutil
    borderRadius: 12, //..........................Arredondamento pill
    paddingHorizontal: 14, //.....................Espaco horizontal
    paddingVertical: 4, //........................Espaco vertical
  },
  // Texto do status
  statusText: {
    fontSize: 12, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#1B883C', //............Verde padrao do sistema
  },

  // === Rodape ===

  // Container do rodape
  footer: {
    paddingVertical: 16, //...........Espaco vertical
    borderTopWidth: StyleSheet.hairlineWidth, //..Linha superior
    borderTopColor: '#D8E0F0', //......Cor da linha
    marginTop: 4, //...................Espaco superior
    gap: 10, //........................Espaco entre botoes
  },
  // Botao de download (azul accent)
  downloadButton: {
    flexDirection: 'row', //......Layout horizontal
    backgroundColor: '#1777CF', //..Cor accent
    borderRadius: 8, //............Arredondamento
    paddingVertical: 10, //.......Espaco vertical
    alignItems: 'center', //......Centraliza vertical
    justifyContent: 'center', //..Centraliza horizontal
    gap: 8, //.....................Espaco entre icone e texto
  },
  // Texto do botao de download
  downloadButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
  },
  // Botao WhatsApp (verde WhatsApp)
  whatsappButton: {
    flexDirection: 'row', //......Layout horizontal
    backgroundColor: '#25D366', //..Cor verde do WhatsApp
    borderRadius: 8, //............Arredondamento
    paddingVertical: 10, //.......Espaco vertical
    alignItems: 'center', //......Centraliza vertical
    justifyContent: 'center', //..Centraliza horizontal
    gap: 8, //.....................Espaco entre icone e texto
  },
  // Texto do botao WhatsApp
  whatsappButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#FCFCFC', //............Cor branca
  },
  // Botao em estado de loading
  buttonLoading: {
    opacity: 0.7, //..Transparencia sutil
  },
  // Botao fechar (secundario)
  closeFooterButton: {
    borderRadius: 8, //............Arredondamento
    paddingVertical: 10, //.......Espaco vertical
    alignItems: 'center', //......Centraliza
    borderWidth: 1, //.............Borda
    borderColor: '#D8E0F0', //....Cor da borda
  },
  // Texto do botao fechar
  closeFooterButtonText: {
    fontSize: 14, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#7D8592', //............Cor secundaria
  },
});

// Export padrao
export default WithdrawReceiptModal;
