// React e React Native
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// Bibliotecas externas
import Lottie from 'lottie-react';

// Dados das animacoes Lottie
import walletAnimation from './assets/wallet-withdraw.json';
import clockAnimation from './assets/clock-anticipate.json';
import chartAnimation from './assets/chart-reconciliation.json';

// Interface do componente
interface WalletMenuModalProps {
  visible: boolean; //.........Visibilidade do modal
  onClose: () => void; //......Callback de fechar
  onWithdraw: () => void; //...Callback resgate
  onAnticipate: () => void; //..Callback antecipacao
  onReconciliation: () => void; //..Callback conciliacao
}

// Modal de menu do card de saldo
// Bottom sheet com opcoes de Resgatar Saldo, Antecipar Recebiveis e Conciliacao
const WalletMenuModal: React.FC<WalletMenuModalProps> = ({ visible, onClose, onWithdraw, onAnticipate, onReconciliation }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>

          {/* Handle bar visual de arraste */}
          <View style={styles.handleBar} />

          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Opções da Carteira</Text>

          {/* Opcao: Resgatar Saldo */}
          <TouchableOpacity style={styles.menuOption} onPress={onWithdraw} activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
              <Lottie animationData={walletAnimation} loop={true} autoplay={true} style={styles.lottieIcon} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuOptionTitle}>Resgatar Saldo</Text>
              <Text style={styles.menuOptionSubtitle}>Transferir para sua conta</Text>
            </View>
          </TouchableOpacity>

          {/* Opcao: Antecipar Recebiveis */}
          <TouchableOpacity style={styles.menuOption} onPress={onAnticipate} activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
              <Lottie animationData={clockAnimation} loop={true} autoplay={true} style={styles.lottieIcon} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuOptionTitle}>Antecipar Recebíveis</Text>
              <Text style={styles.menuOptionSubtitle}>Receba valores antecipadamente</Text>
            </View>
          </TouchableOpacity>

          {/* Opcao: Conciliacao */}
          <TouchableOpacity style={styles.menuOption} onPress={onReconciliation} activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
              <Lottie animationData={chartAnimation} loop={true} autoplay={true} style={styles.lottieIcon} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuOptionTitle}>Conciliação</Text>
              <Text style={styles.menuOptionSubtitle}>Reconcilie pedidos e pagamentos</Text>
            </View>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Estilos do modal de menu
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
    paddingHorizontal: 24, //......Espaco lateral
    paddingTop: 12, //............Espaco superior
    paddingBottom: 32, //.........Espaco inferior generoso
    gap: 12, //....................Espaco entre elementos
  },
  // Handle bar de arraste no topo
  handleBar: {
    width: 40, //..............Largura da barra
    height: 4, //.............Altura da barra
    backgroundColor: '#D8E0F0', //..Cor cinza
    borderRadius: 2, //........Arredondamento
    alignSelf: 'center', //....Centraliza horizontal
    marginBottom: 4, //........Espaco inferior
  },
  // Titulo do modal
  modalTitle: {
    fontSize: 16, //...............Tamanho da fonte
    fontFamily: 'Inter_700Bold', //..Fonte bold
    color: '#3A3F51', //............Cor do texto
    marginBottom: 4, //............Espaco inferior
  },
  // Card de opcao do menu
  menuOption: {
    flexDirection: 'row', //......Layout horizontal
    alignItems: 'center', //......Alinha vertical
    backgroundColor: '#FCFCFC', //..Fundo branco
    borderRadius: 12, //..........Arredondamento
    borderWidth: 1, //............Borda fina
    borderColor: '#D8E0F0', //....Cor da borda
    padding: 16, //...............Espaco interno
    gap: 16, //....................Espaco entre icone e texto
  },
  // Container do icone da opcao
  menuIconBox: {
    width: 48, //..............Largura fixa
    height: 48, //.............Altura fixa
    borderRadius: 12, //.......Arredondamento
    backgroundColor: 'rgba(23,119,207,0.08)', //..Azul 8% opacidade
    justifyContent: 'center', //..Centraliza vertical
    alignItems: 'center', //......Centraliza horizontal
    overflow: 'hidden', //.......Recorta conteudo excedente
  },
  // Animacao Lottie do icone de resgate
  lottieIcon: {
    width: 48, //..Largura da animacao
    height: 48, //..Altura da animacao
  },
  // Coluna de texto da opcao
  menuTextCol: {
    flex: 1, //..............Ocupa espaco disponivel
    gap: 2, //...............Espaco entre titulo e subtitulo
  },
  // Titulo da opcao
  menuOptionTitle: {
    fontSize: 15, //...............Tamanho da fonte
    fontFamily: 'Inter_600SemiBold', //..Fonte semi bold
    color: '#3A3F51', //............Cor do texto
  },
  // Subtitulo da opcao
  menuOptionSubtitle: {
    fontSize: 13, //...............Tamanho da fonte
    fontFamily: 'Inter_400Regular', //..Fonte regular
    color: '#7D8592', //............Cor secundaria
  },
});

// Export padrao
export default WalletMenuModal;
