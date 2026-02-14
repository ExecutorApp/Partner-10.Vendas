// ========================================
// Componente: Bolha de Chat da Lola
// Mostra mensagem da Lola acima do avatar
// ========================================

// ========================================
// Imports
// ========================================
import React from 'react';                //......React
import {
  View,                                   //......Container
  Text,                                   //......Texto
  StyleSheet,                             //......Estilos
} from 'react-native';

// ========================================
// Cores
// ========================================
const COLORS = {
  bubbleBg: '#FFFFFF',                    //......Fundo da bolha
  text: '#333333',                        //......Cor do texto
  black: '#000000',                       //......Preto
};

// ========================================
// Interface de Props
// ========================================
interface LolaChatBubbleProps {
  message?: string;                       //......Mensagem a exibir
}

// ========================================
// Componente
// ========================================
const LolaChatBubble: React.FC<LolaChatBubbleProps> = ({
  message = 'Ola! Como posso ajudar?',
}) => {
  return (
    <View style={styles.container}>
      {/* Bolha */}
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>

      {/* Seta */}
      <View style={styles.arrow} />
    </View>
  );
};

// ========================================
// Estilos
// ========================================
const styles = StyleSheet.create({
  // Container
  container: {
    position: 'absolute',                 //......Posicao absoluta
    top: -80,                             //......Acima do avatar
    left: -75,                            //......Esquerda
    width: 200,                           //......Largura
    alignItems: 'center',                 //......Centraliza
  },

  // Bolha
  bubble: {
    backgroundColor: COLORS.bubbleBg,     //......Fundo branco
    borderRadius: 16,                     //......Arredondamento
    padding: 12,                          //......Padding
    shadowColor: COLORS.black,            //......Cor da sombra
    shadowOffset: { width: 0, height: 2 }, //....Offset da sombra
    shadowOpacity: 0.15,                  //......Opacidade da sombra
    shadowRadius: 4,                      //......Raio da sombra
    elevation: 4,                         //......Elevacao Android
  },

  // Texto
  text: {
    fontSize: 14,                         //......Tamanho da fonte
    color: COLORS.text,                   //......Cor do texto
    lineHeight: 20,                       //......Altura da linha
    textAlign: 'center',                  //......Centraliza texto
  },

  // Seta
  arrow: {
    width: 0,                             //......Largura zero
    height: 0,                            //......Altura zero
    borderLeftWidth: 8,                   //......Borda esquerda
    borderRightWidth: 8,                  //......Borda direita
    borderTopWidth: 8,                    //......Borda topo
    borderLeftColor: 'transparent',       //......Transparente
    borderRightColor: 'transparent',      //......Transparente
    borderTopColor: COLORS.bubbleBg,      //......Cor da bolha
    marginTop: -1,                        //......Margem negativa
  },
});

// ========================================
// Export
// ========================================
export default LolaChatBubble;
